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
                            <th><?php esc_html_e( 'Name', 'dokan-lite' ); ?> <span class="tips" title="<?php esc_attr_e( 'This is the name of the download shown to the customer.', 'dokan-lite' ); ?>">[?]</span></th>
                            <th><?php esc_html_e( 'File URL', 'dokan-lite' ); ?> <span class="tips" title="<?php esc_attr_e( 'This is the URL or absolute path to the file which customers will get access to.', 'dokan-lite' ); ?>">[?]</span></th>
                            <th><?php esc_html_e( 'Action', 'dokan-lite' ); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $downloadable_files = get_post_meta( $post_id, '_downloadable_files', true );

                        if ( $downloadable_files ) {
                            foreach ( $downloadable_files as $key => $file ) {
                                include DOKAN_INC_DIR . '/woo-views/html-product-download.php';
                            }
                        }
                        ?>
                    </tbody>
                </table>

                <div class="dokan-clearfix">
                    <div class="content-half-part">
                        <label for="_download_limit" class="form-label"><?php esc_html_e( 'Download Limit', 'dokan-lite' ); ?></label>
                        <?php dokan_post_input_box( $post_id, '_download_limit', array( 'placeholder' => __( 'Unlimited', 'dokan-lite' ) ) ); ?>
                    </div><!-- .content-half-part -->

                    <div class="content-half-part">
                        <label for="_download_expiry" class="form-label"><?php esc_html_e( 'Download Expiry', 'dokan-lite' ); ?></label>
                        <?php dokan_post_input_box( $post_id, '_download_expiry', array( 'placeholder' => __( 'Never', 'dokan-lite' ) ) ); ?>
                    </div><!-- .content-half-part -->
                </div>

            </div> <!-- .dokan-side-body -->
        </div> <!-- .downloadable -->
    </div>
</div>
