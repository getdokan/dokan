import { Button, Modal, SimpleAlert, useToast } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { DataTable } from '../../Components/DataTable';
import { useEffect, useMemo, useState } from '@wordpress/element';
import PriceHtml from '../../Components/PriceHtml';
import DateTimeHtml from '../../Components/DateTimeHtml';
import {
    getCoreRowModel,
    getPaginationRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table';
import { useWithdraw } from './Hooks/useWithdraw';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import Pagination from '../../Components/Pagination';
import { useNavigate } from 'react-router-dom';

function RequestList( {
    withdrawRequests,
    status = 'pending',
}: {
    withdrawRequests: UseWithdrawRequestsReturn;
    status: string;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    console.log( status );

    const [ cancelRequestId, setCancelRequestId ] = useState( '' );
    const withdrawHook = useWithdraw();
    const toast = useToast();

    const columns = useMemo(
        () => [
            {
                header: __( 'Amount', 'dokan-lite' ),
                accessorKey: 'amount',
                cell( { getValue } ) {
                    return (
                        <div className="whitespace-normal m-0">
                            <PriceHtml price={ getValue() } />
                        </div>
                    );
                },
            },
            {
                header: __( 'Method', 'dokan' ),
                accessorKey: 'method_title',
                cell( { getValue } ) {
                    return (
                        <p className="whitespace-normal m-0">{ getValue() }</p>
                    );
                },
            },
            {
                header: __( 'Date', 'dokan' ),
                accessorKey: 'created',
                cell( { row, getValue } ) {
                    return (
                        <p className="whitespace-normal m-0">
                            <DateTimeHtml date={ getValue() } />
                        </p>
                    );
                },
            },
            {
                header: __( 'Charge', 'dokan' ),
                accessorKey: 'charge',
                cell( { row, getValue } ) {
                    return (
                        <p className="whitespace-normal m-0">
                            <PriceHtml price={ getValue() } />
                        </p>
                    );
                },
            },
            {
                header: __( 'Receivable', 'dokan' ),
                accessorKey: 'receivable',
                cell( { getValue, row } ) {
                    return (
                        <p className="whitespace-normal m-0">
                            <PriceHtml price={ getValue() } />
                        </p>
                    );
                },
            },
            ...( status === 'pending'
                ? [
                      {
                          header: __( 'Cancel', 'dokan' ),
                          accessorKey: 'id',
                          cell( { getValue } ) {
                              return (
                                  <button
                                      className="whitespace-normal m-0 hover:underline cursor-pointer bg-transparent hover:bg-transparent"
                                      type="button"
                                      onClick={ () => {
                                          setCancelRequestId( getValue );
                                          setIsOpen( true );
                                      } }
                                  >
                                      { __( 'Cancel', 'dokan' ) }
                                  </button>
                              );
                          },
                      },
                  ]
                : [] ),
            {
                header: __( 'Status', 'dokan' ),
                accessorKey: 'status',
                cell( { getValue } ) {
                    return (
                        <p className="whitespace-normal m-0">{ getValue() }</p>
                    );
                },
            },
        ],
        [ status ]
    );

    const fallbackData = [];
    const table = useReactTable( {
        data: withdrawRequests?.data ?? fallbackData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        pageCount: withdrawRequests.totalPages,
        rowCount: withdrawRequests.totalItems,
        manualPagination: true,
        onPaginationChange: ( updater ) => {
            // @ts-ignore
            const newPagination = updater( table.getState().pagination );
            // setPagination( updater );
            withdrawRequests.fetchWithdrawRequests( {
                ...withdrawRequests.lastPayload,
                page: newPagination.pageIndex + 1,
                status,
            } );
        },
        state: {
            pagination: { ...withdrawRequests.pagination },
        },
    } );

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

    return (
        <>
            <DataTable table={ table } />
            <Pagination table={ table } />
            <Modal
                className="max-w-2xl dokan-withdraw-style-reset dokan-layout"
                isOpen={ isOpen }
                onClose={ () => setIsOpen( false ) }
                showXButton={ false }
            >
                <Modal.Title className="border-b">
                    { __( 'Confirm', 'dokan' ) }
                </Modal.Title>
                <Modal.Content className="">
                    <SimpleAlert
                        type="warning"
                        color="gray"
                        label={ __(
                            'Are you sure, you want to cancel this request ?'
                        ) }
                    />
                </Modal.Content>
                <Modal.Footer className="border-t">
                    <div className="flex flex-row gap-3">
                        <Button
                            color="secondary"
                            className="bg-gray-50 hover:bg-gray-100"
                            onClick={ () => setIsOpen( false ) }
                            disabled={ withdrawHook.isLoading }
                            loading={ withdrawHook.isLoading }
                            label={ __( 'No', 'dokan' ) }
                        />

                        <Button
                            color="secondary"
                            className="bg-gray-50 hover:bg-gray-100"
                            onClick={ canclePendingRequest }
                            disabled={ withdrawHook.isLoading }
                            loading={ withdrawHook.isLoading }
                            label={ __( 'Yes', 'dokan' ) }
                        />
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default RequestList;
