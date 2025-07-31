import {
    DokanFieldLabel,
    DokanTimePicker,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanTimePickerField( { element } ) {
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <DokanTimePicker
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                className="w-full"
            />
        </div>
    );
}
