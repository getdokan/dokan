<?php
$home_url     = home_url();
$active_class = ' class="active"'
?>

<div class="dokan-dash-sidebar">
    <?php
    global $allowedposttags;
    do_action( 'dokan_dashboard_sidebar_start' );

    // These are required for the hamburger menu.
    if ( is_array( $allowedposttags ) ) {
        $allowedposttags['input'] = [ // phpcs:ignore
            'id'      => [],
            'type'    => [],
            'checked' => [],
        ];
        $allowedposttags['svg'] = [ // phpcs:ignore
            'fill'        => [],
            'role'        => [],
            'xmlns'       => [],
            'width'       => [],
            'height'      => [],
            'viewbox'     => [],
            'focusable'   => [],
            'aria-hidden' => [],
        ];
        $allowedposttags['path'] = [ // phpcs:ignore
            'd'    => [],
            'fill' => [],
        ];
    }

    echo wp_kses( dokan_dashboard_nav( $active_menu ), $allowedposttags );

    do_action( 'dokan_dashboard_sidebar_end' );
    ?>
</div>
