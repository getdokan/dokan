# Dashboard — Test Cases & Edge Cases

Scope: the legacy vendor dashboard at `/dashboard/` (Vue 2.7 era), the new
React vendor dashboard at `/dashboard/?path=…` (5.0.0+), and the admin Dokan
dashboard shell at `/wp-admin/admin.php?page=dokan-dashboard`.

This folder is a *smoke* layer — verifying menus, widgets, and shell render —
not a deep CRUD layer for individual menus (those live in their own folders).

Conventions:
- **A** = admin
- **V1** = vendor `vendor1`
- "Legacy vendor dashboard" = `/dashboard` (Vue templates)
- "New vendor dashboard" = `/dashboard/?path=%2Fanalytics%2FOverview` (React)
- "Admin Dokan dashboard" = `/wp-admin/admin.php?page=dokan-dashboard` (the React shell)

---

## 1. Vendor dashboard (legacy)

| #    | Title                                                                  | Steps                                                              | Expected                                                                       |
|------|------------------------------------------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------------------------------|
| 1.1  | Vendor lands on /dashboard and sees core widgets (TC: vendor can view) | V1 → `/dashboard`                                                   | Profile-completeness, At-A-Glance, Graph, Orders pie chart, Reviews widgets   |
| 1.2  | Vendor sees full menu list (TC: vendor can view dashboard menus)        | Same                                                                | Menus rendered: Dashboard, Products, Orders, Coupons, Reports, Reviews, Withdraw, Reverse Withdrawal, Booking, Auction, Inbox, Subscription, Tools, Settings, Visit Store, Edit Account, etc. |
| 1.3  | Pro-only menus only render with Pro                                     | V1 with Pro disabled                                               | Booking, Auction, Subscription, Reverse Withdrawal etc. hidden                 |
| 1.4  | Modal dismisser fires                                                    | First nav after Pro 5.0.0 → modal pops                              | `.vendor-announcement-modal` auto-closes via `addLocatorHandler`              |
| 1.5  | Direct sub-page link still loads dashboard chrome                        | V1 → `/dashboard/products`                                          | Sidebar + header still rendered                                                |

## 2. Admin Dokan dashboard (skipped today)

| #    | Title                                                                          | Notes                                                                                       |
|------|--------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 2.1  | Admin Dokan dashboard renders (`test.skip` per TODO)                            | Smoke that the React shell mounts; ToDo, Analytics, Monthly Overview, Daily Sales widgets   |
| 2.2  | Admin dashboard hosts sub-page routes                                            | `?page=dokan-dashboard#/abuse-reports`, `#/announcement`, etc. all mount under this shell    |

The admin smoke test is currently skipped pending a heading-selector update;
overlap with the `admin/` folder which already covers most of this.

## 3. New vendor dashboard (React)

| #    | Title                                                                          | Steps                                                              | Expected                                                                                                                                    |
|------|--------------------------------------------------------------------------------|--------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| 3.1  | New dashboard mounts with default route                                         | V1 → `/dashboard/?path=%2Fanalytics%2FOverview`                    | React shell + Overview analytics card visible                                                                                              |
| 3.2  | Side menu navigation                                                            | Click each menu item                                                | URL hash updates, route mounts                                                                                                              |
| 3.3  | New dashboard modal dismisser                                                    | First nav after Pro 5.0.0                                            | `.vendor-announcement-modal` auto-closes                                                                                                    |
| 3.4  | Pro-only React menus only with Pro                                              | Disable Pro                                                          | Booking, Subscription, Auction routes return 404 / blocked                                                                                  |

Currently no concrete test in this file targets the new dashboard explicitly;
the legacy tests still pass against `/dashboard` and the new dashboard is
exercised by feature-specific folders (announcements, products, etc.).

## 4. Edge cases

- **Capability:** vendor pending-approval state should still allow viewing dashboard but hide Withdraw and Products.
- **Empty data states:** new vendor (zero orders, zero reviews) should show empty-state copy in widgets, not error.
- **Permission boundaries:** admin direct-visiting `/dashboard` (a vendor URL) should redirect or render the front-end vendor dashboard logic.
- **Currency formatting:** widget values respect WC currency setting.
- **Network slowness:** profile-completeness widget makes an AJAX call; `addLocatorHandler` for modal must not interfere with it.

## 5. Suggested follow-ups (not in this PR)

1. Re-enable admin dashboard test (TC currently skipped) — overlap with `admin/` folder, decide which owns it.
2. Add explicit React-route smoke per menu in the new vendor dashboard.
3. Capability boundary tests (admin → vendor URL, customer → vendor URL).
4. Empty-state assertion test with a fresh vendor account.
5. Visual regression on the legacy dashboard (theme breaks would land here).
