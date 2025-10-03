import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanRadioCapsule as BaseRadioCapsule,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanRadioCapsule( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-wrap gap-4 justify-between items-center w-full p-5 " id={ element.hook_key }>
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <BaseRadioCapsule
                options={
                    element.options?.map( ( option ) => ( {
                        value: option.value,
                        title: option.title,
                        icon: option.icon,
                    } ) ) || []
                }
                selected={ element.value || element.default }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
            />
        </div>
    );
}
