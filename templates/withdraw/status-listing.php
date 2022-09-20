<?php
/**
 * Dokan Withdraw Status filter template
 *
 * @since   2.4
 * @since   3.3.1 Additional button added.
 *
 * @package dokan
 */
$approve_menu_url   = add_query_arg(
    [
        'type'                 => 'approved',
        '_withdraw_link_nonce' => wp_create_nonce( 'dokan_withdraw_requests_link' ),
    ],
    dokan_get_navigation_url( 'withdraw-requests' )
);
$cancelled_menu_url = add_query_arg(
    [
        'type'                 => 'cancelled',
        '_withdraw_link_nonce' => wp_create_nonce( 'dokan_withdraw_requests_link' ),
    ],
    dokan_get_navigation_url( 'withdraw-requests' )
);

?>
<div class="dokan-withdraw-status-filter-container">
    <ul class="list-inline subsubsub" style="display: inline-block;">
        <li<?php echo $current === 'pending' ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( dokan_get_navigation_url( 'withdraw-requests' ) ); ?>"><?php esc_html_e( 'Pending Requests', 'dokan-lite' ); ?></a>
        </li>
        <li<?php echo $current === 'approved' ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( $approve_menu_url ); ?>"><?php esc_html_e( 'Approved Requests', 'dokan-lite' ); ?></a>
        </li>
        <li<?php echo $current === 'cancelled' ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( $cancelled_menu_url ); ?>"><?php esc_html_e( 'Cancelled Requests', 'dokan-lite' ); ?></a>
        </li>
    </ul>
    <span class="dokan-add-product-link" style="float: right; display: inline-block;">
        <?php if ( dokan_withdraw_is_manual_request_enabled() ) : ?>
            <button class="dokan-btn" id="dokan-request-withdraw-button"><i class="fa fa-money">&nbsp;</i> <?php esc_html_e( 'Request Withdraw', 'dokan-lite' ); ?> </button>
        <?php endif; ?>
        <a href="<?php echo esc_url( dokan_get_navigation_url( 'withdraw' ) ); ?>" class="dokan-btn"><?php esc_html_e( 'Withdraw Dashboard', 'dokan-lite' ); ?> </a>
    </span>
</div>
