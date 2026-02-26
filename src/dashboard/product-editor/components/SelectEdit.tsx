import { Select } from '@src/components';
import { CheckSquare, Square } from 'lucide-react';
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
    // Prepare Options
    const options = flattenOptions( field.elements || [] );

    // Detect if it's a tree structure (has children) or explicitly using 'options' key
    const isTreeMode = options.some(
        ( opt: Option ) => opt.children && opt.children.length > 0
    );

    // Configuration
    const isMulti = field.multiple;
    const placeholder = field.placeholder;

    // Value Resolution
    const getSelectedValue = () => {
        const currentValue = data[ field.id ];

        if ( ! currentValue ) {
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
            // If IDs/Strings
            return options.filter( ( option: Option ) =>
                currentValue.includes( option.value )
            );
        }

        // Handle Single values
        return (
            options.find( ( option ) => option.value === currentValue ) || null
        );
    };

    const treeComponents = isTreeMode ? { Option: OptionComponent } : undefined;

    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <Select
                options={ options }
                isMulti={ isMulti }
                placeholder={ placeholder }
                value={ getSelectedValue() }
                // Specific Tree Props
                components={ treeComponents }
                onChange={ ( input: any ) => {
                    if ( isMulti ) {
                        // Handle multi-select always as array of values
                        const values = Array.isArray( input )
                            ? input.map( ( item ) => item.value )
                            : [];
                        onChange( { [ field.id ]: values } );
                    } else {
                        // Handle single select
                        const value = input ? input.value : '';
                        onChange( { [ field.id ]: value } );
                    }
                } }
            />
        </CustomField>
    );
};

export default SelectEdit;
