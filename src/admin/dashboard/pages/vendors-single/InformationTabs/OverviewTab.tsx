import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { Vendor, Product } from '@dokan/definitions/dokan-vendors';
import vendorsStore from '@dokan/stores/vendors';
import ProductCard, {
    Product as TransformedProduct,
} from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { Slot } from '@wordpress/components';
import TopProductSkeleton from '@dokan/admin/dashboard/pages/vendors-single/Skeletons/TopProductSkeleton';

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
                name={ `dokan-admin-vendor-before-top-selling-products` }
                fillProps={ { vendor, topProducts } }
            />

            { /* Top Selling Products */ }
            { isLoadingProducts ? (
                <TopProductSkeleton />
            ) : (
                <div className={ `top-selling-products-section space-y-4` }>
                    <SectionHeading
                        title={ __( 'Top Selling Product', 'dokan-lite' ) }
                    />

                    { /* eslint-disable-next-line no-nested-ternary */ }
                    { topProducts.length > 0 ? (
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
                            { __(
                                'No top selling products found.',
                                'dokan-lite'
                            ) }
                        </div>
                    ) }
                </div>
            ) }

            <Slot
                name={ `dokan-admin-vendor-after-top-selling-products` }
                fillProps={ { vendor, topProducts } }
            />
        </div>
    );
};

export default OverviewTab;
