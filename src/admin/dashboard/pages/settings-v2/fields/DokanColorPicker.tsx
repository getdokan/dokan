/**
 * Dokan Color Picker Field
 *
 * A custom color picker field for Dokan theme/branding settings.
 */

import { ColorPicker, BaseControl } from '@wordpress/components';
import type { FieldProps } from '@wedevs/plugin-settings/types';

export const DokanColorPicker = ( { element, value, onChange }: FieldProps ) => {
    return (
        <BaseControl
            id={ element.id }
            label={ element.title }
            help={ element.description }
            className="dokan-color-picker-field"
        >
            <ColorPicker
                color={ value || element.default || '#000000' }
                onChange={ ( color ) => onChange( color ) }
                enableAlpha
                copyFormat="hex"
            />
        </BaseControl>
    );
};

export default DokanColorPicker;

