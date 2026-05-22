import { Select } from '@src/components';
import { TaggableSelect } from '@getdokan/dokan-ui';
import { applyFilters } from '@wordpress/hooks';
import { CheckSquare, Square } from 'lucide-react';
import { useMemo } from 'react';
import { components } from 'react-select';
import CustomField, { getValidationError } from './CustomField';

type Option = {
    value: string | number;
    label: string;
    children?: Option[];
    level?: number;
    term_id: number;
};

// Custom Option for Tree View (Only used if isTree is true)
const OptionComponent = ( { children, ...props }: any ) => {
    const { data, isSelected } = props;
    // Default to 0 if level is missing
    const paddingLeft = ( data.level || 0 ) * 20 + 10;

    return (
        <components.Option { ...props }>
            <div
                style={ { paddingLeft: `${ paddingLeft }px` } }
                className="flex items-center gap-2"
            >
                { isSelected ? (
                    <CheckSquare size={ 16 } />
                ) : (
                    <Square size={ 16 } />
                ) }
                { children }
            </div>
        </components.Option>
    );
};

// Helper to flatten nested options
const flattenOptions = ( options: Option[], level = 0 ): Option[] => {
    return options.reduce( ( acc: any[], option ) => {
        const flatOption = {
            ...option,
            level,
        };

        acc.push( flatOption );

        if ( option.children && option.children.length > 0 ) {
            acc.push( ...flattenOptions( option.children, level + 1 ) );
        }

        return acc;
    }, [] );
};

const SelectEdit = ( { data, field, onChange, validity }: any ) => {
    // Resolve dynamic options: if field has options_map and an 'options' dependency,
    // swap options based on the current value of that dependency field.
    const resolvedElements = useMemo( () => {
        let elements = field.elements || [];

        if ( field.options_map && field.dependencies?.length ) {
            const optionsDep = field.dependencies.find(
                ( dep: any ) => dep.type === 'options'
            );
            if ( optionsDep ) {
                const depValue = data[ optionsDep.key ];
                if ( depValue && field.options_map[ depValue ] ) {
                    elements = field.options_map[ depValue ];
                }
            }
        }

        return applyFilters(
            'dokan_product_editor_select_options',
            elements,
            field,
            data
        ) as Option[];
    }, [ field, data ] );

    // Prepare Options
    const options = flattenOptions( resolvedElements );
    const currentValue = data[ field.id ];

    // Detect if it's a tree structure (has children) or explicitly using 'options' key
    const isTreeMode = options.some(
        ( opt: Option ) => opt.children && opt.children.length > 0
    );

    // Configuration
    const isMulti = field.multiple || Array.isArray( currentValue );
    const placeholder = field.placeholder;

    // Value Resolution
    const getSelectedValue = () => {
        if ( currentValue === undefined || currentValue === null ) {
            return isMulti ? [] : null;
        }

        // Handle Array values (Multi-select)
        if ( Array.isArray( currentValue ) ) {
            // If already objects
            if (
                currentValue.length > 0 &&
                typeof currentValue[ 0 ] === 'object' &&
                'value' in currentValue[ 0 ]
            ) {
                return currentValue;
            }
            // Preserve unknown values (e.g. newly-typed tags) so they still render as chips.
            return currentValue.map( ( item: any ) => {
                const match = options.find(
                    ( option: Option ) => option.value === item
                );
                if ( match ) {
                    return match;
                }
                const label =
                    typeof item === 'string' ? item : String( item );
                return { value: item, label } as Option;
            } );
        }

        // Handle Single values
        return (
            options.find( ( option ) => option.value === currentValue ) || null
        );
    };

    const treeComponents = isTreeMode ? { Option: OptionComponent } : undefined;

    const handleChange = ( input: any ) => {
        if ( isMulti ) {
            const values = Array.isArray( input )
                ? input.map( ( item ) => item.value )
                : [];
            onChange( { [ field.id ]: values } );
        } else {
            const value = input ? input.value : '';
            onChange( { [ field.id ]: value } );
        }
    };

    // Fields with a `creatable` flag (e.g. product tags) use a creatable multi-select; Enter is swallowed when creation is off so it doesn't submit the form.
    const useTaggable = field.creatable !== undefined && isMulti;
    const canCreate = Boolean( field.creatable );

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            { useTaggable ? (
                <div
                    onKeyDown={ ( e: React.KeyboardEvent ) => {
                        if ( e.key === 'Enter' && ! canCreate ) {
                            e.preventDefault();
                        }
                    } }
                >
                    <TaggableSelect
                        isMulti
                        options={ options }
                        placeholder={ placeholder }
                        value={ getSelectedValue() }
                        isValidNewOption={ () => canCreate }
                        onChange={ handleChange }
                    />
                </div>
            ) : (
                <Select
                    options={ options }
                    isMulti={ isMulti }
                    placeholder={ placeholder }
                    value={ getSelectedValue() }
                    // Specific Tree Props
                    components={ treeComponents }
                    onChange={ handleChange }
                />
            ) }
        </CustomField>
    );
};

export default SelectEdit;
