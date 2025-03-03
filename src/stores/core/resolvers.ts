import { store } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';

/**
 * Resolvers for the core store.
 */
const resolvers = {
    /**
     * Get the current user.
     */
    getCurrentUser:
        () =>
        async ( { registry, dispatch } ) => {
            const user = await registry.resolveSelect( store ).getCurrentUser();
            const userResponse = await registry
                .resolveSelect( store )
                .getUser( user.id );
            return dispatch.setCurrentUser( userResponse );
        },

    /**
     * Check current user has the capabilities or not.
     *
     * @param {string} capability The capability to check.
     */
    hasCap:
        ( capability: string ) =>
        async ( { resolveSelect } ) => {
            if ( ! capability ) {
                return false;
            }

            return await resolveSelect.getCurrentUser();
        },

    /**
     * Get the store settings.
     */
    getStoreSettings:
        () =>
        async ( { dispatch } ) => {
            const settings = await apiFetch( {
                path: '/dokan/v1/settings',
            } );

            dispatch.setStoreSettings( settings );

            return settings;
        },

    /**
     * Get the global settings.
     */
    getGlobalSettings:
        () =>
        async ( { dispatch } ) => {
            // TODO: Need to create a new endpoint for global settings
            const settings = await apiFetch( {
                path: '/dokan/v1/admin/settings',
            } );
            dispatch.setGlobalSettings( settings );
        },

    /**
     * Check if the current user is a vendor.
     */
    isVendor:
        () =>
        async ( { resolveSelect } ) => {
            return await resolveSelect.getCurrentUser();
        },

    /**
     * Check if the current user is a vendor staff.
     */
    isVendorStaff:
        () =>
        async ( { resolveSelect } ) => {
            return await resolveSelect.getCurrentUser();
        },
};

export default resolvers;
