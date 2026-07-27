import type { OrderDetailsMarker } from './types';

declare const window: Window & {
    dokanFrontend?: {
        order_details?: OrderDetailsMarker;
    };
};

/**
 * The server-computed marker deciding how the order-details route renders and
 * which sections exist on this store.
 */
export const getOrderDetailsMarker = (): OrderDetailsMarker =>
    window?.dokanFrontend?.order_details ?? {};

export const isReactOrderDetailsView = (): boolean =>
    getOrderDetailsMarker().view === 'react';

export const isOrderDetailsSectionEnabled = ( section: string ): boolean =>
    Boolean( getOrderDetailsMarker().sections?.[ section ] );
