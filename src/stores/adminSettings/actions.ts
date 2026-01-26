import { FieldValidationError, SettingsElement } from './types';
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
    setSearchText( searchText: string ) {
        return {
            type: 'SET_SEARCH_TEXT',
            searchText,
        };
    },
    setFieldErrors( errors: FieldValidationError[] ) {
        return {
            type: 'SET_FIELD_ERRORS',
            errors,
        };
    },
    clearFieldErrors() {
        return {
            type: 'CLEAR_FIELD_ERRORS',
        };
    },
    resetSettings() {
        return {
            type: 'RESET_SETTINGS',
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
            dispatch( actions.setSaving( true ) );
            dispatch( actions.clearFieldErrors() );

            try {
                const response = await apiFetch< SettingsElement >( {
                    path: '/dokan/v1/admin/settings',
                    method: 'POST',
                    data: payload,
                } );

                dispatch( actions.setSaving( false ) );
                dispatch( actions.setNeedSaving( false ) );
                dispatch( actions.updateSettings( response ) );
            } catch ( error: any ) {
                dispatch( actions.setSaving( false ) );

                // Handle validation errors
                if ( error?.data?.errors && Array.isArray( error.data.errors ) ) {
                    dispatch( actions.setFieldErrors( error.data.errors ) );
                    dispatch( actions.setNeedSaving( false ) );
                }

                throw error;
            }
        };
    },
};

export default actions;