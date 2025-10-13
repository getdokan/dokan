import { __ } from '@wordpress/i18n';
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
        [ 'dashboard', 'withdraw', 'vendors' ]
    );

    // Get the current URL hash path segments.
    const getHashPathSegments = () => {
        const hashPath = window.location.hash.replace( '#/', '' );
        const pathWithoutQuery = hashPath.split( '?' )[ 0 ];

        // Remove the query string from the path and return the segments of the current path.
        return pathWithoutQuery.split( '/' ).filter( Boolean );
    };

    // Get localized data.
    const { nonce, admin_url } = dokanAdminSwitching || {};

    // window.addEventListener( 'hashchange', () => {
    //     const urlSegments = getHashPathSegments();
    //     console.log( urlSegments, '::::::::::::::::urlSegments' );
    //
    //     if ( 'vendors' === urlSegments[ 0 ] && urlSegments.length < 2 ) {
    //         setShouldRender( false );
    //     } else {
    //         setShouldRender( true );
    //     }
    // } );

    useEffect( () => {
        const checkShouldRender = () => {
            const urlSegments = getHashPathSegments();

            if ( 'vendors' === urlSegments[ 0 ] && urlSegments.length < 2 ) {
                setShouldRender( false );
            } else {
                setShouldRender( true );
            }
        };

        // Initial check
        checkShouldRender();

        // Listen to multiple events for comprehensive URL change detection
        window.addEventListener( 'hashchange', checkShouldRender );
        window.addEventListener( 'popstate', checkShouldRender );

        // Polling mechanism to detect Vue.js programmatic navigation
        let currentHash = window.location.hash;
        const pollInterval = setInterval( () => {
            if ( currentHash !== window.location.hash ) {
                currentHash = window.location.hash;
                checkShouldRender();
            }
        }, 100 ); // Check every 100ms

        // MutationObserver to detect DOM changes that might indicate route changes
        const observer = new MutationObserver( ( mutations ) => {
            mutations.forEach( ( mutation ) => {
                if (
                    mutation.type === 'childList' ||
                    mutation.type === 'attributes'
                ) {
                    const newHash = window.location.hash;
                    if ( currentHash !== newHash ) {
                        currentHash = newHash;
                        checkShouldRender();
                    }
                }
            } );
        } );

        // Observe changes in the main Vue app container
        const vueContainer = document.getElementById( 'dokan-vue-admin' );
        if ( vueContainer ) {
            observer.observe( vueContainer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [ 'class', 'id' ]
            } );
        }

        return () => {
            window.removeEventListener( 'hashchange', checkShouldRender );
            window.removeEventListener( 'popstate', checkShouldRender );
            clearInterval( pollInterval );
            observer.disconnect();
        };
    }, [] );

    // // Extract the base key from hash
    // // Example: #/vendors/28?edit=true -> vendors
    // const hashPath = window.location.hash.replace( '#/', '' );
    // const baseKey = hashPath.split( /[/?]/ )[ 0 ];
    //
    // // Check if the current page is supported
    // const isSupported = supportedKeys.includes( baseKey );
    //
    // if ( ! isSupported || ! nonce || ! admin_url ) {
    //     return null;
    // }

    const baseUrl = getHashPathSegments()[ 0 ] ?? 'dashboard';
    if ( ! supportedKeys.includes( baseUrl ) ) {
        return null;
    }

    // Get the full hash path (everything after #/)
    const getFullHashPath = () => {
        return window.location.hash.replace( '#/', '' );
    };

    const fullHashPath = getFullHashPath();

    // Build the switching URL using addQueryArgs.
    // eslint-disable-next-line @wordpress/no-unused-vars-before-return
    const switchingUrl =
        addQueryArgs( admin_url, {
            dokan_admin_switching_nonce: nonce,
            dokan_action: 'switch_admin_panel',
            legacy_key: baseUrl,
            // page: pageValue,
        } ) + ( fullHashPath ? `#/${ fullHashPath }` : '' );

    if ( ! shouldRender ) {
        return null;
    }

    // Determine the page parameter value.
    // If URL already has 'page=dokan', use 'dokan-dashboard', otherwise use 'dokan'
    // const urlParams = new URLSearchParams( window.location.search );
    // const currentPage = urlParams.get( 'page' );
    // const pageValue = currentPage === 'dokan' ? 'dokan-dashboard' : 'dokan';


    return (
        <div className="new-dashboard-url pt-4 text-sm font-medium">
            { __( 'To try Dokan new dashboard, ', 'dokan-lite' ) }
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
