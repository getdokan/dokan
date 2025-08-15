import {
    DokanFieldLabel,
    DokanTextArea as BasicTextArea,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanTextArea( { element } ) {
    if ( ! element.display ) {
        return null;
    }
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
            />
            <BasicTextArea
                value={ element.value }
                onChange={ ( e ) =>
                    onValueChange( { ...element, value: e.target.value } )
                }
                input={ {
                    placeholder: element.placeholder,
                    disabled: element.disabled,
                } }
            />
        </div>
    );
}
