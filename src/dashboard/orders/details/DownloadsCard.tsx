import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Ban, CalendarDays, Search } from 'lucide-react';
import { useToast } from '@getdokan/dokan-ui';
import { Input } from '@wedevs/plugin-ui';
import {
    DokanButton,
    ProductAsyncSelect,
    WpDatePicker,
} from '@dokan/components';
import { formatSiteDate } from './dateTime';
import SectionCard from './SectionCard';
import useOrderDownloads from './useOrderDownloads';
import { useOrderDetailsContext } from './OrderDetailsContext';
import type { OrderDownloadPermission } from './types';

interface ProductOption {
    value: number;
    label: string;
}

interface RowEdit {
    downloads_remaining: string;
    access_expires: string;
}

const daysLeft = ( expires: string | null ): string => {
    if ( ! expires ) {
        return '';
    }

    const days = Math.ceil(
        ( new Date( `${ expires }T00:00:00` ).getTime() - Date.now() ) /
            ( 1000 * 60 * 60 * 24 )
    );

    if ( days < 0 ) {
        return __( 'Expired', 'dokan-lite' );
    }

    /* translators: %d: number of days until download access expires */
    return sprintf( __( '%d days left', 'dokan-lite' ), days );
};

/**
 * Downloadable Product Permission card per the mockup: search + grant, and per
 * permission an editable downloads limit and expiry with usage hints, saved by
 * the card-level Update action.
 */
