function VerificationCardSkeletonLoader() {
    return [ 1, 2, 3 ].map( ( index ) => {
        return (
            <div
                key={ index }
                className="w-full rounded transition-all duration-300 border bg-white shadow mb-6 last:mb-0"
            >
                <div className="flex items-center justify-between border-b p-6">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div>
                    <div className="flex items-center justify-between border-b last:border-b-0 p-6">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between border-b last:border-b-0 p-6">
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    } );
}

export default VerificationCardSkeletonLoader;
