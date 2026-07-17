<?php

namespace WeDevs\Dokan\Vendor;

use WC_Countries;
use WeDevs\Dokan\Admin\SetupWizard as DokanSetupWizard;
use WeDevs\Dokan\Vendor\Settings\WizardStoreSaver;

/**
 * Seller setup wizard class
 */
class SetupWizard extends DokanSetupWizard {
    /**
     * @var int
     */
    public $store_id;
    /**
     * @var array
     */
    public $store_info;

    /**
     * Hook in tabs.
     */
    public function __construct() {
        add_filter( 'woocommerce_registration_redirect', [ $this, 'filter_woocommerce_registration_redirect' ], 10, 1 );
        add_action( 'init', [ $this, 'setup_wizard' ], 9999 );
        add_action( 'dokan_setup_wizard_enqueue_scripts', [ $this, 'frontend_enqueue_scripts' ] );
    }

    // define the woocommerce_registration_redirect callback
    public function filter_woocommerce_registration_redirect( $url ) {

        $user = wp_get_current_user();

        if ( in_array( 'seller', $user->roles, true ) ) {
            $url = dokan_get_navigation_url();

            if ( 'off' === dokan_get_option( 'disable_welcome_wizard', 'dokan_selling', 'off' ) ) {
                $url = apply_filters( 'dokan_seller_setup_wizard_url', site_url( '?page=dokan-seller-setup' ) );
            }
        }

        return $url;
    }

    /**
     * Show the setup wizard.
     */
    public function setup_wizard() {
        if ( empty( $_GET['page'] ) || 'dokan-seller-setup' !== $_GET['page'] ) { // phpcs:ignore
            return;
        }

        if ( ! is_user_logged_in() ) {
            return;
        }

        $this->custom_logo     = null;
        $setup_wizard_logo_url = dokan_get_option( 'setup_wizard_logo_url', 'dokan_general', '' );

        if ( ! empty( $setup_wizard_logo_url ) ) {
            $this->custom_logo = $setup_wizard_logo_url;
        }

        $this->store_id   = dokan_get_current_user_id();
        $this->store_info = dokan_get_store_info( $this->store_id );

        // Setup wizard steps
        $this->set_steps();

        // If payment step is accessed but no active methods exist, redirect to next step
        if ( isset( $_GET['step'] ) && 'payment' === $_GET['step'] ) {
            $active_methods = dokan_withdraw_get_active_methods();
            if ( empty( $active_methods ) ) {
                wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
                exit;
            }
        }

        // get step from url
        if ( isset( $_GET['_admin_sw_nonce'], $_GET['step'] ) && wp_verify_nonce( sanitize_key( wp_unslash( $_GET['_admin_sw_nonce'] ) ), 'dokan_admin_setup_wizard_nonce' ) ) {
            $this->current_step = sanitize_key( wp_unslash( $_GET['step'] ) ) ?? current( array_keys( $this->steps ) );
        }

        if ( ! empty( $_POST['save_step'] ) && isset( $this->steps[ $this->current_step ]['handler'] ) ) { // WPCS: CSRF ok.
            call_user_func( $this->steps[ $this->current_step ]['handler'] );
        }

        $this->enqueue_scripts();
        ob_start();
        $this->set_setup_wizard_template();
        exit;
    }

    /**
     * Enqueue vendor setup wizard scripts
     *
     * @since 3.7.0
     *
     * @return void
     */
    public function frontend_enqueue_scripts() {
        $this->register_react_bundle();

        // Third-party steps (Pro's verifications) enqueue the registered handle with their own payload.
        switch ( $this->current_step ) {
            case 'introduction':
                $this->enqueue_react_step( $this->intro_step_payload() );
                break;
            case 'store':
                // The React map field boots from this loader — only the store step carries a map.
                dokan()->scripts->load_gmap_script();
                $this->enqueue_react_step( $this->store_step_payload() );
                break;
            case 'payment':
                $this->enqueue_react_step( $this->payment_step_payload() );
                break;
            case 'next_steps':
                $this->enqueue_react_step( $this->ready_step_payload() );
                break;
        }
    }

