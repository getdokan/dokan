<template>
    <div class="social-info">
        <div class="content-header">
            {{__( 'Social Options', 'dokan-lite' )}}
        </div>

        <div class="content-body">

            <div class="dokan-form-group">
                <div class="column">
                    <label for="facebook">{{ __( 'Facebook', 'dokan-lite' ) }}</label>
                    <input id="facebook" type="text" class="dokan-form-input" v-model="vendorInfo.social.fb" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label for="flickr">{{ __( 'Flickr', 'dokan-lite' ) }}</label>
                    <input id="flickr" type="text" class="dokan-form-input" v-model="vendorInfo.social.flickr" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label for="twitter">{{ __( 'Twitter', 'dokan-lite' ) }}</label>
                    <input id="twitter" type="text" class="dokan-form-input" v-model="vendorInfo.social.twitter" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label for="youtube">{{ __( 'Youtube', 'dokan-lite' ) }}</label>
                    <input id="youtube" type="text" class="dokan-form-input" v-model="vendorInfo.social.youtube" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label for="linkedin">{{ __( 'Linkedin', 'dokan-lite' ) }}</label>
                    <input id="linkedin" type="text" class="dokan-form-input" v-model="vendorInfo.social.linkedin" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label id="pinterest" for="pinterest">{{ __( 'Pinterest', 'dokan-lite' ) }}</label>
                    <input type="text" class="dokan-form-input" v-model="vendorInfo.social.pinterest" :placeholder="__( 'https://example.com' )">
                </div>

                <div class="column">
                    <label for="instagram">{{ __( 'Instagram', 'dokan-lite' ) }}</label>
                    <input id="instagram" type="text" class="dokan-form-input" v-model="vendorInfo.social.instagram" :placeholder="__( 'https://example.com' )">
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
