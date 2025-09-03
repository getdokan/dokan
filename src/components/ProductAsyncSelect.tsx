import { useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect from './AsyncSelect';

export interface ProductOption {
    value: number;
    label: string;
    raw?: any;
}

export interface ProductAsyncSelectProps extends Record< string, any > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( product: any ) => ProductOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< ProductOption[] >; // allow override
}

const defaultMap = ( product: any ): ProductOption => ( {
    value: product.id,
    label: product.name || `Product #${ product?.id }`,
    raw: product,
} );

function ProductAsyncSelect( props: ProductAsyncSelectProps ) {
    const {
        endpoint = '/dokan/v2/products',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        ...rest
    } = props;

    const loadProducts = useCallback(
        async ( inputValue: string ): Promise< ProductOption[] > => {
            try {
                const query = buildQuery
                    ? buildQuery( inputValue )
                    : {
                          search: inputValue || '',
                          per_page: perPage,
                          ...extraQuery,
                      };

                const data = await apiFetch< any[] >( {
                    path: addQueryArgs( endpoint, query ),
                } );

                if ( ! Array.isArray( data ) ) {
                    return [];
                }

                return data.map( ( product: any ) => mapOption( product ) );
            } catch ( e ) {
                return [];
            }
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={ userLoadOptions || loadProducts }
            { ...rest }
        />
    );
}

export default ProductAsyncSelect;
