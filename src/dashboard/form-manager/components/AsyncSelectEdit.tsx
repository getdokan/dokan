import { ProductAsyncSelect } from '@src/components';
import CustomField from './CustomField';

const AsyncSelectEdit = ( { data, field, onChange }: any ) => {
    return (
        <CustomField label={ field.label } error={ field.error }>
            <ProductAsyncSelect
                value={ data[ field.id ] }
                onChange={ ( value: any ) => {
                    onChange( { [ field.id ]: value } );
                } }
                isMulti={ field.multiple }
                placeholder={ field.placeholder }
            />
        </CustomField>
    );
};

export default AsyncSelectEdit;
