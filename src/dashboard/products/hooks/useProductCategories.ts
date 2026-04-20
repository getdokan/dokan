import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { ProductCategoryOption } from '../types';

interface CategoryEntry {
    term_id: number;
    name: string;
    parent_id: number;
    children?: number[];
}

type CategoryMap = Record< string, CategoryEntry >;

// Build a hierarchically ordered list of category options.
function buildHierarchicalOptions( map: CategoryMap ): ProductCategoryOption[] {
    const INDENT = '\u00A0\u00A0\u00A0'; // 3 non-breaking spaces per level

    const result: ProductCategoryOption[] = [];

    function appendChildren( parentId: number, depth: number ) {
        const children = Object.values( map )
            .filter( ( cat ) => cat.parent_id === parentId )
            .sort( ( a, b ) => a.name.localeCompare( b.name ) );

        for ( const cat of children ) {
            result.push( {
                value: cat.term_id,
                label: INDENT.repeat( depth ) + cat.name,
            } );
            appendChildren( cat.term_id, depth + 1 );
        }
    }

    // Start from top-level categories (parent_id === 0).
    appendChildren( 0, 0 );

    return result;
}

interface UseProductCategoriesReturn {
    options: ProductCategoryOption[];
    isLoading: boolean;
}

export const useProductCategories = (): UseProductCategoriesReturn => {
    const [ options, setOptions ] = useState< ProductCategoryOption[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );

    useEffect( () => {
        apiFetch< CategoryMap >( {
            path: '/dokan/v1/products/multistep-categories',
        } )
            .then( ( data ) => {
                if (
                    ! data ||
                    typeof data !== 'object' ||
                    Array.isArray( data )
                ) {
                    setOptions( [] );
                    return;
                }
                setOptions( buildHierarchicalOptions( data ) );
            } )
            .finally( () => setIsLoading( false ) );
    }, [] );

    return { options, isLoading };
};
