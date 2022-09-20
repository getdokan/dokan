<?php
/**
 * Dokan Settings Payment Template
 *
 * @since   2.2.2 Insert action before payment settings form
 *
 * @package dokan
 */
$has_methods = false;

do_action( 'dokan_payment_settings_before_form', $current_user, $profile_info ); ?>

<div class="dokan-payment-settings-summary">
    <h2 id="vendor-dashboard-payment-settings-error"></h2>
    <div class="payment-methods-listing-header">
        <h2> <?php esc_html_e( 'Payment Methods', 'dokan-lite' ); ?></h2>
        <div>
            <div id="vendor-dashboard-payment-settings-toggle-dropdown">
                <a id="toggle-vendor-payment-method-drop-down"> <?php esc_html_e( 'Add Payment Method', 'dokan-lite' ); ?></a>
                <div id="vendor-payment-method-drop-down-wrapper">
                    <div id="vendor-payment-method-drop-down">
                        <?php if ( is_array( $unused_methods ) && ! empty( $unused_methods ) ) : ?>
                            <ul>
                                <?php foreach ( $unused_methods as $method_key => $method ) : ?>
                                    <li>
                                        <a href="<?php echo esc_url( dokan_get_navigation_url( 'settings/payment-manage-' . $method_key ) ); ?>">
                                            <div>
                                                <img src="<?php echo esc_url( dokan_withdraw_get_method_icon( $method_key ) ); ?>" alt="<?php echo esc_attr( $method_key ); ?>"/>
                                                <span>
                                                <?php
                                                // translators: %s: payment method title
                                                printf( esc_html__( 'Direct to %s', 'dokan-lite' ), apply_filters( 'dokan_payment_method_title', $method['title'], $method ) );
                                                ?>
                                            </span>
                                            </div>
                                        </a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php else : ?>
                            <div class="no-content">
                                <?php esc_html_e( 'There is no payment method to add.', 'dokan-lite' ); ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php if ( is_array( $methods ) && ! empty( $methods ) ) : ?>
        <ul>
            <?php foreach ( $methods as $method_key => $method ) : ?>
                <li>
                    <div>
                        <div>
                            <img src="<?php echo esc_url( dokan_withdraw_get_method_icon( $method_key ) ); ?>" alt="<?php echo esc_attr( $method_key ); ?>"/>
                            <span>
                            <?php
                            echo esc_html( apply_filters( 'dokan_payment_method_title', $method['title'], $method ) );

                            if ( isset( $profile_info['payment'][ $method_key ] ) && ! empty( dokan_withdraw_get_method_additional_info( $method_key ) ) ) {
                                ?>
                                <small><?php echo dokan_withdraw_get_method_additional_info( $method_key ); ?></small>
                                <?php
                            }
                            ?>
                        </span>
                        </div>
                        <div>
                            <a href="<?php echo esc_url( dokan_get_navigation_url( 'settings/payment-manage-' . $method_key . '-edit' ) ); ?>">
                                <button class="dokan-btn-theme dokan-btn-sm"><?php esc_html_e( 'Manage', 'dokan-lite' ); ?></button>
                            </a>
                        </div>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php else : ?>
        <div class="no-content">
            <?php esc_html_e( 'There is no payment method to show.', 'dokan-lite' ); ?>
        </div>
    <?php endif; ?>
</div>

<?php
/**
 * @since 2.2.2 Insert action after social settings form
 */
do_action( 'dokan_payment_settings_after_form', $current_user, $profile_info ); ?>
