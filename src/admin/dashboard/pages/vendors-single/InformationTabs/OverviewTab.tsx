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
import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import CardSection from '../components/CardSection';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';

interface Product {
    id: number;
    name: string;
    image: string;
    category: string;
    price: number;
    sold: number;
    status: 'Sold' | 'Active' | 'Draft';
}

interface OverviewTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}

const OverviewTab = ( { vendor, vendorStats }: OverviewTabProps ) => {
    // Mock top products data
    const topProducts: Product[] = [
        {
            id: 1,
            name: 'Stylish T Shirt for boy in summer. Collection 2025',
            image: 'http://dokanbd.test/wp-content/uploads/2025/05/album-1-768x768.jpg',
            category: 'Clothing, Fashion, Boys, Toys, Agents',
            price: 430,
            sold: 120,
            status: 'Sold',
        },
        {
            id: 2,
            name: 'Stylish T Shirt for boy in summer. Collection 2025',
            image: 'http://dokanbd.test/wp-content/uploads/2025/05/album-1-768x768.jpg',
            category: 'Clothing, Fashion, Boys, Toys, Agents',
            price: 430,
            sold: 95,
            status: 'Sold',
        },
        {
            id: 3,
            name: 'Stylish T Shirt for boy in summer. Collection 2025',
            image: 'http://dokanbd.test/wp-content/uploads/2025/05/album-1-768x768.jpg',
            category: "Clothing & Men's wear",
            price: 430,
            sold: 80,
            status: 'Sold',
        },
        {
            id: 4,
            name: 'Stylish T Shirt for boy in summer. Collection 2025',
            image: 'http://dokanbd.test/wp-content/uploads/2025/05/album-1-768x768.jpg',
            category: 'Clothing',
            price: 430,
            sold: 75,
            status: 'Sold',
        },
    ];

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
        return window.accounting.formatMoney(
            price,
            dokanAdminDashboard.currency.symbol,
            dokanAdminDashboard.currency.precision,
            dokanAdminDashboard.currency.thousand,
            dokanAdminDashboard.currency.deicmal,
            dokanAdminDashboard.currency.format
        );
    };

    const storeCards = wp.hooks.applyFilters(
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

    const salesCards = wp.hooks.applyFilters(
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

    // @ts-ignore
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
                <div className="grid @xs:grid-cols-1 @lg:grid-cols-2 gap-6">
                    { topProducts.map( ( product ) => (
                        <ProductCard
                            key={ product.id }
                            product={ product }
                            formatPrice={ getFormatedPrice }
                        />
                    ) ) }
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
