import Foundation
import UIKit
import Capacitor
import HealthKit

// Bridges HealthKit (steps, exercise minutes, latest heart rate) to the
// web app - see src/lib/health.ts for the JS side of this contract.
@objc(HealthPlugin)
public class HealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthPlugin"
    public let jsName = "Health"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTodaySummary", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getMonthlyStepsSummary", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getMonthlyCardioDistance", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getLatestHeartRate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTodayWorkouts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getWorkoutRoute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openAppSettings", returnType: CAPPluginReturnPromise),
    ]

    private let store = HKHealthStore()

    private var stepsType: HKQuantityType { HKQuantityType(.stepCount) }
    private var exerciseType: HKQuantityType { HKQuantityType(.appleExerciseTime) }
    private var energyType: HKQuantityType { HKQuantityType(.activeEnergyBurned) }
    private var heartRateType: HKQuantityType { HKQuantityType(.heartRate) }
    private var workoutType: HKWorkoutType { HKObjectType.workoutType() }
    private var routeType: HKSeriesType { HKSeriesType.workoutRoute() }
    private var distanceWalkingRunningType: HKQuantityType { HKQuantityType(.distanceWalkingRunning) }
    private var distanceCyclingType: HKQuantityType { HKQuantityType(.distanceCycling) }
    private var distanceSwimmingType: HKQuantityType { HKQuantityType(.distanceSwimming) }

    // `HKWorkout.totalDistance` is a legacy field that modern sources
    // (including the Watch's own Workout app on recent watchOS) often
    // leave nil, especially for walks - it silently came back empty on
    // a real logged walk during testing. The correct modern read is a
    // per-activity-type statistics lookup, which is what the Watch
    // actually populates; fall back to the legacy field only if that
    // comes back empty too (e.g. an older or third-party data source).
    private func distanceMeters(for workout: HKWorkout) -> Double? {
        let quantityType: HKQuantityType?
        switch workout.workoutActivityType {
        case .running, .walking, .hiking:
            quantityType = distanceWalkingRunningType
        case .cycling:
            quantityType = distanceCyclingType
        case .swimming:
            quantityType = distanceSwimmingType
        default:
            quantityType = nil
        }
        if #available(iOS 16.0, *), let qt = quantityType, let sum = workout.statistics(for: qt)?.sumQuantity() {
            return sum.doubleValue(for: .meter())
        }
        return workout.totalDistance?.doubleValue(for: .meter())
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable()])
    }

    // HealthKit's read-permission grant is never exposed to the app (by
    // Apple's own privacy design) - requestAuthorization's `success` flag
    // just means the prompt completed, not that the user actually said
    // yes to anything. So a workout/steps sync that keeps coming back
    // empty is genuinely indistinguishable, from the app's side, between
    // "nothing logged" and "access denied" - the only real fix is giving
    // the user a direct path to go check/re-enable it themselves.
    @objc func openAppSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard let url = URL(string: UIApplication.openSettingsURLString) else {
                call.reject("Could not build Settings URL")
                return
            }
            UIApplication.shared.open(url, options: [:]) { success in
                call.resolve(["opened": success])
            }
        }
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Health data is not available on this device")
            return
        }
        let readTypes: Set<HKObjectType> = [
            stepsType, exerciseType, energyType, heartRateType, workoutType, routeType,
            distanceWalkingRunningType, distanceCyclingType, distanceSwimmingType,
        ]
        store.requestAuthorization(toShare: [], read: readTypes) { success, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            call.resolve(["granted": success])
        }
    }

    @objc func getTodaySummary(_ call: CAPPluginCall) {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)

        sumQuantity(type: stepsType, unit: .count(), predicate: predicate) { steps in
            self.sumQuantity(type: self.exerciseType, unit: .minute(), predicate: predicate) { minutes in
                self.sumQuantity(type: self.energyType, unit: .kilocalorie(), predicate: predicate) { kcal in
                    call.resolve([
                        // Steps are inherently a whole-number count - HealthKit's sum
                        // is a Double and can come back fractional (e.g. 8432.3) from
                        // floating-point summation across samples, which must never
                        // reach the UI/leaderboards as a decimal.
                        "steps": Int(steps.rounded()),
                        "activeMinutes": minutes,
                        "kcal": kcal,
                    ])
                }
            }
        }
    }

    // The real month-to-date step total, queried directly from HealthKit -
    // deliberately not reconstructed from day-by-day app bookkeeping, which
    // can't see steps logged on days the app never synced (or before this
    // feature existed at all).
    @objc func getMonthlyStepsSummary(_ call: CAPPluginCall) {
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) else {
            call.resolve(["steps": 0])
            return
        }
        let predicate = HKQuery.predicateForSamples(withStart: startOfMonth, end: now, options: .strictStartDate)
        sumQuantity(type: stepsType, unit: .count(), predicate: predicate) { steps in
            call.resolve(["steps": Int(steps.rounded())])
        }
    }

    @objc func getLatestHeartRate(_ call: CAPPluginCall) {
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(sampleType: heartRateType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            guard let sample = samples?.first as? HKQuantitySample else {
                call.resolve(["bpm": NSNull(), "recordedAt": NSNull()])
                return
            }
            let bpm = sample.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))
            let iso = ISO8601DateFormatter().string(from: sample.endDate)
            call.resolve(["bpm": bpm, "recordedAt": iso])
        }
        store.execute(query)
    }

    // Workouts logged via the Watch's own Fitness/Workout app (or any
    // other app that writes to HealthKit) land here as HKWorkout samples -
    // this is how a session done outside SOMAXX gets noticed at all.
    @objc func getTodayWorkouts(_ call: CAPPluginCall) {
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
        let query = HKSampleQuery(sampleType: workoutType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, error in
            if error != nil {
                call.resolve(["workouts": []])
                return
            }
            let workouts = (samples as? [HKWorkout] ?? []).map { w -> [String: Any] in
                let kcal = w.totalEnergyBurned?.doubleValue(for: .kilocalorie())
                let distance = self.distanceMeters(for: w)
                return [
                    "uuid": w.uuid.uuidString,
                    "activityName": Self.activityName(for: w.workoutActivityType),
                    "startDate": ISO8601DateFormatter().string(from: w.startDate),
                    "durationMinutes": w.duration / 60,
                    "kcal": kcal ?? 0,
                    // NSNull, not a raw nil Double - an Optional boxed as Any
                    // isn't valid JSON and would silently break the whole
                    // resolve rather than just this one field.
                    "distanceMeters": distance ?? NSNull(),
                ]
            }
            call.resolve(["workouts": workouts])
        }
        store.execute(query)
    }

    // Real month-to-date distance for run/cycle/swim workouts only - deliberately
    // not walking, matching the Cardio Kilometres challenge's own rules exactly
    // ("running, cycling or swimming"). This is the actual source of truth a
    // challenge's progress gets synced from (see syncCardioKm in the store) -
    // there is no manual "log km" path left, so this has to be right.
    @objc func getMonthlyCardioDistance(_ call: CAPPluginCall) {
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) else {
            call.resolve(["meters": 0])
            return
        }
        let datePredicate = HKQuery.predicateForSamples(withStart: startOfMonth, end: now, options: .strictStartDate)
        let activityPredicate = NSCompoundPredicate(orPredicateWithSubpredicates: [
            HKQuery.predicateForWorkouts(with: .running),
            HKQuery.predicateForWorkouts(with: .cycling),
            HKQuery.predicateForWorkouts(with: .swimming),
        ])
        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [datePredicate, activityPredicate])
        let query = HKSampleQuery(sampleType: workoutType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
            if error != nil {
                call.resolve(["meters": 0])
                return
            }
            let meters = (samples as? [HKWorkout] ?? []).reduce(0.0) { sum, w in
                sum + (self.distanceMeters(for: w) ?? 0)
            }
            call.resolve(["meters": meters])
        }
        store.execute(query)
    }

    // The GPS path for one specific outdoor workout (run/walk/cycle) - used
    // to draw a custom, non-map route shape on its feed post. Most indoor
    // workouts (strength, swimming in a pool, etc) simply have no route and
    // resolve to an empty array rather than an error - that's a normal,
    // expected case, not a failure.
    @objc func getWorkoutRoute(_ call: CAPPluginCall) {
        guard let uuidString = call.getString("uuid"), let uuid = UUID(uuidString: uuidString) else {
            call.reject("No workout uuid provided")
            return
        }
        let workoutPredicate = HKQuery.predicateForObject(with: uuid)
        let workoutQuery = HKSampleQuery(sampleType: workoutType, predicate: workoutPredicate, limit: 1, sortDescriptors: nil) { _, samples, error in
            guard error == nil, let workout = samples?.first as? HKWorkout else {
                call.resolve(["points": []])
                return
            }
            let routePredicate = HKQuery.predicateForObjects(from: workout)
            let routeQuery = HKSampleQuery(sampleType: self.routeType, predicate: routePredicate, limit: 1, sortDescriptors: nil) { _, routeSamples, routeError in
                guard routeError == nil, let route = routeSamples?.first as? HKWorkoutRoute else {
                    call.resolve(["points": []])
                    return
                }
                var points: [[String: Any]] = []
                let locationQuery = HKWorkoutRouteQuery(route: route) { _, locations, done, locError in
                    if locError == nil, let locations = locations {
                        // Timestamp per point is what makes per-km split times
                        // possible client-side (elapsed time at each km
                        // crossing, interpolated between the two bracketing
                        // points) - lat/lng alone can only draw the shape.
                        points.append(contentsOf: locations.map {
                            ["lat": $0.coordinate.latitude, "lng": $0.coordinate.longitude, "t": ISO8601DateFormatter().string(from: $0.timestamp)]
                        })
                    }
                    // HKWorkoutRouteQuery delivers locations in batches and
                    // keeps calling this closure until `done` - only resolve
                    // once, on the final batch, or the JS side's promise
                    // would try to settle multiple times.
                    if done {
                        call.resolve(["points": points])
                    }
                }
                self.store.execute(locationQuery)
            }
            self.store.execute(routeQuery)
        }
        store.execute(workoutQuery)
    }

    private static func activityName(for type: HKWorkoutActivityType) -> String {
        switch type {
        case .traditionalStrengthTraining, .functionalStrengthTraining: return "Strength Training"
        case .running: return "Run"
        case .walking: return "Walk"
        case .cycling: return "Cycling"
        case .coreTraining: return "Core Training"
        case .highIntensityIntervalTraining: return "HIIT"
        case .mixedCardio, .cardioDance: return "Cardio"
        case .yoga: return "Yoga"
        default: return "Workout"
        }
    }

    // A day with literally zero samples ever recorded for this type (e.g.
    // "Exercise Minutes" with no Apple Watch ever paired) can surface as
    // an HKError ("No data available for the specified predicate")
    // instead of just an empty/zero result - that's not a real failure,
    // it just means this metric has nothing to report, so it resolves to
    // 0 either way rather than blocking the rest of the summary.
    private func sumQuantity(type: HKQuantityType, unit: HKUnit, predicate: NSPredicate, completion: @escaping (Double) -> Void) {
        let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
            if error != nil {
                completion(0)
                return
            }
            completion(result?.sumQuantity()?.doubleValue(for: unit) ?? 0)
        }
        store.execute(query)
    }
}
