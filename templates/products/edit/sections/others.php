<?php
/**
 * Product other data panel.
 *
 * @since   2.4
 *
 * @var Section    $section
 * @var WC_Product $product
 * @var string     $post_status
 * @var string     $class
 *
 * @package WeDevs\Dokan
 */

use WeDevs\Dokan\ProductForm\Elements;
use WeDevs\Dokan\ProductForm\Section;

defined( 'ABSPATH' ) || exit;

$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
?>

<div class="dokan-other-options dokan-edit-row dokan-clearfix <?php echo esc_attr( $class ); ?>">
    <div class="dokan-section-heading" data-togglehandler="dokan_other_options">
        <h2><i class="fas fa-cog" aria-hidden="true"></i> <?php echo esc_html( $section->get_title() ); ?></h2>
        <p><?php echo esc_html( $section->get_description() ); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fas fa-sort-down fa-flip-vertical" aria-hidden="true"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>

    <div class="dokan-section-content">
        <?php
        $product_status = $section->get_field( Elements::STATUS );
        if ( ! is_wp_error( $product_status ) && $product_status->is_visible() ) :
            ?>
            <div class="dokan-form-group content-half-part">
                <label for="<?php echo esc_attr( $product_status->get_name() ); ?>" class="form-label">
                    <?php echo esc_html( $product_status->get_title() ); ?>
                    <?php $product_status->print_required_symbol(); ?>
                    <i
                        class="fas fa-question-circle tips"
                        aria-hidden="true"
                        data-title="<?php echo esc_attr( $product_status->get_description() ); ?>">
                    </i>
                </label>
                <select id="<?php echo esc_attr( $product_status->get_name() ); ?>" class="dokan-form-control" name="<?php echo esc_attr( $product_status->get_name() ); ?>" <?php echo $product_status->get_required() ? 'required' : ''; ?>>
                    <?php foreach ( $product_status->get_options() as $status => $label ) : // phpcs:ignore ?>
                        <option value="<?php echo esc_attr( $status ); ?>" <?php selected( $status, $product_status->get_value( $product ) ); ?>>
                            <?php echo esc_html( $label ); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        <?php endif; ?>

        <?php
        $catalog_visibility = $section->get_field( Elements::CATALOG_VISIBILITY );
        if ( ! is_wp_error( $catalog_visibility ) && $catalog_visibility->is_visible() ) :
            ?>
            <div class="dokan-form-group content-half-part">
                <label for="<?php echo esc_attr( $catalog_visibility->get_name() ); ?>" class="form-label">
                    <?php echo esc_html( $catalog_visibility->get_title() ); ?>
                    <?php $catalog_visibility->print_required_symbol(); ?>
                    <i
                        class="fas fa-question-circle tips"
                        aria-hidden="true"
                        data-title="<?php echo esc_attr( $catalog_visibility->get_description() ); ?>">
                    </i>
                </label>
                <select name="<?php echo esc_attr( $catalog_visibility->get_name() ); ?>" id="<?php echo esc_attr( $catalog_visibility->get_name() ); ?>" class="dokan-form-control" <?php echo $catalog_visibility->is_required() ? 'required' : ''; ?>>
                    <?php foreach ( $catalog_visibility->get_options() as $name => $label ) : ?>
                        <option value="<?php echo esc_attr( $name ); ?>" <?php selected( $catalog_visibility->get_value( $product ), $name ); ?>>
                            <?php echo esc_html( $label ); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
        <?php endif; ?>

        <div class="dokan-clearfix"></div>

        <?php
        $purchase_note = $section->get_field( Elements::PURCHASE_NOTE );
        if ( ! is_wp_error( $purchase_note ) && $purchase_note->is_visible() ) :
            ?>
            <div class="dokan-form-group">
                <label for="<?php echo esc_attr( $purchase_note->get_name() ); ?>" class="form-label">
                    <?php echo esc_html( $purchase_note->get_title() ); ?>
                    <?php $purchase_note->print_required_symbol(); ?>
                    <i
                        class="fas fa-question-circle tips"
                        aria-hidden="true"
                        data-title="<?php echo esc_attr( $purchase_note->get_description() ); ?>">
                    </i>
                </label>
                <?php
                dokan_post_input_box(
                    $product->get_id(),
                    $purchase_note->get_name(),
                    [
                        'name'        => $purchase_note->get_name(),
                        'value'       => $purchase_note->get_value( $product ),
                        'placeholder' => $purchase_note->get_placeholder(),
                        'required'    => $purchase_note->is_required(),
                    ],
                    'textarea'
                );
                ?>
            </div>
        <?php endif; ?>

        <?php
        $enable_reviews = $section->get_field( Elements::REVIEWS_ALLOWED );
        if ( ! is_wp_error( $enable_reviews ) && $enable_reviews->is_visible() && post_type_supports( 'product', 'comments' ) ) :
            ?>
            <div class="dokan-form-group">
                <?php
                dokan_post_input_box(
                    $product->get_id(),
                    $enable_reviews->get_name(),
                    [
                        'name'     => $enable_reviews->get_name(),
                        'value'    => $enable_reviews->get_value( $product ) ? 'yes' : 'no',
                        'label'    => __( 'Enable product reviews', 'dokan-lite' ),
                        'required' => $enable_reviews->is_required(),
                    ],
                    'checkbox'
                );
                ?>
            </div>
        <?php endif; ?>

        <?php do_action( 'dokan_product_edit_after_other_options', $post, $product->get_id(), $product ); ?>
    </div>
</div><!-- .dokan-other-options -->
