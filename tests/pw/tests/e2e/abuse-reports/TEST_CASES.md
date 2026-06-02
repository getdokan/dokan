# Abuse Reports — Test Case Checklist (New Dashboard)

Scope: Dokan Pro report-abuse module, new React dashboard experience only (DataViews admin list/modal/delete, customer-facing form that feeds it, settings, REST, email). Checked = already covered by the existing spec; unchecked = to add. New cases carry a type tag and priority (🔴 high, 🟡 medium, ⚪ low).

## References

- **Docs:** https://dokan.co/docs/wordpress/modules/dokan-report-abuse/
- **Admin settings path:** Dokan → Settings → **Moderation → Product Report Abuse**. "Reported by" = restrict reporting to **logged-in users only** (unchecked ⇒ guests allowed); "Reasons for Abuse Report" = add a reason via the input field, remove via the cross (×) icon.
- **Requirements:** WooCommerce + Dokan Lite + Dokan Pro (enable at Dokan → Modules → Report Abuse).
- **Customer form (per docs):** select **reason** (radio), **Name**, **Email**, **Explanation** (textarea). Docs state the success popup reads **"Thank you for your response"**, but the code returns **"Your report has been submitted…"** — tests must assert the *actual* rendered string and reconcile doc vs code.
- **Source surfaces:** `dokan-pro/modules/report-abuse/` — new admin dashboard `src/admin/dashboard/ReportAbusePage.tsx`; REST `includes/RestController.php`; settings `includes/AdminSettings.php`; customer flow `includes/SingleProduct.php` + `includes/Ajax.php` + `views/report-form.php`; email `includes/AdminEmail.php`.
- **Existing spec:** `tests/pw/tests/e2e/abuse-reports/abuseReports.spec.ts` (+ `abuseReportsPage.ts`).

## Customer Report Flow (product page)

- [x] Customer sees admin-configured custom reason as a radio/select option _(existing: TC4 - Customer Sees Custom Abuse Reason on Product Page)_
- [x] Logged-in customer submits a valid report; success message shows _(existing: TC5 - Logged-in Customer Submits a Valid Abuse Report)_
- [x] Guest submits report when "Reported by logged-in only" is OFF (name/email fields visible) _(existing: TC22 - Guest Can Submit Report (Setting A Off))_
- [x] Second report submitted to seed bulk-delete prerequisites _(existing: TC6 - Submit a Second Report)_
- [ ] Customer submits with reason not selected → form blocks submit, validation error, no API call (validation) 🔴
- [ ] Guest (Setting A OFF) submits with empty name → form rejects (required field) (validation) 🔴
- [ ] Guest (Setting A OFF) submits with empty email → form rejects (required, type=email) (validation) 🔴
- [ ] Guest (Setting A OFF) submits with invalid email format → HTML5 + server is_email() rejects (validation) 🔴
- [ ] Customer submits with empty description → succeeds (description optional); admin row shows empty description (functional) 🟡
- [ ] Guest fields render only when Setting A is OFF and user not logged in; toggle ON hides name/email (ui-state) 🔴
- [ ] Logged-in user never sees guest name/email fields regardless of Setting A (functional) 🟡
- [ ] Guest blocked when Setting A is ON → login popup shown instead of report form; report not created (functional) 🔴
- [ ] Double-submit prevented (fieldset disabled on submit) → only one request/DB row (functional) 🔴
- [ ] Success message text matches Ajax response ("Your report has been submitted...") and modal closes (functional) 🔴
- [ ] Loading state on submit button (spinner/disabled) until response (ui-state) 🟡
- [ ] Submit on deleted/draft product → server "Product not found" error; form stays open (negative) 🟡
- [ ] Module disabled → Report Abuse button absent from product page DOM (not just hidden) (ui-state) 🟡
- [ ] Reason list on form matches admin-configured reasons in order; new reasons appear after refresh (functional) 🔴
- [ ] Vendor correctly captured from product on submission (functional) 🔴
- [ ] Logged-in customer_id captured server-side (not stored as name/email) (functional) 🔴
- [ ] reported_at uses server time (current_time('mysql')), not client time (functional) 🟡
- [ ] Nonce/CSRF: Ajax submit without/with wrong nonce → rejected, no report created (security) 🔴
- [ ] Custom reason label with HTML/script renders escaped on form (no JS execution) (security) 🔴
- [ ] Very long description (>65535 chars) persists/handles gracefully; shows in admin modal (edge) ⚪
- [ ] Reason/name/email length trimming via wp_trim_words (reason 191, name 191, email 100) (edge) ⚪
- [ ] Direct POST with missing/empty form_data → 400 "Missing form_data." (validation) 🟡
- [ ] Direct POST with missing product_id → 400 "Missing product_id param" (validation) 🟡

