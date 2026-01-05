import SETTINGS_DEFAULT_STATE from './default-state';
import type { SettingsState, SettingsElement, SettingsElementDependency } from '../types';
import {
    parseDependencies,
    applyDependencies,
    findAndReplaceElement,
    applySearch,
} from '../utils';

type SettingsAction =
    | { type: 'SET_SETTINGS'; settings: SettingsElement[] }
    | { type: 'UPDATE_SETTINGS'; item: SettingsElement }
    | { type: 'UPDATE_SETTINGS_VALUE'; item: SettingsElement }
    | { type: 'SET_LOADING'; loading: boolean }
    | { type: 'SET_SAVING'; saving: boolean }
    | { type: 'SET_NEED_SAVING'; needSaving: boolean }
    | { type: 'SET_SEARCH_TEXT'; searchText: string }
    | { type: 'SET_ERROR'; error: string | null };

/**
 * Settings store reducer.
 */
function reducer( state: SettingsState = SETTINGS_DEFAULT_STATE, action: SettingsAction ): SettingsState {
    switch ( action.type ) {
        case 'SET_SETTINGS': {
            const dependencies = parseDependencies( [ ...action.settings ] );
            return {
                ...state,
                dependencies: [ ...dependencies ],
                settings: [
                    ...applyDependencies(
                        [ ...action.settings ],
                        dependencies
                    ),
                ],
                originalSettings: [ ...action.settings ],
            };
        }

        case 'UPDATE_SETTINGS': {
            return {
                ...state,
                settings: [
                    ...state.settings.map( ( item ) =>
                        item.id === action.item.id ? action.item : item
                    ),
                ],
            };
        }

        case 'UPDATE_SETTINGS_VALUE': {
            const updatedSettings = [
                ...findAndReplaceElement(
                    [ ...state.settings ],
                    action.item
                ),
            ];
            const updatedDependencies = [
                ...parseDependencies( [ ...updatedSettings ] ),
            ];
            return {
                ...state,
                dependencies: [ ...updatedDependencies ],
                settings: [
                    ...applyDependencies(
                        [ ...updatedSettings ],
                        updatedDependencies
                    ),
                ],
                needSaving: true,
            };
        }

        case 'SET_LOADING': {
            return {
                ...state,
                loading: action.loading,
            };
        }

        case 'SET_SAVING': {
            return {
                ...state,
                saving: action.saving,
            };
        }

        case 'SET_NEED_SAVING': {
            return {
                ...state,
                needSaving: action.needSaving,
            };
        }

        case 'SET_SEARCH_TEXT': {
            if ( ! action.searchText.trim() ) {
                const restoredSettings = applyDependencies(
                    [ ...state.originalSettings ],
                    [ ...state.dependencies ]
                );
                return {
                    ...state,
                    searchText: action.searchText,
                    settings: restoredSettings,
                };
            }

            const baseSettingsWithDependencies = applyDependencies(
                [ ...state.originalSettings ],
                [ ...state.dependencies ]
            );

            const searchFilteredSettings = applySearch(
                baseSettingsWithDependencies,
                action.searchText
            );

            return {
                ...state,
                searchText: action.searchText,
                settings: searchFilteredSettings,
            };
        }

        case 'SET_ERROR': {
            return {
                ...state,
                error: action.error,
            };
        }

        default:
            return state;
    }
}

export default reducer;

