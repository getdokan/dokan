import {
    Popover,
    PopoverButton,
    PopoverPanel,
    Transition,
} from '@headlessui/react';
import { useRef, useState } from '@wordpress/element';
import { useOnClickOutside } from 'usehooks-ts';
import { DatePicker } from '@wordpress/components';
import { DokanButton } from '@dokan/components';
import { __ } from '@wordpress/i18n';

const WpDatePicker = ( props ) => {
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
                className="shadow-none w-full"
                onClick={ () => setIsOpen( ! isOpen ) }
            >
                { props.children ?? '' }
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
                            { __( 'Clear', 'dokan' ) }
                        </DokanButton>
                    </div>
                </PopoverPanel>
            </Transition>
        </Popover>
    );
};

export default WpDatePicker;
