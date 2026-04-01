import Foundation
import Capacitor

/// Capacitor plugin that writes widget snapshot data to the App Group shared container.
/// The WidgetKit extension reads from this same container to render widgets.
@objc(WidgetDataBridge)
public class WidgetDataBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WidgetDataBridge"
    public let jsName = "WidgetDataBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "writeSnapshot", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readSnapshot", returnType: CAPPluginReturnPromise),
    ]

    private let groupID = "group.com.atlascore.app"

    private var sharedDefaults: UserDefaults? {
        UserDefaults(suiteName: groupID)
    }

    /// Write a JSON snapshot that the widget extension can read.
    @objc func writeSnapshot(_ call: CAPPluginCall) {
        guard let data = call.options as? [String: Any] else {
            call.reject("No data provided")
            return
        }

        guard let defaults = sharedDefaults else {
            call.reject("App Group not configured")
            return
        }

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
            defaults.set(jsonData, forKey: "widget_snapshot")
            defaults.set(Date().timeIntervalSince1970, forKey: "widget_snapshot_updated")
            defaults.synchronize()

            // Tell WidgetKit to reload timelines
            if #available(iOS 14.0, *) {
                DispatchQueue.main.async {
                    // We import WidgetKit dynamically to avoid build issues on older targets
                    if let widgetCenter = NSClassFromString("WidgetCenter") as? NSObject.Type,
                       let shared = widgetCenter.value(forKey: "shared") as? NSObject {
                        shared.perform(NSSelectorFromString("reloadAllTimelines"))
                    }
                }
            }

            call.resolve(["success": true])
        } catch {
            call.reject("Failed to serialize data: \(error.localizedDescription)")
        }
    }

    /// Read the current widget snapshot (for debugging / verification).
    @objc func readSnapshot(_ call: CAPPluginCall) {
        guard let defaults = sharedDefaults,
              let data = defaults.data(forKey: "widget_snapshot") else {
            call.resolve(["snapshot": NSNull()])
            return
        }

        do {
            let json = try JSONSerialization.jsonObject(with: data, options: [])
            call.resolve(["snapshot": json])
        } catch {
            call.reject("Failed to read snapshot: \(error.localizedDescription)")
        }
    }
}
