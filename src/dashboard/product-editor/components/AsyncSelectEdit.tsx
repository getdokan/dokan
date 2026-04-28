import { ProductAsyncSelect } from '@src/components';
import CustomField, { getValidationError } from './CustomField';
import { components as rsComponents } from 'react-select';

const AsyncSelectEdit = ( { data, field, onChange, validity }: any ) => {
    return (
        <CustomField field={ field } error={ getValidationError( validity ) }>
            <ProductAsyncSelect
                value={ data[ field.id ] }
                onChange={ ( value: any ) => {
                    onChange( { [ field.id ]: value } );
                } }
                isMulti={ field.multiple }
                placeholder={ field.placeholder }
                // @ts-ignore
                components={ {
                    MultiValue: rsComponents.MultiValue,
                    ValueContainer: rsComponents.ValueContainer,
                } }
            />
        </CustomField>
    );
};

export default AsyncSelectEdit;
