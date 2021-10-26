<template>
    <div class="dokan-help-page">
        <UpgradeBanner v-if="! hasPro"></UpgradeBanner>

        <div class="section-wrapper" v-if="true">
            <div class="change-log">
                <h3>{{ __( 'Dokan Changelog', 'dokan-lite' ) }}</h3>
                <div v-if="hasPro" class="switch-button-wrap">
                    <transition-group name="fade">
                        <span :key="1" class="active" :style="isActivePackage('pro')  ? 'right: 0' : 'left: 0'"></span>
                        <button :key="2" class="switch-button lite" :class="{ 'active-case' : isActivePackage('lite') }" @click="switchPackage('lite')">{{ __('Lite', 'dokan-lite') }}</button>
                        <button :key="3" class="switch-button pro" :class="{ 'active-case' : isActivePackage('pro')  }" @click="switchPackage('pro')">{{ __('Pro', 'dokan-lite') }}</button>
                    </transition-group>
                </div>
                <div class="jump-version">
                    <p>{{ __('Jump to version', 'dokan-lite') }}... <span class="dashicons dashicons-arrow-down-alt2"></span></p>
                    <div class="version-menu">
                        <div class="version-dropdown">
                            <ul>
                                <li v-for="(version, index) in versions" :class="{ 'current' : isCurrentVersion(index) }" @click="jumpVersion(index)">
                                    <router-link :to="{ name: 'ChangeLog', hash: `#${index}`}">
                                        {{ __('Version', 'dokan-lite') }} {{ version }}
                                        <span v-if="index === 0">({{ __('Latest', 'dokan-lite')}})</span>
                                    </router-link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div class="version-list"  v-show="isActivePackage('lite')">
                <div class="version latest-version" id="0">
                    <div class="version-number">
                        <h4>{{ __('Version', 'dokan-lite') }} 3.3.6</h4>
                        <p>Aug 30, 2021 <label>{{ __('Latest', 'dokan-lite') }}</label> </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion(0) ? activeVersionBorder : ''">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">{{ __('New', 'dokan-lite') }}</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                                <img src="https://placeimg.com/650/350/tech" alt="">
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled. Order note for Suborder and main order added when an refund request gets canceled. .</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-blue">{{ __('Improved', 'dokan-lite') }}</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-red">{{ __('Fixed', 'dokan-lite') }}</span>
                            <div class="feature">
                                <h5>Booking:</h5>
                                <ul>
                                    <li>Fixed Dokan booking details shows wrong order information after admin creates manual booking from WordPress admin panel</li>
                                    <li>Display fatal error, after deleting booking product which is associated with any customer.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="version old-version" id="1" :style="isOpenVersion(1) ? '' : 'max-height: 276px; overflow: hidden'">
                    <div class="version-number">
                        <h4>Version 3.3.5</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion(1) ? activeVersionBorder : ''">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>
                        <div class="continue-reading">
                            <a href="#" @click.prevent="toggleReading(1)">{{ isOpenVersion(1) ? 'View Less...' : 'Continue reading...' }}</a>
                        </div>
                    </div>
                </div>

                <div class="version old-version" id="2">
                    <div class="version-number">
                        <h4>Version 3.3.4</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion(2) ? activeVersionBorder : ''">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>

                        <div class="continue-reading">
                            <a href="#">Continue reading...</a>
                        </div>
                    </div>
                </div>

                <div class="version old-version" id="3">
                    <div class="version-number">
                        <h4>Version 3.3.3</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version" :style="isCurrentVersion(3) ? activeVersionBorder : ''">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>

                        <div class="continue-reading">
                            <a href="#">Continue reading...</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="version-list"  v-show="isActivePackage('pro')">
                <div class="version latest-version">
                    <div class="version-number">
                        <h4>Version 2.3.6</h4>
                        <p>Aug 15, 2021 <label>Latest</label> </p>
                    </div>
                    <div class="card-version">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                                <img src="https://placeimg.com/650/350/tech" alt="">
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled. Order note for Suborder and main order added when an refund request gets canceled. .</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-blue">Improved</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>
                        <div class="feature-list">
                            <span class="feature-btn btn-red">Fixed</span>
                            <div class="feature">
                                <h5>Booking:</h5>
                                <ul>
                                    <li>Fixed Dokan booking details shows wrong order information after admin creates manual booking from WordPress admin panel</li>
                                    <li>Display fatal error, after deleting booking product which is associated with any customer.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="version old-version">
                    <div class="version-number">
                        <h4>Version 2.3.5</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>

                        <div class="continue-reading">
                            <a href="#">Continue reading...</a>
                        </div>
                    </div>
                </div>

                <div class="version old-version">
                    <div class="version-number">
                        <h4>Version 2.3.4</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>

                        <div class="continue-reading">
                            <a href="#">Continue reading...</a>
                        </div>
                    </div>
                </div>

                <div class="version old-version">
                    <div class="version-number">
                        <h4>Version 2.3.3</h4>
                        <p>Aug 30, 2021 </p>
                    </div>
                    <div class="card-version">
                        <div class="feature-list">
                            <span class="feature-btn btn-green">New</span>
                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Order note for Suborder and main order added when an refund request gets canceled.</p>
                            </div>

                            <div class="feature">
                                <h5>Feature Name</h5>
                                <p>Added Net Sale section under vendor dashboard where Total order amount was deducted from the refunded amount</p>
                            </div>
                        </div>

                        <div class="continue-reading">
                            <a href="#">Continue reading...</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="loading" v-else>
            <loading></loading>
        </div>
        <button @click="scrollTop" class="scroll-to-top" :style=" scrollPosition > 300 ? 'opacity: 1; visibility: visible' : ''">
            <span class="dashicons dashicons-arrow-up-alt"></span>
        </button>
    </div>
