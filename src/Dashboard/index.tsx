import {createRoot} from "@wordpress/element";
import domReady from "@wordpress/dom-ready";
import Layout from "../Layout";
import getRoutes from "../Routing";
import {
    createBrowserRouter, createHashRouter,
    RouterProvider,
} from "react-router-dom";
import './tailwind.scss';

const App = () => {
    const routes = getRoutes();

    const mapedRoutes = routes.map((route) => {


        // TODO add Parent route support.

        return {
            path: route.path,
            element: <Layout route={route} title={route.title}>{route.element}</Layout>,
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
