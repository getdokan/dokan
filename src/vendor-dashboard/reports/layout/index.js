/**
 * External dependencies
 */
import { SlotFillProvider } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { Component, lazy, Suspense, useEffect } from '@wordpress/element';
import {
    unstable_HistoryRouter as HistoryRouter,
    Route,
    Routes,
    useLocation,
    useMatch,
    useParams,
} from 'react-router-dom';
import { Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { isFunction, identity } from 'lodash';
import {
    CustomerEffortScoreModalContainer,
    triggerExitPageCesSurvey,
} from '@woocommerce/customer-effort-score';
import {
    getHistory,
    getQuery,
    getNewPath,
    navigateTo,
} from '@woocommerce/navigation';
import {
    PLUGINS_STORE_NAME,
    useUser,
    withPluginsHydration,
    withOptionsHydration,
} from '@woocommerce/data';
import { recordPageView } from '@woocommerce/tracks';
import '@woocommerce/notices';
import { PluginArea } from '@wordpress/plugins';
import {
    LayoutContextProvider,
    getLayoutContextValue,
} from '@woocommerce/admin-layout';

/**
 * Internal dependencies
 */
import './style.scss';
import { Controller, usePages } from './controller';
import { Header } from '../header';
import { Footer } from './footer';
import Notices from './notices';
// import { TransientNotices } from "./transient-notices";
import { getAdminSetting } from 'reports/utils/admin-settings';
import { usePageClasses } from './hooks/use-page-classes';
import { mapToDashboardRoute, handleAnalyticsLinkPrevention, shouldBlockNavigation } from '../helper';
// import "reports/activity-panel";
// import "reports/mobile-banner";
// import "./navigation";

// const StoreAlerts = lazy(() =>
//   import(/* webpackChunkName: "store-alerts" */ "./store-alerts")
// );

// const WCPayUsageModal = lazy(() =>
//   import(
//     /* webpackChunkName: "wcpay-usage-modal" */ "../task-lists/fills/PaymentGatewaySuggestions/components/WCPay/UsageModal"
//   )
// );

export const PrimaryLayout = ( props ) => {
    const { children, showStoreAlerts = true, showNotices = true } = props;
    const location = useLocation();

    /**
     * Update URL if it contains the `admin.php'.
     * Since vendor dashboard URL should not contains the 'admin.php'
     */
    useEffect( () => {
        let href = window.location.href || '';
        const mappedRoute = mapToDashboardRoute( href );
        if ( mappedRoute !== href ) {
            getHistory().push( mappedRoute );
        }
    }, [ location ] );

    return (
        <div
            className="woocommerce-layout__primary"
            id="woocommerce-layout__primary"
        >
            { showNotices && <Notices /> }
            { children }
        </div>
    );
};

/**
 * Exists for the sole purpose of passing on react-router hooks into
 * the class based Layout component. Feel free to refactor it by turning _Layout
 * into a functional component and moving the hooks inside
 *
 * @param {Object} root0          root0 React component props
 * @param {Object} root0.children Children componeents
 */
const WithReactRouterProps = ( { children } ) => {
    const location = useLocation();
    const match = useMatch( location.pathname );
    const params = useParams();
    const matchProp = { params, url: match.pathname };
    return Children.toArray( children ).map( ( child ) => {
        return cloneElement( child, {
            ...child.props,
            location,
            match: matchProp,
        } );
    } );
};

function _Layout( { isEmbedded, match, page } ) {
    usePageClasses( page );

    const { breadcrumbs, layout = { header: true, footer: true } } = page;
    const {
        header: showHeader = true,
        footer: showFooter = true,
        showPluginArea = true,
    } = layout;

    const query = getQuery();

    return (
        <LayoutContextProvider
            value={ getLayoutContextValue( [
                page?.navArgs?.id?.toLowerCase() || 'page',
            ] ) }
        >
            <SlotFillProvider>
                <div className="woocommerce-layout">
                    { showHeader && (
                        <Header
                            sections={
                                isFunction( breadcrumbs )
                                    ? breadcrumbs( { match } )
                                    : breadcrumbs
                            }
                            isEmbedded={ isEmbedded }
                            query={ query }
                        />
                    ) }
                    { /* <TransientNotices /> */ }
                    { ! isEmbedded && (
                        <PrimaryLayout
                            showNotices={ page?.layout?.showNotices }
                            showStoreAlerts={ page?.layout?.showStoreAlerts }
                        >
                            <div className="woocommerce-layout__main">
                                <Controller
                                    page={ page }
                                    match={ match }
                                    query={ query }
                                />
                            </div>
                        </PrimaryLayout>
                    ) }
                    { showFooter && <Footer /> }
                    <CustomerEffortScoreModalContainer />
                </div>
            </SlotFillProvider>
        </LayoutContextProvider>
    );
}

_Layout.propTypes = {
    isEmbedded: PropTypes.bool,
    page: PropTypes.shape( {
        container: PropTypes.oneOfType( [
            PropTypes.func,
            PropTypes.object, // Support React.lazy
        ] ),
        path: PropTypes.string,
        // breadcrumbs: PropTypes.oneOfType([
        //   PropTypes.func,
        //   PropTypes.arrayOf(
        //     PropTypes.oneOfType([
        //       PropTypes.arrayOf(PropTypes.string),
        //       PropTypes.string,
        //     ])
        //   ),
        // ]),
        wpOpenMenu: PropTypes.string,
    } ).isRequired,
};

/**
 * Wraps _Layout with WithReactRouterProps for non-embedded page renders
 * We need this because the hooks fail for embedded page renders as there is no Router context above it.
 *
 * @param {Object} props React component props
 */
const LayoutSwitchWrapper = ( props ) => {
    if ( props && props.isEmbedded ) {
        return <_Layout { ...props } />;
    }
    return (
        <WithReactRouterProps>
            <_Layout { ...props } />
        </WithReactRouterProps>
    );
};

const dataEndpoints = getAdminSetting( 'dataEndpoints' );
const Layout = compose(
    withPluginsHydration( {
        ...getAdminSetting( 'plugins', {} ),
        jetpackStatus:
            ( dataEndpoints && dataEndpoints.jetpackStatus ) || false,
    } ),
    withSelect( ( select, { isEmbedded } ) => {
        // Embedded pages don't send plugin info to Tracks.
        if ( isEmbedded ) {
            return;
        }

        const { getActivePlugins, getInstalledPlugins, isJetpackConnected } =
            select( PLUGINS_STORE_NAME );

        return {
            activePlugins: getActivePlugins(),
            isJetpackConnected: isJetpackConnected(),
            installedPlugins: getInstalledPlugins(),
        };
    } )
)( LayoutSwitchWrapper );

const _PageLayout = () => {
    if ( shouldBlockNavigation() ) {
        return; // Prevent analytics app rendering if analytics path not found.
    }

    handleAnalyticsLinkPrevention(); // Prevent url redirection if analytics path found.
    const { currentUserCan } = useUser();
    const pages = usePages();

    // get the basename, usually 'wp-admin/' but can be something else if the site installation changed it
    const path = document.location.pathname;
    const basename = path.substring( 0, path.lastIndexOf( '/' ) );

    return (
        <HistoryRouter history={ getHistory() }>
            <Routes basename={ basename }>
                { pages
                    //   .filter((page) => !page.capability || currentUserCan(page.capability))
                    .map( ( page ) => {
                        return (
                            <Route
                                key={ page.path }
                                path={ page.path }
                                exact
                                element={ <Layout page={ page } /> }
                            />
                        );
                    } ) }
            </Routes>
        </HistoryRouter>
    );
};

export const PageLayout = compose(
    window.wcSettings.admin
        ? withOptionsHydration( {
              ...getAdminSetting( 'preloadOptions', {} ),
          } )
        : identity
)( _PageLayout );

const _EmbedLayout = () => (
    <Layout
        page={ {
            breadcrumbs: getAdminSetting( 'embedBreadcrumbs', [] ),
        } }
        isEmbedded
    />
);

export const EmbedLayout = compose(
    getAdminSetting( 'preloadOptions' )
        ? withOptionsHydration( {
              ...getAdminSetting( 'preloadOptions' ),
          } )
        : identity
)( _EmbedLayout );
