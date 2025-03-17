import { RawHTML } from '@wordpress/element';
import '../definitions/window-types';
import { dateI18n, getSettings } from '@wordpress/date';

function DateTimeHtml( {
    date,
    defaultDate = '-',
}: {
    date: string;
    defaultDate?: any;
} ) {
    if ( ! date ) {
        return defaultDate;
    }
    return (
        <RawHTML>
            { dateI18n(
                getSettings().formats.datetime,
                date,
                getSettings().timezone.string
            ) }
        </RawHTML>
    );
}

DateTimeHtml.Date = ( {
    date,
    defaultDate = '-',
}: {
    date: string;
    defaultDate?: any;
} ) => {
    if ( ! date ) {
        return defaultDate;
    }
    return (
        <RawHTML>
            { dateI18n(
                getSettings().formats.date,
                date,
                getSettings().timezone.string
            ) }
        </RawHTML>
    );
};
DateTimeHtml.Time = ( {
    time,
    defaultTime = '-',
}: {
    time: string;
    defaultTime?: any;
} ) => {
    if ( ! time ) {
        return defaultTime;
    }
    return (
        <RawHTML>
            { dateI18n(
                getSettings().formats.time,
                time,
                getSettings().timezone.string
            ) }
        </RawHTML>
    );
};

export default DateTimeHtml;
