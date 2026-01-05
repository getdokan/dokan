import apiFetch from '@wordpress/api-fetch';
import type { SettingsElement } from '../types';

/**
 * Create actions for the settings store.
 *
 * @param restEndpoint - The REST API endpoint for settings.
 */
export function createActions( restEndpoint: string ) {
    return {
        /**
         * Set settings in the store.
         */
        setSettings( settings: SettingsElement[] ) {
            return {
                type: 'SET_SETTINGS' as const,
                settings,
            };
        },

        /**
         * Update a single settings element.
         */
        updateSettings( item: SettingsElement ) {
            return {
                type: 'UPDATE_SETTINGS' as const,
                item,
            };
        },

        /**
         * Update a settings element value.
         */
        updateSettingsValue( item: SettingsElement ) {
            return {
                type: 'UPDATE_SETTINGS_VALUE' as const,
                item,
            };
        },

        /**
         * Set loading state.
         */
        setLoading( loading: boolean ) {
            return {
                type: 'SET_LOADING' as const,
                loading,
            };
        },

        /**
         * Set saving state.
         */
        setSaving( saving: boolean ) {
            return {
                type: 'SET_SAVING' as const,
                saving,
            };
        },

        /**
         * Set need saving flag.
         */
        setNeedSaving( needSaving: boolean ) {
            return {
                type: 'SET_NEED_SAVING' as const,
                needSaving,
            };
        },

        /**
         * Set search text.
         */
        setSearchText( searchText: string ) {
            return {
                type: 'SET_SEARCH_TEXT' as const,
                searchText,
            };
        },

        /**
         * Set error message.
         */
        setError( error: string | null ) {
            return {
                type: 'SET_ERROR' as const,
                error,
            };
        },

        /**
         * Fetch settings from the API.
         */
        fetchSettings() {
            return async ( { dispatch }: { dispatch: Function } ) => {
                dispatch( { type: 'SET_LOADING', loading: true } );
                dispatch( { type: 'SET_ERROR', error: null } );

                try {
                    const response = await apiFetch< SettingsElement[] >( {
                        path: restEndpoint,
                    } );
                    dispatch( { type: 'SET_SETTINGS', settings: response } );
                } catch ( error ) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
                    dispatch( { type: 'SET_ERROR', error: errorMessage } );
                } finally {
                    dispatch( { type: 'SET_LOADING', loading: false } );
                }
            };
        },

        /**
         * Save settings to the API.
         */
        saveSettings( payload: SettingsElement[] ) {
            return async ( { dispatch }: { dispatch: Function } ) => {
                dispatch( { type: 'SET_SAVING', saving: true } );
                dispatch( { type: 'SET_ERROR', error: null } );

                try {
                    const response = await apiFetch< SettingsElement[] >( {
                        path: restEndpoint,
                        method: 'POST',
                        data: payload,
                    } );

                    dispatch( { type: 'SET_SAVING', saving: false } );
                    dispatch( { type: 'SET_NEED_SAVING', needSaving: false } );
                    dispatch( { type: 'SET_SETTINGS', settings: response } );

                    return response;
                } catch ( error ) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
                    dispatch( { type: 'SET_ERROR', error: errorMessage } );
                    dispatch( { type: 'SET_SAVING', saving: false } );
                    throw error;
                }
            };
        },
    };
}

export type SettingsActions = ReturnType< typeof createActions >;

