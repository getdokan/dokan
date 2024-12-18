<?php
/**
 * New Order Email ( plain text )
 *
 * An email sent to the vendor when a new order is created by customer.
 *
 * @class       VendorNewOrder
 * @version     2.6.8
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

echo "=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n";
echo esc_html( wp_strip_all_tags( $email_heading ) );
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

// translators: 1) order billing full name
echo sprintf( esc_html__( 'You have received an order from %s.', 'dokan-lite' ), esc_html( $order->get_formatted_billing_full_name() ) ) . "\n\n";
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";

esc_html_e( 'Product            | Quantity        | Price', 'dokan-lite' );
echo "\n\n";
echo wp_kses_post(
    wc_get_email_order_items(
        $order,
        [
            'show_sku'      => $sent_to_admin,
            'show_image'    => false,
            'image_size'    => [ 32, 32 ],
            'plain_text'    => $plain_text,
            'sent_to_admin' => $sent_to_admin,
        ]
    )
);
echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";
$item_totals = $order->get_order_item_totals();

if ( $item_totals ) {
    foreach ( $item_totals as $total ) {
        printf( '%s %s %s', esc_html( wp_strip_all_tags( wptexturize( $total['label'] ) ) ), esc_html( wp_strip_all_tags( wptexturize( $total['value'] ) ) ), "\n" );
    }
    echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";
}
if ( $order->get_customer_note() ) {
    esc_html_e( 'Note:', 'dokan-lite' );
    echo "\n\n";
    echo wp_kses_post( wp_strip_all_tags( wptexturize( $order->get_customer_note() ) ) );
    echo "\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=\n\n";
}
do_action( 'woocommerce_email_after_order_table', $order, $sent_to_admin, $plain_text, $email );

/*
 * @hooked WC_Emails::order_meta() Shows order meta data.
 */
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email );

/**
 * @hooked WC_Emails::customer_details() Shows customer details
 * @hooked WC_Emails::email_address() Shows email address
 */
do_action( 'woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email );

echo "\n\n----------------------------------------\n\n";

/**
 * Show user-defined additional content - this is set in each email's settings.
 */
if ( ! empty( $additional_content ) ) {
    echo esc_html( wp_strip_all_tags( wptexturize( $additional_content ) ) );
    echo "\n\n----------------------------------------\n\n";
}

echo wp_kses_post( apply_filters( 'woocommerce_email_footer_text', get_option( 'woocommerce_email_footer_text' ) ) );
