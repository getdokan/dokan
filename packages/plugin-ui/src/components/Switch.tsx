import { useCallback } from '@wordpress/element';

export interface SwitchProps {
    /**
     * Unique identifier
     */
    id?: string;

    /**
     * Whether switch is checked
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
     * Whether switch is disabled
     */
    disabled?: boolean;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Size variant
     */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Switch Component
 *
 * A toggle switch input.
 */
const Switch = ( {
    id,
    checked = false,
    defaultChecked,
    onChange,
    label,
    disabled = false,
    className = '',
    size = 'md',
}: SwitchProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onChange?.( e.target.checked );
        },
        [ onChange ]
    );

    const sizeClasses = {
        sm: { track: 'h-4 w-8', thumb: 'h-3 w-3', translate: 'translate-x-4' },
        md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-5' },
        lg: { track: 'h-7 w-14', thumb: 'h-6 w-6', translate: 'translate-x-7' },
    };

    const sizes = sizeClasses[ size ];

    return (
        <label
            htmlFor={ id }
            className={ `inline-flex items-center gap-3 cursor-pointer ${ className }` }
        >
            <div className="relative">
                <input
                    id={ id }
                    type="checkbox"
                    checked={ checked }
                    defaultChecked={ defaultChecked }
                    onChange={ handleChange }
                    disabled={ disabled }
                    className="sr-only peer"
                />
                <div
                    className={ `
                        ${ sizes.track }
                        bg-gray-200 rounded-full
                        peer-checked:bg-indigo-600
                        peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                        transition-colors duration-200
                    `.trim() }
                />
                <div
                    className={ `
                        ${ sizes.thumb }
                        absolute left-0.5 top-0.5
                        bg-white rounded-full shadow-md
                        peer-checked:${ sizes.translate }
                        transition-transform duration-200
                    `.trim() }
                />
            </div>
            { label && (
                <span
                    className={ `text-sm text-gray-700 ${
                        disabled ? 'opacity-50' : ''
                    }` }
                >
                    { label }
                </span>
            ) }
        </label>
    );
};

export default Switch;

