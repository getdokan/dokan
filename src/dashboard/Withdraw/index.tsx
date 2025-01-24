import './tailwind.scss';
import { useBalance } from './Hooks/useBalance';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useWithdrawRequests } from './Hooks/useWithdrawRequests';
import Balance from './Balance';
import PaymentDetails from './PaymentDetails';
import PaymentMethods from './PaymentMethods';
import { DokanToaster } from '@getdokan/dokan-ui';
import { useEffect } from '@wordpress/element';
import { useCurrentUser } from "@dokan/hooks";

const Index = () => {
    const useWithdrawRequestHook = useWithdrawRequests( true );
    const withdrawSettings = useWithdrawSettings();
    const currentUser = useCurrentUser();
    const balance = useBalance();

    useEffect( () => {
        if ( currentUser?.data ) {
            useWithdrawRequestHook.fetchWithdrawRequests( {
                per_page: 10,
                page: 1,
                status: 'pending',
                user_id: currentUser?.data?.id ?? 0,
            } );
        }
    }, [ currentUser?.data ] );

    return (
        <>
            <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
                <Balance
                    masterLoading={
                        currentUser.isLoading ||
                        useWithdrawRequestHook.isLoading
                    }
                    bodyData={ balance }
                    settings={ withdrawSettings }
                    withdrawRequests={ useWithdrawRequestHook }
                />
                <PaymentDetails
                    masterLoading={
                        currentUser.isLoading ||
                        useWithdrawRequestHook.isLoading
                    }
                    bodyData={ balance }
                    withdrawRequests={ useWithdrawRequestHook }
                    settings={ withdrawSettings }
                />
                <PaymentMethods
                    masterLoading={
                        currentUser.isLoading ||
                        useWithdrawRequestHook.isLoading
                    }
                    bodyData={ withdrawSettings }
                />
            </div>

            <DokanToaster />
        </>
    );
};

export default Index;
