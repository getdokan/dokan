import { Vendor, VendorsStoreState } from '../../definitions/dokan-vendors';
import defaultState from './defaultState';

const reducer = ( state = defaultState, action: any ): VendorsStoreState => {
    switch ( action.type ) {
        case 'SET_VENDORS':
            return { ...state, vendors: action.vendors };
        case 'SET_VENDOR':
            // Check if vendor already exists
            const vendorExists = state.vendors.some(
                ( vendor ) => vendor.id === action.vendor.id
            );

            if ( vendorExists ) {
                // Update existing vendor
                return {
                    ...state,
                    vendors: state.vendors.map( ( vendor: Vendor ) =>
                        vendor.id === action.vendor.id ? action.vendor : vendor
                    ),
                };
            }
            // Add new vendor
            return {
                ...state,
                vendors: [ ...state.vendors, action.vendor ],
            };

        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        case 'SET_QUERY_PARAMS':
            return {
                ...state,
                queryParams: action.queryParams,
            };
        case 'UPDATE_QUERY_PARAM':
            return {
                ...state,
                queryParams: {
                    ...state.queryParams,
                    [ action.key ]: action.value,
                },
            };
        case 'SET_VENDOR_STATS':
            return {
                ...state,
                vendorStats: {
                    ...( state.vendorStats || {} ),
                    [ action.vendorId ]: action.stats,
                },
            };

        case 'SET_TOP_PRODUCTS':
            return {
                ...state,
                topProducts: {
                    ...state.topProducts,
                    [ action.vendorId ]: action.products,
                },
            };

        case 'SET_LOADING_TOP_PRODUCTS':
            return {
                ...state,
                loadingTopProducts: {
                    ...state.loadingTopProducts,
                    [ action.vendorId ]: action.loading,
                },
            };

        default:
            return state;
    }
};

export default reducer;
