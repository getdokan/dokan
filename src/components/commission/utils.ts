import { Category, CommissionValues, SettingsElement } from './types';

export const defaultCommission = { percentage: '0', flat: '0' };

// Selector functions
export const getSettingInChildren = (
    id: string,
    settings: SettingsElement[]
): SettingsElement | undefined => {
    for ( const setting of settings ) {
        if ( setting.hook_key === id ) {
            return setting;
        }
        if ( setting.children ) {
            const found = getSettingInChildren( id, setting.children );
            if ( found ) {
                return found;
            }
        }
    }
    return undefined;
};

export const getSettingById = (
    id: string,
    settings: SettingsElement[]
): SettingsElement | undefined => {
    return getSettingInChildren( id, settings );
};

// Category building function
export const buildCategoriesTree = ( categoriesData: {
    [ key: string ]: Category;
} ): Category[] => {
    const result: Category[] = [];
    const categoryMap: { [ key: string ]: Category } = {};

    // First, create a map of all categories with empty children arrays
    for ( const termId in categoriesData ) {
        const category = categoriesData[ termId ];
        categoryMap[ termId ] = {
            ...category,
            children: [],
        };
    }

    // Build the nested structure - handle both parent_id and parents array
    for ( const termId in categoryMap ) {
        const category = categoryMap[ termId ];

        // Check if this is a top-level category
        const isTopLevel =
            category.parent_id === '0' ||
            category.parent_id === 0 ||
            ! category.parent_id ||
            ( category.parents && category.parents.length === 0 );

        if ( isTopLevel ) {
            // This is a top-level category
            result.push( category );
        } else {
            // This is a child category - find its parent
            const parentId = category.parent_id;
            const parent = categoryMap[ parentId ];

            if ( parent ) {
                parent.children.push( category );
            } else {
                // If parent not found, treat as top-level
                result.push( category );
            }
        }
    }

    // Sort categories by name for consistent ordering
    const sortCategories = ( cats: Category[] ): Category[] => {
        return cats
            .sort( ( a, b ) => a.name.localeCompare( b.name ) )
            .map( ( cat ) => ( {
                ...cat,
                children: sortCategories( cat.children ),
            } ) );
    };

    return sortCategories( result );
};

// Recursive function to get all nested children IDs
export const getAllNestedChildren = (
    parentId: string | number,
    categories: { [ key: string ]: Category },
    visited: Set< string | number > = new Set()
): ( string | number )[] => {
    // Prevent infinite loops
    if ( visited.has( parentId ) ) {
        return [];
    }
    visited.add( parentId );

    const categoriesArray = Object.values( categories );
    const directChildren = categoriesArray.filter( ( item: any ) => {
        return (
            item?.parent_id === parentId ||
            item?.parents?.includes( Number( parentId ) )
        );
    } );

    const allChildren: ( string | number )[] = [];

    directChildren.forEach( ( child: any ) => {
        if ( child?.term_id ) {
            allChildren.push( child.term_id );
            // Recursively get children of this child
            allChildren.push(
                ...getAllNestedChildren(
                    child.term_id,
                    categories,
                    new Set( visited )
                )
            );
        }
    } );

    return allChildren;
};

// Value formatting and validation functions
export const unFormatValue = (
    inputValue: string,
    currency: { decimal: string }
): string => {
    if ( inputValue === '' ) {
        return inputValue;
    }

    if ( window.accounting ) {
        return String(
            window.accounting.unformat( inputValue, currency?.decimal || '.' )
        );
    }

    return String( inputValue ).replace( /[^0-9.-]/g, '' );
};

export const formatValue = (
    inputValue: string,
    currency: {
        precision: number;
        thousand: string;
        decimal: string;
    }
): string => {
    if ( inputValue === '' ) {
        return inputValue;
    }

    if ( ! window.accounting ) {
        return inputValue;
    }

    return window.accounting.formatNumber(
        inputValue,
        currency?.precision,
        currency?.thousand,
        currency?.decimal
    );
};

export const validatePercentage = ( percentage: string ): string => {
    if ( percentage === '' ) {
        return percentage;
    }

    const numVal = Number( percentage );
    if ( numVal < 0 || numVal > 100 ) {
        return '';
    }

    return percentage;
};

export const isEqual = ( value1: any, value2: any ): boolean => {
    if ( value1 === value2 ) {
        return true;
    }

    if (
        value1 === null ||
        value2 === null ||
        value1 === undefined ||
        value2 === undefined
    ) {
        return false;
    }

    if ( typeof value1 !== typeof value2 ) {
        return false;
    }

    if ( typeof value1 === 'object' && typeof value2 === 'object' ) {
        const keys1 = Object.keys( value1 );
        const keys2 = Object.keys( value2 );

        if ( keys1.length !== keys2.length ) {
            return false;
        }

        for ( const key of keys1 ) {
            if ( ! keys2.includes( key ) ) {
                return false;
            }
            if ( ! isEqual( value1[ key ], value2[ key ] ) ) {
                return false;
            }
        }

        return true;
    }

    return false;
};

// Get commission value helper
export const getCommissionValue = (
    commission: CommissionValues,
    commissionType: 'percentage' | 'flat',
    termId: string | number
): string => {
    if ( commission?.items?.hasOwnProperty( termId ) ) {
        return commission?.items[ termId ][ commissionType ];
    }
    return commission?.all?.[ commissionType ] || '';
};
