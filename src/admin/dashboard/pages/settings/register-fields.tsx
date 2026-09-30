import { addFilter } from '@wordpress/hooks';
import type { SettingsElement } from '@wedevs/plugin-ui';
import DokanVendorInfoPreview from './fields/DokanVendorInfoPreview';
import DokanSingleProductPreview from './fields/DokanSingleProductPreview';
import DokanDoubleInput from './fields/DokanDoubleInput';
import DokanRepeaterField from './fields/DokanRepeaterField';
import DokanCombineInput from './fields/commission-fields/DokanCombineInput';
import DokanCategoryBasedCommission from './fields/commission-fields/DokanCategoryBasedCommission';
import DokanCommissionInheritanceSwitch from './fields/commission-fields/DokanCommissionInheritanceSwitch';

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
            if ( element.id === 'vendor_info_visibility' ) {
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

    // Editable, reorderable list for any `variant: 'repeater'` field.
    addFilter(
        'dokan_settings_repeater_field',
        'dokan-lite/repeater',
        ( _defaultComponent: React.ReactNode, element: SettingsElement ) => (
            <DokanRepeaterField element={ element } />
        )
    );

    // Admin "fixed" commission: percentage + flat fee in one widget.
    addFilter(
        'dokan_settings_combine_input_field',
        'dokan-lite/combine-input',
        ( _defaultComponent: React.ReactNode, element: SettingsElement ) => (
            <DokanCombineInput element={ element } />
        )
    );

    // Per-category commission table (loads its own category tree).
    addFilter(
        'dokan_settings_category_based_commission_field',
        'dokan-lite/category-based-commission',
        ( _defaultComponent: React.ReactNode, element: SettingsElement ) => (
            <DokanCategoryBasedCommission element={ element } />
        )
    );

    // Gate the generic switch filter to the inheritance toggle (confirmation modal); others keep the default.
    addFilter(
        'dokan_settings_switch_field',
        'dokan-lite/commission-inheritance-switch',
        ( defaultComponent: React.ReactNode, element: SettingsElement ) =>
            element.id === 'reset_sub_category_when_edit_all_category' ? (
                <DokanCommissionInheritanceSwitch element={ element } />
            ) : (
                defaultComponent
            )
    );

    // Add additional Dokan-unique field renderers here. The pattern is:
    //   addFilter(
    //       'dokan_settings_<variant>_field',
    //       'dokan-lite/<variant>',
    //       ( _default, element ) => <SomeComponent element={ element } />
    //   );
}
