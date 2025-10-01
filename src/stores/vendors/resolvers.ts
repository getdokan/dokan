import { Vendor, Product } from '../../definitions/dokan-vendors';
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

    getVendorStats:
        ( vendorId: number ) =>
        async ( { dispatch } ) => {
            dispatch.setLoading( true );
            try {
                const stats = await apiFetch< any >( {
                    path: `/dokan/v1/stores/${ vendorId }/stats`,
                } );
                dispatch.setVendorStats( vendorId, stats );
            } finally {
                dispatch.setLoading( false );
            }
        },

    getTopProducts:
        ( vendorId: number ) =>
        async ( { dispatch } ) => {
            dispatch.setLoadingTopProducts( vendorId, true );
            try {
                const response = await apiFetch< Product[] >( {
                    path: `/dokan/v1/products/best_selling?per_page=4&seller_id=${ vendorId }`,
                } );

                // Store raw API response without transformation
                dispatch.setTopProducts( vendorId, response );
            } catch ( error ) {
                console.error( 'Error fetching best selling products:', error );
                dispatch.setTopProducts( vendorId, [] );
            } finally {
                dispatch.setLoadingTopProducts( vendorId, false );
            }
        },
};

export default resolvers;
