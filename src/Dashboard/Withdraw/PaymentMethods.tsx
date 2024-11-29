import { Button, Card } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { UseBalanceReturn } from './Hooks/useBalance';

const Loader = () => {
    return (
        <Card>
            <Card.Header>
                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    { /* PayPal Method */ }
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

                    { /* Bank Transfer Method */ }
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
    );
};
function PaymentMethods( {
    bodyData,
}: {
    bodyData: UseWithdrawSettingsReturn;
} ) {
    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading
    ) {
        return <Loader />;
    }

    return (
        <Card>
            <Card.Header>
                <Card.Title className="p-0 m-0">Payment Methods</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    { /* Bank Transfer Method */ }
                    { bodyData?.data?.active_methods &&
                        Object.values( bodyData?.data?.active_methods ).map(
                            ( activeMethod, index ) => {
                                return (
                                    <div
                                        className={ twMerge(
                                            'flex flex-col sm:flex-row sm:items-center justify-between',
                                            index !== 0 ? 'border-t pt-4' : ''
                                        ) }
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={ activeMethod?.icon ?? '' }
                                                alt="icon"
                                                className="w-8 h-8"
                                            />
                                            <div>
                                                <span className="font-medium">
                                                    { activeMethod?.label ??
                                                        '' }
                                                </span>
                                                <span className="text-gray-500 ml-2">
                                                    { activeMethod?.info ?? '' }
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="mt-4 sm:mt-0"
                                        >
                                            Default
                                        </Button>
                                    </div>
                                );
                            }
                        ) }
                </div>
            </Card.Body>
        </Card>
    );
}

export default PaymentMethods;
