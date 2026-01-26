import SETTINGS_DEFAULT_STATE from './default-state';
import settingsDependencyApplicator from '../../admin/dashboard/utils/settingsDependencyApplicator';
import settingsDependencyParser from '../../admin/dashboard/utils/settingsDependencyParser';
import settingsElementFinderReplacer from '../../admin/dashboard/utils/settingsElementFinderReplacer';
import settingsSearchApplicator from '../../admin/dashboard/utils/settingsSearchApplicator';
import { SettingsElement } from './types';

// Helper function to find an element by hook_key in nested settings
const findElementByHookKey = (
    settings: SettingsElement[],
    hookKey: string
): SettingsElement | undefined => {
    for ( const setting of settings ) {
        if ( setting.hook_key === hookKey ) {
            return setting;
        }
        if ( setting.children && setting.children.length > 0 ) {
            const found = findElementByHookKey( setting.children, hookKey );
            if ( found ) {
                return found;
            }
        }
    }
    return undefined;
};

const reducer = ( state = SETTINGS_DEFAULT_STATE, action ) => {
    switch ( action.type ) {
        case 'SET_SETTINGS':
            return {
                ...state,
                dependencies: [
                    ...settingsDependencyParser( [ ...action.settings ] ),
                ],
                settings: [
                    ...settingsDependencyApplicator(
                        [ ...action.settings ],
                        settingsDependencyParser( [ ...action.settings ] )
                    ),
                ],
                // Deep copy to prevent mutation from affecting original settings
                originalSettings: JSON.parse( JSON.stringify( action.settings ) ),
                // Clear field errors when settings are loaded/reloaded
                fieldErrors: [],
            };

        case 'UPDATE_SETTINGS':
            return {
                ...state,
                settings: [
                    ...state.settings.map( ( item ) =>
                        item.id === action.item.id ? action.item : item
                    ),
                ],
            };

        case 'UPDATE_SETTINGS_VALUE':
            // Track the original element if not already tracked
            const changedHookKey = action.item.hook_key;
            const newChangedElements = { ...state.changedElements };

            // Only store the original if we haven't tracked this element yet
            if ( ! newChangedElements[ changedHookKey ] ) {
                const originalElement = findElementByHookKey(
                    state.originalSettings,
                    changedHookKey
                );
                if ( originalElement ) {
                    // Deep copy to prevent mutation
                    newChangedElements[ changedHookKey ] = JSON.parse(
                        JSON.stringify( originalElement )
                    );
                }
            }

            const updatedSettings = [
                ...settingsElementFinderReplacer(
                    [ ...state.settings ],
                    action.item
                ),
            ];
            const updatedDependencies = [
                ...settingsDependencyParser( [ ...updatedSettings ] ),
            ];
            return {
                ...state,
                dependencies: [ ...updatedDependencies ],
                settings: [
                    ...settingsDependencyApplicator(
                        [ ...updatedSettings ],
                        updatedDependencies
                    ),
                ],
                needSaving: true,
                changedElements: newChangedElements,
            };

        case 'SET_LOADING':
            return {
                ...state,
                loading: action.loading,
            };

        case 'SET_SAVING':
            return {
                ...state,
                saving: action.saving,
            };

        case 'SET_NEED_SAVING':
            return {
                ...state,
                needSaving: action.needSaving,
            };

        case 'SET_SEARCH_TEXT':
            if ( ! action.searchText.trim() ) {
                const restoredSettings = settingsDependencyApplicator(
                    [ ...state.originalSettings ],
                    [ ...state.dependencies ]
                );
                return {
                    ...state,
                    searchText: action.searchText,
                    settings: restoredSettings,
                };
            }

            const baseSettingsWithDependencies = settingsDependencyApplicator(
                [ ...state.originalSettings ],
                [ ...state.dependencies ]
            );
            
            const searchFilteredSettings = settingsSearchApplicator(
                baseSettingsWithDependencies,
                action.searchText
            );

            return {
                ...state,
                searchText: action.searchText,
                settings: searchFilteredSettings,
            };

        case 'RESET_SETTINGS':
            // If no changes were made, just reset needSaving and clear errors
            if ( Object.keys( state.changedElements ).length === 0 ) {
                return {
                    ...state,
                    needSaving: false,
                    fieldErrors: [], // Clear field errors on reset
                };
            }

            // Reset only the changed elements back to their original values
            let restoredSettings = [ ...state.settings ];
            Object.values( state.changedElements ).forEach(
                ( originalElement ) => {
                    restoredSettings = settingsElementFinderReplacer(
                        restoredSettings,
                        originalElement
                    );
                }
            );

            // Re-parse and apply dependencies after restoring
            const resetDependencies = settingsDependencyParser( restoredSettings );
            const resetSettings = settingsDependencyApplicator(
                restoredSettings,
                resetDependencies
            );

            return {
                ...state,
                dependencies: resetDependencies,
                settings: resetSettings,
                needSaving: false,
                changedElements: {}, // Clear tracked changes
                fieldErrors: [], // Clear field errors on reset
            };

        case 'SET_FIELD_ERRORS':
            // When there are validation errors, hide the save button
            return {
                ...state,
                fieldErrors: action.errors,
                needSaving:
                    action.errors.length > 0
                        ? false
                        : Object.keys( state.changedElements ).length > 0,
            };

        case 'CLEAR_FIELD_ERRORS':
            // When errors are cleared, show save button if there are changes
            return {
                ...state,
                fieldErrors: [],
                needSaving: Object.keys( state.changedElements ).length > 0,
            };
    }

    return state;
};

export default reducer;