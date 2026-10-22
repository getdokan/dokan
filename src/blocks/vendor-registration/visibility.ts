// Mirror of FormRenderer::is_row_visible(): which rows a view shows.
import { __ } from '@wordpress/i18n';
import type { EditorData, Row, View } from './types';

// Whether WooCommerce asks for this row (username and password only).
export const offInWooCommerce = ( row: Row, data: EditorData ): boolean => {
    if ( 'username' === row.id ) {
        return data.woocommerce.generateUsername;
    }

    if ( 'password' === row.id ) {
        return data.woocommerce.generatePassword;
    }

    return false;
};

// Why a row is skipped in a view, or '' when the view shows it.
export const hiddenInViewReason = ( row: Row, view: View ): string => {
    if ( 'visitor' !== view && [ 'username', 'password' ].includes( row.id ) ) {
        return __(
            'Logged-in customers and social sign-ups never see a username or password.',
            'dokan-lite'
        );
    }

    if ( 'customer' === view && 'email' === row.id ) {
        return __(
            'Logged-in customers already have an email address.',
            'dokan-lite'
        );
    }

    return '';
};

export const isRowShown = (
    row: Row,
    view: View,
    data: EditorData,
    hasTermsPage: boolean
): boolean =>
    ! row.hidden &&
    ! offInWooCommerce( row, data ) &&
    ! hiddenInViewReason( row, view ) &&
    ( 'terms' !== row.id || hasTermsPage );
