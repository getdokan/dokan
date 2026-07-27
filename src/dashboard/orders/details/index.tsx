import OrderDetailsFragment from '../OrderDetails';
import OrderDetailsView from './OrderDetailsView';
import { isReactOrderDetailsView } from './marker';

/**
 * The order-details route element: the server-side marker picks the renderer.
 *
 * `react` renders the first-party view; anything else falls back to the
 * server-rendered fragment (ADR-0005) — the permanent compatibility path for
 * stores with third-party template hooks and for Vendor staff sessions.
 * @param props
 * @param props.params
 * @param props.params.orderId
 */
const OrderDetailsRoute = ( props: { params?: { orderId?: string } } ) =>
    isReactOrderDetailsView() ? (
        <OrderDetailsView { ...props } />
    ) : (
        <OrderDetailsFragment { ...props } />
    );

export default OrderDetailsRoute;
