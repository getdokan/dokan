<template>
    <tr :class="[id, `dokan-settings-field-type-${fieldData.type}`]" v-if="shoudShow">
        <template v-if="'sub_section' === fieldData.type">
            <th colspan="2" class="dokan-settings-sub-section-title">
                <label>{{ fieldData.label }}</label>
            </th>
        </template>

        <template v-if="containCommonFields( fieldData.type )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
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
            <td>
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

        <template v-if="'price' == fieldData.type && allSettingsValues.dokan_selling && ( 'flat' === allSettingsValues.dokan_selling.commission_type || 'percentage' === allSettingsValues.dokan_selling.commission_type )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
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

        <template v-if="'combine' == fieldData.type && haveCondition( fieldData ) && 'combine' === allSettingsValues.dokan_selling.commission_type && fieldData.condition.type == 'show' && checkConditionLogic( fieldData, fieldValue )">
                <th scope="row">
                    <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
                </th>

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

        <template v-if="'product_price' == fieldData.type && allSettingsValues.dokan_selling && 'product_price' === allSettingsValues.dokan_selling.commission_type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td v-if="'' !== fieldValue[fieldData.name]">
                <div>
                </div>
                    <span>{{ __( 'Product price commission', 'dokan-lite' ) }}</span>

                    <div class="product_price_commission list-complete-item" v-for="( commission, key ) in fieldValue[fieldData.name]" v-bind:key="key">
                        <div class="product_price_commission_close"><span @click.prevent="removeProductPriceCommissionFromList(key)" class="dashicons dashicons-remove"></span></div>
                        <div>
                            <th scope="row">
                                <label :for="sectionId + '[' + fieldData.fields['product_cost'].name +key + ']'">{{ fieldData.fields['product_cost'].label }}</label>
                            </th>
                            <td>
                                <input
                                    type="number"
                                    :min="fieldData.min"
                                    class="regular-text"
                                    :id="sectionId + '[' + fieldData.fields['product_cost'].name +key + ']'"
                                    :name="sectionId + '[' + fieldData.fields['product_cost'].name +key + ']'"
                                    v-model="fieldValue[fieldData.name][key].product_cost"
                                >
                                <p v-if="currentProductPriceCommissionError( key, 'product_cost' )" class="dokan-error">
                                    {{ currentProductPriceCommissionError( key, 'product_cost' ) }}
                                </p>
                            </td>
                        </div>

                        <div>
                            <th scope="row">
                                <label :for="sectionId + '[' + fieldData.fields['rule'].name +key + ']'">{{ fieldData.fields['rule'].label }}</label>
                            </th>
                            <td>
                                <select class="regular-text" :name="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['rule'].name +key + ']'" v-model="fieldValue[fieldData.name][key].rule">
                                    <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['rule'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['rule'].options[optionVal]"></option>
                                </select>

                                <p v-if="currentProductPriceCommissionError( key, 'rule' )" class="dokan-error">
                                    {{ currentProductPriceCommissionError( key, 'rule' ) }}
                                </p>
                            </td>
                        </div>

                        <div>
                            <th scope="row">
                                <label :for="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'">{{ fieldData.fields['commission_type'].label }}</label>
                            </th>
                            <td>
                                <select class="regular-text" :name="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" :id="sectionId + '[' + fieldData.fields['commission_type'].name +key + ']'" v-model="fieldValue[fieldData.name][key].commission_type">
                                    <option v-for="( optionVal, key ) in Object.keys( fieldData.fields['commission_type'].options )" :key="key" :value="optionVal" v-html="fieldData.fields['commission_type'].options[optionVal]"></option>
                                </select>
                                <p v-if="currentProductPriceCommissionError( key, 'commission_type' )" class="dokan-error">
                                    {{ currentProductPriceCommissionError( key, 'commission_type' ) }}
                                </p>
                            </td>
                        </div>

                        <div>
                            <th scope="row">
                                <label :for="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'">{{ fieldData.fields['admin_commission'].label }}</label>
                            </th>
                            <td>
                                <template v-if="'percentage' === fieldValue[fieldData.name][key].commission_type">
                                    <input type="number" :min="fieldData.min" class="regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].percentage">
                                    <p v-if="currentProductPriceCommissionError( key, 'percentage' )" class="dokan-error">
                                        {{ currentProductPriceCommissionError( key, 'percentage' ) }}
                                    </p>
                                </template>
                                <template v-else-if="'flat' === fieldValue[fieldData.name][key].commission_type">
                                    <input type="number" :min="fieldData.min" class="regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].flat">
                                    <p v-if="currentProductPriceCommissionError( key, 'flat' )" class="dokan-error">
                                        {{ currentProductPriceCommissionError( key, 'flat' ) }}
                                    </p>
                                </template>

                                <template v-else>
                                    <td class="percent_fee product-price-commission">
                                        <input type="text" :min="fieldData.min" class="wc_input_decimal regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].percentage">
                                        {{ '%' }}
                                    </td>

                                    <td class="fixed_fee product-price-commission">
                                        {{ '+' }}
                                        <input type="text" :min="fieldData.min" class="wc_input_price regular-text" :id="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" :name="sectionId + '[' + fieldData.fields['admin_commission'].name +key + ']'" v-model="fieldValue[fieldData.name][key].flat">
                                    </td>
                                    <p v-if="currentProductPriceCommissionError( key, 'combine' )" class="dokan-error">
                                        {{ currentProductPriceCommissionError( key, 'combine' ) }}
                                    </p>
                                </template>
                            </td>
                        </div>
                    </div>

                <div>
                    <button @click.prevent="addProductPriceCommission" type="button">{{ __( 'Add', 'dokan-lite' ) }}</button>
                </div>
            </td>
        </template>

        <template v-if="'textarea' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
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

        <template v-if="'checkbox' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <fieldset>
                    <label :for="sectionId + '[' + fieldData.name + ']'">
                        <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]" true-value="on" false-value="off">
                        {{ fieldData.desc }}
                    </label>
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

        <template v-if="'select' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <select @change="getAndCheckCommissionType" v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
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
            <td>
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
            <td>
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
            <td>
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
        </template>

        <template v-if="'radio' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td class="dokan-settings-field-type-radio">
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
            <td width="72%">
                <text-editor v-model="fieldValue[fieldData.name]"></text-editor>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'repeatable' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td width="72%">
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
            <td>
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

            <td>
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
            }
        },

        computed: {
            shoudShow() {
                let shoudShow = true;

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
                                    shoudShow = false;
                                }
                                break;

                            case 'greater_than_equal':
                                if ( ! (dependencyValue >= value ) ) {
                                    shoudShow = false;
                                }
                                break;

                            case 'less_than':
                                if ( ! (dependencyValue < value ) ) {
                                    shoudShow = false;
                                }
                                break;

                            case 'less_than':
                                if ( ! (dependencyValue <= value ) ) {
                                    shoudShow = false;
                                }
                                break;

                            case 'equal':
                            default:
                                if ( dependencyValue != value ) {
                                    shoudShow = false;
                                }
                                break;
                        }

                        if ( ! shoudShow ) {
                            break;
                        }
                    }
                }

                return shoudShow;
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

            getAndCheckCommissionType( event ) {
                if ( 'product_price' === event.target.value ) {
                    if ( '' === this.fieldValue.product_price ) {
                        this.fieldValue.product_price = [
                            {
                                product_cost: 10,
                                rule: 'upto',
                                commission_type: 'percentage',
                                flat: 10,
                                percentage: 10
                            }
                        ];
                    }
                }
            },

            addProductPriceCommission() {
                const dummyData = {
                    product_cost: 10,
                    rule: 'upto',
                    commission_type: 'percentage',
                    flat: 10,
                    percentage: 10
                }

                const commissions = '' === this.fieldValue.product_price ? dummyData : this.fieldValue.product_price;

                commissions.push( dummyData );
                this.fieldValue.product_price = commissions;
            },

            removeProductPriceCommissionFromList( key ) {
                this.fieldValue.product_price.splice( key, 1 );
            },

            currentProductPriceCommissionError( index, field ) {
                let allErrors = this.errors;

                let result = false;

                if ( 'object' === typeof allErrors ) {
                    Object.keys( allErrors ).forEach( item => {
                        if ( undefined !== allErrors[item].product_price ) {
                            let productPriceCommissionErrors = allErrors[item].product_price;
                            Object.keys( productPriceCommissionErrors ).forEach( ( element, itemIndex ) => {
                                let errorObj = productPriceCommissionErrors[element];

                                if ( errorObj.index === index && errorObj.field === field  ) {
                                    result = errorObj.msg;
                                }
                            });
                        }
                    } );
                }

                return result;
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

        .dokan-setting-warning-msg {
            font-weight: 300;
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

    .product_price_commission{
        border-radius: 4px;
        border: 1px solid #8c8f94;
        background-color: #fff;
        padding: 8px;
        margin: 8px 0;

        .product_price_commission_close{
            display: block;
            width: 100%;
            overflow: hidden;

            .dashicons-remove{
                float: right;
                display: block;
                cursor: pointer;

                &:hover{
                    color: #d63638;
                }

                &:active{
                    color: #e2573f;
                }
            }
        }

        .product-price-commission {
                padding: 0;
                margin-bottom: 0;
        }
    }

</style>

