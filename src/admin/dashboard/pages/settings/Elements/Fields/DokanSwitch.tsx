import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanSwitch as BaseDokanSwitch,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanSwitch( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );

    return (
        <div className="grid-cols-12 grid gap-2 justify-between w-full p-4">
            { hasTitle && (
                <div className={ 'sm:col-span-8 col-span-12' }>
                    <DokanFieldLabel
                        title={ element.title }
                        titleFontWeight="bold"
                        helperText={ element.description }
                        tooltip={ element.helper_text }
                        imageUrl={ element?.image_url }
                        wrapperClassNames={ 'w-full' }
                    />
                </div>
            ) }
            <div
                className={
                    hasTitle
                        ? 'sm:col-span-4 col-span-12 flex justify-end'
                        : 'col-span-12'
                }
            >
                <BaseDokanSwitch
                    checked={ element.value === element.enable_state?.value }
                    onChange={ ( checked ) =>
                        onValueChange( {
                            ...element,
                            value: checked
                                ? element.enable_state?.value
                                : element.disable_state?.value,
                        } )
                    }
                    label={ element.label }
                    disabled={ element.disabled }
                />
            </div>
        </div>
    );
}
