<template>
    <div class="dokan-help-page">
        <div class="section-wrapper">
            <div class="dokan-notice">
                <h2></h2>
                <AdminNotice></AdminNotice>
                <UpgradeBanner v-if="! hasPro"></UpgradeBanner>
            </div>
            <div class="change-log" :class="hasPro ? 'pro-change-log' : 'lite-change-log'" id="change-log">
                <h3>{{ __( 'Dokan Changelog', 'dokan-lite' ) }}</h3>
                <div v-if="hasPro" class="switch-button-wrap">
                    <transition-group name="fade">
                        <span :key="1" class="active" :style="isActivePackage( 'pro' )  ? 'right: 0' : 'left: 0'"></span>
                        <button :key="2" class="switch-button lite" :class="{ 'active-case' : isActivePackage( 'lite' ) }" @click="switchPackage( 'lite' )">{{ __( 'Lite', 'dokan-lite' ) }}</button>
                        <button :key="3" class="switch-button pro" :class="{ 'active-case' : isActivePackage( 'pro' )  }" @click="switchPackage( 'pro' )">{{ __( 'PRO', 'dokan-lite' ) }}</button>
                    </transition-group>
                </div>
                <div v-if="! loading" class="jump-version">
                    <p>{{ __( 'Jump to version', 'dokan-lite' ) }}... <span class="dashicons dashicons-arrow-down-alt2"></span></p>
                    <div class="version-menu">
                        <div class="version-dropdown">
                            <ul v-show="isActivePackage( 'lite' )">
                                <li v-for="(version, index) in lite_versions" :class="{ 'current' : isCurrentVersion( `lite-${index}` ) }" @click="jumpVersion( `lite-${index}` )">
                                    {{ version.version }}
                                    <span v-if="0 === index">({{ __( 'Latest', 'dokan-lite' ) }})</span>
                                    <span v-if="isCurrentVersion( `lite-${index}` ) && 0 !== index">({{ __( 'Current', 'dokan-lite' ) }})</span>
                                </li>
                            </ul>
                            <ul v-show="isActivePackage( 'pro' )">
                                <li v-for="( version, index ) in pro_versions" :class="{ 'current' : isCurrentVersion( `pro-${index}` ) }" @click="jumpVersion( `pro-${index}` )">
                                    {{ version.version }}
                                    <span v-if="0 === index">({{ __( 'Latest', 'dokan-lite' ) }})</span>
                                    <span v-if="isCurrentVersion( `pro-${index}` ) && 0 !== index">({{ __( 'Current', 'dokan-lite' ) }})</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="loading" v-else>
                    <loading></loading>
                </div>
            </div>

            <div class="version-list">
                <div v-show="isActivePackage( 'lite' )" class="version" v-for="( version, index ) in lite_versions" :class="0 === index ? 'latest-version' : 'old-version'" :id="`lite-${index}`">
                    <div class="version-number">
                        <h4>{{ version.version }}</h4>
                        <p>{{ formatReleaseDate( version.released ) }} <label v-if="0 === index">{{ __( 'Latest', 'dokan-lite' ) }}</label> </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion( `lite-${index}` ) ? activeVersionBorder : ''">
                        <transition-group name="slide" tag="div">
                            <div class="feature-list" v-for="( changes, key, i ) in version.changes" :key="`index-${i}`" v-if="( 0 === index ) || ( i < 1 ) || isOpenVersion( `lite-${index}` )">
                                <span class="feature-badge" :class="badgeClass( key )">{{ key }}</span>
                                <div class="feature" v-for="( change, j ) in changes" v-if="( 0 === index ) || ( j < 2 ) || isOpenVersion( `lite-${index}` )">
                                    <h5>{{ change.title }}</h5>
                                    <div v-html="change.description"></div>
                                </div>
                            </div>
                        </transition-group>
                        <div class="continue-reading" v-if="0 !== index && Object.keys( version.changes ).length > 1">
                            <a href="#" @click.prevent="toggleReading( `lite-${index}` )">{{ isOpenVersion( `lite-${index}` ) ? __( 'View Less...', 'dokan-lite' )  :  __( 'Continue reading...', 'dokan-lite' ) }}</a>
                        </div>
                    </div>
                </div>
                <div v-show="isActivePackage( 'pro' )" class="version" v-for="( version, index ) in pro_versions" :class="0 === index ? 'latest-version' : 'old-version'" :id="`pro-${index}`">
                    <div class="version-number">
                        <h4>{{ version.version }}</h4>
                        <p>{{ formatReleaseDate( version.released ) }} <label v-if="0 === index">{{ __( 'Latest', 'dokan-lite' ) }}</label> </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion( `pro-${index}` ) ? activeVersionBorder : ''">
                        <transition-group name="slide" tag="div">
                            <div class="feature-list" v-for="( changes, key, i ) in version.changes" :key="`index-${i}`" v-if="( 0 === index ) || ( i < 1 ) || isOpenVersion( `pro-${index}` )">
                                <span class="feature-badge" :class="badgeClass( key )">{{ key }}</span>
                                <div class="feature" v-for="( change, j ) in changes" v-if="( 0 === index ) || j < 2 || isOpenVersion( `pro-${index}` )">
                                    <h5>{{ change.title }}</h5>
                                    <div v-html="change.description"></div>
                                </div>
                            </div>
                        </transition-group>
                        <div class="continue-reading" v-if="0 !== index && Object.keys( version.changes ).length > 1">
                            <a href="#" @click.prevent="toggleReading( `pro-${index}` )">{{ isOpenVersion( `pro-${index}` ) ? __( 'View Less...', 'dokan-lite' )  :  __( 'Continue reading...', 'dokan-lite' ) }}</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <button @click="scrollTop" class="scroll-to-top" :style="scrollPosition > 300 ? 'opacity: 1; visibility: visible' : ''">
            <span class="dashicons dashicons-arrow-up-alt"></span>
        </button>
    </div>
