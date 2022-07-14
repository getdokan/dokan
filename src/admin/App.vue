<template>
    <div id="vue-backend-app">
        <router-view />
        <KnowledgeBase />
        <notifications position="bottom right"/>
    </div>
</template>

<script>
import KnowledgeBase from "admin/components/KnowledgeBase.vue";
export default {
    name: 'App',
    components: {KnowledgeBase}
};
</script>

<style>

</style>
