import './styles/modal.css';
import '@getdokan/dokan-ui/dist/dokan-ui.css';
import DokanAI from './components/DokanAI';
import { createRoot } from '@wordpress/element';

const positionedElement = (
    targetField: HTMLElement,
    container: HTMLElement
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
    } else {
        position = titleRect.height - 5;
    }
    container.style.top = `${ position }px`;
};
const initializeDokanAI = () => {
    // @ts-ignore
    const fields = window.dokanAiSettings.fields;

    if ( fields && Array.isArray( fields ) && fields.length > 0 ) {
        fields.forEach( ( field ) => {
            const targetField = document.getElementById( field.id );
            if ( targetField && field.type === 'input' ) {
                const container = document.createElement( 'div' );
                container.id = `dokan-ai-root-${ field.id }`;
                container.className = 'dokan-ai-prompt-icon';
                targetField.parentNode.appendChild( container );
                // @ts-ignore
                targetField.parentNode.style.cssText = 'position:relative;';
                // render the DokanAI component
                createRoot( container ).render( <DokanAI field={ field } /> );
                positionedElement( targetField, container );
            }
        } );
    }
};

if ( document.readyState === 'loading' ) {
    document.addEventListener( 'DOMContentLoaded', initializeDokanAI );
} else {
    initializeDokanAI();
}
