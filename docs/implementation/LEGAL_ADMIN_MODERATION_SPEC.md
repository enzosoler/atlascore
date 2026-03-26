# Atlas Core — Legal, Admin & Moderation System Spec

**Version:** 1.0  
**Date:** March 26, 2026  
**Status:** Implementation-Ready

---

## SECTION 1 — EXECUTIVE DECISIONS

### Core Philosophy
- **User-facing:** Clean, frictionless, premium, Apple-like
- **Internal:** Strict governance, explicit permissions, full auditability
- **Transparency:** Exists only where legally necessary and professionally appropriate
- **No operational theater:** Users should never see unnecessary moderation machinery

### What General Admins CAN Access
| Resource | Scope |
|----------|-------|
| User accounts (basic) | name, email, account status, created_at, subscription tier |
| Subscription/billing | status, plan, payment issues, cancellation requests |
| Support tickets | full ticket history, internal notes |
| Feature flags | toggle states, rollout percentages |
| System health | basic metrics, error rates (no user content) |
| Audit logs | read-only view of their own actions and system-level events |

### What General Admins CANNOT Access
| Resource | Rationale |
|----------|-----------|
| Workout logs | Personal health data, outside operational scope |
| Nutrition logs | Personal health data, requires specific health consent |
| Body metrics | Weight, measurements, body fat — sensitive health data |
| Progress photos | Requires `view_private_photos` or moderation role |
| Private/sensitive photos | Requires explicit moderation permission |
| Social/community content | Requires moderation role |
| Location data | Sensitive personal data |
| Device health data | Requires specific legal basis |
| Raw analytics events | May contain inferred sensitive data |

### Photo Access Model

**Four Photo Categories:**
1. **Profile** — public avatar, low sensitivity
2. **Social/Community** — shared in feed, medium sensitivity
3. **Progress** — personal transformation tracking, high sensitivity
4. **Health/Private** — body metrics photos, medical-adjacent, highest sensitivity

**Access Rules:**
- `moderator` role: can view reported photos (all categories)
- `senior_moderator` role: can view all photos across all categories
- `view_all_photos` permission: required for non-reported photo access
- `view_private_photos` permission: required for progress/health photos
- Every photo view by staff is logged with reason
- No batch download capability for any role

### Moderation Access Mechanics
- Moderation is a **separate privileged module**, not part of default admin
- Staff must explicitly enter moderation context
- Reason must be provided for viewing non-reported content
- Time-boxed sessions with auto-logout after inactivity
- Blur/click-to-view for sensitive categories

### Legal Transparency
- Privacy Policy discloses internal review capability (calm, professional language)
- No in-product notifications for routine moderation access
- No user-facing "admin viewed your photo" indicators
- Legal hold or law enforcement access logged separately

### What Users See vs. Do Not See

**Users See:**
- Clean signup with inline legal acceptance
- Subscription flow with clear billing terms
- Simple account status (active/suspended)
- Content guidelines in friendly, minimal form

**Users Do NOT See:**
- Which staff viewed their content
- Internal moderation queue
- Audit log entries
- Role/permission structures
- Operational reasons for content decisions
- Internal notes or confidence scores

---

## SECTION 2 — PRIVACY POLICY

---

**Last Updated:** [DATE]  
**Effective Date:** [DATE]

Atlas Core ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our fitness application and related services.

### 1. Information We Collect

**Account Information**
When you create an account, we collect your name, email address, and authentication credentials. We may also collect optional profile information such as age, fitness goals, and preferences.

**Fitness & Health Data**
With your explicit consent, we collect workout logs, nutrition entries, body measurements, progress photos, and other health-related data you choose to track. This data is used solely to provide and improve your fitness experience.

**Subscription & Billing Data**
We process payment information through secure third-party processors. We store subscription status, billing history, and related transactional data necessary to maintain your account.

**Device & App Data**
We collect device type, operating system, app version, and crash logs to improve app performance and reliability. We do not collect precise location data without explicit permission.

**User-Generated Content**
Photos, posts, comments, and other content you create or upload may be stored and processed to deliver the services you request.

### 2. How We Use Your Information

**To Provide Our Services**
We use your data to personalize workouts, track progress, enable social features, and deliver the core fitness experience you signed up for.

**To Improve Our Product**
We analyze aggregated, anonymized usage patterns to enhance features, fix issues, and develop new capabilities.

**For Security & Safety**
We monitor for fraudulent activity, abuse, and violations of our Terms of Service. This includes automated scanning and, when necessary, internal review of user-generated content to ensure platform safety and compliance.

**For Communication**
We send service-related notifications, support responses, and optional marketing communications (which you can opt out of at any time).

### 3. Content Review & Safety

**Internal Review**
To maintain a safe and trusted environment, Atlas Core may review user-generated content—including photos—when necessary for:
- Safety and abuse prevention
- Customer support resolution
- Platform integrity and operational needs
- Legal compliance and law enforcement requests

This review is conducted by trained staff with appropriate access controls and is logged for accountability. Review is limited to specific, justified purposes and is not routine surveillance.

**Automated Processing**
We use automated systems to detect potential violations of our content policies (such as prohibited imagery or abuse patterns). Flagged content may be queued for human review.

### 4. Data Sharing & Processors

We do not sell your personal information. We share data only with trusted service providers who help us operate Atlas Core:

| Processor | Purpose | Data Type |
|-----------|---------|-----------|
| Stripe | Payment processing | Billing info, subscription status |
| Supabase | Database & authentication | Account data, fitness data |
| Cloud storage providers | Media storage | Photos, profile images |
| Analytics providers | Product improvement | Anonymized usage metrics |
| Email service providers | Communication | Email address, message content |

All processors are bound by contractual obligations to protect your data and use it only for specified purposes.

### 5. Data Retention

We retain your personal information as long as your account is active or as needed to provide you services. Upon account deletion, we remove or anonymize your data within 30 days, except where:
- Retention is required by law
- Data is necessary for fraud prevention
- Data is part of an unresolved support or legal matter

Progress photos and sensitive health data are subject to enhanced retention controls and can be permanently deleted immediately upon account closure request.

### 6. Your Rights & Choices

**Access & Portability**
You can request a copy of your personal data in a portable format at any time through your account settings or by contacting support.

**Correction & Deletion**
You may update or delete most information directly in the app. For account deletion requests, contact support@atlascore.app.

