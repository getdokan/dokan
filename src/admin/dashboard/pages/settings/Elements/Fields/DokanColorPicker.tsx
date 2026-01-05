import { dispatch } from '@wordpress/data';
import { ColorPicker, FieldLabel } from '@wedevs/plugin-ui';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanColorPicker( { element, onValueChange } ) {
    if ( ! element.display ) {
        return null;
    }

    const handleChange = ( newColor: string ) => {
        const updatedElement = { ...element, value: newColor };
        onValueChange?.( updatedElement );
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );

    return (
        <div className="grid-cols-12 grid gap-2 justify-between w-full p-4">
            { hasTitle && (
                <div className="sm:col-span-8 col-span-12">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.helper_text }
                        imageUrl={ element?.image_url }
                        htmlFor={ element.id }
                        isBold={ true }
                        className="w-full"
                    />
                </div>
            ) }
            <div className="sm:col-span-4 col-span-12 flex items-center justify-end">
                <ColorPicker
                    id={ element.id }
                    value={ element.value as string }
                    defaultValue={ ( element.default as string ) || '#7047EB' }
                    onChange={ handleChange }
                    disabled={ element.disabled }
                    enableAlpha={ element.enable_alpha || false }
                />
            </div>
        </div>
    );
}
