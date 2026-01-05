import type { SettingsElement } from '../types';

/**
 * Check if an element matches the search text.
 *
 * @param element    - Settings element.
 * @param searchText - Search text.
 * @returns Boolean indicating if element matches.
 */
function elementMatchesSearch( element: SettingsElement, searchText: string ): boolean {
    const lowerSearch = searchText.toLowerCase();

    // Check title.
    if ( element.title?.toLowerCase().includes( lowerSearch ) ) {
        return true;
    }

    // Check description.
    if ( element.description?.toLowerCase().includes( lowerSearch ) ) {
        return true;
    }

    // Check ID.
    if ( element.id?.toLowerCase().includes( lowerSearch ) ) {
        return true;
    }

    // Check tooltip.
    if ( element.tooltip?.toLowerCase().includes( lowerSearch ) ) {
        return true;
    }

    return false;
}

/**
 * Check if an element or any of its children match the search text.
 *
 * @param element    - Settings element.
 * @param searchText - Search text.
 * @returns Boolean indicating if element or children match.
 */
function elementOrChildrenMatch( element: SettingsElement, searchText: string ): boolean {
    if ( elementMatchesSearch( element, searchText ) ) {
        return true;
    }

    if ( element.children && element.children.length > 0 ) {
        return element.children.some( ( child ) =>
            elementOrChildrenMatch( child, searchText )
        );
    }

    return false;
}

/**
 * Apply search filter to settings elements.
 *
 * @param settings   - Array of settings elements.
 * @param searchText - Search text to filter by.
 * @returns Filtered settings array.
 */
function applySearch( settings: SettingsElement[], searchText: string ): SettingsElement[] {
    if ( ! searchText.trim() ) {
        return settings;
    }

    return settings
        .filter( ( element ) => elementOrChildrenMatch( element, searchText ) )
        .map( ( element ) => {
            if ( element.children && element.children.length > 0 ) {
                // If this element matches, keep all children.
                if ( elementMatchesSearch( element, searchText ) ) {
                    return element;
                }

                // Otherwise, filter children recursively.
                return {
                    ...element,
                    children: applySearch( element.children, searchText ),
                };
            }

            return element;
        } );
}

export default applySearch;

