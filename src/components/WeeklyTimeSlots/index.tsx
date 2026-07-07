import { useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import DokanButton from '../Button';
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

// Generic weekly schedule editor: `multiple` switches between one range/day (admin) and
// N ranges with add/remove (vendor). Validation and messages are overridable via props.
const WeeklyTimeSlots = ( {
    value,
    days,
    multiple = false,
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
        commit( dayKey, { ...day, slots: nextSlots } );
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
        return (
            <div
                key={ index }
                className={ twMerge(
                    'flex items-center gap-4',
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
                    // "Full Day" is a single-range concept; offering it per row in multiple
                    // mode would wipe the day's other ranges on selection.
                    includeFullDay={ allowFullDay && ! multiple }
                    step={ step }
                />
                { ! isFullDaySlot && (
                    <>
                        <Minus size={ 20 } color={ '#828282' } />
                        <TimeDropdown
                            value={ slot.closing_time }
                            placeholder={ closesAt }
                            onChange={ ( v ) =>
                                handleTimeChange(
                                    dayKey,
                                    index,
                                    'closing_time',
                                    v
                                )
                            }
                            is12Hour={ is12Hour }
                            hasError={ Boolean( slotError?.closing ) }
                            includeFullDay={ false }
                            step={ step }
                        />
                    </>
                ) }
                { multiple && (
                    <div className="flex gap-2 ml-2">
                        <DokanButton
                            variant="tertiary"
                            className="p-2! text-gray-500! hover:text-red-500! hover:bg-red-50! h-8 w-8"
                            onClick={ () => handleRemoveSlot( dayKey, index ) }
                        >
                            <Trash />
                        </DokanButton>
                        { ! isFullDaySlot && index === day.slots.length - 1 && (
                            <DokanButton
                                variant="tertiary"
                                className="p-2! text-gray-500! h-8 w-8"
                                onClick={ () => handleAddSlot( dayKey ) }
                            >
                                <Plus />
                            </DokanButton>
                        ) }
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
        // De-duplicated day messages, rendered under the row.
        const dayMessages = touched[ dayKey ]
            ? Array.from(
                  new Set(
                      Object.values( errors[ dayKey ] ?? {} ).map(
                          ( slotError ) => slotError.message
                      )
                  )
              )
            : [];

        return (
            <div
                key={ dayKey }
                className="border-b border-gray-200 last:border-b-0 bg-white"
            >
                { /* Desktop Layout */ }
                <div className="hidden sm:block!">
                    <div className="flex items-center py-4 px-6 min-h-20">
                        { /* Day name */ }
                        <div className="w-2/4 shrink-0 self-start mt-2">
                            <span className="text-sm font-medium text-[#25252D]">
                                { days[ dayKey ] }
                            </span>
                            { renderDayMessages( dayMessages ) }
                        </div>

                        <div className="flex-1 flex items-center justify-end">
                            { /* Time slots or status */ }
                            <div className="flex-1 flex items-center justify-end">
                                { day.status && day.slots.length > 0 && (
                                    <div className="dokan-weekly-slots space-y-2">
                                        { day.slots.map( ( slot, index ) =>
                                            renderSlotRow(
                                                dayKey,
                                                day,
                                                slot,
                                                index
                                            )
                                        ) }
                                    </div>
                                ) }
                            </div>

                            { /* Switch - with proper spacing */ }
                            <div className="ml-10 shrink-0">
                                <DokanSwitch
                                    checked={ day.status }
                                    onChange={ ( val: boolean ) =>
                                        handleToggle( dayKey, val )
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                { /* Mobile Layout */ }
                <div
                    className={ twMerge(
                        'sm:hidden! px-6 py-4 min-h-20 w-full',
                        ! day.status && 'flex items-center'
                    ) }
                >
                    { /* Day name + Switch row */ }
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <span className="text-sm font-semibold text-[#25252D]">
                                { days[ dayKey ] }
                            </span>
                            { renderDayMessages( dayMessages ) }
                        </div>
                        <DokanSwitch
                            checked={ day.status }
                            onChange={ ( val: boolean ) =>
                                handleToggle( dayKey, val )
                            }
                        />
                    </div>

                    { /* Time picker rows - only when active */ }
                    { day.status && day.slots.length > 0 && (
                        <div className="mt-4 space-y-2">
                            { day.slots.map( ( slot, index ) =>
                                renderSlotRow( dayKey, day, slot, index )
                            ) }
                        </div>
                    ) }
                </div>
            </div>
        );
    };

    // Render in `days` key order (honours WP "Week Starts On"), not the value's key order.
    return (
        <div className="overflow-hidden">
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
