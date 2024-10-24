import NotFound from "../Layout/404";
import {__} from "@wordpress/i18n";
import {DokanRoute} from "../Layout";
import { isValidElement, cloneElement, createElement } from '@wordpress/element';
import { useNavigate, useParams, useLocation, redirect, replace, useMatches, useNavigation,  } from 'react-router-dom';

export function withRouter(Component) {
    function ComponentWithRouterProp(props) {
        let navigate = useNavigate();
        let params   = useParams();
        let location = useLocation();
        let matches = useMatches();
        const navigation = useNavigation();

        const routerProps = {
            navigate,
            params,
            location,
            redirect,
            replace,
            matches,
            navigation
        };

        // Check if Component is a valid element
        if (isValidElement(Component)) {
            // If it's a valid element, clone it and pass the router props
            return cloneElement(Component, { ...props, ...routerProps });
        }

        // If it's a function component, render it with the router props
        return createElement(Component, {
            ...props,
            ...routerProps
        });
    }

    return ComponentWithRouterProp;
}

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
