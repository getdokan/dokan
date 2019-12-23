<?php
$home_url = home_url();
$active_class = ' class="active"'
?>

<div class="dokan-dash-sidebar">
    <?php
        global $allowedposttags;

        // These are required for the hamburger menu.
        if ( is_array( $allowedposttags ) ) {
            $allowedposttags['input'] = [
                'id'      => [],
                'type'    => [],
                'checked' => []
            ];
        }

        echo wp_kses( dokan_dashboard_nav( $active_menu ), $allowedposttags );
    ?>
</div>
