<?php

/**
 * Dokan Dashboard Template
 *
 * Dokan Dashboard Product widget template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>

<div class="dashboard-widget products">
    <div class="widget-title">
        <i class="fa fa-briefcase" aria-hidden="true"></i> <?php _e( 'Products', 'dokan-lite' ); ?>

        <span class="pull-right">
            <a href="<?php echo dokan_get_navigation_url( 'new-product' ); ?>"><?php _e( '+ Add new product', 'dokan-lite' ); ?></a>
        </span>
    </div>

    <ul class="list-unstyled list-count">
        <li>
            <a href="<?php echo $products_url; ?>">
                <span class="title"><?php _e( 'Total', 'dokan-lite' ); ?></span> <span class="count"><?php echo $post_counts->total; ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo add_query_arg( array( 'post_status' => 'publish' ), $products_url ); ?>">
                <span class="title"><?php _e( 'Live', 'dokan-lite' ); ?></span> <span class="count"><?php echo $post_counts->publish; ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo add_query_arg( array( 'post_status' => 'draft' ), $products_url ); ?>">
                <span class="title"><?php _e( 'Offline', 'dokan-lite' ); ?></span> <span class="count"><?php echo $post_counts->draft; ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo add_query_arg( array( 'post_status' => 'pending' ), $products_url ); ?>">
                <span class="title"><?php _e( 'Pending Review', 'dokan-lite' ); ?></span> <span class="count"><?php echo $post_counts->pending; ?></span>
            </a>
        </li>
    </ul>
</div> <!-- .products -->
