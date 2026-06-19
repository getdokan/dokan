# Stripe Connect E2E — Gap Test-Cases Plan

Derived from the coverage audit (2026-06-19) of the existing suite at
`tests/pw/tests/e2e/stripe-connect/` against the canonical universe
(`dokan-pro/tests/stripe-connect/manual-test-plan.md` groups A–N + risk hit-list
R1–R23, `vendor-subscription-test-cases.md` VS0–VS8, and PADV).

**Scope rule:** every item below is implemented **inside the automation suite only**
(`tests/pw/**` + the test mu-plugins under `tests/pw/mu-plugins/`). No Dokan/WC plugin
source is modified. Where a case asserts a confirmed *product* bug, the test pins the bug
(`test.fail`) so it flips to passing when the dev fixes it — it never weakens an assertion.

## Audit headline (why this plan exists)

| Metric | Value |
|---|---|
| Canonical cases | 159 |
| Implemented tests | 60 |
| Genuinely active (keyless, run in any CI) | ~6–8 |
| Runtime-gated on `hasCredentials` | 48 |
| + need real connected accounts | 12 |
| Statically disabled (`test.fixme`, never run) | 4 (M2, M3, I3/R10, F-block-save) |
| Distinct gaps identified | ~69 |

**Mechanism correction (verified):** these specs are **not** `@serial` grep-excluded —
no spec carries a literal `@serial` tag, so `grepInvert:[/@serial/]` does not touch them;
they carry `@pro` and **run in the normal pro CI lane**. The real limiter is runtime
`test.skip(!hasCredentials)` / `test.skip(!HAS_REAL_CONNECTED_ACCOUNTS)` — without secrets
they skip to green.

## Live-verified facts (localhost:9999, this seed)

- Block gateway radio `#radio-control-wc-payment-method-options-dokan-stripe-connect` renders;
  selecting it mounts `.dokan-stripe-connect-payment-element` (Stripe card iframe) + Place Order.
- **Express Checkout Element renders live**: `.dokan-stripe-pe-express-block` with **Stripe Link**
  and **Amazon Pay (sandbox)** buttons (4 Stripe iframes). ⇒ E1 element-render/eligibility and the
  Link surface are automatable; only OS-native Apple/Google Pay need a real device.
- Persistent WC-Blocks notice **"Only express payment methods are available for this order"** even
  with regular gateways selectable — capture as a regression/observation test.

## Legend

- **Priority** — P0 money/security correctness · P1 important functional · P2 edge/nice-to-have
- **Automatable** — ✅ pure E2E · ⚠️ needs keys/real connected accounts · 🔶 needs Stripe CLI (webhook) · 🧪 needs special setup (currency/device)

---

## Section 0 — Fake-green fixes (do first; make existing coverage honest)

These are not new cases — they stop the suite reporting green when it isn't.

| # | Fix | File |
|---|---|---|
| 0.1 | `M2` (JPY) + `M3` (UGX) `test.fixme` → `test(... )` with `test.fail()` pinning the R3 100× overcharge (assert the *correct* minor-units; `test.fail` flips when fixed) | `stripeConnectCurrency.spec.ts` |
| 0.2 | `I3/R10` multi-vendor sub-order refund `test.fixme(true)` → `test.fail` reproducing the PHP-fatal 500 | `stripeConnect.spec.ts` |
| 0.3 | `F-block-save` `test.fixme` → `test.fail` asserting the pm is never attached | `stripeConnectSavedCards.spec.ts` |
| 0.4 | When `CI=true` and the env *should* carry secrets, `hasCredentials===false` must **fail** the run (a fail-loud pre-flight spec), not silently skip every money test | new `stripeConnectPreflight.spec.ts` + `helpers.ts` |

---

## Section 1 — P0 gaps (money / security; zero or disabled coverage)

