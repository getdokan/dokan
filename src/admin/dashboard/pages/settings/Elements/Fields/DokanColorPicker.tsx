import { dispatch } from '@wordpress/data';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanColorPicker( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <div className="flex justify-between gap-4 flex-wrap w-full p-5">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <div>Color Picker</div>
        </div>
    );
}
