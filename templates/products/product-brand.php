<?php
/**
 * Dokan Product Brand Template
 *
 * @since   4.0.4
 *
 * @package dokan
 *
 * @var array $product_brands List of product brands
 */
?>

<div class="dokan-form-group">
    <label for="product_brand" class="form-label"><?php esc_html_e( 'Brand', 'dokan-lite' ); ?></label>
    <select multiple="multiple" id="product_brand" name="product_brand[]" class="product_brand_search dokan-form-control" data-placeholder="<?php esc_attr_e( 'Select brand', 'dokan-lite' ); ?>">
        <?php if ( ! empty( $product_brands ) ) : ?>
            <?php foreach ( $product_brands as $brand ) : ?>
                <option value="<?php echo esc_attr( $brand->term_id ); ?>" selected="selected">
                    <?php echo esc_html( $brand->name ); ?>
                </option>
            <?php endforeach ?>
        <?php endif ?>
    </select>
</div>
