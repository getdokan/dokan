# Disabling a Vendor puts their published products into pending review, and re-enabling restores only those

Status: Accepted (retroactive — documents existing code)

## Context

When a Store Admin disables a Vendor (sets Selling Activation off), customers should no longer be able to buy that Vendor's products. Products are WooCommerce posts owned by the Vendor through `post_author` (Lite ADR 0010). Dokan could hide them with a query filter, delete them, or change their status. It changes their status, and remembers what it changed so the catalogue can be restored when the Vendor is enabled again. A Vendor can have thousands of products, so the work is done in the background.

## Rule

Disabling a Vendor moves every **published** product of that Vendor to **pending review** and records the previous status on the product. Enabling the Vendor moves every **pending** product that carries such a record back to its recorded status. Products the Vendor had in pending review for any other reason stay pending.

- **Trigger.** `Vendor::make_inactive()` calls `change_product_status( 'change_status' )`; `Vendor::make_active()` calls `change_product_status( 'revert' )` (`lite:includes/Vendor/Vendor.php:1020`, `:1038`). `change_product_status()` resets the shared job, sets the Vendor id and queues it (`lite:includes/Vendor/Vendor.php:1055-1060`).
- **Which products.** `ChangeProductStatus::get_products()` selects the Vendor's products (`author` = Vendor id) with status `publish` for disabling and `pending` for enabling, across every WooCommerce product type except `product_pack` (`lite:includes/Vendor/ChangeProductStatus.php:25-42`).
- **Queueing.** `ProductStatusChanger::add_to_queue()` pages through those ids synchronously and schedules one `dokan_product_status_changer_async` action per non-empty page on WooCommerce's queue (Action Scheduler), stopping at the first empty page (`lite:includes/Abstracts/ProductStatusChanger.php:206-234`). The branch inside the loop that would schedule `dokan_clear_product_cache_async` (`:212-219`) is never reached, because the `while` condition already stops on an empty page, so this path schedules no product-cache clean-up job. The page size is 100, filterable through `dokan_product_status_changer_per_page` (`:115`, `:183`).
- **Disable step.** For each product, `change_status()` sets the status to `pending` (the job passes no explicit status), stores the old status in `_dokan_previous_status`, fires `dokan_product_change_status_before_save`, saves, and fires `dokan_product_change_status_after_save` (`lite:includes/Abstracts/ProductStatusChanger.php:288-317`). A product already in the target status is skipped.
- **Enable step.** `revert()` reads `_dokan_previous_status`; if it is empty the product is left alone, otherwise the status is restored, the meta is deleted, and `dokan_product_status_revert_before_save` / `_after_save` fire (`lite:includes/Abstracts/ProductStatusChanger.php:328-355`). The inline comment states the intent: "for the first time, previous status will not be found. Admin need to manually change status first" (`:338-339`).
- **Customer effect.** WooCommerce treats a product as viewable only when it is published or the current user can edit it (`WC_Product::is_viewable()`, `wc:includes/abstracts/abstract-wc-product.php:1723-1728`), and a product that is not viewable is not purchasable (`WC_Product::is_purchasable()`, `:1777-1786`). Customers therefore can neither see nor buy a held product, including one already sitting in their cart. The Store page only lists published products. (Users who can edit the product, such as the Vendor and the Store Admin, still pass `is_viewable()`.)

## Settings that change it

No admin setting switches the behaviour off. It runs for every enable and disable, whichever path triggered it (see [ADR-0073](./0073-only-the-store-admin-approves-disables-trusts-or-features-a-vendor.md)).

| Control | Values | Default | Behaviour |
|---|---|---|---|
| Vendor's Selling Activation (`dokan_enable_selling` user meta, set by the Store Admin from the Vendor list, user profile or the store REST `enabled` field, or automatically by the reverse withdrawal "disable Vendor" failed-payment action, `lite:includes/ReverseWithdrawal/FailedActions.php:106-119`, `:131-145`) | `yes` / `no` | decided at creation by `dokan_selling[new_seller_enable_selling]` | Switching to `no` queues the disable step; switching to `yes` queues the revert. |
| Filter `dokan_can_enable_selling` | bool | `true` | Returning `false` blocks re-activation, so no revert is queued ([ADR-0070](./0070-enabling-a-vendors-selling-can-be-vetoed-by-an-add-on-but-disabling-cannot.md)). |
| Filter `dokan_product_status_changer_per_page` | int | `100` | Batch size per background job. |

## Worked example

Vendor V has 250 products: 230 `publish`, 15 `pending` (awaiting review), 5 `draft`.

1. The admin disables V. The job queues three batches (100, 100, 30) of the 230 published products; page 4 is empty and ends the loop. When Action Scheduler runs them, each becomes `pending` with `_dokan_previous_status = publish`. The 15 pending and 5 draft products are untouched. V now has 245 pending products.
2. A week later the admin enables V. The job selects all 245 pending products in three batches (100, 100, 45). The 230 with `_dokan_previous_status` go back to `publish` and lose the meta. The 15 that were awaiting review have no meta and stay `pending`. The 5 drafts are never selected.

## Edge cases

- **First approval of a new Vendor.** A Vendor created as Pending under the `manually` setting may already have pending products (for example created before approval by an add-on path). Approving them does not publish those products, because they carry no `_dokan_previous_status`.
- **The change is not instant.** Between the admin's click and the Action Scheduler run, products remain in their old status. On a site where WP-Cron or Action Scheduler is not running, disabling a Vendor does not hide their products at all.
- **Disabling twice.** Because the second run finds no published products, nothing is overwritten; `_dokan_previous_status` keeps the first recorded value.
- **Edits while disabled.** If the Store Admin changes a held product's status while the Vendor is disabled, the revert still restores the recorded status when the Vendor is enabled, as long as the product is `pending` at that time. If the product was moved out of `pending` (for example published by hand), the revert skips it and the stale `_dokan_previous_status` meta stays on the product.
- **Shared meta key.** `_dokan_previous_status` is also written by other status rollback jobs, including ones added by add-ons. Nothing records which process wrote the value, so a later revert or rollback can act on a value another process left behind.
- **Private and scheduled products** are not selected by either step.
- Add-ons can call the same job with an explicit target status through `ProductStatusChanger::add_to_queue( $task_type, $status )`; the Vendor enable/disable path does not.

## Why

The behaviour was introduced in 2.6.9 so that a disabled Store stops selling without deleting anything, and 3.7.18 moved it into a background process so Vendors with large catalogues do not time out the admin request. The `revert` design and its "previous status" meta are documented in the code (`@since 3.7.18`); the inline comment above records the deliberate choice not to publish products that were never auto-held. No rationale is recorded for using pending review rather than draft or private.

## Consequences & risks

- Disabled Vendors' products show up in the admin's "Pending" product queue, mixed with products genuinely awaiting review. Approving such a product by hand while the Vendor is disabled makes it purchasable again.
- Reports or integrations counting a Vendor's live catalogue will see it drop and recover asynchronously.

## Recommendations

- Consider a dedicated status or a visible marker for "held because the Vendor is disabled", so the admin product queue can tell the two kinds of pending apart. Storing the reason with the previous status (for example `['status' => 'publish', 'reason' => 'selling_disabled']`) would also stop different rollback mechanisms misreading each other's records.
- Clear `_dokan_previous_status` whenever a product's status is changed by anything other than the revert, to avoid stale values.
- Document for support teams that Action Scheduler must be running for Vendor suspension to take effect.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
