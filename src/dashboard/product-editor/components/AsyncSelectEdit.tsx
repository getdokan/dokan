/* eslint-disable import/no-extraneous-dependencies */
import { Select } from '@src/components';
import { TaggableSelect } from '@getdokan/dokan-ui';
import CustomField, { getValidationError } from './CustomField';
import { components as rsComponents } from 'react-select';
import { CheckSquare, Square } from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { debounce } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from '@wordpress/element';

type FieldProps = {
    data: any;
    field: any;
    onChange: ( value: any ) => void;
    validity?: any;
};

type TreeOption = {
    value: string | number;
    label: string;
    level?: number;
    children?: TreeOption[];
};

// Term names arrive HTML-encoded (e.g. "Hello &amp; World") from the REST endpoints and
// schema-resolved saved values; decode each option's label so menus and chips read naturally.
const decodeLabel = ( option: any ) =>
    option && typeof option.label === 'string'
        ? { ...option, label: decodeEntities( option.label ) }
        : option;

// Decode the selected value(s), which may be a single option, an array, or nullish.
const decodeValue = ( value: any ) =>
    Array.isArray( value ) ? value.map( decodeLabel ) : decodeLabel( value );

// Wrapper that satisfies @wordpress/compose debounce's `(...args: unknown[])` constraint.
const debounced = ( fn: ( ...args: any[] ) => void ) =>
    debounce( ( ...args: unknown[] ) => fn( ...args ), 300 );

const OPTIONS_PER_PAGE = 20;

// How close to the end of the menu list (in px) a scroll must get before the
// next page is requested.
const LOAD_MORE_THRESHOLD_PX = 24;

type OptionsPage = { options: any[]; hasMore: boolean; failed: boolean };

// Fetch one page of `{ value, label }` options from an endpoint, optionally
// filtered by `search`. `hasMore` is inferred from receiving a full page:
// apiFetch only exposes response headers under `parse: false`, so reading
// X-WP-TotalPages would mean unwrapping every response by hand. The only cost
// is one empty request when the total is an exact multiple of the page size.
// A failed request is reported separately from an empty page so the caller
// can leave its paging state intact and retry.
const fetchOptions = async (
    endpoint?: string,
    search = '',
    page = 1
): Promise< OptionsPage > => {
    if ( ! endpoint ) {
        return { options: [], hasMore: false, failed: false };
    }
    try {
        const result: any = await apiFetch( {
            path: addQueryArgs( endpoint, {
                search,
                per_page: OPTIONS_PER_PAGE,
                page,
            } ),
        } );
        const options = Array.isArray( result )
            ? result.map( ( item: any ) => ( {
                  value: item.id,
                  label: decodeEntities( item.name ),
              } ) )
            : [];
        return {
            options,
            hasMore: options.length === OPTIONS_PER_PAGE,
            failed: false,
        };
    } catch {
        return { options: [], hasMore: false, failed: true };
    }
};

// Keep the first occurrence of each option value. Terms can shift between
// pages while browsing (e.g. a tag created mid-session), so appended pages may
// repeat an option that is already listed.
const dedupeByValue = ( items: any[] ): any[] => {
    const seen = new Set();
    const unique: any[] = [];
    for ( const item of items ) {
        if ( ! seen.has( item.value ) ) {
            seen.add( item.value );
            unique.push( item );
        }
    }
    return unique;
};

