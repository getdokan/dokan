<?php
$home_url = home_url();
$active_class = ' class="active"'
?>

<div class="dokan-dash-sidebar">
    <?php echo wp_kses_post( dokan_dashboard_nav( $active_menu ) ); ?>
</div>