const DownloadsCard = () => {
    const { orderId } = useOrderDetailsContext();
    const toast = useToast();
    const { permissions, isLoading, grantAccess, revokeAccess, refetch } =
        useOrderDownloads( orderId );

    const [ selected, setSelected ] = useState< ProductOption | null >( null );
    const [ isGranting, setIsGranting ] = useState( false );
    const [ isSavingRows, setIsSavingRows ] = useState( false );
    const [ confirmingRevoke, setConfirmingRevoke ] = useState< number >( 0 );
    const [ edits, setEdits ] = useState< Record< number, RowEdit > >( {} );

    useEffect( () => {
        const next: Record< number, RowEdit > = {};
        permissions.forEach( ( permission ) => {
            next[ permission.permission_id ] = {
                downloads_remaining: permission.downloads_remaining ?? '',
                access_expires: permission.access_expires ?? '',
            };
        } );
        setEdits( next );
    }, [ permissions ] );

    const handleGrant = async () => {
        if ( ! selected ) {
            return;
        }

        setIsGranting( true );

        try {
            const created = await grantAccess( [ Number( selected.value ) ] );

            toast( {
                type: created.length ? 'success' : 'warning',
                title: created.length
                    ? __( 'Download access granted.', 'dokan-lite' )
                    : __(
                          'No downloadable files found on that product.',
                          'dokan-lite'
                      ),
            } );
            setSelected( null );
        } catch ( grantError ) {
            toast( {
                type: 'error',
                title:
                    ( grantError as { message?: string } )?.message ||
                    __( 'Could not grant download access.', 'dokan-lite' ),
            } );
        } finally {
            setIsGranting( false );
        }
    };

    const handleRevoke = async ( permissionId: number ) => {
        try {
            await revokeAccess( permissionId );
            toast( {
                type: 'success',
                title: __( 'Download access revoked.', 'dokan-lite' ),
            } );
        } catch ( revokeError ) {
            toast( {
                type: 'error',
                title:
                    ( revokeError as { message?: string } )?.message ||
                    __( 'Could not revoke download access.', 'dokan-lite' ),
            } );
        } finally {
            setConfirmingRevoke( 0 );
        }
    };

    const isRowDirty = ( permission: OrderDownloadPermission ): boolean => {
        const edit = edits[ permission.permission_id ];

        if ( ! edit ) {
            return false;
        }

        return (
            edit.downloads_remaining !==
                ( permission.downloads_remaining ?? '' ) ||
            edit.access_expires !== ( permission.access_expires ?? '' )
        );
    };

    const handleUpdate = async () => {
        const dirty = permissions.filter( isRowDirty );

        if ( ! dirty.length ) {
            return;
        }

        setIsSavingRows( true );

        try {
            await Promise.all(
                dirty.map( ( permission ) =>
                    apiFetch( {
                        path: `/dokan/v1/orders/${ orderId }/downloads/${ permission.permission_id }`,
                        method: 'PUT',
                        data: edits[ permission.permission_id ],
                    } )
                )
            );

            toast( {
                type: 'success',
                title: __( 'Download permissions updated.', 'dokan-lite' ),
            } );
            refetch();
        } catch ( updateError ) {
            toast( {
                type: 'error',
                title:
                    ( updateError as { message?: string } )?.message ||
                    __(
                        'Could not update download permissions.',
                        'dokan-lite'
                    ),
            } );
        } finally {
            setIsSavingRows( false );
        }
    };

    const hasDirtyRows = permissions.some( isRowDirty );

    return (
        <SectionCard
            title={ __( 'Downloadable Product Permission', 'dokan-lite' ) }
            contentClassName="px-0"
        >
            <div className="px-6 pb-4">
                <p className="mb-2 text-sm font-semibold text-[#25252D]">
                    { __( 'Add products', 'dokan-lite' ) }
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="min-w-0 flex-1">
                        <ProductAsyncSelect
                            value={ selected }
                            onChange={ ( option ) =>
                                setSelected( option as ProductOption | null )
                            }
                            extraQuery={ { downloadable: true } }
                            icon={
                                <Search size={ 16 } className="text-gray-400" />
                            }
                            placeholder={ __(
                                'Search Downloadable Products',
                                'dokan-lite'
                            ) }
                            isClearable
                        />
                    </div>
                    { selected && (
                        <DokanButton
                            onClick={ handleGrant }
                            disabled={ isGranting }
                            loading={ isGranting }
                        >
                            { __( 'Grant Access', 'dokan-lite' ) }
                        </DokanButton>
                    ) }
                </div>
            </div>

            { ! isLoading && permissions.length > 0 && (
                <div className="flex flex-col divide-y divide-[#E9E9E9] border-t border-[#E9E9E9]">
                    { permissions.map( ( permission ) => {
                        const edit = edits[ permission.permission_id ] ?? {
                            downloads_remaining: '',
                            access_expires: '',
                        };

                        return (
                            <div
                                key={ permission.permission_id }
                                className="flex flex-col gap-3.5 px-6 py-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <img
                                            src={ permission.product_image }
                                            alt=""
                                            className="h-9 w-9 shrink-0 rounded border border-gray-200 object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-800">
                                                { `#${ permission.product_id } — ${ permission.product_name }` }
                                            </p>
                                            { permission.file_name && (
                                                <p className="truncate text-xs text-gray-400">
                                                    { permission.file_name }
                                                </p>
                                            ) }
                                        </div>
                                    </div>
                                    { confirmingRevoke ===
                                    permission.permission_id ? (
                                        <span className="flex shrink-0 items-center gap-2 text-xs">
                                            <button
                                                type="button"
                                                className="border-0! bg-transparent! p-0! shadow-none! font-medium text-red-600!"
                                                onClick={ () =>
                                                    handleRevoke(
                                                        permission.permission_id
                                                    )
                                                }
                                            >
                                                { __(
                                                    'Confirm',
                                                    'dokan-lite'
                                                ) }
                                            </button>
                                            <button
                                                type="button"
                                                className="border-0! bg-transparent! p-0! shadow-none! text-gray-500!"
                                                onClick={ () =>
                                                    setConfirmingRevoke( 0 )
                                                }
                                            >
                                                { __( 'Cancel', 'dokan-lite' ) }
                                            </button>
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="inline-flex shrink-0 items-center gap-1.5 border-0! bg-transparent! p-0! shadow-none! text-sm font-medium text-red-500!"
                                            onClick={ () =>
                                                setConfirmingRevoke(
                                                    permission.permission_id
                                                )
                                            }
                                        >
                                            <Ban size={ 14 } />
                                            { __( 'Revoke', 'dokan-lite' ) }
                                        </button>
                                    ) }
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#25252D]">
                                            { __(
                                                'Downloads Limit',
                                                'dokan-lite'
                                            ) }
                                        </span>
                                        <span className="text-xs text-[#828282]">
                                            { sprintf(
                                                /* translators: 1: times downloaded 2: download limit */
                                                __(
                                                    'Downloaded %1$s/%2$s',
                                                    'dokan-lite'
                                                ),
                                                permission.download_count ?? 0,
                                                permission.downloads_remaining ||
                                                    '∞'
                                            ) }
                                        </span>
                                    </div>
                                    <Input
                                        type="number"
                                        min={ 0 }
                                        className="border-[#E9E9E9] shadow-none"
                                        placeholder={ __(
                                            'Put blank for unlimited downloads',
                                            'dokan-lite'
                                        ) }
                                        value={ edit.downloads_remaining }
                                        onChange={ ( event ) =>
                                            setEdits( ( previous ) => ( {
                                                ...previous,
                                                [ permission.permission_id ]: {
                                                    ...edit,
                                                    downloads_remaining:
                                                        event.target.value,
                                                },
                                            } ) )
                                        }
                                    />
                                </div>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#25252D]">
                                            { __( 'Expires', 'dokan-lite' ) }
                                        </span>
                                        <span className="text-xs text-[#828282]">
                                            { daysLeft(
                                                edit.access_expires || null
                                            ) }
                                        </span>
                                    </div>
                                    <WpDatePicker
                                        currentDate={
                                            edit.access_expires || undefined
                                        }
                                        onChange={ ( picked ) =>
                                            setEdits( ( previous ) => ( {
                                                ...previous,
                                                [ permission.permission_id ]: {
                                                    ...edit,
                                                    access_expires: String(
                                                        picked ?? ''
                                                    ).slice( 0, 10 ),
                                                },
                                            } ) )
                                        }
                                    >
                                        <div className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-[#E9E9E9] bg-white px-3 text-sm">
                                            <CalendarDays
                                                size={ 15 }
                                                className="text-gray-400"
                                            />
                                            { edit.access_expires ? (
                                                <span className="text-[#25252D]">
                                                    { formatSiteDate(
                                                        edit.access_expires
                                                    ) }
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    { __(
                                                        'Put blank for never expires',
                                                        'dokan-lite'
                                                    ) }
                                                </span>
                                            ) }
                                        </div>
                                    </WpDatePicker>
                                </div>
                            </div>
                        );
                    } ) }

                    <div className="flex justify-end px-6 pt-4">
                        <DokanButton
                            onClick={ handleUpdate }
                            disabled={ isSavingRows || ! hasDirtyRows }
                            loading={ isSavingRows }
                        >
                            { __( 'Update', 'dokan-lite' ) }
                        </DokanButton>
                    </div>
                </div>
            ) }
        </SectionCard>
    );
};

export default DownloadsCard;
