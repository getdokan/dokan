<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Commission;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\Field;
use WeDevs\Dokan\ProductCategory\Categories;

/**
 * CategoryBasedCommission Field.
 */
class CategoryBasedCommission extends Field {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'category_based_commission';

    /**
     * Commission Data.
     *
     * @var array $commission Commission data with all and items properties.
     */
    protected $commission;

    /**
     * Reset subcategory flag.
     *
     * @var string $reset_subcategory Whether to apply parent category commission to subcategories.
     */
    protected $reset_subcategory;

    /**
     * Constructor.
     *
     * @param string $id Input ID.
     */
    public function __construct( string $id ) {
        $this->id = $id;
    }

    /**
     * Get Commission Data.
     *
     * @return array
     */
    public function get_commission(): array {
        return $this->commission;
    }

    /**
     * Set Commission Data.
     *
     * @param array $commission Commission data.
     *
     * @return CategoryBasedCommission
     */
    public function set_commission( array $commission ): CategoryBasedCommission {
        $this->commission = $commission;

        return $this;
    }

    /**
     * Get Reset Subcategory Flag.
     *
     * @return string
     */
    public function get_reset_subcategory(): string {
        return $this->reset_subcategory;
    }

    /**
     * Set Reset Subcategory Flag.
     *
     * @param string $reset_subcategory Reset subcategory flag.
     *
     * @return CategoryBasedCommission
     */
    public function set_reset_subcategory( string $reset_subcategory ): CategoryBasedCommission {
        $this->reset_subcategory = $reset_subcategory;

        return $this;
    }

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_array( $data );
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $categories_controller     = new Categories();
        $data                      = parent::populate();
        $data['commission']        = $this->get_commission();
        $data['categories']        = $categories_controller->get();
        $data['reset_subcategory'] = $this->get_reset_subcategory();

        return $data;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return array
     */
    public function sanitize_element( $data ) {
        return wc_clean( parent::sanitize_element( $data ) );
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ) {
        return esc_html( $data );
    }
}
