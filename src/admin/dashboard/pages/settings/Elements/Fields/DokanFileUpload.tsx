import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanFileUpload,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanFileUploadField( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-col gap-2 w-full p-5">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <DokanFileUpload
                onUrlImport={ ( url ) =>
                    onValueChange( { ...element, value: url } )
                }
                value={ element.value }
            />
        </div>
    );
}
