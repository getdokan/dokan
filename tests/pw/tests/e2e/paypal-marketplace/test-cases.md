# Dokan PayPal Marketplace — E2E Test Cases

Single source of truth for the PayPal Marketplace Playwright suite. Every spec function in
`tests/e2e/paypal-marketplace/` must correspond to an ID in this file, and every ID in this file
must eventually resolve to either a spec or an explicit `not-automatable` reason.

## Status — verified against the specs on disk, 2026-08-03

**Catalogued: 205 · Implemented: 205 · Executed at least once: 132 · Never executed: 73.**

Every id in this file now has a test block in a spec on disk — verified by extracting each
`test('PP-…')` title from the 17 spec files and diffing that set against the 205 headings here, not
by reading the checkboxes. The checkbox means **spec code exists**. It has never meant "passing" and
it does not mean "ran"; `Status` carries that.

### What has run and what has not

| | Cases | Spec files | Last execution |
|---|---|---|---|
| Executed | 132 | 12 — Preflight, Settings, Webhooks, Security, Currency, Edge, Withdraw, Blocks, Guest, Subscriptions, XSS, 3DS | run 4, 2026-07-31 |
| **Never executed** | **73** | 5 — Onboarding, Checkout, Split, Disbursement, Refund | **never — no run of any kind** |

**No PayPal capture has ever been performed by this suite, and no money has ever moved.** The whole
money path — PP-CHK (15), PP-SPL (12), PP-DIS (14), PP-REF (14) and PP-ONB (18), 73 cases across five
spec files — is written but entirely unproven. Those cases carry `written-never-executed`. The
merchant-consent blocker that was holding them up cleared on 2026-07-31, so the remaining obstacle is
that the run has not been authorised and performed, not that it cannot be.

### Run 4 (2026-07-31) — the last execution, and the only complete one

Earlier runs exist (run 1 is quoted in the lessons below), but run 4 is the only one that carried
every case in its twelve spec files to a result, and it is the most recent execution of any kind.

121 passing · 5 failing (product bug) · 1 failing (environment) · 4 gated skip · 1 not automatable
= 132, which is every case in the twelve money-free spec files.

Every non-passing case is named, so the 121 passes are the remainder by subtraction rather than by a
per-case record. That derivation is why 57 cases in this file changed from `not-written` to
`written-passing` on 2026-08-03 without a fresh run behind them: their code existed and ran on
2026-07-31, and run 4's own tally accounts for all 132. Treat those 57 as "passed once, on dokan-pro
5.0.9, on 2026-07-31", not as "known good today".

- **Failing — product bug (5), and they must keep failing:** PP-SEC-15 (DOK-029, CRITICAL),
  PP-CUR-06 (DOK-030), PP-CUR-10 (DOK-031), PP-WHK-09 (DOK-025), PP-WHK-22 (DOK-028).
- **Failing — environment (1):** PP-SET-23. PayPal refuses `http://localhost:9999` as a webhook URL
  (`wc-logs` records `[issue] => Not a valid webhook URL`). Not a product defect and not fixable
  locally; it needs a tunnel or a public host.

### Declared skips — the honest gaps, and what would unblock each

| Case | What is missing |
|---|---|
| PP-WHK-16 | A subscription that really exists on PayPal. The handler calls `Subscriptions\Processor::get_subscription()`, so with no PayPal-side subscription there is no observable mutation. Fixture owed. |
| PP-WHK-25 | An unconditional `test.skip(true, …)`, not a credential gate. No settings save is reachable from this transport: `register_webhook()` runs only from `PayPal::process_admin_options()`, which fires solely on `woocommerce_update_options_payment_gateways_dokan_paypal_marketplace`, and `ensurePayPalConfigured()` writes the option directly. Unblocked by a mu-plugin route that drives a real gateway settings save **together with** a positive control proving that save consumed the SANDBOX sentinel. |
| PP-WDR-07 | A pending PayPal-method withdrawal, which cannot be created through any product code path on 5.0.9 — see PP-WDR-06. The skip is re-probed on every run and the case runs its balance assertions the moment the product accepts the request. |
| PP-WDR-08 | The same blocker as PP-WDR-07. |
| PP-REF-05 | Conditional on this site's shipping configuration: if `POST /wc/store/v1/checkout` refuses the block order for want of a shipping rate, the case declares a skip rather than pretending to have tested the re-split window. Unblocked by configuring a shipping zone with a rate covering the customer's address. |
| PP-3DS-04 | Not automatable at all — completing a real 3DS challenge needs a human. Reason recorded on the case. |

Every other `test.skip()` in the suite is a credential/merchant/buyer gate that reports itself in the
run report; those are listed on the individual cases rather than here.

### Strengthened on 2026-08-03 — 13 cases, none re-executed

PP-SET-16 · PP-SEC-04 · PP-SEC-05 · PP-SEC-10 · PP-WHK-24 · PP-XSS-04 · PP-XSS-06 · PP-GST-05 ·
PP-SUB-04 · PP-CHK-12 · PP-CHK-14 · PP-DIS-04 · PP-REF-05.

Each carries a dated run note stating its new expected result. Nine of them (PP-SET-16, PP-SEC-04,
PP-SEC-05, PP-SEC-10, PP-WHK-24, PP-XSS-04, PP-XSS-06, PP-GST-05, PP-SUB-04) sit in files that ran on
2026-07-31, so their recorded pass **predates the assertions they now carry** and has not been
re-confirmed. The other four sit in files that have never run at all.

### Cases where the CATALOGUE is wrong, not the test

PP-WDR-06 and PP-EDG-05. Both keep their original catalogued expectation above the run note so the
divergence stays visible; the run note records what the product actually does and why the test asserts
that instead. Neither test was weakened to agree with this document.

### Per-area counts

PP-PRE 4 · PP-SET 25 · PP-ONB 18 · PP-CHK 15 · PP-SPL 12 · PP-DIS 14 · PP-REF 14 · PP-WHK 25 ·
PP-SUB 10 · PP-WDR 8 · PP-CUR 10 · PP-EDG 12 · PP-GST 5 · PP-BLK 7 · PP-SEC 15 · PP-XSS 7 ·
PP-3DS 4 — 205 across 17 spec files.

Total moved 203 → 204 → 205 on 2026-07-31: PP-PRE-04 was added, not planned (the format-only merchant
gate opened on two real-but-unconsented merchant ids and announced that money tests would run), and
PP-SEC-15 was added after DOK-029.

### Two lessons this document has already been burned by, both from 2026-07-31

1. **"Written" never means "passing", and neither means "ran".** Run 1 reported 94 passed while
   **46 of 68 cases never executed** — `test.describe.serial` aborts a whole group on first failure,
   and a skipped case is counted as "not a failure". The serial cascade has since been removed.
2. **A `test.fail` test whose body fails is a PASS.** Playwright scores it as passed while the list
   reporter still prints ✘. Keying on the glyph invented a failure that did not happen. Only the
   numbered failure blocks at the end of a run are authoritative.

A third one, from this document rather than from a run: **a stale catalogue is itself a coverage
lie.** Before 2026-08-03 this file claimed "136 of 204 cases have no code at all" and "nothing below
PP-WHK has been written" while all 205 were implemented, and every PP-ONB block cited a spec file
(`paypalMarketplaceVendorOnboarding.spec.ts`) that has never existed. Anyone planning work off it
would have rebuilt a suite that was already there.

## Status vocabulary

| Status | Meaning |
|---|---|
| `not-written` | No spec code exists for this case yet. |
| `written-passing` | Implemented and green against the local Docker site **on the last run that executed it**. Not a claim about today. |
| `written-never-executed` | Implemented, but this case has never been run — not once, not even to a skip. Added 2026-08-03 for the 73 money cases (PP-ONB, PP-CHK, PP-SPL, PP-DIS, PP-REF), whose five spec files have never been executed. It is NOT a synonym for `not-written`: the code exists and can be read. |
| `written-failing-product-bug` | Implemented and failing because the product is broken. Bug ID required. |
| `written-failing-environment` | Implemented and failing for a reason outside the product — the local environment cannot satisfy a precondition. Must name the exact cause and the evidence for it, or it is indistinguishable from an excuse. Added 2026-07-31 for PP-SET-23, where PayPal refuses `http://localhost:9999` as a webhook URL. |
| `written-gated-skip` | Implemented but skips for a missing credential/account. Must name what is missing. |
| `not-automatable` | Cannot be automated. Must state exactly why. |

The checkbox means **spec code exists**, never **passing**. Status carries pass/fail.

## Environment under test

- Site: `http://localhost:9999` (wp-env `tests` container, mapped from `~/Sites/dokanautomation`)
- Builds: dokan-lite `develop` @ `dbe399705`, dokan-pro **5.0.9** @ `74f2f3303`, WooCommerce via wp-env
- Store currency: `USD` · Module `paypal_marketplace` active · Gateway `dokan_paypal_marketplace`
- Settings option: `woocommerce_dokan_paypal_marketplace_settings` (built by concatenation at
  `Helper.php:46`; the literal string never appears in dokan-pro source)
- Sandbox toggle key: **`test_mode`** — not `sandbox`, not `testmode` (`Helper.php:142`)

## Identifier reference (verified against dokan-pro 5.0.9)

| Concept | Value | Source |
|---|---|---|
| Module slug | `paypal_marketplace` | `Module.php:305` |
| Gateway id | `dokan_paypal_marketplace` (underscores) | `Helper.php:33` |
| Withdraw method id | `dokan-paypal-marketplace` (**hyphens**) | `RegisterWithdrawMethods.php:80` |
| Sandbox client id key | `test_app_user` | `Helper.php:694` |
| Sandbox secret key | `test_app_pass` | `Helper.php:708` |
| Live client id / secret | `app_user` / `app_pass` | `Helper.php:694,708` |
| Partner id key | `partner_id` (**not** mode-swapped) | `Helper.php:722` |
| Vendor merchant meta | `_dokan_paypal_test_merchant_id` / `_dokan_paypal_merchant_id` | `Helper.php:487` |
| Vendor settings meta | `_dokan_paypal_test_marketplace_settings` / `_dokan_paypal_marketplace_settings` | `Helper.php:511` |
| Webhook endpoint | `?wc-api=dokan-paypal` | `WebhookHandler` / `woocommerce_api_dokan-paypal` |
| Webhook id option | `dokan_paypal_marketplace_test_webhook` / `dokan_paypal_marketplace_webhook` | `Helper.php:848` |
| Readiness | `enabled` AND `partner_id` AND client id AND client secret | `Helper.php:101-117` |

## Vendor "connected" seeding contract — VERIFIED LIVE 2026-07-30

The build brief listed two vendor meta keys. The gateway actually requires **six**, and the one that
decides checkout availability is not among the two the brief named.

`PayPal::is_available()` is `parent::is_available() && Helper::is_ready() && Helper::validate_cart_items()`
(`PaymentMethods/PayPal.php:599`). `validate_cart_items()` walks the cart and calls
`Helper::is_seller_enable_for_receive_payment( $vendor_id )` for every vendor, which is
`get_seller_merchant_id() && get_seller_enabled_for_received_payment()` (`Helper.php:128-130`).

All six keys are mode-swapped on `test_mode`:

| Purpose | Sandbox key | Live key | Helper |
|---|---|---|---|
| Merchant id | `_dokan_paypal_test_merchant_id` | `_dokan_paypal_merchant_id` | `get_seller_merchant_id_key()` |
| **Receive-payment gate** | `_dokan_paypal_test_enable_for_receive_payment` | `_dokan_paypal_enable_for_receive_payment` | `get_seller_enabled_for_received_payment_key()` |
| Payments receivable | `_dokan_paypal_test_payments_receivable` | `_dokan_paypal_payments_receivable` | `get_seller_payments_receivable_key()` |
| Primary email confirmed | `_dokan_paypal_test_primary_email_confirmed` | `_dokan_paypal_primary_email_confirmed` | `get_seller_primary_email_confirmed_key()` |
| UCC enabled | `_dokan_paypal_test_enable_for_ucc` | `_dokan_paypal_enable_for_ucc` | `get_seller_enable_for_ucc_key()` |
| Marketplace settings | `_dokan_paypal_test_marketplace_settings` | `_dokan_paypal_marketplace_settings` | `get_seller_marketplace_settings_key()` |

**Observed consequence, and why this matters more than a footnote.** Seeding only the two keys the
brief named produces a vendor that reads as connected — the PayPal SDK even loads with
`merchant-id=<seeded>` in its query string — while the payment method never appears at checkout on
either the classic or the block path. A suite written against the brief's two-key seed would have
had every availability test pass for the wrong reason: `PP-CHK-02`-style "gateway is absent for an
unconnected vendor" would be green while the connected case was silently broken too. Seeding the
receive-payment gate makes the method appear on both paths. This is precisely the fake-green shape
the positive-baseline rule in `PP-SET-05` exists to catch.

Never seed by writing these literals. Resolve every key through its `Helper::…_key()` accessor so
the sandbox/live swap is exercised rather than assumed.

## Live exploration findings — 2026-07-30, dokan-pro 5.0.9 on localhost:9999

Recorded because several contradict the build brief and one contradicts my own first reading.

1. **Admin Save is disabled until the form is dirtied** (`saveDisabled: true` on load). This is the
   same trap that made the Stripe suite bypass its settings UI. It does **not** force a bypass here:
   dispatching native `input`/`change` — which Playwright's `fill()` and `check()` already do —
   flips the button to enabled. The settings spec can therefore drive the real UI.
2. **The settings screen is the classic WooCommerce form, not the React settings app**
   (`isReactSettings: false`, `#mainform` POST with `#_wpnonce`).
3. **`payment_action` does not exist** — confirmed three independent ways: no form field renders,
   the SDK URL carries `intent=capture`, and the mounted button's props carry `intent: "capture"`.
4. **`max_error` has no form field**, matching the code reading that its getter has no caller.
5. **`USD` is supported.** `Helper::get_supported_currencies()` returns a **map keyed by currency
   code** (`{"AUD":"Australian dollar", …}`), so an `in_array` probe reports a false negative. My
   own first probe made exactly that mistake. Currency specs must use key lookup.
6. **Block checkout offers the gateway too**, once the six-key seed is correct. An earlier apparent
   block-only absence was this same seeding gap and is **not** a product bug — it was investigated
   to root cause rather than filed.
7. **The `page=dokan#/settings` admin SPA loads slowly** and was still showing a "3 of 6" progress
   state after ~25s on a warm site. Withdraw-method configuration was applied through the option
   layer instead. Worth a timeout allowance in any spec that drives that screen.
8. **Enabling the PayPal withdraw method is a required setup step** and is separate from the
   gateway settings: `dokan-paypal-marketplace` is registered as a withdraw method but absent from
   the enabled `dokan_withdraw['withdraw_methods']` list on a fresh site. It must be **merged** in,
   never assigned over, or the four stock methods are destroyed.

## Gating

- `hasCredentials` = `TEST_MERCHANT_ID_PAYPAL_MARKETPLACE` && `TEST_CLIENT_ID_PAYPAL_MARKETPLACE`
  && `TEST_CLIENT_SECRET_PAYPAL_MARKETPLACE` (three vars, because `is_ready()` needs partner id too).
