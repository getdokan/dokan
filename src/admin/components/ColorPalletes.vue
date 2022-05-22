<template>
    <div class="field">
        <div class="color-option-settings">
            <div
                class="color_option"
                v-bind:class="fieldValue[fieldData.name].pallete_status === 'template' ? 'active-pallete' : ''"
                @click="setPalleteStatus( 'template' )"
            >
                <div class="color-option-icon">
                    <span class="dashicons dashicons-yes"></span>
                </div>
                <div class="color-option-content">
                    <h3 class="color-option-title">
                        {{ __( 'Pre-defined Color Pallete', 'dokan' ) }}
                    </h3>
                    <p class="color-option-desc">
                        {{ __( "By choosing anyone from these color palletes to colorize your vendor dashboard; it’s a time saving tool.", 'dokan' ) }}
                    </p>
                </div>
            </div>
            <div
                class="color_option"
                v-bind:class="fieldValue[fieldData.name].pallete_status === 'custom' ? 'active-pallete' : ''"
                @click="setPalleteStatus( 'custom' )"
            >
                <div class="color-option-icon">
                    <span class="dashicons dashicons-yes"></span>
                </div>
                <div class="color-option-content">
                    <h3 class="color-option-title">
                        {{ __( 'Custom Color', 'dokan' ) }}
                    </h3>
                    <p class="color-option-desc">
                        {{ __( 'You can color your vendor dashboard by choosing any color as your brand identity or as your wish.', 'dokan' ) }}
                    </p>
                </div>
            </div>
        </div>
        <div class="color-pallete-container">
            <div class="pallete_settings">
                <template v-for="( values, name ) in fieldData.options">
                    <div
                        :key="name"
                        class="color-pallete-contents"
                        @click="setColorpalleteSettings( values )"
                        v-bind:class="isCurrentPalleteActive( values ) ? 'active-pallete' : ''"
                        v-if="fieldValue[fieldData.name].pallete_status === 'template' && values.value !== 'custom'"
                    >
                        <div class="pallete-btn">
                            <input
                                :id="values.value"
                                type="radio"
                                :name="fieldData.name"
                                :value="values.value"
                                v-model="fieldValue[fieldData.name].value"
                                :checked="isCurrentPalleteActive( values ) ? 'true' : 'false'"
                            >
                            <label :for="values.value">{{ values.value }}</label>
                        </div>
                        <div class="colors">
                            <template v-for='( optionVal, optionKey ) in values.color_options'>
                                <div
                                    :key="optionKey"
                                    :class="optionKey"
                                    v-if='values.color_options'
                                    :style="'background-color: ' + optionVal"
                                ></div>
                            </template>
                        </div>
                    </div>
                </template>
                <template v-if="fieldValue[fieldData.name].pallete_status === 'custom'">
                    <div class="custom-pallete-header">
                        <h3>{{ __( 'Choose the color: ', 'dokan' ) }}</h3>
                        <p @click="resetColors" class="btnReset">{{ __( 'Reset all' ) }}</p>
                    </div>
                    <div class="color-pallete-contents custom-pallete" v-for="( values, key ) in customPicker" :key="key">
                        <h4>{{ __( values.label, 'dokan' ) }}</h4>
                        <color-picker v-model="fieldValue[fieldData.name][key]" @custom-change="e => setCustomColor( e, key )"></color-picker>
                    </div>
                </template>
            </div>
            <div class="pallete_preview">
                <h3 class="preview-title">{{ __( 'Preview', 'dokan' ) }}</h3>
                <div class="preview">
                    <div class="preview-header">
                        <div class="ellipsis">
                            <div :class="'ellipsis-' + index" v-for="index in 3" :key="index"></div>
                        </div>
                    </div>
                    <div class="preview-body">
                        <div class="preview-sidebar" :style="'background-color: ' + preview['dash_nav_bg']">
                            <div class="dokan-logo">
                                <img :src="assetsUrl + '/images/dokan-logo.svg'" />
                            </div>
                            <div class="placeholder-menu">
                                <div
                                    :key="index"
                                    v-for="index in 8"
                                    :class="[ index === 1 ? 'active-menu' : 'deactive-menu' ]"
                                    :style="index === 1 ? 'background-color: ' + preview['dash_active_link'] : ''"
                                >
                                    <div class="menu-icon" :style="index !== 1 ? 'background-color: ' + preview['dash_nav_text'] : ''"></div>
                                    <div class="menu-content" :style="index !== 1 ? 'background-color: ' + preview['dash_nav_text'] : ''"></div>
                                </div>
                            </div>
                        </div>
                        <div class="preview-content">
                            <div class="report-section">
                                <div class="reports">
                                    <div class="report" v-for="index in 4" :key="index">
                                        <div class="report-content" v-for="index in 2" :key="index"></div>
                                    </div>
                                </div>
                                <div class="button-preview" :style="'background-color: ' + preview['btn_primary'] + '; color: ' + preview['btn_text']">
                                    {{ __( 'Button', 'dokan' ) }}
                                </div>
                            </div>
                            <div class="chart-section">
                                <div class="chart-header">
                                    <div class="contents">
                                        <div class="content" v-for="index in 4" :key="index"></div>
                                    </div>
                                    <div class="btn-hover-preview" :style="'background-color: ' + preview['btn_hover'] + '; color: ' + preview['btn_hover_text']">
                                        {{ __( 'Button Hover', 'dokan' ) }}
                                    </div>
                                </div>
                                <div class="chart-preview">
                                    <img :src="assetsUrl + '/images/chart-line.svg'" />
                                </div>
                            </div>
                            <div class="content-section">
                                <div class="content-half">
                                    <div
                                        :key="index"
                                        v-for="index in 3"
                                        :class="[ { 'content-left': index === 1 }, { 'content-center': index === 2 }, { 'content-right': index === 3 } ]"
                                    >
                                        <div class="content" v-for="i in  3" :key="i"></div>
                                    </div>
                                </div>
                                <div class="content-half">
                                    <div class="content" v-for="index in 2" :key="index"></div>
                                    <div class="border-preview" :style="'border-color: ' + this.preview['btn_primary_border']">
                                        {{ __( 'Button Border', 'dokan' ) }}
                                    </div>
                                </div>
                            </div>
                            <div class="profile-section">
                                <div class="content-half">
                                    <div class="content"></div>
                                    <div class="profiles">
                                        <div class="profile" v-for="index in 3" :key="index">
                                            <div class="profile-pic">
                                                <img :src="assetsUrl + '/images/contact-icon.svg'" />
                                            </div>
                                            <div class="content"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="content-half">
                                    <div
                                        :key="index"
                                        v-for="index in 3"
                                        :class="[ { 'content-left': index === 1 }, { 'content-center': index === 2 }, { 'content-right': index === 3 } ]"
                                    >
                                        <div class="content" v-for="i in  3" :key="i"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import colorPicker from "admin/components/ColorPicker.vue";

    export default {
        name: 'ColorPalletes',

        components: {
            colorPicker
        },

        props: {
            fieldData: {
                type: Object,
                required: true,
            },
            fieldValue: {
                type: Object,
                required: true,
            },
            assetsUrl: {
                type: String,
                required: true,
            },
        },

        data() {
            return {
                custom   : {},
                template : {},
                preview  : {
                    btn_text           : '#FFF',
                    btn_primary        : '#F05025',
                    btn_primary_border : '#DA502B',
                    btn_hover_text     : '#FFF',
                    btn_hover          : '#DD3B0F',
                    btn_hover_border   : '#C83811',
                    dash_nav_text      : '#CFCFCF',
                    dash_active_link   : '#F05025',
                    dash_nav_bg        : '#1B233B',
                    dash_nav_border    : '#454545',
                },
                customPicker : {
                    btn_text           : { label : this.__( 'Button Text color', 'dokan' ), default : '#FFF' },
                    btn_primary        : { label : this.__( 'Button Background color', 'dokan' ), default : '#F05025' },
                    btn_primary_border : { label : this.__( 'Button Border color', 'dokan' ), default : '#DA502B' },
                    btn_hover_text     : { label : this.__( 'Button Hover Text color', 'dokan' ), default : '#FFF' },
                    btn_hover          : { label : this.__( 'Button Hover color', 'dokan' ), default : '#DD3B0F' },
                    btn_hover_border   : { label : this.__( 'Button Hover Border color', 'dokan' ), default : '#C83811' },
                    dash_nav_text      : { label : this.__( 'Dashboard Navigation Text', 'dokan' ), default : '#CFCFCF' },
                    dash_active_link   : { label : this.__( 'Dashboard Navigation Active Menu', 'dokan' ), default : '#F05025' },
                    dash_nav_bg        : { label : this.__( 'Dashboard Navigation Background', 'dokan' ), default : '#1B233B' },
                    dash_nav_border    : { label : this.__( 'Dashboard Menu Border', 'dokan' ), default : '#454545' },
                },
            }
        },

        mounted() {
            this.setPalleteStatus( this.fieldValue[ this.fieldData.name ].pallete_status, false );
            this.setColorpalleteSettings( this.fieldValue[ this.fieldData.name ] );
        },

        methods: {
            setPalleteStatus( status, change = true ) {
                this.setPreview( status, change );
                this.fieldValue[ this.fieldData.name ].pallete_status = status;
            },

            setPreview( status, change ) {
                if ( status === 'custom' ) {
                    if ( Object.keys( this.custom ).length === 0 ) {
                        for (const [optionKey, optionValue] of Object.entries(this.customPicker)) {
                            this.custom[ optionKey ] = change ? optionValue.default : this.fieldValue[ this.fieldData.name ][ optionKey ];
                        }
                    }

                    this.updatePreview( this.custom );
                } else {
                    let selectedValue = this.fieldValue[ this.fieldData.name ].value,
                        optionObj     = this.fieldData.options[ selectedValue.replace(' ', '_') ];

                    for (const [optionKey, optionValue] of Object.entries(this.preview)) {
                        this.template[ optionKey ] = optionObj[ optionKey ];
                    }

                    this.updatePreview( this.template );
                }
            },

            updateTemplate( value ) {
                let tempObj = this.fieldData.options[ value.replace(' ', '_') ];

                for (const [optionKey, optionValue] of Object.entries(this.preview)) {
                    this.template[ optionKey ] = tempObj[ optionKey ];
                }

                this.updatePreview( this.template );
            },

            updatePreview( colorObj ) {
                for (const [optionKey, optionValue] of Object.entries(this.preview)) {
                    this.preview[ optionKey ] = colorObj[ optionKey ];
                }

                for (const [optionKey, optionValue] of Object.entries(this.preview)) {
                    this.fieldValue[ this.fieldData.name ][ optionKey ] = optionValue;
                }
            },

            setColorpalleteSettings( values ) {
                for (const [optionKey, optionValue] of Object.entries(values)) {
                    if ( ! this.preview[ optionKey ] ) {
                        this.fieldValue[ this.fieldData.name ][ optionKey ] = optionValue;
                    }
                }

                if ( values.pallete_status === 'template' ) {
                    this.updateTemplate( values.value );
                }
            },

            setCustomColor( value, key ) {
                if( ! key || this.fieldValue[this.fieldData.name].pallete_status !== 'custom' ) {
                    return;
                }

                this.custom[ key ] = value;
                this.updatePreview( this.custom );
            },

            resetColors() {
                for (const [optionKey, optionValue] of Object.entries(this.customPicker)) {
                    this.custom[optionKey] = optionValue.default;
                }

                this.updatePreview( this.custom );
            },

            isCurrentPalleteActive( values ) {
                return this.fieldValue[this.fieldData.name]['value'] === values.value;
            }
        },
    };
