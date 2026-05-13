import React from 'react';

const Loading = () => {
    return (
        <div className="dokan-product-product-editor dokan-layout animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
                { /* Left Column skeleton */ }
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-gray-100 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-100 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/6 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                    <div className="mb-6">
                        <div className="h-4 bg-gray-200 rounded w-1/5 mb-3"></div>
                        <div className="bg-gray-100 rounded w-full h-10"></div>
                    </div>
                </div>
                { /* Right Column skeleton */ }
                <div className="w-75 flex flex-col gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="bg-gray-100 rounded w-full h-10"></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="bg-gray-100 rounded w-full aspect-video"></div>
                        </div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="bg-gray-100 rounded w-20 h-20"></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-100 rounded-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                            </div>
                        </div>
                        <div className="mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="bg-gray-100 rounded w-full h-10"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
