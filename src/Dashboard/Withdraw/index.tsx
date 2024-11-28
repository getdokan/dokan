import './tailwind.scss';
import WithdrawDashboardSkeleton from "./WithdrawDashboardSkeleton";
import WithdrawDashboard from "./WithdrawDashboard";
import { useBalance } from "./Hooks/useBalance";
import { useWithdrawSettings } from "./Hooks/useWithdrawSettings";

const Index = () => {
    const balance = useBalance();
    const withdrawSettings = useWithdrawSettings();
    return (
        <div className="withdraw-wraper">
            { balance.isLoading && withdrawSettings.isLoading ? (
                <WithdrawDashboardSkeleton />
            ) : (
                <WithdrawDashboard
                    balance={ balance.data }
                    withdrawSettings={ withdrawSettings.data }
                />
            ) }
        </div>
    );
};

export default Index;
