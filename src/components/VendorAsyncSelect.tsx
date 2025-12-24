import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect, { type BaseSelectProps } from './AsyncSelect';
import { __, sprintf } from '@wordpress/i18n';

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
    shouldNullOnPrefetch?: boolean; // if true and prefetch runs, and current value not found, trigger onChange(null)
}

const defaultMap = ( store: any ): VendorOption => ( {
    value: store.id,
    label:
        store.store_name ||
        store.name ||
        sprintf(
            // eslint-disable-next-line @wordpress/i18n-translator-comments
            __( '(no name) #%s', 'dokan-lite' ),
            String( store?.id ?? '' )
        ),
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
        shouldNullOnPrefetch = false,
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
        VendorOption[] | []
    >( [] );

    const existsIn = ( v: VendorOption, opts: VendorOption[] ) =>
        opts.some( ( o ) => String( o.value ) === String( v.value ) );

    const mergeUnique = (
        base: VendorOption[],
        incoming: VendorOption[]
    ): VendorOption[] => {
        if ( ! Array.isArray( base ) ) {
            return Array.isArray( incoming ) ? [ ...incoming ] : [];
        }
        if ( ! Array.isArray( incoming ) || incoming.length === 0 ) {
            return base;
        }
        const seen = new Set( base.map( ( o ) => String( o.value ) ) );
        const additions = incoming.filter(
            ( o ) => ! seen.has( String( o.value ) )
        );
        return additions.length ? [ ...base, ...additions ] : base;
    };

    const prevDepsRef = useRef< {
        endpoint: string;
        perPage: number;
        buildQuery?: VendorAsyncSelectProps[ 'buildQuery' ];
        extraQueryKey: string;
    } >();

    const skipMergeDueToDepsRef = useRef< boolean >( false );

    // Track if we've already attempted a load on first menu open to avoid duplicate calls
    const hasLoadedOnOpenRef = useRef< boolean >( false );

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
        if ( depsChanged ) {
            skipMergeDueToDepsRef.current = true;
        }
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

            const runNullCheck =
                ( depsChanged && !! value ) ||
                ( shouldNullOnPrefetch && prefetch && !! value );

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
        shouldNullOnPrefetch,
    ] );

    // Ensure controlled value(s) exist in prefetchedOptions (when prefetch is enabled)
    useEffect( () => {
        const current = ( rest as any )?.value as
            | VendorOption
            | VendorOption[]
            | null
            | undefined;
        if ( ! current ) {
            return;
        }
        setPrefetchedOptions( ( prev ) => {
            const base = prev || [];
            if ( Array.isArray( current ) ) {
                const missing = current.filter( ( v ) => {
                    return (
                        v &&
                        typeof v.value !== 'undefined' &&
                        typeof v.label === 'string' &&
                        ! existsIn( v, base )
                    );
                } );
                return missing.length ? [ ...base, ...missing ] : base;
            }
            const v = current as VendorOption;
            if (
                v &&
                typeof v.value !== 'undefined' &&
                typeof v.label === 'string' &&
                ! existsIn( v, base )
            ) {
                return [ ...base, v ];
            }
            return base;
        } );
    }, [ prefetch, rest ] );

    const depsSignature = JSON.stringify( {
        endpoint,
        perPage,
        buildQuery: !! buildQuery,
        extraQuery,
    } );

    // Preserve potential user-supplied onMenuOpen
    const userOnMenuOpen = ( rest as any )?.onMenuOpen as
        | ( ( ...args: any[] ) => void )
        | undefined;

    return (
        <AsyncSelect
            key={ depsSignature }
            cacheOptions
            defaultOptions={ prefetchedOptions }
            loadOptions={ async ( inputValue: string ) => {
                const results = await loader( inputValue );
                if ( Array.isArray( prefetchedOptions ) ) {
                    if ( ! skipMergeDueToDepsRef.current ) {
                        setPrefetchedOptions( ( prev ) =>
                            mergeUnique(
                                prev || [],
                                Array.isArray( results ) ? results : []
                            )
                        );
                    }
                }
                if ( inputValue && inputValue.trim() !== '' ) {
                    skipMergeDueToDepsRef.current = false;
                }
                return results;
            } }
            instanceId={ `vendor-async-${ depsSignature }` }
            selectedTitle={ __( 'Vendor', 'dokan-lite' ) }
            { ...rest }
            onMenuOpen={ async () => {
                try {
                    if (
                        ! prefetch &&
                        ! hasLoadedOnOpenRef.current &&
                        ( ! Array.isArray( prefetchedOptions ) ||
                            prefetchedOptions.length === 0 )
                    ) {
                        hasLoadedOnOpenRef.current = true;
                        const options = await loader( '' );
                        setPrefetchedOptions(
                            Array.isArray( options ) ? options : []
                        );
                    }
                } finally {
                    if ( typeof userOnMenuOpen === 'function' ) {
                        userOnMenuOpen();
                    }
                }
            } }
        />
    );
}

export default VendorAsyncSelect;
