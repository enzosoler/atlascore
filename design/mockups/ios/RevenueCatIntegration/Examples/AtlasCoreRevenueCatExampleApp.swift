import SwiftUI
import RevenueCatIntegration

/// Example host app wiring for atlas.core iOS.
///
/// This file is for reference only; it is not built as part of the Swift Package.
/// Copy the patterns into your actual `@main` App target.
@main
struct AtlasCoreRevenueCatExampleApp: App {
    @StateObject private var subManager = RevenueCatSubscriptionManager()

    init() {
        // For this example, you must set `REVENUECAT_API_KEY` in your host app Info.plist.
        RevenueCatIntegration.configureFromHostAppInfoPlist()
        subManager.start()
    }

    var body: some Scene {
        WindowGroup {
            PaywallGateView {
                Text("Welcome, Pro!")
                    .font(.title2)
            }
            .environmentObject(subManager)
        }
    }
}

