import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanNumber( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-wrap gap-2 justify-between w-full p-4">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
                wrapperClassNames={ 'md:max-w-[60%]' }
            />
            <TextField
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                inputType="number"
                placeholder={ element.placeholder }
                disabled={ element.disabled }
                prefix={ element.prefix }
                postfix={ element.postfix }
                inputClassName="bg-white border-[#E9E9E9] rounded-[5px] h-10 px-4 text-[#25252D] text-sm"
                containerClassName={ 'max-w-[13rem]' }
                inputProps={ {
                    min: element.min || undefined,
                    max: element.max || undefined,
                    step: element.step || 'any', // Default to 'any' for decimal numbers
                } }
            />
        </div>
    );
}
