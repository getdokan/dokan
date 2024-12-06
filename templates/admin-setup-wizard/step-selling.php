<h1><?php esc_html_e( 'Selling Setup', 'dokan-lite' ); ?></h1>
<form method="post">
    <table class="form-table">
        <tr>
            <th scope="row"><label for="new_seller_enable_selling"><?php esc_html_e( 'New Vendor Enable Selling', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="checkbox" name="new_seller_enable_selling" id="new_seller_enable_selling" class="switch-input" <?php checked( $new_seller_enable_selling, 'on', true ); ?>>
                <label for="new_seller_enable_selling" class="switch-label">
                    <span class="toggle--on"><?php esc_html_e( 'On', 'dokan-lite' ); ?></span>
                    <span class="toggle--off"><?php esc_html_e( 'Off', 'dokan-lite' ); ?></span>
                </label>
                <span class="description">
                    <?php esc_html_e( 'Make selling status enable for new registred vendor', 'dokan-lite' ); ?>
                </span>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="admin_percentage"><?php esc_html_e( 'Commission Type', 'dokan-lite' ); ?></label></th>
            <td>
                <select class="commission_type wc-enhanced-select" name="commission_type">
                    <?php foreach ( $dokan_commission_types as $type_key => $type_title ) : ?>
                        <option value="<?php echo esc_attr( $type_key ); ?>" <?php selected( $commission_type, $type_key ); ?>>
                            <?php echo esc_html( $type_title ); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php esc_html_e( 'Set your commission type', 'dokan-lite' ); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row"><label for="admin_percentage"><?php esc_html_e( 'Admin Commission', 'dokan-lite' ); ?></label></th>
            <td>
                <input type="text" class="location-input" id="admin_percentage" name="admin_percentage" value="<?php echo esc_attr( $admin_percentage ); ?>" />
                <?php do_action( 'dokan_admin_setup_wizard_after_admin_commission' ); ?>
                <p class="description combine-commission-description"><?php esc_html_e( 'How much amount (%) you will get from each order', 'dokan-lite' ); ?></p>
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
