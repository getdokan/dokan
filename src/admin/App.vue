<template>
    <div id="vue-backend-app">
        <AdminNotice></AdminNotice>
        <router-view />
        <notifications position="bottom right"/>
    </div>
</template>

<script>
import AdminNotice from "./components/AdminNotice.vue";

export default {
    name: 'App',

    components: {
        AdminNotice
    }
};
</script>

<style>

</style>
