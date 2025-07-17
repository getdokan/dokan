interface MonthlyOverviewSkeletonProps {
    count?: number;
}

const MonthlyOverviewSkeleton: React.FC< MonthlyOverviewSkeletonProps > = ( {
    count = 8,
} ) => {
    return (
        <div className="grid sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            { Array.from( { length: count } ).map( ( _, i ) => (
                <div
                    key={ i }
                    className="animate-pulse bg-gray-200 h-32 rounded"
                ></div>
            ) ) }
        </div>
    );
};

export default MonthlyOverviewSkeleton;
