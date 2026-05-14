import { DateTimePicker } from '@src/components';
import CustomField, { getValidationError } from './CustomField';

const DateTimePickerEdit = ( { data, field, onChange, validity }: any ) => (
    <CustomField field={ field } error={ getValidationError( validity ) }>
        <DateTimePicker
            placeholder={ field.placeholder }
            currentDate={ data[ field.id ] }
            onChange={ ( value: string ) => {
                onChange( { [ field.id ]: value } );
            } }
        />
    </CustomField>
);

export default DateTimePickerEdit;
