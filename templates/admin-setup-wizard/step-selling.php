<h1><?php esc_html_e( 'Selling Setup', 'dokan-lite' ); ?></h1>
<form method="post">
    <table class="form-table">
        <tr>
            <th scope="row"><label for="new_seller_enable_selling"><?php esc_html_e( 'New Vendor Enable Selling', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="wc-enhanced-select" id="new_seller_enable_selling" name="new_seller_enable_selling">
                <?php foreach ( $new_seller_enable_selling_statuses as $key => $value ) : ?>
                    <option value="<?php echo esc_attr( $key ); ?>" <?php selected( $key, $new_seller_enable_selling ); ?>>
                        <?php echo esc_html( $value ); ?>
                    </option>
                <?php endforeach; ?>
                </select>
                <span class="description">
                    <?php esc_html_e( 'Set selling status for newly registered vendor', 'dokan-lite' ); ?>
                </span>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="order_status_change"><?php esc_html_e( 'Order Status Change', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="checkbox" name="order_status_change" id="order_status_change" class="switch-input" <?php checked( $order_status_change, 'on' ); ?>>
                <label for="order_status_change" class="switch-label">
                    <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                    <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                </label>
                <span class="description">
                    <?php esc_html_e( 'Vendor can change order status', 'dokan-lite' ); ?>
                </span>
            </td>
        </tr>
    </table>
    <p class="wc-setup-actions step">
        <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
        <a href="<?php echo esc_url( $setup_wizard->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
        <?php wp_nonce_field( 'dokan-setup' ); ?>
    </p>
</form>
