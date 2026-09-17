# `manage_woocommerce` is the canonical admin capability for vendor authorization

Dokan used "admin" to mean two different capabilities — `manage_woocommerce` in
the Abilities layer, `VendorAuthorizable` and `Vendor\Manager`, but
`manage_options` in `StoreController::get_restricted_fields_for_update()`. A
`shop_manager` holds the first and not the second, so the two layers disagreed
about whether one is an admin. The disagreement was masked only because the
restricted-field list matched meta-key names (`dokan_admin_percentage`) against
request-parameter names (`admin_commission`) and therefore stripped nothing.

We resolved this in favour of `manage_woocommerce` as the canonical admin
capability for authorization. A **Store Admin** (`manage_woocommerce`) may read
and write any vendor's products, orders and store profile, **and** set a
vendor's **Operating Terms** — commission, selling activation, direct publishing
and featured status. **Site Admin** (`manage_options`) is retained as a distinct
term because the capability is genuinely used elsewhere in the codebase, but it
draws no authorization boundary of its own in this model.

The line Operating Terms draw is between the marketplace and its Vendors — a
Vendor may never set the terms they operate under — not between the two admin
tiers.

## Consequences

No behaviour changes for admins, and there is no breaking change. Shop managers
can set commission and direct publishing today (verified against a live install:
a `shop_manager` set commission to `5` and publishing to `yes` via
`PUT /dokan/v1/stores/{id}`, HTTP 200), and they keep that ability.

`StoreController::get_restricted_fields_for_update()` becomes the outlier to
fix: it gates on `manage_options` where the rest of the authorization surface
uses `manage_woocommerce`, and its entries match meta-key names
(`dokan_admin_percentage`) against request-parameter names (`admin_commission`),
so it strips nothing. Both halves need correcting — but note the real protection
is `Vendor\Manager::update()`'s capability gate, so fixing the list must not be
mistaken for fixing a live hole.

The remaining `manage_options` checks — `ProductController`'s permission
callbacks and `StoreController:782` — are deliberately left alone. Converting
them would grant shop managers access to endpoints they cannot reach today,
which is a behavioural change outside the scope of this work. Auditing them
case by case is worthwhile, but as separate work.
