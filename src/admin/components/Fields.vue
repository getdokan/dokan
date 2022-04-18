<template>
    <div :class="[id, fieldData.common_class, `dokan-settings-field-type-${fieldData.type}`]" v-if="shouldShow">
        <template v-if="'sub_section' === fieldData.type">
            <div class="dokan-settings-sub-section">
                <h3 class="sub-section-title">{{ fieldData.label }}</h3>
                <p class="sub-section-description">
                    {{ fieldData.description }}
                </p>
            </div>
        </template>

        <template v-if="containCommonFields( fieldData.type )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <input
                            :type="fieldData.type || 'text'"
                            class="regular-text"
                            :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                            :id="sectionId + '[' + fieldData.name + ']'"
                            :name="sectionId + '[' + fieldData.name + ']'"
                            v-model="fieldValue[fieldData.name]"
                        >
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'number' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input
                                type="number"
                                :min="fieldData.min"
                                :max="fieldData.max"
                                :step="fieldData.step"
                                class="regular-text"
                                :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'"
                                v-model="fieldValue[fieldData.name]"
                            >
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'price' == fieldData.type && allSettingsValues.dokan_selling && 'combine' !== allSettingsValues.dokan_selling.commission_type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input
                                type="text"
                                :min="fieldData.min"
                                class="regular-text"
                                :class="{ wc_input_decimal: allSettingsValues.dokan_selling.commission_type=='percentage', 'wc_input_price': allSettingsValues.dokan_selling.commission_type=='flat' }"
                                :id="sectionId + '[' + fieldData.name + ']'"
                                :name="sectionId + '[' + fieldData.name + ']'"
                                v-model="fieldValue[fieldData.name]"
                            >
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'combine' == fieldData.type && haveCondition( fieldData ) && fieldData.condition.type == 'show' && checkConditionLogic( fieldData, fieldValue )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field combine_fields">
                        <div class="percent_fee">
                            <input type="text" class="wc_input_decimal regular-text" :id="sectionId + '[' + fieldData.name + ']' + '[' + 'percent_fee' + ']'" :name="sectionId + '[' + fieldData.fields.percent_fee.name + ']'" v-model="fieldValue[fieldData.fields.percent_fee.name]">
                            {{ '%' }}
                        </div>
                        <div class="fixed_fee">
                            {{ '+' }}
                            <input type="text" class="wc_input_price regular-text" :id="sectionId + '[' + fieldData.name + ']' + '[' + 'fixed_fee' + ']'" :name="sectionId + '[' + fieldData.fields.fixed_fee.name + ']'" v-model="fieldValue[fieldData.fields.fixed_fee.name]">
                        </div>
                    </div>
                </fieldset>
                <p class="dokan-error combine-commission" v-if="hasError( fieldData.fields.percent_fee.name ) && hasError( fieldData.fields.fixed_fee.name )">
                    {{ __( 'Both percentage and fixed fee is required.', 'dokan-lite' ) }}
                </p>
                <p v-else-if="hasError( fieldData.fields.percent_fee.name )" class="dokan-error combine-commission">
                    {{ getError( fieldData.fields.percent_fee.label ) }}
                </p>
                <p v-else-if="hasError( fieldData.fields.fixed_fee.name )" class="dokan-error combine-commission">
                    {{ getError( fieldData.fields.fixed_fee.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'textarea' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <textarea type="textarea" :rows="fieldData.rows" :cols="fieldData.cols" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]"></textarea>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'switcher' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <!-- <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]" true-value="on" false-value="off"> -->
                            <switches @input="onToggleSwitch" :enabled="this.checked === 'on' ? true : false" value="isChecked"></switches>
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'multicheck' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                    <div class="field multicheck_fields">
                        <template v-for="(optionVal, optionKey) in fieldData.options">
                            <label :class="isCurrentOptionChecked( optionKey ) ? 'checked' : ''" :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                                <span class="dashicons dashicons-yes"></span>
                                <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                                {{ optionVal }}
                            </label>
                        </template>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'disbursement_sub_section' === fieldData.type && ! hideWithdrawOption()">
            <div class="dokan-settings-sub-section">
                <h3 class="sub-section-title">{{ fieldData.label }}</h3>
                <p class="sub-section-description">
                    {{ fieldData.description }}
                    <a :href="fieldData.learn_more" class="learn-more-btn">
                        {{ __( 'Learn More', 'dokan-lite' ) }}
                    </a>
                </p>
            </div>
        </template>

        <template v-if="'disbursement_method' === fieldData.type && ! hideWithdrawOption()">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! showDisbursementType( 'schedule' ) ? 'field_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                    <div class="field multicheck_fields">
                        <template v-for="(optionVal, optionKey) in fieldData.options">
                            <label :class="isCurrentOptionChecked( optionKey ) ? 'checked' : ''" :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                                <span class="dashicons dashicons-yes"></span>
                                <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                                {{ optionVal }}
                            </label>
                        </template>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'disbursement_type' === fieldData.type && showDisbursementType( 'schedule' ) && ! hideWithdrawOption()">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! hideWithdrawOption() ? 'disbursment_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                    <div class="field multicheck_fields">
                        <template v-for="(optionVal, optionKey) in fieldData.options">
                            <label :class="isCurrentOptionChecked( optionKey ) ? 'checked' : ''" :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                                <span class="dashicons dashicons-yes"></span>
                                <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                                {{ optionVal }}
                            </label>
                        </template>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'schedule_quarterly' === fieldData.type && showSettingsField( 'quarterly' )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! hideWithdrawOption() ? 'disbursment_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                </fieldset>
                <div class="field quarter_schedule_fields">
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon" :id="sectionId + '[' + fieldData.name + ']'">{{ __( 'First Quarter', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][month]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['month']" v-on:change="setDisbursementQuarterlySettings">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.first" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Second Quarter', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" disabled v-model="disbursementSettings.quarterly.second">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.second" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Third Quarter', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" disabled v-model="disbursementSettings.quarterly.third">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.third" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Fourth Quarter', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" disabled v-model="disbursementSettings.quarterly.fourth">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.fourth" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="dokan-schedule-week-day-container">
                        <div class="col-3">
                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon">{{ __( 'Week', 'dokan-lite' ) }}</span>
                                <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][week]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['week']">
                                    <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                    <option v-for="( optionVal, optionKey ) in fieldData.options.week" :value="optionKey" v-html="optionVal"></option>
                                </select>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="dokan-input-group">
                                <span class="dokan-input-group-addon">{{ __( 'Day', 'dokan-lite' ) }}</span>
                                <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][days]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['days']">
                                    <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                    <option v-if="!( 'L' !== fieldValue[fieldData.name]['week'] && ( 'saturday' === optionKey || 'sunday'=== optionKey ) )" v-for="( optionVal, optionKey ) in fieldData.options.days" :value="optionKey" v-html="optionVal"></option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'schedule_monthly' === fieldData.type && showSettingsField(  'monthly' )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! hideWithdrawOption() ? 'disbursment_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                </fieldset>
                <div class="field monthly_schedule_fields">
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Week', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][week]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['week']">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.week" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Day', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][days]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['days']">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-if="!( 'L' !== fieldValue[fieldData.name]['week'] && ( 'saturday' === optionKey || 'sunday'=== optionKey ) )" v-for="( optionVal, optionKey ) in fieldData.options.days" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                </div>

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'schedule_biweekly' === fieldData.type && showSettingsField( 'biweekly')">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! hideWithdrawOption() ? 'disbursment_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                </fieldset>
                <div class="field biweekly_schedule_fields">
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon" :id="sectionId + '[' + fieldData.name + ']'">{{ __( 'First', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][week]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['week']" v-on:change="setDisbursementBiweeklySettings">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.first" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Second', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" disabled v-model="disbursementSettings.biweekly.second">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.second" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                    <div class="col-3">
                        <div class="dokan-input-group">
                            <span class="dokan-input-group-addon">{{ __( 'Day', 'dokan-lite' ) }}</span>
                            <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + '][days]'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]['days']">
                                <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                                <option v-for="( optionVal, optionKey ) in fieldData.options.days" :value="optionKey" v-html="optionVal"></option>
                            </select>
                        </div>
                    </div>
                </div>

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'schedule_weekly' === fieldData.type && showSettingsField( 'weekly' )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '', ! hideWithdrawOption() ? 'disbursment_bottom_styles' : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>
                    <div class="field">
                        <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                            <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                            <option v-for="( optionVal, optionKey ) in fieldData.options" :value="optionKey" v-html="optionVal"></option>
                        </select>

                        <select v-else class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                            <option v-if="fieldData.placeholder" value="" disabled v-html="fieldData.placeholder"></option>
                            <optgroup v-for="optionGroup in fieldData.options" :label="optionGroup.group_label">
                                <option v-for="option in optionGroup.group_values" :value="option.value" v-html="option.label" />
                            </optgroup>
                        </select>
                    </div>
                </fieldset>

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'select' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                            <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                            <option v-for="( optionVal, optionKey ) in fieldData.options" :value="optionKey" v-html="optionVal"></option>
                        </select>

                        <select v-else class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                            <option v-if="fieldData.placeholder" value="" disabled v-html="fieldData.placeholder"></option>
                            <optgroup v-for="optionGroup in fieldData.options" :label="optionGroup.group_label">
                                <option v-for="option in optionGroup.group_values" :value="option.value" v-html="option.label" />
                            </optgroup>
                        </select>

                        <RefreshSettingOptions
                            v-if="fieldData.refresh_options"
                            :section="sectionId"
                            :field="fieldData"
                            :toggle-loading-state="toggleLoadingState"
                        />
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'file' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field add_files">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input type="button" class="button wpsa-browse" value="Choose File" v-on:click.prevent="$emit( 'openMedia', { sectionId: sectionId, name: fieldData.name }, $event )">
                            <input type="text" class="regular-text wpsa-url" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'color' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field">
                        <color-picker v-model="fieldValue[fieldData.name]"></color-picker>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'html' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'warning' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 scope="row" class="field_heading dokan-setting-warning">
                            <div class="error">
                                <p :for="sectionId + '[' + fieldData.name + ']'"><span class="dokan-setting-warning-label"><span class="dashicons dashicons-warning"></span> {{ fieldData.label }}</span> <span class="dokan-setting-warning-msg">{{fieldData.desc}}</span></p>
                            </div>
                        </h3>
                    </div>
                </fieldset>
            </div>
        </template>

        <template v-if="'radio' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field radio_fields">
                        <template v-for="( optionVal, optionKey ) in fieldData.options">
                            <label :class="isCurrentOptionChecked( optionKey ) ? 'checked' : ''" :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                                <span class="dashicons dashicons-yes"></span>
                                <input
                                    type="radio"
                                    class="radio"
                                    :name="optionKey"
                                    :value="optionKey"
                                    v-model="fieldValue[fieldData.name]"
                                    :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'"
                                >
                                {{ optionVal }}
                            </label>
                        </template>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'wpeditor' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                </fieldset>
                <div class="field editor_field">
                    <text-editor v-model="fieldValue[fieldData.name]" v-html="fieldData.default"></text-editor>
                </div>
            </div>
        </template>

        <template v-if="'repeatable' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                    <div class="field repeatable_fields">
                        <input type="text" class="regular-text" v-model="repeatableItem[fieldData.name]">
                        <a href="#" class="button dokan-repetable-add-item-btn" @click.prevent="addItem( fieldData.type, fieldData.name )">
                            <span class="dashicons dashicons-plus-alt2"></span>
                        </a>
                    </div>
                </fieldset>
                <ul class="dokan-settings-repeatable-list">
                    <li v-if="fieldValue[fieldData.name]" v-for="(optionVal, optionKey) in fieldValue[fieldData.name]">
                        {{ optionVal.value }} <span v-if="!optionVal.must_use" class="dashicons dashicons-no-alt remove-item" @click.prevent="removeItem( optionKey, fieldData.name )"></span>
                        <span class="repeatable-item-description" v-html="optionVal.desc"></span>
                    </li>
                </ul>
            </div>
        </template>

        <template v-if="'radio_image' == fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                </fieldset>
                <div class="field radio-image-container">
                     <template v-for="( image, name ) in fieldData.options">
                        <label class="radio-image" :class="{ 'active' : fieldValue[fieldData.name] === name, 'not-active' : fieldValue[fieldData.name] !== name }">
                            <input type="radio" class="radio" :name="fieldData.name" v-model="fieldValue[fieldData.name]" :value="name">
                            <span class="current-option-indicator">
                                <span class="dashicons dashicons-yes"></span> 
                                {{ __( 'Active', 'dokan-lite' ) }}
                            </span>
                            <img :src="image">
                            <span class="active-option">
                                <button class="button button-primary button-hero" type="button" @click.prevent="fieldValue[fieldData.name] = name">
                                    {{ __( 'Select', 'dokan-lite' ) }}
                                </button>
                            </span>
                        </label>
                    </template>
                </div>
            </div>
        </template>

        <template v-if="'gmap' == fieldData.type && ! hideMap">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                </fieldset>
                <div class="field gmap-field">
                    <input type="hidden" :name="sectionId + '[' + fieldData.name + ']'" :value="mapLocation">
                    <Mapbox
                        v-if="mapApiSource === 'mapbox'"
                        @hideMap="onHideMap"
                        @updateMap="onUpdateMap"
                        :accessToken="mapboxAccessToken"
                        :location="mapLocation"
                        width="100%"
                        height="300px"
                    />
                    <GoogleMaps
                        v-else
                        @hideMap="onHideMap"
                        @updateMap="onUpdateMap"
                        :apiKey="googleMapApiKey"
                        :location="mapLocation"
                    />
                </div>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'social' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc" v-html="fieldData.desc"></p>
                    </div>
                </fieldset>
                <div class="field social_fields">
                    <div class="social_header">
                        <div class="social_contents">
                            <div class="social_icon">
                                <img :src="fieldData.icon_url" :alt="fieldData.label" />
                            </div>
                            <p class="social_desc">{{ fieldData.social_desc }}</p>
                        </div>
                        <div class="expand_btn" @click="expandSocial">
                            <span class="dashicons" v-bind:class="[ ! this.expandSocials ? 'dashicons-arrow-down-alt2' : 'dashicons-arrow-up-alt2']"></span>
                        </div>
                    </div>
                    <div class="social_info" v-if="expandSocials">
                        <template>
                            <div class="social_html" v-if="fieldData.app_label" v-bind:class="[fieldData.app_label.content_class ? fieldData.app_label.content_class : '']">   
                                <div class="html_contents">
                                    <h3 class="field_heading" scope="row">
                                        {{ fieldData.app_label.label }}
                                    </h3>
                                    <p class="field_desc" v-html="fieldData.app_label.desc"></p>
                                </div> 
                            </div>
                            <div class="social_html" v-if="fieldData.app_url" v-bind:class="[fieldData.app_url.content_class ? fieldData.app_url.content_class : '']">   
                                <div class="html_contents">
                                    <h3 class="field_heading" scope="row">
                                        {{ fieldData.app_url.label }}
                                    </h3>
                                    <p class="field_desc" v-html="fieldData.app_url.desc"></p>
                                </div> 
                                <div class="fields" v-if="fieldData.app_url">
                                    <input class='regular-text' type='text' disabled :value='fieldData.app_url.url'>
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_service_id">
                                <div class="html_contents" v-if="fieldData.app_service_id">
                                    <h3 class="field_heading" scope="row">{{ fieldData.app_service_id.label }}</h3>
                                    <p class="field_desc" v-html="fieldData.app_service_id.desc"></p>
                                </div>

                                <div class="fields" v-if="fieldData.app_service_id">
                                    <input
                                        type="text"
                                        class="regular-text"
                                        :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_service_id.name ) }, fieldData.app_service_id.class ]"
                                        :id="sectionId + '[' + fieldData.app_service_id.name + ']'"
                                        :name="sectionId + '[' + fieldData.app_service_id.name + ']'"
                                        v-model="fieldValue[fieldData.app_service_id.name]"
                                    >
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_id">
                                <div class="html_contents" v-if="fieldData.app_id">
                                    <h3 class="field_heading" scope="row">{{ fieldData.app_id.label }}</h3>
                                    <p class="field_desc" v-html="fieldData.app_id.desc"></p>
                                </div>
                                <div class="fields" v-if="fieldData.app_id">
                                    <input
                                        type="text"
                                        class="regular-text"
                                        :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_id.name ) }, fieldData.app_id.class ]"
                                        :id="sectionId + '[' + fieldData.app_id.name + ']'"
                                        :name="sectionId + '[' + fieldData.app_id.name + ']'"
                                        v-model="fieldValue[fieldData.app_id.name]"
                                    >
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_team_id">
                                <div class="html_contents" v-if="fieldData.app_team_id">
                                    <h3 class="field_heading" scope="row">{{ fieldData.app_team_id.label }}</h3>
                                    <p class="field_desc" v-html="fieldData.app_team_id.desc"></p>
                                </div>
                                <div class="fields" v-if="fieldData.app_team_id">
                                    <input
                                        type="text"
                                        class="regular-text"
                                        :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_team_id.name ) }, fieldData.app_team_id.class ]"
                                        :id="sectionId + '[' + fieldData.app_team_id.name + ']'"
                                        :name="sectionId + '[' + fieldData.app_team_id.name + ']'"
                                        v-model="fieldValue[fieldData.app_team_id.name]"
                                    >
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_key_id">
                                <div class="html_contents" v-if="fieldData.app_key_id">
                                    <h3 class="field_heading" scope="row">{{ fieldData.app_key_id.label }}</h3>
                                    <p class="field_desc" v-html="fieldData.app_key_id.desc"></p>
                                </div>
                                <div class="fields" v-if="fieldData.app_team_id">
                                    <div class="fields" v-if="fieldData.app_key_id">
                                        <input
                                            type="text"
                                            class="regular-text"
                                            :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_key_id.name ) }, fieldData.app_key_id.class ]"
                                            :id="sectionId + '[' + fieldData.app_key_id.name + ']'"
                                            :name="sectionId + '[' + fieldData.app_key_id.name + ']'"
                                            v-model="fieldValue[fieldData.app_key_id.name]"
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_secret" v-bind:class="[fieldData.app_secret.content_class ? fieldData.app_secret.content_class : '']">
                                <div class="html_contents">
                                    <h3 class="field_heading" scope="row">
                                        {{ fieldData.app_secret.label }}
                                    </h3>
                                    <p class="field_desc" v-html="fieldData.app_secret.desc"></p>
                                </div>
                                <div class="fields">
                                    <input
                                        v-if="fieldData.app_secret.type === 'text'"
                                        :type="fieldData.app_secret.type"
                                        class="regular-text"
                                        :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_secret.name ) }, fieldData.app_secret.class ]"
                                        :id="sectionId + '[' + fieldData.app_secret.name + ']'"
                                        :name="sectionId + '[' + fieldData.app_secret.name + ']'"
                                        v-model="fieldValue[fieldData.app_secret.name]"
                                    >
                                    <textarea
                                        v-if="fieldData.app_secret.type === 'textarea'"
                                        :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.app_secret.name ) }, fieldData.app_secret.class ]"
                                        :id="sectionId + '[' + fieldData.app_secret.name + ']'"
                                        :name="sectionId + '[' + fieldData.app_secret.name + ']'"
                                        v-model="fieldValue[fieldData.app_secret.name]"
                                    ></textarea>
                                </div>
                            </div>
                            <div class="social_text" v-if="fieldData.app_code_type" v-bind:class="[fieldData.app_code_type.content_class ? fieldData.app_code_type.content_class : '']">
                                <div class="html_contents">
                                    <h3 class="field_heading" scope="row">
                                        {{ fieldData.app_code_type.label }}
                                    </h3>
                                    <p class="field_desc" v-html="fieldData.app_code_type.desc"></p>
                                </div>
                                <div class="fields radio_fields">
                                    <template v-for="( optionVal, optionKey ) in fieldData.app_code_type.options">
                                        <label :class="isSocialOptionChecked( optionKey, 'app_code_type' ) ? 'checked' : ''" :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                                            <span class="dashicons dashicons-yes"></span>
                                            <input
                                                :type="fieldData.app_code_type.type"
                                                :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'"
                                                class="radio"
                                                :name="optionKey"
                                                v-model="fieldValue[fieldData.app_code_type.name]"
                                                :value="optionKey"
                                            >
                                            {{ optionVal }}
                                        </label>
                                    </template>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </template>

        <template v-if="'day_timer' === fieldData.type" >
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 class="field_heading" scope="row">
                            {{ fieldData.label }}
                        </h3>
                        <p class="field_desc">{{ fieldData.desc }}</p>
                    </div>

                    <div class="field dokan-settings-fieldset-weekly-switcher" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                        <fieldset>
                            <div class="working-status">
                                <switches @input="onToggleDeliverySwitch" :enabled="toggleActive ? true : false" :value="toggleActive ? 'enabled' : ''"></switches>
                            </div>
                            <div class="times">
                                <div class='time' v-show="toggleActive && fullDay">
                                    <div class="clock-picker" @click="addFullDay">
                                        <span class="dashicons dashicons-clock"></span>
                                        <input
                                            type="text"
                                            class="dokan-clock-control dokan-form-control"
                                            :value="fullHours"
                                            @click="onTimerSwitch( fieldData.name, '', $event )"
                                            @blur="onTimerBlur"
                                        >
                                    </div>
                                </div>
                                <div class='time' v-show="toggleActive && ! fullDay">
                                    <div class="clock-picker" @click="addFullDay">
                                        <span
                                            class="dashicons dashicons-clock"
                                            :class="[ { 'dokan-clock-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                        ></span>
                                        <input
                                            type="text"
                                            class="dokan-clock-control dokan-form-control opening-time"
                                            :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                            :name="sectionId + '[' + fieldData.name + '][' + fieldData.options['opening_time'] + ']'"
                                            :id="sectionId + '[' + fieldData.name + '][' + fieldData.options.opening_time + ']'"
                                            v-model="fieldValue[fieldData.name][fieldData.options['opening_time']]"
                                            :placeholder="__( 'Opens at', 'dokan-lite' )"
                                            @click="onTimerSwitch( fieldData.name, 'opening_time', $event )"
                                            @blur="onTimerBlur"
                                        >
                                    </div>
                                </div>
                                <div v-show="toggleActive && ! fullDay">
                                    <span class="time-to dashicons dashicons-minus"></span>
                                </div>
                                <div class='time' v-show="toggleActive && ! fullDay">
                                    <div class="clock-picker" @click="addFullDay">
                                        <span
                                            class="dashicons dashicons-clock"
                                            :class="[ { 'dokan-clock-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                        ></span>
                                        <input
                                            type="text"
                                            class="dokan-clock-control dokan-form-control closing-time"
                                            :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                            :name="sectionId + '[' + fieldData.name + '][' + fieldData.options['closing_time'] + ']'"
                                            :id="sectionId + '[' + fieldData.name + '][' + fieldData.options.closing_time + ']'"
                                            v-model="fieldValue[fieldData.name][fieldData.options['closing_time']]"
                                            :placeholder="__( 'Closed at', 'dokan-lite' )"
                                            @click="onTimerSwitch( fieldData.name, 'closing_time', $event )"
                                            @blur="onTimerBlur"
                                        >
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </fieldset>
                <fieldset>
                    <p v-if="hasError( fieldData.name )" class="dokan-error">
                        {{ getError( fieldData.label ) }}
                    </p>
                    <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                        {{ getValidationErrorMessage( fieldData.name ) }}
                    </p>
                </fieldset>
            </div>
        </template>
    </div>
