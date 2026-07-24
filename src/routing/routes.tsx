import { DokanRoute } from '@src/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@src/dashboard/withdraw';
import WithdrawRequests from '@src/dashboard/withdraw/WithdrawRequests';
import App from '@src/dashboard/product-editor/App';
import Products from '@src/dashboard/products';
import Orders from '@src/dashboard/orders';
import OrderDetailsRoute from '@src/dashboard/orders/details';
import OrderDetailsHeader from '@src/dashboard/orders/OrderDetailsHeader';
import ReverseWithdrawal from '@src/dashboard/reverse-withdraw';

export default [
    {
        id: 'dokan-products',
        title: __( 'Products', 'dokan-lite' ),
        element: Products,
        path: '/products',
        exact: true,
        order: 5,
        capabilities: [ 'dokan_view_product_menu' ],
    },
    {
        id: 'dokan-orders',
        title: __( 'Orders', 'dokan-lite' ),
        element: <Orders />,
        path: '/orders',
        exact: true,
        order: 5,
        capabilities: [ 'dokan_view_order_menu' ],
    },
    {
        // Vendor order details. The view itself is server-rendered PHP delivered as an
        // HTML fragment — see src/dashboard/orders/OrderDetails.tsx.
        //
        // This dynamic path cannot shadow Pro's `orders/edit/:id`: the router ranks
        // static segments above dynamic ones regardless of registration order.
        id: 'dokan-order-details',
        title: __( 'Order Details', 'dokan-lite' ),
        element: OrderDetailsRoute,
        // The panel owns the chrome here: the order number as the title, a live status
        // badge, Back, and the Edit Order action Pro would otherwise lose with the
        // status-filter bar the fragment does not render.
        header: <OrderDetailsHeader />,
        path: '/orders/:orderId',
        exact: true,
        order: 5,
        parent: 'orders',
        capabilities: [ 'dokan_view_order' ],
    },
    {
        id: 'dokan-withdraw',
        title: __( 'Withdraw', 'dokan-lite' ),
        element: <Withdraw />,
        path: '/withdraw',
        exact: true,
        order: 10,
        capabilities: [ 'dokan_view_withdraw_menu' ],
    },
    {
        id: 'dokan-withdraw-requests',
        title: __( 'Withdraw', 'dokan-lite' ),
        element: <WithdrawRequests />,
        path: '/withdraw-requests',
        backUrl: '/withdraw',
        exact: true,
        order: 10,
        capabilities: [ 'dokan_view_withdraw_menu' ],
    },
    {
        id: 'dokan-product-editor-create',
        title: __( 'Add New Product', 'dokan-lite' ),
        element: App,
        path: '/products/create',
        exact: true,
        order: 10,
        capabilities: [ 'dokan_view_product_menu' ],
    },
    {
        id: 'dokan-product-editor-edit',
        title: __( 'Edit Product', 'dokan-lite' ),
        element: App,
        path: '/products/:productId/edit',
        exact: true,
        order: 10,
        capabilities: [ 'dokan_view_product_menu' ],
    },
    {
        id: 'dokan-reverse-withdrawal',
        title: __( 'Reverse Withdrawal', 'dokan-lite' ),
        element: <ReverseWithdrawal />,
        path: '/reverse-withdrawal',
        exact: true,
        order: 11,
        capabilities: [ 'dokan_view_withdraw_menu' ],
    },
] as Array< DokanRoute >;
