import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState, useMemo, useCallback } from '@wordpress/element';
import { useToast, SimpleInput } from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { dateI18n, getSettings } from '@wordpress/date';
import { DataViews, DateRangePicker } from '@dokan/components';
import { Calendar } from 'lucide-react';
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

interface DateRangeUpdate {
    after?: string;
    afterText?: string;
    before?: string;
    beforeText?: string;
    focusedInput?: string;
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

    const [ after, setAfter ] = useState< string >( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState< string >( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState< string >( 'startDate' );
    const [ appliedDateRange, setAppliedDateRange ] = useState< {
        start_date: string;
        end_date: string;
    } >( { start_date: '', end_date: '' } );

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
            const queryArgs: Record< string, string | number > = {
                per_page: view.perPage,
                page: view.page,
                status: view.status,
                user_id: currentUser.id,
            };

            if ( appliedDateRange.start_date && appliedDateRange.end_date ) {
                queryArgs.start_date = appliedDateRange.start_date;
                queryArgs.end_date = appliedDateRange.end_date;
            }

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
    }, [
        view.perPage,
        view.page,
        view.status,
        currentUser?.id,
        appliedDateRange.start_date,
        appliedDateRange.end_date,
    ] );

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

    const clearDateRange = useCallback( () => {
        setAfter( '' );
        setAfterText( '' );
        setBefore( '' );
        setBeforeText( '' );
        setFocusInput( 'startDate' );
        setAppliedDateRange( { start_date: '', end_date: '' } );
        setView( ( prev ) => ( { ...prev, page: 1 } ) );
    }, [] );

    const displayDateRange = useCallback(
        ( startDate: string, endDate: string ) => {
            const format = getSettings().formats.date;
            return sprintf(
                // translators: 1: start date, 2: end date.
                __( '%1$s - %2$s', 'dokan-lite' ),
                dateI18n( format, startDate ),
                dateI18n( format, endDate )
            );
        },
        []
    );

    const filter = useMemo(
        () => ( {
            fields: [
                {
                    id: 'date-range',
                    label: __( 'Date Range', 'dokan-lite' ),
                    field: (
                        <DateRangePicker
                            key="date-range-select"
                            after={ after }
                            afterText={ afterText }
                            before={ before }
                            beforeText={ beforeText }
                            focusedInput={ focusInput }
                            onUpdate={ ( update: DateRangeUpdate ) => {
                                if ( update.after !== undefined ) {
                                    setAfter( update.after );
                                }
                                if ( update.afterText !== undefined ) {
                                    setAfterText( update.afterText );
                                }
                                if ( update.before !== undefined ) {
                                    setBefore( update.before );
                                }
                                if ( update.beforeText !== undefined ) {
                                    setBeforeText( update.beforeText );
                                }
                                if ( update.focusedInput ) {
                                    setFocusInput( update.focusedInput );
                                    if (
                                        update.focusedInput === 'endDate' &&
                                        ( update.after || after )
                                    ) {
                                        setBefore( '' );
                                        setBeforeText( '' );
                                    }
                                }
                            } }
                            shortDateFormat="MM/DD/YYYY"
                            isInvalidDate={ () => false }
                            onClear={ clearDateRange }
                            onOk={ () => {
                                if ( ! after || ! before ) {
                                    return;
                                }
                                setAppliedDateRange( {
                                    start_date: after,
                                    end_date: before,
                                } );
                                setView( ( prev ) => ( {
                                    ...prev,
                                    page: 1,
                                } ) );
                            } }
                        >
                            <SimpleInput
                                addOnLeft={ <Calendar size="16" /> }
                                className="border rounded px-3 py-1.5 w-full bg-white"
                                onChange={ () => {} }
                                input={ {
                                    type: 'text',
                                    value:
                                        ! after || ! before
                                            ? ''
                                            : displayDateRange( after, before ),
                                    placeholder: __(
                                        'Enter Date',
                                        'dokan-lite'
                                    ),
                                    readOnly: true,
                                } }
                            />
                        </DateRangePicker>
                    ),
                },
            ],
            onReset: clearDateRange,
            onFilterRemove: ( filterId: string ) => {
                if ( filterId === 'date-range' ) {
                    clearDateRange();
                }
            },
        } ),
        [
            after,
            afterText,
            before,
            beforeText,
            focusInput,
            clearDateRange,
            displayDateRange,
        ]
    );

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
                filter={ filter }
            />
        </div>
    );
}

export default WithdrawRequests;