| Case | Title | Type | Auto | Approach |
|---|---|---|---|---|
| **R-dispute / J6** | `charge.dispute.created` on a **normal (non-subscription) order** — handler assumes invoice → suspected PHP-fatal | negative | 🔶 | Post a `charge.dispute.created` event to `?wc-api=dokan_stripe` for a real non-sub order via the test mu-plugin (no signature needed — R2); assert no 500 / order not corrupted. `test.fail` if it fatals. |
| **J7 / dispute lifecycle** | dispute won → order restored; lost → refunded/penalised | edge | 🔶 | Post `charge.dispute.closed` (won/lost); assert order status + `can_post_product` unchanged-or-correct. |
| **C8 / R11** | Fees push order total **>** cart-level PI → `assert_pi_matches_order` throws **after** the charge → charged-but-failed order | money | ⚠️ | Add a fee (fee mu-plugin or coupon-negative) so order total exceeds the minted PI; place order; assert NOT charged-without-order (customer not charged on a failed order). |
| **R3 / M2 / M3 / M4** | zero-decimal currencies (JPY/UGX) ×100 overcharge; global-vs-order currency read | money | 🧪 | Set `woocommerce_currency=JPY` (raw option), place a real order, assert PI `amount` == yen integer (not ×100). `test.fail` pins bug. (Activates §0.1.) |
| **R2 / J4** | webhook **forgery with a resolvable real id** — no `constructEvent`/signature check ⇒ a forged event referencing a real intent/charge moves money | security | ⚠️🔶 | Capture a real `pi_`/`ch_` from a placed order; POST a hand-built (unsigned) `payment_intent.succeeded`/`charge.refunded` carrying that real id; assert it does **not** create an extra transfer/refund. Current N1 only uses fabricated ids. |
| **G6 / R1** | concurrent **webhook + sync** transfer race → double `Transfer::create` (sync path has no idempotency key) | money | 🔶 | Stripe-CLI-timed or rapid replay around the sync window; assert exactly one transfer per vendor in both orderings. Document the CLI requirement; provide a best-effort sequential proxy. |
| **E6 / R17** | block-Express amount with non-round total — `undefined cartData` amount bug | money | ⚠️ | Drive the block Express element (Link) on a non-round cart; assert the confirmed PI amount == order total. |
| **E8 / R-walletfail** | wallet charged but **WC order not created** if place-order fails post-confirm | money | ⚠️ | Force place-order failure after Express confirm; assert no orphaned charge (or a documented recovery). |
| **Vendor payout / withdraw-to-bank** | vendor requests a withdraw via the Stripe Connect withdraw method; funds move to the connected account | money | ⚠️ | Seed a vendor balance; request withdraw through the Stripe Connect method; assert the payout/transfer to the connected `acct_`. |
| **G4** | seller-pays-processing-fee ON → vendor transfer reduced by the proportional Stripe fee | money | ⚠️ | Toggle the option; assert transfer amount == earning − fee. |
| **Earning/ledger invariants** | every money path asserts only Stripe-side truth; assert the **Dokan vendor balance** credit on sale + debit on refund | money | ⚠️ | Read vendor balance before/after via `dbUtils`; assert ledger matches the transfer/reversal. |

---

## Section 2 — P1 gaps (important functional)

