<?php

namespace WeDevs\Dokan\Test\Blocks;

use WeDevs\Dokan\Test\DokanTestCase;

/**
 * The listing templates take optional text and icon overrides from the blocks.
 * Left empty, they must render exactly what they rendered before.
 *
 * @group blocks
 */
class StoreListingTextOverridesTest extends DokanTestCase {

    /**
     * Render the loop template for one vendor with the given card args.
     *
     * @param array $args Card args.
     *
     * @return string
     */
    protected function render_loop( array $args = [] ): string {
        $vendor_id = $this->factory()->seller->create( [ 'enabled' => true ] );
        $vendor    = dokan()->vendor->get( $vendor_id );

        $vendor->set_phone( '+1 555 0100' );
        $vendor->save();
        update_user_meta( $vendor_id, 'dokan_feature_seller', 'yes' );

        ob_start();
        dokan_get_template_part(
            'store-lists-loop',
            false,
            array_merge(
                [
                    'sellers'         => [
                        'users' => [ get_userdata( $vendor_id ) ],
                        'count' => 1,
                    ],
                    'limit'           => 10,
                    'offset'          => 0,
                    'paged'           => 1,
                    'search_query'    => '',
                    'pagination_base' => '',
                    'per_row'         => 3,
                    'search_enabled'  => 'yes',
                    'image_size'      => 'full',
                ],
                $args
            )
        );

        return ob_get_clean();
    }

    /**
     * @test
     */
    public function the_card_renders_todays_wording_and_phone_icon_when_nothing_is_overridden() {
        $html = $this->render_loop();

        $this->assertStringContainsString( '<div class="featured-label">Featured</div>', $html );
        $this->assertStringContainsString( 'class="fas fa-phone-alt"', $html );
        $this->assertStringContainsString( 'title="Visit Store"', $html );
        $this->assertStringNotContainsString( 'store-address-label', $html );
    }

    /**
     * @test
     */
    public function the_card_takes_the_blocks_text_and_icon_overrides() {
        $html = $this->render_loop(
            [
                'featured_text'    => 'Top pick',
                'visit_store_text' => 'See the shop',
                'phone_icon'       => 'fab fa-whatsapp',
                'address_icon'     => 'fas fa-map',
                'address_label'    => 'Find us',
            ]
        );

        $this->assertStringContainsString( '<div class="featured-label">Top pick</div>', $html );
        $this->assertStringContainsString( 'title="See the shop"', $html );
        $this->assertStringContainsString( 'class="fab fa-whatsapp"', $html );
        $this->assertStringNotContainsString( 'fa-phone-alt', $html );
    }

    /**
     * @test
     */
    public function an_empty_phone_icon_drops_the_icon_but_keeps_the_number() {
        $html = $this->render_loop( [ 'phone_icon' => '' ] );

        $this->assertStringContainsString( '+1 555 0100', $html );
        $this->assertStringNotContainsString( '<p class="store-phone">' . "\n" . '                                                    <i', $html );
        $this->assertStringNotContainsString( 'fa-phone-alt', $html );
    }

    /**
     * @test
     */
    public function the_empty_listing_message_can_be_reworded() {
        $empty = [
            'sellers'         => [
                'users' => [],
                'count' => 0,
            ],
            'limit'           => 10,
            'offset'          => 0,
            'paged'           => 1,
            'search_query'    => '',
            'pagination_base' => '',
            'per_row'         => 3,
        ];

        ob_start();
        dokan_get_template_part( 'store-lists-loop', false, $empty );
        $default = ob_get_clean();

        ob_start();
        dokan_get_template_part( 'store-lists-loop', false, $empty + [ 'no_vendor_text' => 'Nobody here yet' ] );
        $custom = ob_get_clean();

        $this->assertStringContainsString( 'No vendor found!', $default );
        $this->assertStringContainsString( 'Nobody here yet', $custom );
    }

