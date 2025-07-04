import { useState, useRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';

const CLOCK_ICON = (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="10" cy="10" r="9" stroke="#828282" strokeWidth="2" />
        <path
            d="M10 5V10L13 12"
            stroke="#828282"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

function generateTimeOptions( interval: number = 30 ) {
    const options: string[] = [];
    for ( let h = 0; h < 24; h++ ) {
        for ( let m = 0; m < 60; m += interval ) {
            const hour = h % 12 === 0 ? 12 : h % 12;
            const ampm = h < 12 ? 'am' : 'pm';
            const min = m.toString().padStart( 2, '0' );
            options.push( `${ hour }:${ min } ${ ampm }` );
        }
    }
    return options;
}

export interface TimePickerProps {
    value: string;
    onChange: ( value: string ) => void;
    interval?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    dropdownClassName?: string;
}

const TimePicker: React.FC< TimePickerProps > = ( {
    value,
    onChange,
    interval = 30,
    placeholder = 'Select time',
    disabled = false,
    className = '',
    dropdownClassName = '',
} ) => {
    const [ open, setOpen ] = useState( false );
    const ref = useRef< HTMLDivElement >( null );
    const options = generateTimeOptions( interval );

    // add full day option to the options array
    options.unshift( 'Full day' );

    useEffect( () => {
        function handleClickOutside( event: MouseEvent ) {
            if (
                ref.current &&
                ! ref.current.contains( event.target as Node )
            ) {
                setOpen( false );
            }
        }
        if ( open ) {
            document.addEventListener( 'mousedown', handleClickOutside );
        } else {
            document.removeEventListener( 'mousedown', handleClickOutside );
        }
        return () => {
            document.removeEventListener( 'mousedown', handleClickOutside );
        };
    }, [ open ] );

    return (
        <div ref={ ref } className={ twMerge( 'relative w-36', className ) }>
            <button
                type="button"
                className={ twMerge(
                    'flex items-center w-full h-10 px-3 bg-white border border-[#e9e9e9] rounded-[3px] text-[#575757] text-[14px] font-inter font-normal focus:outline-none focus:ring-2 focus:ring-[#7047eb] transition',
                    disabled
                        ? 'bg-[#F1F1F4] opacity-60 cursor-not-allowed'
                        : 'hover:border-[#7047eb]'
                ) }
                onClick={ () => ! disabled && setOpen( ( o ) => ! o ) }
                disabled={ disabled }
                aria-haspopup="listbox"
                aria-expanded={ open }
            >
                <span className="mr-2 flex-shrink-0">{ CLOCK_ICON }</span>
                <span className="flex-1 text-left truncate">
                    { value || (
                        <span className="text-[#bdbdbd]">{ placeholder }</span>
                    ) }
                </span>
                <svg
                    className="ml-2"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 16 16"
                >
                    <path
                        d="M4 6l4 4 4-4"
                        stroke="#828282"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            { open && ! disabled && (
                <ul
                    className={ twMerge(
                        'absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border border-[#e9e9e9] rounded-[3px] shadow-lg py-1',
                        dropdownClassName
                    ) }
                    role="listbox"
                >
                    { options.map( ( option ) => (
                        <li
                            key={ option }
                            className={ twMerge(
                                'px-4 py-2 text-[14px] text-[#575757] cursor-pointer hover:bg-[#f1f1f4] transition',
                                value === option
                                    ? 'bg-[#EFEAFF] font-medium'
                                    : ''
                            ) }
                            role="option"
                            aria-selected={ value === option }
                            tabIndex={ 0 }
                            onClick={ () => {
                                onChange( option );
                                setOpen( false );
                            } }
                            onKeyDown={ ( e ) => {
                                if ( e.key === 'Enter' || e.key === ' ' ) {
                                    onChange( option );
                                    setOpen( false );
                                }
                            } }
                        >
                            { option }
                        </li>
                    ) ) }
                </ul>
            ) }
        </div>
    );
};

export default TimePicker;
