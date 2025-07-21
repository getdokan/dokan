import React from 'react';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';

export default function DokanPassword( { element, onValueChange } ) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="light"
                helperText={ element.description }
            />
            <TextField
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                inputType="password"
                placeholder={ element.placeholder }
                disabled={ element.disabled }
                helperText={ element.description }
                inputClassName="bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm"
            />
        </div>
    );
}
