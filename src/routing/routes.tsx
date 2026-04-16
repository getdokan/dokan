import { DokanRoute } from '@src/layout';
import { __ } from '@wordpress/i18n';
import Withdraw from '@src/dashboard/withdraw';
import WithdrawRequests from '@src/dashboard/withdraw/WithdrawRequests';
import ReverseWithdrawal from '@src/dashboard/reverse-withdraw';

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
        id: 'dokan-reverse-withdrawal',
        title: __( 'Reverse Withdrawal', 'dokan-lite' ),
        element: <ReverseWithdrawal />,
        path: '/reverse-withdrawal',
        exact: true,
        order: 11,
        capabilities: [ 'dokan_view_withdraw_menu' ],
    },
] as Array< DokanRoute >;
