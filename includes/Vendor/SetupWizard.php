<?php

namespace WeDevs\Dokan\Vendor;

use WC_Countries;
use WeDevs\Dokan\Admin\Dashboard\LegacySwitcher;
use WeDevs\Dokan\Admin\SetupWizard as DokanSetupWizard;
use WeDevs\Dokan\Assets;
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
     * Resolved once per request so the chrome, the asset gate and every step
     * agree on which wizard is rendering.
     *
     * @since DOKAN_SINCE
     *
     * @var bool|null
     */
    protected ?bool $use_react = null;

    /**
     * True while {@see self::bootstrap_all_steps()} re-fires the enqueue action
     * per step, so this class contributes a payload instead of recursing.
     *
     * @since DOKAN_SINCE
     *
     * @var bool
     */
    protected bool $bootstrapping_steps = false;

    /**
     * Markup other plugins echoed while assets were being enqueued.
     *
     * The enqueue action runs before the document opens, so anything printed
     * from it would precede the doctype and drop the page into quirks mode —
     * and the SPA fires that action once per step, so an identical blob (Pro's
     * media templates) arrives several times. Held here, replayed once, inside
     * the body.
     *
     * @since DOKAN_SINCE
     *
     * @var string[]
     */
    protected array $deferred_output = [];

    /**
     * Memoized step order — the rail and the SPA must count the same steps.
     *
     * @since DOKAN_SINCE
     *
     * @var array|null
     */
    protected ?array $step_order = null;

    /**
     * Wizard step key => the payload key that step bootstrapped under, filled
     * in by {@see self::enqueue_react_step()} as each step registers itself.
     *
     * @since DOKAN_SINCE
     *
     * @var array<string, string>
     */
    protected array $payload_keys = [];

    /**
     * The step-link nonce, minted once per request.
     *
     * @since DOKAN_SINCE
     *
     * @var string|null
     */
    protected ?string $step_nonce = null;

    /**
     * Hook in tabs.
     */
    public function __construct() {
        add_filter( 'woocommerce_registration_redirect', [ $this, 'filter_woocommerce_registration_redirect' ], 10, 1 );
        add_action( 'init', [ $this, 'setup_wizard' ], 9999 );
        add_action( 'dokan_setup_wizard_enqueue_scripts', [ $this, 'frontend_enqueue_scripts' ] );
        // Last word on the action: by then every step has registered the key it bootstrapped under.
        add_action( 'dokan_setup_wizard_enqueue_scripts', [ $this, 'bootstrap_wizard_shell' ], PHP_INT_MAX );
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

        // Enqueue callbacks that print (Pro's media templates, a gateway's inline script) would land ahead of the doctype.
        ob_start();
        $this->enqueue_scripts();
        $this->defer_output( (string) ob_get_clean() );

        ob_start();
        $this->set_setup_wizard_template();
        exit;
    }

    /**
     * Hold markup an enqueue callback printed, for replay inside the document.
     *
     * @since DOKAN_SINCE
     *
     * @param string $html Captured markup.
     *
     * @return void
     */
    protected function defer_output( string $html ): void {
        // An identical blob means the same consumer printed on more than one step pass.
        if ( '' === trim( $html ) || in_array( $html, $this->deferred_output, true ) ) {
            return;
        }

        $this->deferred_output[] = $html;
    }

    /**
     * Replay what the enqueue callbacks printed, now that the body is open.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function render_deferred_output(): void {
        foreach ( $this->deferred_output as $html ) {
            echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Verbatim replay of markup another plugin printed; escaping it would corrupt the templates.
        }

        $this->deferred_output = [];
    }

    /**
     * Enqueue vendor setup wizard scripts
     *
     * @since 3.7.0
     *
     * @return void
     */
    public function frontend_enqueue_scripts() {
        if ( ! $this->use_react_wizard() ) {
            $this->legacy_enqueue_scripts();

            return;
        }

        // Re-entered per step by bootstrap_all_steps() — just contribute this step's payload.
        if ( $this->bootstrapping_steps ) {
            $this->react_enqueue_scripts();

            return;
        }

        $this->register_react_bundle();
        // Every other step first, then the one being viewed — in its own real context, alongside its Pro assets.
        $this->bootstrap_all_steps();
        $this->react_enqueue_scripts();
    }

    /**
     * The React wizard's asset stack: the bundle plus this step's payload.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function react_enqueue_scripts(): void {
        $payload = $this->current_step_payload();

        // Steps Lite doesn't own (Pro's verifications) enqueue the registered handle with their own payload.
        if ( empty( $payload ) ) {
            return;
        }

        // The React map field boots from this loader — only the store step carries a map.
        if ( 'store' === $this->current_step ) {
            dokan()->scripts->load_gmap_script();
        }

        $this->enqueue_react_step( $payload );
    }

    /**
     * The bootstrap payload for the step being rendered.
     *
     * @since DOKAN_SINCE
     *
     * @return array Empty when the step belongs to another plugin.
     */
    protected function current_step_payload(): array {
        $builder = $this->steps[ $this->current_step ]['payload'] ?? null;

        if ( is_callable( $builder ) ) {
            return (array) call_user_func( $builder );
        }

        return [];
    }

    /**
     * The legacy wizard's asset stack: WooCommerce's enhanced select, tiptip
     * and blockUI, plus the map loader the legacy store step's template needs.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function legacy_enqueue_scripts(): void {
        $jquery_blockui = Assets::get_wc_handler( 'jquery-blockui' );
        $jquery_tiptip  = Assets::get_wc_handler( 'jquery-tiptip' );

        wp_enqueue_style( 'jquery-ui' );
        wp_enqueue_emoji_styles();
        wp_enqueue_script( 'jquery' );
        wp_enqueue_script( $jquery_tiptip );
        wp_enqueue_script( $jquery_blockui );
        wp_enqueue_script( 'jquery-ui-autocomplete' );
        wp_enqueue_script( 'wc-enhanced-select' );

        // Load map scripts.
        dokan()->scripts->load_gmap_script();
    }

    /**
     * Whether this render uses the React wizard rather than the legacy one.
     *
     * Same contract as the vendor Store Settings switcher — an admin appearance
     * option, stored default legacy, flipped to latest by the admin setup
     * wizard on a fresh install. Pro's verification step needs no gate of its
     * own: it falls back to its legacy template whenever the React bundle
     * isn't registered, which is exactly what legacy mode does.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    protected function use_react_wizard(): bool {
        if ( null === $this->use_react ) {
            $this->use_react = ! dokan_get_container()->get( LegacySwitcher::class )->is_setup_wizard_legacy_preferred()
                // A checkout with no built bundle has nothing to mount — onboarding falls back to the legacy wizard rather than an empty step.
                && file_exists( static::asset_manifest_path() );
        }

        return $this->use_react;
    }

    /**
     * Where the built bundle's dependency manifest lives.
     *
     * Late static binding on purpose: a subclass can point the gate at another
     * path without the caller reaching into the filesystem.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    protected static function asset_manifest_path(): string {
        return DOKAN_DIR . '/assets/js/vendor-setup-wizard.asset.php';
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
        // use_react_wizard() already proved the manifest is there.
        $asset      = require static::asset_manifest_path();
        $style_file = DOKAN_DIR . '/assets/css/vendor-setup-wizard.css';

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
            file_exists( $style_file ) ? (string) filemtime( $style_file ) : DOKAN_PLUGIN_VERSION
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
        $step = (string) ( $payload['step'] ?? '' );

        // A step registers once per request: the enqueue action can reach the same step twice.
        if ( '' === $step || isset( $this->payload_keys[ $this->current_step ] ) ) {
            return;
        }

        // The step declares its own payload key here, so nothing has to hardcode Pro's.
        $this->payload_keys[ $this->current_step ] = $step;

        /**
         * Filter a wizard step's bootstrapped payload.
         *
         * Every step — Lite's and Pro's alike — funnels through here, so this
         * is where a step's chrome is tuned: `skippable => false` drops the
         * footer's Skip button (Pro does that on the store step when a
         * verification method is required).
         *
         * @since DOKAN_SINCE
         *
         * @param array  $payload  Step payload for the React mount.
         * @param string $step     Payload step key.
         * @param int    $store_id Vendor user ID.
         */
        $payload = (array) apply_filters( 'dokan_setup_wizard_step_payload', $payload, $step, $this->store_id );

        // Every step contributes to one registry: the SPA renders them all without another page load.
        wp_add_inline_script(
            'dokan-vendor-setup-wizard',
            'window.dokanSetupWizard = window.dokanSetupWizard || { steps: {} };'
            . 'window.dokanSetupWizard.steps[' . wp_json_encode( $step ) . '] = ' . wp_json_encode( $payload ) . ';',
            'before'
        );

        wp_enqueue_script( 'dokan-vendor-setup-wizard' );
        wp_enqueue_style( 'dokan-vendor-setup-wizard' );
    }

    /**
     * Bootstrap every step's payload in one page load.
     *
     * Pro gates its wizard assets on the real `$_GET['step']` (stripe-express,
     * vendor-verification), so each step is enqueued inside its own `$_GET`
     * context — the SPA then has every step's assets and payload up front.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function bootstrap_all_steps(): void {
        $original_step = $this->current_step;
        $had_get_step  = isset( $_GET['step'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- reading the wizard's own step context.
        $original_get  = $had_get_step ? sanitize_key( wp_unslash( $_GET['step'] ) ) : null; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        $this->bootstrapping_steps = true;

        foreach ( array_keys( $this->steps ) as $step ) {
            // The step being viewed is served by the outer pass, in its own real context.
            if ( $step === $original_step ) {
                continue;
            }

            $this->current_step = $step;
            $_GET['step']       = $step;

            // Consumers that print (Pro's media templates) would otherwise repeat their markup once per step.
            ob_start();
            do_action( 'dokan_setup_wizard_enqueue_scripts' );
            $this->defer_output( (string) ob_get_clean() );
        }

        $this->bootstrapping_steps = false;
        $this->current_step        = $original_step;

        if ( $had_get_step ) {
            $_GET['step'] = $original_get;
        } else {
            unset( $_GET['step'] );
        }
    }

    /**
     * Emit the SPA shell state: the step order and where to start.
     *
     * Runs last on the enqueue action, once every step — Lite's, Pro's and any
     * third party's — has declared the key it bootstrapped under.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function bootstrap_wizard_shell(): void {
        if ( $this->bootstrapping_steps || ! $this->use_react_wizard() ) {
            return;
        }

        $shell = [
            'order'       => $this->wizard_step_order(),
            'initialStep' => $this->payload_keys[ $this->current_step ] ?? $this->current_step,
        ];

        wp_add_inline_script(
            'dokan-vendor-setup-wizard',
            'window.dokanSetupWizard = window.dokanSetupWizard || { steps: {} };'
            . 'window.dokanSetupWizard.shell = ' . wp_json_encode( $shell ) . ';',
            'before'
        );
    }

    /**
     * Every registered step, in wizard order.
     *
     * The server-rendered rail and the React one both read this, so their
     * "Step N of M" can't drift. Each entry carries a real step URL: a step
     * that bootstrapped no React payload (an older Pro's verification view, a
     * third-party step) gets a page load from the SPA instead of being
     * stepped over.
     *
     * @since DOKAN_SINCE
     *
     * @return array<int, array<string, mixed>>
     */
    protected function wizard_step_order(): array {
        if ( null !== $this->step_order ) {
            return $this->step_order;
        }

        $order = [];

        foreach ( array_keys( $this->steps ) as $step ) {
            $order[] = [
                // A step that bootstrapped no payload keeps its own key, so the rail still counts it.
                'key'      => $this->payload_keys[ $step ] ?? $step,
                'stepArg'  => $step,
                'numbered' => 'introduction' !== $step,
                'centred'  => $this->step_is_centred( $step ),
                'url'      => esc_url_raw( $this->get_step_link( $step ) ),
            ];
        }

        $this->step_order = $order;

        return $order;
    }

    /**
     * Whether a step renders as a centred card rather than a form sheet.
     *
     * The PHP shell paints the first frame and React re-applies it on every
     * step change, so the rule lives in one place.
     *
     * @since DOKAN_SINCE
     *
     * @param string $step Step key.
     *
     * @return bool
     */
    protected function step_is_centred( string $step ): bool {
        return in_array( $step, [ 'introduction', 'next_steps' ], true );
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
        // One nonce per request: the rail alone asks for a link per step.
        if ( null === $this->step_nonce ) {
            $this->step_nonce = wp_create_nonce( 'dokan_admin_setup_wizard_nonce' );
        }

        return add_query_arg(
            [
                'step'            => $step,
                '_admin_sw_nonce' => $this->step_nonce,
            ]
        );
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
            'step'     => 'intro',
            'logoUrl'  => $logo_url ? esc_url_raw( $logo_url ) : '',
            'siteName' => get_bloginfo( 'name' ),
            'message'  => wp_kses_post( dokan_get_option( 'setup_wizard_message', 'dokan_general', self::default_wizard_message() ) ),
            // The only step link the SPA still needs: Skip leaves the wizard entirely.
            'skipUrl'  => esc_url_raw( $this->dashboard_home_url() ),
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
            'step'     => 'store',
            'schema'   => Settings\Schema\SetupWizardSchema::get_schema( $this->store_id ),
            'endpoint' => '/dokan/v1/vendor-onboarding/store',
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
            'step'     => 'payment',
            'schema'   => Settings\Schema\SetupWizardSchema::get_payment_schema( $this->store_id ),
            'endpoint' => '/dokan/v1/vendor-onboarding/payment',
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
		<?php if ( ! $this->use_react_wizard() ) : ?>
    <body class="wc-setup wp-core-ui dokan-vendor-setup-wizard">
			<?php if ( ! empty( $this->custom_logo ) ) : ?>
        <h1 id="wc-logo">
            <a href="<?php echo esc_url( home_url() ); ?>">
                <img src="<?php echo esc_url( $this->custom_logo ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>"/>
            </a>
        </h1>
        <?php else : ?>
            <?php echo '<h1 id="wc-logo">' . esc_attr( get_bloginfo( 'name' ) ) . '</h1>'; ?>
        <?php endif; ?>
			<?php
			return;
    endif;
		?>
		<?php // `dokan-vsw` is the marker the React chrome styles hang off — the legacy body deliberately never carries it. ?>
    <body class="wc-setup wp-core-ui dokan-vendor-setup-wizard dokan-vsw dokan-vsw-step-<?php echo esc_attr( $this->current_step ); ?><?php echo $this->step_is_centred( $this->current_step ) ? ' dokan-vsw-center' : ' dokan-vsw-form'; ?>">
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
        <?php // Server-rendered first frame; the SPA re-renders into this node as steps change. ?>
        <div id="dokan-vsw-rail-mount">
            <?php $this->render_progress_rail(); ?>
        </div>
    </header>
        <?php
    }

    /**
     * The Figma topbar rail: "Step N of M" + a linear progress track.
     *
     * Deliberately not an overridable template: React owns this node from the
     * moment it mounts (it empties the host and portals its own rail in), so a
     * theme override would survive exactly one frame. The markup is kept in
     * step with `ProgressRail.tsx`, and both count `wizard_step_order()`.
     *
     * The intro is un-numbered (matching the legacy rail, which shifted it
     * out), so it renders no rail at all.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function render_progress_rail() {
        $numbered = array_values(
            array_filter(
                $this->wizard_step_order(),
                static function ( $step ) {
                    return ! empty( $step['numbered'] );
                }
            )
        );

        $total    = count( $numbered );
        $position = 0;

        foreach ( $numbered as $index => $step ) {
            if ( $step['stepArg'] === $this->current_step ) {
                $position = $index + 1;
                break;
            }
        }

        if ( $position < 1 || $total < 1 ) {
            return;
        }

        $percent = $total > 1 ? (int) round( ( ( $position - 1 ) / ( $total - 1 ) ) * 100 ) : 100;
        ?>
        <div class="dokan-vsw-rail">
            <span class="dokan-vsw-rail-label">
                <?php
                /* translators: 1: current step number 2: total step count */
                printf( esc_html__( 'Step %1$d of %2$d', 'dokan-lite' ), (int) $position, (int) $total );
                ?>
            </span>
            <span class="dokan-vsw-rail-track">
                <span class="dokan-vsw-rail-fill" style="width: <?php echo (int) $percent; ?>%"></span>
            </span>
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
     * `<ol class="wc-setup-steps">` pills — legacy keeps the parent's pills.
     */
    public function setup_wizard_steps() {
        if ( ! $this->use_react_wizard() ) {
            parent::setup_wizard_steps();
        }
    }

    /**
     * Setup Wizard Footer.
     */
    public function setup_wizard_footer() {
        if ( ! $this->use_react_wizard() && 'next_steps' === $this->current_step ) {
            ?>
        <a class="wc-return-to-dashboard" href="<?php echo esc_url( site_url() ); ?>"><?php esc_attr_e( 'Return to the Marketplace', 'dokan-lite' ); ?></a>
            <?php
        }

        // Whatever the enqueue callbacks printed belongs here — the document is open and each blob lands once.
        $this->render_deferred_output();
		?>
    </body>
    </html>
		<?php
	}

    /**
     * Introduction step.
     */
    public function dokan_setup_introduction() {
        if ( $this->use_react_wizard() ) {
            echo '<div id="dokan-setup-wizard-step"></div>';
        } else {
            $this->legacy_setup_introduction();
        }

        // The 'seen' flag consumers (subscription's post-checkout redirect) hang off this action — it must fire on every intro render.
        do_action( 'dokan_seller_wizard_introduction', $this );
    }

    /**
     * The legacy introduction step.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function legacy_setup_introduction(): void {
        $dashboard_url = dokan_get_navigation_url();
        // translators: %1$s and %2$s are HTML tags for bold text
        $default_message      = wp_kses_post( sprintf( __( 'Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. %1$sIt’s completely optional and shouldn’t take longer than two minutes.%2$s', 'dokan-lite' ), '<strong>', '</strong>' ) );
        $setup_wizard_message = dokan_get_option( 'setup_wizard_message', 'dokan_general', $default_message );
        ?>
        <h1><?php esc_attr_e( 'Welcome to the Marketplace!', 'dokan-lite' ); ?></h1>
        <?php if ( ! empty( $setup_wizard_message ) ) : ?>
            <div><?php echo wp_kses_post( $setup_wizard_message ); ?></div>
        <?php endif; ?>
        <p><?php esc_attr_e( 'No time right now? If you don’t want to go through the wizard, you can skip and return to the Store!', 'dokan-lite' ); ?></p>
        <p class="wc-setup-actions step">
            <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button-primary button button-large button-next lets-go-btn dokan-btn-theme"><?php esc_attr_e( 'Let\'s Go!', 'dokan-lite' ); ?></a>
            <a href="<?php echo esc_url( $dashboard_url ); ?>" class="button button-large not-right-now-btn dokan-btn-theme"><?php esc_attr_e( 'Not right now', 'dokan-lite' ); ?></a>
        </p>
        <?php
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
        if ( $this->use_react_wizard() ) {
            ?>
            <div id="dokan-setup-wizard-step"></div>
            <?php
        } else {
            $this->legacy_setup_store();
        }

        do_action( 'dokan_seller_wizard_after_store_setup_form', $this );
    }

    /**
     * The legacy store step — the `<table class="form-table">` form whose
     * in-form echo hooks Pro's StoreCategory (and third parties) still use.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    protected function legacy_setup_store(): void {
        $store_info = $this->store_info;

        $show_email      = isset( $store_info['show_email'] ) ? esc_attr( $store_info['show_email'] ) : 'no';
        $address_street1 = isset( $store_info['address']['street_1'] ) ? $store_info['address']['street_1'] : '';
        $address_street2 = isset( $store_info['address']['street_2'] ) ? $store_info['address']['street_2'] : '';
        $address_city    = isset( $store_info['address']['city'] ) ? $store_info['address']['city'] : '';
        $address_zip     = isset( $store_info['address']['zip'] ) ? $store_info['address']['zip'] : '';
        $address_country = isset( $store_info['address']['country'] ) ? $store_info['address']['country'] : '';
        $address_state   = isset( $store_info['address']['state'] ) ? $store_info['address']['state'] : '';
        $map_location    = isset( $store_info['location'] ) ? $store_info['location'] : '';
        $map_address     = isset( $store_info['find_address'] ) ? $store_info['find_address'] : '';

        $country_obj = new WC_Countries();
        $countries   = $country_obj->get_allowed_countries();
        $states      = $country_obj->states;

        $request_data = wc_clean( wp_unslash( $_POST ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only redisplay of the legacy error channel; the save handler owns the nonce.

        ?>
        <h1><?php esc_attr_e( 'Store Setup', 'dokan-lite' ); ?></h1>
        <form method="post" class="dokan-seller-setup-form">
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="address[street_1]">
                            <?php esc_html_e( 'Street', 'dokan-lite' ); ?>
                            <span class='required'>*</span>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="address[street_1]" name="address[street_1]" value="<?php echo esc_attr( $address_street1 ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[street_1]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[street_2]">
                            <?php esc_html_e( 'Street 2', 'dokan-lite' ); ?>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="address[street_2]" name="address[street_2]" value="<?php echo esc_attr( $address_street2 ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[street_2]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[city]">
                            <?php esc_html_e( 'City', 'dokan-lite' ); ?>
                            <span class='required'>*</span>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="address[city]" name="address[city]" value="<?php echo esc_attr( $address_city ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[city]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[zip]">
                            <?php esc_html_e( 'Post/Zip Code', 'dokan-lite' ); ?>
                            <span class='required'>*</span>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="address[zip]" name="address[zip]" value="<?php echo esc_attr( $address_zip ); ?>"/>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[zip]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="address[country]">
                            <?php esc_html_e( 'Country', 'dokan-lite' ); ?>
                            <span class='required'>*</span>
                        </label>
                    </th>
                    <td>
                        <select name="address[country]" class="wc-enhanced-select country_to_state" id="address[country]" style="width: 100%;">
                            <?php dokan_country_dropdown( $countries, $address_country, false ); ?>
                        </select>
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[country]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="calc_shipping_state">
                            <?php esc_html_e( 'State', 'dokan-lite' ); ?>
                            <span class='required'>*</span>
                        </label>
                    </th>
                    <td>
                        <input type="text" id="calc_shipping_state" name="address[state]" value="<?php echo esc_attr( $address_state ); ?>" placeholder="<?php esc_attr_e( 'State Name', 'dokan-lite' ); ?>">
                        <span class="error-container">
                            <?php
                            if ( ! empty( $request_data['error_address[state]'] ) ) {
                                echo '<span class="required">' . esc_html__( 'This is required', 'dokan-lite' ) . '</span>';
                            }
                            ?>
                        </span>
                    </td>
                </tr>

                <?php do_action( 'dokan_seller_wizard_store_setup_after_address_field', $this ); ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_before_map_field', $this ); ?>

                <?php if ( dokan_has_map_api_key() ) : ?>
                    <tr>
                        <th><label for="setting_map"><?php esc_html_e( 'Map', 'dokan-lite' ); ?></label></th>
                        <td>
                            <?php
                            dokan_get_template(
                                'maps/dokan-maps-with-search.php', [
                                    'map_location' => $map_location,
                                    'map_address'  => $map_address,
                                ]
                            );
                            ?>
                        </td>
                    </tr>
                <?php endif; ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_after_map_field', $this ); ?>

                <?php if ( empty( dokan_is_vendor_info_hidden( 'email' ) ) ) : ?>
                    <tr>
                        <th scope="row"><label for="show_email"><?php esc_html_e( 'Email', 'dokan-lite' ); ?></label></th>
                        <td class="checkbox">
                            <input type="checkbox" name="show_email" id="show_email" class="switch-input" value="1" <?php checked( $show_email, 'yes' ); ?>>
                            <label for="show_email">
                                <?php esc_html_e( 'Show email address in store', 'dokan-lite' ); ?>
                            </label>
                        </td>
                    </tr>
                <?php endif; ?>

                <?php do_action( 'dokan_seller_wizard_store_setup_field', $this ); ?>

            </table>
            <p class="wc-setup-actions step">
                <input type="button" class="button-primary button button-large button-next store-step-continue dokan-btn-theme" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>"/>
                <input type="submit" id="save_step_submit" style='display: none' value="submit" name="save_step"/>
                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next store-step-skip-btn dokan-btn-theme"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <script>
            (function ($) {
                var states = <?php echo wp_json_encode( $states ); ?>;
                var requiredMsg = <?php echo wp_json_encode( __( 'This is required', 'dokan-lite' ) ); ?>;

                $('body').on('change', 'select.country_to_state, input.country_to_state', function () {
                    // Grab wrapping element to target only stateboxes in same 'group'
                    var $wrapper = $(this).closest('form.dokan-seller-setup-form');

                    var country = $(this).val(),
                        $statebox = $wrapper.find('#calc_shipping_state'),
                        $parent = $statebox.closest('tr'),
                        input_name = $statebox.attr('name'),
                        input_id = $statebox.attr('id'),
                        value = $statebox.val(),
                        placeholder = $statebox.attr('placeholder') || $statebox.attr('data-placeholder') || '',
                        state_option_text = '<?php echo esc_attr__( 'Select an option&hellip;', 'dokan-lite' ); ?>';

                    if (states[country]) {
                        if ($.isEmptyObject(states[country])) {
                            $statebox.closest('tr').hide().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="hidden" class="hidden" name="' + input_name + '" id="' + input_id + '" value="" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        } else {

                            var options = '',
                                state = states[country];

                            for (var index in state) {
                                if (state.hasOwnProperty(index)) {
                                    options = options + '<option value="' + index + '">' + state[index] + '</option>';
                                }
                            }

                            $statebox.closest('tr').show();

                            if ($statebox.is('input')) {
                                // Change for select
                                $statebox.replaceWith('<select name="' + input_name + '" id="' + input_id + '" class="wc-enhanced-select state_select" data-placeholder="' + placeholder + '"></select>');
                                $statebox = $wrapper.find('#calc_shipping_state');
                            }

                            $statebox.html('<option value="">' + state_option_text + '</option>' + options);
                            $statebox.val(value).trigger('change');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        }
                    } else {
                        if ($statebox.is('select')) {

                            $parent.show().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="text" class="input-text" name="' + input_name + '" id="' + input_id + '" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        } else if ($statebox.is('input[type="hidden"]')) {

                            $parent.show().find('.select2-container').remove();
                            $statebox.replaceWith('<input type="text" class="input-text" name="' + input_name + '" id="' + input_id + '" placeholder="' + placeholder + '" />');

                            $(document.body).trigger('country_to_state_changed', [country, $wrapper]);

                        }
                    }

                    $(document.body).trigger('country_to_state_changing', [country, $wrapper]);
                    $('.wc-enhanced-select').select2();
                });

                $(':input.country_to_state').trigger('change');

                $('.store-step-continue').on('click', function(e) {
                    let data = $('.dokan-seller-setup-form').serializeArray().reduce(function(obj, item) {
                        obj[item.name] = item.value;
                        return obj;
                    }, {});

                    let requiredFields = [ 'address[street_1]', 'address[city]', 'address[zip]', 'address[country]' ];

                    requiredFields.map( item => {
                        if ( ! $( `*[name='${item}']` ).val() ) {
                            $( `*[name='${item}']` ).closest('td').children(`span.error-container`).html(`<span class="required">${requiredMsg}</span>`);
                        } else {
                            $( `*[name='${item}']` ).closest('td').children(`span.error-container`).html('');
                        }
                    } );

                    if ( ( 'object' === typeof states[ data['address[country]'] ] && Object.keys( states[ data['address[country]'] ] ).length && ! data['address[state]'] ) || ( 'undefined' === typeof states[ data['address[country]'] ] && ! data['address[state]'] ) ) {
                        if ( ! $( `*[name='address[state]']` ).val() ) {
                            $( `*[name='address[state]']` ).closest('td').children(`span.error-container`).html(`<span class="required">${requiredMsg}</span>`);
                        } else {
                            $( `*[name='address[state]']` ).closest('td').children(`span.error-container`).html('');
                        }

                        return;
                    }

                    $('#save_step_submit').trigger("click");
                });
            })(jQuery);

        </script>
        <style>
            .select2-container--open .select2-dropdown {
                left: 20px;
            }
        </style>
        <?php
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
        if ( $this->use_react_wizard() ) {
            echo '<div id="dokan-setup-wizard-step"></div>';

            return;
        }

        $methods    = dokan_withdraw_get_active_methods();
        $store_info = $this->store_info;
        ?>
        <h1><?php esc_html_e( 'Payment Setup', 'dokan-lite' ); ?></h1>
        <form method="post" id='dokan-seller-payment-setup-form' novalidate>
            <table class="form-table">
                <?php
                foreach ( $methods as $method_key ) {
                    $method = dokan_withdraw_get_method( $method_key );
                    if ( isset( $method['callback'] ) && is_callable( $method['callback'] ) ) {
                        ?>
                        <tr>
                            <th scope="row"><label><?php echo esc_html( dokan_withdraw_get_method_title( $method_key ) ); ?></label></th>
                            <td>
                                <?php call_user_func( $method['callback'], $store_info ); ?>
                            </td>
                        </tr>
                        <?php
                    }
                }

                do_action( 'dokan_seller_wizard_payment_setup_field', $this );
                ?>
            </table>
            <p class="wc-setup-actions step">
                <input type="submit" class="button-primary button button-large button-next payment-continue-btn dokan-btn-theme" value="<?php esc_attr_e( 'Continue', 'dokan-lite' ); ?>" name="save_step"/>

                <a href="<?php echo esc_url( $this->get_next_step_link() ); ?>" class="button button-large button-next payment-step-skip-btn dokan-btn-theme"><?php esc_html_e( 'Skip this step', 'dokan-lite' ); ?></a>
                <?php wp_nonce_field( 'dokan-seller-setup' ); ?>
            </p>
        </form>
        <?php

        do_action( 'dokan_seller_wizard_after_payment_setup_form', $this );
    }

    /**
     * Save payment options — the legacy step's handler.
     *
     * Only ever reached from the legacy form: the React step saves through
     * `PUT /dokan/v1/vendor-onboarding/payment` and never posts `save_step`.
     *
     * @return void
     */
    public function dokan_setup_payment_save() {
        if ( ! isset( $_POST['_wpnonce'] ) || ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'dokan-seller-setup' ) ) {
            return;
        }

        $dokan_settings = $this->store_info;

        if ( isset( $_POST['settings']['bank'] ) ) {
            $bank = array_map( 'sanitize_text_field', (array) wp_unslash( $_POST['settings']['bank'] ) );

            $dokan_settings['payment']['bank'] = [
                'ac_name'        => $bank['ac_name'],
                'ac_type'        => $bank['ac_type'],
                'ac_number'      => $bank['ac_number'],
                'bank_name'      => $bank['bank_name'],
                'bank_addr'      => $bank['bank_addr'],
                'routing_number' => $bank['routing_number'],
                'iban'           => $bank['iban'],
                'swift'          => $bank['swift'],
            ];

            $user_bank_data = array_filter(
                $dokan_settings['payment']['bank'], function ( $item ) {
					return ! empty( $item );
				}
            );
            $require_fields = array_keys( dokan_bank_payment_required_fields() );

            $has_bank_information = true;
            foreach ( $require_fields as $require_field ) {
                if ( empty( $user_bank_data[ $require_field ] ) ) {
                    $_POST[ 'error_' . $require_field ] = 'error';
                    $has_bank_information = false;
                }
            }

            if ( $has_bank_information && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
                $dokan_settings['profile_completion']['bank'] = $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
                $dokan_settings['profile_completion']['paypal'] = 0;
            }
        }

        if ( ! empty( $_POST['settings']['paypal']['email'] ) && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
            $dokan_settings['payment']['paypal']            = [
                'email' => sanitize_email( wp_unslash( $_POST['settings']['paypal']['email'] ) ),
            ];
            $dokan_settings['profile_completion']['paypal'] = $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
            $dokan_settings['profile_completion']['bank'] = 0;
        }

        // Check any payment methods setups and add manually value on Profile Completion also increase progress value
        if ( ! empty( $dokan_settings['profile_completion']['paypal'] ) || ! empty( $dokan_settings['profile_completion']['bank'] ) ) {
            $profile_settings = get_user_meta( $this->store_id, 'dokan_profile_settings', true );
            if ( ! empty( $profile_settings['profile_completion']['progress'] ) && ! empty( $dokan_settings['profile_completion']['progress_vals']['payment_method_val'] ) ) {
                $dokan_settings['profile_completion']['progress'] = $profile_settings['profile_completion']['progress'] + $dokan_settings['profile_completion']['progress_vals']['payment_method_val'];
            }
        }

        update_user_meta( $this->store_id, 'dokan_profile_settings', $dokan_settings );

        do_action( 'dokan_seller_wizard_payment_field_save', $this );

        wp_safe_redirect( apply_filters( 'dokan_ww_payment_redirect', esc_url_raw( $this->get_next_step_link() ) ) );
        exit;
    }

    /**
     * Final step.
     */
    public function dokan_setup_ready() {
        if ( $this->use_react_wizard() ) {
            echo '<div id="dokan-setup-wizard-step"></div>';

            return;
        }

        $dashboard_url = dokan_get_navigation_url();
        ?>
        <div class="dokan-setup-done">
            <img src="<?php echo esc_url( plugins_url( 'assets/images/dokan-checked.png', DOKAN_FILE ) ); ?>" alt="dokan setup">
            <h1><?php esc_html_e( 'Your Store is Ready!', 'dokan-lite' ); ?></h1>
        </div>

        <div class="dokan-setup-done-content">
            <p class="wc-setup-actions step">
                <a class="button button-primary dokan-btn-theme" href="<?php echo esc_url( $dashboard_url ); ?>"><?php esc_html_e( 'Go to your Store Dashboard!', 'dokan-lite' ); ?></a>
            </p>
        </div>
        <?php
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
        // `payload` is the React counterpart of `view`: the step's own bootstrap builder.
        $steps = [
            'introduction' => [
                'name'    => __( 'Introduction', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_introduction' ],
                'payload' => [ $this, 'intro_step_payload' ],
                'handler' => '',
            ],
            'store'        => [
                'name'    => __( 'Store', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_store' ],
                'payload' => [ $this, 'store_step_payload' ],
                'handler' => [ $this, 'dokan_setup_store_save' ],
            ],
        ];

        // Only add payment step if there are active withdrawal methods
        $active_methods = dokan_withdraw_get_active_methods();
        if ( ! empty( $active_methods ) ) {
            $steps['payment'] = [
                'name'    => __( 'Payment', 'dokan-lite' ),
                'view'    => [ $this, 'dokan_setup_payment' ],
                'payload' => [ $this, 'payment_step_payload' ],
                // Harmless in React mode — that step saves over REST and never posts `save_step`.
                'handler' => [ $this, 'dokan_setup_payment_save' ],
            ];
        }

        $steps['next_steps'] = [
            'name'    => __( 'Ready!', 'dokan-lite' ),
            'view'    => [ $this, 'dokan_setup_ready' ],
            'payload' => [ $this, 'ready_step_payload' ],
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
