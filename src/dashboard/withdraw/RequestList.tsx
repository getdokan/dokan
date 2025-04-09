import { useToast } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';
import { useWithdraw } from './Hooks/useWithdraw';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import { isEqual } from 'lodash';
import { DataViews, DokanModal } from '@dokan/components';

function RequestList( {
    withdrawRequests,
    status = 'pending',
    loading = true,
}: {
    withdrawRequests: UseWithdrawRequestsReturn;
    status: string;
    loading: boolean;
} ) {
    const defaultLayouts = {
        table: {},
        grid: {},
        list: {},
        density: 'comfortable', // Use density pre-defined values: comfortable, compact, cozy
    };

    const allStatus = {
        pending: __( 'Pending Review', 'dokan' ),
        approved: __( 'Approved', 'dokan' ),
        cancelled: __( 'Cancelled', 'dokan' ),
    };

    const fields = [
        {
            id: 'amount',
            label: __( 'Amount', 'dokan-lite' ),
            render: ( { item } ) => (
                <div>
                    { loading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <PriceHtml price={ item?.amount } />
                    ) }
                </div>
            ),
            enableSorting: false,
        },
        {
            id: 'method_title',
            label: __( 'Method', 'dokan' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    { loading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        item?.method_title
                    ) }
                </div>
            ),
        },
        {
            id: 'created',
            label: __( 'Date', 'dokan' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    { loading ? (
                        <span className="block w-40 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <DateTimeHtml date={ item?.created } />
                    ) }
                </div>
            ),
        },
        {
            id: 'charge',
            label: __( 'Charge', 'dokan' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    { loading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <PriceHtml price={ item?.charge } />
                    ) }
                </div>
            ),
        },
        {
            id: 'receivable',
            label: __( 'Receivable', 'dokan' ),
            enableSorting: false,
            render: ( { item } ) => (
                <div>
                    { loading ? (
                        <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                    ) : (
                        <PriceHtml price={ item?.receivable } />
                    ) }
                </div>
            ),
        },
        ...( status === 'pending'
            ? [
                  {
                      id: 'status',
                      label: __( 'Status', 'dokan' ),
                      enableSorting: false,
                      render: ( { item } ) => (
                          <div>
                              { loading ? (
                                  <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                              ) : (
                                  <span>
                                      {
                                          allStatus[
                                              item?.status as keyof typeof allStatus
                                          ]
                                      }
                                  </span>
                              ) }
                          </div>
                      ),
                  },
              ]
            : [] ),
        ...( status === 'cancelled'
            ? [
                  {
                      id: 'note',
                      label: __( 'Note', 'dokan' ),
                      enableSorting: false,
                      render: ( { item } ) => (
                          <div>
                              { loading ? (
                                  <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                              ) : (
                                  item?.note
                              ) }
                          </div>
                      ),
                  },
              ]
            : [] ),
        ...( status === 'pending'
            ? [
                  {
                      id: 'id',
                      label: __( 'Action', 'dokan' ),
                      render: ( { item } ) => {
                          return (
                              <div>
                                  { loading ? (
                                      <span className="block w-24 h-3 rounded bg-gray-200 animate-pulse"></span>
                                  ) : (
                                      <button
                                          className="whitespace-normal m-0 hover:underline cursor-pointer bg-transparent hover:bg-transparent"
                                          type="button"
                                          onClick={ () => {
                                              setCancelRequestId( item.id );
                                              setIsOpen( true );
                                          } }
                                      >
                                          { __( 'Cancel', 'dokan' ) }
                                      </button>
                                  ) }
                              </div>
                          );
                      },
                  },
              ]
            : [] ),
    ];
    const [ isOpen, setIsOpen ] = useState( false );

    const [ cancelRequestId, setCancelRequestId ] = useState( '' );
    const withdrawHook = useWithdraw();

    const actions = [];

    const toast = useToast();

    const fallbackData = [];
    const canclePendingRequest = () => {
        withdrawHook
            .updateWithdraw( Number( cancelRequestId ), {
                status: 'cancelled',
            } )
            .then( () => {
                toast( {
                    type: 'success',
                    title: __( 'Request cancelled successfully', 'dokan' ),
                } );
                withdrawRequests.refresh();
            } )
            .catch( () => {
                toast( {
                    type: 'error',
                    title: __( 'Failed to cancel request', 'dokan' ),
                } );
            } )
            .finally( () => {
                setIsOpen( false );
            } );
    };

    const fetchWithdraw = ( newView ) => {
        if ( ! isEqual( newView, withdrawRequests?.view ) ) {
            withdrawRequests.setView( newView );

            withdrawRequests.fetchWithdrawRequests( {
                ...withdrawRequests.lastPayload,
                page: newView.page,
                status,
                per_page: newView.perPage,
            } );
        }
    };

    return (
        <>
            <DataViews
                data={ withdrawRequests?.data ?? fallbackData }
                namespace="dokan-withdraw-request-data-view"
                defaultLayouts={ { ...defaultLayouts } }
                fields={ fields }
                getItemId={ ( item ) => item.id }
                onChangeView={ fetchWithdraw }
                search={ false }
                paginationInfo={ {
                    totalItems: withdrawRequests?.totalItems,
                    totalPages: withdrawRequests?.totalPages,
                } }
                view={ {
                    ...withdrawRequests?.view,
                    layout: { ...defaultLayouts },
                    fields: fields.map( ( field ) =>
                        field.id !== withdrawRequests?.view?.titleField
                            ? field.id
                            : ''
                    ),
                } }
                actions={ actions }
                isLoading={ loading }
            />

            <DokanModal
                isOpen={ isOpen }
                namespace="cancel-request-confirmation"
                onConfirm={ () => canclePendingRequest() }
                onClose={ () => setIsOpen( false ) }
                confirmationTitle={ __( 'Are you sure', 'dokan-lite' ) }
                confirmationDescription={ __(
                    'You want to cancel this request?',
                    'dokan-lite'
                ) }
                confirmButtonText={ __( 'Yes', 'dokan' ) }
                cancelButtonText={ __( 'No', 'dokan' ) }
                loading={ withdrawHook.isLoading }
            />
        </>
    );
}

export default RequestList;
