import React, { useState } from '@wordpress/element';
import { SettingsProps } from '../../../types';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../../components/fields';

const CombineInput = ( { element, onValueChange }: SettingsProps ) => {
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
        <div className="p-4">
            <DokanFieldLabel
                title={ element.title || '' }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <div className="mt-2 flex gap-2">
                <TextField
                    value={ value as string }
                    onChange={ handleValueChange }
                    placeholder={ element?.placeholder as string }
                    disabled={ element.disabled }
                    inputType="number"
                    helperText={ element.description }
                    postfix="%"
                />
                <TextField
                    value={ value as string }
                    onChange={ handleValueChange }
                    placeholder={ element?.placeholder as string }
                    disabled={ element.disabled }
                    inputType="number"
                    helperText={ element.description }
                    postfix="$"
                />
            </div>
        </div>
    );
};

export default CombineInput;
