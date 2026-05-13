import { __ } from '@wordpress/i18n';
import PriceHtml from '../../components/PriceHtml';
import DateTimeHtml from '../../components/DateTimeHtml';

export type WithdrawStatus = 'pending' | 'approved' | 'cancelled';

export interface WithdrawRequest {
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

export const DEFAULT_LAYOUTS = {
    table: { density: 'comfortable' },
    list: {},
};

export const allStatusLabels: Record< WithdrawStatus, string > = {
    pending: __( 'Pending Review', 'dokan-lite' ),
    approved: __( 'Approved', 'dokan-lite' ),
    cancelled: __( 'Cancelled', 'dokan-lite' ),
};

export const baseFields = [
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

export const statusField = {
    id: 'status',
    label: __( 'Status', 'dokan-lite' ),
    enableSorting: false,
    render: ( { item }: { item: WithdrawRequest } ) => (
        <span>{ allStatusLabels[ item?.status as WithdrawStatus ] }</span>
    ),
};

export const noteField = {
    id: 'note',
    label: __( 'Note', 'dokan-lite' ),
    enableSorting: false,
    render: ( { item }: { item: WithdrawRequest } ) => (
        <span>{ item?.note }</span>
    ),
};

export const getFieldsForStatus = ( status: WithdrawStatus ) => [
    ...baseFields,
    ...( status === 'pending' ? [ statusField ] : [] ),
    ...( status === 'cancelled' ? [ noteField ] : [] ),
];
