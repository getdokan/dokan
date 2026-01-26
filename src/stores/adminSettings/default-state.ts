import { SettingsState } from './types';

const SETTINGS_DEFAULT_STATE: SettingsState = {
    settings: [],
    originalSettings: [],
    dependencies: [],
    loading: true,
    saving: false,
    needSaving: false,
    searchText: '',
    changedElements: {},
    fieldErrors: [],
};

export default SETTINGS_DEFAULT_STATE;