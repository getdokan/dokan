import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import App from './App';
import './index.scss';

domReady( () => {
    const container = document.getElementById(
        'product-form-manager-template'
    );
    if ( container ) {
        const root = createRoot( container );
        root.render( <App /> );
    }
} );
