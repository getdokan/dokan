<?php
/**
 * @var string $account_name
 * @var string $account_type
 * @var string $routing_number
 * @var string $account_number
 * @var string $bank_name
 * @var string $bank_addr
 * @var string $iban
 * @var string $swift_code
 * @var string $save_or_add_btn_text
 */
?>

<div class="dokan-bank-settings-template">
    <p class="dokan-text-left"><?php esc_html_e( 'Deposit earnings directly to your U.S. bank account free of charge', 'dokan-lite' ); ?></p>

    <div class="dokan-form-group">
        <div>
            <label for="ac_name"><?php esc_html_e( 'Account Holder', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input id='ac_name' name="settings[bank][ac_name]" value="<?php echo esc_attr( $account_name ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Your bank account name', 'dokan-lite' ); ?>" type="text" required>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label for="ac_type"><?php esc_html_e( 'Account Type', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <select id='ac_type' name="settings[bank][ac_type]" class="dokan-form-control" required>
                <option value="" <?php selected( '', $account_type ); ?> > <?php esc_html_e( 'Please Select...', 'dokan-lite' ); ?> </option>
                <option value="personal" <?php selected( 'personal', $account_type ); ?> > <?php esc_html_e( 'Personal', 'dokan-lite' ); ?> </option>
                <option value="business" <?php selected( 'business', $account_type ); ?> > <?php esc_html_e( 'Business', 'dokan-lite' ); ?> </option>
            </select>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php esc_html_e( 'Routing & Account Number', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][routing_number]" value="<?php echo esc_attr( $routing_number ); ?>" class="dokan-form-control dokan-w4" placeholder="<?php esc_attr_e( 'Routing number', 'dokan-lite' ); ?>" type="text" required>
            <input name="settings[bank][ac_number]" value="<?php echo esc_attr( $account_number ); ?>" class="dokan-form-control dokan-w7 dokan-right" placeholder="<?php esc_attr_e( 'Account number', 'dokan-lite' ); ?>" type="text" required>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php esc_html_e( 'Bank Name', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][bank_name]" value="<?php echo esc_attr( $bank_name ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Name of bank', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php esc_html_e( 'Bank Address', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <textarea name="settings[bank][bank_addr]" rows="5" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Address of your bank', 'dokan-lite' ); ?>"><?php echo esc_html( $bank_addr ); ?></textarea>
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php esc_html_e( 'Bank IBAN', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input name="settings[bank][iban]" value="<?php echo esc_attr( $iban ); ?>" class="dokan-form-control" placeholder="<?php esc_attr_e( 'IBAN', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group">
        <div>
            <label><?php esc_html_e( 'Bank Swift Code', 'dokan-lite' ); ?> </label>
        </div>

        <div class="dokan-w10">
            <input value="<?php echo esc_attr( $swift_code ); ?>" name="settings[bank][swift]" class="dokan-form-control" placeholder="<?php esc_attr_e( 'Swift code', 'dokan-lite' ); ?>" type="text">
        </div>
    </div>

    <div class="dokan-form-group dokan-text-left">
        <img alt="<?php esc_attr_e( 'bank check', 'dokan-lite' ); ?>" src="<?php echo esc_url( DOKAN_PLUGIN_ASSEST . '/images/withdraw-methods/bank-check.png' ); ?>"/>
    </div>

    <div class="dokan-form-group dokan-text-left">
        <input id="declaration" name="settings[bank][declaration]" checked type="checkbox" required/>
        <label for="declaration">
            <?php esc_html_e( 'I attest that I am the owner and have full authorization to this bank account', 'dokan-lite' ); ?>
        </label>
    </div>

    <div class="data-warning">
        <div class="left-icon-container">
            <i class="fa fa-info-circle fa-2x" aria-hidden="true"></i>
        </div>

        <div class="vr-separator"></div>

        <div class="dokan-text-left">
            <span class="display-block"><b><?php esc_html_e( 'Please double-check your account information!', 'dokan-lite' ); ?></b></span>
            <br/>
            <span class="display-block"><?php esc_html_e( 'Incorrect or mismatched account name and number can result in withdrawal delays and fees', 'dokan-lite' ); ?></span>
        </div>
    </div>

    <p class="bottom-note"><?php esc_html_e( 'This Payment method will become available in 3 days.', 'dokan-lite' ); ?></p>

    <?php if ( ! isset( $_GET['page'] ) || 'dokan-seller-setup' !== $_GET['page'] ) : ?>
    <div class="bottom-actions">
        <button class="ajax_prev dokan-btn dokan-btn-theme" type="submit" name="dokan_update_payment_settings">
            <?php echo esc_html( $save_or_add_btn_text ); ?>
        </button>
        <a href="<?php echo esc_url( dokan_get_navigation_url( 'settings/payment' ) ); ?>">
            <?php esc_html_e( 'Cancel', 'dokan-lite' ); ?>
        </a>
    </div>
    <?php endif; ?>
</div>
