<?php if ( $title ): ?>
    <h2 class="dokan-login-form-title"><?php echo esc_html( $title ); ?></h2>
<?php endif; ?>

<form class="dokan-form-container" id="<?php echo esc_attr( $id ); ?>">
    <fieldset>
        <div class="dokan-form-group">
            <label class="dokan-form-label" for="dokan-login-form-username"><?php esc_html_e( 'Username', 'dokan-lite' ) ?>:</label>
            <input required class="dokan-form-control" type="text" name='dokan_login_form_username' id='dokan-login-form-username'/>
        </div>

        <div class="dokan-form-group">
            <label class="dokan-form-label" for="dokan-login-form-password"><?php esc_html_e( 'Password', 'dokan-lite' ) ?>:</label>
            <input required class="dokan-form-control" type="password" name='dokan_login_form_password' id='dokan-login-form-password'/>
        </div>

        <div class="dokan-form-group">
            <div class="dokan-login-form-error"></div>

            <button type="submit" class="dokan-w5 dokan-btn dokan-btn-theme" id="dokan-login-form-submit-btn">
                <?php esc_html_e( 'Login', 'dokan-lite' ); ?>
            </button>

            <button type="button" class="dokan-w5 dokan-btn dokan-btn-theme dokan-hide" id="dokan-login-form-working-btn">
                <i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;<?php esc_html_e( 'Logging in', 'dokan-lite' ); ?>...
            </button>
        </div>

        <?php wp_nonce_field( esc_html( $nonce_action ), esc_html( $nonce_name ) ); ?>
    </fieldset>
</form>
<div class="dokan-clearfix"></div>
