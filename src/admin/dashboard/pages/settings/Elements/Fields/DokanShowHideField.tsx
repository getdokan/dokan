import { dispatch } from '@wordpress/data';
import { PasswordField, FieldLabel } from '@wedevs/plugin-ui';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanShowHideField( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( value: string ) => {
        const updatedElement = { ...element, value };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );

    return (
        <div className="grid grid-cols-6 p-4 gap-4 w-full">
            { hasTitle && (
                <div className="md:col-span-2 col-span-6">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.helper_text }
                        imageUrl={ element?.image_url }
                        htmlFor={ element.id }
                        isBold={ true }
                    />
                </div>
            ) }
            <div
                className={
                    hasTitle ? 'md:col-span-4 col-span-6' : 'col-span-6'
                }
            >
                <PasswordField
                    id={ element.id }
                    value={ element.value as string }
                    defaultValue={ element.default as string }
                    onChange={ handleChange }
                    placeholder={ element.placeholder as string }
                    disabled={ element.disabled }
                    showToggle={ true }
                />
            </div>
        </div>
    );
}
