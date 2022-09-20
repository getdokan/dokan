<?php
/**
 * Dokan Warning template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<div class="dokan-alert dokan-alert-warning">
    <?php if ( $deleted ) : ?>
        <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
    <?php endif ?>
    <strong><?php echo wp_kses_post( $message ); ?></strong>
</div>
