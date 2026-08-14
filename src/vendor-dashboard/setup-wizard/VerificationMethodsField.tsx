import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import apiFetch from '@wordpress/api-fetch';
import { Button, toast, type SettingsElement } from '@wedevs/plugin-ui';
import { MediaUploader } from '@dokan/components';
import { RequiredBadge } from '@src/dashboard/settings/store/fields/shared';
import { Settings, Upload, X } from 'lucide-react';
import type { VerificationMethod, WizardAttachment } from './types';

type RowState = {
    open: boolean;
    attachment: WizardAttachment | null;
    submitting: boolean;
    status: VerificationMethod[ 'status' ];
    requestId: number;
};

// Shared chrome for the outline buttons in this field.
const outlineButtonClass =
    'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900';

// Roomier than the sm default's px-2.5 so the short row labels don't read cramped.
const rowActionPadding = 'px-4';
const rowActionClass = `${ rowActionPadding } ${ outlineButtonClass }`;

const statusLabel: Record< string, string > = {
    pending: __( 'Pending review', 'dokan-lite' ),
    approved: __( 'Verified', 'dokan-lite' ),
    rejected: __( 'Rejected', 'dokan-lite' ),
};

// The document belongs to a live submission: Edit opens on it, a fresh
// submission starts empty rather than resurrecting a withdrawn or rejected file.
const liveDocument = ( method: VerificationMethod ) =>
    'pending' === method.status ? method.document ?? null : null;

