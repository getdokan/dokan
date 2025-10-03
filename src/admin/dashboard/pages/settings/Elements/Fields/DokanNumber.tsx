import { dispatch } from '@wordpress/data';
import {
    DokanBaseTextField as BaseDokanNumber,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';

// Import Lucide React icons
import * as LucideIcons from 'lucide-react';

export default function DokanNumber( { element } ) {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );

    // Helper function to render Lucide icon or text
    const renderAddon = ( addon, isIcon ) => {
        if ( ! addon ) {
            return null;
        }

        if ( isIcon ) {
            // Get the Lucide icon component
            const IconComponent = LucideIcons[ addon ];
            if ( IconComponent ) {
                return <IconComponent size={ 16 } className="text-gray-500" />;
            }
            // Fallback to text if icon not found
        }

        return addon;
    };

    const prefix = element.addon_icon
        ? renderAddon( element.prefix, true )
        : element.prefix;

    const postfix = element.addon_icon
        ? renderAddon( element.postfix, true )
        : element.postfix;

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
                <BaseDokanNumber
                    value={ element.value || element?.defaultValue || '' }
                    onChange={ ( val ) =>
                        onValueChange( { ...element, value: val } )
                    }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    inputProps={ { type: 'number' } }
                    min={ element.min }
                    max={ element.max }
                    step={ element.step }
                    prefix={ prefix }
                    postfix={ postfix }
                />
            </div>
        </div>
    );
}
