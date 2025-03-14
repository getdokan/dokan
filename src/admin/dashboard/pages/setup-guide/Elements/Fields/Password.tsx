import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const Password = ( { element, onValueChange }: SettingsProps ) => {
    const [ value, setValue ] = useState( element.value );

    const handleValueChange = ( event ) => {
        setValue( event.target.value );
        onValueChange( {
            ...element,
            value: event.target.value,
        } );
    };
    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div className="col-span-4">
            <label
                htmlFor={ element.hook_key }
                className="block text-sm font-medium text-gray-700"
            >
                { element.title }
            </label>
            <input
                type="password"
                onChange={ handleValueChange }
                name={ element.hook_key }
                id={ element.hook_key }
                placeholder={ element?.placeholder }
                autoComplete="off"
                value={ value }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
            />
        </div>
    );
};

export default Password;
