<template>
    <div class="app-settings">
        <h1>Withdraw Requests</h1>

        <list-table
            :columns="columns"
            :rows="requests"
            :actions="actions"
            :show-cb="showCb"
            :bulk-actions="bulkActions"
        ></list-table>
    </div>
</template>

<script>
let ListTable = dokan_get_lib('ListTable');

export default {

    name: 'Withdraw',

    components: {
        ListTable,
    },

    data () {
        return {
            showCb: true,
            columns: {
                'seller': { label: 'Seller' },
                'amount': { label: 'Amount' },
                'method': { label: 'Method' },
                'method_details': { label: 'Method Details' },
                'note': { label: 'Note' },
                'ip': { label: 'IP' },
                'date': { label: 'date' },
            },
            requests: [],
            actionColumn: 'seller',
            actions: [
                {
                    key: 'approve',
                    label: 'Approve'
                },
                {
                    key: 'cancel',
                    label: 'Cancel'
                },
                {
                    key: 'trash',
                    label: 'Delete'
                }
            ],
            bulkActions: [
                {
                    key: 'approve',
                    label: 'Approve Requests'
                },
                {
                    key: 'trash',
                    label: 'Delete'
                },
            ],
        };
    }
};
</script>

<style lang="css" scoped>
</style>
