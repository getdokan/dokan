# Stripe Connect — E2E Coverage Map

Coverage of the Dokan Pro **Stripe Connect** gateway (`dokan-stripe-connect`, branch `feat/stripe-connect-revemp`) across the Playwright suite under `tests/e2e/stripe-connect/`. Run with `DOKAN_PRO=true NO_SETUP=true npx playwright test --project=e2e_tests tests/e2e/stripe-connect/<file> --workers=1` (single worker — shared backend/DB/Stripe test account). Every Stripe test self-skips when `TEST_*_STRIPE_CONNECT` keys are absent (`hasCredentials`); transfer-asserting tests also gate on `HAS_REAL_CONNECTED_ACCOUNTS`.

## Files

| File | Area | Tests |
|---|---|---|
| `stripeConnect.spec.ts` | Core: gateway setup, single- & multi-vendor checkout (block + classic), separate charges-and-transfers split, refunds, 3DS/SCA, + Vendor-Subscription P0/P1 | (pre-existing green suite) |
| `stripeConnectSavedCards.spec.ts` | Suite F — saved cards (My-Account → SetupIntent) | F1–F5 |
| `stripeConnectSettings.spec.ts` | Gateway settings-behaviour matrix | S1–S4 |
| `stripeConnectSecurity.spec.ts` | REST + webhook security / negative | N1–N4 |
| `stripeConnectCurrency.spec.ts` | Store-currency amount handling | M1–M3 |
| `stripeConnectVendorSubExtra.spec.ts` | Vendor-subscription remainder + admin list | VS1.3, VS8.1–8.4, VS4.2, VS7 |
| `stripeConnectEdgeAdvertisement.spec.ts` | Edge cases + Product Advertisement purchase | C5, I6, B3/R23, PADV |
| `helpers.ts`, `stripeConnectPage.ts` | Shared toolkit (constants, REST/Stripe helpers, page object) | — |

## Coverage vs the feature checklist

| Asked-for area | Covered by |
|---|---|
| Single-vendor payment (block + classic) | `stripeConnect.spec.ts` core; reused across S1/S2, M1, C5, N3 |
| Multi-vendor split (separate transfers) | `stripeConnect.spec.ts` core (transfer ledger, not `charge.transfer`) |
| Customer payments / happy paths | core + Currency M1 + Edge C5 |
| **Pay with saved cards** | **Suite F** (save via My-Account SetupIntent, list, off-session charge, set-default, delete→detach) |
| **All gateway settings** | **Suite S** (allow_non_connected on/off, gateway enabled off, almost-ready/no-client-id) |
| Negative / edge / security | **Suite N** (forged webhook, logged-out 403, amount-override, verify-intent IDOR) + Edge I6 (double-refund), B3/R23 (disconnect) |
| Store currency | **Suite M** (non-round USD; JPY/UGX zero-decimal — see R3 bug) |
| **Vendor subscription** | `stripeConnect.spec.ts` P0/P1 + **VendorSubExtra** (recurring live sub, reuse/one-per-cart/switch-guard/guest, trusted publish, admin list) |
| **Product advertisement purchase** | **Edge PADV** (vendor buys an ad slot via Stripe Connect → advertised) |

## Test-by-test status

**Suite F — saved cards** (buyer = customer): F1 save via My-Account → token stored + pm **attached** on Stripe · F2 listed at My-Account · F3 off-session charge with the saved token · F4 set-default → Stripe `invoice_settings.default_payment_method` · F5 delete → pm detached. ✅ green. `F-block-save` = `test.fixme` documenting the block-checkout save-card bug (below).

**Suite S — settings**: S1 non-connected vendor blocked when `allow_non_connected_sellers` off · S2 allowed when on (charge on platform, **no** vendor transfer) · S3 gateway disabled → method absent · S4 almost-ready (no client id) → vendor connect UI + withdraw method absent. ✅ green. (afterEach restores the working gateway config so S3/S4's global toggles can't poison other suites.)

**Suite N — security**: N1 forged/unsigned webhook → handled, no money moved · N2 logged-out POST rejected (403, nonce/CSRF) · N3 amount-override → server overwrites the tampered amount · N4 verify-intent IDOR → wrong/empty `order_key` → 400 `invalid_order`, correct key accepted (access gated by key secrecy, route is `public_permission` + nonce). ✅ green.

**Suite M — currency**: M1 non-round USD total settles, no amount mismatch ✅ · M2 (JPY) + M3 (UGX) = `test.fixme` documenting R3 (below).

**VendorSubExtra**: VS1.3 recurring pack → live Stripe subscription, first invoice paid · VS8.1 re-open checkout → exactly one subscription (no dup) · VS8.2 one pack per cart · VS8.3 one-active-subscription **guard** (adding a 2nd pack while subscribed is blocked) · VS8.4 guest add-to-cart → login bounce · VS4.2 subscribed vendor publishes a product · VS7 admin Subscriptions list shows the pack. ✅ green.

**Edge + advertisement**: C5 coupon re-mount → exactly one succeeded PaymentIntent on the discounted total · I6 double-refund → charge refunded once + transfer reversed once · B3/R23 local disconnect severs the vendor link but the Stripe account stays authorized (documented gap) · PADV vendor buys an ad slot via Stripe Connect → order received + product advertised. ✅ green.

## Bugs found (see `dokan-pro/tests/stripe-connect/bugs-found.md`)

1. **Block-checkout "save card" never attaches the pm** — token saved but `setup_future_usage:null` PI → post-confirm attach rejected + swallowed → dangling, off-session-unusable card. Guarded by `F-block-save` (`fixme`). Suite F therefore tests the **working** My-Account → SetupIntent path.
2. **R3 — zero-decimal currencies charged 100×** — `get_stripe_amount()` ×100s all currencies; JPY/UGX (zero-decimal) overcharge. Guarded by M2/M3 (`fixme`, assertions assert the correct amount).
3. (Pre-existing, documented earlier) 3DS-redirect/webhook orders un-refundable; SCA redirect-back; empty `dokan_gateway_fee` refund fatal; vendor-subscription PE "Could not initialize Stripe".

## Status

All six gap-filling suites are tsc-clean and pass individually (`--workers=1`): **25 passed + 3 documented `fixme`** across the new files. A final all-in-one confirmation run is the CI-representative pass. Deferred (documented): VS6 renewal/fail/delete webhooks (needs Stripe CLI), OS-native wallet purchases.
