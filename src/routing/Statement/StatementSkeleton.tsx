const StatementSkeleton = () => {
    return (
        <div className="w-full space-y-6 animate-pulse pr-4 pb-4">
            {/* Date Range and Export Section */}
            <div className="flex justify-between items-center">
                <div className="flex gap-4">
                    <div className="h-10 w-40 bg-gray-200 rounded" />
                    <div className="h-10 w-40 bg-gray-200 rounded" />
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                {/* Total Debit Card */}
                <div className="p-4 bg-white rounded shadow border space-y-2">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>
                {/* Total Credit Card */}
                <div className="p-4 bg-white rounded shadow border space-y-2">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>
                {/* Balance Card */}
                <div className="p-4 bg-white rounded shadow border space-y-2">
                    <div className="h-6 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>
            </div>

            {/* Statement Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50">
                    <div className="h-4 w-28 bg-gray-200 rounded" /> {/* Balance Date */}
                    <div className="h-4 w-28 bg-gray-200 rounded" /> {/* Transaction Date */}
                    <div className="h-4 w-16 bg-gray-200 rounded" /> {/* ID */}
                    <div className="h-4 w-20 bg-gray-200 rounded" /> {/* Type */}
                    <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Debit */}
                    <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Credit */}
                    <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Balance */}
                </div>

                {/* Table Rows */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                    <div
                        key={row}
                        className="grid grid-cols-7 gap-4 p-4 border-t border-gray-200"
                    >
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                        <div className="h-4 w-12 bg-gray-200 rounded" />
                        <div className="h-4 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center p-4">
                <div className="flex gap-2">
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                    <div className="h-8 w-24 bg-gray-200 rounded" />
                </div>
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                    <div className="h-8 w-8 bg-gray-200 rounded" />
                </div>
            </div>
        </div>
    );
};

export default StatementSkeleton;
