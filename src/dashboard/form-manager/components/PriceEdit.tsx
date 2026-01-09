import { DokanPriceInput } from '@src/components';
import CustomField from './CustomField';

const PriceEdit = ( { data, field, onChange }: any ) => {
    return (
        <CustomField label={ field.label }>
            <DokanPriceInput
                label=""
                value={ data[ field.id ] }
                namespace={ `field.${ field.id }` }
                className="form-manager-price-input"
                input={ {
                    id: field.id,
                    placeholder: field.placeholder || '',
                } }
                onChange={ ( _, rawValue ) =>
                    onChange( { [ field.id ]: rawValue } )
                }
            />
        </CustomField>
    );
};

export default PriceEdit;
