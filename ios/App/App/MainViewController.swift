import Capacitor

// Capacitor's automatic plugin discovery only covers plugins delivered as
// their own package (like the Capacitor/Cordova frameworks) - a plugin
// compiled directly into the app target, like HealthPlugin, has to be
// registered explicitly here or the JS side sees "plugin not implemented".
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        NoKeyboardAccessory.apply()
        // WKWebView wraps the whole page in its own native UIScrollView, a
        // layer above all the HTML/CSS - body { position: fixed } stops the
        // *page* from scrolling, but not this native layer, which still
        // auto-pans the entire web view to bring a focused <input> above
        // the keyboard. That's what dragged the chat header up under the
        // real status bar: every screen here already does its own internal
        // scrolling (.screen, .dm-messages), so the outer native scroll
        // view never needs to move at all.
        bridge?.webView?.scrollView.isScrollEnabled = false
        bridge?.webView?.scrollView.bounces = false
        bridge?.registerPluginInstance(HealthPlugin())
        bridge?.registerPluginInstance(PhotoCheckPlugin())
        bridge?.registerPluginInstance(LocationSearchPlugin())
        bridge?.registerPluginInstance(ScaleReaderPlugin())
        bridge?.registerPluginInstance(BadgePlugin())
        bridge?.registerPluginInstance(BarcodeScannerPlugin())
        bridge?.registerPluginInstance(SpeechToTextPlugin())
    }
}
