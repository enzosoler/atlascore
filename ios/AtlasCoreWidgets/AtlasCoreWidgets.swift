import WidgetKit
import SwiftUI

// MARK: — Shared Data Model

struct WidgetSnapshot: Codable {
    struct Today: Codable {
        var caloriesRemaining: Int?
        var caloriesTarget: Int?
        var proteinCurrent: Int?
        var proteinTarget: Int?
        var carbsCurrent: Int?
        var carbsTarget: Int?
        var fatCurrent: Int?
        var fatTarget: Int?
        var workoutDone: Bool?
        var workoutName: String?
        var checkinDone: Bool?
    }

    struct Weight: Codable {
        var current: Double?
        var weekDelta: Double?
        var unit: String?
    }

    struct Streak: Codable {
        var count: Int?
        var todayDone: Bool?
    }

    var today: Today?
    var weight: Weight?
    var streak: Streak?
    var userName: String?
    var updatedAt: String?
}

// MARK: — Data Reader

struct WidgetDataReader {
    private static let groupID = "group.com.atlascore.app"

    static func readSnapshot() -> WidgetSnapshot {
        guard let defaults = UserDefaults(suiteName: groupID),
              let data = defaults.data(forKey: "widget_snapshot") else {
            return WidgetSnapshot()
        }
        do {
            return try JSONDecoder().decode(WidgetSnapshot.self, from: data)
        } catch {
            return WidgetSnapshot()
        }
    }
}

// MARK: — Timeline Entry

struct AtlasCoreEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetSnapshot
}

// MARK: — Timeline Provider

struct AtlasCoreProvider: TimelineProvider {
    func placeholder(in context: Context) -> AtlasCoreEntry {
        AtlasCoreEntry(date: Date(), snapshot: WidgetSnapshot(
            today: .init(caloriesRemaining: 1200, caloriesTarget: 2400, proteinCurrent: 80, proteinTarget: 160,
                         carbsCurrent: 120, carbsTarget: 250, fatCurrent: 30, fatTarget: 70,
                         workoutDone: false, workoutName: "Push Day", checkinDone: true),
            weight: .init(current: 78.5, weekDelta: -0.3, unit: "kg"),
            streak: .init(count: 7, todayDone: true),
            userName: "Enzo"
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (AtlasCoreEntry) -> Void) {
        let snapshot = WidgetDataReader.readSnapshot()
        completion(AtlasCoreEntry(date: Date(), snapshot: snapshot))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AtlasCoreEntry>) -> Void) {
        let snapshot = WidgetDataReader.readSnapshot()
        let entry = AtlasCoreEntry(date: Date(), snapshot: snapshot)
        // Refresh every 30 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: — Design Tokens

struct AtlasColors {
    static let brand = Color(red: 0.29, green: 0.42, blue: 0.97)   // electric blue
    static let bg = Color(red: 0.02, green: 0.03, blue: 0.04)       // true black
    static let card = Color(red: 0.05, green: 0.05, blue: 0.06)     // #0D0D10
    static let fg = Color.white
    static let fg2 = Color(red: 0.53, green: 0.53, blue: 0.60)      // #888898
    static let fg3 = Color(red: 0.35, green: 0.35, blue: 0.40)
    static let ok = Color(red: 0.30, green: 0.69, blue: 0.45)
    static let warn = Color(red: 0.96, green: 0.62, blue: 0.04)
    static let err = Color(red: 0.85, green: 0.30, blue: 0.30)
}

// MARK: — 1) Today Summary Widget

struct TodaySummaryView: View {
    let entry: AtlasCoreEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let t = entry.snapshot.today ?? WidgetSnapshot.Today()
        let calRemaining = t.caloriesRemaining ?? 0
        let calTarget = t.caloriesTarget ?? 2000
        let progress = calTarget > 0 ? Double(calTarget - calRemaining) / Double(calTarget) : 0

        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Text("atlas.core")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(AtlasColors.fg3)
                    .textCase(.uppercase)
                    .tracking(1)
                Spacer()
                if let streak = entry.snapshot.streak?.count, streak > 0 {
                    HStack(spacing: 2) {
                        Text("🔥")
                            .font(.system(size: 10))
                        Text("\(streak)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(AtlasColors.warn)
                    }
                }
            }

            Spacer()

            // Calorie KPI
            Text("\(calRemaining)")
                .font(.system(size: family == .systemSmall ? 32 : 40, weight: .bold, design: .rounded))
                .foregroundColor(AtlasColors.brand)
                .tracking(-1.5)

            Text("kcal remaining")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(AtlasColors.fg2)

            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(AtlasColors.fg3.opacity(0.2))
                        .frame(height: 6)
                    RoundedRectangle(cornerRadius: 3)
                        .fill(AtlasColors.brand)
                        .frame(width: geo.size.width * min(max(progress, 0), 1), height: 6)
                }
            }
            .frame(height: 6)

            if family != .systemSmall {
                // Macro pills
                HStack(spacing: 8) {
                    MacroPill(label: "P", current: t.proteinCurrent ?? 0, target: t.proteinTarget ?? 160, color: AtlasColors.brand)
                    MacroPill(label: "C", current: t.carbsCurrent ?? 0, target: t.carbsTarget ?? 250, color: AtlasColors.ok)
                    MacroPill(label: "F", current: t.fatCurrent ?? 0, target: t.fatTarget ?? 70, color: AtlasColors.warn)
                }
                .padding(.top, 2)
            }
        }
        .padding(14)
        .containerBackground(for: .widget) {
            AtlasColors.bg
        }
    }
}

