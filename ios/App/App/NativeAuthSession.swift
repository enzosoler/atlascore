import Foundation
import AuthenticationServices
import Capacitor

@objc(NativeAuthSession)
public class NativeAuthSession: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeAuthSession"
    public let jsName = "NativeAuthSession"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise),
    ]

    private var session: ASWebAuthenticationSession?
    private var activeCall: CAPPluginCall?
}

extension NativeAuthSession: ASWebAuthenticationPresentationContextProviding {
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }

    @objc func start(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let authURL = URL(string: urlString) else {
            call.reject("A valid auth URL is required.")
            return
        }

        guard let callbackScheme = call.getString("callbackScheme"),
              !callbackScheme.isEmpty else {
            call.reject("A callback scheme is required.")
            return
        }

        if activeCall != nil {
            call.reject("An auth session is already in progress.")
            return
        }

        let prefersEphemeral = call.getBool("prefersEphemeralWebBrowserSession") ?? false
        activeCall = call

        let authSession = ASWebAuthenticationSession(
            url: authURL,
            callbackURLScheme: callbackScheme
        ) { [weak self] callbackURL, error in
            guard let self else { return }
            defer {
                self.session = nil
                self.activeCall = nil
            }

            if let error = error as? ASWebAuthenticationSessionError,
               error.code == .canceledLogin {
                call.reject("The auth session was cancelled.", "AUTH_SESSION_CANCELLED", error)
                return
            }

            if let error {
                call.reject("The auth session failed.", nil, error)
                return
            }

            guard let callbackURL else {
                call.reject("The auth session completed without a callback URL.")
                return
            }

            call.resolve([
                "callbackUrl": callbackURL.absoluteString,
            ])
        }

        authSession.presentationContextProvider = self
        authSession.prefersEphemeralWebBrowserSession = prefersEphemeral
        session = authSession

        if authSession.start() {
            return
        }

        session = nil
        activeCall = nil
        call.reject("Failed to start the auth session.")
    }

    @objc func cancel(_ call: CAPPluginCall) {
        session?.cancel()
        session = nil
        activeCall = nil
        call.resolve()
    }
}
