<template>
    <div class="dokan-knowledge-base">
        <div class="dokan-knowledge-base-header">
            <h5>{{ __( 'Dokan knowledge base', 'dokan-lite' ) }}</h5>
            <p>{{ __( 'Learn the ins and outs of successful marketing from the experts at Dokan.', 'dokan-lite' ) }}</p>
        </div>
        <div class="dokan-knowledge-base-body">
            <slick ref="slick" :options="slickOptions">

                <a href="#" class="dokan-knowledge-base-post" v-for="post in posts">
                    <div class="dokan-knowledge-base-post-img">
                        <img :src="post.image" alt="">
                    </div>

                    <div class="dokan-knowledge-base-post-details">
                        <h4>{{ post.title }}</h4>
                        <p>{{ __( 'By', 'dokan-lite' ) }} {{ post.author }}</p>
                    </div>
                </a>
            </slick>
            <div class="dokan-knowledge-base-arrow">
                <button @click="$refs.slick.prev()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-hidden="true" focusable="false"><path d="M14.6 7l-1.2-1L8 12l5.4 6 1.2-1-4.6-5z"></path></svg>
                </button>
                <button @click="$refs.slick.next()">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-hidden="true" focusable="false"><path d="M10.6 6L9.4 7l4.6 5-4.6 5 1.2 1 5.4-6z"></path></svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Slick from "vue-slick";

export default {
    components: {
        Slick,
    },
    data(){
        return {
            slickOptions: {
                //options can be used from the plugin documentation
                dots: false,
                arrows: false,
                focusOnSelect: true,
                infinite: true,
                speed: 500,
                slidesToShow: 2,
                slidesToScroll: 2,
                touchThreshold: 5,
                responsive: [
                    {
                        breakpoint: 961,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                        }
                    }
                ]
            },
            posts: [
                {
                    "title": "How to Grow Your Store with Omnichannel Marketing",
                    "author": "Elina Vilk",
                    "image": 'https://woocommerce.com/wp-content/uploads/2021/11/blog-fb-Cross-Channel@2x.jpg?resize=650,340&crop=1',
                },
                {
                    "title": "Top Nine SEO Tips for eCommerce Stores",
                    "author": "Tom Ewer",
                    "image": 'https://woocommerce.com/wp-content/uploads/2014/07/blog-fb-SEO-Tips@2x.jpg?resize=650,340&crop=1',
                },
                {
                    "title": "How to Create a Regular Flow of Social Media Content",
                    "author": "Elina Vilk",
                    "image": 'https://woocommerce.com/wp-content/uploads/2021/10/blog-fb-Social-Content@2x.jpg?resize=650,340&crop=1',
                },
                {
                    "title": "Google Ads Basics: How to Create an Effective Google Ads Strategy",
                    "author": "Elina Vilk",
                    "image": 'https://woocommerce.com/wp-content/uploads/2014/07/blog-fb-SEO-Tips@2x.jpg?resize=650,340&crop=1',
                },
            ],
        }
    }
}
</script>

<style lang="less"  scoped>
    .dokan-knowledge-base {
        margin-top: 22px;
        border-radius: 2px;
        background-color: #fff;
        box-shadow: 0 0 0 1px #d8d8d8;

        @media only screen and (max-width: 960px) {
            margin-top: 78px;
        }

        .dokan-knowledge-base-header {
            padding: 16px 24px;
            box-sizing: border-box;
            border-bottom: 1px solid #d8d8d8;

            h5 {
                margin: 0;
                color: #1e1e1e;
                font-size: 1.25rem;
                font-weight: normal;
                line-height: 28px;
            }

            p {
                color: #757575;
                font-size: .875rem;
                font-weight: 400;
                margin-top: 4px;
                margin-bottom: 0;
                line-height: 20px;
            }
        }

        .dokan-knowledge-base-body {
            padding: 16px 24px;
            box-sizing: border-box;

            .dokan-knowledge-base-post {
                text-decoration: none;

                @media only screen and (min-width: 961px) {
                    display: flex!important;
                }

                &:hover {
                    .dokan-knowledge-base-post-details h4 {
                        color: #007cba;
                    }
                }

                .dokan-knowledge-base-post-img {
                    width: 100%;
                    overflow: hidden;
                    flex: none;
                    border-radius: 3px;

                    @media only screen and (min-width: 961px) {
                        width: 144px;
                        height: 103px;
                        margin-right: 16px;
                        padding-bottom: 0;
                    }

                    img {
                        width: 100%;

                        @media only screen and (min-width: 961px) {
                            height: 100%;
                            width: auto;
                        }
                    }
                }

                .dokan-knowledge-base-post-details {
                    h4 {
                        margin-top: 0;
                        margin-bottom: 6px;
                        color: #1e1e1e;
                        font-size: 1rem;
                        font-weight: 600;
                        line-height: 24px;
                        white-space: normal;
                        transition: color .2s ease;

                        @media only screen and (max-width: 960px) {
                            margin-top: 10px;
                        }
                    }

                    p {
                        color: #757575;
                        font-size: .75rem;
                        line-height: 17px;
                        margin: 0;
                        padding: 0;
                    }
                }
            }

            .dokan-knowledge-base-arrow {
                display: inline-flex;
                align-items: baseline;
                border: 1px solid #b5bfc9;
                border-radius: 4px;
                background: #f0f2f4;

                @media only screen and (min-width: 961px) {
                    margin-top: 14px;
                }

                button {
                    display: inline-flex;
                    font-size: 13px;
                    font-weight: normal;
                    margin: 0;
                    border: 0;
                    color: #24292d;
                    cursor: pointer;
                    background: none;
                    transition: box-shadow 0.1s linear;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    height: 30px;
                    width: 32px;
                    padding: 4px;

                    &:first-child {
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                        border-right: 2px solid #d3d9de;
                    }

                    svg {
                        fill: currentColor;
                        outline: none;
                    }
                }
            }
        }
    }
</style>
