import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { DokanButton } from '@dokan/components';
import type { CJStatus } from './types';

type Props = {
    status: CJStatus;
    onAccepted: ( status: CJStatus ) => void;
};

// One-time "Start selling CJ products" step with the "I understand" box (E8).
const StartStep = ( { status, onAccepted }: Props ) => {
    const [ checked, setChecked ] = useState( false );
    const [ busy, setBusy ] = useState( false );
    const [ error, setError ] = useState( '' );

    const start = () => {
        setBusy( true );
        setError( '' );
        apiFetch< CJStatus >( {
            path: '/dokan/v1/cj-dropshipping/accept-terms',
            method: 'POST',
            data: { accepted: true },
        } )
            .then( onAccepted )
            .catch( ( e ) => setError( e?.message || '' ) )
            .finally( () => setBusy( false ) );
    };

    return (
        <div className="max-w-2xl rounded-md border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-lg font-semibold m-0">
                { __( 'Start selling CJ products', 'dokan-lite' ) }
            </h3>
            <p className="text-sm text-gray-600 m-0">
                { __(
                    'Import products from CJ Dropshipping and sell them without holding stock. CJ ships each order to your buyer; you place and pay the order on your own CJ account. Before you start, please confirm you understand:',
                    'dokan-lite'
                ) }
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                { status.terms.map( ( line ) => (
                    <li key={ line }>{ line }</li>
                ) ) }
            </ul>
            <div className="flex items-center gap-2 text-sm">
                <input
                    id="cj-terms-accept"
                    type="checkbox"
                    checked={ checked }
                    onChange={ ( e ) => setChecked( e.target.checked ) }
                />
                <label htmlFor="cj-terms-accept">
                    { __( 'I understand', 'dokan-lite' ) }
                </label>
            </div>
            { error && <p className="text-sm text-red-600">{ error }</p> }
            <DokanButton
                onClick={ start }
                disabled={ ! checked || busy }
                loading={ busy }
            >
                { __( 'Start selling CJ products', 'dokan-lite' ) }
            </DokanButton>
        </div>
    );
};

export default StartStep;
