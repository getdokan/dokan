/**
 * Shared bundle for `@wedevs/plugin-ui`.
 *
 * This package is imported by several entry points (components, frontend, product-editor-utils,
 * dokan-admin-dashboard). Without a shared bundle webpack inlines a full ~3.5MB copy into each
 * one, so the vendor dashboard downloads and parses the same code three times over.
 *
 * Building it once here — and mapping the bare `@wedevs/plugin-ui` specifier to the
 * `window.dokan.pluginUI` global in webpack-dependency-mapping.js — means every consumer shares
 * a single copy, loaded via the `dokan-plugin-ui` script handle.
 *
 * NOTE: the import below deliberately uses a relative path into node_modules rather than the
 * bare specifier. The bare specifier is externalised, so importing it here would make this
 * bundle re-export itself; the package's `exports` map also does not expose `./dist/*`, which
 * rules out a deep package import.
 *
 * @since 5.0.12
 */
export * from '../../node_modules/@wedevs/plugin-ui/dist/index.js';
