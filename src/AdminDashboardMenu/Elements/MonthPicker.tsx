import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { ChevronDown } from "lucide-react";
import { DokanButton } from "../../components";
import { __ } from "@wordpress/i18n";
import { useRef, useState } from "@wordpress/element";
import { useOnClickOutside } from "usehooks-ts";

function MonthPicker(props) {
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
        <div>
            <Popover className="relative">
                <PopoverButton
                    className="shadow rounded w-fullflex items-center justify-between w-full px-3 py-2 text-sm bg-white border"
                    onClick={ () => setIsOpen( ! isOpen ) }
                >
                    Click
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
                            <div className="h-20 w-32">

                            </div>
                        </div>
                    </PopoverPanel>
                </Transition>
            </Popover>
        </div>
    );
}

export default MonthPicker;