**Consent Withdrawal**
You can revoke consent for health data processing or marketing communications at any time. This may limit certain app features.

**Regional Rights**
[JURISDICTION-SPECIFIC: Add GDPR, CCPA, or other regional rights as required by legal counsel]

### 7. Security Measures

We implement industry-standard security practices:
- End-to-end encryption for data in transit
- Encryption at rest for stored data
- Strict access controls and role-based permissions
- Regular security audits and penetration testing
- Incident response procedures

While we employ robust safeguards, no system is completely secure. We promptly notify users of any security incidents affecting their personal data as required by law.

### 8. Children's Privacy

Atlas Core is not intended for users under 16. We do not knowingly collect data from children. If you believe we have collected data from a minor, contact us immediately for deletion.

### 9. International Data Transfers

[JURISDICTION-SPECIFIC: Add details about data residency, cross-border transfers, and applicable legal mechanisms (SCCs, adequacy decisions, etc.) per legal counsel review.]

### 10. Changes to This Policy

We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notice at least 30 days before taking effect. Your continued use after changes constitutes acceptance.

### 11. Contact Us

For privacy-related questions, data requests, or concerns:

**Email:** privacy@atlascore.app  
**Address:** [COMPANY ADDRESS]  
**DPO Contact:** [DPO EMAIL IF REQUIRED BY JURISDICTION]

---

## SECTION 3 — TERMS OF SERVICE

---

**Last Updated:** [DATE]  
**Effective Date:** [DATE]

Welcome to Atlas Core. These Terms of Service ("Terms") govern your access to and use of our fitness application, website, and related services. By creating an account or using Atlas Core, you agree to these Terms.

### 1. Account Registration & Eligibility

**Eligibility**
You must be at least 16 years old to use Atlas Core. By registering, you represent that you meet this requirement and that all information you provide is accurate and complete.

**Account Security**
You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access.

**Account Sharing**
Accounts are personal and non-transferable. Sharing credentials or allowing others to use your account is prohibited and may result in suspension.

### 2. Subscriptions, Trials & Billing

**Free Trials**
We may offer limited-time free trials. Trials automatically convert to paid subscriptions unless cancelled before the trial ends. Trial eligibility is limited to new users.

**Subscription Terms**
- Subscriptions are billed in advance on a recurring basis (monthly or annual)
- Prices are displayed before purchase and may change with 30 days notice
- You authorize us to charge your selected payment method
- Failed payments may result in service suspension after a grace period

**Cancellation**
You may cancel your subscription at any time through account settings or by contacting support. Cancellation takes effect at the end of the current billing period. No refunds for partial periods unless required by law.

**Refund Policy**
Refunds are evaluated on a case-by-case basis for billing errors or technical issues. Subscription cancellations do not entitle you to refunds for previous payments.

### 3. Acceptable Use

**Prohibited Activities**
You may not use Atlas Core to:
- Harass, abuse, or threaten other users
- Upload illegal, harmful, or sexually explicit content
- Impersonate others or misrepresent your identity
- Attempt to access other users' accounts or data
- Interfere with app functionality or security measures
- Use automated systems to scrape or manipulate data
- Distribute malware or engage in phishing
- Violate any applicable laws or regulations

**Health Disclaimers**
Atlas Core provides fitness guidance but is not a medical service. Consult healthcare professionals before beginning any exercise program. We are not liable for injuries or health issues arising from your use of the app.

### 4. User Content

**Your Content**
You retain ownership of photos, posts, and other content you upload. By uploading content, you grant Atlas Core a limited license to store, display, and process it solely to operate and improve our services.

**Content Representations**
You represent that your content does not:
- Infringe third-party intellectual property rights
- Contain private information of others without consent
- Violate applicable laws or platform policies
- Include prohibited content categories (sexual, violent, hateful)

**Content Removal**
We reserve the right to remove any content that violates these Terms or our policies without prior notice. Repeated violations may result in account suspension or termination.

### 5. Moderation & Enforcement

**Our Rights**
Atlas Core may, at our discretion:
- Review user-generated content for policy compliance
- Remove content that violates our guidelines
- Issue warnings to users
- Suspend accounts temporarily or permanently
- Ban users from the platform
- Report illegal activity to appropriate authorities

**No Obligation to Monitor**
We are not obligated to monitor all user content. Our failure to remove content does not constitute endorsement or waiver of our rights.

**Appeals**
Users may appeal content removals or account actions through our support channels. We review appeals in good faith but our decisions are final.

### 6. Intellectual Property

**Our Rights**
Atlas Core and its content (excluding user-generated content) are protected by copyright, trademark, and other laws. You may not copy, modify, or distribute our materials without written permission.

**Feedback**
Suggestions or feedback you provide may be used by Atlas Core without compensation or attribution.

### 7. Termination

**By You**
You may delete your account at any time. Upon deletion, your data will be removed per our Privacy Policy retention periods.

**By Us**
We may suspend or terminate your account for:
- Violations of these Terms
- Extended periods of inactivity
- Fraudulent or illegal activity
- Non-payment of subscription fees

**Effect of Termination**
Upon termination, your access to Atlas Core ceases immediately. Provisions regarding liability, indemnification, and dispute resolution survive termination.

### 8. Disclaimers & Limitation of Liability

**As-Is Basis**
Atlas Core is provided "as is" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free service.

**Limitation of Liability**
To the maximum extent permitted by law, Atlas Core and its affiliates shall not be liable for:
- Indirect, incidental, or consequential damages
- Lost profits or data
- Personal injury or property damage
- Damages exceeding the amount you paid us in the 12 months preceding the claim

**Exclusions**
Some jurisdictions do not allow certain limitations, so these restrictions may not apply to you.

### 9. Indemnification

You agree to indemnify and hold harmless Atlas Core from claims arising from:
- Your use of the service
- Your user-generated content
- Your violation of these Terms
- Your violation of third-party rights

### 10. Governing Law & Dispute Resolution

**Governing Law**
These Terms are governed by the laws of [JURISDICTION], without regard to conflict of law principles.

**Dispute Resolution**
[JURISDICTION-SPECIFIC: Add arbitration clause, class action waiver, or litigation forum selection per legal counsel.]

**Informal Resolution**
Before initiating formal proceedings, we encourage you to contact us at support@atlascore.app to seek informal resolution.

### 11. General Provisions

**Entire Agreement**
These Terms constitute the entire agreement between you and Atlas Core regarding the service.

