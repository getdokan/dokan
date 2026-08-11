/**
 * The setup wizard renders canonical settings fields through the same plugin-ui
 * machinery as the settings page, so it must register the same Dokan custom
 * field variants (e.g. info_preview, repeater). Re-export the settings page's
 * registration — `addFilter` with stable namespaces is idempotent, so calling
 * it from both entry points is safe.
 *
 * Pro-provided variants (e.g. category_based_commission) are registered by the
 * Pro dashboard bundle and shared through the global `@wordpress/hooks` registry.
 */
export { registerSettingsFields } from '../settings/register-fields';
