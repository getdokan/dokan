import { withRouter } from '../../../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import ModulePage from '../pages/modules';
import SetupGuide from '../pages/setup-guide';
import NotFound from '../../../layout/404';
import AdminDashboard from '../pages/dashboard';
import VendorsPage from '../pages/vendors';

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
            id: 'vendors',
            element: <VendorsPage />,
            path: '/vendors',
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
            <NotFound className="h-screen" backToDashboardUrl="?page=dokan" />
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