**Severability**
If any provision is found unenforceable, the remaining provisions remain in effect.

**Waiver**
Our failure to enforce any right does not waive that right for future breaches.

**Assignment**
We may assign these Terms in connection with a merger, acquisition, or asset sale. You may not assign without our consent.

**Notices**
We may send notices via email, in-app notification, or posting on our website.

### 12. Contact

For questions about these Terms:

**Email:** legal@atlascore.app  
**Address:** [COMPANY ADDRESS]

---

## SECTION 4 — TERMS ACCEPTANCE UX

### Signup Flow

**Pattern: Inline Agreement (No Checkbox Required)**

For signup, we use inline legal text rather than a checkbox. This creates a cleaner, more modern experience while maintaining legal validity in most jurisdictions.

```
By creating an account, you agree to our Terms of Service and Privacy Policy.
```

**Required Data Store:**
```
accepted_terms_at: timestamp
terms_version: "v2.1.0"
accepted_privacy_at: timestamp  
privacy_version: "v1.3.0"
```

**UX Location:** Bottom of signup form, above the primary button.

**Link Treatment:** Terms and Privacy Policy open in modal (preferred) or new tab. Modal keeps user in flow.

### Subscription/Upgrade Flow

**Pattern: Checkbox Required for Billing Terms**

For subscription purchases, a checkbox is required. This creates explicit consent for financial obligations and is legally prudent in most jurisdictions.

```
☑ I agree to the Subscription Terms and authorize recurring billing.
```

**Required Data Store:**
```
accepted_billing_terms_at: timestamp
billing_terms_version: "v1.0.0"
payment_method_stored: boolean
subscription_tier_selected: string
```

**Why Checkbox Here:**
- Financial commitment requires explicit acknowledgment
- Reduces chargeback disputes
- Regulatory compliance (consumer protection)
- Clear audit trail for billing disputes

**UX Location:** Immediately above payment submission button, after price display.

### Re-Consent Strategy

**When Terms Change:**

**Material Changes:**
- Block app access until re-consent
- Show full-screen modal with changes highlighted
- Require explicit action to continue
- Log new acceptance timestamp and version

**Non-Material Changes:**
- Email notification with 30-day notice
- In-app banner with link to review
- Passive acceptance through continued use
- Log acknowledgment

**Implementation:**
```
ON_APP_OPEN:
  IF user.terms_version < current_terms_version:
    IF is_material_change:
      SHOW_BLOCKING_MODAL()
    ELSE:
      SHOW_BANNER()
```

### Data Storage Schema

```sql
create table terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  
  -- Signup terms
  accepted_terms_at timestamp with time zone,
  terms_version varchar(20),
  accepted_privacy_at timestamp with time zone,
  privacy_version varchar(20),
  
  -- Billing terms
  accepted_billing_terms_at timestamp with time zone,
  billing_terms_version varchar(20),
  
  -- Metadata
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Index for quick version checks
create index idx_terms_acceptances_user on terms_acceptances(user_id);
create index idx_terms_acceptances_versions on terms_acceptances(user_id, terms_version, privacy_version);
```

---

## SECTION 5 — ADMIN / BACKOFFICE INFORMATION ARCHITECTURE

### Sidebar Structure

```
Atlas Core Admin
├── Overview
├── Users
│   ├── All Users
│   ├── Suspended Accounts
│   └── Pending Verifications
├── Subscriptions
│   ├── Active Subscriptions
│   ├── Failed Payments
│   └── Cancellations
├── Roles & Permissions
│   ├── All Roles
│   ├── Assign Roles
│   └── Permission Matrix
├── Audit Log
│   ├── All Actions
│   ├── My Actions
│   └── Exports
└── Settings
    ├── Feature Flags
    ├── System Settings
    └── Internal Notes
```

### Screen Definitions

#### Overview
**Purpose:** Quick operational snapshot for admin onboarding and daily orientation.

**Data Shown:**
- Total active users (7/30/90-day)
- New signups today
- Subscription MRR movement
- Open support tickets
- Recent admin actions (summary only)
- System health indicators

**Actions:**
- Drill down to any metric
- Quick search for users

**Intentionally Excluded:**
- User content
- Individual workout/health data
- Photo previews
- Personal identifiers in aggregate views

#### Users — All Users
**Purpose:** User account management and basic support operations.

**Key Data:**
- User ID, name, email
- Account status (active, suspended, pending)
- Subscription tier
- Created date, last active
- Support ticket count

**Filters:**
- Status (active, suspended, pending deletion)
- Subscription tier (free, premium, etc.)
- Date range (created, last active)
- Email verified (yes/no)

**Actions:**
- View profile (basic info only)
- Suspend/unsuspend account
- Reset onboarding
- Revoke all sessions
- Add internal note

**Detail View:**
- Basic account info
- Subscription history
- Support ticket history
- Admin notes (internal)
- Recent audit log entries (system-level only)

**Excluded:**
- Workout history
- Nutrition logs
- Body metrics
- Photo galleries
- Location data

#### Users — Suspended Accounts
**Purpose:** Manage account restrictions and review suspensions.

**Key Data:**
- User info
- Suspension reason (category + internal note)
- Suspended by (admin)
- Suspended at
- Appeal status

**Actions:**
- View suspension details
- Lift suspension
- Extend/escalate
- Communicate with user

#### Subscriptions — All Views
**Purpose:** Billing operations and subscription management.

**Key Data:**
- User (ID, name)
- Plan, status, price
- Next billing date
- Payment method status
- Trial status (if applicable)

**Filters:**
- Status (active, past_due, cancelled, etc.)
- Plan tier
- Billing issue type
- Date range

**Actions:**
- View subscription details
- Apply courtesy extension
- Cancel subscription (with reason)
- View billing history
- Issue refund (via Stripe)

#### Roles & Permissions
**Purpose:** Staff access management with strict governance.

**Structure:**
- Role list with permission counts
- User-to-role assignments
- Permission matrix view
- Change history

**Actions:**
- Create/edit roles (limited to super_admin)
- Assign/revoke roles from users
- View permission audit trail
- Clone role as template

**Governance:**
- Changes require elevated approval for sensitive permissions
- Self-modification blocked (cannot escalate own permissions)
- All changes logged to audit system

#### Audit Log
**Purpose:** Operational transparency and compliance record.

**Key Data:**
- Timestamp
- Actor (admin user)
- Action type
- Target resource
- Before/after state (for changes)
- IP address
- Reason (if provided)

