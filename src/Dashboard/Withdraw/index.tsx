import './tailwind.scss';
import { useBalance } from './Hooks/useBalance';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useWithdrawRequests } from './Hooks/useWithdrawRequests';
import Balance from './Balance';
import PaymentDetails from './PaymentDetails';
import PaymentMethods from './PaymentMethods';
import { DokanToaster } from '@getdokan/dokan-ui';
import { useEffect, useState } from '@wordpress/element';
import { useCurrentUser } from '../../Hooks/useCurrentUser';

const Index = () => {
    const useWithdrawRequestHook = useWithdrawRequests( true );
    const withdrawSettings = useWithdrawSettings();
    const currentUser = useCurrentUser( true );
    const balance = useBalance();

    useEffect( () => {
        currentUser.fetchCurrentUser();
    }, [] );

    useEffect( () => {
        if ( currentUser?.data ) {
            console.log( currentUser.data );
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
