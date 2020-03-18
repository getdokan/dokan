<?php
/**
 * New Order Email.
 *
 * An email sent to the vendor when a new order is created by customer.
 *
 * @class       VendorNewOrder
 * @version     2.6.8
 *
 */

 if ( ! defined( 'ABSPATH' ) ) {
    exit;
 }

$text_align = is_rtl() ? 'right' : 'left';

 /**
  * @hooked WC_Emails::email_header() Output the email header
  */
 do_action( 'woocommerce_email_header', $email_heading, $email );

 $order_url = esc_url( add_query_arg( array(
                'order_id'   => $order->get_order_number(),
                '_view_mode' => 'email',
                'permission' => '1',
            ), dokan_get_navigation_url( 'orders' ) ) );

?>

<p><?php printf( __( 'You have received an order from %s.', 'dokan-lite' ), $order->get_formatted_billing_full_name() ); ?></p>

<h2>
    <?php
    $before = '<a class="link" href="' . esc_url( $order_url ) . '">';
    $after  = '</a>';
    /* translators: %s: Order ID. */
    echo wp_kses_post( $before . sprintf( __( '[Order #%s]', 'dokan-lite' ) . $after . ' (<time datetime="%s">%s</time>)', $order->get_order_number(), $order->get_date_created()->format( 'c' ), wc_format_datetime( $order->get_date_created() ) ) );
    ?>
</h2>


<div style="margin-bottom: 40px;">
    <table class="td" cellspacing="0" cellpadding="6" style="width: 100%; font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;" border="1">
        <thead>
            <tr>
                <th class="td" scope="col" style="text-align:<?php echo esc_attr( $text_align ); ?>;"><?php esc_html_e( 'Product', 'dokan-lite' ); ?></th>
                <th class="td" scope="col" style="text-align:<?php echo esc_attr( $text_align ); ?>;"><?php esc_html_e( 'Quantity', 'dokan-lite' ); ?></th>
                <th class="td" scope="col" style="text-align:<?php echo esc_attr( $text_align ); ?>;"><?php esc_html_e( 'Price', 'dokan-lite' ); ?></th>
            </tr>
        </thead>

    <tbody>

        <?php $total_price = array(); ?>
        <?php foreach ( $order_info as $value ) : ?>
            <tr class="order_item">
            <?php foreach ( $value as $key => $info ) :?>
                <?php
                    if ( $key == 'total' ) {
                        array_push( $total_price, $info );
                    }
                ?>

                <td class="td" style="text-align: left;vertical-align: middle;font-family: 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;color: #636363;border: 1px solid #e5e5e5;padding: 12px"><?php echo $info; ?></td>
            <?php endforeach; ?>
            </tr>
        <?php endforeach; ?>

        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Subtotal', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo $order->get_subtotal_to_display(); ?>
            </td>
        </tr>

        <?php if ( $order->get_discount_total() ) : ?>
        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Discount', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo '-' . $order->get_discount_to_display(); ?>
            </td>
        </tr>
        <?php endif; ?>

        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Shipping', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo $order->get_shipping_to_display(); ?>
            </td>
        </tr>

        <?php if ( $order->get_total_tax() ) : ?>
        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Tax', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo wc_price( $order->get_total_tax() ); ?>
            </td>
        </tr>
        <?php endif; ?>

        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Payment Method', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo esc_attr( $order->get_payment_method_title() ); ?>
            </td>
        </tr>

        <tr>
            <th class="td" scope="row" colspan="2" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px"><?php esc_attr_e( 'Total', 'dokan-lite' ); ?>:
            </th>

            <td class="td" style="text-align: left;color: #636363;border: 1px solid #e5e5e5;vertical-align: middle;padding: 12px">
                <?php echo $order->get_formatted_order_total(); ?>
            </td>
        </tr>

    </tbody>

    </table>


</div>

<?php
 /**
  * @hooked WC_Emails::customer_details() Shows customer details
  * @hooked WC_Emails::email_address() Shows email address
  */
 do_action( 'woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email );

 /**
  * @hooked WC_Emails::email_footer() Output the email footer
  */
 do_action( 'woocommerce_email_footer', $email );