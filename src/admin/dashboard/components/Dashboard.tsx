import { withRouter } from '../../../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import ModulePage from '../pages/modules';
import SetupGuide from '../pages/setup-guide';
import AdminNotFound from '../../../layout/admin404';

export type DokanAdminRoute = {
    id: string;
    element: JSX.Element | React.ReactNode;
    path: string;
    parent?: string;
};

const getAdminRoutes = () => {
    let routes: Array< DokanAdminRoute > = [
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
    ];

    // @ts-ignore
    routes = wp.hooks.applyFilters(
        'dokan-admin-dashboard-routes',
        routes
    ) as Array< DokanAdminRoute >;

    routes.push( {
        id: 'dokan-404',
        element: (
            <AdminNotFound className="h-screen" backToDashboardUrl="?page=dokan" />
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
