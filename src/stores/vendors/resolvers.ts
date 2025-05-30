import { VendorsStoreState, Vendor } from '../../definitions/dokan-vendors';
import apiFetch from '@wordpress/api-fetch';

const resolvers = {
    getVendors:
        () =>
        async ( { select, dispatch } ) => {
            dispatch.setLoading( true );
            const vendors = await apiFetch< Vendor[] >( {
                path: '/dokan/v1/stores',
            } );
        },

    getVendor:
        ( vendorId: number ) =>
        async ( { select, dispatch } ) => {
            dispatch.setLoading( true );
            const vendor = await apiFetch< Vendor >( {
                path: '/dokan/v1/stores/' + vendorId,
            } );

            dispatch.setVendor( vendor );
            return dispatch.setLoading( false );
        },
};

export default resolvers;
