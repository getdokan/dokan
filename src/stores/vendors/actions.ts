import {
    VendorsStoreState,
    Vendor,
    VendorQueryParams,
} from '../../definitions/dokan-vendors';

const actions = {
    setVendors( vendors: Vendor[] ) {
        return {
            type: 'SET_VENDORS',
            vendors,
        };
    },
    setVendor( vendor: Vendor ) {
        return {
            type: 'SET_VENDOR',
            vendor,
        };
    },
    setLoading( loading: boolean ) {
        return {
            type: 'SET_LOADING',
            loading,
        };
    },
    setError( error: string ) {
        return {
            type: 'SET_ERROR',
            error,
        };
    },
    setQueryParams( queryParams: VendorQueryParams ) {
        return {
            type: 'SET_QUERY_PARAMS',
            queryParams,
        };
    },
    updateQueryParam( key: keyof VendorQueryParams, value: any ) {
        return {
            type: 'UPDATE_QUERY_PARAM',
            key,
            value,
        };
    },
    setVendorStats( vendorId: number, stats: any ) {
        return {
            type: 'SET_VENDOR_STATS',
            vendorId,
            stats,
        };
    },
};

export default actions;
