# Stripe Connect — Vendor Subscription test cases

E2E + API test plan for the **Vendor Subscription** feature paid through the
**Stripe Connect** gateway (`dokan-stripe-connect`). Extends the existing suite in
`stripeConnect.spec.ts` / `stripeConnectPage.ts`; reuses its admin pre-setup,
page-object selectors, `stripeApi`, and `dbUtils`.

> **Vendor Subscription** = Dokan Pro `subscription` module (admin module slug
> `product_subscription`). A vendor buys a *subscription pack* (`product_pack`
> product type, an **admin-owned** product) to be allowed to sell. A **recurring**
> pack creates a real **Stripe Subscription** (`sub_…`) billed on the **platform**
> account; a **non-recurring** pack is a one-off PaymentIntent. The pack fee is
> admin revenue — there is **no vendor transfer** for a pack order (contrast with
> normal product orders).

## Why this plan exists

The recurring-pack checkout was broken: the Stripe Payment Element never mounted
(`Error: Could not initialize Stripe.`) so a vendor could not pay for a
subscription via Stripe Connect at all (see `dokan-pro/tests/stripe-connect/
bugs-found.md`; the e2e test was parked as `test.describe.fixme`). Fixed on
`feat/stripe-connect-revemp` (`89506bfe0` use `latest_invoice.payment_intent` +
`35aeb6e6a` cart-fingerprinting for subscription reuse). **VS1.1 / VS1.2 are the
regression guards for that fix.**

---

## Verified live (localhost:9999, 2026-06-18)

Walked the happy path end-to-end before writing this plan — all facts below are
confirmed, not assumed:

- Recurring pack #25 ($10/mo) → `/checkout/` (WC **block**) → select Stripe
  Connect → **PE mounts, no init error** → card `4242…` → **order #26 received**.
- Order #26: status `processing`, `payment_method=dokan-stripe-connect`, meta
  `_stripe_subscription_id=sub_…`, `_stripe_intent_id=pi_…`,
  `dokan_stripe_intent_id=pi_…`.
- Vendor (id 3) user meta after purchase: `product_package_id=25`,
  `product_order_id=26`, `product_pack_startdate=<ts>`,
  `product_pack_enddate=unlimited` (recurring, length 0 = until cancelled),
  `can_post_product=1`, `product_no_with_pack=5`,
  `_customer_recurring_subscription=active`, `_stripe_subscription_id=sub_…`,
  `dokan_has_active_cancelled_subscrption=` (empty).

---

## Implementation status — P0 + P1 ✅ DONE (green)

Implemented in `stripeConnect.spec.ts` (+ helpers) and **passing live on localhost:9999** (`11 passed`):
- **P0:** VS0.1 (enable module) · VS1.1 (PE-mount guard) · VS1.2 (purchase → activation + live `sub_…`) · VS8.5 (pack fee = platform revenue, no vendor transfer).
- **P1:** VS1.4 (3DS recurring → SCA → activates) · VS1.5 (declined → inline error, no paid order) · VS2.1 (free-trial → Stripe `status=trialing`, no immediate charge) · VS3.1 (non-recurring lifetime → one-off PaymentIntent, **no** Stripe sub) · VS4.1 (dashboard active-pack card) · VS5.1 (cancel → `cancel_at_period_end`, stays active) · VS5.2 (reactivate).

Helpers: `dbUtils.getUserMetaValue` / `removeVendorSubscription` / `deleteUserMeta`; `stripeApi.getSubscription` / `transfersForCharge` / `cancelSubscription`; `StripeConnectPage.assertBlockPaymentElementReady` + `gotoVendorSubscriptionDashboard` / `assertActivePackBanner` / `cancelSubscriptionFromDashboard` / `reactivateSubscriptionFromDashboard`; spec helpers `seedSubscriptionPack` / `buyPackExpectReceived` / `getOrderMetaValue` / `cleanupSubscription` / `setVendorSubscriptionFeature`. Test-helper mu-plugin endpoints: `enable-vendor-subscription` / `disable-vendor-subscription` / `flush-rewrites`.

