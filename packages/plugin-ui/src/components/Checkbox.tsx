import { useCallback } from '@wordpress/element';

export interface CheckboxProps {
    /**
     * Unique identifier
     */
    id?: string;

    /**
     * Whether checkbox is checked
     */
    checked?: boolean;

    /**
     * Default checked state
     */
    defaultChecked?: boolean;

    /**
     * Change handler
     */
    onChange?: ( checked: boolean ) => void;

    /**
     * Label text
     */
    label?: string;

    /**
     * Description below label
     */
    description?: string;

    /**
     * Whether checkbox is disabled
     */
    disabled?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Indeterminate state
     */
    indeterminate?: boolean;
}

/**
 * Checkbox Component
 *
 * A single checkbox input.
 */
const Checkbox = ( {
    id,
    checked = false,
    defaultChecked,
    onChange,
    label,
    description,
    disabled = false,
    className = '',
}: CheckboxProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onChange?.( e.target.checked );
        },
        [ onChange ]
    );

    return (
        <label
            htmlFor={ id }
            className={ `flex items-start gap-3 cursor-pointer ${ className }` }
        >
            <div className="flex items-center h-5">
                <input
                    id={ id }
                    type="checkbox"
                    checked={ checked }
                    defaultChecked={ defaultChecked }
                    onChange={ handleChange }
                    disabled={ disabled }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </div>
            { ( label || description ) && (
                <div>
                    { label && (
                        <span
                            className={ `text-sm font-medium text-gray-700 ${
                                disabled ? 'opacity-50' : ''
                            }` }
                        >
                            { label }
                        </span>
                    ) }
                    { description && (
                        <p className="text-xs text-gray-500">{ description }</p>
                    ) }
                </div>
            ) }
        </label>
    );
};

export default Checkbox;

