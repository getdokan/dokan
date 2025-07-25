import { SettingsState } from './types';

const selectors = {
    getSettings( state: SettingsState, key?: string ) {
        const { settings } = state;
        if ( key ) {
            return settings.find( ( setting ) => setting.id === key );
        }
        return settings;
    },

    getLoading( state: SettingsState ) {
        const { loading } = state;
        return loading;
    },

    getSaving( state: SettingsState ) {
        const { saving } = state;
        return saving;
    },

    getNeedSaving( state: SettingsState ) {
        const { needSaving } = state;
        return needSaving;
    },
};
export default selectors;
