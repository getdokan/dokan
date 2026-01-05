import { useCallback, forwardRef } from '@wordpress/element';
import type { BaseFieldProps } from '../types';

export interface TimePickerProps extends BaseFieldProps {
    /**
     * Minimum time (HH:MM format)
     */
    min?: string;

    /**
     * Maximum time (HH:MM format)
     */
    max?: string;

    /**
     * Step in seconds (60 = 1 minute increments)
     */
    step?: number;

    /**
     * 12-hour or 24-hour format display
     */
    format?: '12' | '24';
}

/**
 * TimePicker Component
 *
 * A time selection input.
 */
const TimePicker = forwardRef< HTMLInputElement, TimePickerProps >(
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
            step = 60,
        },
        ref
    ) => {
        const handleChange = useCallback(
            ( e: React.ChangeEvent< HTMLInputElement > ) => {
                onChange?.( e.target.value );
            },
            [ onChange ]
        );

        return (
            <input
                ref={ ref }
                id={ id }
                type="time"
                value={ value as string }
                defaultValue={ defaultValue as string }
                onChange={ handleChange }
                placeholder={ placeholder }
                disabled={ disabled }
                readOnly={ readOnly }
                min={ min }
                max={ max }
                step={ step }
                aria-label={ ariaLabel }
                className={ `
                    block w-full rounded-md border-gray-300 shadow-sm 
                    focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    read-only:bg-gray-50
                    ${ className }
                `.trim() }
            />
        );
    }
);

TimePicker.displayName = 'TimePicker';

export default TimePicker;

