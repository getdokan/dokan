<?php

namespace WeDevs\Dokan\StructuredData;

class Settings {

    const SECTION_ID        = 'dokan_agent_visibility';
    const OPTION_KEY        = 'dokan_agent_visibility';
    const FIELD_SELLER      = 'seller_attribution';
    const VALUE_PER_VENDOR  = 'vendor';
    const VALUE_MARKETPLACE = 'marketplace';
    const VALUE_OFF         = 'off';

    public function __construct() {
        add_filter( 'dokan_settings_sections', [ $this, 'register_section' ], 26 );
        add_filter( 'dokan_settings_fields', [ $this, 'register_fields' ], 26 );

        add_filter( 'dokan_jsonld_enabled', [ $this, 'maybe_disable' ] );
        add_filter( 'dokan_jsonld_product', [ $this, 'maybe_swap_to_marketplace' ], 30 );
        add_filter( 'dokan_jsonld_vendor_store', [ $this, 'maybe_blank_store_schema' ], 30 );
    }

    public function register_section( $sections ) {
        $sections[] = [
            'id'                   => self::SECTION_ID,
            'title'                => __( 'Agent Attribution', 'dokan-lite' ),
            'icon_url'             => '',
            'description'          => __( 'Vendor identity across all AI agent surfaces', 'dokan-lite' ),
            'settings_title'       => __( 'Agent Attribution', 'dokan-lite' ),
            'settings_description' => __( 'Controls vendor identity across every AI agent surface — page markup (Schema.org JSON-LD) and product feeds (ACP feed for ChatGPT, when the AI Product Feed module is active). One switch keeps attribution consistent across every door agents use to find your products. Human-facing pages and your store theme are unchanged.', 'dokan-lite' ),
        ];
        return $sections;
    }

    public function register_fields( $fields ) {
        $callout = function ( $title, $body, $tone = 'info' ) {
            $bg     = 'info' === $tone ? '#eef6ff' : ( 'warn' === $tone ? '#fff7e6' : '#fdecea' );
            $border = 'info' === $tone ? '#7cb1ee' : ( 'warn' === $tone ? '#e6a23c' : '#e74c3c' );
            return sprintf(
                '<div style="padding:12px 14px;background:%1$s;border-left:4px solid %2$s;border-radius:3px;line-height:1.5;"><strong>%3$s</strong><br>%4$s</div>',
                esc_attr( $bg ),
                esc_attr( $border ),
                esc_html( $title ),
                esc_html( $body )
            );
        };

        $fields[ self::SECTION_ID ] = [
            self::FIELD_SELLER => [
                'name'    => self::FIELD_SELLER,
                'label'   => __( 'Seller Attribution', 'dokan-lite' ),
                'desc'    => __( 'Choose who appears as the seller of each product across every AI agent surface — both page schema and product feeds. The selected option’s details show below.', 'dokan-lite' ),
                'type'    => 'select',
                'default' => self::VALUE_PER_VENDOR,
                'options' => [
                    self::VALUE_PER_VENDOR  => __( 'Per Vendor (Recommended)', 'dokan-lite' ),
                    self::VALUE_MARKETPLACE => __( 'Marketplace (White-label)', 'dokan-lite' ),
                    self::VALUE_OFF         => __( 'Disabled', 'dokan-lite' ),
                ],
                'tooltip' => __( 'Affects Schema.org markup on pages AND the ACP product feed sent to OpenAI. Your store theme and human-facing pages are unchanged.', 'dokan-lite' ),
            ],
            'attribution_help_vendor' => [
                'name'    => 'attribution_help_vendor',
                'label'   => '',
                'type'    => 'html',
                'show_if' => [
                    self::FIELD_SELLER => [ 'equal' => self::VALUE_PER_VENDOR ],
                ],
                'desc'    => $callout(
                    __( 'Per Vendor (Recommended)', 'dokan-lite' ),
                    __( 'Each product attributed to the vendor who listed it — on product pages, vendor storefronts, AND in the ACP feed pushed to ChatGPT. Required for Dokan’s multi-vendor advantage in AI shopping — buyers asking AI assistants for products from specific shops will find your vendors.', 'dokan-lite' ),
                    'info'
                ),
            ],
            'attribution_help_marketplace' => [
                'name'    => 'attribution_help_marketplace',
                'label'   => '',
                'type'    => 'html',
                'show_if' => [
                    self::FIELD_SELLER => [ 'equal' => self::VALUE_MARKETPLACE ],
                ],
                'desc'    => $callout(
                    __( 'Marketplace (White-label)', 'dokan-lite' ),
                    __( 'All products attributed to the marketplace name — on pages AND in feeds. Use for white-label / single-brand marketplaces. Vendors become invisible to AI agents across every surface. You lose Dokan’s multi-vendor differentiator in AI search.', 'dokan-lite' ),
                    'warn'
                ),
            ],
            'attribution_help_off' => [
                'name'    => 'attribution_help_off',
                'label'   => '',
                'type'    => 'html',
                'show_if' => [
                    self::FIELD_SELLER => [ 'equal' => self::VALUE_OFF ],
                ],
                'desc'    => $callout(
                    __( 'Disabled', 'dokan-lite' ),
                    __( 'Removes the Schema.org seller field from product and storefront pages. ACP feed still emits vendor as seller — OpenAI requires the field and it cannot be empty. Not recommended; Google Shopping and Perplexity also rely on the seller field. Only use to avoid conflicts with another SEO plugin managing structured data.', 'dokan-lite' ),
                    'danger'
                ),
            ],
        ];
        return $fields;
    }

    public function maybe_disable( $enabled ) {
        return self::VALUE_OFF === self::current_mode() ? false : $enabled;
    }

    public function maybe_swap_to_marketplace( $markup ) {
        if ( self::VALUE_MARKETPLACE !== self::current_mode() ) {
            return $markup;
        }

        $marketplace = [
            '@type' => 'Organization',
            '@id'   => home_url( '/' ) . '#organization',
            'name'  => get_bloginfo( 'name' ),
            'url'   => home_url( '/' ),
        ];

        if ( ! empty( $markup['offers'] ) ) {
            if ( $this->is_offer( $markup['offers'] ) ) {
                $markup['offers']['seller'] = $marketplace;
            } elseif ( is_array( $markup['offers'] ) ) {
                foreach ( $markup['offers'] as $k => $offer ) {
                    if ( $this->is_offer( $offer ) ) {
                        $offer['seller']         = $marketplace;
                        $markup['offers'][ $k ] = $offer;
                    }
                }
            }
        }

        $markup['brand'] = [
            '@type' => 'Brand',
            'name'  => get_bloginfo( 'name' ),
        ];

        return $markup;
    }

    public function maybe_blank_store_schema( $graph ) {
        return self::VALUE_MARKETPLACE === self::current_mode() ? [] : $graph;
    }

    public static function current_mode() {
        $settings = get_option( self::OPTION_KEY, [] );
        $value    = isset( $settings[ self::FIELD_SELLER ] ) ? (string) $settings[ self::FIELD_SELLER ] : self::VALUE_PER_VENDOR;
        return in_array(
            $value,
            [ self::VALUE_PER_VENDOR, self::VALUE_MARKETPLACE, self::VALUE_OFF ],
            true
        ) ? $value : self::VALUE_PER_VENDOR;
    }

    private function is_offer( $node ) {
        return is_array( $node ) && isset( $node['@type'] ) && 'Offer' === $node['@type'];
    }
}
