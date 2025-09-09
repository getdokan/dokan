import { useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import Select from './Select';
import type { SelectProps, DefaultOption } from './Select';

export interface SellerBadgeOption extends DefaultOption {
    value: number | string;
    label: string;
    raw?: any;
}

export interface SellerBadgeSelectProps
    extends SelectProps< SellerBadgeOption > {
    endpoint?: string; // REST path
    mapOption?: ( badge: any ) => SellerBadgeOption;
    badgeStatus?: string; // default: 'all'
    perPage?: number; // default: -1 (all)
}

// Module-level cache to prevent refetch across unmounts/remounts
const sellerBadgeCache = new Map< string, SellerBadgeOption[] >();

const defaultMap = ( badge: any ): SellerBadgeOption => ( {
    value: badge?.id ?? badge?.ID ?? String( badge?.id ?? badge?.ID ?? '' ),
    label: badge?.badge_name,
    raw: badge,
} );

function SellerBadgeSelect( props: SellerBadgeSelectProps ) {
    const {
        endpoint = '/dokan/v1/seller-badge',
        mapOption = defaultMap,
        badgeStatus = 'all',
        perPage = -1,
        ...rest
    } = props;

    const [ options, setOptions ] = useState< SellerBadgeOption[] >( [] );
    const [ loaded, setLoaded ] = useState( false );
    const hasFetchedRef = useRef( false );

    useEffect( () => {
        let cancelled = false;
        ( async () => {
            if ( hasFetchedRef.current ) {
                return;
            }

            const cacheKey = JSON.stringify( {
                endpoint,
                badgeStatus,
                perPage,
            } );
            const cached = sellerBadgeCache.get( cacheKey );
            if ( cached ) {
                setOptions( cached );
                hasFetchedRef.current = true;
                setLoaded( true );
                return;
            }

            try {
                const path = addQueryArgs( endpoint, {
                    badge_status: badgeStatus,
                    per_page: perPage,
                } );
                const data = await apiFetch< any[] >( { path } );
                if ( cancelled ) {
                    return;
                }
                const mapped = Array.isArray( data )
                    ? data.map( ( b ) => mapOption( b ) )
                    : [];
                sellerBadgeCache.set( cacheKey, mapped );
                setOptions( mapped );
            } catch ( e ) {
                setOptions( [] );
            } finally {
                if ( ! cancelled ) {
                    hasFetchedRef.current = true;
                    setLoaded( true );
                }
            }
        } )();
        return () => {
            cancelled = true;
        };
    }, [] );

    // Ensure controlled values are present in options so the control can display them.
    useEffect( () => {
        const value = ( rest as any )?.value as
            | SellerBadgeOption
            | SellerBadgeOption[]
            | null
            | undefined;
        if ( ! value ) {
            return;
        }
        setOptions( ( prev ) => {
            const base = Array.isArray( prev ) ? prev : [];
            const exists = ( v: SellerBadgeOption ) =>
                base.some( ( o ) => String( o.value ) === String( v.value ) );
            if ( Array.isArray( value ) ) {
                const add = value.filter(
                    ( v ) =>
                        v &&
                        typeof v.value !== 'undefined' &&
                        typeof v.label === 'string' &&
                        ! exists( v )
                );
                return add.length ? [ ...base, ...add ] : base;
            }
            const v = value as SellerBadgeOption;
            if (
                v &&
                typeof v.value !== 'undefined' &&
                typeof v.label === 'string' &&
                ! exists( v )
            ) {
                return [ ...base, v ];
            }
            return base;
        } );
    }, [ rest ] );

    const allOptions = options;

    // For SearchableSelect, we provide all options and let built-in filtering handle it.
    // If we need custom filtering, we could pass a filterOption prop, but defaults should suffice.

    // Stable instance id to avoid unnecessary remounts across parent re-renders
    const instanceIdRef = useRef(
        `seller-badge-${ Math.random().toString( 36 ).slice( 2 ) }`
    );

    return (
        <Select< SellerBadgeOption >
            options={ allOptions }
            isLoading={ ! loaded }
            instanceId={ instanceIdRef.current }
            { ...rest }
        />
    );
}

export default SellerBadgeSelect;
