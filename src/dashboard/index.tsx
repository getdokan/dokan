import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Layout from '../layout';
import getRoutes, { withRouter } from '../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';
import Skeleton from '@src/layout/Skeleton';
import { generateColorVariants } from '@dokan/utilities';

// `<DataViews>` (via @wordpress/dataviews) renders its Actions column header
// against the core 'default' text domain, whose translations don't load on the
// frontend. Re-route the 'default' "Actions" lookup through 'dokan-lite' so
// Dokan's translation wins.
addFilter(
    'i18n.gettext_default',
    'dokan-lite/dataviews-actions-label',
    ( translation: string, text: string ) => {
        if ( text !== 'Actions' ) {
            return translation;
        }
        const dokanTranslation = __( 'Actions', 'dokan-lite' );
        return dokanTranslation !== 'Actions' ? dokanTranslation : translation;
    }
);

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
