<?php
/**
 * Monthly Reverse Withdrawal Invoice Template.
 *
 * Vendors Will get this email once in a month.
 *
 * @class   ReverseWithdrawalInvoice
 *
 * @since   3.5.1
 *
 * @package \WeDevs\Dokan\Emails\ReverseWithdrawalInvoice
 *
 * @var $seller_info \WeDevs\Dokan\Vendor\Vendor
 * @var $due_status  array
 * @var $data        array
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) store name
printf( esc_html__( 'Hi %s,\n\n', 'dokan-lite' ), $seller_info->get_shop_name() );

// translators: 1) invoice month 2) invoice year 3) store name
printf( esc_html__( 'Your %1$s %2$s invoice is now available for store: %3$s.\n\n', 'dokan-lite' ), $data['{month}'], $data['{year}'], $seller_info->get_shop_name() );

// translators: 1) store name
printf( esc_html__( 'Summary for %1$s: \n\n', 'dokan-lite' ), $seller_info->get_shop_name() );

// translators: 1) invoice month 2) invoice year 3) due balance amount
printf( esc_html__( 'Reverse withdrawal charges for %1$s %2$s: %3$s \n\n', 'dokan-lite' ), $data['{month}'], $data['{year}'], wc_price( $due_status['balance']['payable_amount'] ) );

// translators: 1) invoice due date
printf( esc_html__( 'Due Date %1$s: \n\n', 'dokan-lite' ), 'immediate' === $due_status['due_date'] ? ucfirst( $due_status['due_date'] ) : dokan_format_date( $due_status['due_date'] ) );

printf(
    wp_kses(
        '<a href="' . $data['{reverse_withdrawal_url}'] . '">' . esc_html__( 'Pay Now', 'dokan-lite' ) . '</a>',
        [
            'a' => [
                'href' => [],
            ],
        ]
    )
);

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
