import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';

/**
 * AdminSwitching Component
 *
 * Handles switching between legacy and new admin panel interfaces
 */
const PanelSwitch = () => {
    const [ currentHash, setCurrentHash ] = useState( window.location.hash );

    // eslint-disable-next-line @wordpress/no-unused-vars-before-return
    const supportedKeys = applyFilters(
        // Define an array with a filter hook for supported URL keys.
        'dokan_admin_panel_switch_supported_keys',
        [
            'refund',
            'dashboard',
            'withdraw',
            'vendors',
            'changelog',
            'store-reviews',
            'verifications',
            'tools',
            'dummy-data',
            'product-advertising',
            'reverse-withdrawal',
            'announcement',
            'subscriptions',
            'abuse-reports',
            'dokan-seller-badge',
            'wholesale-customer',
            'admin-store-support',
            'product-qa',
            'reports',
            'request-for-quote',
        ]
    ) as string[];

    // Get the current URL hash path segments.
    const getHashPathSegments = () => {
        const hashPath = currentHash.replace( '#/', '' );
        const pathWithoutQuery = hashPath.split( '?' )[ 0 ];

        // Remove the query string from the path and return the segments of the current path.
        return pathWithoutQuery.split( '/' ).filter( Boolean );
    };

    useEffect( () => {
        // Check if the current URL is supported and has the correct hash path.
        const checkAndUpdate = () => {
            setCurrentHash( window.location.hash );
        };

        // Initial check.
        checkAndUpdate();

        // Listen events for comprehensive URL change detection.
        window.addEventListener( 'hashchange', checkAndUpdate );
        return () => window.removeEventListener( 'hashchange', checkAndUpdate );
    }, [] );

    // Get the admin switching data from the global variable.
    const { nonce, admin_url } = dokanAdminSwitching || {};
    const baseUrl = getHashPathSegments()[ 0 ] ?? 'dashboard';
    const isSupported = supportedKeys.includes( baseUrl );
    if ( ! isSupported || ! nonce || ! admin_url ) {
        return null;
    }

    // Build the switching URL using addQueryArgs.
    // eslint-disable-next-line @wordpress/no-unused-vars-before-return
    const switchingUrl = addQueryArgs( admin_url, {
        dokan_admin_switching_nonce: nonce,
        dokan_action: 'switch_admin_panel',
        legacy_key: baseUrl,
    } );

    const page = new URLSearchParams( window.location.search ).get( 'page' );

    return (
        <span className="new-dashboard-url my-8 text-sm font-medium">
            { page !== 'dokan-dashboard'
                ? sprintf(
                      /* translators: %s: The base URL of the current page. For example, "dashboard" for the dashboard page. */
                      __( 'To try Dokan new %s,', 'dokan-lite' ),
                      baseUrl
                  )
                : sprintf(
                      /* translators: %s: The base URL of the current page. For example, "dashboard" for the dashboard page. */
                      __( 'If you want to go back to old %s,', 'dokan-lite' ),
                      baseUrl
                  ) }{ ' ' }
            { /* eslint-disable-next-line jsx-a11y/anchor-is-valid */ }
            <a
                href={ switchingUrl || '#' }
                className="text-[#7047EB] font-bold underline"
            >
                { __( 'Click Here', 'dokan-lite' ) }
            </a>
        </span>
    );
};

export default PanelSwitch;
