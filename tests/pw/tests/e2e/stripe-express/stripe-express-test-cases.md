# Dokan Stripe Express — E2E Test-Case Catalog

> **Status:** Planning (proper-planning phase, before any test code).
> **Module under test:** Dokan Pro → *Stripe Express* (`modules/stripe-express`, gateway id `dokan_stripe_express`).
> **Architecture mirrored from:** the `tests/stripe-connect-e2e` suite (page-object + suite-local `helpers.ts` + `utils/stripeApi.ts` + a `dokan-test-express/v1` mu-plugin + fail-loud preflight).
> **Authoritative module map:** `scratchpad/understand/REPORT_A.md` (every `file:line` below traces back to it).

This document enumerates **happy-path, negative, edge, security, and regression** cases. It is the contract the spec files implement. Cases marked **(needs live MCP)** have a selector/behaviour that must be confirmed in a real browser against a running Express site before the spec relies on it.

---

## 0. Conventions

### 0.1 Environment & run target
- Suite is **env-driven**; default `BASE_URL=http://localhost:9999` (wp-env), overridable via `.env`. CI runs the Pro lane on wp-env.
- Live selector/flow validation during authoring is done against the running Local site **`shohan-payment.test`** (Express already configured there).
- **Module invariant (critical):** the **Stripe Connect module (`stripe`) MUST be deactivated** and **Stripe Express (`stripe_express`) activated** before any Express test. They conflict (Express also hides the legacy Connect gateway at checkout — `Controllers/Checkout.php:639-653`), so the suite setup deactivates `stripe` first. Enforced by `dokan-test-express/v1/configure-stripe-express`.

### 0.2 Credentials & gating
- `TEST_PUBLISH_KEY_STRIPE_EXPRESS`, `TEST_SECRET_KEY_STRIPE_EXPRESS` — Stripe sandbox test keys (also in `getdokan/dokan` GitHub Actions secrets). `hasCredentials = pub && secret`.
- `STRIPE_EXPRESS_VENDOR1_ACCT`, `STRIPE_EXPRESS_VENDOR2_ACCT` — **real connected sandbox `acct_…` ids** for live transfer/refund money assertions. When absent → those money specs **self-skip** (gated `HAS_REAL_CONNECTED_ACCOUNTS`). Vendors are connected **for real** via the hosted onboarding where possible; the captured `acct_` is then reused.
- **Gating legend:** `skip !hasCredentials` (no keys → checkout/charge tests skip); `skip !HAS_REAL` (no real connected accounts → money-movement tests skip); `serial` (mutates global gateway/module state → single worker).
- **Tags:** every case is `@pro`. Role tags: `@admin`, `@vendor`, `@customer`. (Lite lane never selects these.)
- **Fail-loud preflight (SE-PRE):** when CI declares the secrets required but they're missing, FAIL — never silently skip a whole green run.

### 0.3 Stripe test cards (test mode)
| Purpose | Number |
|---|---|
| Success | `4242 4242 4242 4242` |
| SCA required (on-session) | `4000 0025 0000 3155` |
| SCA required (off-session / renewal) | `4000 0027 6000 3184` |
| SCA required → then declined | `4000 0084 0000 1629` |
| Declined (generic) | `4000 0000 0000 0002` |
| Insufficient funds | `4000 0000 0000 9995` |
| Expired card | `4000 0000 0000 0069` |
| Incorrect CVC | `4000 0000 0000 0127` |
Expiry = any future (`12 / 34`), CVC = any 3 digits, ZIP = any.

### 0.4 Fixtures / seed model
- Users (defaults): `VENDOR_ID=3`, `VENDOR2_ID=5`, `CUSTOMER_ID=2`; auth storage states for admin / vendor / vendor2 / customer.
- **Seed a connected vendor (no real onboarding):** write user-meta `_dokan_stripe_express_test_account_info` (test mode) as a **PHP array** with `account_id`, `charges_enabled=true`, `payouts_enabled=true`, `transfers_enabled=true`, `details_submitted=true`, `type='express'` (`UserMeta.php:158-206`; `is_connected()` reads only this array — `Processors/User.php:344-346`). NB: the vendor *page* still needs valid API keys configured (`Helper::is_seller_connected()` also checks `is_gateway_ready()` — `Helper.php:174-180`).
- Restore full working config in `afterEach`/`afterAll` so later workers see a clean gateway.

### 0.5 Verification TODOs (resolve via live MCP before coding the dependent specs)
- **T1** key sub-fields to write for test mode: `testmode='yes'`, `sandbox_mode='no'`, `test_publishable_key` / `test_secret_key` / `test_webhook_key` (mode-prefix logic `Stripe::init_fields()` `Stripe.php:113-166`). Confirm a config round-trip makes the gateway "ready".
- **T2 / T6** Payment Element iframe field ids — confirm `#payment-numberInput` / `input[name="number"]` / expiry / cvc inside the Express PE iframe; confirm whether a **"Card" accordion** must be opened first (PE may show card/iDEAL/SEPA per default capabilities).
- **T3** `payment_method_configuration` — whether blank works in sandbox or must be `default`.
- **T4** Express webhook event-registry static accessor (for the `/express-webhook` injector) under `Utilities\Factories\WebhookEvents`.
- **T5** refund path — whether Express refunds run through Dokan `method=1` API refund (reuse a `/refund` route) or standard WC `process_refund`.

---

