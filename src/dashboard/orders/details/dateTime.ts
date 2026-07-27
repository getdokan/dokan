import { __, sprintf } from '@wordpress/i18n';
import { dateI18n, getSettings, humanTimeDiff } from '@wordpress/date';

declare const window: Window & {
    dokan?: {
        i18n_date_format?: string;
        i18n_time_format?: string;
    };
};

/**
 * The panel's wp-date package ships WordPress defaults, not this site's
 * settings — Dokan localizes the real admin formats on `window.dokan`.
 */
const siteFormats = () => ( {
    date: window?.dokan?.i18n_date_format || getSettings().formats.date,
    time: window?.dokan?.i18n_time_format || getSettings().formats.time,
} );

/**
 * Format a date-time exactly as the site's WordPress general settings ask,
 * joined the way WordPress itself presents the pair: "date at time".
 * @param value
 */
export const formatSiteDateTime = ( value: string ): string => {
    const { date, time } = siteFormats();

    return sprintf(
        /* translators: 1: formatted date 2: formatted time */
        __( '%1$s at %2$s', 'dokan-lite' ),
        dateI18n( date, value, undefined ),
        dateI18n( time, value, undefined )
    );
};

/**
 * Format a date exactly as the site's WordPress general settings ask.
 * @param value
 */
export const formatSiteDate = ( value: string ): string =>
    dateI18n( siteFormats().date, value, undefined );

/**
 * "added 20 hours ago" style relative time for note timestamps.
 * `humanTimeDiff` already includes the "ago" suffix.
 * @param value
 */
export const timeAgo = ( value: string ): string =>
    humanTimeDiff( value, undefined );
