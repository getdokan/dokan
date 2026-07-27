/**
 * Named slots of the React order details view — the section contract.
 *
 * These names are public API: Pro and third-party panel bundles register fills
 * against them via `registerPlugin( name, { render, scope: 'dokan-order-details' } )`.
 * Every slot receives the view's context as fillProps:
 * `{ order, orderId, sections, isLoading, refetch, navigate }`.
 *
 * Every section — main column and sidebar alike — is bracketed by a
 * `before-*` and an `after-*` slot, so an extension can add a card anywhere
 * without replacing a first-party one.
 */

const PREFIX = 'dokan-order-details-';

export const ORDER_DETAILS_BEFORE_SUMMARY_SLOT = `${ PREFIX }before-summary`;
export const ORDER_DETAILS_AFTER_SUMMARY_SLOT = `${ PREFIX }after-summary`;

export const ORDER_DETAILS_BEFORE_ITEMS_SLOT = `${ PREFIX }before-items`;
export const ORDER_DETAILS_ITEMS_ACTIONS_SLOT = `${ PREFIX }items-actions`;
export const ORDER_DETAILS_AFTER_ITEMS_SLOT = `${ PREFIX }after-items`;

export const ORDER_DETAILS_BEFORE_DOWNLOADS_SLOT = `${ PREFIX }before-downloads`;
export const ORDER_DETAILS_AFTER_DOWNLOADS_SLOT = `${ PREFIX }after-downloads`;

export const ORDER_DETAILS_SIDEBAR_BEFORE_SLOT = `${ PREFIX }sidebar-before`;
export const ORDER_DETAILS_SIDEBAR_MIDDLE_SLOT = `${ PREFIX }sidebar-middle`;
export const ORDER_DETAILS_SIDEBAR_AFTER_SLOT = `${ PREFIX }sidebar-after`;

export const ORDER_DETAILS_BEFORE_CUSTOMER_SLOT = `${ PREFIX }before-customer`;
export const ORDER_DETAILS_AFTER_CUSTOMER_SLOT = `${ PREFIX }after-customer`;

export const ORDER_DETAILS_BEFORE_ADDRESS_SLOT = `${ PREFIX }before-address`;
export const ORDER_DETAILS_AFTER_ADDRESS_SLOT = `${ PREFIX }after-address`;

export const ORDER_DETAILS_BEFORE_NOTES_SLOT = `${ PREFIX }before-notes`;
export const ORDER_DETAILS_AFTER_NOTES_SLOT = `${ PREFIX }after-notes`;

/**
 * Slot names a section renders around itself, by section id.
 *
 * Cards use this so a new section only has to name itself once.
 */
export const ORDER_DETAILS_SECTION_SLOTS: Record<
    string,
    { before: string; after: string }
> = {
    summary: {
        before: ORDER_DETAILS_BEFORE_SUMMARY_SLOT,
        after: ORDER_DETAILS_AFTER_SUMMARY_SLOT,
    },
    items: {
        before: ORDER_DETAILS_BEFORE_ITEMS_SLOT,
        after: ORDER_DETAILS_AFTER_ITEMS_SLOT,
    },
    downloads: {
        before: ORDER_DETAILS_BEFORE_DOWNLOADS_SLOT,
        after: ORDER_DETAILS_AFTER_DOWNLOADS_SLOT,
    },
    customer: {
        before: ORDER_DETAILS_BEFORE_CUSTOMER_SLOT,
        after: ORDER_DETAILS_AFTER_CUSTOMER_SLOT,
    },
    address: {
        before: ORDER_DETAILS_BEFORE_ADDRESS_SLOT,
        after: ORDER_DETAILS_AFTER_ADDRESS_SLOT,
    },
    notes: {
        before: ORDER_DETAILS_BEFORE_NOTES_SLOT,
        after: ORDER_DETAILS_AFTER_NOTES_SLOT,
    },
};

/**
 * JavaScript filter hooks the view runs its own data through, for extensions
 * that need to change what a first-party section shows rather than add to it.
 */
export const ORDER_DETAILS_SUMMARY_ITEMS_FILTER =
    'dokan_order_details_summary_items';

export const ORDER_DETAILS_STATUSES_FILTER = 'dokan_order_details_statuses';

export const ORDER_DETAILS_ADDRESS_PARTS_FILTER =
    'dokan_order_details_address_parts';
