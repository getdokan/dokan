import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Clock, ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import {
    DEFAULT_STEP_MINUTES,
    FULL_DAY,
    MINUTES_PER_DAY,
    formatTimeForDisplay,
    minutesToCanonical,
    minutesToDisplay,
    timeToMinutes,
} from './utils';

export type TimeDropdownProps = {
    value?: string;
    onChange?: ( newValue: string ) => void;
    placeholder?: string;
    is12Hour?: boolean;
    hasError?: boolean;
    // Offer the "Full Day" preset (opening dropdowns only — a closing can never be "Full Day").
    includeFullDay?: boolean;
    step?: number;
};

type TimeOption = { key: string; label: string; minutes: number | null };

// Preset dropdown (legacy jQuery-timepicker UX): "Full Day" + step increments. Stores the
// canonical `g:i a` key (or FULL_DAY sentinel); labels re-localize per render via dateI18n.
const TimeDropdown = ( {
    value = '',
    onChange,
    placeholder = '',
    is12Hour = true,
    hasError = false,
    includeFullDay = false,
    step = DEFAULT_STEP_MINUTES,
}: TimeDropdownProps ) => {
    const [ open, setOpen ] = useState( false );
    const wrapRef = useRef< HTMLDivElement | null >( null );
    const listRef = useRef< HTMLUListElement | null >( null );

    const options = useMemo( () => {
        const opts: TimeOption[] = [];
        if ( includeFullDay ) {
            opts.push( {
                key: FULL_DAY,
                label: __( 'Full Day', 'dokan-lite' ),
                minutes: null,
            } );
        }
        for ( let m = 0; m < MINUTES_PER_DAY; m += step ) {
            opts.push( {
                key: minutesToCanonical( m ),
                label: minutesToDisplay( m, is12Hour ),
                minutes: m,
            } );
        }
        return opts;
    }, [ includeFullDay, is12Hour, step ] );

    // Match by minutes so stored values with other casing/padding ("09:00 AM") still highlight.
    const valueMinutes = timeToMinutes( value );
    const isSelected = ( option: TimeOption ): boolean =>
        option.key === value ||
        ( valueMinutes !== null && option.minutes === valueMinutes );

    const displayLabel =
        value === FULL_DAY
            ? __( 'Full Day', 'dokan-lite' )
            : value && formatTimeForDisplay( value, is12Hour );

    useEffect( () => {
        if ( ! open ) {
            return;
        }
        const handler = ( event: MouseEvent ) => {
            if (
                wrapRef.current &&
                ! wrapRef.current.contains( event.target as Node )
            ) {
                setOpen( false );
            }
        };
        document.addEventListener( 'mousedown', handler );
        const selected = listRef.current?.querySelector(
            '[aria-selected="true"]'
        ) as HTMLElement | null;
        selected?.scrollIntoView?.( { block: 'center' } );
        return () => document.removeEventListener( 'mousedown', handler );
    }, [ open ] );

    const selectOption = ( option: TimeOption ) => {
        onChange?.( option.key );
        setOpen( false );
    };

    return (
        <div ref={ wrapRef } className="relative inline-block">
            <button
                type="button"
                onClick={ () => setOpen( ( isOpen ) => ! isOpen ) }
                className={ twMerge(
                    'flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm min-w-[155px] focus:outline-none focus:ring-2 focus:ring-[#7047EB]',
                    hasError
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-gray-300'
                ) }
            >
                <Clock size={ 16 } className="text-gray-400" />
                <span
                    className={ twMerge(
                        'flex-1 text-left text-[#25252D]',
                        ! displayLabel && 'text-gray-400'
                    ) }
                >
                    { displayLabel || placeholder }
                </span>
                <ChevronDown size={ 14 } className="text-gray-400" />
            </button>
            { open && (
                <ul
                    ref={ listRef }
                    className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
                    role="listbox"
                >
                    { options.map( ( option ) => {
                        const selected = isSelected( option );
                        return (
                            /* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */
                            <li
                                key={ option.key }
                                role="option"
                                aria-selected={ selected }
                                onClick={ () => selectOption( option ) }
                                className={ twMerge(
                                    'cursor-pointer px-3 py-2 text-sm hover:bg-gray-100',
                                    selected && 'bg-gray-100 font-medium',
                                    option.key === FULL_DAY &&
                                        'border-b border-gray-200'
                                ) }
                            >
                                { option.label }
                            </li>
                        );
                    } ) }
                </ul>
            ) }
        </div>
    );
};

export default TimeDropdown;