struct MacroPill: View {
    let label: String
    let current: Int
    let target: Int
    let color: Color

    var body: some View {
        HStack(spacing: 3) {
            Text(label)
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(color)
            Text("\(current)/\(target)g")
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(AtlasColors.fg2)
        }
    }
}

// MARK: — 2) Weight Trend Widget

struct WeightTrendView: View {
    let entry: AtlasCoreEntry

    var body: some View {
        let w = entry.snapshot.weight ?? WidgetSnapshot.Weight()
        let delta = w.weekDelta ?? 0
        let unit = w.unit ?? "kg"

        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text("WEIGHT")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(AtlasColors.fg3)
                    .tracking(1)
                Spacer()
            }

            Spacer()

            Text(String(format: "%.1f", w.current ?? 0))
                .font(.system(size: 36, weight: .bold, design: .rounded))
                .foregroundColor(AtlasColors.fg)
                .tracking(-1.5)

            Text(unit)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AtlasColors.fg2)

            Spacer()

            // Delta badge
            HStack(spacing: 4) {
                Image(systemName: delta < 0 ? "arrow.down.right" : delta > 0 ? "arrow.up.right" : "minus")
                    .font(.system(size: 10, weight: .bold))
                Text(String(format: "%+.1f %@ this week", delta, unit))
                    .font(.system(size: 11, weight: .medium))
            }
            .foregroundColor(delta < 0 ? AtlasColors.ok : delta > 0 ? AtlasColors.warn : AtlasColors.fg2)
        }
        .padding(14)
        .containerBackground(for: .widget) {
            AtlasColors.bg
        }
    }
}

// MARK: — 3) Quick Actions Widget

struct QuickActionsView: View {
    let entry: AtlasCoreEntry

    var body: some View {
        let t = entry.snapshot.today ?? WidgetSnapshot.Today()

        VStack(alignment: .leading, spacing: 8) {
            Text("QUICK ACTIONS")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(AtlasColors.fg3)
                .tracking(1)

            Spacer()

            // Workout status
            Link(destination: URL(string: "atlascore://workouts")!) {
                HStack(spacing: 8) {
                    Image(systemName: t.workoutDone == true ? "checkmark.circle.fill" : "dumbbell.fill")
                        .font(.system(size: 14))
                        .foregroundColor(t.workoutDone == true ? AtlasColors.ok : AtlasColors.brand)
                    Text(t.workoutDone == true ? "Workout done" : (t.workoutName ?? "Start workout"))
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(AtlasColors.fg)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 10))
                        .foregroundColor(AtlasColors.fg3)
                }
                .padding(10)
                .background(AtlasColors.card)
                .cornerRadius(12)
            }

