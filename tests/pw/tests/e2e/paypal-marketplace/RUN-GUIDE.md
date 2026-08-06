# PayPal Marketplace suite — RUN GUIDE

Written 2026-08-01 for a manual run. Read §1 and §2 before the first money run; everything else is
reference.

---

## 1. What moves money, and what does not

| File | Cases | Moves real sandbox money? |
|---|---:|---|
| `paypalMarketplacePreflight.spec.ts` | 4 | No |
| `paypalMarketplaceSettings.spec.ts` | 25 | No — but every save makes a **live PayPal call** (`register_webhook()`) |
| `paypalMarketplaceSecurity.spec.ts` | 15 | No |
| `paypalMarketplaceWebhooks.spec.ts` | 25 | No — webhooks are injected, never delivered by PayPal |
| `paypalMarketplaceXss.spec.ts` | 7 | No |
| `paypalMarketplaceCurrency.spec.ts` | 10 | No — **changes store currency**, restores it after |
| `paypalMarketplaceEdge.spec.ts` | 12 | No |
| `paypalMarketplaceWithdraw.spec.ts` | 8 | No — **cancels vendor 1's pending withdraw request** (see §5) |
| `paypalMarketplaceBlocks.spec.ts` | 7 | No — creates PayPal *orders*, never captures |
| `paypalMarketplaceGuest.spec.ts` | 5 | No |
| `paypalMarketplaceSubscriptions.spec.ts` | 10 | No |
| `paypalMarketplace3ds.spec.ts` | 4 | No |
| **`paypalMarketplaceOnboarding.spec.ts`** | 18 | No captures, but makes **live partner-referral calls** |
| **`paypalMarketplaceCheckout.spec.ts`** | 15 | **YES — real captures** |
| **`paypalMarketplaceSplit.spec.ts`** | 12 | **YES — real captures** |
| **`paypalMarketplaceDisbursement.spec.ts`** | 14 | **YES — real captures + payouts** |
| **`paypalMarketplaceRefund.spec.ts`** | 14 | **YES — real captures + refunds** |

**Sandbox credentials only.** These are the only credentials in `.env`; there are no live keys and
none must ever be added.

---

## 2. Run it in stages, not all at once

### Stage 1 — money-free (safe, ~30 min, this is the one that has been run)

```bash
cd ~/Sites/dokanautomation/wp-content/plugins/dokan-lite/tests/pw
npx playwright test tests/e2e/paypal-marketplace/ --workers=1 --reporter=list \
  --grep-invert "PP-CHK|PP-SPL|PP-DIS|PP-REF|PP-ONB" > /tmp/pp-moneyfree.log 2>&1
```

**`--workers=1` is not optional.** At higher concurrency the withdraw spec's shared-state mutation
(§5) can make unrelated specs flaky, and money specs must never overlap.

### Stage 2 — money path (never run before)

```bash
npx playwright test tests/e2e/paypal-marketplace/paypalMarketplaceCheckout.spec.ts \
  --workers=1 --reporter=list > /tmp/pp-checkout.log 2>&1
```

Start with **Checkout alone.** It is the smallest file that proves a capture works at all. If it
cannot capture, the other three will fail the same way and running them adds nothing but noise and
sandbox transactions. Only once Checkout captures cleanly should you go on to Split → Disbursement →
Refund, one file at a time.

### Reconcile after every run

```bash
cd tests/e2e/paypal-marketplace
python3 reconcile.py /tmp/pp-moneyfree.log
```

**Do not read the Playwright summary line as coverage.** On 2026-07-31 it reported "94 passed" while
**46 of 68 cases never executed** — `test.describe.serial` had aborted whole groups, and a skipped
case counts as "not a failure". The reconciler exists because of that, and its
`implemented but NEVER EXECUTED` list is the number that matters.

---

## 3. Failures you should EXPECT — these are not your problem

Six cases cannot pass against dokan-pro 5.0.9. **Since 2026-08-04 none of them is a red**: the five
that guard filed product bugs are `test.fail` guards, and the environmental one is a declared skip.
The list reporter still prints ✘ for a `test.fail` case — Playwright scores it **passed**, and that
is correct. See §"Reading the report" traps 1–2.

| Case | Why it cannot pass | Bug | How it is declared |
|---|---|---|---|
| `PP-SEC-15` | Nonce-less GET overwrites the vendor merchant id | **DOK-029 — CRITICAL** | `test.fail` |
| `PP-CUR-06` | Zero-decimal breakdown does not sum to `amount.value` | DOK-030 | `test.fail` |
| `PP-CUR-10` | Purchase unit stamped with store currency, not the order's | DOK-031 | `test.fail` |
| `PP-WHK-09` | Redelivered event creates a second renewal order | DOK-025 | `test.fail` |
| `PP-WHK-22` | `status_header(400)` + `exit()` from inside a handler | DOK-028 | `test.fail` |
| `PP-WHK-18` | Handler reads the doubled meta key `product_order_idproduct_order_id` | DOK-024 | `test.fail` |
| `PP-SET-23` | **Environment** — PayPal refuses `http://localhost:9999` as a webhook URL | none | declared skip |

