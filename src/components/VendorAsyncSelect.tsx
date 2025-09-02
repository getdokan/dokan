import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import DokanAsyncSelect from './DokanAsyncSelect';

export interface VendorOption {
    value: number;
    label: string;
    raw?: any;
}

export interface VendorAsyncSelectProps extends Record< string, any > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( store: any ) => VendorOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< VendorOption[] >; // allow override
}

const defaultMap = ( store: any ): VendorOption => ( {
    value: store.id,
    label: store.store_name || store.name || `Store #${ store?.id }`,
    raw: store,
} );

function VendorAsyncSelect( props: VendorAsyncSelectProps ) {
    const {
        endpoint = '/dokan/v1/stores',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        ...rest
    } = props;

    const loadVendors = async (
        inputValue: string
    ): Promise< VendorOption[] > => {
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

            return data.map( ( store: any ) => mapOption( store ) );
        } catch ( e ) {
            return [];
        }
    };

    return (
        <DokanAsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={ userLoadOptions || loadVendors }
            { ...rest }
        />
    );
}

export default VendorAsyncSelect;
