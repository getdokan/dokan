import { createRoot } from '@wordpress/element';
import AdminBar from './AdminBar';
import domReady from '@wordpress/dom-ready';
import './tailwind.scss';

domReady( function () {
    // Render header component in the dokan-admin-panel-header root element
    const headerRoot = document.getElementById( 'dokan-admin-panel-header' );

    if ( headerRoot ) {
        const root = createRoot( headerRoot );
        root.render( <AdminBar /> );
    }
} );
