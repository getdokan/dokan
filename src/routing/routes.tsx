import { DokanRoute } from '@src/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@src/dashboard/withdraw';
import WithdrawRequests from '@src/dashboard/withdraw/WithdrawRequests';
import App from '@src/dashboard/product-editor/App';

export default [
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
] as Array< DokanRoute >;
