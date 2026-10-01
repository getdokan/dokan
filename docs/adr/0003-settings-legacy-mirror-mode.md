# Settings legacy mirror mode

While `dokan_admin_settings` is the canonical store (ADR-0002), the legacy
`wp_options` rows are not deleted or left stale: legacy mirror mode keeps them
physically populated with mapped values on every canonical write, and a reconcile
pass on `admin_init` repairs them after a plugin downgrade. The mirror can be
disabled via the `dokan_admin_settings_legacy_mirror` filter.

We chose this because a downgrade to a pre-migration plugin version must find real
data at rest — a bridge that maps values only at runtime disappears together with the
new code, leaving old versions reading empty or stale rows. The cost is dual writes
and the risk of the two stores diverging, which the reconcile pass bounds.

Note the division of labour: the legacy *bridge* serves readers and writers at
runtime; the legacy *mirror* serves data at rest.
