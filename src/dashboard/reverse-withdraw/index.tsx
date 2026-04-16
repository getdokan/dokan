import '../withdraw/tailwind.scss';
import { useEffect } from '@wordpress/element';
import { DokanToaster } from '@getdokan/dokan-ui';
import { useVendorDueStatus } from './Hooks/useVendorDueStatus';
import { useReverseWithdrawalTransactions } from './Hooks/useReverseWithdrawalTransactions';
import { useAddToCart } from './Hooks/useAddToCart';

import ReverseWithdrawalBalance from './ReverseWithdrawalBalance';
import ReverseWithdrawalTransactions from './ReverseWithdrawalTransactions';

const ReverseWithdrawal = () => {
    const dueStatus = useVendorDueStatus();
    const transactionsHook = useReverseWithdrawalTransactions( true );
    const addToCartHook = useAddToCart();

    useEffect( () => {
        transactionsHook.fetchTransactions( {
            per_page: 10,
            page: 1,
        } );
    }, [] );

    return (
        <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">

            <ReverseWithdrawalBalance
                dueStatus={ dueStatus }
                addToCartHook={ addToCartHook }
            />
            <ReverseWithdrawalTransactions
                transactionsHook={ transactionsHook }
            />
            <DokanToaster />
        </div>
    );
};

export default ReverseWithdrawal;
