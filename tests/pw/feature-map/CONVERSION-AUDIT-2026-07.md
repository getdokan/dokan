# Dokan Lite new-UI conversion — completeness audit (2026-07-09)

Branch `qa/new-ui-suite-wave-0` (reconciled 2026-07-09: full 30-folder Waves-0–4 conversion
`215b85718` + develop 5.0.8/#3300). Method: 8 read-only feature-area agents cross-referenced the
165-spec plan-of-record classification, the `feature-map.yml` `(new UI)` leaves, the actual
`new-*/*.spec.ts` titles, and each legacy spec's page object (stub vs real); claimed gaps were
adversarially verified (try-to-disprove) before surviving. Supersedes nothing in the handoffs —
it *extends* them onto the reconciled tree.

## Verdict

**The React new-UI conversion is essentially COMPLETE.** Of 61 vendor-relevant feature rows,
19 are fully converted, 17 partial (every partial's residue is documented-deferred: seeder-blocked,
React-editor-limited, or no-React-surface), 12 stays-legacy (no React route), 12 not-affected.
**Exactly one (1) claimed gap survived adversarial verification: shipping table-rate / distance-rate
per-instance drill-in forms (B30/B31)** — route + seeder both confirmed. Everything else the area
agents flagged was disproved as already-covered, route-absent, seeder-blocked, or editor-limited.

The Phase-3 legacy-revival inventory (below) finds **39 conversion-added skip blocks** to act on
(5 real-redundant, 21 vacuous `(React)` legacy-URL smokes, 13 stub-vacuous) out of 133 total legacy
skip blocks — the other 94 are pre-existing skips unrelated to the conversion (out of Phase-3 scope).

## True gaps (survived adversarial verification)

### GAP-1 · Table Rate / Distance Rate Shipping — per-instance drill-in forms (/settings/shipping/:zoneID/table-rate|distance-rate/:instanceID)
- **Verdict:** confirmed-gap · route_confirmed=True · seeder_confirmed=True
- **Why real:** Could not disprove on any of the 4 avenues. (a) No new-* spec covers it: grep for table/distance-rate across e2e returns zero new-* matches; new-shipping/newShipping.spec.ts only does zone view + add flat-rate/free-shipping + generic method-title edit (line 85-101, uses the standard method modal, never the table-rate/distance-rate drill-in route) + delete + policy + reload. (b) Route is LIVE: dokan-pro/modules/table-rate-shipping/src/js/vendor-dashboard/index.tsx:25 registers table-rate path, :50 registers distance-rate path, reached via dokan_shipping_edit_shipping_method action (index.tsx:72-90); dedicated form components table-settings/index.tsx + distance-settings/index.tsx exist; also in handoff §1 verified list line 31. (c) Seeder exists: apiUtils.ts:2304 createShippingZone (WC REST) seeds the zone; add-method via React path newShippingPage.ts:254 POST dokan/v1/shipping/{zone}/methods with payloads.ts:2236/2240 method_ids; per-instance REST oracles TableRateShippingSettingsController.php:20 (shipping/table-rate/settings), TableRateController.php:19 (shipping/table-rate/rates), plus DistanceRate{Settings,}Controller. (d) Not an editor limitation — the React per-instance forms fully render; distance-rate is GMAP-gated but .env carries GMAP per preflight, so env-gated yet buildable. Legacy tableRateShipping.spec.ts is a vacuous react-smoke-legacy-url block (goto dashboard/settings/shipping legacy URL + body-length>50 assert, lines 10-35), no real coverage; documented DEFERRED as B30/B31 (CONVERSION-LOG.md:558,586-590), never built. Phase-3: conversion_added=true, classification=react-smoke-legacy-url, no real page object (inline body-length assert = vacuous).
- **Build:** extend `new-shipping/` — Add-Method → row-action Edit → per-instance route
  `/settings/shipping/:zoneID/table-rate|distance-rate/:instanceID`; table-rate first, distance-rate is GMAP-gated.

## Old→New coverage matrix (61 rows)

| Area | Feature | Legacy spec | New-UI | Lgc | New | React route | Status |
|---|---|---|--:|--:|--:|---|---|
| withdraw-reverse | Withdraw (vendor) — balance page, requests lis | withdraws.spec.ts | new-withdraw | 7 | 14 | /dashboard/new/#/withdraw (+ /dashboar | converted |
| withdraw-reverse | Reverse Withdrawal (vendor) — balance/threshol | reverseWithdraws.spec. | new-reverse-withdraw | 9 | 13 | /dashboard/new/#/reverse-withdrawal | partial |
| withdraw-reverse | Commission (admin) — fixed/category-based comm | commission.spec.ts | (none) | 0 | 0 | (none) | not-affected |
| orders-manual-coupons | Vendor Orders list (view/search/filter/status- | orders.spec.ts | new-orders | 16 | 24 | /dashboard/new/#/orders | partial |
| orders-manual-coupons | Vendor Manual Order creation (Add New Order fo | manualOrderPro.spec.ts | new-manual-order | 3 | 10 | /dashboard/new/#/orders/new (+ /orders | converted |
| orders-manual-coupons | Vendor Coupons (list + create/edit/delete + ma | (none) | new-coupons | 0 | 14 | /dashboard/new/#/coupons (+/create, /u | converted |
| orders-manual-coupons | Vendor Refunds (full/partial refund from vendo | refunds.spec.ts | (none) | 2 | 0 | (none) | stays-legacy |
| orders-manual-coupons | Customer My Orders (my-account order list/deta | myOrders.spec.ts | new-orders (2 custom | 0 | 2 | (none) | not-affected |
| shipping-modules-announce | Vendor Shipping — zones / methods / policy | vendorShipping.spec.ts | new-shipping | 9 | 13 | /dashboard/new/#/settings/shipping (+/ | partial |
| shipping-modules-announce | Table Rate / Distance Rate Shipping — per-inst | tableRateShipping.spec | (none) | 2 | 0 | /dashboard/new/#/settings/shipping/:zo | gap |
| shipping-modules-announce | ShipStation — vendor credentials (generate / r | shipstation.spec.ts | new-shipstation | 2 | 4 | /dashboard/new/#/settings/shipstation | converted |
| shipping-modules-announce | Vendor Delivery Time — calendar dashboard + se | vendorDeliveryTime.spe | new-delivery-time | 5 | 2 | /dashboard/new/#/delivery-time-dashboa | partial |
| shipping-modules-announce | Request for Quotation — vendor (list + quote-d | requestForQuotes.spec. | new-requested-quotes | 5 | 8 | /dashboard/new/#/requested-quotes (lis | partial |
| shipping-modules-announce | Request for Quotation RULES (admin-only) | requestForQuoteRules.s | (none) | 0 | 0 | (none) | not-affected |
| shipping-modules-announce | Announcements — vendor (list / detail / delete | announcements.spec.ts | announcementsNewUI.s | 3 | 11 | /dashboard/new/#/announcement (+ detai | converted |
| shipping-modules-announce | Printful integration — vendor settings / shipp | printful.spec.ts | (none) | 6 | 0 | (none) | stays-legacy |
| shipping-modules-announce | SPMV — Sell Products by Multiple Vendors (vend | spmv.spec.ts | (none) | 9 | 0 | (none for vendor — an ADMIN React page | stays-legacy |
| products-modules | Product Addons (global add-ons list + per-prod | productAddons.spec.ts | new-product-addons | 11 | 7 | /dashboard/new/#/settings/product-addo | partial |
| products-modules | Product Advertising (vendor product-list Adver | productAdvertising.spe | new-product-advertis | 3 | 6 | /dashboard/new/#/products (Advertise c | partial |
| products-modules | Product Q&A (vendor questions/answers) | productQA.spec.ts | new-product-qa | 7 | 10 | /dashboard/new/#/product-questions-ans | converted |
| products-modules | Product Reviews (vendor product-review moderat | productReviews.spec.ts | reviews surface, see | 9 | 0 | /dashboard/new/#/reviews (Pro-core Rev | partial |
| products-modules | Product Enquiry (customer/guest enquire + modu | productEnquiry.spec.ts | (none) | 0 | 0 | (none) | not-affected |
| products-modules | Booking product create/edit (vendor booking-pr | productsDetailsBooking | booking list + delet | 2 | 0 | /dashboard/new/#/booking (list route e | stays-legacy |
| products-modules | Auction product create/edit (vendor auction-pr | productsDetailsAuction | (none) | 50 | 0 | (none - auction edit redirects to LEGA | stays-legacy |
| booking-auction-subscription | Booking — vendor products / resources / calend | vendorBooking.spec.ts | new-booking | 19 | 10 | /dashboard/new/#/booking (+/resources, | partial |
| booking-auction-subscription | Booking — fast-execution duplicate suite (pari | vendorBookingFast.spec | new-booking | 15 | 10 | /dashboard/new/#/booking (+/resources, | converted |
| booking-auction-subscription | Auction — vendor products list + activity (Pro | vendorAuction.spec.ts | new-auction | 11 | 12 | /dashboard/new/#/auction (+/auction-ac | partial |
| booking-auction-subscription | Vendor Subscription Packs — vendor subscriptio | vendorSubscriptions.sp | new-subscription | 5 | 6 | /dashboard/new/#/subscription (+/order | partial |
| booking-auction-subscription | User / Product Subscription — vendor user-subs | vendorProductSubscript | new-user-subscriptio | 5 | 6 | /dashboard/new/#/user-subscription (+/ | partial |
| vendor-mgmt-support | Vendor Staff Manager (vendor CRUD + staff-role | vendorStaff.spec.ts | new-vendor-staff | 5 | 13 | /dashboard/new/#/staffs | converted |
| vendor-mgmt-support | Vendor Support / Admin Support (vendor<->admin | (none) | new-vendor-support | 0 | 16 | /dashboard/new/#/vendor-support | converted |
| vendor-mgmt-support | Vendor Verifications (vendor verification-sett | vendorVerifications.sp | new-vendor-verificat | 6 | 10 | /dashboard/new/#/settings/verification | converted |
| vendor-mgmt-support | Store Support (vendor support-ticket list/deta | storeSupports.spec.ts | new-store-support | 11 | 15 | /dashboard/new/#/support | partial |
| vendor-mgmt-support | Return Request / RMA (vendor request list/deta | vendorReturnRequest.sp | new-return-request | 7 | 10 | /dashboard/new/#/return-request | converted |
| vendor-mgmt-support | Seller Vacation (vendor go-on-vacation) | sellerVacation.spec.ts | (none) | 0 | 0 | (none) | stays-legacy |
| vendor-mgmt-support | Abuse Reports / Report Abuse (admin DataViews  | CustomerForm specs) | (none) | 0 | 0 | (none for vendor; admin surface is wp- | not-affected |
| store-settings-storefront | Social Profiles (vendor settings/social) | socialLinking.spec.ts | new-social | 2 | 5 | /dashboard/new/#/settings/social | converted |
| store-settings-storefront | Store SEO (vendor settings/seo) | storeSeo.spec.ts | new-store-seo | 2 | 6 | /dashboard/new/#/settings/seo | converted |
| store-settings-storefront | Store Reviews (vendor /reviews list) | storeReviews.spec.ts | new-store-reviews | 3 | 9 | /dashboard/new/#/reviews | converted |
| store-settings-storefront | Seller Badge (vendor /seller-badge list) | sellerBadges.spec.ts | new-seller-badge | 6 | 10 | /dashboard/new/#/seller-badge | converted |
| store-settings-storefront | Followers (vendor /followers list) | followStore.spec.ts | new-followers | 4 | 8 | /dashboard/new/#/followers | converted |
| store-settings-storefront | Menu Manager effect on vendor React sidebar (F | menuManager.spec.ts | new-menu-manager | 0 | 4 | /dashboard/new/#/products (sidebar chr | converted |
| store-settings-storefront | Vendor Store Settings (basic/address/map/toc/o | vendorSettings.spec.ts | (none) | 27 | 0 | (none) | stays-legacy |
| store-settings-storefront | Catalog Mode (vendor storewide toggle via stor | catalogMode.spec.ts | (none) | 3 | 0 | (none) | stays-legacy |
| store-settings-storefront | Store Categories (vendor updates own store cat | storeCategories.spec.t | (none) | 1 | 0 | (none) | stays-legacy |
| store-settings-storefront | Store Appearance (map/contact/open-close/banne | storeAppearance.spec.t | (none) | 2 | 0 | (none) | stays-legacy |
| store-settings-storefront | Colors / Color-scheme customizer (dashboard ch | colors.spec.ts | (none) | 0 | 0 | (none) | stays-legacy |
| store-settings-storefront | Admin Dokan Settings page (settings.spec — adm | settings.spec.ts | (none — admin React  | 0 | 0 | (none) | not-affected |
| store-settings-storefront | Admin Dokan Settings effects (setting.spec — a | setting.spec.ts | (none) | 3 | 0 | (none) | not-affected |
| products-core | Products list, search, filter & lifecycle (ven | products.spec.ts | new-products | 16 | 31 | /dashboard/new/#/products | converted |
| products-core | Product create form (product types + field ent | products.spec.ts | new-product-form | 9 | 36 | /dashboard/new/#/products/create | partial |
| products-core | Product edit / field-level details (existing p | productsDetails.spec.t | new-product-form | 95 | 10 | /dashboard/new/#/products/:productId/e | partial |
| products-core | Product wholesale options (per-product) | wholesale.spec.ts | new-product-form | 1 | 3 | /dashboard/new/#/products/create | converted |
| products-core | Product EU compliance fields (unit price / uni | euCompliance.spec.ts | (none) | 3 | 0 | (none) | stays-legacy |
| products-core | Product variations (variable-product editor) | productVariations.spec | new-product-form | 0 | 1 | /dashboard/new/#/products/create | partial |
| products-core | Product bulk edit / bulk actions | productBulkEdit.spec.t | new-products | 0 | 3 | /dashboard/new/#/products | partial |
| products-core | Product Form Manager (admin-controlled field v | productFormManagerAdmi | ) | 0 | 12 | /dashboard/new/#/products/:productId/e | not-affected |
| products-core | Min-max quantities (admin module enable/disabl | minMaxQuantities.spec. | (none) | 0 | 0 | (none) | not-affected |
| products-core | Product tabs (storefront single-product tabs) | productTabs.spec.ts | (none) | 0 | 0 | (none) | not-affected |
| products-core | Product brand filter (storefront shop archive) | brandFilter.spec.ts | (none) | 0 | 0 | (none) | not-affected |
| products-core | Single product page (customer storefront view) | singleProduct.spec.ts | (none) | 0 | 0 | (none) | not-affected |

## Stays-legacy (no React route / no React surface)

- **Vendor Refunds (full/partial refund from vendor order detail** — No React refund UI exists (CONVERSION-LOG B20, scout-confirmed). The React Orders 'View' action deep-links (window.location.href) to the LEGACY PHP or
- **Printful integration — vendor settings / shipping** — No React vendor route for Printful settings (handoff §1 stays-legacy list line 37 'Printful settings'; line 126 'printful (no route; stub PO)'). The w
- **SPMV — Sell Products by Multiple Vendors (vendor list / sear** — The vendor SPMV list/search/clone/sort surface has no /dashboard/new React route (handoff §1 stays-legacy list line 37 'SPMV list'; line 126 'spmv (no
- **Booking product create/edit (vendor booking-product editor)** — React booking-product CREATE/EDIT form has no React route (handoff §1 Still-LEGACY: 'booking product create/edit form'); the /booking list DELETE is a
- **Auction product create/edit (vendor auction-product editor, ** — Handoff §1 + §non-target list: auction product EDITOR stays legacy (verifier-confirmed edit redirects to legacy editor). The auction LIST/activity (a 
- **Seller Vacation (vendor go-on-vacation)** — Vendor vacation UI lives on the store-settings page (/dashboard/settings/store/), which has no React vendor-dashboard route and is on the known stays-
- **Vendor Store Settings (basic/address/map/toc/open-close/vaca** — Vendor Store settings (/dashboard/settings/store/) + RMA settings have NO React route (handoff §1 STILL-LEGACY). The social-profile + store-SEO sub-ca
- **Catalog Mode (vendor storewide toggle via store settings)** — Storewide catalog-mode toggle is set on the vendor Store Settings form (/dashboard/settings/store/), which has NO React route (handoff E: 'catalog-mod
- **Store Categories (vendor updates own store category)** — The single vendor case 'vendor can update own store category' (L46) is performed on the vendor Store Settings form, which has NO React route (handoff 
- **Store Appearance (map/contact/open-close/banner/sidebar/vend** — Store Appearance is an admin-settings + storefront-rendering feature (handoff E: 'store-appearance (admin+storefront)'); no vendor React dashboard sur
- **Colors / Color-scheme customizer (dashboard chrome)** — Admin-only module; palette asserts against the LEGACY dashboard chrome (handoff E: 'colors (palette asserts legacy dashboard chrome)'). Zero vendor ca
- **Product EU compliance fields (unit price / units / germanize** — B22 — the React product editor injects ZERO dokan_product_editor_schema for EU/Germanized fields; EU hooks only the LEGACY product form (dokan_product

## Partial features — residual unported cases (all documented-deferred, NOT buildable gaps)

- **Reverse Withdrawal (vendor) — balance/threshold widget, ** (8 residual): vendor can view reverse withdrawal, vendor can view reverse withdrawal, vendor can view reverse withdrawal, vendor can filter reverse withdraw …
- **Vendor Orders list (view/search/filter/status-change/bul** (7 residual): vendor can view order details, vendor can update order status on , vendor can add order note, vendor can add private order note …
- **Vendor Shipping — zones / methods / policy** (3 residual): vendor can add local pickup shippi, vendor can add table rate shipping, vendor can add distance rate shipp
- **Vendor Delivery Time — calendar dashboard + settings** (4 residual): vendor can view delivery time sett, vendor can set delivery time setti, vendor can filter delivery time, vendor can change view style of de
- **Request for Quotation — vendor (list + quote-detail acti** (4 residual): vendor can view request quote deta, vendor can update quote request, vendor can approve quote request, vendor can convert quote request t
- **Product Addons (global add-ons list + per-product addon ** (9 residual): vendor can add global product addo, vendor can edit global product add, vendor can import global product a, vendor can export global product a …
- **Product Advertising (vendor product-list Advertise colum** (3 residual): vendor can buy product advertising, vendor can buy booking product adv, vendor can buy auction product adv
- **Product Reviews (vendor product-review moderation)** (7 residual): vendor can unApprove product revie, vendor can spam product review, vendor can trash product review, vendor can approve product review …
- **Booking — vendor products / resources / calendar (Pro mo** (11 residual): vendor can duplicate booking produ, vendor can filter booking products, vendor can filter booking products, vendor can filter booking products …
- **Auction — vendor products list + activity (Pro module si** (7 residual): vendor can duplicate auction produ, vendor can filter auction activity, vendor can search auction activity, vendor can add auction product …
- **Vendor Subscription Packs — vendor subscription card + o** (4 residual): vendor can cancel subscription, vendor can buy non recurring subsc, vendor can buy non recurring subsc, vendor can switch subscription
- **User / Product Subscription — vendor user-subscription l** (2 residual): vendor can filter user subscriptio, vendor can filter user subscriptio
- **Store Support (vendor support-ticket list/detail)** (2 residual): vendor can filter support tickets , vendor can filter support tickets 
- **Product create form (product types + field entry)** (5 residual): vendor can add variable product, vendor can add simple subscription, vendor can add variable subscripti, vendor can add external product …
- **Product edit / field-level details (existing product)** (78 residual): vendor can update product permalin, vendor can update product price, vendor can remove product price, vendor can add product discount pr …
- **Product variations (variable-product editor)** (1 residual): vendor can add variable product (w
- **Product bulk edit / bulk actions** (1 residual): bulk field-edit across selected pr

> These were classified `partial`, not `gap`, by the area agents applying the gap definition
> (buildable = live React route + REST/DB seeder). Their residue is seeder-blocked (booking
> my-bookings, subscription packs, auction bids), React-editor-limited (external/grouped product
> create; ~78 legacy product-edit field groups per CONVERSION-LOG B1 backlog), or has no React
> surface (refund line-items, RW grace notices). See CONVERSION-LOG for each deferral's reason.

## Phase-3 legacy-revival inventory (conversion-added blocks only)

Scope rule (prompt Phase 3.1): only blocks **added by the conversion** (skip comment names a
`new-*` home, OR a `(React) Tests` transitional smoke, OR a nested `vendor cases — ported to
new-*`). The 94 pre-existing skips (whole-module skips like `printful`/`visual`/`vendor-analytics`,
plus ~26 pre-existing stub blocks and 68 unrelated skips) are the legacy suite's pre-conversion
state and are **out of Phase-3 scope**.

### Action policy per class (no fake green — house-style §7)
- **real-redundant** → un-skip, run **green 3×** vs the classic `/dashboard/<route>` UI. Real PO already drives the legacy DOM.
- **stub-vacuous** → the legacy PO is a no-op stub (vacuous green). **Rebuild** the PO with live legacy-DOM selectors + real behavioral assertions, un-skip, green 3×.
- **react-smoke-legacy-url** → a `(React) Tests` block that navigates a **legacy** URL and asserts only `body.innerText.length > N` / no-fatal. Reviving as-is = fake green (§7 forbids body-length). Superseded by the `new-*` React spec (React side) + the revived real legacy vendor case (legacy side). **Retire** (delete the vacuous block), per the D4/D6 'retire lying smokes' precedent the conversion itself used for social-linking/store-seo.

### A. real-redundant → un-skip + verify (5)

| Location | Kind | Title | PO | →new-* home |
|---|---|---|---|---|
| announcements/announcements.spec.ts:277 | test.skip | Old Test Case 11 - Vendor Deletes Announceme | real | tests/e2e/new-announcement |
| announcements/announcements.spec.ts:336 | test.skip | Test Case 14 - Vendor Views Announcement Det | real | tests/e2e/announcements/an |
| announcements/announcements.spec.ts:483 | describe.skip | New Vendor Announcement (React) Tests @pro | real | tests/e2e/announcements/an |
| follow-store/followStore.spec.ts:123 | test.skip | vendor can view followers menu page | real | new-followers: 'vendor can |
| follow-store/followStore.spec.ts:129 | test.skip | vendor can view followers | real | new-followers: 'a customer |

### B. stub-vacuous → rebuild PO real + un-skip (13)

| Location | Kind | Title | PO | →new-* home |
|---|---|---|---|---|
| products-details/productsDetails.spec.ts:19 | describe.skip | Product details functionality test | stub | tests/e2e/new-product-form |
| seller-badges/sellerBadges.spec.ts:66 | test.skip | vendor can view badges menu page | stub | new-seller-badge: 'vendor  |
| seller-badges/sellerBadges.spec.ts:67 | test.skip | vendor can view badge acquired congratulatio | stub | new-seller-badge gaps: 've |
| seller-badges/sellerBadges.spec.ts:68 | test.skip | vendor can search seller badge | stub | new-seller-badge: 'vendor  |
| seller-badges/sellerBadges.spec.ts:69 | test.skip | vendor can filter seller badges (available_b | stub | new-seller-badge gaps: 'a  |
| withdraws/withdraws.spec.ts:10 | describe.skip | Withdraw test | stub | new-withdraw/ (newWithdraw |
| product-addons/productAddons.spec.ts:51 | test.skip | vendor can view product addons menu page | stub | new-product-addons: 'vendo |
| product-addons/productAddons.spec.ts:78 | test.skip | vendor can remove global product addon | stub | new-product-addons: 'vendo |
| product-qa/productQA.spec.ts:111 | describe.skip | vendor cases — ported to new-product-qa/ | stub | new-product-qa/ (nested sk |
| store-supports/storeSupports.spec.ts:141 | describe.skip | vendor cases — ported to new-store-support/ | stub | new-store-support/ (11 ven |
| vendor-return-request/vendorReturnRequest.spec.ts:17 | describe.skip | Vendor RMA test | stub | new-return-request/ (6 das |
| vendor-staff/vendorStaff.spec.ts:49 | describe.skip | Vendor staff test (vendorStaff) | stub | new-vendor-staff/ (staff-m |
| vendor-verifications/vendorVerifications.spec.ts:106 | describe.skip | vendor dashboard cases — ported to new-vendo | stub | new-vendor-verifications/  |

### C. react-smoke-legacy-url → retire (vacuous body-length) (21)

| Location | Kind | Title | PO | →new-* home |
|---|---|---|---|---|
| follow-store/followStore.spec.ts:152 | describe.skip | Follow Store Vendor (React) Tests @pro (TC1  | real | tests/e2e/new-followers (D |
| request-for-quotes/requestForQuotes.spec.ts:161 | describe.skip | Request For Quotes (React) Tests @pro | stub | tests/e2e/new-requested-qu |
| seller-badges/sellerBadges.spec.ts:84 | describe.skip | Seller Badges (React) Tests @pro (TC1 vendor | stub | tests/e2e/new-seller-badge |
| shipstation/shipstation.spec.ts:58 | describe.skip | Shipstation (React) Tests @pro | stub | tests/e2e/new-shipstation/ |
| social-linking/socialLinking.spec.ts:14 | describe.skip | Vendor Social Linking (React) Tests @pro (TC | stub | tests/e2e/new-social (head |
| store-seo/storeSeo.spec.ts:15 | describe.skip | Store SEO (React) Tests @pro (TC1 renders no | stub | tests/e2e/new-store-seo (h |
| vendor-delivery-time/vendorDeliveryTime.spec.ts:105 | describe.skip | Delivery Time Front-end (React) Tests @pro | stub | (none — guest storefront p |
| vendor-delivery-time/vendorDeliveryTime.spec.ts:69 | describe.skip | Vendor Delivery Time (React) Tests @pro | stub | tests/e2e/new-delivery-tim |
| product-addons/productAddons.spec.ts:116 | describe.skip | Product Add-ons (React) Tests @pro | unknown | new-product-addons/ (2 smo |
| product-advertising/productAdvertising.spec.ts:116 | describe.skip | Product Advertising (React) Tests @pro | unknown | new-product-advertising/ ( |
| product-qa/productQA.spec.ts:180 | describe.skip | Product Q&A (React) Tests @pro | unknown | new-product-qa/ (2 smokes  |
| store-supports/storeSupports.spec.ts:183 | test.skip | Test Case 1 - Vendor support page renders | unknown | new-store-support/ (render |
| store-supports/storeSupports.spec.ts:196 | test.skip | Test Case 2 - Vendor support shows tickets t | unknown | new-store-support/ (table/ |
| store-supports/storeSupports.spec.ts:222 | test.skip | Test Case 4 - Vendor support page survives r | unknown | new-store-support/ (reload |
| vendor-auction/vendorAuction.spec.ts:85 | describe.skip | Vendor Auction (React) Tests @pro | stub | new-auction/ (block naviga |
| vendor-booking/vendorBooking.spec.ts:100 | describe.skip | Vendor Booking (React) Tests @pro | stub | new-booking/ (block naviga |
| vendor-product-subscription/vendorProductSubscription.spec.ts:68 | describe.skip | Vendor Product Subscription (React) Tests @p | stub | new-user-subscription/ (TC |
| vendor-return-request/vendorReturnRequest.spec.ts:90 | describe.skip | Vendor Return Request (React) Tests @pro | unknown | new-return-request/ (2 smo |
| vendor-staff/vendorStaff.spec.ts:93 | describe.skip | Vendor Staff (React) Tests @pro | unknown | new-vendor-staff/ (3 smoke |
| vendor-subscriptions/vendorSubscriptions.spec.ts:111 | describe.skip | Vendor Subscriptions (React) Tests @pro | stub | new-subscription/ (block n |
| vendor-verifications/vendorVerifications.spec.ts:180 | describe.skip | Vendor Verifications (React) Tests @pro | unknown | new-vendor-verifications/  |

### Product bugs (stay `test.fixme` — QA reports, does not fix product code)
- **follow-store followers-cache stale** — `new-followers/bugs/follow-store-followers-cache-stale.md` (unfollow leaves stale followers ~2wk; `Cache::invalidate_group` fix). The 'unfollow removes follower' new-UI test stays `test.fixme`.
- **SE-PAY-09 stripe double-transfer** — `stripe-express/bugs/…` (separate branch scope — untouched here).

## Notes & caveats (live-confirm in Phase 2/3)
- **Product Reviews** (`productReviews.spec.ts`, 9 legacy cases, PRE-EXISTING stub skip) is `partial` with a possible `/dashboard/new/#/reviews` route. Whether `/reviews` covers product-review *moderation* vs only *store* reviews (`new-store-reviews`) needs a live check. It is a PRE-existing skip (not conversion-added) so it is **out of Phase-3 scope**, but flagged here as a possible standalone follow-up.
- The `announcements:483 New Vendor Announcement (React) Tests` block is classified real-redundant/PO=real — confirm live whether it drives a legacy or React URL before deciding un-skip vs retire.
- Some `(React)` smoke blocks list PO=`unknown`; each is inspected at revival time (§7 self-review) before delete.
- The single confirmed gap (shipping drill-in) distance-rate leg is GMAP-gated; table-rate is not.

_Generated from the Phase-1 audit workflow (8 area readers + adversarial gap-verify), 2026-07-09._
