<?php
$home_url = home_url();
$active_class = ' class="active"'
?>

<div class="dokan-dash-sidebar">
    <?php do_action( 'dokan_dash_nav', $active_menu ); ?>
</div>
