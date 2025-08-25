import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanWithdrawCharges( { element } ) {
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
                titleFontWeight="light"
                helperText={ element.description }
                imageUrl={ element?.image_url }
            />
            <TextField
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                inputType="number"
                placeholder={ element.placeholder }
                disabled={ element.disabled }
                postfix="%"
                helperText={ element.description }
                inputClassName="bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm"
            />
        </div>
    );
}
