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
        :searchable="true"
        :loading="isLoading"
        :internal-search="false"
        @search-change="handleSearchChange"
    />
</template>

<script>
import { Multiselect } from 'vue-multiselect';
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";

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
            isCategoryMultiple: false,
            isLoading: false,
            initialSelectedCategories: [],
            debounce: null,
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
        // include
        const ids = this.categories.map( item => {
            return item.id;
        } );

        this.setStoreCategories( '', ids, true );
        this.storeCategoryIds = this.categories;
    },

    methods: {
        /**
         * Debounces the search input to prevent excessive API calls.
         *
         * @param {string} query
         */
        handleSearchChange( query ) {
            if ( this.debounce ) {
                clearTimeout( this.debounce );
            }
            this.debounce = setTimeout( () => {
                this.setStoreCategories( query );
            }, 500 ); // 500ms delay
        },

        setStoreCategories( value = '', include = [], initial = false ) {
            if( dokan.store_category_type !== 'none' ) {
                this.isLoading = true

                const params = { per_page: '50' };
                if ( value ) {
                    params.search = value;
                }

                // This will request categories including the selected categories.
                if ( Array.isArray( include ) && include.length ) {
                    params.include = include;
                }

                apiFetch( {
                    path: addQueryArgs( '/dokan/v1/store-categories', params ),
                    parse: false
                } ).then( ( response ) => {
                    // Get headers
                    const categoryType = response.headers.get( 'X-WP-Store-Category-Type' );

                    // Parse JSON data
                    response.json().then( ( data ) => {
                        let storeCategoryIds = [];
                        this.categories.map( ( value ) => {
                            storeCategoryIds.push( value.id )
                        } );

                        this.storeCategoryList = data;
                        const tempSelectedCategories = this.storeCategoryList.filter( ( category ) => {
                            return storeCategoryIds.includes( category.id );
                        } );
                        this.isCategoryMultiple = ( 'multiple' === categoryType );
                        this.selectedCategories = tempSelectedCategories;
                        this.isLoading = false

                        if (initial) {
                            // saving the initial selected categories for later usage.
                            this.initialSelectedCategories = tempSelectedCategories;
                        } else if ( ! initial && ! tempSelectedCategories.length ) {
                            /**
                             * Here when we search and request the categories and if the initial selected category does not
                             * exist in the response categories then we are setting the initial selected categories as selected categories, else in the frontend the selected categories will show empty.
                             *
                             * And we're also adding the initial selected category in the category list if the initial selected category does not exist in the response categories.
                             */
                            this.selectedCategories = this.initialSelectedCategories;
                            this.storeCategoryList = [ ...this.storeCategoryList, ...this.initialSelectedCategories ];
                        }
                    } );
                } ).catch( ( error ) => {
                    console.error( 'Error fetching categories:', error );

                    this.isLoading = false
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