</template>

<script>
    import $ from 'jquery';
    import colorPicker from "admin/components/ColorPicker.vue";
    import Switches from "admin/components/Switches.vue";
    let TextEditor = dokan_get_lib('TextEditor');
    let GoogleMaps = dokan_get_lib('GoogleMaps');
    let Mapbox = dokan_get_lib('Mapbox');
    let RefreshSettingOptions = dokan_get_lib('RefreshSettingOptions');

    export default {
        name: 'Fields',

        components: {
            Mapbox,
            Switches,
            TextEditor,
            GoogleMaps,
            colorPicker,
            RefreshSettingOptions,
        },

        props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors'],

        data() {
            return {
                repeatableItem: {},
                hideMap: false,
                expandSocials: false,
                checked: this.isChecked(),
                fullDay: this.checkFullDay(),
                fullHours: '24 hours',
                toggleActive: this.checkWorkingStatus(),
                repeatableTime: [],
                yourStringTimeValue: '',
                disbursementSettings: {
                    quarterly: {
                        second: '',
                        third: '',
                        fourth: '',
                    },
                    biweekly: {
                        second: '',
                    },
                    visible: [],
                },
            }
        },
        mounted() {
            this.setDisbursementQuarterlySettings();
            this.setDisbursementBiweeklySettings();
        },

    computed: {
        shouldShow() {
            let shouldShow = true;

            if ( this.fieldData.show_if ) {
                const conditions = this.fieldData.show_if;
                const dependencies = Object.keys( conditions );

                let i = 0;

                for ( i = 0; i < dependencies.length; i++ ) {
                    const dependency = dependencies[i];
                    const [ optionId, sectionId = this.sectionId ] = dependency.split( '.' ).reverse();
                    const dependencyValue = this.allSettingsValues[ sectionId ][ optionId ];
                    const [ operator, value ] = _.chain( conditions[ dependency ] ).pairs().first().value();

                    switch ( operator ) {
                        case 'greater_than':
                            if ( ! (dependencyValue > value ) ) {
                                shouldShow = false;
                            }
                            break;

                        case 'greater_than_equal':
                            if ( ! (dependencyValue >= value ) ) {
                                shouldShow = false;
                            }
                            break;

                        case 'less_than':
                            if ( ! (dependencyValue < value ) ) {
                                shouldShow = false;
                            }
                            break;

                        case 'less_than':
                            if ( ! (dependencyValue <= value ) ) {
                                shouldShow = false;
                            }
                            break;

                        case 'contains':
                            if ( ! Object.values(dependencyValue).includes( value ) ) {
                                shouldShow = false;
                            }
                            break;

                        case 'equal':
                        default:
                            if ( dependencyValue != value ) {
                                shouldShow = false;
                            }
                            break;
                    }

                    if ( ! shouldShow ) {
                        break;
                    }
                }
            }

            return shouldShow;
        },

        mapApiSource() {
            return this.allSettingsValues?.dokan_appearance?.map_api_source;
        },

        mapLocation() {
            let location = {
                ...{
                    latitude: 23.709921,
                    longitude: 90.40714300000002,
                    address: 'Dhaka',
                    zoom: 10
                },

                ...this.fieldValue[ this.fieldData.name ],
            };

            location = {
                latitude: parseFloat( location.latitude ),
                longitude: parseFloat( location.longitude ),
                address: `${location.address}`,
                zoom: parseInt( location.zoom ),
            };

            return location;
        },

        googleMapApiKey() {
            return this.allSettingsValues?.dokan_appearance?.gmap_api_key;
        },

        mapboxAccessToken() {
            return this.allSettingsValues?.dokan_appearance?.mapbox_access_token;
        }
    },

    beforeMount() {
        if ( 'multicheck' === this.fieldData.type && ! this.fieldValue[ this.fieldData.name ] ) {
            this.fieldValue[ this.fieldData.name ] = this.fieldData.default;
        }
    },

    mounted() {
        $( document ).ready( function() {
            let timeControl = $( 'body' ).find( 'input.dokan-clock-control' );

            timeControl.each( function() {
                $( this ).timepicker( {
                    step          : 30,
                    timeFormat    : dokan_helper.i18n_time_format,
                    scrollDefault : 'now',
                });
            });
            
        });
    },

    methods: {
        containCommonFields( type ) {
            return _.contains( [ undefined, 'text', 'email', 'url', 'phone', 'time' ], type );
        },

        addItem( type, name ) {
            this.fieldValue[name] = this.fieldValue[name] || [];

            if ( typeof this.repeatableItem[name] == 'undefined' || ! this.repeatableItem[name] )  {
                return;
            }

            this.fieldValue[name].push( {
                    id : this.repeatableItem[name].trim().replace(/\s+/g, '_').toLowerCase(),
                    value : this.repeatableItem[name]
                }
            );
            this.repeatableItem[name] = '';
        },

        removeItem( optionVal, name ) {
            this.fieldValue[name].splice( optionVal, 1 );
        },

        haveCondition( fieldData ) {
            return fieldData.hasOwnProperty( 'condition' );
        },

        checkConditionLogic( fieldData, fieldValue ) {
            var logic = fieldData.condition.logic;
            var isValid = false;

            _.each( logic, function( value, key ) {
                if ( _.contains( value, fieldValue[key] ) ) {
                    isValid = true;
                }
            } );

            return isValid;
        },

        onHideMap( hideMap ) {
            this.hideMap = hideMap;
        },

        onUpdateMap( payload ) {
            this.fieldValue[this.fieldData.name] = { ...this.mapLocation, ...payload };
        },

        onToggleSwitch( status, key ) {
            if ( 'isChecked' !== key ) {
                return;
            }

            if ( status ) {
                this.checked                         = 'on';
                this.fieldValue[this.fieldData.name] = 'on';
                return;
            }

            this.checked                         = 'off';
            this.fieldValue[this.fieldData.name] = 'off';
        },

        isChecked() {
            return ! this.fieldValue[this.fieldData.name] ? this.fieldData.default : this.fieldValue[this.fieldData.name];
        },

        isSocialChecked() {
            return ! this.fieldValue[this.fieldData.name] ? this.fieldData.default : this.fieldValue[this.fieldData.name];
        },

        isCurrentOptionChecked( optionKey ) {
            if (
                'multicheck' === this.fieldData.type ||
                'disbursement_method' === this.fieldData.type ||
                'disbursement_type' === this.fieldData.type
            ) {
                return ! this.fieldValue[this.fieldData.name][optionKey] ? false : true;
            }

            if ( 'radio' === this.fieldData.type ) {
                return this.fieldValue[this.fieldData.name] === optionKey ? true : false;
            }

            return false;
        },

        isSocialOptionChecked( optionKey, fieldName ) {
            if ( 'radio' === this.fieldData[fieldName].type ) {
                return this.fieldValue[this.fieldData[fieldName].name] === optionKey ? true : false;
            }

            return false;
        },

        expandSocial() {
            this.expandSocials = ! this.expandSocials;
        },

        getSocialValue( optionValue ) {
            this.fieldValue[optionValue.name] = this.fieldValue[optionValue.name] ? this.fieldValue[optionValue.name] : '';
        },

        checkFullDay() {
            if ( ! this.fieldData?.current_day?.opening_time || ! this.fieldData?.current_day?.closing_time ) {
                return false;
            }

            let opening_time = dokan_get_formatted_time( '12:00 am', 'h:i' ),
                closing_time = dokan_get_formatted_time( '11:59 pm', 'h:i' );

            let setted_opening_time = dokan_get_formatted_time( this.fieldData.current_day.opening_time, 'h:i' ),
                setted_closing_time = dokan_get_formatted_time( this.fieldData.current_day.closing_time, 'h:i' );

            return setted_opening_time === opening_time && setted_closing_time === closing_time;
        },

        checkWorkingStatus() {
            return this.fieldData?.current_day?.delivery_status && this.fieldData?.day && this.fieldData.current_day.delivery_status === this.fieldData.day;
        },

        addFullDay() {
            let timepicker_first_option = $( '.ui-timepicker-list' ).find( 'li:first' );

            if ( ! timepicker_first_option.hasClass( 'ui-timepicker-all-day' ) ) {
                $( '.ui-timepicker-list' ).prepend( '<li class="ui-timepicker-all-day">24 hours</li>' );
            }
        },

        onTimerSwitch( fieldName, fieldKey, e ) {
            e.stopPropagation();

            let self                    = this,
                timepicker_first_option = $( '.ui-timepicker-list' ).find( 'li:first' );

            if ( ! timepicker_first_option.hasClass( 'ui-timepicker-all-day' ) ) {
                $( '.ui-timepicker-list' ).prepend( '<li class="ui-timepicker-all-day">24 hours</li>' );
            }

            $( e.target ).on( 'changeTime', function() {
                let root = $( this );

                self.fullDay = false;
                self.fieldValue[fieldName][fieldKey] = root.val();

                if ( ! root.val() || '24 hours' === root.val() ) {
                    root.val( '24 hours' );
                    self.fullDay = true;
                    self.fieldValue[fieldName]['opening_time'] = dokan_get_formatted_time( '12:00 am', dokan_get_i18n_time_format() );
                    self.fieldValue[fieldName]['closing_time'] = dokan_get_formatted_time( '11:59 pm', dokan_get_i18n_time_format() );
                }

                if ( ! fieldKey ) {
                    self.fullDay = false;
                    self.fieldValue[fieldName]['opening_time'] = dokan_get_formatted_time( '12:00 am', dokan_get_i18n_time_format() );
                    self.fieldValue[fieldName]['closing_time'] = dokan_get_formatted_time( '11:30 pm', dokan_get_i18n_time_format() );
                    root.val( '24 hours' );
                }
            } );
        },

        onTimerBlur( e ) {
            let timepicker_first_option = $( '.ui-timepicker-list' ).find('li:first');
            if ( timepicker_first_option.hasClass( 'ui-timepicker-all-day' ) ) {
                timepicker_first_option.remove();
            }
        },

        onToggleDeliverySwitch( status ) {
            if ( status ) {
                this.toggleActive = true;
                this.fieldValue[this.fieldData.name]['delivery_status'] = this.fieldData.day;
                return;
            }

            this.toggleActive = false;
            this.fieldValue[this.fieldData.name]['delivery_status'] = '';
        },

        hasError( key ) {
            let errors = this.errors;

            if ( ! errors || typeof errors === 'undefined' ) {
                return false;
            }

            if ( errors.length < 1 ) {
                return false;
            }

            if ( errors.includes( key ) ) {
                return key;
            }
        },

        getError( label ) {
            return label + ' ' + this.__( 'is required.', 'dokan-lite' )
        },

        hasValidationError( key ) {
            if ( this.validationErrors.filter( e => e.name === key ).length > 0 ) {
                return key;
            }
        },

        getValidationErrorMessage( key ) {
            let errorMessage = '';
            this.validationErrors.forEach( obj => {
                if ( obj.name === key ) {
                    errorMessage = obj.error;
                }
            } );

              return errorMessage;
            },

            setDisbursementQuarterlySettings() {
                if (  ! ( 'quarterly_schedule' in this.fieldValue ) ) {
                    return;
                }
                if ( this.fieldValue['quarterly_schedule']['month'] === 'january' ) {
                    this.disbursementSettings.quarterly.second = 'april';
                    this.disbursementSettings.quarterly.third = 'july';
                    this.disbursementSettings.quarterly.fourth = 'october';
                } else if ( this.fieldValue['quarterly_schedule']['month'] === 'february' ) {
                    this.disbursementSettings.quarterly.second = 'may';
                    this.disbursementSettings.quarterly.third = 'august';
                    this.disbursementSettings.quarterly.fourth = 'november';
                } else if ( this.fieldValue['quarterly_schedule']['month'] === 'march' ) {
                    this.disbursementSettings.quarterly.second = 'june';
                    this.disbursementSettings.quarterly.third = 'september';
                    this.disbursementSettings.quarterly.fourth = 'december';
                }
            },

            setDisbursementBiweeklySettings() {
                if (  ! ( 'biweekly_schedule' in this.fieldValue ) ) {
                    return;
                }
                if ( this.fieldValue['biweekly_schedule']['week'] === '1' ) {
                    this.disbursementSettings.biweekly.second = '3';
                } else if ( this.fieldValue['biweekly_schedule']['week'] === '2' ) {
                    this.disbursementSettings.biweekly.second = '4';
                }
            },

            showSettingsField( fieldKey ) {
                return ! this.hideWithdrawOption() && ( fieldKey in this.fieldValue['disbursement_schedule'] ) && this.fieldValue['disbursement_schedule'][fieldKey] !== '' && this.showDisbursementType('schedule');
            },

            showDisbursementType( fieldKey ) {
                return ( fieldKey in this.fieldValue['disbursement'] ) && this.fieldValue['disbursement'][fieldKey] !== '';
            },

            hideWithdrawOption() {
                return ( 'hide_withdraw_option' in this.fieldValue ) && this.fieldValue['hide_withdraw_option'] === 'on';
            },
        }
    };
