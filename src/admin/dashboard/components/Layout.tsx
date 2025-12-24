import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';

const Layout = ( { children, route } ) => {
    return (
        <SlotFillProvider>
            { children }
            <PluginArea scope={ 'dokan-admin-dashboard-' + route.id } />
            <DokanToaster />
        </SlotFillProvider>
    );
};

export default Layout;
