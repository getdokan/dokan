import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useToast } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { DataViews, DokanModal } from '@dokan/components';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { useWithdraw } from './Hooks/useWithdraw';
import RequestWithdrawBtn from './RequestWithdrawBtn';
import { useWithdrawSettings } from './Hooks/useWithdrawSettings';
import { useCurrentUser } from '@dokan/hooks';
import { useBalance } from './Hooks/useBalance';

type WithdrawStatus = 'pending' | 'approved' | 'cancelled';

interface WithdrawRequest {
    id: number;
    user_id: number;
    amount: number;
    status: string;
    method: string;
    method_title: string;
    created: string;
    charge: number;
    receivable: number;
    note: string;
}

interface WithdrawSummary {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
}

const DEFAULT_LAYOUTS = {
    table: { density: 'comfortable' },
    list: {},
};

const allStatusLabels = {
    pending: __( 'Pending Review', 'dokan-lite' ),
    approved: __( 'Approved', 'dokan-lite' ),
    cancelled: __( 'Cancelled', 'dokan-lite' ),
};

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
    const [ isOpen, setIsOpen ] = useState( false );
    const [ cancelRequestId, setCancelRequestId ] = useState( '' );
    const [ summary, setSummary ] = useState< WithdrawSummary >( {
        total: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
    } );

    // Stub withdraw requests object for RequestWithdrawBtn compatibility
    const withdrawRequestsCompat = {
        data,
        isLoading,
        refresh: () => fetchWithdrawRequests(),
        totalItems,
        totalPages,
        view: null,
        setView: () => {},
        setData: () => {},
        error: null,
        fetchWithdrawRequests: () => {},
        lastPayload: null,
    };

    const pendingFields = [
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.amount } />
            ),
        },
        {
            id: 'method_title',
            label: __( 'Method', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <span>{ item?.method_title }</span>
            ),
        },
        {
            id: 'created',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <DateTimeHtml date={ item?.created } />
            ),
        },
        {
            id: 'charge',
            label: __( 'Charge', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.charge } />
            ),
        },
        {
            id: 'receivable',
            label: __( 'Receivable', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.receivable } />
            ),
        },
        {
            id: 'status',
            label: __( 'Status', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <span>
                    { allStatusLabels[ item?.status as WithdrawStatus ] }
                </span>
            ),
        },
    ];

    const approvedFields = [
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.amount } />
            ),
        },
        {
            id: 'method_title',
            label: __( 'Method', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <span>{ item?.method_title }</span>
            ),
        },
        {
            id: 'created',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <DateTimeHtml date={ item?.created } />
            ),
        },
        {
            id: 'charge',
            label: __( 'Charge', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.charge } />
            ),
        },
        {
            id: 'receivable',
            label: __( 'Receivable', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.receivable } />
            ),
        },
    ];

    const cancelledFields = [
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.amount } />
            ),
        },
        {
            id: 'method_title',
            label: __( 'Method', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <span>{ item?.method_title }</span>
            ),
        },
        {
            id: 'created',
            label: __( 'Date', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <DateTimeHtml date={ item?.created } />
            ),
        },
        {
            id: 'charge',
            label: __( 'Charge', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.charge } />
            ),
        },
        {
            id: 'receivable',
            label: __( 'Receivable', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <PriceHtml price={ item?.receivable } />
            ),
        },
        {
            id: 'note',
            label: __( 'Note', 'dokan-lite' ),
            enableSorting: false,
            render: ( { item }: { item: WithdrawRequest } ) => (
                <span>{ item?.note }</span>
            ),
        },
    ];

    const getFieldsForStatus = ( status: WithdrawStatus ) => {
        switch ( status ) {
            case 'pending':
                return pendingFields;
            case 'approved':
                return approvedFields;
            case 'cancelled':
                return cancelledFields;
            default:
                return pendingFields;
        }
    };

    const [ view, setView ] = useState( {
        perPage: 10,
        page: 1,
        search: '',
        type: 'table',
        status: 'pending' as WithdrawStatus,
        fields: pendingFields.map( ( field ) => field.id ),
    } );

    const currentStatus = view.status;
    const fields = getFieldsForStatus( currentStatus );

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
                callback: ( [ item ]: WithdrawRequest[] ) => {
                    setCancelRequestId( String( item.id ) );
                    setIsOpen( true );
                },
            },
        ];
    }, [ currentStatus ] );

    const fetchSummary = useCallback( async () => {
        try {
            const response = ( await apiFetch( {
                path: '/dokan/v2/withdraw/summary',
                method: 'GET',
            } ) ) as WithdrawSummary;

            setSummary( response );
        } catch ( error ) {
            // Silently fail - counts are optional
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

    const cancelPendingRequest = useCallback( () => {
        withdrawHook
            .updateWithdraw( Number( cancelRequestId ), {
                status: 'cancelled',
            } )
            .then( () => {
                toast( {
                    type: 'success',
                    title: __( 'Request cancelled successfully', 'dokan-lite' ),
                } );
                void fetchWithdrawRequests();
                void fetchSummary();
            } )
            .catch( () => {
                toast( {
                    type: 'error',
                    title: __( 'Failed to cancel request', 'dokan-lite' ),
                } );
            } )
            .finally( () => {
                setIsOpen( false );
            } );
    }, [ cancelRequestId, withdrawHook, fetchWithdrawRequests, fetchSummary ] );

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

    const onViewChange = useCallback( ( newView ) => {
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
                getItemId={ ( item: WithdrawRequest ) => item.id }
                onChangeView={ onViewChange }
                paginationInfo={ paginationInfo }
                view={ view }
                actions={ actions }
                isLoading={ isLoading }
                search={ false }
                tabs={ tabs }
            />

            <DokanModal
                isOpen={ isOpen }
                namespace="cancel-request-confirmation"
                onConfirm={ cancelPendingRequest }
                onClose={ () => setIsOpen( false ) }
                dialogTitle={ __( 'Cancel Withdraw Request', 'dokan-lite' ) }
                confirmationTitle={ __(
                    'Are you sure you want to proceed?',
                    'dokan-lite'
                ) }
                confirmationDescription={ __(
                    'Do you want to proceed for cancelling the withdraw request?',
                    'dokan-lite'
                ) }
                confirmButtonText={ __( 'Yes, Cancel', 'dokan-lite' ) }
                cancelButtonText={ __( 'Close', 'dokan-lite' ) }
                loading={ withdrawHook.isLoading }
            />
        </div>
    );
}

export default WithdrawRequests;
