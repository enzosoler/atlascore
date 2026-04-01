import Foundation
import WatchConnectivity
import Combine

/// Manages bidirectional communication between the Watch app and the iPhone app.
/// Receives data snapshots from the phone and sends actions (workout logged, weight logged) back.
class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    @Published var todayData: WatchTodayData = WatchTodayData()
    @Published var isReachable: Bool = false

    private var session: WCSession?

    override init() {
        super.init()
    }

    func activate() {
        guard WCSession.isSupported() else { return }
        session = WCSession.default
        session?.delegate = self
        session?.activate()
    }

    // MARK: — Receive data from iPhone

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
        // Request fresh data on activation
        requestDataFromPhone()
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            self.updateFromContext(applicationContext)
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            self.updateFromContext(message)
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }

    private func updateFromContext(_ ctx: [String: Any]) {
        if let data = ctx["todayData"] as? [String: Any] {
            todayData = WatchTodayData(
                userName: data["userName"] as? String ?? "",
                caloriesRemaining: data["caloriesRemaining"] as? Int ?? 0,
                caloriesTarget: data["caloriesTarget"] as? Int ?? 0,
                proteinCurrent: data["proteinCurrent"] as? Int ?? 0,
                proteinTarget: data["proteinTarget"] as? Int ?? 0,
                carbsCurrent: data["carbsCurrent"] as? Int ?? 0,
                carbsTarget: data["carbsTarget"] as? Int ?? 0,
                fatCurrent: data["fatCurrent"] as? Int ?? 0,
                fatTarget: data["fatTarget"] as? Int ?? 0,
                streakCount: data["streakCount"] as? Int ?? 0,
                workoutDone: data["workoutDone"] as? Bool ?? false,
                workoutName: data["workoutName"] as? String,
                checkinDone: data["checkinDone"] as? Bool ?? false,
                currentWeight: data["currentWeight"] as? Double,
                weightUnit: data["weightUnit"] as? String ?? "kg"
            )
        }
    }

    // MARK: — Send actions to iPhone

    func requestDataFromPhone() {
        session?.sendMessage(["action": "requestData"], replyHandler: { reply in
            DispatchQueue.main.async {
                self.updateFromContext(reply)
            }
        }, errorHandler: { error in
            print("[Watch] requestData failed: \(error.localizedDescription)")
        })
    }

    func sendWorkoutCompleted(durationMinutes: Int, caloriesBurned: Int) {
        let message: [String: Any] = [
            "action": "workoutCompleted",
            "durationMinutes": durationMinutes,
            "caloriesBurned": caloriesBurned,
            "completedAt": ISO8601DateFormatter().string(from: Date())
        ]
        session?.sendMessage(message, replyHandler: nil, errorHandler: { error in
            print("[Watch] sendWorkoutCompleted failed: \(error.localizedDescription)")
        })
    }

    func sendWeightLogged(kg: Double) {
        let message: [String: Any] = [
            "action": "weightLogged",
            "weightKg": kg,
            "loggedAt": ISO8601DateFormatter().string(from: Date())
        ]
        session?.sendMessage(message, replyHandler: nil, errorHandler: { error in
            print("[Watch] sendWeightLogged failed: \(error.localizedDescription)")
        })
    }

    func sendCheckinCompleted(energy: Int, mood: Int, sleep: Int) {
        let message: [String: Any] = [
            "action": "checkinCompleted",
            "energy": energy,
            "mood": mood,
            "sleep": sleep,
            "completedAt": ISO8601DateFormatter().string(from: Date())
        ]
        session?.sendMessage(message, replyHandler: nil, errorHandler: { error in
            print("[Watch] sendCheckinCompleted failed: \(error.localizedDescription)")
        })
    }
}

// MARK: — Data Model

struct WatchTodayData {
    var userName: String = ""
    var caloriesRemaining: Int = 0
    var caloriesTarget: Int = 0
    var proteinCurrent: Int = 0
    var proteinTarget: Int = 0
    var carbsCurrent: Int = 0
    var carbsTarget: Int = 0
    var fatCurrent: Int = 0
    var fatTarget: Int = 0
    var streakCount: Int = 0
    var workoutDone: Bool = false
    var workoutName: String? = nil
    var checkinDone: Bool = false
    var currentWeight: Double? = nil
    var weightUnit: String = "kg"
}