</script>

<style lang="less">
    .color-palette-container {
        padding: 20px 0;
        display: grid;
        grid-row-gap: 2.6%;
        grid-column-gap: 3.2%;

        .color-palette-image {
            display: block;
            width: 100%;
            background: #fff;
            -webkit-box-shadow: 0 1px 1px 0 rgba( 0, 0, 0, 0.1 );
            box-shadow: 0 1px 1px 0 rgba( 0, 0, 0, 0.1 );
            position: relative;
            line-height: 0;
            border: 1px solid #ededed;
            padding: 4px;

            img {
                max-width: 100%;
                z-index: 1;
            }

            .current-option-indicator {
                position: absolute;
                top: 0;
                right: 0;
                background-color: #4CAF50;
                color: #fff;
                padding: 4px;
                z-index: 2;
                line-height: 1.4;
            }

            .active-option {
                opacity: 0;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 3;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.45);
                transition: opacity 0.4s ease;

                button {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    margin-top: -23px;
                    margin-left: -58px;
                }
            }
        }
    }

    .color-option-settings {
        display: flex;
        margin-top: 30px;

        .color_option {
            width: 325px;
            cursor: pointer;
            border: 1px solid #E2E2E2;
            padding: 15px;
            display: flex;
            text-align: left;
            box-sizing: border-box;
            border-radius: 3px;

            .color-option-icon {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                margin-right: 10px;
                border-radius: 20px;
                justify-content: center;
                background-color: #D7DADD;

                .dashicons-yes {
                    color: #fff;
                    display: block;
                    margin-top: 0;
                    margin-left: 2px;
                    background-color: transparent;
                }
            }

            .color-option-content {
                .color-option-title {
                    margin: 0;
                    font-size: 15px;
                    margin-top: 1.5px;
                    font-style: normal;
                    font-family: 'SF Pro Text';
                    font-weight: 700;
                    line-height: 18px;
                }

                .color-option-desc {
                    color: #788383;
                    margin: 0;
                    font-size: 12px;
                    margin-top: 5px;
                    font-style: normal;
                    font-family: 'Helvetica';
                    font-weight: 400;
                    line-height: 19px;
                    letter-spacing: 0.109091px;
                }
            }

            &:first-child {
                margin-right: 20px;
            }
        }

        .active-pallete {
            border: 1px solid #1ABC9C;
            background: #EFFAF8;

            .color-option-icon {
                background-color: #1ABC9C;
            }

            .color-option-content {
                color: #788383
            }
        }
    }

    .color-pallete-container {
        display: flex;
        margin-top: 50px;
        justify-content: space-between;

        .pallete_settings {
            width: 278px;
            display: grid;
            grid-row-gap: 10px;

            .custom-pallete-header {
                display: flex;
                justify-content: space-between;

                h3 {
                    color: #000;
                    margin: 0;
                    font-size: 15px;
                    font-style: normal;
                    font-family: 'SF Pro Text';
                    font-weight: 600;
                    line-height: 18px;
                }

                .btnReset {
                    color: #1A9ED4;
                    cursor: pointer;
                    font-size: 13px;
                    font-style: normal;
                    text-align: right;
                    margin-top: 3px;
                    line-height: 16px;
                    font-weight: 600;
                    font-family: 'SF Pro Text';
                }
            }

            .custom-pallete {
                display: flex;
                align-items: center;
                justify-content: space-between;

                h4 {
                    color: #000000;
                    margin: 0;
                    font-size: 13px;
                    text-align: left;
                    font-style: normal;
                    font-family: 'SF Pro Text';
                    font-weight: 400;
                    line-height: 16px;
                    padding-right: 15px;
                }
            }

            .color-pallete-contents {
                cursor: pointer;
                border: 1px solid #E2E2E2;
                padding: 15px;
                box-sizing: border-box;
                border-radius: 3px;
            }
        }

        .pallete-btn {
            text-align: left;
            margin-bottom: 8px;

            input[type='radio'] {
                border: 1px solid #D4D5D6;
                display: inline-block;
                margin-top: 0;

                &:checked {
                    border: 1px solid #1A9ED4;

                    &:before {
                        background-color: #1A9ED4;
                    }
                }
            }

            label {
                text-transform: capitalize;
                font-family: 'SF Pro Text';
                font-style: normal;
                font-weight: 400;
                font-size: 13px;
                line-height: 16px;
                color: #000000;
            }
        }

        .colors {
            height: 15px;
            display: grid;
            overflow: hidden;
            grid-column-gap: 4px;
            grid-template-columns: repeat(4,1fr);

            .color-1 {
                width: 117px;
            }

            .color-2 {
                width: 38px;
            }

            .color-3 {
                width: 36px;
            }

            .color-4 {
                width: 45px;
            }

            div {
                border-radius: 3px;
            }
        }

        .pallete_preview {
            width: 400px;

            .preview-title {
                margin: 0;
                text-align: left;
                margin-bottom: 25px;
            }

            .preview {
                width: 100%;
                border: 0.52px solid #EAEAEA;
                height: 505px;
                overflow: hidden;
                border-radius: 8.97px;

                .preview-header {
                    height: 30px;
                    border: 0.52px solid #EAEAEA;
                    display: flex;
                    align-items: center;
                    border-radius: 8.97px 8.97px 0px 0px;

                    .ellipsis {
                        width: 100px;
                        height: 15px;
                        display: flex;
                        margin-left: 18px;
                        align-items: center;

                        .ellipsis-1 {
                            background-color: #D2D2E1;
                        }

                        .ellipsis-2 {
                            background-color: #C2C2D7;
                        }

                        .ellipsis-3 {
                            background-color: #A2A2C1;
                        }

                        div {
                            width: 6px;
                            height: 6px;
                            margin-right: 5px;
                            border-radius: 6px;

                            &:last-child {
                                margin-right: 0;
                            }
                        }
                    }
                }

                .preview-body {
                    width: 100%;
                    height: 100%;
                    display: flex;

                    .preview-sidebar {
                        width: 75px;
                        height: 100%;

                        .dokan-logo {
                            text-align: center;
                            margin: 5px 0;
                        }

                        .placeholder-menu {
                            width: 100%;

                            .active-menu {
                                position: relative;
                                background-color: #C61740;

                                .menu-icon,
                                .menu-content {
                                    background-color: #FFF;
                                }

                                .menu-content {
                                    width: 22px;
                                }

                                &:after {
                                    top: 6px;
                                    right: -7px;
                                    content: "";
                                    position: absolute;
                                    transform: rotateZ(-90deg);
                                    border-left: 10px solid transparent;
                                    border-right: 10px solid transparent;
                                    border-bottom: 6px solid #fff;
                                }
                            }

                            div {
                                height: 22px;
                                display: flex;
                                align-items: center;

                                .menu-icon {
                                    width: 6px;
                                    height: 6px;
                                    margin: 0 6px 0 23px;
                                    border-radius: 6px;
                                }

                                .menu-content {
                                    width: 15px;
                                    height: 3px;
                                    border-radius: 1.5px;
                                }

                                &:nth-child(2) {
                                    .menu-content {
                                        width: 26px;
                                    }
                                }
                            }
                        }
                    }

                    .preview-content {
                        width: 325px;
                        height: 100%;
                        display: block;
                        padding: 15px 20px;
                        box-sizing: border-box;
                        background-color: #F8F9FC;

                        .report-section {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;

                            .reports {
                                display: grid;
                                grid-column-gap: 7px;
                                grid-template-columns: repeat(4, 1fr);

                                .report {
                                    width: 37px;
                                    height: 37px;
                                    background: #efeff6;
                                    border-radius: 3.30042px;

                                    .report-content {
                                        width: 16px;
                                        height: 3px;
                                        background: #CBCBDC;
                                        border-radius: 3.30042px;
                                        display: block;
                                        margin: auto;
                                        opacity: 0.8;
                                        margin-top: 10px;

                                        &:last-child {
                                            margin-top: 8px;
                                            width: 10px;
                                        }
                                    }
                                }
                            }

                            .button-preview {
                                color: #FFF;
                                width: 65px;
                                height: 33px;
                                display: flex;
                                font-size: 11px;
                                font-style: normal;
                                font-weight: 600;
                                line-height: 13px;
                                font-family: 'SF Pro Text';
                                align-items: center;
                                border-radius: 1.8262px;
                                justify-content: center;
                            }
                        }

                        .chart-section {
                            border: 0.5px solid #EAEAEA;
                            background: #FFF;
                            box-shadow: 0px 4.89199px 8.15331px rgba(0, 0, 0, 0.02);
                            border-radius: 8.97px;

                            .chart-header {
                                width: 100%;
                                padding: 15px;
                                display: grid;
                                box-sizing: border-box;
                                grid-column-gap: 16px;
                                grid-template-columns: repeat(2, 1fr);

                                .contents {
                                    display: grid;
                                    grid-template-columns: repeat(4, 1fr);
                                    grid-column-gap: 8px;

                                    .content {
                                        width: 20px;
                                        height: 3px;
                                        background-color: #E0E1ED;
                                        border-radius: 3.3px;
                                    }
                                }

                                .btn-hover-preview {
                                    color: #FFF;
                                    width: 92px;
                                    height: 32px;
                                    display: flex;
                                    font-size: 10.72px;
                                    font-style: normal;
                                    font-family: 'SF Pro Text';
                                    font-weight: 600;
                                    line-height: 13px;
                                    align-items: center;
                                    border-radius: 1.8262px;
                                    justify-content: center;
                                }
                            }

                            .chart-preview {
                                img {
                                    width: 100%;
                                }
                            }
                        }

                        .content-section,
                        .profile-section {
                            display: grid;
                            grid-column-gap: 10px;
                            grid-template-columns: repeat(2, 1fr);

                            .content-half {
                                border: 0.330118px solid hsla(0,0%,59.2%,.13);
                                padding: 24px 12px;
                                display: grid;
                                background: #fff;
                                box-shadow: 0px 4.89199px 8.15331px rgba(0, 0, 0, 0.02);
                                box-sizing: border-box;
                                border-radius: 8.96864px;
                                grid-template-columns: repeat(3, 1fr);
                                grid-column-gap: 12px;

                                .content {
                                    height: 3px;
                                    border-radius: 3.3px;
                                    background-color: #EFEFF6;
                                }

                                .content-left {
                                    .content {
                                        width: 28px;
                                        background-color: #E0E1ED;

                                        &:nth-child(1) {
                                            width: 16px;
                                        }

                                        &:nth-child(2) {
                                            width: 22px;
                                        }
                                    }
                                }

                                .content-center {
                                    .content {
                                        width: 48px;
                                    }
                                }

                                .content-right {
                                    .content {
                                        width: 10px;
                                        background-color: #E0E1ED;
                                    }
                                }

                                div {
                                    display: grid;
                                    grid-row-gap: 13px;
                                }
                            }
                        }

                        .content-section {
                            .content-half {
                                .border-preview {
                                    color: #1B233B;
                                    width: 98px;
                                    border: 0.61px solid;
                                    padding: 4px;
                                    font-size: 10px;
                                    background: #FFFFFF;
                                    box-sizing: border-box;
                                    font-style: normal;
                                    text-align: left;
                                    font-family: 'SF Pro Text';
                                    align-items: center;
                                    font-weight: 600;
                                    border-radius: 1.8px;
                                    justify-content: center;
                                }

                                &:last-child {
                                    display: block;
                                    padding-top: 18px;
                                    padding-bottom: 12px;

                                    .content {
                                        width: 42px;
                                        margin-bottom: 6px;

                                        &:nth-child(2) {
                                            width: 75px;
                                            margin-bottom: 12px;
                                        }
                                    }
                                }
                            }
                        }

                        .profile-section {
                            .content-half {
                                .content {
                                    width: 60px;
                                }

                                .profiles {
                                    grid-row-gap: 10px;

                                    .profile {
                                        display: flex;
                                        align-items: center;

                                        .profile-pic {
                                            width: 15px;
                                            height: 15px;
                                            display: flex;
                                            align-items: center;
                                            margin-right: 7px;
                                            border-radius: 15px;
                                            background-color: #EFEFF6;
                                            justify-content: center;
                                        }

                                        .content {
                                            margin-bottom: 0;
                                        }
                                    }
                                }

                                &:first-child {
                                    display: block;

                                    .content {
                                        margin-bottom: 10px;
                                    }
                                }

                                &:last-child {
                                    display: flex;
                                    align-items: center;

                                    div {
                                        display: block;

                                        .content {
                                            margin-bottom: 15px;

                                            &:last-child {
                                                margin-bottom: 0;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        & > div {
                            margin-bottom: 25px;

                            &:last-child {
                                margin-bottom: 0;
                            }
                        }
                    }
                }
            }
        }
    }
</style>
