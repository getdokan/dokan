import { __ } from '@wordpress/i18n';

/**
 * Translated strings passed to `setLocaleData` so the WordPress DataViews
 * library renders its built-in labels in the active locale.
 *
 * Kept here (not inside a view component) so it can be shared across the
 * DataViews components without coupling translation data to presentation.
 */
export const getTranslatedStrings = () => ( {
    Actions: [ __( 'Actions', 'dokan-lite' ) ],
    'No results': [ __( 'No results', 'dokan-lite' ) ],
} );