## Admin Settings (module config + reasons)

- [x] Enable Report Abuse module; enabled state persists _(existing: TC1 - Enable Report Abuse Module)_
- [x] Settings section renders title, doc link, "Reported by" + "Reasons" subheadings _(existing: TC2 - Settings Section Renders)_
- [x] Admin adds a custom reason; saved and persists across reload _(existing: TC3 - Admin Adds a Custom Abuse Reason)_
- [x] Admin disables Setting A and removes custom reason (cleanup/teardown) _(existing: TC18 - Admin Disables Setting A and Removes Custom Reason)_
- [ ] Add empty/whitespace-only reason → prevented client-side or rejected by backend (validation) 🔴
- [ ] Add duplicate reason → prevented or rejected; no duplicate in list (validation) 🔴
- [ ] Special chars/emoji/HTML in reason → sanitized/escaped; safe in settings UI (security) 🔴
- [ ] Reason with HTML-like text displays as literal text in settings UI, not interpreted (security) 🔴
- [ ] Very long reason (256+ chars) → capped/truncated (DB VARCHAR 191) or validation error (edge) 🔴
- [ ] Non-ASCII UTF-8 reasons (Chinese/Arabic/Cyrillic) stored and rendered without mojibake (i18n) 🟡
- [ ] "Reported by" toggle persists ON after save + reload (option value verified) (functional) 🔴
- [ ] Setting A OFF allows guest report submission end-to-end (functional) 🔴
- [ ] Setting A ON blocks guest report (login prompt / submission error) (functional) 🔴
- [ ] Save success feedback (toast/notice), no console errors (ui-state) 🔴
- [ ] Save failure (backend error) → error notice, form data retained (negative) 🟡
- [ ] Save with no fields modified → no error, no-op/success, settings unchanged (functional) ⚪
- [ ] Remove a reason that has existing reports → DB consistency; old reports still render with their reason label (functional) 🔴
- [ ] Non-admin (vendor) cannot access settings page → denied/403 (manage_options enforced) (permission) 🔴
- [ ] Guest cannot access settings page → redirect to login / 401-403 (permission) 🔴
- [ ] Reason reorder (drag & drop) persists order in DB and on form (if supported; uncertain) (functional) 🟡
- [ ] Module disable then re-enable → settings preserved or defaults re-initialized consistently (functional) 🟡
- [ ] Remove all reasons then deactivate/reactivate module → default reasons re-populated without duplicates (edge) 🟡
- [ ] Concurrent save by two admins → last-write-wins, no option corruption (edge) ⚪
- [ ] Max reasons limit (if any) handled gracefully; unlimited otherwise (edge) 🟡
- [ ] Admin settings labels translate in non-English locale (i18n) 🟡

## New Admin Dashboard — DataViews List

