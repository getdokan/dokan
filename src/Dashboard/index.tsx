import {createRoot} from "@wordpress/element";
import domReady from "@wordpress/dom-ready";
import Layout from "../Layout";
import getRoutes, { withRouter } from "../Routing";
import {
    createHashRouter,
    RouterProvider,
} from "react-router-dom";
import './tailwind.scss';

const App = () => {
    const routes = getRoutes();

    const mapedRoutes = routes.map((route) => {
        const WithRouterComponent = withRouter( route.element );

        return {
            path: route.path,
            element: <Layout
                headerComponent={route?.header}
                footerComponent={route?.footer}
                route={route}
                title={route?.title}
            >
                <WithRouterComponent/>
            </Layout>,
        }
    });

    const router = createHashRouter(mapedRoutes);

    return <RouterProvider router={router} />;
}

domReady( function () {
    const rootElement = document.querySelector( '.dashboard-content-area' );
    const root = createRoot( rootElement! );
    root.render(
        <App />
    );
} );
