import { SettingsElement } from '../../../stores/adminSettings/types';

const applySearchToElement = (
    element: SettingsElement,
    searchText: string
): SettingsElement => {
    // If already hidden by dependencies, keep it hidden
    if (!element.display) {
        return { ...element };
    }

    // If no search text, keep current display state
    if (!searchText.trim()) {
        return { ...element };
    }

    // For field elements, apply search filtering based on title and description
    if (element.type === 'field') {
        const searchLower = searchText.toLowerCase();

        // Check if element content matches search text
        const titleMatch = element.title?.toLowerCase().includes(searchLower);
        const descriptionMatch = element.description?.toLowerCase().includes(searchLower);

        // If any content matches, keep it visible
        if (titleMatch || descriptionMatch) {
            return { ...element };
        }

        // If no match found, hide the field
        return {
            ...element,
            display: false,
        };
    }

    // For non-field elements (menu, submenu, tab, etc.), keep current state
    // Their visibility will be determined by their children
    return { ...element };
};

const hasVisibleFields = (elements: SettingsElement[]): boolean => {
    return elements.some(element => {
        // If this element is a visible field, return true
        if (element.type === 'field' && element.display) {
            return true;
        }
        
        // If this element has children, check recursively
        if (element.children && element.children.length > 0) {
            return hasVisibleFields(element.children);
        }
        
        return false;
    });
};

const settingsSearchApplicator = (
    settings: SettingsElement[],
    searchText: string
): SettingsElement[] => {
    return settings.map((element) => {
        // Apply search filtering to the current element
        let processedElement = applySearchToElement(element, searchText);

        // Apply search logic when search text exists
        if (searchText.trim()) {
            // Recursively process children if they exist
            if (processedElement.children && processedElement.children.length > 0) {
                processedElement.children = settingsSearchApplicator(
                    processedElement.children,
                    searchText
                );

                // Apply cascading visibility logic for elements with children
                // For submenu/tab elements: show only if they contain visible fields
                if (['subpage', 'tab'].includes(element.type)) {
                    const hasFields = hasVisibleFields(processedElement.children);
                    processedElement.display = hasFields;
                }
                // For menu/page elements: show only if they contain visible submenus/tabs or direct fields
                else if (['page'].includes(element.type)) {
                    const hasVisibleSubmenus = processedElement.children.some(child => 
                        child.display === true && ['subpage', 'tab'].includes(child.type)
                    );
                    // Also check if it has direct visible fields (for pages without submenus)
                    const hasDirectFields = hasVisibleFields(processedElement.children.filter(child => child.type === 'field'));
                    
                    processedElement.display = hasVisibleSubmenus || hasDirectFields;
                }
                // For any other parent elements (including marketplace menu), check if they have any searchable content
                else {
                    // Check if any children are visible after search filtering
                    const hasVisibleChildren = processedElement.children.some(child => child.display === true);
                    // Also check if there are any field elements at all in the hierarchy
                    const hasAnyFields = hasVisibleFields(processedElement.children);
                    
                    // Only display if there are visible children AND there are actual fields to search
                    // This ensures menus without any field elements are hidden during search
                    processedElement.display = hasVisibleChildren && hasAnyFields;
                }
            }
            // For elements with no children at all, hide them during search (unless they're fields)
            else if (element.type !== 'field') {
                processedElement.display = false;
            }
        }
        // If no search text, process children normally without changing visibility
        else if (processedElement.children && processedElement.children.length > 0) {
            processedElement.children = settingsSearchApplicator(
                processedElement.children,
                searchText
            );
        }

        return processedElement;
    });
};

export default settingsSearchApplicator;