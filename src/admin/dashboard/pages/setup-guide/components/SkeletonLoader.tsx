// Skeleton component for section titles and content
const SectionSkeleton = () => {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-8" />

            <div className="border border-gray-200 rounded-md mb-8">
                <div className="p-4 flex items-start space-x-4 border-b border-gray-200">
                    <div className="w-1/4">
                        <div className="h-5 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="w-3/4">
                        <div className="h-8 bg-gray-200 rounded mb-2" />
                    </div>
                </div>
                <div className="p-4 flex items-start space-x-4 border-b border-gray-200">
                    <div className="w-1/4">
                        <div className="h-5 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                    <div className="w-3/4">
                        <div className="h-8 bg-gray-200 rounded mb-2" />
                    </div>
                </div>
                <div className="p-4 flex items-start space-x-4">
                    <div className="w-1/4">
                        <div className="h-5 bg-gray-200 rounded mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-3/6" />
                    </div>
                    <div className="w-3/4">
                        <div className="h-8 bg-gray-200 rounded mb-2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Skeleton for tabs
const TabsSkeleton = () => {
    return (
        <div className="border-b border-gray-200 mb-6">
            <div className="animate-pulse flex space-x-8 mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

// Skeleton for menu/sidebar
const MenuSkeleton = () => {
    return (
        <div className="animate-pulse py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
            <div className="bg-white rounded-md p-2">
                <div className="h-10 bg-gray-200 rounded mb-2" />
                <div className="h-10 bg-gray-200 rounded mb-2" />
                <div className="h-10 bg-gray-200 rounded mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
            </div>
        </div>
    );
};

// Main skeleton loader component
const SkeletonLoader = ( { showTabs = true, showMenu = true } ) => {
    return (
        <div className="opacity-100 transition-opacity duration-300">
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
                { showMenu && <MenuSkeleton /> }

                <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                    { showTabs && <TabsSkeleton /> }
                    <SectionSkeleton />
                    <SectionSkeleton />
                </div>
            </div>
        </div>
    );
};

export default SkeletonLoader;
