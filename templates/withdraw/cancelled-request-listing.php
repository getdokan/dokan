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
            <th><?php _e( 'Amount', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Method', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Date', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Note', 'dokan-lite' ); ?></th>
        </tr>
    </thead>
    <tbody>

    <?php foreach ( $requests as $row ) { ?>
        <tr>
            <td><?php echo wc_price( $row->amount ); ?></td>
            <td><?php echo dokan_withdraw_get_method_title( $row->method ); ?></td>
            <td><?php echo date_i18n( 'M j, Y g:ia', strtotime( $row->date ) ); ?></td>
            <td><?php echo  $row->note; ?></td>
        </tr>
    <?php } ?>

    </tbody>
</table>
