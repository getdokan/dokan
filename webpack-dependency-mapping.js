/**
 * This file contains mappings for external and handle names for packages.
 *
 * @see https://github.com/woocommerce/woocommerce/blob/trunk/packages/js/dependency-extraction-webpack-plugin/src/index.js#L41
 *
 * @type {string}
 */
const { kebabCase } = require( 'lodash' );

const WOOCOMMERCE_NAMESPACE = '@woocommerce/';

/**
 * Third-party UI packages that are shared across multiple entry points.
 *
 * Each is built once as a standalone bundle exposed on a `window.dokan.*` global, so consuming
 * bundles reference the global instead of inlining their own copy of the package.
 *
 * @type {Object.<string, {external: string[], handle: string}>}
 */
const SHARED_UI_EXTERNALS = {
    '@wedevs/plugin-ui': {
        external: [ 'dokan', 'pluginUI' ],
        handle: 'dokan-plugin-ui',
    },
    '@getdokan/dokan-ui': {
        external: [ 'dokan', 'dokanUI' ],
        handle: 'dokan-ui',
    },
};

const packages = [
    // wc-admin packages
    '@woocommerce/admin-layout',
    '@woocommerce/block-templates',
    '@woocommerce/components',
    '@woocommerce/csv-export',
    '@woocommerce/currency',
    '@woocommerce/customer-effort-score',
    '@woocommerce/data',
    '@woocommerce/date',
    '@woocommerce/dependency-extraction-webpack-plugin',
    '@woocommerce/eslint-plugin',
    '@woocommerce/experimental',
    '@woocommerce/explat',
    '@woocommerce/extend-cart-checkout-block',
    '@woocommerce/navigation',
    '@woocommerce/notices',
    '@woocommerce/number',
    '@woocommerce/product-editor',
    '@woocommerce/settings-editor',
    '@woocommerce/tracks',
    '@woocommerce/remote-logging',
    // wc-blocks packages
    '@woocommerce/blocks-checkout',
    '@woocommerce/blocks-components',
    '@woocommerce/block-data',
    '@woocommerce/blocks-registry',
    '@woocommerce/price-format',
    '@woocommerce/settings',
];

/**
 * Given a string, returns a new string with dash separators converted to
 * camelCase equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will also capitalize letters
 * following numbers.
 *
 * @since DOKAN_SINCE
 *
 * @see https://github.com/woocommerce/woocommerce/blob/34b5e8b5d63a7d9df6622dc3af2aeaf428160357/packages/js/dependency-extraction-webpack-plugin/src/index.js#L16
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash( string ) {
    return string.replace( /-([a-z])/g, ( _, letter ) => letter.toUpperCase() );
}

/**
 * Given a request string, returns the external name
 * for the `WooCommerce` packages.
 *
 * @see https://github.com/woocommerce/woocommerce/blob/34b5e8b5d63a7d9df6622dc3af2aeaf428160357/packages/js/dependency-extraction-webpack-plugin/src/index.js#L20
 *
 * @param {string} request Request string.
 *
 * @return {string[]} External name for the package.
 */
const wooRequestToExternal = ( request ) => {
    if ( packages.includes( request ) ) {
        const handle = request.substring( WOOCOMMERCE_NAMESPACE.length );
        const irregularExternalMap = {
            'block-data': [ 'wc', 'wcBlocksData' ],
            'blocks-registry': [ 'wc', 'wcBlocksRegistry' ],
            settings: [ 'wc', 'wcSettings' ],
        };

        if ( irregularExternalMap[ handle ] ) {
            return irregularExternalMap[ handle ];
        }

        return [ 'wc', camelCaseDash( handle ) ];
    }
};

/**
 * Given a request string, returns the handle name
 * for the `WooCommerce` packages.
 *
 * @see https://github.com/woocommerce/woocommerce/blob/34b5e8b5d63a7d9df6622dc3af2aeaf428160357/packages/js/dependency-extraction-webpack-plugin/src/index.js#L41
 *
 * @param {string} request Request string.
 *
 * @return {string} Handle name for the package.
 */
const wooRequestToHandle = ( request ) => {
    if ( packages.includes( request ) ) {
        const handle = request.substring( WOOCOMMERCE_NAMESPACE.length );
        const irregularHandleMap = {
            data: 'wc-store-data',
            'block-data': 'wc-blocks-data-store',
            'csv-export': 'wc-csv',
        };

        if ( irregularHandleMap[ handle ] ) {
            return irregularHandleMap[ handle ];
        }

        return 'wc-' + handle;
    }
};

/**
 * Given a request string, returns the external name for the packages.
 *
 * @param  request string Request string.
 *
 * @return {string[]} External name for the package.
 *
 */
const requestToExternal = ( request ) => {
    // @wordpress/ui is not registered as a WP script handle yet.
    // Bundle it instead of externalizing to the missing `wp.ui` global.
    if ( request === '@wordpress/ui' ) {
        return false;
    }

    // Shared UI packages: built once as their own bundles (see webpack.config.js) so they are
    // not inlined into every entry that imports them. Only the bare specifier is mapped —
    // deep imports such as `@getdokan/dokan-ui/dist/components/Button` stay bundled, and the
    // shim entries in src/externals/ rely on that to avoid re-exporting themselves.
    if ( SHARED_UI_EXTERNALS[ request ] ) {
        return SHARED_UI_EXTERNALS[ request ].external;
    }

    const dokanStores = request.match( /^@dokan\/stores\/(.+)$/ );
    const wc = request.match( /^@woocommerce\/(.+)$/ );
    const dokan = request.match( /^@dokan\/([^/]+)$/ );

    if ( dokanStores ) {
        const storeName = camelCaseDash( dokanStores[ 1 ] );
        return [ 'dokan', storeName + 'Store' ];
    }

    if ( wc ) {
        return wooRequestToExternal( request );
    }

    if ( dokan ) {
        const packageName = dokan[ 1 ];
        const externalNameMap = {
            hooks: 'reactHooks',
            'product-editor': 'productEditor',
        };
        const externalName = externalNameMap[ packageName ] || packageName;

        return [ 'dokan', externalName ];
    }

    // Add more custom mappings as needed.
};

/**
 * Given a request string, returns the handle name.
 *
 * @param  request string Request string.
 *
 * @return {string} Handle name for the package.
 */
const requestToHandle = ( request ) => {
    if ( SHARED_UI_EXTERNALS[ request ] ) {
        return SHARED_UI_EXTERNALS[ request ].handle;
    }

    const dokan = request.match( /^@dokan\/stores\/(.+)$/ );
    const wc = request.match( /^@woocommerce\/(.+)$/ );
    const dokanOthers = request.match( /^@dokan\/([^/]+)$/ );

    if ( dokan ) {
        // Convert the store name to camelCase and append 'Store'.
        const storeName = kebabCase( dokan[ 1 ] );
        return `dokan-stores-${ storeName }`;
    }

    if ( dokanOthers ) {
        const packageName = dokanOthers[ 1 ];
        const handleNameMap = {
            components: 'react-components',
            'product-editor': 'product-editor-utils',
        };
        const handleName = handleNameMap[ packageName ] || packageName;
        return `dokan-${ handleName }`;
    }

    if ( wc ) {
        return wooRequestToHandle( request );
    }

    // Add more custom mappings as needed.
};

module.exports = {
    requestToExternal,
    requestToHandle,
};
