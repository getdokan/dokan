<template>
    <div class="color-picker-container">
        <button type="button" class="button color-picker-button" @click="toggleColorPicker">
            <div class="color" :style="{backgroundColor: value}"></div>
            <span class="dashicons dashicons-arrow-down-alt2"></span>
        </button>   

        <sketch v-if="showColorPicker" :value="value" @input="updateColor" :preset-colors="presetColors"
            :disable-alpha="disableAlpha" :disable-fields="disableFields"></sketch>

        <input v-if="showColorPicker && format === 'hex'" @input="setHexColor( $event.target.value )"
            type="text" :value="value" class="hex-input" />

        <div v-if="showColorPicker" class="button-group">
            <button type="button" class="button button-small dashicons dashicons-no-alt" @click="setLastColor( prevColor )"></button>
            <button type="button" class="button button-small dashicons dashicons-saved" @click="toggleColorPicker"></button>
        </div>
    </div>
</template>

<script>
    import Sketch from 'vue-color/src/components/Sketch.vue';

    export default {
        components : {
            Sketch
        },

        props : {
            value : {
                type     : String,
                default  : '',
                required : true,
            },

            format : {
                type     : String,
                required : false,
                default  : 'hex',
                validator( type ) {
                    return ['hsl', 'hex', 'rgba', 'hsv'].indexOf( type ) !== -1;
                }
            },

            presetColors : {
                type     : Array,
                required : false,
                default() {
                    return [
                        '#000',
                        '#fff',
                        '#d33',
                        '#d93',
                        '#ee2',
                        '#81d742',
                        '#1e73be',
                        '#8224e3'
                    ];
                }
            },

            disableAlpha : {
                type     : Boolean,
                default  : true,
                required : false
            },

            disableFields : {
                type     : Boolean,
                default  : true,
                required : false
            },

            customData : {
                type     : Object,
                required : true,
            },

            itemKey : {
                type     : String,
                required : true,
            }
        },

        data() {
            return {
                isPicked        : false,
                prevColor       : '',
                showColorPicker : false,
                selectedColor   : '',
            };
        },

        watch: {
            customData : {
                handler() {
                    this.showColorPicker = this.customData.show_pallete;

                    if ( ! this.showColorPicker ){
                        this.updateColor({ hex: this.prevColor });
                    }
                },
                deep : true
            }
        },

        methods: {
            updateColor( colors ) {
                let color = '';

                if ( colors[ this.format ] ) {
                    color              = colors[ this.format ];
                    this.selectedColor = color;
                }

                this.$emit( 'input', color );
                this.$emit( 'custom-change', color );
            },

            toggleColorPicker() {
                this.prevColor = this.value;
                let data = {
                    key    : this.itemKey,
                    values : this.customData,
                };
                
                if ( ! this.isPicked ) {
                    this.updateColor({ hex : this.prevColor });
                }

                this.$emit( 'toggleColorPicker', data );
            },

            setLastColor( color ) {
                let data = {
                    key    : this.itemKey,
                    values : this.customData,
                };

                this.updateColor({ hex : color });
                this.$emit( 'toggleColorPicker', data);
            },

            setHexColor( color ) {
                this.updateColor({
                    hex : color
                });
            }
        }
    };
</script>

<style lang="less" scoped>
    .color-picker-container {
        position: relative;

        .color-picker-button {
            border: 1px solid #E2E2E2;
            padding: 3px 10px;
            display: flex;
            background: #FFF;
            box-sizing: unset;
            align-items: center;
            margin-left: auto;
            border-radius: 3px;

            .color {
                width: 23px;
                height: 23px;
                border: 0.3px solid rgba(149, 165, 166, .5);
                box-sizing: border-box;
                margin-right: 3px;
                border-radius: 23px;
            }

            span {
                color: #95A5A6;
                display: block;
                padding: 0;
                font-size: 12px;
                text-align: center;
                line-height: 22px;
                margin-right: -5px;
            }
        }

        .button-group {
            top: 260px;
            right: 11px;
            z-index: 1;
            position: absolute;

            .button-small {
                color: #fff;
                border: 0;
                padding: 15px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 5px 0 0 5px;
                background-color: #1A9ED4;

                &:before {
                    position: absolute;
                    transform: translate(-50%, -50%);
                }

                &:last-child {
                    border-radius: 0 5px 5px 0;

                    &:after {
                        top: 20%;
                        left: 50%;
                        width: 1px;
                        height: 60%;
                        content: '';
                        position: absolute;
                        transform: translateX(50%);
                        background: #fff;
                    }
                }
                
                &:hover {
                    background-color: #1A9ED4;
                }
            }
        }

        .vc-sketch {
            top: 120%;
            right: 0;
            z-index: 1;
            position: absolute;
            padding-bottom: 40px;
        }

        .hex-input {
            top: 260px;
            width: 75px;
            right: 132px;
            padding: 3px 10px 4px;
            z-index: 1;
            position: absolute;
            font-size: 12px;
            min-height: 30px !important;
            box-shadow: none !important;
            font-family: monospace;
            line-height: 1.4;
            vertical-align: top;
        }
    }
</style>
