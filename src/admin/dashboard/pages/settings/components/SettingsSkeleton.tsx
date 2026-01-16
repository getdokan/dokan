import { __ } from '@wordpress/i18n';

const SettingsSkeleton = () => {
    return (
        <div className="min-h-screen h-full">
            <main className="w-full lg:px-0 lg:bg-white h-full lg:shadow rounded-lg overflow-hidden">
                <div className="lg:grid lg:grid-cols-12 lg:divide-x h-full">
                    { /* Sidebar Menu Skeleton */ }
                    <div className="lg:col-span-3 p-7 lg:py-12 space-y-1">
                        <div className="animate-pulse">
                            { /* Search Box */ }
                            <div className="mb-4">
                                <div className="h-10 bg-gray-200 rounded border"></div>
                            </div>

                            { /* Menu Section 1 */ }
                            <div className="space-y-1">
                                { /* Parent Item with Icon */ }
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 bg-gray-200 rounded"></div>
                                    <div className="h-7 w-20 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                </div>

                                { /* Child Items */ }
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            { /* Menu Section 2 */ }
                            <div className="space-y-1 mt-4">
                                { /* Parent Item with Icon */ }
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 bg-gray-200 rounded"></div>
                                    <div className="h-7 w-16 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                </div>

                                { /* Child Items */ }
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-28 bg-gray-200 rounded"></div>
                                </div>
                                <div className="flex items-center pl-11 py-2">
                                    <div className="h-5 w-20 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            { /* Menu Section 3 */ }
                            <div className="space-y-1 mt-4">
                                { /* Parent Item with Icon */ }
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 bg-gray-200 rounded"></div>
                                    <div className="h-7 w-20 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            { /* Menu Section 4 */ }
                            <div className="space-y-1 mt-4">
                                { /* Parent Item with Icon */ }
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 bg-gray-200 rounded"></div>
                                    <div className="h-7 w-20 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            { /* Menu Section 5 */ }
                            <div className="space-y-1 mt-4">
                                { /* Parent Item with Icon */ }
                                <div className="flex items-center gap-3">
                                    <div className="h-7 w-7 bg-gray-200 rounded"></div>
                                    <div className="h-7 w-20 bg-gray-200 rounded flex-1"></div>
                                    <div className="h-5 w-5 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { /* Content Area Skeleton */ }
                    <div className="space-y-6 lg:p-7 lg:py-12 lg:col-span-9 pt-10">
                        <div className="animate-pulse">
                            { /* Page Header with Documentation Link */ }
                            <div className="mb-6 flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="h-8 w-64 bg-gray-200 rounded mb-3"></div>
                                    <div className="h-5 w-96 bg-gray-200 rounded"></div>
                                </div>
                                { /* Documentation Link Box */ }
                                <div className="h-10 w-32 bg-gray-200 rounded ml-4"></div>
                            </div>

                            { /* Settings Options */ }
                            <div className="bg-white rounded-lg border border-[#E9E9E9] divide-y divide-gray-200">
                                { /* Field 1  */ }
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-6 w-64 bg-gray-200 rounded"></div>
                                        <div className="h-5 w-96 max-w-2xl bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-10 w-32 bg-gray-200 rounded ml-4"></div>
                                </div>

                                { /* Field 2  */ }
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-6 w-64 bg-gray-200 rounded"></div>
                                        <div className="h-5 w-full max-w-2xl bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
                                </div>

                                { /* Field 3 */ }
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-6 w-64 bg-gray-200 rounded"></div>
                                        <div className="h-5 w-80 max-w-2xl bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <div className="h-10 w-20 bg-gray-200 rounded"></div>
                                        <div className="h-10 w-20 bg-gray-200 rounded"></div>
                                    </div>
                                </div>

                                { /* Field 4 */ }
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-64 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-full max-w-2xl bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
                                </div>

                                { /* Field 5  */ }
                                <div className="p-6 flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                        <div className="h-5 w-56 bg-gray-200 rounded"></div>
                                        <div className="h-4 w-full max-w-2xl bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-6 w-11 bg-gray-200 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsSkeleton;
