const SidebarSkeleton = () => (
    <aside className="w-64 min-w-[260px] bg-white rounded-xl p-6 flex flex-col gap-4">
        { /* Registered Since */ }
        <div className="flex flex-col gap-2">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        { /* Contact */ }
        <div className="flex flex-col gap-2">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
        </div>
        { /* Commission, Product Publishing, Subscription, Payment, Social */ }
        { [ ...Array( 5 ) ].map( ( _, i ) => (
            <div
                key={ i }
                className="h-3 w-44 bg-gray-200 rounded animate-pulse"
            />
        ) ) }
        { /* Send Email Button */ }
        <div className="h-10 w-full bg-gray-200 rounded-lg mt-4 animate-pulse" />
    </aside>
);

const AnalyticsSkeleton = () => (
    <div className="grid grid-cols-4 gap-4 mb-8">
        { [ ...Array( 8 ) ].map( ( _, i ) => (
            <div
                key={ i }
                className="h-20 rounded-lg bg-gray-200 animate-pulse"
            />
        ) ) }
    </div>
);

const TabsSkeleton = () => (
    <div className="flex gap-6 mb-6">
        { [ ...Array( 6 ) ].map( ( _, i ) => (
            <div
                key={ i }
                className="h-5 w-24 rounded bg-gray-200 animate-pulse"
            />
        ) ) }
    </div>
);

const TopSellingSkeleton = () => (
    <div className="h-28 rounded-lg bg-gray-200 animate-pulse" />
);

const SkeletonLoader = () => (
    <div className="bg-[#f7f8fa] min-h-screen p-8 flex flex-col gap-8">
        { /* Header */ }
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
            <div className="relative">
                { /* Banner */ }
                <div className="h-40 w-full bg-gray-200 animate-pulse" />
                { /* Avatar */ }
                <div className="absolute left-8 -bottom-12">
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-8 border-white animate-pulse" />
                </div>
                { /* Visit Store Button */ }
                <div className="absolute top-6 right-8">
                    <div className="h-10 w-32 rounded bg-gray-200 animate-pulse" />
                </div>
            </div>
            <div className="pt-16 pl-44 pb-6 flex items-center gap-6">
                <div className="flex flex-col gap-2">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </div>
                { /* Disabled Chip */ }
                <div className="h-7 w-20 rounded bg-gray-200 animate-pulse ml-4" />
            </div>
        </div>
        { /* Main Content */ }
        <div className="flex gap-8">
            <SidebarSkeleton />
            <main className="flex-1 bg-white rounded-xl p-8">
                <TabsSkeleton />
                <AnalyticsSkeleton />
                <TopSellingSkeleton />
            </main>
        </div>
    </div>
);

export default SkeletonLoader;