P1 gotchas confirmed during implementation (adversarial-review-verified):
- **The vendor subscription UI is the NEW React route** `/dashboard/new/#/subscription?tab=packs` (NOT the legacy `/dashboard/subscription/`). Cancel = click `Cancel` → `DokanModal` confirm **"Yes, Cancel"** → REST call → **SPA re-render** (no navigation) showing a *"…still active till…"* alert + the action flips to **"Activate"**. Reactivate = click `Activate` (no modal) → REST → flips back to `Cancel`. The React "active" state needs a real `subscription.id && order_id` (order/REST-based) — seeded `can_post_product` meta alone won't render it.
- **The feature toggle `dokan_product_subscription[enable_pricing]` must be ON** for the dashboard endpoint + cancel/reactivate to exist — and it gates **site-wide** product-publish hooks (a vendor with no pack can't publish). It is enabled per-describe (`setVendorSubscriptionFeature(true)` + a rewrite flush in a separate request) and **restored to OFF in teardown** (`cleanupSubscription`) so other specs on the same worker aren't poisoned.
- **Trial:** `has_used_trial_pack` reads user-meta `dokan_used_trial_pack`; clear it (+ `_dokan_subscription_is_on_trial` / `_dokan_subscription_trial_until`) in `beforeAll` or Stripe applies no `trial_end` (status `active`, not `trialing`).
- **Non-recurring** packs route to a normal PaymentIntent (StripeController only subscription-routes `cart_contains_dps_recurring_pack`) → no `sub_…`; `_customer_recurring_subscription` empty; `_stripe_subscription_id` absent.

P0 gotchas (adversarial-review-verified):
- **Money assertion (VS8.5) must use the transfer LEDGER, not the charge.** Dokan Stripe Connect uses Stripe's **separate charges-and-transfers** model (PaymentIntent + `transfer_group`, then standalone `Transfer::create` with `source_transaction`). The charge object's `transfer`/`transfer_data`/`destination` are **always empty** for this gateway — even for a real multi-vendor split — so asserting on them is vacuous. VS8.5 asserts `stripeApi.transfersForCharge(chargeId).length === 0` (same pattern as the existing multi-vendor split tests).
- **Subscription REST routes are stale on this build.** `dokan/v1/subscription/save-commission` and `dokan/v1/vendor-subscription/packages` (the names in `apiEndPoints.ts`) return **404** on `feat/stripe-connect-revemp` (the live routes are `dokan/v1/product-subscriptions/*`). Seed the pack + commission via DB (`setSubscriptionProductType` → `createProduct(simple)` → `updateProductType` → `setPostMeta` for commission), not the commission-save endpoint.

## Harness & setup notes (for implementation)

**Module** — enable `product_subscription` (mirror `setModuleEnabled('stripe', …)`
in the page object; idempotent). Keep the existing pre-setup that **enables
`stripe` + disables `stripe_express`** — both Stripe gateways active conflicts
with PE bootstrap.

**Gateway** — reuse `configureGateway()` from the existing pre-setup
(`enabled+testmode+keys+clientId`). Gated on `hasCredentials` exactly like the
current specs; pack purchase needs only the platform keys (the *buyer* vendor does
**not** need to be Stripe-connected — the charge is on the platform account).

**Pack seeding** — there is no usable public REST create-route for packs on this
build (the `dokan/v1/vendor-subscription/packages` route is **not registered** on
localhost:9999; only customer-facing `dokan/v1/product-subscriptions` exists). Seed
packs in `beforeAll` via a `dbUtils`/CLI helper that creates a `product_pack`
product. Confirmed-working meta (set after `wp_set_object_terms($id,'product_pack',
'product_type')`):

| Meta key | Recurring example | Non-recurring example |
|---|---|---|
| `_regular_price` / `_price` | `10` | `999` |
| `_no_of_product` | `5` (`-1` = unlimited) | `-1` |
| `_pack_validity` | `30` (days; `-1` = unlimited) | `-1` |
| `_enable_recurring_payment` | `yes` | `no` |
| `_dokan_subscription_period_interval` | `1` | — |
| `_dokan_subscription_period` | `day`\|`week`\|`month`\|`year` | — |
| `_dokan_subscription_length` | `0` (until cancelled) | — |
| trial: `dokan_subscription_enable_trial` / `dokan_subscription_trail_range` / `dokan_subscription_trial_period_types` | `yes` / `3` / `day` | — |

Also set the product `virtual=yes`, `sold_individually=yes`,
`catalog_visibility=hidden`, status `publish`.

**Checkout selectors (block — site default `/checkout/`)** — already in the page
object and confirmed for a pack cart:
- add to cart: `?add-to-cart=<packId>` (any URL); then go to `/checkout/`.
- gateway radio: `#radio-control-wc-payment-method-options-dokan-stripe-connect`
- PE mount: `.dokan-stripe-connect-payment-element`
- card iframe title `Secure payment input frame`; fields by role
  `Card number` / `Expiration date` / `Security code` (page object
  `selectBlockGateway()` + `fillCardDetails()` work unchanged).
- place order: `.wc-block-components-checkout-place-order-button` → `**/order-received/**`.
- init-error guard: assert page text does **not** match `/could not initialize stripe/i`.

**Vendor dashboard** — packs page `/dashboard/subscription/` (tabs
`?tab=subscription_packs` / `?tab=subscription_orders`). Pack card
`.product_pack_item`; buy link `a.buy_product_pack` (`.trial_pack` for trial packs)
→ `/dashboard/subscription/?add-to-cart=<id>`. Cancel/reactivate form
`#dps_submit_form`, inputs `dps_cancel_subscription` / `dps_activate_subscription`
(nonces `dps-sub-cancel` / `dps-sub-activate`). Dismiss the announcement modal
first (`closeAnnouncementModal`).

**Admin** — Subscriptions list `admin.php?page=dokan-dashboard#/subscriptions`;
assign-pack on the user-edit screen (`_dokan_user_assigned_sub_pack`).

**Webhooks** — endpoint `?wc-api=dokan_stripe`, unsigned events accepted (handler
re-fetches by id; see existing `postWebhookEvent` helper). Stripe → localhost
delivery needs the Stripe CLI; renewal/lifecycle cases are partial-coverage +
logged gap, same as the existing webhook cases.

---

## Test cases

Priority: **P0** = the fix + core money path · **P1** = important coverage ·
**P2** = edge/nice-to-have. Surface: **UI** = browser, **API** = REST/Stripe API,
**WH** = webhook (needs Stripe CLI / crafted event).

### Group 0 — Setup / preconditions  `describe.serial`  `@pro @admin`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS0.1 | P0 | UI | Admin enables the Vendor Subscription module | Module `product_subscription` toggles on (idempotent); subscription dashboard menu + admin Subscriptions page register. |
| VS0.2 | P0 | UI | Stripe Connect gateway ready, Express disabled | Reuse existing pre-setup: `stripe` on, `stripe_express` off, gateway enabled + test mode + keys set. |
| VS0.3 | P2 | UI | Admin creates a recurring pack via the product editor | Product type **Dokan Subscription** (`product_pack`); set price, no. of products, validity, recurring interval/period; saves with correct meta. *(Workhorse seeding is API/CLI in `beforeAll`; this verifies the admin authoring UI.)* |

### Group 1 — Recurring pack via Stripe Connect (the fixed path)  `describe.serial`  `@pro @vendor`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| ★ **VS1.1** | **P0** | UI | **PE mounts on recurring-pack checkout** (regression guard) | Add recurring pack → `/checkout/` → select `dokan-stripe-connect` → `.dokan-stripe-connect-payment-element` becomes visible + Stripe card iframe present + page has **no** "Could not initialize Stripe". No charge needed — fast guard for the fixed bug. |
| ★ **VS1.2** | **P0** | UI+API | **Recurring purchase activates the subscription** | Card `4242…` → place order → `order-received`. Order: status `processing`\|`completed`, `payment_method=dokan-stripe-connect`, meta `_stripe_subscription_id` (`sub_…`) + `_stripe_intent_id` (`pi_…`). Vendor meta: `product_package_id=<pack>`, `can_post_product=1`, `_customer_recurring_subscription=active`, `_stripe_subscription_id` set, `product_no_with_pack=<limit>`. |
| VS1.3 | P1 | API | Stripe Subscription object is active | Resolve `sub_…` from order meta via `stripeApi`; assert subscription `status` ∈ {active, trialing} and its first invoice's PaymentIntent succeeded on the **platform** account. |
| VS1.4 | P1 | UI | 3DS recurring card completes after SCA | Card `4000 0025 0000 3155` → complete the SCA challenge (`complete3DSChallenge`) → subscription activates (assert order status server-side, like the existing 3DS cases). |
| VS1.5 | P1 | UI | Declined card → no subscription | Card `4000 0000 0000 0002` → inline error, no `order-received`; vendor **not** activated (`can_post_product` unchanged/empty, no `_stripe_subscription_id`). |

### Group 2 — Recurring pack with free trial  `@pro @vendor`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS2.1 | P1 | UI+API | Trial pack activates without an immediate charge | Buy a trial pack → checkout shows trial → purchase → Stripe subscription `status=trialing` (no/zero immediate invoice); vendor activated for the trial window (`product_pack_startdate` set, can post products). |

### Group 3 — Non-recurring (lifetime) pack  `@pro @vendor`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS3.1 | P1 | UI+API | Non-recurring pack via Stripe Connect (PaymentIntent path) | Buy a lifetime pack → `order-received`. Vendor activated; `product_pack_enddate` per validity (`unlimited` for lifetime); `_customer_recurring_subscription` empty; **no** `_stripe_subscription_id` on order/user (one-off charge, no Stripe Subscription object). |

### Group 4 — Post-subscription capabilities & dashboard state  `@pro @vendor`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS4.1 | P1 | UI | Dashboard shows the active pack | `/dashboard/subscription/` shows "You are using <pack>", product count, recurring/period info, and the active-pack banner. |
| VS4.2 | P1 | API/UI | Subscribed vendor can publish a product | With an active pack, vendor can create + publish a product within `product_no_with_pack`. |
| VS4.3 | P2 | API/UI | Product limit is enforced | Past `_no_of_product`, publishing is blocked/forced pending. |

### Group 5 — Cancel / reactivate  `describe.serial`  `@pro @vendor`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS5.1 | P1 | UI+API | Vendor cancels a recurring subscription | Submit `dps_cancel_subscription` → Stripe sub set `cancel_at_period_end` (still active till period end); dashboard shows "cancelled but active till <date>"; `dokan_has_active_cancelled_subscrption` set. |
| VS5.2 | P1 | UI+API | Vendor reactivates a cancelled-but-active subscription | Submit `dps_activate_subscription` → Stripe sub resumes (`cancel_at_period_end` cleared); banner clears. |

### Group 6 — Renewal & lifecycle (webhook-driven)  `@pro`

> Coverage note: Stripe→localhost delivery needs the Stripe CLI. Cover via crafted
> events to `?wc-api=dokan_stripe` where the handler re-fetches by id; otherwise
> `log.skip` the gap (don't silently pass).

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS6.1 | P1 | WH | Renewal invoice creates a renewal order | `invoice.payment_succeeded` (billing_reason `subscription_cycle`) → renewal **child** order (parent = original), pack end-date extended, vendor stays active. |
| VS6.2 | P2 | WH | Renewal payment failure | `invoice.payment_failed` → vendor subscription handled (pending/inactive per product behaviour). |
| VS6.3 | P1 | WH | Subscription deleted revokes the pack | `customer.subscription.deleted` → `can_post_product` cleared, `_stripe_subscription_id` deleted. |

### Group 7 — Admin management  `@pro @admin`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS7.1 | P1 | UI | Subscribed vendor appears in the admin Subscriptions list | `admin.php?page=dokan-dashboard#/subscriptions` lists the vendor + pack. |
| VS7.2 | P2 | UI | Admin cancels a vendor subscription | Cancel immediately / at end of period; state reflects on the vendor + Stripe. |
| VS7.3 | P2 | UI | Admin assigns a non-recurring pack to a vendor | User-edit assign (`_dokan_user_assigned_sub_pack`) activates the vendor without checkout. |

### Group 8 — Edge / negative / money  `@pro`

| ID | Pri | Surface | Title | Expected |
|----|-----|---------|-------|----------|
| VS8.1 | P1 | UI+API | Subscription reuse — no duplicate Stripe subscription | Re-enter/reload checkout for the same pack (cart-fingerprint fix `35aeb6e6a`) → exactly **one** `sub_…` created for the purchase, not duplicated. |
| VS8.2 | P2 | UI/API | Only one pack per cart | Adding a second pack replaces/empties the first; cart never holds two packs. |
| VS8.3 | P2 | UI+API | Switch plan | Vendor on pack A buys pack B → old subscription replaced, new pack active. |
| VS8.4 | P2 | UI | Logged-out cannot buy a recurring pack | Guest add-to-cart of a recurring pack redirects to login. |
| ★ VS8.5 | P1 | API | Pack fee hits the platform, no vendor transfer | For a pack order, the charge lands on the **platform** account and **no** transfer is created to any connected account (the money-correctness contrast vs product orders). |

---

## Suggested build order

1. **P0 first runnable slice** — VS0.1, VS0.2 (setup) → VS1.1 (PE-mount guard) →
   VS1.2 (activation) → VS8.5 (platform charge, no transfer). This locks the fix.
2. **P1** — VS1.3/1.4/1.5, VS3.1 (non-recurring), VS2.1 (trial), VS5.1/5.2
   (cancel/reactivate), VS4.1/4.2, VS8.1 (reuse), VS6.1/6.3 (webhook), VS7.1.
3. **P2** — remaining admin/edge cases.

## Open questions / risks

- Admin Subscriptions list UI (VS7.x) — confirm route + whether it's a DataViews
  page on this build before writing selectors.
- Trial pack (VS2.1): confirm whether the gateway uses a SetupIntent (no first
  charge) vs a $0 invoice — assert on Stripe `subscription.status=trialing`, not on
  an order total.
- Renewal/lifecycle (Group 6) is webhook-gated; expect the same partial-coverage
  caveat as the existing webhook tests.
