/**
 * Settings Provider Component
 *
 * Provides settings context to child components.
 */

import { createContext, useContext, useMemo } from '@wordpress/element';
import type { ReactNode } from 'react';

interface SettingsContextValue {
    storeName: string;
}

const SettingsContext = createContext< SettingsContextValue | null >( null );

interface SettingsProviderProps {
    /**
     * The name of the Redux store to use.
     */
    storeName: string;
    /**
     * Child components.
     */
    children: ReactNode;
}

/**
 * Settings Provider Component
 *
 * Wraps child components with settings context, providing access
 * to the settings store name.
 */
export const SettingsProvider = ( {
    storeName,
    children,
}: SettingsProviderProps ) => {
    const value = useMemo(
        () => ( {
            storeName,
        } ),
        [ storeName ]
    );

    return (
        <SettingsContext.Provider value={ value }>
            { children }
        </SettingsContext.Provider>
    );
};

/**
 * Hook to access the settings context.
 *
 * @returns The settings context value.
 * @throws Error if used outside of SettingsProvider.
 */
export const useSettingsContext = (): SettingsContextValue => {
    const context = useContext( SettingsContext );

    if ( ! context ) {
        throw new Error(
            'useSettingsContext must be used within a SettingsProvider'
        );
    }

    return context;
};

export default SettingsProvider;

