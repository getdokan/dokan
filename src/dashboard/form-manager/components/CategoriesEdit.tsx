import { TreeSelectPicker } from '@src/components';
import CustomField from './CustomField';

const CategoriesEdit = ( { data, field, onChange }: any ) => {
    const getOption = ( option: any ) => {
        return {
            label: option.label,
            value: option.term_id,
            children: option.children ? option.children.map( getOption ) : [],
        };
    };
    const options = field.options.map( getOption );
    return (
        <CustomField label={ field.label }>
            <TreeSelectPicker
                placeholder={ field.placeholder }
                options={ options }
                initialValues={ data[ field.id ] || [] }
                multiple={ true }
                onChange={ ( value: any ) => {
                    onChange( { [ field.id ]: value } );
                } }
            />
        </CustomField>
    );
};

export default CategoriesEdit;
