<template>
    <div class='secret-input-box' :style="! showCopyBtn ? 'display: block' : 'display: flex; justify-content: end;'">
        <input
            class="regular-text large"
            :class="[secret && hide && value ? 'secret-input blurry-input' : 'secret-input', inputClasses]"
            @focus="removeBlurryEffect"
            @blur="addBlurryEffect"
            :type="inputType"
            :value="value"
            @input="handleInput"
            ref="secretInput"
            :disabled="isDisabled"
            :id="inputId"
            :name="inputName"
        />
        <div v-if="showCopyBtn" :title="copied ? __( 'Copied', 'dokan-lite' ) : __('Copy to clipboard', 'dokan-lite' )">
            <button type='button' v-on:click="copyHandler(value)">
                <i v-if="copied" class="fa fa-check" aria-hidden="true"></i>
                <i v-else class="fa fa-clipboard" aria-hidden="true"></i>
            </button>
        </div>
        <span v-if='secret && hide && value' v-on:click="handleClickView" ref="secretInputPlaceholder" class="secret-input-placeholder">{{__( 'Click to view', 'dokan-lite' )}}</span>
    </div>
</template>

<script>
export default {
    props: ['type', 'value', 'disabled', 'isSecret', 'copyBtn', 'classes', 'id', 'name'],

    data() {
        return {
            inputType: this.type ?? 'text',
            hide: true,
            isDisabled: this.disabled ?? false,
            secret: this.isSecret ?? true,
            copied: false,
            showCopyBtn: this.copyBtn ?? false,
            inputClasses: this.classes,
            inputName: this.name ?? '',
            inputId: this.id ?? Math.random(),
        }
    },

    methods: {
        handleInput (e) {
            this.$emit('input', e.target.value)
        },
        addBlurryEffect( evt ) {
            this.hide = true;
        },

        removeBlurryEffect( evt ) {
            this.hide = false;
        },

        handleClickView() {
            let secretInput = this.$refs.secretInput;
            secretInput.focus();
        },

        copyHandler(text) {
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.value = text;
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            let copiedSuccessfully = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (copiedSuccessfully) {
                this.copied = true;

                setTimeout(() => {
                    this.copied = false;
                }, 1000);
            }
        },
    },
}
</script>

<style lang='less' scoped>
.secret-input-box {
    div {
        button {
            cursor: pointer;
            height: 20px;
            min-height: 32px;
            min-width: 32px;
            border: 0.957434px solid #686666;
            box-shadow: 0px 3.82974px 3.82974px rgba(0, 0, 0, 0.1);
            border-radius: 5px;
            background: white;
            color: #686666;
        }
    }
}

.secret-input-box {
    position: relative;

    .secret-input {
        &.blurry-input {
            color: transparent;
            text-shadow: 0 0 7px #333;
        }
    }

    .secret-input-placeholder {
        position: absolute;
        left: 35%;
        top: 25%;
        color: #686666;
    }
}
</style>