**Filters:**
- Date range
- Actor
- Action type
- Resource type
- Severity level

**Views:**
- All system actions
- My actions (current user)
- Specific user history
- Exportable reports

**Retention:** 2 years operational, 7 years archived

#### Settings — Feature Flags
**Purpose:** Controlled rollout and emergency toggles.

**Key Data:**
- Flag name, description
- Current state (on/off/percentage)
- Target audience rules
- Change history

**Actions:**
- Toggle flags
- Adjust rollout percentage
- Add targeting rules
- Emergency kill switch

---

## SECTION 6 — PHOTOS / MODERATION CONSOLE

### Design Principle
Moderation is a **separate privileged environment**. Staff must context-switch into moderation mode, with distinct visual treatment and stricter session controls.

### Access Model

**Entry Points:**
1. Direct navigation to `/moderation` (role-restricted)
2. "Enter Moderation" button in admin sidebar (for authorized roles)
3. Escalation from reported content queue

**Session Controls:**
- Maximum 2-hour session duration
- Auto-logout after 15 minutes inactivity
- Re-authentication required for sensitive photo categories
- Visual indicator: "Moderation Mode Active" banner

### Module Structure

```
Moderation Console
├── Queue
│   ├── Reported Content
│   ├── Auto-Flagged
│   └── Appeals
├── Photo Review
│   ├── By Category (Profile/Social/Progress/Health)
│   ├── By Status
│   └── Search
├── User Cases
│   ├── Open Cases
│   ├── Case History
│   └── Escalated
├── Actions
│   ├── Keep
│   ├── Remove
│   ├── Soft-Hide
│   ├── Warn User
│   ├── Suspend User
│   ├── Ban User
│   ├── Escalate
│   └── Restore
└── Internal
    ├── My Activity
    ├── Team Queue
    └── Guidelines
```

### Photo Category Definitions

| Category | Sensitivity | Default Visibility | Review Triggers |
|----------|-------------|-------------------|-----------------|
| Profile | Low | Public | Reports, auto-flag |
| Social/Community | Medium | Community | Reports, auto-flag, trending |
| Progress | High | Private to user | User request, account review |
| Health/Private | Highest | Private to user | Legal hold, safety concern only |

### Queue Views

#### Reported Content
**Purpose:** Content flagged by users for review.

**List View:**
- Thumbnail (blurred for sensitive categories)
- Reporter info
- Report reason (category)
- Reported at
- Photo category badge
- Content age

**Filters:**
- Category (all/profile/social/progress/health)
- Report reason
- Time range
- Status (pending/reviewed/escalated)
- Auto-flag confidence (high/medium/low)

#### Auto-Flagged
**Purpose:** ML-detected potential violations.

**Additional Data:**
- Confidence score
- Detection category
- Model version

#### Appeals
**Purpose:** User challenges to moderation decisions.

**Additional Data:**
- Original decision
- Appeal reason
- Appeal timestamp
- Previous case ID

### Photo Detail View

**Layout:**
- Left: Full photo viewer with category indicator
- Right: Context panel

**Photo Viewer:**
- Full-resolution image
- Zoom/pan controls
- Category badge (color-coded)
- Sensitivity warning for Progress/Health
- Metadata (upload date, reported date, views)

**Context Panel:**
- User info (limited)
- Photo history (if user has multiple flagged photos)
- Report details
- Previous moderation actions on this user
- Action buttons
- Internal notes field

**Warning Banner (Progress/Health):**
```
⚠️ SENSITIVE CONTENT — Private Progress Photo
This content is private to the user. Access logged. 
View only when necessary for safety or legal compliance.
```

### Moderation Actions

| Action | Effect | Audit Level | User Notification |
|--------|--------|-------------|-------------------|
| Keep | No action, clear report | Standard | None |
| Remove | Delete photo permanently | High | "Content removed" (generic) |
| Soft-Hide | Hide from public, keep in system | High | None (unless user notices) |
| Warn User | Send warning, keep photo | High | Warning message |
| Suspend User | Temp account suspension | Critical | "Account suspended" |
| Ban User | Permanent termination | Critical | "Account terminated" |
| Escalate | Send to senior moderator | Standard | None |
| Restore | Reverse previous removal | High | None |
| Add Note | Internal only | Standard | None |

### Moderation Statuses

**Photo Status:**
- `pending` — awaiting review
- `under_review` — assigned to moderator
- `kept` — cleared, no action
- `removed` — deleted
- `hidden` — soft-removed from public view
- `escalated` — awaiting senior review
- `appealed` — user is challenging decision

**Case Status:**
- `open` — active investigation
- `resolved` — closed with action
- `dismissed` — closed without action
- `escalated` — transferred up

### All Photos View

**Exists:** Yes, for `senior_moderator` and roles with `view_all_photos` permission.

**Restrictions:**
- Requires explicit search or browse action
- Reason required for access (selected from dropdown)
- Results limited to 50 per page
- No bulk export functionality
- Access heavily logged

**Reasons Required:**
- Report investigation
- User safety concern
- Legal compliance
- Platform integrity check
- Support request resolution

### Logging Requirements

Every photo view by staff logs:
- viewer_id (staff user)
- viewer_role
- photo_id
- photo_category
- photo_owner_id
- viewed_at
- reason_selected
- session_id
- ip_address

---

## SECTION 7 — ROLES & PERMISSIONS MATRIX

### Role Definitions

| Role | Level | Purpose |
|------|-------|---------|
| owner | System | Business owner, full access |
| super_admin | Admin | Technical/system administrator |
| admin_ops | Admin | Day-to-day operations, user support |
| billing_admin | Admin | Subscription and payment operations |
| support_admin | Admin | Customer support, basic account help |
| moderator | Moderation | Content review, reported items |
| senior_moderator | Moderation | All photos, appeals, policy decisions |
| readonly_analytics | Read | View-only access to metrics |

### Permission Definitions

