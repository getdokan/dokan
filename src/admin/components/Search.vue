<template>
    <p class="search-box">
      <input type="search" id="post-search-input" name="s" v-model="searchItems" :placeholder="title">
    </p>
</template>

<script>

import { debounce } from 'debounce';

export default {

    name: 'Search',
    props: {
        title: {
            type: String,
            default: 'Search'
        }
    },

    data() {
        return {
            delay: 500,
            searchItems: ''
        };
    },

    watch: {
        searchItems() {
            this.makeDelay();
        }
    },

    created() {
        this.makeDelay = debounce(this.doSearch, this.delay);
    },

    methods: {
        doSearch() {
            this.$emit('searched', this.searchItems);
        }
    }
};
</script>