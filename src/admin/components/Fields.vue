<template>
    <tbody>
        <tr :class="id" v-if="containCommonFields( fieldData.type )">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <input type="text" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </tr>

        <tr :class="id" v-if="'number' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label }}</label>
            </th>
            <td>
                <input type="number" :min="fieldData.min" :max="fieldData.max" :step="fieldData.step" class="regular-text" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                <p class="description" v-html="fieldData.desc"></p>
            </td>
        </tr>

        <tr :class="id" v-if="'checkbox' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label}}</label>
            </th>
            <td>
                <fieldset>
                    <label :for="sectionId + '[' + fieldData.name + ']'">
                        <input type="checkbox" class="checkbox" :id="sectionId + '[' + fieldData.name + ']'" :name="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]" true-value="on" false-value="off">
                        {{ fieldData.desc }}
                    </label>
                </fieldset>
            </td>
        </tr>

        <tr :class="id" v-if="'multicheck' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label}}</label>
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
        </tr>

        <tr :class="id" v-if="'select' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label}}</label>
            </th>
            <td>
                <select class="regular" :name="sectionId + '[' + fieldData.name + ']'" :id="sectionId + '[' + fieldData.name + ']'" v-model="fieldValue[fieldData.name]">
                    <option v-for="( optionVal, optionKey ) in fieldData.options" :value="optionKey" v-html="optionVal"></option>
                </select>
            </td>
        </tr>

        <tr :class="id" v-if="'radio_image' == fieldData.type">
            <th scope="row">
                <label :for="sectionId + '[' + fieldData.name + ']'">{{ fieldData.label}}</label>
            </th>
            <td>
                <div class="radio-image-container">
                    <template v-for="( image, name ) in fieldData.options">
                        <label class="radio-image" :class="{ 'active' : fieldValue[fieldData.name] === name, 'not-active' : fieldValue[fieldData.name] !== name }">
                            <input type="radio" class="radio" :name="fieldData.name" v-model="fieldValue[fieldData.name]" :value="name">
                            <span class="current-option-indicator"><span class="dashicons dashicons-yes"></span> Active</span>
                            <img :src="image">
                            <span class="active-option">
                                <button class="button button-primary button-hero" type="button" @click.prevent="fieldValue[fieldData.name] = name">
                                    Select
                                </button>
                            </span>
                        </label>

                        <!-- <div class="dokan-settings-radio-image not-active">
                            <img :src="image">

                            <span class="current-option-indicator"><span class="dashicons dashicons-yes"></span>Active</span>

                            <span class="active-option">
                                <button class="button button-primary button-hero" type="button" :data-template="name" :data-input="sectionId + '_' + fieldData.name">
                                    Select
                                </button>
                            </span>
                        </div> -->
                    </template>
                </div>
            </td>
        </tr>
    </tbody>
</template>

<script>
    export default {
        name: 'Fields',

        props: ['id', 'fieldData', 'sectionId', 'fieldValue'],

        data() {
            return {
            }
        },

        methods: {
            containCommonFields( type ) {
                return _.contains( [ 'text', 'email', 'url', 'phone' ], type );
            }
        }

    }
</script>

<style lang="less">

</style>