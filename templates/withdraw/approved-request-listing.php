<?php
/**
 * Dokan Withdraw Approved Request listing template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>

<table class="dokan-table dokan-table-striped">
    <thead>
        <tr>
            <th><?php esc_html_e( 'Amount', 'dokan-lite' ); ?></th>
            <?php apply_filters( 'dokan_approved_withdraw_list_heading_after_withdraw_amount', $requests ); ?>
            <th><?php esc_html_e( 'Method', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
        </tr>
    </thead>
    <tbody>

    <?php foreach ( $requests as $row ) { ?>
        <tr>
            <td><?php echo wp_kses_post( wc_price( apply_filters( 'dokan_inside_approved_withdraw_list_loop_withdraw_amount', $row->amount, $row ) ) ); ?></td>
            <?php apply_filters( 'dokan_inside_approved_withdraw_list_loop_after_withdraw_amount', $row ); ?>
            <td><?php echo esc_html( dokan_withdraw_get_method_title( $row->method, $row ) ); ?> </td>
            <td><?php echo esc_html( dokan_format_datetime( $row->date ) ); ?></td>
        </tr>
    <?php } ?>

    </tbody>
</table>
