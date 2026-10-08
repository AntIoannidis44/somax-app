import Foundation
import UIKit
import Vision
import Capacitor

// Checks a picked profile photo actually shows a person before it's
// accepted, entirely on-device via Apple's Vision framework - no network
// call, no API key, no third-party service. A real face in the frame is a
// strong, fast signal for "this is a photo of a person" and directly
// matches the "has to pass as a person" requirement without needing to
// send anyone's photo off-device at all.
@objc(PhotoCheckPlugin)
public class PhotoCheckPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PhotoCheckPlugin"
    public let jsName = "PhotoCheck"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkIsPerson", returnType: CAPPluginReturnPromise),
    ]

    @objc func checkIsPerson(_ call: CAPPluginCall) {
        // Split into specific failure reasons rather than one generic
        // reject - this has failed silently for real users twice already
        // with no way to tell which step actually broke.
        guard let base64 = call.getString("base64"), !base64.isEmpty else {
            call.reject("No image data received by the native plugin")
            return
        }
        guard let data = Data(base64Encoded: base64) else {
            call.reject("Could not base64-decode the image (\(base64.count) chars received)")
            return
        }
        guard let image = UIImage(data: data) else {
            call.reject("Could not decode \(data.count) bytes as an image")
            return
        }
        guard let cgImage = image.cgImage else {
            call.reject("Decoded UIImage has no backing CGImage")
            return
        }

        let request = VNDetectFaceRectanglesRequest { request, error in
            if error != nil {
                call.resolve(["isPerson": false])
                return
            }
            let faces = request.results as? [VNFaceObservation] ?? []
            // A tiny/distant face isn't the torso-up framing a profile photo
            // needs - require the face to take up a reasonable share of the
            // frame, not just be detectable anywhere in it.
            let hasGoodFace = faces.contains { $0.boundingBox.width > 0.12 && $0.boundingBox.height > 0.12 }
            call.resolve(["isPerson": hasGoodFace])
        }

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: Self.cgOrientation(for: image.imageOrientation), options: [:])
        DispatchQueue.global(qos: .userInitiated).async {
            // perform's completion handler (above) is what calls
            // call.resolve - it only runs if perform succeeds. A `try?`
            // here would silently swallow a throw and leave the JS side's
            // await hanging forever with no resolve AND no reject, which
            // looked like "nothing happens" with no error shown at all.
            // Must always settle the call one way or another.
            do {
                try handler.perform([request])
            } catch {
                call.resolve(["isPerson": false])
            }
        }
    }

    private static func cgOrientation(for orientation: UIImage.Orientation) -> CGImagePropertyOrientation {
        switch orientation {
        case .up: return .up
        case .upMirrored: return .upMirrored
        case .down: return .down
        case .downMirrored: return .downMirrored
        case .left: return .left
        case .leftMirrored: return .leftMirrored
        case .right: return .right
        case .rightMirrored: return .rightMirrored
        @unknown default: return .up
        }
    }
}
