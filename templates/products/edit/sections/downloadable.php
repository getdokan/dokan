<?php
/**
 * Product general data panel.
 *
 * @var WC_Product $product
 * @var Section    $section
 * @var string     $class
 *
 * @package WooCommerce\Admin
 */

use WeDevs\Dokan\ProductForm\Elements;
use WeDevs\Dokan\ProductForm\Section;

defined( 'ABSPATH' ) || exit;

$post = get_post( $product->get_id() ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
?>

<div class="dokan-download-options dokan-edit-row dokan-clearfix <?php echo esc_attr( $class ); ?>">
    <div class="dokan-section-heading" data-togglehandler="dokan_download_options">
        <h2><i class="fas fa-download" aria-hidden="true"></i> <?php esc_html_e( 'Downloadable Options', 'dokan-lite' ); ?></h2>
        <p><?php esc_html_e( 'Configure your downloadable product settings', 'dokan-lite' ); ?></p>
        <a href="#" class="dokan-section-toggle">
            <i class="fas fa-sort-down fa-flip-vertical" aria-hidden="true"></i>
        </a>
        <div class="dokan-clearfix"></div>
    </div>

    <div class="dokan-section-content">
        <div class="dokan-divider-top dokan-clearfix">

            <?php do_action( 'dokan_product_edit_before_sidebar' ); ?>

            <div class="dokan-side-body dokan-download-wrapper">
                <table class="dokan-table">
                    <tfoot>
                    <tr>
                        <th colspan="3">
                            <?php
                            $key = '';
                            $file = [
                                'file' => '',
                                'name' => '',
                            ];
                            ob_start();
                            require DOKAN_INC_DIR . '/woo-views/html-product-download.php';
                            $row_html = ob_get_clean();
                            ?>
                            <a href="#" class="insert-file-row dokan-btn dokan-btn-sm dokan-btn-success" data-row="<?php echo esc_attr( $row_html ); ?>">
                                <?php esc_html_e( 'Add File', 'dokan-lite' ); ?>
                            </a>
                        </th>
                    </tr>
                    </tfoot>
                    <thead>
                    <tr>
                        <th>
                            <?php esc_html_e( 'Name', 'dokan-lite' ); ?>
                            <span class="tips" title="<?php esc_attr_e( 'This is the name of the download shown to the customer.', 'dokan-lite' ); ?>">[?]</span>
                        </th>
                        <th>
                            <?php esc_html_e( 'File URL', 'dokan-lite' ); ?>
                            <span class="tips" title="<?php esc_attr_e( 'This is the URL or absolute path to the file which customers will get access to.', 'dokan-lite' ); ?>">[?]</span>
                        </th>
                        <th><?php esc_html_e( 'Action', 'dokan-lite' ); ?></th>
                    </tr>
                    </thead>
                    <tbody>
                    <?php

                    $downloadable_files       = $product->get_downloads( 'edit' );
                    $disabled_downloads_count = 0;

                    if ( $downloadable_files ) {
                        foreach ( $downloadable_files as $key => $file ) {
                            include DOKAN_INC_DIR . '/woo-views/html-product-download.php';
                        }
                    }
                    ?>
                    </tbody>
                </table>

                <div class="dokan-clearfix">
                    <?php
                    $download_limit = $section->get_field( Elements::DOWNLOAD_LIMIT );
                    if ( ! is_wp_error( $download_limit ) && $download_limit->is_visible() ) :
                        ?>
                        <div class="content-half-part">
                            <label for="<?php echo esc_attr( $download_limit->get_name() ); ?>" class="form-label">
                                <?php echo esc_html( $download_limit->get_title() ); ?>
                                <?php $download_limit->print_required_symbol(); ?>
                                <i
                                    class="fas fa-question-circle tips"
                                    aria-hidden="true"
                                    data-title="<?php echo esc_attr( $download_limit->get_description() ); ?>">
                                </i>
                            </label>
                            <?php
                            dokan_post_input_box(
                                $product->get_id(),
                                $download_limit->get_name(),
                                [
                                    'value'       => - 1 === $download_limit->get_value( $product ) ? '' : $download_limit->get_value( $product ),
                                    'placeholder' => $download_limit->get_placeholder(),
                                    'min'         => $download_limit->get_additional_properties( 'min' ),
                                    'step'        => $download_limit->get_additional_properties( 'step' ),
                                    'required'    => $download_limit->is_required(),
                                ],
                                'number'
                            );
                            ?>
                        </div><!-- .content-half-part -->
                    <?php endif; ?>

                    <?php
                    $download_expiry = $section->get_field( Elements::DOWNLOAD_EXPIRY );
                    if ( ! is_wp_error( $download_expiry ) && $download_expiry->is_visible() ) :
                        ?>
                        <div class="content-half-part">
                            <label for="<?php echo esc_attr( $download_expiry->get_name() ); ?>" class="form-label">
                                <?php echo esc_html( $download_expiry->get_title() ); ?>
                                <?php $download_expiry->print_required_symbol(); ?>
                                <i
                                    class="fas fa-question-circle tips"
                                    aria-hidden="true"
                                    data-title="<?php echo esc_attr( $download_expiry->get_description() ); ?>">
                                </i>
                            </label>
                            <?php
                            dokan_post_input_box(
                                $product->get_id(),
                                $download_expiry->get_name(),
                                [
                                    'value'       => - 1 === $download_expiry->get_value( $product ) ? '' : $download_expiry->get_value( $product ),
                                    'placeholder' => __( 'Never', 'dokan-lite' ),
                                    'min'         => $download_expiry->get_additional_properties( 'min' ),
                                    'step'        => $download_expiry->get_additional_properties( 'step' ),
                                    'required'    => $download_expiry->is_required(),
                                ],
                                'number'
                            );
                            ?>
                        </div><!-- .content-half-part -->
                    <?php endif; ?>
                </div>
            </div> <!-- .dokan-side-body -->
        </div> <!-- .downloadable -->
    </div>

    <?php do_action( 'dokan_product_edit_after_downloadable', $post, $product->get_id(), $product ); ?>
</div>
