/* eslint-disable import/no-extraneous-dependencies */
import { AsyncSelect, Select } from '@src/components';
import { TaggableSelect } from '@getdokan/dokan-ui';
import CustomField, { getValidationError } from './CustomField';
import { components as rsComponents } from 'react-select';
import { CheckSquare, Square } from 'lucide-react';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { debounce } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import { useEffect, useMemo, useState } from '@wordpress/element';

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

// Fetch `{ value, label }` options from an endpoint, optionally filtered by `search`.
const fetchOptions = async (
    endpoint?: string,
    search = ''
): Promise< any[] > => {
    if ( ! endpoint ) {
        return [];
    }
    try {
        const result: any = await apiFetch( {
            path: addQueryArgs( endpoint, { search, per_page: 20 } ),
        } );
        return Array.isArray( result )
            ? result.map( ( item: any ) => ( {
                  value: item.id,
                  label: item.name,
              } ) )
            : [];
    } catch {
        return [];
    }
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
                        flattenTree( Array.isArray( result ) ? result : [] )
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
    const selected = Array.isArray( data[ field.id ] ) ? data[ field.id ] : [];
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
    const [ options, setOptions ] = useState< any[] >( [] );
    const search = useMemo(
        () =>
            debounced( ( input ) =>
                fetchOptions( field.api_endpoint, input ).then( setOptions )
            ),
        [ field.api_endpoint ]
    );

    useEffect( () => {
        let active = true;
        fetchOptions( field.api_endpoint ).then(
            ( opts ) => active && setOptions( opts )
        );
        return () => {
            active = false;
            search.cancel();
        };
    }, [ field.api_endpoint, search ] );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <TaggableSelect
                isMulti={ field.multiple }
                options={ options }
                value={ data[ field.id ] ?? [] }
                placeholder={ field.placeholder }
                // Server already filters by `search`; keep all returned options.
                filterOption={ null }
                isValidNewOption={ makeIsValidNewOption( field, data ) }
                onInputChange={ ( input: string, meta: any ) => {
                    if ( meta.action === 'input-change' ) {
                        search( input );
                    }
                } }
                onChange={ ( value: any ) =>
                    onChange( { [ field.id ]: value ?? [] } )
                }
            />
        </CustomField>
    );
};

// Upsells/cross-sells etc.: plain async multi-select with debounced search.
const AsyncMultiSelectField = ( {
    data,
    field,
    onChange,
    validity,
}: FieldProps ) => {
    const loadOptions = useMemo(
        () =>
            debounced( ( input, callback ) =>
                fetchOptions( field.api_endpoint, input ).then( callback )
            ),
        [ field.api_endpoint ]
    );

    useEffect( () => () => loadOptions.cancel(), [ loadOptions ] );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <AsyncSelect
                isMulti={ field.multiple }
                cacheOptions
                defaultOptions
                value={ data[ field.id ] }
                loadOptions={ loadOptions }
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
