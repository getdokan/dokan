import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import { pluginUITokens } from '@src/layout';
import { ThemeProvider } from '@wedevs/plugin-ui';
import { DokanAdminRoute } from './Dashboard';

const Layout = ( {
    children,
    route,
}: {
    children: React.ReactNode;
    route: DokanAdminRoute;
} ) => {
    return (
        <SlotFillProvider>
            <ThemeProvider
                pluginId="dokan-admin-dashboard"
                tokens={ pluginUITokens }
            >
                { children }
                <PluginArea scope={ 'dokan-admin-dashboard-' + route.id } />
            </ThemeProvider>
            <DokanToaster />
        </SlotFillProvider>
    );
};

export default Layout;
