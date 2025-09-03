import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect from './AsyncSelect';

export interface CouponOption {
    value: number;
    label: string;
    raw?: any;
}

export interface CouponAsyncSelectProps extends Record< string, any > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( coupon: any ) => CouponOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< CouponOption[] >; // allow override
}

const defaultMap = ( coupon: any ): CouponOption => ( {
    value: coupon.id,
    label:
        coupon.code ||
        coupon.post_title ||
        coupon.name ||
        `Coupon #${ coupon?.id }`,
    raw: coupon,
} );

function CouponAsyncSelect( props: CouponAsyncSelectProps ) {
    const {
        // WooCommerce core coupons endpoint is /wc/v3/coupons when authenticated.
        // Dokan may proxy or have its own; allow override via props. Provide a sensible default.
        endpoint = '/dokan/v1/coupons',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        ...rest
    } = props;

    const loadCoupons = async (
        inputValue: string
    ): Promise< CouponOption[] > => {
        try {
            const query = buildQuery
                ? buildQuery( inputValue )
                : {
                      search: inputValue || '',
                      per_page: perPage,
                      // Many WC coupon endpoints support search by code via search param
                      ...extraQuery,
                  };

            const data = await apiFetch< any[] >( {
                path: addQueryArgs( endpoint, query ),
            } );

            if ( ! Array.isArray( data ) ) {
                return [];
            }

            return data.map( ( coupon: any ) => mapOption( coupon ) );
        } catch ( e ) {
            return [];
        }
    };

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions
            loadOptions={ userLoadOptions || loadCoupons }
            { ...rest }
        />
    );
}

export default CouponAsyncSelect;
