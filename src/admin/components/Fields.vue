<template>
    <div :class="[id, `dokan-settings-field-type-${fieldData.type}`]" v-if="shouldShow">
        <template v-if="'sub_section' === fieldData.type">
            <div class="dokan-settings-sub-section" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <h3 class="sub-section-title">{{ fieldData.label }}</h3>
                <p class="sub-section-description">
                    {{ fieldData.description }}
                </p>
            </div>
        </template>

        <template v-if="containCommonFields( fieldData.type )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <secret-input
                            v-if="fieldData.secret_text"
                            :type="fieldData.type || 'text'"
                            :id="sectionId + '[' + fieldData.name + ']'"
                            :name="sectionId + '[' + fieldData.name + ']'"
                            :value="fieldValue[fieldData.name]"
                            @input="value => inputValueHandler( fieldData.name, value, fieldValue[fieldData.name] )"
                        />
                        <input
                            v-else
                            :type="fieldData.type || 'text'"
                            class="regular-text medium" :id="sectionId + '[' + fieldData.name + ']'"
                            :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                            :name="sectionId + '[' + fieldData.name + ']'"
                            :value="fieldValue[fieldData.name]"
                            @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                        />
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
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input
                                type="number"
                                :min="fieldData.min"
                                :max="fieldData.max"
                                :step="fieldData.step"
                                class="regular-text medium"
                                :class="[ { 'dokan-input-validation-error': hasValidationError( fieldData.name ) }, fieldData.class ]"
                                :id="sectionId + '[' + fieldData.name + ']'"
                                :name="sectionId + '[' + fieldData.name + ']'"
                                :value="fieldValue[fieldData.name]"
                                @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                            />
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

        <template v-if="'price' === fieldData.type && allSettingsValues.dokan_selling && 'combine' !== allSettingsValues.dokan_selling.commission_type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input type="text" :min="fieldData.min" class="regular-text medium" :id="sectionId + '[' + fieldData.name + ']'"
                                :class="{ wc_input_decimal: allSettingsValues.dokan_selling.commission_type=='percentage', 'wc_input_price': allSettingsValues.dokan_selling.commission_type=='flat' }"
                                :name="sectionId + '[' + fieldData.name + ']'"
                                :value="fieldValue[fieldData.name]"
                                @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                            />
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

        <template v-if="'combine' === fieldData.type && haveCondition( fieldData ) && fieldData.condition.type == 'show' && checkConditionLogic( fieldData, fieldValue )">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field combine_fields">
                        <div class="percent_fee">
                            <input
                                type="text"
                                class="wc_input_decimal regular-text medium"
                                :id="sectionId + '[' + fieldData.name + ']' + '[' + 'percent_fee' + ']'"
                                :name="sectionId + '[' + fieldData.fields.percent_fee.name + ']'"
                                :value="fieldValue[fieldData.fields.percent_fee.name]"
                                @input="event => inputValueHandler( fieldData.fields.percent_fee.name, event.target.value, fieldValue[fieldData.fields.percent_fee.name] )"
                            />
                            {{ '%' }}
                        </div>
                        <div class="fixed_fee">
                            {{ '+' }}
                            <input
                                type="text"
                                class="wc_input_price regular-text medium"
                                :id="sectionId + '[' + fieldData.name + ']' + '[' + 'fixed_fee' + ']'"
                                :name="sectionId + '[' + fieldData.fields.fixed_fee.name + ']'"
                                :value="fieldValue[fieldData.fields.fixed_fee.name]"
                                @input="event => inputValueHandler( fieldData.fields.fixed_fee.name, event.target.value, fieldValue[fieldData.fields.fixed_fee.name] )"
                            />
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

        <template v-if="'textarea' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <textarea
                          type="textarea"
                          :rows="fieldData.rows"
                          :cols="fieldData.cols"
                          class="regular-text medium"
                          :id="sectionId + '[' + fieldData.name + ']'"
                          :name="sectionId + '[' + fieldData.name + ']'"
                          :value="fieldValue[fieldData.name]"
                          @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                        ></textarea>
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

        <template v-if="'switcher' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <switches
                                @input="onToggleSwitch"
                                :enabled="checked === 'on' ? true : false"
                                value="isChecked"
                            ></switches>
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'multicheck' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field multicheck_fields">
                        <template v-for="(optionVal, optionKey) in fieldData.options">
                            <div :key="optionKey">
                                {{ optionVal }}
                                <switches
                                    @input="setCheckedValue"
                                    :enabled="multiCheckValues.hasOwnProperty( optionKey ) && multiCheckValues[optionKey] !== ''"
                                    :value="optionKey"
                                ></switches>
                            </div>
                        </template>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                  {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'select' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <select
                            v-if="!fieldData.grouped"
                            class="regular medium"
                            :name="sectionId + '[' + fieldData.name + ']'"
                            :id="sectionId + '[' + fieldData.name + ']'"
                            :value="fieldValue[fieldData.name] ?? fieldData.default ?? ''"
                            @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] ?? fieldData.default ?? '' )"
                        >
                            <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                            <option v-for="( optionVal, optionKey ) in fieldData.options" :key="optionKey" :value="optionKey" v-html="optionVal"></option>
                        </select>
                        <select
                            v-else class="regular medium"
                            :id="sectionId + '[' + fieldData.name + ']'"
                            :name="sectionId + '[' + fieldData.name + ']'"
                            :value="fieldValue[fieldData.name] ? fieldValue[fieldData.name] : fieldData.default ?? ''"
                            @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] ?? '' )"
                        >
                            <option v-if="fieldData.placeholder" value="" disabled v-html="fieldData.placeholder"></option>
                            <optgroup v-for="( optionGroup, optionGroupKey ) in fieldData.options" :key="optionGroupKey" :label="optionGroup.group_label">
                                <option v-for="(option, optionKey ) in optionGroup.group_values" :key="optionKey" :value="option.value" v-html="option.label" />
                            </optgroup>
                        </select>

                        <RefreshSettingOptions
                            :field="fieldData"
                            :section="sectionId"
                            v-if="fieldData.refresh_options"
                            :toggle-loading-state="toggleLoadingState"/>
                    </div>
                </fieldset>
                <p v-if="hasValidationError( fieldData.name )" class="dokan-error">
                    {{ getValidationErrorMessage( fieldData.name ) }}
                </p>
            </div>
        </template>

        <template v-if="'file' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field add_files">
                        <label :for="sectionId + '[' + fieldData.name + ']'">
                            <input type="button" class="button wpsa-browse" value="Choose File" v-on:click.prevent="$emit( 'openMedia', { sectionId: sectionId, name: fieldData.name }, $event )">
                            <input
                              type="text"
                              class="regular-text medium wpsa-url"
                              :id="sectionId + '[' + fieldData.name + ']'"
                              :name="sectionId + '[' + fieldData.name + ']'"
                              :value="fieldValue[fieldData.name]"
                              @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                            >
                        </label>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'color' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field">
                        <color-picker
                            :itemKey="fieldData.name"
                            :customData="singleColorPicker"
                            @custom-change="e => setCustomColor( e, fieldData.name )"
                            @toggleColorPicker="toggleColorPicker"
                            :value="fieldValue[fieldData.name]"
                            @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                        ></color-picker>
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'html' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'warning' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <div class="field_data">
                        <h3 scope="row" class="field_heading dokan-setting-warning error">
                            <span class="dokan-setting-warning-label">
                                <span class="dashicons dashicons-warning"></span>
                                {{ fieldData.label }}
                            </span>
                            <span class="field_desc" v-html="fieldData.desc"></span>
                        </h3>
                    </div>
                </fieldset>
            </div>
        </template>

        <template v-if="'radio' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="radio_fields">
                      <dokan-radio-group
                        :items="formatDokanRadioData( fieldData.options )"
                        :value="fieldValue[fieldData.name]"
                        @onChange="data => inputValueHandler( fieldData.name, data, fieldValue[fieldData.name] )"
                        :id="fieldData.name"
                      />
                    </div>
                </fieldset>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'wpeditor' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                </fieldset>
                <div class="field editor_field">
                    <text-editor
                      :value="fieldValue[fieldData.name] ?? fieldData.default"
                      @input="data => inputValueHandler( fieldData.name, data, fieldValue[fieldData.name] )"
                    ></text-editor>
                </div>
            </div>
        </template>

        <template v-if="'repeatable' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <div class="field repeatable_fields">
                        <input
                          type="text"
                          class="regular-text medium"
                          v-model="repeatableItem[fieldData.name]"
                        />
                        <a href="#" class="button dokan-repetable-add-item-btn" @click.prevent="addItem( fieldData.type, fieldData.name )">
                            <span class="dashicons dashicons-plus-alt2"></span>
                        </a>
                    </div>
                </fieldset>
                <ul class="dokan-settings-repeatable-list">
                    <template v-for="(optionVal, optionKey) in fieldValue[fieldData.name]">
                        <li v-if="fieldValue[fieldData.name]" :key="optionKey">
                            {{ optionVal.value }}
                            <span v-if="!optionVal.must_use" class="dashicons dashicons-no-alt remove-item"
                                @click.prevent="removeItem( optionKey, fieldData.name )"></span>
                            <span class="repeatable-item-description" v-html="optionVal.desc"></span>
                        </li>
                    </template>
                </ul>
            </div>
        </template>

        <template v-if="'radio_image' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                </fieldset>
                <div class="field radio-image-container">
                     <template v-for="( image, name ) in fieldData.options">
                        <label class="radio-image" :key="name" :class="{ 'active' : fieldValue[fieldData.name] === name, 'not-active' : fieldValue[fieldData.name] !== name }">
                            <input
                              type="radio"
                              class="radio"
                              :name="fieldData.name"
                              :value="fieldValue[fieldData.name] ? fieldValue[fieldData.name] : name"
                              @input="event => inputValueHandler( fieldData.name, event.target.value, fieldValue[fieldData.name] )"
                            />
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

        <template v-if="'gmap' === fieldData.type && ! hideMap">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                </fieldset>
                <div class="field gmap-field">
                    <input type="hidden" :name="sectionId + '[' + fieldData.name + ']'" :value="mapLocation">
                    <Mapbox
                        width="100%"
                        height="300px"
                        @hideMap="onHideMap"
                        :location="mapLocation"
                        @updateMap="onUpdateMap"
                        v-if="mapApiSource === 'mapbox'"
                        :accessToken="mapboxAccessToken"/>
                    <GoogleMaps
                        v-else
                        @hideMap="onHideMap"
                        :location="mapLocation"
                        @updateMap="onUpdateMap"
                        :apiKey="googleMapApiKey"/>
                </div>
                <p v-if="hasError( fieldData.name )" class="dokan-error">
                    {{ getError( fieldData.label ) }}
                </p>
            </div>
        </template>

        <template v-if="'social' === fieldData.type">
            <div class="field_contents" v-bind:class="[fieldData.content_class ? fieldData.content_class : '']">
                <fieldset>
                    <FieldHeading :fieldData="fieldData"></FieldHeading>
                    <label class="social-switch-wraper" v-if="fieldData.enable_status">
                        <switches
                            @input="onSocialToggleSwitch"
                            :enabled="socialChecked === 'on' ? true : false"
                            value="isSocialChecked"
                        ></switches>
                    </label>
                </fieldset>
                <div class="field scl_fields" :class="fieldData.enable_status && 'off' === socialChecked ? 'scl_fields_disable' : ''">
                    <div class="scl_header">
                        <div class="scl_contents ">
                            <div class="scl_icon">
                                <img :src="fieldData.icon_url" :alt="fieldData.label" />
                            </div>
                            <p class="scl_desc">{{ fieldData.social_desc }}</p>
                        </div>
                        <div class="expand_btn" @click="expandSocial">
                            <span class="dashicons" v-bind:class="[ ! this.expandSocials ? 'dashicons-arrow-down-alt2' : 'dashicons-arrow-up-alt2', isSocialFieldActivated ? 'active-social-expend-btn' : '']"></span>
                        </div>
                    </div>
                    <template v-for="( fields, index ) in fieldData">
                        <div class="scl_info" v-if="expandSocials && fields.social_field" :key="index">
                            <div :class="[ { 'scl_html': fields.type === 'html' }, { 'scl_text': fields.type !== 'html' }, fields.content_class ? fields.content_class : '' ]">
                                <SocialFields
                                    :fieldData="fields"
                                    :fieldValue="fieldValue"
                                ></SocialFields>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <template v-if="'charges' === fieldData.type">
            <withdraw-charges
                :section-id="sectionId"
                :fieldData='fieldData'
                :field-value='fieldValue'
                :should-show='shouldShow'
            />
        </template>

        <template v-if="customFieldComponents">
            <component
                :key="index"
                :sectionId="sectionId"
                :fieldData="fieldData"
                :is="settingsComponent"
                :fieldValue="fieldValue"
                :assetsUrl="dokanAssetsUrl"
                :validationErrors="validationErrors"
                :toggleLoadingState="toggleLoadingState"
                @some-event="thisSomeEvent"
                v-for="( settingsComponent, index ) in customFieldComponents"/>
        </template>
    </div>
