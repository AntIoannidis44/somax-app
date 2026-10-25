import Foundation
import UIKit
import Capacitor

// Sets the app's home-screen icon badge number directly, on demand - not
// just from a push's own aps.badge (which only updates while a notification
// is actually delivered). The app needs this to also drop back to 0 the
// moment the user reads a conversation while the app is open, with no new
// push involved, and there's no Capacitor core/official plugin for it.
@objc(BadgePlugin)
public class BadgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "BadgePlugin"
    public let jsName = "Badge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "setBadge", returnType: CAPPluginReturnPromise),
    ]

    @objc func setBadge(_ call: CAPPluginCall) {
        let count = call.getInt("count") ?? 0
        DispatchQueue.main.async {
            if #available(iOS 16.0, *) {
                UNUserNotificationCenter.current().setBadgeCount(count) { _ in }
            } else {
                UIApplication.shared.applicationIconBadgeNumber = count
            }
            call.resolve()
        }
    }
}
