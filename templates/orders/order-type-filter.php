<?php
/**
 * Order Type Filter Dropdown Template
 *
 * This template renders the order type filter dropdown in the WP Admin → WooCommerce → Orders page.
 *
 * @since 4.2.1
 *
 * @package Dokan
 *
 * @var array  $filter_options Array of filter options (value => label)
 * @var string $current_filter Currently selected filter value
 */

defined( 'ABSPATH' ) || exit;
?>

<select name="dokan_order_filter" id="dokan_order_filter">
    <?php foreach ( $filter_options as $value => $label ) : ?>
        <option value="<?php echo esc_attr( $value ); ?>" <?php selected( $current_filter, $value ); ?>>
            <?php echo esc_html( $label ); ?>
        </option>
    <?php endforeach; ?>
</select>
