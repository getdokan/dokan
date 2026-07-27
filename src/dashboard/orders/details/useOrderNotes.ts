import { useCallback, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { OrderNote } from './types';

/**
 * Order notes over the existing `dokan/v1/orders/<id>/notes` routes.
 * @param orderId
 */
const useOrderNotes = ( orderId: number ) => {
    const [ notes, setNotes ] = useState< OrderNote[] >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState< string >( '' );

    const fetchNotes = useCallback( () => {
        if ( ! orderId ) {
            return;
        }

        setIsLoading( true );
        setError( '' );

        apiFetch< OrderNote[] >( {
            path: `/dokan/v1/orders/${ orderId }/notes`,
        } )
            .then( ( loadedNotes ) => {
                setNotes( Array.isArray( loadedNotes ) ? loadedNotes : [] );
            } )
            .catch( ( fetchError: { message?: string } ) => {
                setError( fetchError?.message || '' );
            } )
            .finally( () => setIsLoading( false ) );
    }, [ orderId ] );

    useEffect( () => {
        fetchNotes();
    }, [ fetchNotes ] );

    const addNote = useCallback(
        ( note: string, customerNote: boolean, orderStatus: string ) =>
            apiFetch< OrderNote >( {
                path: `/dokan/v1/orders/${ orderId }/notes`,
                method: 'POST',
                // The route validates against the order item schema:
                // `customer_note` is a string there, and `status` must be a
                // valid unprefixed status because the schema's own default
                // ("all") is not in its enum.
                data: {
                    note,
                    customer_note: customerNote ? '1' : '',
                    status: orderStatus,
                },
            } ).then( ( created ) => {
                fetchNotes();
                return created;
            } ),
        [ orderId, fetchNotes ]
    );

    const deleteNote = useCallback(
        ( noteId: number ) =>
            apiFetch( {
                path: `/dokan/v1/orders/${ orderId }/notes/${ noteId }`,
                method: 'DELETE',
            } ).then( ( result ) => {
                setNotes( ( previous ) =>
                    previous.filter( ( note ) => note.id !== noteId )
                );
                return result;
            } ),
        [ orderId ]
    );

    return {
        notes,
        isLoading,
        error,
        addNote,
        deleteNote,
        refetch: fetchNotes,
    };
};

export default useOrderNotes;
