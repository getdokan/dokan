import { __ } from '@wordpress/i18n';
import Section from '../../Elements/Section';

interface MostReportedVendorsSkeletonProps {
    count?: number;
}

const MostReportedVendorsSkeleton: React.FC<
    MostReportedVendorsSkeletonProps
> = ( { count = 5 } ) => {
    return (
        <Section title={ __( 'Most Reported Vendors', 'dokan-lite' ) }>
            <div className="bg-white rounded-lg shadow">
                { /* Table Header Skeleton */ }
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex space-x-4">
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                { /* Table Rows Skeleton */ }
                <div className="divide-y divide-gray-200">
                    { Array.from( { length: count } ).map( ( _, i ) => (
                        <div key={ i } className="px-6 py-4">
                            <div className="flex space-x-4 items-center">
                                <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-40 h-4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                    ) ) }
                </div>
            </div>
        </Section>
    );
};

export default MostReportedVendorsSkeleton;
