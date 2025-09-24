<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

class SingleProductPreview extends MultiCheck {
    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'single_product_preview';

    /**
     * Default Value.
     *
     * @var array $default Default.
     */
    protected $default = [
        'vendor_info'       => true,
        'more_products_tab' => true,
        'shipping_tab'      => true,
    ];

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        parent::__construct( $id );

        // Set up the options for the three checkboxes
        $this->set_options(
            [
                [
                    'value' => 'vendor_info',
                    'title' => __( 'Vendor Info', 'dokan-lite' ),
                ],
                [
                    'value' => 'more_products_tab',
                    'title' => __( 'More products tab', 'dokan-lite' ),
                ],
                [
                    'value' => 'shipping_tab',
                    'title' => __( 'Shipping tab', 'dokan-lite' ),
                ],
            ]
        );
    }
}
