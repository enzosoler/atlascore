import SwiftUI

struct ContentView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @EnvironmentObject var appState: WatchAppState

    var body: some View {
        if appState.isWorkoutActive {
            ActiveWorkoutView()
        } else {
            NavigationStack {
                TodayView()
            }
        }
    }
}
