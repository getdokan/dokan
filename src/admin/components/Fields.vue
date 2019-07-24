<template>
    <tr :class="[id, `dokan-settings-field-type-${fieldData.type}`]">
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
                <input type="text" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'number' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <input type="number" :min="fieldData.min" :max="fieldData.max" :step="fieldData.step" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'textarea' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <textarea type="textarea" :rows="fieldData.rows" :cols="fieldData.cols" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]"></textarea>
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
            </td>
        </template>

        <template v-if="'select' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <select v-if="!fieldData.grouped" class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                    <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                    <option v-for="( optionVal, optionKey ) in fieldData.options" :value="optionKey" v-html="optionVal"></option>
                </select>

                <select v-else class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                    <option v-if="fieldData.placeholder" value="" v-html="fieldData.placeholder"></option>
                    <optgroup v-for="optionGroup in fieldData.options" :label="optionGroup.group_label">
                        <option v-for="option in optionGroup.group_values" :value="option.value" v-html="option.label" />
                    </optgroup>
                </select>

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
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'color' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <color-picker v-model="fieldValue[fieldData.name]"></color-picker>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'html' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>

        <template v-if="'radio' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
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
                        {{ optionVal.value }} <span class="dashicons dashicons-no-alt remove-item" @click.prevent="removeItem( optionKey, fieldData.name )"></span>
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
        <template v-if="'gmap' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>

            <td>
                <input type="hidden" :name="sectionId + '[' + fieldData.name + ']'" :value="Object.assign( fieldValue[fieldData.name], gmapData )">
                <gmap @updateGmap="updateGmapData" :gmapKey="getGmapApiKey()" :location="getMapLocation( fieldValue[fieldData.name] )" />
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </template>
    </tr>
</template>

<script>
    import colorPicker from "admin/components/ColorPicker.vue";
    let TextEditor = dokan_get_lib('TextEditor');
    let Gmap = dokan_get_lib('Gmap');

    export default {
        name: 'Fields',

        components: {
            colorPicker,
            TextEditor,
            Gmap
        },

        data() {
            return {
                repeatableItem: {},
                gmapData: {}
            }
        },

        props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues'],

        beforeMount() {
            if ( 'multicheck' === this.fieldData.type && ! this.fieldValue[ this.fieldData.name ] ) {
                this.fieldValue[ this.fieldData.name ] = this.fieldData.default;
            }
        },

        methods: {
            containCommonFields( type ) {
                return _.contains( [ undefined, 'text', 'email', 'url', 'phone' ], type );
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

            getMapLocation(savedLocation) {
                return {
                    latitude: savedLocation.latitude ? savedLocation.latitude : 23.709921,
                    longitude: savedLocation.longitude ? savedLocation.longitude: 90.40714300000002,
                    address: savedLocation.address ? savedLocation.address : 'Dhaka',
                    zoom: 10
                }
            },

            updateGmapData( payload ) {
                this.gmapData = payload;
            },

            getGmapApiKey() {
                let settings = this.allSettingsValues;

                if ( 'dokan_general' in settings && 'gmap_api_key' in settings.dokan_general  ) {
                    return settings.dokan_general.gmap_api_key
                }
            }
        }

    };
</script>

<style lang="less">
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

</style>