import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect, { type BaseSelectProps } from './AsyncSelect';
import { __, sprintf } from '@wordpress/i18n';

export interface CouponOption {
    value: number;
    label: string;
    raw?: any;
}

export interface CouponAsyncSelectProps
    extends BaseSelectProps< CouponOption > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( coupon: any ) => CouponOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< CouponOption[] >; // allow override
    prefetch?: boolean; // fetch options on mount or when dependencies change, not only on menu open
    shouldNullOnPrefetch?: boolean; // if true and prefetch runs, and current value not found, trigger onChange(null)
}

const defaultMap = ( coupon: any ): CouponOption => ( {
    value: coupon.id,
    label:
        coupon.code ||
        coupon.post_title ||
        coupon.name ||
        // eslint-disable-next-line @wordpress/i18n-translator-comments
        sprintf( __( 'Coupon #%s', 'dokan-lite' ), String( coupon?.id ) ),
    raw: coupon,
} );

function CouponAsyncSelect( props: CouponAsyncSelectProps ) {
    const {
        endpoint = '/dokan/v1/coupons',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        prefetch = false,
        shouldNullOnPrefetch = false,
        ...rest
    } = props;

    const loadCoupons = useCallback(
        async ( inputValue: string ): Promise< CouponOption[] > => {
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
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    const loader = userLoadOptions || loadCoupons;

    const [ prefetchedOptions, setPrefetchedOptions ] = useState<
        CouponOption[] | []
    >( [] );

    const existsIn = ( v: CouponOption, opts: CouponOption[] ) =>
        opts.some( ( o ) => String( o.value ) === String( v.value ) );

    const mergeUnique = (
        base: CouponOption[],
        incoming: CouponOption[]
    ): CouponOption[] => {
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
        buildQuery?: CouponAsyncSelectProps[ 'buildQuery' ];
        extraQueryKey: string;
    } >();

    const skipMergeDueToDepsRef = useRef< boolean >( false );

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
                | CouponOption
                | CouponOption[]
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
                    ! existsIn( value as CouponOption, options )
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

    const defaultOptionsProp: any = prefetchedOptions;

    // Ensure controlled value(s) exist in prefetchedOptions
    useEffect( () => {
        const current = ( rest as any )?.value as
            | CouponOption
            | CouponOption[]
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
            const v = current as CouponOption;
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

    // Track if we've already attempted a load on first menu open to avoid duplicate calls
    const hasLoadedOnOpenRef = useRef< boolean >( false );

    return (
        <AsyncSelect
            key={ depsSignature }
            cacheOptions
            defaultOptions={ defaultOptionsProp }
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
            instanceId={ `coupon-async-${ depsSignature }` }
            selectedTitle={ __( 'Coupon', 'dokan-lite' ) }
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

export default CouponAsyncSelect;
