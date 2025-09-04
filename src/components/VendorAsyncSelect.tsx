import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect, { type BaseSelectProps } from './AsyncSelect';

export interface VendorOption {
    value: number;
    label: string;
    raw?: any;
}

export interface VendorAsyncSelectProps
    extends BaseSelectProps< VendorOption > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( store: any ) => VendorOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< VendorOption[] >; // allow override
    prefetch?: boolean; // fetch options on mount or when dependencies change, not only on menu open
    strictPrefetchValidation?: boolean; // if true and prefetch runs, and current value not found, trigger onChange(null)
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
        prefetch = false,
        strictPrefetchValidation = false,
        ...rest
    } = props;

    const loadVendors = useCallback(
        async ( inputValue: string ): Promise< VendorOption[] > => {
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
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    const loader = userLoadOptions || loadVendors;

    const [ prefetchedOptions, setPrefetchedOptions ] = useState<
        VendorOption[] | null
    >( null );

    const prevDepsRef = useRef< {
        endpoint: string;
        perPage: number;
        buildQuery?: VendorAsyncSelectProps[ 'buildQuery' ];
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

        const shouldFetch = ( prefetch && ! prev ) || depsChanged;
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
                | VendorOption
                | VendorOption[]
                | null
                | undefined;
            const onChange = ( rest as any )?.onChange as
                | ( ( value: any ) => void )
                | undefined;

            const existsIn = ( v: VendorOption, opts: VendorOption[] ) => {
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
                    ! existsIn( value as VendorOption, options )
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
    ] );

    const defaultOptionsProp: any =
        prefetch && prefetchedOptions ? prefetchedOptions : false;

    const depsSignature = JSON.stringify( {
        endpoint,
        perPage,
        buildQuery: !! buildQuery,
        extraQuery,
    } );

    return (
        <AsyncSelect
            key={ depsSignature }
            cacheOptions
            defaultOptions={ defaultOptionsProp }
            loadOptions={ ( inputValue: string ) => loader( inputValue ) }
            instanceId={ `vendor-async-${ depsSignature }` }
            { ...rest }
        />
    );
}

export default VendorAsyncSelect;
