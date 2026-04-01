import SwiftUI

struct ActiveWorkoutView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @EnvironmentObject var appState: WatchAppState
    @State private var elapsedSeconds: Int = 0
    @State private var showFinishConfirm = false

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var workout: WatchAppState.ActiveWorkout? { appState.activeWorkout }

    private var elapsedFormatted: String {
        let m = elapsedSeconds / 60
        let s = elapsedSeconds % 60
        return String(format: "%d:%02d", m, s)
    }

    var body: some View {
        VStack(spacing: 10) {
            // Timer
            Text(elapsedFormatted)
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(.white)
                .monospacedDigit()

            Text(workout?.name ?? "Workout")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.gray)

            // Stats
            HStack(spacing: 20) {
                VStack(spacing: 2) {
                    Text("\(workout?.setsCompleted ?? 0)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.blue)
                    Text("sets")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
                VStack(spacing: 2) {
                    Text("\(workout?.activeCalories ?? 0)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.green)
                    Text("kcal")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
                VStack(spacing: 2) {
                    Text("\(workout?.heartRate ?? 0)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.red)
                    Text("bpm")
                        .font(.system(size: 10))
                        .foregroundColor(.gray)
                }
            }
            .padding(.vertical, 8)

            // Log set button
            Button(action: {
                appState.logSet()
                WKInterfaceDevice.current().play(.click)
            }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                    Text("Log Set")
                }
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
                .background(Color.blue)
                .cornerRadius(10)
            }
            .buttonStyle(.plain)

            // Finish button
            Button(action: {
                showFinishConfirm = true
            }) {
                Text("Finish")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.red)
            }
            .buttonStyle(.plain)
        }
        .padding()
        .onReceive(timer) { _ in
            if appState.isWorkoutActive {
                elapsedSeconds += 1
            }
        }
        .alert("Finish Workout?", isPresented: $showFinishConfirm) {
            Button("Finish", role: .destructive) {
                appState.endWorkout { duration, calories in
                    connectivity.sendWorkoutCompleted(durationMinutes: duration, caloriesBurned: calories)
                    WKInterfaceDevice.current().play(.success)
                }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("\(workout?.setsCompleted ?? 0) sets completed in \(elapsedFormatted)")
        }
    }
}
