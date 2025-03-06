import { CoreState } from '@dokan/definitions/dokan-core';
import { User } from '@wordpress/core-data';

const selectors = {
    /**
     * Get the current user.
     *
     * @param { CoreState } state The current state.
     *
     * @return { User } The current user.
     */
    getCurrentUser( state: CoreState ): User {
        return state.currentUser;
    },

    /**
     * Check current user has the capabilities or not.
     *
     * @param { CoreState } state      The current state.
     * @param {string}      capability The capability to check.
     *
     * @return { boolean| null } If not resolved yet then `null`.
     */
    hasCap( state: CoreState, capability: string ): boolean | null {
        if (
            ! state.currentUser.capabilities ||
            ! state.currentUser.extra_capabilities
        ) {
            return null;
        }

        if ( state.currentUser.capabilities.hasOwnProperty( capability ) ) {
            return JSON.parse( state.currentUser.capabilities[ capability ] );
        }

        if (
            state.currentUser.extra_capabilities.hasOwnProperty( capability )
        ) {
            return JSON.parse(
                state.currentUser.extra_capabilities[ capability ]
            );
        }

        return false;
    },

    /**
     * Check if the current user is a vendor.
     *
     * @param  state
     *
     * @return { boolean } If the current user is a vendor.
     */
    isVendor( state: CoreState ): boolean {
        return (
            state.currentUser.roles.includes( 'vendor' ) ||
            ( state.currentUser.roles.includes( 'administrator' ) &&
                JSON.parse( state.currentUser.capabilities.dokandar ) )
        );
    },

    /**
     * Check if the current user is a vendor staff.
     *
     * @param  state
     *
     * @return { boolean } If the current user is a vendor staff.
     */
    isVendorStaff( state: CoreState ): boolean {
        return state.currentUser.roles.includes( 'vendor_staff' );
    },

    /**
     * Get the store settings.
     *
     * @param state
     */
    getStoreSettings( state: CoreState ) {
        return state.store;
    },

    /**
     * Get the global settings.
     *
     * @param state
     */
    getGlobalSettings( state: CoreState ) {
        return state.global;
    },
};

export default selectors;