| Permission | Description |
|------------|-------------|
| manage_users | View and edit basic user accounts |
| suspend_users | Temporarily disable accounts |
| ban_users | Permanently terminate accounts |
| manage_subscriptions | View and modify billing status |
| process_refunds | Issue refunds via payment processor |
| manage_roles | Create, edit, assign roles |
| view_audit_logs | Access system audit trail |
| manage_feature_flags | Toggle system features |
| view_reported_photos | See reported content queue |
| view_all_photos | Browse non-reported user photos |
| view_private_photos | Access progress/health photos |
| moderate_photos | Take action on flagged content |
| remove_photos | Delete user content |
| export_moderation_evidence | Download case materials |
| impersonate_user | Login-as-user for support |
| reset_onboarding | Clear user onboarding state |
| revoke_sessions | Force logout on all devices |
| manage_internal_settings | System configuration |
| view_sensitive_analytics | PII-inclusive metrics |
| senior_moderation_override | Reverse moderator decisions |

### RBAC Matrix

| Permission | owner | super_admin | admin_ops | billing_admin | support_admin | moderator | senior_moderator | readonly_analytics |
|------------|:-----:|:-----------:|:---------:|:-------------:|:-------------:|:---------:|:----------------:|:------------------:|
| manage_users | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| suspend_users | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| ban_users | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| manage_subscriptions | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| process_refunds | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| manage_roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_audit_logs | ✅ | ✅ | ✅ (own) | ❌ | ❌ | ❌ | ✅ | ❌ |
| manage_feature_flags | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_reported_photos | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| view_all_photos | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| view_private_photos | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| moderate_photos | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| remove_photos | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| export_moderation_evidence | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| impersonate_user | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| reset_onboarding | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| revoke_sessions | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| manage_internal_settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| view_sensitive_analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| senior_moderation_override | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### Default Assignment Model

**New Staff Onboarding:**
1. Create account with `readonly_analytics` (baseline)
2. Assign role based on function:
   - Support hire → `support_admin`
   - Finance hire → `billing_admin`
   - Ops hire → `admin_ops`
   - Trust & Safety hire → `moderator` or `senior_moderator`
3. Review and adjust at 30/60/90 days

**Privilege Escalation Rules:**
- Self-modification blocked at API level
- `moderator` → `senior_moderator` requires `owner` or `super_admin` approval
- `view_private_photos` never granted with general admin roles
- Emergency access requires post-hoc audit review

---

## SECTION 8 — AUDIT LOG DESIGN

### Log Entry Schema

```sql
create table admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  
  -- Actor
  actor_id uuid references users(id),  -- internal staff user
  actor_role varchar(50) not null,
  actor_ip inet not null,
  actor_user_agent text,
  
  -- Target
  target_user_id uuid references users(id),
  resource_type varchar(50) not null,  -- 'user', 'photo', 'subscription', 'role', etc.
  resource_id uuid,
  
  -- Action
  action varchar(100) not null,  -- 'viewed', 'modified', 'deleted', 'suspended', etc.
  action_category varchar(50),  -- 'read', 'write', 'delete', 'moderation', 'billing'
  
  -- Context
  reason text,  -- required for sensitive actions
  metadata jsonb,  -- flexible context
  
  -- State tracking (for modifications)
  before_state jsonb,
  after_state jsonb,
  
  -- Severity
  severity varchar(20) default 'info',  -- 'info', 'warning', 'critical'
  
  -- User visibility
  user_visible boolean default false,  -- can user see this log entry?
  user_notification_sent boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  
  -- Session tracking
  session_id uuid
);

-- Indexes
create index idx_audit_actor on admin_action_logs(actor_id, created_at desc);
create index idx_audit_target on admin_action_logs(target_user_id, created_at desc);
create index idx_audit_resource on admin_action_logs(resource_type, resource_id);
create index idx_audit_action on admin_action_logs(action, created_at desc);
create index idx_audit_severity on admin_action_logs(severity, created_at desc);
create index idx_audit_user_visible on admin_action_logs(target_user_id, user_visible) where user_visible = true;
```

### Mandatory Log Events

**Always Logged (Critical Severity):**
- User account suspension/ban
- User impersonation
- Role assignment/removal
- Permission changes
- Photo removal
- Billing refunds
- Data export
- Emergency feature flag changes

**Always Logged (Warning Severity):**
- Private photo viewed
- All-photos search executed
- Password reset by admin
- Session revocation
- Content hidden (soft-remove)

**Always Logged (Info Severity):**
- User profile viewed
- Subscription viewed
- Audit log accessed
- Support ticket opened

### Retention Policy

| Severity | Operational Retention | Archive Retention |
|----------|---------------------|-------------------|
| Critical | 7 years | 10 years |
| Warning | 2 years | 7 years |
| Info | 1 year | 3 years |

### User-Visible vs. Internal-Only

**User-Visible Events:**
- Account suspension/ban (with generic reason)
- Content removal (generic)
- Billing changes
- Security events (login from new device, etc.)

**Internal-Only Events:**
- Photo views by staff
- Internal notes added
- Reasoning behind decisions
- Moderator identity
- Audit log queries

### UI Filtering

**Default View:**
- Current user's actions (last 30 days)
- System-level events

**Advanced Filters:**
- Date range picker
- Actor dropdown (for elevated roles)
- Action type multi-select
- Resource type
- Severity
- Target user search

---

## SECTION 9 — BACKEND DATA MODEL

### users

**Purpose:** Core user accounts

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  email_verified boolean default false,
  encrypted_password varchar(255),
  
  -- Profile
  full_name varchar(255),
  avatar_url text,
  
  -- Status
  status varchar(20) default 'active',  -- active, suspended, banned, pending_deletion
  suspension_reason text,
  suspended_at timestamp with time zone,
  suspended_by uuid references users(id),
  
  -- Onboarding
  onboarding_completed boolean default false,
  onboarding_step varchar(50),
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_active_at timestamp with time zone,
  
  -- Soft delete
  deleted_at timestamp with time zone,
  deletion_requested_at timestamp with time zone
);

create index idx_users_email on users(email);
create index idx_users_status on users(status);
create index idx_users_created on users(created_at desc);
```

### roles

**Purpose:** Role definitions

```sql
create table roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) unique not null,
  description text,
  level varchar(20) not null,  -- system, admin, moderation, read
  is_system_role boolean default false,  -- protected from deletion
  created_at timestamp with time zone default now()
);

-- Seed data
insert into roles (name, description, level, is_system_role) values
  ('owner', 'Business owner with full access', 'system', true),
  ('super_admin', 'Technical system administrator', 'admin', true),
  ('admin_ops', 'Day-to-day operations', 'admin', true),
  ('billing_admin', 'Billing and subscription management', 'admin', true),
  ('support_admin', 'Customer support', 'admin', true),
  ('moderator', 'Content moderation', 'moderation', true),
  ('senior_moderator', 'Senior content moderation', 'moderation', true),
  ('readonly_analytics', 'Read-only analytics access', 'read', true);
