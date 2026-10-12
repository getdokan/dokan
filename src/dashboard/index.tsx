import { createRoot, useEffect } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import Layout from '../layout';
import getRoutes, { withRouter } from '../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import coreStore from '@dokan/stores/core';
import Skeleton from '@src/layout/Skeleton';
import InternalError from '@src/layout/500';
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
        return __( 'Actions', 'dokan-lite' );
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

    // @ts-ignore — invalidateResolution is a store metadata action, absent from the store's own types.
    const { invalidateResolution } = useDispatch( coreStore );
    // @ts-ignore — same metadata actions on the WordPress store Dokan's resolver reads through.
    const {
        invalidateResolution: invalidateCoreData,
        invalidateResolutionForStoreSelector: invalidateCoreDataSelector,
    } = useDispatch( coreDataStore );

    // Dokan's resolver awaits both getCurrentUser() and getUser( id ), and either leg replays its own
    // cached failure, so a retry that misses one is a permanent no-op for whoever failed on that leg.
    const retryCurrentUser = () => {
        invalidateCoreDataSelector( 'getUser' );
        invalidateCoreData( 'getCurrentUser', [] );
        invalidateResolution( 'getCurrentUser', [] );
    };

    // Without the WP_Error, support cannot tell a blocking security plugin from a network blip.
    useEffect( () => {
        if ( 'error' !== loading?.status ) {
            return;
        }

        // eslint-disable-next-line no-console
        console.error(
            'Dokan: current user resolution failed',
            loading?.error
        );
    }, [ loading?.status, loading?.error ] );

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

    // A failed resolver would otherwise sit on the skeleton forever — the "stays on loading" report.
    if ( 'error' === loading?.status ) {
        return (
            <InternalError
                title={ __( 'We could not load your dashboard', 'dokan-lite' ) }
                message={ __(
                    'Your account details could not be read. Try again, and contact the marketplace owner if this keeps happening.',
                    'dokan-lite'
                ) }
                onRefresh={ retryCurrentUser }
            />
        );
    }

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
