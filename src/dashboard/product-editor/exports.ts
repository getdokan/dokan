/**
 * Product Editor shared exports.
 *
 * This barrel file exposes hooks, field-config utilities, layout helpers,
 * and types so that external consumers (e.g. Dokan Pro) can import them
 * via `@dokan/product-editor`.
 *
 * @since 5.0.0
 */

// Re-export DataForm from @wedevs/plugin-ui so external consumers share a
// single bundle. WP 6.8 compat (Validated* lock-unlock shim) lives inside
// plugin-ui, not here.
export { DataForm, useFormValidity } from '@wedevs/plugin-ui';

// Hooks
export { useProductEditor, useInitProductEditor } from './hooks/useProductEditor';
export { default as useLayouts } from './hooks/useLayouts';

// Field config
export { getFieldConfigFrom, getFieldConfig } from './field-config';

// Components
export { default as CustomField, getValidationError } from './components/CustomField';

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
    resolveResponsiveLayout,
    injectSectionHeadings,
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
