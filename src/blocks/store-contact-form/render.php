<?php
/**
 * Render `dokan/store-contact-form`.
 *
 * Reuses the `StoreContactForm` widget verbatim, so the markup, the settings it
 * reads and the hooks it fires stay identical to the classic store sidebar.
 * The widget gates on `dokan_is_store_page()` and reads the `author` query var,
 * both of which `VendorResolver::render_in_store_context()` supplies.
 *
 * @since DOKAN_SINCE
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

use WeDevs\Dokan\Blocks\Styles;
use WeDevs\Dokan\Blocks\VendorResolver;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

$attributes = wp_parse_args(
    $attributes,
    [
        'title'     => '',
        'showTitle' => true,
        'buttonText'         => '',
        'namePlaceholder'    => '',
        'emailPlaceholder'   => '',
        'messagePlaceholder' => '',
        'buttonColor'        => '',
        'buttonTextColor'    => '',
    ]
);

// Text overrides travel to the widget template; empty keeps today's wording.
$dokan_form_text = [
    'button_text'         => sanitize_text_field( (string) $attributes['buttonText'] ),
    'name_placeholder'    => sanitize_text_field( (string) $attributes['namePlaceholder'] ),
    'email_placeholder'   => sanitize_text_field( (string) $attributes['emailPlaceholder'] ),
    'message_placeholder' => sanitize_text_field( (string) $attributes['messagePlaceholder'] ),
];

// Button colours as custom properties the stylesheet applies to the submit button.
$dokan_button_color      = Styles::color( $attributes['buttonColor'] );
$dokan_button_text_color = Styles::color( $attributes['buttonTextColor'] );

$dokan_wrapper = static function () use ( $dokan_button_color, $dokan_button_text_color ) {
    return get_block_wrapper_attributes(
        [
            'class' => '' !== $dokan_button_color . $dokan_button_text_color ? 'has-button-color' : '',
            'style' => Styles::custom_properties(
                [
                    '--dokan-contact-button-background' => $dokan_button_color,
                    '--dokan-contact-button-color'      => $dokan_button_text_color,
                ]
            ),
        ]
    );
};

/*
 * Store pages already carry these, but a block can sit on any page — and blocks
 * placed in a block template are not in post_content, so the content sniff in
 * Blocks\Manager never sees them. Enqueue here rather than relying on it.
 */
wp_enqueue_style( 'dokan-style' );

// Font Awesome is opt-out in Appearance settings; honour that here too.
if ( 'off' === dokan_get_option( 'disable_dokan_fontawesome', 'dokan_appearance', 'off' ) ) {
    wp_enqueue_style( 'dokan-fontawesome' );
}

$resolver = dokan_get_container()->get( VendorResolver::class );
$vendor   = $resolver->resolve( $block->context ?? [], $attributes );

if ( ! $vendor ) {
    return; // Not a store context and not an editor preview — render nothing.
}

/*
 * "Contact Seller" is a marketplace-level switch. The widget itself does not
 * check it — the classic sidebar gates the widget from outside, in
 * dokan_store_sidebar_args() — so a block placing the widget directly has to
 * apply the gate itself, or turning the feature off would leave the form
 * reachable through any block-built store page.
 */
if ( 'on' !== dokan_get_option( 'contact_seller', 'dokan_general', 'on' ) ) {
    if ( $resolver->is_editor_preview() ) {
        printf(
            '<div %1$s><p class="dokan-info">%2$s</p></div>',
            get_block_wrapper_attributes( [ 'class' => 'is-editor-placeholder' ] ),
            esc_html__( 'Contacting vendors is switched off in Dokan settings, so this block will not appear on the store page.', 'dokan-lite' )
        );
    }

    return;
}

/*
 * An empty title is a one-way door without this toggle: the widget falls back
 * to its default heading, so there would be no way to render it heading-less.
 * The widgets themselves already suppress the heading for an empty title.
 */
$widget_title = '';

if ( ! empty( $attributes['showTitle'] ) ) {
    $widget_title = '' !== trim( (string) $attributes['title'] )
        ? $attributes['title']
        : __( 'Contact Vendor', 'dokan-lite' );
}

/*
 * The preview vendor has no id, so the widget would bail. The form itself does
 * not depend on the vendor, so render the widget's own template for it; the
 * editor preview is inert, so the id-less form can never be submitted.
 */
if ( ! $vendor->get_id() ) {
    $dokan_user = wp_get_current_user();

    ob_start();

    dokan_get_template_part(
        'widgets/store-contact-form',
        '',
        array_merge(
            [
                'seller_id'  => 0,
                'store_info' => [],
                'username'   => $dokan_user->exists() ? $dokan_user->display_name : '',
                'email'      => $dokan_user->exists() ? $dokan_user->user_email : '',
            ],
            $dokan_form_text
        )
    );

    printf(
        '<div %1$s><aside class="widget dokan-store-widget dokan-store-contact">%2$s%3$s</aside></div>',
        $dokan_wrapper(),
        '' !== $widget_title ? '<h3 class="widget-title">' . esc_html( $widget_title ) . '</h3>' : '',
        ob_get_clean() // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by the template part.
    );

    return;
}

$widget_output = $resolver->render_in_store_context(
    $vendor,
    function () use ( $widget_title, $dokan_form_text ) {
        the_widget(
            'WeDevs\\Dokan\\Widgets\\StoreContactForm',
            array_merge( [ 'title' => $widget_title ], $dokan_form_text ),
            [
                'before_widget' => '<aside class="widget dokan-store-widget %1$s">',
                'after_widget'  => '</aside>',
                'before_title'  => '<h3 class="widget-title">',
                'after_title'   => '</h3>',
            ]
        );
    }
);

if ( '' === trim( $widget_output ) ) {
    return; // Nothing configured for this vendor — the classic sidebar shows nothing either.
}

printf(
    '<div %1$s>%2$s</div>',
    $dokan_wrapper(),
    $widget_output // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped widget templates.
);
