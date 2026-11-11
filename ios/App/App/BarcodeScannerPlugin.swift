import Foundation
import UIKit
import AVFoundation
import Capacitor

// Live barcode scanning via AVFoundation's hardware-accelerated metadata
// detection - no third-party scanning SDK, no network call per scan. This
// is the "scan a product" half of the macro counter; the barcode it reads
// is looked up against our own mirrored Open Food Facts table first (see
// src/lib/barcodeScanner.ts), with OFF's live API only as a fallback.
@objc(BarcodeScannerPlugin)
public class BarcodeScannerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BarcodeScannerPlugin"
    public let jsName = "BarcodeScanner"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise),
    ]

    private weak var activeScannerVC: BarcodeScannerViewController?

    @objc func scan(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let presenter = self.bridge?.viewController else {
                call.reject("No view controller available to present the scanner")
                return
            }

            let status = AVCaptureDevice.authorizationStatus(for: .video)
            switch status {
            case .denied, .restricted:
                call.reject("Camera access denied - enable it in Settings to scan barcodes")
                return
            case .notDetermined:
                AVCaptureDevice.requestAccess(for: .video) { granted in
                    DispatchQueue.main.async {
                        if granted {
                            self.presentScanner(on: presenter, call: call)
                        } else {
                            call.reject("Camera access denied - enable it in Settings to scan barcodes")
                        }
                    }
                }
            case .authorized:
                self.presentScanner(on: presenter, call: call)
            @unknown default:
                call.reject("Unknown camera authorization status")
            }
        }
    }

    @objc func cancel(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.activeScannerVC?.dismiss(animated: true)
            self.activeScannerVC = nil
            call.resolve()
        }
    }

    private func presentScanner(on presenter: UIViewController, call: CAPPluginCall) {
        let scannerVC = BarcodeScannerViewController()
        scannerVC.modalPresentationStyle = .fullScreen

        scannerVC.onResult = { [weak self, weak scannerVC] code, format in
            scannerVC?.dismiss(animated: true)
            self?.activeScannerVC = nil
            call.resolve(["code": code, "format": format])
        }
        scannerVC.onCancel = { [weak self, weak scannerVC] in
            scannerVC?.dismiss(animated: true)
            self?.activeScannerVC = nil
            call.reject("cancelled")
        }

        activeScannerVC = scannerVC
        presenter.present(scannerVC, animated: true)
    }
}

// Minimal full-screen scanning UI: live camera preview, a cutout frame,
// a cancel button, and a torch toggle. Detection runs on
// AVCaptureMetadataOutput's own queue - this is the same mechanism every
// native barcode scanner uses, not a per-frame Vision request.
private class BarcodeScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    var onResult: ((String, String) -> Void)?
    var onCancel: (() -> Void)?

    private let session = AVCaptureSession()
    private var previewLayer: AVCaptureVideoPreviewLayer?
    private var currentDevice: AVCaptureDevice?
    private var hasReportedResult = false

    private static let barcodeTypes: [AVMetadataObject.ObjectType] = [
        .ean13, .ean8, .upce, .code39, .code93, .code128,
        .pdf417, .qr, .aztec, .dataMatrix, .interleaved2of5, .itf14,
    ]

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        configureSession()
        configureOverlay()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        if !session.isRunning {
            DispatchQueue.global(qos: .userInitiated).async {
                self.session.startRunning()
            }
        }
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if session.isRunning {
            session.stopRunning()
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer?.frame = view.bounds
    }

    private func configureSession() {
        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device) else {
            return
        }
        currentDevice = device

        if session.canAddInput(input) {
            session.addInput(input)
        }

        let output = AVCaptureMetadataOutput()
        if session.canAddOutput(output) {
            session.addOutput(output)
            output.setMetadataObjectsDelegate(self, queue: .main)
            output.metadataObjectTypes = Self.barcodeTypes.filter {
                output.availableMetadataObjectTypes.contains($0)
            }
        }

        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        layer.frame = view.bounds
        view.layer.insertSublayer(layer, at: 0)
        previewLayer = layer
    }

    private func configureOverlay() {
        let frameBox = UIView()
        frameBox.layer.borderColor = UIColor.white.withAlphaComponent(0.9).cgColor
        frameBox.layer.borderWidth = 2
        frameBox.layer.cornerRadius = 16
        frameBox.translatesAutoresizingMaskIntoConstraints = false
        frameBox.isUserInteractionEnabled = false
        view.addSubview(frameBox)
        NSLayoutConstraint.activate([
            frameBox.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            frameBox.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            frameBox.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.78),
            frameBox.heightAnchor.constraint(equalTo: frameBox.widthAnchor, multiplier: 0.55),
        ])

        let hint = UILabel()
        hint.text = "Line up the barcode inside the frame"
        hint.textColor = .white
        hint.font = .systemFont(ofSize: 14, weight: .medium)
        hint.textAlignment = .center
        hint.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(hint)
        NSLayoutConstraint.activate([
            hint.topAnchor.constraint(equalTo: frameBox.bottomAnchor, constant: 18),
            hint.centerXAnchor.constraint(equalTo: view.centerXAnchor),
        ])

        let cancelButton = UIButton(type: .system)
        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.setTitleColor(.white, for: .normal)
        cancelButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        view.addSubview(cancelButton)
        NSLayoutConstraint.activate([
            cancelButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            cancelButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
        ])

        let torchButton = UIButton(type: .system)
        torchButton.setTitle("Flash", for: .normal)
        torchButton.setTitleColor(.white, for: .normal)
        torchButton.titleLabel?.font = .systemFont(ofSize: 17, weight: .semibold)
        torchButton.translatesAutoresizingMaskIntoConstraints = false
        torchButton.addTarget(self, action: #selector(torchTapped), for: .touchUpInside)
        view.addSubview(torchButton)
        NSLayoutConstraint.activate([
            torchButton.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 12),
            torchButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
        ])
    }

    @objc private func cancelTapped() {
        onCancel?()
    }

    @objc private func torchTapped() {
        guard let device = currentDevice, device.hasTorch else { return }
        do {
            try device.lockForConfiguration()
            device.torchMode = device.torchMode == .on ? .off : .on
            device.unlockForConfiguration()
        } catch {
            // Torch toggle failing isn't fatal to scanning - ignore.
        }
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !hasReportedResult,
              let first = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let value = first.stringValue, !value.isEmpty else {
            return
        }
        hasReportedResult = true
        onResult?(value, first.type.rawValue)
    }
}
