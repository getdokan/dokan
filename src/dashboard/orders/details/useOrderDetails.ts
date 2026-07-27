import { useCallback, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
    ORDER_DETAILS_LOADED,
    ORDER_DETAILS_STATUS_CHANGED,
    emitOrderDetailsEvent,
    onOrderDetailsEvent,
} from '../events';
import { getStatusLabel } from '../status';
import type { DetailsOrder } from './types';

/**
 * The one order fetch feeding the whole React details view.
 *
 * Emits `ORDER_DETAILS_LOADED` with the same meta shape the fragment endpoint
 * announces, so the shared panel header works identically under either renderer,
 * and patches its cache on `ORDER_DETAILS_STATUS_CHANGED` so no card can disagree
 * with the header badge.
 * @param orderId
 */
const useOrderDetails = ( orderId: number ) => {
    const [ order, setOrder ] = useState< DetailsOrder | null >( null );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState< string >( '' );
    const [ fetchIndex, setFetchIndex ] = useState( 0 );

    const refetch = useCallback( () => {
        setFetchIndex( ( previous ) => previous + 1 );
    }, [] );

    useEffect( () => {
        if ( ! orderId ) {
            setIsLoading( false );
            setOrder( null );
            return;
        }

        let cancelled = false;

        setIsLoading( true );
        setError( '' );

        apiFetch< DetailsOrder >( {
            path: `/dokan/v1/orders/${ orderId }`,
        } )
            .then( ( loadedOrder ) => {
                if ( cancelled ) {
                    return;
                }

                setOrder( loadedOrder );

                emitOrderDetailsEvent( ORDER_DETAILS_LOADED, [
                    {
                        id: loadedOrder.id,
                        number: loadedOrder.number,
                        status: loadedOrder.status,
                        status_label: getStatusLabel( loadedOrder.status ),
                        date_created: loadedOrder.date_created,
                        // Pro's manual-order screen only edits vendor-created
                        // orders; the header hides Edit Order for the rest.
                        manual_order_editable: Boolean(
                            loadedOrder.meta_data?.some(
                                ( meta ) =>
                                    '_wc_order_attribution_source_type' ===
                                        meta.key && 'vendor' === meta.value
                            )
                        ),
                    },
                ] );
            } )
            .catch( ( fetchError: { message?: string } ) => {
                if ( ! cancelled ) {
                    setError( fetchError?.message || '' );
                }
            } )
            .finally( () => {
                if ( ! cancelled ) {
                    setIsLoading( false );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ orderId, fetchIndex ] );

    useEffect( () => {
        return onOrderDetailsEvent(
            ORDER_DETAILS_STATUS_CHANGED,
            ( changedOrderId, changedStatus ) => {
                if ( Number( changedOrderId ) !== orderId ) {
                    return;
                }

                setOrder( ( previous ) =>
                    previous
                        ? { ...previous, status: String( changedStatus ) }
                        : previous
                );
            }
        );
    }, [ orderId ] );

    return { order, isLoading, error, refetch };
};

export default useOrderDetails;
