# A Vendor sees only their own Vendor orders in analytics, and only report managers can choose a Vendor

Status: Accepted (retroactive — documents existing code)

## Context

Dokan reuses WooCommerce Analytics for the Vendor dashboard: the same REST endpoints (`/wc-analytics/reports/...`) serve the Store Admin in WP Admin and the Vendor on the frontend dashboard. Teammates ask "how does a Vendor's revenue report know which Vendor it is for?", "can the Store Admin see one Vendor's numbers?" and "what does Vendor Staff see?".

## Rule

**Which Vendor a query is for.** `BaseQueryFilter::get_vendor_id()` (`lite:includes/Analytics/Reports/BaseQueryFilter.php::get_vendor_id()`) decides:

| Current user | Vendor id used |
|---|---|
| Not logged in | 0 (no Vendor filter) |
| Lacks `view_woocommerce_reports` (Vendors, Vendor Staff) | `dokan_get_current_user_id()`, which resolves Vendor Staff to their Vendor |
| Has `view_woocommerce_reports` (Store Admin, shop managers) | the `sellers` query argument, or 0 (whole marketplace) when it is absent |

When the id is not 0, `::add_where_subquery_for_vendor_filter()` appends `dokan_order_stats.vendor_id = <id>` on top of the Vendor-order type list from [ADR-0098](./0098-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md).

**Which `vendor_id` a row carries.** `Orders\Stats\DataStore::get_vendor_id_from_order()` (`lite:includes/Analytics/Reports/Orders/Stats/DataStore.php::get_vendor_id_from_order()`) stores the Vendor order's `_dokan_vendor_id` for Suborders and single-vendor Orders, the parent Vendor order's `_dokan_vendor_id` for their refunds, and 0 for everything else (parent Orders, parent refunds, advertisement and Vendor subscription orders). A Vendor therefore never sees marketplace-owned orders, even ones they paid for as a customer.

**Product and stock lists.** The analytics products list adds `author = <current user>` on the `/wc-analytics/products` route when the request runs in an admin context and the user lacks `manage_woocommerce` (`lite:includes/Analytics/VendorDashboardManager.php::product_query_args()`). It uses the logged-in user's own id (`get_current_user_id()`), not `dokan_get_current_user_id()`, so for Vendor Staff it lists products the staff member authored rather than the Vendor's products. The stock report adds `post_author = <vendor id>` to the product query (`lite:includes/Analytics/Reports/Stock/QueryFilter.php::add_author_clause()`), and the stock stats store counts with the same Vendor (`lite:includes/Analytics/Reports/Stock/Stats/WcDataStore.php::get_vendor_id()`); both use the Vendor id from the table above, so Vendor Staff see their Vendor's stock.

**Caches are per Vendor.** WooCommerce caches report results by query arguments; Dokan adds the Vendor id to those arguments so one Vendor's cached totals are never served to another (`lite:includes/Analytics/Reports/CacheKeyModifier.php::apply_seller_filter()`; `lite:includes/Analytics/Reports/DataStoreCacheModifier.php::add_query_param()`).

**Access to the endpoints.** WooCommerce requires `view_woocommerce_reports` to read reports. Dokan lets Vendors and their Vendor Staff read the WooCommerce Analytics report routes the Vendor dashboard calls (`lite:includes/Analytics/VendorDashboardManager.php::woocommerce_rest_check_permissions()`). Every Dokan-filtered analytics report listed in [ADR-0098](./0098-analytics-count-each-sale-once-at-the-vendor-order-level-and-never-count-parent-orders.md) returns only that Vendor's own Vendor orders, and the stock report only that Vendor's products.

## Settings that change it

None. The `sellers` argument is a request parameter, honoured only for users with `view_woocommerce_reports`. Add-ons can override the enabled state through `dokan_is_analytics_enabled`.

## Worked example

Using the checkout from the Vendor-order-level ADR (Suborders #101 for Vendor A at 60.00 and #102 for Vendor B at 40.00):

- Vendor A opens Reports → Revenue: `get_vendor_id()` returns A's id, the query adds `vendor_id = A`, total sales = 60.00.
- A staff member of Vendor A opens the same page: `dokan_get_current_user_id()` returns A's id, same result.
- The Store Admin opens WooCommerce → Analytics → Revenue with no filter: Vendor id 0, total sales = 100.00. With `?sellers=<B>`: 40.00.

## Edge cases

- A Vendor who also holds `view_woocommerce_reports` (for example a shop manager who sells) is treated as a report manager: without a `sellers` argument they see the whole marketplace.
- A Vendor's own purchases from other Vendors never appear in their analytics; the Vendor filter keys on the seller, not the customer.
- Vendor Staff see the Vendor's orders, revenue and stock, but the analytics products list is keyed to the staff member's own user id, so it is normally empty for them.

## Why

The class and method docblocks describe the split ("seller id from query param for Admin and currently logged in user as Vendor"). Keying on `view_woocommerce_reports` reuses WooCommerce's own report capability rather than introducing a Dokan one.

## Consequences & risks

- Vendor scoping lives in one `QueryFilter` per WooCommerce report context. When WooCommerce adds a report type, it needs its own Dokan filter before the Vendor dashboard uses it.
- Report results depend on the per-Vendor cache key; an extension that adds its own report entity must add itself to the entity lists in `CacheKeyModifier::get_entities()` and `DataStoreCacheModifier::get_entities()`.

## Recommendations

- Add an automated test that calls each analytics report the Vendor dashboard uses, as a Vendor and as Vendor Staff, and asserts only that Vendor's orders and products come back.
- Use `dokan_get_current_user_id()` in `product_query_args()` so Vendor Staff see their Vendor's products.

_Verified against Lite @863e6f9c5 / WooCommerce 11.2.1 — 2026-11-19._
