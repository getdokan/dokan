<?php
/**
 * Downloadable and Virtual product type data.
 *
 * @since 2.4
 *
 * @var WC_Product $product
 * @var Section    $section
 * @var string     $class
 * @var string     $digital_mode
 */

use WeDevs\Dokan\ProductForm\Elements;
use WeDevs\Dokan\ProductForm\Section;

defined( 'ABSPATH' ) || exit;

$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
?>
<div class="dokan-form-group dokan-product-type-container <?php echo esc_attr( $class ); ?>">
    <?php
    $downloadable = $section->get_field( Elements::DOWNLOADABLE );
    if ( ! is_wp_error( $downloadable ) && $downloadable->is_visible() ) :
        ?>
        <div class="content-half-part downloadable-checkbox">
            <?php
            dokan_post_input_box(
                $product->get_id(),
                $downloadable->get_name(),
                [
                    'value'    => $downloadable->get_value( $product ) ? 'yes' : 'no',
                    'label'    => $downloadable->get_title(),
                    'desc'     => $downloadable->get_description(),
                    'required' => $downloadable->is_required(),
                ],
                'checkbox'
            );
            ?>
        </div>
    <?php endif; ?>

    <?php
    $virtual = $section->get_field( Elements::VIRTUAL );
    if ( ! is_wp_error( $virtual ) && $virtual->is_visible() ) :
        ?>
        <div class="content-half-part virtual-checkbox">
            <?php
            dokan_post_input_box(
                $product->get_id(),
                $virtual->get_name(),
                [
                    'value'    => $virtual->get_value( $product ) ? 'yes' : 'no',
                    'label'    => $virtual->get_title(),
                    'desc'     => $virtual->get_description(),
                    'required' => $virtual->is_required(),
                ],
                'checkbox'
            );
            ?>
        </div>
    <?php endif; ?>
    <div class="dokan-clearfix"></div>
</div>

<?php do_action( 'dokan_product_edit_after_downloadable_virtual', $post, $product->get_id(), $product ); ?>
