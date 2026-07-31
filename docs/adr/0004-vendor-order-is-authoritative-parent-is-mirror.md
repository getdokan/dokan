# Vendor order is authoritative; the parent order is a mirror

When an order spans multiple vendors, Dokan splits it into real per-vendor
WooCommerce orders (suborders). All operational effects — stock reduction, commission,
vendor balance, refund accounting — happen only at the vendor-order level. The parent
order is a customer-facing aggregate kept consistent by targeted, directional syncs:
status changes are pushed down to suborders, completion is rolled up when all
suborders complete, and item stock is copied up for display only.

Consequences worth knowing before "fixing" any of this:

- Parent orders are deliberately blocked from reducing stock
  (`woocommerce_can_reduce_order_stock` filter).
- A refund created directly against a parent order is outside the model: vendor
  accounting ignores it in both Lite and Pro. Refunds are initiated on the vendor
  order and mirrored up to the parent (Pro maps the suborder's line items onto a
  matching parent refund; the gateway is charged once, at the parent level).
- A single-vendor order produces no suborder at all — the order itself is the vendor
  order. Code that filters on `parent_id != 0` silently drops these.

The alternative — one shared order with per-line-item vendor attribution — was
implicitly rejected by the split-order architecture: per-vendor orders give each
vendor a real WC_Order to manage (statuses, notes, emails, gateways) at the cost of
the sync rules above.
