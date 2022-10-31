<?php

/**
 * Dokan Dashboard Template
 *
 * Dokan Dashboard Product widget template
 *
 * @since   2.4
 *
 * @package dokan
 */
?>

<div class="dashboard-widget products">
    <div class="widget-title">
        <i class="fas fa-briefcase" aria-hidden="true"></i> <?php esc_html_e( 'Products', 'dokan-lite' ); ?>

        <span class="pull-right">
            <a href="<?php echo esc_url( dokan_get_navigation_url( 'products' ) ); ?>"><?php esc_html_e( '+ Add new product', 'dokan-lite' ); ?></a>
        </span>
    </div>

    <ul class="list-unstyled list-count">
        <li>
            <a href="<?php echo esc_url( $products_url ); ?>">
                <span class="title"><?php esc_html_e( 'Total', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->total ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => 'publish' ], $products_url ) ); ?>">
                <span class="title"><?php esc_html_e( 'Live', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->publish ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => 'draft' ], $products_url ) ); ?>">
                <span class="title"><?php esc_html_e( 'Offline', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->draft ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => 'pending' ], $products_url ) ); ?>">
                <span class="title"><?php esc_html_e( 'Pending Review', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->pending ); ?></span>
            </a>
        </li>
    </ul>
</div> <!-- .products -->
