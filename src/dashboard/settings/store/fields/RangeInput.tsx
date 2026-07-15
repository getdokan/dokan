import { __ } from '@wordpress/i18n';
import { dateI18n, getSettings as getDateSettings } from '@wordpress/date';
import { DateRangePicker } from '@wedevs/plugin-ui';
import { Calendar } from 'lucide-react';

export type RangeValue = {
    from: string;
    to: string;
};

// Y-m-d string → local Date (new Date('Y-m-d') parses as UTC and can shift a day).
const parseYmd = ( value: string ): Date | undefined => {
    const parts = value.match( /^(\d{4})-(\d{2})-(\d{2})$/ );
    return parts
        ? new Date( +parts[ 1 ], +parts[ 2 ] - 1, +parts[ 3 ] )
        : undefined;
};

const toYmd = ( date?: Date ): string =>
    date
        ? `${ date.getFullYear() }-${ String( date.getMonth() + 1 ).padStart(
              2,
              '0'
          ) }-${ String( date.getDate() ).padStart( 2, '0' ) }`
        : '';

// Format a stored Y-m-d value with the site's date format for display.
export const formatRangeDate = ( value?: string ): string => {
    if ( ! value ) {
        return '';
    }
    const settings = getDateSettings();
    return dateI18n( settings.formats.date, value, settings.timezone.string );
};

// Calendar-prefixed range trigger + plugin-ui range calendar, shared by the vacation composer field and the history edit modal.
export const RangeInput = ( {
    value,
    onChange,
}: {
    value: RangeValue;
    onChange: ( next: RangeValue ) => void;
} ) => {
    const label =
        value.from || value.to
            ? `${ formatRangeDate( value.from ) } - ${ formatRangeDate(
                  value.to
              ) }`
            : '';

    return (
        // Marker wrapper: style.scss strips the theme's default button chrome off the bare popover-trigger inside.
        <div className="dokan-range-input w-full">
            <DateRangePicker
                value={
                    value.from
                        ? {
                              from: parseYmd( value.from ),
                              to: parseYmd( value.to ),
                          }
                        : undefined
                }
                onChange={ ( range?: { from?: Date; to?: Date } ) =>
                    onChange( {
                        from: toYmd( range?.from ),
                        to: toYmd( range?.to ),
                    } )
                }
                // Vacations cannot start in the past (the legacy picker greyed those days out); the server re-validates.
                calendarProps={ {
                    disabled: { before: new Date() },
                } }
                // Marker class: z-lifts the portal above the WP modal overlay (shared rule with the location popovers).
                contentClassName="dokan-location-popover"
                confirmLabel={ __( 'Apply', 'dokan-lite' ) }
                cancelLabel={ __( 'Cancel', 'dokan-lite' ) }
                trigger={ () => (
                    <div className="flex w-full cursor-pointer items-stretch overflow-hidden rounded-md border border-gray-300 bg-white">
                        <span className="flex items-center border-r border-gray-300 bg-gray-50 px-3.5 text-gray-500">
                            <Calendar size={ 16 } />
                        </span>
                        <span
                            className={ `flex-1 px-3.5 py-2.5 text-left text-sm ${
                                label ? 'text-gray-900' : 'text-gray-400'
                            }` }
                        >
                            { label || __( 'Select date range', 'dokan-lite' ) }
                        </span>
                    </div>
                ) }
            />
        </div>
    );
};
