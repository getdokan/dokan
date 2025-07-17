import { __ } from '@wordpress/i18n';
import Section from '../../Elements/Section';

interface MostReviewedProductsSkeletonProps {
    count?: number;
}

const MostReviewedProductsSkeleton: React.FC<
    MostReviewedProductsSkeletonProps
> = ( { count = 5 } ) => {
    return (
        <Section title={ __( 'Most Reviewed Products', 'dokan-lite' ) }>
            <div className="bg-white rounded-lg shadow">
                { /* Table Header Skeleton */ }
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex space-x-4">
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                { /* Table Rows Skeleton */ }
                <div className="divide-y divide-gray-200">
                    { Array.from( { length: count } ).map( ( _, i ) => (
                        <div key={ i } className="px-6 py-4">
                            <div className="flex space-x-4 items-center">
                                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-56 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ) ) }
                </div>
            </div>
        </Section>
    );
};

export default MostReviewedProductsSkeleton;
