const TableSkeleton = () => {
    return (
        <div className="bg-white border rounded-lg">
            { /* Table Header */ }
            <div className="border-b">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                            <th className="py-4 px-6 text-left">
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        { /* Generate 10 skeleton rows */ }
                        { [ ...Array( 10 ) ].map( ( _, index ) => (
                            <tr key={ index } className="border-t">
                                <td className="py-4 px-6">
                                    <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="space-y-2">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </td>
                            </tr>
                        ) ) }
                    </tbody>
                </table>
            </div>

            { /* Pagination */ }
            <div className="px-6 py-4 flex items-center justify-between border-t">
                <div className="flex items-center gap-4">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-2"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default TableSkeleton;
