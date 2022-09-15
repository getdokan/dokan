<?php
/**
 *  Dokan Dashboard Template
 *
 *  Dokan Main Dashboard template for Fron-end
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
     *
     * @hooked get_dashboard_side_navigation
     *
     * @since  2.4
     */
    do_action( 'dokan_dashboard_content_before' );
    ?>

    <div class="dokan-dashboard-content">

        <?php

        /**
         *  Adding dokan_dashboard_content_before hook
         *
         * @hooked show_seller_dashboard_notice
         *
         * @since  2.4
         */
        do_action( 'dokan_dashboard_content_inside_before' );
        ?>

        <article class="dashboard-content-area">

            <?php

            /**
             *  Loading no permission error template
             *
             * @since  2.4
             */
            dokan_get_template_part(
                'global/dokan-error', '', [
                    'deleted' => false,
                    'message' => __( 'You have no permission to view this page', 'dokan-lite' ),
                ]
            );
            ?>

        </article><!-- .dashboard-content-area -->

        <?php

        /**
         *  Adding dokan_dashboard_content_inside_after hook
         *
         * @since 2.4
         */
        do_action( 'dokan_dashboard_content_inside_after' );
        ?>


    </div><!-- .dokan-dashboard-content -->

    <?php

    /**
     *  Adding dokan_dashboard_content_after hook
     *
     * @since 2.4
     */
    do_action( 'dokan_dashboard_content_after' );
    ?>

</div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>
