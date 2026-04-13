import domReady from '@wordpress/dom-ready';
import { createRoot } from '@wordpress/element';
import DokanAI from './components/DokanAI';

domReady( () => {
    const container = document.getElementById( 'ai-prompt-app' );
    if ( container ) {
        createRoot( container ).render( <DokanAI /> );
    }
} );

/**
 * Todo: We need to check/observe the dynamic element e.i. when react mount/unmount element which is in AI supported IDs.
 * We may use MutationObserver for this.
 */
