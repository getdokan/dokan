import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';

interface WithdrawTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const WithdrawTab = ( { vendor, vendorStats }: WithdrawTabProps ) => {};

export default WithdrawTab;
