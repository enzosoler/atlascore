import Foundation
import HealthKit
import Combine

/// Manages local watch state and HealthKit workout sessions.
class WatchAppState: ObservableObject {
    @Published var activeWorkout: ActiveWorkout? = nil
    @Published var isWorkoutActive: Bool = false

    private let healthStore = HKHealthStore()
    private var workoutSession: HKWorkoutSession?
    private var workoutBuilder: HKLiveWorkoutBuilder?

    struct ActiveWorkout {
        var name: String
        var startDate: Date
        var elapsedSeconds: Int = 0
        var heartRate: Int = 0
        var activeCalories: Int = 0
        var setsCompleted: Int = 0
    }

    // MARK: — Start Workout

    func startWorkout(name: String) {
        let config = HKWorkoutConfiguration()
        config.activityType = .traditionalStrengthTraining
        config.locationType = .indoor

        do {
            workoutSession = try HKWorkoutSession(healthStore: healthStore, configuration: config)
            workoutBuilder = workoutSession?.associatedWorkoutBuilder()

            workoutBuilder?.dataSource = HKLiveWorkoutDataSource(healthStore: healthStore, workoutConfiguration: config)

            workoutSession?.startActivity(with: Date())
            workoutBuilder?.beginCollection(withStart: Date()) { success, error in
                if let error = error {
                    print("[Watch] Failed to begin collection: \(error.localizedDescription)")
                }
            }

            DispatchQueue.main.async {
                self.activeWorkout = ActiveWorkout(name: name, startDate: Date())
                self.isWorkoutActive = true
            }
        } catch {
            print("[Watch] Failed to start workout session: \(error.localizedDescription)")
        }
    }

    // MARK: — End Workout

    func endWorkout(completion: @escaping (Int, Int) -> Void) {
        guard let session = workoutSession, let builder = workoutBuilder else {
            completion(0, 0)
            return
        }

        session.end()
        builder.endCollection(withEnd: Date()) { success, error in
            builder.finishWorkout { workout, error in
                let duration = Int(workout?.duration ?? 0) / 60
                let calories = Int(workout?.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0)

                DispatchQueue.main.async {
                    self.isWorkoutActive = false
                    self.activeWorkout = nil
                    self.workoutSession = nil
                    self.workoutBuilder = nil
                    completion(duration, calories)
                }
            }
        }
    }

    // MARK: — Log Set

    func logSet() {
        guard activeWorkout != nil else { return }
        DispatchQueue.main.async {
            self.activeWorkout?.setsCompleted += 1
        }
    }

    // MARK: — Request HealthKit Authorization

    func requestHealthKitAuth() {
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .heartRate)!,
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.workoutType(),
        ]
        let typesToWrite: Set<HKSampleType> = [
            HKObjectType.workoutType(),
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
        ]

        healthStore.requestAuthorization(toShare: typesToWrite, read: typesToRead) { success, error in
            if let error = error {
                print("[Watch] HealthKit auth failed: \(error.localizedDescription)")
            }
        }
    }
}
