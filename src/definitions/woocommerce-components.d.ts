// @see https://github.com/woocommerce/woocommerce/blob/trunk/packages/js/components/src/calendar/date-range.js
declare module '@woocommerce/components' {
    import type { FC } from 'react';

    export interface DateRangeProps {
        /** selected start date */
        startDate: Date;
        /** selected end date */
        endDate: Date;
        onChange: (range: { startDate: Date; endDate: Date }) => void;
        /** add other props as needed */
    }

    export const DateRange: FC<Omit<any, DateRangeProps>>;
}
