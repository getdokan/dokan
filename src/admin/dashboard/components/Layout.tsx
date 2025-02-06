import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { DokanToaster } from '@getdokan/dokan-ui';
import Header from './Header';

const Layout = ( { children, route } ) => {
    return (
        <SlotFillProvider>
            <Header />
            { children }
            <PluginArea scope={ 'dokan-admin-dashboard' + route.id } />
            <DokanToaster />
        </SlotFillProvider>
    );
};

export default Layout;
