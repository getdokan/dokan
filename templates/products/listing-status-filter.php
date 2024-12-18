<?php
/**
 * Dokan Dashboard Product Listing status filter
 * Template
 *
 * @since   2.4
 *
 * @package dokan
 *
 * @var string   $permalink
 * @var string   $status_class
 * @var object   $post_counts
 * @var int      $instock_counts
 * @var int      $outofstock_counts ,
 * @var string[] $statuses          ,
 */
?>
<ul class="dokan-listing-filter dokan-left subsubsub">
    <li<?php echo $status_class === 'all' ? ' class="active"' : ''; ?>>
        <a href="<?php echo esc_url( $permalink ); ?>">
            <?php
            // translators: 1) All product count
            printf( esc_html__( 'All (%s)', 'dokan-lite' ), esc_html( number_format_i18n( $post_counts->total ) ) );
            ?>
        </a>
    </li>
    <?php
    $nonce = wp_create_nonce( 'product_listing_filter' );
    foreach ( $statuses as $status => $status_label ) : // phpcs:ignore
        if ( empty( $post_counts->{$status} ) ) {
            continue;
        }
        ?>
        <li<?php echo $status_class === $status ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => $status, '_product_listing_filter_nonce' => $nonce ], $permalink ) ); ?>"><?php echo esc_html( $status_label ) . ' (' . esc_html( $post_counts->{$status} ) . ')'; ?></a> <?php // phpcs:ignore ?>
        </li>
    <?php endforeach ?>
    <?php if ( $instock_counts ) : ?>
        <li<?php echo $status_class === 'instock' ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => 'instock', '_product_listing_filter_nonce' => $nonce ], $permalink ) ); ?>"><?php echo esc_html_e( 'In stock', 'dokan-lite' ) . ' (' . esc_html( $instock_counts ) . ')'; ?></a> <?php // phpcs:ignore ?>
        </li>
    <?php endif; ?>

    <?php if ( $outofstock_counts ) : ?>
        <li<?php echo $status_class === 'outofstock' ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( add_query_arg( [ 'post_status' => 'outofstock', '_product_listing_filter_nonce' => $nonce ], $permalink ) ); ?>"><?php echo esc_html_e( 'Out of stock', 'dokan-lite' ) . ' (' . esc_html( $outofstock_counts ) . ')'; ?></a> <?php // phpcs:ignore ?>
        </li>
    <?php endif; ?>
</ul> <!-- .post-statuses-filter -->
