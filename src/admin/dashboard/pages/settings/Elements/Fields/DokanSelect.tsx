import {
    DokanFieldLabel,
    DokanSelect as BaseDokanSelect,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { dispatch } from '@wordpress/data';

export default function DokanSelect( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <div className="flex justify-between w-full p-5">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                wrapperClassNames={ 'flex-1' }
            />
            <BaseDokanSelect
                value={ element.value }
                onChange={ ( val ) =>
                    onValueChange( { ...element, value: val } )
                }
                options={
                    element.options?.map( ( option ) => ( {
                        label: option.title,
                        value: option.value,
                    } ) ) || []
                }
                disabled={ element.disabled }
            />
        </div>
    );
}
