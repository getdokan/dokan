import {
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition,
} from '@headlessui/react';
import { useRef, useState } from '@wordpress/element';
import { useOnClickOutside } from 'usehooks-ts';
import { DatePicker } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DokanButton } from './index';
import { SimpleInput } from '@getdokan/dokan-ui';
import { dateI18n, getSettings } from '@wordpress/date';
import { useInstanceId } from '@wordpress/compose';

const WpDatePicker = ( props ) => {
    const instanceId = useInstanceId( WpDatePicker, 'dokan-date-picker-input' );
    const [ isOpen, setIsOpen ] = useState< boolean >( false );
    const ref = useRef( null );
    useOnClickOutside( ref, () => setIsOpen( ! isOpen ) );

    const updatedProps = {
        ...props,
        onChange: ( updatedDate ) => {
            setIsOpen( false );

            if ( props.onChange ) {
                props.onChange( updatedDate );
            }
        },
    };

    return (
        <Popover className="relative">
            <PopoverButton
                className="shadow-none rounded w-full"
                onClick={ () => setIsOpen( ! isOpen ) }
            >
                { props.children ?? (
                    <SimpleInput
                        onChange={ () => {} }
                        value={
                            props?.currentDate
                                ? dateI18n(
                                      getSettings().formats.date,
                                      props?.currentDate,
                                      getSettings().timezone.string
                                  )
                                : ''
                        }
                        input={ {
                            id: props?.inputId ?? instanceId,
                            name: props?.inputName ?? 'dokan_date_picker_input',
                            type: 'text',
                            readOnly: true,
                            autoComplete: 'off',
                            placeholder: __( 'Select date', 'dokan-lite' ),
                            'aria-label':
                                props?.ariaLabel ??
                                __( 'Select date', 'dokan-lite' ),
                        } }
                    />
                ) }
            </PopoverButton>
            <Transition
                show={ isOpen }
                enter="transition duration-200 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-150 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0"
            >
                <PopoverPanel
                    anchor="bottom"
                    className="absolute flex rounded shadow-xl border"
                >
                    <div
                        className="p-4 w-auto flex-auto overflow-hidden bg-white text-sm/6 z-40"
                        ref={ ref }
                    >
                        <DatePicker { ...updatedProps } />
                        <DokanButton
                            size="sm"
                            className="mt-2"
                            onClick={ () => updatedProps.onChange( '' ) }
                        >
                            { __( 'Clear', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                </PopoverPanel>
            </Transition>
        </Popover>
    );
};

export default WpDatePicker;
