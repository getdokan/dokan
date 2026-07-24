/**
 * Named slots of the React order details view — the section contract.
 *
 * These names are public API: Pro and third-party panel bundles register fills
 * against them via `registerPlugin( name, { render, scope: 'dokan-order-details' } )`.
 * Every slot receives `{ order, orderId, sections, refetch, navigate }` as fillProps.
 */

export const ORDER_DETAILS_AFTER_SUMMARY_SLOT =
    'dokan-order-details-after-summary';

export const ORDER_DETAILS_ITEMS_ACTIONS_SLOT =
    'dokan-order-details-items-actions';

export const ORDER_DETAILS_AFTER_ITEMS_SLOT = 'dokan-order-details-after-items';

export const ORDER_DETAILS_SIDEBAR_BEFORE_SLOT =
    'dokan-order-details-sidebar-before';

export const ORDER_DETAILS_SIDEBAR_MIDDLE_SLOT =
    'dokan-order-details-sidebar-middle';

export const ORDER_DETAILS_SIDEBAR_AFTER_SLOT =
    'dokan-order-details-sidebar-after';
