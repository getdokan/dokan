import { dateI18n, getSettings } from '@wordpress/date';
import type { TimeSlot } from './types';

// "Full Day" sentinel; mirrors DeliveryDaysScheduleTransformer::FULL_DAY_SENTINEL.
export const FULL_DAY = '__full_day__';
export const MINUTES_PER_DAY = 24 * 60;
export const DEFAULT_STEP_MINUTES = 30;

const pad = ( n: number ): string => String( n ).padStart( 2, '0' );

// Parse "9:00 am" / "09:00 AM" / "13:30" to minutes since midnight; null when unparseable.
export const timeToMinutes = ( timeString: string ): number | null => {
    if ( ! timeString || timeString === FULL_DAY ) {
        return null;
    }
    const match = timeString
        .trim()
        .match( /^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i );
    if ( ! match ) {
        return null;
    }
    let hours = Number( match[ 1 ] );
    const minutes = Number( match[ 2 ] );
    const meridiem = match[ 3 ]?.toLowerCase();
    if ( meridiem === 'am' && hours === 12 ) {
        hours = 0;
    } else if ( meridiem === 'pm' && hours !== 12 ) {
        hours += 12;
    }
    if ( hours > 23 || minutes > 59 ) {
        return null;
    }
    return hours * 60 + minutes;
};

// Canonical `g:i a` storage (never varies by display format) — the shape Settings.php
// normalizes and the transformer's full-day match expect.
export const minutesToCanonical = ( totalMinutes: number ): string => {
    const normalized =
        ( ( totalMinutes % MINUTES_PER_DAY ) + MINUTES_PER_DAY ) %
        MINUTES_PER_DAY;
    const hours24 = Math.floor( normalized / 60 );
    const meridiem = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${ hours12 }:${ pad( normalized % 60 ) } ${ meridiem }`;
};

// Site locale as a BCP-47 tag for Intl (l10n.locale is `bn_BD`; Intl needs `bn-BD`).
const localeTag = (): string => {
    const fromSettings = getSettings()?.l10n?.locale;
    if ( fromSettings ) {
        return fromSettings.replace( /_/g, '-' );
    }
    if ( typeof document !== 'undefined' && document.documentElement.lang ) {
        return document.documentElement.lang;
    }
    return 'en';
};

// Per-locale ASCII→native digit maps; null means the locale already uses ASCII (no-op).
const digitMaps: Record< string, Record< string, string > | null > = {};

// dateI18n localizes the meridiem but never the digits; map ASCII 0-9 to the site
// locale's numerals (e.g. Bangla ০-৯) so the whole label reads localized.
const localizeDigits = ( text: string ): string => {
    const tag = localeTag();
    if ( ! ( tag in digitMaps ) ) {
        try {
            const formatter = new Intl.NumberFormat( tag, {
                useGrouping: false,
            } );
            const map: Record< string, string > = {};
            for ( let digit = 0; digit <= 9; digit++ ) {
                map[ digit ] = formatter.format( digit );
            }
            digitMaps[ tag ] = map[ '0' ] === '0' ? null : map;
        } catch ( error ) {
            digitMaps[ tag ] = null;
        }
    }
    const map = digitMaps[ tag ];
    return map ? text.replace( /[0-9]/g, ( digit ) => map[ digit ] ) : text;
};

// Localized time-of-day label rendered with the EXACT site time format
// (WP Settings → General → Time Format), so presets ('g:i a', 'g:i A', 'H:i')
// and custom formats (e.g. 'G\h i') all display faithfully. is12Hour is only a
// fallback for contexts without WP date settings (e.g. unit tests). Built and
// formatted in UTC (gmt=true) so the wall-clock time survives any browser/site
// timezone gap; dateI18n localizes the meridiem, localizeDigits the numerals.
export const minutesToDisplay = (
    totalMinutes: number,
    is12Hour: boolean
): string => {
    const date = new Date(
        Date.UTC(
            2000,
            0,
            1,
            Math.floor( totalMinutes / 60 ),
            totalMinutes % 60
        )
    );
    const format = getSettings().formats.time || ( is12Hour ? 'g:i a' : 'H:i' );
    return localizeDigits( dateI18n( format, date, true ) );
};

// Localize any parseable stored value (even off the preset grid); raw fallback otherwise.
export const formatTimeForDisplay = (
    value: string,
    is12Hour: boolean
): string => {
    const minutes = timeToMinutes( value );
    return minutes === null ? value : minutesToDisplay( minutes, is12Hour );
};

// Default slot on enable / add. Single mode snaps "now" down to the step grid (so it lands
// on a preset), closing one step later, clamped from midnight. Multiple mode returns blanks.
export const defaultSeedSlot = (
    step: number,
    multiple: boolean
): TimeSlot => {
    if ( multiple ) {
        return { opening_time: '', closing_time: '' };
    }
    const now = new Date();
    let opening =
        Math.floor( ( now.getHours() * 60 + now.getMinutes() ) / step ) * step;
    let closing = opening + step;
    if ( closing >= MINUTES_PER_DAY ) {
        closing = MINUTES_PER_DAY - step;
        opening = closing - step;
    }
    return {
        opening_time: minutesToCanonical( opening ),
        closing_time: minutesToCanonical( closing ),
    };
};
