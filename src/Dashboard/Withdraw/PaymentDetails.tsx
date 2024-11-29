import { Button, Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../Components/PriceHtml';
import DateTimeHtml from '../../Components/DateTimeHtml';
import { UseBalanceReturn } from './Hooks/useBalance';

const Loader = () => {
    return (
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
    );
};
function PaymentDetails( { bodyData }: { bodyData: UseBalanceReturn } ) {
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
                <Card.Title className="p-0 m-0">Payment Details</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                                { __( 'Last Payment', 'dokan' ) }
                            </h4>
                            { bodyData?.data?.last_withdraw?.id ? (
                                <p className="flex">
                                    <strong>
                                        <PriceHtml
                                            price={
                                                bodyData?.data?.last_withdraw
                                                    ?.amount ?? ''
                                            }
                                        />
                                    </strong>
                                    &nbsp;{ __( 'on', 'dokan' ) }&nbsp;
                                    <strong>
                                        <em>
                                            <DateTimeHtml.Date
                                                date={
                                                    bodyData?.data
                                                        ?.last_withdraw?.date ??
                                                    ''
                                                }
                                            />
                                        </em>
                                    </strong>
                                    &nbsp;{ __( 'to', 'dokan' ) }&nbsp;
                                    <strong>
                                        { bodyData?.data?.last_withdraw
                                            ?.method_title ?? '' }
                                    </strong>
                                </p>
                            ) : (
                                <p className="text-gray-600">
                                    { __(
                                        'You do not have any approved withdraw yet.',
                                        'dokan'
                                    ) }
                                </p>
                            ) }
                        </div>
                        <Button color="gray" className="mt-4 sm:mt-0">
                            View Payments
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}

export default PaymentDetails;
