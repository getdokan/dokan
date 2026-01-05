import apiFetch from '@wordpress/api-fetch';
import type { SettingsElement } from '../types';

/**
 * Create resolvers for the settings store.
 *
 * @param restEndpoint - The REST API endpoint for settings.
 */
export function createResolvers( restEndpoint: string ) {
    return {
        /**
         * Resolve settings by fetching from API.
         */
        *getSettings() {
            yield { type: 'SET_LOADING', loading: true };

            try {
                const response: SettingsElement[] = yield apiFetch( {
                    path: restEndpoint,
                } );

                yield { type: 'SET_SETTINGS', settings: response };
            } catch ( error ) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
                yield { type: 'SET_ERROR', error: errorMessage };
            } finally {
                yield { type: 'SET_LOADING', loading: false };
            }
        },
    };
}

export type SettingsResolvers = ReturnType< typeof createResolvers >;

