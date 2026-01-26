import { SettingsElement, SettingsState } from './types';

const getSettingInChildren = (
    id: string,
    settings: SettingsElement[]
): SettingsElement | undefined => {
    for ( const setting of settings ) {
        if ( setting.hook_key === id ) {
            return setting;
        }
        if ( setting.children ) {
            const found = getSettingInChildren( id, setting.children );
            if ( found ) {
                return found;
            }
        }
    }
    return undefined;
};

const selectors = {
    getSettings( state: SettingsState, key?: string ) {
        const { settings } = state;
        if ( key ) {
            return settings.find( ( setting ) => setting.id === key );
        }
        return settings;
    },

    getSettingById( state: SettingsState, id: string ) {
        const { settings } = state;
        return getSettingInChildren( id, settings );
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

    getSearchText( state: SettingsState ) {
        const { searchText } = state;
        return searchText;
    },

    getOriginalSettings( state: SettingsState ) {
        const { originalSettings } = state;
        return originalSettings;
    },

    getFieldErrors( state: SettingsState ) {
        const { fieldErrors } = state;
        return fieldErrors || [];
    },

    getFieldError( state: SettingsState, hookKey: string ) {
        const { fieldErrors } = state;
        return fieldErrors?.find( ( error ) => error.hook_key === hookKey );
    },

    hasFieldErrors( state: SettingsState ) {
        const { fieldErrors } = state;
        return fieldErrors && fieldErrors.length > 0;
    },
};
export default selectors;
