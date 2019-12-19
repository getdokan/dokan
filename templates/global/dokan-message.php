<?php
/**
 * Dokan Message Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<div class="dokan-message">
    <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
    <strong><?php echo wp_kses_post( $message ); ?></strong>
</div>
