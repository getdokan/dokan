<template>
    <AdminNotice endpoint="global-admin-notices"></AdminNotice>
</template>

<script>
import AdminNotice from "../admin/components/AdminNotice.vue";

export default {
    name: "App",

    components: {
        AdminNotice
    }
}
</script>
