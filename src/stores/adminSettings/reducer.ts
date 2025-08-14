import SETTINGS_DEFAULT_STATE from './default-state';
import settingsDependencyApplicator from '../../admin/dashboard/utils/settingsDependencyApplicator';
import settingsDependencyParser from '../../admin/dashboard/utils/settingsDependencyParser';
import settingsElementFinderReplacer from '../../admin/dashboard/utils/settingsElementFinderReplacer';
import settingsSearchApplicator from '../../admin/dashboard/utils/settingsSearchApplicator';

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
            // First apply dependencies to get clean base state, then apply search filtering
            const baseSettingsWithDependencies = settingsDependencyApplicator(
                [ ...state.settings ],
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