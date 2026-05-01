# Admin — Test Cases & Edge Cases

Scope: WP admin login/logout flow, the Dokan main dashboard
(`/wp-admin/admin.php?page=dokan-dashboard`, the React shell that hosts every
admin sub-page), and the admin promo-notice section.

Conventions:
- **A** = admin (`administrator`)
- "Dashboard" = the Dokan dashboard shell at `?page=dokan-dashboard`
- "Promo notices" = the marketing/feature-announcement card list rendered by `dokan-admin-notices`

---

## 1. Authentication

| #    | Title                                  | Steps                                                                           | Expected                                                              |
|------|----------------------------------------|---------------------------------------------------------------------------------|-----------------------------------------------------------------------|
| 1.1  | Admin can log in (TC1)                 | Fresh context → fill `wp_login` form → submit                                   | WP dashboard heading visible, session cookies set                     |
| 1.2  | Admin can log out (TC2)                | After login, hover user menu → click Log Out                                    | Login form re-renders                                                 |
| 1.3  | Login with bad password                 | Fill correct username, wrong password                                           | `#login_error` notice rendered, no auth cookie                        |
| 1.4  | Login with bad username                 | Fill garbage username                                                            | Same error message (WP doesn't disclose user existence)               |
| 1.5  | Logout while logged out                 | Visit `/wp-login.php?action=logout` directly with no cookie                    | Redirected to login form, no error                                    |

Edge cases:
- Multi-tab logout: logging out from one tab does not invalidate other tabs until they re-request a nonce-protected resource.
- Remember-me checkbox: extends auth cookie lifetime (15d → 14d default).
- 2FA plugins (not enabled in test env): would interpose between password submit and dashboard.

## 2. Dokan dashboard shell (React)

| #    | Title                                                              | Steps                                       | Expected                                                                                       |
|------|--------------------------------------------------------------------|---------------------------------------------|------------------------------------------------------------------------------------------------|
| 2.1  | Dashboard renders all widget headings (TC3)                        | A → `Dokan → Dashboard`                     | Headings: To-Do, Analytics, Monthly Overview, Daily Sales Chart, Vendor Metrics, All-Time Marketplace Stats, Top Performing Vendors, Most Reviewed Products |
| 2.2  | Dashboard initial REST calls succeed                               | Inspect Network on load                      | All `dokan/v*/admin/dashboard/*` GETs return 2xx                                                |
| 2.3  | Dashboard renders for fresh sites (no orders/vendors)              | Reset DB → load                              | Heading widgets still render with empty-state copy                                               |
| 2.4  | Dashboard widget refresh                                           | Toggle date range filter                     | REST refetched with new params                                                                   |

Notes:
- The dashboard is the React shell that hosts sub-pages (abuse-reports, announcements, vendors, modules, etc.). Health of this folder reflects the SPA bootstrap path.

## 3. Promo notices

| #    | Title                                                              | Steps                                                                                    | Expected                                                            |
|------|--------------------------------------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| 3.1  | Multiple promo notices render with correct count (TC4)             | Mock `/notices` endpoint → load dashboard                                                | Promo notice heading visible, count matches mocked array length     |
| 3.2  | A promo notice has a non-empty title (TC5)                         | Same mock                                                                                 | First visible `.dokan-message-title` is truthy                      |
| 3.3  | Notice CTA opens correct URL                                       | Click CTA on a notice                                                                    | New tab to advertised URL                                            |
| 3.4  | Notice dismiss persistence                                         | Dismiss → reload                                                                          | Dismissed notice does not reappear (per-user pref stored server-side) |

Known issues / edge cases:
- The promo notice endpoint can be slow or unavailable; tests use `mockPromoNotices()` to neutralize that for deterministic CI.
- Notices with HTML in title need to be escaped (current code uses `<RawHTML>` — same XSS concern as abuse-reports `<RawHTML>`).
- Empty notices array should not render the heading section at all.

## 4. Edge cases & follow-ups

- Two admin sessions opening the dashboard concurrently — should both render without nonce collisions.
- Capability-restricted admin (custom role with subset of caps) should still load the dashboard; specific widgets gated by capability checks.
- RTL rendering of dashboard widgets.
- High-DPI screen rendering of charts (image-snapshot fragility).

## 5. Suggested follow-ups (not in this PR)

1. Add explicit REST tests for the dashboard endpoints (status, summary, totals).
2. Visual snapshot of the empty-state dashboard.
3. Capability boundary test — `editor` cap should not access Dokan dashboard.
4. Notice dismissal regression test (dismissed notice doesn't reappear after reload).
