import { useCallback } from '@wordpress/element';
import type { OptionItem } from '../types';

export interface RadioProps {
    /**
     * Group name
     */
    name: string;

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
     * Layout direction
     */
    direction?: 'horizontal' | 'vertical';
}

/**
 * Radio Component
 *
 * A radio button group.
 */
const Radio = ( {
    name,
    value,
    defaultValue,
    options = [],
    onChange,
    disabled = false,
    className = '',
    direction = 'vertical',
}: RadioProps ) => {
    const handleChange = useCallback(
        ( e: React.ChangeEvent< HTMLInputElement > ) => {
            onChange?.( e.target.value );
        },
        [ onChange ]
    );

    const directionClass =
        direction === 'horizontal'
            ? 'flex flex-wrap gap-4'
            : 'flex flex-col gap-3';

    return (
        <div className={ `${ directionClass } ${ className }` }>
            { options.map( ( option ) => {
                const optionId = `${ name }-${ option.value }`;
                const isChecked = value !== undefined
                    ? value === option.value
                    : defaultValue === option.value;

                return (
                    <label
                        key={ String( option.value ) }
                        htmlFor={ optionId }
                        className={ `flex items-start gap-3 cursor-pointer ${
                            option.disabled || disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }` }
                    >
                        <div className="flex items-center h-5">
                            <input
                                id={ optionId }
                                type="radio"
                                name={ name }
                                value={ option.value }
                                checked={ isChecked }
                                onChange={ handleChange }
                                disabled={ option.disabled || disabled }
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                { option.label }
                            </span>
                            { option.description && (
                                <p className="text-xs text-gray-500">
                                    { option.description }
                                </p>
                            ) }
                        </div>
                    </label>
                );
            } ) }
        </div>
    );
};

export default Radio;

