import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanTimePicker,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanTimePickerField( { element } ) {
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
                wrapperClassNames={ 'md:max-w-[60%]' }
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
