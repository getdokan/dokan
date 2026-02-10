<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

class VendorInfoPreview extends MultiCheck {
    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'vendor_info_preview';

    /**
     * Default Value.
     *
     * @var array $default Default.
     */
    protected $default = [
        'store_address' => true,
        'store_phone'   => true,
        'store_email'   => true,
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
                    'value' => 'store_email',
                    'title' => __( 'Email Address', 'dokan-lite' ),
                ],
                [
                    'value' => 'store_phone',
                    'title' => __( 'Phone Number', 'dokan-lite' ),
                ],
                [
                    'value' => 'store_address',
                    'title' => __( 'Store Address', 'dokan-lite' ),
                ],
            ]
        );
    }
}