// `verification_methods` variant — pending can be edited in place or cancelled, rejected can re-submit, approved is final.
const VerificationMethodsField = ( {
    element,
}: {
    element: SettingsElement;
} ) => {
    const methods = ( element.methods as VerificationMethod[] ) || [];
    const endpoints = element.endpoints as
        | { createRequest: string }
        | undefined;
    const vendorId = Number( element.vendor_id ) || 0;

    const [ rows, setRows ] = useState< Record< number, RowState > >( () =>
        Object.fromEntries(
            methods.map( ( method ) => [
                method.id,
                {
                    open: false,
                    attachment: liveDocument( method ),
                    submitting: false,
                    status: method.status,
                    requestId: method.requestId ?? 0,
                },
            ] )
        )
    );

    const patchRow = ( id: number, patch: Partial< RowState > ) => {
        setRows( ( prev ) => ( {
            ...prev,
            [ id ]: { ...prev[ id ], ...patch },
        } ) );

        // The step is bootstrapped once, so a revisit remounts from it — keep the request state in step with the server.
        const method = methods.find( ( item ) => item.id === id );

        if ( ! method ) {
            return;
        }

        if ( undefined !== patch.status ) {
            method.status = patch.status;
        }

        if ( undefined !== patch.requestId ) {
            method.requestId = patch.requestId;
        }
    };

    // Arrives tag-stripped from the server, so only its entities need decoding.
    const methodHelp = ( method: VerificationMethod ): string =>
        decodeEntities( method.help || '' ) ||
        sprintf(
            /* translators: %s: verification method title */
            __(
                'Please upload a scanned copy or photo of your %s.',
                'dokan-lite'
            ),
            method.title
        );

    // The endpoint pins a vendor-sent status to cancelled, so this is the only request change they can make.
    const retireRequest = ( requestId: number ) =>
        apiFetch( {
            path: `${ endpoints?.createRequest }/${ requestId }`,
            method: 'PUT',
            data: { status: 'cancelled' },
        } );

    const submit = async ( method: VerificationMethod ) => {
        const row = rows[ method.id ];

        if ( ! row?.attachment || ! endpoints ) {
            return;
        }

        const replacedRequestId = row.requestId;

        patchRow( method.id, { submitting: true } );

        try {
            const created = await apiFetch< { id?: number } >( {
                path: endpoints.createRequest,
                method: 'POST',
                data: {
                    vendor_id: vendorId,
                    method_id: method.id,
                    documents: [ row.attachment.id ],
                },
            } );

            method.document = row.attachment;

            patchRow( method.id, {
                submitting: false,
                open: false,
                status: 'pending',
                requestId: Number( created?.id ) || 0,
            } );

            // Retired only once the replacement exists, so a failure here can't cost the vendor their submission — it leaves a stale row the admin sees superseded.
            if ( replacedRequestId ) {
                retireRequest( replacedRequestId ).catch( () => {} );
            }

            toast.success(
                replacedRequestId
                    ? __( 'Verification document updated.', 'dokan-lite' )
                    : __( 'Verification request submitted.', 'dokan-lite' )
            );
        } catch ( error ) {
            patchRow( method.id, { submitting: false } );
            toast.error(
                ( error as { message?: string } )?.message ||
                    __(
                        'Could not submit the verification request.',
                        'dokan-lite'
                    )
            );
        }
    };

    // Legacy parity: withdrawing a pending request frees the method for a fresh submission.
    const cancelRequest = async ( method: VerificationMethod ) => {
        const row = rows[ method.id ];

        if ( ! row?.requestId || ! endpoints ) {
            return;
        }

        patchRow( method.id, { submitting: true } );

        try {
            await retireRequest( row.requestId );

            method.document = null;

            patchRow( method.id, {
                submitting: false,
                status: '',
                requestId: 0,
                // The withdrawn file isn't under review any more, so the next submission starts clean.
                attachment: null,
            } );
            toast.success(
                __( 'Verification request cancelled.', 'dokan-lite' )
            );
        } catch ( error ) {
            patchRow( method.id, { submitting: false } );
            toast.error(
                ( error as { message?: string } )?.message ||
                    __(
                        'Could not cancel the verification request.',
                        'dokan-lite'
                    )
            );
        }
    };

    return (
        // No card chrome of its own — the engine's section card is the frame.
        <div className="flex w-full flex-col">
            { methods.map( ( method, index ) => {
                const row = rows[ method.id ];
                const chip = statusLabel[ row?.status ?? '' ];
                // While the panel is open its own Submit/Cancel take over, so the row actions step aside.
                const isPending = ! row?.open && 'pending' === row?.status;
                // Rejected (like cancelled) may submit again — only pending/approved lock the row.
                const canStart =
                    ! row?.open &&
                    ! [ 'pending', 'approved' ].includes( row?.status ?? '' );

                return (
                    <div
                        key={ method.id }
                        className={
                            index > 0 ? 'border-t border-gray-200' : undefined
                        }
                    >
                        <div className="flex items-center justify-between gap-3 px-4 py-3">
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                    { method.title }
                                    { method.required && <RequiredBadge /> }
                                    { chip && (
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            { chip }
                                        </span>
                                    ) }
                                </span>
                                <span className="text-xs leading-5 font-normal text-gray-500">
                                    { methodHelp( method ) }
                                </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2">
                                { isPending && (
                                    // The filled action sits last, like the footer's Skip/Next pair.
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={ rowActionClass }
                                            disabled={ row.submitting }
                                            onClick={ () =>
                                                cancelRequest( method )
                                            }
                                        >
                                            { __( 'Cancel', 'dokan-lite' ) }
                                        </Button>
                                        <Button
                                            size="sm"
                                            className={ rowActionPadding }
                                            disabled={ row.submitting }
                                            onClick={ () =>
                                                patchRow( method.id, {
                                                    open: true,
                                                } )
                                            }
                                        >
                                            { __( 'Edit', 'dokan-lite' ) }
                                        </Button>
                                    </>
                                ) }
                                { canStart && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={ `gap-2 ${ outlineButtonClass }` }
                                        onClick={ () =>
                                            patchRow( method.id, {
                                                open: true,
                                            } )
                                        }
                                    >
                                        <Settings
                                            size={ 14 }
                                            aria-hidden="true"
                                            className="fill-none"
                                        />
                                        { __(
                                            'Start Verification',
                                            'dokan-lite'
                                        ) }
                                    </Button>
                                ) }
                            </span>
                        </div>

                        { row?.open && (
                            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4">
                                { /* MediaUploader, not WpMediaUpload: the endpoint needs the attachment ID, which WpMediaUpload doesn't emit. */ }
                                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
                                    { row.attachment && (
                                        <span className="relative inline-flex">
                                            <img
                                                src={ row.attachment.url }
                                                alt=""
                                                title={
                                                    row.attachment.filename
                                                }
                                                className="h-16 w-16 rounded-md border border-border bg-muted object-contain p-1"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                title={ __(
                                                    'Remove',
                                                    'dokan-lite'
                                                ) }
                                                aria-label={ __(
                                                    'Remove',
                                                    'dokan-lite'
                                                ) }
                                                onClick={ () =>
                                                    patchRow( method.id, {
                                                        attachment: null,
                                                    } )
                                                }
                                                className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0"
                                            >
                                                <X
                                                    size={ 10 }
                                                    strokeWidth={ 3 }
                                                    aria-hidden="true"
                                                    className="fill-none"
                                                />
                                            </Button>
                                        </span>
                                    ) }

                                    { row.attachment && (
                                        // overflow-wrap keeps a long unbroken filename from widening the card's intrinsic width.
                                        <span className="line-clamp-1 max-w-full text-xs text-gray-500 [overflow-wrap:anywhere]">
                                            { row.attachment.filename }
                                        </span>
                                    ) }

                                    <MediaUploader
                                        onSelect={ (
                                            attachment: WizardAttachment & {
                                                title?: string;
                                            }
                                        ) =>
                                            patchRow( method.id, {
                                                attachment: {
                                                    id: attachment.id,
                                                    url: attachment.url,
                                                    filename:
                                                        attachment.filename ||
                                                        attachment.title ||
                                                        '',
                                                },
                                            } )
                                        }
                                        title={ sprintf(
                                            /* translators: %s: verification method title */
                                            __(
                                                'Select a document for %s',
                                                'dokan-lite'
                                            ),
                                            method.title
                                        ) }
                                        className="inline-flex"
                                    >
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="pointer-events-none gap-1.5 border-gray-200 bg-white text-gray-700"
                                        >
                                            <Upload
                                                size={ 14 }
                                                aria-hidden="true"
                                                className="fill-none"
                                            />
                                            { row.attachment
                                                ? __( 'Change', 'dokan-lite' )
                                                : __(
                                                      'Upload File',
                                                      'dokan-lite'
                                                  ) }
                                        </Button>
                                    </MediaUploader>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        disabled={
                                            ! row.attachment || row.submitting
                                        }
                                        onClick={ () => submit( method ) }
                                    >
                                        { row.submitting
                                            ? __( 'Submitting…', 'dokan-lite' )
                                            : __( 'Submit', 'dokan-lite' ) }
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={ outlineButtonClass }
                                        onClick={ () =>
                                            patchRow( method.id, {
                                                open: false,
                                                attachment:
                                                    liveDocument( method ),
                                            } )
                                        }
                                    >
                                        { __( 'Cancel', 'dokan-lite' ) }
                                    </Button>
                                </div>
                            </div>
                        ) }
                    </div>
                );
            } ) }
        </div>
    );
};

export default VerificationMethodsField;
