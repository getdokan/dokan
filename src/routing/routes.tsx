import { DokanRoute } from '@dokan/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@dokan/dashboard/withdraw';
import WithdrawRequests from '@dokan/dashboard/withdraw/WithdrawRequests';

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
] as Array< DokanRoute >;
