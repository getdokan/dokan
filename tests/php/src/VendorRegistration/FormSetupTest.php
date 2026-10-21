<?php

namespace WeDevs\Dokan\Test\VendorRegistration;

use WeDevs\Dokan\Test\DokanTestCase;
use WeDevs\Dokan\VendorRegistration\FormSetup;

/**
 * Covers how a page's saved registration block becomes a complete form setup.
 *
 * @group core-feature
 * @group core-feature-registration
 */
class FormSetupTest extends DokanTestCase {

    /** @var bool No REST server or seeded vendors are needed here. */
    protected $is_unit_test = true;

    /** @var FormSetup */
    protected $setup;

    public function set_up() {
        parent::set_up();

        $this->setup = dokan_get_container()->get( FormSetup::class );
        $this->setup->flush_cache();
    }

    /**
     * Create a page holding the registration block with the given attributes.
     *
     * @param array  $attributes Block attributes.
     * @param string $before     Markup before the block.
     *
     * @return int
     */
    private function page_with_block( array $attributes, string $before = '' ): int {
        return $this->factory()->post->create(
            [
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_content' => $before . serialize_block(
                    [
                        'blockName'    => FormSetup::BLOCK_NAME,
                        'attrs'        => $attributes,
                        'innerBlocks'  => [],
                        'innerHTML'    => '',
                        'innerContent' => [],
                    ]
                ),
            ]
        );
    }

    /**
     * Get a section of a setup by ID.
     *
     * @param array  $setup Setup.
     * @param string $id    Section ID.
     *
     * @return array|null
     */
    private function section( array $setup, string $id ): ?array {
        return array_column( $setup['sections'], null, 'id' )[ $id ] ?? null;
    }

    /**
     * Get the row IDs of a section.
     *
     * @param array  $setup Setup.
     * @param string $id    Section ID.
     *
     * @return string[]
     */
    private function row_ids( array $setup, string $id ): array {
        return wp_list_pluck( $this->section( $setup, $id )['rows'], 'id' );
    }

    public function test_the_container_shares_one_instance() {
        $this->assertSame( $this->setup, dokan_get_container()->get( FormSetup::class ) );
    }

    public function test_a_page_without_the_block_gets_the_defaults() {
        $page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );
        $setup   = $this->setup->get_for_page( $page_id );

        $this->assertFalse( $setup['has_block'] );
        $this->assertFalse( $setup['split_steps'] );
        $this->assertSame( [ 'account', 'store', 'address', 'additional', 'agreement' ], wp_list_pluck( $setup['sections'], 'id' ) );
        $this->assertSame( [ 'shop_name', 'shop_url', 'phone' ], $this->row_ids( $setup, 'store' ) );
        $this->assertTrue( $this->section( $setup, 'address' )['hidden'] );
    }

    public function test_an_empty_block_gets_the_defaults() {
        $setup = $this->setup->get_for_page( $this->page_with_block( [] ) );

        $this->assertTrue( $setup['has_block'] );
        $this->assertSame( wp_list_pluck( $this->setup->get_defaults()['sections'], 'id' ), wp_list_pluck( $setup['sections'], 'id' ) );
    }

    public function test_saved_order_overrides_and_custom_fields_are_kept() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'   => 'store',
                            'rows' => [
                                [
									'id' => 'phone',
									'label' => 'Mobile',
									'required' => false,
								],
                                [ 'id' => 'shop_url' ],
                                [ 'id' => 'shop_name' ],
                            ],
                        ],
                        [
                            'id'     => 'business',
                            'custom' => true,
                            'title'  => 'Your business',
                            'rows'   => [
                                [
                                    'id'      => 'f1',
                                    'custom'  => true,
                                    'type'    => 'select',
                                    'label'   => 'Business type',
                                    'metaKey' => 'dokan_vreg_business_type',
                                    'options' => [
                                        [
											'label' => 'Sole trader',
											'value' => 'individual',
										],
                                        [
											'label' => '',
											'value' => '',
										],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]
            )
        );

        $store = $this->section( $setup, 'store' );
        $phone = $store['rows'][0];

        $this->assertSame( [ 'phone', 'shop_url', 'shop_name' ], $this->row_ids( $setup, 'store' ) );
        $this->assertSame( 'Mobile', $phone['label'] );
        $this->assertFalse( $phone['required'] );
        $this->assertSame( 'phone', $phone['input_name'] );

        $custom = $this->section( $setup, 'business' );
        $field  = $custom['rows'][0];

        $this->assertTrue( $custom['custom'] );
        $this->assertSame( 'Your business', $custom['title'] );
        $this->assertSame( 'dokan_vreg_business_type', $field['meta_key'] );
        $this->assertSame( 'dokan_vreg[dokan_vreg_business_type]', $field['input_name'] );
        $this->assertSame(
            [
				[
					'label' => 'Sole trader',
					'value' => 'individual',
				],
			], $field['options']
        );
    }

    public function test_locked_rows_and_sections_cannot_be_hidden_or_made_optional() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'     => 'account',
                            'hidden' => true,
                            'rows'   => [
								[
									'id' => 'email',
									'hidden' => true,
									'required' => false,
								],
							],
                        ],
                    ],
                ]
            )
        );

        $account = $this->section( $setup, 'account' );
        $email   = array_column( $account['rows'], null, 'id' )['email'];

        $this->assertFalse( $account['hidden'] );
        $this->assertFalse( $email['hidden'] );
        $this->assertTrue( $email['required'] );
    }

    public function test_unknown_rows_and_custom_fields_without_a_valid_key_are_dropped() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'   => 'additional',
                            'rows' => [
                                [ 'id' => 'removed_module_row' ],
                                [
									'id' => 'f1',
									'custom' => true,
									'type' => 'text',
									'label' => 'A',
									'metaKey' => 'not_prefixed',
								],
                                [
									'id' => 'f2',
									'custom' => true,
									'type' => 'script',
									'label' => 'B',
									'metaKey' => 'dokan_vreg_b',
								],
                                [
									'id' => 'f3',
									'custom' => true,
									'type' => 'text',
									'label' => 'C',
									'metaKey' => 'dokan_vreg_c',
								],
                            ],
                        ],
                    ],
                ]
            )
        );

        $this->assertSame( [ 'f3' ], $this->row_ids( $setup, 'additional' ) );
    }

    public function test_missing_sections_and_rows_are_put_back_in_their_default_place() {
        $page_id = $this->page_with_block(
            [
                'sections' => [
                    [
                        'id'   => 'agreement',
                        'rows' => [ [ 'id' => 'terms' ] ],
                    ],
                    [
                        'id'   => 'store',
                        'rows' => [ [ 'id' => 'shop_name' ], [ 'id' => 'phone' ] ],
                    ],
                ],
            ]
        );

        // A module switched on after the form was saved.
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'       => 'eu_fields',
                    'section'  => 'store',
                    'position' => 30,
                    'label'    => 'EU business fields',
                ];

                return $rows;
            }
        );

        $setup = $this->setup->get_for_page( $page_id );

        $this->assertSame( [ 'account', 'agreement', 'store', 'address', 'additional' ], wp_list_pluck( $setup['sections'], 'id' ) );
        $this->assertSame( [ 'shop_name', 'shop_url', 'eu_fields', 'phone' ], $this->row_ids( $setup, 'store' ) );
        $this->assertSame( [ 'first_name', 'last_name', 'username', 'email', 'password' ], $this->row_ids( $setup, 'account' ) );
    }

    public function test_a_row_that_keeps_its_section_visible_unhides_it() {
        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'                    => 'subscription_packs',
                    'section'               => 'address',
                    'label'                 => 'Subscription packs',
                    'keeps_section_visible' => true,
                ];

                return $rows;
            }
        );

        $address = $this->section( $this->setup->get_defaults(), 'address' );
        $rows    = array_column( $address['rows'], 'hidden', 'id' );

        $this->assertFalse( $address['hidden'] );
        $this->assertTrue( $address['locked'] );
        $this->assertFalse( $rows['subscription_packs'] );
        $this->assertTrue( $rows['country'] );
    }

    public function test_rows_hidden_with_their_section_stay_hidden_when_it_is_unhidden() {
        $page_id = $this->page_with_block(
            [
                'sections' => [
                    [
                        'id'     => 'agreement',
                        'hidden' => true,
                        'rows'   => [ [ 'id' => 'terms' ] ],
                    ],
                ],
            ]
        );

        add_filter(
            'dokan_vendor_registration_rows',
            function ( $rows ) {
                $rows[] = [
                    'id'                    => 'subscription_packs',
                    'section'               => 'agreement',
                    'position'              => 10,
                    'label'                 => 'Subscription packs',
                    'keeps_section_visible' => true,
                ];

                return $rows;
            }
        );

        $agreement = $this->section( $this->setup->get_for_page( $page_id ), 'agreement' );
        $rows      = array_column( $agreement['rows'], 'hidden', 'id' );

        $this->assertFalse( $agreement['hidden'] );
        $this->assertFalse( $rows['subscription_packs'] );
        $this->assertTrue( $rows['terms'] );
    }

    public function test_split_steps_start_from_the_suggested_split() {
        $setup = $this->setup->get_for_page( $this->page_with_block( [ 'splitSteps' => true ] ) );

        $this->assertTrue( $setup['split_steps'] );
        $this->assertSame( [ 'step-account', 'step-store', 'step-details' ], wp_list_pluck( $setup['steps'], 'id' ) );
        $this->assertSame( 'step-store', $this->section( $setup, 'address' )['step'] );
        $this->assertSame( 'step-details', $this->section( $setup, 'agreement' )['step'] );
    }

    public function test_sections_on_an_unknown_step_go_to_the_last_step() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'splitSteps' => true,
                    'steps'      => [
                        [
							'id' => 'one',
							'title' => 'One',
						],
                        [
							'id' => 'two',
							'title' => 'Two',
						],
                    ],
                    'sections'   => [
                        [
							'id' => 'account',
							'step' => 'one',
						],
                        [
							'id' => 'store',
							'step' => 'deleted-step',
						],
                    ],
                ]
            )
        );

        $this->assertSame( 'one', $this->section( $setup, 'account' )['step'] );
        $this->assertSame( 'two', $this->section( $setup, 'store' )['step'] );
    }

    public function test_steps_are_cleared_when_not_split() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'steps'    => [
						[
							'id' => 'one',
							'title' => 'One',
						],
					],
                    'sections' => [
						[
							'id' => 'account',
							'step' => 'one',
						],
					],
                ]
            )
        );

        $this->assertSame( [], $setup['steps'] );
        $this->assertSame( '', $this->section( $setup, 'account' )['step'] );
    }

    public function test_the_first_block_counts_even_when_nested() {
        $nested = '<!-- wp:group --><div class="wp-block-group">'
            . serialize_block(
                [
                    'blockName'    => FormSetup::BLOCK_NAME,
                    'attrs'        => [ 'splitSteps' => true ],
                    'innerBlocks'  => [],
                    'innerHTML'    => '',
                    'innerContent' => [],
                ]
            )
            . '</div><!-- /wp:group -->';

        $setup = $this->setup->get_for_page( $this->page_with_block( [ 'splitSteps' => false ], $nested ) );

        $this->assertTrue( $setup['split_steps'] );
    }

    public function test_a_custom_row_cannot_take_a_built_in_row_id() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'   => 'account',
                            'rows' => [
                                [
                                    'id'      => 'email',
                                    'custom'  => true,
                                    'type'    => 'text',
                                    'label'   => 'Fake email',
                                    'metaKey' => 'dokan_vreg_email',
                                ],
                            ],
                        ],
                    ],
                ]
            )
        );

        $email = array_column( $this->section( $setup, 'account' )['rows'], null, 'id' )['email'];

        $this->assertFalse( $email['custom'] );
        $this->assertSame( 'email', $email['input_name'] );
    }

    public function test_a_section_holding_a_locked_row_cannot_be_hidden() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'     => 'address',
                            'hidden' => true,
                            'rows'   => [ [ 'id' => 'email' ] ],
                        ],
                    ],
                ]
            )
        );

        $address = $this->section( $setup, 'address' );

        $this->assertContains( 'email', wp_list_pluck( $address['rows'], 'id' ) );
        $this->assertFalse( $address['hidden'] );
        $this->assertTrue( $address['locked'] );
    }

    public function test_option_values_keep_any_language_and_stay_unique() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'   => 'additional',
                            'rows' => [
                                [
                                    'id'      => 'f1',
                                    'custom'  => true,
                                    'type'    => 'radio',
                                    'label'   => 'Agree?',
                                    'metaKey' => 'dokan_vreg_agree',
                                    'options' => [
                                        [
                                            'label' => 'হ্যাঁ',
                                            'value' => 'হ্যাঁ',
                                        ],
                                        [
                                            'label' => 'Again',
                                            'value' => 'হ্যাঁ',
                                        ],
                                        [
                                            'label' => 'No',
                                            'value' => 'no',
                                        ],
                                        'not-an-option',
                                    ],
                                ],
                            ],
                        ],
                    ],
                ]
            )
        );

        $this->assertSame( [ 'হ্যাঁ', 'no' ], wp_list_pluck( $this->section( $setup, 'additional' )['rows'][0]['options'], 'value' ) );
    }

    public function test_two_custom_rows_cannot_share_a_meta_key() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'sections' => [
                        [
                            'id'   => 'additional',
                            'rows' => [
                                [
                                    'id'      => 'f1',
                                    'custom'  => true,
                                    'type'    => 'text',
                                    'label'   => 'A',
                                    'metaKey' => 'dokan_vreg_same',
                                ],
                                [
                                    'id'      => 'f2',
                                    'custom'  => true,
                                    'type'    => 'text',
                                    'label'   => 'B',
                                    'metaKey' => 'dokan_vreg_same',
                                ],
                            ],
                        ],
                    ],
                ]
            )
        );

        $this->assertSame( [ 'f1' ], $this->row_ids( $setup, 'additional' ) );
    }

    public function test_malformed_values_are_ignored_without_notices() {
        $setup = $this->setup->get_for_page(
            $this->page_with_block(
                [
                    'steps'      => [ 'not-a-step', [ 'id' => [ 'x' ] ] ],
                    'splitSteps' => true,
                    'sections'   => [
                        [
                            'id'   => 'store',
                            'rows' => [
                                [
                                    'id'    => 'phone',
                                    'label' => [ 'x' ],
                                ],
                                [
                                    'id'      => 'f1',
                                    'custom'  => true,
                                    'type'    => 'text',
                                    'label'   => 'A',
                                    'metaKey' => [ 'dokan_vreg_a' ],
                                ],
                            ],
                        ],
                    ],
                ]
            )
        );

        $phone = array_column( $this->section( $setup, 'store' )['rows'], null, 'id' )['phone'];

        $this->assertSame( 'Phone Number', $phone['label'] );
        $this->assertNotContains( 'f1', $this->row_ids( $setup, 'store' ) );
        $this->assertSame( [ 'step-account', 'step-store', 'step-details' ], wp_list_pluck( $setup['steps'], 'id' ) );
    }

    public function test_saving_a_page_clears_the_cached_setup() {
        $page_id = $this->page_with_block( [ 'splitSteps' => false ] );

        $this->assertFalse( $this->setup->get_for_page( $page_id )['split_steps'] );

        wp_update_post(
            [
                'ID'           => $page_id,
                'post_content' => serialize_block(
                    [
                        'blockName'    => FormSetup::BLOCK_NAME,
                        'attrs'        => [ 'splitSteps' => true ],
                        'innerBlocks'  => [],
                        'innerHTML'    => '',
                        'innerContent' => [],
                    ]
                ),
            ]
        );

        $this->assertTrue( $this->setup->get_for_page( $page_id )['split_steps'] );
    }

    public function test_a_fresh_install_puts_the_block_on_the_vendor_onboarding_page() {
        $page_id = absint( dokan_get_option( 'vendor_onboarding', 'dokan_pages', 0 ) );

        $this->assertTrue( has_block( FormSetup::BLOCK_NAME, get_post( $page_id ) ) );
    }

    public function test_pages_without_the_block_editor_get_the_shortcode() {
        add_filter( 'use_block_editor_for_post_type', '__return_false' );

        $this->assertSame( '[dokan-vendor-onboarding-registration]', FormSetup::get_default_page_content() );
    }

    public function test_a_new_page_starts_from_dokans_address_and_terms_settings() {
        $page_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );
        update_option(
            'dokan_general',
            array_merge(
                (array) get_option( 'dokan_general', [] ),
                [
                    'enabled_address_on_reg' => 'on',
                    'enable_tc_on_reg'       => 'on',
                ]
            )
        );
        update_option( 'dokan_pages', array_merge( (array) get_option( 'dokan_pages', [] ), [ 'reg_tc_page' => $page_id ] ) );
        $this->flush_settings_caches();

        $blocks = parse_blocks( FormSetup::get_default_page_content() );
        $setup  = dokan_get_container()->get( FormSetup::class )->build( $blocks[0]['attrs'] );

        $this->assertSame( $page_id, $blocks[0]['attrs']['termsPageId'] );
        $this->assertFalse( $this->section( $setup, 'address' )['hidden'] );
    }
}
