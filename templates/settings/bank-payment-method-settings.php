<?php
/**
 * @var string $ac_name
 * @var string $ac_type
 * @var string $routing_number
 * @var string $ac_number
 * @var string $bank_name
 * @var string $bank_addr
 * @var string $iban
 * @var string $swift
 * @var string $save_or_add_btn_text
 * @var array  $required_fields
 * @var array  $fields_placeholders
 * @var array  $connected
 */
?>

<div class="dokan-bank-settings-template">
    <div class="dokan-form-group">
        <div>
            <label for="ac_name"><?php echo  esc_attr( ! empty( $fields_placeholders['ac_name']['label'] ) ? $fields_placeholders['ac_name']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input id='ac_name' name="settings[bank][ac_name]" value="<?php echo esc_attr( $ac_name ); ?>" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['ac_name']['placeholder'] ) ? $fields_placeholders['ac_name']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['ac_name'] ) ? '' : 'required'; ?> >
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label for="ac_type"><?php echo  esc_attr( ! empty( $fields_placeholders['ac_type']['label'] ) ? $fields_placeholders['ac_type']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <select id='ac_type' name="settings[bank][ac_type]" class="dokan-form-control" <?php echo empty( $required_fields['ac_type'] ) ? '' : 'required'; ?>>
                <option value="" <?php selected( '', $ac_type ); ?> > <?php esc_html_e( 'Please Select...', 'dokan-lite' ); ?> </option>
                <option value="personal" <?php selected( 'personal', $ac_type ); ?> > <?php esc_html_e( 'Personal', 'dokan-lite' ); ?> </option>
                <option value="business" <?php selected( 'business', $ac_type ); ?> > <?php esc_html_e( 'Business', 'dokan-lite' ); ?> </option>
            </select>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label id='ac_number'><?php echo  esc_attr( ! empty( $fields_placeholders['ac_number']['label'] ) ? $fields_placeholders['ac_number']['label'] : '' ); ?> </label>
        </div>
        <div class="dokan-w10">
            <input name="settings[bank][ac_number]" value="<?php echo esc_attr( $ac_number ); ?>" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['ac_number']['placeholder'] ) ? $fields_placeholders['ac_number']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['ac_number'] ) ? '' : 'required'; ?>>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php echo  esc_attr( ! empty( $fields_placeholders['routing_number']['label'] ) ? $fields_placeholders['routing_number']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][routing_number]" value="<?php echo esc_attr( $routing_number ); ?>" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['routing_number']['placeholder'] ) ? $fields_placeholders['routing_number']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['routing_number'] ) ? '' : 'required'; ?>>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php echo  esc_attr( ! empty( $fields_placeholders['bank_name']['label'] ) ? $fields_placeholders['bank_name']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][bank_name]" value="<?php echo esc_attr( $bank_name ); ?>" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['bank_name']['placeholder'] ) ? $fields_placeholders['bank_name']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['bank_name'] ) ? '' : 'required'; ?>>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php echo  esc_attr( ! empty( $fields_placeholders['bank_addr']['label'] ) ? $fields_placeholders['bank_addr']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <textarea name="settings[bank][bank_addr]" rows="5" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['bank_addr']['placeholder'] ) ? $fields_placeholders['bank_addr']['placeholder'] : '' ); ?>" <?php echo empty( $required_fields['bank_addr'] ) ? '' : 'required'; ?>><?php echo esc_html( $bank_addr ); ?></textarea>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php echo  esc_attr( ! empty( $fields_placeholders['iban']['label'] ) ? $fields_placeholders['iban']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][iban]" value="<?php echo esc_attr( $iban ); ?>" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['iban']['placeholder'] ) ? $fields_placeholders['iban']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['iban'] ) ? '' : 'required'; ?>>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php echo  esc_attr( ! empty( $fields_placeholders['swift']['label'] ) ? $fields_placeholders['swift']['label'] : '' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input value="<?php echo esc_attr( $swift ); ?>" name="settings[bank][swift]" class="dokan-form-control" placeholder="<?php echo  esc_attr( ! empty( $fields_placeholders['swift']['placeholder'] ) ? $fields_placeholders['swift']['placeholder'] : '' ); ?>" type="text" <?php echo empty( $required_fields['swift'] ) ? '' : 'required'; ?>>
        </div>
    </div>

    <div class="dokan-form-group dokan-text-left">
        <img alt="<?php esc_attr_e( 'bank check', 'dokan-lite' ); ?>" src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . '/images/withdraw-methods/bank-check.png' ); ?>"/>
    </div>

    <div class="dokan-form-group dokan-text-left">
        <input id="declaration" name="settings[bank][declaration]" checked type="checkbox"/>
        <label for="declaration">
            <?php echo  esc_attr( ! empty( $fields_placeholders['declaration']['label'] ) ? $fields_placeholders['declaration']['label'] : '' ); ?>
        </label>
    </div>

    <?php if( ! empty( $fields_placeholders['form_caution']['label'] ) || ! empty( $fields_placeholders['form_caution']['placeholder'] ) ):?>
        <div class="data-warning">
            <div class="left-icon-container">
                <i class="fa fa-info-circle fa-2x" aria-hidden="true"></i>
            </div>

            <div class="vr-separator"></div>

            <div class="dokan-text-left">
                <?php if ( ! empty( $fields_placeholders['form_caution']['label'] ) ): ?>
                    <span class="display-block"><b><?php echo  esc_attr( ! empty( $fields_placeholders['form_caution']['label'] ) ? $fields_placeholders['form_caution']['label'] : '' ); ?></b></span>
                    <br/>
                <?php endif; ?>
                <span class="display-block"><?php echo  esc_attr( ! empty( $fields_placeholders['form_caution']['placeholder'] ) ? $fields_placeholders['form_caution']['placeholder'] : '' ); ?></span>
            </div>
        </div>
    <?php endif;?>

    <p class="bottom-note"></p>

    <?php if ( ! isset( $_GET['page'] ) || 'dokan-seller-setup' !== sanitize_text_field( wp_unslash( $_GET['page'] ) ) ) : // phpcs:ignore ?>
        <div class="bottom-actions">
            <button class="ajax_prev save dokan-btn dokan-btn-theme" type="submit" name="dokan_update_payment_settings">
                <?php echo esc_html( $save_or_add_btn_text ); ?>
            </button>
            <a href="<?php echo esc_url( dokan_get_navigation_url( 'settings/payment' ) ); ?>">
                <?php esc_html_e( 'Cancel', 'dokan-lite' ); ?>
            </a>
            <input type="hidden" name="dokan_update_payment_settings">
            <button class="ajax_prev disconnect dokan_payment_disconnect_btn dokan-btn dokan-btn-danger <?php echo $connected ? '' : 'dokan-hide'; ?>" type="button" name="settings[bank][disconnect]">
                <?php esc_html_e( 'Disconnect', 'dokan-lite' ); ?>
            </button>
        </div>
    <?php endif; ?>
</div>
