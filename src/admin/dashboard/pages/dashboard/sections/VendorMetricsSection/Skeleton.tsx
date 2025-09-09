import { __ } from '@wordpress/i18n';
import Section from '../../Elements/Section';

interface VendorMetricsSkeletonProps {
    count?: number;
}

const VendorMetricsSkeleton = ( { count = 4 }: VendorMetricsSkeletonProps ) => {
    return (
        <Section title={ __( 'Vendor Metrics', 'dokan-lite' ) }>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { Array.from( { length: count } ).map( ( _, i ) => (
                    <div
                        key={ i }
                        className="animate-pulse bg-white rounded shadow flex flex-col p-4 gap-2"
                    >
                        <div className="flex justify-between">
                            <div className="bg-gray-200 w-10 h-10 rounded"></div>
                            <div className="flex items-center gap-1">
                                <div className="bg-gray-200 w-3 h-3 rounded"></div>
                                <div className="bg-gray-200 w-8 h-3 rounded"></div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-gray-200 w-32 h-3 rounded"></div>
                            <div className="bg-gray-200 w-4 h-4 rounded-full ml-2"></div>
                        </div>
                        <div className="bg-gray-200 w-16 h-8 rounded"></div>
                    </div>
                ) ) }
            </div>
        </Section>
    );
};

export default VendorMetricsSkeleton;