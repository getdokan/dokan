import { __, sprintf } from '@wordpress/i18n';
import { FULL_DAY, timeToMinutes } from './utils';
import type {
    SlotError,
    WeeklyErrors,
    WeeklyMessages,
    WeeklyValidator,
} from './types';

const defaultMessages: Required< WeeklyMessages > = {
    required: ( dayLabel: string ) =>
        sprintf(
            // translators: %s is the day name, e.g. Monday.
            __( '%s delivery time can not be empty', 'dokan-lite' ),
            dayLabel
        ),
    order: ( dayLabel: string ) =>
        sprintf(
            // translators: %s is the day name, e.g. Monday.
            __(
                '%s closing time must be greater than opening time',
                'dokan-lite'
            ),
            dayLabel
        ),
    overlap: ( dayLabel: string ) =>
        sprintf(
            // translators: %s is the day name, e.g. Monday.
            __(
                '%s opening time must not be earlier than the previous closing time',
                'dokan-lite'
            ),
            dayLabel
        ),
};

// Per-slot rule: FULL_DAY passes; otherwise both times are required and closing must be
// strictly after opening. Unparseable legacy values defer to the server gate.
const validateSlot = (
    opening: string,
    closing: string,
    messages: Required< WeeklyMessages >,
    dayLabel: string
): SlotError | null => {
    if ( opening === FULL_DAY ) {
        return null;
    }
    if ( ! opening || ! closing ) {
        return {
            opening: ! opening,
            closing: ! closing,
            message: messages.required( dayLabel ),
        };
    }
    const openingMinutes = timeToMinutes( opening );
    const closingMinutes = timeToMinutes( closing );
    if ( openingMinutes === null || closingMinutes === null ) {
        return null;
    }
    if ( closingMinutes <= openingMinutes ) {
        return {
            opening: true,
            closing: true,
            message: messages.order( dayLabel ),
        };
    }
    return null;
};

// Admin rules: one range per enabled day.
export const createSingleValidator = (
    overrides: WeeklyMessages = {}
): WeeklyValidator => {
    const messages = { ...defaultMessages, ...overrides };
    return ( value, dayLabels ) => {
        const errors: WeeklyErrors = {};
        Object.entries( value ).forEach( ( [ dayKey, day ] ) => {
            if ( ! day?.status || ! day.slots?.length ) {
                return;
            }
            const slotError = validateSlot(
                day.slots[ 0 ].opening_time,
                day.slots[ 0 ].closing_time,
                messages,
                dayLabels[ dayKey ] ?? dayKey
            );
            if ( slotError ) {
                errors[ dayKey ] = { 0: slotError };
            }
        } );
        return errors;
    };
};

// Multi-slot rule: every range required + ordered, and range N must not start before range N-1 ends.
export const createMultipleValidator = (
    overrides: WeeklyMessages = {}
): WeeklyValidator => {
    const messages = { ...defaultMessages, ...overrides };
    return ( value, dayLabels ) => {
        const errors: WeeklyErrors = {};
        Object.entries( value ).forEach( ( [ dayKey, day ] ) => {
            if ( ! day?.status || ! day.slots?.length ) {
                return;
            }
            const dayLabel = dayLabels[ dayKey ] ?? dayKey;
            const dayErrors: Record< number, SlotError > = {};
            day.slots.forEach( ( slot, index ) => {
                const slotError = validateSlot(
                    slot.opening_time,
                    slot.closing_time,
                    messages,
                    dayLabel
                );
                if ( slotError ) {
                    dayErrors[ index ] = slotError;
                    return;
                }
                if ( index === 0 || slot.opening_time === FULL_DAY ) {
                    return;
                }
                const opening = timeToMinutes( slot.opening_time );
                const prevClosing = timeToMinutes(
                    day.slots[ index - 1 ].closing_time
                );
                if (
                    opening !== null &&
                    prevClosing !== null &&
                    opening < prevClosing
                ) {
                    dayErrors[ index ] = {
                        opening: true,
                        message: messages.overlap( dayLabel ),
                    };
                }
            } );
            if ( Object.keys( dayErrors ).length > 0 ) {
                errors[ dayKey ] = dayErrors;
            }
        } );
        return errors;
    };
};

export const hasWeeklyErrors = ( errors: WeeklyErrors ): boolean =>
    Object.keys( errors ).length > 0;
