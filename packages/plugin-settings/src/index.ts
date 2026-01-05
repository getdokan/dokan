/**
 * Plugin Settings
 *
 * A reusable WordPress settings framework for building admin settings pages.
 */

// Types
export type {
    SettingsElement,
    SettingsElementDependency,
    SettingsElementOption,
    SettingsValue,
    SettingsState,
    StoreConfig,
    SettingsPageConfig,
    FieldProps,
    SettingsParserProps,
} from './types';

// Store
export {
    createSettingsStore,
    registerStore,
    getStore,
    selectors,
    createActions,
    createResolvers,
    reducer,
    SETTINGS_DEFAULT_STATE,
} from './stores';

// Utils
export {
    parseDependencies,
    applyDependencies,
    findAndReplaceElement,
    applySearch,
} from './utils';

// Components
export {
    SettingsPage,
    SettingsParser,
    SettingsProvider,
    useSettingsContext,
    Menu,
    Tab,
    Section,
    SubSection,
    FieldGroup,
    PageHeading,
    // Field components
    FieldParser,
    TextField,
    NumberField,
    SelectField,
    SwitchField,
    CheckboxField,
    RadioField,
    TextAreaField,
    PasswordField,
    FieldLabel,
    // Field registry
    registerField,
    getField,
} from './components';

