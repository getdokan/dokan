import React, { useState } from 'react';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';

export default function DokanCombineInput( { element, onValueChange } ) {
    const [ value, setValue ] = useState( element.value );
    if ( ! element.display ) {
        return null;
    }
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
                    inputType="number"
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
                    inputType="number"
                    helperText={ element.description }
                    postfix="$"
                />
            </div>
        </div>
    );
}
