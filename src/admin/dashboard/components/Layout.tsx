import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import AdminSetupBanner from '../../banner/AdminSetupBanner';

const Layout = ( { children, route } ) => {
    return (
        <SlotFillProvider>
            <AdminSetupBanner className="mr-0" />
            { children }
            <PluginArea scope={ 'dokan-admin-dashboard-' + route.id } />
            <DokanToaster />
        </SlotFillProvider>
    );
};

export default Layout;
