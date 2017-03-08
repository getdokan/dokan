<?php
/**
 * Dokan Withdraw Pending Request Listing Template
 *
 * @since 2.4
 *
 * @package dokan
 */

if ( $withdraw_requests ) {
?>
    <table class="dokan-table dokan-table-striped">
        <tr>
            <th><?php _e( 'Amount', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Method', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Date', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Cancel', 'dokan-lite' ); ?></th>
            <th><?php _e( 'Status', 'dokan-lite' ); ?></th>
        </tr>

        <?php foreach ( $withdraw_requests as $request ) { ?>

            <tr>
                <td><?php echo wc_price( $request->amount ); ?></td>
                <td><?php echo dokan_withdraw_get_method_title( $request->method ); ?></td>
                <td><?php echo dokan_format_time( $request->date ); ?></td>
                <td>
                    <?php
                    $url = add_query_arg( array(
                        'action' => 'dokan_cancel_withdrow',
                        'id'     => $request->id
                    ), dokan_get_navigation_url( 'withdraw' ) );
                    ?>
                    <a href="<?php echo wp_nonce_url( $url, 'dokan_cancel_withdrow' ); ?>">
                        <?php _e( 'Cancel', 'dokan-lite' ); ?>
                    </a>
                </td>
                <td>
                    <?php
                        if ( $request->status == 0 ) {
                            echo '<span class="label label-danger">' . __( 'Pending Reivew', 'dokan-lite' ) . '</span>';
                        } elseif ( $request->status == 1 ) {
                            echo '<span class="label label-warning">' . __( 'Accepted', 'dokan-lite' ) . '</span>';
                        }
                    ?>
                </td>
            </tr>

        <?php } ?>

    </table>
<?php
}


