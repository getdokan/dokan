import { __, sprintf } from '@wordpress/i18n';

const isBlank = ( value: unknown ): boolean =>
    value === undefined || value === null || String( value ).trim() === '';

// plugin-ui can't validate the object-shaped commission values, so mirror the server `validation_func` here.

// Names the field (or category) and the empty box, and says that 0 is a valid answer.
export const missingCommissionError = (
    name: string,
    percentage: unknown,
    flat: unknown
): string => {
    const percentageBlank = isBlank( percentage );
    const flatBlank = isBlank( flat );

    if ( percentageBlank && flatBlank ) {
        return sprintf(
            /* translators: %s: field or category name */
            __(
                '%s needs a percentage and a fixed fee. Enter 0 for none.',
                'dokan-lite'
            ),
            name
        );
    }
    if ( percentageBlank ) {
        return sprintf(
            /* translators: %s: field or category name */
            __( '%s needs a percentage. Enter 0 for none.', 'dokan-lite' ),
            name
        );
    }
    if ( flatBlank ) {
        return sprintf(
            /* translators: %s: field or category name */
            __( '%s needs a fixed fee. Enter 0 for none.', 'dokan-lite' ),
            name
        );
    }
    return '';
};

// Fixed commission requires both the percentage and the flat fee.
export const fixedCommissionError = ( value?: {
    admin_percentage?: string | number;
    additional_fee?: string;
} ): string =>
    missingCommissionError(
        __( 'Commission Amount', 'dokan-lite' ),
        value?.admin_percentage,
        value?.additional_fee
    );

// The All-Categories rate requires both the percentage and the flat fee.
export const categoryCommissionError = ( value?: {
    all?: { percentage?: string; flat?: string };
} ): string =>
    missingCommissionError(
        __( 'All Categories', 'dokan-lite' ),
        value?.all?.percentage,
        value?.all?.flat
    );
