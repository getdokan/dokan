import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { ProductMonthOption } from '../types';

interface UseProductMonthsReturn {
    options: ProductMonthOption[];
    isLoading: boolean;
}

export const useProductMonths = (): UseProductMonthsReturn => {
    const [ options, setOptions ] = useState< ProductMonthOption[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );

    useEffect( () => {
        apiFetch< ProductMonthOption[] >( {
            path: '/dokan/v1/products/months',
        } )
            .then( ( data ) => {
                setOptions( Array.isArray( data ) ? data : [] );
            } )
            .catch( ( err ) => {
                console.error( 'Error fetching product months:', err );
            } )
            .finally( () => setIsLoading( false ) );
    }, [] );

    return { options, isLoading };
};
