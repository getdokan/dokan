import './tailwind.scss';
import { useBalance } from './Hooks/useBalance';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useWithdrawRequests } from './Hooks/useWithdrawRequests';
import Balance from './Balance';
import PaymentDetails from './PaymentDetails';
import PaymentMethods from './PaymentMethods';
import { useEffect } from '@wordpress/element';
import { useSelect } from "@wordpress/data";
import coreStore from "@dokan/stores/core";

const Index = () => {
    const useWithdrawRequestHook = useWithdrawRequests( true );
    const withdrawSettings = useWithdrawSettings();
    const balance = useBalance();

    const currentUser = useSelect( ( select ) => {
        // this is to do the eager loading the store.
        return select( coreStore ).getCurrentUser();
    }, [] );

    useEffect( () => {
        if ( currentUser ) {
            useWithdrawRequestHook.fetchWithdrawRequests( {
                per_page: 10,
                page: 1,
                status: 'pending',
                user_id: currentUser?.id ?? 0,
            } );
        }
    }, [ currentUser ] );

    return (
        <>
            <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
                <Balance
                    masterLoading={ useWithdrawRequestHook.isLoading }
                    bodyData={ balance }
                    settings={ withdrawSettings }
                    withdrawRequests={ useWithdrawRequestHook }
                />
                <PaymentDetails
                    masterLoading={ useWithdrawRequestHook.isLoading }
                    bodyData={ balance }
                    withdrawRequests={ useWithdrawRequestHook }
                    settings={ withdrawSettings }
                />
                <PaymentMethods
                    masterLoading={ useWithdrawRequestHook.isLoading }
                    bodyData={ withdrawSettings }
                />
            </div>
        </>
    );
};

export default Index;
