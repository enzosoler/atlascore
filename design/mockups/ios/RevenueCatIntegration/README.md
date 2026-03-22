# RevenueCatIntegration (atlas.core)

Reusable SwiftUI components for integrating **RevenueCat** subscriptions and paywalls.

This repository contains the code as a Swift Package so you can add it to your actual iOS SwiftUI app.

## What’s included

- `RevenueCatIntegration.configure(...)` to initialize the SDK (call once at app startup)
- `RevenueCatSubscriptionManager` for entitlement checking of `pro` using `customerInfoStream`
- `SubscriptionPurchaseView` (weekly/monthly/annual)
- `PaywallGateView` that shows a RevenueCat paywall when `pro` is not active
- `CustomerCenterSheet` (optional)

## RevenueCat dashboard checklist

1. Entitlement identifier: `pro`
2. Offering with packages:
   - `weekly`
   - `monthly`
   - `annual` (yearly)
3. Each package grants the `pro` entitlement
4. Create a RevenueCat Paywall and attach it to the offering your app should use

## Host app setup (required)

### 1. Add `REVENUECAT_API_KEY` to host app

Add `REVENUECAT_API_KEY` to your iOS app's `Info.plist`.

Use your **RevenueCat public iOS API key** (test key for debug; production key for release).

Example dev value:
- Your RevenueCat Test Store iOS public API key (the one you were given).

### 2. Configure RevenueCat once in your app

In your iOS SwiftUI app:

```swift
import RevenueCatIntegration

@main
struct AtlasCoreApp: App {
    @StateObject private var subManager = RevenueCatSubscriptionManager()

    init() {
        RevenueCatIntegration.configureFromHostAppInfoPlist()
        subManager.start()
    }

    var body: some Scene {
        WindowGroup {
            PaywallGateView {
                // Pro content goes here
                Text("Welcome, Pro!")
            }
            .environmentObject(subManager)
        }
    }
}
```

## Where you might adjust later

- If your entitlement identifier is different, update `RevenueCatIntegration.proEntitlementIdentifier`.
- If your offerings do not populate `weekly/monthly/annual`, adjust the `SubscriptionPurchaseView` mapping.
- If you want to show a specific paywall offering, use `PaywallGateView(paywallOfferingIdentifier: ...)`.

