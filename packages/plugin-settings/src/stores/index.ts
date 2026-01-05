import { createReduxStore, register } from '@wordpress/data';
import { createActions } from './actions';
import reducer from './reducer';
import selectors from './selectors';
import { createResolvers } from './resolvers';
import type { StoreConfig, SettingsValue } from '../types';

// Store registry to keep track of registered stores.
const registeredStores: Map< string, ReturnType< typeof createReduxStore > > =
    new Map();

/**
 * Create a settings store with the given configuration.
 *
 * @param config - Store configuration options.
 * @returns The created Redux store.
 */
export function createSettingsStore( config: StoreConfig ) {
    const { storeName, restEndpoint } = config;

    const store = createReduxStore( storeName, {
        reducer,
        actions: createActions( restEndpoint ),
        selectors,
        resolvers: createResolvers( restEndpoint ),
    } );

    // Register the store with WordPress data.
    register( store );
    registeredStores.set( storeName, store );

    return store;
}

/**
 * Register a settings store with simplified API.
 *
 * @param storeName - Name of the store.
 * @param options   - Store options including REST endpoint and initial data.
 * @returns The created Redux store.
 */
export function registerStore(
    storeName: string,
    options: {
        restEndpoint: string;
        initialData?: Record< string, SettingsValue >;
    }
) {
    // Check if store already exists.
    if ( registeredStores.has( storeName ) ) {
        return registeredStores.get( storeName );
    }

    return createSettingsStore( {
        storeName,
        restEndpoint: options.restEndpoint,
    } );
}

/**
 * Get a registered store by name.
 *
 * @param storeName - Name of the store.
 * @returns The store or undefined if not found.
 */
export function getStore( storeName: string ) {
    return registeredStores.get( storeName );
}

export { default as selectors } from './selectors';
export { createActions } from './actions';
export { createResolvers } from './resolvers';
export { default as reducer } from './reducer';
export { default as SETTINGS_DEFAULT_STATE } from './default-state';