- `HAS_REAL_MERCHANTS` = both `PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID` and `..._VENDOR2_MERCHANT_ID`
  look usable. PayPal merchant ids have no `acct_`-style prefix, so the gate is a placeholder-
  substring check plus an `@` rejection — there is no format regex to write. **This is a shape
  check only and cannot see consent**, which is why PP-PRE-04 verifies payability over the network
  and fails the run when a real-looking id is not actually payable.
- **Vendor onboarding credentials** — `PAYPAL_MARKETPLACE_VENDOR1_EMAIL` / `_PASSWORD` and the
  vendor2 pair are the sandbox Business-account logins used to drive the hosted consent flow for
  PP-ONB. No PayPal API grants a seller's consent, so this is the one genuinely manual step; it is
  one browser pass per vendor for the life of the account, because the merchant id it yields is
  permanent.
- A third, PayPal-only reality gates the true money path: no capture occurs without a live PayPal
  buyer approval on PayPal's own domain. Whether that is drivable by Playwright is being determined
  by live exploration; cases that depend on it are marked and will carry their real status.

## Scope decisions recorded up front

- **Dropped, module does not implement it:** saved cards / tokenization (`supports` is
  `['products','refunds','subscriptions']`, zero `WC_Payment_Token` hits) and wallet / funding
  sources (no `venmo` / `paylater` / `funding` anywhere in the module).
- **Dropped, setting does not exist:** `payment_action` (capture vs authorize). Intent is hardcoded
  `'CAPTURE'`. The brief listed it; it is not in the code.
- **Reduced to gating-only:** 3DS. The template and `contingencies: ['3D_SECURE']` exist, but ride
  the UCC hosted-fields path behind five simultaneous gates including PayPal-side `PPCP_CUSTOM`
  vetting. A completed challenge is unreachable; rendering/gating is not.
- **HITL waiver:** the dokan-qa skill mandates a human-in-the-loop pause on every money mutation
  even in sandbox. The user explicitly overrode this on 2026-07-30 in favour of full automation.
  Sandbox credentials only; live keys are never used.

---

# PP-PRE — Preflight credential guard

The highest-value file in the suite. Its entire job is to make a credential-less run fail loudly
instead of skipping to green.

### - [x] PP-PRE-01 — Credentials present, or the run is explicitly allowed to skip them
- **Spec file:** `paypalMarketplacePreflight.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** none — this case must run before and independently of all others.
- **Steps:**
  1. Read `PAYPAL_MARKETPLACE_REQUIRED` through `parseBoolean` (never raw string truthiness).
  2. Read the three credential vars that compose `hasCredentials`.
  3. When `PAYPAL_MARKETPLACE_REQUIRED` is false or unset, and credentials are absent, emit a
     warning and skip softly.
  4. When `PAYPAL_MARKETPLACE_REQUIRED` is true and any credential is absent, fail hard.
- **Expected:** In the required-and-missing case the assertion fails with a message naming the
  consequence, not merely the condition — that every money test would otherwise silently skip and
  report a green suite with zero money coverage. In the not-required case the run continues with a
  visible warning.

### - [x] PP-PRE-02 — Real connected merchant ids present, or money assertions are declared gated
- **Spec file:** `paypalMarketplacePreflight.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** PP-PRE-01 has established credential state.
- **Steps:**
  1. Read both vendor merchant-id vars.
  2. Compare each against the seeded-placeholder sentinel.
  3. Warn (never fail) when credentials exist but real merchant ids do not.
- **Expected:** A warning stating that transfer, split and refund-reversal assertions will
  document-skip while keyed checkout specs still run. This case never hard-fails, because a
  keys-present/merchants-absent run is a legitimate configuration.

### - [x] PP-PRE-03 — Configuring PayPal must not deactivate the Stripe Express module
- **Spec file:** `paypalMarketplacePreflight.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Both `paypal_marketplace` and `stripe_express` active before the run.
- **Steps:**
  1. Record `dokan_pro_active_modules` before PayPal configuration.
  2. Run the mu-plugin `configure-paypal-marketplace` route.
  3. Re-read `dokan_pro_active_modules`.
- **Expected:** `stripe_express` is still present. This guards a specific foreseeable regression:
  the Stripe mu-plugin's configure route force-removes the legacy `stripe` module, and a PayPal
  route written by symmetry could remove `stripe_express` and silently skip the entire Stripe
  suite on the same worker.

### - [x] PP-PRE-04 — The supplied merchant ids have really consented to this partner app
- **Spec file:** `paypalMarketplacePreflight.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Credentials present and both merchant ids pass the format gate.
- **Steps:**
  1. Fetch a client-credentials token for the partner app.
  2. `GET /v1/customer/partners/{partner_id}/merchant-integrations/{merchant_id}` for each vendor.
  3. Require `payments_receivable` on both.
- **Expected:** Both merchants are payable. When either is not, the run FAILS with PayPal's own
  message, which distinguishes the two causes that are indistinguishable from inside Dokan —
  a Merchant-type rather than Platform-type sandbox app (no partner scopes at all, and the type
  cannot be changed after creation) versus a vendor that simply never completed the hosted consent.
- **Why this case exists.** A merchant id is only an account's permanent identity. Whether that
  account granted *this* partner app permission to be paid on its behalf is separate state held on
  PayPal's side, and only that second thing decides whether a capture succeeds. `HAS_REAL_MERCHANTS`
  can only inspect the id's shape. On 2026-07-31 both suite vendors held correctly-shaped, genuinely
  real merchant ids with no consent granted: the gate opened, PP-PRE-02 reported "money-movement
  tests will run", and every capture would have failed against PayPal with an opaque payee error far
  from the actual cause. This is the same fake-green class as the email guard, one layer deeper —
  the earlier guard rejects a value that is obviously wrong, this one rejects a value that is right
  but unusable.
- **Deliberately not gated on `PAYPAL_MARKETPLACE_REQUIRED`.** Supplying a non-placeholder merchant
  id *is* the claim that it works, and that claim is as wrong locally as it is in CI.

---

# PP-SET — Admin gateway settings

18 real inputs across 22 form fields (4 are `type: 'title'` headers). The module has no
`Settings::update()` writer, so every programmatic write goes through the mu-plugin.

### - [x] PP-SET-01 — Settings section renders at the gateway URL
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Module active, admin authenticated.
- **Steps:** Navigate to `wp-admin/admin.php?page=wc-settings&tab=checkout&section=dokan_paypal_marketplace`.
- **Expected:** The Dokan PayPal Marketplace settings heading renders and the enable checkbox
  `#woocommerce_dokan_paypal_marketplace_enabled` is present.

### - [x] PP-SET-02 — Enable the gateway through the admin UI and persist it
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway currently disabled.
- **Steps:** Tick "Enable Dokan PayPal Marketplace", Save, reload the page.
- **Expected:** Checkbox remains ticked after reload and the stored option's `enabled` key is `yes`.

### - [x] PP-SET-03 — Enable sandbox through the admin UI and persist it
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway enabled.
- **Steps:** Tick the PayPal sandbox checkbox, Save, reload.
- **Expected:** The stored option's **`test_mode`** key is `yes`. Asserting on a `sandbox` key would
  silently never match.

### - [x] PP-SET-04 — Sandbox credential fields persist across a reload
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway enabled, sandbox on.
- **Steps:** Fill partner id, sandbox client id and sandbox secret from env; Save; reload.
- **Expected:** All three round-trip into `partner_id`, `test_app_user`, `test_app_pass`.

### - [x] PP-SET-05 — Gateway reaches ready state once all four conditions hold
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** PP-SET-02 through PP-SET-04 applied.
- **Steps:** Query the mu-plugin status route for `Helper::is_ready()`.
- **Expected:** `true`. This is the positive baseline every availability-absence assertion must
  establish first, so that a negative test cannot pass merely because nothing was configured.

### - [x] PP-SET-06 — Gateway appears at checkout once ready
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway ready, connected vendor seeded, product in cart.
- **Steps:** Load the classic checkout page as a customer.
- **Expected:** The PayPal Marketplace payment option is listed with its configured title.

### - [x] PP-SET-07 — Empty client id leaves the gateway not ready
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway enabled, sandbox on, partner id and secret set.
- **Steps:** Clear the sandbox client id, Save, query readiness, then load checkout.
- **Expected:** `is_ready()` is false and the gateway is not offered at checkout. PP-SET-05 must
  have proven the positive baseline in the same run.

### - [x] PP-SET-08 — Empty client secret leaves the gateway not ready
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** As PP-SET-07 with the secret as the cleared field.
- **Steps:** Clear the sandbox secret, Save, query readiness.
- **Expected:** `is_ready()` is false; gateway not offered.

### - [x] PP-SET-09 — Empty partner/merchant id leaves the gateway not ready
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway enabled, sandbox on, both credentials set.
- **Steps:** Clear `partner_id`, Save, query readiness.
- **Expected:** `is_ready()` is false. Partner id is a distinct readiness condition from the
  credential pair and must be asserted separately.

### - [x] PP-SET-10 — Whitespace-only credentials are treated as absent
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway enabled, sandbox on.
- **Steps:** Set each credential field to a single space in turn, Save, query readiness.
- **Expected:** `is_ready()` is false for each. A space-filled field must not satisfy a truthiness
  check.

### - [x] PP-SET-11 — Sandbox off with only sandbox keys populated leaves the gateway not ready
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** `test_app_user` / `test_app_pass` populated, `app_user` / `app_pass` empty.
- **Steps:** Untick sandbox so the gateway reads live keys, Save, query readiness.
- **Expected:** `is_ready()` is false, because the live credential getters return the empty
  `app_user` / `app_pass` pair. This proves the mode swap actually swaps.

### - [x] PP-SET-12 — Live and sandbox credentials are stored independently
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway enabled.
- **Steps:** Write distinguishable values into all four credential keys, toggle `test_mode` both
  ways, and read back the resolved credentials each time.
- **Expected:** Sandbox mode resolves the `test_*` pair, live mode resolves the bare pair, and
  neither write clobbers the other.

### - [x] PP-SET-13 — Partner id is shared across modes, not mode-swapped
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Gateway enabled, partner id set.
- **Steps:** Toggle `test_mode` and read the resolved partner id in both states.
- **Expected:** The same `partner_id` value is returned in both modes. There is no
  `test_partner_id` key; a spec that assumes one would assert against a field that does not exist.

### - [x] PP-SET-14 — Disbursement mode persists and defaults to INSTANT
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway configured.
- **Steps:** Read the default, then set each of `INSTANT`, `ON_ORDER_COMPLETE`, `DELAYED` and
  re-read after reload.
- **Expected:** Default is `INSTANT`; each value round-trips into `disbursement_mode`.

### - [x] PP-SET-15 — Delay-period field is revealed only for the delayed mode
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Settings page open.
- **Steps:** Switch `disbursement_mode` between values and observe the delay-period row.
- **Expected:** The delay-period input is shown for `DELAYED` and hidden otherwise, per the admin
  show/hide script.

### - [x] PP-SET-16 — Stored delay period falls back to 0 while the form field defaults to 7
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the case now asserts all three halves instead of the form alone. (1) The stored gateway option must contain **no** `disbursement_delay_period` key, which is the state a marketplace is in until an admin first edits that field. (2) `Helper::get_disbursement_delay_period()` must resolve that absent key to **`0`** (`Helper.php:777-781`), read back through the mu-plugin `/status` probe field `disbursement_delay_period_resolved` rather than recomputed here. (3) The rendered settings field must still advertise **`7`** (`admin-gateway-settings.php:159`). The disagreement between (2) and (3) IS the finding: `OrderController::disburse_delayed_payment()` subtracts no interval at 0, so a DELAYED marketplace whose admin never touched this field disburses immediately while its own settings screen claims a week-long hold. A resolved value that is no longer 0 means the product fallback changed and the documented defect needs re-triaging; a `null` means the module is inactive or the getter was renamed and the `/status` probe needs re-pointing before this case can speak at all.
- **Preconditions:** `disbursement_delay_period` absent from the stored option.
- **Steps:** Clear the key entirely, then read the resolved value through the helper.
- **Expected:** The resolved value is `0`, not `7`. The PHP fallback and the form default disagree,
  and that disagreement is itself the assertion — a delayed disbursement configured through an
  empty field releases immediately rather than after a week.

### - [x] PP-SET-17 — Button type persists and defaults to smart
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway configured.
- **Steps:** Read default, set `standard`, reload, set `smart`, reload.
- **Expected:** Default `smart`; both values round-trip into `button_type`.

### - [x] PP-SET-18 — Gateway title and description round-trip and render at checkout
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready, product in cart.
- **Steps:** Set a distinctive title and description, Save, load checkout.
- **Expected:** Both strings appear on the checkout payment option.

### - [x] PP-SET-19 — UCC mode toggle persists
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Button type `smart`.
- **Steps:** Toggle `ucc_mode`, Save, reload.
- **Expected:** Value round-trips. Note that enabling it does not by itself make card fields render;
  see PP-3DS.

### - [x] PP-SET-20 — Vendor-dashboard notice settings persist
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Gateway configured.
- **Steps:** Toggle `display_notice_on_vendor_dashboard` and
  `display_notice_to_non_connected_sellers`, set `display_notice_interval`, Save, reload.
- **Expected:** All three round-trip.

### - [x] PP-SET-21 — Notice-interval field is revealed only when notices are enabled
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Settings page open.
- **Steps:** Toggle the notice checkbox and observe the interval row.
- **Expected:** Interval input shown only when notices are enabled.

### - [x] PP-SET-22 — BN code defaults to the Dokan attribution value
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Fresh settings.
- **Steps:** Read the resolved `bn_code`.
- **Expected:** `weDevs_SP_Dokan`.

### - [x] PP-SET-23 — Saving settings registers a PayPal webhook id
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-failing-environment
- **Run note (run 4, 2026-07-31):** PayPal refuses `http://localhost:9999` as a webhook URL — `wc-logs` records `[issue] => Not a valid webhook URL`. NOT a product defect; needs a tunnel or public host.
- **Run note (2026-07-31):** PayPal rejects the webhook URL because `home_url()` here is `http://localhost:9999`, which is not publicly resolvable — `wc-logs` records `[issue] => Not a valid webhook URL`. NOT a product defect and NOT fixable locally; needs a tunnel or a public host.
- **Preconditions:** Valid credentials, sandbox on.
- **Steps:** Save the settings form and read `dokan_paypal_marketplace_test_webhook`.
- **Expected:** A webhook id is stored for the sandbox key specifically. The live twin
  `dokan_paypal_marketplace_webhook` must not be written while in sandbox mode.
- **Note:** Requires a live outbound call to PayPal; gated on `hasCredentials`.

### - [x] PP-SET-24 — `max_error` is unreachable configuration
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** negative · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Settings page open.
- **Steps:** Search the rendered settings form for a max-quantity error input.
- **Expected:** No such field exists. The key is read once in `Helper.php:750` and its getter has no
  caller anywhere in dokan-lite or dokan-pro, so the value can never affect behaviour. This case
  documents dead configuration rather than asserting a feature.

