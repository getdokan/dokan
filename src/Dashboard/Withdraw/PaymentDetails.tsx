import {
    Button,
    Card,
    MaskedInput,
    Modal,
    SimpleAlert,
    SimpleInput,
    SimpleSelect,
} from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import PriceHtml from '../../Components/PriceHtml';
import DateTimeHtml from '../../Components/DateTimeHtml';
import { UseBalanceReturn } from './Hooks/useBalance';
import { twMerge } from 'tailwind-merge';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import {
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from '@wordpress/element';
import { DataTable } from '../../Components/DataTable';

const Loader = () => {
    return (
        <Card>
            <Card.Header>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </Card.Header>
            <Card.Body>
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </Card.Body>
        </Card>
    );
};
function PaymentDetails( {
    bodyData,
    masterLoading,
    withdrawRequests,
}: {
    bodyData: UseBalanceReturn;
    masterLoading: boolean;
    withdrawRequests: UseWithdrawRequestsReturn;
} ) {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ cancelRequestId, setCancelRequestId ] = useState( '' );

    const canclePendingRequest = () => {
        console.log( cancelRequestId );
        setIsOpen( false );
    };

    const columns = useMemo(
        () => [
            {
                header: __( 'Amount', 'dokan-lite' ),
                accessorKey: 'amount',
                cell( { getValue } ) {
                    // @ts-ignore
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
            {
                header: __( 'Cancel', 'dokan' ),
                accessorKey: 'id',
                cell( { getValue } ) {
                    return (
                        <p
                            className="whitespace-normal m-0 hover:underline cursor-pointer"
                            onClick={ () => {
                                setCancelRequestId( getValue );
                                setIsOpen( true );
                            } }
                        >
                            { __( 'Cancel', 'dokan' ) }
                        </p>
                    );
                },
            },
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
        []
    );
    const fallbackData = [];
    const table = useReactTable( {
        data: withdrawRequests?.data ?? fallbackData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        pageCount: 1,
        rowCount: Array.isArray( withdrawRequests?.data )
            ? withdrawRequests?.data.length
            : 0,
        manualPagination: false,
    } );

    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading ||
        masterLoading
    ) {
        return <Loader />;
    }

    return (
        <>
            <Card>
                <Card.Header>
                    <Card.Title className="p-0 m-0">Payment Details</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">
                                    { __( 'Last Payment', 'dokan' ) }
                                </h4>
                                { bodyData?.data?.last_withdraw?.id ? (
                                    <p className="flex">
                                        <strong>
                                            <PriceHtml
                                                price={
                                                    bodyData?.data
                                                        ?.last_withdraw
                                                        ?.amount ?? ''
                                                }
                                            />
                                        </strong>
                                        &nbsp;{ __( 'on', 'dokan' ) }&nbsp;
                                        <strong>
                                            <em>
                                                <DateTimeHtml.Date
                                                    date={
                                                        bodyData?.data
                                                            ?.last_withdraw
                                                            ?.date ?? ''
                                                    }
                                                />
                                            </em>
                                        </strong>
                                        &nbsp;{ __( 'to', 'dokan' ) }&nbsp;
                                        <strong>
                                            { bodyData?.data?.last_withdraw
                                                ?.method_title ?? '' }
                                        </strong>
                                    </p>
                                ) : (
                                    <p className="text-gray-600">
                                        { __(
                                            'You do not have any approved withdraw yet.',
                                            'dokan'
                                        ) }
                                    </p>
                                ) }
                            </div>
                            <Button color="gray" className="mt-4 sm:mt-0">
                                View Payments
                            </Button>
                        </div>

                        { ! withdrawRequests?.isLoading &&
                            withdrawRequests?.data &&
                            Array.isArray( withdrawRequests?.data ) &&
                            withdrawRequests?.data.length > 0 && (
                                <div className="flex flex-col border-t pt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">
                                        { __( 'Pending Requests', 'dokan' ) }
                                    </h4>
                                    <DataTable table={ table } />
                                </div>
                            ) }
                    </div>
                </Card.Body>
            </Card>

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
                        >
                            { __( 'No', 'dokan' ) }
                        </Button>

                        <Button
                            color="secondary"
                            className="bg-gray-50 hover:bg-gray-100"
                            onClick={ canclePendingRequest }
                        >
                            { __( 'Yes', 'dokan' ) }
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default PaymentDetails;
