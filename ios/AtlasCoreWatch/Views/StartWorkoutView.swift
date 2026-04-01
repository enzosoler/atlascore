import SwiftUI

struct StartWorkoutView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @EnvironmentObject var appState: WatchAppState
    @Environment(\.dismiss) var dismiss

    private var workoutName: String {
        connectivity.todayData.workoutName ?? "Strength Training"
    }

    var body: some View {
        VStack(spacing: 16) {
            Spacer()

            Image(systemName: "dumbbell.fill")
                .font(.system(size: 36))
                .foregroundColor(.blue)

            Text(workoutName)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)

            Text("Start tracking your workout with heart rate monitoring.")
                .font(.system(size: 12))
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)

            Spacer()

            Button(action: {
                appState.startWorkout(name: workoutName)
            }) {
                Text("Start Workout")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .cornerRadius(12)
            }
            .buttonStyle(.plain)
        }
        .padding()
        .navigationTitle("Workout")
        .navigationBarTitleDisplayMode(.inline)
    }
}
