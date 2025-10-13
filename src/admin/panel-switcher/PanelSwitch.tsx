import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useState } from '@wordpress/element';

/**
 * AdminSwitching Component
 *
 * Handles switching between legacy and new admin panel interfaces
 */
const PanelSwitch = () => {
    const [ shouldRender, setShouldRender ] = useState( false );

    // eslint-disable-next-line @wordpress/no-unused-vars-before-return
    const supportedKeys = wp.hooks.applyFilters(
        // Define an array with a filter hook for supported URL keys.
        'dokan_admin_panel_switch_supported_keys',
        [ 'dashboard', 'vendors' ]
    );

    // Get the current URL hash path segments.
    const getHashPathSegments = () => {
        const hashPath = window.location.hash.replace( '#/', '' );
        const pathWithoutQuery = hashPath.split( '?' )[ 0 ];

        // Remove the query string from the path and return the segments of the current path.
        return pathWithoutQuery.split( '/' ).filter( Boolean );
    };

    useEffect( () => {
        // Check if the current URL is supported and has the correct hash path.
        const checkAndUpdate = () => {
            const urlSegments = getHashPathSegments();
            setShouldRender(
                ! ( 'vendors' === urlSegments[ 0 ] && urlSegments.length < 2 )
            );
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

    if ( ! shouldRender ) {
        return null;
    }

    const page = new URLSearchParams( window.location.search ).get( 'page' );

    return (
        <div className="new-dashboard-url pt-8 text-sm font-medium">
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
        </div>
    );
};

export default PanelSwitch;
