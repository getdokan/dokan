<?php
/**
 * Dokan Dashboard Product Listing status filter
 * Template
 *
 * @since 2.4
 *
 * @package dokan
 */
?>
<ul class="dokan-listing-filter dokan-left subsubsub">
    <li<?php echo $status_class == 'all' ? ' class="active"' : ''; ?>>
        <a href="<?php echo esc_url( $permalink ); ?>"><?php printf( esc_html__( 'All (%d)', 'dokan-lite' ), esc_html( $post_counts->total ) ); ?></a>
    </li>
    <?php foreach ( $statuses as $status => $status_label ): ?>
        <?php
            if ( empty( $post_counts->{$status} ) ) {
                continue;
            }
        ?>
        <li<?php echo $status_class == $status ? ' class="active"' : ''; ?>>
            <a href="<?php echo esc_url( add_query_arg( array( 'post_status' => $status ), $permalink ) ); ?>"><?php echo esc_html( $status_label ). ' (' . esc_html( $post_counts->{$status} ) . ')'; ?></a>
        </li>
    <?php endforeach ?>
</ul> <!-- .post-statuses-filter -->
