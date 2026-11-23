import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import AsyncSelect, { type BaseSelectProps } from './AsyncSelect';
import { __, sprintf } from '@wordpress/i18n';
import { ReactSelect } from '@getdokan/dokan-ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CustomerOption {
    value: number;
    label: string;
    raw?: any;
}

export interface CustomerAsyncSelectProps
    extends BaseSelectProps< CustomerOption > {
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( customer: any ) => CustomerOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< CustomerOption[] >; // allow override
    prefetch?: boolean; // fetch options on mount or when dependencies change, not only on menu open
    shouldNullOnPrefetch?: boolean; // if true and prefetch runs, and current value not found, trigger onChange(null)
}

const defaultMap = ( customer: any ): CustomerOption => {
    let label = customer.name || customer.email || customer.username;

    if ( ! label && customer.first_name && customer.last_name ) {
        label = `${ customer.first_name } ${ customer.last_name }`;
    } else if ( ! label && ( customer.first_name || customer.last_name ) ) {
        label = customer.first_name || customer.last_name;
    }

    if ( ! label ) {
        /* eslint-disable @wordpress/i18n-translator-comments */
        label = sprintf(
            __( 'Customer #%s', 'dokan-lite' ),
            String( customer?.id )
        );
        /* eslint-enable @wordpress/i18n-translator-comments */
    }

    return {
        value: customer.id,
        label,
        raw: customer,
    };
};

const CustomerOptionRow = ( props: any ) => {
    const { data, innerRef, innerProps } = props;
    return (
        <div
            ref={ innerRef }
            { ...innerProps }
            className="dokan-layout"
            style={ {
                backgroundColor: props.isFocused ? '#F4F1FE' : 'transparent',
            } }
        >
            <div className="group px-4 py-2 cursor-pointer hover:bg-[#EFEAFF]">
                { ( data?.raw?.first_name || data?.raw?.last_name ) && (
                    <div className="font-semibold text-sm text-[#25252D] group-hover:text-[#7047EB]">
                        { sprintf(
                            /* translators: %1$s: First name, %2$s: Last name */
                            __( '%1$s %2$s', 'dokan-lite' ),
                            data?.raw?.first_name,
                            data?.raw?.last_name
                        ) }
                    </div>
                ) }
                { data.raw?.email && (
                    <div className="text-xs text-[#A5A5AA] mt-1">
                        { data.raw?.email }
                    </div>
                ) }
            </div>
        </div>
    );
};

const CustomerSingleValue = ( props: any ) => {
    const { components } = ReactSelect;
    return (
        <components.SingleValue { ...props }>
            <div className="text-sm leading-5">{ props.children }</div>
        </components.SingleValue>
    );
};

const DropdownIndicator = ( indicatorProps: any ) => {
    const { components } = ReactSelect;
    const isOpen = indicatorProps.selectProps.menuIsOpen;

    return (
        <components.DropdownIndicator { ...indicatorProps }>
            <div className="text-gray-400">
                { isOpen ? (
                    <ChevronUp size={ 16 } />
                ) : (
                    <ChevronDown size={ 16 } />
                ) }
            </div>
        </components.DropdownIndicator>
    );
};

function CustomerAsyncSelect( props: CustomerAsyncSelectProps ) {
    const {
        endpoint = '/dokan/v1/customers',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        prefetch = false,
        shouldNullOnPrefetch = false,
        components: userComponents,
        ...rest
    } = props;

    const loadCustomers = useCallback(
        async ( inputValue: string ): Promise< CustomerOption[] > => {
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

                return data.map( ( customer: any ) => mapOption( customer ) );
            } catch ( e ) {
                return [];
            }
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    const loader = userLoadOptions || loadCustomers;

    const [ prefetchedOptions, setPrefetchedOptions ] = useState<
        CustomerOption[] | []
    >( [] );

    const existsIn = ( v: CustomerOption, opts: CustomerOption[] ) =>
        opts.some( ( o ) => String( o.value ) === String( v.value ) );

    const mergeUnique = (
        base: CustomerOption[],
        incoming: CustomerOption[]
    ): CustomerOption[] => {
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
        buildQuery?: CustomerAsyncSelectProps[ 'buildQuery' ];
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
                | CustomerOption
                | CustomerOption[]
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
                    ! existsIn( value as CustomerOption, options )
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
            | CustomerOption
            | CustomerOption[]
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
            const v = current as CustomerOption;
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

    // Merge default customer components with user overrides
    // Don't spread all userComponents to preserve AsyncSelect's
    const customerComponents = {
        Option: userComponents?.Option || CustomerOptionRow,
        SingleValue: userComponents?.SingleValue || CustomerSingleValue,
        DropdownIndicator,
        ...userComponents,
    };

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
            instanceId={ `customer-async-${ depsSignature }` }
            components={ { ...customerComponents } }
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

export default CustomerAsyncSelect;