```

### permissions

**Purpose:** Granular permission definitions

```sql
create table permissions (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  description text,
  category varchar(50),  -- users, billing, moderation, system
  is_sensitive boolean default false,  -- requires extra logging
  created_at timestamp with time zone default now()
);
```

### role_permissions

**Purpose:** Many-to-many role-permission mapping

```sql
create table role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  granted_at timestamp with time zone default now(),
  granted_by uuid references users(id),
  primary key (role_id, permission_id)
);
```

### user_roles

**Purpose:** User role assignments

```sql
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  assigned_by uuid references users(id),
  expires_at timestamp with time zone,  -- for temporary access
  revoked_at timestamp with time zone,
  revoked_by uuid references users(id),
  unique (user_id, role_id)
);

create index idx_user_roles_user on user_roles(user_id);
create index idx_user_roles_role on user_roles(role_id);
```

### subscriptions

**Purpose:** Billing and subscription tracking

```sql
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  
  -- Stripe references
  stripe_customer_id varchar(255),
  stripe_subscription_id varchar(255),
  
  -- Plan info
  plan_id varchar(50) not null,
  plan_name varchar(100),
  status varchar(50) not null,  -- active, past_due, cancelled, etc.
  
  -- Billing
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  canceled_at timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_subscriptions_user on subscriptions(user_id);
create index idx_subscriptions_status on subscriptions(status);
create index idx_subscriptions_stripe on subscriptions(stripe_subscription_id);
```

### admin_action_logs

(See Section 8 for full schema)

### moderation_cases

**Purpose:** Track moderation investigations

```sql
create table moderation_cases (
  id uuid primary key default gen_random_uuid(),
  
  -- Case info
  case_number varchar(50) unique not null,
  status varchar(20) default 'open',  -- open, resolved, escalated, dismissed
  priority varchar(20) default 'normal',  -- low, normal, high, urgent
  
  -- Target
  target_user_id uuid references users(id) not null,
  reported_content_type varchar(50),  -- photo, comment, profile
  reported_content_id uuid,
  
  -- Reporter
  reporter_id uuid references users(id),
  report_reason varchar(100),
  report_description text,
  
  -- Assignment
  assigned_to uuid references users(id),
  assigned_at timestamp with time zone,
  
  -- Resolution
  resolution varchar(50),
  resolved_at timestamp with time zone,
  resolved_by uuid references users(id),
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index idx_cases_status on moderation_cases(status);
create index idx_cases_assigned on moderation_cases(assigned_to, status);
create index idx_cases_target on moderation_cases(target_user_id);
create index idx_cases_reporter on moderation_cases(reporter_id);
```

### moderation_actions

**Purpose:** Individual moderation decisions

```sql
create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references moderation_cases(id),
  
  -- Actor
  moderator_id uuid references users(id) not null,
  moderator_role varchar(50) not null,
  
  -- Action
  action varchar(50) not null,  -- keep, remove, hide, warn, suspend, ban, escalate
  action_category varchar(50),  -- photo, user, appeal
  
  -- Target
  target_user_id uuid references users(id),
  target_photo_id uuid,
  
  -- Details
  reason text not null,
  internal_notes text,
  
  -- Metadata
  created_at timestamp with time zone default now(),
  ip_address inet,
  session_id uuid
);
```

### photos

**Purpose:** User photo metadata

```sql
create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  
  -- Photo info
  storage_path text not null,
  filename varchar(255),
  mime_type varchar(50),
  file_size_bytes integer,
  
  -- Categorization
  category varchar(50) not null,  -- profile, social, progress, health
  visibility varchar(50) default 'private',  -- public, community, private
  
  -- Status
  status varchar(50) default 'active',  -- active, hidden, removed, under_review
  moderation_status varchar(50) default 'pending',  -- pending, approved, rejected
  
  -- Metadata
  uploaded_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone,
  
  -- Analytics
  view_count integer default 0,
  report_count integer default 0
);

create index idx_photos_user on photos(user_id);
create index idx_photos_category on photos(category);
create index idx_photos_status on photos(status);
create index idx_photos_moderation on photos(moderation_status);
create index idx_photos_uploaded on photos(uploaded_at desc);
```

### photo_access_logs

**Purpose:** Track staff access to photos

```sql
create table photo_access_logs (
  id uuid primary key default gen_random_uuid(),
  
  -- Viewer
  viewer_id uuid references users(id) not null,
  viewer_role varchar(50) not null,
  viewer_ip inet not null,
  
  -- Photo
  photo_id uuid references photos(id) not null,
  photo_category varchar(50) not null,
  photo_owner_id uuid references users(id) not null,
  
  -- Context
  reason varchar(100) not null,
  reason_detail text,
  session_id uuid,
  
  -- Timestamps
  viewed_at timestamp with time zone default now()
);

create index idx_photo_access_viewer on photo_access_logs(viewer_id, viewed_at desc);
create index idx_photo_access_photo on photo_access_logs(photo_id);
create index idx_photo_access_owner on photo_access_logs(photo_owner_id);
create index idx_photo_access_reason on photo_access_logs(reason);
```

### terms_acceptances

(See Section 4 for schema)

### feature_flags

**Purpose:** System feature toggles

```sql
create table feature_flags (
  id uuid primary key default gen_random_uuid(),
  key varchar(100) unique not null,
  name varchar(255) not null,
  description text,
  
  -- State
  enabled boolean default false,
  rollout_percentage integer default 100,
  
  -- Targeting
  targeting_rules jsonb,  -- complex rules for who sees it
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  updated_by uuid references users(id)
);
```

### user_flags

**Purpose:** Internal user markers

```sql
create table user_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  flag_type varchar(50) not null,  -- high_risk, vip, support_escalation, etc.
  flag_reason text,
  
  -- Lifecycle
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  resolved_at timestamp with time zone,
  resolved_by uuid references users(id),
  
  unique (user_id, flag_type)
);