</template>

<script>

let Loading = dokan_get_lib('Loading');

import UpgradeBanner from "admin/components/UpgradeBanner.vue";

export default {

    name: 'ChangeLog',

    components: {
        Loading,
        UpgradeBanner,
    },

    data () {
        return {
            active_package: 'lite',
            current_version: 0,
            hasPro: dokan.hasPro ? true : false,
            releases: [],
            versions: [
                '3.3.6',
                '3.3.5',
                '3.3.4',
                '3.3.3',
                '3.3.2',
                '3.3.1',
                '3.2.9',
                '3.2.8',
            ],
            scrollPosition: null,
            openVersion: 0,
            activeVersionBorder: ''
        };
    },

    methods: {
        toggleReading(index){
            if(this.openVersion === index){
                return this.openVersion = 0;
            }
            return this.openVersion = index;
        },

        isOpenVersion(index){
            return this.openVersion === index;
        },

        switchPackage(pack){
            this.active_package = pack;
        },

        isActivePackage(pack){
            return this.active_package === pack;
        },

        removeBorder(){
            let timeout;

            clearTimeout(timeout);

            this.activeVersionBorder = 'border: 1px solid #2271b1';

            timeout = setTimeout(() => {
                this.activeVersionBorder = '';
            }, 3000);
        },

        jumpVersion(id){
            this.current_version = id;
            this.removeBorder();
        },

        isCurrentVersion(index){
            return this.current_version === index;
        },

        updatePosition() {
            this.scrollPosition = window.scrollY
        },

        scrollTop(){
            window.scrollTo(0,0);
        }
    },

    created() {
        window.addEventListener('scroll', this.updatePosition)
    },

    destroyed() {
        window.removeEventListener('scroll', this.updatePosition)
    }
};
</script>

<style lang="less" scoped>
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}

.dokan-help-page {

    .section-wrapper {

        .change-log {
            height: 410px;
            background: rgba(223, 0, 0, 0.05);
            margin: -15px -20px 0 -22px;

            h3 {
                color: #000000;
                font-size: 30px;
                text-align: center;
                padding-top: 45px;
                margin-top: 0;
                font-weight: 800;
                font-family: "SF Pro Text", sans-serif;
            }

            .switch-button-wrap {
                width: 147px;
                height: 33px;
                text-align: center;
                cursor: pointer;
                transition: all .2s ease;
                margin: 28px auto 24px;
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
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #cc7376;
                    display: inline-block;
                    position: relative;
                    transition: all .2s ease;
                    cursor: pointer;
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
                margin: 0 auto;
                position: relative;

                p {
                    color: #000;
                    font-size: 13px;
                    text-align: center;
                    cursor: pointer;
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
                        height: 300px;
                        text-align: left;
                        background: #ffffff;
                        overflow-y: auto;

                        li {
                            margin-bottom: 25px;

                            a {
                                color: #000000;
                                font-size: 14px;
                                font-weight: 400;
                                font-family: "SF Pro Text", sans-serif;
                                transition: all .2s linear;
                                text-decoration: none;

                                &:hover {
                                    color: #f2624d;
                                }

                                &:focus {
                                    outline: 0;
                                    box-shadow: none;
                                }
                            }

                            &:last-child {
                                margin-bottom: 0;
                            }

                            &.current a {
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
                    position: relative;

                    .feature-list {
                        margin-bottom: 40px;

                        &:last-child {
                            margin-bottom: 0;
                        }

                        .feature-btn {
                            color: #ffffff;
                            padding: 6px 14px;
                            border-radius: 3px;
                            font-weight: 600;
                            font-size: 15px;
                            display: inline-block;
                        }

                        .btn-green {
                            background: #00B728;
                        }

                        .btn-blue {
                            background: #028AFB;
                        }

                        .btn-red {
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

                            p {
                                color: #000000;
                                margin: 0;
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

                    .continue-reading {
                        position: absolute;
                        bottom: 1px;
                        left: 0;
                        height: 60px;
                        background: #ffffff;
                        width: 100%;
                        text-align: center;


                        a {
                            font-weight: 600;
                            font-size: 15px;
                            text-decoration: none;
                            padding: 6px 14px;
                            display: inline-block;
                            color: #000000;
                            background: #ffffff;
                            border-radius: 3px;
                            border: 1px solid #E2E2E2;

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
                        margin-left: 9px;
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
            .change-log {
                margin: -10px -17px 0 -20px;
            }
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

            .change-log {
                height: 270px;
                background: #f7f8fa;
                margin: -15px -12px 0 -10px;

                h3 {
                    padding-top: 30px;
                }
            }

            .version-list {
                .version {
                    .card-version {
                        margin: 0 -10px;
                        border: 0;
                        box-shadow: none;
                        border-radius: 0;
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
        visibility: invisible;
        transition: all .2s ease;
    }

    .loading {
        width: 100%;
        text-align: center;
        margin-top: 100px;
    }
}
</style>