</script>

<style lang="less">
    span.repeatable-item-description {
        color: #999;
        font-size: 11px;
        font-style: italic;
    }
    ul.dokan-settings-repeatable-list {
        display: flex;
        padding: 20px 0 0 20px;
        flex-wrap: wrap;
        text-align: right;
        justify-content: right;

        li {
            color: rgba(0, 0, 0, 0.87);
            border: 1px solid rgba(0, 0, 0, 0.25);
            padding: 5px 12px;
            display: flex;
            font-size: 13px;
            box-sizing: border-box;
            background: rgba(182, 206, 254, 0.38);
            margin-top: 6px;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            align-items: center;
            margin-left: 12px;
            font-family: 'Roboto', sans-serif;
            line-height: 1;
            border-radius: 8px;
            justify-content: center;

            span.remove-item{
                color: #fff;
                width: 15px;
                margin: 0;
                height: 15px;
                cursor: pointer;
                font-size: 15px;
                background: #1aa0f7;
                padding-top: 0;
                margin-left: 5px;
                border-radius: 50%;
            }
        }
    }
    .dokan-repetable-add-item-btn {
        font-size: 16px !important;
        font-weight: bold !important;
        height: 25px !important;
        line-height: 22px !important;
    }

    .percent_fee, .fixed_fee {
        display: inline-block;
    }
    .percent_fee input, .fixed_fee input {
        width: 60px;
    }
    .additional_fee .description {
        margin-left: 10px;
        margin-top: -10px;
    }
    .dokan-error {
        color: red;
        margin-top: .5em;
        font-style: italic;
        margin-bottom: 0;
    }

    .dokan-input-validation-error {
      border-color: red !important;
    }

    .dokan-error.combine-commission {
        margin-left: 10px;
    }
    .dokan-settings-sub-section {
        margin: 50px 0 22px 0;

        .sub-section-title {
            margin: 0;
            font-size: 22px;
            font-family: Roboto, sans-serif;
            font-weight: 600;
            line-height: 26px;
            margin-bottom: 8px;
        }

        .sub-section-description {
            margin: 0;
            font-size: 15px;
            font-weight: 300;
            line-height: 21px;
            font-family: Roboto, sans-serif;

            .learn-more-btn {
                cursor: pointer;
                text-decoration: none;
            }
        }
    }
    .field_contents.field_top_styles {
        margin-top: 30px;
        border-top: 1px solid #b0a7a7;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }
    .field_contents.field_bottom_styles {
        margin-bottom: 35px;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
    .field_contents {
        border: 1px solid #B0A7A7;
        padding: 14px 30px 18px 27px;
        border-top: 0;
        background: rgba(244, 246, 250, 0.17);

        fieldset {
            display: flex;
            justify-content: space-between;

            .field_data {
                flex: 2;

                .field_heading {
                    color: #000000;
                    margin: 0;
                    font-size: 17px;
                    font-style: normal;
                    font-weight: 600;
                    line-height: 35px;
                    font-family: 'Roboto', sans-serif;
                }

                .field_desc {
                    color: #000;
                    margin: 0;
                    font-size: 13px;
                    font-style: normal;
                    font-weight: 300;
                    line-height: 17px;
                    font-family: 'Roboto', sans-serif;
                }
            }
        }

        .combine_fields {
            display: flex;
            justify-content: right;

            .percent_fee {
                padding-right: 10px;
            }

            .fixed_fee,
            .percent_fee {
                input {
                    width: 100px;
                }
            }
        }

        .multicheck_fields {
            label {
                color: #000;
                margin: 6px 0 6px 8px;
                border: 1px solid rgba(0, 0, 0, 0.25);
                display: inline-block;
                padding: 10px 15px;
                font-size: 12px;
                background: #fff;
                font-style: normal;
                box-sizing: border-box;
                text-align: center;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                line-height: 14px;
                font-family: 'Roboto', sans-serif;
                border-radius: 8px;

                &:hover {
                    color: rgba(3, 58, 163, 0.85);
                    border: 1px solid rgba(3, 58, 163, 0.81);
                    background: rgba(182, 206, 254, 0.38);
                    box-sizing: border-box;
                    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                }
            }
        }
        
        .editor_field {
            margin-top: 20px;
        }

        .radio_fields {
            label {
                border: 0.882967px solid #B0A7A7;
                padding: 10px 15px;
                display: inline-block;
                overflow: hidden;
                font-size: 12px;
                box-shadow: 0px 3.53187px 3.53187px rgba(0, 0, 0, 0.25);
                font-family: 'Roboto', sans-serif;
                font-weight: 400;
                line-height: 14px;
                border-right: 0;

                &:first-child {
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                }

                &:last-child {
                    border-right: 0.882967px solid #B0A7A7;
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                }

                &:hover {
                    color: rgba(3, 58, 163, 0.85);
                    background: rgba(182, 206, 254, 0.38);
                    box-sizing: border-box;
                    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                    border-color: rgba(3, 58, 163, 0.81);
                }
            }

            .checked {
                color: rgba(3, 58, 163, 0.85);
                border: 1px solid rgba(3, 58, 163, 0.81);
                background: rgba(182, 206, 254, 0.38);
                box-sizing: border-box;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            }
        }

        .repeatable_fields {
            display: flex;
            align-items: center;
            justify-content: right;

            .dokan-repetable-add-item-btn {
                color: #fff;
                width: 25px;
                border: 0;
                padding: 0;
                position: relative;
                background: #2196F3;
                min-height: 25px;
                margin-left: 8px;
                border-radius: 50%;

                .dashicons-plus-alt2 {
                    top: 50%;
                    left: 50%;
                    position: absolute;
                    transform: translate(-50%, -50%);
                    font-size: 18px;
                }
            }
        }

        .dokan-setting-warning {
            padding: 10px 10px 10px 0;

            .dokan-setting-warning-label {
                color: #d63638;
                font-weight: bold;
            }

            .dashicons {
                margin: 0px;
                padding: 0px;
            }

            .dokan-setting-warning-msg {
                font-weight: 300;
            }
        }

        .add_files {
            display: flex;
            align-items: center;
            justify-content: right;
        }

        .field {
            flex: 2;
            align-self: center;
            text-align: right;

            .switch {
                display: inline-block;
            }

            input[type='radio'],
            input[type='checkbox'] {
                display: none;
            }

            select,
            textarea,
            input[type='text'],
            input[type='number'],
            input[type='button'] {
                border: 0.957434px solid #686666;
                max-width: 240px;
                min-height: 32px;
                box-shadow: 0px 3.82974px 3.82974px rgba(0, 0, 0, 0.25);
                border-radius: 5px;
            }

            select,
            textarea {
                width: 100%;
            }

            .checked {
                color: rgba(3, 58, 163, 0.85);
                border: 1px solid rgba(3, 58, 163, 0.81);
                background: rgba(182, 206, 254, 0.38);
                box-sizing: border-box;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

                .dashicons-yes {
                    display: inline-block;
                }
            }

            .dashicons-yes {
                color: #fff;
                width: 15px;
                height: 15px;
                margin: -1px 3px 0 0;
                cursor: pointer;
                display: none;
                font-size: 15px;
                background: #1aa0f7;
                padding-top: 0;
                border-radius: 50%;
            }
        }

        .social_fields {
            margin: 15px 0 4px 0px;
            border: 0.82px solid #E5E5E5;
            padding: 10px 25px;
            background: rgba(220, 232, 254, 0.38);
            box-shadow: 0px 3.28px 3.28px rgba(0, 0, 0, 0.25);
            border-radius: 6.56px;

            .social_header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .social_contents {
                    flex: 2;
                    display: flex;
                    align-items: center;

                    .social_icon {
                        flex: 1.3;
                        text-align: left;
                        align-self: center;

                        img {
                            width: 48px;
                            height: 48px;
                        }

                        span {
                            font-size: 50px;
                        }
                    }

                    .social_desc {
                        flex: 6;
                        color: #000000;
                        font-size: 14px;
                        text-align: left;
                        font-style: normal;
                        font-weight: 300;
                        line-height: 20px;
                        font-family: 'Roboto', sans-serif;
                    }
                }

                .expand_btn {
                    flex: 2;

                    span {
                        color: #fff;
                        width: 30px;
                        cursor: pointer;
                        margin: 0;
                        border: 0;
                        padding: 0;
                        position: relative;
                        font-size: 20px;
                        background: #2196f3;
                        min-height: 30px;
                        border-radius: 50%;

                        &:before {
                            top: 50%;
                            left: 50%;
                            position: absolute;
                            transform: translate(-50%, -50%);
                        }
                    }
                }
            }

            .social_info {
                background: #fff;

                .social_text,
                .social_html {
                    border: 1px solid #b0a7a7;
                    display: flex;
                    padding: 10px 30px 15px 27px;
                    border-top: 0;
                    background: rgba(244,246,250,.17);
                    justify-content: space-between;

                    .html_contents {
                        flex: 3;
                        text-align: left;

                        .field_heading {
                            color: #000;
                            margin: 0;
                            font-size: 15px;
                            font-style: normal;
                            font-weight: 600;
                            line-height: 30px;
                            font-family: Roboto,sans-serif;
                        }

                        .field_desc {
                            color: #000;
                            margin: 0;
                            font-size: 13px;
                            font-style: normal;
                            font-weight: 300;
                            line-height: 17px;
                            font-family: Roboto,sans-serif;
                        }
                    }

                    .fields {
                        flex: 2;
                        align-self: center;
                        text-align: right;

                        .checked {
                            color: rgba(3, 58, 163, 0.85);
                            border: 1px solid rgba(3, 58, 163, 0.81);
                            background: rgba(182, 206, 254, 0.38);
                            box-sizing: border-box;
                            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

                            .dashicons-yes {
                                display: inline-block;
                            }
                        }
                    }
                }

                .field_top_styles {
                    margin-top: 15px;
                    border-top: 1px solid #b0a7a7;
                    border-top-left-radius: 5px;
                    border-top-right-radius: 5px;
                }

                .field_bottom_styles {
                    margin-bottom: 10px;
                    border-bottom-left-radius: 5px;
                    border-bottom-right-radius: 5px;
                }
            }
        }

        .quarter_schedule_fields,
        .monthly_schedule_fields,
        .biweekly_schedule_fields {
            margin-top: 20px;
            text-align: left;

            span {
                font-weight: 600;
                font-family: Roboto, sans-serif;
                color: #000;
            }

            select {
                margin-top: 5px;
            }
        }

        .gmap-field {
            text-align: left;

            .mapbox-wrapper {
                .address-input {
                    color: #000;
                    margin: 20px 0;
                    font-size: 15px;

                    input {
                        width: 100%;
                        margin: 5px 0 3px;
                        display: block;
                        max-width: 320px;
                        font-weight: 400;
                    }
                }
            }

            .gmap-wrap {
                .search-address {
                    color: #000;
                    margin: 20px 0;
                    max-width: 320px;
                }
            }
        }
    }
    .dokan-settings-field-type-radio {

        fieldset {
            & > label:not(:last-child) {
                margin-right: 12px !important;

                & > input[type="radio"] {
                    margin-right: 2px;
                }
            }
        }
    }
    .col-3 {
        width: 24.5%;
        display: inline-block;

        select {
            width: 100%;
        }
    }
    .dokan-schedule-week-day-container {
        padding-top: 15px;
    }
    .dokan-settings-field-type-day_timer {
        fieldset {
            align-items: center;

            .working-status {
                flex: .6;
                text-align: left;
            }

            .field_data {
                flex: 1.6;
            }
    
            .field {
                flex: 2.2;

                .times {
                    display: flex;
                    align-items: center;
                    flex: 3;
        
                    .time-to {
                        margin: 0 1rem;
                        align-self: baseline;
                        font-size: 18px;
                        color: #666;
                    }
        
                    .clock-picker {
                        width: 9.375rem;
                        display: flex;
                        position: relative;
                        overflow: hidden;
                        box-shadow: 0px 3.82974px 3.82974px rgba(0, 0, 0, 0.25);
                        align-items: center;
        
                        .dashicons-clock {
                            margin: 0 0.483rem 0 0.738rem;
                            bottom: 6px;
                            display: block;
                            position: absolute;
                        }
        
                        .fa-exclamation-triangle {
                            right: 0.483rem;
                            color: #ffd500;
                            bottom: 8px;
                            position: absolute;
                        }
        
                        .dokan-form-control {
                            width: 100%;
                            padding-left: 42px;
                        }

                        .dokan-clock-error {
                            color: red;
                        }
                    }
                }
            }
        }
    }
    .ui-timepicker-wrapper {
        width: 150px !important;
        max-height: 230px !important;
        border-radius: 5px;

        ul.ui-timepicker-list {
            li {
                padding: 8px 25px;

                &:hover {
                    background-color: #8d93993b;
                    color: #000;
                }
            }

            .ui-timepicker-selected {
                background-color: #8d93993b;
                color: #000;
            }

            .ui-timepicker-all-day {
                padding: 10px 25px !important;
                border-bottom: 1px solid #ccc;
                margin-top: 6px;
            }
        }

        &::-webkit-scrollbar {
            width: 10px;
        }
        
        &::-webkit-scrollbar-thumb {
            background: #8d9399;
            border-radius: 5px;
        }
        
        &::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    }
</style>
