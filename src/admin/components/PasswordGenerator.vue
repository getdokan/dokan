<template>
    <div class="password-generator">
        <button class="button button-secondary" v-if="! hideGenerateButton" @click.prevent="generatePassword">
            {{ title }}
        </button>

        <button class="button regen-button" v-if="showCancelButton" @click.prevent="regenratePassword">
            <span class="dashicons dashicons-controls-repeat"></span>
            {{ regenrateTitle }}
        </button>

        <button class="button cancel-button" v-if="showCancelButton" @click.prevent="cancelButton">
            {{ cancelTitle }}
        </button>

    </div>
</template>

<script>
export default {
    name: 'PasswordGenerator',

    props: {
        title: {
            type: String,
            default: 'Generate Password'
        },

        cancelTitle: {
            type: String,
            default: 'Cancel'
        },

        regenrateTitle: {
            type: String,
            default: 'Regenrate'
        },

        length: {
            type: Number,
            default: 25
        }
    },

    data () {
        return {
            password: '',
            hideGenerateButton: false,
            showCancelButton: false
        }
    },

    methods: {
        generatePassword() {
            this.password = this.makePassword( this.length );

            this.$emit( 'passwordGenerated', this.password );

            this.hideGenerateButton = true;
            this.showCancelButton = true;
        },

        makePassword( len = 25 ) {
            let lowerCaseChars = 'abcdefghijklmnopqurstuvwxyz';
            let upperCaseChars = 'ABCDEFGHIJKLMNOPQURSTUVWXYZ';
            let specialChars   = '!@#$%^&*()';
            let randomChars    = '';

            for ( let i = 0; i <= len; i++ ) {
                let mixUp = lowerCaseChars[Math.floor(Math.random() * len )] + upperCaseChars[Math.floor(Math.random() * 10 )] + specialChars[Math.floor(Math.random() * specialChars.length)];
                randomChars += mixUp;
            }

            return randomChars.slice( -len );
        },

        cancelButton() {
            this.hideGenerateButton = false;
            this.showCancelButton = false;

            this.$root.$emit( 'passwordCancelled' );
        },

        regenratePassword() {
            this.password = this.makePassword( this.length );
            this.$emit( 'passwordGenerated', this.password );
        }
    }
}
</script>