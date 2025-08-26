import { twMerge } from 'tailwind-merge';
import { useEffect, useRef, useState } from '@wordpress/element';

export interface DokanRadioCapsuleProps {
    options: Array< {
        value: string;
        title: string;
        icon?: React.ReactNode;
    } >;
    selected: string;
    onChange: ( value: string ) => void;
    containerClassName?: string;
    className?: string;
    name?: string; // For screen readers
}

const DokanRadioCapsule = ( {
    options = [],
    containerClassName = '',
    selected,
    onChange,
    className = '',
    name = 'radio-capsule-group',
}: DokanRadioCapsuleProps ) => {
    const [ selectedValue, setSelectedValue ] = useState< string >( selected );
    const [ focusedIndex, setFocusedIndex ] = useState< number >(
        options.findIndex( ( option ) => option.value === selected ) || 0
    );
    const buttonRefs = useRef< ( HTMLButtonElement | null )[] >( [] );

    useEffect( () => {
        setSelectedValue( selected );
        setFocusedIndex(
            options.findIndex( ( option ) => option.value === selected ) || 0
        );
    }, [ selected, options ] );

    const handleChange = ( value: string ) => {
        setSelectedValue( value );
        onChange( value );
    };

    const handleKeyDown = ( event: React.KeyboardEvent, index: number ) => {
        let newIndex = focusedIndex;

        switch ( event.key ) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = index > 0 ? index - 1 : options.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = index < options.length - 1 ? index + 1 : 0;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = options.length - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                handleChange( options[ index ].value );
                return;
            default:
                return;
        }

        setFocusedIndex( newIndex );
        buttonRefs.current[ newIndex ]?.focus();
    };

    const handleClick = ( value: string, index: number ) => {
        setFocusedIndex( index );
        handleChange( value );
    };

    const handleFocus = ( index: number ) => {
        setFocusedIndex( index );
    };

    return (
        <div
            className={ twMerge(
                'inline-flex flex-wrap items-center',
                containerClassName
            ) }
            role="radiogroup"
            aria-label={ name }
        >
            { options?.map( ( option, index ) => (
                <button
                    key={ option?.value }
                    ref={ ( el ) => ( buttonRefs.current[ index ] = el ) }
                    type="button"
                    role="radio"
                    aria-checked={ selectedValue === option?.value }
                    aria-label={ option?.title }
                    tabIndex={ focusedIndex === index ? 0 : -1 }
                    className={ twMerge(
                        `px-5 py-3 text-sm font-semibold flex gap-[10px] items-center border
                         transition-colors duration-150 ease-in-out
                         focus:!outline-none
                         ${ index === 0 && 'rounded-l-md' }
                         ${ index === options.length - 1 && 'rounded-r-md' }
                         ${
                             selectedValue === option?.value
                                 ? 'bg-dokan-btn border-dokan-btn text-white'
                                 : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                         }`,
                        className
                    ) }
                    onClick={ () => handleClick( option?.value, index ) }
                    onKeyDown={ ( event ) => handleKeyDown( event, index ) }
                    onFocus={ () => handleFocus( index ) }
                >
                    { option?.icon && (
                        <span
                            className="w-4 h-4 flex items-center justify-center"
                            aria-hidden="true"
                        >
                            { option.icon }
                        </span>
                    ) }
                    { option?.title }
                </button>
            ) ) }
        </div>
    );
};

export default DokanRadioCapsule;
