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

---

## Feature: Vendor Store Settings Migration

- Slug: vendor-store-settings
- Files: `tests/e2e/vendorStoreSettings/vendorStoreSettingsMigration.spec.ts` + `pages/vendorStoreSettingsPage.ts` (page object lives in the shared `pages/` dir like `adminSettingsPage.ts` — mirrors the Admin Settings Migration suite, by choice)
- Type: e2e
- Plugin gate: lite (with `@pro` cases for Pro-only fields)
- Roles: vendor
- REST seed: no (drives both UIs directly; no seeded state needed)
- Surface: new React vendor Store Settings `dashboard/new/#settings/store` ⇄ legacy vendor dashboard `dashboard/settings/store`. Both persist to the same `dokan_profile_settings` user meta, so edits must round-trip either direction.
- Status: done
- Notes: bi-directional 5-step sync per field (mirrors `adminSettingsMigration`): set on new → read on legacy → set on legacy + reload → read on legacy → read on new → set on new + reload → read on new. Plus a defaults check via `GET /dokan/v1/vendor-settings/store`. New-page fields mount per tab (click the tab first); new-page Save button is disabled until a change; legacy save is AJAX with a success toast.

### Happy Paths

- vendor: Store Title (`store_name`, text) stays in sync both directions between the new General tab and the legacy Store Name field. `@lite`
- vendor: Phone (`phone`, text) stays in sync both directions (new General ⇄ legacy). `@lite`
- vendor: Show email address (`show_email`, switch ⇄ legacy checkbox) toggles in sync both directions. `@lite`
- vendor: Terms & Conditions toggle (`enable_tnc`, new Policies switch ⇄ legacy checkbox) syncs both directions. `@lite`
- vendor: Support button name (`support_btn_name`, text, new Business tab ⇄ legacy) syncs both directions. `@pro`

### Edge Cases

- vendor: the store settings schema (`GET /dokan/v1/vendor-settings/store`) exposes the documented defaults — `store_name=''`, `phone=''`, `show_email='no'`, `enable_tnc='off'`. `@lite`
