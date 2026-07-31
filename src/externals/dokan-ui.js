/**
 * Shared bundle for `@getdokan/dokan-ui`.
 *
 * Same rationale as plugin-ui.js: the package was being inlined into every entry that imports
 * it (~0.7MB a copy). Building it once and mapping the bare `@getdokan/dokan-ui` specifier to
 * the `window.dokan.dokanUI` global lets all consumers share one copy via the `dokan-ui` handle.
 *
 * NOTE: the deep `dist/index.js` import is intentional — the bare specifier is externalised, so
 * importing it here would make this bundle re-export itself. This package ships no `exports`
 * map, so the deep path resolves fine.
 *
 * Existing deep imports elsewhere (`@getdokan/dokan-ui/dist/components/*`) are left untouched:
 * they do not match the externalised bare specifier and remain bundled with their consumer.
 *
 * @since DOKAN_SINCE
 */
export * from '@getdokan/dokan-ui/dist/index.js';
