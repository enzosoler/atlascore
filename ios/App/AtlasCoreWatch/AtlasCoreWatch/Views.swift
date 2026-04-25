import SwiftUI

// MARK: - Brand

private enum AC {
    static let accent = Color(red: 232/255, green: 181/255, blue: 0)
    static let g2 = Color(white: 0.56)
    static let g4 = Color(white: 0.23)
    static let g5 = Color(white: 0.17)
    static let g6 = Color(white: 0.11)
}

// MARK: - Main List

struct MainListView: View {
    @EnvironmentObject var store: WatchDataStore

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 8) {
                    // Workout
                    NavigationLink(destination: WorkoutPreView()) {
                        ListRow(
                            icon: "figure.strengthtraining.traditional",
                            iconBg: AC.accent,
                            iconFg: .black,
                            title: store.todayData.workoutName,
                            subtitle: "Today · \(store.todayData.exerciseCount) ex"
                        )
                    }

                    // Log meal
                    NavigationLink(destination: QuickMealView()) {
                        ListRow(
                            icon: "fork.knife",
                            iconBg: AC.g5,
                            iconFg: .white,
                            title: "Log meal"
                        )
                    }

                    // Weigh-in
                    NavigationLink(destination: WeighInView()) {
                        ListRow(
                            icon: "scalemass",
                            iconBg: AC.g5,
                            iconFg: .white,
                            title: "Weigh-in"
                        )
                    }

                    // Water
                    ListRow(
                        icon: "drop.fill",
                        iconBg: AC.g5,
                        iconFg: .white,
                        title: "Water",
                        trailing: "\(store.todayData.waterCount) / \(store.todayData.waterTarget)"
                    )
                }
                .padding(.horizontal, 4)
            }
            .navigationTitle("atlas.core")
            .onAppear { store.requestData() }
        }
    }
}

struct ListRow: View {
    let icon: String
    var iconBg: Color = AC.g5
    var iconFg: Color = .white
    let title: String
    var subtitle: String? = nil
    var trailing: String? = nil

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .bold))
                .foregroundStyle(iconFg)
                .frame(width: 30, height: 30)
                .background(iconBg.opacity(0.8))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 15, weight: .bold))
                    .lineLimit(1)
                if let sub = subtitle {
                    Text(sub)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(AC.g2)
                }
            }

            Spacer()

            if let trailing = trailing {
                Text(trailing)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(iconBg == AC.accent ? AC.accent : AC.g5)
        .foregroundStyle(iconBg == AC.accent ? .black : .white)
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}

// MARK: - Workout Pre-Start

struct WorkoutPreView: View {
    @EnvironmentObject var store: WatchDataStore

