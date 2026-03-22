import Foundation
import RevenueCat
import SwiftUI

/// Keeps entitlement state in sync with RevenueCat.
///
/// Uses RevenueCat's modern `customerInfoStream` async sequence so SwiftUI updates reactively.
@MainActor
public final class RevenueCatSubscriptionManager: ObservableObject {
    @Published public private(set) var isPro: Bool = false
    @Published public private(set) var isLoading: Bool = true
    @Published public private(set) var lastErrorMessage: String?

    private var streamTask: Task<Void, Never>?

    public init() {}

    /// Starts listening for `CustomerInfo` updates.
    /// Safe to call multiple times (a single stream listener will be kept).
    public func start() {
        guard streamTask == nil else { return }

        streamTask = Task { [weak self] in
            guard let self else { return }
            await self.refreshOnce()
            await self.listenCustomerInfoStream()
        }
    }

    public func stop() {
        streamTask?.cancel()
        streamTask = nil
    }

    deinit {
        streamTask?.cancel()
    }

    /// Fetches the latest snapshot of `CustomerInfo` on demand.
    @discardableResult
    public func fetchCustomerInfo() async -> CustomerInfo? {
        do {
            let info = try await Purchases.shared.customerInfo()
            apply(customerInfo: info)
            return info
        } catch {
            lastErrorMessage = error.localizedDescription
            return nil
        }
    }

    private func refreshOnce() async {
        isLoading = true
        lastErrorMessage = nil
        defer { isLoading = false }

        do {
            let info = try await Purchases.shared.customerInfo()
            apply(customerInfo: info)
        } catch {
            lastErrorMessage = error.localizedDescription
        }
    }

    private func listenCustomerInfoStream() async {
        for await info in Purchases.shared.customerInfoStream {
            apply(customerInfo: info)
        }
    }

    private func apply(customerInfo: CustomerInfo) {
        let ent = customerInfo.entitlements[RevenueCatIntegration.proEntitlementIdentifier]
        isPro = ent?.isActive == true
    }
}

