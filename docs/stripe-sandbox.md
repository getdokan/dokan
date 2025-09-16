# Stripe Express Sandbox Mode

## Overview

Stripe Express now supports a dedicated **Sandbox Mode** for safe, isolated payment testing. This mode is separate from the standard Test Mode and is designed to simulate real payment flows without affecting your live or test data.

---

## What is Sandbox Mode?

- **Sandbox Mode** provides a complete testing environment for Stripe Express payments.
- It uses special sandbox API keys and webhook secrets, different from your live or test credentials.
- All transactions in this mode are simulated and do not interact with real funds or production data.

---

## When to Use Sandbox Mode

- When you want to test payment flows, webhooks, and error scenarios without affecting your live or test Stripe data.
- For QA, development, or staging environments where you need a safe, isolated payment simulation.

---

## How to Enable Stripe Express Sandbox Mode

1. **Go to:**
   - WordPress Admin → WooCommerce → Settings → Payments → Stripe Express
2. **Find the option:**
   - `Enable Stripe Sandbox Mode`
3. **Check the box** to enable Sandbox Mode.
4. **Enter your Sandbox API credentials:**
   - **Sandbox Publishable Key**
   - **Sandbox Secret Key**
   - **Sandbox Webhook Secret**
   - (These are different from your Test or Live keys. Get them from your Stripe sandbox account.)
5. **Save changes.**

> **Note:** When Sandbox Mode is enabled, Test Mode is automatically disabled, and vice versa. Only one can be active at a time.

---

## Using Stripe Sandbox Mode

- All payments, refunds, and webhooks are routed through the sandbox environment.
- The checkout and admin screens will indicate when Sandbox Mode is active.
- Use the following test card numbers to simulate different payment outcomes:

| Card Number           | Outcome              |
|----------------------|----------------------|
| 4242 4242 4242 4242  | Successful payment   |
| 4000 0000 0000 0002  | Declined payment     |
| 4000 0000 0000 9995  | Failed payment       |

For more test cards and scenarios, see the [Stripe Sandboxes Documentation](https://docs.stripe.com/sandboxes).

---

## FAQ

**Q: Can I use my regular Stripe test keys in Sandbox Mode?**
- No. Sandbox Mode requires separate sandbox credentials from your Stripe sandbox account.

**Q: What happens to my live/test data when using Sandbox Mode?**
- Nothing. Sandbox Mode is fully isolated and does not affect your live or test Stripe data.

**Q: How do I get sandbox credentials?**
- Visit your Stripe sandbox dashboard or contact Stripe support for access and instructions.

---

## References
- [Stripe Sandboxes Documentation](https://docs.stripe.com/sandboxes)
- [Dokan Stripe Express Module](https://dokan.co/wordpress/modules/stripe-express/) 
