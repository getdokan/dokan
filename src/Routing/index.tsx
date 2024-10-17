import NotFound from "../Layout/404";
import {__} from "@wordpress/i18n";
import {DokanRoute} from "../Layout";

const getRoutes = () => {
    let routes : Array<DokanRoute> = [];

    // routes.push(
    //     {
    //         id: 'dokan-seller-settings',
    //         title: __( 'Settings', 'dokan-lite' ),
    //         icon: <SettingsIcon />,
    //         element: <SellerSettings/>
    //         path: '/settings',
    //         exact: true,
    //         order: 1,
    //         parent: 'dokan-dashboard',
    //     }
    // );

     routes.push(
        {
            id: 'dokan-kola',
            title: __( 'Kola bagan', 'dokan-lite' ),
            element: <h1>asdasd</h1>,
            path: '/kola',
            exact: true,
            order: 10,
        }
    );
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
    routes.push(
        {
            id: 'dokan-settings',
            title: __( 'Settings', 'dokan-lite' ),
            element: <h1>Settings body</h1>,
            path: 'settings',
            exact: true,
            order: 10,
        }
    );

    routes.push(
        {
            id: 'dokan-store-settings',
            title: __( 'Store Settings', 'dokan-lite' ),
            element: <h1>Store Settings body</h1>,
            path: 'store',
            exact: true,
            order: 10,
            parent: 'settings',
        }
    );






    // @ts-ignore
    routes = wp.hooks.applyFilters('dokan-frontend-routes', routes) as Array<DokanRoute>;
    routes.push(
        {
            id: 'dokan-404',
            element: <NotFound />,
            path: '*',
        }
    );

    console.log(routes);

  return routes;
}

export default getRoutes;
