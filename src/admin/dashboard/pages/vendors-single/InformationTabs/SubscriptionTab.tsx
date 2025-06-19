import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';

interface SubscriptionTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const SubscriptionTab = ( { vendor, vendorStats }: SubscriptionTabProps ) => {};

export default SubscriptionTab;
