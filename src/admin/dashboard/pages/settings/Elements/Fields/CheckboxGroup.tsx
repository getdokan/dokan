import { SettingsProps } from '../../types';
import { DokanCheckboxGroup } from '../../../../../../components/fields';

const CheckboxGroup = ( { element, onValueChange }: SettingsProps ) => {
    const handleChange = ( values: Array< string | number > ) => {
        onValueChange( {
            ...element,
            value: values,
        } );
    };

    return (
        <div className="p-4">
            <DokanCheckboxGroup
                name={ element.id }
                label={ element.title }
                helpText={ element.description }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                defaultValue={
                    ( element.value as Array< string | number > ) || []
                }
                onChange={ handleChange }
            />
        </div>
    );
};

export default CheckboxGroup;
