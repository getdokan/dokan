/**
 * Re-export types from plugin-settings package for backwards compatibility.
 */
export type {
    SettingsElement,
    SettingsElementDependency,
    SettingsElementOption,
    SettingsValue,
    SettingsState,
    FieldProps,
    SettingsParserProps,
} from '@wedevs/plugin-settings';

/**
 * Backwards compatible type alias.
 */
export type { FieldProps as SettingsProps } from '@wedevs/plugin-settings';

