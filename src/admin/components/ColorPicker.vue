<template>
    <div class="color-picker-container">
        <button
            type="button"
            class="button color-picker-button"
            @click="toggleColorPicker"
        >
            <div class="color" :style="{backgroundColor: value}"></div>
            <span class="dashicons dashicons-arrow-down-alt2"></span>
        </button>

        <input
            v-if="showColorPicker && format === 'hex'"
            :value="value"
            @input="setHexColor($event.target.value)"
            type="text"
            class="hex-input"
        >

        <div v-if="showColorPicker" class="button-group">
            <button
                type="button"
                class="button button-small dashicons dashicons-no"
                @click="setLastColor(prevColor)"
            ></button>

            <button
                type="button"
                class="button button-small dashicons dashicons-saved"
                @click="toggleColorPicker"
            ></button>
        </div>

        <sketch
            v-if="showColorPicker"
            :value="value"
            @input="updateColor"
            :preset-colors="presetColors"
            :disable-alpha="disableAlpha"
            :disable-fields="disableFields"
        ></sketch>
    </div>
</template>

<script>
    import Sketch from 'vue-color/src/components/Sketch.vue';

    export default {
        components: {
            Sketch
        },

        props: {
            value: {
                type: String,
                required: true,
                default: ''
            },

            format: {
                type: String,
                required: false,
                default: 'hex',
                validator(type) {
                    return ['hsl', 'hex', 'rgba', 'hsv'].indexOf(type) !== -1;
                }
            },

            presetColors: {
                type: Array,
                required: false,
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

            disableAlpha: {
                type: Boolean,
                required: false,
                default: true
            },

            disableFields: {
                type: Boolean,
                required: false,
                default: true
            }
        },

        data() {
            return {
                prevColor       : '',
                showColorPicker : false
            };
        },

        methods: {
            updateColor(colors) {
                let color = '';

                if (colors[this.format]) {
                    color = colors[this.format];
                }

                this.$emit('input', color);
                this.$emit('custom-change', color);
            },

            toggleColorPicker() {
                this.prevColor       = this.value;
                this.showColorPicker = !this.showColorPicker;
            },

            setLastColor(color) {
                this.updateColor({ hex: color });
                this.toggleColorPicker();
            },

            setHexColor(color) {
                this.updateColor({
                    hex: color
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
            top: 115%;
            right: 115%;
            position: absolute;

            .button-small {
                color: #fff;
                border: 0;
                padding: 15px;
                font-size: 18px;
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
                        top: 18%;
                        left: 50%;
                        width: 1px;
                        height: 65%;
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
            top: 200%;
            right: 0;
            z-index: 1;
            position: absolute;
        }

        .hex-input {
            top: 108%;
            width: 65px;
            right: 0;
            margin: 0 3 0 0;
            padding: 3px 5px 4px;
            position: absolute;
            font-size: 12px;
            box-shadow: 0 1px 0 #ccc;
            font-family: monospace;
            line-height: 1.4;
            vertical-align: top;
        }
    }
</style>
