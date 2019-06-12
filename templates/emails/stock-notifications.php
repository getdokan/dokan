<?php
defined( 'ABSPATH' ) || exit;

do_action( 'woocommerce_email_header', $email_heading, $email ); ?>

<?php if ( ! empty( $low_stock_products ) ) : ?>
    <h2><?php esc_html_e( 'Low Stock Products', 'dokan-lite' ); ?></h2>
    <div class="low-stock-products">
        <table>
            <thead>
                <tr>
                    <th class="td">
                        <?php esc_html_e( 'Product', 'dokan-lite' ); ?>
                    </th>
                    <th class="td">
                        <?php esc_html_e( 'Stock Quantity', 'dokan-lite' ); ?>
                    </th>
                </tr>
            </thead>

            <tfoot>
             <?php foreach ( $low_stock_products as $low_stock_product_id ) : ?>
                <?php $low_stock_product = wc_get_product( $low_stock_product_id ); ?>
                    <tr class="products">
                        <th class="td">
                            <?php echo $low_stock_product->get_title(); ?>
                        </th>
                        <th class="td">
                            <?php echo $low_stock_product->get_stock_quantity(); ?>
                        </th>
                    </tr>
                <?php endforeach; ?>
            </tfoot>
        </table>
    </div>
<?php endif; ?>

<?php if ( ! empty( $out_of_stock_products ) ) : ?>
    <h2><?php esc_html_e( 'Out of Stock Products', 'dokan-lite' ); ?></h2>
    <div class="out-of-stock-products">
        <table>
            <thead>
                <tr>
                    <th class="td">
                        <?php esc_html_e( 'Product', 'dokan-lite' ); ?>
                    </th>
                    <th class="td">
                        <?php esc_html_e( 'Stock Quantity', 'dokan-lite' ); ?>
                    </th>
                </tr>
            </thead>

            <tfoot>
             <?php foreach ( $out_of_stock_products as $out_of_stock_product_id ) : ?>
                <?php $out_of_stock_product = wc_get_product( $out_of_stock_product_id ); ?>
                    <tr class="products">
                        <th class="td">
                            <?php echo $out_of_stock_product->get_title(); ?>
                        </th>
                        <th class="td">
                            <?php echo $out_of_stock_product->get_stock_quantity(); ?>
                        </th>
                    </tr>
                <?php endforeach; ?>
            </tfoot>
        </table>
    </div>
<?php endif;

do_action( 'woocommerce_email_footer', $email );

