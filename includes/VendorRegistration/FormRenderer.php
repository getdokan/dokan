<?php

namespace WeDevs\Dokan\VendorRegistration;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Renders the vendor registration form from a form setup.
 *
 * @since DOKAN_SINCE
 */
class FormRenderer {

    /** Hidden field carrying the ID of the page the form is on. */
    const FORM_FIELD = 'dokan_vreg_form';

    /** Hidden field carrying the form's setup, so the server checks exactly what the visitor saw. */
    const SETUP_FIELD = 'dokan_vreg_setup';

    /** Hidden field carrying the setup's signature. */
    const SIGNATURE_FIELD = 'dokan_vreg_sig';

    /** Block attributes the server needs to check a sign-up. */
    const SIGNED_ATTRIBUTES = [ 'splitSteps', 'steps', 'sections', 'termsPageId' ];

    /** Submit field and nonce of a logged-in customer becoming a vendor. */
    const CUSTOMER_SUBMIT = 'dokan_vreg_become_vendor';

    /** Nonce field of a logged-in customer becoming a vendor. */
    const CUSTOMER_NONCE = 'dokan_vreg_customer_nonce';

    /** Hooks a row can claim, so they fire at the row's position instead of Dokan's default one. */
    const ROW_HOOKS = [ 'dokan_seller_registration_after_shopurl_field', 'dokan_seller_registration_field_after' ];

    /** @var FormSetup */
    protected FormSetup $setup;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormSetup $setup Form setup reader.
     */
    public function __construct( FormSetup $setup ) {
        $this->setup = $setup;
    }

