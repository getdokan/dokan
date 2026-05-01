# Vendor — Test Cases & Edge Cases

Scope: vendor account-management flows on the front-end — registration via
`/vendor-onboarding/`, login via `/my-account/`, logout, and account-details
update from the vendor dashboard.

This folder is the *vendor-side* mirror of `customer/`. Vendor dashboard
*content* (products, orders, withdraw, etc.) is covered in feature folders.

Conventions:
- **V1** = vendor (`vendor1`)
- "Vendor onboarding" = `/vendor-onboarding/` (Dokan 5.0.0+ replaces direct WC register page for sellers)
- "Account details" = `/dashboard/edit-account/`

---

## 1. Registration

| #    | Title                                                          | Steps                                                                                          | Expected                                                                                  |
|------|----------------------------------------------------------------|------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 1.1  | Vendor can register via /vendor-onboarding/ (TC: vendor can register) | Fresh context → `/vendor-onboarding/` → fill name+email+pw → submit                            | New user with `seller` role; redirected into onboarding wizard or dashboard               |
| 1.2  | Existing-email registration                                     | Re-submit with already-used email                                                              | WP error: "An account is already registered with your email address"                      |
| 1.3  | Weak password                                                   | Submit with short password                                                                     | WC strength meter blocks (or warns)                                                       |
| 1.4  | Honeypot / captcha (if enabled)                                 | Fill form normally                                                                              | Submission accepted; honeypot field stays empty                                            |
| 1.5  | Onboarding skipped via direct dashboard hit                      | Newly registered V1 → `/dashboard`                                                              | Dashboard renders; onboarding can be revisited later                                       |

**Known issue (5.0.0):** the page object handles the `vendor-onboarding`
template that renders both `form-login.php` and the registration template
side-by-side; selectors must scope to the registration template.

## 2. Login / Logout

| #    | Title                                              | Steps                                                            | Expected                                                              |
|------|----------------------------------------------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| 2.1  | Vendor can log in (TC: vendor can login)           | `/my-account/` → fill creds → submit                            | `/dashboard/` rendered                                                |
| 2.2  | Vendor can log out (TC: vendor can logout)         | After login → `/my-account/customer-logout`                      | Login form re-rendered                                                 |
| 2.3  | Login with bad password                             | Submit wrong pw                                                  | Inline error                                                           |
| 2.4  | Vendor cannot log in via WP `/wp-login.php`         | Fill creds at WP login form                                      | WC redirects vendors to `/my-account/`; cookie may not allow `/wp-admin` |

## 3. Account details

| #    | Title                                                                       | Steps                                                                              | Expected                                                              |
|------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| 3.1  | View account details menu page (TC: vendor can view account details)        | V1 → `/dashboard/edit-account`                                                     | Account fields rendered                                                |
| 3.2  | Update account details (TC: vendor update account details)                   | Change name + email + display name → save                                          | Persists across reload                                                |
| 3.3  | Update with invalid email                                                    | `not-an-email`                                                                     | WC client-side or server-side validation blocks                       |
| 3.4  | Update with mismatched password fields                                       | Two new-password fields differ                                                     | Inline error                                                          |

## 4. Edge cases

- **Vendor announcement modal:** every dashboard navigation pops the modal in 5.0.0+. Page object's inlined `closeAnnouncementModal` registers a handler.
- **Capability:** vendor with `dokandar` cap should reach dashboard; capability removal mid-session should soft-redirect on next request.
- **Display name vs username:** changing display name should not re-key the auth cookie; tests should not re-login after.
- **Logout while on a deep route** (e.g. `/dashboard/products/edit?id=…`): logout should still work and redirect to login.

## 5. Suggested follow-ups (not in this PR)

1. Onboarding wizard step-by-step coverage (currently not exercised here).
2. Vendor profile-completeness widget — separate folder; cross-reference.
3. REST coverage: vendor token cannot list other vendors' withdraws (security boundary, complements `withdraws` folder once that one is reimplemented).
4. Negative: vendor cannot update another vendor's account via `/wc/v3/customers`.
