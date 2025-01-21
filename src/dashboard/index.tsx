import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Layout from '../layout';
import getRoutes, { withRouter } from '../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './tailwind.scss';

const App = () => {
    const routes = getRoutes();

    const mapedRoutes = routes.map( ( route ) => {
        const WithRouterComponent = withRouter( route.element );

        return {
            path: route.path,
            element: (
                <Layout
                    headerComponent={ route?.header }
                    footerComponent={ route?.footer }
                    route={ route }
                    title={ route?.title }
                >
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

domReady( function () {
    const rootElement = document.querySelector(
        '#dokan-vendor-dashboard-root'
    );
    const root = createRoot( rootElement! );
    root.render( <App /> );
} );
