import React, { useState } from 'react';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanTel( { element } ) {
    const [ value, setValue ] = useState( element.value );
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-wrap justify-between gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                icon={ element?.icon }
            />
            <TextField
                value={ value }
                onChange={ ( val ) => {
                    setValue( val );
                    onValueChange( { ...element, value: val } );
                } }
                placeholder={ element.placeholder }
                disabled={ element.disabled }
                inputType="tel"
                helperText={ element.description }
            />
        </div>
    );
}
