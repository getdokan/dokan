import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import Layout from '../layout';
import getRoutes, { withRouter } from '../routing';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import './tailwind.scss';
import { useMutationObserver } from '../hooks';

const App = () => {
    const routes = getRoutes();

    const mapedRoutes = routes.map( ( route ) => {
        const WithRouterComponent = withRouter( route.element );

        return {
            path: route.path,
            element: (
                <Layout
                    headerComponent={ route?.header }
                    footerComponent={ route?.footer }
                    route={ route }
                    title={ route?.title }
                >
                    <WithRouterComponent />
                </Layout>
            ),
        };
    } );

    const router = createHashRouter( mapedRoutes );

    useMutationObserver(
        document.body,
        ( mutations ) => {
            for ( const mutation of mutations ) {
                if ( mutation.type !== 'childList' ) {
                    continue;
                }
                // @ts-ignore
                for ( const node of mutation.addedNodes ) {
                    if ( node.id === 'headlessui-portal-root' ) {
                        node.classList.add( 'dokan-layout' );
                        node.style.display = 'block';
                    }

                    if (
                        node.hasAttribute( 'data-radix-popper-content-wrapper' )
                    ) {
                        node.classList.add( 'dokan-layout' );
                    }
                }
            }
        },
        { childList: true }
    );

    return (
        <>
            <RouterProvider router={ router } />
        </>
    );
};

domReady( function () {
    const rootElement = document.querySelector(
        '#dokan-vendor-dashboard-root'
    );
    const root = createRoot( rootElement! );
    root.render( <App /> );
} );
