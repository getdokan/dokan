import { Select } from '@src/components';
import { CheckSquare, Square } from 'lucide-react';
import { components } from 'react-select';
import CustomField from './CustomField';

const TreeViewOption = ( { children, ...props }: any ) => {
    // We use the 'level' prop we added during flattening to determine padding
    const { data, isSelected } = props;
    const paddingLeft = ( data.level || 0 ) * 20 + 10;

    return (
        <components.Option { ...props }>
            <div
                style={ { paddingLeft: `${ paddingLeft }px` } }
                className="flex items-center gap-2"
            >
                { /* Checkbox for multi-select clarity */ }
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

type OptionsType = {
    value: string | number;
    label: string;
    children?: OptionsType[];
    level?: number;
    term_id: number;
};

const flattenOptions = ( options: OptionsType[], level = 0 ): OptionsType[] => {
    return options.reduce( ( acc: OptionsType[], option ) => {
        const value = option.term_id || option.value;
        const flatOption = {
            ...option,
            value,
            level,
        };

        acc.push( flatOption );

        if ( option.children && option.children.length > 0 ) {
            acc.push( ...flattenOptions( option.children, level + 1 ) );
        }

        return acc;
    }, [] );
};

const TreeSelectEdit = ( { data, field, onChange }: any ) => {
    const options = flattenOptions( field.options || [] );

    const getSelectedValue = () => {
        const value = data[ field.id ];

        if ( ! value ) {
            return [];
        }

        // If it's an array
        if ( Array.isArray( value ) ) {
            // Check if it's already an array of option objects
            if (
                value.length > 0 &&
                typeof value[ 0 ] === 'object' &&
                'value' in value[ 0 ]
            ) {
                return value;
            }
            // Assume it's an array of IDs and find corresponding options
            return options.filter( ( option ) => {
                return value.includes( option.value );
            } );
        }

        // Handle single value case (if data structure differs)
        return options.filter( ( option ) => option.value === value );
    };

    return (
        <CustomField label={ field.label } error={ field.error }>
            <Select
                isMulti
                components={ { Option: TreeViewOption } }
                options={ options }
                value={ getSelectedValue() }
                onChange={ ( value: any ) => {
                    if ( Array.isArray( value ) ) {
                        const selectedValues = value.map( ( v ) => v.value );
                        onChange( { [ field.id ]: selectedValues } );
                        return;
                    }
                    onChange( { [ field.id ]: value ? value.value : null } );
                } }
                placeholder={ field.placeholder }
                closeMenuOnSelect={ false }
                hideSelectedOptions={ false }
            />
        </CustomField>
    );
};

export default TreeSelectEdit;
