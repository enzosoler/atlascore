import SwiftUI

#if os(iOS)
import RevenueCatUI

/// Optional self-service subscription management UI (iOS only).
public struct CustomerCenterSheet: View {
    @State private var isPresented = false

    public init() {}

    public var body: some View {
        Button("Manage Subscription") {
            isPresented = true
        }
        .sheet(isPresented: $isPresented) {
            CustomerCenterView()
        }
    }
}
#else

/// Placeholder for platforms where Customer Center UI is not supported.
public struct CustomerCenterSheet: View {
    public init() {}
    public var body: some View {
        EmptyView()
    }
}
#endif