### - [x] PP-SET-25 — Settings restore leaves the gateway working for subsequent specs
- **Spec file:** `paypalMarketplaceSettings.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Any settings mutation has run.
- **Steps:** After each mutating test, restore the full working configuration as an explicit
  complete settings map rather than a partial merge, and re-seed the connected vendor.
- **Expected:** Readiness is true at the end of the file. CI runs one worker with retries, so a
  spec that dies mid-mutation would otherwise leave the gateway broken for every later test on that
  worker, which then fail or skip for entirely the wrong reason.

---

# PP-ONB — Vendor onboarding and connection

Live hosted onboarding is not automatable — PayPal's partner-referral flow is captcha-gated and
PayPal-side. Connected state is therefore seeded. Everything on the not-connected side, plus the
guards that reject a connection attempt, is genuinely drivable.

### - [x] PP-ONB-01 — Unconnected vendor sees the connect UI
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready; vendor1 has no PayPal merchant meta.
- **Steps:** Authenticate as vendor1 and open
  `dashboard/settings/payment-manage-dokan-paypal-marketplace` (note the hyphenated slug).
- **Expected:** The PayPal email input, the connect trigger and the connect-button container all
  render; no connected/disconnect state is shown.

### - [x] PP-ONB-02 — Connect attempt with an empty email is rejected
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Unconnected vendor on the payment settings page.
- **Steps:** Leave the email field blank and trigger the connect action.
- **Expected:** The request is rejected with the exact message `Email address field is required.`
  and no merchant meta is written.

### - [x] PP-ONB-03 — Connect attempt without a valid nonce is rejected
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Unconnected vendor authenticated.
- **Steps:** POST to the connect AJAX action with a tampered or absent nonce.
- **Expected:** Rejected with the exact message `Are you cheating?` and no state change.

### - [x] PP-ONB-04 — Vendor with an unsupported store country is blocked
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Vendor store address country set to a value outside PayPal's branded allow map.
- **Steps:** Submit a valid email and trigger connect; capture BOTH the AJAX JSON response and the
  redirect URL it returns.
- **Expected:** Rejected. The rejection carries **two different strings** and a spec must target the
  right one:
  - the AJAX JSON `message` is exactly `Vendor's country is not supported by PayPal.`
  - the returned `url` carries a `message` query arg reading `Selected country is not supported by
    PayPal. Please contact to your admin for further instruction.` — **this is the string the vendor
    actually sees**, because the response also sets `reload: true` and sends them to that URL.
  - the redirect target is the `settings/payment-manage-dokan-paypal-marketplace` navigation URL

  A UI-level assertion on the first string will never match. Verified at
  `WithdrawMethods/RegisterWithdrawMethods.php:192-206`.
- **Note:** Unlike Stripe Express, there is no template-level guard — the check is server-side
  inside the connect handler and only fires after the vendor clicks. A spec that looks for a
  pre-emptive on-page warning will find nothing and must not conclude the guard is missing.

### - [x] PP-ONB-05 — Vendor with a missing store country is blocked by the same guard
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor store address country cleared entirely.
- **Steps:** Submit a valid email and trigger connect.
- **Expected:** Identical rejection to PP-ONB-04, including both strings, and no merchant meta
  written.
- **Note:** This is deliberately **not** a separate code path. A missing country and an unsupported
  country both leave `$product_type` empty and fall into the same branch. The case exists to pin
  that equivalence — if the two ever diverge, one of them has grown an unreviewed guard.

### - [x] PP-ONB-06 — Vendor with a supported country reaches the PayPal referral redirect
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Vendor store country set to a supported value; valid credentials.
- **Steps:** Submit a valid email, trigger connect, and capture the resulting action-URL response
  without following it to completion.
- **Expected:** A PayPal-hosted referral URL is returned, targeting a paypal.com host and carrying
  the partner-referral query parameters. The flow is asserted up to the handoff only; completing
  the hosted consent is out of scope for automation.

### - [x] PP-ONB-07 — Country allow list is hardcoded, not admin-configurable
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** Admin settings page open.
- **Steps:** Search the settings form for a restricted-countries or allowed-countries control.
- **Expected:** No such control exists. PayPal uses two hardcoded allow maps (7 UCC countries and a
  branded map of roughly 85) where Stripe Express uses an admin-editable deny list. This case
  records an intentional divergence so a later reader does not file it as a missing feature.

### - [x] PP-ONB-08 — Seeded connected vendor renders the connected state
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Vendor1 seeded with mode-correct merchant meta.
- **Steps:** Open the vendor payment settings page.
- **Expected:** Connected state renders with a disconnect affordance, and the connect button is no
  longer offered.

### - [x] PP-ONB-09 — Seeding writes the sandbox meta key, not the live one
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** `test_mode` is `yes`.
- **Steps:** Seed vendor1 and read both `_dokan_paypal_test_merchant_id` and
  `_dokan_paypal_merchant_id`.
- **Expected:** Only the test key is populated. Sandbox and live vendor identity must not bleed.

### - [x] PP-ONB-10 — Switching to live mode makes a sandbox-connected vendor read as unconnected
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded in sandbox only.
- **Steps:** Flip `test_mode` to `no`, re-read the vendor's connection state, then restore.
- **Expected:** The vendor reads as not connected in live mode, because the resolver swaps to the
  live meta key which was never written.

### - [x] PP-ONB-11 — Disconnect clears the vendor's PayPal metas
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Vendor1 seeded connected.
- **Steps:** Trigger disconnect from the vendor dashboard and re-read the vendor's PayPal metas.
- **Expected:** The merchant-id and marketplace-settings metas are removed and the UI returns to
  the not-connected state. Not covered by any of the 49 existing manual cases.

### - [x] PP-ONB-12 — `MERCHANT.ONBOARDING.COMPLETED` marks the vendor connected
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor unconnected; webhook injection route available.
- **Steps:** Inject the onboarding-completed event for the vendor's tracking id.
- **Expected:** The handler runs without throwing and the vendor's merchant metas are written.
- **Note:** The handler makes a live outbound merchant-status call before writing, so this case is
  credential-gated even though the event itself is injected locally.

### - [x] PP-ONB-13 — `CUSTOMER.MERCHANT-INTEGRATION.SELLER-EMAIL-CONFIRMED` updates vendor state
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded connected with email unconfirmed.
- **Steps:** Inject the seller-email-confirmed event.
- **Expected:** Handler completes without throwing and the vendor's stored settings reflect the
  confirmed email.

### - [x] PP-ONB-14 — `CUSTOMER.MERCHANT-INTEGRATION.CAPABILITY-UPDATED` updates payment receivability
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded connected.
- **Steps:** Inject the capability-updated event.
- **Expected:** Handler completes without throwing and the stored capability state changes.

### - [x] PP-ONB-15 — `MERCHANT.PARTNER-CONSENT.REVOKED` disconnects the vendor
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded connected.
- **Steps:** Inject the consent-revoked event for that vendor.
- **Expected:** Vendor's PayPal metas are cleared and the vendor reads as not connected.

### - [x] PP-ONB-16 — A vendor whose payments are not receivable cannot be paid
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded connected but flagged payments-not-receivable.
- **Steps:** Place that vendor's product in the cart and load checkout.
- **Expected:** The gateway either hides or the cart is rejected — assert whichever the code
  actually does rather than assuming, and record the observed behaviour in this file.

### - [x] PP-ONB-17 — Vendor A cannot read or alter vendor B's PayPal settings
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Both vendors seeded with distinguishable merchant ids.
- **Steps:** Authenticated as vendor2, attempt to read and to write vendor1's PayPal payment
  settings through both the dashboard and the underlying request.
- **Expected:** Rejected; vendor1's merchant id is unchanged and never disclosed to vendor2.

### - [x] PP-ONB-18 — Vendor merchant id is never exposed to the storefront
- **Spec file:** `paypalMarketplaceOnboarding.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Vendor seeded connected.
- **Steps:** Load the vendor's store page and a product page as an anonymous visitor and search the
  rendered HTML for the merchant id.
- **Expected:** Absent. A merchant id in page source is a disclosure finding.

---

# PP-CHK — Checkout

The true capture path requires a PayPal buyer approval on PayPal's own domain. Whether Playwright
can drive that popup is being determined empirically during live exploration; each case below
records what it needs.

### - [x] PP-CHK-01 — Gateway is offered only when a connected vendor is in the cart
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready; vendor1 connected; vendor1 product in cart.
- **Steps:** Load classic checkout as a customer.
- **Expected:** PayPal Marketplace is listed. Readiness proven positively first, per PP-SET-05.

### - [x] PP-CHK-02 — Gateway is not offered when the only vendor is unconnected
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready; cart holds only an unconnected vendor's product.
- **Steps:** Load classic checkout.
- **Expected:** PayPal Marketplace is absent. The same run must show it present for a connected
  vendor, so absence cannot pass for the wrong reason.

### - [x] PP-CHK-03 — Smart buttons render on the classic checkout
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready, `button_type` is `smart`, connected vendor in cart.
- **Steps:** Select PayPal Marketplace at checkout and wait for the PayPal SDK button iframe.
- **Expected:** The PayPal button iframe is present and interactive. This asserts SDK load and
  button mount without requiring a payment.

### - [x] PP-CHK-04 — Standard button renders when configured
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** `button_type` set to `standard`.
- **Steps:** Load checkout and inspect the offered control.
- **Expected:** The standard redirect-style control renders rather than the smart-button iframe.

### - [x] PP-CHK-05 — Create-payment produces a PayPal order id
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready, connected vendor in cart, real merchant ids present.
- **Steps:** Drive the create-payment route as the shopper and capture the response.
- **Expected:** A PayPal order id is returned and the corresponding WooCommerce order records it.
- **Note:** Gated on `HAS_REAL_MERCHANTS` — PayPal rejects a payee merchant id that never granted
  consent to this partner.

### - [x] PP-CHK-06 — Single-vendor order completes end to end via the sandbox buyer
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Real merchant ids; sandbox buyer credentials; connected vendor.
- **Steps:** Place a single-vendor order, approve it as the PayPal sandbox buyer, and return to the
  store.
- **Expected:** Order reaches `processing`, the PayPal order id and capture id are recorded in
  order meta, an order note records the capture, and the vendor split row exists.
- **Note:** This case is the empirical test of whether PayPal approval is drivable at all. Its real
  status will be recorded honestly, including `not-automatable` if that is what exploration shows.

### - [x] PP-CHK-07 — Thank-you page renders the completed PayPal order
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** PP-CHK-06 completed.
- **Steps:** Follow the post-approval redirect.
- **Expected:** Order-received page shows the order with the correct total and status.

### - [x] PP-CHK-08 — Buyer cancellation returns to checkout with the cart intact
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Connected vendor in cart.
- **Steps:** Begin the PayPal flow and cancel from the PayPal-hosted page.
- **Expected:** The shopper is returned to checkout, the cart still holds its items, and no
  captured order is created.

### - [x] PP-CHK-09 — Capture id is written to the sub order, not only the parent
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured multi-vendor order exists.
- **Steps:** Read `_dokan_paypal_payment_capture_id` on each sub order and
  `_dokan_paypal_capture_data_by_vendor` on the parent.
- **Expected:** Each sub order carries its own capture id and the parent carries the vendor-keyed
  copy. This is the DOK-018 regression surface.

### - [x] PP-CHK-10 — Order notes record the PayPal capture
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A captured order exists.
- **Steps:** Read the order notes.
- **Expected:** A note referencing the PayPal capture is present.

### - [x] PP-CHK-11 — Duplicate submit does not double-capture
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** An approved but not-yet-captured PayPal order.
- **Steps:** Invoke capture twice for the same PayPal order id.
- **Expected:** Exactly one capture is recorded and the vendor is credited once. A second capture
  must not create a second balance row.

### - [x] PP-CHK-12 — Browser back after approval does not create a second order
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Run note (2026-08-03, strengthened — NOT re-executed; this case has never run at all):** "no second order" was satisfiable by a session that never got back to the store, so the case now pins where the resubmit was aimed and what the store answered. New expected result: the post-approval back navigation must land on the **store** host (a POST evaluated on paypal.com cannot create a WooCommerce order by any route, which would make every duplicate-order assertion vacuous); WooCommerce's own persistent-cart row must no longer hold the product (`wc_clear_cart_after_payment()` is the product behaviour that actually prevents the duplicate); the resubmitted checkout must **not** answer `result=success`; no order id may appear that was not there before; PayPal must still hold exactly **one** capture; and the vendor ledger must hold exactly one row per sub order.
- **Preconditions:** A completed PayPal order.
- **Steps:** Navigate back to checkout after approval and attempt to resubmit.
- **Expected:** No duplicate order is created.

### - [x] PP-CHK-13 — Zero-total order does not reach PayPal
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A 100%-off coupon reducing the cart to zero.
- **Steps:** Load checkout with a zero total.
- **Expected:** PayPal Marketplace is not offered, or the order completes without a PayPal call —
  assert the real behaviour and record it here.

### - [x] PP-CHK-14 — Out-of-stock at capture time is handled
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Run note (2026-08-03, strengthened — NOT re-executed; this case has never run at all):** the catalogue's own expectation used to be recorded in a log line, which meant a store that captured, said nothing and oversold stayed green. It is now an assertion. New expected result: WooCommerce's answer to the stock-zeroing PUT must itself read `outofstock` **before** the buyer's return is replayed, or the case is not exercising the approval-to-capture window at all. Then the money invariant, whichever way the product behaves: if PayPal holds a capture, the WooCommerce order must carry a capture id and be paid; if it holds none, the order must not be paid. Then the catalogued claim as a hard assertion — either the shopper is TOLD the goods are unavailable on the order-received page, or the order is not treated as paid. And finally, independent of anything a notice could satisfy: the post-capture stock count must be readable and must not have been driven below zero. The stock restore runs before those assertions so a failure cannot leave the shared product out of stock for the rest of the file.
- **Preconditions:** A product that goes out of stock between approval and capture.
- **Steps:** Approve, set stock to zero, then capture.
- **Expected:** The failure is surfaced to the shopper rather than silently producing a paid order
  for unavailable stock.

### - [x] PP-CHK-15 — Session timeout mid-flow does not orphan a capture
- **Spec file:** `paypalMarketplaceCheckout.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** An approved PayPal order.
- **Steps:** Clear the shopper session between approval and return, then complete the return.
- **Expected:** Either the order completes correctly or it fails cleanly; no captured-but-unrecorded
  payment.

---

# PP-SPL — Multi-vendor split

One PayPal `purchase_unit` per Dokan sub order. Each unit carries `payee.merchant_id` from vendor
meta, `payment_instruction.platform_fees` from the admin commission clamped at zero or above,
`invoice_id` as the parent order id and `custom_id` as the sub order id.

