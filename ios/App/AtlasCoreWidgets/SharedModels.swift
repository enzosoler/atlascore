import Foundation

/// Shared data model read from the App Group container.
/// The main Capacitor app writes this via WidgetDataBridge.
struct AtlasSnapshot: Codable {
    // Today
    var workoutName: String?
    var workoutExerciseCount: Int?
    var workoutDurationMin: Int?
    var workoutExerciseList: String?
    var weekNumber: Int?
    var dayNumber: Int?

    // Nutrition
    var caloriesConsumed: Int?
    var caloriesTarget: Int?
    var proteinConsumed: Int?
    var proteinTarget: Int?
    var carbsConsumed: Int?
    var carbsTarget: Int?
    var fatConsumed: Int?
    var fatTarget: Int?

    // Body
    var latestWeightKg: Double?
    var weightChangeKg: Double?

    // Checklist
    var weighInDone: Bool?
    var breakfastDone: Bool?
    var workoutDone: Bool?
    var lunchDinnerDone: Bool?

    // Meta
    var updatedAt: String?

    // Computed
    var calorieProgress: Double {
        guard let consumed = caloriesConsumed, let target = caloriesTarget, target > 0 else { return 0 }
        return Double(consumed) / Double(target)
    }

    var displayDate: String {
        let f = DateFormatter()
        f.dateFormat = "EEE · MMM d"
        return f.string(from: Date())
    }

    static let placeholder = AtlasSnapshot(
        workoutName: "Push A",
        workoutExerciseCount: 5,
        workoutDurationMin: 48,
        workoutExerciseList: "Bench · OHP · Incline · Dips · Lateral",
        weekNumber: 4,
        dayNumber: 12,
        caloriesConsumed: 1248,
        caloriesTarget: 2950,
        proteinConsumed: 92,
        proteinTarget: 180,
        carbsConsumed: 142,
        carbsTarget: 320,
        fatConsumed: 38,
        fatTarget: 75,
        latestWeightKg: 82.4,
        weightChangeKg: -0.3,
        weighInDone: true,
        breakfastDone: true,
        workoutDone: false,
        lunchDinnerDone: false
    )

    static func load() -> AtlasSnapshot {
        guard let defaults = UserDefaults(suiteName: "group.com.atlascore.app"),
              let data = defaults.data(forKey: "widget_snapshot"),
              let snapshot = try? JSONDecoder().decode(AtlasSnapshot.self, from: data)
        else {
            return .placeholder
        }
        return snapshot
    }
}
