import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Button, toast, type SettingsElement } from '@wedevs/plugin-ui';
import { MediaUploader } from '@dokan/components';
import { Settings, Upload, X } from 'lucide-react';
import type { VerificationMethod, WizardAttachment } from './types';

type RowState = {
    open: boolean;
    attachment: WizardAttachment | null;
    submitting: boolean;
    status: VerificationMethod[ 'status' ];
    requestId: number;
};

const statusLabel: Record< string, string > = {
    pending: __( 'Pending review', 'dokan-lite' ),
    approved: __( 'Verified', 'dokan-lite' ),
    rejected: __( 'Rejected', 'dokan-lite' ),
};

// `verification_methods` variant — rows driven by the schema element Pro
// builds (methods, endpoints, vendor id). Documents come from the WordPress
// media library (same picker as the store banner/logo settings); requests go
// through the vendor-verification module's endpoint. Mirrors the legacy
// lifecycle: pending can be cancelled for a re-submission, rejected can be
// re-submitted, approved is final.
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
                    attachment: null,
                    submitting: false,
                    status: method.status,
                    requestId: method.requestId ?? 0,
                },
            ] )
        )
    );

    const patchRow = ( id: number, patch: Partial< RowState > ) =>
        setRows( ( prev ) => ( {
            ...prev,
            [ id ]: { ...prev[ id ], ...patch },
        } ) );

    // Admin-authored help text with a generic fallback — shown under the row title.
    const methodHelp = ( method: VerificationMethod ): string =>
        method.help ||
        sprintf(
            /* translators: %s: verification method title */
            __(
                'Please upload a scanned copy or photo of your %s.',
                'dokan-lite'
            ),
            method.title
        );

    const submit = async ( method: VerificationMethod ) => {
        const row = rows[ method.id ];

        if ( ! row?.attachment || ! endpoints ) {
            return;
        }

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

            patchRow( method.id, {
                submitting: false,
                open: false,
                attachment: null,
                status: 'pending',
                requestId: Number( created?.id ) || 0,
            } );
            toast.success(
                __( 'Verification request submitted.', 'dokan-lite' )
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

    // Legacy parity: a pending request can be withdrawn, freeing the method
    // for a fresh submission (the endpoint pins vendor-sent statuses to cancelled).
    const cancelRequest = async ( method: VerificationMethod ) => {
        const row = rows[ method.id ];

        if ( ! row?.requestId || ! endpoints ) {
            return;
        }

        patchRow( method.id, { submitting: true } );

        try {
            await apiFetch( {
                path: `${ endpoints.createRequest }/${ row.requestId }`,
                method: 'PUT',
                data: { status: 'cancelled' },
            } );

            patchRow( method.id, {
                submitting: false,
                status: '',
                requestId: 0,
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
                                    { method.required && (
                                        <span className="text-xs font-normal text-red-500">
                                            { __( '(Required)', 'dokan-lite' ) }
                                        </span>
                                    ) }
                                    { /* Status rides beside the label; the right side stays for actions. */ }
                                    { chip && (
                                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                            { chip }
                                        </span>
                                    ) }
                                </span>
                                { /* The method's own guidance doubles as the row's breathing room. */ }
                                <span className="text-xs leading-5 font-normal text-gray-500">
                                    { methodHelp( method ) }
                                </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2">
                                { 'pending' === row?.status && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        disabled={ row.submitting }
                                        onClick={ () =>
                                            cancelRequest( method )
                                        }
                                    >
                                        { __( 'Cancel', 'dokan-lite' ) }
                                    </Button>
                                ) }
                                { canStart && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={ () =>
                                            patchRow( method.id, {
                                                open: true,
                                            } )
                                        }
                                    >
                                        { /* Same glyph as the settings page's "Set Details" chip. */ }
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
                                { /* Same anatomy as the admin settings uploader (WpMediaUpload):
                                     thumb + destructive remove badge + outline Change button — but
                                     through MediaUploader, which keeps the attachment ID the
                                     verification endpoint needs (WpMediaUpload only emits a URL).
                                     Centered in the drop-zone panel per the step's design. */ }
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
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        onClick={ () =>
                                            patchRow( method.id, {
                                                open: false,
                                                attachment: null,
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
