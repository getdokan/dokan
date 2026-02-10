import SETTINGS_DEFAULT_STATE from './default-state';
import settingsDependencyApplicator from '../../admin/dashboard/utils/settingsDependencyApplicator';
import settingsDependencyParser from '../../admin/dashboard/utils/settingsDependencyParser';
import settingsElementFinderReplacer from '../../admin/dashboard/utils/settingsElementFinderReplacer';
import settingsElementFinder from '../../admin/dashboard/utils/settingsElementFinder';
import settingsSearchApplicator from '../../admin/dashboard/utils/settingsSearchApplicator';
import settingsValidationParser from '../../admin/dashboard/utils/settingsValidationParser';
import settingsValidationApplicator from '../../admin/dashboard/utils/settingsValidationApplicator';

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
                originalSettings: [ ...action.settings ],
                changedElements: {},
                hasValidationErrors: false,
                needSaving: false,
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
            // Track changed elements for RESET_SETTINGS
            const changedElements = { ...state.changedElements };
            if ( ! changedElements[ action.item.hook_key ] ) {
                const originalElement = settingsElementFinder(
                    [ ...state.settings ],
                    action.item.hook_key
                );
                if ( originalElement ) {
                    changedElements[ action.item.hook_key ] = originalElement;
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
            const settingsWithDependencies = [
                ...settingsDependencyApplicator(
                    [ ...updatedSettings ],
                    updatedDependencies
                ),
            ];

            // Apply validations
            const settingsDependencies = [ ...settingsWithDependencies ];
            const validations =
                settingsValidationParser( settingsDependencies );
            const { settings: validatedSettings, hasErrors } =
                settingsValidationApplicator(
                    settingsDependencies,
                    validations
                );

            // Check if any of the changed elements have validation errors
            const changedHookKeys = [
                ...Object.keys( changedElements ),
                action.item.hook_key,
            ];
            const hasErrorsInChangedElements = changedHookKeys.some(
                ( hookKey ) =>
                    settingsElementFinder( validatedSettings, hookKey )
                        ?.validationError
            );

            return {
                ...state,
                dependencies: [ ...updatedDependencies ],
                validations: [ ...validations ],
                settings: [ ...validatedSettings ],
                needSaving: ! hasErrorsInChangedElements,
                hasValidationErrors: hasErrors,
                changedElements,
            };

        case 'RESET_SETTINGS':
            // If no changes were made, just reset needSaving and clear errors
            if ( Object.keys( state.changedElements ).length === 0 ) {
                return {
                    ...state,
                    needSaving: false,
                    hasValidationErrors: false,
                };
            }

            // Reset only the changed elements back to their original values
            let restoredSettings = [ ...state.settings ];
            Object.values( state.changedElements ).forEach(
                ( originalElement ) => {
                    restoredSettings = settingsElementFinderReplacer(
                        restoredSettings,
                        { ...originalElement, validationError: '' }
                    );
                }
            );

            // Re-parse and apply dependencies after restoring
            const resetDependencies =
                settingsDependencyParser( restoredSettings );
            const resetSettings = settingsDependencyApplicator(
                restoredSettings,
                resetDependencies
            );

            // Re-parse and apply validations after restoring
            const resetValidations = settingsValidationParser( resetSettings );
            const { settings: finalSettings, hasErrors: resetHasErrors } =
                settingsValidationApplicator(
                    [ ...resetSettings ],
                    resetValidations
                );

            return {
                ...state,
                dependencies: resetDependencies,
                validations: resetValidations,
                settings: finalSettings,
                needSaving: false,
                changedElements: {}, // Clear tracked changes
                hasValidationErrors: resetHasErrors,
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
                const searchRestoredSettings = settingsDependencyApplicator(
                    [ ...state.originalSettings ],
                    [ ...state.dependencies ]
                );
                return {
                    ...state,
                    searchText: action.searchText,
                    settings: searchRestoredSettings,
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
    }

    return state;
};

export default reducer;
