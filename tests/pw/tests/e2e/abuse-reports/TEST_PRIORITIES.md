# Abuse Reports — Implementation Priorities

A build-ordered plan derived from [`TEST_CASES.md`](./TEST_CASES.md). The ~150
unchecked cases are grouped into **independently shippable batches**, ordered by
value/effort. Each batch can be implemented and **verified live** before moving on.

> Counts (deduped — cross-cutting items in TEST_CASES.md §"Cross-cutting" are
> merged into their owning section here):
> **🔴 high ≈ 52 · 🟡 medium ≈ 78 · ⚪ low ≈ 20.**

## Legend

- **⚠ documents-a-gap** — the case asserts the *actual* behavior and will likely
  surface/record a known bug or product gap rather than pass clean green (the
  checklist itself flags these). Expect these to NOT be all-green.
- **🔧 needs-infra** — requires setup that doesn't exist yet (see Prerequisites).
- Priorities carried over from `TEST_CASES.md`: 🔴 high, 🟡 medium, ⚪ low.

## Prerequisites (set up before the batches that depend on them)

- 🔧 **Mail catcher** (Mailpit/MailHog) wired into `wp-env` + a REST/API way to
  read the inbox — required for the **Email** batch (P1-7).
- 🔧 **Role/token fixtures**: a `shop_manager` user with no `dokandar` cap, plus
  vendor & customer REST tokens — required for the **Permissions** batches.
- 🔧 **Non-English + RTL locale** loaded in wp-env — required for the i18n items
  (all 🟡/⚪, deferred).
- a11y / responsive use Playwright built-ins (axe-core optional) — no extra infra.

---

# Phase 1 — 🔴 High priority (~52 cases)

Recommended order: **Security → Permissions → Customer-form → List UI → REST →
Settings → Modal/Delete/Orphaned/Email.** Security & permissions first because
they're the biggest risk and the largest untested holes.

## P1-1 · Security: XSS / CSRF / SQLi  (~9) 🔴
- XSS: custom reason label with HTML/script renders **escaped on the customer form** (no JS exec) — TC§Customer:38, §Cross:228
- XSS: HTML in reason label escaped in the **admin list** (literal tags) — §Cross:227
- XSS: HTML/script in reason/description rendered via **RawHTML in the modal**, no JS exec — §Modal:124, §Cross:226
- XSS: description HTML escaped/safe in modal; `alert()` does not fire — §Modal:125
- SQLi: injection in the **reason filter** param escaped/rejected (table not dropped) — §REST:195, §Cross:229
- CSRF: **customer submit** without/with wrong nonce → rejected, no report created — §Customer:37, §Cross:231
- CSRF: **admin delete** (apiFetch) requires a valid WP nonce; fails without it — §REST:196, §Cross:230
- Settings: special chars/emoji/HTML in a reason → sanitized/escaped, safe in settings UI — §Settings:52
- Settings: reason with HTML-like text shows as **literal text** (not interpreted) — §Settings:53

## P1-2 · Permissions & module gating  (~10) 🔴 🔧
- Non-admin (vendor) cannot open the **settings** page → denied/403 — §Settings:63
- Guest cannot open the settings page → login redirect / 401-403 — §Settings:64
- Vendor navigating to the **admin list URL** → denied/404 — §List:108
- Customer navigating to the admin list URL → denied/redirected — §List:109
- `shop_manager` (no `dokandar`) cannot access list; no submenu item — §List:110
- Module **deactivation hides the admin submenu** — §List:111, §Cross:223
- Module deactivation hides the **frontend Report-Abuse button** (DOM absent) — §Customer:32, §Cross:222
- REST: vendor token **cannot GET** the list (401/403) — §REST:186
- REST: vendor token **cannot DELETE** single — §REST:187
- REST: unauthenticated GET **leaks no report data** (401/403) — §REST:189

