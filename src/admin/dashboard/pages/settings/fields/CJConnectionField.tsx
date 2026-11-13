import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { Badge, Button, Input, type SettingsElement } from '@wedevs/plugin-ui';

type Connection = {
    state: 'disconnected' | 'connected' | 'suspended' | 'needs_reconnect';
    masked_key: string;
    account_name: string;
    account_email: string;
    days_active: number;
    error: string;
    reactivate_url: string;
    points: { remaining?: number; total?: number };
    points_left: number;
};

type Props = {
    element: SettingsElement;
};

const PATH = 'dokan/v1/admin/cj-dropshipping/connection';

// Connect, check and disconnect the marketplace CJ account; the key never comes back unmasked.
export default function CJConnectionField( { element }: Props ) {
    const [ connection, setConnection ] = useState< Connection | null >( null );
    const [ apiKey, setApiKey ] = useState( '' );
    const [ busy, setBusy ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ confirming, setConfirming ] = useState( false );

    useEffect( () => {
        apiFetch< Connection >( { path: PATH } )
            .then( setConnection )
            .catch( ( e ) => setError( e?.message || '' ) );
    }, [] );

    const run = ( request: Promise< Connection > ) => {
        setBusy( true );
        setError( '' );
        request
            .then( ( data ) => {
                setConnection( data );
                setApiKey( '' );
            } )
            .catch( ( e ) => {
                setError(
                    e?.message || __( 'Something went wrong.', 'dokan-lite' )
                );
                // A failed call can change the state, e.g. CJ suspended the account.
                return apiFetch< Connection >( { path: PATH } )
                    .then( setConnection )
                    .catch( () => undefined );
            } )
            .finally( () => setBusy( false ) );
    };

    const connect = () =>
        run(
            apiFetch< Connection >( {
                path: PATH,
                method: 'POST',
                data: { api_key: apiKey },
            } )
        );

    const recheck = () =>
        run(
            apiFetch< Connection >( {
                path: `${ PATH }/check`,
                method: 'POST',
            } )
        );

    const disconnect = () => {
        setConfirming( false );
        run( apiFetch< Connection >( { path: PATH, method: 'DELETE' } ) );
    };

    const state = connection?.state ?? 'disconnected';
    const badges: Record<
        Connection[ 'state' ],
        {
            label: string;
            variant: 'success' | 'outline' | 'destructive' | 'warning';
        }
    > = {
        connected: {
            label: __( 'Connected', 'dokan-lite' ),
            variant: 'success',
        },
        disconnected: {
            label: __( 'Not connected', 'dokan-lite' ),
            variant: 'outline',
        },
        suspended: {
            label: __( 'Paused by CJ', 'dokan-lite' ),
            variant: 'destructive',
        },
        needs_reconnect: {
            label: __( 'Reconnect needed', 'dokan-lite' ),
            variant: 'warning',
        },
    };

    return (
        <div className="flex flex-col gap-4 p-4" data-testid="cj-connection">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                        { element.label || element.title }
                    </span>
                    { connection && (
                        <Badge variant={ badges[ state ].variant }>
                            { badges[ state ].label }
                        </Badge>
                    ) }
                </div>
                { element.description && (
                    <span className="text-xs text-muted-foreground leading-relaxed">
                        { element.description }
                    </span>
                ) }
            </div>

            { connection && 'disconnected' !== state && (
                <div className="flex flex-col gap-1 text-sm">
                    <span>
                        { sprintf(
                            /* translators: %s: masked CJ API key */
                            __( 'API key: %s', 'dokan-lite' ),
                            connection.masked_key
                        ) }
                    </span>
                    { connection.account_name && (
                        <span>
                            { sprintf(
                                /* translators: 1: CJ account name, 2: CJ account email */
                                __( 'CJ account: %1$s (%2$s)', 'dokan-lite' ),
                                connection.account_name,
                                connection.account_email
                            ) }
                        </span>
                    ) }
                    { 'connected' === state && (
                        <span className="text-muted-foreground">
                            { sprintf(
                                /* translators: 1: points left, 2: daily points */
                                __(
                                    'CJ points left today: %1$s of %2$s',
                                    'dokan-lite'
                                ),
                                connection.points_left.toLocaleString(),
                                (
                                    connection.points?.total ?? 50000
                                ).toLocaleString()
                            ) }
                        </span>
                    ) }
                </div>
            ) }

            { 'suspended' === state && (
                <div className="flex flex-col gap-2 rounded-md border border-destructive/40 p-3 text-sm">
                    <span>
                        { __(
                            'CJ paused API access because the account had no CJ purchase for 30 days. Log in to this CJ account, reactivate API access, then check again.',
                            'dokan-lite'
                        ) }
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={ () =>
                                window.open(
                                    connection?.reactivate_url,
                                    '_blank',
                                    'noopener'
                                )
                            }
                        >
                            { __( 'Reactivate on CJ', 'dokan-lite' ) }
                        </Button>
                        <Button onClick={ recheck } disabled={ busy }>
                            { __( 'I reactivated it', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
            ) }

            { ( 'disconnected' === state || 'needs_reconnect' === state ) && (
                <div className="flex gap-2">
                    <Input
                        type="password"
                        autoComplete="off"
                        value={ apiKey }
                        onChange={ ( e ) => setApiKey( e.target.value ) }
                        placeholder={ __( 'CJ API key', 'dokan-lite' ) }
                        aria-label={ __( 'CJ API key', 'dokan-lite' ) }
                    />
                    <Button
                        onClick={ connect }
                        disabled={ busy || ! apiKey.trim() }
                    >
                        { busy
                            ? __( 'Connecting…', 'dokan-lite' )
                            : __( 'Connect', 'dokan-lite' ) }
                    </Button>
                </div>
            ) }

            { 'connected' === state && ! confirming && (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={ recheck }
                        disabled={ busy }
                    >
                        { __( 'Check connection', 'dokan-lite' ) }
                    </Button>
                    <Button
                        variant="outline-destructive"
                        onClick={ () => setConfirming( true ) }
                        disabled={ busy }
                    >
                        { __( 'Disconnect', 'dokan-lite' ) }
                    </Button>
                </div>
            ) }

            { 'connected' === state && confirming && (
                <div className="flex flex-col gap-2 rounded-md border border-destructive/40 p-3 text-sm">
                    <span>
                        { __(
                            'Disconnect the CJ account? Every CJ product in the marketplace moves to Draft until you connect again.',
                            'dokan-lite'
                        ) }
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={ disconnect }
                            disabled={ busy }
                        >
                            { __( 'Yes, disconnect', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="outline"
                            onClick={ () => setConfirming( false ) }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                    </div>
                </div>
            ) }

            { error && (
                <span className="text-sm text-destructive" role="alert">
                    { error }
                </span>
            ) }
        </div>
    );
}
