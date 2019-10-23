<template>
    <div class="social-info">
        <div class="content-header">
            {{__( 'Social Options', 'dokan-lite' )}}
        </div>

        <div class="content-body">

            <div class="dokan-form-group">
                <div class="column">
                    <label for="">{{ __( 'Facebook', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.fb" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Flickr', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.flickr" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Google Plus', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.gplus" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Twitter', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.twitter" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Youtube', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.youtube" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Linkedin', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.linkedin" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Pinterest', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.pinterest" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Instagram', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.instagram" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <!-- Add other social fields here -->
                <component v-for="(component, index) in getSocialFields"
                    :key="index"
                    :is="component"
                    :vendorInfo="vendorInfo"
                />
            </div>

        </div>
    </div>
</template>

<script>
export default {
    name: 'VendorSocialFields',

    props: {
        vendorInfo: {
            type: Object
        }
    },

    data() {
        return {
            getSocialFields: dokan.hooks.applyFilters( 'getVendorSocialFields', [] ),
        }
    }
};
</script>