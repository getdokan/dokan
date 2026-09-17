# Pro store tabs render as tab bodies, not template takeovers

Pro's Reviews and Biography tabs are implemented as `template_include` takeovers: when the
tab's query var is present, `Store::store_review_template()` and
`Store::load_vendor_biography_template()` return a whole classic template that calls
`get_header( 'shop' )` / `get_footer( 'shop' )` and renders the store header itself. On
block themes those templates are broken for exactly the reason `store.php` is — block
themes ship no `header.php`/`footer.php` and WordPress no longer provides a theme-compat
fallback.

On block themes, Pro's tab callbacks now stand down and contribute only the tab **body**,
through the `dokan_block_store_tab_content` action that `dokan/store-tab-content` fires.
Lite owns the action and the page; Pro fills in a section of it. Classic themes keep the
template takeover unchanged.

Consequences worth knowing before "fixing" any of this:

- Lite's `Rewrites::store_template()` and both Pro callbacks are all on `template_include`
  at priority **99**. Lite registers first because Pro depends on it, so Pro's callback
  runs *last* and wins. Pro standing down is therefore not optional — without it the
  registered `dokan//single-store` block template is bypassed on every Pro tab URL, and
  the guard must be Pro's own, not something Lite can impose.
- The guard is the `dokan_use_store_block_template` filter (equivalently
  `WeDevs\Dokan\Blocks\Templates::is_available()`), which Pro must call defensively so it
  degrades to the classic path against a Lite version that does not define it.
- The body of each classic template is extracted into its own partial so the classic and
  block paths render from one source. Every hook fired inside those bodies keeps firing,
  with unchanged signatures.
- Any future Pro module adding a store tab must render through the action. A module that
  reaches for `template_include` will silently bypass the block template again, and the
  failure mode — an unstyled fragment on one tab only — is easy to miss in review.

The alternatives were both worse. Leaving Pro untouched keeps a pre-existing bug, but once
the rest of the store page renders correctly on block themes, two tabs dropping to an
unstyled fragment reads as a regression we introduced. Filtering those tabs out of
`dokan/store-tabs` so they are never offered would hide the breakage at the cost of
silently removing two Pro features from every block-theme marketplace.
