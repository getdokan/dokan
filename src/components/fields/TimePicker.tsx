import { SimpleInput } from '@getdokan/dokan-ui';
import  { useEffect, useRef, useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';

const CLOCK_ICON = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <g clipPath="url(#clip0_10827_7425)">
            <path
                d="M8.00004 3.9998V7.9998L10.6667 9.33313M14.6667 7.9998C14.6667 11.6817 11.6819 14.6665 8.00004 14.6665C4.31814 14.6665 1.33337 11.6817 1.33337 7.9998C1.33337 4.3179 4.31814 1.33313 8.00004 1.33313C11.6819 1.33313 14.6667 4.3179 14.6667 7.9998Z"
                stroke="#828282"
                strokeWidth="1.45455"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_10827_7425">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
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
    error?: boolean;
}

const TimePicker: React.FC< TimePickerProps > = ( {
    value,
    onChange,
    interval = 30,
    disabled = false,
    className = '',
    dropdownClassName = '',
} ) => {
    const [ open, setOpen ] = useState( false );
    const [ inputValue, setInputValue ] = useState( value || '' );
    const [ errorMsg, setErrorMsg ] = useState( '' );
    const ref = useRef< HTMLDivElement >( null );
    const options = generateTimeOptions( interval );
    options.unshift( 'Full day' );

    // Filter options based on input value
    const filteredOptions = options.filter( ( option ) =>
        option.toLowerCase().includes( inputValue.toLowerCase() )
    );

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

    // Keep inputValue in sync with value prop
    useEffect( () => {
        setInputValue( value || '' );
    }, [ value ] );

    // Keyboard navigation
    const [ highlightedIndex, setHighlightedIndex ] = useState< number >( -1 );
    useEffect( () => {
        if ( ! open ) {
            setHighlightedIndex( -1 );
        }
    }, [ open, inputValue ] );

    const handleInputKeyDown = (
        e: React.KeyboardEvent< HTMLInputElement >
    ) => {
        if ( ! open && ( e.key === 'ArrowDown' || e.key === 'Enter' ) ) {
            setOpen( true );
            return;
        }
        if ( open ) {
            if ( e.key === 'ArrowDown' ) {
                setHighlightedIndex( ( prev ) =>
                    Math.min( prev + 1, filteredOptions.length - 1 )
                );
            } else if ( e.key === 'ArrowUp' ) {
                setHighlightedIndex( ( prev ) => Math.max( prev - 1, 0 ) );
            } else if ( e.key === 'Enter' && highlightedIndex >= 0 ) {
                const selected = filteredOptions[ highlightedIndex ];
                setInputValue( selected );
                onChange( selected );
                setOpen( false );
            } else if ( e.key === 'Escape' ) {
                setOpen( false );
            }
        }
    };

    const isValidTimeFormat = ( inputStr: string ) => {
        return /^((0?[1-9])|(1[0-2])):[0-5][0-9]\s?(am|pm)$/i.test(
            inputStr.trim()
        );
    };
    const isValidTimeOrCustom = ( inputStr: string ) => {
        return (
            isValidTimeFormat( inputStr ) ||
            inputStr.trim().toLowerCase() === 'full day' ||
            inputStr.trim().toLowerCase() === 'anytime'
        );
    };

    return (
        <div ref={ ref } className={ twMerge( 'relative w-36', className ) }>
            <SimpleInput
                addOnLeft={ CLOCK_ICON }
                value={ inputValue }
                onChange={ ( e ) => {
                    setInputValue( e.target.value );
                    setOpen( true );
                    setErrorMsg( '' );
                } }
                onFocus={ () => ! disabled && setOpen( true ) }
                onKeyDown={ handleInputKeyDown }
                onBlur={ () => {
                    if (
                        inputValue.trim() &&
                        ! isValidTimeOrCustom( inputValue )
                    ) {
                        setErrorMsg(
                            'Please enter a valid time in hh:mm am/pm format or a valid custom value.'
                        );
                    } else {
                        setErrorMsg( '' );
                    }
                } }
                input={ { placeholder: 'hh:mm am/pm or custom' } }
                disabled={ disabled }
                errors={ errorMsg ? [ errorMsg ] : [] }
            />
            { open && ! disabled && (
                <ul
                    className={ twMerge(
                        'absolute z-10  w-full max-h-60 overflow-auto bg-white border border-[#e9e9e9] rounded-[3px] shadow-lg py-1',
                        dropdownClassName
                    ) }
                    role="listbox"
                    id="time-picker-options"
                >
                    { filteredOptions.map( ( option, idx ) => (
                        <li
                            key={ option }
                            className={ twMerge(
                                'px-4 py-2 text-[14px] text-[#575757] cursor-pointer hover:bg-[#f1f1f4] transition',
                                value === option
                                    ? 'bg-[#EFEAFF] font-medium'
                                    : '',
                                highlightedIndex === idx ? 'bg-[#f1f1f4]' : ''
                            ) }
                            role="option"
                            aria-selected={ value === option }
                            tabIndex={ 0 }
                            onClick={ () => {
                                setInputValue( option );
                                onChange( option );
                                setOpen( false );
                            } }
                            onMouseEnter={ () => setHighlightedIndex( idx ) }
                            onKeyDown={ ( e ) => {
                                if ( e.key === 'Enter' || e.key === ' ' ) {
                                    setInputValue( option );
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
