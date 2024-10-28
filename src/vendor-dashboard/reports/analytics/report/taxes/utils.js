/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

export function getTaxCode( tax ) {
    return [
        tax.country,
        tax.state,
        tax.name || __( 'TAX', 'dokan' ),
        tax.priority,
    ]
        .map( ( item ) => item.toString().toUpperCase().trim() )
        .filter( Boolean )
        .join( '-' );
}
