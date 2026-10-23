# Orders are storage-agnostic through WooCommerce CRUD; HPOS branches only where SQL or admin screens require it

Status: Accepted (retroactive — documents existing code)

## Context

WooCommerce stores orders either in `wp_posts` / `wp_postmeta` (posts storage) or in its own `wc_orders` tables (High-Performance Order Storage, HPOS), chosen per site. Dokan reads and writes orders heavily: it creates Suborders, writes Vendor meta, scopes order lists to a Vendor, joins orders against its own tables and hooks into the admin order screens. It had to work on both storage modes at once, because a marketplace cannot choose which mode its host site uses.

## Decision

**[Lite]** over **[WooCommerce]** Dokan declares HPOS compatibility and treats order storage as WooCommerce's concern. It goes through WooCommerce CRUD for every order read and write that CRUD can express, and branches on storage mode only for raw SQL and for admin-screen hooks that differ between the two modes.

- **Declaration.** `WeDevs_Dokan::declare_woocommerce_feature_compatibility()` (`lite:dokan-class.php:237`), on `before_woocommerce_init` (fired at `wc:includes/class-woocommerce.php:998`), declares `custom_order_tables` and `cart_checkout_blocks` compatibility through `FeaturesUtil::declare_compatibility()` (`wc:src/Utilities/FeaturesUtil.php:87`).
- **CRUD for data.** Suborders are built as `WC_Order` objects and saved with `save()` ([ADR-0011](./0011-suborders-are-created-synchronously-at-checkout.md)). The parent link uses `set_parent_id()`, which WooCommerce maps to `post_parent` or `parent_order_id`. Every Dokan order meta key (`_dokan_vendor_id`, `has_sub_order`, Fee recipient keys, gateway fee keys) is written with `update_meta_data()` and read with `get_meta()`, so it lands in `wp_postmeta` or `wc_orders_meta` as appropriate. Order queries use `wc_get_orders()`.
- **One wrapper for storage detection.** `WeDevs\Dokan\Utilities\OrderUtil::is_hpos_enabled()` (`lite:includes/Utilities/OrderUtil.php:20`) returns false on WooCommerce older than 7.1 and otherwise delegates to `Automattic\WooCommerce\Utilities\OrderUtil::custom_orders_table_usage_is_enabled()`. `OrderUtil::get_order_table_name()` (`lite:includes/Utilities/OrderUtil.php:188`) returns `$wpdb->posts` or WooCommerce's orders table.
- **Branches where SQL differs.** `Order\Manager::all()` (`lite:includes/Order/Manager.php:31`) adds Vendor meta queries through the posts-only `woocommerce_order_data_store_cpt_get_orders_query` filter (applied at `wc:includes/data-stores/class-wc-order-data-store-cpt.php:1055`) when HPOS is off (`:34-58`), and passes them straight to `wc_get_orders()` when it is on. `Order\Manager::count_orders()` joins `dokan_orders` against `OrderUtil::get_order_table_name()` and filters on `status` or `post_status` according to the mode (`lite:includes/Order/Manager.php:308-320`).
- **Branches where admin hooks differ.** `Order\Admin\Hooks::__construct` (`lite:includes/Order/Admin/Hooks.php:28`, mode check at `:30`) registers the `woocommerce_page_wc-orders` list-table hooks under HPOS and the `shop_order` posts-screen hooks otherwise. `Order\Admin\Permissions` scopes the admin order list with `woocommerce_order_list_table_prepare_items_query_args` (applied at `wc:src/Internal/Admin/Orders/ListTable.php:424`) under HPOS and `posts_clauses` under posts storage (`lite:includes/Order/Admin/Permissions.php:27-31`).

## Consequences

- The same Dokan build runs on posts storage, on HPOS, and on HPOS with compatibility sync, without a migration of its own. Dokan's custom tables key on the WooCommerce order id, which is the same value in both modes.
- Because Dokan declares positive compatibility, WooCommerce's feature-compatibility checks do not count it among plugins incompatible with HPOS or the Checkout Block.
- Most order code is free of storage conditionals. The branches are concentrated in `Order\Manager` query helpers, `Order\Admin\Hooks`, `Order\Admin\Permissions` and `OrderUtil`.
- Raw SQL that touches orders must always ask `OrderUtil` for the table and column names. A query written against `wp_posts` directly works only on posts storage.
- The declared Checkout Block compatibility is backed by listening to `woocommerce_store_api_checkout_order_processed` (fired at `wc:src/StoreApi/Routes/V1/Checkout.php:695`, see [ADR-0011](./0011-suborders-are-created-synchronously-at-checkout.md)) alongside the classic checkout hook.

## Risks

- **Hooks that exist in only one mode.** Some WooCommerce hooks fire only in one data store. In WooCommerce 11.2.1, `woocommerce_untrash_order` is fired only by the HPOS store (`wc:src/Internal/DataStores/Orders/OrdersTableDataStore.php:2916`), and `woocommerce_new_order_data` (used by `REST\OrderController::set_order_vendor_id`) is applied only by the posts store (`wc:includes/data-stores/abstract-wc-order-data-store-cpt.php:95`). Listeners on such hooks silently do nothing in the other mode.
- **Property access on order objects.** Code that reads post properties directly from a `WC_Order` (for example `$order->post_parent`) instead of a getter may not resolve under HPOS; `docs/adr/reference/woocommerce-integration-orders.md` lists one such case.

## Recommendations

- For any new listener, check that WooCommerce fires the hook in both data stores, and add the counterpart hook when it does not.
- Keep raw order SQL behind `OrderUtil::get_order_table_name()` and the mode check, and prefer `wc_get_orders()` arguments over SQL whenever the query can be expressed that way.
- Once the minimum WooCommerce version is 8.0 or later, `OrderUtil::is_hpos_enabled()` can delegate directly, as its own docblock notes.

## Known gaps

- The HPOS-specific gaps listed in `docs/adr/reference/woocommerce-integration-orders.md` (customer receipt suppression reading `post_parent`, posts-storage untrash outside WP-admin, and REST order Vendor assignment under HPOS) were not resolved here.
- Behaviour while HPOS compatibility sync is in progress (`OrderUtil::is_custom_order_tables_in_sync()`) was not traced.

_Verified against Lite @e1ce7fc81 / Pro @65975a952 / WooCommerce 11.2.1 — 2026-10-22._