// Options state shared by the non-tree async fields. Page 1 is fetched when
// the menu first opens and replaces the list; scrolling the open menu near its
// end appends the next page for the current search term; a new search resets
// to page 1; and clearing the input (blur, menu close, selection) drops the
// stale search so the next open shows the unfiltered list again.
const usePaginatedOptions = ( endpoint?: string ) => {
    const [ options, setOptions ] = useState< any[] >( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ hasError, setHasError ] = useState( false );
    // Mutable request state: lets event handlers read the latest page/search
    // without re-rendering, and `requestId` discards responses that arrive
    // after a newer request has been issued.
    const stateRef = useRef( {
        search: '',
        page: 1,
        hasMore: false,
        loaded: false, // page 1 of the current search has been fetched
        loading: false,
        searchPending: false, // a debounced search is waiting to fire
        inFlight: { search: '', page: 1 }, // what the current request asked for
        menuOpen: false,
        requestId: 0,
    } );

    const load = useCallback(
        ( search: string, page: number ) => {
            const requestId = ++stateRef.current.requestId;
            stateRef.current.loading = true;
            stateRef.current.searchPending = false;
            stateRef.current.inFlight = { search, page };
            setIsLoading( true );
            fetchOptions( endpoint, search, page ).then( ( result ) => {
                if ( requestId !== stateRef.current.requestId ) {
                    return; // superseded by a newer search/page request
                }
                if ( result.failed ) {
                    // Leave search/page/hasMore untouched so the next scroll
                    // or menu open retries this same page.
                    stateRef.current.loading = false;
                    setIsLoading( false );
                    setHasError( true );
                    return;
                }
                stateRef.current = {
                    ...stateRef.current,
                    search,
                    page,
                    hasMore: result.hasMore,
                    loaded: true,
                    loading: false,
                };
                setHasError( false );
                setIsLoading( false );
                setOptions( ( previous ) =>
                    page === 1
                        ? result.options
                        : dedupeByValue( [ ...previous, ...result.options ] )
                );
            } );
        },
        [ endpoint ]
    );

    const onSearch = useMemo(
        () => debounced( ( input: string ) => load( input, 1 ) ),
        [ load ]
    );

    const loadMore = useCallback( () => {
        const { search, page, hasMore, loaded, loading } = stateRef.current;
        if ( loaded && hasMore && ! loading ) {
            load( search, page + 1 );
        }
    }, [ load ] );

    const onInputChange = useCallback(
        ( input: string, meta: any ) => {
            if ( meta.action === 'input-change' ) {
                // Blank the list straight away so the loading state gives
                // feedback during the debounce + round trip instead of the
                // previous results sitting there looking ignored.
                stateRef.current.searchPending = true;
                setOptions( [] );
                setIsLoading( true );
                onSearch( input );
            } else if ( meta.prevInputValue ) {
                // react-select clears its own input on blur, menu close and
                // selection; drop the stale search so the next open shows
                // page 1 of the unfiltered list again. Those actions fire in
                // quick succession for one selection, so skip when that reset
                // is already in flight.
                const { loading, inFlight } = stateRef.current;
                if (
                    loading &&
                    inFlight.search === '' &&
                    inFlight.page === 1
                ) {
                    return;
                }
                onSearch.cancel();
                load( '', 1 );
            }
        },
        [ load, onSearch ]
    );

    const onMenuOpen = useCallback( () => {
        stateRef.current.menuOpen = true;
        const { loaded, loading, searchPending } = stateRef.current;
        // Lazy initial load: nothing is fetched until the vendor opens the
        // menu. Skipped when a typed search is already about to fire.
        if ( ! loaded && ! loading && ! searchPending ) {
            load( '', 1 );
        }
    }, [ load ] );

    const onMenuClose = useCallback( () => {
        stateRef.current.menuOpen = false;
    }, [] );

    // Detect the menu list being scrolled near its end. react-select's own
    // onMenuScrollToBottom only listens to wheel/touch events and is disabled
    // entirely on touch-capable devices, so listen for native scroll events
    // instead (captured at the document because scroll does not bubble and
    // the menu renders in a portal). This fires for wheel, touch, scrollbar
    // drag and keyboard navigation alike. The menu list is identified by its
    // listbox role, and only while this field's menu is open.
    useEffect( () => {
        const onScroll = ( event: Event ) => {
            const target = event.target as HTMLElement | null;
            if (
                ! stateRef.current.menuOpen ||
                ! target ||
                typeof target.getAttribute !== 'function' ||
                target.getAttribute( 'role' ) !== 'listbox'
            ) {
                return;
            }
            const remaining =
                target.scrollHeight - target.scrollTop - target.clientHeight;
            if ( remaining < LOAD_MORE_THRESHOLD_PX ) {
                loadMore();
            }
        };
        document.addEventListener( 'scroll', onScroll, true );
        return () => document.removeEventListener( 'scroll', onScroll, true );
    }, [ loadMore ] );

    // Reset when the endpoint changes so the old endpoint's options never
    // show against the new one; the next menu open fetches page 1 afresh.
    useEffect( () => {
        stateRef.current = {
            ...stateRef.current,
            search: '',
            page: 1,
            hasMore: false,
            loaded: false,
            searchPending: false,
        };
        setOptions( [] );
        setHasError( false );
        if ( stateRef.current.menuOpen ) {
            load( '', 1 );
        }
        return () => onSearch.cancel();
    }, [ load, onSearch ] );

    const noOptionsMessage = useCallback(
        () =>
            hasError
                ? __(
                      'Could not load options. Please try again.',
                      'dokan-lite'
                  )
                : __( 'No options', 'dokan-lite' ),
        [ hasError ]
    );

    return {
        options,
        isLoading,
        onInputChange,
        onMenuOpen,
        onMenuClose,
        noOptionsMessage,
    };
};

// Flatten a nested tree into ordered options carrying their depth level.
const flattenTree = ( options: TreeOption[], level = 0 ): TreeOption[] =>
    options.reduce( ( acc: TreeOption[], option ) => {
        acc.push( { ...option, level } );
        if ( option.children?.length ) {
            acc.push( ...flattenTree( option.children, level + 1 ) );
        }
        return acc;
    }, [] );

// Indented option with a checkbox — the product editor's tree picker look.
const TreeOptionComponent = ( props: any ) => {
    const { data, isSelected, children } = props;
    return (
        <rsComponents.Option { ...props }>
            <div
                style={ {
                    paddingLeft: `${ ( data.level || 0 ) * 20 + 10 }px`,
                } }
                className="flex items-center gap-2"
            >
                { isSelected ? (
                    <CheckSquare size={ 16 } />
                ) : (
                    <Square size={ 16 } />
                ) }
                { children }
            </div>
        </rsComponents.Option>
    );
};

