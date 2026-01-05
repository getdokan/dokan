/**
 * Dokan Settings Page v2 (Using plugin-settings package)
 *
 * This demonstrates how to use the plugin-settings package's
 * components and store in Dokan.
 */

import { __ } from '@wordpress/i18n';
import {
    SettingsPage,
    SettingsProvider,
    Menu,
    Tab,
    PageHeading,
    SettingsParser,
    registerStore,
} from '@wedevs/plugin-settings';

// Register custom field types specific to Dokan
import { registerField } from '@wedevs/plugin-settings/fields';
import { DokanColorPicker } from './fields/DokanColorPicker';
import { DokanImageUpload } from './fields/DokanImageUpload';
import { DokanPageSelect } from './fields/DokanPageSelect';

// Register Dokan-specific field types
registerField( 'dokan-color-picker', DokanColorPicker );
registerField( 'dokan-image-upload', DokanImageUpload );
registerField( 'dokan-page-select', DokanPageSelect );

/**
 * Store configuration for Dokan admin settings.
 */
const STORE_NAME = 'dokan/admin-settings';
const REST_ENDPOINT = '/dokan/v1/admin/settings';

// Register the store with Dokan-specific configuration
registerStore( STORE_NAME, {
    restEndpoint: REST_ENDPOINT,
    initialData: window.dokanAdminSettings?.settings || {},
} );

/**
 * Settings Page Component
 *
 * Uses the plugin-settings package components with Dokan customizations.
 */
const Settings = () => {
    return (
        <SettingsProvider storeName={ STORE_NAME }>
            <SettingsPage
                title={ __( 'Dokan Settings', 'dokan-lite' ) }
                saveButtonText={ __( 'Save Changes', 'dokan-lite' ) }
                className="dokan-settings-page"
                renderMenu={ ( { pages, activePage, onPageChange } ) => (
                    <Menu
                        pages={ pages }
                        activePage={ activePage }
                        onPageChange={ onPageChange }
                        className="dokan-settings-menu"
                    />
                ) }
                renderTabs={ ( { tabs, activeTab, onTabChange } ) => (
                    <Tab
                        tabs={ tabs }
                        activeTab={ activeTab }
                        onTabChange={ onTabChange }
                        className="dokan-settings-tabs"
                    />
                ) }
                renderHeading={ ( { title, description, docLink } ) => (
                    <PageHeading
                        title={ title }
                        description={ description }
                        docLink={ docLink }
                        docLinkText={ __( 'Documentation', 'dokan-lite' ) }
                        className="dokan-settings-heading"
                    />
                ) }
                renderContent={ ( { elements, values, onChange } ) => (
                    <SettingsParser
                        elements={ elements }
                        values={ values }
                        onChange={ onChange }
                        className="dokan-settings-content"
                    />
                ) }
                onSaveSuccess={ () => {
                    // Show Dokan success notice
                    if ( window.dokan ) {
                        window.dokan.showToast(
                            __( 'Settings saved successfully!', 'dokan-lite' ),
                            'success'
                        );
                    }
                } }
                onSaveError={ ( error ) => {
                    // Show Dokan error notice
                    if ( window.dokan ) {
                        window.dokan.showToast(
                            error.message ||
                                __( 'Failed to save settings.', 'dokan-lite' ),
                            'error'
                        );
                    }
                } }
            />
        </SettingsProvider>
    );
};

export default Settings;

