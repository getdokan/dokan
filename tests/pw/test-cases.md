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

## Feature: PayPal Marketplace

- Slug: paypal-marketplace
- Files: `tests/e2e/paypal-marketplace/` — 18 spec files + `paypalMarketplacePage.ts`, `helpers.ts`, `paypalMarketplaceCardCheckout.ts`
- Type: e2e
- Plugin gate: pro
- Roles: admin, vendor, customer, guest
- REST seed: yes (six-key vendor seeding contract — see the folder catalogue)
- Surface: WooCommerce › Settings › Payments › Dokan PayPal Marketplace; classic + block checkout; vendor withdraw; `?wc-api=dokan-paypal` webhook endpoint
- Status: partial — 209 tests written, money path never executed
- Seeding: mu-plugins `dokan-paypal-marketplace-test-helpers.php` (+ `-currency-`, `-edge-probes`, `-subscription-`). Live PayPal sandbox credentials required; every money case is gated on `hasCredentials` and declares a skip reason when absent.

> **Deviates from the one-feature-one-folder scaffold, by choice** — like `admin/`, this is one
> folder holding many `<area>.spec.ts` files, split by PayPal surface rather than by feature.
>
> **Per-case detail lives in `tests/e2e/paypal-marketplace/test-cases.md`** (212 catalogued cases,
> checkbox per case, `PP-<AREA>-NN` ids). That file is the source of truth for this feature; the
> block here is the index entry. `reconcile.py` in the same folder diffs catalogued vs implemented
> vs actually-executed and is the guard against a green run that silently skipped cases.
>
> **Invisible to the coverage crawler.** `_coverage.teardown.ts:88` counts a feature only when its
> `feature-map.yml` value is `true` AND a test whose title *exactly equals the key* executed. Every
> test here is `PP-…`-prefixed, so none can ever match. The three `true` flags under
> `- page: 'PayPal Marketplace'` are satisfied by `tests/e2e/payments/payments.spec.ts`, not by this
> folder. Closing that gap is a naming decision (prose titles, or an id→key map in the crawler), not
> a boolean flip — left open deliberately.

### Happy Paths

- admin: enable the module, configure the gateway (merchant id, sandbox client id/secret, `test_mode`), and have the settings survive a reload — `PP-SET` (25).
- vendor: connect a PayPal account through onboarding and show the connected state — `PP-ONB` (18).
- customer: pay with PayPal on the classic shortcode checkout and on the block checkout — `PP-CHK` (15), `PP-BLK` (7).
- customer: a multi-vendor cart produces one purchase unit per vendor and reconciles to the order total — `PP-SPL` (12).
- admin: disbursement books the vendor share and the admin commission on order completion — `PP-DIS` (14).
- admin: refund an order (full and partial) and see the reversal reflected — `PP-REF` (14).
- vendor: withdraw via the `dokan-paypal-marketplace` method — `PP-WDR` (8).
- guest: PayPal webhook deliveries drive the documented state transitions — `PP-WHK` (25).
- vendor: buy a vendor-subscription pack through the gateway — `PP-SUB` (10).
- customer: unbranded Advanced Card (UCC) card fields render when the gate is open — `PP-UCC` (7).

### Edge Cases

- Zero-decimal and unsupported store currencies; rounding on a three-way split — `PP-CUR` (10).
- Cart/session edge and error paths, including an unconnected vendor in the cart — `PP-EDG` (12).
- 3D Secure gating — card fields absent when UCC is off, for a non-UCC store country, or with the standard button type — `PP-3DS` (4).
- Guest (unauthenticated) checkout — `PP-GST` (5).
- Pre-flight: fail loudly when credentials are required but missing, rather than skipping to green — `PP-PRE` (4).

### Negative Cases

- guest: module REST routes reject an unauthenticated caller; IDOR on order-scoped routes; no secret exposure — `PP-SEC` (15).
- guest: unsigned/malformed webhook deliveries cannot mutate state and raise no PHP fatal — part of `PP-WHK`.
- Stored and reflected XSS in gateway title/description and settings round-trip — `PP-XSS` (7).

### Backlog / declared gaps

- **73 of 212 cases have never executed** — the entire money path (`PP-CHK`, `PP-SPL`, `PP-DIS`, `PP-REF`, `PP-ONB`). Written, unproven; blocked on an authorised capture run, not on capability.
- `HAS_REAL_MERCHANTS` validates merchant-id *format* only — it cannot see PayPal-side consent, so pre-flight can report "money tests will run" while every capture would fail.
- Runtime dependency on the Stripe mu-plugin: `paypalMarketplaceSubscriptions.spec.ts` seeds packs via `dokan-test-express/v1`. Needs those two routes duplicated into `dokan-paypal-marketplace-subscription-test-helpers.php`.
- 215 `page.locator()` calls and 25 selector maps still live in the spec files instead of `paypalMarketplacePage.ts`.
