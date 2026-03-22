import SwiftUI
import RevenueCatUI
import RevenueCat

/// Wraps premium content gating behind a RevenueCat paywall.
///
/// This implementation uses a SwiftUI `sheet` that automatically dismisses when
/// the `pro` entitlement becomes active (via `customerInfoStream`).
public struct PaywallGateView<ProContent: View>: View {
    @EnvironmentObject private var subManager: RevenueCatSubscriptionManager

    private let proContent: ProContent
    private let paywallOfferingIdentifier: String?

    @State private var showPaywall = false
    @State private var paywallOffering: Offering?

    /// - Parameters:
    ///   - paywallOfferingIdentifier: Optional RevenueCat Offering identifier to display a specific paywall.
    ///     If `nil`, RevenueCatUI uses the default/current paywall for your configuration.
    ///   - proContent: View shown once `pro` entitlement is active.
    public init(
        paywallOfferingIdentifier: String? = nil,
        @ViewBuilder proContent: () -> ProContent
    ) {
        self.paywallOfferingIdentifier = paywallOfferingIdentifier
        self.proContent = proContent()
    }

    public var body: some View {
        Group {
            if subManager.isPro {
                proContent
            } else {
                SubscriptionPurchaseView()
            }
        }
        .onChange(of: subManager.isPro) { isPro in
            if isPro {
                showPaywall = false
            }
        }
        .onChange(of: subManager.isLoading) { isLoading in
            // Only open the paywall after we know entitlement status.
            if !isLoading, !subManager.isPro {
                showPaywall = true
            }
        }
        .onAppear {
            if !subManager.isLoading, !subManager.isPro {
                showPaywall = true
            }
        }
        .task {
            await loadPaywallOfferingIfNeeded()
        }
        .sheet(isPresented: $showPaywall) {
            // RevenueCatUI renders a remotely-configured paywall.
            // For iPad, sheets are typically roughly iPhone-sized by default.
            if let paywallOffering {
                PaywallView(offering: paywallOffering)
            } else {
                PaywallView()
            }
        }
    }

    private func loadPaywallOfferingIfNeeded() async {
        guard let paywallOfferingIdentifier, paywallOffering == nil else { return }
        do {
            let offerings = try await Purchases.shared.offerings()
            paywallOffering = offerings.offering(identifier: paywallOfferingIdentifier)
        } catch {
            // Safe default: fall back to RevenueCatUI's default/current paywall.
            paywallOffering = nil
        }
    }
}

