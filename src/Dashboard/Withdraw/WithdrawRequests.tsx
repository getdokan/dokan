import { useWithdrawRequests } from './Hooks/useWithdrawRequests';
import { Button, DokanToaster } from '@getdokan/dokan-ui';
import RequestList from './RequestList';
import { useEffect, useState } from '@wordpress/element';
import TableSkeleton from './TableSkeleton';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import RequestWithdrawBtn from './RequestWithdrawBtn';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useCurrentUser } from '../../Hooks/useCurrentUser';
import { useBalance } from './Hooks/useBalance';

function WithdrawRequests() {
    const useWithdrawRequestHook = useWithdrawRequests( true );
    const withdrawSettings = useWithdrawSettings();
    const currentUser = useCurrentUser( true );

    const navigate = useNavigate();
    const location = useLocation();
    const [ statusParam, setStatusParam ] = useState( 'pending' );

    const validStatuses = [ 'pending', 'approved', 'cancelled' ];

    useEffect( () => {
        currentUser.fetchCurrentUser();
    }, [] );

    useEffect( () => {
        if ( ! currentUser?.data || ! currentUser?.data?.id ) {
            return;
        }
        const queryParams = new URLSearchParams( location.search );
        let status = queryParams.get( 'status' );

        if ( ! status || ! validStatuses.includes( status ) ) {
            status = 'pending';
            queryParams.set( 'status', status );
            navigate( { search: queryParams.toString() }, { replace: true } );
        }

        setStatusParam( status );

        useWithdrawRequestHook.fetchWithdrawRequests( {
            per_page: 10,
            page: 1,
            status,
            user_id: 1,
        } );
    }, [ location.search, currentUser?.data ] );

    const Table = () => {
        return (
            <>
                <div className="flex sm:flex-col md:flex-row md:justify-between">
                    <div className="flex items-center space-x-1">
                        <Link
                            to="?status=pending"
                            className={ twMerge(
                                'hover:underline text-xs',
                                statusParam === 'pending'
                                    ? 'font-bold'
                                    : 'font-normal'
                            ) }
                        >
                            { __( 'Pending Requests', 'dokan' ) }
                        </Link>
                        <span className="border-r h-3"></span>
                        <Link
                            to="?status=approved"
                            className={ twMerge(
                                'hover:underline text-xs',
                                statusParam === 'approved'
                                    ? 'font-bold'
                                    : 'font-normal'
                            ) }
                        >
                            { __( 'Approved Requests', 'dokan' ) }
                        </Link>
                        <span className="border-r h-3"></span>
                        <Link
                            to="?status=cancelled"
                            className={ twMerge(
                                'hover:underline text-xs',
                                statusParam === 'cancelled'
                                    ? 'font-bold'
                                    : 'font-normal'
                            ) }
                        >
                            { __( 'Cancelled Requests', 'dokan' ) }
                        </Link>
                    </div>
                    <div className="flex flex-row gap-4">
                        <RequestWithdrawBtn
                            settings={ withdrawSettings }
                            withdrawRequests={ useWithdrawRequestHook }
                        />
                        <Button
                            color="gray"
                            className="bg-dokan-btn hover:bg-dokan-btn-hover"
                            onClick={ () => {
                                navigate( '/withdraw' );
                            } }
                        >
                            { __( 'Withdraw Dashboard', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
                <RequestList
                    withdrawRequests={ useWithdrawRequestHook }
                    status={ statusParam }
                />
            </>
        );
    };

    return (
        <>
            <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
                { useWithdrawRequestHook.isLoading ||
                currentUser.isLoading ||
                withdrawSettings.isLoading ? (
                    <TableSkeleton />
                ) : (
                    <Table />
                ) }
            </div>

            <DokanToaster />
        </>
    );
}

export default WithdrawRequests;
