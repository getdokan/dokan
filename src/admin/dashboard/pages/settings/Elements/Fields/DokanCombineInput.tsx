import { useState } from '@wordpress/element';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanCombineInput( { element } ) {
    const [ value, setValue ] = useState( element.value );
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
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="mt-2 flex gap-2">
                <TextField
                    value={ value }
                    onChange={ ( val ) => {
                        setValue( val );
                        onValueChange( { ...element, value: val } );
                    } }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    helperText={ element.description }
                    postfix="%"
                />
                <TextField
                    value={ value }
                    onChange={ ( val ) => {
                        setValue( val );
                        onValueChange( { ...element, value: val } );
                    } }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    helperText={ element.description }
                    postfix="$"
                />
            </div>
        </div>
    );
}
