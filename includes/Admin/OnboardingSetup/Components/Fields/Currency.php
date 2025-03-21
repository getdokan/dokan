<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

class Currency extends Text {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'currency';

    /**
     * Currency symbol.
     *
     * @var string $currency_symbol Currency symbol.
     */
    protected string $currency_symbol;

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                    = parent::populate();
        $data['default']         = $this->get_default();
        $data['placeholder']     = $this->get_placeholder();
        $data['readonly']        = $this->is_readonly();
        $data['disabled']        = $this->is_disabled();
        $data['currency_symbol'] = $this->get_currency_symbol();

        return $data;
    }

    /**
     * Get currency symbol.
     *
     * @return string
     */
    public function get_currency_symbol(): ?string {
        return $this->currency_symbol;
    }

    /**
     * Set currency symbol.
     *
     * @param string $currency_symbol Currency symbol.
     *
     * @return Currency
     */
    public function set_currency_symbol( string $currency_symbol ): Currency {
        $this->currency_symbol = $currency_symbol;

        return $this;
    }
}
