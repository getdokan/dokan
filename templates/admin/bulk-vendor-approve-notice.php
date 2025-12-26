<?php
/**
 * Admin View: Bulk Action Notice for Approve Vendors.
 *
 * @since 4.2.4
 *
 * @var int    $count   Number of vendors processed
 * @var string $message Success message to display
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="notice notice-success is-dismissible">
    <p><?php echo esc_html( $message ); ?></p>
</div>
