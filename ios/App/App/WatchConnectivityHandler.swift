import Foundation
import WatchConnectivity
import Capacitor

/// Handles Watch Connectivity on the iPhone side.
/// Receives actions from the Watch (workout completed, weight logged)
/// and forwards them to the Capacitor WebView as custom events.
/// Also sends data snapshots to the Watch when requested.
class WatchConnectivityHandler: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivityHandler()

    private weak var bridge: CAPBridgeProtocol?

    func configure(bridge: CAPBridgeProtocol?) {
        self.bridge = bridge
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    // MARK: — WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        print("[WatchConnectivity] Activated: \(activationState.rawValue)")
    }

    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }

    // Handle messages from the Watch
    func session(_ session: WCSession, didReceiveMessage message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void) {
        guard let action = message["action"] as? String else {
            replyHandler([:])
            return
        }

        switch action {
        case "requestData":
            // Send the current widget snapshot as reply
            if let defaults = UserDefaults(suiteName: "group.com.atlascore.app"),
               let data = defaults.data(forKey: "widget_snapshot"),
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                replyHandler(["todayData": json])
            } else {
                replyHandler([:])
            }

        case "workoutCompleted":
            // Forward to JS
            let eventData: [String: Any] = [
                "durationMinutes": message["durationMinutes"] ?? 0,
                "caloriesBurned": message["caloriesBurned"] ?? 0,
                "completedAt": message["completedAt"] ?? ""
            ]
            notifyJS(event: "watchWorkoutCompleted", data: eventData)
            replyHandler(["success": true])

        case "weightLogged":
            let eventData: [String: Any] = [
                "weightKg": message["weightKg"] ?? 0,
                "loggedAt": message["loggedAt"] ?? ""
            ]
            notifyJS(event: "watchWeightLogged", data: eventData)
            replyHandler(["success": true])

        case "checkinCompleted":
            let eventData: [String: Any] = [
                "energy": message["energy"] ?? 3,
                "mood": message["mood"] ?? 3,
                "sleep": message["sleep"] ?? 3,
                "completedAt": message["completedAt"] ?? ""
            ]
            notifyJS(event: "watchCheckinCompleted", data: eventData)
            replyHandler(["success": true])

        default:
            replyHandler([:])
        }
    }

    // Handle messages without reply
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        guard let action = message["action"] as? String else { return }

        switch action {
        case "workoutCompleted":
            notifyJS(event: "watchWorkoutCompleted", data: message)
        case "weightLogged":
            notifyJS(event: "watchWeightLogged", data: message)
        case "checkinCompleted":
            notifyJS(event: "watchCheckinCompleted", data: message)
        default:
            break
        }
    }

    // MARK: — Send data to Watch

    func sendDataToWatch(_ data: [String: Any]) {
        guard WCSession.default.isPaired, WCSession.default.isWatchAppInstalled else { return }

        do {
            try WCSession.default.updateApplicationContext(["todayData": data])
        } catch {
            print("[WatchConnectivity] Failed to update context: \(error.localizedDescription)")
        }
    }

    // MARK: — Helpers

    private func notifyJS(event: String, data: [String: Any]) {
        DispatchQueue.main.async { [weak self] in
            self?.bridge?.webView?.evaluateJavaScript(
                "window.dispatchEvent(new CustomEvent('\(event)', { detail: \(self?.jsonString(data) ?? "{}") }))"
            )
        }
    }

    private func jsonString(_ dict: [String: Any]) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: dict),
              let str = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return str
    }
}