    var body: some View {
        VStack(spacing: 8) {
            Text("WEEK \(store.todayData.exerciseCount > 0 ? "4 · DAY 12" : "")")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(AC.g2)
                .tracking(0.4)

            Text(store.todayData.workoutName)
                .font(.system(size: 28, weight: .heavy, design: .rounded))
                .tracking(-1)

            Text("\(store.todayData.exerciseCount) exercises · ~\(store.todayData.durationMin) min")
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(AC.g2)

            NavigationLink(destination: WorkoutLoggingView()) {
                HStack(spacing: 6) {
                    Image(systemName: "play.fill")
                        .font(.system(size: 13))
                    Text("Start")
                        .font(.system(size: 15, weight: .heavy, design: .rounded))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(AC.accent)
                .foregroundStyle(.black)
                .clipShape(Capsule())
            }
            .buttonStyle(.plain)

            Text(store.todayData.exerciseList)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(AC.g2)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(AC.g6)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(.horizontal)
    }
}

// MARK: - Workout Logging (set in progress)

struct WorkoutLoggingView: View {
    @State private var weight: Double = 82.5
    @State private var reps: Int = 8

    var body: some View {
        VStack(spacing: 4) {
            Text("BENCH PRESS")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(AC.g2)
                .tracking(0.4)

            Text("Set 3 of 4 · last 80×8")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(AC.g2)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(String(format: "%.1f", weight))
                    .font(.system(size: 48, weight: .heavy, design: .rounded))
                    .tracking(-2)
                Text("kg")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AC.g2)
            }
            .padding(.top, 4)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("× \(reps)")
                    .font(.system(size: 28, weight: .heavy, design: .rounded))
                    .foregroundStyle(AC.accent)
                    .tracking(-0.8)
                Text("reps")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(AC.g2)
            }

            HStack(spacing: 6) {
                Button { if reps > 1 { reps -= 1 } } label: {
                    Image(systemName: "minus")
                        .frame(maxWidth: .infinity, minHeight: 38)
                        .background(AC.g5)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                Button { /* log set */ } label: {
                    Image(systemName: "checkmark")
                        .font(.system(size: 18, weight: .bold))
                        .frame(maxWidth: .infinity, minHeight: 38)
                        .background(AC.accent)
                        .foregroundStyle(.black)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                Button { reps += 1 } label: {
                    Image(systemName: "plus")
                        .frame(maxWidth: .infinity, minHeight: 38)
                        .background(AC.g5)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
            }
            .padding(.top, 6)
        }
        .padding(.horizontal, 8)
        .focusable()
        .digitalCrownRotation($weight, from: 20, through: 300, by: 0.5, sensitivity: .medium)
    }
}

// MARK: - Quick Meal

struct QuickMealView: View {
    let suggestions = [
        ("Oatmeal + berries", 412),
        ("Chicken bowl", 612),
        ("Yogurt + nuts", 280),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 6) {
                ForEach(suggestions, id: \.0) { item in
                    HStack {
                        Text(item.0)
                            .font(.system(size: 14, weight: .semibold))
                        Spacer()
                        Text("\(item.1)")
                            .font(.system(size: 13, weight: .bold, design: .rounded))
                            .foregroundStyle(AC.accent)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(AC.g5)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                }

                HStack {
                    Text("Custom...")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AC.g2)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12))
                        .foregroundStyle(AC.g2)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(AC.g6)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Log meal")
    }
}

// MARK: - Weigh-In (Digital Crown)

struct WeighInView: View {
    @EnvironmentObject var store: WatchDataStore
    @State private var weight: Double = 82.4
    @State private var saved = false

    var body: some View {
        VStack(spacing: 8) {
            Text("BODY WEIGHT")
                .font(.system(size: 10, weight: .bold))
                .foregroundStyle(AC.g2)
                .tracking(0.4)

            HStack(alignment: .firstTextBaseline, spacing: 6) {
                Text(String(format: "%.1f", weight))
                    .font(.system(size: 52, weight: .heavy, design: .rounded))
                    .tracking(-2)
                Text("kg")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(AC.g2)
            }

            if store.todayData.weightChangeKg != 0 {
                let change = store.todayData.weightChangeKg
                Text("\(change > 0 ? "+" : "")\(String(format: "%.1f", change)) kg from last week")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(AC.g2)
            }

            if saved {
                Label("Saved", systemImage: "checkmark.circle.fill")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(AC.accent)
                    .padding(.top, 8)
            } else {
                Button {
                    store.sendWeightLogged(kg: weight)
                    saved = true
                } label: {
                    Text("Save")
                        .font(.system(size: 15, weight: .heavy, design: .rounded))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(AC.accent)
                        .foregroundStyle(.black)
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)
                .padding(.top, 8)
            }

            HStack(spacing: 6) {
                Image(systemName: "digitalcrown.horizontal.arrow.counterclockwise")
                    .font(.system(size: 12))
                Text("Turn crown · tap to save")
                    .font(.system(size: 10, weight: .semibold))
            }
            .foregroundStyle(AC.g2)
            .padding(.top, 4)
        }
        .focusable()
        .digitalCrownRotation($weight, from: 30, through: 250, by: 0.1, sensitivity: .medium)
        .onAppear { weight = store.todayData.latestWeightKg }
    }
}

// MARK: - Previews

#Preview("Main") {
    MainListView()
        .environmentObject(WatchDataStore())
}

#Preview("Workout") {
    WorkoutLoggingView()
}

#Preview("Weigh-In") {
    WeighInView()
        .environmentObject(WatchDataStore())
}
