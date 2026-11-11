import Foundation
import Speech
import AVFoundation
import Capacitor

// Live on-device speech-to-text for voice food logging - tap to start,
// tap again to stop, final transcript goes to estimate-food-text (see
// src/lib/foodText.ts) the same way a hand-typed description does.
@objc(SpeechToTextPlugin)
public class SpeechToTextPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechToTextPlugin"
    public let jsName = "SpeechToText"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "startListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopListening", returnType: CAPPluginReturnPromise),
    ]

    private let audioEngine = AVAudioEngine()
    private var speechRecognizer: SFSpeechRecognizer?
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private var latestTranscript = ""

    @objc func requestPermission(_ call: CAPPluginCall) {
        // AVAudioSession.requestRecordPermission (not the iOS 17+
        // AVAudioApplication variant) - this project's deployment target
        // is iOS 15.
        SFSpeechRecognizer.requestAuthorization { speechStatus in
            AVAudioSession.sharedInstance().requestRecordPermission { micGranted in
                DispatchQueue.main.async {
                    call.resolve(["granted": speechStatus == .authorized && micGranted])
                }
            }
        }
    }

    @objc func startListening(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.audioEngine.isRunning {
                call.reject("Already listening")
                return
            }
            self.latestTranscript = ""

            let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
            guard let recognizer = recognizer, recognizer.isAvailable else {
                call.reject("Speech recognition unavailable right now")
                return
            }
            self.speechRecognizer = recognizer

            let session = AVAudioSession.sharedInstance()
            do {
                try session.setCategory(.record, mode: .measurement, options: .duckOthers)
                try session.setActive(true, options: .notifyOthersOnDeactivation)
            } catch {
                call.reject("Could not start audio session: \(error.localizedDescription)")
                return
            }

            let request = SFSpeechAudioBufferRecognitionRequest()
            request.shouldReportPartialResults = true
            // On-device only where available - keeps a voice log fast and
            // avoids sending raw audio anywhere; falls back to Apple's
            // server-based recognition automatically if unsupported for
            // this locale/device.
            if recognizer.supportsOnDeviceRecognition {
                request.requiresOnDeviceRecognition = true
            }
            self.recognitionRequest = request

            let inputNode = self.audioEngine.inputNode
            self.recognitionTask = recognizer.recognitionTask(with: request) { result, error in
                if let result = result {
                    self.latestTranscript = result.bestTranscription.formattedString
                }
                if error != nil || (result?.isFinal ?? false) {
                    inputNode.removeTap(onBus: 0)
                    self.audioEngine.stop()
                    self.recognitionRequest = nil
                    self.recognitionTask = nil
                }
            }

            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
                self.recognitionRequest?.append(buffer)
            }

            self.audioEngine.prepare()
            do {
                try self.audioEngine.start()
                call.resolve()
            } catch {
                call.reject("Could not start recording: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopListening(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.audioEngine.isRunning {
                self.audioEngine.stop()
                self.audioEngine.inputNode.removeTap(onBus: 0)
            }
            self.recognitionRequest?.endAudio()
            try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            // The recognition task's completion handler (above) runs
            // asynchronously after endAudio() - give it a brief moment to
            // deliver the final transcript before reading latestTranscript.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                call.resolve(["text": self.latestTranscript])
            }
        }
    }
}
