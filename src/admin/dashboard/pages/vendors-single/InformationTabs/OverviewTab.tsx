import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Vendor, Product } from '@dokan/definitions/dokan-vendors';
import vendorsStore from '@dokan/stores/vendors';
import ProductCard, {
    Product as TransformedProduct,
} from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { Slot } from '@wordpress/components';

interface OverviewTabProps {
    vendor: Vendor;
}

const OverviewTab = ( { vendor }: OverviewTabProps ) => {
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

    return (
        <div className="@container space-y-10">
            <Slot
                name={ `dokan-admin-vendor-before-overview-section` }
                fillProps={ { vendor } }
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
                    <div className="grid @md:grid-cols-1 @lg:grid-cols-2 gap-6">
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
