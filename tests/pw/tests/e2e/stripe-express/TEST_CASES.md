# Stripe Express — Test Cases & Edge Cases

Scope: the Dokan Pro Stripe Express payment module — module enable/disable
toggle, vendor express-dashboard onboarding link, and customer checkout
through Stripe Express.

Conventions:
- **A** = admin
- **V1, V2** = vendors
- **C1** = customer
- "Express dashboard button" = the vendor-side CTA that deep-links to Stripe Express onboarding

---

## 1. Module activation

| #    | Title                                                                  | Steps                                                                                | Expected                                                                                  |
|------|------------------------------------------------------------------------|--------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|
| 1.1  | Verify Stripe Express enabled (TC1, `test.skip`)                       | A → Modules → Stripe Express toggle on                                              | Module slider stays on after page reload                                                   |
| 1.2  | Enable Stripe Express + disable Stripe Connect (TC3)                    | A toggles in Modules                                                                 | Stripe Connect off; Stripe Express on. Settings page reflects                              |

## 2. Vendor onboarding

| #    | Title                                                                          | Steps                                                                                          | Expected                                                                                    |
|------|--------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 2.1  | Visit Express Dashboard button visible for V1 (TC4)                            | V1 → Settings → Payment                                                                         | "Visit Express Dashboard" CTA visible (deep links to Stripe onboarding)                    |
| 2.2  | Visit Express Dashboard button visible for V2 (TC5)                            | V2 → Settings → Payment                                                                         | Same                                                                                        |

## 3. Customer checkout

| #    | Title                                                                  | Steps                                                                                          | Expected                                                                                    |
|------|------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------|
| 3.1  | Place order with Stripe Express (TC6)                                   | C1 → cart → checkout → pay via Stripe Express                                                   | Order moves to `processing`; Stripe charge id stored on order                               |

## 4. Edge cases

- **Vendor not onboarded:** Express Dashboard button still shows; customer checkout should refuse (or fall back to non-express gateway).
- **Disabled Connect + Express off:** payment options should clearly state none configured.
- **Multi-vendor cart:** distribution must work per vendor's onboarding state.
- **3DS challenge** during card auth.
- **Failed charge** (declined card) should not move the order to processing.
- **Refund flow** through Stripe Express.

## 5. Known issues

- TC2 ("Placeholder") exists as a stub — replace with a meaningful assertion.
- TC1 is `test.skip` because module-toggle alone produces no observable assertion target without TC3's explicit Connect-disable side-effect.

## 6. Suggested follow-ups (not in this PR)

1. Refund through Stripe Express dashboard.
2. Multi-vendor cart split-charge test.
3. Webhook verification (`payment_intent.succeeded` updates order).
4. 3DS / SCA flow.
