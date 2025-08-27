import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    TextField as BaseDokanTextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanTextField( { element } ) {
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
                    hasTitle ? 'sm:col-span-4 col-span-12' : 'col-span-12'
                }
            >
                <BaseDokanTextField
                    value={ element.value || element?.defaultValue || '' }
                    id={ element.id }
                    onChange={ ( val ) =>
                        onValueChange( { ...element, value: val } )
                    }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    type={ element.type || 'text' }
                />
            </div>
        </div>
    );
}