- [x] Submitted report appears in DataViews list (reason/product/reporter columns visible, row count > 0) _(existing: TC7 - Submitted Report Appears in Admin DataViews List)_
- [ ] All columns render correct data (Reason, Product, Vendor, Reported By, Reported At) from REST payload; links point to correct admin pages (functional) 🔴
- [ ] Reported By renders all three states: authenticated (name+email+link), guest (name+email, no link), anonymous ("Anonymous") (functional) 🔴
- [ ] Reported At formatted consistently in WP site/user timezone (functional) 🟡
- [ ] Column sorting (Reason, Product, Vendor, Reported At): header click toggles asc → desc → none; correct sort param sent; rows reorder (functional) 🔴
- [ ] Single-select reason filter dropdown → ?reason=<label> applied; only matching rows; chip appears; clear resets (functional) 🔴
- [ ] Async product filter → ?product_id=<id> applied; list filters; clear resets (functional) 🔴
- [ ] Async vendor filter → ?vendor_id=<id> applied; list filters; clear resets (functional) 🔴
- [ ] Multi-filter intersection (reason + product/vendor) → both params sent; only rows matching all; removing one keeps others (functional) 🔴
- [ ] Filter chips render with remove (X) buttons; X removes single filter; Reset clears all and resets to page 1 (functional) 🟡
- [ ] Pagination next/previous: Previous disabled on page 1, Next disabled on last page; correct ?page= calls (functional) 🟡
- [ ] Pagination jump-to-page via input; invalid/out-of-range page errors or clamps to max (functional) 🟡
- [ ] Per-page size change (if exposed) → ?per_page= sent, resets to page 1, total pages recalc (functional) 🟡
- [ ] Page resets to 1 automatically when a filter reduces total below current page (functional) 🟡
- [ ] Large dataset (100+ reports): page 2+ loads next rows, "Page X of Y" correct, no lag (functional) 🟡
- [ ] Total Reports count in "All" tab badge matches X-Dokan-AbuseReports-Total; updates on create/delete (functional) 🟡
- [ ] Select-all header checkbox checks all current-page rows; clarify per-page vs all-pages scope; selection across page nav (functional) 🔴
- [ ] Header checkbox indeterminate/tri-state when a subset of rows selected (ui-state) ⚪
- [ ] Row selection during filter change: non-matching selected rows deselected; bulk delete available for selected filtered rows (functional) 🟡
- [ ] Global search input (if present) filters by reason/product/vendor/reporter text, case-insensitive, partial; empty returns all (functional; uncertain if present) ⚪
- [ ] Empty state: zero rows / zero-match filter shows "No reports found"; pagination hidden; i18n-aware text (ui-state) 🟡
- [ ] Loading skeleton/spinner per cell while fetching, replaced on response; visible under throttle (ui-state) 🟡
- [ ] Truncation + tooltip on long reason (>22 chars): truncated text + full text on hover (ui-state) 🟡
- [ ] Truncation + tooltip on long product/vendor/reporter names (ui-state) 🟡
- [ ] Deleted product shows "N/A" (no broken link) in list (edge) 🟡
- [ ] Deactivated/deleted vendor shows "N/A" (no broken link) in list (edge) 🟡
- [ ] Reason/product/vendor with special chars/HTML entities renders correctly in list and filters (ui-state) 🟡
- [ ] Responsive: mobile viewport (375px) table readable/scrollable, action menu reachable (ui-state) 🟡
- [ ] Responsive: tablet viewport (768px) columns readable, filter dropdowns don't overflow (ui-state) ⚪
- [ ] DataViews density toggle (comfortable/compact/spacious) if exposed; persists (ui-state; uncertain) ⚪
- [ ] i18n: all list strings translatable (__/sprintf, text domain "dokan") (i18n) 🟡
- [ ] i18n: RTL locale flips layout (tabs, pagination, chips) (i18n) ⚪
- [ ] a11y: keyboard tab order through filters, reason cell, row actions, bulk delete; no focus traps (functional) 🟡
- [ ] a11y: color contrast (WCAG AA) and visible focus indicators on interactive elements (functional) 🟡
- [ ] Permission: vendor navigating to admin list URL → denied/404 (not dokandar) (permission) 🔴
- [ ] Permission: customer navigating to admin list URL → denied/redirected (permission) 🔴
- [ ] Permission: shop_manager (no dokandar) cannot access list; no submenu item (permission) 🔴
- [ ] Module deactivation hides "Abuse Reports" admin submenu item (functional) 🔴

## New Admin Dashboard — Detail Modal

