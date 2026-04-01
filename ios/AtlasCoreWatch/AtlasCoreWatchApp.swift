import SwiftUI
import WatchConnectivity

@main
struct AtlasCoreWatchApp: App {
    @StateObject private var connectivity = WatchConnectivityManager.shared
    @StateObject private var appState = WatchAppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(connectivity)
                .environmentObject(appState)
                .onAppear {
                    connectivity.activate()
                }
        }
    }
}
