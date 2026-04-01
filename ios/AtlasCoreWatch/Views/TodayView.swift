import SwiftUI

struct TodayView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @EnvironmentObject var appState: WatchAppState

    private var data: WatchTodayData { connectivity.todayData }
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = data.userName.isEmpty ? "" : ", \(data.userName)"
        if hour < 12 { return "Morning\(name)" }
        if hour < 17 { return "Afternoon\(name)" }
        return "Evening\(name)"
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                // Greeting + streak
                HStack {
                    Text(greeting)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.white)
                    Spacer()
                    if data.streakCount > 0 {
                        HStack(spacing: 2) {
                            Text("🔥")
                                .font(.system(size: 12))
                            Text("\(data.streakCount)")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundColor(.orange)
                        }
                    }
                }

                // Calorie ring
                CalorieRingView(
                    remaining: data.caloriesRemaining,
                    target: data.caloriesTarget
                )

                // Macro bars
                VStack(spacing: 6) {
                    MacroBar(label: "Protein", current: data.proteinCurrent, target: data.proteinTarget, color: .blue)
                    MacroBar(label: "Carbs", current: data.carbsCurrent, target: data.carbsTarget, color: .green)
                    MacroBar(label: "Fat", current: data.fatCurrent, target: data.fatTarget, color: .orange)
                }

                // Quick actions
                VStack(spacing: 8) {
                    if !data.workoutDone {
                        NavigationLink(destination: StartWorkoutView()) {
                            ActionRow(
                                icon: "dumbbell.fill",
                                label: data.workoutName ?? "Start Workout",
                                color: .blue
                            )
                        }
                        .buttonStyle(.plain)
                    } else {
                        ActionRow(icon: "checkmark.circle.fill", label: "Workout done", color: .green)
                    }

                    NavigationLink(destination: QuickWeighInView()) {
                        ActionRow(icon: "scalemass.fill", label: "Log Weight", color: .cyan)
                    }
                    .buttonStyle(.plain)

                    if data.currentWeight != nil {
                        HStack {
                            Text("Weight")
                                .font(.system(size: 11))
                                .foregroundColor(.gray)
                            Spacer()
                            Text(String(format: "%.1f %@", data.currentWeight!, data.weightUnit))
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 4)
                    }
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("atlas.core")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            appState.requestHealthKitAuth()
            connectivity.requestDataFromPhone()
        }
    }
}

// MARK: — Subviews

struct CalorieRingView: View {
    let remaining: Int
    let target: Int

    private var progress: Double {
        guard target > 0 else { return 0 }
        return Double(target - remaining) / Double(target)
    }

    var body: some View {
        VStack(spacing: 4) {
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: CGFloat(min(max(progress, 0), 1)))
                    .stroke(Color.blue, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 0) {
                    Text("\(remaining)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("kcal left")
                        .font(.system(size: 9))
                        .foregroundColor(.gray)
                }
            }
            .frame(width: 100, height: 100)
        }
        .frame(maxWidth: .infinity)
    }
}

struct MacroBar: View {
    let label: String
    let current: Int
    let target: Int
    let color: Color

    private var progress: Double {
        guard target > 0 else { return 0 }
        return Double(current) / Double(target)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Text(label)
                    .font(.system(size: 10))
                    .foregroundColor(.gray)
                Spacer()
                Text("\(current)/\(target)g")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.white)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.gray.opacity(0.2))
                    RoundedRectangle(cornerRadius: 2)
                        .fill(color)
                        .frame(width: geo.size.width * min(max(CGFloat(progress), 0), 1))
                }
            }
            .frame(height: 4)
        }
    }
}

struct ActionRow: View {
    let icon: String
    let label: String
    let color: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 14))
                .foregroundColor(color)
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 10))
                .foregroundColor(.gray)
        }
        .padding(10)
        .background(Color.white.opacity(0.06))
        .cornerRadius(10)
    }
}
