# Dokan Playwright — Test Cases (skill author/build sheet)

This file is the QA-authored input the `dokan-automation` skill reads to scaffold
spec folders. One `## Feature:` block per feature. The exhaustive per-route
checklists live in `test-cases/` (`new-dashboards-test-cases.md`); seeding
strategy in `test-cases/admin-dashboard-seeding-strategy.md`.

> **Admin-dashboard folder convention:** all admin React-dashboard areas
> (vendors, withdraw, settings, modules, dashboard-home, …) live together in the
> single `tests/e2e/admin/` folder — one `<area>.spec.ts` + `<area>Page.ts` per
> area — instead of separate top-level `admin-<area>/` folders. This keeps the
> whole admin surface in one place and avoids folder sprawl. (Deviates from the
> skill's default one-feature-one-folder scaffold, by choice.)

---

## Feature: Admin Vendors List

- Slug: admin-vendors
- Files: `tests/e2e/admin/adminVendors.spec.ts` + `tests/e2e/admin/adminVendorsPage.ts` (lives in the shared `admin/` folder — see convention note above)
- Type: e2e
- Plugin gate: lite
- Roles: admin, vendor, customer
- REST seed: yes
- Surface: wp-admin/admin.php?page=dokan-dashboard#/vendors (new React admin dashboard, AdminDataViews)
- Status: done
- Seeding: admin-only. Vendor state created via `apiUtils.createStore` + `updateStoreStatus` (admin auth); no vendor UI driven. See `test-cases/admin-dashboard-seeding-strategy.md` § Vendors list.

### Happy Paths

- admin: view the Vendors list — DataViews table + Vendor/Phone/Registered/Status columns render, ≥1 seeded row, no PHP fatal.
- admin: Add Vendor button navigates to `#/vendors/create`.
- admin: search by store name filters the list to the matching vendor only.
- admin: Approved tab shows an enabled vendor with the green "Enabled" pill.
- admin: Pending tab shows a disabled vendor with the "Disabled" pill.
- admin: approve a pending vendor via row action → confirm modal → status flips to Enabled (PUT `/dokan/v1/stores/:id/status` `{status:'active'}`).
- admin: disable an enabled vendor via row action → confirm modal → status flips to Disabled (`{status:'inactive'}`).
- admin: Edit row action navigates to `#/vendors/edit/:id`.
- admin: bulk-approve pending vendors → POST `/dokan/v1/stores/batch` `{approved:[ids]}` → rows become Enabled. `@exploratory` (bulk-toolbar selectors pending first-run verification).

### Edge Cases

- admin: search with no match shows the empty state / zero rows.
- admin: reloading on `#/vendors` preserves the hash route and re-mounts the list.
- admin: sorting the Registered column requests `orderby=registered` from the API. `@exploratory`

### Negative Cases

- vendor: a logged-in vendor cannot access the admin Vendors page (no admin dashboard UI).
- customer: a logged-in customer cannot access the admin Vendors page.

### Backlog (not yet scaffolded — see new-dashboards-test-cases.md § Vendors list)

- Pro: Store Categories button + Categories column + `?store_categories=` filter (`@pro`).
- Pro: "Switch to" row action eligibility + navigation (`@pro`).
- See Products / See Orders row actions (full-page nav to wp-admin).
- Status tab live counts from `X-Status-*` headers; pagination/per-page.
- Security: unauthenticated PUT/POST to stores endpoints; XSS in search; IDOR on `:id` status PUT.
- a11y: keyboard operation of tabs/row actions; focus-trap in the confirm modal; ARIA table roles.
- Phone column em-dash for a vendor with no phone; Registered back-dated sort order (DB-seeded via `dbUtils.setUserRegisteredDate`).

## Feature: Vendor Setup Wizard (React)
Slug: vendor-setup-wizard
Type: e2e
Plugin gate: lite
Roles: vendor, guest
Storage state: none (fresh vendor per worker via REST seed + UI login)
REST seed: yes
Status: build

### Happy Paths
- vendor sees the welcome screen: site branding, welcome message, Skip and Start Journey actions
- vendor completes the wizard end to end: store step (searchable country/state combobox, city, zip, street) saves and advances to Payment; PayPal email saves and advances to Ready; `dokan_profile_settings` holds every submitted field
- vendor can skip the wizard from the welcome screen and land on the dashboard
- vendor finishing the wizard reaches the dashboard through Explore Dashboard

### Edge Cases
- re-entering the store step after a save shows the previously saved values prefilled

### Negative Cases
- a partially filled bank account is rejected on Next with an inline error and the vendor stays on the payment step
- a guest hitting the wizard URL never sees the wizard (request falls through to the normal site)
