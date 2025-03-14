<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Currency Input Field.
 */
class CurrencyInput extends Text {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'currency';

    /**
     * Currency symbol.
     *
     * @var string $currency Currency symbol.
     */
    protected $currency = '$';

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_numeric( $data );
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return float|string
     */
    public function sanitize_element( $data ) {
        return floatval( wc_format_decimal( parent::sanitize_element( $data ) ) );
    }

    /**
     * Escape data for display.
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        return esc_html( $data );
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                = parent::populate();
        $data['default']     = $this->get_default();
        $data['placeholder'] = $this->get_placeholder();
        $data['currency']    = $this->get_currency();
        $data['variant']     = 'currency';

        return $data;
    }

    /**
     * Get currency symbol.
     *
     * @return string
     */
    public function get_currency(): string {
        return $this->currency;
    }

    /**
     * Set currency symbol.
     *
     * @param string $currency Currency symbol.
     *
     * @return CurrencyInput
     */
    public function set_currency( string $currency ): CurrencyInput {
        $this->currency = $currency;

        return $this;
    }
}
