import { SettingsElement } from '../../../stores/adminSettings/types';

const applySearchToElement = (
    element: SettingsElement,
    searchText: string
): SettingsElement => {
    if ( ! element.display ) {
        return { ...element };
    }

    if ( ! searchText.trim() ) {
        return { ...element };
    }

    if ( element.type === 'field' ) {
        const searchLower = searchText.toLowerCase();

        const titleMatch       = element.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = element.description?.toLowerCase().includes(searchLower);

        // If any content matches, keep it visible.
        if ( titleMatch || descriptionMatch ) {
            return { ...element };
        }

        return {
            ...element,
            display: false, // If no match found, hide the field
        };
    }

    return { ...element };
};

const hasVisibleFields = (elements: SettingsElement[]): boolean => {
    return elements.some(element => {
        if ( element.type === 'field' && element.display ) {
            return true;
        }
        
        // If this element has children, check recursively.
        if ( element.children && element.children.length > 0 ) {
            return hasVisibleFields( element.children );
        }
        
        return false;
    });
};

const settingsSearchApplicator = (
    settings: SettingsElement[],
    searchText: string
): SettingsElement[] => {
    return settings.map( ( element ) => {
        let processedElement = applySearchToElement( element, searchText );

        if ( searchText.trim() ) {
            if ( processedElement.children && processedElement.children.length > 0 ) {
                processedElement.children = settingsSearchApplicator(
                    processedElement.children,
                    searchText
                );

                if ( [ 'subpage', 'tab' ].includes( element.type ) ) {
                    processedElement.display = hasVisibleFields( processedElement.children );
                } else if ( [ 'page' ].includes( element.type ) ) {
                    const hasVisibleSubmenus = processedElement.children.some( child =>
                        child.display === true && [ 'subpage', 'tab' ].includes( child.type )
                    );
                    const hasDirectFields = hasVisibleFields(
                        processedElement.children.filter(
                            child => child.type === 'field'
                        )
                    );
                    
                    processedElement.display = hasVisibleSubmenus || hasDirectFields;
                }  else {
                    const hasVisibleChildren = processedElement.children.some(
                        child => child.display === true
                    );
                    const hasAnyFields = hasVisibleFields( processedElement.children );

                    processedElement.display = hasVisibleChildren && hasAnyFields;
                }
            } else if ( element.type !== 'field' ) {
                processedElement.display = false;
            }
        } else if ( processedElement.children && processedElement.children.length > 0 ) {
            processedElement.children = settingsSearchApplicator(
                processedElement.children,
                searchText
            );
        }

        return processedElement;
    });
};

export default settingsSearchApplicator;