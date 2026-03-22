import Foundation
import RevenueCat

/// Central place for RevenueCat configuration and identifiers.
///
/// Best practice: do not hardcode API keys in source control.
/// Provide the API key from your host app (Info.plist / build settings),
/// then call `RevenueCatIntegration.configure(...)` during app startup.
public enum RevenueCatIntegration {
    /// RevenueCat entitlement identifier for atlas.core Pro.
    public static let proEntitlementIdentifier: String = "pro"

    /// Reads `REVENUECAT_API_KEY` from the host app's Info.plist.
    /// - Important: do not commit your API keys. Set this in your host app only.
    public static func apiKeyFromHostAppInfoPlist() -> String? {
        Bundle.main.object(forInfoDictionaryKey: "REVENUECAT_API_KEY") as? String
    }

    /// Call once early in app startup to initialize RevenueCat.
    /// - Parameters:
    ///   - apiKey: Public RevenueCat API key for iOS (use Test Store key in debug, production key in release).
    ///   - appUserID: Optional stable user identifier from your backend.
    ///   - logLevel: Optional log level override. Defaults to `.warning` in production-grade setups.
    public static func configure(
        apiKey: String,
        appUserID: String? = nil,
        logLevel: RevenueCat.LogLevel = .warn
    ) {
        // Purchases.configure must only happen once.
        // Keep a best-effort guard to prevent accidental double configuration.
        RevenueCatConfigurationState.shared.configureIfNeeded(apiKey: apiKey, appUserID: appUserID, logLevel: logLevel)
    }

    /// Convenience wrapper that reads the API key from the host app's Info.plist.
    public static func configureFromHostAppInfoPlist(appUserID: String? = nil) {
        guard let apiKey = apiKeyFromHostAppInfoPlist() else {
            assertionFailure("Missing `REVENUECAT_API_KEY` in host app Info.plist.")
            return
        }
        configure(apiKey: apiKey, appUserID: appUserID)
    }

    // MARK: - Internal state
    private final class RevenueCatConfigurationState {
        static let shared = RevenueCatConfigurationState()
        private var didConfigure = false
        private let lock = NSLock()

        func configureIfNeeded(
            apiKey: String,
            appUserID: String?,
            logLevel: RevenueCat.LogLevel
        ) {
            lock.lock()
            defer { lock.unlock() }

            guard !didConfigure else { return }
            didConfigure = true

            Purchases.logLevel = logLevel
            Purchases.configure(withAPIKey: apiKey, appUserID: appUserID)
        }
    }
}

