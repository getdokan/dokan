import { addFilter } from '@wordpress/hooks';
import type { SettingsElement } from '@wedevs/plugin-ui';
import VendorNumberField from './fields/VendorNumberField';
import VendorMultiSelectField from './fields/VendorMultiSelectField';
import ImageField from './fields/ImageField';
import AddressFields from './fields/AddressFields';
import MapField from './fields/MapField';
import StoreScheduleField from './fields/StoreScheduleField';
import StoreLocationsField from './fields/StoreLocationsField';
import VendorRadioField from './fields/VendorRadioField';
import VacationHistoryField from './fields/VacationHistoryField';
import CompanyBankField from './fields/CompanyBankField';

type FieldComponent = ( props: { element: SettingsElement } ) => JSX.Element;

// The custom variants the Store page adds on top of plugin-ui's built-in text,
// number, textarea, rich_text and switch fields — the composite and picker
// controls the built-ins don't cover. Keyed by variant slug.
const CUSTOM_VARIANTS: Record< string, FieldComponent > = {
    vendor_number: VendorNumberField,
    vendor_multiselect: VendorMultiSelectField,
    vendor_image: ImageField,
    vendor_address: AddressFields,
    vendor_map: MapField,
    vendor_store_schedule: StoreScheduleField,
    vendor_store_locations: StoreLocationsField,
    vendor_radio: VendorRadioField,
    vendor_vacation_history: VacationHistoryField,
    vendor_company_bank: CompanyBankField,
};

/**
 * Register the Store page's custom field variants with the plugin-ui renderer.
 *
 * The page mounts `<Settings hookPrefix="dokan_vendor">`, so plugin-ui resolves
 * each variant through `dokan_vendor_settings_<variant>_field` — Pro overrides
 * or extends any of them via the same hook name from its own bundle.
 *
 * Call exactly once from module scope (NOT inside a component): `@wordpress/hooks`
 * does not dedupe repeated registrations.
 */
export function registerVendorSettingsFields(): void {
    Object.entries( CUSTOM_VARIANTS ).forEach( ( [ variant, Component ] ) => {
        addFilter(
            `dokan_vendor_settings_${ variant }_field`,
            `dokan-lite/${ variant }`,
            ( _default: unknown, element: SettingsElement ) => (
                <Component element={ element } />
            )
        );
    } );
}
