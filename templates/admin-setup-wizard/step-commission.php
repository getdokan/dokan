<?php
/**
 * @var array $args
 * @var object $setup_wizard
 */
?>
<h1><?php esc_html_e( 'Commission Setup', 'dokan-lite' ); ?></h1>
<form method="post" id="dokan-setup-wizard-commission-form">
    <div id="dokan-setup-wizard-commission-data" data-commission="<?php echo esc_attr( wp_json_encode( $args ) ); ?>"></div>
    <div id="dokan-setup-wizard-commission-wrapper"></div>
    <p class="wc-setup-actions step">
        <input type="submit" class="button-primary button button-large button-next" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step" />
        <a href="<?php echo esc_url( $setup_wizard->get_next_step_link() ); ?>" class="button button-large button-next"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
        <?php wp_nonce_field( 'dokan-setup' ); ?>
    </p>
</form>
