import { DokanRoute } from '@src/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@src/dashboard/withdraw';
import WithdrawRequests from '@src/dashboard/withdraw/WithdrawRequests';
import App from '@src/dashboard/product-editor/App';
import Products from '@src/dashboard/products';
import Orders from '@src/dashboard/orders';
import ReverseWithdrawal from '@src/dashboard/reverse-withdraw';
import StoreSettings from '@src/dashboard/settings/store';

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
    {
        id: 'dokan-settings-store',
        title: __( 'Store', 'dokan-lite' ),
        element: <StoreSettings />,
        path: '/settings/store',
        exact: true,
        order: 200,
        capabilities: [ 'dokan_view_store_settings_menu' ],
    },
] as Array< DokanRoute >;
