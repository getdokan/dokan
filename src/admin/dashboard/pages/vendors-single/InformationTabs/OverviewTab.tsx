import {
    Box,
    Package2,
    ShoppingCart,
    Globe,
    Wallet,
    DollarSign,
    CircleDollarSign,
    ShoppingBag,
} from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Vendor, VendorStats, Product } from '@dokan/definitions/dokan-vendors';
import vendorsStore from '@dokan/stores/vendors';
import CardSection from '../components/CardSection';
import ProductCard, {
    Product as TransformedProduct,
} from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';

interface OverviewTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const OverviewTab = ( { vendor, vendorStats }: OverviewTabProps ) => {
    const { productsFromStore, isLoadingProducts } = useSelect(
        ( select ) => ( {
            productsFromStore: select( vendorsStore ).getTopProducts(
                vendor.id
            ),
            isLoadingProducts: select( vendorsStore ).isLoadingTopProducts(
                vendor.id
            ),
        } ),
        [ vendor.id ]
    );

    // Transform raw API data to Product interface for rendering
    const topProducts: TransformedProduct[] = productsFromStore.map(
        ( product: Product ) => ( {
            id: product.id,
            name: product.name,
            image:
                product.images && product.images.length > 0
                    ? product.images[ 0 ].src
                    : 'http://dokanbd.test/wp-content/uploads/2025/05/album-1-768x768.jpg',
            category:
                product.categories && product.categories.length > 0
                    ? product.categories.map( ( cat ) => cat.name ).join( ', ' )
                    : 'Uncategorized',
            price: parseFloat( product.price ) || 0,
            sold: product.total_sales || 0,
        } )
    );

    // Show loading if vendorStats is null
    if ( ! vendorStats ) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7C3AED]"></div>
                <span className="ml-2 text-gray-600">
                    Loading vendor statistics...
                </span>
            </div>
        );
    }

    // Get a formatted price.
    const getFormatedPrice = ( price: number ) => {
        // @ts-ignore - dokanAdminDashboard is available globally
        return window.accounting.formatMoney(
            price,
            // @ts-ignore
            dokanAdminDashboard.currency.symbol,
            // @ts-ignore
            dokanAdminDashboard.currency.precision,
            // @ts-ignore
            dokanAdminDashboard.currency.thousand,
            // @ts-ignore
            dokanAdminDashboard.currency.deicmal,
            // @ts-ignore
            dokanAdminDashboard.currency.format
        );
    };

    const storeCards = ( window as any ).wp?.hooks?.applyFilters(
        'dokan-admin-dashboard-vendor-overview-store-cards',
        [
            {
                title: __( 'Total Products', 'dokan-lite' ),
                icon: Box,
                data: vendorStats?.products?.total || 0,
                helpText: __(
                    'Total number of products in your store',
                    'dokan-lite'
                ),
            },
            {
                title: __( 'Item Sold', 'dokan-lite' ),
                icon: Package2,
                data: vendorStats?.products?.sold || 0,
                helpText: __(
                    'Total items sold from your store',
                    'dokan-lite'
                ),
            },
            {
                title: __( 'Order Processed', 'dokan-lite' ),
                icon: ShoppingCart,
                data: vendorStats?.revenue?.orders || 0,
                helpText: __(
                    'Total orders processed by your store',
                    'dokan-lite'
                ),
            },
            {
                title: __( 'Store Visitors', 'dokan-lite' ),
                icon: Globe,
                data: vendorStats?.products?.visitor || 0,
                helpText: __( 'Total visitors to your store', 'dokan-lite' ),
            },
        ]
    );

    const salesCards = ( window as any ).wp?.hooks?.applyFilters(
        'dokan-admin-dashboard-vendor-overview-sales-cards',
        [
            {
                title: __( 'Current Balance', 'dokan-lite' ),
                icon: Wallet,
                data: getFormatedPrice( vendorStats?.others?.balance || 0 ),
                helpText: __( 'Your current account balance', 'dokan-lite' ),
            },
            {
                title: __( 'Total Earning', 'dokan-lite' ),
                icon: DollarSign,
                data: getFormatedPrice( vendorStats?.revenue?.earning || 0 ),
                helpText: __( 'Total earnings from all sales', 'dokan-lite' ),
            },
            {
                title: __( 'Gross Sales', 'dokan-lite' ),
                icon: ShoppingBag,
                data: getFormatedPrice( vendorStats?.revenue?.sales || 0 ),
                helpText: __( 'Total gross sales amount', 'dokan-lite' ),
            },
            {
                title: __( 'Refund amount', 'dokan-lite' ),
                icon: CircleDollarSign,
                data: getFormatedPrice( vendorStats?.revenue?.refund || 0 ),
                helpText: __(
                    'Total amount refunded to customers',
                    'dokan-lite'
                ),
            },
        ]
    );

    return (
        <div className="@container space-y-10">
            { /* Store Section */ }
            <CardSection
                heading={ __( 'Store', 'dokan-lite' ) }
                cards={ storeCards }
            />

            { /* Sales Section */ }
            <CardSection
                heading={ __( 'Sales', 'dokan-lite' ) }
                cards={ salesCards }
            />

            { /* Top Selling Products */ }
            <div className={ `top-selling-products-section space-y-4` }>
                <SectionHeading
                    title={ __( 'Top Selling Product', 'dokan-lite' ) }
                />

                { isLoadingProducts ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED]"></div>
                        <span className="ml-2 text-gray-600">
                            { __( 'Loading top products…', 'dokan' ) }
                        </span>
                    </div>
                ) : topProducts.length > 0 ? (
                    <div className="grid @xs:grid-cols-1 @lg:grid-cols-2 gap-6">
                        { topProducts.map( ( product ) => (
                            <ProductCard
                                key={ product.id }
                                product={ product }
                            />
                        ) ) }
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        { __( 'No top selling products found.', 'dokan-lite' ) }
                    </div>
                ) }
            </div>
        </div>
    );
};

export default OverviewTab;