    /**
     * Register the wizard React bundle so any step (including Pro-owned ones)
     * can enqueue it with a payload.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function register_react_bundle(): void {
        $asset = require DOKAN_DIR . '/assets/js/vendor-setup-wizard.asset.php';

        // Must load in the head — the wizard's standalone template never calls wp_print_footer_scripts().
        wp_register_script(
            'dokan-vendor-setup-wizard',
            DOKAN_PLUGIN_ASSEST . '/js/vendor-setup-wizard.js',
            $asset['dependencies'],
            $asset['version'],
            false
        );
        wp_set_script_translations( 'dokan-vendor-setup-wizard', 'dokan-lite' );

        // The asset version hashes the JS only — stamp the style by file mtime so CSS-only edits bust caches.
        wp_register_style(
            'dokan-vendor-setup-wizard',
            DOKAN_PLUGIN_ASSEST . '/css/vendor-setup-wizard.css',
            [ 'dokan-react-components' ],
            (string) filemtime( DOKAN_DIR . '/assets/css/vendor-setup-wizard.css' )
        );
    }

    /**
     * Enqueue the React bundle with a step payload.
     *
     * The payload (schema included) is bootstrapped inline instead of fetched:
     * the page render is the only context where the wizard's `$_GET` state
     * (step gates, Pro's `dokan-seller-setup` sniffers) is faithful.
     *
     * @since DOKAN_SINCE
     *
     * @param array $payload Step payload for the React mount.
     *
     * @return void
     */
    public function enqueue_react_step( array $payload ): void {
        wp_add_inline_script(
            'dokan-vendor-setup-wizard',
            'window.dokanSetupWizard = ' . wp_json_encode( $payload ) . ';',
            'before'
        );

        wp_enqueue_script( 'dokan-vendor-setup-wizard' );
        wp_enqueue_style( 'dokan-vendor-setup-wizard' );
    }

    /**
     * URL of a specific wizard step, nonce included.
     *
     * @since DOKAN_SINCE
     *
     * @param string $step Step key.
     *
     * @return string
     */
    public function get_step_link( string $step ): string {
        return add_query_arg(
            [
                'step'            => $step,
                '_admin_sw_nonce' => wp_create_nonce( 'dokan_admin_setup_wizard_nonce' ),
            ]
        );
    }

    /**
     * Whether the given step is the last one before the Ready screen — those
     * transitions show the "Creating your Store" overlay.
     *
     * @since DOKAN_SINCE
     *
     * @param string $step Step key.
     *
     * @return bool
     */
    protected function next_step_is_ready( string $step ): bool {
        $keys     = array_keys( $this->steps );
        $position = array_search( $step, $keys, true );

        return false !== $position && 'next_steps' === ( $keys[ $position + 1 ] ?? '' );
    }

    /**
     * Intro card payload.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function intro_step_payload(): array {
        // Admin's wizard logo wins; otherwise the site icon keeps the card branded.
        $logo_url = $this->custom_logo ? $this->custom_logo : get_site_icon_url( 96 );

        return [
            'step'        => 'intro',
            'logoUrl'     => $logo_url ? esc_url_raw( $logo_url ) : '',
            'siteName'    => get_bloginfo( 'name' ),
            'message'     => wp_kses_post( dokan_get_option( 'setup_wizard_message', 'dokan_general', self::default_wizard_message() ) ),
            'nextStepUrl' => esc_url_raw( $this->get_next_step_link() ),
            'skipUrl'     => esc_url_raw( $this->dashboard_home_url() ),
        ];
    }

    /**
     * Where "go to my dashboard" actually lands — the same URL the sidebar's
     * Dashboard item resolves to (analytics overview when analytics is on,
     * plain dashboard otherwise), so the wizard exits like every other door.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected function dashboard_home_url(): string {
        $nav = function_exists( 'dokan_get_dashboard_nav' ) ? dokan_get_dashboard_nav() : [];

        return (string) ( $nav['dashboard']['url'] ?? dokan_get_navigation_url() );
    }

    /**
     * The welcome copy shown when the admin hasn't customized it.
     *
     * Kept in one place so the wizard and the admin setting that seeds it
     * (`Admin\Settings`: dokan_general.setup_wizard_message) can't drift.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public static function default_wizard_message(): string {
        return __( 'Thanks for picking us to power your shop! In just 2 minutes, this quick setup wizard will get your basic settings sorted.', 'dokan-lite' );
    }

    /**
     * Store step payload.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function store_step_payload(): array {
        return [
            'step'        => 'store',
            'schema'      => Settings\Schema\SetupWizardSchema::get_schema( $this->store_id ),
            'endpoint'    => '/dokan/v1/vendor-onboarding/store',
            'nextStepUrl' => esc_url_raw( $this->get_next_step_link() ),
            'backUrl'     => esc_url_raw( $this->get_step_link( 'introduction' ) ),
            'skipUrl'     => esc_url_raw( $this->get_next_step_link() ),
        ];
    }

    /**
     * Payment step payload.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function payment_step_payload(): array {
        return [
            'step'            => 'payment',
            'schema'          => Settings\Schema\SetupWizardSchema::get_payment_schema( $this->store_id ),
            'endpoint'        => '/dokan/v1/vendor-onboarding/payment',
            'nextStepUrl'     => esc_url_raw( $this->get_next_step_link() ),
            'backUrl'         => esc_url_raw( $this->get_step_link( 'store' ) ),
            'skipUrl'         => esc_url_raw( $this->get_next_step_link() ),
            'creatingOverlay' => $this->next_step_is_ready( 'payment' ),
        ];
    }

    /**
     * Ready card payload.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    protected function ready_step_payload(): array {
        return [
            'step'         => 'ready',
            'viewSiteUrl'  => esc_url_raw( site_url() ),
            'dashboardUrl' => esc_url_raw( $this->dashboard_home_url() ),
        ];
    }

    /**
     * Setup Wizard Header.
     */
	public function setup_wizard_header() {
		?>
    <!DOCTYPE html>
    <html <?php language_attributes(); ?>>
    <head>
        <meta name="viewport" content="width=device-width"/>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <title><?php esc_attr_e( 'Vendor &rsaquo; Setup Wizard', 'dokan-lite' ); ?></title>
        <?php wp_print_scripts(); ?>
        <?php wp_print_styles(); ?>
        <?php do_action( 'dokan_setup_wizard_styles' ); ?>
    </head>
    <body class="wc-setup wp-core-ui dokan-vendor-setup-wizard dokan-vsw-step-<?php echo esc_attr( $this->current_step ); ?><?php echo in_array( $this->current_step, [ 'introduction', 'next_steps' ], true ) ? ' dokan-vsw-center' : ' dokan-vsw-form'; ?>">
    <header class="dokan-vsw-topbar">
        <h1 id="wc-logo" class="dokan-vsw-brand">
            <a href="<?php echo esc_url( home_url() ); ?>">
                <?php if ( ! empty( $this->custom_logo ) ) : ?>
                    <img src="<?php echo esc_url( $this->custom_logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"/>
                <?php else : ?>
                    <?php $site_icon_url = get_site_icon_url( 64 ); ?>
                    <?php if ( $site_icon_url ) : ?>
                        <img class="dokan-vsw-brand-icon" src="<?php echo esc_url( $site_icon_url ); ?>" alt=""/>
                    <?php endif; ?>
                    <span><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
                <?php endif; ?>
            </a>
        </h1>
        <?php $this->render_progress_rail(); ?>
    </header>
        <?php
    }

