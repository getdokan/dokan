<?php
/**
 * Dokan Withdraw Status filter template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<ul class="list-inline subsubsub">
    <li<?php echo $current == 'pending' ? ' class="active"' : ''; ?>>
        <a href="<?php echo dokan_get_navigation_url( 'withdraw' ); ?>"><?php _e( 'Withdraw Request', 'dokan-lite' ); ?></a>
    </li>
    <li<?php echo $current == 'approved' ? ' class="active"' : ''; ?>>
        <a href="<?php echo add_query_arg( array( 'type' => 'approved' ), dokan_get_navigation_url( 'withdraw' ) ); ?>"><?php _e( 'Approved Requests', 'dokan-lite' ); ?></a>
    </li>
    <li<?php echo $current == 'cancelled' ? ' class="active"' : ''; ?>>
        <a href="<?php echo add_query_arg( array( 'type' => 'cancelled' ), dokan_get_navigation_url( 'withdraw' ) ); ?>"><?php _e( 'Cancelled Requests', 'dokan-lite' ); ?></a>
    </li>
</ul>