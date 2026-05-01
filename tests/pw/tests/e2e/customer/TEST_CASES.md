# Customer — Test Cases & Edge Cases

Scope: customer registration, login, logout, becoming-a-vendor flow, account
profile updates, and the (currently skipped) cart/checkout coverage.

Conventions:
- **C1** = the seeded `customer1` user
- "My Account" = `/my-account`
- "Become a vendor" = the registration flow that promotes a customer to seller via the role radio (now hidden in 5.0.0; submitted via injected `register` form field)

---

## 1. Registration

| #    | Title                                              | Steps                                                                                              | Expected                                                                              |
|------|----------------------------------------------------|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| 1.1  | Customer can register (TC: customer can register)  | `/my-account/` → fill name+email+pw → submit                                                       | New user created with `customer` role, redirected to /my-account/ logged in           |
| 1.2  | Customer becomes a vendor (TC: customer can become a vendor) | Same form with vendor radio (programmatically) → submit                                            | New user created with `seller` role; vendor onboarding triggered                       |
| 1.3  | Register with existing email                       | Submit form with already-used email                                                                | WP error: "An account is already registered with your email address"                  |
| 1.4  | Register with weak password                        | Submit short password                                                                              | WC password strength meter blocks (or warns)                                          |
| 1.5  | Register with invalid email                        | `not-an-email`                                                                                     | HTML5 validation blocks submit                                                         |
| 1.6  | Reject when role hidden input is tampered          | Force submit with role=`administrator`                                                              | Server still creates as customer; role override is server-side guarded                |

**Known issue (5.0.0):** the customer/vendor role radio is now a hidden input
and the submit button click is intercepted. The page object submits via
`form.submit()` with an injected `<input name="register">` so the form actually
posts. This was the fix in commit `71cfc1b07`.

## 2. Login / Logout

| #    | Title                          | Steps                                                            | Expected                                                              |
|------|--------------------------------|------------------------------------------------------------------|------------------------------------------------------------------------|
| 2.1  | Customer can login (TC: customer can login) | `/my-account/` → fill creds → submit                            | Account dashboard rendered                                            |
| 2.2  | Customer can logout (TC: customer can logout) | After login → click Logout                                       | Login form back, no auth cookie                                        |
| 2.3  | Login with bad password         | Submit wrong pw                                                  | Inline error                                                          |
| 2.4  | Login while already logged in   | Session cookie set → visit `/my-account/`                        | Dashboard, no re-login form                                            |
| 2.5  | Logout from one tab logs out other tabs | Open two tabs → logout from one                                  | Other tab loses access to nonce-protected calls (eventual)            |

## 3. Account profile

| #    | Title                                                                       | Steps                                                                              | Expected                                                              |
|------|-----------------------------------------------------------------------------|------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| 3.1  | Add billing address (currently `test.skip`)                                  | `/my-account/edit-address/billing` → fill → save                                  | Saved values persist across reload                                    |
| 3.2  | Add shipping address (currently `test.skip`)                                 | `/my-account/edit-address/shipping` → fill → save                                  | Saved values persist                                                   |
| 3.3  | Add customer details (TC: customer can add customer details)                 | `/my-account/edit-account` → fill → save                                          | Saved values persist                                                   |
| 3.4  | Empty billing required fields                                                | Submit with required fields blank                                                  | HTML5 validation blocks                                                |
| 3.5  | Country/state dependent dropdown                                             | Pick country → state list updates                                                  | Sub-region select shows valid options                                  |

The 3.1 / 3.2 / cart/checkout (TCs `add product to cart`, `buy product`,
`buy multi-vendor products`) are currently skipped with TODO markers. Re-
enable when the underlying flow is stable.

## 4. Cart / Checkout (currently skipped)

| #    | Title                                  | Notes                                                                |
|------|----------------------------------------|----------------------------------------------------------------------|
| 4.1  | Add product to cart                    | Skipped; needs WC AJAX-add-to-cart selector update for theme refresh |
| 4.2  | Buy single-vendor product              | Skipped; payment gateway selectors reshaped                          |
| 4.3  | Buy multi-vendor products              | Skipped; cart commission split to verify                             |

## 5. Edge cases & follow-ups

- **Hidden role input (5.0.0):** the form-submit fix is the single load-bearing change for register/become-a-vendor in this folder. Watch the PR description for `71cfc1b07` if regressing.
- **`user_email` collision:** subsequent test runs reuse seeded emails; flake when env is not reset between runs. Test data uses `Date.now()` to avoid that for register.
- **Honeypot / spam checks:** WC bookable form anti-bot field (`wc-booking-honey`) — not relevant here, but worth noting if the form gains spam protection later.
- **Network: slow registration response** — `form.submit()` does a full nav, so Playwright's load wait is correct; don't rely on `networkidle`.

## 6. Suggested follow-ups (not in this PR)

1. Re-enable cart / checkout tests after fixing WC theme selectors.
2. Add a test for the `become-a-vendor` flow after registration (confirm vendor dashboard accessible).
3. REST coverage for `/wc/v3/customers` create as admin (smoke).
4. Negative permission test: customer cannot list other customers' orders via `/wc/v3/orders`.
