import {
    DokanCheckboxGroup,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanMultiCheck( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 p-5 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
            />
            <DokanCheckboxGroup
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                defaultValue={ element?.default || [] }
                onChange={ ( values ) => {
                    onValueChange( { ...element, value: values } );
                } }
            />
        </div>
    );
}
