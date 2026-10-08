import Foundation
import MapKit
import CoreLocation
import Capacitor

// Type-ahead place/suburb search for a post's location tag - MKLocalSearchCompleter
// is Apple's own free, on-device-adjacent autocomplete (no API key, no per-call
// cost, unlike Google Places), matching the same "no paid map API" decision
// already made for the route map. One query in flight at a time; a new query
// cancels whatever's still pending rather than racing two completions against
// each other.
@objc(LocationSearchPlugin)
public class LocationSearchPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LocationSearchPlugin"
    public let jsName = "LocationSearch"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "search", returnType: CAPPluginReturnPromise),
    ]

    // Both the completer and its delegate must be retained as instance
    // properties, not locals - MKLocalSearchCompleter does the actual
    // lookup asynchronously, and with nothing holding a strong reference
    // to it beyond the search() call's own stack frame, ARC was freeing
    // it before completerDidUpdateResults ever had a chance to fire. The
    // call's promise never resolved or rejected - it just hung forever,
    // which looked like the field silently doing nothing at all.
    private var completer: MKLocalSearchCompleter?
    private var completerDelegate: CompleterDelegate?

    // Without a region hint, MKLocalSearchCompleter has no geographic
    // context for an ambiguous query (a bare suburb name with nothing
    // else) and can come back with sparse or no results at all - exactly
    // what "it's not working" looked like. Requested as early as possible
    // (plugin load, not the first keystroke) so a location is usually
    // already on hand by the time someone actually opens the search field.
    private let locationManager = CLLocationManager()
    private var locationDelegate: LocationDelegate?
    private var lastKnownLocation: CLLocation?

    override public func load() {
        // CLLocationManager (and, below, MKLocalSearchCompleter) deliver
        // their results via the run loop of whatever thread they were
        // created/configured on. Capacitor dispatches plugin methods on
        // a background queue by default - with no active run loop there,
        // the delegate callback was simply never being scheduled, so the
        // search() call's promise hung forever rather than failing fast.
        // Both need to be explicitly created and driven from the main
        // thread's run loop instead.
        DispatchQueue.main.async {
            let delegate = LocationDelegate(
                onLocation: { [weak self] loc in self?.lastKnownLocation = loc },
                onAuthorized: { [weak self] in self?.locationManager.requestLocation() },
            )
            self.locationDelegate = delegate
            self.locationManager.delegate = delegate
            let status = self.locationManager.authorizationStatus
            if status == .notDetermined {
                self.locationManager.requestWhenInUseAuthorization()
            } else if status == .authorizedWhenInUse || status == .authorizedAlways {
                self.locationManager.requestLocation()
            }
        }
    }

    @objc func search(_ call: CAPPluginCall) {
        guard let query = call.getString("query"), !query.trimmingCharacters(in: .whitespaces).isEmpty else {
            call.resolve(["results": []])
            return
        }
        DispatchQueue.main.async {
            let completer = MKLocalSearchCompleter()
            completer.resultTypes = [.address, .pointOfInterest]
            if let loc = self.lastKnownLocation {
                completer.region = MKCoordinateRegion(center: loc.coordinate, latitudinalMeters: 50_000, longitudinalMeters: 50_000)
            }
            let delegate = CompleterDelegate { results in
                call.resolve(["results": results.map { ["title": $0.title, "subtitle": $0.subtitle] }])
            }
            self.completer = completer
            self.completerDelegate = delegate
            completer.delegate = delegate
            completer.queryFragment = query
        }
    }

    private class CompleterDelegate: NSObject, MKLocalSearchCompleterDelegate {
        let onResults: ([MKLocalSearchCompletion]) -> Void
        init(onResults: @escaping ([MKLocalSearchCompletion]) -> Void) {
            self.onResults = onResults
        }
        func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
            onResults(Array(completer.results.prefix(8)))
        }
        func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
            onResults([])
        }
    }

    private class LocationDelegate: NSObject, CLLocationManagerDelegate {
        let onLocation: (CLLocation) -> Void
        let onAuthorized: () -> Void
        init(onLocation: @escaping (CLLocation) -> Void, onAuthorized: @escaping () -> Void) {
            self.onLocation = onLocation
            self.onAuthorized = onAuthorized
        }
        func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
            if manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways {
                onAuthorized()
            }
        }
        func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
            if let loc = locations.last { onLocation(loc) }
        }
        func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
            // No location on hand just means search falls back to an
            // unbiased global query - not a failure worth surfacing.
        }
    }
}
