<div class="card_container">
    <div class="form-row address-field validate-postcode form-row-wide">
        <label for="dpm_card_number" class="">Card Number</label>
        <div id="dpm_card_number" class="card_field form-group"></div>
    </div>

    <div class="form-row address-field validate-postcode form-row-wide">
        <label for="dpm_card_expiry" class="">Expiration Date</label>
        <div id="dpm_card_expiry" class="card_field form-group"></div>
    </div>

    <div class="form-row address-field validate-postcode form-row-wide">
        <label for="dpm_cvv" class="">CVV</label>
        <div id="dpm_cvv" class="card_field form-group"></div>
    </div>

    <p class="form-row address-field validate-postcode form-row-wide">
        <label for="dpm_name_on_card" class="">Name on Card</label>

        <span class="woocommerce-input-wrapper">
            <input type="text" class="input-text" name="dpm_name_on_card" id="dpm_name_on_card" placeholder="Jhon Smith" Value="kapil Paul">
        </span>
    </p>

<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <label for="dpm_billing_address" class="">Billing Address</label>-->
<!---->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_billing_address" id="dpm_billing_address">-->
<!--        </span>-->
<!--    </p>-->
<!---->
<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_card_billing_address_unit" id="dpm_card_billing_address_unit">-->
<!--        </span>-->
<!--    </p>-->
<!---->
<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_card_billing_address_city" id="dpm_card_billing_address_city" placeholder="City">-->
<!--        </span>-->
<!--    </p>-->
<!---->
<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_card_billing_address_state" id="dpm_card_billing_address_state" placeholder="State">-->
<!--        </span>-->
<!--    </p>-->
<!---->
<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_card_billing_address_post_code" id="dpm_card_billing_address_post_code" placeholder="Post Code">-->
<!--        </span>-->
<!--    </p>-->
<!---->
<!--    <p class="form-row address-field validate-postcode form-row-wide">-->
<!--        <span class="woocommerce-input-wrapper">-->
<!--            <input type="text" class="input-text" name="dpm_card_billing_address_country" id="dpm_card_billing_address_country" placeholder="Country">-->
<!--        </span>-->
<!--    </p>-->

    <?php if ( $is_3ds_enabled ) : ?>
    <div id="payments-sdk__contingency-lightbox"></div>
    <?php endif; ?>

</div>
