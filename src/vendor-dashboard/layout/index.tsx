import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import Layout from './components/Layout';
import './style.css';

domReady( () => {
    const rootEl = document.getElementById(
        'dokan-vendor-dashboard-layout-root'
    );

    if ( rootEl ) {
        const wpAdminBarEl = document.getElementById( 'wpadminbar' ),
            root = createRoot( rootEl );

        rootEl.className +=
            ' sticky z-10 ' + ( wpAdminBarEl ? 'top-8' : 'top-0' );
        root.render( <Layout /> );
    }
} );
