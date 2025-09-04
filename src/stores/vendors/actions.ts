import {
    Vendor,
    VendorQueryParams,
    Product,
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
    setTopProducts( vendorId: number, products: Product[] ) {
        return {
            type: 'SET_TOP_PRODUCTS',
            vendorId,
            products,
        };
    },
    setLoadingTopProducts( vendorId: number, loading: boolean ) {
        return {
            type: 'SET_LOADING_TOP_PRODUCTS',
            vendorId,
            loading,
        };
    },
    setCreateOrEditVendor( vendor: Vendor ) {
        return {
            type: 'SET_CREATE_OR_EDIT_VENDOR',
            vendor,
        };
    },
    setCreateOrEditVendorLoading( loading: boolean ) {
        return {
            type: 'SET_CREATE_OR_EDIT_VENDOR_LOADING',
            loading,
        };
    },
    setCreateOrEditVendorErrors( errors: String[] ) {
        return {
            type: 'SET_CREATE_OR_EDIT_VENDOR_ERRORS',
            errors,
        };
    },
};

export default actions;
