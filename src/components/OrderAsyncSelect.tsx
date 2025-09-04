import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect, { type BaseSelectProps } from './AsyncSelect';

export interface OrderOption {
    value: number;
    label: string;
    raw?: any;
}

export interface OrderAsyncSelectProps extends BaseSelectProps< OrderOption > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( order: any ) => OrderOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< OrderOption[] >; // allow override
    prefetch?: boolean; // fetch options on mount or when dependencies change, not only on menu open
    strictPrefetchValidation?: boolean; // if true and prefetch runs, and current value not found, trigger onChange(null)
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
        prefetch = false,
        strictPrefetchValidation = false,
        ...rest
    } = props;

    const loadOrders = useCallback(
        async ( inputValue: string ): Promise< OrderOption[] > => {
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
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    const loader = userLoadOptions || loadOrders;

    const [ prefetchedOptions, setPrefetchedOptions ] = useState<
        OrderOption[] | null
    >( null );

    const prevDepsRef = useRef< {
        endpoint: string;
        perPage: number;
        buildQuery?: OrderAsyncSelectProps[ 'buildQuery' ];
        extraQueryKey: string;
    } >();

    // Prefetch and refetch on dependency changes
    useEffect( () => {
        const extraQueryKey = JSON.stringify( extraQuery ?? {} );
        const prev = prevDepsRef.current;
        const depsChanged =
            !! prev &&
            ( prev.endpoint !== endpoint ||
                prev.perPage !== perPage ||
                prev.buildQuery !== buildQuery ||
                prev.extraQueryKey !== extraQueryKey );

        const shouldFetch = prefetch || depsChanged;
        if ( ! shouldFetch ) {
            // Initialize ref even if not fetching yet
            if ( ! prev ) {
                prevDepsRef.current = {
                    endpoint,
                    perPage,
                    buildQuery,
                    extraQueryKey,
                };
            }
            return;
        }

        let cancelled = false;
        ( async () => {
            const options = await loader( '' );
            if ( cancelled ) {
                return;
            }
            setPrefetchedOptions( options );

            // Validation logic when refetching due to dependency changes
            const value = ( rest as any )?.value as
                | OrderOption
                | OrderOption[]
                | null
                | undefined;
            const onChange = ( rest as any )?.onChange as
                | ( ( value: any ) => void )
                | undefined;

            const existsIn = ( v: OrderOption, opts: OrderOption[] ) => {
                return opts.some(
                    ( o ) => String( o.value ) === String( v.value )
                );
            };

            const shouldNullOnPrefetch = prefetch && strictPrefetchValidation;

            const runNullCheck =
                ( depsChanged && !! value ) ||
                ( shouldNullOnPrefetch && !! value );

            if ( runNullCheck && onChange ) {
                if ( Array.isArray( value ) ) {
                    const allExist = value.every( ( v ) =>
                        existsIn( v, options )
                    );
                    if ( ! allExist ) {
                        onChange( null as any );
                    }
                } else if (
                    value &&
                    ! existsIn( value as OrderOption, options )
                ) {
                    onChange( null as any );
                }
            }

            // update previous deps snapshot
            prevDepsRef.current = {
                endpoint,
                perPage,
                buildQuery,
                extraQueryKey,
            };
        } )();

        return () => {
            cancelled = true;
        };
    }, [
        endpoint,
        perPage,
        buildQuery,
        extraQuery,
        prefetch,
        strictPrefetchValidation,
        loader,
        rest,
    ] );

    const defaultOptionsProp: any =
        prefetch && prefetchedOptions ? prefetchedOptions : true;

    return (
        <AsyncSelect
            cacheOptions
            defaultOptions={ defaultOptionsProp }
            loadOptions={ loader }
            { ...rest }
        />
    );
}

export default OrderAsyncSelect;
