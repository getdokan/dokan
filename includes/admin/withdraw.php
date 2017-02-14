<?php
$dokan_admin_withdraw = Dokan_Admin_Withdraw::init();
$counts = dokan_get_withdraw_count();

$status = isset( $_GET['status'] ) ? $_GET['status'] : 'pending';
?>
<div class="wrap">
    <h2><?php _e( 'Withdraw Requests', 'dokan' ); ?></h2>

    <ul class="subsubsub" style="float: none;">
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=pending" <?php if ( $status == 'pending' ) echo 'class="current"'; ?>>
                <?php _e( 'Pending', 'dokan' ); ?> <span class="count">(<?php echo $counts['pending'] ?>)</span>
            </a> |
        </li>
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=completed" <?php if ( $status == 'completed' ) echo 'class="current"'; ?>>
                <?php _e( 'Approved', 'dokan' ); ?> <span class="count">(<?php echo $counts['completed'] ?>)</span>
            </a> |
        </li>
        <li>
            <a href="admin.php?page=dokan-withdraw&amp;status=cancelled" <?php if ( $status == 'cancelled' ) echo 'class="current"'; ?>>
                <?php _e( 'Cancelled', 'dokan' ); ?> <span class="count">(<?php echo $counts['cancelled'] ?>)</span>
            </a>
        </li>
    </ul>

    <?php

    $dokan_admin_withdraw->admin_withdraw_list( $status );
    ?>
</div>