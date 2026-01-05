import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * TextAreaField Component
 *
 * A generic textarea field for settings.
 */
const TextAreaField = ( { element, onValueChange }: FieldProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLTextAreaElement > ) => {
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
        ( element.value as string ) ?? ( element.default as string ) ?? '';

    return (
        <div
            className={ `grid grid-cols-12 gap-4 justify-between w-full p-4 ${
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
            <div className="col-span-12">
                <textarea
                    id={ element.id }
                    value={ value }
                    onChange={ handleChange }
                    placeholder={ element.placeholder as string }
                    disabled={ element.disabled }
                    readOnly={ element.readonly }
                    rows={ element.rows || 4 }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
};

export default TextAreaField;
