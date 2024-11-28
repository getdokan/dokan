import { Card } from '@getdokan/dokan-ui';

const WithdrawDashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <Card>
                <Card.Header>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </Card.Header>
                <Card.Body>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment Details Card */}
            <Card>
                <Card.Header>
                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                </Card.Header>
                <Card.Body>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment Methods Card */}
            <Card>
                <Card.Header>
                    <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
                </Card.Header>
                <Card.Body>
                    <div className="space-y-4">
                        {/* PayPal Method */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                <div>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>

                        {/* Bank Transfer Method */}
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                                <div>
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default WithdrawDashboardSkeleton;