create index idx_user_flags_user on user_flags(user_id);
create index idx_user_flags_type on user_flags(flag_type);
create index idx_user_flags_active on user_flags(user_id) where resolved_at is null;
```

---

## SECTION 10 — API / ENDPOINT RECOMMENDATIONS

### Admin User Management

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/users | List users | manage_users | info |
| GET | /api/admin/users/:id | User detail | manage_users | info |
| PATCH | /api/admin/users/:id | Update user | manage_users | warning |
| POST | /api/admin/users/:id/suspend | Suspend account | suspend_users | critical |
| POST | /api/admin/users/:id/ban | Ban account | ban_users | critical |
| POST | /api/admin/users/:id/unsuspend | Lift suspension | suspend_users | critical |
| POST | /api/admin/users/:id/reset-onboarding | Reset onboarding | reset_onboarding | warning |
| POST | /api/admin/users/:id/revoke-sessions | Force logout | revoke_sessions | warning |
| POST | /api/admin/users/:id/impersonate | Login as user | impersonate_user | critical |

### Billing/Subscription Admin

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/subscriptions | List subscriptions | manage_subscriptions | info |
| GET | /api/admin/subscriptions/:id | Subscription detail | manage_subscriptions | info |
| POST | /api/admin/subscriptions/:id/cancel | Cancel subscription | manage_subscriptions | critical |
| POST | /api/admin/subscriptions/:id/extend | Extend courtesy | manage_subscriptions | warning |
| POST | /api/admin/subscriptions/:id/refund | Issue refund | process_refunds | critical |
| GET | /api/admin/billing/history | Billing history | manage_subscriptions | info |

### Role Assignment

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/roles | List roles | view_audit_logs | info |
| GET | /api/admin/roles/:id | Role detail | view_audit_logs | info |
| POST | /api/admin/roles | Create role | manage_roles | critical |
| PATCH | /api/admin/roles/:id | Update role | manage_roles | critical |
| DELETE | /api/admin/roles/:id | Delete role | manage_roles | critical |
| POST | /api/admin/users/:id/roles | Assign role | manage_roles | critical |
| DELETE | /api/admin/users/:id/roles/:roleId | Remove role | manage_roles | critical |
| GET | /api/admin/permissions | List permissions | view_audit_logs | info |

### Audit Log Queries

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/audit-logs | Query logs | view_audit_logs | info |
| GET | /api/admin/audit-logs/my-actions | Current user actions | view_audit_logs | info |
| GET | /api/admin/audit-logs/export | Export logs | view_audit_logs | warning |
| GET | /api/admin/audit-logs/stats | Log statistics | view_audit_logs | info |

### Photo Moderation

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/moderation/queue | Moderation queue | view_reported_photos | info |
| GET | /api/moderation/photos | All photos search | view_all_photos | warning |
| GET | /api/moderation/photos/:id | Photo detail | view_reported_photos | warning + photo_access_logs |
| POST | /api/moderation/photos/:id/action | Take action | moderate_photos | critical |
| POST | /api/moderation/photos/:id/note | Add internal note | moderate_photos | standard |
| GET | /api/moderation/cases | List cases | view_reported_photos | info |
| GET | /api/moderation/cases/:id | Case detail | view_reported_photos | info |
| POST | /api/moderation/cases/:id/assign | Assign case | moderate_photos | standard |
| POST | /api/moderation/cases/:id/resolve | Resolve case | moderate_photos | critical |
| POST | /api/moderation/cases/:id/escalate | Escalate case | moderate_photos | standard |

### Terms Acceptance

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| POST | /api/terms/accept-signup | Accept signup terms | public | info |
| POST | /api/terms/accept-billing | Accept billing terms | authenticated | info |
| GET | /api/terms/status | Check acceptance status | authenticated | info |
| POST | /api/terms/re-consent | Re-consent to updated terms | authenticated | info |

### Feature Flags

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/feature-flags | List flags | manage_feature_flags | info |
| GET | /api/admin/feature-flags/:key | Flag detail | manage_feature_flags | info |
| POST | /api/admin/feature-flags | Create flag | manage_feature_flags | warning |
| PATCH | /api/admin/feature-flags/:key | Update flag | manage_feature_flags | warning |
| DELETE | /api/admin/feature-flags/:key | Delete flag | manage_feature_flags | warning |
| POST | /api/admin/feature-flags/:key/toggle | Toggle flag | manage_feature_flags | warning |

### Internal Notes

| Method | Route | Purpose | Auth | Audit |
|--------|-------|---------|------|-------|
| GET | /api/admin/users/:id/notes | List notes | manage_users | internal-only |
| POST | /api/admin/users/:id/notes | Add note | manage_users | internal-only |
| PATCH | /api/admin/notes/:id | Update note | manage_users | internal-only |
| DELETE | /api/admin/notes/:id | Delete note | manage_users | internal-only |

---

## SECTION 11 — SECURITY & GOVERNANCE RULES

### Core Principles

1. **Least Privilege by Default**
   - New staff start with minimal access
   - Access granted incrementally with justification
   - Regular access reviews (quarterly)

2. **Explicit Permission Required**
   - No implicit access through "admin" title
   - Every capability requires explicit permission
   - Self-modification blocked at API level

3. **Separation of Concerns**
   - Moderation is separate from general admin
   - Billing is separate from user support
   - System config is separate from operations

### Photo Access Rules

**General Admin — NO ACCESS to:**
- User photos (any category)
- Photo galleries
- Photo metadata beyond count

**Moderator — CAN ACCESS:**
- Reported photos (all categories)
- Photos in assigned cases
- Cannot browse non-reported photos

**Senior Moderator — CAN ACCESS:**
- All reported photos
- All photos with reason provided
- Private/progress/health photos (with extra logging)

**Logged Events:**
- Every photo view by staff
- Search executed in all-photos view
- Download attempt (blocked and logged)
- Screenshot detection (if technically feasible)

### Data Handling Rules

**Prohibited:**
- Screenshots of sensitive user data
- Personal devices for admin access
- Copy-paste of user data to external systems
- Bulk export without legal approval
- Discussing user data in unsecured channels

**Required:**
- VPN for all admin access
- 2FA for all admin accounts
- Session timeout after inactivity
- Unique credentials per individual (no shared accounts)

### Incident Response

**Suspected Breach:**
1. Immediate session revocation for affected accounts
2. Audit log preservation
3. Notification to security team within 1 hour
4. User notification within 72 hours (if required)
5. Post-incident access review

**Insider Threat:**
1. Immediate suspension pending investigation
2. Full audit of user's actions (last 90 days)
3. Legal and HR notification
4. Preserved evidence chain

### Compliance

**Legal Hold:**
- Formal process for law enforcement requests
- All requests logged separately
- Legal review before any data disclosure
- Minimum necessary data principle

**Data Subject Requests:**
- Formal ticketing system
- 30-day response commitment
- Verification of identity required
- Audit of fulfillment

---

## SECTION 12 — UX COPY

### Signup Legal Text

```
By creating an account, you agree to our 
[Terms of Service](/terms) and [Privacy Policy](/privacy).
```

**Placement:** Bottom of signup form, above "Create Account" button.
**Style:** 14px, secondary text color, links underlined.

### Subscription Legal Text

```
☑ I agree to the Subscription Terms and authorize Atlas Core 
to charge my payment method $[AMOUNT] [FREQUENCY]. 
I understand that subscriptions automatically renew and 
can be cancelled anytime in my account settings.
```

**Placement:** Above payment button, below price display.
**Style:** 14px, checkbox required, link to full billing terms.

### Content Moderation Policy Summary

```
Atlas Core is a community built on respect and safety. 
We review content when necessary to protect our users 
and maintain platform quality. Content that violates 
our guidelines may be removed, and serious or repeated 
violations may result in account suspension.
```

**Placement:** Settings → Community Guidelines (if shown to users).
**Style:** Friendly but clear, no technical details.

### Admin Warning Banner (Sensitive Photo Access)

```
⚠️ SENSITIVE CONTENT — Private User Photo

