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
        <div className="flex justify-between gap-4 flex-wrap w-full p-5">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
            />
            <BaseDokanSelect
                value={ element.value || element?.defaultValue || '' }
                id={ element.id }
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
                containerClassName={ 'w-[14rem] max-w-full' }
            />
        </div>
    );
}
