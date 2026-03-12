/**
 * Product Editor shared exports.
 *
 * This barrel file exposes hooks, field-config utilities, layout helpers,
 * and types so that external consumers (e.g. Dokan Pro) can import them
 * via `@dokan/product-editor`.
 *
 * @since DOKAN_SINCE
 */

// Re-export @wordpress/dataviews so external consumers share a single bundle
// (avoids duplicate @wordpress/private-apis registration).
export { DataForm, useFormValidity } from '@wordpress/dataviews';

// Hooks
export { useProductEditor, useInitProductEditor } from './hooks/useProductEditor';
export { default as useLayouts } from './hooks/useLayouts';

// Field config
export { getFieldConfigFrom } from './field-config';
export { getFieldConfig } from './components/FieldRenderer';

// Utils
export {
    getField,
    resolveLabel,
    resolveRequired,
    resolveVisibility,
    getFieldHeading,
    fieldValueForProduct,
    resolveDependency,
    layoutBuilder,
    buildLayoutTree,
    appendToTarget,
    collectUsedFields,
    getRemainingFields,
    injectRemainingFields,
} from './utils';

// Types
export type {
    DependencyCondition,
    FormItem,
    LayoutItem,
    LayoutConfig,
    ResponsiveBreakpoint,
    FieldConfig,
    FieldHandler,
    VariationType,
    Attribute,
    DefaultAttribute,
} from './types';
