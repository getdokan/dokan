<?php
/**
 *  Dokan Dashboard Product editor manager Template
 *
 *  Load product related template
 *
 *  @since DOKAN_SINCE
 *
 *  @package dokan
 */
?>

<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

    <div class="dokan-dashboard-wrap">

        <?php

            /**
             *  Added dokan_dashboard_content_before hook
             *
             *  @hooked get_dashboard_side_navigation
             *
             *  @since DOKAN_SINCE
             */
            do_action( 'dokan_dashboard_content_before' );
            do_action( 'dokan_product_editor_manager_content_before' );

        ?>

        <div class="dokan-dashboard-content dokan-product-product-editor-content">
            <?php

                /**
                 *  Added dokan_product_editor_manager_content_inside_before hook
                 *
                 *  @hooked show_seller_enable_message
                 *
                 *  @since DOKAN_SINCE
                 */
                do_action( 'dokan_product_editor_manager_content_inside_before' );
            ?>


            <article class="dokan-product-product-editor-area">
                <?php

                    /**
                     *  Added dokan_product_editor_manager_inside_content Hook
                     *
                     *  @hooked dokan_product_editor_manager_listing_status_filter
                     *  @hooked dokan_product_editor_manager_main_content
                     *
                     *  @since DOKAN_SINCE
                     */
                    do_action( 'dokan_product_editor_manager_inside_content' );
                ?>

            </article>


            <?php

                /**
                 *  Added dokan_product_editor_manager_content_inside_after hook
                 *
                 *  @since DOKAN_SINCE
                 */
                do_action( 'dokan_product_editor_manager_content_inside_after' );
            ?>

        </div> <!-- #primary .content-area -->

        <?php

            /**
             *  Added dokan_dashboard_content_after hook
             *  dokan_order_content_after hook
             *
             *  @since DOKAN_SINCE
             */
            do_action( 'dokan_dashboard_content_after' );
            do_action( 'dokan_product_editor_manager_content_after' );

        ?>

    </div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>
