# Parity: vendor-subscriptions

| Legacy test | Title | Verdict |
|---|---|---|
| vendor-subscriptions/newSubscription.spec.ts:95 | vendor can open the Subscription page mounted at #/subscription (React) | REWRITTEN react/vendor-subscription/vendorSubscription.global.spec.ts #S3 (legacy ran with the feature disabled since 5.2.0; asserted only that cards render) |
| vendor-subscriptions/newSubscription.spec.ts:102 | a vendor with no pack sees the empty Current Subscription state (React) | REWRITTEN react/vendor-subscription/vendorSubscription.global.spec.ts #S11 (exact empty copy + Buy Now; legacy accepted "empty OR cards") |
| vendor-subscriptions/newSubscription.spec.ts:111 | the Subscription Packages card lists an admin-seeded pack (React) | REWRITTEN react/vendor-subscription/vendorSubscription.global.spec.ts #S4 (price + Your Pack; legacy skipped when its seeder failed) |
| vendor-subscriptions/newSubscription.spec.ts:117 | vendor can open the Subscription Orders list at #/subscription/orders (React) | REWRITTEN react/vendor-subscription/vendorSubscription.global.spec.ts #S6 (order id + total via the tab) and #S9 (deep link is broken: legacy passed on skeleton column headers) |
| vendor-subscriptions/newSubscription.spec.ts:124 | HashRouter survives a reload on /subscription (React) | DROPPED low risk; deep-link correctness owned by react/vendor-subscription/vendorSubscription.global.spec.ts #S9 |
| vendor-subscriptions/newSubscription.spec.ts:144 | a logged-in customer cannot mount the vendor Subscription route (React) | PORTED react/vendor-subscription/vendorSubscription.global.spec.ts #S8 (UI, plus REST 403; no fixed 2s wait) |
