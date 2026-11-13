import { useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanButton } from '@dokan/components';
import type { CJStatus } from './types';

type Props = {
    status: CJStatus;
    onChange: ( status: CJStatus ) => void;
};

// CJ products that need the vendor: removed by CJ, taken off sale for a loss, sync trouble.
const Alerts = ( { status, onChange }: Props ) => {
    const [ busy, setBusy ] = useState( false );

    if (
        ! status.alerts.length &&
        ! status.awaiting.length &&
        ! status.restorable
    ) {
        return null;
    }

    const restore = () => {
        setBusy( true );
        apiFetch< CJStatus >( {
            path: '/dokan/v1/cj-dropshipping/restore',
            method: 'POST',
        } )
            .then( onChange )
            .finally( () => setBusy( false ) );
    };

    const dismiss = ( type: string, productId: number ) => {
        setBusy( true );
        apiFetch< CJStatus >( {
            path: '/dokan/v1/cj-dropshipping/alerts/dismiss',
            method: 'POST',
            data: { type, product_id: productId },
        } )
            .then( onChange )
            .finally( () => setBusy( false ) );
    };

    return (
        <div
            className="rounded-md border border-amber-300 bg-amber-50 p-4 space-y-3"
            data-testid="cj-alerts"
        >
            <h3 className="m-0 text-base font-semibold">
                { __( 'Needs your attention', 'dokan-lite' ) }
            </h3>
            { status.restorable > 0 && (
                <div
                    className="flex flex-wrap items-center gap-2 text-sm"
                    data-testid="cj-restorable"
                >
                    <span>
                        { sprintf(
                            /* translators: %d: number of products */
                            _n(
                                '%d CJ product was taken off sale while CJ was unavailable.',
                                '%d CJ products were taken off sale while CJ was unavailable.',
                                status.restorable,
                                'dokan-lite'
                            ),
                            status.restorable
                        ) }
                    </span>
                    <DokanButton disabled={ busy } onClick={ restore }>
                        { __( 'Put them back on sale', 'dokan-lite' ) }
                    </DokanButton>
                </div>
            ) }
            { status.awaiting.length > 0 && (
                <p className="m-0 text-sm" data-testid="cj-awaiting">
                    { sprintf(
                        /* translators: %d: number of orders */
                        _n(
                            '%d paid order is waiting for you to order it on CJ:',
                            '%d paid orders are waiting for you to order them on CJ:',
                            status.awaiting.length,
                            'dokan-lite'
                        ),
                        status.awaiting.length
                    ) }{ ' ' }
                    { status.awaiting.map( ( order, i ) => (
                        <span key={ order.number }>
                            { i > 0 && ', ' }
                            <a href={ order.url }>#{ order.number }</a>
                        </span>
                    ) ) }
                </p>
            ) }
            <ul className="m-0 list-none space-y-2 p-0">
                { status.alerts.map( ( alert ) => (
                    <li
                        key={ `${ alert.type }:${ alert.product_id }` }
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                        <span>{ alert.message }</span>
                        <span className="flex gap-2">
                            <a href={ alert.edit_url }>
                                { __( 'Open product', 'dokan-lite' ) }
                            </a>
                            <DokanButton
                                variant="secondary"
                                disabled={ busy }
                                onClick={ () =>
                                    dismiss( alert.type, alert.product_id )
                                }
                            >
                                { __( 'Dismiss', 'dokan-lite' ) }
                            </DokanButton>
                        </span>
                    </li>
                ) ) }
            </ul>
        </div>
    );
};

export default Alerts;
