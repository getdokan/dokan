import { useCallback } from '@wordpress/element';
import type { OptionItem } from '../types';

export interface RadioCapsuleProps {
    /**
     * Group name
     */
    name?: string;

    /**
     * Selected value
     */
    value?: string | number;

    /**
     * Default value
     */
    defaultValue?: string | number;

    /**
     * Options array
     */
    options: OptionItem[];

    /**
     * Change handler
     */
    onChange?: ( value: string | number ) => void;

    /**
     * Whether radio group is disabled
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
 * RadioCapsule Component
 *
 * Styled pill/capsule radio buttons.
 */
const RadioCapsule = ( {
    name = 'radio-capsule',
    value,
    defaultValue,
    options = [],
    onChange,
    disabled = false,
    className = '',
    size = 'md',
}: RadioCapsuleProps ) => {
    const handleChange = useCallback(
        ( optionValue: string | number ) => {
            if ( ! disabled ) {
                onChange?.( optionValue );
            }
        },
        [ onChange, disabled ]
    );

    const sizeClasses = {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const currentValue = value ?? defaultValue;

    return (
        <div
            className={ `inline-flex rounded-lg bg-gray-100 p-1 ${ className }` }
            role="radiogroup"
        >
            { options.map( ( option ) => {
                const isSelected = currentValue === option.value;
                const isDisabled = disabled || option.disabled;

                return (
                    <button
                        key={ String( option.value ) }
                        type="button"
                        role="radio"
                        aria-checked={ isSelected }
                        onClick={ () => handleChange( option.value ) }
                        disabled={ isDisabled }
                        className={ `
                            ${ sizeClasses[ size ] }
                            font-medium rounded-md transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            ${ isSelected
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }
                            ${ isDisabled
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                            }
                        `.trim() }
                    >
                        <span className="flex items-center gap-2">
                            { option.icon }
                            { option.label }
                        </span>
                    </button>
                );
            } ) }

            { /* Hidden radio inputs for form submission */ }
            { options.map( ( option ) => (
                <input
                    key={ `input-${ option.value }` }
                    type="radio"
                    name={ name }
                    value={ option.value }
                    checked={ currentValue === option.value }
                    onChange={ () => handleChange( option.value ) }
                    className="sr-only"
                />
            ) ) }
        </div>
    );
};

export default RadioCapsule;

