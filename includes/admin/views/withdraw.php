<?php
$dokan_admin_withdraw = Dokan_Admin_Withdraw::init();
$counts = dokan_get_withdraw_count();

$status = isset( $_GET['status'] ) ? $_GET['status'] : 'pending';
?>
<div class="wrap">
    <h2><?php _e( 'Withdraw Requests', 'dokan-lite' ); ?></h2>
    <h5><?php printf ( __( '<i>Approve or Decline Withdraw Requests sent by vendors</i>. <a target="_blank" href="%s">Learn More</a>', 'dokan-lite' ), 'https://wedevs.com/docs/dokan/settings/withdraw-options/' ) ?></h5>

    <ul class="subsubsub" style="float: none;">
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=pending" <?php if ( $status == 'pending' ) echo 'class="current"'; ?>>
                <?php _e( 'Pending', 'dokan-lite' ); ?> <span class="count">(<?php echo $counts['pending'] ?>)</span>
            </a> |
        </li>
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=completed" <?php if ( $status == 'completed' ) echo 'class="current"'; ?>>
                <?php _e( 'Approved', 'dokan-lite' ); ?> <span class="count">(<?php echo $counts['completed'] ?>)</span>
            </a> |
        </li>
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=cancelled" <?php if ( $status == 'cancelled' ) echo 'class="current"'; ?>>
                <?php _e( 'Cancelled', 'dokan-lite' ); ?> <span class="count">(<?php echo $counts['cancelled'] ?>)</span>
            </a>
        </li>
    </ul>

    <?php

    $dokan_admin_withdraw->admin_withdraw_list( $status );
    ?>
</div>