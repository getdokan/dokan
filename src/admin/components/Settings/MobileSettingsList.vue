<template>
    <div>
        <div
            v-if="isOpen"
            class="fixed inset-0 bg-black bg-opacity-50 z-[999999]"
            @click="$emit('close')"
        ></div>

        <!-- Drawer -->
        <div
            :class="[
                'fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-white z-[1000000] transform transition-transform duration-300 ease-in-out',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            ]"
        >
            <!-- Drawer Header -->
            <div class="flex items-center justify-between px-4 md:pt-4 pt-8 border-b mt-8 mb-4">
                <h2 class="text-lg font-bold m-0 p-0">{{ __('Settings Menu', 'dokan-lite') }}</h2>
                <button
                    class="bg-none border-0 p-1"
                    @click="$emit('close')"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Settings List -->
            <div class="overflow-y-auto h-full pb-4 box-border">
                <template v-for="section in sections">
                    <div
                        :key="section.id"
                        :class="[
                            'flex items-center px-4 py-2 cursor-pointer border-b border-gray-100',
                            { 'bg-blue-50 border-l-4 border-l-blue-500': currentTab === section.id }
                        ]"
                        @click="handleTabChange(section)"
                    >
                        <img
                            :src="section.icon_url"
                            :alt="section.settings_title"
                            class="w-5 h-5 mr-3"
                        />
                        <div class="flex-1">
                            <h3 class="text-sm font-semibold">{{ section.title }}</h3>
                            <p class="text-xs text-gray-600">{{ section.description }}</p>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'MobileSettingsDrawer',

    props: {
        isOpen: {
            type: Boolean,
            required: true
        },
        sections: {
            type: Array,
            required: true
        },
        currentTab: {
            type: String,
            required: true
        }
    },

    methods: {
        handleTabChange(section) {
            this.$emit('change-tab', section);
            this.$emit('close');
        }
    },
}
</script>