You are viewing content that is private to this user. 
This access is logged and should only occur when necessary 
for safety, support, or legal compliance.

Reason logged: [REASON_SELECTED]
Session: [SESSION_ID]
```

**Placement:** Fixed banner at top of photo detail view for Progress/Health categories.
**Style:** Amber/warning color, cannot be dismissed, persists while viewing.

### Moderation Screen Labels

**Queue Filters:**
- "All Reported"
- "High Confidence Auto-Flags"
- "Awaiting Review"
- "Escalated"
- "My Assigned"

**Photo Category Badges:**
- Profile — Blue badge
- Social — Green badge
- Progress — Yellow badge
- Health — Red badge

**Action Buttons:**
- "Keep Content" — Secondary button
- "Remove Content" — Destructive button
- "Hide from Public" — Warning button
- "Warn User" — Secondary button
- "Suspend Account" — Destructive button
- "Escalate" — Primary button

### Audit Log Empty States

```
No audit events found.

Try adjusting your filters or date range.
Audit logs are retained for [RETENTION_PERIOD].
```

```
No actions recorded for this user.

Audit logging began on [DATE]. 
Contact support if you need historical data.
```

### Account Suspension Confirmation Modal

```
Suspend Account

You are about to suspend @username's account.

This will:
• Immediately block access to Atlas Core
• Preserve all user data
• Log this action for compliance

Required: Reason for suspension
[Dropdown: Terms violation / Fraud / Safety concern / Other]
[Text area: Additional details]

[Cancel] [Confirm Suspension]

⚠️ This action is logged and may be reviewed.
```

### Photo Removal Confirmation Modal

```
Remove Content

You are removing a photo from [USERNAME]'s account.

Category: [CATEGORY]
Uploaded: [DATE]
Reason: [REASON_SELECTED]

This action:
• Permanently deletes the photo
• Cannot be undone by the user
• Is logged for compliance

[Cancel] [Confirm Removal]

⚠️ Destructive action — Review carefully before confirming.
```

---

## SECTION 13 — FINAL RECOMMENDATION

### What to Build Now (V1 MVP)

**Must Have:**
1. **Terms Acceptance System**
   - Inline signup agreement (no checkbox)
   - Checkbox for subscription flow
   - Backend storage of acceptance records
   - Version tracking for re-consent

2. **Privacy Policy & Terms of Service**
   - Production-ready documents (Sections 2 & 3 above)
   - Jurisdiction review placeholders identified
   - Deploy to `/privacy` and `/terms`

3. **Basic Admin Console**
   - Overview dashboard
   - User list with basic info only
   - Subscription management
   - Simple audit log (last 30 days)

4. **Core RBAC**
   - `super_admin` and `admin_ops` roles
   - Role assignment interface
   - Basic permission checking on admin routes

5. **Audit Logging**
   - Schema from Section 8
   - Log all admin actions
   - User-visible vs internal-only distinction

**Should Have (V1.1, 4-6 weeks):**
- Reported content moderation queue
- `moderator` role with limited photo access
- Internal notes system
- User suspension workflows

### What Can Wait (V2+)

**Moderation Console Enhancements:**
- All-photos search capability
- Senior moderator role
- Appeals workflow
- Advanced filters and bulk actions
- Case management system

**Advanced Features:**
- Impersonation capability
- Feature flag system
- Complex analytics roles
- Automated moderation ML integration

### What Should Never Be in Default Admin

**Explicitly Excluded from General Admin Scope:**
- Workout history browsing
- Nutrition log access
- Body metrics viewing
- Photo galleries (any category)
- Location history
- Health data exports
- Social feed content (outside moderation)
- Raw analytics events with PII

### Cleanest V1 Architecture

```
Atlas Core V1
├── User-Facing
│   ├── Signup with inline legal acceptance
│   ├── Subscription with checkbox confirmation
│   ├── Settings with links to legal docs
│   └── Clean, minimal UI throughout
├── Admin
│   ├── Basic operational dashboard
│   ├── User account management (limited data)
│   ├── Subscription/billing ops
│   ├── Simple audit log viewer
│   └── Role assignment (super_admin only)
├── Backend
│   ├── Terms acceptance tracking
│   ├── Audit logging on all admin routes
│   ├── RBAC enforcement
│   └── Privacy Policy & ToS served
└── Data Model
    ├── users, roles, permissions tables
    ├── terms_acceptances table
    ├── admin_action_logs table
    └── subscription management
```

### Implementation Priority

**Week 1-2:** Legal documents + Terms acceptance system  
**Week 3-4:** RBAC foundation + Audit logging  
**Week 5-6:** Basic admin console (users, subscriptions)  
**Week 7-8:** Moderation queue (reported content only)

### Core Philosophy in Practice

1. **User Experience:** Frictionless, premium, clean
2. **Internal Controls:** Strict, explicit, fully audited
3. **Legal Compliance:** Disclosed appropriately, not performative
4. **Operational Security:** Least privilege, no surprises

Build the system where users never think about moderation machinery, but your internal controls are bulletproof. That's the Atlas Core standard.

---

**End of Spec**
