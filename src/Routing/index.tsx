import NotFound from "../Layout/404";
import {__} from "@wordpress/i18n";
import {DokanRoute} from "../Layout";

const getRoutes = () => {
    let routes : Array<DokanRoute> = [];

    routes.push(
        {
            id: 'dokan-base',
            title: __( 'Dashboard', 'dokan-lite' ),
            element: <h1>Dashboard body</h1>,
            path: '/',
            exact: true,
            order: 10,
        }
    );

    // @ts-ignore
    routes = wp.hooks.applyFilters('dokan-dashboard-routes', routes) as Array<DokanRoute>;
    routes.push(
        {
            id: 'dokan-404',
            element: <NotFound />,
            path: '*',
        }
    );

    return routes;
}

export default getRoutes;
