import Foundation
import UIKit
import Vision
import Capacitor

// Reads the number off a photo of a bathroom scale display, entirely
// on-device via Apple's Vision text recognition - no network call, no
// third-party OCR service, same reasoning as PhotoCheckPlugin (no photo of
// someone's body/weight ever leaves the device). This is what makes a
// weight-goal XP award real rather than self-reported: the app reads the
// number itself rather than trusting whatever the user types in.
@objc(ScaleReaderPlugin)
public class ScaleReaderPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ScaleReaderPlugin"
    public let jsName = "ScaleReader"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "readWeight", returnType: CAPPluginReturnPromise),
    ]

    @objc func readWeight(_ call: CAPPluginCall) {
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

        let request = VNRecognizeTextRequest { request, error in
            if error != nil {
                call.resolve(["weightKg": NSNull(), "rawText": []])
                return
            }
            let observations = request.results as? [VNRecognizedTextObservation] ?? []
            let candidates = observations.compactMap { $0.topCandidates(1).first?.string }
            let (weight, _) = Self.extractWeightKg(from: candidates)
            call.resolve([
                "weightKg": weight.map { $0 } ?? NSNull(),
                "rawText": candidates,
            ])
        }
        // .accurate (not .fast) - a scale's seven-segment or small LCD
        // digits are exactly the low-contrast, unusual-font case the fast
        // path misses. No language correction: a weight reading isn't a
        // dictionary word, "correcting" it would corrupt the digits.
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = false

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: Self.cgOrientation(for: image.imageOrientation), options: [:])
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                try handler.perform([request])
            } catch {
                call.resolve(["weightKg": NSNull(), "rawText": []])
            }
        }
    }

    // A scale's display is often not the only text in frame (brand name,
    // a BMI figure, a battery icon's stray glyph) - prefer a number
    // explicitly tagged "kg", then fall back to the largest number that
    // actually falls in a plausible human bodyweight range, since a BMI
    // figure (typically under 50) and a real kg reading (typically
    // 30-250) overlap only at the extreme low end.
    private static func extractWeightKg(from strings: [String]) -> (Double?, String?) {
        let numberPattern = try! NSRegularExpression(pattern: #"\d{1,3}(?:[.,]\d{1,2})?"#)

        func numbers(in s: String) -> [Double] {
            let ns = s as NSString
            return numberPattern.matches(in: s, range: NSRange(location: 0, length: ns.length)).compactMap {
                Double(ns.substring(with: $0.range).replacingOccurrences(of: ",", with: "."))
            }
        }

        var kgTagged: [Double] = []
        var plausible: [Double] = []
        for s in strings {
            let lower = s.lowercased()
            let found = numbers(in: s).filter { $0 >= 20 && $0 <= 300 }
            if lower.contains("kg") { kgTagged.append(contentsOf: found) }
            plausible.append(contentsOf: found)
        }
        if let best = kgTagged.max() { return (best, "kg-tagged") }
        if let best = plausible.max() { return (best, "plausible-range") }
        return (nil, nil)
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