### - [x] PP-SPL-01 — Two-vendor cart produces two purchase units
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Both vendors connected with distinct merchant ids; one product from each.
- **Steps:** Build the order and inspect the outgoing purchase-unit payload.
- **Expected:** Exactly two units, one per sub order.

### - [x] PP-SPL-02 — Each purchase unit is payable to its own vendor merchant id
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** As PP-SPL-01.
- **Steps:** Read `payee.merchant_id` on each unit.
- **Expected:** Unit amounts map to the correct vendor's merchant id. A crossed mapping would pay
  the wrong vendor and is the single most damaging split defect.

### - [x] PP-SPL-03 — Unit amounts sum to the order total
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A multi-vendor order.
- **Steps:** Sum every unit amount and compare against the parent order total.
- **Expected:** Equal within one cent. PayPal returns decimal strings, so compare with a 0.01
  tolerance rather than the integer-minor-unit pattern the Stripe suite uses.

### - [x] PP-SPL-04 — Platform fee equals the admin commission per sub order
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A known commission rate configured.
- **Steps:** Compare each unit's `platform_fees` against the computed admin earning for that sub
  order.
- **Expected:** Equal. This is the core money oracle for the gateway.

### - [x] PP-SPL-05 — Platform fee is clamped at zero, never negative
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A commission configuration that would compute a negative admin earning.
- **Steps:** Build the order and read `platform_fees`.
- **Expected:** Zero, not a negative value. PayPal would reject a negative fee outright.

### - [x] PP-SPL-06 — Shipping is allocated to the vendor's own unit
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Shipping configured for both vendors.
- **Steps:** Compare each unit's shipping component against the sub order's shipping total.
- **Expected:** Each vendor's shipping rides its own unit, with the recipient forced to seller.

### - [x] PP-SPL-07 — Tax is allocated to the vendor's own unit
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A tax rate configured.
- **Steps:** Compare each unit's tax component against the sub order's tax total.
- **Expected:** Matches per sub order, recipient forced to seller.

### - [x] PP-SPL-08 — Coupon discount collapses into a single breakdown discount per unit
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A vendor coupon applied to one vendor's items.
- **Steps:** Inspect the discount component of each unit.
- **Expected:** The discounted vendor's unit carries the reduction; the other vendor's unit is
  unaffected; totals still reconcile to the order total.

### - [x] PP-SPL-09 — Line items are sent with quantity one and subtotal unit amounts
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** An order line with quantity greater than one.
- **Steps:** Inspect the item array of the unit.
- **Expected:** Quantity is one and the unit amount is the line subtotal. This is deliberate module
  behaviour, not a defect; the case pins it so a future change is noticed.

### - [x] PP-SPL-10 — `invoice_id` is the parent order id and `custom_id` the sub order id
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A multi-vendor order.
- **Steps:** Read both fields on each unit.
- **Expected:** `invoice_id` is constant across units and equals the parent order id; `custom_id`
  differs per unit and equals that sub order's id.

### - [x] PP-SPL-11 — Negative-fee items are dropped from the payload
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** An order line producing a negative fee.
- **Steps:** Inspect the outgoing items.
- **Expected:** The negative item is omitted rather than sent, and the unit total still reconciles.

### - [x] PP-SPL-12 — Vendor earnings recorded after capture match the split
- **Spec file:** `paypalMarketplaceSplit.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured multi-vendor order.
- **Steps:** Read each vendor's balance through the vendor accessor rather than raw tables.
- **Expected:** Order total equals the sum of vendor earnings plus admin commission plus the
  gateway fee read from `_dokan_paypal_payment_processing_fee`. Never hardcode the fee.

---

# PP-DIS — Disbursement

Three modes, only two of which PayPal ever sees: anything non-instant is transmitted as `DELAYED`.
The largest genuinely PayPal-specific area and the biggest gap in the existing manual corpus, where
all six disbursement cases are Blocked.

### - [x] PP-DIS-01 — INSTANT mode disburses at capture
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** `disbursement_mode` is `INSTANT`; a captured order.
- **Steps:** Inspect the outgoing payment instruction and the resulting vendor balance.
- **Expected:** Instant disbursement is requested and the vendor balance reflects the earning
  without a parked withdraw record.

### - [x] PP-DIS-02 — ON_ORDER_COMPLETE parks funds until the order completes
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Mode set to `ON_ORDER_COMPLETE`; a captured order still processing.
- **Steps:** Read the parked withdraw data meta immediately after capture.
- **Expected:** Funds are parked and not yet released.

### - [x] PP-DIS-03 — ON_ORDER_COMPLETE releases on the status transition
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** As PP-DIS-02.
- **Steps:** Transition the order to completed and re-read the release state.
- **Expected:** The parked funds are released exactly once.

### - [x] PP-DIS-04 — ON_ORDER_COMPLETE orders never enter the daily delayed queue
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Run note (2026-08-03, strengthened — NOT re-executed; this case has never run at all):** the hand-written mirror of the product's `meta_query` is now **diagnostics only**, quoted in the failure messages and never asserted on — asserting on SQL this file wrote would stay green with `handle_custom_query_var()` deleted. The case drives the real `dokan_paypal_mp_daily_schedule` end to end instead. New expected result, negative half: with `disbursement_delay_period` empty (so maturity cannot be the reason the job skips the order) an ON_ORDER_COMPLETE order must keep `_dokan_paypal_balance_added = no`, gain **no** `dokan_withdraw` row in the vendor-balance table, and its parked withdraw payload must survive the run byte-identical, because the status hook still needs to read it back (`Order/OrderManager.php:906`). Positive control, same order and same driver with only the mode literal flipped to `DELAYED`: the job must release it and book **exactly one** `dokan_withdraw` row (`Order/OrderController.php:430-437`). Without that control, "not released" would be a statement about a cron that never ran.
- **Preconditions:** An `ON_ORDER_COMPLETE` order parked.
- **Steps:** Run the daily disbursement query and inspect its result set.
- **Expected:** The order is absent. The scheduled query matches the literal string `DELAYED`, so
  `ON_ORDER_COMPLETE` orders are structurally excluded — if they ever appear, the release path has
  changed and funds could double-release.

### - [x] PP-DIS-05 — DELAYED mode parks funds with the configured delay
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Mode `DELAYED`, delay period set to a known value.
- **Steps:** Capture an order and read the parked record.
- **Expected:** The record carries the configured delay.

### - [x] PP-DIS-06 — The daily scheduled job releases matured delayed funds
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A delayed order whose delay has elapsed.
- **Steps:** Trigger the daily disbursement schedule and re-read balances.
- **Expected:** Funds are released and the vendor balance increases by the earning.

### - [x] PP-DIS-07 — Unmatured delayed funds are not released early
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A delayed order whose delay has not elapsed.
- **Steps:** Trigger the daily schedule.
- **Expected:** No release; the parked record survives unchanged.

### - [x] PP-DIS-08 — Delay period is clamped at the documented maximum
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Gateway configured.
- **Steps:** Set a delay period above the maximum and read the effective value.
- **Expected:** Clamped to the maximum rather than accepted verbatim.

### - [x] PP-DIS-09 — Empty delay period releases immediately rather than after seven days
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** `disbursement_delay_period` cleared.
- **Steps:** Capture a delayed order and evaluate maturity.
- **Expected:** The effective delay is zero, matching the PHP fallback, not the form default of
  seven. Pairs with PP-SET-16.

### - [x] PP-DIS-10 — Non-instant modes are transmitted to PayPal as DELAYED
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Mode `ON_ORDER_COMPLETE`.
- **Steps:** Inspect the outgoing disbursement mode on the payment instruction.
- **Expected:** `DELAYED`. PayPal has no concept of on-order-complete; the distinction is entirely
  Dokan-side.

### - [x] PP-DIS-11 — Reverse withdrawal is created on delayed disbursement
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** Delayed mode; a captured order.
- **Steps:** Inspect the reverse-withdrawal ledger for the vendor.
- **Expected:** The expected reverse-withdrawal entry exists with the correct amount.

### - [x] PP-DIS-12 — Reverting an order status does not double-release funds
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** An `ON_ORDER_COMPLETE` order already released.
- **Steps:** Move the order back to processing and forward to completed again.
- **Expected:** Exactly one release in total. Not covered by any existing manual case.

### - [x] PP-DIS-13 — Vendor withdraw balance reflects released funds only
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** One released and one parked order for the same vendor.
- **Steps:** Read the vendor's withdrawable balance.
- **Expected:** Only the released amount is withdrawable.

### - [x] PP-DIS-14 — Orphan sub-order rows are reported but do not fail the run
- **Spec file:** `paypalMarketplaceDisbursement.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** A multi-vendor order that triggered a re-split.
- **Steps:** Run the orphan-detection query from the DOK-017 bug file and read vendor balances
  through the vendor accessor.
- **Expected:** Money nets correctly, and any orphan rows are emitted as a warning rather than a
  failure. DOK-017 is an open Low/P3 data-hygiene issue whose money impact is nil; turning it red
  would poison a lane that runs a single worker with a shared failure budget.

---

# PP-REF — Refunds

Requires a real capture, so double-gated. Two previously-filed P1 bugs (DOK-018, DOK-019) are fixed
in the installed 5.0.9 build, so their cases are written as **passing regression guards**, not as
`fixme`. Each keeps the pre-fix error string as a negative anchor so a regression is unmistakable.

### - [x] PP-REF-01 — Full refund on a single-vendor order succeeds
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured single-vendor order.
- **Steps:** Issue a full automatic refund from admin and read the refund result.
- **Expected:** A PayPal refund id is recorded, the order moves to refunded, and the vendor's
  earning is reversed.

### - [x] PP-REF-02 — Partial refund on a single-vendor order succeeds
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured order.
- **Steps:** Refund a fraction of the total.
- **Expected:** Refund succeeds, the recorded amount matches what was requested, and the remaining
  refundable balance decreases accordingly.
- **Note:** Do not assert on the mu-plugin response's own `refund_amount` field — it reports the
  order total even for a partial refund, an inaccuracy inherited from the Stripe helper.

### - [x] PP-REF-03 — A second refund on the same capture succeeds (DOK-019 regression guard)
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured order with one partial refund already issued.
- **Steps:** Issue a second partial refund against the same capture.
- **Expected:** It succeeds and produces a second distinct PayPal refund id. The refund payload's
  `invoice_id` must be order-id-suffixed-with-refund-id, not the bare order id.
- **Regression anchor:** the failure must never be
  `DUPLICATE_INVOICE_ID: Invoice ID was previously used to refund a capture.` This was DOK-019, an
  Open High/P1 against 5.0.8, fixed in the installed 5.0.9. Written as a passing assertion rather
  than a `fixme` precisely because the fix shipped and needs a guard.

### - [x] PP-REF-04 — Multi-vendor partial refund affects only the targeted vendor
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured two-vendor order.
- **Steps:** Refund part of one vendor's sub order.
- **Expected:** Only that vendor's earning is reduced; the other vendor's balance is untouched.

### - [x] PP-REF-05 — Block-checkout multi-vendor refund finds its capture id (DOK-018 regression guard)
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Run note (2026-08-03, strengthened — NOT re-executed; this case has never run at all):** the case now drives the checkout block's REAL sequence — create-payment splits the Store API draft order, the buyer approves on PayPal with the return redirect **blocked** in the browser (letting it through hands the capture to `maybe_process_order_redirect()`, takes the order out of `checkout-draft` and makes the Store API place a second order, closing the window entirely), the module's capture-payment route captures onto the sub orders, and only then is `POST /wc/store/v1/checkout` fired. New expected result: the place-order must reuse the **same** parent order the capture belongs to and report `payment_status: success`; the sub-order **id set** must be identical before and after (the splitter deletes and recreates rather than emptying, so only the id set can tell survival from replacement — `dokan-lite/includes/Order/Manager.php:912-918`); each pre-place sub order must still carry `_dokan_paypal_payment_capture_id`; the parent must carry `_dokan_paypal_capture_data_by_vendor` with one entry per vendor and a non-empty capture id in each; and the partial refund must complete with PayPal reporting `COMPLETED`.
- **Declared skip (2026-08-03):** if `POST /wc/store/v1/checkout` refuses the order because this site has no shipping rate covering the customer's address, the case declares a `test.skip(true, …)` naming that, rather than asserting the re-split without a place-order that actually ran. Every other Store API refusal still fails. Unblocked by configuring a shipping zone with a matching rate.
- **Preconditions:** A captured multi-vendor order placed through **block** checkout.
- **Steps:** Issue an automatic refund on one sub order.
- **Expected:** The refund succeeds. Sub orders survive the place-order re-split because the
  protection hook runs ahead of the splitter, and the vendor-keyed capture data on the parent
  provides a fallback.
- **Regression anchor:** the failure must never be `Automatic refund is not possible for this
  order. Reason: No PayPal capture id is found.` — the DOK-018 symptom, fixed in 5.0.9.

### - [x] PP-REF-06 — Over-refund is rejected
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured order.
- **Steps:** Attempt to refund more than the captured amount.
- **Expected:** Rejected; no PayPal call succeeds and no balance changes.

### - [x] PP-REF-07 — Refund of an already fully-refunded order is rejected
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A fully refunded order.
- **Steps:** Attempt a further refund.
- **Expected:** Rejected cleanly with no additional refund row.

### - [x] PP-REF-08 — Vendor-initiated refund request reaches admin approval
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A captured order belonging to vendor1.
- **Steps:** Request a refund as the vendor, then inspect the admin refund queue.
- **Expected:** The request appears pending for admin action.

### - [x] PP-REF-09 — Admin approval of a vendor refund executes the PayPal refund
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A pending vendor refund request.
- **Steps:** Approve it as admin.
- **Expected:** A PayPal refund id is recorded and the vendor earning is reversed.

### - [x] PP-REF-10 — Admin rejection of a vendor refund moves no money
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A pending vendor refund request.
- **Steps:** Reject it as admin.
- **Expected:** No PayPal refund occurs and balances are unchanged.

### - [x] PP-REF-11 — Refund on a delayed-disbursement order behaves correctly
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** A captured order in delayed mode whose funds are still parked.
- **Steps:** Refund it before the delay matures.
- **Expected:** The refund succeeds and the parked disbursement is reduced or cancelled rather than
  later releasing money for a refunded order.

### - [x] PP-REF-12 — Refunding shipping and tax is possible with seller as recipient
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** An order with shipping and tax, recipients forced to seller.
- **Steps:** Refund the shipping and tax components.
- **Expected:** Both are refundable from the vendor's share. The gateway forces seller recipients
  specifically so that partial refunds of these components are possible.

### - [x] PP-REF-13 — Gateway processing fee handling on refund is recorded, not assumed
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** A refunded order.
- **Steps:** Read `_dokan_paypal_payment_processing_fee` and the post-refund balances.
- **Expected:** The money oracle still reconciles using the fee read from meta. The fee must never
  be hardcoded in the assertion.

