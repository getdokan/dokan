<template>
    <div id="vue-backend-app">
        <router-view />

        <template v-if="customComponents">
            <component
               :key="index"
               :is="customComponent"
               v-for="( customComponent, index ) in customComponents"/>
          </template>

        <notifications position="bottom right"/>
    </div>
</template>

<script>
export default {
    name: 'App',
    data() {
        return {
            customComponents : dokan.hooks.applyFilters( 'getDokanAppCustomComponents', [] ),
        }
    }
};
</script>

<style>

</style>
