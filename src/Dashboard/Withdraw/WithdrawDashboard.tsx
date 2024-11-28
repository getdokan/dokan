import { Button, Card } from "@getdokan/dokan-ui";
import { __ } from "@wordpress/i18n";
import { BalanceData } from "./Hooks/useBalance";
import { WithdrawSettings } from "./Hooks/useWithdrawSettings";
import PriceHtml from "../../Components/PriceHtml";

type WithdrawDashboardProps = {
    balance: BalanceData;
    withdrawSettings: WithdrawSettings;
};
function WithdrawDashboard( {
    balance,
    withdrawSettings,
}: WithdrawDashboardProps ) {
    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <Card>
                <Card.Header>
                    <Card.Title className="p-0 m-0">
                        { __( 'Balance', 'dokan' ) }
                    </Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex flex-col">
                            <div className="text-gray-700 mb-4 sm:mb-0 flex">
                                <span>{ __( 'Your Balance: ', 'dokan' ) }</span>
                                <span className="font-semibold"><PriceHtml price={balance.current_balance}/></span>
                            </div>
                            <div className="text-gray-700 mb-4 sm:mb-0">
                                <span>{ __( 'Minimum Withdraw Amount: ', 'dokan' ) }</span>
                                <span className="font-semibold">50.00৳</span>
                            </div>
                        </div>
                        <Button color="gray">Request Withdraw</Button>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment Details Card */}
            <Card>
                <Card.Header>
                    <Card.Title className="p-0 m-0">Payment Details</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Last Payment</h4>
                                <p className="text-gray-600">You do not have any approved withdraw yet.</p>
                            </div>
                            <Button color="gray" className="mt-4 sm:mt-0">
                                View Payments
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Payment Methods Card */}
            <Card>
                <Card.Header>
                    <Card.Title className="p-0 m-0">Payment Methods</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/api/placeholder/32/32"
                                alt="PayPal"
                                className="w-8 h-8"
                            />
                            <div>
                                <span className="font-medium">PayPal</span>
                                <span className="text-gray-500 ml-2">No information found.</span>
                            </div>
                        </div>
                        <Button color="gray" className="mt-4 sm:mt-0">
                            Setup
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}

export default WithdrawDashboard;
