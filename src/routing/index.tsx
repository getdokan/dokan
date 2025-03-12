import NotFound from '../layout/404';
import { __ } from '@wordpress/i18n';
import { DokanRoute } from '../layout';
import {
    isValidElement,
    cloneElement,
    createElement,
} from '@wordpress/element';
import {
    useNavigate,
    useParams,
    useLocation,
    redirect,
    replace,
    useMatches,
    useNavigation,
    createSearchParams,
} from 'react-router-dom';
import Withdraw from '../dashboard/withdraw';
import WithdrawRequests from '../dashboard/withdraw/WithdrawRequests';
import coreStore from '@dokan/stores/core';
import { useSelect } from '@wordpress/data';
import Forbidden from '../layout/403';

export function withRouter( Component, capabilities = [] ) {
    function ComponentWithRouterProp( props ) {
        const authorised: boolean = useSelect( ( select ) => {
            const store = select( coreStore );
            if ( capabilities?.length > 0 ) {
                return capabilities.every( ( cap ) => store.hasCap( cap ) );
            }
            return true;
        }, [] );

        const navigate = useNavigate();
        const params = useParams();
        const location = useLocation();
        const matches = useMatches();
        const navigation = useNavigation();

        const routerProps = {
            navigate,
            params,
            location,
            redirect,
            replace,
            matches,
            navigation,
            createSearchParams,
        };

        // Check if Component is a valid element
        if ( isValidElement( Component ) ) {
            // If it's a valid element, clone it and pass the router props
            return cloneElement( Component, { ...props, ...routerProps } );
        }

        if ( ! authorised ) {
            return createElement( Forbidden, { ...props, ...routerProps } );
        }

        // If it's a function component, render it with the router props
        return createElement( Component, {
            ...props,
            ...routerProps,
        } );
    }

    return ComponentWithRouterProp;
}

const getRoutes = () => {
    let routes: Array< DokanRoute > = [];

    // routes.push(
    //     {
    //         id: 'dokan-base',
    //         title: __( 'Dashboard', 'dokan-lite' ),
    //         element: <h1>Dashboard body</h1>,
    //         path: '/',
    //         exact: true,
    //         order: 10,
    //     }
    // );

    routes.push( {
        id: 'dokan-withdraw',
        title: __( 'Withdraw', 'dokan-lite' ),
        element: <Withdraw />,
        path: '/withdraw',
        exact: true,
        order: 10,
    } );

    routes.push( {
        id: 'dokan-withdraw-requests',
        title: __( 'Withdraw', 'dokan-lite' ),
        element: <WithdrawRequests />,
        path: '/withdraw-requests',
        exact: true,
        order: 10,
    } );

    // @ts-ignore
    routes = wp.hooks.applyFilters(
        'dokan-dashboard-routes',
        routes
    ) as Array< DokanRoute >;
    routes.push( {
        id: 'dokan-404',
        element: <NotFound />,
        path: '*',
    } );

    return routes;
};

export default getRoutes;
