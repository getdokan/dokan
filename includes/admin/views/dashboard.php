<?php
//wp_widget_rss_output
function dokan_admin_dash_metabox( $title = '', $callback = null, $class = "" ) {
    ?>
    <div class="postbox <?php echo $class ?>">
        <h3 class="hndle <?php echo $class ?>"><span><?php echo esc_html( $title ); ?></span></h3>
        <div class="inside">
            <div class="main">
                <?php if ( is_callable( $callback ) ) {
                    call_user_func( $callback );
                } ?>
            </div> <!-- .main -->
        </div> <!-- .inside -->
    </div> <!-- .postbox -->
    <?php
}

function dokan_admin_dash_metabox_report() {
    dokan_admin_report();
    ?>
    <div class="chart-container">
        <div class="chart-placeholder main" style="width: 100%; height: 350px;"></div>
    </div>
    <?php
}

function dokan_admin_dash_widget_news() {
    wp_widget_rss_output( 'http://wedevs.com/tag/dokan/feed/', array( 'items' => 5, 'show_summary' => true, 'show_date' => true ) );
}

function dokan_admin_status_metabox() {

    $sales_counts       = dokan_get_sales_count();
    $withdraw_counts    = dokan_get_withdraw_count();
    $seller_counts      = dokan_get_seller_count();
    $product_counts     = dokan_get_product_count();

    ?>

    <div class="dokan-status">

        <ul>
            <li class="sale">
                <div class="dashicons dashicons-chart-bar"></div>
                <a href="<?php echo WeDevs_Dokan::init()->is_pro_exists() ? admin_url( 'admin.php?page=dokan-reports' ) : ''; ?>">
                    <strong>
                        <?php echo wc_price( $sales_counts['this_month_order_total'] ); ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'net sales this month', 'dokan-lite' ); ?><span class="<?php echo $sales_counts['sale_parcent_class']; ?>"><?php echo $sales_counts['sale_parcent']; ?></span>
                    </div>
                </a>
            </li>
            <li class="commission">
                <div class="dashicons dashicons-chart-pie"></div>
                <a href="<?php echo WeDevs_Dokan::init()->is_pro_exists() ? admin_url( 'admin.php?page=dokan-reports' ) : ''; ?>">
                    <strong>
                        <?php echo wc_price( $sales_counts['this_month_earning_total'] ); ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'commission earned', 'dokan-lite' ); ?><span class="<?php echo $sales_counts['earning_parcent_class']; ?>"><?php echo $sales_counts['earning_parcent']; ?></span>
                    </div>
                </a>
            </li>
            <li class="vendor">
                <div class="dashicons dashicons-id"></div>
                <a href="<?php echo WeDevs_Dokan::init()->is_pro_exists() ? admin_url( 'admin.php?page=dokan-sellers' ) : ''; ?>">
                    <strong>
                        <?php
                        if ( $seller_counts['this_month'] ) {
                            printf( _n( __( '%d Vendor', 'dokan-lite' ), __( '%d Vendors', 'dokan-lite' ), $seller_counts['this_month'], 'dokan-lite' ), $seller_counts['this_month'] );
                        } else {
                            _e( '0 Vendor', 'dokan-lite' );
                        }  ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'signup this month', 'dokan-lite' ); ?><span class="<?php echo $seller_counts['class']; ?>"><?php echo $seller_counts['parcent']; ?></span>
                    </div>
                </a>
            </li>

            <li class="approval">
                <div class="dashicons dashicons-businessman"></div>
                <a href="<?php echo WeDevs_Dokan::init()->is_pro_exists() ? admin_url( 'admin.php?page=dokan-sellers&amp;status=pending' ) : ''; ?>">
                    <strong>
                        <?php
                        if ( $seller_counts['inactive'] ) {
                            printf( _n( __( '%d Vendor', 'dokan-lite' ), __( '%d Vendors', 'dokan-lite' ), $seller_counts['inactive'], 'dokan-lite' ), $seller_counts['inactive'] );
                        } else {
                            _e( '0 Vendor', 'dokan-lite' );
                        }  ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'awaiting approval', 'dokan-lite' ); ?>
                    </div>
                </a>
            </li>
            <li class="product">
                <div class="dashicons dashicons-cart"></div>
                <a href="<?php echo admin_url( 'edit.php?post_type=product' ); ?>">
                    <strong>
                        <?php
                        if ( $product_counts['this_month'] ) {
                            printf( _n( __( '%d Product', 'dokan-lite' ), __( '%d Products', 'dokan-lite' ), $product_counts['this_month'], 'dokan-lite' ), $product_counts['this_month'] );
                        } else {
                            _e( '0 Product', 'dokan-lite' );
                        }  ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'created this month', 'dokan-lite' ); ?><span class="<?php echo $product_counts['class']; ?>"><?php echo $product_counts['parcent']; ?></span>
                    </div>
                </a>
            </li>
            <li class="withdraw">
                <div class="dashicons dashicons-money"></div>
                <a href="<?php echo WeDevs_Dokan::init()->is_pro_exists() ? admin_url( 'admin.php?page=dokan-withdraw' ) : ''; ?>">
                    <strong>
                        <?php printf( __( '%d Withdrawals', 'dokan-lite' ), $withdraw_counts['pending'] ); ?>
                    </strong>
                    <div class="details">
                        <?php _e( 'awaiting approval', 'dokan-lite' ); ?>
                    </div>
                </a>
            </li>
        </ul>
    </div>

    <?php
}

?>
<div class="wrap dokan-dashboard">

    <h2><?php _e( 'Dokan Dashboard', 'dokan-lite' ); ?></h2>

    <div class="metabox-holder">
        <div class="post-box-container">
            <div class="meta-box-sortables">
                <?php dokan_admin_dash_metabox( __( 'Dokan Status', 'dokan-lite' ), 'dokan_admin_status_metabox', 'dokan-status' ); ?>
                <?php dokan_admin_dash_metabox( __( 'Dokan News Updates', 'dokan-lite' ), 'dokan_admin_dash_widget_news', 'news-updates'); ?>

                <?php do_action( 'dokan_admin_dashboard_metabox_left' ); ?>
            </div>
        </div> <!-- .post-box-container -->

        <div class="post-box-container">
            <div class="meta-box-sortables">
                <?php dokan_admin_dash_metabox( __( 'Overview', 'dokan-lite' ), 'dokan_admin_dash_metabox_report', 'overview' ); ?>

                <?php do_action( 'dokan_admin_dashboard_metabox_right' ); ?>
            </div>
        </div> <!-- .post-box-container -->

    </div> <!-- .metabox-holder -->

</div> <!-- .wrap -->
