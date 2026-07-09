import { useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { getSettings } from '@wordpress/date';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { WeeklyTimeSlots, FULL_DAY } from '@dokan/components';
import type { WeeklyValue } from '@dokan/components';

// Store-domain validation copy — the shared component's defaults speak
// about "delivery time".
const SCHEDULE_MESSAGES = {
    required: ( dayLabel: string ): string =>
        sprintf(
            /* translators: %s: day name */
            __( '%s opening and closing time can not be empty.', 'dokan-lite' ),
            dayLabel
        ),
    order: ( dayLabel: string ): string =>
        sprintf(
            /* translators: %s: day name */
            __(
                '%s closing time must be later than the opening time.',
                'dokan-lite'
            ),
            dayLabel
        ),
    overlap: ( dayLabel: string ): string =>
        sprintf(
            /* translators: %s: day name */
            __( '%s time ranges can not overlap.', 'dokan-lite' ),
            dayLabel
        ),
};

type LegacyDay = {
    status?: 'open' | 'close' | string;
    opening_time?: string[] | string;
    closing_time?: string[] | string;
};

type LegacySchedule = Record< string, LegacyDay >;

// The vendor stores a full day as this literal pair; the shared component
// uses the FULL_DAY sentinel, bridged on read/write so saves stay compatible.
const FULL_DAY_OPENING = '12:00 am';
const FULL_DAY_CLOSING = '11:59 pm';

const asArray = ( times?: string[] | string ): string[] => {
    if ( Array.isArray( times ) ) {
        return times.filter( ( time ) => 'string' === typeof time );
    }
    // Very old rows hold plain strings — same (array) tolerance the PHP readers have.
    return 'string' === typeof times && '' !== times ? [ times ] : [];
};

const isFullDayPair = ( opening: string, closing: string ): boolean =>
    opening.trim().toLowerCase() === FULL_DAY_OPENING &&
    closing.trim().toLowerCase() === FULL_DAY_CLOSING;

// Legacy `{status, opening_time[], closing_time[]}` → WeeklyTimeSlots value shape.
const legacyToWeekly = (
    schedule: LegacySchedule,
    days: Record< string, string >
): WeeklyValue => {
    const weekly: WeeklyValue = {};

    Object.keys( days ).forEach( ( dayKey ) => {
        const day = schedule?.[ dayKey ] || {};
        const opening = asArray( day.opening_time );
        const closing = asArray( day.closing_time );

        const slots = opening.map( ( openingTime, index ) => {
            const closingTime = closing[ index ] || '';

            return isFullDayPair( openingTime, closingTime )
                ? { opening_time: FULL_DAY, closing_time: '' }
                : {
                      opening_time: openingTime,
                      closing_time: closingTime,
                  };
        } );

        weekly[ dayKey ] = {
            status: 'open' === day.status,
            // A day with no stored times still shows one dimmed empty pair, so
            // disabled rows read like the delivery-time page instead of bare.
            slots: slots.length
                ? slots
                : [ { opening_time: '', closing_time: '' } ],
        };
    } );

    return weekly;
};

// WeeklyTimeSlots value shape → the exact legacy struct the writer persists.
// Off days KEEP their slot times (delivery-time behaviour: toggling a day off
// dims its pickers, re-enabling restores them); the server zeroes closed days
// at save so the stored shape stays byte-identical to legacy.
const weeklyToLegacy = ( weekly: WeeklyValue ): LegacySchedule => {
    const schedule: LegacySchedule = {};

    Object.entries( weekly ).forEach( ( [ dayKey, day ] ) => {
        const opening: string[] = [];
        const closing: string[] = [];

        day.slots.forEach( ( slot ) => {
            if ( FULL_DAY === slot.opening_time ) {
                opening.push( FULL_DAY_OPENING );
                closing.push( FULL_DAY_CLOSING );
                return;
            }
            opening.push( slot.opening_time );
            closing.push( slot.closing_time );
        } );

        schedule[ dayKey ] = {
            status: day.status ? 'open' : 'close',
            opening_time: opening,
            closing_time: closing,
        };
    } );

    return schedule;
};

// `vendor_store_schedule` variant — binds the shared WeeklyTimeSlots editor
// to the legacy `dokan_store_time` struct (dokan-pro#5915 bridge pattern).
// Lite renders one range per day; Pro flips `multiple` via the schema filter.
const StoreScheduleField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;

    // Memoized so unrelated form edits don't hand WeeklyTimeSlots fresh refs.
    const days = useMemo(
        () => ( element.days as Record< string, string > ) || {},
        [ element.days ]
    );
    const weeklyValue = useMemo(
        () =>
            legacyToWeekly(
                ( element.value ?? element.default ?? {} ) as LegacySchedule,
                days
            ),
        [ element.value, element.default, days ]
    );

    // 12/24-hour hint from the site's WP time format; storage stays canonical `g:i a`.
    const timeFormat = getSettings()?.formats?.time || '';
    const is12Hour = timeFormat ? /a/i.test( timeFormat ) : true;

    const handleChange = ( next: WeeklyValue ) => {
        // Persist the legacy shape so the writer stays byte-identical; the
        // component renders its own per-row errors, and the server re-validates.
        updateValue( fieldKey, weeklyToLegacy( next ) );
    };

    return (
        // Full-bleed weekday rows — the section card supplies the outer frame,
        // the rows their own horizontal rules (delivery-time anatomy, minus its
        // standalone box). Errors surface on touch, like the delivery page.
        <div className="dokan-vendor-store-schedule-field w-full">
            <WeeklyTimeSlots
                value={ weeklyValue }
                days={ days }
                multiple={ !! element.multiple }
                spread={ false }
                is12Hour={ is12Hour }
                messages={ SCHEDULE_MESSAGES }
                onChange={ handleChange }
            />
        </div>
    );
};

export default StoreScheduleField;
