import { User } from '@wordpress/core-data';

const actions = {
    /**
     * Set the current user.
     *
     * @param {User} user The user object.
     */
    setCurrentUser: ( user: User ) => ( {
        type: 'SET_CURRENT_USER',
        payload: user,
    } ),

    /**
     * Set the store settings.
     *
     * @param {any} settings The store settings.
     */
    setStoreSettings: ( settings: any ) => ( {
        type: 'SET_STORE_SETTINGS',
        payload: settings,
    } ),

    /**
     * Set the global settings.
     *
     * @param {any} settings The global settings.
     */
    setGlobalSettings: ( settings: any ) => ( {
        type: 'SET_GLOBAL_SETTINGS',
        payload: settings,
    } ),
};

export default actions;