            // Log meal
            Link(destination: URL(string: "atlascore://nutrition")!) {
                HStack(spacing: 8) {
                    Image(systemName: "fork.knife")
                        .font(.system(size: 14))
                        .foregroundColor(AtlasColors.brand)
                    Text("Log meal")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(AtlasColors.fg)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 10))
                        .foregroundColor(AtlasColors.fg3)
                }
                .padding(10)
                .background(AtlasColors.card)
                .cornerRadius(12)
            }

            // Check-in
            Link(destination: URL(string: "atlascore://checkin")!) {
                HStack(spacing: 8) {
                    Image(systemName: t.checkinDone == true ? "checkmark.circle.fill" : "heart.text.square")
                        .font(.system(size: 14))
                        .foregroundColor(t.checkinDone == true ? AtlasColors.ok : AtlasColors.brand)
                    Text(t.checkinDone == true ? "Check-in done" : "Daily check-in")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(AtlasColors.fg)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .font(.system(size: 10))
                        .foregroundColor(AtlasColors.fg3)
                }
                .padding(10)
                .background(AtlasColors.card)
                .cornerRadius(12)
            }
        }
        .padding(14)
        .containerBackground(for: .widget) {
            AtlasColors.bg
        }
    }
}

// MARK: — 4) Streak Widget (small only)

struct StreakWidgetView: View {
    let entry: AtlasCoreEntry

    var body: some View {
        let s = entry.snapshot.streak ?? WidgetSnapshot.Streak()
        let count = s.count ?? 0

        VStack(spacing: 4) {
            Spacer()
            Text("🔥")
                .font(.system(size: 32))
            Text("\(count)")
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(count > 0 ? AtlasColors.warn : AtlasColors.fg3)
                .tracking(-2)
            Text(count == 1 ? "day streak" : "day streak")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(AtlasColors.fg2)
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .containerBackground(for: .widget) {
            AtlasColors.bg
        }
    }
}

// MARK: — Widget Definitions

struct TodaySummaryWidget: Widget {
    let kind: String = "TodaySummary"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasCoreProvider()) { entry in
            TodaySummaryView(entry: entry)
        }
        .configurationDisplayName("Today Summary")
        .description("Calories remaining, macros, and streak at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct WeightTrendWidget: Widget {
    let kind: String = "WeightTrend"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasCoreProvider()) { entry in
            WeightTrendView(entry: entry)
        }
        .configurationDisplayName("Weight Trend")
        .description("Current weight and weekly change.")
        .supportedFamilies([.systemSmall])
    }
}

struct QuickActionsWidget: Widget {
    let kind: String = "QuickActions"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasCoreProvider()) { entry in
            QuickActionsView(entry: entry)
        }
        .configurationDisplayName("Quick Actions")
        .description("Start workouts, log meals, and check in quickly.")
        .supportedFamilies([.systemMedium])
    }
}

struct StreakWidget: Widget {
    let kind: String = "Streak"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasCoreProvider()) { entry in
            StreakWidgetView(entry: entry)
        }
        .configurationDisplayName("Streak")
        .description("Your daily check-in streak.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: — Widget Bundle

@main
struct AtlasCoreWidgetBundle: WidgetBundle {
    var body: some Widget {
        TodaySummaryWidget()
        WeightTrendWidget()
        QuickActionsWidget()
        StreakWidget()
    }
}

// MARK: — Previews

#if DEBUG
struct TodaySummaryWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = AtlasCoreEntry(date: Date(), snapshot: WidgetSnapshot(
            today: .init(caloriesRemaining: 1247, caloriesTarget: 2400, proteinCurrent: 82, proteinTarget: 160,
                         carbsCurrent: 145, carbsTarget: 250, fatCurrent: 28, fatTarget: 70,
                         workoutDone: false, workoutName: "Push Day A", checkinDone: true),
            weight: .init(current: 78.5, weekDelta: -0.3, unit: "kg"),
            streak: .init(count: 5, todayDone: true),
            userName: "Enzo"
        ))

        Group {
            TodaySummaryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
            TodaySummaryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
            WeightTrendView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
            QuickActionsView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
            StreakWidgetView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
        }
    }
}
#endif
