<template>
    <AdminNotice endpoint="notices/global"></AdminNotice>
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
