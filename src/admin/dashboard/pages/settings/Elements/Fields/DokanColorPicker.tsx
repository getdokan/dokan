import { dispatch } from '@wordpress/data';
import { ColorIndicator, ColorPicker, Popover } from '@wordpress/components';
import { DokanFieldLabel } from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { useState, useRef } from '@wordpress/element';
import { ChevronDown } from 'lucide-react';

export default function DokanColorPicker( { element } ) {
    const [ isColorPickerOpen, setIsColorPickerOpen ] = useState( false );
    const [ color, setColor ] = useState(
        element.value || element.default || '#7047EB'
    );
    const buttonRef = useRef( null );

    if ( ! element.display ) {
        return null;
    }

    const handleColorChange = ( newColor ) => {
        setColor( newColor );

        const updatedElement = {
            ...element,
            value: newColor,
        };

        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };

    const toggleColorPicker = ( event ) => {
        event.stopPropagation();
        setIsColorPickerOpen( ! isColorPickerOpen );
    };

    const closeColorPicker = () => {
        setIsColorPickerOpen( false );
    };

    return (
        <div className="flex justify-between gap-4 flex-wrap w-full p-5">
            <DokanFieldLabel
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />

            <div
                className="dokan-color-picker-container"
                style={ { position: 'relative' } }
            >
                <button
                    ref={ buttonRef }
                    onClick={ toggleColorPicker }
                    className="rounded-md bg-white border border-[#E9E9E9] shadow-sm flex items-center justify-center py-2 px-2.5 gap-1"
                >
                    <ColorIndicator
                        colorValue={ color }
                        className="cursor-pointer w-5 h-5"
                    />
                    <ChevronDown size={ 20 } color="#828282" />
                </button>

                { isColorPickerOpen && (
                    <Popover
                        anchorRef={ buttonRef }
                        position="bottom left"
                        onFocusOutside={ ( event ) => {
                            if (
                                ! buttonRef.current?.contains( event.target )
                            ) {
                                closeColorPicker();
                            }
                        } }
                    >
                        <div style={ { padding: '16px' } }>
                            <ColorPicker
                                color={ color }
                                onChange={ handleColorChange }
                                copyFormat="hex"
                            />
                        </div>
                    </Popover>
                ) }
            </div>
        </div>
    );
}
