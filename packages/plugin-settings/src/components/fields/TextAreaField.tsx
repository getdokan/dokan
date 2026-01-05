import { useCallback } from '@wordpress/element';
import type { FieldProps } from '../../types';
import FieldLabel from './FieldLabel';

/**
 * TextAreaField Component
 *
 * Renders a multi-line text input field.
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

    const hasLabel = Boolean( element.title );
    const value = ( element.value as string ) ?? ( element.default as string ) ?? '';
    const rows = element.rows || 4;

    return (
        <div className={ `p-4 ${ element.css_class || '' }` }>
            { hasLabel && (
                <FieldLabel
                    title={ element.title }
                    description={ element.description }
                    tooltip={ element.tooltip }
                    htmlFor={ element.id }
                />
            ) }
            <div className="mt-1">
                <textarea
                    id={ element.id }
                    value={ value }
                    onChange={ handleChange }
                    placeholder={ element.placeholder as string }
                    disabled={ element.disabled }
                    readOnly={ element.readonly }
                    rows={ rows }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                { element.helper_text && (
                    <p className="mt-1 text-xs text-gray-500">{ element.helper_text }</p>
                ) }
            </div>
        </div>
    );
};

export default TextAreaField;

