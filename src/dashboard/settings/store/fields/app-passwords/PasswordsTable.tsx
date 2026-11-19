import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Spinner } from '@wedevs/plugin-ui';
import { DataViews } from '@dokan/components';
import { Trash2 } from 'lucide-react';
import { deleteButtonClass } from '../shared';
import { formatDate, type AppPassword } from './utils';

type Props = {
    rows: AppPassword[];
    loading: boolean;
    error: string;
    onRevoke: ( row: AppPassword ) => void;
    onRevokeAll: () => void;
};

const muted = ( text: string ) => (
    <span className="text-sm whitespace-nowrap text-gray-600">{ text }</span>
);

// The listed passwords: WordPress keeps only a hash, so a row can be revoked but never read back.
const PasswordsTable = ( {
    rows,
    loading,
    error,
    onRevoke,
    onRevokeAll,
}: Props ) => {
    const [ view, setView ] = useState( {
        type: 'table',
        perPage: 100,
        page: 1,
        fields: [ 'name', 'created', 'last_used', 'last_ip', 'actions' ],
        layout: {
            styles: {
                name: { width: '30%' },
                created: { width: '20%' },
                last_used: { width: '20%' },
                last_ip: { width: '20%' },
                actions: { width: '10%' },
            },
        },
    } );

    const fields = [
        {
            id: 'name',
            label: __( 'Name', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: AppPassword } ) => (
                <span className="text-sm font-semibold break-words text-gray-900">
                    { item.name }
                </span>
            ),
        },
        {
            id: 'created',
            label: __( 'Created', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: AppPassword } ) =>
                muted( formatDate( item.created ) ),
        },
        {
            id: 'last_used',
            label: __( 'Last Used', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: AppPassword } ) =>
                muted( formatDate( item.last_used ) ),
        },
        {
            id: 'last_ip',
            label: __( 'Last IP', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: AppPassword } ) =>
                muted( item.last_ip || '—' ),
        },
        {
            id: 'actions',
            label: __( 'Actions', 'dokan-lite' ),
            enableSorting: false,
            enableHiding: false,
            render: ( { item }: { item: AppPassword } ) => (
                <div className="flex w-full items-center justify-end">
                    <button
                        type="button"
                        className={ deleteButtonClass }
                        onClick={ () => onRevoke( item ) }
                    >
                        <Trash2 size={ 14 } />
                        { __( 'Revoke', 'dokan-lite' ) }
                    </button>
                </div>
            ),
        },
    ];

    const hasRows = ! loading && ! error && rows.length > 0;

    return (
        <>
            { loading && (
                <div className="flex items-center gap-2 px-4 pb-4 text-sm text-gray-500">
                    <Spinner className="size-4" />
                    { __(
                        'Loading your application passwords…',
                        'dokan-lite'
                    ) }
                </div>
            ) }

            { ! loading && error && (
                <div role="alert" className="px-4 pb-4 text-sm text-red-600">
                    { error }
                </div>
            ) }

            { hasRows && (
                <DataViews
                    namespace="dokan-vendor-app-passwords"
                    data={ rows }
                    fields={ fields }
                    view={ view }
                    onChangeView={ setView }
                    getItemId={ ( item: AppPassword ) => item.uuid }
                    paginationInfo={ {
                        totalItems: rows.length,
                        totalPages: 1,
                    } }
                    search={ false }
                    responsive={ false }
                />
            ) }

            { /* One password is revoked from its own row; the trailing row (store-locations pattern) is for clearing several at once. */ }
            { hasRows && rows.length > 1 && (
                <div className="border-t border-gray-200">
                    <button
                        type="button"
                        className="text-dokan-btn-danger flex cursor-pointer items-center gap-2 border-0 bg-transparent py-4 pl-4 text-sm font-medium transition-opacity hover:opacity-80 focus:outline-none!"
                        onClick={ onRevokeAll }
                    >
                        <Trash2 size={ 16 } />
                        { __(
                            'Revoke All Application Passwords',
                            'dokan-lite'
                        ) }
                    </button>
                </div>
            ) }

            { ! loading && ! error && 0 === rows.length && (
                <div className="px-4 pb-4">
                    <span className="block rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                        { __(
                            'You have no application passwords yet.',
                            'dokan-lite'
                        ) }
                    </span>
                </div>
            ) }
        </>
    );
};

export default PasswordsTable;