| Case | Title | Type | Auto | Approach |
|---|---|---|---|---|
| **E1** | Express Checkout element renders + eligibility (Link / Amazon Pay buttons) | happy | ✅ | Assert `.dokan-stripe-pe-express-block` + Link/Amazon iframe present on block checkout (live-confirmed). |
| **E2** | Stripe **Link** purchase via the Express element completes; correct amount; one transfer/vendor | money | ⚠️ | Drive the Link button → test Link card; assert order + transfer. |
| **C2 / D2** | **Guest** checkout (classic + block) completes — no login required | happy | ⚠️ | New context with NO storageState (`Authorization:''`), guest checkout (already enabled); place real order. |
| **B2** | **Vendor self-disconnect** from the dashboard → Stripe deauthorize attempt + meta/transients cleared + connect button returns | happy | ⚠️ | Click the real Disconnect button (`.dokan-stripe-connect-container a.dokan-btn-danger`); assert meta cleared + UI back to connect. (Currently teardown is a DB delete.) |
| **B1** | Real vendor **connect** OAuth round-trip — assert the OAuth `href`/redirect (Stripe-hosted; can't complete) | happy | ⚠️ | Assert `a.dokan-stripe-connect-link` href = `connect.stripe.com/oauth/authorize?...scope=read_write`. |
| **B4** | OAuth **CSRF / tampered-state** guard on the connect return URL | security | ⚠️ | Hit the return URL with a tampered/missing `state`; assert no connection written. |
| **H3** | **Abandoned** SCA (close 3DS tab) → deterministic state, no stuck-on-hold-forever, no double charge | negative | ⚠️ | Start 3DS, abandon; assert order fails/cancels deterministically. |
| **H4** | **3DS denied** (declined-after-auth) → order failed, no transfer, customer not charged | negative | ⚠️ | Use a declined-after-auth 3DS card; assert failure + no transfer. |
| **H1 / H2 money** | 3DS-success classic + block — add the **money** assertion (one transfer/vendor, correct charge), not just order status | money | ⚠️ | Extend existing 3DS tests with `stripeApi` transfer/charge assertions. |
| **D5 / D6 / R-savedblock** | block **save-card** + block **saved-token reuse** actually charges the selected card | edge | ⚠️ | Pin the no-attach bug (§0.3); add block saved-token reuse charge assertion. |
| **Admin order-notes** | refund/transfer/reversal/dispute notes render on the order-detail screen | happy | ⚠️ | After a refund/transfer, assert the order-note text appears on `post.php?action=edit`. |
| **PADV-fee-amount** | the ad charge equals the configured per-product ad cost ($15 → 1500c) | money | ⚠️ | Extend the PADV test to assert PI `amount==1500`. |
| **PADV-declined** | declined card on ad checkout → no order **and** product NOT advertised | negative | ⚠️ | Declined card on the ad flow; assert `is_product_advertised===false`. |
| **PADV-nonce/CSRF** | `dokan_add_advertise_product_to_cart` without/with bad `advertise_product_nonce` rejected | security | ✅ | POST the AJAX with missing/tampered nonce; assert rejection. |
| **PADV-no-grant-on-fail** | ad slot NOT granted when the order is unpaid/fails | edge | ⚠️ | Leave the ad order unpaid; assert flag stays false. |
| **VS6.1 / VS6.2 / VS6.3** | renewal order · renewal failure (dunning) · `subscription.deleted` revokes pack | happy/neg | 🔶 | Stripe-CLI-driven `invoice.payment_succeeded`/`_failed`/`customer.subscription.deleted`; assert renewal child order / pending / pack revoked. Provide a CLI harness; skip-loud if CLI absent. |
| **VS8.3 true plan-switch** | subscribed vendor switches pack A→B (the current "VS8.3" only tests the one-active guard) | edge | ⚠️ | Drive an actual switch; assert sub/pack transition + money. |
| **VS7.2 / VS7.3** | admin **cancels** / **assigns** a vendor subscription from admin side | edge/happy | ⚠️ | Admin Subscriptions DataViews cancel + user-edit assign; assert vendor state. |
| **L1 / L2 / L3** | backward-compat: legacy charge-id-only order non-refundable · legacy `src_/card_` tokens unusable + graceful re-save · pre-PR subscription renewal migration | money/neg | ⚠️ | Seed legacy meta/tokens via `dbUtils`; assert graceful behavior. |
| **N7 / R-xss** | stored XSS via gateway description rendered with `dangerouslySetInnerHTML` at block checkout | security | ✅ | Set a `<script>`/`<img onerror>` description (admin); assert it is escaped, not executed, at checkout. |

---

## Section 3 — P2 gaps (edge / settings / security hardening)

| Case | Title | Auto |
|---|---|---|
| A2 | test-mode toggle hides/shows live-vs-test credential rows | ✅ |
| A3 | key/mode mismatch (test mode + live keys) → `is_ready` false, gateway hidden | ⚠️ |
| A5 | no-SSL-in-live-mode → "requires SSL" notice, not ready | ✅ |
| A7 | admin-options OAuth redirect URI + webhook URL info/copy | ✅ |
| A8 | repeated gateway saves don't orphan/duplicate webhooks | ⚠️ |
| A9 | block-vs-classic admin messaging parity | ✅ |
| C4 | classic bad-CVC / expired card inline error, no order | ⚠️ |
| C6 | order-pay page (`/checkout/order-pay/`) PE mounts + completes | ⚠️ |
| C7 | theme without `.woocommerce-notices-wrapper` — inline errors not silently dropped | ✅ |
| D7 | block-vs-classic outcome/split/fee parity | ⚠️ |
| F6 | save-card UI hidden for subscription-product carts | ✅ |
| M5 / R20 | minimum-order-amount check uses ×100 regardless of currency | 🧪 |
| M6 | currency change mid-checkout → fresh PI, no stale charge | 🧪 |
| N4 | expired nonce on idle checkout → graceful recovery | ⚠️ |
| N5 / R13 | stale/deleted Stripe customer → re-mint + retry once | ⚠️ |
| N6 / R19 | no `print_r(intent)` info leak to logs/UI on SCA failure | ⚠️ |
| N8 / R14 | SSL cert verification on test→live SDK re-bootstrap | ⚠️ |
| R6 | verify-intent JS↔PHP param mismatch (`order_id/intent_id` vs `order/key`) dead REST SCA settle | ⚠️ |
| J3 | out-of-order events: paid order not flipped to failed on stale `payment_failed` | 🔶 |
| J5 / R-200 | handler exception returns HTTP 200 (Stripe won't retry) → half-processed order | 🔶 |
| G2 (true mixed) | one connected (transfer) + one non-connected (stays on platform) in the **same** cart | ⚠️ |
| G5 | 3-vendor awkward-cents penny-rounding split, no leakage | ⚠️ |
| G7 | zero/negative-earning vendor → transfer skipped, note added | ⚠️ |
| VS0.3 / VS4.3 | admin authors a recurring pack via the editor · product-limit enforcement | ⚠️ |

---

## Section 4 — Genuinely deferred (document, never fake-green)

| Case | Why deferred | Mitigation in suite |
|---|---|---|
| E4 / E5 Apple Pay / Google Pay (OS-native sheet) | needs a real device + domain registration | Cover E1 element-render + E2 Link instead; `log.skip` the OS-native sheet with a clear reason |
| Webhook-CLI cases (VS6.*, J3, J5, G6, dispute timing) | localhost can't receive Stripe webhooks without Stripe CLI | Provide an optional Stripe-CLI harness + the test mu-plugin event-injection endpoint; **skip-loud** (logged) when CLI/secrets absent, never silent green |

---

## Execution order

1. **§0 fake-green fixes** (highest signal-per-line; stops false safety).
2. **§1 P0** — disputes, charged-but-failed, R3 currency, webhook-forgery-resolvable-id, vendor payout, ledger invariants.
3. **§2 P1** — Express (E1/E2, live-confirmed), guest checkout, vendor self-disconnect, 3DS denied/abandoned, PADV money/negative, admin order-notes, XSS, backward-compat, VS webhooks (CLI harness).
4. **§3 P2** — settings/edge/security hardening.
5. Full green run (keys + real connected accounts present); document any remaining real product-bug `test.fail`s in `bugs-found.md`.
