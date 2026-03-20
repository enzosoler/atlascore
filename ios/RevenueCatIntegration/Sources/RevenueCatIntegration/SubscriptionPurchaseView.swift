import SwiftUI
import RevenueCat

/// Basic subscription screen (weekly / monthly / yearly).
///
/// Best practice: entitlement source of truth should come from `CustomerInfo`.
/// This view relies on `RevenueCatSubscriptionManager` updates via `customerInfoStream`.
public struct SubscriptionPurchaseView: View {
    @EnvironmentObject private var subManager: RevenueCatSubscriptionManager

    @State private var offering: Offering?
    @State private var isBusy = false
    @State private var errorMessage: String?

    public init() {}

    public var body: some View {
        VStack(spacing: 12) {
            if subManager.isLoading {
                ProgressView("Loading subscription…")
            } else if subManager.isPro {
                Text("Pro unlocked")
                    .font(.headline)
            } else {
                VStack(spacing: 10) {
                    Text("Choose a plan to unlock Pro")
                        .font(.headline)

                    if let offering {
                        VStack(spacing: 8) {
                            PlanButton(
                                title: "Weekly",
                                disabled: isBusy || offering.weekly == nil
                            ) {
                                await purchase(package: offering.weekly)
                            }

                            PlanButton(
                                title: "Monthly",
                                disabled: isBusy || offering.monthly == nil
                            ) {
                                await purchase(package: offering.monthly)
                            }

                            PlanButton(
                                title: "Yearly",
                                disabled: isBusy || offering.annual == nil
                            ) {
                                await purchase(package: offering.annual)
                            }
                        }

                        if offering.weekly == nil || offering.monthly == nil || offering.annual == nil {
                            Text("Some plan options are not available. Please verify the Offering configuration in RevenueCat.")
                                .font(.footnote)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                    } else {
                        Button {
                            Task { await loadOffering() }
                        } label: {
                            Text("Load plans")
                        }
                        .disabled(isBusy)
                    }

                    Button {
                        Task { await restorePurchases() }
                    } label: {
                        Text("Restore Purchases")
                    }
                    .disabled(isBusy)

                    if let errorMessage {
                        Text(errorMessage)
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                    }
                }
            }
        }
        .padding()
        .task {
            if offering == nil && !subManager.isPro {
                await loadOffering()
            }
        }
    }

    private func loadOffering() async {
        isBusy = true
        defer { isBusy = false }
        errorMessage = nil

        do {
            let offerings = try await Purchases.shared.offerings()
            offering = offerings.current
            if offering == nil {
                errorMessage = "No current offering found in RevenueCat. Mark an Offering as current in the dashboard."
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func purchase(package: Package?) async {
        guard let package else {
            errorMessage = "That plan is not available right now."
            return
        }

        isBusy = true
        defer { isBusy = false }
        errorMessage = nil

        do {
            _ = try await Purchases.shared.purchase(package: package)
        } catch let errorCode as RevenueCat.ErrorCode {
            errorMessage = friendlyErrorMessage(errorCode)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func restorePurchases() async {
        isBusy = true
        defer { isBusy = false }
        errorMessage = nil

        do {
            _ = try await Purchases.shared.restorePurchases()
        } catch let errorCode as RevenueCat.ErrorCode {
            errorMessage = friendlyErrorMessage(errorCode)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func friendlyErrorMessage(_ errorCode: RevenueCat.ErrorCode) -> String {
        // Best practice: treat cancellation as a normal user action.
        if errorCode == .purchaseCancelledError {
            return "Purchase cancelled."
        }

        // `ErrorCode` provides a localized-friendly description via its `description`.
        return errorCode.description
    }
}

private struct PlanButton: View {
    let title: String
    let disabled: Bool
    let action: () async -> Void

    var body: some View {
        Button(title) {
            Task { await action() }
        }
        .frame(maxWidth: .infinity)
        .buttonStyle(.borderedProminent)
        .disabled(disabled)
    }
}

