import UIKit
import WebKit

// WKWebView's private WKContentView gives every focused <input>/<textarea> a
// native Prev/Next/Done toolbar above the keyboard - standard iOS form
// navigation, but this app has no multi-field forms that need it, and in
// the chat screen it showed up as a second, unwanted bar stacked between
// the message box and the keyboard. There is no public API to opt out, so
// this swaps in a `nil` inputAccessoryView the same way Cordova/Ionic's own
// WebView plugin has for years - overriding a public property (UIResponder
// .inputAccessoryView) on a class found by name, not calling any private
// method.
enum NoKeyboardAccessory {
    static func apply() {
        guard let contentViewClass = NSClassFromString("WKContentView") else { return }
        let noAccessorySelector = #selector(getter: NoAccessoryView.inputAccessoryView)
        guard let noAccessoryMethod = class_getInstanceMethod(NoAccessoryView.self, noAccessorySelector) else { return }
        let targetSelector = #selector(getter: UIResponder.inputAccessoryView)
        if let existing = class_getInstanceMethod(contentViewClass, targetSelector) {
            method_exchangeImplementations(existing, noAccessoryMethod)
        } else {
            class_addMethod(contentViewClass, targetSelector, method_getImplementation(noAccessoryMethod), method_getTypeEncoding(noAccessoryMethod))
        }
    }
}

private class NoAccessoryView: UIView {
    @objc override var inputAccessoryView: UIView? { nil }
}
