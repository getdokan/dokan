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

const OPTIONS_PER_PAGE = 20;

// Fetch one page of `{ value, label }` options from an endpoint, optionally
// filtered by `search`. `hasMore` is inferred from a full page rather than the
// X-WP-TotalPages header so a proxy stripping custom headers can't disable
// pagination; the only cost is one empty request when the total is an exact
// multiple of the page size.
const fetchOptions = async (
    endpoint?: string,
    search = '',
    page = 1
): Promise< { options: any[]; hasMore: boolean } > => {
    if ( ! endpoint ) {
        return { options: [], hasMore: false };
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
        return { options, hasMore: options.length === OPTIONS_PER_PAGE };
    } catch {
        return { options: [], hasMore: false };
    }
};

// Options state shared by the non-tree async fields: page 1 replaces the list,
// scrolling the open menu to its end appends the next page for the current
// search term, and a new search resets back to page 1.
const usePaginatedOptions = ( endpoint?: string ) => {
    const [ options, setOptions ] = useState< any[] >( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    // Mutable request state: lets the scroll handler read the latest
    // page/search without re-rendering, and `requestId` discards responses
    // that arrive after a newer request has been issued.
    const stateRef = useRef( {
        search: '',
        page: 1,
        hasMore: false,
        loading: false,
        requestId: 0,
    } );

    const load = useCallback(
        ( search: string, page: number ) => {
            const requestId = ++stateRef.current.requestId;
            stateRef.current.loading = true;
            setIsLoading( true );
            fetchOptions( endpoint, search, page ).then( ( result ) => {
                if ( requestId !== stateRef.current.requestId ) {
                    return; // superseded by a newer search/page request
                }
                stateRef.current = {
                    ...stateRef.current,
                    search,
                    page,
                    hasMore: result.hasMore,
                    loading: false,
                };
                setIsLoading( false );
                setOptions( ( previous ) => {
                    const merged =
                        page === 1
                            ? result.options
                            : [ ...previous, ...result.options ];
                    // Terms can shift between pages while browsing (e.g. a tag
                    // created mid-session); keep the first occurrence of each.
                    const seen = new Set();
                    return merged.filter(
                        ( option ) =>
                            ! seen.has( option.value ) &&
                            seen.add( option.value )
                    );
                } );
            } );
        },
        [ endpoint ]
    );

    const onSearch = useMemo(
        () => debounced( ( input: string ) => load( input, 1 ) ),
        [ load ]
    );

    const onMenuScrollToBottom = () => {
        const { search, page, hasMore, loading } = stateRef.current;
        if ( hasMore && ! loading ) {
            load( search, page + 1 );
        }
    };

    useEffect( () => {
        load( '', 1 );
        return () => onSearch.cancel();
    }, [ load, onSearch ] );

    return { options, isLoading, onSearch, onMenuScrollToBottom };
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

// Wrapper that satisfies @wordpress/compose debounce's `(...args: unknown[])` constraint.
const debounced = ( fn: ( ...args: any[] ) => void ) =>
    debounce( ( ...args: unknown[] ) => fn( ...args ), 300 );

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
    const { options, isLoading, onSearch, onMenuScrollToBottom } =
        usePaginatedOptions( field.api_endpoint );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <TaggableSelect
                isMulti={ field.multiple }
                options={ options }
                isLoading={ isLoading }
                value={ decodeValue( data[ field.id ] ?? [] ) }
                placeholder={ field.placeholder }
                // Server already filters by `search`; keep all returned options.
                filterOption={ null }
                isValidNewOption={ makeIsValidNewOption( field, data ) }
                onInputChange={ ( input: string, meta: any ) => {
                    if ( meta.action === 'input-change' ) {
                        onSearch( input );
                    }
                } }
                onMenuScrollToBottom={ onMenuScrollToBottom }
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
    const { options, isLoading, onSearch, onMenuScrollToBottom } =
        usePaginatedOptions( field.api_endpoint );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <Select
                isMulti={ field.multiple }
                options={ options }
                isLoading={ isLoading }
                value={ decodeValue( data[ field.id ] ) }
                // Server already filters by `search`; keep all returned options.
                filterOption={ null }
                onInputChange={ ( input: string, meta: any ) => {
                    if ( meta.action === 'input-change' ) {
                        onSearch( input );
                    }
                } }
                onMenuScrollToBottom={ onMenuScrollToBottom }
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
