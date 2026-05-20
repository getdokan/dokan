import { addFilter } from '@wordpress/hooks';
import type { SettingsElement } from '@wedevs/plugin-ui';
import DokanVendorInfoPreview from './fields/DokanVendorInfoPreview';
import DokanSingleProductPreview from './fields/DokanSingleProductPreview';
import DokanDoubleInput from './fields/DokanDoubleInput';

/**
 * Registers Dokan-specific field renderers with plugin-ui's filter system.
 *
 * Plugin-ui fires `dokan_settings_<variant>_field` for every schema element
 * (hookPrefix on `<Settings>` is `"dokan"`, so plugin-ui's
 * `${prefix}_settings_${variant}_field` template resolves to that name).
 * Adding a filter for a variant makes plugin-ui hand off rendering for that
 * variant to our component instead of its built-in or `FallbackField`.
 *
 * Call once per JS context (from the SettingsPage entry, at module load).
 * `@wordpress/hooks` does NOT dedupe by namespace, so calling this multiple
 * times stacks duplicate handlers — keep callers to a single invocation.
 */
export function registerSettingsFields(): void {
    // Inject Dokan-specific SVG previews into plugin-ui's `info_preview` field.
    // Dispatches by element id so each schema-driven info_preview field can
    // contribute its own dynamic mock without re-implementing the field.
    addFilter(
        'dokan_settings_info_preview_field_preview',
        'dokan-lite/info-preview',
        (
            defaultPreview: React.ReactNode,
            element: SettingsElement,
            value: Record< string, boolean >
        ) => {
            if ( element.id === 'store_page_vendor_info_visibility' ) {
                return (
                    <DokanVendorInfoPreview
                        showEmail={ Boolean( value?.store_email ) }
                        showPhone={ Boolean( value?.store_phone ) }
                        showAddress={ Boolean( value?.store_address ) }
                    />
                );
            }
            if ( element.id === 'single_product_page_appearance' ) {
                return (
                    <DokanSingleProductPreview
                        showVendorInfo={ Boolean( value?.vendor_info ) }
                        showMoreProductsTab={ Boolean(
                            value?.more_products_tab
                        ) }
                        showShippingTab={ Boolean( value?.shipping_tab ) }
                    />
                );
            }
            return defaultPreview;
        }
    );

    addFilter(
        'dokan_settings_double_input_field',
        'dokan-lite/double-input',
        ( _defaultComponent: React.ReactNode, element: SettingsElement ) => (
            <DokanDoubleInput element={ element } />
        )
    );

    // Add additional Dokan-unique field renderers here. The pattern is:
    //   addFilter(
    //       'dokan_settings_<variant>_field',
    //       'dokan-lite/<variant>',
    //       ( _default, element ) => <SomeComponent element={ element } />
    //   );
}
