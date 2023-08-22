<template>
    <div>
        <div class="tabs">
          <ul>
            <li v-for="tab in tabs" :class="{ 'is-active': tab.isActive }">
                <a :href="tab.href" @click="selectTab(tab)">{{ tab.name }}</a>
            </li>
          </ul>
        </div>

        <div class="tabs-details">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import Tab from './Tab.vue';
export default {
    name: 'Tabs',
    components: {
        Tab
    },
    props: {
        fieldData: Object
    },
    data() {
        return {tabs: [] };
    },

    created() {
        this.tabs = this.$children;
        // console.log("FieldData");
        // console.log(this.fieldData);

    },
    methods: {
        selectTab(selectedTab) {
            this.tabs.forEach(tab => {
                tab.isActive = (tab.name == selectedTab.name);
            });
        }
    }
}
</script>
