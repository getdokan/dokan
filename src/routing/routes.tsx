import { DokanRoute } from '@src/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@src/dashboard/withdraw';
import WithdrawRequests from '@src/dashboard/withdraw/WithdrawRequests';
import Products from '@src/dashboard/products';

export default [
    {
        id: 'dokan-products',
        title: __( 'Products', 'dokan-lite' ),
        element: <Products />,
        path: '/products',
        exact: true,
        order: 5,
        capabilities: [ 'dokan_view_product_menu' ],
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
] as Array< DokanRoute >;
