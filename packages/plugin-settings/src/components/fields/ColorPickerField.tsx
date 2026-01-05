import { useCallback, useState } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * ColorPickerField Component
 *
 * A generic color picker field for settings.
 */
const ColorPickerField = ( { element, onValueChange }: FieldProps ) => {
    const [ showPicker, setShowPicker ] = useState( false );

    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onValueChange?.( {
                ...element,
                value: e.target.value,
            } );
        },
        [ element, onValueChange ]
    );

    if ( ! element.display ) {
        return null;
    }

    const hasLabel = Boolean( element.title );
    const value =
        ( element.value as string ) ?? ( element.default as string ) ?? '#000000';

    return (
        <div
            className={ `grid grid-cols-12 gap-2 justify-between w-full p-4 ${
                element.css_class || ''
            }` }
        >
            { hasLabel && (
                <div className="sm:col-span-8 col-span-12">
                    <FieldLabel
                        title={ element.title }
                        description={ element.description }
                        tooltip={ element.helper_text }
                        imageUrl={ element.image_url }
                        htmlFor={ element.id }
                    />
                </div>
            ) }
            <div
                className={
                    hasLabel
                        ? 'sm:col-span-4 col-span-12 flex justify-end'
                        : 'col-span-12'
                }
            >
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={ () => setShowPicker( ! showPicker ) }
                            className="w-10 h-10 rounded-md border border-gray-300 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            style={ { backgroundColor: value } }
                            disabled={ element.disabled }
                        />
                        { showPicker && (
                            <div className="absolute z-10 mt-1 right-0">
                                <div
                                    className="fixed inset-0"
                                    onClick={ () => setShowPicker( false ) }
                                />
                                <div className="relative bg-white p-2 rounded-md shadow-lg border border-gray-200">
                                    <input
                                        id={ element.id }
                                        type="color"
                                        value={ value }
                                        onChange={ handleChange }
                                        disabled={ element.disabled }
                                        className="w-32 h-32 cursor-pointer"
                                    />
                                </div>
                            </div>
                        ) }
                    </div>
                    <input
                        type="text"
                        value={ value }
                        onChange={ handleChange }
                        disabled={ element.disabled }
                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
                        placeholder="#000000"
                    />
                </div>
            </div>
        </div>
    );
};

export default ColorPickerField;

