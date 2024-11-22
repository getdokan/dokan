<script setup>

import AdminNotice from "admin/components/AdminNotice.vue";
</script>

<template>
    <AdminNotice
        context="global"
        :interval="10000"
        endpoint="admin"
    />

</template>

<style scoped lang="less">

</style>
