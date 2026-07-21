# Source chains resolve by precedence, not merge

Configuration values that exist at more than one level — Commission, Fee recipient, Withdraw
threshold, and six others — resolve through a **Source chain**: an ordered set of Sources,
most specific first. Exactly one Source wins and supplies the whole value. Sources never
merge and never partially inherit.

A Source **Defers** by being empty. Therefore **`0` is a real, winning value, not an
absence**: a Vendor with `dokan_admin_percentage = '0'` wins the chain and yields 0%
Commission — it does not inherit the global rate. Only a genuinely empty Source falls
through. Do not "fix" this.

Commission is the only chain with a formal implementation (`AbstractStrategy::
get_eligible_strategy()`, `includes/Commission/Strategies/AbstractStrategy.php:55`) and the
only one that records which Source won (`_dokan_commission_source`). That field is where the
term *Source* comes from. Its order is order item → product → vendor → global → default, and
resolution **freezes on first calculation** rather than at order creation: the winning Source
is stamped onto item meta, after which rank 1 always applies and the chain never re-walks
(`AbstractStrategy::save_settings_to_order_item()`, `:100`). A consequence worth knowing: any
read path that calculates Commission also writes.

## Consequences

Defer is currently encoded **six different ways** across the nine chains — `trim() === ''`,
`!== ''`, `empty()`, `metadata_exists()`, `meta_exists()`, and `!isset()` plus a separate
boolean gate. Only Commission's sits behind a named predicate (`Setting::is_applicable()`,
`includes/Commission/Model/Setting.php:289`); the rest are inline and duplicated per field.

`manual_order` encodes Defer two ways within one chain: `'' === $capability` in
`Manager::is_enabled_for_vendor()` (`Manager.php:83`) and `metadata_exists( 'user', … )` in
the subscription callback that supplies its middle Source (`module.php:2535`). Those
predicates disagree about a meta row that exists holding `''` — but no code path can produce
that state, because the only writer normalises every input through `wc_bool_to_string()`
(`Settings.php:131`). So it is a latent inconsistency, not a live bug: harmless until someone
writes that meta from a migration, WP-CLI, or SQL, at which point the pack Source silently
stops applying.

That distinction is the point. An earlier draft of this ADR asserted the bug as fact and used
it as the justification for the ADR existing. It was wrong, and it was wrong in the specific
way this ADR warns about — reasoning from the predicates instead of from what the code can
actually reach. Adversarial review caught it; the anchor check did not, and could not:
anchors verify where a claim points, never whether it is true.

We are naming the concept without unifying the encodings. Unifying would mean a data
migration across four stores (option rows, user meta, post meta, order/item meta) to
distinguish "empty because deferring" from "empty because zero" — expensive, risky, and
touching live marketplace money. Naming it costs nothing and stops the wrong mental model,
which is where the actual bugs come from. The encodings stay as they are; new chains should
use Commission's empty-string convention.

The chains known so far are enumerated in `bin/graph/chains.toml`, with anchors verified by
`bin/graph/check_anchors.py`. All but `commission` are hand-rolled `if`-ladders with no shared
structure, so **nothing discovers a chain automatically** and the enumeration should be read
as "the ones we have found", never as complete: an adversarial sweep found three more (RMA
warranty, geolocation product location, product-advertisement) after nine had been declared
and the file claimed to be exhaustive. Assume more exist.