- [x] Detail modal opens via reason cell click; heading "Product Abuse Report"; reason value correct _(existing: TC8 - Detail Modal Opens via Reason Cell Click)_
- [x] Detail modal opens via row "View" action; close button hides modal _(existing: TC9 - Detail Modal Opens via Row 'View' Action)_
- [x] Modal closes cleanly; state reset; reopens fresh on second click _(existing: TC19 - Detail Modal Closes Cleanly)_
- [x] Modal does not auto-reopen after deleting its row (state cleared) _(existing: TC20 - Modal Does Not Auto-Reopen After Delete)_
- [ ] Full field rendering: reason, description, reported product (icon+link), reported by (name/email/link), reported at, product vendor (functional) 🔴
- [ ] Null/missing fields handled: no description, anonymous reporter, deleted product/vendor → "N/A"/"Anonymous" (functional) 🔴
- [ ] Anonymous reporter shows "Anonymous" label, no reporter link (functional) 🟡
- [ ] Product/vendor/reporter links use admin_url and navigate to correct edit pages (functional) 🟡
- [ ] Correct product linked when two products share the same title (edge) 🟡
- [ ] HTML/script in reason or description rendered via RawHTML without executing JS (XSS-safe) (security) 🔴
- [ ] Description with HTML escaped/safe in modal display; alert does not fire (security) 🔴
- [ ] Long reason (200+) / description (500+) wraps and is fully readable; modal scales (ui-state) 🟡
- [ ] Close via button and via Escape key both close and fully clear modal state (functional) 🔴
- [ ] Modal layout responsive: side-by-side sidebar on desktop, stacks on mobile/tablet; fits 375px viewport (ui-state) ⚪
- [ ] a11y: screen reader announces all modal sections; semantic headings (functional) 🟡

## New Admin Dashboard — Delete (single & bulk)

- [x] Cancel delete keeps the row visible; row count unchanged _(existing: TC10 - Cancel Delete Keeps the Row Visible)_
- [x] Single delete via row action; confirm modal says "this abuse report" (singular); DELETE issued; row count −1 _(existing: TC11 - Single Delete via Row Action)_
- [x] Bulk delete selected reports; confirm modal says "these N reports" (plural); row count −N _(existing: TC12 - Bulk Delete Removes Selected Reports)_
- [ ] Single delete success toast: "Selected report have been deleted successfully." (auto-dismiss/dismissible) (functional) 🟡
- [ ] Deleting the last remaining report → empty state appears, pagination hides, badge shows 0 (edge) 🔴
- [ ] Bulk delete success toast plural ("Selected reports..."); singular when exactly 1 selected via bulk (functional) 🟡
- [ ] Bulk delete deselects all rows after success (selectedReports empty, checkboxes cleared) (functional) 🟡
- [ ] Delete modal grammar: singular "this abuse report" vs plural "these X abuse reports" with count (i18n) ⚪
- [ ] Bulk delete with exactly one row selected → modal singular, delete succeeds (functional) ⚪
- [ ] Delete error: mocked 500 → error toast "Error deleting report(s)..."; rows remain (not optimistically removed) (negative) 🟡
- [ ] Delete error: modal dismisses even on failure; error toast shown; row still visible (negative) 🟡

## REST API