</template>

<script>

let Loading     = dokan_get_lib('Loading');
let AdminNotice = dokan_get_lib('AdminNotice');

import $ from 'jquery';
import UpgradeBanner from "admin/components/UpgradeBanner.vue";

export default {
    name: 'ChangeLog',

    components: {
        Loading,
        UpgradeBanner,
        AdminNotice,
    },

    data () {
        return {
            active_package: 'lite',
            current_version: 'lite-0',
            scrollPosition: null,
            openVersions: [],
            activeVersionBorder: '',
            lite_versions: null,
            pro_versions: null,
            loading: false,
            hasPro: dokan.hasPro ? true : false,
        };
    },

    methods: {
        formatReleaseDate( date ) {
            return $.datepicker.formatDate( dokan_get_i18n_date_format(), new Date( date ) );
        },

        badgeClass( key ) {
            switch ( key ) {
                case 'New':
                case 'New Module':
                case 'New Feature':
                    return  'badge-green';
                case 'Fix':
                    return  'badge-red';
                default:
                    return 'badge-blue';
            }
        },

        getDokanLiteChangeLog() {
            this.loading = true;
            dokan.api.get( '/admin/changelog/lite' )
                .done( response => {
                    this.lite_versions = JSON.parse( response );
                    this.loading = false;
                } )
                .fail( response => {
                    this.loading = false;
                    this.$notify( {
                        type: 'error',
                        title: this.__( 'Error', 'dokan-lite' ),
                        text: this.__( 'Something went wrong', 'dokan-lite' ),
                    } )
                } );
        },

        getDokanProChangeLog() {
            this.loading = true;
            dokan.api.get( '/admin/changelog/pro' )
                .done( response => {
                    this.pro_versions = JSON.parse( response );
                    this.loading = false;
                } )
                .fail( response => {
                    this.loading = false;
                    this.$notify({
                        type: 'error',
                        title: this.__( 'Error', 'dokan-lite' ),
                        text: this.__( 'Something went wrong', 'dokan-lite' ),
                    } )
                } );
        },

        dismissWhatsNewNotice() {
            let action = 'pro' === this.active_package ? 'dokan-pro-whats-new-notice' : 'dokan-whats-new-notice';

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: {
                    action: action,
                    nonce: dokan.nonce,
                    dokan_promotion_dismissed: true,
                },
            } );
        },

        toggleReading( index ) {
            if( this.isOpenVersion( index ) ){
                return this.openVersions.splice( this.openVersions.indexOf( index ), 1 );
            }

            return this.openVersions.push( index );
        },

        isOpenVersion( index ) {
            return this.openVersions.includes( index );
        },

        switchPackage( pack ) {
            this.active_package = pack;

            if ( null === this.pro_versions && 'pro' === pack ) {
                this.getDokanProChangeLog();
            }

            if ( null === this.lite_versions && 'lite' === pack ) {
                this.getDokanLiteChangeLog();
            }

            if ( dokan.hasNewVersion ) {
                this.dismissWhatsNewNotice();
            }
        },

        isActivePackage( pack ) {
            return this.active_package === pack;
        },

        addBorder(){
            let timeout;

            clearTimeout(timeout);

            this.activeVersionBorder = 'border: 1px solid #2271b1';

            timeout = setTimeout(() => {
                this.activeVersionBorder = '';
            }, 3000);
        },

        jumpVersion( id ){
            this.current_version = id;
            this.goToPosition( id );
            this.addBorder();
        },

        isCurrentVersion( index ) {
            return this.current_version === index;
        },

        updatePosition() {
            this.scrollPosition = window.scrollY
        },

        scrollTop() {
            this.goToPosition( 'change-log' );
        },

        goToPosition( id ) {
            $('html, body').animate({
                scrollTop: $( `#${id}` ).offset().top - 50,
            }, 500);
        },

        loadChangelogData() {
            if ( 'dokan-pro' === this.$route.query.plugin ) {
                this.switchPackage( 'pro' );
            } else {
                this.switchPackage( 'lite' )
            }
        }
    },

    watch: {
        '$route.query.plugin'(){
            this.loadChangelogData();
        }
    },

    created() {
        this.loadChangelogData();
        window.addEventListener( 'scroll', this.updatePosition );
    },

    destroyed() {
        window.removeEventListener( 'scroll', this.updatePosition );
    }
};
</script>

