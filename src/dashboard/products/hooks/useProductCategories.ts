import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { ProductCategoryOption } from '../types';

interface CategoryNode {
    id: number;
    name: string;
    parent?: number;
    children?: CategoryNode[];
}

function flattenCategories( nodes: CategoryNode[] ): ProductCategoryOption[] {
    const result: ProductCategoryOption[] = [];

    const visit = ( node: CategoryNode ) => {
        result.push( { value: node.id, label: node.name } );
        if ( node.children ) {
            node.children.forEach( visit );
        }
    };

    nodes.forEach( visit );

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
        apiFetch< CategoryNode[] >( {
            path: '/dokan/v1/products/multistep-categories',
        } )
            .then( ( data ) => {
                setOptions( flattenCategories( Array.isArray( data ) ? data : [] ) );
            } )
            .catch( ( err ) => {
                console.error( 'Error fetching product categories:', err );
            } )
            .finally( () => setIsLoading( false ) );
    }, [] );

    return { options, isLoading };
};