</template>

<script>
    import colorPicker from "admin/components/ColorPicker.vue";
    import Switches from "admin/components/Switches.vue";
    import SocialFields from './SocialFields.vue';
    import FieldHeading from './FieldHeading.vue';
    import SecretInput from './SecretInput.vue';
    import WithdrawCharges from './Fields/WithdrawCharges.vue'
    import DokanRadioGroup from "admin/components/DokanRadioGroup.vue";

    let Mapbox                = dokan_get_lib('Mapbox');
    let TextEditor            = dokan_get_lib('TextEditor');
    let GoogleMaps            = dokan_get_lib('GoogleMaps');
    let RefreshSettingOptions = dokan_get_lib('RefreshSettingOptions');

    export default {
        name: 'Fields',

        components: {
          DokanRadioGroup,
            Mapbox,
            Switches,
            TextEditor,
            GoogleMaps,
            colorPicker,
            FieldHeading,
            SocialFields,
            RefreshSettingOptions,
            SecretInput,
            WithdrawCharges
        },

        props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors', 'dokanAssetsUrl'],

        data() {
            return {
                hideMap               : false,
                checked               : this.isChecked(),
                socialChecked         : this.isSocialChecked(),
                expandSocials         : false,
                repeatableItem        : {},
                repeatableTime        : [],
                singleColorPicker     : { default: this.fieldData.default, label: '', show_pallete: false },
                yourStringTimeValue   : '',
                customFieldComponents : dokan.hooks.applyFilters( 'getDokanCustomFieldComponents', [] ),
                multiCheckValues      : {},
            }
        },

        created() {
            this.$root.$on( 'hasError', ( key ) => {
                this.hasValidationError( key );
            });

            this.$root.$on( 'getError', ( key ) => {
                this.getValidationErrorMessage( key );
            });

            this.$parent.$on( 'switcHandler', ( fieldKey, value ) => {
                if ( this.fieldData.name === fieldKey ) {
                    this.checked = value;
                }
            });
        },

        watch: {
            fieldValue: {
                handler() {
                },
                deep: true,
            }
        },

        computed: {
            shouldShow(e) {
                let shouldShow = true;

                if ( this.fieldData.show_if ) {
                    const conditions   = this.fieldData.show_if;
                    const dependencies = Object.keys( conditions );

                    let i = 0;

                    for ( i = 0; i < dependencies.length; i++ ) {
                        const dependency            = dependencies[i];
                        const [ optionId, sectionId = this.sectionId ] = dependency.split( '.' ).reverse();
                        const dependencyValue       = this.allSettingsValues[ sectionId ][ optionId ];
                        const [ operator, value ]   = _.chain( conditions[ dependency ] ).pairs().first().value();

                        switch ( operator ) {
                            case 'greater_than':
                                if ( ! ( dependencyValue > value ) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'greater_than_equal':
                                if ( ! ( dependencyValue >= value ) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'less_than':
                                if ( ! ( dependencyValue < value ) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'less_than':
                                if ( ! ( dependencyValue <= value ) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'contains':
                                if ( ! Object.values( dependencyValue ).includes( value ) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'contains-any':
                                if ( ! value.some(item => Object.values( dependencyValue ).includes(item)) ) {
                                    shouldShow = false;
                                }
                                break;

                            case 'equal':

                            default:
                                if ( dependencyValue !== value ) {
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
                    zoom      : parseInt( location.zoom ),
                    address   : `${location.address}`,
                    latitude  : parseFloat( location.latitude ),
                    longitude : parseFloat( location.longitude ),
                };

                return location;
            },

            googleMapApiKey() {
                return this.allSettingsValues?.dokan_appearance?.gmap_api_key;
            },

            mapboxAccessToken() {
                return this.allSettingsValues?.dokan_appearance?.mapbox_access_token;
            },

            isSocialFieldActivated() {
                for (const data in this.fieldData) {
                    if (this.fieldData[data].social_field && 'html' !== this.fieldData[data].type && ! this.fieldValue[this.fieldData[data].name]) {
                        return false;
                    }
                }

                return true;
            },
        },

        beforeMount() {
            if ( 'multicheck' === this.fieldData.type && ! this.fieldValue[ this.fieldData.name ] ) {
                this.fieldValue[ this.fieldData.name ] = this.fieldData.default;
            }

            if ( 'multicheck' === this.fieldData.type ) {
                this.multiCheckValues = JSON.parse( JSON.stringify( this.fieldValue[ this.fieldData.name ] ) );
            }
        },

        methods: {
            formatDokanRadioData( options ) {
              let data = [];
              Object.keys( options ).map( item => {
                data.push({
                  label: options[item],
                  value: item
                });
              } );

              return data;
            },

            validateInputData( name, newValue, oldValue, fieldData ) {
                return dokan.hooks.applyFilters(
                  'dokanFieldComponentInputValue',
                  newValue,
                  oldValue,
                  name,
                  fieldData.is_lite ?? false
                );
            },
            inputValueHandler( name, newValue, oldValue ) {
              this.fieldValue[ name ] = this.validateInputData( name, newValue, oldValue, this.fieldData );
            },

            containCommonFields( type ) {
                return _.contains( [ undefined, 'text', 'email', 'url', 'phone', 'time' ], type );
            },

            setCheckedValue( checked, value ) {
                let data = this.validateInputData(
                    this.fieldData.name,
                    checked ? value : '',
                    this.fieldValue[ this.fieldData.name ][ value ] ?? '',
                    this.fieldData
                );

                this.$set( this.fieldValue[ this.fieldData.name ], value, data );
                this.$set( this.multiCheckValues, value, data );
            },

            addItem( type, name ) {
                this.fieldValue[ name ] = this.fieldValue[ name ] || [];

                if ( typeof this.repeatableItem[ name ] == 'undefined' || ! this.repeatableItem[ name ] )  {
                    return;
                }

                let oldData = JSON.parse( JSON.stringify( this.fieldValue[ name ] ) );
                let newData = [
                    ...oldData,
                    {
                        id    : this.repeatableItem[ name ].trim().replace(/\s+/g, '_').toLowerCase(),
                        value : this.repeatableItem[ name ]
                    }
                ];

                newData = this.validateInputData( this.fieldData.name, newData, oldData, this.fieldData );

                this.fieldValue[ name ] = newData;
                this.repeatableItem[ name ] = '';
            },

            removeItem( optionVal, name ) {
                let oldData = JSON.parse( JSON.stringify( this.fieldValue[name] ) );
                let newData = JSON.parse( JSON.stringify( this.fieldValue[name] ) );
                newData.splice( optionVal, 1 );


                this.fieldValue[name] = this.validateInputData( this.fieldData.name, newData, oldData, this.fieldData );
            },

            haveCondition( fieldData ) {
                return fieldData.hasOwnProperty( 'condition' );
            },

            checkConditionLogic( fieldData, fieldValue ) {
                var logic = fieldData.condition.logic;
                var isValid = false;

                _.each( logic, function( value, key ) {
                    if ( _.contains( value, fieldValue[ key ] ) ) {
                        isValid = true;
                    }
                } );

                return isValid;
            },

            onHideMap( hideMap ) {
                this.hideMap = hideMap;
            },

            onUpdateMap( payload ) {
                this.fieldValue[ this.fieldData.name ] = { ...this.mapLocation, ...payload };
            },

            isSocialChecked() {
                /**
                 * If social field has enabled status saved return it or return the default value or return 'on'
                 *
                 * @since 3.7.24
                 */
                if ( this.fieldData[ 'enable_status' ] && this.fieldData[ 'enable_status' ]['name'] && this.fieldValue[ this.fieldData[ 'enable_status' ]['name'] ] ) {
                    return this.fieldValue[ this.fieldData[ 'enable_status' ]['name'] ];
                } else if ( this.fieldData[ 'enable_status' ] && this.fieldData[ 'enable_status' ]['default'] ) {
                    return this.fieldData[ 'enable_status' ]['default'];
                }

                return 'on';
            },


            thisSomeEvent(value) {
                console.log('hello priting...', value);
            },

            isSwitchOptionChecked( optionKey ) {
                if ( 'multicheck' === this.fieldData.type ) {
                    return this.fieldValue[ this.fieldData.name ] && this.fieldValue[ this.fieldData.name ][ optionKey ] === optionKey;
                } else if ( 'radio' === this.fieldData.type ) {
                    return this.fieldValue[ this.fieldData.name ] && this.fieldValue[ this.fieldData.name ] === optionKey;
                }

                return false;
            },

            expandSocial() {
                this.expandSocials = ! this.expandSocials;
            },

            getSocialValue( optionValue ) {
                this.fieldValue[ optionValue.name ] = this.fieldValue[ optionValue.name ] ? this.fieldValue[ optionValue.name ] : '';
            },

            isChecked() {
                return ! this.fieldValue[ this.fieldData.name ] ? this.fieldData.default : this.fieldValue[ this.fieldData.name ];
            },

            onToggleSwitch( status, key ) {
                if ( 'isChecked' !== key ) {
                    return;
                }

                let isChecked = this.validateInputData( this.fieldData.name, status ? 'on' : 'off', this.fieldValue[ this.fieldData.name ], this.fieldData  );

                this.checked                           = isChecked;
                this.fieldValue[ this.fieldData.name ] = isChecked;

                this.$root.$emit( 'onFieldSwitched', this.fieldValue[ this.fieldData.name ], this.fieldData.name );
            },

            onSocialToggleSwitch( status, key ) {
                if ( 'isSocialChecked' !== key ) {
                    return;
                }

                let oldData = this.fieldValue[ this.fieldData[ 'enable_status' ]['name'] ] ? this.fieldValue[ this.fieldData[ 'enable_status' ]['name'] ] : this.fieldData[ 'enable_status' ]['default'];

                let isChecked = this.validateInputData(
                    this.fieldData[ 'enable_status' ]['name'],
                    status ? 'on' : 'off',
                    oldData,
                    this.fieldData
                );

                this.socialChecked                                           = isChecked;
                this.fieldValue[ this.fieldData[ 'enable_status' ]['name'] ] = isChecked;
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

            toggleColorPicker( data ) {
                if ( this.fieldData.name === data.key ) {
                    this.singleColorPicker.show_pallete = ! data.values.show_pallete;
                } else {
                    this.singleColorPicker.show_pallete = false;
                }
            },

            setCustomColor( value, key ) {
                if ( ! key ) {
                    return;
                }

                this.fieldData[ key ] = value;
            },
        },
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
            border: 1px solid rgba(0, 0, 0, 0.10);
            padding: 5px 12px;
            display: flex;
            font-size: 13px;
            box-sizing: border-box;
            background: rgba(182, 206, 254, 0.38);
            margin-top: 6px;
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.10);
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
        padding: 20px;
        border: 1px solid #f3f4f6;
        border-bottom: 0;
        background: #f9fafb;

        .sub-section-title {
            margin: 0;
            font-size: 14px;
            font-family: Roboto, sans-serif;
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 8px;
        }

        .sub-section-description {
            margin: 0;
            font-size: 13px;
            font-weight: 300;
            line-height: 21px;
            font-family: Roboto, sans-serif;
            color: #6B7280;

            .learn-more-btn {
                cursor: pointer;
                text-decoration: none;
            }
        }
    }
    .field_contents.data_clear {
        background-color: #FFFBF3;

        .field_desc,
        .fa-exclamation-triangle {
            color: #E67E22 !important;
        }
    }
    .field_contents {
        border: 1px solid #f3f4f6;
        padding: 15px 20px 15px 20px;
        border-top: 0;
        background: #fff;

        fieldset {
            display: flex;
            justify-content: space-between;

            .field_data {
                flex: 2;

                .field_heading {
                    color: #111827;
                    margin: 0;
                    font-size: 14px;
                    font-style: normal;
                    font-weight: 600;
                    line-height: 1.25;
                    font-family: 'Roboto', sans-serif;

                    span {
                        i {
                            margin: -3px 0 0 5px;
                        }

                        .tooltip {
                            font-size: 14px;
                        }
                    }
                }

                .field_desc {
                    color: #6B7280;
                    margin: 0;
                    margin-top: 5px;
                    font-size: 13px;
                    font-style: normal;
                    font-weight: 300;
                    line-height: 1.2;
                    font-family: 'Roboto', sans-serif;

                    a {
                        display: inline-block;
                        text-decoration: underline;

                        &:hover {
                            box-shadow: 0 0 0 1px transparent;
                        }
                        &:active {
                            box-shadow: 0 0 0 1px transparent;
                        }
                        &:focus {
                            box-shadow: 0 0 0 1px transparent;
                        }
                    }
                }
            }

            .social-switch-wraper {
                display: flex;
                align-items: center;
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
            & > div {
                display: flex;
                align-items: center;
                justify-content: right;

                label {
                    color: #000;
                    cursor: inherit;
                    margin: 9px 0 9px 15px;
                    display: inline-block;
                    font-size: 12px;
                    font-style: normal;
                    line-height: 14px;
                    font-family: 'Roboto', sans-serif;
                    border-radius: 20px !important;
                    border-radius: 8px;
                }
            }
        }

        .editor_field {
            margin-top: 20px;
        }

        .radio_fields {
            label {
                border: 0.882967px solid #f3f4f6;
                padding: 10px 15px;
                display: inline-block;
                overflow: hidden;
                font-size: 12px;
                box-shadow: 0px 3.53187px 3.53187px rgba(0, 0, 0, 0.10);
                font-family: 'Roboto', sans-serif;
                font-weight: 400;
                line-height: 14px;
                border-right: 0;

                &:first-child {
                    border-top-left-radius: 5px;
                    border-bottom-left-radius: 5px;
                }

                &:last-child {
                    border-right: 0.882967px solid #f3f4f6;
                    border-top-right-radius: 5px;
                    border-bottom-right-radius: 5px;
                }

                &:hover {
                    color: rgba(3, 58, 163, 0.85);
                    background: rgba(182, 206, 254, 0.38);
                    box-sizing: border-box;
                    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.10);
                    border-color: rgba(3, 58, 163, 0.41);
                }
            }

            .checked {
                color: rgba(3, 58, 163, 0.85);
                border: 1px solid rgba(3, 58, 163, 0.21);
                background: rgba(182, 206, 254, 0.38);
                box-sizing: border-box;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.10);
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
                margin-right: 10px;

                span {
                    margin-top: 6px !important;
                }
            }

            .dashicons {
                margin: 0px;
                padding: 0px;
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
                border: 0.957434px solid #E9E9E9;
                min-height: 32px;
                box-shadow: 0px 3.82974px 3.82974px rgba(0, 0, 0, 0.10);
                border-radius: 5px;
            }

            select,
            textarea {
                width: 100%;
            }

            .small {
                max-width: 35% !important;
            }

            .medium {
                max-width: 70% !important;
            }

            .large {
                max-width: 100% !important;
            }

            label.checked {
                color: rgba(3, 58, 163, 0.85);
                border: 1px solid rgba(3, 58, 163, 0.41);
                background: rgba(182, 206, 254, 0.38);
                box-sizing: border-box;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.10);

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

        .scl_fields_disable {
            filter: grayscale(1);
        }

        .scl_fields {
            margin: 15px 0 4px 0px;
            border: 0.82px solid #E5E5E5;
            padding: 10px 25px;
            background: rgba(220, 232, 254, 0.38);
            //box-shadow: 0px 3.28px 3.28px rgba(0, 0, 0, 0.10);
            border-radius: 6.56px;

            .scl_header {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .scl_contents {
                    display: flex;
                    align-items: center;

                    .scl_icon {
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

                    .scl_desc {
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

                    .active-social-expend-btn {
                        background: #4CAF4F;
                    }
                }
            }

            .scl_info {
                background: #fff;

                .scl_text,
                .scl_html {
                    border: 1px solid #f3f4f6;
                    display: flex;
                    padding: 10px 30px 15px 27px;
                    border-top: 0;
                    background: rgba(244,246,250,.17);
                    justify-content: space-between;

                    fieldset {
                        width: 100%;

                        .html_contents {
                            width: 50%;
                            text-align: left;

                            .field_heading {
                                color: #000;
                                margin: 0;
                                font-size: 15px;
                                font-style: normal;
                                font-weight: 600;
                                line-height: 30px;
                                font-family: Roboto,sans-serif;

                                span {
                                    i {
                                        margin: 2.5px 0 0 5px;
                                    }

                                    .tooltip {
                                        font-size: 14px;
                                    }
                                }
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
                            width: 50%;
                            align-self: center;
                            text-align: right;

                            .checked {
                                color: rgba(3, 58, 163, 0.85);
                                border: 1px solid rgba(3, 58, 163, 0.81);
                                background: rgba(182, 206, 254, 0.38);
                                box-sizing: border-box;
                                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.10);

                                .dashicons-yes {
                                    display: inline-block;
                                }
                            }
                        }
                    }

                }

                &:nth-child(2) {
                    margin-top: 15px;
                    border-top: 1px solid #f3f4f6;
                }

                &:last-child {
                    margin-bottom: 10px;
                }
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

    @media only screen and (max-width: 430px) {
        .field_contents {
            padding: 14px 14px 18px 14px;

            fieldset {
                display: block;

                .field_data {
                    .field_heading {
                        font-size: 10px;
                        line-height: 24px;
                    }

                    .field_desc {
                        font-size: 8px;
                    }
                }

                .field {
                    margin-top: 15px;
                    text-align: left;

                    select,
                    textarea,
                    input[type=text] {
                        min-height: 28px;
                        font-size: 8px;
                    }

                    .small {
                        max-width: 35% !important;
                    }

                    .medium {
                        max-width: 70% !important;
                    }

                    .large {
                        max-width: 100% !important;
                    }
                }
            }

            .scl_fields {
                padding: 10px 15px;

                .scl_header {
                    display: block;

                    .scl_contents {
                        display: block;

                        .scl_desc {
                            font-size: 8px;
                        }
                    }

                    .expand_btn {
                        text-align: left;
                    }
                }

                .scl_info {
                    .scl_html,
                    .scl_text {
                        padding: 10px;

                        .field_html {
                            font-size: 10px;
                            line-height: 20px;
                        }

                        .field_desc {
                            font-size: 8px;
                        }

                        select,
                        textarea,
                        input[type=text] {
                            font-size: 8px;
                            min-height: 28px;
                        }
                    }
                }
            }
        }
    }

    @media only screen and (max-width: 768px) {
        .field {
            select,
            textarea,
            input[type=text] {
                max-width: 125px !important;
            }

            .small {
                max-width: 35% !important;
            }

            .medium {
                max-width: 70% !important;
            }

            .large {
                max-width: 100% !important;
            }
        }
    }
</style>