    /**
     * Encode and sign the attributes a sign-up is checked against.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     * @param int   $page_id    Page the form is on.
     *
     * @return array{payload: string, signature: string}
     */
    public function sign_setup( array $attributes, int $page_id ): array {
        $rest = function_exists( 'wp_is_serving_rest_request' ) ? wp_is_serving_rest_request() : ( defined( 'REST_REQUEST' ) && REST_REQUEST );

        $payload = base64_encode( (string) wp_json_encode( array_intersect_key( $attributes, array_flip( self::SIGNED_ATTRIBUTES ) ) ) ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- transport encoding for a signed hidden field.

        return [
            'payload'   => $payload,
            // The editor previews in React; a REST render (e.g. the block renderer) could sign any setup, so it gets no signature.
            'signature' => $rest ? '' : $this->signature( $payload, $page_id ),
        ];
    }

    /**
     * Check a posted setup's signature and decode it.
     *
     * @since DOKAN_SINCE
     *
     * @param string $payload   Posted payload.
     * @param string $signature Posted signature.
     * @param int    $page_id   Posted page ID.
     *
     * @return array|null Block attributes, or null when the signature doesn't match.
     */
    public function verify_setup( string $payload, string $signature, int $page_id ): ?array {
        if ( '' === $payload || ! hash_equals( $this->signature( $payload, $page_id ), $signature ) ) {
            return null;
        }

        $attributes = json_decode( (string) base64_decode( $payload, true ), true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- reverses sign_setup().

        return is_array( $attributes ) ? $attributes : null;
    }

    /**
     * Sign a payload for a page.
     *
     * @since DOKAN_SINCE
     *
     * @param string $payload Payload.
     * @param int    $page_id Page ID.
     *
     * @return string
     */
    protected function signature( string $payload, int $page_id ): string {
        // A key of its own, derived from the auth salt.
        $key = hash_hmac( 'sha256', 'dokan-vendor-registration-setup', wp_salt( 'auth' ) );

        return hash_hmac( 'sha256', $payload . '|' . $page_id, $key );
    }

    /**
     * Get the default visible texts.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, string>
     */
    public function get_default_texts(): array {
        return [
            'visitorHeading'  => __( 'Register as a Vendor', 'dokan-lite' ),
            'visitorButton'   => __( 'Register', 'dokan-lite' ),
            'socialHeading'   => __( 'Finish setting up your store', 'dokan-lite' ),
            // {platform} is replaced with the provider name, e.g. Google.
            'socialNote'      => __( 'Signed in with {platform}. Just a few store details left.', 'dokan-lite' ),
            'socialButton'    => __( 'Create my store', 'dokan-lite' ),
            'customerHeading' => __( 'Become a vendor', 'dokan-lite' ),
            'customerButton'  => __( 'Become a Vendor', 'dokan-lite' ),
            'nextButton'      => __( 'Next', 'dokan-lite' ),
            'backButton'      => __( 'Back', 'dokan-lite' ),
        ];
    }

    /**
     * Resolve the visible texts from the block attributes.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return array<string, string>
     */
    public function get_texts( array $attributes ): array {
        $texts = $this->get_default_texts();
        $saved = is_array( $attributes['texts'] ?? null ) ? $attributes['texts'] : [];

        foreach ( array_keys( $texts ) as $key ) {
            $value = isset( $saved[ $key ] ) && is_scalar( $saved[ $key ] ) ? trim( wp_strip_all_tags( (string) $saved[ $key ] ) ) : '';

            if ( '' !== $value ) {
                $texts[ $key ] = $value;
            }
        }

        return $texts;
    }

    /**
     * Style attributes and the CSS custom properties they set; sizes are in pixels with an upper bound.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string, array{0: string, 1: int}> Attribute => [ property, max px or 0 for a color ].
     */
    public function get_style_map(): array {
        return [
            'accentColor'      => [ '--dokan-vreg-accent', 0 ],
            'labelColor'       => [ '--dokan-vreg-label', 0 ],
            'inputTextColor'   => [ '--dokan-vreg-input-text', 0 ],
            'inputBackground'  => [ '--dokan-vreg-input-bg', 0 ],
            'inputBorderColor' => [ '--dokan-vreg-input-border', 0 ],
            'buttonBackground' => [ '--dokan-vreg-button-bg', 0 ],
            'buttonTextColor'  => [ '--dokan-vreg-button-text', 0 ],
            'inputRadius'      => [ '--dokan-vreg-input-radius', 30 ],
            'buttonRadius'     => [ '--dokan-vreg-button-radius', 40 ],
            'fieldGap'         => [ '--dokan-vreg-field-gap', 48 ],
            'loginGap'         => [ '--dokan-vreg-login-gap', 120 ],
        ];
    }

    /**
     * Build the wrapper's inline CSS custom properties from the block's style attributes.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return string
     */
    public function get_style_variables( array $attributes ): string {
        $styles = is_array( $attributes['styles'] ?? null ) ? $attributes['styles'] : [];
        $css    = [];

        foreach ( $this->get_style_map() as $key => list( $property, $max ) ) {
            if ( ! isset( $styles[ $key ] ) || ! is_scalar( $styles[ $key ] ) || '' === (string) $styles[ $key ] ) {
                continue;
            }

            if ( $max ) {
                $css[] = $property . ':' . min( $max, absint( $styles[ $key ] ) ) . 'px';
                continue;
            }

            $color = $this->sanitize_color( (string) $styles[ $key ] );

            if ( '' !== $color ) {
                $css[] = $property . ':' . $color;
            }
        }

        return implode( ';', $css );
    }

    /**
     * Get the step bar style.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return string One of bars, circles, pills, progress.
     */
    public function get_step_style( array $attributes ): string {
        $style = $attributes['styles']['stepStyle'] ?? 'bars';

        return in_array( $style, [ 'bars', 'circles', 'pills', 'progress' ], true ) ? $style : 'bars';
    }

    /**
     * Get the social buttons layout.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return string One of brand, outline, columns, icons.
     */
    public function get_social_layout( array $attributes ): string {
        $layout = $attributes['styles']['socialLayout'] ?? 'brand';

        return in_array( $layout, [ 'brand', 'outline', 'columns', 'icons' ], true ) ? $layout : 'brand';
    }

    /**
     * Accept a color a picker or theme palette produces; anything else is dropped.
     *
     * @since DOKAN_SINCE
     *
     * @param string $value Color value.
     *
     * @return string
     */
    protected function sanitize_color( string $value ): string {
        $value = trim( $value );

        $patterns = [
            '/^#[0-9a-f]{3,8}$/i',
            '/^[a-z]{3,30}$/i',
            '/^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch)\([0-9a-z.,%\s\/+-]+\)$/i',
            '/^var\(--wp--preset--color--[a-z0-9-]+\)$/i',
        ];

        foreach ( $patterns as $pattern ) {
            if ( preg_match( $pattern, $value ) ) {
                return $value;
            }
        }

        return '';
    }

    /**
     * Resolve the login box settings from the block attributes.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return array
     */
    public function get_login_settings( array $attributes ): array {
        $defaults = [
            'enabled'          => true,
            'position'         => 'right',
            'heading'          => __( 'Already selling with us?', 'dokan-lite' ),
            'linkText'         => __( 'Already have an account? Log in', 'dokan-lite' ),
            'usernameLabel'    => __( 'Username or email address', 'dokan-lite' ),
            'passwordLabel'    => __( 'Password', 'dokan-lite' ),
            'buttonText'       => __( 'Log in', 'dokan-lite' ),
            'showRemember'     => true,
            'showLostPassword' => true,
        ];
        $saved    = is_array( $attributes['login'] ?? null ) ? $attributes['login'] : [];
        $settings = $defaults;

        foreach ( $defaults as $key => $default ) {
            if ( ! array_key_exists( $key, $saved ) ) {
                continue;
            }

            if ( is_bool( $default ) ) {
                $settings[ $key ] = (bool) $saved[ $key ];
            } elseif ( is_scalar( $saved[ $key ] ) && '' !== trim( (string) $saved[ $key ] ) ) {
                $settings[ $key ] = sanitize_text_field( (string) $saved[ $key ] );
            }
        }

        if ( ! in_array( $settings['position'], [ 'left', 'right', 'link' ], true ) ) {
            $settings['position'] = 'right';
        }

        return $settings;
    }

    /**
     * Render the login box: WooCommerce's login form, returning to this page.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $settings     Login settings.
     * @param string $redirect_url Where to return after logging in.
     *
     * @return string
     */
    public function render_login( array $settings, string $redirect_url ): string {
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- refills the username after a failed login; WooCommerce verifies the nonce.
        $username = isset( $_POST['username'], $_POST['dokan_vreg_login'] ) && is_string( $_POST['username'] ) ? sanitize_user( wp_unslash( $_POST['username'] ) ) : '';

        ob_start();
        ?>
        <form method="post" class="woocommerce-form woocommerce-form-login login dokan-vreg__login-form">
            <?php do_action( 'woocommerce_login_form_start' ); ?>

            <p class="form-row form-row-wide dokan-vreg__row">
                <label for="dokan-vreg-username" class="dokan-vreg__label"><?php echo esc_html( $settings['usernameLabel'] ); ?> <span class="required" aria-hidden="true">*</span></label>
                <input type="text" class="woocommerce-Input input-text dokan-vreg__input" name="username" id="dokan-vreg-username" autocomplete="username" value="<?php echo esc_attr( $username ); ?>" required />
            </p>
            <p class="form-row form-row-wide dokan-vreg__row">
                <label for="dokan-vreg-password" class="dokan-vreg__label"><?php echo esc_html( $settings['passwordLabel'] ); ?> <span class="required" aria-hidden="true">*</span></label>
                <input class="woocommerce-Input input-text dokan-vreg__input" type="password" name="password" id="dokan-vreg-password" autocomplete="current-password" required />
            </p>

            <?php do_action( 'woocommerce_login_form' ); ?>

            <?php if ( $settings['showRemember'] ) : ?>
                <p class="form-row dokan-vreg__row">
                    <label class="woocommerce-form__label woocommerce-form__label-for-checkbox dokan-vreg__label--inline">
                        <input class="woocommerce-form__input woocommerce-form__input-checkbox" name="rememberme" type="checkbox" value="forever" />
                        <span><?php esc_html_e( 'Remember me', 'dokan-lite' ); ?></span>
                    </label>
                </p>
            <?php endif; ?>

            <p class="form-row dokan-vreg__actions dokan-vreg__actions--login">
                <?php wp_nonce_field( 'woocommerce-login', 'woocommerce-login-nonce' ); ?>
                <input type="hidden" name="redirect" value="<?php echo esc_url( $redirect_url ); ?>" />
                <input type="hidden" name="dokan_vreg_login" value="1" />
                <button type="submit" class="woocommerce-button button woocommerce-form-login__submit wp-element-button dokan-vreg__login-submit" name="login" value="<?php echo esc_attr( $settings['buttonText'] ); ?>"><?php echo esc_html( $settings['buttonText'] ); ?></button>
            </p>

            <?php if ( $settings['showLostPassword'] ) : ?>
                <p class="dokan-vreg__lost-password"><a href="<?php echo esc_url( wp_lostpassword_url() ); ?>"><?php esc_html_e( 'Lost your password?', 'dokan-lite' ); ?></a></p>
            <?php endif; ?>

            <?php do_action( 'woocommerce_login_form_end' ); ?>
        </form>
        <?php

        return (string) ob_get_clean();
    }

    /**
     * Render the form for a block.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     * @param int   $page_id    ID of the page the form belongs to.
     * @param array $context    Render context: `view` (visitor, social or customer).
     *
     * @return string
     */
    public function render_form( array $attributes, int $page_id, array $context = [] ): string {
        $context = wp_parse_args( $context, [ 'view' => 'visitor' ] );
        $setup   = $this->setup->build( $attributes );
        $texts   = $this->get_texts( $attributes );
        $values  = $this->get_submitted_values();
        $steps   = $this->get_render_steps( $setup, $context );
        $claimed = $this->get_claimed_hooks( $setup, $context );
        $button  = 'customer' === $context['view'] ? $texts['customerButton'] : ( 'social' === $context['view'] ? $texts['socialButton'] : $texts['visitorButton'] );

        ob_start();
        ?>
        <form method="post" class="register dokan-vendor-register dokan-address-fields dokan-vreg__form" data-steps="<?php echo esc_attr( count( $steps ) ); ?>"<?php echo empty( $context['preview'] ) ? '' : ' data-preview="1"'; ?> novalidate>
            <?php
            /** This action is documented in templates/account/vendor-registration.php */
            do_action( 'dokan_vendor_reg_form_start' );
            ?>

            <?php if ( count( $steps ) > 1 ) : ?>
                <?php $this->render_step_bar( $steps ); ?>
            <?php endif; ?>

            <?php foreach ( array_values( $steps ) as $index => $step ) : ?>
                <?php $is_last = count( $steps ) - 1 === $index; ?>
                <div class="dokan-vreg__step<?php echo 0 === $index ? ' is-active' : ''; ?>" data-step="<?php echo esc_attr( $index + 1 ); ?>"<?php echo 0 === $index || count( $steps ) < 2 ? '' : ' hidden'; ?>>
                    <?php if ( count( $steps ) > 1 ) : ?>
                        <p class="dokan-vreg__step-note" tabindex="-1">
                            <?php
                            /* translators: 1: current step number, 2: number of steps, 3: step title */
                            echo esc_html( sprintf( __( 'Step %1$d of %2$d: %3$s', 'dokan-lite' ), $index + 1, count( $steps ), $step['title'] ) );
                            ?>
                        </p>
                    <?php endif; ?>

                    <?php foreach ( $step['sections'] as $section_index => $section ) : ?>
                        <?php $this->render_section( $section, $values, $context, $claimed, count( $steps ) > 1 && 0 === $section_index ); ?>
                    <?php endforeach; ?>

                    <?php if ( $is_last ) : ?>
                        <?php $this->render_form_end( $claimed, $context ); ?>
                    <?php endif; ?>

                    <div class="dokan-vreg__actions">
                        <?php if ( $index > 0 ) : ?>
                            <button type="button" class="dokan-vreg__back wp-element-button"><?php echo esc_html( $texts['backButton'] ); ?></button>
                        <?php endif; ?>

                        <?php if ( $is_last ) : ?>
                            <?php
                            // Customers, and new users back from social login, already have an account, so their form goes to Dokan's handler instead of WooCommerce's.
                            if ( in_array( $context['view'], [ 'customer', 'social' ], true ) ) {
                                wp_nonce_field( self::CUSTOMER_SUBMIT, self::CUSTOMER_NONCE );
                                $submit_name = self::CUSTOMER_SUBMIT;
                            } else {
                                wp_nonce_field( 'woocommerce-register', 'woocommerce-register-nonce' );
                                $submit_name = 'register';
                            }
                            ?>
                            <button type="submit" class="woocommerce-Button woocommerce-button button wp-element-button dokan-vreg__submit" name="<?php echo esc_attr( $submit_name ); ?>" value="<?php echo esc_attr( $button ); ?>"<?php disabled( ! empty( $context['preview'] ) ); ?>><?php echo esc_html( $button ); ?></button>
                        <?php else : ?>
                            <button type="button" class="dokan-vreg__next wp-element-button"><?php echo esc_html( $texts['nextButton'] ); ?></button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>

            <input type="hidden" name="role" value="seller" />
            <?php $signed = $this->sign_setup( $attributes, $page_id ); ?>
            <input type="hidden" name="<?php echo esc_attr( self::FORM_FIELD ); ?>" value="<?php echo esc_attr( $page_id ); ?>" />
            <input type="hidden" name="<?php echo esc_attr( self::SETUP_FIELD ); ?>" value="<?php echo esc_attr( $signed['payload'] ); ?>" />
            <input type="hidden" name="<?php echo esc_attr( self::SIGNATURE_FIELD ); ?>" value="<?php echo esc_attr( $signed['signature'] ); ?>" />
            <input type="hidden" id="dokan_selected_country" value="<?php echo esc_attr( $values['dokan_address']['country'] ?? '' ); ?>" />
            <input type="hidden" id="dokan_selected_state" value="<?php echo esc_attr( $values['dokan_address']['state'] ?? '' ); ?>" />

            <div class="dokan-vreg__trap" aria-hidden="true">
                <label for="trap"><?php esc_html_e( 'Anti-spam', 'dokan-lite' ); ?></label>
                <input type="text" name="email_2" id="trap" tabindex="-1" autocomplete="off" />
            </div>

            <?php
            /** This action is documented in templates/account/vendor-registration.php */
            do_action( 'dokan_vendor_reg_form_end' );
            ?>
        </form>
        <?php
        $content = (string) ob_get_clean();

        // Same filter the shortcode form passes through, so the vendor-form marker and add-ons still apply.
        return (string) apply_filters( 'dokan_vendor_reg_form', $content );
    }

    /**
     * Render only the fields, as one flat list: for forms that draw their own wrapper, like My Account.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     * @param array $context    Render context.
     *
     * @return string
     */
    public function render_fields( array $attributes, array $context ): string {
        $setup = $this->setup->build( $attributes );

        // One flat list: steps don't apply here.
        $setup['split_steps'] = false;

        $values  = $this->get_submitted_values();
        $claimed = $this->get_claimed_hooks( $setup, $context );

        ob_start();

        foreach ( $this->get_render_steps( $setup, $context ) as $step ) {
            foreach ( $step['sections'] as $section ) {
                $this->render_section( $section, $values, $context, $claimed, false );
            }
        }

        if ( ! in_array( 'dokan_seller_registration_field_after', $claimed, true ) ) {
            /** This action is documented in templates/account/vendor-registration.php */
            do_action( 'dokan_seller_registration_field_after' );
        }
        ?>
        <input type="hidden" id="dokan_selected_country" value="<?php echo esc_attr( $values['dokan_address']['country'] ?? '' ); ?>" />
        <input type="hidden" id="dokan_selected_state" value="<?php echo esc_attr( $values['dokan_address']['state'] ?? '' ); ?>" />
        <?php

        return (string) ob_get_clean();
    }

    /**
     * Group the visible sections into the steps to render; one step when steps are off.
     *
     * @since DOKAN_SINCE
     *
     * @param array $setup   Form setup.
     * @param array $context Render context.
     *
     * @return array[] Each step has `id`, `title` and `sections`; empty steps are skipped.
     */
    public function get_render_steps( array $setup, array $context = [] ): array {
        $sections = array_values(
            array_filter(
                array_map(
                    function ( $section ) use ( $context ) {
                        $section['rows'] = array_values(
                            array_filter(
                                $section['rows'],
                                function ( $row ) use ( $context ) {
                                    return $this->is_row_visible( $row, $context );
                                }
                            )
                        );

                        return $section;
                    },
                    $setup['sections']
                ),
                function ( $section ) {
                    return ! $section['hidden'] && ! empty( $section['rows'] );
                }
            )
        );

        if ( empty( $setup['split_steps'] ) || empty( $setup['steps'] ) ) {
            return [
                [
                    'id'       => 'all',
                    'title'    => '',
                    'sections' => $sections,
                ],
            ];
        }

        $steps = [];

        foreach ( $setup['steps'] as $step ) {
            $step['sections'] = array_values(
                array_filter(
                    $sections,
                    function ( $section ) use ( $step ) {
                        return $section['step'] === $step['id'];
                    }
                )
            );

            // Empty steps are skipped on the live site.
            if ( $step['sections'] ) {
                $steps[] = $step;
            }
        }

        return $steps ? $steps : [
            [
                'id'       => 'all',
                'title'    => '',
                'sections' => $sections,
            ],
        ];
    }

    /**
     * Whether a row shows for the current view and WooCommerce settings.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row     Setup row.
     * @param array $context Render context.
     *
     * @return bool
     */
    public function is_row_visible( array $row, array $context = [] ): bool {
        $view = $context['view'] ?? 'visitor';

        if ( ! empty( $row['hidden'] ) ) {
            return false;
        }

        // Logged-in customers and social sign-ups never see account credentials; customers keep their email.
        if ( 'visitor' !== $view && in_array( $row['id'], [ 'username', 'password' ], true ) ) {
            return false;
        }

        // Customers already have an email; on My Account WooCommerce draws its own.
        if ( in_array( $view, [ 'customer', 'myaccount' ], true ) && 'email' === $row['id'] ) {
            return false;
        }

        // No Terms & Conditions page chosen: the checkbox is hidden, as in Dokan's own form.
        if ( 'terms' === $row['id'] && '' === ( $context['terms_url'] ?? '' ) ) {
            return false;
        }

        if ( 'username' === $row['id'] ) {
            return 'no' === get_option( 'woocommerce_registration_generate_username', 'yes' );
        }

        if ( 'password' === $row['id'] ) {
            return 'yes' !== get_option( 'woocommerce_registration_generate_password', 'yes' );
        }

        return true;
    }

    /**
     * Get the values to fill the form with: the submitted ones after a failed sign-up, otherwise none.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_submitted_values(): array {
        // phpcs:disable WordPress.Security.NonceVerification.Missing -- read only to refill the form; WooCommerce verifies the nonce before processing.
        $nonce          = isset( $_POST['woocommerce-register-nonce'] ) ? sanitize_key( wp_unslash( $_POST['woocommerce-register-nonce'] ) ) : '';
        $customer_nonce = isset( $_POST[ self::CUSTOMER_NONCE ] ) ? sanitize_key( wp_unslash( $_POST[ self::CUSTOMER_NONCE ] ) ) : '';
        $verified       = ( $nonce && wp_verify_nonce( $nonce, 'woocommerce-register' ) ) || ( $customer_nonce && wp_verify_nonce( $customer_nonce, self::CUSTOMER_SUBMIT ) );

        if ( ! $verified ) {
            return [];
        }

        $values = [];

        foreach ( [ 'fname', 'lname', 'username', 'shopname', 'shopurl', 'phone' ] as $field ) {
            $values[ $field ] = isset( $_POST[ $field ] ) ? sanitize_text_field( wp_unslash( $_POST[ $field ] ) ) : '';
        }

        $values['email']         = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
        $values['dokan_address'] = isset( $_POST['dokan_address'] ) && is_array( $_POST['dokan_address'] ) ? wc_clean( wp_unslash( $_POST['dokan_address'] ) ) : [];
        $values['dokan_vreg']    = isset( $_POST['dokan_vreg'] ) && is_array( $_POST['dokan_vreg'] ) ? wc_clean( wp_unslash( $_POST['dokan_vreg'] ) ) : [];
        $values['tc_agree']      = ! empty( $_POST['tc_agree'] );
        // phpcs:enable WordPress.Security.NonceVerification.Missing

        return $values;
    }

    /**
     * Resolve the Terms & Conditions page URL: the block's own page, else Dokan's setting.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return string Empty when no page is chosen.
     */
    public function get_terms_url( array $attributes ): string {
        if ( array_key_exists( 'termsPageId', $attributes ) ) {
            $page_id = absint( $attributes['termsPageId'] );

            return $page_id && 'publish' === get_post_status( $page_id ) ? (string) get_permalink( $page_id ) : '';
        }

        // A block that never chose a page follows Dokan's own Terms and Condition settings.
        $page_id = absint( dokan_get_option( 'reg_tc_page', 'dokan_pages', 0 ) );

        if ( 'on' !== dokan_get_option( 'enable_tc_on_reg', 'dokan_general', 'off' ) || ! $page_id || 'publish' !== get_post_status( $page_id ) ) {
            return '';
        }

        return (string) dokan_get_terms_condition_url();
    }

    /**
     * Hooks that visible rows claim, so they don't also fire at their default position.
     *
     * @since DOKAN_SINCE
     *
     * @param array $setup   Form setup.
     * @param array $context Render context.
     *
     * @return string[]
     */
    protected function get_claimed_hooks( array $setup, array $context ): array {
        $claimed = [];

        foreach ( $this->get_render_steps( $setup, $context ) as $step ) {
            foreach ( $step['sections'] as $section ) {
                foreach ( $section['rows'] as $row ) {
                    if ( ! empty( $row['hook'] ) && in_array( $row['hook'], self::ROW_HOOKS, true ) ) {
                        $claimed[] = $row['hook'];
                    }
                }
            }
        }

        return $claimed;
    }

    /**
     * Render the step bar.
     *
     * @since DOKAN_SINCE
     *
     * @param array[] $steps Steps to render.
     *
     * @return void
     */
    protected function render_step_bar( array $steps ): void {
        ?>
        <ol class="dokan-vreg__step-bar">
            <?php foreach ( array_values( $steps ) as $index => $step ) : ?>
                <li class="dokan-vreg__step-item<?php echo 0 === $index ? ' is-active' : ''; ?>" data-step="<?php echo esc_attr( $index + 1 ); ?>"<?php echo 0 === $index ? ' aria-current="step"' : ''; ?>>
                    <span class="dokan-vreg__step-number"><?php echo esc_html( $index + 1 ); ?></span>
                    <span class="dokan-vreg__step-title"><?php echo esc_html( $step['title'] ); ?></span>
                </li>
            <?php endforeach; ?>
        </ol>
        <?php
    }

    /**
     * Render one section and its rows.
     *
     * @since DOKAN_SINCE
     *
     * @param array $section    Section with visible rows.
     * @param array $values     Submitted values.
     * @param array $context    Render context.
     * @param array $claimed    Hooks rows claim.
     * @param bool  $hide_title Whether the step title already names this section.
     *
     * @return void
     */
    protected function render_section( array $section, array $values, array $context, array $claimed, bool $hide_title ): void {
        ?>
        <div class="dokan-vreg__section" data-section="<?php echo esc_attr( $section['id'] ); ?>">
            <?php if ( ! $hide_title && '' !== $section['title'] && ! in_array( $section['id'], [ 'account', 'store' ], true ) ) : ?>
                <h3 class="dokan-vreg__section-title"><?php echo esc_html( $section['title'] ); ?></h3>
            <?php endif; ?>

            <?php
            foreach ( $section['rows'] as $row ) {
                $this->render_row( $row, $values, $context );

                // Germanized and other listeners print after the shop URL unless a row placed them elsewhere.
                if ( 'shop_url' === $row['id'] && ! in_array( 'dokan_seller_registration_after_shopurl_field', $claimed, true ) ) {
                    /** This action is documented in templates/account/vendor-registration.php */
                    do_action( 'dokan_seller_registration_after_shopurl_field', [] );
                }
            }
            ?>
        </div>
        <?php
    }

    /**
     * Render the hooks Dokan fires at the end of its form: captcha and unclaimed add-on fields.
     *
     * @since DOKAN_SINCE
     *
     * @param array $claimed Hooks rows claim.
     * @param array $context Render context.
     *
     * @return void
     */
    protected function render_form_end( array $claimed, array $context ): void {
        // Logged-in users aren't registering an account, so they get no captcha.
        if ( 'visitor' === ( $context['view'] ?? 'visitor' ) ) {
            /** This action is documented in wp-login.php; Dokan's captcha renders here. */
            do_action( 'register_form' );
        }

        if ( ! in_array( 'dokan_seller_registration_field_after', $claimed, true ) ) {
            /** This action is documented in templates/account/vendor-registration.php */
            do_action( 'dokan_seller_registration_field_after' );
        }
    }

    /**
     * Render one row.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row     Setup row.
     * @param array $values  Submitted values.
     * @param array $context Render context.
     *
     * @return void
     */
    protected function render_row( array $row, array $values, array $context ): void {
        if ( ! empty( $row['custom'] ) ) {
            $this->render_custom_row( $row, $values );

            return;
        }

        if ( ! empty( $row['hook'] ) && in_array( $row['hook'], self::ROW_HOOKS, true ) ) {
            echo '<div class="dokan-vreg__row dokan-vreg__row--hook" data-row="' . esc_attr( $row['id'] ) . '">';

            /**
             * Fires before a row that prints through one of Dokan's hooks renders, e.g. to apply the row's per-form labels.
             *
             * @since DOKAN_SINCE
             *
             * @param array $row     Setup row, with its `labels` overrides.
             * @param array $context Render context.
             */
            do_action( 'dokan_vendor_registration_row_start', $row, $context );
            do_action( $row['hook'], [] ); // phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores -- one of ROW_HOOKS.

            /**
             * Fires after a row that prints through one of Dokan's hooks rendered.
             *
             * @since DOKAN_SINCE
             *
             * @param array $row     Setup row.
             * @param array $context Render context.
             */
            do_action( 'dokan_vendor_registration_row_end', $row, $context );
            echo '</div>';

            return;
        }

        if ( is_callable( $row['render_callback'] ?? null ) ) {
            echo '<div class="dokan-vreg__row" data-row="' . esc_attr( $row['id'] ) . '">';
            call_user_func( $row['render_callback'], $row, $values, $context );
            echo '</div>';

            return;
        }

        switch ( $row['id'] ) {
            case 'first_name':
                $this->render_input( $row, 'first-name', $values['fname'] ?? ( $context['prefill']['fname'] ?? '' ) );
                break;

            case 'last_name':
                $this->render_input( $row, 'last-name', $values['lname'] ?? ( $context['prefill']['lname'] ?? '' ) );
                break;

            case 'username':
                $this->render_input( $row, 'reg_username', $values['username'] ?? '' );
                break;

            case 'email':
                $note = 'yes' === get_option( 'woocommerce_registration_generate_password', 'yes' ) && 'visitor' === ( $context['view'] ?? 'visitor' )
                    ? __( 'We\'ll email you a link to set your password.', 'dokan-lite' )
                    : '';
                // Back from social login the account already exists, so its email is shown but can't change here.
                if ( 'social' === ( $context['view'] ?? 'visitor' ) ) {
                    $this->render_input(
                        $row,
                        'reg_email',
                        (string) ( $context['prefill']['email'] ?? '' ),
                        [
                            'type'     => 'email',
                            'readonly' => 'readonly',
                        ]
                    );
                    break;
                }

                $this->render_input( $row, 'reg_email', $values['email'] ?? ( $context['prefill']['email'] ?? '' ), [ 'type' => 'email' ], $note );
                break;

            case 'password':
                $this->render_input(
                    $row,
                    'reg_password',
                    '',
                    [
                        'type'         => 'password',
                        'minlength'    => 6,
                        'autocomplete' => 'new-password',
                    ]
                );
                break;

            case 'shop_name':
                $this->render_input( $row, 'company-name', $values['shopname'] ?? '' );
                break;

            case 'shop_url':
                $this->render_shop_url( $row, $values['shopurl'] ?? '' );
                break;

            case 'phone':
                $this->render_input( $row, 'shop-phone', $values['phone'] ?? '', [ 'type' => 'tel' ] );
                break;

            case 'street_1':
            case 'street_2':
            case 'city':
            case 'zip':
                $this->render_input( $row, 'dokan_address[' . $row['id'] . ']', $values['dokan_address'][ $row['id'] ] ?? '' );
                break;

            case 'country':
                $this->render_country( $row, $values['dokan_address']['country'] ?? '' );
                break;

            case 'state':
                $this->render_state( $row, $values['dokan_address']['country'] ?? '', $values['dokan_address']['state'] ?? '' );
                break;

            case 'terms':
                $this->render_terms( $row, $context['terms_url'] ?? '', ! empty( $values['tc_agree'] ) );
                break;
        }
    }

    /**
     * Render a label, with the required marker.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row      Setup row.
     * @param string $input_id Input ID.
     *
     * @return void
     */
    protected function render_label( array $row, string $input_id ): void {
        ?>
        <label for="<?php echo esc_attr( $input_id ); ?>" class="dokan-vreg__label">
            <?php echo esc_html( $row['label'] ); ?>
            <?php if ( $row['required'] ) : ?>
                <span class="required" aria-hidden="true">*</span>
            <?php endif; ?>
        </label>
        <?php
    }

    /**
     * Render a help line under a field.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row  Setup row.
     * @param string $note Extra note shown before the help text.
     *
     * @return void
     */
    protected function render_help( array $row, string $note = '' ): void {
        foreach ( array_filter( [ $note, $row['help'] ?? '' ] ) as $text ) {
            echo '<small class="dokan-vreg__help">' . esc_html( $text ) . '</small>';
        }
    }

    /**
     * Render a text-like built-in input with Dokan's ID and name.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row   Setup row.
     * @param string $id    Input ID Dokan's scripts expect.
     * @param string $value Value to fill in.
     * @param array  $attrs Extra input attributes.
     * @param string $note  Note shown under the input.
     *
     * @return void
     */
    protected function render_input( array $row, string $id, string $value, array $attrs = [], string $note = '' ): void {
        $attrs = array_merge(
            [
                'type'        => 'text',
                'class'       => 'input-text form-control dokan-vreg__input',
                'name'        => $row['input_name'],
                'id'          => $id,
                'value'       => $value,
                'placeholder' => $row['placeholder'] ?? '',
            ],
            $attrs
        );
        ?>
        <p class="form-row form-group form-row-wide dokan-vreg__row" data-row="<?php echo esc_attr( $row['id'] ); ?>">
            <?php $this->render_label( $row, $id ); ?>
            <input <?php echo $this->attributes( $attrs ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped in attributes(). ?><?php echo $row['required'] ? ' required' : ''; ?> />
            <?php $this->render_help( $row, $note ); ?>
        </p>
        <?php
    }

    /**
     * Render the shop URL field with Dokan's availability check markup.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row   Setup row.
     * @param string $value Value to fill in.
     *
     * @return void
     */
    protected function render_shop_url( array $row, string $value ): void {
        $store_base = home_url( '/' . dokan_get_option( 'custom_store_url', 'dokan_general', 'store' ) . '/' );
        ?>
        <p class="form-row form-group form-row-wide dokan-vreg__row" data-row="shop_url">
            <?php $this->render_label( $row, 'seller-url' ); ?>
            <strong id="url-alart-mgs" class="dokan-vreg__url-status"></strong>
            <input type="text" class="input-text form-control dokan-vreg__input" name="shopurl" id="seller-url" value="<?php echo esc_attr( $value ); ?>" placeholder="<?php echo esc_attr( $row['placeholder'] ?? '' ); ?>" required />
            <small class="dokan-vreg__help dokan-vreg__url-preview"><?php echo esc_html( $store_base ); ?><strong id="url-alart"><?php echo esc_html( $value ); ?></strong></small>
            <?php $this->render_help( $row ); ?>
        </p>
        <?php
    }

    /**
     * Render the country select.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row     Setup row.
     * @param string $country Selected country code.
     *
     * @return void
     */
    protected function render_country( array $row, string $country ): void {
        $countries = WC()->countries->get_allowed_countries();
        ?>
        <p class="form-row form-group form-row-wide dokan-vreg__row" data-row="country">
            <?php $this->render_label( $row, 'dokan_address_country' ); ?>
            <select name="dokan_address[country]" class="country_to_state dokan-form-control dokan-vreg__input" id="dokan_address_country"<?php echo $row['required'] ? ' required' : ''; ?>>
                <?php dokan_country_dropdown( $countries, $country, false ); ?>
            </select>
            <?php $this->render_help( $row ); ?>
        </p>
        <?php
    }

    /**
     * Render the state field: a select when the country has states, otherwise a text input.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row     Setup row.
     * @param string $country Selected country code.
     * @param string $state   Selected state.
     *
     * @return void
     */
    protected function render_state( array $row, string $country, string $state ): void {
        $states   = WC()->countries->get_states();
        $has_list = isset( $states[ $country ] ) && ! empty( $states[ $country ] );
        $no_state = isset( $states[ $country ] ) && empty( $states[ $country ] );
        ?>
        <div id="dokan-states-box" class="form-row form-group form-row-wide dokan-vreg__row" data-row="state" data-required="<?php echo $row['required'] ? '1' : '0'; ?>"<?php echo $no_state ? ' style="display:none"' : ''; ?>>
            <?php $this->render_label( $row, 'dokan_address_state' ); ?>
            <?php if ( $has_list ) : ?>
                <select name="dokan_address[state]" class="dokan-form-control dokan-vreg__input" id="dokan_address_state"<?php echo $row['required'] ? ' required' : ''; ?>>
                    <?php dokan_state_dropdown( $states[ $country ], $state ); ?>
                </select>
            <?php else : ?>
                <input type="text" name="dokan_address[state]" class="dokan-form-control dokan-vreg__input" id="dokan_address_state" value="<?php echo esc_attr( $state ); ?>"<?php echo $row['required'] && ! $no_state ? ' required' : ''; ?> />
            <?php endif; ?>
            <?php $this->render_help( $row ); ?>
        </div>
        <?php
    }

    /**
     * Render the Terms & Conditions checkbox; nothing when no page is chosen.
     *
     * @since DOKAN_SINCE
     *
     * @param array  $row       Setup row.
     * @param string $terms_url Terms page URL.
     * @param bool   $checked   Whether it was ticked.
     *
     * @return void
     */
    protected function render_terms( array $row, string $terms_url, bool $checked ): void {
        if ( '' === $terms_url ) {
            return;
        }

        $label = esc_html( $row['label'] );

        // Link the words "Terms & Conditions" when the label still contains them.
        $linked = preg_replace(
            '/(Terms\s*(?:&amp;|&|and)\s*Conditions)/i',
            '<a target="_blank" rel="noopener" href="' . esc_url( $terms_url ) . '">$1</a>',
            $label,
            1,
            $count
        );

        if ( ! $count ) {
            $linked = $label . ' <a target="_blank" rel="noopener" href="' . esc_url( $terms_url ) . '">' . esc_html__( 'Read them', 'dokan-lite' ) . '</a>';
        }
        ?>
        <p class="form-row form-group form-row-wide dokan-vreg__row dokan-vreg__row--checkbox" data-row="terms">
            <?php // Dokan's script locks the submit button until .tc_check_box is ticked, so an optional box doesn't use it. ?>
            <input class="<?php echo $row['required'] ? 'tc_check_box' : 'dokan-vreg__terms'; ?>" type="checkbox" id="tc_agree" name="tc_agree" value="1"<?php checked( $checked ); ?><?php echo $row['required'] ? ' required' : ''; ?> />
            <label for="tc_agree" class="dokan-vreg__label dokan-vreg__label--inline">
                <?php
                echo wp_kses(
                    $linked, [
						'a' => [
							'href' => [],
							'target' => [],
							'rel' => [],
						],
					]
                );
				?>
                <?php if ( $row['required'] ) : ?>
                    <span class="required" aria-hidden="true">*</span>
                <?php endif; ?>
            </label>
        </p>
        <?php
    }

    /**
     * Render a custom field.
     *
     * @since DOKAN_SINCE
     *
     * @param array $row    Setup row.
     * @param array $values Submitted values.
     *
     * @return void
     */
    protected function render_custom_row( array $row, array $values ): void {
        $value = $values['dokan_vreg'][ $row['meta_key'] ] ?? '';
        $id    = 'dokan-vreg-' . $row['meta_key'];
        $name  = $row['input_name'];
        $req   = $row['required'] ? ' required' : '';

        echo '<div class="form-row form-group form-row-wide dokan-vreg__row dokan-vreg__row--' . esc_attr( $row['type'] ) . '" data-row="' . esc_attr( $row['id'] ) . '">';

        switch ( $row['type'] ) {
            case 'textarea':
                $this->render_label( $row, $id );
                echo '<textarea class="input-text form-control dokan-vreg__input" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" placeholder="' . esc_attr( $row['placeholder'] ) . '" rows="4"' . $req . '>' . esc_textarea( is_scalar( $value ) ? (string) $value : '' ) . '</textarea>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $req is a fixed string.
                break;

            case 'select':
            case 'multiselect':
                $multiple = 'multiselect' === $row['type'];
                $selected = array_map( 'strval', (array) $value );
                $this->render_label( $row, $id );
                echo '<select class="dokan-form-control dokan-vreg__input" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name . ( $multiple ? '[]' : '' ) ) . '"' . ( $multiple ? ' multiple' : '' ) . $req . '>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $req is a fixed string.
                if ( ! $multiple ) {
                    echo '<option value="">' . esc_html( '' !== $row['placeholder'] ? $row['placeholder'] : __( 'Select…', 'dokan-lite' ) ) . '</option>';
                }
                foreach ( $row['options'] as $option ) {
                    echo '<option value="' . esc_attr( $option['value'] ) . '"' . selected( in_array( (string) $option['value'], $selected, true ), true, false ) . '>' . esc_html( $option['label'] ) . '</option>';
                }
                echo '</select>';
                break;

            case 'radio':
                echo '<fieldset class="dokan-vreg__choices"><legend class="dokan-vreg__label">' . esc_html( $row['label'] ) . ( $row['required'] ? ' <span class="required" aria-hidden="true">*</span>' : '' ) . '</legend>';
                foreach ( $row['options'] as $index => $option ) {
                    $option_id = $id . '-' . $index;
                    echo '<label class="dokan-vreg__choice" for="' . esc_attr( $option_id ) . '"><input type="radio" id="' . esc_attr( $option_id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( $option['value'] ) . '"' . checked( (string) $value, (string) $option['value'], false ) . ( 0 === $index ? $req : '' ) . ' /> ' . esc_html( $option['label'] ) . '</label>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $req is a fixed string.
                }
                echo '</fieldset>';
                break;

            case 'checkbox':
                echo '<input type="hidden" name="' . esc_attr( $name ) . '" value="" />';
                echo '<input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="yes"' . checked( 'yes', $value, false ) . $req . ' /> '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $req is a fixed string.
                echo '<label for="' . esc_attr( $id ) . '" class="dokan-vreg__label dokan-vreg__label--inline">' . esc_html( $row['label'] ) . ( $row['required'] ? ' <span class="required" aria-hidden="true">*</span>' : '' ) . '</label>';
                break;

            default:
                $types = [
                    'number' => 'number',
                    'email'  => 'email',
                    'phone'  => 'tel',
                    'url'    => 'url',
                    'date'   => 'date',
                ];
                $this->render_label( $row, $id );
                echo '<input type="' . esc_attr( $types[ $row['type'] ] ?? 'text' ) . '" class="input-text form-control dokan-vreg__input" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( is_scalar( $value ) ? (string) $value : '' ) . '" placeholder="' . esc_attr( $row['placeholder'] ) . '"' . $req . ' />'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $req is a fixed string.
                break;
        }

        $this->render_help( $row );
        echo '</div>';
    }

    /**
     * Build an escaped HTML attribute string.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attrs Attribute name => value; empty values are skipped.
     *
     * @return string
     */
    protected function attributes( array $attrs ): string {
        $html = [];

        foreach ( $attrs as $name => $value ) {
            if ( '' === $value || null === $value ) {
                continue;
            }

            $html[] = esc_attr( $name ) . '="' . esc_attr( (string) $value ) . '"';
        }

        return implode( ' ', $html );
    }
}
