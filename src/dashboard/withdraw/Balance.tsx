import { Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../components/PriceHtml';
import { UseBalanceReturn } from './Hooks/useBalance';
import '../../definitions/window-types';
import { UseWithdrawSettingsReturn } from './Hooks/useWithdrawSettings';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import RequestWithdrawBtn from './RequestWithdrawBtn';

const Loader = () => {
    return (
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
    );
};
function Balance( {
    bodyData,
    settings,
    masterLoading,
    withdrawRequests,
}: {
    bodyData: UseBalanceReturn;
    settings: UseWithdrawSettingsReturn;
    masterLoading: boolean;
    withdrawRequests: UseWithdrawRequestsReturn;
} ) {
    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading ||
        masterLoading
    ) {
        return <Loader />;
    }
    return (
        <>
            <Card className="dokan-withdraw-style-reset dokan-layout">
                <Card.Header>
                    <Card.Title className="p-0 m-0">
                        { __( 'Balance', 'dokan' ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-700 mb-4 sm:mb-0 flex">
                                <span>{ __( 'Your Balance:', 'dokan' ) }</span>
                                &nbsp;
                                <span className="font-semibold">
                                    <PriceHtml
                                        price={
                                            bodyData?.data?.current_balance ??
                                            ''
                                        }
                                    />
                                </span>
                            </div>
                            <div className="text-gray-700 mb-4 sm:mb-0 flex">
                                <span>
                                    { __(
                                        'Minimum Withdraw Amount: ',
                                        'dokan'
                                    ) }
                                </span>
                                &nbsp;
                                <span className="font-semibold">
                                    <PriceHtml
                                        price={
                                            bodyData?.data?.withdraw_limit ?? ''
                                        }
                                    />
                                </span>
                            </div>
                        </div>
                        <RequestWithdrawBtn
                            settings={ settings }
                            withdrawRequests={ withdrawRequests }
                            balanceData={ bodyData }
                        />
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}

export default Balance;
