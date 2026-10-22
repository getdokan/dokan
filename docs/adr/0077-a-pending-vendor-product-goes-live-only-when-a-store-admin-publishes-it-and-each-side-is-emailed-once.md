# A pending Vendor product goes live only when a Store Admin publishes it, and each side is e-mailed once

Status: Accepted (retroactive — no recorded decision; documents observed behaviour)

## Context

When a Vendor without Direct Publishing creates a product, it is saved as `pending` (see [ADR-0076](./0076-a-new-vendor-product-is-published-immediately-only-when-the-vendor-has-direct-publishing-otherwise-it-waits-as-pending-review.md)). Teammates ask "where does the admin approve products?", "who gets an e-mail and when?" and "why did the admin not get a second e-mail after the Vendor edited the product?". Dokan Lite has no dedicated approval screen or approval record: approval is WordPress publishing.

## Rule

- **Approval is publishing.** A Store Admin approves a pending product by changing its status to Published in WP Admin → Products (the normal WordPress/WooCommerce editor or quick edit). Lite listens to WordPress's `pending_to_publish` transition (`lite:includes/Admin/Hooks.php:29`) in `Admin\Hooks::send_notification_on_product_publish()` (`:51-59`). For a `product` post it fires `dokan_pending_product_published_notification( $post, $seller )`, where the seller is the post author (Lite ADR 0010).
- **Vendor e-mail on approval.** The `ProductPublished` e-mail (`pending_product_published`) listens to that action (`lite:includes/Emails/ProductPublished.php:42`) and is sent to the Vendor who owns the product.
- **Admin e-mail on submission, once per product.**
  - When a Vendor product is created (`dokan_new_product_added`), `Product\Hooks::set_new_product_email_status()` (priority 1, `lite:includes/Product/Hooks.php:34`, body `:410-416`) sets product meta `_dokan_new_product_email_sent = no`.
  - Two e-mails listen to both `dokan_new_product_added` and `dokan_product_updated` at priority 30 (`lite:includes/Emails/NewProduct.php:43-44`, `lite:includes/Emails/NewProductPending.php:44-45`):
    - `NewProductPending` ("Dokan New Pending Product") is sent when the product is `pending` (`lite:includes/Emails/NewProductPending.php:92-94`).
    - `NewProduct` ("Dokan New Product") is sent when the product is `publish` (`lite:includes/Emails/NewProduct.php:91-92`).
  - Each sends only while the meta is exactly `no`; it then sets the meta to `yes` and saves (`lite:includes/Emails/NewProductPending.php:87-97`). A missing meta is treated as "already sent", because the meta was introduced in 3.8.2 and older products must not trigger a late e-mail (`:85-90`).
  - Both default to the site `admin_email` as recipient (`lite:includes/Emails/NewProduct.php:50`).
- Because the trigger also runs on `dokan_product_updated`, a product that was saved as a **draft** first (meta still `no`) produces the admin e-mail on the first later save in which it is pending or published.

## Settings that change it

| Setting | Values | Default | Behaviour |
|---|---|---|---|
| WooCommerce → Settings → Emails → "Dokan New Pending Product" / "Dokan New Product" / "Dokan Pending Product Published" | enabled / disabled; recipient list | enabled; `admin_email` (admin e-mails) | Disabling an e-mail stops it being sent, but the `_dokan_new_product_email_sent` meta is still flipped to `yes`, so re-enabling later does not send it for that product. |
| User meta `dokan_publishing` | see the new-product ADR | absent | Decides whether the product starts as `pending` (pending e-mail) or `publish` (new-product e-mail). |

## Worked example

Vendor B (no Direct Publishing) saves a new product in the legacy editor.

1. `handle_product_update()` saves `post_status = pending` and fires `dokan_new_product_added`.
2. At priority 1 the meta becomes `no`; at priority 30 `NewProductPending` sees `pending`, sets the meta to `yes` and e-mails the admin. `NewProduct` sees `pending`, not `publish`, and does nothing.
3. B edits the description and saves again (still pending). `dokan_product_updated` fires; both e-mails see the meta `yes` and stay silent.
4. The Store Admin opens the product in WP Admin and clicks Publish. WordPress fires `pending_to_publish`; Lite fires `dokan_pending_product_published_notification`; B receives the "Dokan Pending Product Published" e-mail.

Had B first saved the product as a draft, step 2 would send nothing (status `draft`), and the admin e-mail would go out on the first save that leaves it pending or published.

## Edge cases

- **"Once" for the Vendor means once per approval.** The Vendor's e-mail is tied to the `pending_to_publish` transition, not to a per-product flag, so a product that goes back to `pending` (for example through a v1 REST update, see the status-choice ADR) and is published again sends the Vendor a second approval e-mail. Only the admin's submission e-mail is guarded by `_dokan_new_product_email_sent`.
- **Draft to publish by the admin** does not fire `pending_to_publish`, so the Vendor gets no approval e-mail.
- **Scheduled products** (`pending` → `future` → `publish`) also bypass the `pending_to_publish` notification.
- **Products created in WP Admin by the Store Admin** do not fire `dokan_new_product_added`, so the meta is never set and neither admin e-mail is sent.
- **Add-ons** may send their own e-mails for edits of published products, or reject products instead of approving them; those flows are outside Lite.

## Why

No decision record exists. The behaviour reuses WordPress's native `pending` status and publishing transition, so approval works in the standard product list without a Dokan-specific screen. The once-only meta was added in 3.8.2 because the e-mail listeners were moved onto both the create and the update action, which would otherwise have e-mailed the admin on every save.

## Consequences & risks

- There is no audit trail of who approved a product or when, beyond WordPress's post modification data.
- Turning an e-mail off still consumes its "once", which can surprise admins who disable e-mails temporarily.
- Any code that publishes a pending product programmatically (for example a bulk tool) triggers the Vendor's approval e-mail, because the notification is tied to the status transition rather than to an admin action.

## Recommendations

- If an approval record is ever needed (who approved, when), store it on the product at `pending_to_publish` rather than inferring it from post dates.
- Consider not flipping `_dokan_new_product_email_sent` when the e-mail is disabled, so re-enabling behaves predictably.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
