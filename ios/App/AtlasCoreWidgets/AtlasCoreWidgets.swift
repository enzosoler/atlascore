import WidgetKit
import SwiftUI

// MARK: - Timeline Provider

struct AtlasTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> AtlasEntry {
        AtlasEntry(date: Date(), snapshot: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (AtlasEntry) -> Void) {
        completion(AtlasEntry(date: Date(), snapshot: AtlasSnapshot.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AtlasEntry>) -> Void) {
        let snapshot = AtlasSnapshot.load()
        let entry = AtlasEntry(date: Date(), snapshot: snapshot)
        // Refresh every 15 minutes
        let next = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

struct AtlasEntry: TimelineEntry {
    let date: Date
    let snapshot: AtlasSnapshot
}

// MARK: - Brand tokens

private enum AC {
    static let ink = Color(red: 10/255, green: 10/255, blue: 10/255)
    static let paper = Color(red: 239/255, green: 233/255, blue: 218/255)
    static let accent = Color(red: 232/255, green: 181/255, blue: 0)
}

// MARK: - Ring

struct RingView: View {
    let progress: Double
    let size: CGFloat
    let stroke: CGFloat
    var color: Color = AC.accent

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.15), lineWidth: stroke)
            Circle()
                .trim(from: 0, to: min(progress, 1))
                .stroke(color, style: StrokeStyle(lineWidth: stroke, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .frame(width: size, height: size)
    }
}

// MARK: - Today Widget (Small)

struct TodaySmallView: View {
    let s: AtlasSnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("today")
                    .font(.system(size: 11, weight: .semibold))
                    .textCase(.uppercase)
                    .tracking(0.4)
                    .foregroundStyle(.secondary)
                Spacer()
                Image(systemName: "bolt.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(AC.accent)
            }

            Spacer()

            Text(s.workoutName ?? "Rest day")
                .font(.system(size: 28, weight: .heavy, design: .rounded))
                .tracking(-0.8)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            if let count = s.workoutExerciseCount, let dur = s.workoutDurationMin {
                Text("\(count) exercises · \(dur) min")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.secondary)
                    .padding(.top, 2)
            }

            Spacer()

            HStack(spacing: 8) {
                RingView(progress: s.calorieProgress, size: 28, stroke: 4)
                VStack(alignment: .leading, spacing: 1) {
                    Text("\(s.caloriesConsumed ?? 0) kcal")
                        .font(.system(size: 12, weight: .semibold))
                    Text("of \(s.caloriesTarget ?? 0)")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(16)
    }
}

// MARK: - Today Widget (Medium)

struct TodayMediumView: View {
    let s: AtlasSnapshot

    var body: some View {
        HStack(spacing: 0) {
            // Left: workout
            VStack(alignment: .leading, spacing: 0) {
                HStack {
                    Text("today")
                        .font(.system(size: 11, weight: .semibold))
                        .textCase(.uppercase)
                        .tracking(0.4)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text(s.displayDate)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text(s.workoutName ?? "Rest day")
                    .font(.system(size: 24, weight: .heavy, design: .rounded))
                    .tracking(-0.6)

                if let list = s.workoutExerciseList {
                    Text(list)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                        .padding(.top, 2)
                }

                Spacer()

                HStack(spacing: 6) {
                    Image(systemName: "clock")
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                    if let count = s.workoutExerciseCount, let dur = s.workoutDurationMin {
                        Text("\(count) ex · \(dur) min")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity)

            Divider()

            // Right: nutrition
            VStack(alignment: .leading, spacing: 0) {
                Text("fuel")
                    .font(.system(size: 11, weight: .semibold))
                    .textCase(.uppercase)
                    .tracking(0.4)
                    .foregroundStyle(.secondary)

                Spacer()

                HStack(spacing: 12) {
                    RingView(progress: s.calorieProgress, size: 52, stroke: 6)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("\(s.caloriesConsumed ?? 0)")
                            .font(.system(size: 22, weight: .heavy, design: .rounded))
                            .tracking(-0.4)
                        Text("of \(s.caloriesTarget ?? 0) kcal")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                HStack(spacing: 12) {
                    macroLabel("P", value: s.proteinConsumed ?? 0)
                    macroLabel("C", value: s.carbsConsumed ?? 0)
                    macroLabel("F", value: s.fatConsumed ?? 0)
                }
                .font(.system(size: 11, weight: .semibold))
            }
            .padding(16)
            .frame(maxWidth: .infinity)
        }
    }

    private func macroLabel(_ letter: String, value: Int) -> some View {
        HStack(spacing: 2) {
            Text(letter).foregroundStyle(.secondary)
            Text("\(value)g")
        }
    }
}

// MARK: - Macros Widget (Small)

struct MacrosSmallView: View {
    let s: AtlasSnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("fuel")
                    .font(.system(size: 11, weight: .bold))
                    .textCase(.uppercase)
                    .tracking(0.4)
                    .foregroundStyle(.secondary)
                Spacer()
                Image(systemName: "fork.knife")
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            HStack(spacing: 10) {
                RingView(progress: s.calorieProgress, size: 58, stroke: 7)
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(s.caloriesConsumed ?? 0)")
                        .font(.system(size: 22, weight: .heavy, design: .rounded))
                        .tracking(-0.4)
                    Text("of \(s.caloriesTarget ?? 0)")
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            HStack {
                macroLabel("P", value: s.proteinConsumed ?? 0)
                Spacer()
                macroLabel("C", value: s.carbsConsumed ?? 0)
                Spacer()
                macroLabel("F", value: s.fatConsumed ?? 0)
            }
            .font(.system(size: 10, weight: .bold))
        }
        .padding(16)
    }

    private func macroLabel(_ letter: String, value: Int) -> some View {
        HStack(spacing: 2) {
            Text(letter).foregroundStyle(.secondary)
            Text("\(value)")
        }
    }
}

// MARK: - Next Workout Widget (Small)

struct NextWorkoutSmallView: View {
    let s: AtlasSnapshot

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Image(systemName: "figure.strengthtraining.traditional")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(AC.accent)
                Spacer()
                Text("next")
                    .font(.system(size: 11, weight: .bold))
                    .textCase(.uppercase)
                    .tracking(0.4)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            if let week = s.weekNumber, let day = s.dayNumber {
                Text("Week \(week) · Day \(day)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)
            }

            Text(s.workoutName ?? "Rest")
                .font(.system(size: 30, weight: .heavy, design: .rounded))
                .tracking(-0.8)
                .lineLimit(1)
                .minimumScaleFactor(0.6)
                .padding(.top, 2)

            if let count = s.workoutExerciseCount, let dur = s.workoutDurationMin {
                Text("\(count) ex · \(dur) min")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.secondary)
                    .padding(.top, 2)
            }
        }
        .padding(16)
    }
}

// MARK: - Widget Configurations

struct AtlasTodayWidget: Widget {
    let kind: String = "AtlasTodayWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                AtlasTodayWidgetView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                AtlasTodayWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("atlas.core today")
        .description("Today's workout, fuel status, and progress at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct AtlasTodayWidgetView: View {
    @Environment(\.widgetFamily) var family
    let entry: AtlasEntry

    var body: some View {
        switch family {
        case .systemMedium:
            TodayMediumView(s: entry.snapshot)
        default:
            TodaySmallView(s: entry.snapshot)
        }
    }
}

struct AtlasMacrosWidget: Widget {
    let kind: String = "AtlasMacrosWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                MacrosSmallView(s: entry.snapshot)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                MacrosSmallView(s: entry.snapshot)
            }
        }
        .configurationDisplayName("atlas.core macros")
        .description("Calories and macros progress ring.")
        .supportedFamilies([.systemSmall])
    }
}

struct AtlasNextWorkoutWidget: Widget {
    let kind: String = "AtlasNextWorkoutWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AtlasTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                NextWorkoutSmallView(s: entry.snapshot)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                NextWorkoutSmallView(s: entry.snapshot)
            }
        }
        .configurationDisplayName("atlas.core next workout")
        .description("Your next scheduled workout.")
        .supportedFamilies([.systemSmall])
    }
}

// MARK: - Widget Bundle

@main
struct AtlasCoreWidgetBundle: WidgetBundle {
    var body: some Widget {
        AtlasTodayWidget()
        AtlasMacrosWidget()
        AtlasNextWorkoutWidget()
    }
}
