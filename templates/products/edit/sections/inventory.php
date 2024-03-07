<?php
/**
 * Dokan Dashboard Product Edit Template
 *
 * @since   2.4
 *
 * @var WC_Product $product instance of WC_Product object
 * @var Section    $section
 * @var string     $class
 *
 * @package dokan
 */

use WeDevs\Dokan\ProductForm\Elements;
use WeDevs\Dokan\ProductForm\Section;

defined( 'ABSPATH' ) || exit;

$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
?>

<div class="dokan-product-inventory dokan-edit-row <?php echo esc_attr( $class ); ?>">
    <div class="dokan-section-heading" data-togglehandler="dokan_product_inventory">
        <h2><i class="fas fa-cubes" aria-hidden="true"></i> <?php echo esc_html( $section->get_title() ); ?></h2>
        <p><?php echo esc_html( $section->get_description() ); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fas fa-sort-down fa-flip-vertical" aria-hidden="true"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>

    <div class="dokan-section-content">
        <?php
        $sku = $section->get_field( Elements::SKU );
        if ( ! is_wp_error( $sku ) && $sku->is_visible() ) :
            ?>
            <div class="content-half-part dokan-form-group">
                <label for="<?php echo esc_attr( $sku->get_name() ); ?>" class="form-label">
                    <?php echo wp_kses_post( $sku->get_title() ); ?>
                    <?php $sku->print_required_symbol(); ?>
                    <i
                        class="fas fa-question-circle tips <?php echo empty( $sku->get_help_content() ) ? 'dokan-hide' : ''; ?>"
                        aria-hidden="true"
                        data-title="<?php echo esc_attr( $sku->get_help_content() ); ?>">
                    </i>
                </label>
                <?php
                dokan_post_input_box(
                    $product->get_id(),
                    $sku->get_name(),
                    [
                        'value'    => $sku->get_value( $product ),
                        'class'    => 'dokan-form-control',
                        'required' => $sku->is_required(),
                    ]
                );
                ?>
            </div>
        <?php endif; ?>

        <?php
        $stock_status = $section->get_field( Elements::STOCK_STATUS );
        if ( ! is_wp_error( $stock_status ) && $stock_status->is_visible() ) :
            ?>
            <div class="content-half-part hide_if_variable hide_if_external hide_if_stock_global">
                <label for="<?php echo esc_attr( $stock_status->get_name() ); ?>" class="form-label">
                    <?php echo esc_html( $stock_status->get_title() ); ?>
                    <?php $stock_status->print_required_symbol(); ?>
                    <i
                        class="fas fa-question-circle tips <?php echo empty( $stock_status->get_help_content() ) ? 'dokan-hide' : ''; ?>"
                        aria-hidden="true"
                        data-title="<?php echo esc_attr( $stock_status->get_help_content() ); ?>">
                    </i>
                </label>
                <?php
                dokan_post_input_box(
                    $product->get_id(),
                    $stock_status->get_name(),
                    [
                        'name'     => $stock_status->get_name(),
                        'value'    => $stock_status->get_value( $product ),
                        'options'  => $stock_status->get_options(),
                        'required' => $stock_status->is_required(),
                    ],
                    'select'
                );
                ?>
            </div>
        <?php endif; ?>

        <div class="dokan-clearfix"></div>

        <?php if ( 'yes' === get_option( 'woocommerce_manage_stock' ) ) : ?>
            <?php
            $manage_stock = $section->get_field( Elements::MANAGE_STOCK );
            if ( ! is_wp_error( $manage_stock ) && $manage_stock->is_visible() ) :
                ?>
                <div class="dokan-form-group hide_if_grouped hide_if_external">
                    <?php
                    dokan_post_input_box(
                        $product->get_id(),
                        $manage_stock->get_name(),
                        [
                            'value' => $manage_stock->get_value( $product ) ? 'yes' : 'no',
                            'label' => $manage_stock->get_title(),
                        ],
                        'checkbox'
                    );
                    ?>
                </div>
            <?php endif; ?>

            <div class="show_if_stock dokan-stock-management-wrapper dokan-form-group dokan-clearfix">
                <?php
                $stock_quantity = $section->get_field( Elements::STOCK_QUANTITY );
                if ( ! is_wp_error( $stock_quantity ) && $stock_quantity->is_visible() ) :
                    ?>
                    <div class="content-half-part">
                        <label for="<?php echo esc_attr( $stock_quantity->get_name() ); ?>" class="form-label">
                            <?php echo esc_html( $stock_quantity->get_title() ); ?>
                            <?php $stock_quantity->print_required_symbol(); ?>
                            <i
                                class="fas fa-question-circle tips <?php echo empty( $stock_quantity->get_help_content() ) ? 'dokan-hide' : ''; ?>"
                                aria-hidden="true"
                                data-title="<?php echo esc_attr( $stock_quantity->get_help_content() ); ?>">
                            </i>
                        </label>
                        <?php
                        dokan_post_input_box(
                            $product->get_id(),
                            $stock_quantity->get_name(),
                            [
                                'name'        => $stock_quantity->get_name(),
                                'value'       => wc_stock_amount( $stock_quantity->get_value( $product ) ),
                                'class'       => 'dokan-form-control',
                                'placeholder' => $stock_quantity->get_placeholder(),
                                'min'         => $stock_quantity->get_additional_properties( 'min' ),
                                'step'        => $stock_quantity->get_additional_properties( 'step' ),
                                'required'    => $stock_quantity->is_required(),
                            ],
                            'number'
                        );
                        ?>
                    </div>
                    <input type="hidden" name="_original_stock" value="<?php echo esc_attr( wc_stock_amount( $product->get_stock_quantity( 'edit' ) ) ); ?>"/>
                <?php endif; ?>

                <?php
                $low_stock_amount = $section->get_field( Elements::LOW_STOCK_AMOUNT );
                if ( ! is_wp_error( $low_stock_amount ) && $low_stock_amount->is_visible() ) :
                    ?>
                    <div class="content-half-part">
                        <label for="<?php echo esc_attr( $low_stock_amount->get_name() ); ?>" class="form-label">
                            <?php echo esc_html( $low_stock_amount->get_title() ); ?>
                            <?php $low_stock_amount->print_required_symbol(); ?>
                            <i
                                class="fas fa-question-circle tips <?php echo empty( $low_stock_amount->get_help_content() ) ? 'dokan-hide' : ''; ?>"
                                aria-hidden="true"
                                data-title="<?php echo esc_attr( $low_stock_amount->get_help_content() ); ?>">
                            </i>
                        </label>
                        <?php
                        dokan_post_input_box(
                            $product->get_id(),
                            $low_stock_amount->get_name(),
                            [
                                'value'       => $low_stock_amount->get_value( $product ),
                                'class'       => 'dokan-form-control',
                                'placeholder' => $low_stock_amount->get_placeholder(),
                                'min'         => $low_stock_amount->get_additional_properties( 'min' ),
                                'step'        => $low_stock_amount->get_additional_properties( 'step' ),
                                'required'    => $low_stock_amount->is_required(),
                            ],
                            'number'
                        );
                        ?>
                    </div>
                <?php endif; ?>

                <?php
                $backorders = $section->get_field( Elements::BACKORDERS );
                if ( ! is_wp_error( $backorders ) && $backorders->is_visible() ) :
                    ?>
                    <div class="content-half-part last-child">
                        <label for="<?php echo esc_attr( $backorders->get_name() ); ?>" class="form-label">
                            <?php echo esc_html( $backorders->get_title() ); ?>
                            <?php $backorders->print_required_symbol(); ?>
                            <i
                                class="fas fa-question-circle tips <?php echo empty( $backorders->get_help_content() ) ? 'dokan-hide' : ''; ?>"
                                aria-hidden="true"
                                data-title="<?php echo esc_attr( $backorders->get_help_content() ); ?>">
                            </i>
                        </label>

                        <?php
                        dokan_post_input_box(
                            $product->get_id(),
                            $backorders->get_name(),
                            [
                                'value'    => $backorders->get_value( $product ),
                                'options'  => $backorders->get_options(),
                                'required' => $backorders->is_required(),
                            ],
                            'select'
                        );
                        ?>
                    </div>
                <?php endif; ?>

                <div class="dokan-clearfix"></div>
            </div><!-- .show_if_stock -->
        <?php endif; ?>

        <?php
        $sold_individually = $section->get_field( Elements::SOLD_INDIVIDUALLY );
        if ( ! is_wp_error( $sold_individually ) && $sold_individually->is_visible() ) :
            ?>
            <div class="dokan-form-group hide_if_grouped hide_if_external">
                <?php
                dokan_post_input_box(
                    $product->get_id(),
                    $sold_individually->get_name(),
                    [
                        'value' => $sold_individually->get_value( $product ) ? 'yes' : 'no',
                        'label' => $sold_individually->get_title(),
                        'desc'  => $sold_individually->get_description(),
                    ],
                    'checkbox'
                );
                ?>
            </div>
        <?php endif; ?>

        <?php do_action( 'dokan_product_edit_after_inventory', $post, $product->get_id(), $product ); ?>
        <?php do_action( 'dokan_product_edit_after_sidebar', $post, $product->get_id(), $product ); ?>
        <?php do_action( 'dokan_single_product_edit_after_sidebar', $post, $product->get_id(), $product ); ?>

    </div><!-- .dokan-side-right -->
</div><!-- .dokan-product-inventory -->
