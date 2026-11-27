import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { toast } from '@wedevs/plugin-ui';
import {
    PATH,
    messageOf,
    type AppPassword,
    type CreatedPassword,
} from './utils';

// The signed-in user's application passwords, read and changed through WordPress's own route.
const useAppPasswords = ( available: boolean ) => {
    const [ rows, setRows ] = useState< AppPassword[] >( [] );
    const [ loading, setLoading ] = useState< boolean >( available );
    const [ listError, setListError ] = useState( '' );
    // WordPress hands a password over once; it lives here until the panel showing it is dismissed.
    const [ created, setCreated ] = useState< CreatedPassword | null >( null );

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

    // Rejects when WordPress refuses, so the form that asked can stay open with the reason.
    const create = async ( name: string ) => {
        const response = await apiFetch< CreatedPassword >( {
            path: PATH,
            method: 'POST',
            data: { name },
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
    };

    const revoke = async ( row: AppPassword ) => {
        try {
            await apiFetch( {
                path: `${ PATH }/${ row.uuid }`,
                method: 'DELETE',
            } );
            setRows( ( current ) =>
                current.filter( ( item ) => item.uuid !== row.uuid )
            );
            // A revoked password must not stay on screen as if it still worked.
            setCreated( ( current ) =>
                current?.uuid === row.uuid ? null : current
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

    return {
        rows,
        loading,
        listError,
        created,
        dismissCreated: () => setCreated( null ),
        create,
        revoke,
        revokeAll,
    };
};

export default useAppPasswords;
