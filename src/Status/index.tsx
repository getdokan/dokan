import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Status from './Status';
import './status.scss';

const statusDomNode = document.getElementById( 'dokan-status' );
const statusRoot = createRoot( statusDomNode! );

domReady( () => {
    if ( statusDomNode ) {
        statusRoot.render( <Status /> );
    }
} );
