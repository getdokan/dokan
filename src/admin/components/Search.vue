<template>
    <form @submit.prevent="search">
        <p class="search-box">
          <input type="search" id="post-search-input" name="s" v-model="searchItems">
          <button type="submit" class="button">
            {{ title }}
          </button>
        </p>
    </form>
</template>

<script>
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
            searchItems: ''
        };
    },

    methods: {
        search() {
            this.$emit('searched', this.searchItems)
        }
    }
};
</script>