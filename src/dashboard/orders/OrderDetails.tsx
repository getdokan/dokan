import { useEffect, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanAlert } from '@dokan/components';
import type { OrderDetailsFragment } from './types';

/**
 * Vendor order details, rendered by PHP and bridged into the Vendor panel.
 *
 * The details view is not a React component and deliberately never becomes one: the
 * template fires eleven extension hooks plus WooCommerce's item hooks, and Pro injects
 * shipments, delivery time, store pickup and the whole item/refund table into it.
 * Rewriting it in React would delete all of that silently. Instead the server renders
 * the same template it renders for the legacy page, and this component asks for the
 * resulting HTML and puts it on screen.
 */
const OrderDetails = ( { params }: { params?: { orderId?: string } } ) => {
    const orderId = Number( params?.orderId ?? 0 );
    const containerRef = useRef< HTMLDivElement >( null );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState< string >( '' );

    useEffect( () => {
        if ( ! orderId ) {
            setIsLoading( false );
            setError( __( 'No order was requested.', 'dokan-lite' ) );
            return;
        }

        let cancelled = false;

        setIsLoading( true );
        setError( '' );

        apiFetch< OrderDetailsFragment >( {
            path: `/dokan/v1/orders/${ orderId }/details-html`,
        } )
            .then( ( fragment ) => {
                if ( cancelled || ! containerRef.current ) {
                    return;
                }

                // Assigning server-rendered markup is the whole point of this
                // component, not an oversight. The HTML comes from Dokan's own REST
                // endpoint, which requires `dokan_view_order` plus ownership before it
                // renders anything, and the template escapes its own output with the
                // WordPress escaping API. Sanitising here would strip exactly the
                // markup Pro and third-party hooks contribute.
                containerRef.current.innerHTML = fragment?.html ?? '';
            } )
            .catch( ( fetchError ) => {
                if ( cancelled ) {
                    return;
                }

                setError(
                    fetchError?.message ||
                        sprintf(
                            /* translators: %d: order number */
                            __( 'Order #%d could not be loaded.', 'dokan-lite' ),
                            orderId
                        )
                );
            } )
            .finally( () => {
                if ( ! cancelled ) {
                    setIsLoading( false );
                }
            } );

        return () => {
            cancelled = true;
        };
    }, [ orderId ] );

    if ( error ) {
        return (
            <DokanAlert
                variant="danger"
                label={ __( 'Order details unavailable', 'dokan-lite' ) }
            >
                { error }
            </DokanAlert>
        );
    }

    return (
        <div className="dokan-order-details-wrapper dokan-react-order-details">
            { isLoading && (
                <div
                    className="h-64 animate-pulse rounded-md bg-muted"
                    aria-label={ __( 'Loading order details', 'dokan-lite' ) }
                />
            ) }
            <div ref={ containerRef } />
        </div>
    );
};

export default OrderDetails;
