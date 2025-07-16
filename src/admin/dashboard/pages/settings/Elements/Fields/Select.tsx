import { SettingsProps } from '../../types';
import {
    DokanFieldLabel,
    DokanSelect,
} from '../../../../../../components/fields';

const Select = ( { element, onValueChange }: SettingsProps ) => {
    const handleChange = ( value: string | number ) => {
        console.log({value});
        onValueChange( {
            ...element,
            value,
        } );
    };

    return (
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanSelect
                value={ element.value as string | number }
                onChange={ handleChange }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                placeholder={ element.placeholder as string }
                disabled={ element.disabled }
            />
        </div>
    );
};

export default Select;
