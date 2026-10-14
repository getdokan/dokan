import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { DokanSwitch } from '../Switch';
import { twMerge } from 'tailwind-merge';
import { Minus, Plus, Trash } from 'lucide-react';
import TimeDropdown from './TimeDropdown';
import { createMultipleValidator, createSingleValidator } from './validators';
import {
    DEFAULT_STEP_MINUTES,
    FULL_DAY,
    MINUTES_PER_DAY,
    defaultSeedSlot,
    minutesToCanonical,
    timeToMinutes,
} from './utils';
import type {
    TimeSlot,
    WeeklyDay,
    WeeklyTimeSlotsProps,
    WeeklyValue,
} from './types';

// Per-mode layout classes: vendor (multiple) rows are wide, so they switch side-by-side/stacked on the CONTAINER width (@container root) at @3xl; admin (single) is narrow and uses the viewport `sm` breakpoint. Literal strings so Tailwind emits every variant.
const LAYOUT = {
    multiple: {
        desktopRow: 'hidden @3xl:block!',
        mobileRow: '@3xl:hidden!',
        slotRow:
            'flex flex-col gap-2 @3xl:flex-row @3xl:items-center @3xl:gap-4',
        fieldWidth: 'w-full @3xl:w-auto',
        minus: 'hidden shrink-0 @3xl:block',
        icons: 'flex shrink-0 gap-2 self-end @3xl:ml-2 @3xl:self-auto',
    },
    single: {
        desktopRow: 'hidden sm:block!',
        mobileRow: 'sm:hidden!',
        slotRow: 'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4',
        fieldWidth: 'w-full sm:w-auto',
        minus: 'hidden shrink-0 sm:block',
        icons: 'flex shrink-0 gap-2 self-end sm:ml-2 sm:self-auto',
    },
} as const;

// Icon buttons: 32px (a touch shorter than the field), gray border, rounded, no shadow; `!` stops the theme's own button rules from overriding them.
const iconBtnBase =
    'flex items-center justify-center shrink-0 box-border! h-8! w-8! min-w-0! rounded-md! border! border-gray-200! bg-white! p-0! transition-colors';

