import { addFilter } from '@wordpress/hooks';
import type { SettingsElement } from '@wedevs/plugin-ui';
import ImageField from './fields/ImageField';
import AddressFields from './fields/AddressFields';
import MapField from './fields/MapField';
import StoreScheduleField from './fields/StoreScheduleField';

/**
 * Registers the vendor-settings custom field variants with the plugin-ui
 * renderer. The Store page mounts `<Settings hookPrefix="dokan_vendor">`, so
 * plugin-ui resolves each variant through
 * `dokan_vendor_settings_<variant>_field` — Pro overrides/extends via the
 * same hook names from its own bundle.
 *
 * Call exactly once from module scope (NOT inside a component) —
 * `@wordpress/hooks` does not dedupe repeated registrations.
 */
export function registerVendorSettingsFields(): void {
    addFilter(
        'dokan_vendor_settings_vendor_image_field',
        'dokan-lite/vendor-image',
        ( _defaultComponent: unknown, element: SettingsElement ) => (
            <ImageField element={ element } />
        )
    );

    addFilter(
        'dokan_vendor_settings_vendor_address_field',
        'dokan-lite/vendor-address',
        ( _defaultComponent: unknown, element: SettingsElement ) => (
            <AddressFields element={ element } />
        )
    );

    addFilter(
        'dokan_vendor_settings_vendor_map_field',
        'dokan-lite/vendor-map',
        ( _defaultComponent: unknown, element: SettingsElement ) => (
            <MapField element={ element } />
        )
    );

    addFilter(
        'dokan_vendor_settings_vendor_store_schedule_field',
        'dokan-lite/vendor-store-schedule',
        ( _defaultComponent: unknown, element: SettingsElement ) => (
            <StoreScheduleField element={ element } />
        )
    );
}
