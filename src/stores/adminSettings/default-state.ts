import { SettingsState } from './types';

const SETTINGS_DEFAULT_STATE: SettingsState = {
    settings: [],
    originalSettings: [],
    dependencies: [],
    validations: [],
    loading: true,
    saving: false,
    needSaving: false,
    hasValidationErrors: false,
    searchText: '',
    changedElements: {},
};

export default SETTINGS_DEFAULT_STATE;