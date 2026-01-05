import type { SettingsState } from '../types';

/**
 * Default settings state.
 */
const SETTINGS_DEFAULT_STATE: SettingsState = {
    settings: [],
    originalSettings: [],
    dependencies: [],
    loading: false,
    saving: false,
    needSaving: false,
    searchText: '',
    error: null,
};

export default SETTINGS_DEFAULT_STATE;

