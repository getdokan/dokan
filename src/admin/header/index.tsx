import { createRoot } from '@wordpress/element';
import { SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import AdminBar from './AdminBar';
import domReady from '@wordpress/dom-ready';

// Register default support button fill.
import './SupportButton';

const HEADER_PLUGIN_SCOPE = 'dokan-admin-header';

domReady( function () {
    const headerRoot = document.getElementById( 'dokan-admin-panel-header' );

    if ( headerRoot ) {
        const root = createRoot( headerRoot );
        root.render(
            <SlotFillProvider>
                <AdminBar />
                <PluginArea scope={ HEADER_PLUGIN_SCOPE } />
            </SlotFillProvider>
        );
    }
} );
