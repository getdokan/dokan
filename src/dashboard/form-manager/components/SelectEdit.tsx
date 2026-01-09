import { Select } from '@src/components';
import CustomField from './CustomField';

const SelectEdit = ( { field, onChange }: any ) => {
    const selectedValue = field.value || ( field.multiple ? [] : '' );
    return (
        <CustomField label={ field.label }>
            <Select
                options={ field.elements }
                // @ts-ignore
                isMulti={ Boolean( field.multiple ) }
                placeholder={ field.placeholder }
                selectedValue={ selectedValue }
                onChange={ ( value: any ) =>
                    onChange( { [ field.id ]: value } )
                }
            />
        </CustomField>
    );
};

export default SelectEdit;
