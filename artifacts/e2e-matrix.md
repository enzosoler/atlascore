# E2E Matrix

| Flow | Status | Evidence |
| --- | --- | --- |
| Signup | Partial | [e2e/loop-integrity.spec.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/loop-integrity.spec.ts:230) |
| Email confirmation | Partial, backend-assisted | [e2e/loop-integrity.spec.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/loop-integrity.spec.ts:256), [V3AuthCallback.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3AuthCallback.jsx:16) |
| Password reset request | UI exists, external-email dependent | [V3ForgotPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3ForgotPassword.jsx:192) |
| Password reset completion | Route wiring validated | [e2e/auth-reset-routing.spec.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/auth-reset-routing.spec.ts:1), [V3ResetPassword.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3ResetPassword.jsx:185) |
| Login persistence | Weak indirect coverage | [e2e/loop-integrity.spec.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/loop-integrity.spec.ts:418), [AuthContext.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/lib/AuthContext.jsx:300) |
| Logout -> login again | Missing | [e2e/admin.spec.ts](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/e2e/admin.spec.ts:37) |
| Checkout initiation | Contract-only | [tests/prelaunch/checkout-url.test.mjs](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/tests/prelaunch/checkout-url.test.mjs:26) |
| Checkout success / activation | Contract-only | [tests/prelaunch/checkout-url.test.mjs](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/tests/prelaunch/checkout-url.test.mjs:44), [V3WebPurchaseSuccess.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3WebPurchaseSuccess.jsx:13) |
| Billing portal | Missing | [billingService.js](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/services/billingService.js:54), [V3SubscriptionManage.jsx](/Users/enzosoler/Documents/Atlas.Core/atlas.core-official/src/redesign/v3/routes/V3SubscriptionManage.jsx:52) |
