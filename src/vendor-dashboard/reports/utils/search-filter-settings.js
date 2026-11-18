/**
 * External dependencies
 */
import { getSetting } from '@woocommerce/settings';

/**
 * WooCommerce release that moved the Search props of FilterPicker sub-filters
 * and CompareFilter under `settings.searchProps` (woocommerce/woocommerce#68816).
 */
const SEARCH_PROPS_SINCE = { major: 11, minor: 3 };

/**
 * Whether the running WooCommerce reads `settings.searchProps`.
 *
 * Older releases ignore the key, while 11.3+ logs a deprecation for the old
 * `type`, `autocompleter` and `labels.placeholder` keys, so a report config
 * has to pick one shape at runtime.
 *
 * @param {string} version WooCommerce version; defaults to the one WooCommerce localizes.
 * @return {boolean} True from WooCommerce 11.3 on.
 */
export function supportsSearchProps( version = getSetting( 'wcVersion', '' ) ) {
    const [ major = 0, minor = 0 ] = String( version )
        .split( '.' )
        .map( ( part ) => parseInt( part, 10 ) || 0 );

    return (
        major > SEARCH_PROPS_SINCE.major ||
        ( major === SEARCH_PROPS_SINCE.major &&
            minor >= SEARCH_PROPS_SINCE.minor )
    );
}

/**
 * Build the `settings` of a FilterPicker Search sub-filter or a CompareFilter
 * in the shape the running WooCommerce expects.
 *
 * @param {Object} search   Props for the Search component: `type`, `placeholder` and, optionally, `autocompleter`.
 * @param {Object} settings The other filter settings: `param`, `getLabels`, `labels`, `onClick`.
 * @return {Object} Filter settings.
 */
export function searchFilterSettings( search, settings ) {
    if ( supportsSearchProps() ) {
        return { ...settings, searchProps: search };
    }

    const { placeholder, ...searchProps } = search;
    const labels = { ...( settings.labels || {} ) };

    if ( placeholder !== undefined ) {
        labels.placeholder = placeholder;
    }

    return { ...settings, ...searchProps, labels };
}
