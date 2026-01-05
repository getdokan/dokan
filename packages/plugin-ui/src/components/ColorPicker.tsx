import { useCallback, useState } from '@wordpress/element';
import { ColorPicker as WPColorPicker, Popover } from '@wordpress/components';
import type { BaseFieldProps } from '../types';

export interface ColorPickerProps extends BaseFieldProps {
    /**
     * Show alpha/opacity control
     */
    enableAlpha?: boolean;

    /**
     * Default color format
     */
    copyFormat?: 'hex' | 'hsl' | 'rgb';
}

/**
 * ColorPicker Component
 *
 * A color picker using WordPress components.
 */
const ColorPicker = ( {
    id,
    value,
    defaultValue = '#000000',
    onChange,
    disabled = false,
    className = '',
    enableAlpha = false,
}: ColorPickerProps ) => {
    const [ isOpen, setIsOpen ] = useState( false );
    const currentColor = ( value as string ) || ( defaultValue as string );

    const handleChange = useCallback(
        ( newColor: string ) => {
            onChange?.( newColor );
        },
        [ onChange ]
    );

    return (
        <div className={ `relative inline-flex ${ className }` }>
            <button
                id={ id }
                type="button"
                onClick={ () => ! disabled && setIsOpen( ! isOpen ) }
                disabled={ disabled }
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <span
                    className="w-6 h-6 rounded border border-gray-200"
                    style={ { backgroundColor: currentColor } }
                />
                <span className="text-sm text-gray-700 uppercase font-mono">
                    { currentColor }
                </span>
                <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={ 2 }
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            { isOpen && (
                <Popover
                    position="bottom left"
                    onFocusOutside={ () => setIsOpen( false ) }
                >
                    <div className="p-2">
                        <WPColorPicker
                            color={ currentColor }
                            onChange={ handleChange }
                            enableAlpha={ enableAlpha }
                            copyFormat="hex"
                        />
                    </div>
                </Popover>
            ) }
        </div>
    );
};

export default ColorPicker;

