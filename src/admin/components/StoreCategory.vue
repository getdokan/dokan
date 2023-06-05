<template>
    <Multiselect
        type='text'
        id="store-category"
        class="dokan-form-input dokan-store-category"
        :options='storeCategoryList'
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        label="name"
        trackBy="id"
        selectedLabel='name'
        v-model='selectedCategories'
        :showLabels="false"
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
            selectedCategories: []
        }
    },

    watch: {
        'selectedCategories'( value ) {
            this.$emit('categories', this.selectedCategories);
        }
    },

    created() {
        this.storeCategoryIds = this.categories;
        this.setStoreCategories();
    },

    methods: {
        setStoreCategories() {
            dokan.api.get('/store-categories?per_page=50', {})
                .then( ( response ) => {
                    let storeCategoryIds = [];
                    this.categories.map( ( value ) => { storeCategoryIds.push( value.id ) } );
                    this.storeCategoryList = response;
                    this.selectedCategories = this.storeCategoryList.filter( ( category ) => {
                        return storeCategoryIds.includes( category.id );
                    } );
                } );
        }
    }
}

</script>
