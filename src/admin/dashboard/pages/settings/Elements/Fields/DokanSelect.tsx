import { dispatch } from '@wordpress/data';
import {
    DokanFieldLabel,
    DokanSelect as BaseDokanSelect,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { twMerge } from 'tailwind-merge';
import { RawHTML } from '@wordpress/element';

export default function DokanSelect( { element, isSingleLineRow = false } ) {
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
            className={ twMerge(
                'p-4',
                isSingleLineRow
                    ? 'inline-block'
                    : 'grid-cols-12 grid gap-2 justify-between w-full'
            ) }
            id={ element.hook_key }
        >
            { hasTitle && (
                <div
                    className={ twMerge(
                        'sm:col-span-8 col-span-12 self-center',
                        isSingleLineRow && 'mb-2'
                    ) }
                >
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
                            label: <RawHTML>{ option.title }</RawHTML>,
                            value: option.value,
                        } ) ) || []
                    }
                    disabled={ element.disabled }
                    placeholder={ element.placeholder || '' }
                    containerClassName={ twMerge(
                        'max-w-full sm:!w-[14rem] sm:justify-self-end',
                        isSingleLineRow && 'sm:!w-[12rem]'
                    ) }
                />
            </div>
        </div>
    );
}
