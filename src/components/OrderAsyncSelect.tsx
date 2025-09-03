import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import DokanAsyncSelect from './DokanAsyncSelect';

export interface OrderOption {
    value: number;
    label: string;
    raw?: any;
}

export interface OrderAsyncSelectProps extends Record< string, any > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( order: any ) => OrderOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< OrderOption[] >; // allow override
}

const defaultMap = ( order: any ): OrderOption => ( {
    value: order.id,
    label: order.number ? `Order #${ order.number }` : `Order #${ order?.id }`,
    raw: order,
} );

function OrderAsyncSelect( props: OrderAsyncSelectProps ) {
    const {
        endpoint = '/dokan/v2/orders',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        ...rest
    } = props;

    const loadOrders = async (
        inputValue: string
    ): Promise< OrderOption[] > => {
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

            return data.map( ( order: any ) => mapOption( order ) );
        } catch ( e ) {
            return [];
        }
    };

    return (
        <DokanAsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={ userLoadOptions || loadOrders }
            { ...rest }
        />
    );
}

export default OrderAsyncSelect;
