import {
    DokanFieldLabel,
    DokanRadioCapsule as BaseRadioCapsule,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanRadioCapsule( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    return (
        <div className="flex flex-wrap gap-4 justify-between w-full p-5 ">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.tooltip }
            />
            <BaseRadioCapsule
                options={
                    element.options?.map( ( option ) => ( {
                        value: option.value,
                        title: option.title,
                    } ) ) || []
                }
                selected={ element.value || element?.default || '' }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
            />
        </div>
    );
}
