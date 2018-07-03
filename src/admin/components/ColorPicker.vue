<template>
    <div class="color-picker-container">
        <button
            type="button"
            class="button color-picker-button"
            :style="{backgroundColor: value}"
            @click="toggleColorPicker"
        >
            <span>{{ __( 'Select Color', 'dokan-lite' ) }}</span>
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
                class="button button-small"
                @click="updateColor({})"
            >{{ __( 'Clear', 'dokan-lite' ) }}</button>

            <button
                type="button"
                class="button button-small"
                @click="toggleColorPicker"
            >{{ __( 'Close', 'dokan-lite' ) }}</button>
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
                showColorPicker: false
            };
        },

        methods: {
            updateColor(colors) {
                let color = '';

                if (colors[this.format]) {
                    color = colors[this.format];
                }

                this.$emit('input', color);
            },

            toggleColorPicker() {
                this.showColorPicker = !this.showColorPicker;
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

        .color-picker-button {
            height: 24px;
            padding: 0 0 0 30px;
            margin: 0 0 6px;
            font-size: 11px;

            span {
                display: block;
                padding: 0 6px;
                line-height: 22px;
                color: #555;
                text-align: center;
                background: #f7f7f7;
                border-left: 1px solid #ccc;
                border-radius: 0 2px 2px 0;
            }
        }

        .hex-input {
            width: 65px;
            padding: 3px 5px 4px;
            margin: 0 3 0 0;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
            vertical-align: top;
            box-shadow: 0 1px 0 #ccc;
        }
    }
</style>
