import { BasePage } from './basePage';

/**
 * Admin-area page object.
 *
 * Anchors the admin side of the page-object hierarchy
 * (`AdminSettingsPageNew extends AdminPage`). Inherits the shared navigation
 * helpers from {@link BasePage}; admin-specific helpers can be added here as the
 * settings suite grows.
 */
export class AdminPage extends BasePage {}
