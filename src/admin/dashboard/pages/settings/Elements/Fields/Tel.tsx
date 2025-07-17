import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../types';
import { DokanFieldLabel, TextField } from '../../../../../../components/fields';

const Tel = ( { element, onValueChange }: SettingsProps ) => {
    const [ value, setValue ] = useState( element.value );

    if ( ! element.display ) {
        return <></>;
    }

    const handleValueChange = ( newValue: string ) => {
        setValue( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    return (
        <div className="flex justify-between p-4" id={ element.hook_key }>
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <TextField
                value={ value as string }
                onChange={ handleValueChange }
                placeholder={ element?.placeholder as string }
                disabled={ element.disabled }
                inputType="tel"
                helperText={ element.description }
            />
        </div>
    );
};

export default Tel;
