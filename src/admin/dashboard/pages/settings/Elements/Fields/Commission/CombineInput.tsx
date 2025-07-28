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
        <div className="p-4 grid grid-cols-4 justify-between items-center flex-wrap gap-2">
            <div className="col-span-2">
            <DokanFieldLabel
                title={ element.title || '' }
                helperText={ element.description }
            />
            </div>
            <div className="col-span-2 flex justify-between">
            <div className="mt-2 flex gap-2">
                <TextField
                    value={ value as string }
                    onChange={ handleValueChange }
                    placeholder={ element?.placeholder as string }
                    disabled={ element.disabled }
                    inputType="number"
                    postfix="%"
                />
                <TextField
                    value={ value as string }
                    onChange={ handleValueChange }
                    placeholder={ element?.placeholder as string }
                    disabled={ element.disabled }
                    inputType="number"
                        postfix="$"
                    />
                </div>
            </div>
        </div>
    );
};

export default CombineInput;
