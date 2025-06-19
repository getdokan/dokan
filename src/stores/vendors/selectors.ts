import { Vendor, VendorsStoreState } from '../../definitions/dokan-vendors';

const selectors = {
    getVendors( state: VendorsStoreState ): Vendor[] {
        return state.vendors;
    },
    getVendor(
        state: VendorsStoreState,
        vendorId: number
    ): Vendor | undefined {
        const { vendors } = state;

        return vendors.find( ( vendor ) => vendor.id === vendorId );
    },
    isLoading( state: VendorsStoreState ): boolean {
        return state.loading;
    },
    getError( state: VendorsStoreState ): string | undefined {
        return state.error;
    },
    getVendorStats( state: VendorsStoreState, vendorId: number ): any {
        return state.vendorStats ? state.vendorStats[ vendorId ] : undefined;
    },
};

export default selectors;
