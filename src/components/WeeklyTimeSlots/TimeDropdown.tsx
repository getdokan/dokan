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
    // Render as a static, non-editable field (e.g. the "Full Day" closing placeholder).
    readOnly?: boolean;
};

type TimeOption = { key: string; label: string; minutes: number | null };

const LIST_MAX_HEIGHT = 288;

// Visible clip window: the viewport intersected with every scroll/overflow ancestor (e.g. the
// admin settings card), so the in-flow list can flip up / shrink to fit instead of being cut off.
const getClipWindow = ( el: HTMLElement ): { top: number; bottom: number } => {
    let top = 0;
    let bottom = window.innerHeight;
    let node = el.parentElement;
    while ( node ) {
        if ( getComputedStyle( node ).overflowY !== 'visible' ) {
            const rect = node.getBoundingClientRect();
            top = Math.max( top, rect.top );
            bottom = Math.min( bottom, rect.bottom );
        }
        node = node.parentElement;
    }
    return { top, bottom };
};

// Writable time combobox: type a custom time (parsed on commit) or pick a preset; the in-flow list keeps the app's scoped Tailwind styling.
const TimeDropdown = ( {
    value = '',
    onChange,
    placeholder = '',
    is12Hour = true,
    hasError = false,
    includeFullDay = false,
    step = DEFAULT_STEP_MINUTES,
    readOnly = false,
}: TimeDropdownProps ) => {
    const [ open, setOpen ] = useState( false );
    // The list opens downward by default; it flips up / shrinks to stay inside the clip window.
    const [ placement, setPlacement ] = useState( {
        up: false,
        maxHeight: LIST_MAX_HEIGHT,
    } );
    const wrapRef = useRef< HTMLDivElement | null >( null );
    const listRef = useRef< HTMLUListElement | null >( null );
    const inputRef = useRef< HTMLInputElement | null >( null );

    const fullDayLabel = __( 'Full Day', 'dokan-lite' );

    // The text a stored value shows as: Full Day sentinel, localized time, or ''.
    const valueToText = ( raw: string ): string => {
        if ( raw === FULL_DAY ) {
            return fullDayLabel;
        }
        return raw ? formatTimeForDisplay( raw, is12Hour ) : '';
    };

    const [ inputText, setInputText ] = useState( () => valueToText( value ) );

    const options = useMemo( () => {
        const opts: TimeOption[] = [];
        if ( includeFullDay ) {
            opts.push( { key: FULL_DAY, label: fullDayLabel, minutes: null } );
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

    // Match by minutes so stored values with other casing/padding still highlight.
    const valueMinutes = timeToMinutes( value );
    const isSelected = ( option: TimeOption ): boolean =>
        option.key === value ||
        ( valueMinutes !== null && option.minutes === valueMinutes );

    // Keep the field text in sync with the stored value whenever we're not editing.
    useEffect( () => {
        if ( ! open ) {
            setInputText( valueToText( value ) );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ value, is12Hour, open ] );

    // Commit the live input value (via ref, so the outside-click listener isn't stale) as a custom time or Full Day; invalid input is ignored.
    const commitText = () => {
        const text = ( inputRef.current?.value ?? inputText ).trim();
        if ( ! text ) {
            onChange?.( '' );
            return;
        }
        if (
            includeFullDay &&
            text.toLowerCase() === fullDayLabel.toLowerCase()
        ) {
            onChange?.( FULL_DAY );
            return;
        }
        const minutes = timeToMinutes( text );
        if ( minutes !== null ) {
            onChange?.( minutesToCanonical( minutes ) );
        }
        // else: keep the stored value; the sync effect restores its text.
    };

    const selectOption = ( option: TimeOption ) => {
        onChange?.( option.key );
        setInputText( option.label );
        setOpen( false );
    };

    // Commit the typed text and close when clicking away; scroll the current value into view on open.
    useEffect( () => {
        if ( ! open ) {
            return;
        }
        // Flip up when the space below can't fit the list; cap its height to the room available.
        const wrap = wrapRef.current;
        if ( wrap ) {
            const rect = wrap.getBoundingClientRect();
            const clip = getClipWindow( wrap );
            const gap = 4;
            const below = clip.bottom - rect.bottom - gap;
            const above = rect.top - clip.top - gap;
            const up = below < LIST_MAX_HEIGHT && above > below;
            setPlacement( {
                up,
                maxHeight: Math.max(
                    160,
                    Math.min( LIST_MAX_HEIGHT, up ? above : below )
                ),
            } );
        }
        const handler = ( event: MouseEvent ) => {
            if (
                wrapRef.current &&
                ! wrapRef.current.contains( event.target as Node )
            ) {
                commitText();
                setOpen( false );
            }
        };
        document.addEventListener( 'mousedown', handler );
        const selected = listRef.current?.querySelector(
            '[aria-selected="true"]'
        ) as HTMLElement | null;
        selected?.scrollIntoView?.( { block: 'center' } );
        return () => document.removeEventListener( 'mousedown', handler );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ open ] );

    return (
        <div ref={ wrapRef } className="relative inline-block">
            <div
                className={ twMerge(
                    'flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm shadow-sm min-w-[155px] focus-within:ring-2 focus-within:ring-[#7047EB]',
                    hasError
                        ? 'border-red-500 ring-1 ring-red-500'
                        : 'border-gray-300',
                    readOnly && 'cursor-not-allowed opacity-50'
                ) }
            >
                <Clock size={ 16 } className="shrink-0 text-gray-400" />
                <input
                    ref={ inputRef }
                    type="text"
                    value={ inputText }
                    placeholder={ placeholder }
                    readOnly={ readOnly }
                    onChange={ ( event ) => setInputText( event.target.value ) }
                    onFocus={ () => ! readOnly && setOpen( true ) }
                    onClick={ () => ! readOnly && setOpen( true ) }
                    onKeyDown={ ( event ) => {
                        if ( event.key === 'Enter' ) {
                            event.preventDefault();
                            commitText();
                            setOpen( false );
                        } else if ( event.key === 'Escape' ) {
                            setInputText( valueToText( value ) );
                            setOpen( false );
                        }
                    } }
                    // Bare field: strip the theme/WP input chrome so it blends into the wrapper.
                    className="min-w-0 flex-1 appearance-none! m-0! h-auto! min-h-0! border-0! bg-transparent! p-0! text-sm! text-[#25252D] shadow-none! outline-none! focus:outline-none! focus:ring-0! focus:shadow-none! placeholder:text-gray-400"
                />
                <ChevronDown
                    size={ 14 }
                    className={ twMerge(
                        'shrink-0 text-gray-400',
                        ! readOnly && 'cursor-pointer'
                    ) }
                    onClick={ () => {
                        if ( readOnly ) {
                            return;
                        }
                        if ( open ) {
                            setOpen( false );
                        } else {
                            inputRef.current?.focus();
                            setOpen( true );
                        }
                    } }
                />
            </div>
            { open && ! readOnly && (
                <ul
                    ref={ listRef }
                    style={ { maxHeight: placement.maxHeight } }
                    className={ twMerge(
                        'absolute z-50 w-full overflow-y-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg',
                        placement.up ? 'bottom-full mb-1' : 'top-full mt-1'
                    ) }
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
                                // Keep the input focused so its blur doesn't pre-empt the click.
                                onMouseDown={ ( event ) =>
                                    event.preventDefault()
                                }
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
