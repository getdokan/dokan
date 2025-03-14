import { Listbox, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SettingsProps } from '../../StepSettings';
function classNames( ...classes ) {
    return classes.filter( Boolean ).join( ' ' );
}

const Select = ( { element, onValueChange }: SettingsProps ) => {
    const [ value, setValue ] = useState( element.value );
    const [ selectedOption, setSelectedOption ] = useState(
        ( element.options.find( ( option ) => option?.value === value ) ||
            element.options.find(
                ( option ) => option?.value === element?.default
            ) ) ?? {
            value: '',
            title: __( 'Select Option', 'dokan-lite' ),
        }
    );

    useEffect( () => {
        setValue( selectedOption.value );
        onValueChange( {
            ...element,
            value: selectedOption.value,
        } );
    }, [ element, onValueChange, selectedOption ] );

    if ( ! element.display ) {
        return <></>;
    }
    return (
        <div className="col-span-4" id={ element.hook_key + '_div' }>
            <Listbox value={ selectedOption } onChange={ setSelectedOption }>
                { ( { open } ) => (
                    <>
                        <Listbox.Label className="block text-sm font-medium text-gray-700">
                            { element.title }
                        </Listbox.Label>
                        <div className="relative mt-1">
                            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                <span className="block truncate">
                                    { selectedOption.title }
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"></span>
                            </Listbox.Button>

                            <Transition
                                show={ open }
                                as={ Fragment }
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    { element.options.map( ( option ) => (
                                        <Listbox.Option
                                            key={
                                                element.hook_key + option.value
                                            }
                                            className={ ( { active } ) =>
                                                classNames(
                                                    active
                                                        ? 'text-white bg-indigo-600'
                                                        : 'text-gray-900',
                                                    'relative cursor-default select-none py-2 pl-8 pr-4'
                                                )
                                            }
                                            value={ option }
                                        >
                                            { ( { selected, active } ) => (
                                                <>
                                                    <span
                                                        className={ classNames(
                                                            selected
                                                                ? 'font-semibold'
                                                                : 'font-normal',
                                                            'block truncate'
                                                        ) }
                                                    >
                                                        { option.title }
                                                    </span>

                                                    { selected ? (
                                                        <span
                                                            className={ classNames(
                                                                active
                                                                    ? 'text-white'
                                                                    : 'text-indigo-600',
                                                                'absolute inset-y-0 left-0 flex items-center pl-1.5'
                                                            ) }
                                                        >
                                                            <CheckIcon
                                                                className="h-5 w-5"
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    ) : null }
                                                </>
                                            ) }
                                        </Listbox.Option>
                                    ) ) }
                                </Listbox.Options>
                            </Transition>
                        </div>
                    </>
                ) }
            </Listbox>
        </div>
    );
};

export default Select;
