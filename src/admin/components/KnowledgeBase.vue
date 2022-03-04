<template>
    <div class="dokan-knowledge-base">
        <div class="dokan-kb-header">
            <h3 class="dokan-kb-header-title">{{ __( 'Dokan Knowledge Base', 'dokan-lite' ) }}</h3>
            <p class="dokan-kb-header-info">{{ __( 'Learn the ins and outs of Module page at Dokan', 'dokan-lite' ) }}</p>
        </div>

<!--        <div v-if="loading" class="dokan-kb-content lds-hourglass"></div>-->
        <div v-if="loading" class="dokan-kb-content lds-ripple"><div></div><div></div></div>
        <div v-else class="dokan-kb-content">
            <div class="dokan-kb-article-list">
                <div class="dokan-kb-article-header">
                    <div class="dokan-kb-article-header-content">
                        <div class="dokan-kb-article-header-icon">
                            <svg width="10" height="15" viewBox="0 0 10 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.5542 10.8689C2.58524 11.1172 2.61628 11.3345 2.61628 11.5829H6.77601C6.77601 11.3345 6.80705 11.0862 6.83809 10.8689H2.5542Z" fill="#2C75A9"/>
                                <path d="M2.61572 12.2036V13.2901C2.61572 13.4764 2.73989 13.6005 2.92615 13.6005H3.01928C3.17449 14.3766 3.88847 14.9975 4.69558 14.9975C5.53374 14.9975 6.21668 14.4076 6.37189 13.6005H6.46502C6.65128 13.6005 6.77545 13.4764 6.77545 13.2901V12.2036H2.61572Z" fill="#2C75A9"/>
                                <path d="M4.4475 0.407385C2.24347 0.531556 0.411946 2.26995 0.163604 4.47398C0.0394331 5.71569 0.411946 6.92635 1.18801 7.85764C1.77782 8.57162 2.21242 9.37873 2.42972 10.2169H6.96196C7.17926 9.37873 7.61385 8.54057 8.20367 7.82659C8.88661 7.01948 9.25912 5.99507 9.25912 4.93962C9.25912 2.36308 7.05509 0.283214 4.4475 0.407385Z" fill="#2C75A9"/>
                            </svg>
                        </div>
                        <h4 class="dokan-kb-article-header-title">{{ __( 'Dokan Blog', 'dokan-lite' ) }}</h4>
                    </div>
                    <div class="dokan-kb-article-header-nav">
                        <span v-on:click="navigateArticle('back')" class="dashicons dashicons-arrow-left-alt2 dokan-kb-article-header-nav-item"></span>
                        <span v-on:click="navigateArticle('next')" class="dashicons dashicons-arrow-right-alt2 dokan-kb-article-header-nav-item"></span>
                    </div>
                </div>
                <div class="dokan-kb-article-item" v-for="article in articles.slice( articlePosition, 2 + articlePosition )" :key="article.id">
                    <a :href="article.link" target="_blank">
                        <div class="dokan-kb-article-image">
                            <img :src="article.featured_image.full[0]" :alt="article.title.rendered">
                        </div>
                        <div class="dokan-kb-article-content">
                            <h5 class="dokan-kb-article-title">{{ article.title.rendered }}</h5>
                            <span v-for="category in article.categories" class="dokan-kb-article-category">{{ category.name }}</span>
                        </div>
                    </a>
                </div>
            </div>
            <div class="dokan-kb-docs-list">
                <div class="dokan-kb-docs-header">
                    <div class="dokan-kb-docs-header-content">
                        <div class="dokan-kb-docs-header-icon">
                            <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.02441 0.914795V3.85273H9.96235L7.02441 0.914795Z" fill="#2C75A9"/>
                                <path d="M6.6281 4.64506C6.40934 4.64506 6.23183 4.46755 6.23183 4.24879V0.682373H1.08036C0.861594 0.682373 0.684082 0.859885 0.684082 1.07865V12.4383C0.684082 12.6571 0.861594 12.8346 1.08036 12.8346H9.79824C10.017 12.8346 10.1945 12.6571 10.1945 12.4383V4.64506H6.6281ZM5.83557 10.457H2.66541C2.44665 10.457 2.26914 10.2795 2.26914 10.0607C2.26914 9.84193 2.44665 9.66442 2.66541 9.66442H5.83555C6.05431 9.66442 6.23183 9.84193 6.23183 10.0607C6.23183 10.2795 6.05434 10.457 5.83557 10.457ZM8.21318 8.87189H2.66541C2.44665 8.87189 2.26914 8.69438 2.26914 8.47562C2.26914 8.25685 2.44665 8.07934 2.66541 8.07934H8.21318C8.43195 8.07934 8.60946 8.25685 8.60946 8.47562C8.60946 8.69438 8.43195 8.87189 8.21318 8.87189ZM8.21318 7.28684H2.66541C2.44665 7.28684 2.26914 7.10932 2.26914 6.89056C2.26914 6.6718 2.44665 6.49429 2.66541 6.49429H8.21318C8.43195 6.49429 8.60946 6.6718 8.60946 6.89056C8.60944 7.10932 8.43195 7.28684 8.21318 7.28684Z" fill="#2C75A9"/>
                            </svg>
                        </div>
                        <h4 class="dokan-kb-docs-header-title">{{ __( 'Basic Doc', 'dokan-lite' ) }}</h4>
                    </div>
                </div>
                <ol class="dokan-kb-docs-ordered-list">
                    <div class="dokan-kb-doc-item" v-for="doc in docs.slice(0,4)">
                        <li class="dokan-kb-doc-title">
                            <a :href="doc.guid.rendered" target="_blank">{{ doc.title.rendered }}</a>
                        </li>
                    </div>
                </ol>
                <div class="dokan-kb-docs-more-link">
                    <a href="https://wedevs.com/docs/dokan/" target="_blank">{{ __( 'View All', 'dokan-lite' ) }}</a>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "KnowledgeBase",
    data() {
        return {
            base: 'https://wedevs.com/wp-json/wp/v2',
            articlePosition: 0,
            loading: true,
            articles: [],
            docs: []
        };
    },
    created() {
        this.$watch(
            () => this.$route.name,
            (currentPage, previousPage) => {
                this.getKnowledgeBase();
            }
        );
        this.getKnowledgeBase();
    },
    methods: {
        getCurrentPage() {
            return this.$route.name;
        },
        getKnowledgeBase() {
            this.loading = true;
            this.articlePosition = 0;

            axios.get( this.base + '/posts',{ params: { per_page: 2 } } )
                .then( response => {
                    this.articles = response.data;
                    this.loading = false;
                } )
                .catch( error => {
                    console.log( error );
                } );

            axios.get( this.base + '/docs',{ params: { per_page: 4 } } )
                .then( response => {
                    this.docs = response.data;
                    this.loading = false;
                } )
                .catch( error => {
                    console.log( error );
                } );

        },
        navigateArticle( direction ){
            if ('next' === direction) {
                this.articlePosition = this.articlePosition + 2;
            } else {
                this.articlePosition = this.articlePosition - 2;
            }

            if (this.articlePosition < 0) {
                this.articlePosition = this.articles.length - 2;
            } else if (this.articlePosition >= this.articles.length) {
                this.articlePosition = 0;
            }
        },
    },
    computed: {
    },

}
</script>

