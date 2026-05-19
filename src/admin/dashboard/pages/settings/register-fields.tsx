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
    // Inject the vendor SVG preview into plugin-ui's `info_preview` field.
    // Scopes by element id so this filter only fires for the vendor visibility
    // setting and leaves other info_preview fields with their default behavior.
    addFilter(
        'dokan_settings_info_preview_field_preview',
        'dokan-lite/vendor-info-preview',
        (
            defaultPreview: React.ReactNode,
            element: SettingsElement,
            value: Record< string, boolean >
        ) => {
            if ( element.id !== 'vendor_info_visibility' ) {
                return defaultPreview;
            }
            return (
                <DokanVendorInfoPreview
                    showEmail={ Boolean( value?.store_email ) }
                    showPhone={ Boolean( value?.store_phone ) }
                    showAddress={ Boolean( value?.store_address ) }
                />
            );
        }
    );

    addFilter(
        'dokan_settings_single_product_preview_field',
        'dokan-lite/single-product-preview',
        ( _defaultComponent: React.ReactNode, element: SettingsElement ) => (
            <DokanSingleProductPreview element={ element } />
        )
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
