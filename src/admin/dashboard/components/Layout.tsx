import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import { pluginUITokens } from '@src/layout';
import { ThemeProvider } from '@wedevs/plugin-ui';
import { useEffect } from '@wordpress/element';
import { setLocaleData } from '@wordpress/i18n';
import { getTranslatedStrings } from '@src/components/dataviews/DataViewTable';
import { DokanAdminRoute } from './Dashboard';

const Layout = ( {
    children,
    route,
}: {
    children: React.ReactNode;
    route: DokanAdminRoute;
} ) => {
    useEffect( () => {
        setLocaleData( getTranslatedStrings(), 'default' );
    }, [] );

    return (
        <SlotFillProvider>
            <ThemeProvider
                pluginId="dokan-admin-dashboard"
                tokens={ pluginUITokens }
            >
                { /* Plugin UI WordPress styles are scoped to .dokan-admin-dashboard-layout (see base-tailwind.css). */ }
                <div className="dokan-admin-dashboard-layout">
                    { children }
                </div>
                <PluginArea scope={ 'dokan-admin-dashboard-' + route.id } />
            </ThemeProvider>
            <DokanToaster />
        </SlotFillProvider>
    );
};

export default Layout;
