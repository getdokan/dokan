<template>
    <div class="social-info">
        <div class="content-header">
            {{__( 'Social Options', 'dokan' )}}
        </div>

        <div class="content-body">

            <div class="dokan-form-group">
                <div class="column">
                    <label for="">{{ __( 'Facebook', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.fb" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Flickr', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.flickr" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Google Plus', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.gplus" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Twitter', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.twitter" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Youtube', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.youtube" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Linkedin', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.linkedin" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Pinterest', 'dokan' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.pinterest" :placeholder="__( 'https://exmaple.com' )">
                </div>

                <div class="column">
                    <label for="">{{ __( 'Instagram', 'dokan' ) }}</label>
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