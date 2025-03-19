import { withRouter } from '../../../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout';
import ModulePage from '../pages/modules';
import { useMutationObserver } from '../../../hooks';
import SetupGuide from '../pages/setup-guide';

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
        element: <h3>404</h3>,
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

    useMutationObserver(
        document.body,
        ( mutations ) => {
            for ( const mutation of mutations ) {
                if ( mutation.type !== 'childList' ) {
                    continue;
                }
                // @ts-ignore
                for ( const node of mutation.addedNodes ) {
                    if ( node.id === 'headlessui-portal-root' ) {
                        node.classList.add( 'dokan-layout' );
                        node.style.display = 'block';
                    }

                    if (
                        node.hasAttribute( 'data-radix-popper-content-wrapper' )
                    ) {
                        node.classList.add( 'dokan-layout' );
                    }
                }
            }
        },
        { childList: true }
    );

    return (
        <>
            <RouterProvider router={ router } />
        </>
    );
};

export default Dashboard;
