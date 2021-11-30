<template>
    <AdminNotice :interval="10000" endpoint="promo-notices"></AdminNotice>
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