### - [x] PP-REF-14 — Refund reversal from the vendor side adjusts the ledger
- **Spec file:** `paypalMarketplaceRefund.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-never-executed
- **Preconditions:** A completed refund on a vendor's order.
- **Steps:** Inspect the vendor's reverse-withdrawal ledger.
- **Expected:** The reversal is recorded with the correct sign and amount.

---

# PP-WHK — Webhooks

16 PayPal event strings map onto 14 handler classes; two strings are aliases. All are injectable
through the mu-plugin, which dispatches straight into the event factory. Signature verification
performs a live outbound call to PayPal and cannot be forged, so the injection route bypasses it —
the same shape the Stripe suite uses.

**Two standing traps every case below must respect.** The endpoint returns HTTP 200 and exits
before reading the body when the gateway is not ready, and the event factory swallows every
exception and still returns 200. An assertion on status code alone therefore passes against a
completely dead gateway. Every case must additionally assert a state mutation and assert that the
handler did not throw.

### - [x] PP-WHK-01 — Injection route reports handler success without throwing
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Inject a known-good event and read the injection response body.
- **Expected:** The body reports that the handler neither threw nor fatalled. This is the
  precondition for trusting every other case in this file.

### - [x] PP-WHK-02 — Gateway-not-ready returns 200 without processing
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway deliberately made not-ready.
- **Steps:** POST an event to the live webhook endpoint and inspect both status and state.
- **Expected:** HTTP 200 with no state mutation. This case exists to document the trap explicitly
  so no other spec mistakes a 200 for successful processing.

### - [x] PP-WHK-03 — `CHECKOUT.ORDER.APPROVED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** An order awaiting approval.
- **Steps:** Inject the approved event for that order.
- **Expected:** Handler completes without throwing and the order state advances as the handler
  intends.

### - [x] PP-WHK-04 — `CHECKOUT.ORDER.COMPLETED` drives order completion
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** An approved order.
- **Steps:** Inject the completed event.
- **Expected:** Capture data is stored and the order reaches its paid state. Order completion is
  driven by this event, **not** by a capture-completed event.

### - [x] PP-WHK-05 — `PAYMENT.CAPTURE.COMPLETED` has no handler
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Inject the event string and observe dispatch.
- **Expected:** No handler is resolved. The brief assumed this handler exists; it does not appear
  anywhere in dokan-pro. This case pins the absence so the gap is visible rather than silently
  uncovered.

### - [x] PP-WHK-06 — `PAYMENT.CAPTURE.DENIED` has no handler
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Inject the event string.
- **Expected:** No handler is resolved. There is therefore no decline-webhook path in this module,
  which is a genuine functional gap worth surfacing rather than a test that can be written.

### - [x] PP-WHK-07 — `PAYMENT.CAPTURE.REFUNDED` records a refund
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A captured order.
- **Steps:** Inject the refunded event with a refund-shaped payload.
- **Expected:** A Dokan refund row is created and approved, and vendor balance reflects it.

### - [x] PP-WHK-08 — `PAYMENT.CAPTURE.REVERSED` is processed as a refund
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A captured order.
- **Steps:** Inject the reversed event.
- **Expected:** It routes to the same handler as a refund and creates an approved refund row. This
  aliasing is deliberate in the code but behaviourally significant: a chargeback-style reversal is
  indistinguishable from a merchant refund in Dokan's ledger.
- **Open question to resolve live:** whether a real reversal payload carries the refund-shaped
  breakdown the handler reads. If it does not, the handler reads a missing property. Record the
  observed behaviour here. Not covered by any existing manual case.

