import Capacitor

// Capacitor's automatic plugin discovery only covers plugins delivered as
// their own package (like the Capacitor/Cordova frameworks) - a plugin
// compiled directly into the app target, like HealthPlugin, has to be
// registered explicitly here or the JS side sees "plugin not implemented".
class MainViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(HealthPlugin())
        bridge?.registerPluginInstance(PhotoCheckPlugin())
        bridge?.registerPluginInstance(LocationSearchPlugin())
        bridge?.registerPluginInstance(ScaleReaderPlugin())
    }
}
