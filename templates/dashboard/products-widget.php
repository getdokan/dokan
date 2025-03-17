<?php

/**
 * Dokan Dashboard Template
 *
 * Dokan Dashboard Product widget template
 *
 * @since   2.4
 *
 * @var object $post_counts All product status count.
 * @var string $products_url All product listing url.
 * @var string $online_url Online product listing url.
 * @var string $draft_url Draft product listing url.
 * @var string $pending_url Pending product listing url.
 *
 * @package dokan
 */
?>

<div class="dashboard-widget products">
    <div class="widget-title">
        <i class="fas fa-briefcase" aria-hidden="true"></i> <?php esc_html_e( 'Products', 'dokan-lite' ); ?>

        <span class="pull-right">
            <a href="<?php echo esc_url( dokan_get_new_product_url() ); ?>"><?php esc_html_e( '+ Add new product', 'dokan-lite' ); ?></a>
        </span>
    </div>

    <ul class="list-unstyled list-count">
        <li>
            <a href="<?php echo esc_url( $products_url ); ?>">
                <span class="title"><?php esc_html_e( 'Total', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->total ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( $online_url ); ?>">
                <span class="title"><?php esc_html_e( 'Live', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->publish ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( $draft_url ); ?>">
                <span class="title"><?php esc_html_e( 'Offline', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->draft ); ?></span>
            </a>
        </li>
        <li>
            <a href="<?php echo esc_url( $pending_url ); ?>">
                <span class="title"><?php esc_html_e( 'Pending Review', 'dokan-lite' ); ?></span> <span class="count"><?php echo esc_attr( $post_counts->pending ); ?></span>
            </a>
        </li>
    </ul>
</div> <!-- .products -->