**Do not "fix" these tests.** If a `test.fail` case turns GREEN, Playwright reports *"expected to
fail, but passed"* and the run goes red — **that is the news**: the product was fixed, and the fix is
to delete the `test.fail()` marker (and, for DOK-029, the release gate in `HANDOFF.md`).

In every one of them `test.fail()` is called IMPERATIVELY, one line before the single assertion the
bug breaks, never as a modifier on the declaration. Everything above that line is a control and still
goes red on its own — a declaration-level `test.fail` would make the whole body expected-to-fail and
a broken fixture would look identical to the bug.

`PP-SET-23` reads PayPal's verbatim rejection out of the Dokan log (through the
`dokan-test-paypal/v1/log-tail` route) and skips **only** on `Not a valid webhook URL`. If the option
is empty for any other reason — including no log line at all — it still fails, because that is the
genuine defect the case exists to catch.

Expected clean result for Stage 1: **127 passed (6 of them ✘-printed `test.fail` guards), 0 failed,
5 gated skips, 1 not-automatable.**

---

## 4. Declared skips — not silent, each names what is missing

| Case | Blocked on |
|---|---|
| `PP-WHK-16` | A subscription that really exists on PayPal |
| `PP-WHK-25` | No settings save is reachable from the test transport |
| `PP-WDR-07`, `PP-WDR-08` | A cancellable PayPal-method withdrawal cannot be created through drivable surfaces |
| `PP-3DS-04` | Completed 3DS challenge unreachable (PPCP_CUSTOM vetting) |

---

## 5. Known hazards during a run

- **`paypalMarketplaceWithdraw.spec.ts` cancels vendor 1's pending withdraw request.** Unavoidable
  without a throwaway vendor (`WithdrawController.php:470` short-circuits on `has_pending_request()`).
  Harmless at `--workers=1`; at higher concurrency it can break `tests/e2e/withdraws/`.
- **`paypalMarketplaceCurrency.spec.ts` changes the store currency** and restores it in `afterAll`.
  If a run dies mid-file, **check the store currency before trusting later results.**
- **`paypalMarketplaceSettings.spec.ts` makes a live PayPal call on every save.** On a slow network
  the file is the slowest in the suite; that is expected, not a hang.
- **PP-SET-23 can never pass locally.** PayPal cannot resolve `localhost:9999`. It needs a tunnel
  (ngrok/cloudflared) or a public host. Do not weaken the assertion.

---

## 6. If a money run goes wrong

1. **Check the vendors are still payable** before blaming the tests:
   ```bash
   docker exec <tests-cli-container> wp user meta get 3 _dokan_paypal_test_merchant_id
   docker exec <tests-cli-container> wp user meta get 5 _dokan_paypal_test_merchant_id
   ```
   Expect `L8AL7C87WT6QS` and `JDGDC93KG8PE8`. **PP-SEC-15 deliberately overwrites vendor 3's id and
   restores it in a `finally`** — if a run is killed mid-case, that restore may not have happened.
2. **Read both logs.** PHP warnings go to `wp-data/debug.log`; WooCommerce/Dokan messages go to
   `wp-content/uploads/wc-logs/`. DOK-027 was only ever visible in the first; PP-SET-23's cause only
   in the second.
3. **Leftover orders** from a killed money run are safe to delete, but delete the **sub orders** too
   — orphaned `wp_dokan_orders` rows skew later balance assertions (see DOK-017).

---

## 7. Reporting back

For each failing case that is **not** in §3, capture:
- the case id and the full assertion message (they are written to name the consequence and the
  suspected `file:line`, so the message usually is the diagnosis)
- whether `debug.log` gained new PHP warnings during the run
- the order id, if the case created one

Anything in §3 needs no report unless it **passed**.

---

## 8. Standing rules

- **QA reports bugs; QA never fixes product code.** Nine bugs are filed as DOK-023…DOK-031 in
  `~/.claude/skills/dokan-qa/bugs/`. Next free id: **DOK-032**.
- **🔴 dokan-pro 5.0.9 is NO-GO** while DOK-029 (Critical) is open.
- **Nothing in this suite is committed.** Author `shohan0120 <shohan0120@gmail.com>`, no
  `Co-Authored-By` trailer, and no commit or push without explicit per-action approval.
- Every live-reproduced bug is at 1/1–3/3 against the **5–6× validation bar** — all are
  UNDER-VALIDATED, and all are cheap to re-run.