## 1. SE-PRE — Pre-flight (fail loud)
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-PRE-01 | guard | When secrets are *required* (CI) but `TEST_*_STRIPE_EXPRESS` missing → **FAIL** (don't skip the suite to green). When not required (local/fork) → skip-with-warning. | `@pro` | always runs |
| SE-PRE-02 | guard | Keys present but no real `STRIPE_EXPRESS_VENDOR*_ACCT` → **warn only** (transfer/refund specs documented-skip). | `@pro` | — |

---

## 2. SE-MOD — Module management (admin)
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-MOD-01 | H | Admin can **deactivate** the Stripe **Connect** (`stripe`) module (precondition for Express). | `@pro @admin` | serial |
| SE-MOD-02 | H | Admin can **activate** the Stripe **Express** (`stripe_express`) module; toggle persists (waits on the real `/modules/activate` REST response). | `@pro @admin` | serial |
| SE-MOD-03 | E | Activating Express is **idempotent** — re-activating an already-on module is a no-op (no error, stays on). | `@pro @admin` | serial |
| SE-MOD-04 | E | With `stripe_express` **off**, the `dokan_stripe_express` gateway is absent from WC Payments and from checkout (controllers gated by module — `module.php:57-83`). | `@pro @admin` | serial |
| SE-MOD-05 | N | Deactivating Express while the gateway was the only enabled method does not fatally break checkout (gateway just disappears). | `@pro @customer` | serial |

---

## 3. SE-SET — Gateway settings (admin)
Settings live at `wc-settings&tab=checkout&section=dokan_stripe_express`; one serialized option `woocommerce_dokan_stripe_express_settings`.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-SET-01 | H | Configure gateway: enable, `testmode=yes`, fill test pub/secret/webhook keys; save; re-read → fields persist; gateway becomes **API-ready**. (T1) | `@pro @admin` | serial · skip !hasCredentials |
| SE-SET-02 | H | `title` + `description` render on the checkout method label. | `@pro @customer` | skip !hasCredentials |
| SE-SET-03 | E | **No `enable_3d_secure` field exists** (SCA is unconditional via `confirmPayment`) — Express analogue of Connect's "3DS field disabled". | `@pro @admin` | — |
| SE-SET-04 | E | **No `allow_non_connected_sellers` field exists** — the gateway is available regardless of vendor connection (`is_available` — `Stripe.php:203-215`). | `@pro @admin` | — |
| SE-SET-05 | H | Saving the gateway with valid keys **auto-creates** the Stripe webhook endpoint; disabling/clearing removes it (`process_admin_options` `Stripe.php:247-260`). (best-effort assert via Stripe API) | `@pro @admin` | skip !hasCredentials |
| SE-SET-06 | E | `sandbox_mode=yes` reads `sandbox_*` keys; `testmode=yes` reads `test_*`; live reads bare keys (mode-prefix logic). Configure each and assert readiness reflects the active set. | `@pro @admin` | skip !hasCredentials |
| SE-SET-07 | N | Invalid key format (`pk_xyz`) → gateway **not** API-ready (`Config::verify_api_keys` regex — `Config.php:243-256`); checkout method hidden. | `@pro @admin` | — |
| SE-SET-08 | N | Empty keys → gateway unavailable at checkout; vendor onboarding UI + withdraw method not registered (`is_api_ready` gate). | `@pro @admin` | — |
| SE-SET-09 | E | Live mode without SSL → gateway unavailable (`Helper::is_gateway_ready` — `Helper.php:141-152`). | `@pro @admin` | — |
| SE-SET-10 | H | `saved_cards` toggle OFF → no save-card checkbox at checkout; ON → checkbox present. | `@pro @customer` | skip !hasCredentials |
| SE-SET-11 | H | `capture=manual` → order is **authorized** (not captured); non-card methods hidden; capture-later path. | `@pro @customer` | skip !HAS_REAL |
| SE-SET-12 | E | `disburse_mode` = `ON_ORDER_PROCESSING` vs `ON_ORDER_COMPLETED` vs `DELAYED` (+ `disbursement_delay_period`) controls when the vendor transfer fires. | `@pro @admin` | skip !HAS_REAL |
| SE-SET-13 | E | `statement_descriptor` is sanitized/truncated to ≤22 chars on save. | `@pro @admin` | — |
| SE-SET-14 | E | `element_theme` (`stripe`/`flat`/`night`/`none`) is passed to the Payment Element appearance. | `@pro @customer` | skip !hasCredentials |
| SE-SET-15 | H | `payment_request` (Apple/Google Pay) toggle + button type/theme/locations/size persist. | `@pro @admin` | — |
| SE-SET-16 | E | `sellers_pay_processing_fee` toggles `dokan_gateway_fee_paid_by` between `seller`/`admin` on the order. | `@pro @customer` | skip !HAS_REAL |
| SE-SET-17 | E | `cross_border_transfer` ON surfaces the vendor country picker on the onboarding page; `restricted_countries` removes them from options. | `@pro @vendor` | skip !hasCredentials |

---

## 4. SE-RDY — Gateway readiness & availability
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-RDY-01 | H | With valid keys, the **Stripe Express withdraw method** registers and the vendor onboarding page is reachable. | `@pro @admin` | skip !hasCredentials |
| SE-RDY-02 | E | ⚠️ **CORRECTED (live-verified):** Express is **NOT** available when a cart vendor is unconnected — `Order::validate_cart_items()` (`Order.php:457-505`, `is_seller_activated`) hides the method so it never accepts a payment it cannot pay out. (report A§2's "available regardless of connection" was imprecise.) Tested as: non-connected cart → method absent (see SE-EDGE-05 / SE-PAY-03 / SE-PAY-11). | `@pro @customer` | skip !hasCredentials |
| SE-RDY-03 | E | When Express is enabled, the **legacy Stripe Connect gateway is hidden** at checkout (`Checkout.php:639-653`). | `@pro @customer` | skip !hasCredentials |

---

## 5. SE-ONB — Vendor onboarding (hosted account-links)
Three UI states from `Processors\User` (reads user-meta). Dashboard slug `settings/payment-manage-dokan_stripe_express`.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-ONB-01 | H | **Not-connected** vendor sees the **Connect** button `#dokan-stripe-express-account-connect` (state 1, template 78-148). | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-02 | H | Clicking Connect POSTs admin-ajax `dokan_stripe_express_vendor_signup` and **redirects to a Stripe-hosted onboarding URL** (`connect.stripe.com` account-link). *(commit-only assert; external Stripe.)* **(needs live MCP — also the real-onboarding path to capture an `acct_`.)** | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-03 | H | **Real onboarding** end-to-end (drive the Stripe hosted Express flow) → returns to dashboard `action=stripe_express_onboarding`, vendor shows **Connected** state. *(manual/assisted; captures a reusable `acct_`.)* **(needs live MCP)** | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-04 | H | **Seeded-connected** vendor shows state 3: Merchant-ID success alert + `#dokan-stripe-express-dashboard-login` ("Visit Express Dashboard") + `#dokan-stripe-express-account-disconnect`. | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-05 | H | **Disconnect** via `#dokan-stripe-express-account-disconnect` (POST `dokan_stripe_express_vendor_disconnect`) trashes the account → Connect button returns. | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-06 | E | **Onboarding-incomplete** state 2 (`account exists`, `is_connected()` false): "Complete Onboarding" + `#dokan-stripe-express-account-cancel`. | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-07 | H | **Cancel onboarding** (`dokan_stripe_express_cancel_onboarding`, force-disconnect) removes the account permanently → back to Connect button. | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-08 | H | **Visit Express Dashboard** button (`dokan_stripe_express_get_login_url`) returns a Stripe login link (`Account::create_login_link`). *(assert link returned, don't follow.)* | `@pro @vendor` | skip !HAS_REAL |
| SE-ONB-09 | E | **Trashed-account reconnect**: a vendor with `trashed_account_id` re-onboarding reuses that id (`User::onboard` reconnect path). | `@pro @vendor` | skip !hasCredentials |
| SE-ONB-10 | S | Onboarding AJAX requires the `dokan_stripe_express_vendor_payment_settings` **nonce** + `dokan_manage_withdraw` cap — a logged-out / capless POST is rejected. | `@pro @vendor` | — |
| SE-ONB-11 | S | **IDOR:** vendor A cannot onboard/disconnect vendor B by passing another `seller_id`. | `@pro @vendor` | — |
| SE-ONB-12 | H | **Admin-side disconnect** from the WP user-profile (`dokan_stripe_express_admin_disconnect`) clears the vendor's connection. | `@pro @admin` | — |
| SE-ONB-13 | E | Vendor without a saved store **address** sees the store-address guard before the Connect button renders. | `@pro @vendor` | skip !hasCredentials |

---

## 6. SE-CHK-B — Customer checkout · BLOCK (WC Checkout block, site default `/checkout/`)
Block method `dokan_stripe_express`; PE mount `#dokan-stripe-express-payment-element`; radio `#radio-control-wc-payment-method-options-dokan_stripe_express`.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-CHK-B-01 | H | Logged-in customer buys a **connected-vendor** product with `4242…` → redirects to **order-received**; order paid; intent meta `_dokan_stripe_express_payment_intent_id` set. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-02 | H | Selecting the Express method **mounts the Payment Element** (real Stripe card iframe present); no init error. **(needs live MCP — accordion T2)** | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-03 | N | **Declined** card (`4000…0002`) → inline block error notice; **no** order-received; no paid order. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-04 | N | **Insufficient funds** (`…9995`) → declined error, no order. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-05 | E | Cart with **two products from two different vendors** → single charge, order splits into sub-orders. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-06 | E | "Save payment method" checkbox shown only when `saved_cards` on; ticking it during block checkout. *(NB: block-save attach is a known Connect-gateway weakness — assert actual behaviour, file a bug if pm not attached.)* | `@pro @customer` | skip !hasCredentials |
| SE-CHK-B-07 | E | Cart total **changes after the PE mounts** (coupon applied) → PE re-mounts cleanly, order still completes. | `@pro @customer` | skip !hasCredentials |

---

## 7. SE-CHK-C — Customer checkout · CLASSIC (`[woocommerce_checkout]` shortcode page)
Classic PE mount `#dokan-stripe-express-element`; fieldset `#dokan-stripe-express-form`; errors `#dokan-stripe-express-errors`; place order `#place_order`. (hCaptcha/Link neutralisation as in Connect.)

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-CHK-C-01 | H | Logged-in customer buys with `4242…` on classic checkout → order-received; order paid. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-C-02 | H | Express method selection mounts the classic Payment Element; billing pre-fill respected. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-C-03 | N | Declined card → inline `#dokan-stripe-express-errors`; no order-received. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-C-04 | E | Incorrect CVC (`…0127`) / expired (`…0069`) → respective inline error; no order. | `@pro @customer` | skip !hasCredentials |
| SE-CHK-C-05 | E | Reuse a **saved token** on classic checkout (off-session) → order completes without re-entering the card (see SE-SAVE-03). | `@pro @customer` | skip !hasCredentials |

---

## 8. SE-GUEST — Guest checkout
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-GUEST-01 | H | Guest (no login) completes a **block** checkout with `4242…` after filling contact + shipping → order-received. | `@pro @customer` | skip !hasCredentials |
| SE-GUEST-02 | H | Guest completes a **classic** checkout with `4242…` → order-received. | `@pro @customer` | skip !hasCredentials |
| SE-GUEST-03 | N | Guest declined card → error, no order. | `@pro @customer` | skip !hasCredentials |

---

## 9. SE-SAVE — Saved cards / tokenization (SetupIntent)
Add-payment-method WC-AJAX `dokan_stripe_express_init_setup_intent`; saved-token POST `wc-dokan_stripe_express-payment-token`; new-card checkbox `#wc-dokan_stripe_express-new-payment-method`; My-Account `/payment-methods/`.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-SAVE-01 | H | Add a card via **My-Account → Add payment method** (SetupIntent) → token stored; pm **attached** on Stripe (assert via Stripe API). | `@pro @customer` | skip !hasCredentials |
| SE-SAVE-02 | H | Saved card listed on `/payment-methods/` ("Visa ending 4242", expiry). | `@pro @customer` | skip !savedPm |
| SE-SAVE-03 | H | **Reuse** the saved token at checkout (off-session) → order completes. | `@pro @customer` | skip !savedPm |
| SE-SAVE-04 | H | **Set default** → row gains default class; Stripe customer `invoice_settings.default_payment_method` updated. | `@pro @customer` | skip !savedPm |
| SE-SAVE-05 | H | **Delete** card → row removed; pm **detached** on Stripe (`.customer` null). | `@pro @customer` | skip !savedPm |
| SE-SAVE-06 | S | Add-payment-method requires login — a logged-out SetupIntent POST is rejected. | `@pro @customer` | — |
| SE-SAVE-07 | E | Reuse a **3DS-renewal** saved card (`4000…3184`) off-session → SCA re-prompt handled. | `@pro @customer` | skip !hasCredentials |

---

## 10. SE-3DS — 3-D Secure / SCA
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-3DS-01 | H | **Block** checkout with `4000…3155` → SCA challenge; completing it settles the order to a paid status (assert order STATUS, not URL — redirect is unreliable in automation). | `@pro @customer` | skip !hasCredentials |
| SE-3DS-02 | H | **Classic** checkout with `4000…3155` → ACS challenge frame loads; complete → order settles. | `@pro @customer` | skip !hasCredentials |
| SE-3DS-03 | N | **Declined-after-auth** (`4000…0084…1629`): pass SCA, card then declined → **no paid order**; error surfaced. | `@pro @customer` | skip !hasCredentials |
| SE-3DS-04 | E | Abandon the SCA challenge (close without completing) → order stays unpaid/pending. | `@pro @customer` | skip !hasCredentials |

---

## 11. SE-CUR — Currency & amount invariants
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-CUR-01 | H | Non-round total (e.g. `$12.37`) → captured charge amount **== order total** (no rounding drift). | `@pro @customer` | skip !hasCredentials |
| SE-CUR-02 | E | **Zero-decimal** currency (JPY): charge `amount` == the yen integer (NOT ×100). *(pin with `test.fail` if the ×100 bug recurs.)* | `@pro @customer` | skip !hasCredentials |
| SE-CUR-03 | E | Second zero-decimal currency (UGX) — same invariant. | `@pro @customer` | skip !hasCredentials |
| SE-CUR-04 | E | Total with a **coupon discount** → charge == discounted total; vendor transfer reflects discounted earning. | `@pro @customer` | skip !HAS_REAL |
| SE-CUR-05 | E | Total with **tax + shipping** → `tax_fee_recipient` / `shipping_fee_recipient` applied; amounts reconcile. | `@pro @customer` | skip !HAS_REAL |

---

## 12. SE-PAY — Payout / money movement (separate charge + transfer)
PaymentIntent on the **platform** (no destination/application_fee); vendor paid via Stripe **Transfer** with `source_transaction` = charge. Order meta `_dokan_stripe_express_transfer_id`. **All gated `skip !HAS_REAL`.**

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-PAY-01 | H | Single connected-vendor order → exactly **one Transfer** to that vendor's `acct_`, amount == vendor earning; admin commission stays on platform. | `@pro @customer` | skip !HAS_REAL |
| SE-PAY-02 | H | **Multi-vendor** order (2 connected vendors) → **two Transfers**, one per vendor `acct_`, each == that vendor's earning. | `@pro @customer` | skip !HAS_REAL |
| SE-PAY-03 | E | ⚠️ **CORRECTED (live-verified):** the no-payout guarantee — a **non-connected** vendor cart is **refused** by Express (method absent), so "charge on platform, zero transfer" is unreachable. Asserts the method is absent. | `@pro @customer` | skip !hasCredentials |
| SE-PAY-04 | E | `sellers_pay_processing_fee` on → Stripe fee deducted from vendor earning (transfer amount lower); off → admin absorbs. | `@pro @customer` | skip !HAS_REAL |
| SE-PAY-05 | E | `disburse_mode=DELAYED` → no transfer at order time; transfer fires after the delay (background process). | `@pro @customer` | skip !HAS_REAL |
| SE-PAY-06 | H | A **Dokan withdraw entry** is recorded for the vendor after a successful transfer. | `@pro @admin` | skip !HAS_REAL |
| SE-PAY-07 | E | **Manual capture** order: authorize → later capture → transfer happens on capture, amount correct. | `@pro @admin` | skip !HAS_REAL |

---

## 13. SE-REF — Refunds (transfer reversal) — gated on **T5** + `HAS_REAL`
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-REF-01 | H | **Full** refund → Stripe refund on the charge + **transfer reversal** for the vendor; order → refunded; `_dokan_stripe_express_refund_ids` recorded. | `@pro @admin` | skip !HAS_REAL |
| SE-REF-02 | H | **Partial** refund → partial refund + proportional transfer reversal. | `@pro @admin` | skip !HAS_REAL |
| SE-REF-03 | E | **Per-suborder** refund in a multi-vendor order reverses only that vendor's transfer. | `@pro @admin` | skip !HAS_REAL |
| SE-REF-04 | N | **Double refund** of the same amount is rejected / idempotent (no second Stripe refund). | `@pro @admin` | skip !HAS_REAL |
| SE-REF-05 | E | Refund **after disbursement** still reverses the transfer (or surfaces a clear failure if balance insufficient). | `@pro @admin` | skip !HAS_REAL |

---

## 14. SE-WH — Webhooks
Endpoint `?wc-api=dokan-stripe-express` (hyphens). HMAC-SHA256 over `{t}.{body}`, ≤5-min skew; **no secret stored → UA fallback**.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-WH-01 | H | A signed `payment_intent.succeeded` for an order marks it paid / reconciles. | `@pro @admin` | skip !hasCredentials |
| SE-WH-02 | S | **Unsigned/invalid-signature** event with a webhook secret configured → **rejected** (HTTP 204, no state change). | `@pro @admin` | skip !hasCredentials |
| SE-WH-03 | E | **UA fallback:** with no webhook secret stored, a request with the `Stripe` user-agent is accepted (documents the fallback). | `@pro @admin` | — |
| SE-WH-04 | E | **Replay** of `payment_intent.succeeded` → **no duplicate** transfer / no double-processing. | `@pro @admin` | skip !HAS_REAL |
| SE-WH-05 | H | `charge.refunded` webhook reconciles the order to refunded. | `@pro @admin` | skip !hasCredentials |
| SE-WH-06 | N | ⚠️ **CORRECTED — see SE-WH-12 (Addendum A).** Express has **no `payment_intent.payment_failed` handler**; the real failed-payment event is `charge.failed`. Re-pointed there. | `@pro @admin` | skip !hasCredentials |
| SE-WH-07 | E | `charge.dispute.created` / `closed` → order note / status reflects the dispute. | `@pro @admin` | skip !hasCredentials |
| SE-WH-08 | E | `account.updated` for a connected vendor syncs `charges_enabled`/`payouts_enabled` into the stored account_info. | `@pro @admin` | skip !hasCredentials |
| SE-WH-09 | E | `setup_intent.succeeded` finalizes a saved-card token. | `@pro @customer` | skip !hasCredentials |

---

## 15. SE-WALLET — Payment Request / Express Checkout Element (wallets)
Express/wallet block method `dokan_stripe_express_checkout` (distinct from the gateway `dokan_stripe_express`). PRB locations product/cart/checkout.

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-WALLET-01 | H | With `payment_request` on, the **Express Checkout / Link element renders** on block checkout (Stripe iframe under an "Express Checkout" heading). | `@pro @customer` | skip !hasCredentials |
| SE-WALLET-02 | E | Payment Request **button renders on the product page** when location includes `product`. | `@pro @customer` | skip !hasCredentials |
| SE-WALLET-03 | E | PRB renders on **cart** when configured; absent when the location is unchecked. | `@pro @customer` | skip !hasCredentials |
| SE-WALLET-04 | E | No JS console error / cartData failure when the wallet element mounts (regression guard, BUG-9/10 analogue). | `@pro @customer` | skip !hasCredentials |
| SE-WALLET-05 | — | Native Apple/Google Pay **sheets** (require real device + domain registration) → **documented skip** (`log.skip`), covered by render-only above. | `@pro @customer` | always skip (deferred) |

---

## 16. SE-SUB — Vendor / product subscriptions paid via Express
Express loads subscription controllers when API-ready (`module.php:57-83`). Supports `subscriptions` (`Stripe::supports`). Covers the **vendor-subscription (pack) purchase** + recurring lifecycle. **Gated `skip !hasCredentials`; money asserts `skip !HAS_REAL`.**

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-SUB-01 | H | Vendor buys a **subscription pack** via Express (block checkout) → order-received; a Stripe **Subscription** (`sub_…`) is created; vendor gains the pack. | `@pro @vendor` | skip !hasCredentials |
| SE-SUB-02 | H | **Recurring** pack → exactly **one** `sub_` created (cart-fingerprint, no duplicate). | `@pro @vendor` | skip !hasCredentials |
| SE-SUB-03 | H | **Cancel** subscription from the vendor dashboard → "still active till" state; action flips to Activate. | `@pro @vendor` | skip !hasCredentials |
| SE-SUB-04 | H | **Reactivate** the cancelled-but-active subscription → cancelled alert clears; action flips to Cancel. | `@pro @vendor` | skip !hasCredentials |
| SE-SUB-05 | H | `invoice.payment_succeeded` webhook renews the subscription period. | `@pro @admin` | skip !hasCredentials |
| SE-SUB-06 | N | `invoice.payment_failed` webhook marks the subscription past-due / on-hold (doesn't silently keep it active). | `@pro @admin` | skip !hasCredentials |
| SE-SUB-07 | E | **Trial** pack → subscription starts `trialing`; no immediate charge. | `@pro @vendor` | skip !hasCredentials |
| SE-SUB-08 | E | `customer.subscription.deleted` webhook ends the vendor's pack. | `@pro @admin` | skip !hasCredentials |
| SE-SUB-09 | S | Only **one active** vendor subscription is allowed (second purchase guarded). | `@pro @vendor` | skip !hasCredentials |

> *If a product/WC-subscription (customer-recurring) surface is also present, add SE-SUB-1x for customer subscriptions; confirm scope during live validation.*

---

## 17. SE-SEC — Security (REST/AJAX, IDOR, tampering)
Express uses **WC-AJAX** (`wc_ajax_*`), **no `register_rest_route`**. Logged-out API contexts must send `Authorization:''` (suite fixture auto-injects admin auth otherwise).

| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-SEC-01 | S | **Logged-out** POST to `dokan_stripe_express_create_payment_intent` (no/invalid nonce) → rejected. | `@pro @customer` | skip !hasCredentials |
| SE-SEC-02 | S | **Amount tampering:** a forged client amount on intent-create is overridden server-side — captured charge == the real cart total. | `@pro @customer` | skip !hasCredentials |
| SE-SEC-03 | S | ⚠️ **CORRECTED — see SE-SEC-08 (Addendum A).** Param is `order` (numeric id), **not** `order_key`, and a valid *foreign* order is **processed, not rejected** → suspected cross-customer PM-theft IDOR. **Verify live; file bug if confirmed.** | `@pro @customer` | skip !hasCredentials |
| SE-SEC-04 | S | ⚠️ **CORRECTED — see SE-SEC-13 (Addendum A).** `init_setup_intent` has **no login/capability gate** beyond a guest-reachable nonce. Don't assert "rejected"; assert real behaviour. **Verify live; file bug if a guest can create a SetupIntent.** | `@pro @customer` | — |
| SE-SEC-05 | S | ⚠️ **CORRECTED — see SE-SEC-09 (Addendum A).** No ownership check: a mismatched `intent_id` makes the catch **force any `order_id` to `failed`** (order-state DoS). **Verify live; file bug if confirmed.** | `@pro @customer` | — |
| SE-SEC-06 | S | Onboarding/disconnect AJAX cap + nonce guards (see SE-ONB-10/11) — consolidated security assertions. | `@pro @vendor` | — |
| SE-SEC-07 | S | Webhook endpoint rejects forged events (see SE-WH-02) — consolidated. | `@pro @admin` | skip !hasCredentials |

---

## 18. SE-XSS — Stored XSS / output escaping
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-XSS-01 | S | A `<script>`/`<img onerror>` payload saved in the gateway **description** is **escaped** at checkout (rendered as text, not executed). | `@pro @customer` | skip !hasCredentials |
| SE-XSS-02 | S | XSS payload in gateway **title** is escaped on the method label. | `@pro @customer` | skip !hasCredentials |
| SE-XSS-03 | E | `statement_descriptor` strips invalid/script chars on save (sanitization). | `@pro @admin` | — |

---

## 19. SE-EDGE — Edge cases & resilience
| ID | Type | Title | Tags | Gating |
|---|---|---|---|---|
| SE-EDGE-01 | E | Gateway **disabled mid-session** → already-open checkout page no longer offers Express on reload. | `@pro @customer` | — |
| SE-EDGE-02 | E | **Empty cart** → Express method not offered (`validate_cart_items` false). | `@pro @customer` | skip !hasCredentials |
| SE-EDGE-03 | E | Switching away from Express to another gateway and back re-mounts the PE cleanly. | `@pro @customer` | skip !hasCredentials |
| SE-EDGE-04 | E | `update_failed_order` path (`dokan_stripe_express_update_failed_order`) — a failed PI lets the customer retry on the same order. | `@pro @customer` | skip !hasCredentials |
| SE-EDGE-05 | E | Order with **only a non-connected vendor** still completes (charge on platform); admin can manually pay the vendor later. | `@pro @customer` | skip !hasCredentials |
| SE-EDGE-06 | E | Very long / unicode billing name & address pass through to Stripe without breaking the PE. | `@pro @customer` | skip !hasCredentials |

---

## 20. Connect themes that **do NOT map** to Express (explicitly out of scope / re-derived)
| Connect theme | Disposition for Express | Why |
|---|---|---|
| OAuth connect button + `client_id` + `isReadyCapable` + "almost ready" notice | **Dropped / replaced** by SE-RDY + SE-ONB account-link flow | Express uses hosted Account Links, **no OAuth / no client id** (`User.php:103-214`). |
| `allow_non_connected_sellers` (S1/S2) | **Dropped**, replaced by SE-RDY-02 / SE-PAY-03 | Option doesn't exist on Express; gateway is available regardless of connection. |
| Destination-charge money model | **Re-derived** as separate charge+transfer (SE-PAY) | Express creates platform PI + standalone Transfers. |
| PR-#5646-specific BUG-* regressions | **Re-audit each** against Express source before recreating | Tied to Connect code paths; only wallet/cartData (BUG-9/10/18) map → SE-WALLET-04. |
| Backward-compat `_dokan_stripe_charge_id` (L1) | **Re-derive** (Express meta keys differ) | Different legacy lineage. |
| Connect's `register_rest_route` security cases | **Re-pointed** to WC-AJAX (SE-SEC) | Express registers no REST routes. |

---

## 21. Coverage → feature-map
As specs land, flip the corresponding `feature-map.yml` "Stripe Express" booleans true (admin enable/disable module, add payment method, vendor connect/disconnect, customer checkout, refund, notes, etc.).

## 22. Spec-file → case mapping (build order)
1. `stripeExpressPreflight.spec.ts` → SE-PRE
2. `stripeExpress.spec.ts` (master) → SE-MOD, SE-SET core, SE-RDY, SE-CHK-B/C happy+declined, SE-ONB seeded
3. `stripeExpressSettings.spec.ts` → SE-SET full
4. `stripeExpressVendorOnboarding.spec.ts` → SE-ONB
5. `stripeExpressSavedCards.spec.ts` → SE-SAVE
6. `stripeExpressGuest.spec.ts` → SE-GUEST
7. `stripeExpress3ds.spec.ts` → SE-3DS
8. `stripeExpressCurrency.spec.ts` → SE-CUR
9. `stripeExpressPayouts.spec.ts` → SE-PAY
10. `stripeExpressRefunds.spec.ts` → SE-REF
11. `stripeExpressWebhooks.spec.ts` → SE-WH
12. `stripeExpressWallet.spec.ts` → SE-WALLET
13. `stripeExpressSubscriptions.spec.ts` → SE-SUB
14. `stripeExpressSecurity.spec.ts` → SE-SEC
15. `stripeExpressXss.spec.ts` → SE-XSS
16. `stripeExpressEdge.spec.ts` → SE-EDGE

**Total: ~110 base cases + 45 completeness-pass additions (Addendum A) ≈ 155 cases** across ~18 spec files (many gated on credentials / real connected accounts).

---

# Addendum A — Completeness-pass additions (4-lens adversarial critique)

50 raw findings → **45 surviving gaps** after dedupe against the catalog + §20. **4 of the base cases (SE-WH-06, SE-SEC-03, SE-SEC-04, SE-SEC-05) encoded false assumptions** and are corrected by the rows below (flagged ⚠️ in place). Severity: **MUST 5 · SHOULD 27 · NICE 13.**

### NEW spec — `stripeExpressAdvertisement.spec.ts` (SE-PADV)
| ID | Type | Title | Tags | Gating | Sev |
|---|---|---|---|---|---|
| SE-PADV-01 | H | Vendor buys a Product-Advertisement slot via Express → order received + product advertised, **zero vendor Transfer** (admin-owned base product) | `@pro @vendor` | skip !hasCredentials | should |
| SE-PADV-02 | S | Advertise add-to-cart AJAX (`dokan_add_advertise_product_to_cart`) rejects a tampered nonce | `@pro @vendor` | — | nice |

### SE-MOD
| SE-MOD-06 | E | Activation schedules daily cron `dokan_stripe_express_daily_schedule`; deactivation clears it (drives DELAYED disburse) | `@pro @admin` | serial | nice |

### SE-SET
| SE-SET-18 | H | `notice_on_vendor_dashboard` ON shows non-connected sellers a dashboard connect notice; OFF/connected show nothing (`dokan_dashboard_content_inside_before`) | `@pro @vendor` | skip !hasCredentials | should |
| SE-SET-19 | E | `announcement_to_sellers` sends a **throttled** announcement; `notice_interval` transient suppresses re-send | `@pro @vendor` | skip !hasCredentials | should |
| SE-SET-20 | E | Saving with `disconnect_restricted_vendors` / `disconnect_connected_vendors` **bulk-disconnects** connected vendors on save | `@pro @admin` | serial · skip !hasCredentials | should |
| SE-SET-21 | E | `payment_method_configuration` id changes the methods rendered in the Payment Element | `@pro @customer` | skip !hasCredentials | nice |
| SE-SET-22 | E | Re-saving settings does **not** churn the webhook endpoint — stored signing secret stays stable (Connect BUG-30) | `@pro @admin` | serial · skip !hasCredentials | nice |

### SE-RDY
| SE-RDY-04 | S | `dokan_stripe_express_is_gateway_available` forced **true** with empty/invalid keys must still **fail closed** at checkout (no keyless/$0 intent, no order) | `@pro @customer` | skip !hasCredentials | should |

### SE-ONB
| SE-ONB-14 | E | Vendor changing store **country** (cross-border ON) is **auto-disconnected** (`country_changed`) | `@pro @vendor` | skip !hasCredentials | should |
| SE-ONB-15 | H | Admin **Delete Account** on a trashed vendor → `disconnect(force=true)` **and** remote `accounts->delete` | `@pro @admin` | — | should |
| SE-ONB-16 | H | Admin WP user-profile renders the Stripe Express **status panel** across 4 states | `@pro @admin` | — | nice |
| SE-ONB-17 | E | Expired onboarding **account-link refresh** (`stripe_express_onboarding_refresh`) regenerates a fresh link + redirects | `@pro @vendor` | skip !hasCredentials | nice |

### SE-CHK-B / SE-CHK-C
| SE-CHK-B-08 | N | Stripe API unreachable / PaymentIntent-create error → inline error, **no order** (intent never created) | `@pro @customer` | skip !hasCredentials | should |
| SE-CHK-B-09 | E | Changing **shipping method** re-mounts the PE; succeeded PI == new shipping-inclusive total (no stale PI) | `@pro @customer` | skip !hasCredentials | should |
| SE-CHK-C-06 | N | Order total below the Stripe **per-currency minimum** rejected server-side; no charge, no order | `@pro @customer` | skip !hasCredentials | should |
| SE-CHK-C-07 | E | Payment Element mounts on the **Order-Pay page** of a PENDING order (Connect BUG-5) | `@pro @customer` | skip !hasCredentials | should |

### SE-PAY (money — `skip !HAS_REAL` unless noted)
| SE-PAY-08 | N | **Transfer rejected by Stripe** (restricted account / unsupported currency) → "Transfer failed" note, `dokan_stripe_transfer_failed`, funds stay on platform, no withdraw entry | `@pro @customer` | skip !HAS_REAL | **MUST** |
| SE-PAY-09 | E | Admin-absorbed marketplace coupon on a **multi-vendor** cart still pays **both** vendors; Σtransfers ≤ charge (Connect BUG-35 over-transfer guard) | `@pro @customer` | skip !HAS_REAL | **MUST** |
| SE-PAY-10 | N | Vendor **disconnected before** a DELAYED disbursement fires → "payment transfer terminated" note, vendor never paid | `@pro @customer` | skip !HAS_REAL | should |
| SE-PAY-11 | E | ⚠️ **CORRECTED (live-verified):** one non-connected vendor in a **MIXED** cart gates Express for the WHOLE cart (method absent) — the "skipped sub-order audit note" path is unreachable via Express. Asserts the mixed cart is refused. | `@pro @customer` | skip !hasCredentials | should |

### SE-REF
| SE-REF-06 | N | Refund when the suborder **seller is not connected** → "Automatic refund is not possible…" note; no Stripe refund/reversal | `@pro @admin` | skip !HAS_REAL | should |
| SE-REF-07 | N | Stripe refund **API failure** → "Manual refund required" note; order NOT moved to refunded | `@pro @admin` | skip !HAS_REAL | should |

### SE-WH
| SE-WH-10 | N | Event for an **unknown/missing order** → handler no-ops, endpoint still returns **200** | `@pro @admin` | skip !hasCredentials | **MUST** |
| SE-WH-11 | S | **Forged event marks an order paid under the no-secret UA fallback**; pin the over-broad UA matrix (empty UA *and* any substring "Stripe" pass). **Suspected bug — verify + file.** | `@pro @admin` | — | **MUST** |
| SE-WH-12 | R | **[fixes SE-WH-06]** Re-point to `charge.failed` (real failed-payment event): pending→failed, already-failed skip, status-final note | `@pro @admin` | skip !hasCredentials | should |
| SE-WH-13 | N | `setup_intent.setup_failed` → order failed "SCA authentication failed…" (status-final guard) | `@pro @customer` | skip !hasCredentials | should |
| SE-WH-14 | E | `balance.available` triggers the **awaiting-disbursement sweep** | `@pro @admin` | skip !HAS_REAL | should |
| SE-WH-15 | E | `review.opened`/`review.closed` (Radar) → order on-hold then restored | `@pro @admin` | skip !hasCredentials | should |
| SE-WH-16 | S | **Forged `account.updated`** under UA fallback flips a vendor's `charges_enabled`/`payouts_enabled`. **Suspected bug — verify + file.** | `@pro @admin` | — | should |
| SE-WH-17 | S | A captured **signed event replayed within the 5-min skew** passes verification (no event-id dedup at the verify layer) | `@pro @admin` | — | should |

### SE-SAVE
| SE-SAVE-08 | N | Add-payment-method **SetupIntent fails** (declined/SCA-failed) → error, no token stored, nothing attached | `@pro @customer` | skip !hasCredentials | should |

### SE-SEC (suspected security bugs — verify live, file to `bugs/` if confirmed)
| SE-SEC-08 | S | **[fixes SE-SEC-03] `verify_intent` IDOR** — `$_GET['order']` (id) with **no ownership check**; a foreign order with `save_payment_method=1` **attaches the victim's PM to the attacker's Stripe customer**. **Suspected bug.** | `@pro @customer` | skip !hasCredentials | **MUST** |
| SE-SEC-09 | S | **[fixes SE-SEC-05] `update_order_status`** mismatched `intent_id` → catch **forces any `order_id` to failed** (order-state DoS); `payment_method_id` read without isset. **Suspected bug.** | `@pro @customer` | — | should |
| SE-SEC-10 | S | **`update_failed_order`** (guest-reachable nonce) binds attacker `intent_id` to attacker `order_id`, no binding check (IDOR write / force-failed) | `@pro @customer` | skip !hasCredentials | should |
| SE-SEC-11 | S | **`update_payment_intent`** mutates an arbitrary `pi_` (amount/currency) by attacker id — nonce-reject + IDOR cases | `@pro @customer` | skip !hasCredentials | should |
| SE-SEC-12 | S | **`create_payment_intent` order_id IDOR** leaks a foreign order's total + metadata via the returned `client_secret` | `@pro @customer` | skip !hasCredentials | should |
| SE-SEC-13 | S | **[fixes SE-SEC-04] `init_setup_intent` has no login/cap gate** beyond a guest-reachable nonce — a guest can create a SetupIntent. **Suspected bug — verify.** | `@pro @customer` | — | should |
| SE-SEC-14 | S | Saved-token reuse detected purely from the POSTed `wc-…-payment-token` (independent of `saved_cards`) → forged token POST routes to saved-PM flow even with tokenization OFF | `@pro @customer` | skip !hasCredentials | nice |

### SE-XSS / SE-EDGE / SE-3DS
| SE-XSS-04 | S | `update_order_status` mismatch note interpolates the raw `intent_id` (defense-in-depth assert) | `@pro @admin` | — | nice |
| SE-EDGE-07 | E | Gateway keys removed **mid-flow** → in-flight checkout submit errors; webhook ingress early-returns (`!is_gateway_ready`) | `@pro @customer` | skip !hasCredentials | nice |
| SE-3DS-05 | E | An **abandoned** `requires_action` order is resolved (or the stuck state is explicitly documented) — Connect BUG-24 | `@pro @customer` | skip !hasCredentials | nice |

### SE-SUB
| SE-SUB-10 | E | `invoice.payment_action_required` fires the SCA **renewal-authentication emails** | `@pro @admin` | skip !hasCredentials | nice |
| SE-SUB-11 | R | Express gateway **is offered on block checkout for a WooCommerce Subscriptions (customer-recurring) cart** (BUG-34) | `@pro @customer` | skip !hasCredentials | nice |

### SE-NOTE (fold into webhooks/payouts specs)
| SE-NOTE-01 | H | Admin **View order** notes metabox renders the Stripe transfer/refund/dispute audit notes (HPOS edit screen) | `@pro @admin` | skip !HAS_REAL | nice |

---

## Addendum B — Suspected product bugs to verify during live MCP validation
These come from static code reading by the critique agents and **must be reproduced live before filing**. If confirmed, each becomes a GitHub-issue `.md` under `bugs/` (per the workflow). Adversarially verify (try to refute) before filing.

1. **verify_intent IDOR → cross-customer payment-method theft** (SE-SEC-08) — `Controllers/Checkout.php:208-256`. **High.**
2. **Forged webhook marks an order paid via no-secret UA fallback** (SE-WH-11) — `Controllers/Webhook.php:189-234`. **High.**
3. **update_order_status forces a foreign order to `failed`** (SE-SEC-09) — `Controllers/Checkout.php:347-391`. **Medium.**
4. **init_setup_intent reachable by a guest** (SE-SEC-13) — `Controllers/Checkout.php:287-294`. **Medium.**
5. **Forged account.updated flips vendor charges/payouts** (SE-WH-16) — same UA-fallback root as #2. **Medium.**
6. **Signed-event replay within 5-min skew, no event-id dedup** (SE-WH-17) — `Controllers/Webhook.php:199-214`. **Low/Medium.**

> Implementation order (per the critique verdict): apply the 4 in-place corrections + land the 5 MUST cases in the first wave; SHOULD/NICE follow the §22 build order.
