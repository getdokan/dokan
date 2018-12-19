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
            <th><?php esc_html_e( 'Method', 'dokan-lite' ); ?></th>
            <th><?php esc_html_e( 'Date', 'dokan-lite' ); ?></th>
        </tr>
    </thead>
    <tbody>

    <?php foreach ( $requests as $row ) { ?>
        <tr>
            <td><?php echo wc_price( $row->amount ); ?></td>
            <td><?php echo esc_html( dokan_withdraw_get_method_title( $row->method ) ); ?></td>
            <td><?php echo esc_html( date_i18n( 'M j, Y g:ia', strtotime( $row->date ) ) ); ?></td>
        </tr>
    <?php } ?>

    </tbody>
</table>
