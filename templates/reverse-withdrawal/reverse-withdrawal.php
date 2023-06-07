<?php
/**
 * @since 3.5.1
 */
?>
<?php do_action( 'dokan_dashboard_wrap_start' ); ?>

<div class="dokan-dashboard-wrap">

    <?php
    /**
     *  Adding dokan_dashboard_content_before hook
     *  Adding dokan_withdraw_content_before hook
     *
     * @hooked get_dashboard_side_navigation
     *
     * @since  3.5.1
     */
    do_action( 'dokan_dashboard_content_before' );
    do_action( 'dokan_reverse_withdrawal_content_before' );
    ?>

    <div class="dokan-dashboard-content dokan-reverse-withdrawal-content">

        <?php
        /**
         *  Adding dokan_reverse_withdrawal_content_inside_before hook
         *
         * @since 3.5.1
         */
        do_action( 'dokan_reverse_withdrawal_content_inside_before' );
        ?>

        <article class="dokan-withdraw-area">

            <?php
            /**
             * Adding dokan_reverse_withdrawal_header_render hook
             *
             * @since 3.5.1
             */
            do_action( 'dokan_reverse_withdrawal_content_area_header' );
            ?>

            <div class="entry-content">

                <?php
                /**
                 * Adding dokan_reverse_withdrawal_content hook
                 *
                 * @since 3.5.1
                 */
                do_action( 'dokan_reverse_withdrawal_content' );
                ?>

            </div><!-- .entry-content -->

        </article> <!-- .dokan-withdraw-area -->

        <?php

        /**
         *  Adding dokan_reverse_withdrawal_content_inside_after hook
         *
         * @since 3.5.1
         */
        do_action( 'dokan_reverse_withdrawal_content_inside_after' );
        ?>
    </div><!-- .dokan-dashboard-content -->

    <?php
    /**
     *  Adding dokan_dashboard_content_after hook
     *  dokan_reverse_withdrawal_content_after hook
     *
     * @since 3.5.1
     */
    do_action( 'dokan_dashboard_content_after' );
    do_action( 'dokan_reverse_withdrawal_content_after' );
    ?>
</div><!-- .dokan-dashboard-wrap -->

<?php do_action( 'dokan_dashboard_wrap_end' ); ?>
