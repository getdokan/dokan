# Dokan Marketplace

The ubiquitous language for the Dokan multi-vendor marketplace. This is the canonical
glossary for **both dokan-lite and dokan-pro** — the two repos form a single bounded
context, with Pro extending Lite's language rather than redefining it. Pro-only terms
live in dokan-pro's `CONTEXT.md`.

## Language

### Actors

**Vendor**:
A user account that sells through the marketplace. The canonical term for all new
code, docs, and conversation.
_Avoid_: Seller (legacy alias — survives only as the WordPress role name `seller`
and in old function names), merchant, shop owner

**Store**:
The public-facing presentation of a Vendor: storefront page, store URL, store
settings, the REST `/stores` resource. Exactly one Store per Vendor — a facet of
the Vendor, not a separate entity.
_Avoid_: Shop, storefront

### Vendor-facing surfaces

**Vendor panel**:
The React single-page application a Vendor works in, mounted at the `new`
dashboard endpoint (`…/dashboard/new/#/…`). The destination of the migration —
new Vendor screens are built here.
_Avoid_: New dashboard, vendor dashboard (ambiguous — see below), React dashboard

**Legacy Vendor dashboard**:
The original PHP dashboard rendered by the `[dokan-dashboard]` shortcode, one
endpoint per screen (`…/dashboard/orders/`). Still fully supported; several
surfaces exist only here, and its URLs keep working after a surface moves to
the Vendor panel.
_Avoid_: Old dashboard, frontend dashboard

**Vendor layout**:
The chrome-only full-width wrapper (sidebar and header) that hosts either
dashboard body. Layout, not content — it renders no Vendor data of its own.
_Avoid_: Dashboard, dashboard wrapper

**Vendor analytics**:
The separate WooCommerce-Admin-derived reporting application. A distinct app
from the Vendor panel despite living under the same dashboard page.
_Avoid_: Reports dashboard, analytics dashboard

> "Vendor dashboard" on its own is ambiguous — it has meant all four of the
> above. Name the surface.

**Legacy fragment**:
A surface that stays server-rendered PHP and is delivered to the Vendor panel as
an HTML fragment over a Dokan REST endpoint, so that every extension hook keeps
firing unchanged. Vendor order details is the first one. Characterised by three
things: the same template serves both entry points, the render simulates the
page request context, and a documented re-init event tells JavaScript the markup
has arrived.
_Avoid_: Legacy embed, HTML widget, partial

**Re-init event**:
The event a Legacy fragment fires after its markup is injected
(`dokan-order-details-fragment-rendered`), published both through the JavaScript
hooks system and as a jQuery event on the body. The public compatibility contract
that lets extension JavaScript bind to markup that did not exist at DOM-ready.

### Orders

**Order**:
A WooCommerce order as the customer sees it — what was placed at checkout,
possibly containing products from several Vendors. A customer-facing mirror:
operational effects (stock, commission, vendor balance, refund accounting)
never happen here, only on Vendor orders.
_Avoid_: Purchase, parent order (say "Order" when you mean the customer-facing
whole; qualify as "parent" only when contrasting with its Suborders)

**Suborder**:
A per-vendor order split off a multi-vendor Order. Created only when the Order
spans more than one Vendor; a single-vendor Order has no Suborders.
_Avoid_: Child order, sub-order

**Vendor order**:
The order a Vendor processes and earns commission on: the Suborder when the
Order spanned multiple Vendors, or the Order itself when it was single-vendor.
One Order from Vendor A and Vendor B = one Order, two Suborders, two Vendor
orders. From Vendor A alone = one Order, zero Suborders, one Vendor order.

**Refund**:
A return of money to the customer, recorded against a Vendor order and mirrored
up to its Order. A refund created directly on a parent Order is outside the
model: vendor accounting does not see it.

### Money

**Commission**:
The admin's (marketplace operator's) share of a Vendor order, computed by a
Commission formula. Never the Vendor's share.
_Avoid_: Admin earning, admin fee

**Earning**:
The Vendor's share of a Vendor order after Commission — what accrues to their
balance.
_Avoid_: Vendor commission, net amount, payout (a payout is a Withdraw)

**Commission formula**:
The strategy that splits a line item between admin and Vendor: Fixed, Flat,
Percentage, Combine (percentage + flat), or Category-based.
_Avoid_: Commission type, rate

**Fee recipient**:
Whether admin or the Vendor receives a non-product amount of a Vendor order —
shipping, tax, or shipping-tax. Respected everywhere money is computed,
including Refunds.

**Balance**:
The running ledger of a Vendor's money — credited by Earnings, debited by
Withdraws and Refunds.
_Avoid_: Wallet, funds

**Withdraw** _(noun — Dokan idiom)_:
A Vendor's request to be paid out from their Balance via a withdraw method,
subject to a minimum threshold and approval.
_Avoid_: Withdrawal, payout, disbursement

**Reverse withdrawal**:
A debt owed by the Vendor to the admin, arising when the Vendor received the
full order payment directly (e.g. cash on delivery) including the admin's
Commission. Never a "negative Withdraw" — a Reverse withdrawal is a receivable,
not a Balance entry; the two concepts never mix. The differing spellings
(Withdraw vs Reverse withdrawal) are deliberate and match the code's module
names.

### Admin settings

**Canonical setting**:
A setting stored under its canonical id in the flat `dokan_admin_settings`
store — the single source of truth for admin configuration.
_Avoid_: New setting, migrated setting

**Legacy key**:
The old `wp_options` row (and sub-key) where a setting lived before migration.
Meaningful only through the Legacy bridge and Legacy mirror.

**Legacy bridge**:
The per-module declaration mapping a canonical id to its Legacy key, with
Transformers. Serves readers and writers at runtime: unmigrated code keeps
working during the migration series.
_Avoid_: Compat layer, shim

**Legacy mirror**:
The mode in which Legacy keys are kept physically populated with mapped values,
so a plugin downgrade finds real data at rest. The bridge is about code paths;
the mirror is about rows in the database.

**Transformer**:
The pair of value conversions between the canonical and legacy representations
of one setting (e.g. `'on'`/`'off'` ↔ boolean).
