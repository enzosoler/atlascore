import SwiftUI
import WatchConnectivity

@main
struct AtlasCoreWatchApp: App {
    @StateObject private var dataStore = WatchDataStore()

    var body: some Scene {
        WindowGroup {
            MainListView()
                .environmentObject(dataStore)
        }
    }
}

// MARK: - Data Store (WatchConnectivity)

class WatchDataStore: NSObject, ObservableObject, WCSessionDelegate {
    @Published var todayData: TodayData = .placeholder

    override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }

    func requestData() {
        guard WCSession.default.isReachable else { return }
        WCSession.default.sendMessage(["action": "requestData"], replyHandler: { reply in
            if let data = reply["todayData"] as? [String: Any] {
                DispatchQueue.main.async {
                    self.todayData = TodayData.from(dict: data)
                }
            }
        }, errorHandler: { error in
            print("[Watch] Request failed: \(error.localizedDescription)")
        })
    }

    func sendWorkoutCompleted(duration: Int, calories: Int) {
        let msg: [String: Any] = [
            "action": "workoutCompleted",
            "durationMinutes": duration,
            "caloriesBurned": calories,
            "completedAt": ISO8601DateFormatter().string(from: Date())
        ]
        WCSession.default.sendMessage(msg, replyHandler: nil)
    }

    func sendWeightLogged(kg: Double) {
        let msg: [String: Any] = [
            "action": "weightLogged",
            "weightKg": kg,
            "loggedAt": ISO8601DateFormatter().string(from: Date())
        ]
        WCSession.default.sendMessage(msg, replyHandler: nil)
    }

    // WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith state: WCSessionActivationState, error: Error?) {
        if state == .activated { requestData() }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        if let data = applicationContext["todayData"] as? [String: Any] {
            DispatchQueue.main.async {
                self.todayData = TodayData.from(dict: data)
            }
        }
    }
}

// MARK: - Data Model

struct TodayData {
    var workoutName: String
    var exerciseCount: Int
    var durationMin: Int
    var exerciseList: String
    var caloriesConsumed: Int
    var caloriesTarget: Int
    var proteinG: Int
    var carbsG: Int
    var fatG: Int
    var latestWeightKg: Double
    var weightChangeKg: Double
    var waterCount: Int
    var waterTarget: Int

    var calorieProgress: Double {
        guard caloriesTarget > 0 else { return 0 }
        return Double(caloriesConsumed) / Double(caloriesTarget)
    }

    static let placeholder = TodayData(
        workoutName: "Push A", exerciseCount: 5, durationMin: 48,
        exerciseList: "Bench · OHP · Incline · Dips · Lateral",
        caloriesConsumed: 1248, caloriesTarget: 2950,
        proteinG: 92, carbsG: 142, fatG: 38,
        latestWeightKg: 82.4, weightChangeKg: -0.3,
        waterCount: 6, waterTarget: 8
    )

    static func from(dict: [String: Any]) -> TodayData {
        TodayData(
            workoutName: dict["workoutName"] as? String ?? "Rest day",
            exerciseCount: dict["workoutExerciseCount"] as? Int ?? 0,
            durationMin: dict["workoutDurationMin"] as? Int ?? 0,
            exerciseList: dict["workoutExerciseList"] as? String ?? "",
            caloriesConsumed: dict["caloriesConsumed"] as? Int ?? 0,
            caloriesTarget: dict["caloriesTarget"] as? Int ?? 0,
            proteinG: dict["proteinConsumed"] as? Int ?? 0,
            carbsG: dict["carbsConsumed"] as? Int ?? 0,
            fatG: dict["fatConsumed"] as? Int ?? 0,
            latestWeightKg: dict["latestWeightKg"] as? Double ?? 0,
            weightChangeKg: dict["weightChangeKg"] as? Double ?? 0,
            waterCount: dict["waterCount"] as? Int ?? 0,
            waterTarget: dict["waterTarget"] as? Int ?? 8
        )
    }
}
