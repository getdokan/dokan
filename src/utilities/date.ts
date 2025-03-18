// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import moment from 'moment';
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import momentTz from 'moment-timezone';
import { __ } from '@wordpress/i18n';

export const isoDateFormat = 'YYYY-MM-DD';
export const defaultDateTimeFormat = 'YYYY-MM-DDTHH:mm:ss';

/**
 * Gets the current time in the store time zone if set.
 *
 * @return {string} - Datetime string.
 */
export function getStoreTimeZoneMoment() {
    // @ts-ignore
    if ( ! window.wcSettings || ! window.wcSettings.timeZone ) {
        return moment();
    }
    // @ts-ignore
    if ( [ '+', '-' ].includes( window.wcSettings.timeZone.charAt( 0 ) ) ) {
        // @ts-ignore
        return moment().utcOffset( window.wcSettings.timeZone );
    }
    // @ts-ignore
    return ( moment() as momentTz.Moment ).tz( window.wcSettings.timeZone );
}

/**
 * Given two dates, derive a string representation
 *
 * @param {moment.Moment} after  - start date
 * @param {moment.Moment} before - end date
 * @return {string} - text value for the supplied date range
 */
export function getRangeLabel(
    after: moment.Moment,
    before: moment.Moment
): string {
    const isSameYear = after.year() === before.year();
    const isSameMonth = isSameYear && after.month() === before.month();
    const isSameDay =
        isSameYear && isSameMonth && after.isSame( before, 'day' );
    const fullDateFormat = __( 'MMM D, YYYY', 'dokan-lite' );

    if ( isSameDay ) {
        return after.format( fullDateFormat );
    } else if ( isSameMonth ) {
        const afterDate = after.date();
        return after
            .format( fullDateFormat )
            .replace(
                String( afterDate ),
                `${ afterDate } - ${ before.date() }`
            );
    } else if ( isSameYear ) {
        const monthDayFormat = __( 'MMM D', 'dokan-lite' );
        return `${ after.format( monthDayFormat ) } - ${ before.format(
            fullDateFormat
        ) }`;
    }
    return `${ after.format( fullDateFormat ) } - ${ before.format(
        fullDateFormat
    ) }`;
}

/**
 * Get a DateValue object for a current period. The period begins on the first day of the period,
 * and ends on the current day.
 *
 * @param {moment.DurationInputArg2} period  - the chosen period
 * @param {string}                   compare - `previous_period` or `previous_year`
 * @return - DateValue data about the selected period
 */
export function getCurrentPeriod(
    period: moment.DurationInputArg2,
    compare: string
) {
    const primaryStart = getStoreTimeZoneMoment().startOf( period );
    const primaryEnd = getStoreTimeZoneMoment();

    const daysSoFar = primaryEnd.diff( primaryStart, 'days' );
    let secondaryStart;
    let secondaryEnd;

    if ( compare === 'previous_period' ) {
        secondaryStart = primaryStart.clone().subtract( 1, period );
        secondaryEnd = primaryEnd.clone().subtract( 1, period );
    } else {
        secondaryStart = primaryStart.clone().subtract( 1, 'years' );
        // Set the end time to 23:59:59.
        secondaryEnd = secondaryStart
            .clone()
            .add( daysSoFar + 1, 'days' )
            .subtract( 1, 'seconds' );
    }
    return {
        primaryStart,
        primaryEnd,
        secondaryStart,
        secondaryEnd,
        from: primaryStart.format( defaultDateTimeFormat ),
        to: primaryEnd.format( defaultDateTimeFormat ),
    };
}
