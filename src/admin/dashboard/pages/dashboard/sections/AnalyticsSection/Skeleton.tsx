import { __ } from '@wordpress/i18n';
import Section from '../../Elements/Section';

interface AnalyticsSkeletonProps {
    count?: number;
}

const AnalyticsSkeleton = ( {
    count = 2,
}: AnalyticsSkeletonProps ) => {
    return (
        <Section title={ __( 'Analytics', 'dokan-lite' ) }>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { Array.from( { length: count } ).map( ( _, i ) => (
                    <div
                        key={ i }
                        className="animate-pulse bg-white h-26 rounded shadow flex justify-between items-center p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 rounded"></div>
                            <div className="w-60 space-y-2">
                                <div className="bg-gray-200 rounded h-3"></div>
                                <div className="bg-gray-200 rounded h-3"></div>
                            </div>
                        </div>
                        <div className="h-8 w-28 bg-gray-200 rounded"></div>
                    </div>
                ) ) }
            </div>
        </Section>
    );
};

export default AnalyticsSkeleton;
