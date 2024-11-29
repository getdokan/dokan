import './tailwind.scss';
import { useBalance } from './Hooks/useBalance';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import Balance from './Balance';
import PaymentDetails from './PaymentDetails';
import PaymentMethods from './PaymentMethods';

const Index = () => {
    const balance = useBalance();
    const withdrawSettings = useWithdrawSettings();
    return (
        <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
            <Balance bodyData={ balance } />
            <PaymentDetails bodyData={ balance } />
            <PaymentMethods bodyData={ withdrawSettings } />
        </div>
    );
};

export default Index;