    /**
     * The Figma topbar rail: "Step N of M" + a linear progress track.
     *
     * The intro is un-numbered (matching the legacy rail, which shifted it
     * out), so it renders no rail at all.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function render_progress_rail() {
        if ( 'introduction' === $this->current_step ) {
            return;
        }

        $numbered = array_values( array_diff( array_keys( $this->steps ), [ 'introduction' ] ) );
        $total    = count( $numbered );
        $position = array_search( $this->current_step, $numbered, true );

        if ( false === $position || $total < 1 ) {
            return;
        }

        ++$position;
        $percent = $total > 1 ? (int) round( ( ( $position - 1 ) / ( $total - 1 ) ) * 100 ) : 100;
        ?>
        <div class="dokan-vsw-rail">
            <span class="dokan-vsw-rail-label">
                <?php
                /* translators: 1: current step number 2: total step count */
                printf( esc_html__( 'Step %1$d of %2$d', 'dokan-lite' ), (int) $position, (int) $total );
                ?>
            </span>
            <span class="dokan-vsw-rail-track"><span class="dokan-vsw-rail-fill" style="width: <?php echo (int) $percent; ?>%"></span></span>
            <span class="dokan-vsw-rail-percent">
                <?php
                /* translators: %d: completion percentage */
                printf( esc_html__( '%d%% Complete', 'dokan-lite' ), (int) $percent );
                ?>
            </span>
        </div>
        <?php
    }

    /**
     * The step list renders inside the topbar rail instead of the legacy
     * `<ol class="wc-setup-steps">` pills.
     */
    public function setup_wizard_steps() {}

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
		?>
    </body>
    </html>
		<?php
	}

    /**
     * Introduction step.
     */
    public function dokan_setup_introduction() {
        echo '<div id="dokan-setup-wizard-step"></div>';
        // The 'seen' flag consumers (subscription's post-checkout redirect) hang off this action — it must fire on every intro render.
        do_action( 'dokan_seller_wizard_introduction', $this );
    }

    /**
     * Store step — React mount; the step (heading, fields, footer) renders in
     * React from the schema bootstrapped by `store_step_payload()`.
     *
     * The legacy in-form echo hooks (after_address_field, before/after_map_field,
     * setup_field) don't fire here — table-row HTML can't live inside the
     * React tree; field injectors use the `dokan_setup_wizard_schema` filter
     * instead. The after-form action still fires for side-effect consumers.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function dokan_setup_store() {
        ?>
        <div id="dokan-setup-wizard-step"></div>
        <?php
        do_action( 'dokan_seller_wizard_after_store_setup_form', $this );
    }

    /**
     * Save store options.
     */
    public function dokan_setup_store_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan-seller-setup' ) ) {
            return;
        }

        $country_obj = new WC_Countries();
        $states      = $country_obj->states;

        // The slice carries only the fields this step owns — untouched keys survive via the writer's shallow merge.
        $slice = [
            'address'      => isset( $_POST['address'] ) ? array_map( 'sanitize_text_field', wp_unslash( $_POST['address'] ) ) : [],
            'location'     => isset( $_POST['location'] ) ? sanitize_text_field( wp_unslash( $_POST['location'] ) ) : '',
            'find_address' => isset( $_POST['find_address'] ) ? sanitize_text_field( wp_unslash( $_POST['find_address'] ) ) : '',
            'show_email'   => isset( $_POST['show_email'] ) ? 'yes' : 'no',
        ];

        $country = $slice['address']['country'] ?? '';
        $state = $slice['address']['state'] ?? '';
        $country_has_states = isset( $states[ $country ] );
        $state_is_empty = empty( $state );
        // Validating filed.
        $is_valid_form = true;
        if ( empty( $slice['address']['street_1'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[street_1]'] = 'error';
        }
        if ( empty( $slice['address']['city'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[city]'] = 'error';
        }
        if ( empty( $slice['address']['zip'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[zip]'] = 'error';
        }
        if ( empty( $slice['address']['country'] ) ) {
            $is_valid_form = false;
            $_POST['error_address[country]'] = 'error';
        } elseif ( ( $country_has_states && count( $states[ $country ] ) > 0 && $state_is_empty ) ) {
            $is_valid_form = false;
            $_POST['error_address[state]'] = 'error';
        } elseif ( ! $country_has_states && $state_is_empty ) {
            $is_valid_form = false;
            $_POST['error_address[state]'] = 'error';
        }
        if ( ! $is_valid_form ) {
            return;
        }

        ( new WizardStoreSaver() )->save( $this->store_id, $slice );

        do_action( 'dokan_seller_wizard_store_field_save', $this );

        wp_safe_redirect( esc_url_raw( $this->get_next_step_link() ) );
        exit;
    }

    /**
     * Payment step.
     */
    public function dokan_setup_payment() {
        echo '<div id="dokan-setup-wizard-step"></div>';
    }


    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        echo '<div id="dokan-setup-wizard-step"></div>';
    }

    /**
     * Gets the URL for the next step in the wizard
     *
     * Handles special logic to skip the payment step if no withdrawal methods
     * are active, preventing users from accessing an empty payment step
     *
     * @since 2.9.27
     *
     * @return string The URL for the next step
     */
    public function get_next_step_link(): string {
        $keys = array_keys( $this->steps );
        $step = array_search( $this->current_step, $keys, true );
        ++$step;

        // If next step is payment but there are no active methods, skip to the following step
        if ( 'payment' === $keys[ $step ] && empty( dokan_withdraw_get_active_methods() ) ) {
            ++$step;
        }
        $next_step = $keys[ $step ] ?? '';
        return add_query_arg(
            [
                'step' => apply_filters( 'dokan_seller_wizard_next_step', $next_step, $this->current_step, $this->steps ),
                '_admin_sw_nonce' => wp_create_nonce( 'dokan_admin_setup_wizard_nonce' ),
            ]
        );
    }

    /**
     * Sets up the wizard steps
     *
     * Defines the steps for the setup wizard, conditionally including
     * the payment step only if active withdrawal methods exist
     *
     * @since 2.9.27
     *
     * @return void
     */
    protected function set_steps() {
        $steps = [
            'introduction' => [
                'name'    => __( 'Introduction', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_introduction' ],
                'handler' => '',
            ],
            'store'        => [
                'name'    => __( 'Store', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_store' ],
                'handler' => [ $this, 'dokan_setup_store_save' ],
            ],
        ];

        // Only add payment step if there are active withdrawal methods
        $active_methods = dokan_withdraw_get_active_methods();
        if ( ! empty( $active_methods ) ) {
            $steps['payment'] = [
                'name'    => __( 'Payment', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_payment' ],
                'handler' => '',
            ];
        }

        $steps['next_steps'] = [
            'name'    => __( 'Ready!', 'dokan-lite' ),
            'view'    => [ $this, 'dokan_setup_ready' ],
            'handler' => '',
        ];

        /**
         * Filter the seller wizard steps
         *
         * @since 2.9.27
         *
         * @param array $steps Array of wizard steps
         */
        $this->steps = apply_filters( 'dokan_seller_wizard_steps', $steps );
        $this->current_step  = current( array_keys( $this->steps ) );
    }
}
