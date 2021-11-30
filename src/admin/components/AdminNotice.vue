<template>
    <div class="notice dokan-admin-notices-wrap">
        <div class="dokan-admin-notices" v-if="notices && notices.length">
            <transition-group :name="transitionName" tag="div" class="dokan-notice-slides">
                <template v-for="(notice, index) in notices">
                    <div class="dokan-admin-notice" :key="index" v-show="(index + 1) === current_notice" :class="notice.type" @mouseenter="stopAutoSlide" @mouseleave="startAutoSlide">
                        <div class="notice-content" :style="! notice.title || ! notice.actions ? 'align-items: center' : ''">
                            <div class="logo-wrap">
                                <div class="logo"></div>
                                <span class="icon" :class="`icon-${notice.type}`"></span>
                            </div>
                            <div class="message">
                                <h3 v-if="notice.title">{{ notice.title }}</h3>
                                <div v-html="notice.description"></div>
                                <template v-if="notice.actions && notice.actions.length">
                                    <template v-for="action in notice.actions">
                                        <a v-if="action.action" class="btn" :class="[`btn-${action.type}`, action.class]" :target="action.target ? action.target : '_self'" :href="action.action">{{ action.text }}</a>
                                        <button :disabled="loading" v-else class="btn btn-dokan" :class="[`btn-${action.type}`, action.class]" @click="handleAction(action, index)">{{ loading || task_completed ? button_text : action.text }}</button>
                                    </template>
                                </template>
                            </div>

                            <a :href="notice.close_url" class="close-notice" v-if="notice.show_close_button && notice.close_url">
                                <span class="dashicons dashicons-no-alt"></span>
                            </a>
                            <button :disabled="loading" class="close-notice" v-if="notice.show_close_button && notice.ajax_data"  @click="hideNotice(notice, index)">
                                <span class="dashicons dashicons-no-alt"></span>
                            </button>
                        </div>
                    </div>
                </template>
            </transition-group>
            <div class="slide-notice" v-show="notices.length > 1">
                <span class="dashicons dashicons-arrow-left-alt2 prev" :class="{ active: current_notice > 1 }" @click="prevNotice()"></span>
                <span class="notice-count"><span class="current-notice" :class="{ active: current_notice > 1 }">{{  current_notice }}</span> of <span class="total-notice" :class="{ active: current_notice < notices.length }">{{ notices.length }}</span></span>
                <span class="dashicons dashicons-arrow-right-alt2 next" :class="{ active: current_notice < notices.length }" @click="nextNotice()"></span>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';

export default {
    name: "AdminNotice",

    props: {
        endpoint: {
            type: String,
            default: 'notices'
        },
        interval: {
            type: Number,
            default: 5000
        },
    },

    data() {
        return {
            timer: null,
            notices: [],
            loading: false,
            button_text: '',
            current_notice: 1,
            task_completed: false,
            transitionName: 'slide-next'
        }
    },

    created() {
        this.fetch();
    },

    methods: {
        fetch() {
            dokan.api.get( `/admin/${this.endpoint}` )
                .done( response => {
                    this.notices = response.filter( notice => notice.description );
                    if (response.length > 1){
                        this.startAutoSlide();
                    }
                });
        },

        slideNotice( n ) {
            this.current_notice += n;

            n === 1 ? (this.transitionName = "slide-next") : (this.transitionName = "slide-prev");

            let len = this.notices.length;

            if ( this.current_notice < 1 ) {
                this.current_notice = len;
            }

            if ( this.current_notice > len ) {
                this.current_notice = 1;
            }
        },

        nextNotice() {
            this.stopAutoSlide();
            this.slideNotice( 1 );
        },

        prevNotice() {
            this.stopAutoSlide();
            this.slideNotice( -1 );
        },

        startAutoSlide() {
            this.timer = setInterval(() => {
                this.slideNotice(1);
            }, this.interval);
        },

        stopAutoSlide() {
            clearInterval( this.timer );
            this.timer = null;
        },

        hideNotice( notice, index ) {
            $.ajax( {
                url: dokan.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: notice.ajax_data,
            } ).always( () => {
                this.loading = false;
            } ).done( () => {
                this.notices.splice( index, 1 );
                this.current_notice = 1;
            } );
        },

        handleAction( action, index ) {
            this.stopAutoSlide();

            if ( action.confirm_message ) {
                this.$swal( {
                    title: this.__( 'Are you sure?', 'dokan-lite' ),
                    type: 'warning',
                    html: action.confirm_message,
                    showCancelButton: true,
                    confirmButtonText: action.text,
                    cancelButtonText: this.__( 'Cancel', 'dokan-lite' ),
                }).then( ( response ) => {
                    if ( response.value ) {
                        this.handleRequest( action, index );
                    }
                } );
            } else {
                this.handleRequest( action, index );
            }
        },

        handleRequest( action, index ) {
            this.loading = true;
            this.button_text = action.loading_text ? action.loading_text : this.__( 'Loading...', 'dokan-lite' );

            $.ajax( {
                url: dokan.ajaxurl,
                method: 'post',
                dataType: 'json',
                data: action.ajax_data,
            } ).always( () => {
                this.loading = false;
            } ).done( () => {
                this.button_text = action.completed_text ? action.completed_text : action.text;
                this.task_completed = true;

                if ( action.reload ) {
                    window.location.reload();
                } else {
                    this.notices.splice( index, 1 );
                    this.current_notice = 1;
                }
            } );
        }
    }
}
</script>
