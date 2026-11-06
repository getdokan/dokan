import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { dateI18n, getSettings } from '@wordpress/date';
import { Input, Spinner, toast, type SettingsElement } from '@wedevs/plugin-ui';
import {
    DataViews,
    DokanButton,
    DokanModal,
    DokanTooltip,
} from '@dokan/components';
import { Check, Copy, Eye, EyeOff, Info, Plus, Trash2 } from 'lucide-react';
import { RequiredMark, deleteButtonClass, editButtonClass } from './shared';

// WordPress's own route: it decides who may create, list and revoke, so this field needs no endpoint of ours.
const PATH = '/wp/v2/users/me/application-passwords';

type AppPassword = {
    uuid: string;
    name: string;
    created: string;
    last_used: string | null;
    last_ip: string | null;
};

type CreatedPassword = AppPassword & { password: string };

const messageOf = ( error: unknown, fallback: string ): string =>
    ( error as { message?: string } )?.message || fallback;

// WordPress reports these times in GMT without a zone marker.
const formatDate = ( value: string | null ): string => {
    if ( ! value ) {
        return '—';
    }

    const utc = /(?:[zZ]|[+-]\d\d:?\d\d)$/.test( value )
        ? value
        : `${ value }Z`;

    return dateI18n( getSettings().formats.date, utc );
};

// What an HTTP MCP client sends after "Authorization: Basic ": base64 of username:password, as UTF-8 so a non-Latin username survives.
const basicToken = ( username: string, password: string ): string => {
    // WordPress shows the password in groups of four and ignores the spaces when it signs the user in.
    const bytes = new TextEncoder().encode(
        `${ username }:${ password.replace( /\s+/g, '' ) }`
    );

    return window.btoa(
        Array.from( bytes, ( byte ) => String.fromCharCode( byte ) ).join( '' )
    );
};

const copyText = async ( text: string ): Promise< boolean > => {
    try {
        if ( window.isSecureContext && window.navigator?.clipboard ) {
            await window.navigator.clipboard.writeText( text );
            return true;
        }
    } catch ( error ) {
        // Fall through to the selection-based copy below.
    }

    // The Clipboard API needs HTTPS; a local http site still copies through a selection.
    const area = document.createElement( 'textarea' );
    area.value = text;
    area.setAttribute( 'readonly', '' );
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild( area );
    area.select();

    let copied = false;
    try {
        copied = document.execCommand( 'copy' );
    } catch ( error ) {
        copied = false;
    }
    document.body.removeChild( area );

    return copied;
};

// Copies on click and reports it for two seconds; shared by the token button and the in-field icon.
const useCopy = ( text: string ) => {
    const [ copied, setCopied ] = useState( false );
    const timer = useRef< number >();

    useEffect( () => () => window.clearTimeout( timer.current ), [] );

    const copy = async () => {
        if ( ! ( await copyText( text ) ) ) {
            toast.error(
                __(
                    'Could not copy. Select the text and copy it.',
                    'dokan-lite'
                )
            );
            return;
        }

        setCopied( true );
        window.clearTimeout( timer.current );
        timer.current = window.setTimeout( () => setCopied( false ), 2000 );
    };

    return { copied, copy };
};

// An icon inside a field's right end, like the copy and show/hide icons of the built-in fields; the reset keeps the theme's generic button chrome (grey fill, padding) off it.
const fieldIconClass =
    'inline-flex cursor-pointer items-center rounded-sm border-0 bg-transparent p-0 text-gray-500 shadow-none transition-colors hover:bg-transparent hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400';

const CopyIcon = ( { text, label }: { text: string; label: string } ) => {
    const { copied, copy } = useCopy( text );

    return (
        <DokanTooltip content={ copied ? __( 'Copied', 'dokan-lite' ) : label }>
            <button
                type="button"
                className={ fieldIconClass }
                aria-label={ label }
                onClick={ copy }
            >
                { copied ? (
                    <Check size={ 16 } className="text-green-600" />
                ) : (
                    <Copy size={ 16 } />
                ) }
            </button>
        </DokanTooltip>
    );
};

