import { SettingsElement } from './types';
import apiFetch from '@wordpress/api-fetch';

const actions = {
    setSettings( settings: SettingsElement[] ) {
        return {
            type: 'SET_SETTINGS',
            settings,
        };
    },
    updateSettings( item: SettingsElement ) {
        return {
            type: 'UPDATE_SETTINGS',
            item,
        };
    },
    updateSettingsValue( item: SettingsElement ) {
        return {
            type: 'UPDATE_SETTINGS_VALUE',
            item,
        };
    },
    setLoading( loading: boolean ) {
        return {
            type: 'SET_LOADING',
            loading,
        };
    },
    setSaving( saving: boolean ) {
        return {
            type: 'SET_SAVING',
            saving,
        };
    },
    setNeedSaving( needSaving: boolean ) {
        return {
            type: 'SET_NEED_SAVING',
            needSaving,
        };
    },
    fetchSettings() {
        return async ( { dispatch } ) => {
            dispatch( actions.setLoading( true ) );
            const response = await apiFetch< any >( {
                path: '/dokan/v1/admin/settings',
            } );
            dispatch( actions.setLoading( false ) );
            dispatch( actions.setSettings( response ) );
        };
    },
    saveSettings( payload: SettingsElement ) {
        return async ( { dispatch } ) => {
            actions.setSaving( true );
            const response = await apiFetch< SettingsElement >( {
                path: '/dokan/v1/admin/settings',
                method: 'POST',
                data: payload,
            } );

            dispatch( actions.setSaving( false ) );
            dispatch( actions.setNeedSaving( false ) );
            dispatch( actions.updateSettings( response ) );
        };
    },
};

export default actions;
