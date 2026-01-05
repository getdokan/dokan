import type { SettingsState, SettingsElement, SettingsElementDependency } from '../types';

/**
 * Settings store selectors.
 */
const selectors = {
    /**
     * Get all settings.
     */
    getSettings( state: SettingsState ): SettingsElement[] {
        return state.settings;
    },

    /**
     * Get original settings (before modifications).
     */
    getOriginalSettings( state: SettingsState ): SettingsElement[] {
        return state.originalSettings;
    },

    /**
     * Get all dependencies.
     */
    getDependencies( state: SettingsState ): SettingsElementDependency[] {
        return state.dependencies;
    },

    /**
     * Get loading state.
     */
    getLoading( state: SettingsState ): boolean {
        return state.loading;
    },

    /**
     * Get saving state.
     */
    getSaving( state: SettingsState ): boolean {
        return state.saving;
    },

    /**
     * Get need saving flag.
     */
    getNeedSaving( state: SettingsState ): boolean {
        return state.needSaving;
    },

    /**
     * Get search text.
     */
    getSearchText( state: SettingsState ): string {
        return state.searchText;
    },

    /**
     * Get error message.
     */
    getError( state: SettingsState ): string | null {
        return state.error;
    },

    /**
     * Get a specific setting by ID.
     */
    getSettingById( state: SettingsState, id: string ): SettingsElement | undefined {
        const findById = ( elements: SettingsElement[] ): SettingsElement | undefined => {
            for ( const element of elements ) {
                if ( element.id === id ) {
                    return element;
                }
                if ( element.children ) {
                    const found = findById( element.children );
                    if ( found ) {
                        return found;
                    }
                }
            }
            return undefined;
        };

        return findById( state.settings );
    },

    /**
     * Get settings by type.
     */
    getSettingsByType( state: SettingsState, type: string ): SettingsElement[] {
        const filterByType = ( elements: SettingsElement[] ): SettingsElement[] => {
            const result: SettingsElement[] = [];

            for ( const element of elements ) {
                if ( element.type === type ) {
                    result.push( element );
                }
                if ( element.children ) {
                    result.push( ...filterByType( element.children ) );
                }
            }

            return result;
        };

        return filterByType( state.settings );
    },
};

export default selectors;

