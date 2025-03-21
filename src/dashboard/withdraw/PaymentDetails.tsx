import { Button, Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { UseBalanceReturn } from './Hooks/useBalance';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import RequestList from './RequestList';
import { useNavigate } from 'react-router-dom';
import { Slot, SlotFillProvider } from '@wordpress/components';
import { PluginArea } from '@wordpress/plugins';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';

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
function PaymentDetails( {
    bodyData,
    masterLoading,
    withdrawRequests,
    settings,
}: {
    bodyData: UseBalanceReturn;
    masterLoading: boolean;
    withdrawRequests: UseWithdrawRequestsReturn;
    settings: UseWithdrawSettingsReturn;
} ) {
    const navigate = useNavigate();

    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading ||
        masterLoading
    ) {
        return <Loader />;
    }

    return (
        <SlotFillProvider>
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
                                    <div className="flex">
                                        <strong>
                                            <PriceHtml
                                                price={
                                                    bodyData?.data
                                                        ?.last_withdraw
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
                                                            ?.last_withdraw
                                                            ?.date ?? ''
                                                    }
                                                />
                                            </em>
                                        </strong>
                                        &nbsp;{ __( 'to', 'dokan' ) }&nbsp;
                                        <strong>
                                            { bodyData?.data?.last_withdraw
                                                ?.method_title ?? '' }
                                        </strong>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">
                                        { __(
                                            'You do not have any approved withdraw yet.',
                                            'dokan'
                                        ) }
                                    </p>
                                ) }
                            </div>
                            <Button
                                color="gray"
                                className="bg-dokan-btn hover:bg-dokan-btn-hover"
                                onClick={ () => {
                                    navigate( '/withdraw-requests' );
                                } }
                            >
                                { __( 'View Payments', 'dokan-lite' ) }
                            </Button>
                        </div>

                        <Slot
                            name="dokan-vendor-dashboard-withdraw-payment-details"
                            fillProps={ {
                                withdrawRequests,
                                bodyData,
                                masterLoading,
                                settings,
                            } }
                        />

                        { ! withdrawRequests?.isLoading &&
                            withdrawRequests?.data &&
                            Array.isArray( withdrawRequests?.data ) &&
                            withdrawRequests?.data.length > 0 && (
                                <div className="flex flex-col border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        { __( 'Pending Requests', 'dokan' ) }
                                    </h4>

                                    <RequestList
                                        withdrawRequests={ withdrawRequests }
                                        status="pending"
                                        loading={
                                            masterLoading ||
                                            withdrawRequests.isLoading ||
                                            settings.isLoading
                                        }
                                    />
                                </div>
                            ) }
                    </div>
                </Card.Body>
            </Card>

            <PluginArea />
        </SlotFillProvider>
    );
}

export default PaymentDetails;