// Generic weekly schedule editor: `multiple` switches between one range/day (admin) and
// N ranges with add/remove (vendor). Validation and messages are overridable via props.
const WeeklyTimeSlots = ( {
    value,
    days,
    multiple = false,
    spread = true,
    is12Hour = true,
    allowFullDay = true,
    step = DEFAULT_STEP_MINUTES,
    openingPlaceholder,
    closingPlaceholder,
    validate,
    messages,
    validateOnMount = false,
    seedSlot,
    onChange,
}: WeeklyTimeSlotsProps ) => {
    const validator = useMemo(
        () =>
            validate ??
            ( multiple
                ? createMultipleValidator( messages )
                : createSingleValidator( messages ) ),
        [ validate, multiple, messages ]
    );

    // Derived from the controlled value, so errors never go stale on external updates.
    const errors = useMemo(
        () => validator( value, days ),
        [ validator, value, days ]
    );

    // A day's errors only show once it's been touched (or on mount when validateOnMount).
    const [ touched, setTouched ] = useState< Record< string, boolean > >(
        () =>
            validateOnMount
                ? Object.fromEntries(
                      Object.keys( days ).map( ( k ) => [ k, true ] )
                  )
                : {}
    );

    const seed = seedSlot ?? ( () => defaultSeedSlot( step, multiple ) );
    const opensAt = openingPlaceholder ?? __( 'Opens at', 'dokan-lite' );
    const closesAt = closingPlaceholder ?? __( 'Closed at', 'dokan-lite' );

    const {
        desktopRow: desktopRowCls,
        mobileRow: mobileRowCls,
        slotRow: slotRowCls,
        fieldWidth: fieldWidthCls,
        minus: minusCls,
        icons: iconsCls,
    } = multiple ? LAYOUT.multiple : LAYOUT.single;

    const commit = ( dayKey: string, nextDay: WeeklyDay, isTouched = true ) => {
        const nextValue: WeeklyValue = { ...value, [ dayKey ]: nextDay };
        if ( isTouched ) {
            setTouched( ( prev ) => ( { ...prev, [ dayKey ]: true } ) );
        }
        onChange( nextValue, validator( nextValue, days ) );
    };

    const handleToggle = ( dayKey: string, isActive: boolean ) => {
        const day = value[ dayKey ] ?? { status: false, slots: [] };
        let slots = day.slots;
        if ( isActive ) {
            if ( slots.length === 0 ) {
                slots = [ seed() ];
            } else if ( ! multiple ) {
                // Keep existing times when re-enabling; only fill the gaps.
                const seeded = seed();
                slots = [
                    {
                        opening_time:
                            slots[ 0 ].opening_time || seeded.opening_time,
                        closing_time:
                            slots[ 0 ].closing_time || seeded.closing_time,
                    },
                ];
            }
        } else {
            // Disabling clears the day's error state; if it was in error, reset the
            // fields too so the read-only overlay never shows invalid times.
            setTouched( ( prev ) => {
                const next = { ...prev };
                delete next[ dayKey ];
                return next;
            } );
            if ( errors[ dayKey ] ) {
                slots = [ seed() ];
            }
        }
        commit( dayKey, { status: isActive, slots }, isActive );
    };

    const handleTimeChange = (
        dayKey: string,
        slotIndex: number,
        field: 'opening_time' | 'closing_time',
        newValue: string
    ) => {
        const day = value[ dayKey ];
        if ( ! day ) {
            return;
        }
        let nextSlots: TimeSlot[];
        if ( field === 'opening_time' && newValue === FULL_DAY ) {
            // Legacy parity: "Full Day" collapses the day to one all-day range (no closing time).
            nextSlots = [ { opening_time: FULL_DAY, closing_time: '' } ];
        } else {
            nextSlots = day.slots.map( ( slot, index ) => {
                if ( index !== slotIndex ) {
                    return slot;
                }
                const next: TimeSlot = { ...slot, [ field ]: newValue };
                // Leaving "Full Day": seed a closing one step after the new opening so the pair is valid.
                if (
                    field === 'opening_time' &&
                    slot.opening_time === FULL_DAY &&
                    newValue !== FULL_DAY
                ) {
                    const opening = timeToMinutes( newValue );
                    next.closing_time =
                        opening !== null && opening + step < MINUTES_PER_DAY
                            ? minutesToCanonical( opening + step )
                            : '';
                }
                return next;
            } );
        }
        // Single mode edits only the visible range, so drop any hidden extras rather than saving ranges the vendor can't see.
        commit( dayKey, {
            ...day,
            slots: multiple ? nextSlots : nextSlots.slice( 0, 1 ),
        } );
    };

    const handleAddSlot = ( dayKey: string ) => {
        const day = value[ dayKey ];
        if ( ! day ) {
            return;
        }
        commit( dayKey, { ...day, slots: [ ...day.slots, seed() ] } );
    };

    const handleRemoveSlot = ( dayKey: string, slotIndex: number ) => {
        const day = value[ dayKey ];
        if ( ! day ) {
            return;
        }
        const slots = day.slots.filter( ( _, index ) => index !== slotIndex );
        // Vendor-legacy parity: removing the last range turns the day off.
        commit( dayKey, {
            status: slots.length > 0 ? day.status : false,
            slots,
        } );
    };

    const renderSlotRow = (
        dayKey: string,
        day: WeeklyDay,
        slot: TimeSlot,
        index: number
    ) => {
        const slotError = touched[ dayKey ]
            ? errors[ dayKey ]?.[ index ]
            : undefined;
        const isFullDaySlot = slot.opening_time === FULL_DAY;
        // Once a slot closes at the last selectable preset (11:30 pm on the
        // 30-min grid) the day is full, so its add control retires the way the
        // legacy "Add hours" link disappears at the end of the day.
        const closingMinutes = timeToMinutes( slot.closing_time );
        const atDayEnd =
            closingMinutes !== null && closingMinutes >= MINUTES_PER_DAY - step;
        const addDisabled = isFullDaySlot || atDayEnd;
        return (
            <div
                key={ index }
                className={ twMerge(
                    slotRowCls,
                    slotError && 'dokan-weekly-slot-error'
                ) }
            >
                <TimeDropdown
                    value={ slot.opening_time }
                    placeholder={ opensAt }
                    onChange={ ( v ) =>
                        handleTimeChange( dayKey, index, 'opening_time', v )
                    }
                    is12Hour={ is12Hour }
                    hasError={ Boolean( slotError?.opening ) }
                    // Full Day only ever lives on the opening dropdown; picking it collapses the day.
                    includeFullDay={ allowFullDay }
                    step={ step }
                    wrapperClassName={ fieldWidthCls }
                />
                <Minus size={ 20 } color={ '#828282' } className={ minusCls } />
                { /* Full Day spans the day, so its closing is a static read-only "Full Day" (matches admin). */ }
                { isFullDaySlot ? (
                    <TimeDropdown
                        value={ FULL_DAY }
                        is12Hour={ is12Hour }
                        readOnly
                        wrapperClassName={ fieldWidthCls }
                    />
                ) : (
                    <TimeDropdown
                        value={ slot.closing_time }
                        placeholder={ closesAt }
                        onChange={ ( v ) =>
                            handleTimeChange( dayKey, index, 'closing_time', v )
                        }
                        is12Hour={ is12Hour }
                        hasError={ Boolean( slotError?.closing ) }
                        includeFullDay={ false }
                        step={ step }
                        wrapperClassName={ fieldWidthCls }
                    />
                ) }
                { multiple && (
                    <div className={ iconsCls }>
                        <button
                            type="button"
                            aria-label={ __(
                                'Remove time slot',
                                'dokan-lite'
                            ) }
                            // A Full Day range is removed by toggling the day off, so its delete is disabled.
                            disabled={ isFullDaySlot }
                            onClick={ () => handleRemoveSlot( dayKey, index ) }
                            className={ twMerge(
                                iconBtnBase,
                                'text-gray-500!',
                                isFullDaySlot
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:border-red-300! hover:bg-red-50! hover:text-red-600!'
                            ) }
                        >
                            <Trash size={ 16 } className="shrink-0" />
                        </button>
                        { /* Add: functional on the last dated slot. A Full Day
                             slot shows it disabled (a full day already spans 24h)
                             so the row still lines up with dated rows instead of
                             leaving a gap next to the trash. Non-last rows keep
                             their space but hide the glyph so the last row owns the +. */ }
                        <button
                            type="button"
                            aria-label={ __( 'Add time slot', 'dokan-lite' ) }
                            disabled={ addDisabled }
                            onClick={ () => handleAddSlot( dayKey ) }
                            style={
                                addDisabled
                                    ? undefined
                                    : {
                                          color: 'var(--dokan-button-background-color, #7047EB)',
                                      }
                            }
                            className={ twMerge(
                                iconBtnBase,
                                isFullDaySlot
                                    ? 'text-gray-500! cursor-not-allowed opacity-50'
                                    : // Matches the delete button's tinted hover, on the brand colour (see .dokan-soft-primary).
                                      'dokan-soft-primary',
                                // Retire the glyph on the day-end row too, so a full
                                // day reads like the legacy rows (× only, no add).
                                ( index !== day.slots.length - 1 ||
                                    atDayEnd ) &&
                                    'hidden @3xl:flex @3xl:invisible'
                            ) }
                        >
                            <Plus size={ 16 } className="shrink-0" />
                        </button>
                    </div>
                ) }
            </div>
        );
    };

    const renderDayMessages = ( dayMessages: string[] ) =>
        dayMessages.map( ( message ) => (
            <p key={ message } className="mt-1 text-sm text-[#E7000B]">
                { message }
            </p>
        ) );

    const renderDayRow = ( dayKey: string ) => {
        const day = value[ dayKey ] ?? { status: false, slots: [] };
        // De-duplicated day messages, rendered under the row (disabled days carry none).
        const dayMessages = touched[ dayKey ]
            ? Array.from(
                  new Set(
                      Object.values( errors[ dayKey ] ?? {} ).map(
                          ( slotError ) => slotError.message
                      )
                  )
              )
            : [];

        // A disabled day keeps its pickers visible but dimmed and non-interactive (read-only overlay).
        const slotsOverlay =
            ! day.status && 'opacity-50 pointer-events-none select-none';
        const hasSlots = day.slots.length > 0;
        // Admin centers rows; vendor top-aligns multi-slot rows so the switch/first field line up.
        const desktopItems =
            spread || day.slots.length <= 1 ? 'items-center' : 'items-start';

        // Subtrees shared by the desktop and mobile layouts.
        const nameBlock = ( fontCls: string ) => (
            <div>
                <span
                    className={ twMerge(
                        fontCls,
                        ! day.status && 'opacity-50'
                    ) }
                >
                    { days[ dayKey ] }
                </span>
                { dayMessages.length > 0 && renderDayMessages( dayMessages ) }
            </div>
        );
        // Single mode shows one range per day even when the stored value carries extra slots (data written while multi-slot was available).
        const visibleSlots = multiple ? day.slots : day.slots.slice( 0, 1 );
        const slotsBlock = ( wrapCls: string ) =>
            hasSlots && (
                <div className={ twMerge( wrapCls, slotsOverlay ) }>
                    { visibleSlots.map( ( slot, index ) =>
                        renderSlotRow( dayKey, day, slot, index )
                    ) }
                </div>
            );
        const switchEl = (
            <DokanSwitch
                checked={ day.status }
                onChange={ ( val: boolean ) => handleToggle( dayKey, val ) }
            />
        );

        return (
            <div
                key={ dayKey }
                className={ twMerge(
                    'border-b border-gray-200 last:border-b-0 bg-white',
                    // Vendor rows round their outer corners to match the bordered box (admin has no box).
                    ! spread && 'first:rounded-t-md last:rounded-b-md'
                ) }
            >
                { /* Desktop: day name left, switch + pickers right. */ }
                <div className={ desktopRowCls }>
                    <div
                        className={ twMerge(
                            'flex justify-between gap-4 py-4 px-6',
                            spread && 'min-h-20',
                            desktopItems
                        ) }
                    >
                        { nameBlock( 'text-sm font-medium text-[#25252D]' ) }
                        <div
                            className={ twMerge(
                                'flex gap-8 shrink-0',
                                desktopItems
                            ) }
                        >
                            <div
                                className={ twMerge(
                                    'shrink-0',
                                    ! spread && 'flex items-center min-h-10'
                                ) }
                            >
                                { switchEl }
                            </div>
                            { slotsBlock( 'dokan-weekly-slots space-y-2' ) }
                        </div>
                    </div>
                </div>
                { /* Mobile: name + switch stacked over the pickers. */ }
                <div className={ twMerge( mobileRowCls, 'px-6 py-4 w-full' ) }>
                    <div className="flex items-start justify-between w-full gap-4">
                        { nameBlock( 'text-sm font-semibold text-[#25252D]' ) }
                        { switchEl }
                    </div>
                    { slotsBlock( 'mt-4 space-y-2' ) }
                </div>
            </div>
        );
    };

    // Render in `days` key order (honours WP "Week Starts On"), not the value's key order.
    // Admin keeps overflow-hidden; vendor drops it so a bottom-row dropdown isn't clipped.
    return (
        <div className={ twMerge( '@container', spread && 'overflow-hidden' ) }>
            { Object.keys( days ).map( renderDayRow ) }
        </div>
    );
};

export default WeeklyTimeSlots;
export { default as TimeDropdown } from './TimeDropdown';
export {
    FULL_DAY,
    defaultSeedSlot,
    timeToMinutes,
    minutesToCanonical,
} from './utils';
export {
    createSingleValidator,
    createMultipleValidator,
    hasWeeklyErrors,
} from './validators';
export * from './types';