<style lang="less" scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity .3s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
    transition-duration: 0.1s;
    transition-timing-function: linear;
}

.slide-enter-to, .slide-leave {
    max-height: 100px;
    overflow: hidden;
}

.slide-enter, .slide-leave-to {
    overflow: hidden;
    max-height: 0;
}
ul {
    cursor: pointer;
}

.dokan-help-page {

    .section-wrapper {
        h2 {
            margin: 0;
            color: transparent;
        }

        .dokan-notice {
            background: rgba(223, 0, 0, 0.05);
            margin: -15px -20px 0;
            padding: 15px 15px 0;
        }

        .change-log {
            background: rgba(223, 0, 0, 0.05);
            margin: -15px -20px 0;

            &.lite-change-log {
                height: 340px;
            }

            &.pro-change-log {
                height: 400px;
            }

            h3 {
                color: #000000;
                font-size: 30px;
                text-align: center;
                padding: 45px 0 0;
                font-weight: 800;
                font-family: "SF Pro Text", sans-serif;
                margin: 0 0 28px;
            }

            .switch-button-wrap {
                width: 147px;
                height: 33px;
                text-align: center;
                cursor: pointer;
                transition: all .2s ease;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 53px;
                position: relative;
                border: 1px solid #e2e2e2;

                .switch-button {
                    width: 48%;
                    height: 100%;
                    background: none;
                    border-radius: 27px;
                    border: none;
                    color: #cc7376;
                    display: inline-block;
                    position: relative;
                    transition: all .2s ease;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    font-family: "SF Pro Text", sans-serif;
                }

                .active {
                    background: #FF5722;
                    border-radius: 30px;
                    position: absolute;
                    top: 0;
                    width: 50%;
                    height: 100%;
                    transition: all .2s ease-out;
                }

                .lite {
                    text-transform: capitalize;
                }

                .pro {
                    text-transform: uppercase;
                }

                .active-case {
                    color: #ffffff;
                }
            }

            .jump-version {
                width: 178px;
                margin: 24px auto 0;
                position: relative;

                p {
                    color: #000;
                    font-size: 13px;
                    text-align: center;
                    cursor: pointer;
                    font-weight: 500;
                    font-family: "SF Pro Text", sans-serif;
                }

                .dashicons {
                    font-size: 16px;
                    line-height: 1.4;
                    transition: all .2s ease;
                }

                &:hover .dashicons{
                    transform: rotate(-180deg);
                }

                .version-menu {
                    position: absolute;
                    top: 50px;
                    left: 0;
                    width: 100%;
                    z-index: 1;
                    background: #fff;
                    border: 1px solid #dddddd;
                    padding: 20px 10px 20px 20px;
                    box-sizing: border-box;
                    opacity: 0;
                    visibility: hidden;
                    transition: all .2s ease;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.09);

                    &:before {
                        content: "";
                        position: absolute;
                        border: 11px solid transparent;
                        border-bottom-color: white;
                        margin-left: -10px;
                        top: -19px;
                        right: 27px;
                        z-index: 1;
                    }

                    .version-dropdown {
                        max-height: 300px;
                        text-align: left;
                        background: #ffffff;
                        overflow-y: auto;

                        ul {
                            cursor: context-menu;

                            li {
                                margin-bottom: 25px;
                                color: #000000;
                                font-size: 14px;
                                font-weight: 400;
                                font-family: "SF Pro Text", sans-serif;
                                transition: all .2s linear;
                                cursor: pointer;

                                &:hover {
                                    color: #f2624d;
                                }

                                &:last-child {
                                    margin-bottom: 0;
                                }

                                &.current {
                                    color: #f2624d;
                                    font-weight: bold;
                                    font-family: "SF Pro Text", sans-serif;
                                }

                                span {
                                    display: block;
                                    font-size: 12px;
                                    color: #758598;
                                    font-weight: 400;
                                    font-family: "SF Pro Text", sans-serif;
                                }
                            }
                        }

                        &::-webkit-scrollbar {
                            width: 4px;
                        }

                        &::-webkit-scrollbar-track {
                            background: #f5f5f5;
                        }

                        &::-webkit-scrollbar-thumb {
                            background: #878787;
                        }

                        &::-webkit-scrollbar-thumb:hover {
                            background: #575757;
                        }

                    }
                }

                &:hover .version-menu {
                    top: 30px;
                    opacity: 1;
                    visibility: visible;
                }
            }
        }

        .version-list {

            .version {
                .card-version {
                    background: #ffffff;
                    border: 1px solid #e2e2e2;
                    border-radius: 3px;
                    padding: 25px;
                    box-sizing: border-box;

                    div {
                        overflow: hidden;

                        .feature-list {
                            margin-bottom: 40px;

                            &:last-child {
                                margin-bottom: 0;
                            }

                            .feature-badge {
                                color: #ffffff;
                                font-size: 15px;
                                font-weight: 600;
                                padding: 6px 14px;
                                border-radius: 3px;
                                display: inline-block;
                                font-family: "SF Pro Text", sans-serif;
                            }

                            .badge-green {
                                background: #00B728;
                            }

                            .badge-blue {
                                background: #028AFB;
                            }

                            .badge-red {
                                background: #F83838;
                            }

                            .feature {
                                margin: 11px 0;

                                &:last-child {
                                    margin-bottom: 0;
                                }

                                h5 {
                                    color: #000000;
                                    margin: 0;
                                    font-size: 14px;
                                    font-weight: bold;
                                    font-family: "SF Pro Text", sans-serif;
                                }

                                div {
                                    color: #000000;
                                    font-size: 14px;
                                    font-weight: 400;
                                    opacity: 0.8;
                                    font-family: "SF Pro Text", sans-serif;
                                }

                                img {
                                    width: 100%;
                                    height: auto;
                                    margin-top: 10px;
                                }

                                ul {
                                    list-style: disc outside;
                                    opacity: 0.7;
                                    font-size: 14px;
                                    font-weight: 400;
                                    margin-left: 18px;
                                }
                            }
                        }
                    }

                    .continue-reading {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-top: 30px;

                        a {
                            font-size: 13px;
                            font-weight: normal;
                            text-decoration: none;
                            padding: 6px 14px;
                            display: inline-block;
                            color: #000000;
                            background: #ffffff;
                            border-radius: 3px;
                            border: 1px solid #E2E2E2;
                            font-family: "SF Pro Text", sans-serif;

                            &:focus {
                                box-shadow: none;
                            }
                        }
                    }
                }
                .version-number {
                    h4 {
                        font-weight: 700;
                        font-size: 23px;
                        color: #000000;
                        margin-bottom: 7px;
                        font-family: "SF Pro Text", sans-serif;
                    }

                    p {
                        font-weight: 400;
                        font-size: 13px;
                        color: #5C626A;
                        font-family: "SF Pro Text", sans-serif;
                    }

                    label {
                        font-size: 12px;
                        color: #fff;
                        background: #8e44ad;
                        border-radius: 53px;
                        margin-left: 5px;
                        padding: 2px 12px;
                        font-weight: 400;
                        font-family: "SF Pro Text", sans-serif;
                    }
                }
            }
        }

        @media only screen and ( min-width: 1200px ) {
            .version-list {
                .version {
                    display: flex;
                    width: 900px;
                    margin: 0 auto;
                    justify-content: space-between;

                    .card-version {
                        width: 700px;
                    }
                }

                .latest-version {
                    margin-top: -200px;
                }

                .old-version {
                    margin-top: 25px;
                }
            }
        }

        @media screen and ( min-width: 992px ) and ( max-width: 1199px ) {

            .version-list {
                .version {
                    display: flex;
                    width: 720px;
                    margin: 0 auto;
                    justify-content: space-between;

                    .card-version {
                        width: 520px;
                    }
                }

                .latest-version {
                    margin-top: -200px;
                }

                .old-version {
                    margin-top: 20px;
                }
            }
        }

        @media only screen and ( max-width: 991px ) {
            .dokan-notice {
                background: #f7f8fa;
                margin: -15px -10px 0;
                padding: 15px 15px 0;
            }

            .change-log {
                background: #f7f8fa;
                margin: -15px -10px 0;

                &.lite-change-log {
                    height: 220px;
                }

                &.pro-change-log {
                    height: 280px;
                }
            }

            .version-list {
                .version {
                    .card-version {
                        margin: 0 -10px;
                        border: 0;
                        box-shadow: none;
                        border-radius: 0;

                        .continue-reading {
                            justify-content: start;
                        }
                    }
                }

                .latest-version {
                    margin-top: -112px;

                    .version-number {
                        padding-bottom: 15px;
                        text-align: center;
                    }
                }

                .old-version {
                    margin-top: 15px;
                    .version-number {
                        background: #fff;
                        padding: 25px 25px 0 25px;
                        margin: 0 -10px;
                        box-sizing: border-box;
                    }

                    h4 {
                        margin-top: 0;
                    }

                    p {
                        margin-bottom: 0;
                    }
                }
            }
        }
    }

    .scroll-to-top {
        width: 40px;
        height: 40px;
        color: #ffffff;
        background: #ff5722;
        border: 0;
        position: fixed;
        right: 10px;
        bottom: 35px;
        z-index: 1;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.09);
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all .2s ease;
    }

    .loading {
        width: 100%;
        text-align: center;
        margin-top: 100px;
    }
}
</style>