## P1-3 · Customer form: validation & flow  (~11) 🔴
- Submit with **no reason selected** → blocks, validation error, no API call — §Customer:20
- Guest (Setting A OFF) **empty name** → rejected (required) — §Customer:21
- Guest **empty email** → rejected (required, type=email) — §Customer:22
- Guest **invalid email format** → HTML5 + server `is_email()` rejects — §Customer:23
- Guest fields render **only** when Setting A OFF & not logged in; toggle ON hides — §Customer:25
- Guest **blocked when Setting A ON** → login popup, no report created — §Customer:27
- **Double-submit prevented** (fieldset disabled) → exactly one request/DB row — §Customer:28
- ⚠ Success message matches the **Ajax string** ("Your report has been submitted…") + modal closes (doc says "Thank you for your response" — reconcile) — §Customer:29
- Reason list matches **admin-configured reasons in order**; new reasons appear after refresh — §Customer:33
- **Vendor captured** from the product on submission — §Customer:34
- Logged-in **`customer_id` captured server-side** (not stored as name/email) — §Customer:35

## P1-4 · Admin DataViews list: columns / filters / sorting  (~8) 🔴
- All columns render correct data (Reason, Product, Vendor, Reported By, Reported At) + links point to correct admin pages — §List:75
- **Reported By** three states: authenticated (name+email+link), guest (name+email, no link), anonymous ("Anonymous") — §List:76
- **Column sorting** (Reason/Product/Vendor/Reported At): header toggles asc→desc→none, correct sort param, rows reorder — §List:78
- **Reason filter** dropdown → `?reason=` applied, only matching rows, chip appears, clear resets — §List:79
- **Async product filter** → `?product_id=` applied, clear resets — §List:80
- **Async vendor filter** → `?vendor_id=` applied, clear resets — §List:81
- **Multi-filter intersection** (reason + product/vendor) → both params, rows match all, removing one keeps others — §List:82
- **Select-all header checkbox** scope (per-page vs all-pages) + selection across page nav — §List:90

## P1-5 · REST contract: sorting / totals / field-types  (~7) 🔴
- `orderby=id` with `order=asc/desc` sorts (first/last ids reflect order) — §REST:162
- `orderby=reported_at` asc/desc sorts by timestamp — §REST:163
- Combined filter (reason + **valid** product_id) → true intersection; mismatch → empty — §REST:171
- Response **field types** validated: id int, reason str, product/vendor/reported_by objects, description str|null, reported_at RFC3339 — §REST:174
- **Total header == total DB count** (not page count) — §REST:179
- Total header **decrements by 1** after single DELETE — §REST:180
- Total header **decrements by N** after batch DELETE — §REST:181

## P1-6 · Admin settings: validation, persistence, reasons  (~8) 🔴
- Add **empty/whitespace** reason → prevented or rejected — §Settings:50
- Add **duplicate** reason → prevented, no duplicate in list — §Settings:51
- ⚠ Very long reason (256+) → capped/truncated (DB VARCHAR 191) or validation error — §Settings:54
- "Reported by" toggle **persists ON** after save + reload (option verified) — §Settings:56
- Setting A OFF → guest report submission works end-to-end — §Settings:57
- Setting A ON → guest report blocked (login prompt / error) — §Settings:58
- **Save success feedback** (toast/notice), no console errors — §Settings:59
- Remove a reason that **has existing reports** → DB consistency; old reports keep their label — §Settings:62

## P1-7 · Modal, delete-edge, orphaned records, email  (~9) 🔴
- Modal: **full field rendering** (reason, description, product icon+link, reported-by, reported-at, vendor) — §Modal:119
- Modal: **null/missing fields** → "N/A" / "Anonymous" (no description, deleted product/vendor) — §Modal:120
- Modal: close via **button and Escape** both fully clear state — §Modal:127
- Delete: deleting the **last remaining report** → empty state, pagination hides, badge = 0 — §Delete:137
- Orphaned: **product deleted** → row + modal show "N/A", list doesn't crash — §Cross:224
- Orphaned: **vendor deleted** → row + modal show "N/A", list doesn't crash — §Cross:225
- 🔧 Email: admin email **triggered on report creation** (HTML); subject + body fields correct — §Email:203
- 🔧 Email: content correctness (reason/description/reported-by/reported-at/product+link/vendor+link) — §Email:205
- 🔧 Email: Setting A ON shows customer username+email; Setting A OFF shows guest name+email — §Email:206, 207

---

# Phase 2 — 🟡 Medium priority (~78 cases)

Implement after Phase 1. Grouped by section (full text in `TEST_CASES.md`):

