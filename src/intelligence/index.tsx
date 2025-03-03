import './styles/modal.css';
import '@getdokan/dokan-ui/dist/dokan-ui.css';
import DokanAI from './components/DokanAI';
import { createRoot } from '@wordpress/element';

const setElementPosition = (
    targetField: HTMLElement,
    container: HTMLElement,
    field: any
) => {
    if ( ! container ) {
        return;
    }
    const parent = targetField.parentElement; // Nearest positioned parent
    const titleRect = targetField.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    let position = titleRect.top - parentRect.top;

    if ( targetField.tagName === 'INPUT' ) {
        position += titleRect.height / 4;
    } else if ( field.type === 'editor' ) {
        position = 10;
    } else {
        position = titleRect.height - 5;
    }

    container.style.top = `${ position }px`;
};
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