    /**
     * @test
     */
    public function the_filter_panel_texts_fall_back_to_todays_wording() {
        $args = [
            'stores'          => [
                'users' => [],
                'count' => 0,
            ],
            'number_of_store' => 0,
            'sort_filters'    => [ 'most_recent' => 'Most recent' ],
            'sort_by'         => 'most_recent',
        ];

        ob_start();
        dokan_get_template_part( 'store-lists-filter', '', $args );
        $default = ob_get_clean();

        ob_start();
        dokan_get_template_part(
            'store-lists-filter',
            '',
            $args + [
                'search_placeholder' => 'Find a seller',
                'apply_text'         => 'Go',
                'cancel_text'        => 'Never mind',
            ]
        );
        $custom = ob_get_clean();

        $this->assertStringContainsString( 'placeholder="Search Vendors"', $default );
        $this->assertStringContainsString( '>Apply</button>', $default );
        $this->assertStringContainsString( '>Cancel</button>', $default );

        $this->assertStringContainsString( 'placeholder="Find a seller"', $custom );
        $this->assertStringContainsString( '>Go</button>', $custom );
        $this->assertStringContainsString( '>Never mind</button>', $custom );
    }

    /**
     * @test
     */
    public function a_custom_sort_label_is_printed_as_typed() {
        $args = [
            'stores'          => [
                'users' => [],
                'count' => 0,
            ],
            'number_of_store' => 0,
            'sort_filters'    => [ 'most_recent' => 'Most recent' ],
            'sort_by'         => 'most_recent',
        ];

        ob_start();
        dokan_get_template_part( 'store-lists-filter', '', $args );
        $default = ob_get_clean();

        ob_start();
        dokan_get_template_part( 'store-lists-filter', '', $args + [ 'sort_label' => 'Order by:' ] );
        $custom = ob_get_clean();

        $this->assertStringContainsString( 'Sort by:', $default );
        $this->assertStringContainsString( 'Order by:', $custom );
        $this->assertStringNotContainsString( 'Order by::', $custom );
    }

    /**
     * @test
     */
    public function the_contact_form_and_opening_hours_templates_take_text_overrides() {
        ob_start();
        dokan_get_template_part(
            'widgets/store-contact-form',
            '',
            [
                'seller_id'  => 0,
                'store_info' => [],
                'username'   => '',
                'email'      => '',
            ]
        );
        $default_form = ob_get_clean();

        ob_start();
        dokan_get_template_part(
            'widgets/store-contact-form',
            '',
            [
                'seller_id'        => 0,
                'store_info'       => [],
                'username'         => '',
                'email'            => '',
                'button_text'      => 'Say hello',
                'name_placeholder' => 'Who are you?',
            ]
        );
        $custom_form = ob_get_clean();

        $this->assertStringContainsString( 'value="Send Message"', $default_form );
        $this->assertStringContainsString( 'placeholder="Your Name"', $default_form );
        $this->assertStringContainsString( 'value="Say hello"', $custom_form );
        $this->assertStringContainsString( 'placeholder="Who are you?"', $custom_form );
        $this->assertStringContainsString( 'placeholder="you@example.com"', $custom_form, 'Fields left empty keep their wording.' );

        $hours = [
            'seller_id'        => 0,
            'dokan_store_time' => [ 'monday' => [ 'status' => 'close' ] ],
            'dokan_days'       => [ 'monday' => 'Monday' ],
        ];

        ob_start();
        dokan_get_template_part( 'widgets/store-open-close', '', $hours );
        $default_hours = ob_get_clean();

        ob_start();
        dokan_get_template_part( 'widgets/store-open-close', '', $hours + [ 'off_day_text' => 'Closed today' ] );
        $custom_hours = ob_get_clean();

        $this->assertStringContainsString( 'Off Day', $default_hours );
        $this->assertStringContainsString( 'Closed today', $custom_hours );
        $this->assertStringNotContainsString( 'Off Day', $custom_hours );
    }
}
