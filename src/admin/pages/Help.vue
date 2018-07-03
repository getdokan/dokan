<template>
    <div class="dokan-help-page">
        <h1>{{ __( 'Help', 'dokan-lite' ) }}</h1>

        <div class="section-wrapper" v-if="docs !== null">
            <postbox v-for="(section, index) in docs" :title="section.title" :key="index">
                <ul>
                    <li v-for="item in section.questions">
                        <span class="dashicons dashicons-media-text"></span>
                        <a :href="item.link + '?utm_source=wp-admin&utm_medium=dokan-help-page'" target="_blank">{{ item.title }}</a>
                    </li>
                </ul>
            </postbox>
        </div>
        <div class="loading" v-else>
            <loading></loading>
        </div>
    </div>
</template>

<script>
let Postbox = dokan_get_lib('Postbox');
let Loading = dokan_get_lib('Loading');

export default {

    name: 'Help',

    components: {
        Postbox,
        Loading,
    },

    data () {
        return {
            docs: null
        };
    },

    created() {
        this.fetch();
    },

    methods: {

        fetch() {
            dokan.api.get('/admin/help')
            .done(response => {
                this.docs = response
            });
        }
    }
};
</script>

<style lang="less">
.dokan-help-page {

    .section-wrapper {
        margin-top: 15px;

        .dokan-postbox {
            width: ~"calc(33% - 2em)";
            margin: 0 2% 15px 0;
            float: left;

            &:nth-child(3n+1) {
                clear: both;
            }

            .dashicons {
                color: #ccc;
            }

            a {
                text-decoration: none;
            }

            .inside, ul {
                margin-bottom: 0;
            }
        }
    }

    .loading {
        width: 100%;
        text-align: center;
        margin-top: 100px;
    }
}
</style>
