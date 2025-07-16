import { SettingsState } from './types';

const SETTINGS_DEFAULT_STATE: SettingsState = {
    settings: [],
    dependencies: [],
    loading: true,
    saving: false,
    needSaving: false,
};

export default SETTINGS_DEFAULT_STATE;
