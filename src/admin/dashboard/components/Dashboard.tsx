import { withRouter } from '../../../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import ModulePage from '../pages/modules';
import SetupGuide from '../pages/setup-guide';
import AdminNotFound from '../../../layout/admin404';
import WithdrawPage from '../pages/withdraw';
import VendorsSingle from '../pages/vendors-single';
import Create from '../pages/vendor-create-edit/Create';
import Edit from '../pages/vendor-create-edit/Edit';
import NotFound from '../../../layout/404';
import SettingsPage from '../pages/settings';
import AdminDashboard from '../pages/dashboard';
import VendorsPage from '../pages/vendors';
import ReverseWithdrawalPage from '../pages/reverse-withdrawal';
import ReverseWithdrawalTransactionPage from 'admin/dashboard/pages/reverse-withdrawal/ReverseWithdrawalTransaction';
import ChangelogPage from '../pages/changelog';
import ExtensionsPage from '../pages/extensions';
import DummyData from '../pages/dummy-data';
import Tools from './Tools/Tools';

export type DokanAdminRoute = {
    id: string;
    element: JSX.Element | React.ReactNode;
    path: string;
    parent?: string;
};

const getAdminRoutes = () => {
    let routes: Array< DokanAdminRoute > = [
        {
            id: 'dashboard',
            element: <AdminDashboard />,
            path: '/',
        },
        {
            id: 'setup',
            element: <SetupGuide />,
            path: '/setup',
        },
        {
            id: 'pro-modules',
            element: <ModulePage />,
            path: '/pro-modules',
        },
        {
            id: 'withdraw',
            element: <WithdrawPage />,
            path: '/withdraw',
        },
        {
            id: 'vendors',
            element: <VendorsPage />,
            path: '/vendors',
        },
        {
            id: 'vendor-single',
            element: <VendorsSingle />,
            path: '/vendors/:id',
        },
        {
            id: 'vendor-create',
            element: <Create />,
            path: '/vendors/create',
        },
        {
            id: 'vendor-edit',
            element: <Edit />,
            path: '/vendors/edit/:id',
        },
        {
            id: 'reverse-withdrawal', // Added Reverse Withdrawal route
            element: <ReverseWithdrawalPage />,
            path: '/reverse-withdrawal',
        },
        {
            id: 'reverse-withdrawal-store',
            element: <ReverseWithdrawalTransactionPage />,
            path: '/reverse-withdrawal/store/:id',
        },
        {
            id: 'settings',
            element: <SettingsPage />,
            path: '/settings',
        },
        {
            id: 'extensions',
            element: <ExtensionsPage />,
            path: '/extensions',
        },
        {
            id: 'tools',
            element: <Tools />,
            path: '/tools',
        },
        {
            id: 'changelog',
            element: <ChangelogPage />,
            path: '/changelog',
        },
        {
            id: 'dummy-data',
            element: <DummyData />,
            path: '/dummy-data',
        },
    ];

    // @ts-ignore
    routes = wp.hooks.applyFilters(
        'dokan-admin-dashboard-routes',
        routes
    ) as Array< DokanAdminRoute >;

    routes.push( {
        id: 'dokan-404',
        element: (
            <AdminNotFound
                className="h-screen"
                backToDashboardUrl={
                    window.dokanAdminDashboard?.urls?.adminDashboardUrl || '/'
                }
            />
        ),
        path: '*',
    } );

    return routes;
};

const Dashboard = () => {
    const routes = getAdminRoutes();

    const mapedRoutes = routes.map( ( route ) => {
        const WithRouterComponent = withRouter( route.element );

        return {
            path: route.path,
            element: (
                <Layout route={ route }>
                    <WithRouterComponent />
                </Layout>
            ),
        };
    } );

    const router = createHashRouter( mapedRoutes );

    return (
        <>
            <RouterProvider router={ router } />
        </>
    );
};

export default Dashboard;
