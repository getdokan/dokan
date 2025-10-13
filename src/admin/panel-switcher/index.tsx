import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import PanelSwitch from './PanelSwitch';

domReady( function () {
    const container = document.getElementById( 'dokan-admin-switching' );
    if ( container ) {
        const root = createRoot( container );
        root.render( <PanelSwitch /> );
    } else {
        console.error( 'Admin panel switching root element not found' );
    }
} );