// Only offer "create" for a non-empty, non-duplicate entry; let extensions override.
const makeIsValidNewOption =
    ( field: any, data: any ) =>
    (
        inputValue: string,
        selectValue: readonly any[],
        selectOptions: readonly any[]
    ) => {
        const trimmed = inputValue.trim();
        const matches = ( option: any ) =>
            String( option?.label )
                .trim()
                .toLowerCase() === trimmed.toLowerCase();
        const isValid =
            !! trimmed &&
            ! selectValue.some( matches ) &&
            ! selectOptions.some( matches );

        return applyFilters(
            'dokan_product_editor_is_valid_new_option',
            isValid,
            inputValue,
            field,
            data
        ) as boolean;
    };

// Categories etc.: load the full nested tree once and render it indented.
const TreeSelectField = ( { data, field, onChange, validity }: FieldProps ) => {
    const [ options, setOptions ] = useState< TreeOption[] >( [] );

    useEffect( () => {
        let active = true;
        apiFetch( { path: field.api_endpoint } )
            .then(
                ( result: any ) =>
                    active &&
                    setOptions(
                        flattenTree(
                            Array.isArray( result ) ? result : []
                        ).map( decodeLabel )
                    )
            )
            .catch( () => {} );
        return () => {
            active = false;
        };
    }, [ field.api_endpoint ] );

    // Storage stays an array of option objects regardless of single/multiple, so the
    // payload resolver keeps working; only the value/onChange shapes are adapted for
    // react-select's single-select mode.
    const selected = Array.isArray( data[ field.id ] )
        ? data[ field.id ].map( decodeLabel )
        : [];
    const value = field.multiple ? selected : selected[ 0 ] ?? null;

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <Select
                isMulti={ field.multiple }
                options={ options }
                value={ value }
                placeholder={ field.placeholder }
                closeMenuOnSelect={ !! field.multiple }
                hideSelectedOptions={ false }
                // @ts-ignore indented tree option
                components={ { Option: TreeOptionComponent } }
                onChange={ ( next: any ) => {
                    let normalized: any[] = [];
                    if ( field.multiple ) {
                        normalized = next ?? [];
                    } else if ( next ) {
                        normalized = [ next ];
                    }
                    onChange( { [ field.id ]: normalized } );
                } }
            />
        </CustomField>
    );
};

// Tags etc.: searchable creatable select. TaggableSelect is synchronous, so server
// results are fed in through state and refreshed as the user types.
const CreatableSelectField = ( {
    data,
    field,
    onChange,
    validity,
}: FieldProps ) => {
    const paginated = usePaginatedOptions( field.api_endpoint );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <TaggableSelect
                isMulti={ field.multiple }
                options={ paginated.options }
                isLoading={ paginated.isLoading }
                value={ decodeValue( data[ field.id ] ?? [] ) }
                placeholder={ field.placeholder }
                // Server already filters by `search`; keep all returned options.
                filterOption={ null }
                isValidNewOption={ makeIsValidNewOption( field, data ) }
                onInputChange={ paginated.onInputChange }
                onMenuOpen={ paginated.onMenuOpen }
                onMenuClose={ paginated.onMenuClose }
                noOptionsMessage={ paginated.noOptionsMessage }
                onChange={ ( value: any ) =>
                    onChange( { [ field.id ]: value ?? [] } )
                }
            />
        </CustomField>
    );
};

// Upsells/cross-sells etc.: multi-select with debounced server search. Options
// are state-driven (rather than AsyncSelect's internal loadOptions cache) so
// scrolling the menu can append further pages.
const AsyncMultiSelectField = ( {
    data,
    field,
    onChange,
    validity,
}: FieldProps ) => {
    const paginated = usePaginatedOptions( field.api_endpoint );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <Select
                isMulti={ field.multiple }
                options={ paginated.options }
                isLoading={ paginated.isLoading }
                value={ decodeValue( data[ field.id ] ) }
                // Server already filters by `search`; keep all returned options.
                filterOption={ null }
                onInputChange={ paginated.onInputChange }
                onMenuOpen={ paginated.onMenuOpen }
                onMenuClose={ paginated.onMenuClose }
                noOptionsMessage={ paginated.noOptionsMessage }
                onChange={ ( value: any ) =>
                    onChange( { [ field.id ]: value } )
                }
                placeholder={ field.placeholder }
                // @ts-ignore react-select default chip rendering
                components={ {
                    MultiValue: rsComponents.MultiValue,
                    ValueContainer: rsComponents.ValueContainer,
                } }
            />
        </CustomField>
    );
};

const AsyncSelectEdit = ( props: FieldProps ) => {
    if ( props.field.tree ) {
        return <TreeSelectField { ...props } />;
    }
    if ( props.field.creatable ) {
        return <CreatableSelectField { ...props } />;
    }
    return <AsyncMultiSelectField { ...props } />;
};

export default AsyncSelectEdit;
