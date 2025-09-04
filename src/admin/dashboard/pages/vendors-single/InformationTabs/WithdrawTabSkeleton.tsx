import { Card } from '@getdokan/dokan-ui';

function WithdrawTabSkeleton() {
    return (
        <Card className="bg-white shadow p-6">
            <div>
                <div className="mb-2">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div>
                    <div className="flex flex-col border rounded">
                        { [ 1, 2, 3, 4 ].map( ( method ) => {
                            return (
                                <div
                                    className="border-b last:border-b-0"
                                    key={ method }
                                >
                                    <div className="flex flex-row pt-3 pb-3 pl-6 pr-6">
                                        <div className="w-[40%] flex justify-start items-center text-sm font-semibold">
                                            <div className="flex flex-col space-y-2">
                                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-[60%]">
                                            <div className="flex justify-center w-1/3">
                                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="flex justify-end w-1/3">
                                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="flex justify-end w-1/3">
                                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="mb-2">
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div>
                    <div className="flex flex-col border rounded">
                        { [ 1, 2 ].map( ( method ) => {
                            return (
                                <div
                                    className="border-b last:border-b-0"
                                    key={ method }
                                >
                                    <div className="flex flex-row pt-3 pb-3 pl-6 pr-6">
                                        <div className="w-[40%] flex justify-start items-center text-sm font-semibold">
                                            <div className="flex flex-col space-y-2">
                                                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-row w-[60%]">
                                            <div className="flex justify-center w-1/3">
                                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="flex justify-end w-1/3">
                                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="flex justify-end w-1/3">
                                                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            </div>
        </Card>
    );
}

export default WithdrawTabSkeleton;