- [x] List reports returns 200 + X-Dokan-AbuseReports-Total header; body is JSON array _(existing: TC13)_
- [x] Unauthenticated GET rejected (401/403) _(existing: TC14)_
- [x] GET /abuse-reasons returns 200 array of {id, value} _(existing: TC15)_
- [x] Filter by reason label returns only matching rows _(existing: TC16 / TC33)_
- [x] Batch DELETE with empty items rejected (minItems: 1) _(existing: TC17)_
- [x] Negative page rejected (minimum: 1) _(existing: TC23)_
- [x] Non-numeric product_id rejected (type: integer) _(existing: TC24)_
- [x] Non-numeric vendor_id rejected (type: integer) _(existing: TC25)_
- [x] Batch DELETE non-integer items rejected (items: integer) _(existing: TC26)_
- [x] Batch DELETE duplicate ids rejected (uniqueItems: true) _(existing: TC27)_
- [x] DELETE non-existent report returns 4xx (report_not_found) _(existing: TC28)_
- [x] Filter by non-existent product_id returns 200 empty array _(existing: TC29)_
- [x] Filter by non-existent vendor_id returns 200 empty array _(existing: TC30)_
- [x] Pagination per_page caps result count; total header present _(existing: TC31)_
- [x] Combined filter (reason + non-existent product_id) returns empty (intersection) _(existing: TC32)_
- [ ] orderby=id with order=asc/desc sorts correctly (first/last ids reflect order) (functional) 🔴
- [ ] orderby=reported_at with order=asc/desc sorts by timestamp (functional) 🔴
- [ ] orderby=invalid_column rejected or falls back to default (validation) 🟡
- [ ] order=invalid direction rejected or falls back to default (validation) 🟡
- [ ] per_page behavior documented: param honored or hardcoded to 20 (note: schema gap — UI sends per_page, controller hardcodes 20) (functional) 🟡
- [ ] per_page > total returns all rows (not padded); total header accurate (edge) ⚪
- [ ] per_page=1 returns exactly 1 row (or 0 if none); headers reflect 1/page (edge) ⚪
- [ ] Non-existent reason filter returns 200 empty array (not 4xx) (edge) 🟡
- [ ] reason filter case-sensitivity behavior documented (validation) ⚪
- [ ] Combined filter (reason + valid product_id) returns true intersection; mismatched product → empty (functional) 🔴
- [ ] Combined filter (reason + vendor_id) returns intersection; empty when no overlap (functional) 🟡
- [ ] Combined filter (reason + vendor_id + product_id) returns intersection; no data leakage (functional) 🟡
- [ ] Response field types validated: id int, reason str, product/vendor/reported_by objects (id/title|name/admin_url), description str|null, reported_at RFC3339 (validation) 🔴
- [ ] reported_by for logged-in customer: id>0, name=username, email set, admin_url non-null (functional) 🟡
- [ ] reported_by for guest: id=0, name/email from form, admin_url null (functional) 🟡
- [ ] product.admin_url is well-formed post edit link with correct id (functional) ⚪
- [ ] vendor.admin_url is well-formed user-edit link with correct id (functional) ⚪
- [ ] Total header equals total DB count (not page count) (functional) 🔴
- [ ] Total header decrements by 1 after single DELETE (functional) 🔴
- [ ] Total header decrements by N after batch DELETE (functional) 🔴
- [ ] Single DELETE returns deleted report object (full structure) (functional) 🟡
- [ ] Batch DELETE returns array of deleted report objects (functional) 🟡
- [ ] Batch DELETE with partial-valid ids ([1, 999999, 2]) deletes only existing; documents 2-removed behavior (edge) 🟡
- [ ] Batch DELETE missing required "items" key → 400 schema error (validation) 🟡
- [ ] Permission: vendor token cannot GET list (401/403) (permission) 🔴
- [ ] Permission: vendor token cannot DELETE single (permission) 🔴
- [ ] Permission: vendor token cannot batch DELETE (permission) 🟡
- [ ] Unauthenticated direct REST GET leaks no report data (401/403) (permission) 🔴
- [ ] Pagination last page with fewer than per_page rows (47 total, page 3) → 200 with remainder; total header correct (edge) 🟡
- [ ] Out-of-range page (page=100) → 200 empty array, total header still correct (edge) 🟡
- [ ] Large per_page (1000) → capped or returns all; acceptable response time, no timeout/OOM (functional) ⚪
- [ ] Cache invalidated after report creation (new report appears in next GET) (functional) 🟡
- [ ] Cache invalidated after report deletion (deleted report gone in next GET) (functional) 🟡
- [ ] SQL injection in reason filter → escaped/rejected; table not dropped (security) 🔴
- [ ] Admin dashboard nonce/CSRF: DELETE includes WP nonce; fails if missing/invalid (security) 🔴
- [ ] Concurrent DELETE of same id (two tabs) → second returns 404, no double-delete; both lists reflect deletion (edge) 🟡
- [ ] most-reported-vendors dashboard endpoint returns top 5 vendors with rank/vendor_id/name/count/url (admin only) (functional; new surface, uncertain) 🟡
- [ ] most-reported-vendors endpoint rejects non-admin (401/403) (permission) 🟡

## Email Notification

