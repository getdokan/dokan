import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanTextArea as BaseDokanTextArea,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanTextArea( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );

    return (
        <div
            className="grid-cols-12 grid gap-4 justify-between w-full p-4"
            id={ element.hook_key }
        >
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
            <div className={ 'col-span-12' }>
                <BaseDokanTextArea
                    value={ element.value || element?.defaultValue || '' }
                    onChange={ ( val ) =>
                        onValueChange( { ...element, value: val } )
                    }
                    disabled={ element.disabled }
                    input={ { placeholder: element.placeholder } }
                />
            </div>
        </div>
    );
}
