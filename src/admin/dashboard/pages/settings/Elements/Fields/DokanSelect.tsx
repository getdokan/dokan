import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanSelect as BaseDokanSelect,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

export default function DokanSelect( { element } ) {
    if ( ! element.display ) {
        return null;
    }
    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    const hasTitle = Boolean( element.title && element.title.length > 0 );
    return (
        <div
            className="grid-cols-12 grid gap-2 justify-between w-full p-4"
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
            <div
                className={
                    hasTitle ? 'sm:col-span-4 col-span-12' : 'col-span-12'
                }
            >
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
                    placeholder={ element.placeholder || '' }
                    containerClassName={
                        'max-w-full sm:!w-[14rem] sm:justify-self-end '
                    }
                />
            </div>
        </div>
    );
}
