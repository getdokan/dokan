import './styles/modal.css';
import '@getdokan/dokan-ui/dist/dokan-ui.css';
import DokanAI from './components/DokanAI';
import { createRoot } from '@wordpress/element';

const initializeDokanAI = () => {
    const container = document.getElementById( 'ai-prompt-app' );
    if ( container ) {
        createRoot( container ).render( <DokanAI field={ [] } /> );
    }
};

document.addEventListener( 'DOMContentLoaded', initializeDokanAI );

/**
 * Todo: We need to check/observe the dynamic element e.i. when react mount/unmount element which is in AI supported IDs.
 * We may use MutationObserver for this.
 */
