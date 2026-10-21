<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Front-end behaviour of the Vendor Registration Form block.
 *
 * @since DOKAN_SINCE
 */
class Block implements Hookable {

    /** Shortcodes the block replaces on the same page. */
    const SHORTCODES = [ 'dokan-vendor-onboarding-registration', 'dokan-vendor-registration' ];

    /** @var FormRenderer */
    protected FormRenderer $renderer;

    /** @var FormSetup */
    protected FormSetup $setup;

    /** @var int Blocks rendered in this request. */
    protected int $rendered = 0;

    /** @var int Page a shortcode-drawn master form belongs to, while it renders. */
    protected int $page_override = 0;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormRenderer $renderer Form renderer.
     * @param FormSetup    $setup    Form setup reader.
     */
    public function __construct( FormRenderer $renderer, FormSetup $setup ) {
        $this->renderer = $renderer;
        $this->setup    = $setup;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'pre_do_shortcode_tag', [ $this, 'skip_shortcode_next_to_block' ], 10, 2 );
        add_action( 'template_redirect', [ $this, 'redirect_vendors' ] );
        // Before do_blocks (9): each content render counts its own blocks, so an early SEO or excerpt render can't use up "the first".
        add_filter( 'the_content', [ $this, 'reset_render_count' ], 8 );
    }

    /**
     * Start counting rendered blocks afresh for a new content render.
     *
     * @since DOKAN_SINCE
     *
     * @param string $content Post content.
     *
     * @return string
     */
    public function reset_render_count( $content ) {
        $this->rendered = 0;

        return $content;
    }

    /**
     * Render the block.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return string
     */
    public function render( array $attributes ): string {
        ++$this->rendered;

        // Two blocks on one page: the first counts.
        if ( $this->rendered > 1 ) {
            return $this->admin_notice( __( 'This page already has a Vendor Registration Form block, so this one is not shown.', 'dokan-lite' ) );
        }

        $context = $this->get_render_context( $attributes );

        if ( 'vendor' === $context['view'] ) {
            return '<div ' . get_block_wrapper_attributes( [ 'class' => 'dokan-vreg' ] ) . '><p class="dokan-vreg__note">'
                . esc_html__( 'You are already a vendor.', 'dokan-lite' )
                . ' <a href="' . esc_url( dokan_get_navigation_url() ) . '">' . esc_html__( 'Go to your vendor dashboard', 'dokan-lite' ) . '</a></p></div>';
        }

        if ( ! in_array( $context['view'], [ 'visitor', 'customer', 'social' ], true ) ) {
            return '';
        }

        $this->enqueue_assets();

        /**
         * Fires before the vendor registration block renders; Dokan Pro stops adding its usual social buttons until it's done.
         *
         * @since DOKAN_SINCE
         *
         * @param array $attributes Block attributes.
         * @param array $context    Render context.
         */
        do_action( 'dokan_vendor_registration_before_render', $attributes, $context );

        $texts   = $this->renderer->get_texts( $attributes );
        $login   = $this->renderer->get_login_settings( $attributes );
        $page_id = $this->page_override ? $this->page_override : ( is_singular() ? (int) get_queried_object_id() : (int) get_the_ID() );
        $notice  = $context['preview'] ? $this->admin_notice( __( 'You are logged in, so this is a preview: visitors see this form and customers see the "Become a vendor" version.', 'dokan-lite' ) ) : '';
        $headers = [
            'visitor'  => $texts['visitorHeading'],
            'social'   => $texts['socialHeading'],
            'customer' => $texts['customerHeading'],
        ];

        $main = '<div class="dokan-vreg__main"><h2 class="dokan-vreg__heading">' . esc_html( $headers[ $context['view'] ] ?? $texts['visitorHeading'] ) . '</h2>';

        if ( 'social' === $context['view'] ) {
            $main .= '<p class="dokan-vreg__note">' . esc_html( str_replace( '{platform}', $context['platform'], $texts['socialNote'] ) ) . '</p>';
        }

        /**
         * Filter extra markup above the vendor registration form, e.g. Dokan Pro's social sign-up buttons.
         *
         * @since DOKAN_SINCE
         *
         * @param string $html       Markup; empty by default.
         * @param array  $attributes Block attributes.
         * @param array  $context    Render context.
         */
        $main .= (string) apply_filters( 'dokan_vendor_registration_before_form', '', $attributes, $context );
        $main .= $this->renderer->render_form( $attributes, $page_id, $context );

        /**
         * Filter extra markup below the vendor registration form.
         *
         * @since DOKAN_SINCE
         *
         * @param string $html       Markup; empty by default.
         * @param array  $attributes Block attributes.
         * @param array  $context    Render context.
         */
        $main .= (string) apply_filters( 'dokan_vendor_registration_after_form', '', $attributes, $context ) . '</div>';

        // Only visitors get the login box.
        $show_login = $login['enabled'] && 'visitor' === $context['view'] && ! $context['preview'];
        $login_box  = '';
        $open       = false;

        if ( $show_login ) {
            $heading = 'link' === $login['position'] ? '' : '<h2 class="dokan-vreg__heading">' . esc_html( $login['heading'] ) . '</h2>';
            // A failed login reloads the page; keep a collapsed box open so its error and username stay in view.
            $open = 'link' !== $login['position'] || ! empty( $_POST['dokan_vreg_login'] ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- display state only.
            /**
             * Filter extra markup under the block's Log in button, e.g. Dokan Pro's social login buttons.
             *
             * @since DOKAN_SINCE
             *
             * @param string $html       Markup; empty by default.
             * @param array  $attributes Block attributes.
             * @param array  $context    Render context.
             */
            $after_login = (string) apply_filters( 'dokan_vendor_registration_after_login_form', '', $attributes, $context );
            $login_box   = '<div class="dokan-vreg__login"' . ( $open ? '' : ' hidden' ) . '>' . $heading . $this->renderer->render_login( $login, $this->get_current_url() ) . $after_login . '</div>';
        }

        $classes = [ 'dokan-vreg', 'is-step-style-' . $this->renderer->get_step_style( $attributes ), 'is-social-' . $this->renderer->get_social_layout( $attributes ) ];

        if ( ! wp_is_block_theme() ) {
            $classes[] = 'is-classic-theme';
        }

        if ( $show_login ) {
            $classes[] = 'has-login-' . $login['position'];
        }

        if ( ! $show_login ) {
            $layout = $main;
        } elseif ( 'link' === $login['position'] ) {
            $layout = '<p class="dokan-vreg__login-link"><button type="button" class="dokan-vreg__login-toggle" aria-expanded="' . ( $open ? 'true' : 'false' ) . '">' . esc_html( $login['linkText'] ) . '</button></p>' . $login_box . $main;
        } else {
            $layout = '<div class="dokan-vreg__columns">' . ( 'left' === $login['position'] ? $login_box . $main : $main . $login_box ) . '</div>';
        }

        $notices = function_exists( 'wc_print_notices' ) ? wc_print_notices( true ) : '';

        $wrapper = [ 'class' => implode( ' ', $classes ) ];
        $style   = $this->renderer->get_style_variables( $attributes );

        if ( '' !== $style ) {
            $wrapper['style'] = $style;
        }

        $html = '<div ' . get_block_wrapper_attributes( $wrapper ) . '>' . $notice . $notices . $layout . '</div>';

        /**
         * Fires after the vendor registration block rendered.
         *
         * @since DOKAN_SINCE
         *
         * @param array $attributes Block attributes.
         * @param array $context    Render context.
         */
        do_action( 'dokan_vendor_registration_after_render', $attributes, $context );

        return $html;
    }

    /**
     * Build the render context: which view the visitor gets, and what to fill in.
     *
     * @since DOKAN_SINCE
     *
     * @param array $attributes Block attributes.
     *
     * @return array
     */
    public function get_render_context( array $attributes ): array {
        $view    = $this->get_view();
        $preview = 'preview' === $view;
        $prefill = [];

        if ( 'customer' === $view ) {
            $user    = wp_get_current_user();
            $prefill = [
                'fname' => $user->first_name,
                'lname' => $user->last_name,
            ];
        }

        $context = [
            'view'      => $preview ? 'visitor' : $view,
            'preview'   => $preview,
            'prefill'   => $prefill,
            'platform'  => '',
            'terms_url' => $this->renderer->get_terms_url( $attributes ),
        ];

        /**
         * Filter the context the vendor registration form renders with.
         *
         * Dokan Pro switches to the `social` view, with the provider's name and details, after a social sign-in.
         *
         * @since DOKAN_SINCE
         *
         * @param array $context    Render context: view, preview, prefill, platform and terms_url; missing keys keep these defaults.
         * @param array $attributes Block attributes.
         */
        return wp_parse_args( (array) apply_filters( 'dokan_vendor_registration_render_context', $context, $attributes ), $context );
    }

    /**
     * Work out which version of the form the current user sees.
     *
     * @since DOKAN_SINCE
     *
     * @return string `visitor`, `customer` (any logged-in non-vendor), `vendor`, or `preview` (admins and editors).
     */
    public function get_view(): string {
        if ( ! is_user_logged_in() ) {
            return 'visitor';
        }

        if ( current_user_can( 'edit_others_pages' ) ) {
            return 'preview';
        }

        return dokan_is_user_seller( get_current_user_id() ) ? 'vendor' : 'customer';
    }

    /**
     * URL of the page being viewed, so the login box returns to it.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_current_url(): string {
        if ( is_singular() ) {
            return (string) get_permalink( get_queried_object_id() );
        }

        $path = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';

        return (string) home_url( preg_replace( '#^' . preg_quote( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '#' ) . '#', '', $path ) );
    }

    /**
     * Where to send the current user away from a registration page, if anywhere.
     *
     * @since DOKAN_SINCE
     *
     * @param int $page_id Page being viewed.
     *
     * @return string Vendor dashboard URL for vendors; empty otherwise.
     */
    public function get_vendor_redirect( int $page_id ): string {
        if ( ! $page_id || ! is_user_logged_in() || current_user_can( 'edit_others_pages' ) || ! dokan_is_user_seller( get_current_user_id() ) ) {
            return '';
        }

        return has_block( FormSetup::BLOCK_NAME, $page_id ) ? (string) dokan_get_navigation_url() : '';
    }

    /**
     * Send vendors to their dashboard before a registration page renders.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function redirect_vendors(): void {
        if ( ! is_singular() ) {
            return;
        }

        $url = $this->get_vendor_redirect( (int) get_queried_object_id() );

        if ( '' !== $url ) {
            wp_safe_redirect( $url );
            exit;
        }
    }

    /**
     * Run the old registration shortcodes through the block: ignored next to a block, else drawn with the Vendor Onboarding page's block setup.
     *
     * Without a block on the Vendor Onboarding page the shortcodes render as they always did.
     *
     * @since DOKAN_SINCE
     *
     * @param false|string $output Short-circuit output.
     * @param string       $tag    Shortcode tag.
     *
     * @return false|string
     */
    public function skip_shortcode_next_to_block( $output, $tag ) {
        if ( ! in_array( $tag, self::SHORTCODES, true ) ) {
            return $output;
        }

        if ( has_block( FormSetup::BLOCK_NAME ) ) {
            return $this->admin_notice( __( 'This page uses the Vendor Registration Form block, so this shortcode is ignored. You can remove it.', 'dokan-lite' ) );
        }

        $master = $this->setup->get_master_setup();

        if ( ! $master ) {
            return $output;
        }

        // Through the block pipeline, so its scripts, styles and design settings load; recorded against the master page.
        $this->page_override = (int) $master['page_id'];
        $html                = render_block(
            [
                'blockName'    => FormSetup::BLOCK_NAME,
                'attrs'        => $master['attributes'],
                'innerBlocks'  => [],
                'innerHTML'    => '',
                'innerContent' => [],
            ]
        );
        $this->page_override = 0;

        return $html;
    }

    /**
     * Load the scripts Dokan's registration form relies on.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function enqueue_assets(): void {
        dokan()->scripts->load_form_validate_script();

        wp_enqueue_script( 'dokan-form-validate' );
        wp_enqueue_script( 'dokan-vendor-registration' );
        wp_enqueue_script( 'dokan-vendor-address' );
        wp_enqueue_script( 'wc-password-strength-meter' );
        wp_enqueue_script( 'wc-country-select' );
        wp_enqueue_script( generate_block_asset_handle( FormSetup::BLOCK_NAME, 'viewScript' ) );
        wp_enqueue_style( generate_block_asset_handle( FormSetup::BLOCK_NAME, 'style' ) );
    }

    /**
     * A notice only users who can edit the page see.
     *
     * @param string $message Notice text.
     *
     * @return string
     */
    protected function admin_notice( string $message ): string {
        if ( ! current_user_can( 'edit_post', (int) get_the_ID() ) ) {
            return '';
        }

        return '<p class="dokan-vreg__admin-notice">' . esc_html( $message ) . '</p>';
    }
}
