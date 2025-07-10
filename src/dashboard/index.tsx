import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Layout from '../layout';
import getRoutes, { withRouter } from '../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './tailwind.scss';
import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';
import Skeleton from '@dokan/layout/Skeleton';
import { generateColorVariants } from '@dokan/utilities';

const App = () => {
    const routes = getRoutes();
    const loading = useSelect( ( select ) => {
        // this is to do the eager loading the store.
        select( coreStore ).getCurrentUser();
        // @ts-ignore
        return select( coreStore ).getResolutionState( 'getCurrentUser' );
    }, [] );

    const mapedRoutes = routes.map( ( route ) => {
        const WithRouterComponent = withRouter(
            route.element,
            route?.capabilities || [ 'dokandar' ]
        );

        return {
            path: route.path,
            element: (
                <Layout
                    headerComponent={ route?.header }
                    footerComponent={ route?.footer }
                    route={ route }
                    title={ route?.title }
                    backUrl={ route?.backUrl }
                >
                    <WithRouterComponent />
                </Layout>
            ),
        };
    } );

    const router = createHashRouter( mapedRoutes );

    if ( ! loading || loading?.status !== 'finished' ) {
        return <Skeleton />;
    }

    return (
        <>
            <RouterProvider router={ router } />
        </>
    );
};

const addPrimaryColorVariant = () => {
    const root = document.documentElement;
    const primaryColor = getComputedStyle( root )
        .getPropertyValue( '--dokan-button-background-color' )
        .trim();

    if ( ! primaryColor ) {
        return;
    }
    const colorVariants = generateColorVariants( primaryColor );

    Object.entries( colorVariants ).forEach( ( [ key, value ] ) => {
        root.style.setProperty( `--colors-primary-${ key }`, value );
    } );
};

domReady( function () {
    const rootElement = document.querySelector(
        '#dokan-vendor-dashboard-root'
    );
    if ( ! rootElement ) {
        return;
    }
    const root = createRoot( rootElement! );
    root.render( <App /> );
    addPrimaryColorVariant();
} );
