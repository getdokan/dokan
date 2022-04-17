<template>
    <tr :class="[id, `dokan-settings-field-type-${fieldData.type}`]" v-if="shouldShow">
        <template v-if="'sub_section' === fieldData.type">
            <th colspan="3" class="dokan-settings-sub-section-title">
                <label>{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data"></td>
        </template>

        <template v-if="containCommonFields( fieldData.type )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">

                <input
                    :type="fieldData.type || 'text'"
                    class="regular-text"
                    :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                    :id="sectionId + '[' + fieldData.name + ']'"
                    :name="sectionId + '[' + fieldData.name + ']'"
                    v-model="fieldValue[fieldData.name]"
                >
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'number' === fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <input type="number" :min="fieldData.min" :max="fieldData.max" :step="fieldData.step" class="regular-text"
                       :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                       :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'"
                       v-model="fieldValue[fieldData.name]">
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'price' == fieldData.type && allSettingsValues.dokan_selling && 'combine' !== allSettingsValues.dokan_selling.commission_type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <input type="text" :min="fieldData.min" class="regular-text" :class="{ wc_input_decimal: allSettingsValues.dokan_selling.commission_type=='percentage', 'wc_input_price': allSettingsValues.dokan_selling.commission_type=='flat' }" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'combine' == fieldData.type && haveCondition( fieldData ) && fieldData.condition.type == 'show' && checkConditionLogic( fieldData, fieldValue )">
                <th scope="row">
                    <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
                </th>

            <td class="tooltips-data combine-tips-style"></td>

            <td class="percent_fee">
                <input type="text" class="wc_input_decimal regular-text" :id="sectionId + '[' + fieldData.name + ']' + '[' + 'percent_fee' + ']'" :name="sectionId + '[' + fieldData.fields.percent_fee.name + ']'" v-model="fieldValue[fieldData.fields.percent_fee.name]">
                {{ '%' }}
            </td>

            <td class="fixed_fee">
                {{ '+' }}
                <input type="text" class="wc_input_price regular-text" :id="sectionId + '[' + fieldData.name + ']' + '[' + 'fixed_fee' + ']'" :name="sectionId + '[' + fieldData.fields.fixed_fee.name + ']'" v-model="fieldValue[fieldData.fields.fixed_fee.name]">
            </td>

            <p class="dokan-error combine-commission" v-if="hasError( fieldData.fields.percent_fee.name ) && hasError( fieldData.fields.fixed_fee.name )">
                {{ __( 'Both percentage and fixed fee is required.', 'dokan-lite' ) }}
            </p>

            <p v-else-if="hasError( fieldData.fields.percent_fee.name )" class="dokan-error combine-commission">
                {{ getError( fieldData.fields.percent_fee.label ) }}
            </p>

            <p v-else-if="hasError( fieldData.fields.fixed_fee.name )" class="dokan-error combine-commission">
                {{ getError( fieldData.fields.fixed_fee.label ) }}
            </p>

            <p class="description" v-html="fieldData.desc"></p>
        </template>

        <template v-if="'textarea' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <textarea type="textarea" :rows="fieldData.rows" :cols="fieldData.cols" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]"></textarea>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
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
                            <switches @input="onToggleSwitch" :enabled="this.checked === 'on' ? true : false" value="isChecked"></switches>
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </td>
        </template>

        <template v-if="'multicheck' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <template v-for="(optionVal, optionKey) in fieldData.options">
                        <label :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                            <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                            {{ optionVal }}
                        </label>
                        <br>
                    </template>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </td>
        </template>

        <template v-if="'disbursement_sub_section' === fieldData.type && ! hideWithdrawOption()">
            <th colspan="3" class="dokan-settings-sub-section-title">
                <label>{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data"></td>
        </template>

        <template v-if="'disbursement_method' === fieldData.type && ! hideWithdrawOption()">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
                <fieldset>
                    <template v-for="(optionVal, optionKey) in fieldData.options">
                        <label :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                            <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                            {{ optionVal }}
                        </label>
                        <br>
                    </template>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </td>
        </template>

        <template v-if="'disbursement_type' === fieldData.type && showDisbursementType( 'schedule') && ! hideWithdrawOption()">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
                <fieldset>
                    <template v-for="(optionVal, optionKey) in fieldData.options">
                        <label :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                            <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" :name="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" v-model="fieldValue[fieldData.name][optionKey]" :true-value="optionKey" false-value="">
                            {{ optionVal }}
                        </label>
                        <br>
                    </template>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </td>
        </template>

        <template v-if="'schedule_quarterly' === fieldData.type && showSettingsField(  'quarterly' )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
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

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>

                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'schedule_monthly' === fieldData.type && showSettingsField(  'monthly' )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
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

                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>

                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'schedule_biweekly' === fieldData.type && showSettingsField( 'biweekly')">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
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


                <RefreshSettingOptions
                    v-if="fieldData.refresh_options"
                    :section="sectionId"
                    :field="fieldData"
                    :toggle-loading-state="toggleLoadingState"
                />

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>

                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'schedule_weekly' === fieldData.type && showSettingsField( 'weekly' )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>
            <td>
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

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>

                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'select' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td v-bind:class="['combine' === fieldData.type ? 'tooltips-data combine-tips-style' : 'tooltips-data']">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
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

                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>

                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'file' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <input type="text" class="regular-text wpsa-url" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <input type="button" class="button wpsa-browse" value="Choose File" v-on:click.prevent="$emit( 'openMedia', { sectionId: sectionId, name: fieldData.name }, $event )">
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'color' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <color-picker v-model="fieldValue[fieldData.name]"></color-picker>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'html' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'warning' == fieldData.type">
            <th scope="row" class="dokan-setting-warning" colspan="2">
                <div class="error">
                    <p :for="sectionId + '[' + fieldData.name + ']'"><span class="dokan-setting-warning-label"><span class="dashicons dashicons-warning"></span> {{ fieldData.label }}</span> <span class="dokan-setting-warning-msg">{{fieldData.desc}}</span></p>
                </div>
            </th>
            <td class="tooltips-data"></td>
        </template>

        <template v-if="'radio' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '', 'dokan-settings-field-type-radio']">
                <fieldset>
                    <template v-for="( optionVal, optionKey ) in fieldData.options">
                        <label :for="sectionId + '[' + fieldData.name + '][' + optionKey + ']'">
                            <input type="radio" :id="sectionId + '[' + fieldData.name + '][' + optionKey + ']'" class="radio" :name="optionKey" v-model="fieldValue[fieldData.name]" :value="optionKey"> {{ optionVal }}
                        </label>
                    </template>
                </fieldset>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'wpeditor' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td width="72%" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <text-editor v-model="fieldValue[fieldData.name]"></text-editor>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'repeatable' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data">
                <span v-if="fieldData.tooltip">
                    <i class="dashicons dashicons-editor-help tips" :title="fieldData.tooltip" v-tooltip="fieldData.tooltip"></i>
                </span>
            </td>

            <td width="72%" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <ul class="dokan-settings-repeatable-list">
                    <li v-if="fieldValue[fieldData.name]" v-for="(optionVal, optionKey) in fieldValue[fieldData.name]">
                        {{ optionVal.value }} <span v-if="!optionVal.must_use" class="dashicons dashicons-no-alt remove-item" @click.prevent="removeItem( optionKey, fieldData.name )"></span>
                        <span class="repeatable-item-description" v-html="optionVal.desc"></span>
                    </li>

                </ul>
                <input type="text" class="regular-text" v-model="repeatableItem[fieldData.name]">
                <a href="#" class="button dokan-repetable-add-item-btn" @click.prevent="addItem( fieldData.type, fieldData.name )">+</a>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'radio_image' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <div class="radio-image-container">
                    <template v-for="( image, name ) in fieldData.options">
                        <label class="radio-image" :class="{ 'active' : fieldValue[fieldData.name] === name, 'not-active' : fieldValue[fieldData.name] !== name }">
                            <input type="radio" class="radio" :name="fieldData.name" v-model="fieldValue[fieldData.name]" :value="name">
                            <span class="current-option-indicator"><span class="dashicons dashicons-yes"></span> {{ __( 'Active', 'dokan-lite' ) }}</span>
                            <img :src="image">
                            <span class="active-option">
                                <button class="button button-primary button-hero" type="button" @click.prevent="fieldValue[fieldData.name] = name">
                                    {{ __( 'Select', 'dokan-lite' ) }}
                                </button>
                            </span>
                        </label>
                    </template>
                </div>
            </td>
        </template>

        <template v-if="'gmap' == fieldData.type && ! hideMap">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td class="tooltips-data"></td>

            <td v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
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
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>
    </tr>
</template>

<script>
    import colorPicker from "admin/components/ColorPicker.vue";
    let TextEditor = dokan_get_lib('TextEditor');
    let GoogleMaps = dokan_get_lib('GoogleMaps');
    let Mapbox = dokan_get_lib('Mapbox');
    let RefreshSettingOptions = dokan_get_lib('RefreshSettingOptions');

    export default {
        name: 'Fields',

        components: {
            colorPicker,
            TextEditor,
            GoogleMaps,
            Mapbox,
            RefreshSettingOptions,
        },

        props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors'],

        data() {
            return {
                repeatableItem: {},
                hideMap: false,
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
                return ! this.hideWithdrawOption() && this.fieldValue['disbursement_schedule'][fieldKey] !== '' && this.showDisbursementType('schedule');
            },

            showDisbursementType( fieldKey ) {
                return this.fieldValue['disbursement'][fieldKey] !== '';
            },

            hideWithdrawOption( ) {
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
        list-style-type: disc;
        padding-left: 20px;
    }
    ul.dokan-settings-repeatable-list li span.remove-item{
        padding-top: 0px;
        cursor: pointer;
    }
    .dokan-repetable-add-item-btn {
        font-size: 16px !important;
        font-weight: bold !important;
        height: 25px !important;
        line-height: 22px !important;
    }

    td.percent_fee, td.fixed_fee {
        display: inline-block;
    }
    td.percent_fee input, td.fixed_fee input {
        width: 60px;
    }
    tr.additional_fee .description {
        margin-left: 10px;
        margin-top: -10px;
    }
    .dokan-error {
        color: red;
        margin-top: -10px;
        font-style: italic;
    }

    .dokan-input-validation-error {
      border-color: red !important;
    }

    .dokan-error.combine-commission {
        margin-left: 10px;
    }
    th.dokan-setting-warning {
        padding: 10px 10px 10px 0;

        .dokan-setting-warning-label {
            color: #d63638;
            font-weight: bold;
        }

        .dashicons {
            margin: 0px;
            padding: 0px;
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