### - [x] PP-WHK-09 — `PAYMENT.SALE.COMPLETED` drives subscription renewal
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-failing-product-bug
- **Run note (run 4, 2026-07-31):** **DOK-025** — redelivered PAYMENT.SALE.COMPLETED creates a second renewal order. Reproduced 3/3 (orders #114, #193, #457). Fails by design.
- **Run note (2026-07-31):** Fails against develop by design — guards **DOK-025** (renewal dedup queries the Stripe meta key). Reproduced 2/2. Goes green when the product is fixed; do not touch the test.
- **Preconditions:** A vendor with an active PayPal billing subscription.
- **Steps:** Inject the sale-completed event.
- **Expected:** Exactly one renewal order is created.
- **Suspected defect to confirm, not assume:** the renewal-dedup query in this handler appears to
  read a **Stripe** capture-id meta key. If that is a copy-paste defect, dedup never matches and a
  repeated event would create duplicate renewal orders. Assert the correct invariant — one renewal
  per event — and put the confirm-and-file instruction in the failure message.

### - [x] PP-WHK-10 — `PAYMENT.REFERENCED-PAYOUT-ITEM.COMPLETED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A parked disbursement.
- **Steps:** Inject the payout-item-completed event.
- **Expected:** Handler completes without throwing and the payout state advances. Not covered by
  any existing manual case.

### - [x] PP-WHK-11 — `MERCHANT.ONBOARDING.COMPLETED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** An unconnected vendor.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing. Cross-referenced with PP-ONB-12 for the state
  assertion.

### - [x] PP-WHK-12 — `MERCHANT.PARTNER-CONSENT.REVOKED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A connected vendor.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing and the vendor disconnects.

### - [x] PP-WHK-13 — `BILLING.SUBSCRIPTION.ACTIVATED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A vendor with a pending subscription.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing and the subscription becomes active. None of the
  five billing events is covered by the existing manual corpus.

### - [x] PP-WHK-14 — `BILLING.SUBSCRIPTION.CANCELLED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** An active subscription.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing and the subscription is cancelled.

### - [x] PP-WHK-15 — `BILLING.SUBSCRIPTION.EXPIRED` is an alias of cancellation
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** An active subscription.
- **Steps:** Inject the expired event and compare the resulting state against the cancelled path.
- **Expected:** Identical outcome. Expiry and cancellation are behaviourally indistinguishable in
  this module — a deliberate alias worth pinning.

### - [x] PP-WHK-16 — `BILLING.SUBSCRIPTION.SUSPENDED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-gated-skip
- **Run note (run 4, 2026-07-31):** Needs a subscription that really exists on PayPal (the handler calls `Subscriptions\Processor::get_subscription()`). Fixture owed.
- **Run note (2026-07-31):** Skipped: needs a subscription that really exists on PayPal — the handler calls `Subscriptions\Processor::get_subscription()`, so no PayPal-side subscription means no observable mutation. Fixture owed.
- **Preconditions:** An active subscription.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing and the subscription suspends.

### - [x] PP-WHK-17 — `BILLING.SUBSCRIPTION.RE-ACTIVATED` is handled
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A suspended subscription.
- **Steps:** Inject the event.
- **Expected:** Handler completes without throwing and the subscription reactivates.

### - [x] PP-WHK-18 — `BILLING.SUBSCRIPTION.PAYMENT.FAILED` handler is dead on a typo'd meta key
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Run note (2026-07-31):** Written as `test.fail` guarding **DOK-024** (doubled meta key `product_order_idproduct_order_id`). It "passes" *because the product is broken* — the day DOK-024 is fixed this turns red, which is the intended alarm.
- **Preconditions:** A vendor with an active subscription and a linked product order.
- **Steps:** Inject the payment-failed event and inspect whether the vendor's posting capability is
  revoked.
- **Expected (correct behaviour, currently failing):** the vendor's product-posting capability is
  revoked. In the installed build the handler reads a user meta key whose name is doubled, so the
  order lookup always fails, the handler returns early, and its only intended mutation never
  happens.
- **Implementation note:** file the bug first, then write this as `test.fixme` referencing that bug
  file, with the correct-behaviour assertions written out beneath it. Do **not** write a passing
  test asserting that nothing happens — that would ossify the defect as intended behaviour.

### - [x] PP-WHK-19 — Replaying the same event does not duplicate its effect
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A refunded order.
- **Steps:** Inject the same refund event twice and count the resulting refund rows.
- **Expected:** One row. Idempotency is the highest-value webhook property for a money system.

### - [x] PP-WHK-20 — Unknown event type is ignored without error
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Inject an event type that maps to no handler.
- **Expected:** No handler resolves, nothing throws, and no state changes.

### - [x] PP-WHK-21 — Malformed body is rejected without a fatal
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** POST a non-JSON and a structurally invalid JSON body to the live endpoint.
- **Expected:** Handled without a PHP fatal; no state mutation.

### - [x] PP-WHK-22 — Event for an unknown order is handled safely
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-failing-product-bug
- **Run note (run 4, 2026-07-31):** **DOK-028** — `status_header(400)` + `exit()` from inside the handler on a missing order. Reproduced 2/2. Fails by design.
- **Run note (2026-07-31):** Fails against develop by design — guards **DOK-028** (`status_header(400)` + `exit()` from inside the handler). Goes green when the product returns instead of exiting.
- **Preconditions:** Gateway ready.
- **Steps:** Inject a refund event referencing an order id that does not exist.
- **Expected:** Handler exits cleanly without throwing and creates no rows.

### - [x] PP-WHK-23 — Unsigned request to the live endpoint does not mutate state
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway ready with a registered webhook id.
- **Steps:** POST a well-formed event to the live endpoint with no PayPal signature headers.
- **Expected:** No state mutation. The status code alone proves nothing here, so the assertion is
  on state.

### - [x] PP-WHK-24 — Wrong webhook id does not verify
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the state assertions alone would pass with the stored-webhook-id lookup deleted outright, so the case now asserts the **verification input** the module hands `Processor::verify_webhook_request()` (`Utilities/Processor.php:433-441`), recorded by the mu-plugin interceptor. New expected result: the recorder is empty before the delivery (so the record cannot be a leftover from an earlier test); a verification request is made at all; its `webhook_id` equals the poisoned value written into the mode-swapped option (`WebhookHandler.php:75` → `Helper::get_webhook_key()`, `Helper.php:847`); the recorded body's `purchase_units[0].invoice_id` names the order just delivered, pinning the record to THIS delivery; a positive control re-arm with a **second** sentinel id proves the option is read live per delivery rather than cached at boot; and the order gains no `_dokan_paypal_payment_charge_captured`, no status change and no `dokan_refund` row. Genuine PayPal signature headers cannot be forged locally, so verification can never answer SUCCESS here — the observed input, not the outcome, is what distinguishes this case from PP-WHK-23.
- **Preconditions:** Stored webhook id deliberately altered.
- **Steps:** POST an event with signature headers to the live endpoint.
- **Expected:** Verification fails and no state mutation occurs.

### - [x] PP-WHK-25 — Sandbox and live webhook id options are independent
- **Spec file:** `paypalMarketplaceWebhooks.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-gated-skip
- **Run note (run 4, 2026-07-31):** Declared BLOCKED: no settings save is reachable from this test transport. A real coverage gap, not coverage.
- **Run note (2026-07-31):** Skipped unconditionally and declared BLOCKED: no settings save is reachable from this test transport (`register_webhook()`/`deregister_webhook()` only run from `PayPal::process_admin_options()`). Left blocked rather than kept as a vacuous assertion — this is a real coverage gap, not coverage.
- **Preconditions:** Sandbox configured.
- **Steps:** Read both the sandbox and live webhook id options after a settings save.
- **Expected:** Only the sandbox option is populated. Teardown must clear both — the live twin
  exists and the brief did not mention it.

---

# PP-SUB — Vendor subscriptions

A different model from Stripe Express. PayPal creates a Billing subscription, stores its id in
vendor user meta, and routes the purchase unit's payee to the **admin partner id** rather than a
vendor merchant id. Buying a pack requires the PayPal popup, so purchase itself is not drivable;
lifecycle is reachable through webhook injection.

### - [x] PP-SUB-01 — Subscription settings persist
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Vendor-subscription module available.
- **Steps:** Enable vendor subscriptions, save, reload.
- **Expected:** Settings round-trip.

### - [x] PP-SUB-02 — Subscription product pack is purchasable through the PayPal gateway
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A subscription pack product; gateway ready.
- **Steps:** Add the pack to the cart as a vendor and load checkout.
- **Expected:** PayPal Marketplace is offered for the pack.

### - [x] PP-SUB-03 — Subscription purchase unit is payable to the admin partner, not a vendor
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A subscription pack in the cart.
- **Steps:** Inspect the outgoing purchase unit for the pack order.
- **Expected:** The payee is the admin partner id. A vendor merchant id here would pay the vendor
  for their own subscription, which inverts the money flow.

### - [x] PP-SUB-04 — Subscription order sets fee, shipping and tax recipients to admin
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the third recipient the case is named for is now asserted, and the precondition is measured rather than proxied. New expected result: `Helper::is_enabled()` must be true — `Hooks`, the sole registrar of both filters, is constructed only after that check (`module.php:99-113`), and with the gateway disabled both probes answer the mu-plugin's `UNFILTERED` sentinel while `dokan_pro_active_modules` still lists the module, so `requireModule()` alone does not catch it. The vendor-subscription order must resolve `tax_fee_recipient` and `shipping_fee_recipient` to **`admin`** (`Hooks.php:30-77`) while an ordinary control order on the same gateway resolves both to **`seller`**. Then the third recipient: `dokan_gateway_fee_paid_by` is order meta, not a filter, so it is asserted **empty** on the freshly created order and then **`admin`** after a renewal drives `SubscriptionOrderMetaBuilder` through `PaymentSaleCompleted` (`WebhookEvents/PaymentSaleCompleted.php:158-160`), on its own subscriber and its own subscription id so the write cannot be confused with another case's.
- **Preconditions:** A subscription pack order.
- **Steps:** Read the recipient settings applied to that order.
- **Expected:** All three are admin, inverting the seller-recipient rule that applies to normal
  product orders.

### - [x] PP-SUB-05 — PayPal subscription id is stored in vendor meta after activation
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A vendor with a pending subscription.
- **Steps:** Inject the subscription-activated event and read the vendor meta.
- **Expected:** The PayPal billing subscription id is stored.

### - [x] PP-SUB-06 — Product pack maps to a PayPal product and plan id
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A subscription pack.
- **Steps:** Read the pack's stored PayPal product and plan identifiers.
- **Expected:** Both are present and correspond to the pack configuration.

### - [x] PP-SUB-07 — One-active-subscription cart guard rejects a second pack
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A vendor with an active subscription.
- **Steps:** Attempt to add a second pack to the cart.
- **Expected:** Rejected with the guard's message; only one active subscription is permitted.

### - [x] PP-SUB-08 — Cancellation ends the subscription and revokes vendor capability
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** An active subscription.
- **Steps:** Inject the cancelled event and read the vendor's subscription state and capability.
- **Expected:** Subscription ends and capability changes as configured.

### - [x] PP-SUB-09 — Renewal creates exactly one order per sale event
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** An active subscription.
- **Steps:** Inject a sale-completed event twice with the same identifiers.
- **Expected:** One renewal order. Shares the suspected Stripe-meta-key dedup defect flagged in
  PP-WHK-09; assert the correct invariant and confirm before filing.

### - [x] PP-SUB-10 — Expiry is indistinguishable from cancellation
- **Spec file:** `paypalMarketplaceSubscriptions.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** An active subscription.
- **Steps:** Compare the end state after the expired event against the cancelled event.
- **Expected:** Identical. Pins the alias.

---

# PP-WDR — Withdraw method

The withdraw method id is **hyphenated** (`dokan-paypal-marketplace`) while the gateway id uses
underscores. Stripe Express's two are identical, so a straight mirror is wrong by default — this is
the single most likely copy-paste defect in the build.

### - [x] PP-WDR-01 — PayPal withdraw method is registered under the hyphenated key
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Module active and configured.
- **Steps:** Read the withdraw methods option.
- **Expected:** The hyphenated key is present. Asserting the underscored gateway id here would fail
  even on a correctly working system.

### - [x] PP-WDR-02 — Admin can enable the PayPal withdraw method
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Admin authenticated.
- **Steps:** Enable the method in withdraw settings and save.
- **Expected:** Persisted and offered to vendors.

### - [x] PP-WDR-03 — Admin can disable the PayPal withdraw method
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Method enabled.
- **Steps:** Disable and save.
- **Expected:** No longer offered to vendors.

### - [x] PP-WDR-04 — Connected vendor can select PayPal as a payout method
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Vendor seeded connected; method enabled.
- **Steps:** Open vendor withdraw settings.
- **Expected:** PayPal is selectable.

### - [x] PP-WDR-05 — Unconnected vendor cannot select PayPal as a payout method
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Vendor with no PayPal merchant meta.
- **Steps:** Open vendor withdraw settings.
- **Expected:** PayPal is unavailable or blocked with an explanatory message.

### - [x] PP-WDR-06 — Vendor can request a PayPal withdrawal against a released balance
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Run note (2026-08-03) — THE CATALOGUE IS WRONG HERE, NOT THE TEST.** The expectation above ("Request created and pending") does not describe dokan-pro 5.0.9. The product answers **HTTP 400 "Withdraw method is not active"**: `Withdraw\Manager::is_valid_approval_request()` (`dokan-lite Withdraw/Manager.php:57-59`) requires the method to appear in `dokan_get_seller_active_withdraw_methods()`, which is built solely from the vendor's stored paypal / bank / skrill **profile** fields (`Withdraw/functions.php:67-84`); no connected-gateway method filters itself into that list. PayPal Marketplace disburses automatically instead (`Order/OrderManager.php:586-592`), exactly as Stripe Express does. The test asserts the product's actual contract and excludes every other 400 branch by measurement rather than assumption — the balance is proved to cover the amount first, the message is matched on the specific method refusal (five other branches return 400 with different messages), the `withdraw/balance` endpoint is proved to have answered before its silence is read as evidence, and no pending row may be left behind. The catalogued expectation is left above unedited so the divergence stays visible; it should be re-written only by someone who has decided which of the two behaviours the product is supposed to have.
- **Preconditions:** Vendor connected with a positive withdrawable balance.
- **Steps:** Submit a withdrawal request.
- **Expected:** Request created and pending.

### - [x] PP-WDR-07 — Admin approval of a PayPal withdrawal adjusts the balance
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-gated-skip
- **Run note (run 4, 2026-07-31):** Precondition unreachable on dokan-pro 5.0.9 — a PayPal-method withdrawal cannot be created through the product surfaces this test can drive.
- **Preconditions:** A pending withdrawal request.
- **Steps:** Approve as admin and re-read the vendor balance.
- **Expected:** Balance decreases by the approved amount.

### - [x] PP-WDR-08 — Admin cancellation of a withdrawal restores the balance
- **Spec file:** `paypalMarketplaceWithdraw.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-gated-skip
- **Run note (run 4, 2026-07-31):** Same blocker as PP-WDR-07.
- **Preconditions:** A pending withdrawal request.
- **Steps:** Cancel as admin.
- **Expected:** Balance is unchanged from before the request.

---

# PP-CUR — Currency

A hard 24-currency allow list. High value because it is almost entirely config-level and therefore
survives the no-money constraint.

### - [x] PP-CUR-01 — Supported store currency leaves the gateway available
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Store currency USD; gateway ready.
- **Steps:** Load checkout.
- **Expected:** Gateway offered.

### - [x] PP-CUR-02 — Unsupported store currency removes the gateway from checkout
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Store currency set to a value outside the allow list.
- **Steps:** Load checkout, then restore the currency.
- **Expected:** Gateway not offered.

### - [x] PP-CUR-03 — Unsupported currency disables the gateway in memory only
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Unsupported currency set.
- **Steps:** Read the stored `enabled` value from the settings option while the gateway is
  effectively disabled.
- **Expected:** The stored option still says enabled. The disable is a runtime-only assignment, so
  a spec that reads the option to determine availability would draw the wrong conclusion. Restore
  the currency afterwards.

### - [x] PP-CUR-04 — Admin settings screen warns on an unsupported currency
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Unsupported currency set.
- **Steps:** Open the gateway settings screen.
- **Expected:** The normal settings form is replaced by a gateway-disabled explanation.

### - [x] PP-CUR-05 — Zero-decimal currency amounts carry no fractional part
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Store currency set to a zero-decimal supported currency.
- **Steps:** Build an order and inspect the outgoing amount strings.
- **Expected:** Whole numbers with no decimal component.

### - [x] PP-CUR-06 — Zero-decimal split still reconciles
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-failing-product-bug
- **Run note (run 4, 2026-07-31):** **DOK-030** — zero-decimal breakdown does not sum to `amount.value` (sub order 281: expected 11, received 12). Fails by design.
- **Preconditions:** Zero-decimal currency; multi-vendor cart.
- **Steps:** Sum unit amounts against the order total.
- **Expected:** Exact reconciliation, allowing at most one sub-unit of rounding.

### - [x] PP-CUR-07 — Rounding on a three-way split does not lose or invent money
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Three connected vendors and a total that does not divide evenly.
- **Steps:** Compare the sum of units and fees against the order total.
- **Expected:** Reconciles within one cent; no systematic drift.

### - [x] PP-CUR-08 — Currency change mid-session is reflected at checkout
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A shopper with an active cart.
- **Steps:** Change store currency from supported to unsupported and reload checkout.
- **Expected:** Availability updates without a stale cached gateway.

### - [x] PP-CUR-09 — Supported-currency filter is honoured
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A filter registered from a test mu-plugin.
- **Steps:** Add a currency through the module's supported-currencies filter and re-check
  availability.
- **Expected:** The filtered currency is accepted. Note the filter is applied in two places with
  differently-shaped data, which is itself worth recording if the behaviours diverge.

### - [x] PP-CUR-10 — Vendor with a mismatched currency is handled
- **Spec file:** `paypalMarketplaceCurrency.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-failing-product-bug
- **Run note (run 4, 2026-07-31):** **DOK-031** — purchase unit denominated in the STORE currency, not the order's own (order 316 built USD, labelled EUR). Fails by design.
- **Preconditions:** A connected vendor whose PayPal account currency differs from the store.
- **Steps:** Attempt an order for that vendor.
- **Expected:** Record the real behaviour — either rejection or PayPal-side conversion. Do not
  assume.

---

# PP-EDG — Edge cases

Rich PayPal-only surface, most of it reachable without money.

### - [x] PP-EDG-01 — Cart mixing a connected and an unconnected vendor
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** One connected and one unconnected vendor product in the cart.
- **Steps:** Load checkout.
- **Expected:** Assert the real behaviour — gateway hidden, or cart validated with a message. The
  brief left this open deliberately; record what the code actually does.

### - [x] PP-EDG-02 — Cart exceeding the ten-vendor cap is rejected
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Eleven vendors' products in one cart.
- **Steps:** Load checkout.
- **Expected:** Rejected with the module's exact cap message. Not covered by any existing manual
  case, and a hard PayPal constraint with no Stripe analog.

### - [x] PP-EDG-03 — Cart at exactly ten vendors is accepted
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Exactly ten connected vendors in the cart.
- **Steps:** Load checkout.
- **Expected:** Accepted. Boundary companion to PP-EDG-02.

### - [x] PP-EDG-04 — Add-to-cart is blocked only when PayPal is the sole gateway
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** An unconnected vendor's product; PayPal the only enabled gateway.
- **Steps:** Attempt to add the product, then enable a second gateway and retry.
- **Expected:** Blocked in the first case, permitted in the second.

### - [x] PP-EDG-05 — Cart-item validation filter path is exercised
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Run note (2026-08-03) — THE CATALOGUE IS WRONG HERE, NOT THE TEST.** The expectation above ("the validation message surfaces") describes a message the product never emits. `dokan_paypal_marketplace_validate_cart_items` (`Helper.php:1349`) feeds `is_available()` only, so returning false there simply withdraws the gateway from checkout — silently. The only customer-facing messages the module produces come from `CartHandler::after_checkout_validation()`, a different hook, covered by PP-EDG-01. What the test asserts instead, and what the run should be read against: with the probe filter unarmed the gateway is offered; armed against a product that is **not** in the cart it is still offered (a blanket-false filter would already hide it, and the real assertion would then prove nothing about item selectivity); armed against the product that **is** in the cart the gateway is gone. The catalogued expectation is left above unedited so the divergence stays visible.
- **Preconditions:** A filter registered to reject a specific item.
- **Steps:** Add that item and load checkout.
- **Expected:** The validation message surfaces and checkout is blocked.

### - [x] PP-EDG-06 — Module deactivation removes the gateway entirely
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Module active and gateway ready.
- **Steps:** Deactivate the module, reload checkout and the settings screen, then reactivate.
- **Expected:** Gateway absent from both while deactivated, and restored afterwards.

### - [x] PP-EDG-07 — Disabling the gateway short-circuits its controllers
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Module active but gateway `enabled` set to no.
- **Steps:** Probe for the module's REST routes and cart hooks.
- **Expected:** Only gateway registration and the webhook remain; order manager, withdraw method,
  REST controller and cart handler are not loaded. This double-gating is deliberate.

### - [x] PP-EDG-08 — `needs_setup()` ignores both enabled state and currency validity
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Gateway disabled and currency unsupported.
- **Steps:** Read the setup-required signal.
- **Expected:** Record the real value. This method's indifference to both conditions is a trap for
  any spec that treats it as a readiness proxy.

### - [x] PP-EDG-09 — Guest cart with no items is rejected by the payment routes
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Empty cart.
- **Steps:** Call the create-payment route.
- **Expected:** Rejected with the module's empty-cart error code.

### - [x] PP-EDG-10 — Very large order total is transmitted without precision loss
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A high-value cart.
- **Steps:** Inspect the outgoing amount strings.
- **Expected:** Exact decimal representation with no float artefacts.

### - [x] PP-EDG-11 — Order with only shipping and no product value
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A zero-price product with a shipping charge.
- **Steps:** Build the order and inspect the unit breakdown.
- **Expected:** Breakdown reconciles; no zero-amount unit is rejected by the payload builder.

### - [x] PP-EDG-12 — Vendor deleted after capture does not break order display
- **Spec file:** `paypalMarketplaceEdge.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A captured order whose vendor is subsequently removed.
- **Steps:** Load the admin order screen.
- **Expected:** Renders without a fatal.

---

# PP-GST — Guest checkout

### - [x] PP-GST-01 — Guest can reach PayPal checkout
- **Spec file:** `paypalMarketplaceGuest.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Guest checkout enabled; connected vendor product in cart.
- **Steps:** As an anonymous visitor, load checkout.
- **Expected:** PayPal Marketplace is offered.

### - [x] PP-GST-02 — Guest order records the correct billing identity
- **Spec file:** `paypalMarketplaceGuest.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A completed guest order.
- **Steps:** Read the order's customer id and billing email.
- **Expected:** Customer id zero and the submitted billing email retained.

### - [x] PP-GST-03 — Guest-to-account creation preserves the order
- **Spec file:** `paypalMarketplaceGuest.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** Account creation enabled at checkout.
- **Steps:** Complete a guest order with account creation ticked.
- **Expected:** The order is associated with the new account.

### - [x] PP-GST-04 — Guest order tracking is reachable
- **Spec file:** `paypalMarketplaceGuest.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A completed guest order.
- **Steps:** Use the order-tracking form with the order key.
- **Expected:** Order status is shown.

### - [x] PP-GST-05 — What the cart create-payment route gives an anonymous caller
- **Spec file:** `paypalMarketplaceGuest.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** two controls added ahead of the subject, because without them a refusal proves nothing. `wp/v2/users/me` must answer `rest_not_logged_in` for the probe context (blanking `Authorization` removes HTTP Basic auth only — this also covers cookies), and `wc/store/v1/cart` must report a **non-empty** cart for that same anonymous session, or a `dokan_paypal_empty_cart` answer would be a transport bug reported as a security property. The route must answer neither `rest_no_route` nor `dokan_paypal_empty_cart`. The outcome branches are exhaustive and every branch pins product output: a refusal must carry a recognisable authorization code (an incidental failure answered as 403 must not be read as a permission check); a handler-threw answer must be the module's own `paypal_payment` envelope; and on every path except the one where the route reports having created the payment, the body must contain no `paypal_order_id`, `paypal_redirect_url` or `paypal.com/checkoutnow`. The case is gated on `is_enabled` rather than on credentials, because `check_cart_permission()` runs before `create_cart_payment()` but the route is not registered at all while the gateway is off.
- **Run note (2026-08-03, corrected — NOT re-executed):** an interim version of this case called `test.fail()` and asserted that the route must answer `401`/`403` or `dokan_paypal_cannot_pay_order`. That invariant was **wrong** and has been removed: guest checkout is a shipped feature (`woocommerce_enable_guest_checkout` is `yes`, and PP-GST-01 asserts a logged-out visitor IS offered the gateway), `check_cart_permission()` loads the cart deliberately (`REST/V1/PayPalController.php:81-96`), and a legitimate anonymous guest would still receive `200` after any nonce or throttle the module might add — so the case could never go green in any world, and a permanently-red case proves as little as a permanently-green one. **New expected result:** the case now PASSES against today's product and states the security properties that are actually true and worth guarding — the payment an anonymous caller obtains is bound to customer `0` (a guest, not any logged-in user id); it is bound to that caller's OWN session cart, its order total matching the total `wc/store/v1/cart` reports for the same session; and it leaks no other customer's order — the WooCommerce order id returned is newer than every order that existed before the call, the PayPal order id returned is the one recorded on that new order as `_dokan_paypal_order_id`, and any `token` in the approval URL is that same PayPal order id. The residual hardening finding (no nonce, no rate limit, so anonymous draft-order and live PayPal-order creation is unbounded) stays filed as `bugs/paypal-cart-create-payment-authorises-on-cart-alone.md`; this case does **not** guard it, because an abuse limit cannot be measured by one well-behaved request.
- **Preconditions:** A non-empty cart in an anonymous session.
- **Steps:** Call the create-payment route with no authentication and inspect the permission
  outcome.
- **Expected:** Record the real behaviour precisely. The module's cart-permission check appears to
  validate only that the cart is non-empty, with no identity assertion — reachable by any
  unauthenticated caller with a populated cart. This is a genuine security assertion needing no
  money, and it is absent from all 49 existing manual cases.

---

# PP-BLK — Block checkout and cart

### - [x] PP-BLK-01 — Gateway renders on block checkout
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A block-checkout page; gateway ready.
- **Steps:** Load it as a customer.
- **Expected:** PayPal Marketplace is offered.

### - [x] PP-BLK-02 — Gateway renders on the classic shortcode checkout
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A classic checkout page.
- **Steps:** Load it as a customer.
- **Expected:** PayPal Marketplace is offered. Both paths must be proven; they diverge in the code.

### - [x] PP-BLK-03 — Block and classic produce equivalent purchase units
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Identical carts on both paths.
- **Steps:** Compare the generated unit payloads.
- **Expected:** Equivalent amounts, payees and fees. Not covered by any existing manual case, and
  the block path is where DOK-017 and DOK-018 originated.

### - [x] PP-BLK-04 — Block multi-vendor order does not orphan sub orders
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A captured multi-vendor block order.
- **Steps:** Run the orphan-detection query.
- **Expected:** Live sub orders retain their capture ids. Orphans, if any, are warned rather than
  failed, per PP-DIS-14.

### - [x] PP-BLK-05 — Cart block renders without console errors
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A cart-block page with a connected vendor product.
- **Steps:** Load it while watching the console.
- **Expected:** No uncaught errors attributable to the module.

### - [x] PP-BLK-06 — Block checkout with an unconnected vendor hides the gateway
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Only an unconnected vendor's product in the cart.
- **Steps:** Load block checkout.
- **Expected:** Gateway absent, with the positive baseline proven in the same run.

### - [x] PP-BLK-07 — Block checkout store-API call succeeds without PHP notices
- **Spec file:** `paypalMarketplaceBlocks.spec.ts`
- **Type:** edge · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A block checkout attempt.
- **Steps:** Watch the store-API network call and the PHP debug log.
- **Expected:** No 500s, no PHP notices. Both are findings in their own right if present.

---

# PP-SEC — Security

The best money-free value in the build, and almost entirely uncovered by the existing corpus.

### - [x] PP-SEC-01 — Module REST routes reject unauthenticated callers
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Module active.
- **Steps:** Call each module REST route with `Authorization: ''` explicitly set.
- **Expected:** Rejected. The header must be explicitly blanked — the shared config injects admin
  Basic auth into every request context, and an omitted header silently inherits it. This exact
  trap has already produced a false pass in this suite once.

### - [x] PP-SEC-02 — Capture route is registered for logged-out callers
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Module active.
- **Steps:** Probe the no-privilege AJAX capture action as an anonymous caller and record what
  guards it.
- **Expected:** Document the real protection. The action appears to be registered for logged-out
  callers behind only a nonce that is minted for every checkout visitor, with an unvalidated order
  id in the payload. If that holds, it is a reportable finding, not a test to make pass.

### - [x] PP-SEC-03 — Capture route rejects an order id belonging to another shopper
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Two orders from different shoppers.
- **Steps:** As shopper A, invoke capture against shopper B's order id.
- **Expected:** Rejected. A success here is a direct IDOR on payment capture.

### - [x] PP-SEC-04 — Create-payment rejects a tampered amount
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the assertions no longer stop at WooCommerce state. Create-payment writes no total onto the order, so a handler that forwarded a client-supplied value straight into `purchase_units[*].amount.value` would have satisfied every earlier assertion. The case now buys one product from EACH vendor (a single-vendor cart never reaches `create_sub_order()`), posts a body carrying `amount`, `total`, `order_total`, `currency` and a whole forged `purchase_units[]` all set to `0.01`, and then reads the order back **from PayPal** via `_dokan_paypal_order_id`. New expected result: the request is not refused by `check_order_permission` and not `rest_no_route`; the parent total is unchanged; exactly 2 sub orders exist and their totals sum to the parent total; the response does not echo `0.01`; PayPal holds exactly **2 purchase units**, **none** valued `0.01`, summing to the server-computed parent total (`Order/OrderManager.php:171`).
- **Preconditions:** A cart with a known total.
- **Steps:** Submit a create-payment request with a reduced amount.
- **Expected:** The server-computed total is used, not the submitted one.

### - [x] PP-SEC-05 — Create-payment rejects a tampered payee merchant id
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the case now asserts who PayPal was actually told to pay, and guards the assertion that proves it. New expected result: `PAYPAL_MARKETPLACE_VENDOR1_MERCHANT_ID` and `PAYPAL_MARKETPLACE_VENDOR2_MERCHANT_ID` must be **distinct** — with one merchant id shared by both suite vendors, a build that routed both purchase units to a single vendor would still satisfy the payee-set assertion and the payee resolution would not be under test at all. Then: a two-vendor order, a body forging `payee`, `merchant_id`, `payee_merchant_id`, `seller_id`, `vendor_id` and `purchase_units[].payee`; the forged id must not come back in the response; exactly 2 sub orders, assigned to the two real vendors; each sub order's own merchant-id meta non-empty and not the forged one; and — read back **from PayPal** — exactly 2 purchase units whose `payee.merchant_id` values are the two real vendor merchant ids (`Order/OrderManager.php:153-155, 203-205`).
- **Preconditions:** A cart with a connected vendor.
- **Steps:** Submit a create-payment request specifying a different payee.
- **Expected:** The vendor's own merchant id is used. Accepting a client-supplied payee would let a
  caller redirect a marketplace payment.

### - [x] PP-SEC-06 — Vendor cannot read another vendor's merchant id via REST
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Two connected vendors.
- **Steps:** As vendor2, request vendor1's PayPal settings through every module route.
- **Expected:** Rejected or redacted.

### - [x] PP-SEC-07 — Vendor cannot write another vendor's merchant id
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Two connected vendors.
- **Steps:** As vendor2, attempt to overwrite vendor1's merchant meta.
- **Expected:** Rejected; vendor1's value unchanged.

### - [x] PP-SEC-08 — Customer cannot reach vendor payment settings
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A customer account.
- **Steps:** Request the vendor payment settings endpoints.
- **Expected:** Rejected on capability.

### - [x] PP-SEC-09 — Connect action enforces its nonce
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** An authenticated vendor.
- **Steps:** POST the connect action without a valid nonce.
- **Expected:** Rejected.

### - [x] PP-SEC-10 — Disconnect action enforces its nonce and capability
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** two fake-green shapes removed. (1) Harvesting vendor1's real nonce-bearing Disconnect anchor used to sit behind `if (!url) log.skip()`, so a template change, a selector drift or a 10s timeout silently deleted the cross-user replay while the case still reported PASSED; the harvest is now a mandatory `expect()` on the `href` (`templates/vendor-settings-payment.php:6-8`). (2) A positive control was added, deliberately LAST so it cannot disturb the negatives: vendor1 drives their **own** nonce-bearing disconnect URL under their **own** session and must end up **disconnected**. Without it every assertion in the case reads "vendor1 is still connected", which a `deauthorize_vendor()` that was unhooked, renamed or deleted outright satisfies. New expected result: vendor1 survives a nonce-less call, a forged nonce and vendor2 replaying vendor1's own URL, disconnects only when vendor1 drives it themselves, and is re-seeded to connected afterwards.
- **Preconditions:** A connected vendor and a second account.
- **Steps:** Attempt disconnect without a nonce, and as a different user.
- **Expected:** Both rejected; the vendor stays connected.

### - [x] PP-SEC-11 — Client secret never reaches the frontend
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway configured with a known secret.
- **Steps:** Load checkout, the cart, the vendor dashboard and the store page, and search all
  rendered HTML and all script payloads for the secret.
- **Expected:** Absent everywhere. A leaked secret is a critical finding.

### - [x] PP-SEC-12 — Client secret is not returned by any REST response
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway configured.
- **Steps:** Read every reachable settings-bearing REST response as admin, vendor and anonymous.
- **Expected:** The secret is absent or masked in all of them.

### - [x] PP-SEC-13 — Settings screen masks the stored secret
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A stored secret.
- **Steps:** Load the settings screen and read the field's rendered value.
- **Expected:** Record the real behaviour — masked, or present in the DOM. If present, that is a
  finding to report rather than a test to weaken.

### - [x] PP-SEC-14 — Webhook endpoint is not a state-mutation oracle for anonymous callers
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** A captured order.
- **Steps:** As an anonymous caller, POST a forged refund event for that order without signature
  headers.
- **Expected:** No refund row is created and no balance moves.
### - [x] PP-SEC-15 — A connect-success callback with NO nonce must not overwrite the vendor merchant id
- **Spec file:** `paypalMarketplaceSecurity.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-failing-product-bug
- **Run note (run 4, 2026-07-31):** **DOK-029 (CRITICAL)** — live-reproduced: the vendor's stored merchant id was overwritten without a valid nonce (detail in the private security tracker). Fails by design; goes green when the product verifies the nonce unconditionally.
- **Bug:** DOK-029
- **Preconditions:** vendor1 connected, so `_dokan_paypal_test_merchant_id` holds a real value.
- **Steps:**
  1. Record the vendor's stored merchant id.
  2. As the logged-in vendor, GET the vendor payment-settings URL with
     `action=dokan-paypal-marketplace-connect-success&status=success&merchantIdInPayPal=<hostile>`
     and **no `_wpnonce` parameter at all**.
  3. Re-read the stored merchant id, then restore it whatever the outcome.
- **Expected:** The merchant id is unchanged. A state-changing request with no nonce must be
  rejected exactly as one with a wrong nonce is.
- **Why this case exists — added 2026-07-31, and the reason matters more than the case.** PP-SEC-09
  and PP-SEC-10 already existed, both PASSED, and both missed DOK-029. Each sends a *forged* nonce,
  which reaches `wp_verify_nonce()` and is correctly rejected. But all three guards in
  `authorize_paypal_marketplace()` read
  `<guard shape withheld>`
  (source coordinates withheld), so the absent-nonce case makes the condition
  false and skips validation entirely. The defect lives in the `isset()` that guards the branch, and
  a test that always supplies a nonce can never reach it.
  **General rule this establishes for the whole suite: a nonce-enforcement case needs THREE inputs —
  valid, invalid, and absent.** Two of the three is what a passing security case looked like here.
- **Note:** written to assert the correct behaviour, so it fails against dokan-pro 5.0.9. That
  failure is the live reproduction DOK-029 records as owed. It goes green when the product verifies
  unconditionally; do not soften it. The test restores the merchant id in a `finally` so a real
  failure cannot corrupt the fixture for later cases.



---

# PP-XSS — Stored cross-site scripting

### - [x] PP-XSS-01 — Payload in the gateway description does not execute at checkout
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Store a script payload in the description setting and load checkout as a customer.
- **Expected:** Rendered inert. The payment-fields renderer prints the description option, so this
  is the module's most direct stored-XSS surface.

### - [x] PP-XSS-02 — Payload in the gateway title does not execute at checkout
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-passing
- **Preconditions:** Gateway ready.
- **Steps:** Store a payload in the title and load checkout.
- **Expected:** Rendered inert.

### - [x] PP-XSS-03 — Payload in the gateway title does not execute in admin
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** A stored payload.
- **Steps:** Load the WooCommerce payments list and the gateway settings screen.
- **Expected:** Rendered inert in both.

### - [x] PP-XSS-04 — Payload in a vendor store name is escaped in the outgoing payload
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the store name has no path into the outgoing PayPal payload, so the case now plants the payload where a vendor-controlled string genuinely travels — the product name, which `OrderManager::get_product_items()` copies verbatim into `purchase_units[*].items[*]` (`Order/OrderManager.php:371-380`) — and reads the purchase unit back **from PayPal**, the only place the catalogued claim is measurable. New expected result: `Helper::is_ready()` true and `button_type` smart (both preconditions of the surface being inspected); the payload marker survives into the stored product name; the PayPal SDK script tag is present and carries vendor1's merchant id; **every** attribute of that rebuilt tag — not just `data-merchant-id`, whose strict-equality check already made a marker search unfailable — is free of `<` and of the marker; the localised `dokan_paypal` object exists and is free of the marker; nothing executed; the order carries a `_dokan_paypal_order_id` (absent means PayPal REJECTED the create-order, which is the defect, not a clean escape); and the purchase units PayPal holds carry no unescaped payload.
- **Preconditions:** A vendor whose store name contains a payload.
- **Steps:** Build a purchase unit for that vendor and inspect the serialised payload.
- **Expected:** Escaped or stripped; the payload never reaches PayPal unescaped.

### - [x] PP-XSS-05 — Payload in a vendor PayPal email is escaped on the settings screen
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Run note (run 4, 2026-07-31):** Was a FALSE RED on 2026-07-31: the check read `inputValue()` (the browser-decoded DOM property), so correctly-escaped `value="&lt;script&gt;"` read back as `<script>`. Now reads `outerHTML`. The product escapes correctly.
- **Preconditions:** A vendor with a payload stored in the email field.
- **Steps:** Load the vendor payment settings page.
- **Expected:** Rendered inert.

### - [x] PP-XSS-06 — Payload in the notice interval or logo setting is escaped
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** negative · **Priority:** P2
- **Status:** written-passing
- **Run note (2026-08-03, strengthened — NOT re-executed):** the interval payload now carries a **negative** numeric prefix (`-9<payload>`), and that is load-bearing rather than decorative: `absint()` and the `(int)` cast the `/status` route transports the value through agree on every non-negative input, so a letters-first payload resolves to 0 either way and `toBe(0)` could not tell "`absint()` ran" from "the raw option was cast" — an assertion incapable of failing. New expected result: `Helper::non_connected_sellers_display_notice_intervals()` must resolve the hostile value to **`9`** (`Helper.php:833-838`); a negative interval is also the hostile value `absint()` exists to stop, since it is multiplied by `DAY_IN_SECONDS` and handed to `set_transient()` (`RegisterWithdrawMethods.php:473`) where a negative expiry recreates the connect announcement on every dashboard load. `Helper::get_marketplace_logo()` must resolve non-null and free of `<script`, of inline `on…=` handlers and of `javascript:` (`Helper.php:791-796`) — that value is serialised into `create_partner_referral()`'s `partner_logo_url` (`Utilities/Processor.php:89`). The connect notice must be **visible** on the vendor dashboard (containment surface proven live before absence is asserted) with nothing executed and the marker absent.
- **Preconditions:** Payloads stored in both settings.
- **Steps:** Load the vendor dashboard where the notice renders.
- **Expected:** Rendered inert.

### - [x] PP-XSS-07 — Payload survives a settings round-trip without mutating other keys
- **Spec file:** `paypalMarketplaceXss.spec.ts`
- **Type:** edge · **Priority:** P2
- **Status:** written-passing
- **Preconditions:** A stored payload.
- **Steps:** Save the settings form and re-read the whole option.
- **Expected:** Sibling keys are unchanged; no serialisation corruption.

---

# PP-3DS — 3D Secure gating

Reduced to rendering and gating assertions. A completed 3DS challenge is unreachable: it rides the
UCC hosted-fields path, which requires the smart button type, UCC mode enabled, a store country in
the seven UCC countries, a mode-appropriate currency, and PayPal-side `PPCP_CUSTOM` vetting for
every seller in the cart. That last condition is not seedable.

### - [x] PP-3DS-01 — UCC card fields are absent when UCC mode is off
- **Spec file:** `paypalMarketplace3ds.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** Gateway ready, `ucc_mode` off.
- **Steps:** Load checkout and look for hosted card fields.
- **Expected:** Absent.

### - [x] PP-3DS-02 — UCC card fields are absent for a non-UCC store country
- **Spec file:** `paypalMarketplace3ds.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** `ucc_mode` on, store country outside the seven UCC countries.
- **Steps:** Load checkout, then restore the country.
- **Expected:** Absent.

### - [x] PP-3DS-03 — UCC card fields are absent with the standard button type
- **Spec file:** `paypalMarketplace3ds.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-passing
- **Preconditions:** `ucc_mode` on, `button_type` standard.
- **Steps:** Load checkout.
- **Expected:** Absent — the hosted-fields SDK component is only requested on the smart path.

### - [x] PP-3DS-04 — Completing a 3DS challenge is not automatable
- **Spec file:** `paypalMarketplace3ds.spec.ts`
- **Type:** happy · **Priority:** P2
- **Status:** not-automatable
- **Run note (run 4, 2026-07-31):** Completed 3DS challenge is unreachable: UCC hosted fields sit behind five simultaneous gates including PayPal-side PPCP_CUSTOM vetting.
- **Preconditions:** All five UCC gates satisfied, including PayPal-side vetting.
- **Steps:** n/a
- **Expected:** n/a
- **Why not automatable:** the final gate requires PayPal to have reported the `PPCP_CUSTOM`
  capability as subscribed for every seller in the cart, which is granted by PayPal's own merchant
  vetting and cannot be seeded locally. Recorded here rather than silently omitted.


---

# PP-UCC — Unbranded Advanced Card (the card path)

Added 2026-08-03. Every money case elsewhere in this suite drives a PayPal-HOSTED buyer login; on
2026-08-03 roughly fifty of those logins locked the sandbox buyer out ("It looks like you have tried
too many times"), each attempt cost up to 4.5 minutes, the 1h `globalTimeout` was exhausted and 163
tests never ran. PayPal publishes no API that approves a wallet order on the buyer's behalf, so the
wallet path cannot avoid that login.

The Advanced Card (unbranded credit card, "UCC") path can: the buyer types a card into hosted fields
served into our own checkout page, and PayPal never renders a login screen. Both suite vendors report
`PPCP_CUSTOM` as subscribed, so the capability exists on this sandbox.

**This area AUGMENTS the wallet coverage; it does not replace it.** Everything downstream of
`OrderController::handle_capture_payment_validation()` — the capture ids, the processing fee, the
platform fee, the vendor balance, the disbursement mode, refund eligibility — is produced by code
that never learns how the buyer approved, so a card-obtained captured order is a legitimate fixture
for those facts. It proves NOTHING about PP-CHK-06, PP-CHK-07, PP-CHK-08, PP-CHK-12 or PP-CHK-15,
whose subject is the wallet approval mechanics themselves (redirect to PayPal, cancel-and-return,
post-approval return, lost session). Those five stay blocked on a PayPal-hosted buyer login and must
never be relabelled as covered because a case in this area passed.

Two environment blocks are declared rather than assumed. PayPal-side eligibility
(`paypal.HostedFields.isEligible()`, which needs the `PPCP_CUSTOM` capability plus a usable
`data-client-token`) is not seedable from this suite, so an ineligible SDK is a declared skip. And
the module hardcodes `hf.submit({ contingencies: ['3D_SECURE'] })`
(`assets/src/js/paypal-checkout.js:409-414`) — PayPal documents `3D_SECURE` as the deprecated synonym
of `SCA_ALWAYS`, i.e. authentication on every transaction — so a 3DS challenge drawn into
`#payments-sdk__contingency-lightbox` is reported as a named skip instead of a timeout. PayPal also
states that 3DS applies only in PSD2-mandate countries and this store's base country is US, which may
make the contingency a no-op here; that is plausible, unverified, and not relied on.

The card number is supplied through the `PAYPAL_UCC_TEST_CARD` environment variable and is never
hardcoded. Sandbox PANs are published and are not secrets — the reason for the env var is that no
number could be confirmed from source alone to complete a purchase without a 3DS step-up on this
account. The published candidate is Visa `4868719196829038` (Mastercard `5329879707824603`, PayPal's
3DS "Test Case 1", frictionless success); explicitly not `4868719166101368` / `5329879735316929`,
which require a challenge. Optional companions: `PAYPAL_UCC_TEST_CARD_CVV` (default `123`),
`PAYPAL_UCC_TEST_CARD_EXPIRY` (default computed three years out, never a literal that can expire) and
`PAYPAL_UCC_TEST_CARD_HOLDER` (default `Dokan QA` — never a `CCREJECT-*` value, since PayPal reads
its decline triggers out of the cardholder-name field).

Gate handling: `beforeAll` captures the real baseline from the `/ucc-gate` and `/ucc-state` harness
routes (an empty patch writes nothing and still reports `previous`, where `null` means the key was
ABSENT), and `afterEach` and `afterAll` restore exactly those values. No `"no"` / `"smart"` literal is
ever written back — `button_type` is the sibling-breaker, because UCC needs `smart` while
`placeClassicOrder()` in `paypalMarketplaceCheckout.spec.ts` needs `standard`, and PP-SET-19
re-asserts the baseline in a different file.

### - [x] PP-UCC-01 — The card form is offered, and its hosted fields mount, when the product's own gate resolves true
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Gateway ready; `button_type` smart; `ucc_mode` yes; base country and currency in
  the product's own UCC lists; vendor1 connected and carrying the gate-5 meta; vendor1 product in the
  cart.
- **Steps:** Open the four store-level gates and vendor1's meta through the harness routes, read the
  resolved gate back over `/ucc-state`, then load the classic checkout, select PayPal Marketplace and
  read both the server-rendered markup and the browser-side SDK state.
- **Expected:** `Helper::is_ucc_enabled()` resolves **true** as the product reports it (not as this
  file recomputes it), `Helper::get_button_type()` resolves `smart`, `Helper::is_ucc_mode_allowed()`
  is true and vendor1's gate-5 meta reads enabled. On the page: all four card inputs
  (`#dpm_card_number`, `#dpm_card_expiry`, `#dpm_cvv`, `#dpm_name_on_card`) render, the 3DS lightbox
  container renders, `#pay_unbranded_order` renders, the SDK url carries `components=hosted-fields`,
  `dokan_paypal.is_ucc_enabled` is `"1"`, `script#dokan_paypal_sdk-js` carries a **non-empty
  `data-client-token`**, and all three cross-origin braintree hosted-field iframes mount with exactly
  one typeable input each.
- **Note:** The browser half is what is new. `paypalMarketplace3ds.spec.ts` proves the server-rendered
  template appears; nothing until now proved a client token was minted or that a field ever mounted.
  A missing `data-client-token` is a FAILURE (`CartHandler::add_bn_code_to_script()` drops the
  attribute silently on a `WP_Error`, logging only to the Dokan log, which renders identically to a
  gating bug for the customer). `isEligible() === false` is a declared SKIP, because PayPal-side
  vetting is not seedable and a red there would make the run report lie about the product.

### - [x] PP-UCC-02 — The card form is withdrawn when one seller in the cart lacks the UCC meta
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** negative · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** Both suite vendors connected and both carrying the gate-5 meta; a two-vendor
  cart.
- **Steps:** Prove the card surface renders for the two-vendor cart with both sellers flagged
  (positive control), then clear **vendor2's** meta only, re-read `/ucc-state`, and load the same
  two-vendor checkout again.
- **Expected:** With one seller unflagged the entire card surface is gone — every marker from
  `templates/3DS-payment-option.php`, the unbranded Pay button, the `data-client-token` and the
  `components=hosted-fields` request — while the PayPal Marketplace radio is **still offered** and
  `dokan_paypal.is_ucc_enabled` is falsy. Decisively, `Helper::is_ucc_enabled()` must remain **true**:
  it never looks at the cart, so its staying true is what attributes the disappearance to
  `CartManager::is_ucc_enabled_for_all_seller_in_cart()` (`Cart/CartManager.php:48-62`) and to nothing
  else.
- **Note:** The only case in the suite that isolates the per-seller half of the gate. PP-3DS-01…03
  close the store-level gates and never touch gate 5. Vendor2's meta is restored in a `finally` as
  well as in `afterEach`, because the capture cases that follow in the same file need it back.

### - [x] PP-UCC-03 — A card payment captures, with no PayPal-hosted page visited
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** All five UCC gates open for both vendors; `PAYPAL_UCC_TEST_CARD` set; both
  merchant ids verified payable over PayPal's API; a two-vendor cart.
- **Steps:** Select PayPal at the classic checkout, mount the hosted fields, type the card, click
  `#pay_unbranded_order`, and read BOTH round trips — `?wc-ajax=checkout` (the `createOrder` callback
  running WooCommerce's own checkout) and
  `admin-ajax.php?action=dokan_paypal_capture_payment`.
- **Expected:** The checkout POST answers `result=success` with an order id and a `paypal_order_id`;
  the capture AJAX answers `wp_send_json_success`; the buyer lands on the order-received page; the
  parent order reaches `processing` or `completed`; and the parent carries `_dokan_paypal_order_id`
  equal to the PayPal order id, `_paypal_payment_success = yes`,
  `_dokan_paypal_payment_charge_captured = yes` and a non-empty
  `_dokan_paypal_capture_payment_debug_id`. **No main-frame navigation to any `paypal.com` host may
  occur at any point.**
- **Note:** The no-PayPal-page assertion is the point of the whole area — if this run ever visits a
  PayPal-hosted page it has driven a buyer login after all, which is the cost that exhausted the
  2026-08-03 run. A `wp_send_json_error` is quoted verbatim in the failure message: it carries
  PayPal's own reason and is the only explanation of why the customer was not charged.

### - [x] PP-UCC-04 — A captured card order carries the same commission and fee facts as a wallet capture
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** happy · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** The captured two-vendor card order from PP-UCC-03 (built once and shared).
- **Steps:** Read each sub order's PayPal metas and its `wp_dokan_orders` row.
- **Expected:** The order split into one sub order per vendor; per sub order
  `_dokan_paypal_payment_platform_fee` is **present** and equals that sub order's admin commission
  (`order_total - net_amount`) within a cent, `_dokan_paypal_payment_processing_fee` is **present**
  and numeric, `_dokan_paypal_payment_processing_currency` is recorded, `dokan_gateway_fee_paid_by`
  is `seller`, and `_dokan_paypal_payment_disbursement_mode` equals the gateway's configured mode;
  the parent carries a non-empty `_dokan_paypal_payment_withdraw_data`.
- **Presence is asserted separately from value, on purpose:** `Number('')` is `0`, which is finite
  and `>= 0` and is within a cent of a zero commission. Reading either fee straight through `Number()`
  therefore lets an **absent** meta row satisfy the numeric and comparison checks — the processing-fee
  check was green against a deleted `OrderManager.php:550` write until this was split in two.
- **Note:** Deliberately different from PP-SPL-04. That case asserts the platform fee Dokan **asked**
  PayPal for, read from PayPal's copy of the order before any capture; this one asserts the fee PayPal
  actually **withheld**, read from `seller_receivable.platform_fees[0].amount.value` after settlement
  (`OrderManager.php:552`). The disbursement mode is stamped per sub order at order-creation time
  (`PaymentMethods/PayPal.php:273`), i.e. before the buyer touches the card, which is why the card
  path exercises it exactly as the wallet path does.

### - [x] PP-UCC-05 — A multi-vendor card capture writes a capture id to every sub order
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** edge · **Priority:** P0
- **Status:** written-never-executed
- **Preconditions:** The captured two-vendor card order from PP-UCC-03.
- **Steps:** Read `_dokan_paypal_payment_capture_id` on each sub order and
  `_dokan_paypal_capture_data_by_vendor` on the parent.
- **Expected:** Every sub order carries its own non-empty capture id, the ids are **distinct** from
  each other, and the parent's vendor-keyed mirror reads back as an **object/array** (not a scalar)
  holding an entry for both seller ids.
- **Why the shape is asserted before the keys:** `Object.keys()` on a string returns `'0'`, `'1'`,
  `'2'`, … so a still-serialised `_dokan_paypal_capture_data_by_vendor` would satisfy a
  `toContain('3')` / `toContain('5')` check against character indices on any six-character string —
  a pass that survives the capture data never having been mirrored at all.
- **Note:** The DOK-018 regression surface, exercised through the card path. Not cosmetic: an
  automatic refund is issued against the capture id, so a sub order without one can never be refunded
  through the product at all. Two sub orders sharing an id would refund one vendor out of the other
  vendor's money — which is why identity between the ids is asserted, not just presence. The parent
  mirror is the only thing `restore_capture_payment_data()` can re-apply after a block-checkout
  re-split.

### - [x] PP-UCC-06 — The unbranded Pay button is gated on hosted-field validity
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** negative · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** All five UCC gates open for vendor1; `PAYPAL_UCC_TEST_CARD` set; a single-vendor
  cart. No money moves in this case.
- **Steps:** Mount the hosted fields, type an INCOMPLETE card number with a valid expiry, CVV and
  cardholder name, then complete the number.
- **Expected:** `#pay_unbranded_order` is **disabled** while the number is incomplete and **enabled**
  once every field reports valid, and **no `?wc-ajax=checkout` request is made at any point** — typing
  must never create an order.
- **Note:** Both halves are needed: the disabled half alone would pass identically against a
  permanently dead button. The no-order half is the load-bearing one — an order created here would be
  an unpayable order attached to a card PayPal never accepted, left behind on every abandoned
  checkout. Related product observation, recorded and not fixed: the UCC path calls
  `capture_payment()` **without** the SDK's `actions` object, so the `INSTRUMENT_DECLINED` branch at
  `paypal-checkout.js` would call `.restart()` on boolean `false`; that branch is only reachable from
  the wallet path today.

### - [x] PP-UCC-07 — The SDK tag carries the client token and every seller's merchant id for a split cart
- **Spec file:** `paypalMarketplaceUcc.spec.ts`
- **Type:** happy · **Priority:** P1
- **Status:** written-never-executed
- **Preconditions:** All five UCC gates open for both vendors; a two-vendor cart. No money moves in
  this case.
- **Steps:** Load the classic checkout for the two-vendor cart, select PayPal, and read the attributes
  of `script#dokan_paypal_sdk-js`.
- **Expected:** Exactly one SDK tag; its `src` carries both `components=hosted-fields` and
  `merchant-id=*` (`Cart/CartHandler.php:203-208`, the multi-merchant wildcard); `data-merchant-id`
  lists **both** vendors' merchant ids; `data-client-token` is non-empty; and
  `data-partner-attribution-id` (Dokan's BN code) is present.
- **Note:** Without the wildcard and both merchant ids the card would tokenise for one vendor only and
  the other vendor's purchase unit would be unpayable; without the client token no field mounts at
  all. The client-token half is UCC-only — the wallet path never requests one — which is what makes
  this case unreachable from the existing coverage.
