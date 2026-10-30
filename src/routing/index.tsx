import NotFound from '../layout/404';
import { DokanRoute } from '../layout';
import routes from './routes';
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
    useSearchParams
} from 'react-router-dom';
import coreStore from '@dokan/stores/core';
import { useSelect } from '@wordpress/data';
import Forbidden from '../layout/403';

// Routes under a dashboard menu the admin switched off (Menu Manager): the sidebar hides them, so the URL must not open them either.
const isRestrictedRoute = ( pathname: string ): boolean => {
    const restricted: string[] =
        ( window as any )?.dokanFrontend?.restrictedRoutes || [];
    const path = pathname.replace( /^\/+|\/+$/g, '' );

    return restricted.some(
        ( route ) => path === route || path.startsWith( route + '/' )
    );
};

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
            useParams,
            createSearchParams,
            useSearchParams,
        };

        if ( ! authorised || isRestrictedRoute( location.pathname ) ) {
            return createElement( Forbidden, { ...props, ...routerProps } );
        }

        // Check if Component is a valid element
        if ( isValidElement( Component ) ) {
            // If it's a valid element, clone it and pass the router props
            return cloneElement( Component, { ...props, ...routerProps } );
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
    // @ts-ignore
    const filteredRoutes = wp.hooks.applyFilters(
        'dokan-dashboard-routes',
        routes
    ) as Array< DokanRoute >;

    filteredRoutes.push( {
        id: 'dokan-404',
        element: <NotFound />,
        path: '*',
    } );

    return filteredRoutes;
};

export default getRoutes;
