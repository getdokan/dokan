import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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

    if ( ! status.alerts.length ) {
        return null;
    }

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
