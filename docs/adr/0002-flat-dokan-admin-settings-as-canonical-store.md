# Flat dokan_admin_settings array as the canonical settings store

Admin settings historically lived scattered across many `wp_options` rows with
per-section nested arrays. We decided that a single flat array under the
`dokan_admin_settings` option is the canonical store: every setting has one canonical
id, and all new reads and writes go through the settings accessor API against that
store. Legacy rows remain readable/writable only through the legacy bridge (see the
dokan-pro ADR on the bridge pattern) and are kept populated by the legacy mirror
(ADR-0003).

A flat map makes ids globally unique and greppable, lets the admin UI, setup wizard,
and REST layer share one schema, and avoids the migration ambiguity of deep merges
over nested structures.

## Considered Options

- Keep per-section option rows and normalize access behind an API only — rejected:
  every consumer still needs to know the physical layout, and cross-section renames
  stay painful.
- Nested canonical array — rejected: deep merges on save are error-prone and ids are
  only unique within a section.
