<?php
/**
 * Dokan Settings Main Template
 *
 * @since   2.4
 *
 * @package dokan
 */
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

<div class="dokan-dashboard-wrap">

    <?php

    /**
     *  Adding dokan_dashboard_content_before hook
     *  dokan_dashboard_settings_store_content_before hook
     *
     * @hooked get_dashboard_side_navigation
     *
     * @since  2.4
     */
    do_action( 'dokan_dashboard_content_before' );
    do_action( 'dokan_dashboard_settings_content_before' );
    ?>

    <div class="dokan-dashboard-content dokan-settings-content">
        <?php

        /**
         *  Adding dokan_settings_content_inside_before hook
         *
         * @since 2.4
         */
        do_action( 'dokan_settings_content_inside_before' );
        ?>
        <article class="dokan-settings-area">

            <?php
            /**
             * Adding dokan_review_content_area_header hook
             *
             * @hooked dokan_settings_content_area_header
             *
             * @since  2.4
             */
            do_action( 'dokan_settings_content_area_header' );


            /**
             * Adding dokan_settings_content hook
             *
             * @hooked render_settings_content_hook
             */
            do_action( 'dokan_settings_content' );
            ?>

            <!--settings updated content ends-->
        </article>
    </div><!-- .dokan-dashboard-content -->
</div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>
