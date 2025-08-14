import { Card } from '@getdokan/dokan-ui';

const VendorFormSkeleton = () => {
    return (
        <Card className="bg-white p-6 mt-6">
            <div>
                {/* Back to vendors list skeleton */}
                <div className="mb-4">
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>

                {/* Header skeleton */}
                <div className="flex flex-row mb-6">
                    <div className="sm:w-full md:w-1/2">
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="sm:w-full md:w-1/2 flex flex-row justify-end gap-3">
                        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                {/* Permission section skeleton */}
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className={`p-6 flex flex-row justify-between ${index < 2 ? 'border-b' : ''}`}>
                                <div className="flex flex-col gap-2">
                                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Vendor information section skeleton */}
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* First Name and Last Name row */}
                            <div className="flex flex-row gap-6">
                                <div className="w-1/2">
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="w-1/2">
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Single field inputs */}
                            {[...Array(5)].map((_, index) => (
                                <div key={index}>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}

                            {/* Password with Generate button */}
                            <div className="flex flex-row gap-2">
                                <div className="w-full">
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="flex items-end">
                                    <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>

                            {/* Remaining single fields */}
                            {[...Array(3)].map((_, index) => (
                                <div key={index}>
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Store information section skeleton */}
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Store Name */}
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Store Category */}
                            <div>
                                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Logo section */}
                            <div>
                                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="flex flex-row gap-6">
                                    <div className="w-20 h-20 bg-gray-200 rounded rounded-full animate-pulse"></div>
                                    <div className="flex justify-center items-center">
                                        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Banner section */}
                            <div>
                                <div className="flex flex-col">
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
                                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="w-full h-[325px] bg-gray-200 rounded animate-pulse mt-3 flex items-center justify-center">
                                    <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Address information section skeleton */}
                <div className="mt-6">
                    <Card className="bg-white">
                        <div className="border-b p-6">
                            <div className="h-6 w-44 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            {/* Country */}
                            <div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* State */}
                            <div>
                                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* City, Address Line 1, Address Line 2, Zip */}
                            {[...Array(4)].map((_, index) => (
                                <div key={index}>
                                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

export default VendorFormSkeleton;
