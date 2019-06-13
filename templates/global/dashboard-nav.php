<?php
$home_url = home_url();
$active_class = ' class="active"'
?>

<div class="dokan-dash-sidebar">
    <div id="dokan-navigation" area-label="Menu">
        <label id="mobile-menu-icon" for="toggle-mobile-menu" aria-label="Menu">&#9776;</label>
        <input id="toggle-mobile-menu" type="checkbox" />

        <?php echo dokan_dashboard_nav( $active_menu ); ?>
    </div>
</div>