- **Customer flow (~6):** empty-description succeeds; logged-in never sees guest fields; loading state on submit; submit on deleted/draft product → "Product not found"; `reported_at` uses server time; direct POST missing `form_data`/`product_id` → 400. — §Customer:24,26,30,31,36,41,42
- **Settings (~10):** non-ASCII UTF-8 reasons; save-failure retains data; no-op save; reorder persists (uncertain); disable→re-enable preserves; remove-all→reactivate re-populates defaults; max-reasons; i18n labels. — §Settings:55,60,61,65,66,67,69,70
- **List (~22):** filter chips remove/reset; pagination next/prev/jump/clamp; per-page change; page resets on filter; large dataset paging; total badge matches header; row-selection during filter change; empty state; loading skeletons; truncation+tooltip (reason / names); deleted product/vendor "N/A"; special-chars render; responsive mobile/tablet; i18n strings; a11y keyboard order + contrast/focus. — §List:83–107 (🟡 subset)
- **Modal (~4):** anonymous label/no link; links use `admin_url` to correct pages; two products same title → correct link; long reason/description wraps; a11y screen-reader sections. — §Modal:121,122,123,126,129
- **Delete (~5):** single/bulk success toasts (singular/plural); bulk deselects after success; delete error (mock 500) → toast + rows remain; modal dismisses on failure. — §Delete:136,138,139,142,143
- **REST (~18):** invalid orderby/order fallback; ⚠ `per_page` (UI sends, controller hardcodes 20); per_page>total / =1; non-existent reason → empty; reason+vendor(+product) intersections; reported_by logged-in vs guest shapes; admin_url well-formed; single/batch DELETE return objects; partial-valid batch; missing `items` → 400; batch-delete vendor token; last-page remainder; out-of-range page; cache invalidation on create/delete; concurrent same-id DELETE; most-reported-vendors endpoint (uncertain) + its permission. — §REST:164–199 (🟡 subset)
- **Email (~4):** plain-text version; WC Emails toggle disables; recipient(s) customizable; (heading/additional-content are ⚪). — §Email:204,208,209
- **Vendor dashboard (~1):** confirm **absence** — no vendor abuse-reports view/menu. — §Vendor:217
- **Cross-cutting (~2):** i18n built-in reason labels + admin strings translate; performance large-dataset paging. — §Cross:232,233,236

# Phase 3 — ⚪ Low / uncertain (~20 cases)

Do last; some may be **dropped** if the feature doesn't exist:
- Long description >65535; reason/name/email `wp_trim_words` trimming — §Customer:39,40
- Concurrent admin save; reason length specifics — §Settings:68; §REST:170
- Header tri-state checkbox; global search (uncertain); density toggle (uncertain); responsive tablet; RTL flip — §List:91,93,103,102,105
- product/vendor `admin_url` exactness; per_page>total padding; large per_page=1000 — §REST:177,178,167,168,192
- Modal responsive 375px — §Modal:128
- Delete modal grammar; bulk-with-one singular — §Delete:140,141
- Email heading/additional-content customization — §Email:210,211
- No rate-limiting (⚠ known gap — verify behavior) — §Cross:235; cache-invalidation — §Cross:237
- RTL across dashboard/modal — §Cross:234

---

# Known gaps these tests will DOCUMENT (won't be all-green)

These assert *actual* behavior and effectively record bugs/gaps:
1. **Success message** doc ("Thank you for your response") ≠ code ("Your report has been submitted…"). — P1-3
2. **`per_page`** — UI sends it, controller **hardcodes 20** (schema gap). — Phase 2 REST
3. **No rate-limiting / duplicate-submission** detection per user/IP. — Phase 3
4. **Uncertain features** (drag-reorder reasons, DataViews density toggle, global search, most-reported-vendors endpoint) — verify existence first; drop if absent.

# Suggested execution

1. Stand up the 🔧 prerequisites (mail catcher, role/token fixtures).
2. Ship Phase 1 in the 7 batches above — implement + run live + fix/document per batch, tick boxes in `TEST_CASES.md` as they land.
3. Then Phase 2 by section, Phase 3 last.
4. Each batch ≈ a focused PR-sized unit; verify green (or documented-gap) before the next.
