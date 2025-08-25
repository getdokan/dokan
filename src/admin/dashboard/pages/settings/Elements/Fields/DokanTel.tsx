import { dispatch } from '@wordpress/data';
import React, { useState } from 'react';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

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
        <div className="grid-cols-12 grid gap-2 justify-between w-full p-4">
            <div className={ 'sm:col-span-8 col-span-12' }>
                <DokanFieldLabel
                    title={ element.title }
                    titleFontWeight="bold"
                    helperText={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element?.image_url }
                    wrapperClassNames={ 'w-full' }
                />
            </div>
            <div className={ 'sm:col-span-4 col-span-12' }>
                <TextField
                    value={ value }
                    onChange={ ( val ) => {
                        setValue( val );
                        onValueChange( { ...element, value: val } );
                    } }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    inputType="tel"
                    inputClassName="bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm"
                    containerClassName={
                        'max-w-full sm:!w-[14rem] sm:justify-self-end '
                    }
                />
            </div>
        </div>
    );
}
