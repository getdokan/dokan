import { useWithdrawRequests } from './Hooks/useWithdrawRequests';
import { Button } from '@getdokan/dokan-ui';
import RequestList from './RequestList';
import { useEffect, useState } from '@wordpress/element';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import RequestWithdrawBtn from './RequestWithdrawBtn';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useCurrentUser } from "@dokan/hooks";

function WithdrawRequests() {
    const useWithdrawRequestHook = useWithdrawRequests( true );
    const withdrawSettings = useWithdrawSettings();
    const currentUser = useCurrentUser();

    const navigate = useNavigate();
    const location = useLocation();
    const [ statusParam, setStatusParam ] = useState( 'pending' );

    const validStatuses = [ 'pending', 'approved', 'cancelled' ];

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

        let page = useWithdrawRequestHook?.view?.page;
        if ( status !== useWithdrawRequestHook?.lastPayload?.status ) {
            useWithdrawRequestHook.setView( {
                ...useWithdrawRequestHook.view,
                page: 1,
            } );
        }

        useWithdrawRequestHook.fetchWithdrawRequests( {
            per_page: useWithdrawRequestHook?.view?.perPage,
            page,
            status,
            user_id: 1,
        } );
    }, [ location.search, currentUser?.data ] );

    const Content = () => {
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
                    loading={
                        useWithdrawRequestHook.isLoading ||
                        currentUser.isLoading ||
                        withdrawSettings.isLoading
                    }
                />
            </>
        );
    };

    return (
        <>
            <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
                <Content />
            </div>
        </>
    );
}

export default WithdrawRequests;
