import { addAction, doAction, removeAction } from '@wordpress/hooks';

/**
 * The public re-init contract for the Vendor order details fragment.
 *
 * Order details is server-rendered PHP injected into the React panel long after
 * DOM-ready, so JavaScript that binds to that markup needs to be told when it exists.
 * These events are that signal, and they are the compatibility contract for the whole
 * migration — their names, payloads and timing must not drift.
 *
 * Every event is emitted twice: through the modern JavaScript hooks system and as a
 * jQuery event on `document.body`, so extension code from either era can consume it.
 *
 * @see docs/frontend/order-details-fragment.md
 */

/**
 * Fires once the fragment is on the page and any render-time inline data is executing.
 *
 * Payload: `( container: HTMLElement, orderId: number )`
 */
export const ORDER_DETAILS_RENDERED = 'dokan-order-details-fragment-rendered';

/**
 * Fires when the fragment's order metadata is known, before the markup is inserted.
 *
 * Payload: `( order: OrderDetailsMeta )`
 */
export const ORDER_DETAILS_LOADED = 'dokan-order-details-loaded';

/**
 * Fires after a Vendor changes the order status inline, so nothing on the page can
 * contradict the status inside the fragment.
 *
 * Payload: `( orderId: number, status: string, labelHtml: string )`
 */
export const ORDER_DETAILS_STATUS_CHANGED =
    'dokan-order-details-status-changed';

type JQueryLike = ( target: unknown ) => {
    trigger: ( name: string, args: unknown[] ) => void;
};

const getJQuery = (): JQueryLike | undefined =>
    ( window as unknown as { jQuery?: JQueryLike } ).jQuery;

let subscriptionCount = 0;

/**
 * Emit one of the order-details events on both channels.
 *
 * @param name Event name.
 * @param args Positional payload.
 */
export const emitOrderDetailsEvent = ( name: string, args: unknown[] ) => {
    doAction( name, ...args );

    getJQuery()?.( document.body ).trigger( name, args );
};

/**
 * Subscribe to an order-details event.
 *
 * Listens on the hooks channel only. Every emitter publishes on both, so subscribing to
 * both would run the handler twice — and the hooks channel is the one panel code can
 * count on, since it is imported rather than assumed present on `window`.
 *
 * @param name    Event name.
 * @param handler Receives the event payload.
 *
 * @return Unsubscribe function.
 */
export const onOrderDetailsEvent = (
    name: string,
    handler: ( ...args: unknown[] ) => void
) => {
    // Hook namespaces are unique per subscription so two mounted listeners on the same
    // event cannot unregister each other.
    const namespace = `dokan-lite/order-details-${ ++subscriptionCount }`;

    addAction( name, namespace, handler );

    return () => removeAction( name, namespace );
};
