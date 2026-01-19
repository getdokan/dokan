import { Select } from '@src/components';
import CustomField from './CustomField';

const SelectEdit = ( { data, field, onChange }: any ) => {
    let selectedValue = field.value;
    const currentValue = data[ field.id ];

    if ( field.elements && currentValue ) {
        if ( field.multiple ) {
            if ( Array.isArray( currentValue ) && currentValue.length > 0 ) {
                if (
                    typeof currentValue[ 0 ] === 'string' ||
                    typeof currentValue[ 0 ] === 'number'
                ) {
                    selectedValue = field.elements.filter( ( option: any ) =>
                        currentValue.includes( option.value )
                    );
                }
            }
        } else if (
            typeof currentValue === 'string' ||
            typeof currentValue === 'number'
        ) {
            selectedValue = field.elements.find(
                ( option: any ) => option.value === currentValue
            );
        }
    }

    if ( ! selectedValue ) {
        selectedValue = field.multiple ? [] : '';
    }

    return (
        <CustomField label={ field.label } error={ field.error }>
            <Select
                options={ field.elements }
                isMulti={ field.multiple }
                placeholder={ field.placeholder }
                value={ selectedValue }
                onChange={ ( input: any ) => {
                    if ( field.multiple ) {
                        const values = Array.isArray( input )
                            ? input.map( ( item ) => item.value )
                            : [];
                        onChange( { [ field.id ]: values } );
                        return;
                    }
                    const value = input ? input.value : '';
                    onChange( { [ field.id ]: value } );
                } }
            />
        </CustomField>
    );
};

export default SelectEdit;
