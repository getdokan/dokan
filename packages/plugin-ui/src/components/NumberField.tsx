import { useCallback, forwardRef } from '@wordpress/element';
import type { BaseFieldProps } from '../types';

export interface NumberFieldProps extends BaseFieldProps {
    /**
     * Minimum value
     */
    min?: number;

    /**
     * Maximum value
     */
    max?: number;

    /**
     * Step increment
     */
    step?: number;

    /**
     * Prefix element
     */
    prefix?: React.ReactNode;

    /**
     * Suffix element
     */
    suffix?: React.ReactNode;
}

/**
 * NumberField Component
 *
 * A numeric input with min/max/step support.
 */
const NumberField = forwardRef< HTMLInputElement, NumberFieldProps >(
    (
        {
            id,
            value,
            defaultValue,
            onChange,
            placeholder,
            disabled = false,
            readOnly = false,
            className = '',
            ariaLabel,
            min,
            max,
            step = 1,
            prefix,
            suffix,
        },
        ref
    ) => {
        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLInputElement > ) => {
                const newValue = e.target.value;
                onChange?.(
                    newValue === '' ? '' : parseFloat( newValue ) || 0
                );
            },
            [ onChange ]
        );

        const inputClasses = `
            block w-full rounded-md border-gray-300 shadow-sm 
            focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
            disabled:bg-gray-100 disabled:cursor-not-allowed
            read-only:bg-gray-50
            ${ prefix ? 'pl-10' : '' }
            ${ suffix ? 'pr-10' : '' }
            ${ className }
        `.trim();

        return (
            <div className="relative">
                { prefix && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        { prefix }
                    </div>
                ) }
                <input
                    ref={ ref }
                    id={ id }
                    type="number"
                    value={ value as number }
                    defaultValue={ defaultValue as number }
                    onChange={ handleChange }
                    placeholder={ placeholder }
                    disabled={ disabled }
                    readOnly={ readOnly }
                    className={ inputClasses }
                    aria-label={ ariaLabel }
                    min={ min }
                    max={ max }
                    step={ step }
                />
                { suffix && (
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        { suffix }
                    </div>
                ) }
            </div>
        );
    }
);

NumberField.displayName = 'NumberField';

export default NumberField;

