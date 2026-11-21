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
        CAPPluginMethod(name: "getTodayAverageHeartRate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getRestingHeartRate", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getTodayWorkouts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getWorkoutRoute", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getDailyVerifiedSteps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openAppSettings", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getHealthSources", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openURL", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getStepsBySource", returnType: CAPPluginReturnPromise),
    ]

    private let store = HKHealthStore()

    private var stepsType: HKQuantityType { HKQuantityType(.stepCount) }
    private var exerciseType: HKQuantityType { HKQuantityType(.appleExerciseTime) }
    private var energyType: HKQuantityType { HKQuantityType(.activeEnergyBurned) }
    private var heartRateType: HKQuantityType { HKQuantityType(.heartRate) }
    private var restingHeartRateType: HKQuantityType { HKQuantityType(.restingHeartRate) }
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
            stepsType, exerciseType, energyType, heartRateType, restingHeartRateType, workoutType, routeType,
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
        sourceFilter(call) { [self] f in
        let startOfDay = Calendar.current.startOfDay(for: Date())
        let predicate = Self.only(HKQuery.predicateForSamples(withStart: startOfDay, end: Date(), options: .strictStartDate), f)

        // Coins are only paid for data a device recorded - steps someone typed
        // into the Health app ("Add Data") carry HKMetadataKeyWasUserEntered.
        let verifiedPredicate = NSCompoundPredicate(andPredicateWithSubpredicates: [predicate, Self.notUserEntered])
        sumQuantity(type: stepsType, unit: .count(), predicate: predicate) { steps in
          self.sumQuantity(type: self.stepsType, unit: .count(), predicate: verifiedPredicate) { verifiedSteps in
            self.sumQuantity(type: self.exerciseType, unit: .minute(), predicate: predicate) { exerciseMinutes in
              // "Exercise Minutes" is only ever written by an Apple Watch. Garmin (and other watches) never
              // write that type, so their Active ring sat at 0 (2026-11-21). When there are no Exercise Minutes
              // today, count active minutes the way Apple does - any minute at brisk-walk effort or harder
              // (see activeMinutesFallback).
              let age = call.getInt("age") ?? 0
              self.activeMinutesFallback(since: startOfDay, age: age, filter: f) { workoutMinutes in
                self.sumQuantity(type: self.energyType, unit: .kilocalorie(), predicate: predicate) { kcal in
                    let useWorkouts = exerciseMinutes <= 0 && workoutMinutes > 0
                    call.resolve([
                        // Steps are inherently a whole-number count - HealthKit's sum
                        // is a Double and can come back fractional (e.g. 8432.3) from
                        // floating-point summation across samples, which must never
                        // reach the UI/leaderboards as a decimal.
                        "steps": Int(steps.rounded()),
                        "verifiedSteps": Int(verifiedSteps.rounded()),
                        "activeMinutes": useWorkouts ? workoutMinutes : exerciseMinutes,
                        "activeMinutesSource": useWorkouts ? "computed" : "exercise",
                        "kcal": kcal,
                    ])
                }
              }
            }
          }
        }
            }
    }

    // The real month-to-date step total, queried directly from HealthKit -
    // deliberately not reconstructed from day-by-day app bookkeeping, which
    // can't see steps logged on days the app never synced (or before this
    // feature existed at all).
    @objc func getMonthlyStepsSummary(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
        let calendar = Calendar.current
        let now = Date()
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now)) else {
            call.resolve(["steps": 0])
            return
        }
        let predicate = Self.only(HKQuery.predicateForSamples(withStart: startOfMonth, end: now, options: .strictStartDate), f)
        sumQuantity(type: stepsType, unit: .count(), predicate: predicate) { steps in
            call.resolve(["steps": Int(steps.rounded())])
        }
            }
    }

    @objc func getLatestHeartRate(_ call: CAPPluginCall) {
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        // Never later than now: a sample written with a future date would otherwise sort first forever.
        let predicate = HKQuery.predicateForSamples(withStart: nil, end: Date(), options: [.strictEndDate])
        let query = HKSampleQuery(sampleType: heartRateType, predicate: predicate, limit: 1, sortDescriptors: [sort]) { _, samples, error in
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

    // Today's AVERAGE heart rate (owner 2026-11-20): every heart-rate reading Apple Health has since local
    // midnight - all-day watch readings plus those recorded during logged walks/workouts - averaged by
    // HealthKit itself. bpm is null when there is no reading today (the app then says none was detected).
    @objc func getTodayAverageHeartRate(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
        let now = Date()
        let predicate = Self.only(HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: now), end: now, options: [.strictEndDate]), f)
        let query = HKStatisticsQuery(quantityType: heartRateType, quantitySamplePredicate: predicate, options: .discreteAverage) { _, result, error in
            if let error = error as? HKError, error.code == .errorNoData {
                call.resolve(["bpm": NSNull()])
                return
            }
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            guard let avg = result?.averageQuantity() else {
                call.resolve(["bpm": NSNull()])
                return
            }
            call.resolve(["bpm": avg.doubleValue(for: HKUnit.count().unitDivided(by: .minute()))])
        }
        store.execute(query)
            }
    }

    // Workouts logged via the Watch's own Fitness/Workout app (or any
    // other app that writes to HealthKit) land here as HKWorkout samples -
    // this is how a session done outside SOMAXX gets noticed at all.
    // `startDate`/`endDate` (ISO8601 strings) are optional - omitted, this
    // behaves exactly as before (today only). Passed, it queries that
    // explicit range instead - used to sync a Watch workout onto a PAST
    // day's logged session, not just today's.
    @objc func getTodayWorkouts(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
        let formatter = ISO8601DateFormatter()
        let rangeStart: Date
        let rangeEnd: Date
        if let startStr = call.getString("startDate"), let parsedStart = formatter.date(from: startStr) {
            rangeStart = parsedStart
            if let endStr = call.getString("endDate"), let parsedEnd = formatter.date(from: endStr) {
                rangeEnd = parsedEnd
            } else {
                rangeEnd = Calendar.current.date(byAdding: .day, value: 1, to: rangeStart) ?? Date()
            }
        } else {
            rangeStart = Calendar.current.startOfDay(for: Date())
            rangeEnd = Date()
        }
        let predicate = Self.only(HKQuery.predicateForSamples(withStart: rangeStart, end: rangeEnd, options: .strictStartDate), f)
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
        let query = HKSampleQuery(sampleType: workoutType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, error in
            if error != nil {
                call.resolve(["workouts": []])
                return
            }
            let raw = samples as? [HKWorkout] ?? []
            var workouts = raw.map { w -> [String: Any] in
                let kcal = w.totalEnergyBurned?.doubleValue(for: .kilocalorie())
                let distance = self.distanceMeters(for: w)
                return [
                    "uuid": w.uuid.uuidString,
                    "activityName": Self.activityName(for: w.workoutActivityType),
                    "sourceName": w.sourceRevision.source.name,
                    "fromGarmin": w.sourceRevision.source.bundleIdentifier.lowercased().contains("garmin") || w.sourceRevision.source.name.lowercased().contains("garmin"),
                    "startDate": ISO8601DateFormatter().string(from: w.startDate),
                    "durationMinutes": w.duration / 60,
                    "kcal": kcal ?? 0,
                    // Added by hand in the Health app rather than recorded by a
                    // device - never verifies a session or earns coins.
                    "userEntered": (w.metadata?[HKMetadataKeyWasUserEntered] as? Bool) ?? false,
                    // Pool length set on the watch for pool swims - laps = distance / this.
                    "lapLengthMeters": (w.metadata?[HKMetadataKeyLapLength] as? HKQuantity)?.doubleValue(for: .meter()) ?? NSNull(),
                    // NSNull, not a raw nil Double - an Optional boxed as Any
                    // isn't valid JSON and would silently break the whole
                    // resolve rather than just this one field.
                    "distanceMeters": distance ?? NSNull(),
                ]
            }
            // Some watches (Garmin) send a workout without its calories. Fill those from the active
            // calories Apple Health recorded during the workout's own time window, so the effort
            // check and calorie totals work the same as for an Apple Watch (2026-11-21).
            let group = DispatchGroup()
            for (i, w) in raw.enumerated() where (w.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0) <= 0 {
                group.enter()
                let win = NSCompoundPredicate(andPredicateWithSubpredicates: [
                    Self.only(HKQuery.predicateForSamples(withStart: w.startDate, end: w.endDate, options: []), f), Self.notUserEntered])
                self.sumQuantity(type: self.energyType, unit: .kilocalorie(), predicate: win) { k in
                    DispatchQueue.main.async { workouts[i]["kcal"] = k; group.leave() }
                }
            }
            group.notify(queue: .main) { call.resolve(["workouts": workouts]) }
        }
        store.execute(query)
            }
    }

    // Real month-to-date distance for run/cycle/swim workouts only - deliberately
    // not walking, matching the Cardio Kilometres challenge's own rules exactly
    // ("running, cycling or swimming"). This is the actual source of truth a
    // challenge's progress gets synced from (see syncCardioKm in the store) -
    // there is no manual "log km" path left, so this has to be right.
    @objc func getMonthlyCardioDistance(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
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
        let predicate = Self.only(NSCompoundPredicate(andPredicateWithSubpredicates: [datePredicate, activityPredicate, Self.notUserEntered]), f)
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

    // Device-recorded steps per local calendar day between startDate and
    // endDate (ISO8601) - for step challenges, so a day counts even if the app
    // was never opened that day. Hand-entered steps are excluded.
    @objc func getDailyVerifiedSteps(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
        let formatter = ISO8601DateFormatter()
        guard let startStr = call.getString("startDate"), let start = formatter.date(from: startStr) else {
            call.resolve(["days": []])
            return
        }
        let end = call.getString("endDate").flatMap { formatter.date(from: $0) } ?? Date()
        let calendar = Calendar.current
        let anchor = calendar.startOfDay(for: start)
        let predicate = NSCompoundPredicate(andPredicateWithSubpredicates: [
            Self.only(HKQuery.predicateForSamples(withStart: anchor, end: end, options: .strictStartDate), f), Self.notUserEntered,
        ])
        let query = HKStatisticsCollectionQuery(quantityType: stepsType, quantitySamplePredicate: predicate,
                                                options: .cumulativeSum, anchorDate: anchor,
                                                intervalComponents: DateComponents(day: 1))
        query.initialResultsHandler = { _, results, error in
            guard error == nil, let results = results else {
                call.resolve(["days": []])
                return
            }
            let dayFormatter = DateFormatter()
            dayFormatter.calendar = calendar
            dayFormatter.timeZone = calendar.timeZone
            dayFormatter.dateFormat = "yyyy-MM-dd"
            var days: [[String: Any]] = []
            results.enumerateStatistics(from: anchor, to: end) { stats, _ in
                let steps = stats.sumQuantity()?.doubleValue(for: .count()) ?? 0
                days.append(["date": dayFormatter.string(from: stats.startDate), "steps": Int(steps.rounded())])
            }
            call.resolve(["days": days])
        }
        store.execute(query)
            }
    }

    // Samples a device recorded, excluding anything typed into the Health app.
    private static let notUserEntered = HKQuery.predicateForObjects(withMetadataKey: HKMetadataKeyWasUserEntered, operatorType: .notEqualTo, value: true)

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
        case .pilates: return "Pilates"
        // Added 2026-11-18 so sport challenges can count real sessions.
        // Anything that returned "Workout" before still does unless listed here.
        case .swimming: return "Swim"
        case .hiking: return "Hike"
        case .boxing, .kickboxing, .martialArts: return "Boxing"
        case .australianFootball: return "AFL"
        case .soccer: return "Soccer"
        case .basketball: return "Basketball"
        case .tennis: return "Tennis"
        case .golf: return "Golf"
        case .flexibility, .mindAndBody: return "Mobility"
        case .crossTraining: return "Cross Training"
        case .rowing, .elliptical, .stairClimbing, .jumpRope: return "Cardio"
        default: return "Workout"
        }
    }

    // A day with literally zero samples ever recorded for this type (e.g.
    // "Exercise Minutes" with no Apple Watch ever paired) can surface as
    // an HKError ("No data available for the specified predicate")
    // instead of just an empty/zero result - that's not a real failure,
    // it just means this metric has nothing to report, so it resolves to
    // 0 either way rather than blocking the rest of the summary.
    // Active minutes for watches that don't write Apple's "Exercise Minutes" (Garmin etc.). A minute since
    // `start` counts if ANY of these holds (each minute counted once):
    //  - it is inside a device-recorded workout;
    //  - heart rate is >= 64% of age-predicted max (220 - age): ACSM's lower bound for moderate intensity;
    //  - step rate is >= 100 steps/min: the walking cadence for moderate intensity (Tudor-Locke et al. 2018).
    // Typed-in Health entries never count. Age 0/unknown -> 35 is assumed for the heart-rate threshold.
    private func activeMinutesFallback(since start: Date, age: Int, filter f: NSPredicate?, completion: @escaping (Double) -> Void) {
        let now = Date()
        let pred = NSCompoundPredicate(andPredicateWithSubpredicates: [
            Self.only(HKQuery.predicateForSamples(withStart: start, end: now, options: []), f), Self.notUserEntered])
        let lock = NSLock()
        var minutes = Set<Int>()
        func mark(_ a: Date, _ b: Date) {
            let s0 = max(0, Int(a.timeIntervalSince(start) / 60)), s1 = Int(min(b, now).timeIntervalSince(start) / 60)
            guard s1 >= s0 else { return }
            lock.lock(); for m in s0...s1 { minutes.insert(m) }; lock.unlock()
        }
        let hrThreshold = 0.64 * Double(220 - (age > 0 ? age : 35))
        let group = DispatchGroup()
        group.enter()
        store.execute(HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            for w in samples as? [HKWorkout] ?? [] { mark(w.startDate, w.endDate) }
            group.leave()
        })
        group.enter()
        let byTime = [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
        store.execute(HKSampleQuery(sampleType: heartRateType, predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: byTime) { _, samples, _ in
            let bpmUnit = HKUnit.count().unitDivided(by: .minute())
            var prevHigh: Date? = nil
            for case let q as HKQuantitySample in samples ?? [] {
                let high = q.quantity.doubleValue(for: bpmUnit) >= hrThreshold
                if high {
                    // two elevated readings up to 5 min apart: the time between them was active too
                    if let p = prevHigh, q.startDate.timeIntervalSince(p) <= 300 { mark(p, q.endDate) } else { mark(q.startDate, q.endDate) }
                    prevHigh = q.startDate
                } else { prevHigh = nil }
            }
            group.leave()
        })
        group.enter()
        store.execute(HKSampleQuery(sampleType: stepsType, predicate: pred, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            for case let q as HKQuantitySample in samples ?? [] {
                let mins = q.endDate.timeIntervalSince(q.startDate) / 60
                if mins >= 1, q.quantity.doubleValue(for: .count()) / mins >= 100 { mark(q.startDate, q.endDate) }
            }
            group.leave()
        })
        group.notify(queue: .global()) { completion(Double(minutes.count)) }
    }

    // Which apps/devices have written steps or heart rate to Apple Health in the last 7 days - lets the
    // app show "Garmin connected" once Garmin Connect's own Apple Health sharing is switched on.
    @objc func getHealthSources(_ call: CAPPluginCall) {
        let since = Date().addingTimeInterval(-7 * 24 * 3600)
        let pred = HKQuery.predicateForSamples(withStart: since, end: Date(), options: [])
        var found: [String: String] = [:]
        let group = DispatchGroup()
        for type in [stepsType, heartRateType] {
            group.enter()
            let q = HKSourceQuery(sampleType: type, samplePredicate: pred) { _, sources, _ in
                for src in sources ?? [] { found[src.bundleIdentifier] = src.name }
                group.leave()
            }
            store.execute(q)
        }
        group.notify(queue: .main) {
            let list = found.map { ["bundleId": $0.key, "name": $0.value] }
            let garmin = found.keys.contains { $0.lowercased().contains("garmin") } || found.values.contains { $0.lowercased().contains("garmin") }
            call.resolve(["sources": list, "garmin": garmin])
        }
    }

    // Opens a web/App Store link or another app (used for "Connect Garmin").
    @objc func openURL(_ call: CAPPluginCall) {
        guard let str = call.getString("url"), let url = URL(string: str) else { call.reject("bad url"); return }
        DispatchQueue.main.async {
            UIApplication.shared.open(url, options: [:]) { ok in call.resolve(["opened": ok]) }
        }
    }


    // ---- "Sync data from Garmin" (2026-11-21) -------------------------------------------------------------
    // With source "garmin" every query only reads samples Garmin Connect wrote to Apple Health, so the iPhone's
    // own steps (or an Apple Watch) never mix in. Default ("health"): all sources, as Apple Health merges them.
    static func only(_ base: NSPredicate, _ f: NSPredicate?) -> NSPredicate {
        guard let f = f else { return base }
        return NSCompoundPredicate(andPredicateWithSubpredicates: [base, f])
    }

    private func sourceFilter(_ call: CAPPluginCall, _ body: @escaping (NSPredicate?) -> Void) {
        guard call.getString("source") == "garmin" else { body(nil); return }
        var found = Set<HKSource>()
        let lock = NSLock()
        let group = DispatchGroup()
        for type in [stepsType, workoutType, heartRateType, restingHeartRateType, energyType] as [HKSampleType] {
            group.enter()
            store.execute(HKSourceQuery(sampleType: type, samplePredicate: nil) { _, sources, _ in
                lock.lock()
                for src in sources ?? [] where src.bundleIdentifier.lowercased().contains("garmin") || src.name.lowercased().contains("garmin") {
                    found.insert(src)
                }
                lock.unlock()
                group.leave()
            })
        }
        // no Garmin source yet -> an empty set matches nothing (shows 0 rather than someone else's steps)
        group.notify(queue: .global()) { body(HKQuery.predicateForObjects(from: found)) }
    }

    // Today's steps from EACH app/device that wrote steps to Apple Health, plus when each last wrote (2026-11-21).
    // Settings shows this so a Garmin user can see Garmin's own count next to the iPhone's, and how long ago
    // Garmin Connect last synced - Garmin only sends data to Apple Health when Garmin Connect syncs.
    @objc func getStepsBySource(_ call: CAPPluginCall) {
        let now = Date()
        let today = HKQuery.predicateForSamples(withStart: Calendar.current.startOfDay(for: now), end: now, options: .strictStartDate)
        store.execute(HKSourceQuery(sampleType: stepsType, samplePredicate: today) { [self] _, sources, _ in
            let list = Array(sources ?? [])
            var rows = [[String: Any]](repeating: [:], count: list.count)
            let lock = NSLock()
            let group = DispatchGroup()
            let byEnd = [NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)]
            for (i, src) in list.enumerated() {
                let pred = Self.only(today, HKQuery.predicateForObjects(from: [src]))
                group.enter()
                sumQuantity(type: stepsType, unit: .count(), predicate: pred) { steps in
                    self.store.execute(HKSampleQuery(sampleType: self.stepsType, predicate: pred, limit: 1, sortDescriptors: byEnd) { _, samples, _ in
                        let last = samples?.first.map { ISO8601DateFormatter().string(from: $0.endDate) }
                        let garmin = src.bundleIdentifier.lowercased().contains("garmin") || src.name.lowercased().contains("garmin")
                        lock.lock()
                        rows[i] = ["name": src.name, "bundleId": src.bundleIdentifier, "garmin": garmin,
                                   "steps": Int(steps.rounded()), "lastAt": last ?? NSNull()]
                        lock.unlock()
                        group.leave()
                    })
                }
            }
            group.notify(queue: .main) { call.resolve(["sources": rows]) }
        })
    }

    // Resting heart rate (what Home shows, 2026-11-21): the most recent daily value in the last 7 days.
    @objc func getRestingHeartRate(_ call: CAPPluginCall) {
        sourceFilter(call) { [self] f in
            let now = Date()
            let pred = Self.only(HKQuery.predicateForSamples(withStart: now.addingTimeInterval(-7 * 24 * 3600), end: now, options: [.strictEndDate]), f)
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            self.store.execute(HKSampleQuery(sampleType: self.restingHeartRateType, predicate: pred, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                guard let q = samples?.first as? HKQuantitySample else { call.resolve(["bpm": NSNull(), "recordedAt": NSNull()]); return }
                call.resolve(["bpm": q.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute())),
                              "recordedAt": ISO8601DateFormatter().string(from: q.endDate)])
            })
        }
    }

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
