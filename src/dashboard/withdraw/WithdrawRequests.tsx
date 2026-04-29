import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { DataViews } from '@dokan/components';
import { useWithdraw } from './Hooks/useWithdraw';
import RequestWithdrawBtn from './RequestWithdrawBtn';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useCurrentUser } from '@dokan/hooks';
import { useBalance } from './Hooks/useBalance';
import {
    DEFAULT_LAYOUTS,
    getFieldsForStatus,
    type WithdrawRequest,
    type WithdrawStatus,
} from './withdraw-fields';

interface WithdrawSummary {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
}

interface WithdrawView {
    perPage: number;
    page: number;
    search: string;
    type: string;
    status: WithdrawStatus;
    fields: string[];
    layout?: {
        styles?: Record< string, { width?: string } >;
    };
}

function WithdrawRequests() {
    const withdrawSettings = useWithdrawSettings();
    const balance = useBalance();
    const currentUser = useCurrentUser();
    const withdrawHook = useWithdraw();
    const toast = useToast();

    const [ data, setData ] = useState< WithdrawRequest[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ totalItems, setTotalItems ] = useState( 0 );
    const [ totalPages, setTotalPages ] = useState( 0 );
    const [ summary, setSummary ] = useState< WithdrawSummary >( {
        total: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
    } );

    const [ view, setView ] = useState< WithdrawView >( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        status: 'pending',
        fields: getFieldsForStatus( 'pending' ).map( ( field ) => field.id ),
        layout: {
            styles: {
                'amount': {
                    width: '20%'
                },
                'method_title': {
                    width: '20%'
                },
                'created': {
                    width: '20%'
                },
                'charge': {
                    width: '20%' 
                },
                'receivable': { 
                    width: '20%' 
                },
            },
        }
    } );

    const currentStatus = view.status;
    const fields = useMemo(
        () => getFieldsForStatus( currentStatus ),
        [ currentStatus ]
    );

    const fetchSummary = useCallback( async () => {
        try {
            const response = ( await apiFetch( {
                path: '/dokan/v2/withdraw/summary',
                method: 'GET',
            } ) ) as WithdrawSummary;

            setSummary( response );
        } catch ( err ) {
            // Counts are non-critical, but log for debugging
            console.error( 'Failed to fetch withdraw summary:', err );
        }
    }, [] );

    const fetchWithdrawRequests = useCallback( async () => {
        if ( ! currentUser?.id ) {
            return;
        }

        setIsLoading( true );
        try {
            const queryArgs = {
                per_page: view.perPage,
                page: view.page,
                status: view.status,
                user_id: currentUser.id,
            };

            const response = ( await apiFetch( {
                path: addQueryArgs( '/dokan/v1/withdraw', queryArgs ),
                parse: false,
            } ) ) as Response;

            const responseData: WithdrawRequest[] = await response.json();
            const responseTotalItems = parseInt(
                response.headers.get( 'X-WP-Total' ) ?? '0'
            );
            const responseTotalPages = parseInt(
                response.headers.get( 'X-WP-TotalPages' ) ?? '0'
            );

            setTotalItems( responseTotalItems );
            setTotalPages( responseTotalPages );
            setData( responseData );
        } catch ( error ) {
            toast( {
                type: 'error',
                title: __( 'Failed to fetch withdraw requests', 'dokan-lite' ),
            } );
        } finally {
            setIsLoading( false );
        }
    }, [ view.perPage, view.page, view.status, currentUser?.id ] );

    // Stub withdraw requests object for RequestWithdrawBtn compatibility
    // TODO: Refactor RequestWithdrawBtn to accept a simpler interface
    // instead of the full UseWithdrawRequestsReturn shape.
    const withdrawRequestsCompat = useMemo(
        () => ( {
            data,
            isLoading,
            refresh: () => fetchWithdrawRequests(),
            totalItems,
            totalPages,
            view: { perPage: 10, page: 1, search: '', type: 'table' },
            setView: () => {},
            setData: () => {},
            error: null,
            fetchWithdrawRequests: () => {},
            lastPayload: null,
        } as any ),
        [ data, isLoading, totalItems, totalPages, fetchWithdrawRequests ]
    );

    const actions = useMemo( () => {
        if ( currentStatus !== 'pending' ) {
            return [];
        }

        return [
            {
                id: 'withdraw-cancel',
                isEligible: () => true,
                label: () => __( 'Cancel', 'dokan-lite' ),
                isDestructive: true,
                confirmButtonLabel: __( 'Cancel Withdraw', 'dokan-lite' ),
                callback: ( [ item ]: WithdrawRequest[] ) => {
                    withdrawHook.updateWithdraw( item.id, {
                            status: 'cancelled',
                        } )
                        .then( () => {
                            toast( {
                                type: 'success',
                                title: __(
                                    'Request cancelled successfully',
                                    'dokan-lite'
                                ),
                            } );
                            void fetchWithdrawRequests();
                            void fetchSummary();
                        } )
                        .catch( () => {
                            toast( {
                                type: 'error',
                                title: __(
                                    'Failed to cancel request',
                                    'dokan-lite'
                                ),
                            } );
                        } );
                },
            },
        ];
    }, [ currentStatus, withdrawHook.updateWithdraw, fetchWithdrawRequests, fetchSummary ] );

    useEffect( () => {
        void fetchWithdrawRequests();
    }, [ fetchWithdrawRequests ] );

    useEffect( () => {
        void fetchSummary();
    }, [ fetchSummary ] );

    const tabs = {
        items: [
            {
                label: __( 'Pending Requests', 'dokan-lite' ),
                value: 'pending',
                count: summary.pending,
            },
            {
                label: __( 'Approved Requests', 'dokan-lite' ),
                value: 'approved',
                count: summary.approved,
            },
            {
                label: __( 'Cancelled Requests', 'dokan-lite' ),
                value: 'cancelled',
                count: summary.cancelled,
            },
        ],
        viewKey: 'status',
        onSelect: ( status: WithdrawStatus ) => {
            const activeFields = getFieldsForStatus( status );
            setIsLoading( true );
            setData( [] );
            setView( ( prev ) => ( {
                ...prev,
                page: 1,
                search: '',
                status,
                fields: activeFields.map( ( field ) => field.id ),
            } ) );
        },
    };

    const paginationInfo = {
        totalItems,
        totalPages,
    };

    // Setting view state triggers fetchWithdrawRequests via useEffect
    // dependency on view.perPage, view.page, and view.status.
    const onViewChange = useCallback( ( newView: typeof view ) => {
        setView( newView );
    }, [] );

    return (
        <div className="dokan-withdraw-wrapper dokan-react-withdraw space-y-6">
            <RequestWithdrawBtn
                settings={ withdrawSettings }
                withdrawRequests={ withdrawRequestsCompat }
                balanceData={ balance }
            />

            <DataViews
                namespace="dokan-withdraw-request-data-view"
                data={ data }
                defaultLayouts={ DEFAULT_LAYOUTS }
                fields={ fields }
                getItemId={ ( item: WithdrawRequest ) => String( item.id ) }
                onChangeView={ onViewChange }
                paginationInfo={ paginationInfo }
                view={ view }
                actions={ actions }
                isLoading={ isLoading }
                search={ false }
                tabs={ tabs }
            />
        </div>
    );
}

export default WithdrawRequests;
