# Commission — Test Cases & Edge Cases

Scope: admin commission settings (fixed, percentage, category-based,
combined fixed+percent) and product-specific commission overrides.

Conventions:
- **A** = admin
- "Global commission" = `Dokan → Settings → Selling Options → Commission`
- "Category commission" = `Dokan → Settings → Selling Options → Categorywise Commission` (Pro)
- "Product-specific commission" = per-product override on the product edit screen

---

## 1. Global commission settings

| #    | Title                                                          | Steps                                                                | Expected                                                                                  |
|------|----------------------------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 1.1  | Configure fixed commission (TC1, currently `test.skip`)         | Settings → set type=fixed, fee=5, save                              | Subsequent vendor sale: admin earns flat fee=5 + percentage=0                              |
| 1.2  | Configure category-based commission (TC2, currently `test.skip`) | Settings → choose category, type, fee → save                        | New product in that category honors the override                                          |
| 1.3  | Configure percentage commission                                  | type=percent, rate=10                                                | Vendor sale → admin keeps 10% of price                                                    |
| 1.4  | Configure combined fixed+percent                                 | fee=2, percent=10                                                     | Admin keeps `2 + price*0.1` per item                                                      |

## 2. Product-specific commission

| #    | Title                                                                  | Steps                                                                | Expected                                                                                  |
|------|------------------------------------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 2.1  | Admin creates a product with commission override (TC3)                  | Product edit → set commission override → save                         | Order calculation uses the override, not global                                            |

## 3. Edge cases

- **Negative commission:** should be blocked at form validation.
- **>100% commission rate:** UI should warn; server should accept (vendor will pay admin).
- **Tax-inclusive vs exclusive pricing** affecting commission base.
- **Subscription products:** recurring commission calculation parity with one-time orders.
- **Refund:** commission should be reversed proportionally.
- **Vendor-level override** (in Pro): per-vendor commission supersedes global; ensure product-level still wins.

## 4. Known issues / gaps

- TC1 + TC2 are currently `test.skip` due to a Pro PHP fatal in `CustomWithdrawMethod.php:289` when the settings-group hook fires. Re-enable when fixed.
- Category-commission UI uses an async dropdown — selectors must wait for it to populate.

## 5. Suggested follow-ups (not in this PR)

1. Re-enable TC1/TC2 once the upstream fatal is fixed.
2. End-to-end commission calculation test: place an order, verify admin earnings ledger row.
3. Refund proration test.
4. Subscription recurring-commission test.
