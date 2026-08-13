<?php
/**
 * Vendor setup wizard progress rail.
 *
 * This template can be overridden by copying it to yourtheme/dokan/vendor-setup-wizard/progress-rail.php.
 *
 * @since DOKAN_SINCE
 *
 * @var int $position Current step number, 1-based and excluding the intro.
 * @var int $total    Total numbered steps.
 * @var int $percent  Completion percentage for the track fill.
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="dokan-vsw-rail">
    <span class="dokan-vsw-rail-label">
        <?php
        /* translators: 1: current step number 2: total step count */
        printf( esc_html__( 'Step %1$d of %2$d', 'dokan-lite' ), (int) $position, (int) $total );
        ?>
    </span>
    <span class="dokan-vsw-rail-track">
        <span class="dokan-vsw-rail-fill" style="width: <?php echo (int) $percent; ?>%"></span>
    </span>
    <span class="dokan-vsw-rail-percent">
        <?php
        /* translators: %d: completion percentage */
        printf( esc_html__( '%d%% Complete', 'dokan-lite' ), (int) $percent );
        ?>
    </span>
</div>
