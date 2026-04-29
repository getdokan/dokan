import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import AdminSetupBanner from './AdminSetupBanner';

domReady( function () {
    const adminHeaderRoot = document.querySelector(
        '#dokan-admin-panel-header'
    );
    if ( adminHeaderRoot ) {
        const wrapperDiv = document.createElement( 'div' );
        wrapperDiv.setAttribute(
            'class',
            'dokan-layout dokan-admin-page-body'
        );

        const mountDiv = document.createElement( 'div' );
        mountDiv.setAttribute( 'id', 'setup-guide-banner-root' );
        mountDiv.setAttribute( 'class', 'pr-[10px] lg:pr-5' );

        // Append the root inside the wrapper.
        wrapperDiv.appendChild( mountDiv );

        // Insert the wrapper after the admin header root.
        adminHeaderRoot.after( wrapperDiv );
        const rootElement = document.querySelector(
            '#setup-guide-banner-root'
        );

        const root = createRoot( rootElement );
        root.render( <AdminSetupBanner /> );
    } else {
        console.error( 'Setup guide banner root element not found' );
    }
} );
