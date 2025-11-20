const TopProductSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            { Array.from( { length: 2 } ).map( ( _, index ) => (
                <div key={ index } className={ `grid gap-4` }>
                    <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        { Array.from( { length: 2 } ).map( ( _, index ) => (
                            <div
                                key={ index }
                                className="bg-white rounded p-4 animate-pulse"
                            >
                                <div className="h-6 w-full mb-2 bg-gray-300 rounded"></div>
                                <div className="h-4 w-3/4 bg-gray-300 rounded mb-1"></div>
                                <div className="h-4 w-full bg-gray-300 rounded"></div>
                            </div>
                        ) ) }
                    </div>
                </div>
            ) ) }
        </div>
    );
};

export default TopProductSkeleton;
