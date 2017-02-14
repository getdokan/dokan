<?php
/**
 * Dokan Success template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<div class="dokan-alert dokan-alert-success">
    <?php if ( $deleted ): ?>
        <button type="button" class="dokan-close" data-dismiss="alert">&times;</button>
    <?php endif ?>
    <strong><?php echo $message; ?></strong>
</div>
