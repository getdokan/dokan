import { __ } from '@wordpress/i18n';
import Section from '../../Elements/Section';

interface TodoSectionSkeletonProps {
    count?: number;
}

const TodoSectionSkeleton = ( { count = 8 }: TodoSectionSkeletonProps ) => {
    return (
        <Section title={ __( 'To-Do', 'dokan-lite' ) }>
            <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                { Array.from( { length: count } ).map( ( _, i ) => (
                    <div
                        key={ i }
                        className="animate-pulse bg-white h-26 rounded shadow flex justify-between items-center p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 rounded"></div>
                            <div className="w-40 space-y-2">
                                <div className="bg-gray-200 rounded h-3"></div>
                                <div className="bg-gray-200 rounded h-3"></div>
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                    </div>
                ) ) }
            </div>
        </Section>
    );
};

export default TodoSectionSkeleton;
