import './tailwind.scss';
import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import AdminSetupBanner from './AdminSetupBanner';

domReady( function () {
    const adminHeaderRoot = document.querySelector( '.dokan-admin-header' );
    if ( adminHeaderRoot ) {
        const mountDiv = document.createElement( 'div' );
        mountDiv.setAttribute( 'id', 'setup-guide-banner-root' );
        mountDiv.setAttribute( 'class', 'dokan-layout' );

        adminHeaderRoot.after( mountDiv );
        const rootElement = document.querySelector(
            '#setup-guide-banner-root'
        );

        const root = createRoot( rootElement );
        root.render( <AdminSetupBanner /> );
    } else {
        console.error( 'Setup guide banner root element not found' );
    }
} );