// `vendor_app_passwords` variant — WordPress's application passwords as a DataViews table (vacation-history pattern: header with the add action, rows flush in the card, the name asked in a modal), on the Vendor Dashboard because Vendors are not admitted to the profile screen in wp-admin. A password is shown once, right after it is created, and the same panel offers the ready-made token for as long: WordPress keeps only a hash, so a listed password can be revoked but neither read back nor turned into a token again.
const AppPasswordsField = ( { element }: { element: SettingsElement } ) => {
    const available = Boolean( element.available );
    const username = String( element.username ?? '' );

    const [ rows, setRows ] = useState< AppPassword[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( available );
    const [ listError, setListError ] = useState( '' );
    // null while the add modal is closed.
    const [ draftName, setDraftName ] = useState< string | null >( null );
    const nameInput = useRef< HTMLInputElement >( null );
    const adding = null !== draftName;
    const [ creating, setCreating ] = useState( false );
    const [ createError, setCreateError ] = useState( '' );
    const [ created, setCreated ] = useState< CreatedPassword | null >( null );
    // The new password stays blurred until the vendor asks to see it: it is copied far more often than read.
    const [ revealed, setRevealed ] = useState( false );
    const [ pendingRevoke, setPendingRevoke ] = useState< AppPassword | null >(
        null
    );
    const [ confirmingRevokeAll, setConfirmingRevokeAll ] = useState( false );
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

    useEffect( () => {
        if ( ! available ) {
            return;
        }

        let active = true;

        apiFetch< AppPassword[] >( { path: PATH } )
            .then( ( response ) => {
                if ( active ) {
                    setRows( Array.isArray( response ) ? response : [] );
                }
            } )
            .catch( ( error ) => {
                if ( active ) {
                    setListError(
                        messageOf(
                            error,
                            __(
                                'Could not load your application passwords.',
                                'dokan-lite'
                            )
                        )
                    );
                }
            } )
            .finally( () => {
                if ( active ) {
                    setLoading( false );
                }
            } );

        return () => {
            active = false;
        };
    }, [ available ] );

    // Built in the browser from the password WordPress has just handed over; nothing keeps it, so it leaves with the panel.
    const tokenCopy = useCopy(
        created ? basicToken( username, created.password ) : ''
    );

    // Each new password starts blurred again.
    useEffect( () => {
        setRevealed( false );
    }, [ created?.uuid ] );

    // The modal asks one thing, so the vendor can type the name straight away.
    useEffect( () => {
        if ( adding ) {
            nameInput.current?.focus();
        }
    }, [ adding ] );

    const closeAdd = () => {
        setDraftName( null );
        setCreateError( '' );
    };

    // The add modal's confirm: a rejection keeps the modal open with the reason in it.
    const create = async () => {
        const trimmed = ( draftName ?? '' ).trim();

        if ( ! trimmed || creating ) {
            return;
        }

        setCreating( true );
        setCreateError( '' );

        try {
            const response = await apiFetch< CreatedPassword >( {
                path: PATH,
                method: 'POST',
                data: { name: trimmed },
            } );

            // The list never holds a password: only the one-time panel does, until it is dismissed.
            setRows( ( current ) => [
                {
                    uuid: response.uuid,
                    name: response.name,
                    created: response.created,
                    last_used: response.last_used,
                    last_ip: response.last_ip,
                },
                ...current,
            ] );
            setCreated( response );
        } catch ( error ) {
            setCreateError(
                messageOf(
                    error,
                    __(
                        'Could not create the application password.',
                        'dokan-lite'
                    )
                )
            );
            throw error;
        } finally {
            setCreating( false );
        }
    };

    // Enter in the name input adds the password, like the modal's own button.
    const createFromKeyboard = async () => {
        try {
            await create();
            closeAdd();
        } catch ( error ) {
            // The modal stays open and shows the reason.
        }
    };

    const revoke = async () => {
        if ( ! pendingRevoke ) {
            return;
        }

        try {
            await apiFetch( {
                path: `${ PATH }/${ pendingRevoke.uuid }`,
                method: 'DELETE',
            } );
            setRows( ( current ) =>
                current.filter( ( row ) => row.uuid !== pendingRevoke.uuid )
            );
            // A revoked password must not stay on screen as if it still worked.
            setCreated( ( current ) =>
                current?.uuid === pendingRevoke.uuid ? null : current
            );
            toast.success(
                __( 'Application password revoked.', 'dokan-lite' )
            );
        } catch ( error ) {
            toast.error(
                messageOf(
                    error,
                    __(
                        'Could not revoke the application password.',
                        'dokan-lite'
                    )
                )
            );
        }
    };

    const revokeAll = async () => {
        try {
            await apiFetch( { path: PATH, method: 'DELETE' } );
            setRows( [] );
            setCreated( null );
            toast.success(
                __( 'All application passwords revoked.', 'dokan-lite' )
            );
        } catch ( error ) {
            toast.error(
                messageOf(
                    error,
                    __(
                        'Could not revoke the application passwords.',
                        'dokan-lite'
                    )
                )
            );
        }
    };

    const muted = ( text: string ) => (
        <span className="text-sm whitespace-nowrap text-gray-600">
            { text }
        </span>
    );

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
                        onClick={ () => setPendingRevoke( item ) }
                    >
                        <Trash2 size={ 14 } />
                        { __( 'Revoke', 'dokan-lite' ) }
                    </button>
                </div>
            ),
        },
    ];

    const heading = (
        // Grows and wraps inside its own column, so a long description never pushes the add action off the title's line.
        <div className="flex min-w-64 flex-1 flex-col gap-1">
            <span className="text-sm font-semibold text-gray-900">
                { element.title }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
        </div>
    );

    if ( ! available ) {
        return (
            <div className="dokan-vendor-app-passwords w-full">
                <div className="p-4">{ heading }</div>
                <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <Info size={ 16 } className="mt-0.5 shrink-0" />
                        <span>
                            { String( element.unavailable_text ?? '' ) }
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    const hasRows = ! loading && ! listError && rows.length > 0;

    return (
        // Same anatomy as the vacation-history table: padded header block with the add action, then the DataViews grid running flush inside the card.
        <div
            className={ `dokan-vendor-app-passwords w-full ${
                rows.length > 1 ? '' : 'pb-2'
            }` }
        >
            <div className="flex w-full flex-wrap items-center justify-between gap-3 p-4">
                { heading }
                <button
                    type="button"
                    className={ `${ editButtonClass } shrink-0` }
                    onClick={ () => setDraftName( '' ) }
                >
                    <Plus size={ 14 } />
                    { __( 'Add Application Password', 'dokan-lite' ) }
                </button>
            </div>

            { created && (
                <div className="px-4 pb-4">
                    <div
                        role="status"
                        className="flex flex-col gap-3 rounded-md border border-green-200 bg-green-50 px-4 py-3"
                    >
                        <span className="text-sm text-gray-900">
                            { sprintf(
                                /* translators: %s: application password name */
                                __(
                                    'Your new password for %s is:',
                                    'dokan-lite'
                                ),
                                created.name
                            ) }
                        </span>
                        <div className="relative w-full">
                            <code className="dokan-vendor-app-password-value block min-h-9 w-full rounded-md border border-gray-300 bg-white py-2 pr-16 pl-3 font-mono text-sm break-all text-gray-900">
                                <span
                                    className={
                                        revealed
                                            ? 'select-all'
                                            : 'blur-sm select-none'
                                    }
                                >
                                    { created.password }
                                </span>
                            </code>
                            <span className="absolute inset-y-0 right-3 flex items-center gap-3">
                                <DokanTooltip
                                    content={
                                        revealed
                                            ? __(
                                                  'Hide the password',
                                                  'dokan-lite'
                                              )
                                            : __(
                                                  'Show the password',
                                                  'dokan-lite'
                                              )
                                    }
                                >
                                    <button
                                        type="button"
                                        className={ fieldIconClass }
                                        aria-label={
                                            revealed
                                                ? __(
                                                      'Hide the password',
                                                      'dokan-lite'
                                                  )
                                                : __(
                                                      'Show the password',
                                                      'dokan-lite'
                                                  )
                                        }
                                        aria-pressed={ revealed }
                                        onClick={ () =>
                                            setRevealed( ( shown ) => ! shown )
                                        }
                                    >
                                        { revealed ? (
                                            <EyeOff size={ 16 } />
                                        ) : (
                                            <Eye size={ 16 } />
                                        ) }
                                    </button>
                                </DokanTooltip>
                                <CopyIcon
                                    text={ created.password }
                                    label={ __(
                                        'Copy the password',
                                        'dokan-lite'
                                    ) }
                                />
                            </span>
                        </div>
                        <span className="text-xs text-gray-600">
                            { __(
                                'Save it in a secure location, or copy the token for your assistant. Neither can be shown again, here or anywhere else.',
                                'dokan-lite'
                            ) }
                        </span>
                        { /* The panel's two actions as the dashboard's standard button pair: the main one filled, the way out outlined. */ }
                        <div className="flex flex-wrap items-center gap-2">
                            <DokanTooltip
                                content={ __(
                                    'Base64 of username:password. Send it as "Authorization: Basic <token>".',
                                    'dokan-lite'
                                ) }
                            >
                                <span className="inline-flex">
                                    <DokanButton
                                        type="button"
                                        variant="primary"
                                        onClick={ tokenCopy.copy }
                                    >
                                        { tokenCopy.copied ? (
                                            <Check size={ 16 } />
                                        ) : (
                                            <Copy size={ 16 } />
                                        ) }
                                        { tokenCopy.copied
                                            ? __( 'Copied', 'dokan-lite' )
                                            : __( 'Copy Token', 'dokan-lite' ) }
                                    </DokanButton>
                                </span>
                            </DokanTooltip>
                            <DokanButton
                                type="button"
                                variant="secondary"
                                onClick={ () => setCreated( null ) }
                            >
                                { __( 'Dismiss', 'dokan-lite' ) }
                            </DokanButton>
                        </div>
                    </div>
                </div>
            ) }

            { loading && (
                <div className="flex items-center gap-2 px-4 pb-4 text-sm text-gray-500">
                    <Spinner className="size-4" />
                    { __(
                        'Loading your application passwords…',
                        'dokan-lite'
                    ) }
                </div>
            ) }

            { ! loading && listError && (
                <div role="alert" className="px-4 pb-4 text-sm text-red-600">
                    { listError }
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
                        onClick={ () => setConfirmingRevokeAll( true ) }
                    >
                        <Trash2 size={ 16 } />
                        { __(
                            'Revoke All Application Passwords',
                            'dokan-lite'
                        ) }
                    </button>
                </div>
            ) }

            { ! loading && ! listError && 0 === rows.length && (
                <div className="px-4 pb-4">
                    <span className="block rounded-md border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                        { __(
                            'You have no application passwords yet.',
                            'dokan-lite'
                        ) }
                    </span>
                </div>
            ) }

            { adding && (
                <DokanModal
                    isOpen
                    namespace="dokan-vendor-app-password-add"
                    className="w-87.5! sm:w-155! sm:max-w-155!"
                    onClose={ closeAdd }
                    onConfirm={ create }
                    loading={ creating }
                    dialogTitle={ __(
                        'Add Application Password',
                        'dokan-lite'
                    ) }
                    confirmButtonText={ __( 'Add', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmButtonDisabled={ '' === draftName.trim() }
                    dialogContent={
                        <div className="dokan-location-form flex flex-col gap-4">
                            <label
                                htmlFor={ `${ element.id }-name` }
                                className="flex flex-col gap-1 text-sm text-gray-700"
                            >
                                <span>
                                    { __(
                                        'New Application Password Name',
                                        'dokan-lite'
                                    ) }{ ' ' }
                                    <RequiredMark />
                                </span>
                                <Input
                                    ref={ nameInput }
                                    id={ `${ element.id }-name` }
                                    type="text"
                                    autoComplete="off"
                                    className="min-h-[42px]"
                                    placeholder={ __(
                                        'ex - Claude',
                                        'dokan-lite'
                                    ) }
                                    value={ draftName }
                                    disabled={ creating }
                                    onChange={ ( event ) => {
                                        setDraftName( event.target.value );
                                        setCreateError( '' );
                                    } }
                                    onKeyDown={ ( event ) => {
                                        if ( 'Enter' === event.key ) {
                                            event.preventDefault();
                                            createFromKeyboard();
                                        }
                                    } }
                                />
                                <span className="text-xs text-gray-500">
                                    { __(
                                        'Name it after the assistant that will use it, so you know which one to revoke later.',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </label>
                            { createError && (
                                <span
                                    role="alert"
                                    className="text-sm text-red-600"
                                >
                                    { createError }
                                </span>
                            ) }
                        </div>
                    }
                />
            ) }

            { pendingRevoke && (
                <DokanModal
                    isOpen
                    namespace="dokan-vendor-app-password-revoke"
                    className="!w-[350px] sm:!w-[480px]"
                    onClose={ () => setPendingRevoke( null ) }
                    onConfirm={ revoke }
                    dialogTitle={ __(
                        'Revoke Application Password',
                        'dokan-lite'
                    ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Revoke', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ sprintf(
                        /* translators: %s: application password name */
                        __( 'Revoke "%s"?', 'dokan-lite' ),
                        pendingRevoke.name
                    ) }
                    confirmationDescription={ __(
                        'Whatever signs in with this password stops working at once. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }

            { confirmingRevokeAll && (
                <DokanModal
                    isOpen
                    namespace="dokan-vendor-app-password-revoke-all"
                    className="!w-[350px] sm:!w-[480px]"
                    onClose={ () => setConfirmingRevokeAll( false ) }
                    onConfirm={ revokeAll }
                    dialogTitle={ __(
                        'Revoke All Application Passwords',
                        'dokan-lite'
                    ) }
                    confirmButtonVariant="danger"
                    confirmButtonText={ __( 'Yes, Revoke All', 'dokan-lite' ) }
                    cancelButtonText={ __( 'Cancel', 'dokan-lite' ) }
                    confirmationTitle={ __(
                        'Revoke every application password?',
                        'dokan-lite'
                    ) }
                    confirmationDescription={ __(
                        'Every assistant and app that signs in to your account with an application password stops working at once. This action cannot be undone.',
                        'dokan-lite'
                    ) }
                />
            ) }
        </div>
    );
};

export default AppPasswordsField;
