import type { SettingsElement } from '../types';

/**
 * Find and replace an element in the settings tree.
 *
 * @param settings   - Array of settings elements.
 * @param newElement - Element to replace with.
 * @returns Modified settings array.
 */
function findAndReplaceElement(
    settings: SettingsElement[],
    newElement: SettingsElement
): SettingsElement[] {
    return settings.map( ( element ) => {
        // Check if this is the element to replace (by hook_key or id).
        if (
            element.hook_key === newElement.hook_key ||
            ( element.id === newElement.id && element.type === newElement.type )
        ) {
            return { ...newElement };
        }

        // If element has children, search recursively.
        if ( element.children && element.children.length > 0 ) {
            return {
                ...element,
                children: findAndReplaceElement( element.children, newElement ),
            };
        }

        return element;
    } );
}

export default findAndReplaceElement;