- [x] Admin email triggered on report creation (HTML); subject contains site title + abuse text; body has reason/product(link)/vendor(link)/customer/description/date (functional) 🔴 _(added: Email TC1 + TC2)_
- [ ] Plain-text email version also sent with same core data (functional) 🟡
- [x] Email content correctness: reason, description, reported by, reported at, product+admin link, vendor+admin link (functional) 🔴 _(added: Email TC2 — reported_at renders as "June 2, 2026" via wc_date_format, not Y-m-d)_
- [x] Email with Setting A ON (logged-in only): contains customer username + email (functional) 🔴 _(added: Email TC3 — ⚠ code shows username + user-edit link only, NOT the email; the &lt;email&gt; branch is guest-only)_
- [x] Email with Setting A OFF (guest): displays guest name + email (functional) 🔴 _(added: Email TC4)_
- [ ] Email can be disabled via WooCommerce > Emails toggle → no email sent on submit (functional) 🟡
- [ ] Email recipient(s) customizable (single/comma-separated) → delivered to custom recipients (functional) 🟡
- [ ] Email subject/heading customizable via WC settings → overrides defaults (functional) ⚪
- [ ] Email "Additional content" field appended to body (functional) ⚪

## Vendor Dashboard

No vendor-facing abuse report surface exists in the report-abuse module. All admin dashboard, REST endpoints, and the most-reported-vendors endpoint are gated to the `dokandar`/admin capability; the module ships no vendor-dashboard view of reports about a vendor's own products.

- [ ] Confirm absence: vendor dashboard has no Abuse Reports view/menu; vendors cannot see reports about their products (permission) 🟡
- [ ] (Feature gap — out of scope) Potential read-only vendor view of reports on their own products; discuss with product team before adding tests — not in current scope.

## Cross-cutting / Edge / Security

- [ ] Module deactivation hides frontend Report Abuse button (DOM absent) (functional) 🔴 — see Customer Flow
- [ ] Module deactivation hides admin dashboard submenu (functional) 🔴 — see Dashboard List
- [ ] Orphaned report when product deleted → row + modal show "N/A", list does not crash (edge) 🔴
- [ ] Orphaned report when vendor deleted → row + modal show "N/A", list does not crash (edge) 🔴
- [ ] XSS: HTML/script in description escaped in admin modal (no execution) (security) 🔴
- [ ] XSS: HTML in reason label escaped in list and modal (literal tags, not interpreted) (security) 🔴
- [ ] XSS: custom reason label escaped on customer form (security) 🔴
- [ ] SQL injection in reason filter parameter prevented (security) 🔴
- [ ] CSRF: admin delete requires valid nonce (apiFetch); fails without it (security) 🔴
- [ ] CSRF: customer submit requires valid nonce (check_ajax_referer) (security) 🔴
- [ ] i18n: built-in reason labels translate in non-English locale on customer form (i18n) 🟡
- [ ] i18n: admin settings + dashboard strings translate; text domain "dokan" (i18n) 🟡
- [ ] i18n: RTL layout support across dashboard and modal (i18n) ⚪
- [ ] No rate-limiting / duplicate-submission detection per user/IP (known gap — verify behavior) (edge) ⚪
- [ ] Performance: large dataset (150+) pagination has no lag; correct page indicators (functional) 🟡
- [ ] Cache invalidation on create and delete reflected in subsequent REST GETs (functional) 🟡

## Summary

- Existing covered: 33 unique spec test cases (TC1–TC33) mapped across the surfaces above (checked boxes). Strong coverage of REST schema validation, core submission/list/modal/delete happy paths.
- New-to-add: ~150 deduplicated proposals spanning filter/pagination/sorting UI, permissions, XSS/CSRF/SQLi, email, orphaned records, i18n/a11y/responsive, and REST contract/field-type validation.
- Largest coverage holes: UI-layer filters/sorting/pagination, permission/role gating, security (XSS/CSRF/SQLi), email notifications, and orphaned product/vendor handling — all currently untested.

Top 5 highest-value gaps to implement first:
1. Permission gating (UI + REST): vendor/customer/shop_manager cannot access list or delete; unauthenticated leaks no data (permission, 🔴).
2. Filter UI + multi-filter intersection (reason/product/vendor) with chips and reset, plus column sorting and correct REST sort params (functional, 🔴).
3. Security: XSS in reason/description (list, modal, customer form via RawHTML), CSRF nonce on delete/submit, SQL injection in reason filter (security, 🔴).
4. Customer form validation: missing reason, guest empty/invalid name+email, Setting A ON blocks guest, double-submit prevention (validation/functional, 🔴).
5. Orphaned records + empty/last-row state: deleted product/vendor show "N/A" without crashing; deleting last report shows empty state and zeroes the badge (edge, 🔴).