<style lang="less">
    .dokan-knowledge-base {
        background: #fff;
        border: 1px solid #E2E2E2;
        border-radius: 3px;
        margin-top: 20px;
        font-family: "SF Pro Text", sans-serif;

        .dokan-kb-header {
            padding: 20px 25px;
            border-bottom: 1px solid #E2E2E2;

            .dokan-kb-header-title {
                font-size: 19px;
                font-weight: 600;
                line-height: 1.1;
                margin: 0;
                padding: 0;
            }
            .dokan-kb-header-info {
                color: #788383;
                line-height: 1.58;
                font-size: 12px;
                font-weight: 400;
                margin: 0;
                padding: 0;
            }
        }
        .dokan-kb-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            padding: 30px 25px;

            .dokan-kb-article-list {
                width: calc(50% - 31px);
                padding-right: 30px;
                border-right: 1px solid #E2E2E2;

                .dokan-kb-article-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 25px;

                    .dokan-kb-article-header-content {
                        display: flex;
                        align-items: center;

                        .dokan-kb-article-header-icon {
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(44, 117, 169, 0.1);
                            svg {}
                        }

                        .dokan-kb-article-header-title {
                            margin: 0 0 0 10px;
                            padding: 0;
                            font-size: 18px;
                            font-weight: 700;
                            line-height: 1.02;
                        }
                    }
                    .dokan-kb-article-header-nav {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #B5BFC9;
                        box-sizing: border-box;
                        border-radius: 3px;
                        padding: 3px;
                        .dokan-kb-article-header-nav-item {
                            display:block;
                            padding: 0 5px;
                            line-height: 1;
                            color: #B5BFC9;

                            &:first-child {
                                border-right: 1px solid #B5BFC9;
                            }
                            &:hover {
                                background: #F5F5F5;
                                cursor: pointer;
                            }
                        }
                    }


                }
                .dokan-kb-article-item {
                    margin-bottom: 30px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    a {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        text-decoration: none;
                        transition: all 0.3s ease;

                        .dokan-kb-article-image {
                            flex: 2;
                            min-height: 90px;
                            img {
                                max-width: 100%;
                                height: auto;
                                border-radius: 3px;
                            }
                        }
                        .dokan-kb-article-content {
                            flex: 5;
                            padding-left: 15px;

                            .dokan-kb-article-title {
                                font-size: 16px;
                                line-height: 1.3;
                                margin: 0;
                                padding: 0 0 13px 0;
                                color: #000;
                                font-weight: 500;
                                letter-spacing: 0.145455px;
                            }
                            .dokan-kb-article-category {
                                display: inline-flex;
                                padding: 5px 10px;
                                font-size: 11px;
                                line-height: 1.1;
                                margin-right: 10px;
                                border-radius: 10px;
                                background: #dfe2ff;
                            }
                        }
                    }

                }
            }
            .dokan-kb-docs-list {
                width: calc(50% - 30px);
                padding-left: 30px;

                .dokan-kb-docs-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 25px;

                    .dokan-kb-docs-header-content {
                        display: flex;
                        align-items: center;

                        .dokan-kb-docs-header-icon {
                            width: 30px;
                            height: 30px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: rgba(44, 117, 169, 0.1);
                            svg {}
                        }

                        .dokan-kb-docs-header-title {
                            margin: 0 0 0 10px;
                            padding: 0;
                            font-size: 18px;
                            font-weight: 700;
                            line-height: 1.02;
                        }
                    }
                }
                .dokan-kb-docs-ordered-list {
                    margin:0;
                    padding:0;
                    list-style: inside decimal;

                    .dokan-kb-doc-item {
                        .dokan-kb-doc-title {
                            font-size: 16px;
                            line-height: 1.31;
                            color: #000;
                            font-weight: 500;
                            padding: 5px 15px;
                            margin: 0;
                            border: 1px solid #fff;

                            a {
                                font-size: 16px;
                                line-height: 1.31;
                                color: #000;
                                text-decoration: none;
                                box-sizing: border-box;
                                font-weight: 500;
                            }

                            &:hover {
                                box-sizing: border-box;
                                border-radius: 3px;
                                border: 1px solid #E2E2E2;
                                color: #2C75A9;
                                font-weight: 500;
                            }
                        }
                    }
                }
                .dokan-kb-docs-more-link {
                    margin-top: 15px;
                    margin-left: 16px;

                    a {
                        font-size: 13px;
                        line-height: 1.31;
                        color: #1A9ED4;
                        text-decoration: underline;
                        box-sizing: border-box;
                        font-weight: 500;
                    }
                }

            }
        }
    }

    .lds-ripple {
        display: inline-block;
        position: relative;
        width: 80px;
        height: 80px;
        margin: 50px auto;
    }
    .lds-ripple div {
        position: absolute;
        border: 4px solid #333;
        opacity: 1;
        border-radius: 50%;
        animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }
    .lds-ripple div:nth-child(2) {
        animation-delay: -0.5s;
    }
    @keyframes lds-ripple {
        0% {
            top: 36px;
            left: 36px;
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            top: 0px;
            left: 0px;
            width: 72px;
            height: 72px;
            opacity: 0;
        }
    }

    @media only screen and (max-width: 768px) {
        .dokan-knowledge-base .dokan-kb-content .dokan-kb-article-list,
        .dokan-knowledge-base .dokan-kb-content .dokan-kb-docs-list {
            width: 100%;
            padding: 0;
            margin: 0;
        }

        .dokan-knowledge-base .dokan-kb-content .dokan-kb-article-list {
            border-right: none;
            padding-bottom: 15px;
            margin-bottom: 15px;
            border-bottom: 1px solid #E2E2E2;
        }
    }

    @media only screen and (max-width: 425px) {
        .dokan-knowledge-base .dokan-kb-content .dokan-kb-article-list .dokan-kb-article-item a {
            display: block;
            .dokan-kb-article-image {
                margin-bottom: 15px;
            }
        }
    }
</style>
