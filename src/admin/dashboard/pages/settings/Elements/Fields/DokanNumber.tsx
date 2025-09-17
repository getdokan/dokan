import { dispatch } from '@wordpress/data';
import {
    DokanBaseTextField as BaseDokanNumber,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanNumber( { element } ) {
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
                <BaseDokanNumber
                    value={ element.value || element?.defaultValue || '' }
                    onChange={ ( val ) =>
                        onValueChange( { ...element, value: val } )
                    }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    min={ element.min }
                    max={ element.max }
                    step={ element.step }
                />
            </div>
        </div>
    );
}
