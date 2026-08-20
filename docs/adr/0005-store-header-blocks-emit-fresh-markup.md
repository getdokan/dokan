# Store header blocks emit fresh markup, not the classic store header template

The FSE work for store pages follows a template-reuse-first principle: every block is
server-rendered and reuses the Dokan template it replaces, so Pro and third parties keep
working unchanged. The five header blocks — `dokan/store-name`, `dokan/store-banner`,
`dokan/store-avatar`, `dokan/store-info` and `dokan/store-social` — are the deliberate
exception. They emit their own markup, scoped to `.wp-block-dokan-*`, and ship their own
styles with the standard colour, typography and spacing block supports enabled.

Two things make reuse impossible here rather than merely inconvenient. `store-header.php`
is a single monolithic tree, and its styles hang off a seven-level selector chain
(`.dokan-single-store .profile-frame .profile-info-box .profile-info-summery-wrapper
.profile-info-summery .profile-info .store-name`). Independent sibling blocks cannot
reproduce one nesting chain between them. And those rules encode the classic layout's
assumption that the header overlays the banner — the store name is `color: #fff` — while
three of the four header patterns we ship move the name off the banner entirely, where
that rule renders white on white.

Consequences worth knowing before "fixing" any of this:

- A block-built store page is **data**-identical to the classic page, not pixel-identical.
  Acceptance criteria that say "compare against the classic store page" mean data parity.
- `templates/store-header.php` and `assets/src/less/store.less` are untouched, so classic
  themes render byte-identically. The two stylesheets are independent **by design** —
  changes to `store.less` will not reach the blocks, and should not.
- The `store_header_template` appearance option (`default`/`layout1`/`layout2`/`layout3`)
  does not affect blocks. On block themes the equivalent choice is made by picking one of
  the four header patterns in the Site Editor.
- This ADR is scoped to the header. The composite blocks — `dokan/store-tab-content`, the
  product sections, and the sidebar widget-parity blocks — *do* reuse their templates
  verbatim, and every legacy action the classic templates fire still fires from the
  equivalent block.

The alternative was a `dokan/store-header` container block emitting the full wrapper chain
with the five leaf blocks nested inside, which would have been pixel-identical for almost
no new CSS. It was rejected because it locks the header into a single nesting — defeating
the four freely-arranged header patterns that are the point of granular blocks — and
carries the banner-overlay assumptions into every layout that does not have a banner.
