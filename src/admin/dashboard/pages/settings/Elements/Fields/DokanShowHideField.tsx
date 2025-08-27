import { ShowHideField } from '../../../../../../components/fields';
import DokanFieldLabel from '../../../../../../components/fields/DokanFieldLabel';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanShowHideField( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    const hasTitle = Boolean( element.title && element.title.length > 0 );
    return (
        <div className="grid grid-cols-6 p-4 gap-4 w-full">
            { hasTitle && (
                <div className="md:col-span-2 col-span-6">
                    <DokanFieldLabel
                        title={ element.title }
                        helperText={ element.description }
                        tooltip={ element.helper_text }
                        titleFontWeight="bold"
                        imageUrl={ element?.image_url }
                    />
                </div>
            ) }
            <div
                className={
                    hasTitle ? 'md:col-span-4 col-span-6' : 'col-span-6'
                }
            >
                <ShowHideField
                    value={ element.value }
                    disabled={ element.disabled }
                    placeholder={ element.placeholder }
                    onChange={ ( value ) =>
                        onValueChange( { ...element, value } )
                    }
                />
            </div>
        </div>
    );
}
