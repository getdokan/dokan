import { useState } from '@wordpress/element';

/**
 * SwitchElement Component
 *
 * A reusable toggle switch component for payment methods with title and description
 *
 * @param {Object}   props                Component props
 * @param {string}   props.title          - The title of the payment method
 * @param {string}   props.description    - The description text
 * @param {boolean}  props.defaultEnabled - Initial state of the toggle
 * @param {Function} props.onChange       - Callback function when toggle changes
 */
const SwitchElement = ( {
    title,
    description,
    defaultEnabled = false,
    onChange,
} ) => {
    const [ isEnabled, setIsEnabled ] = useState( defaultEnabled );

    const handleToggle = () => {
        const newState = ! isEnabled;
        setIsEnabled( newState );
        if ( onChange ) {
            onChange( newState );
        }
    };

    return (
        <div className="border-b border-gray-200 py-4 w-full">
            <div className="flex justify-between w-full items-center">
                <div className="flex flex-col">
                    { title && (
                        <h3 className="text-base font-medium text-gray-800">
                            { title }
                        </h3>
                    ) }
                    { description && (
                        <p className="text-sm text-gray-500 mt-1">
                            { description }
                        </p>
                    ) }
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none"
                        onClick={ handleToggle }
                        aria-pressed={ isEnabled }
                        type="button"
                    >
                        <span
                            className={ `absolute w-11 h-6 rounded-full transition ${
                                isEnabled ? 'bg-[#7047EB]' : 'bg-gray-300'
                            }` }
                        />
                        <span
                            className={ `absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white transition ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }` }
                        />
                        <span className="sr-only">
                            { isEnabled ? 'Enabled' : 'Disabled' }
                        </span>
                    </button>

                    <span className="ml-2 text-sm text-gray-900 font-medium">
                        { isEnabled ? 'Enabled' : 'Disabled' }
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SwitchElement;

// Usage example:
// <SwitchElement
//   title="PayPal"
//   description="Enable PayPal for your vendor as a withdraw method"
//   defaultEnabled={true}
//   onChange={(enabled) => console.log('PayPal enabled:', enabled)}
// />
