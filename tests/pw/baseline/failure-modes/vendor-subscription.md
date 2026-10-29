# Failure modes: Vendor subscription (P0, risk 25)

Pro module `modules/subscription`. React surfaces:
- Vendor: `/dashboard/new/#/subscription` (Current Subscription + Subscription Packages cards, Subscription Orders tab) and `#/subscription/orders`.
- Admin: pack assignment in the React vendor editor (`src/admin/components/VendorEdit.tsx`).

Since 5.2.0 the whole feature (REST routes, React screens, product limits) only loads when `dokan_product_subscription.enable_pricing` is on. Turning it on also stops every vendor without a pack from publishing, so the suite runs this surface in `react_global`, with a fresh vendor per test.

Paths are relative to `tests/pw/tests/`. Every test is in `react/vendor-subscription/vendorSubscription.global.spec.ts`.

| # | Failure mode | Role | Layer | Assertion | Verdict |
|---|---|---|---|---|---|
| S1 | Vendor publishes more products than the pack allows | vendor | API | #S1 (the 2nd product on a 1-product pack is not `publish`; Dokan saves it as draft) | caught |
| S2 | Vendor without a pack publishes while subscriptions are enforced | vendor | API | #S2 | caught |
| S3 | Current Subscription shows the wrong pack, limit or expiry | vendor | UI + REST | #S3 (title, "You can add N product", end date equals REST) | caught |
| S4 | Packages list the wrong price, or don't mark the vendor's pack | vendor | UI | #S4 (price digits, "Your Pack") | caught |
| S5 | Vendor cancel does not cancel | vendor | UI + REST | #S5 (`has_active_cancelled_sub` true, pack kept until the end date) | caught |
| S6 | Subscription orders miss the vendor's pack order or show the wrong total | vendor | UI | #S6 (purchased pack: order id and total incl. tax) | caught |
| S7 | Vendor reads another vendor's subscription | vendor | API | #S7 | caught |
| S8 | Customer reaches subscription data or screens | customer | API + UI | #S8 (REST 403, vendor SPA not mounted) | caught |
| S9 | Subscription Orders deep link never loads | vendor | UI | #S9 `test.fail`: **product bug**, FINDINGS #2 | bug pinned |
| S10 | Subscription page requests fail for vendors with a pack | vendor | UI | #S10 `test.fail`: **product bug**, FINDINGS #3 | bug pinned |
| S11 | Vendor without a pack gets no clear state or way to buy | vendor | UI | #S11 | caught |
| S12 | Admin assigns a pack in the React vendor editor and it doesn't apply | admin | UI + REST | seeded through the same REST call (`assignPack`); the editor UI itself is untested | **GAP** |
| S13 | Pack expiry doesn't move products to `product_status_after_end` | system | API | none (needs the expiry cron run against a past end date) | **GAP** |
| S14 | Pack commission doesn't apply to the vendor's orders | admin/vendor | API | none | **GAP** |
| S15 | Recurring pack billing and trial behaviour | vendor | API | none (needs a payment gateway) | **GAP** |
| S16 | Allowed-categories restriction on a pack | vendor | API | none | **GAP** |

## Open (in order)

1. S13 expiry: set `product_pack_enddate` in the past, run the expiry hook, then assert the vendor's products have the configured status.
2. S14 commission: give the pack a commission, place an order on the vendor's product, and check earning against the pack's commission.
3. S12 admin editor UI. S16 categories. S15 needs a gateway, so it may stay out of scope.
