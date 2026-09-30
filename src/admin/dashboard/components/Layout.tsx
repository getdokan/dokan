import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import { pluginUITokens } from '@src/layout';
import { ThemeProvider } from '@wedevs/plugin-ui';
import { useEffect } from '@wordpress/element';
import { setLocaleData } from '@wordpress/i18n';
import { getTranslatedStrings } from '@src/utilities/getTranslatedStrings';
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
                { /* Dashboard layout container. Plugin UI WordPress styles are
                    imported globally in base-tailwind.css; Tailwind utilities are
                    scoped via the .dokan-layout class that individual pages add. */ }
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
