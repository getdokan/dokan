import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import StartStep from './StartStep';
import Catalog from './Catalog';
import Alerts from './Alerts';
import type { CJStatus } from './types';

// Vendor CJ Dropshipping page: start step, then catalog search and import.
const CJDropshipping = () => {
    const [ status, setStatus ] = useState< CJStatus | null >( null );
    const [ error, setError ] = useState( '' );

    useEffect( () => {
        apiFetch< CJStatus >( { path: '/dokan/v1/cj-dropshipping/status' } )
            .then( setStatus )
            .catch( ( e ) => setError( e?.message || '' ) );
    }, [] );

    let body = null;

    if ( error ) {
        body = <p className="text-sm text-red-600">{ error }</p>;
    } else if ( ! status ) {
        body = (
            <p className="text-sm text-gray-500">
                { __( 'Loading…', 'dokan-lite' ) }
            </p>
        );
    } else if ( ! status.can_use ) {
        body = <p className="text-sm text-gray-700">{ status.message }</p>;
    } else if ( ! status.accepted_terms ) {
        body = <StartStep status={ status } onAccepted={ setStatus } />;
    } else if ( ! status.available ) {
        body = (
            <p className="text-sm text-gray-700">
                { __(
                    "CJ products can't be imported right now. The marketplace's CJ connection is paused; please try again later.",
                    'dokan-lite'
                ) }
            </p>
        );
    } else {
        body = (
            <>
                <Alerts status={ status } onChange={ setStatus } />
                <Catalog status={ status } />
            </>
        );
    }

    return (
        <div className="dokan-cj-dropshipping space-y-6" data-testid="cj-page">
            { body }
        </div>
    );
};

export default CJDropshipping;
