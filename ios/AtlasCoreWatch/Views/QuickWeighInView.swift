import SwiftUI
import HealthKit

struct QuickWeighInView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    @Environment(\.dismiss) var dismiss

    @State private var weight: Double = 75.0
    @State private var isSaving = false
    @State private var saved = false

    private var unit: String { connectivity.todayData.weightUnit }

    var body: some View {
        VStack(spacing: 12) {
            Text("Log Weight")
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.gray)

            // Weight display
            Text(String(format: "%.1f", weight))
                .font(.system(size: 40, weight: .bold, design: .rounded))
                .foregroundColor(.white)

            Text(unit)
                .font(.system(size: 14))
                .foregroundColor(.gray)

            // Crown-adjustable (using stepper as fallback)
            HStack(spacing: 16) {
                Button(action: { weight = max(30, weight - 0.1) }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.gray)
                }
                .buttonStyle(.plain)

                Button(action: { weight += 0.1 }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.gray)
                }
                .buttonStyle(.plain)
            }

            Spacer()

            if saved {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Saved")
                        .foregroundColor(.green)
                }
                .font(.system(size: 14, weight: .semibold))
            } else {
                Button(action: saveWeight) {
                    HStack {
                        if isSaving {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Image(systemName: "checkmark")
                        }
                        Text("Save")
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(Color.cyan)
                    .cornerRadius(10)
                }
                .buttonStyle(.plain)
                .disabled(isSaving)
            }
        }
        .padding()
        .onAppear {
            if let current = connectivity.todayData.currentWeight {
                weight = current
            }
        }
        .focusable()
        .digitalCrownRotation($weight, from: 30.0, through: 250.0, by: 0.1, sensitivity: .medium)
    }

    private func saveWeight() {
        isSaving = true

        // Save to HealthKit
        let healthStore = HKHealthStore()
        let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass)!
        let quantity = HKQuantity(unit: .gramUnit(with: .kilo), doubleValue: weight)
        let sample = HKQuantitySample(type: weightType, quantity: quantity, start: Date(), end: Date())

        healthStore.save(sample) { success, error in
            DispatchQueue.main.async {
                // Also send to iPhone app
                connectivity.sendWeightLogged(kg: weight)
                WKInterfaceDevice.current().play(.success)
                isSaving = false
                saved = true

                // Dismiss after a short delay
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    dismiss()
                }
            }
        }
    }
}
