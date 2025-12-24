const AISkeleton = ( { type = 'textarea', loading, element } ) => {
    if ( ! loading ) {
        return element;
    }
    if ( type === 'text' ) {
        return (
            <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-2 animate-pulse mb-3">
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
        </div>
    );
};

export default AISkeleton;
