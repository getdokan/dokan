<template>
    <Multiselect
        v-if='storeCategoryList.length'
        type='text'
        id="store-category"
        class="dokan-form-input dokan-store-category"
        :options='storeCategoryList'
        :close-on-select="!isCategoryMultiple"
        :clear-on-select="false"
        :preserve-search="true"
        label="name"
        trackBy="id"
        selectedLabel='name'
        v-model='selectedCategories'
        :showLabels="false"
        :multiple='isCategoryMultiple'
    />
</template>

<script>
import { Multiselect } from 'vue-multiselect';

export default {
    name: 'StoreCategory',

    components: {
        Multiselect
    },

    props: {
        categories: {
            type: Array
        },
        errors: {
            type: Array,
            require: false
        }
    },

    data() {
        return {
            storeCategoryList: [],
            selectedCategories: [],
            isCategoryMultiple: false
        }
    },

    watch: {
        'selectedCategories'( value ) {
            if ( this.selectedCategories === null ) {
                this.selectedCategories = [];
            }
            if ( ! this.isCategoryMultiple && ! Array.isArray( this.selectedCategories ) ) {
                this.$emit( 'categories', [ this.selectedCategories ] );
            } else {
                this.$emit( 'categories', this.selectedCategories );
            }
        }
    },

    created() {
        this.setStoreCategories();
        this.storeCategoryIds = this.categories;
    },

    methods: {
        setStoreCategories() {
            if( dokan.store_category_type !== 'none' ) {
                dokan.api.get('/store-categories?per_page=50', {})
                    .then( ( response, status, xhr ) => {
                        let storeCategoryIds = [];
                        this.categories.map( ( value ) => { storeCategoryIds.push( value.id ) } );
                        this.storeCategoryList = response;
                        this.selectedCategories = this.storeCategoryList.filter( ( category ) => {
                            return storeCategoryIds.includes( category.id );
                        } );
                        this.isCategoryMultiple = ( 'multiple' === xhr.getResponseHeader( 'X-WP-Store-Category-Type' ) );
                    } );
            }
        }
    }
}

</script>

<style>
.dokan-form-input.dokan-store-category{
    width: 103% !important;
    border: 0 !important;
    padding: 0 !important;
}

#store-category{
    border: 0;
}
</style>
