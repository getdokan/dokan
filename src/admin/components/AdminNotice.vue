<template>
    <div class="notice dokan-admin-notices-wrap">
        <div class="dokan-admin-notices" v-if="notices && notices.length">
            <transition-group name="fade" tag="div" class="dokan-notice-slides leading-[1.5em] box-content">
                <template v-for="(notice, index) in notices">
                    <div class="dokan-admin-notice" :key="index" v-show="(index + 1) === current_notice" :class="`dokan-${notice.type}`" @mouseenter="stopAutoSlide" @mouseleave="startAutoSlide">
                        <div class="notice-content">
                            <div class="logo-wrap">
                                <img src="../../../assets/src/images/dokan-notice-logo.svg" alt="Dokan Logo" class="dokan-logo" v-if="!notice.hide_logo">
                            </div>
                            <div class="dokan-message">
                                <h3 v-if="notice.title" class="dokan-message-title">{{ notice.title }}</h3>
                                <div v-if="notice.description" v-html="notice.description" class="dokan-message-content"></div>
                                <template v-if="notice.actions && notice.actions.length">
                                    <div class="dokan-notice-actions">
                                        <template v-for="action in notice.actions">
                                            <a v-if="action.action && !action.ajax_data" class="dokan-btn" :class="[`dokan-btn-${action.type}`, action.class]" :target="action.target ? action.target : '_self'" :href="action.action">{{ action.text }}</a>
                                            <button :disabled="loading" v-else class="dokan-btn" :class="[`dokan-btn-${action.type}`, action.class]" @click="handleAction(action, index)">{{ loading ? button_text : action.text }}</button>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </template>
            </transition-group>
            <div class="slide-notice" v-show="notices.length > 1">
                <span class="prev" :class="{ active: current_notice > 1 }" @click="prevNotice()">
                    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.791129 6.10203L6.4798 0.415254C6.72942 0.166269 7.13383 0.166269 7.38408 0.415254C7.63369 0.664239 7.63369 1.06866 7.38408 1.31764L2.14663 6.5532L7.38345 11.7888C7.63306 12.0377 7.63306 12.4422 7.38345 12.6918C7.13383 12.9408 6.72879 12.9408 6.47917 12.6918L0.790498 7.005C0.544665 6.75859 0.544666 6.34781 0.791129 6.10203Z" fill="#DADFE4"/>
                    </svg>
                </span>
                <span class="notice-count"><span class="current-notice" :class="{ active: current_notice > 1 }">{{ current_notice }}</span> of <span class="total-notice" :class="{ active: current_notice < notices.length }">{{ notices.length }}</span></span>
                <span class="next" :class="{ active: current_notice < notices.length }" @click="nextNotice()">
                    <svg width="8" height="13" viewBox="0 0 8 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.43934 6.10203L1.75067 0.415254C1.50105 0.166269 1.09664 0.166269 0.846391 0.415254C0.596776 0.664239 0.596776 1.06866 0.846391 1.31764L6.08384 6.5532L0.847021 11.7888C0.597406 12.0377 0.597406 12.4422 0.847021 12.6918C1.09664 12.9408 1.50168 12.9408 1.7513 12.6918L7.43997 7.005C7.6858 6.75859 7.6858 6.34781 7.43934 6.10203Z" fill="#DADFE4"/>
                    </svg>
                </span>
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
            default: 'admin'
        },
        interval: {
            type: Number,
            default: 5000
        },
        scope: {
            type: String,
            default: ''
        }
    },

    data() {
        return {
            timer: null,
            notices: [],
            loading: false,
            button_text: '',
            current_notice: 1,
            task_completed: false
        }
    },

    created() {
        this.fetch();
    },

    methods: {
        fetch() {
            const notice_scope = this.scope ? `?scope=${this.scope}` : '';
            $.ajax({
                url: `${dokan_promo.rest.root}${dokan_promo.rest.version}/admin/notices/${this.endpoint}${notice_scope}`,
                method: 'get',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', dokan_promo.rest.nonce);
                },
            }).done(response => {
                // Add close action to notices with show_close_button
                this.notices = response
                    .filter(notice => notice.description || notice.title)
                    .map(notice => {
                        if (notice.show_close_button) {
                            const closeAction = {
                                type: 'secondary',
                                class: 'dokan-notice-close',
                                text: this.__('Dismiss', 'dokan-lite'),
                                loading_text: this.__('Dismissing...', 'dokan-lite'),
                                completed_text: this.__('Dismissed', 'dokan-lite'),
                                ...(notice.close_url ? { action: notice.close_url } : {}),
                                ...(notice.ajax_data ? { ajax_data: notice.ajax_data } : {})
                            };
                            return {
                                ...notice,
                                actions: [...(notice.actions || []), closeAction]
                            };
                        }
                        return notice;
                    });
                this.startAutoSlide();
            });
        },

        slideNotice(n) {
            this.current_notice += n;
            let len = this.notices.length;
            if (this.current_notice < 1) {
                this.current_notice = len;
            }
            if (this.current_notice > len) {
                this.current_notice = 1;
            }
        },

        nextNotice() {
            this.stopAutoSlide();
            this.slideNotice(1);
        },

        prevNotice() {
            this.stopAutoSlide();
            this.slideNotice(-1);
        },

        startAutoSlide() {
            if (!this.loading && this.notices.length > 1) {
                this.timer = setInterval(() => {
                    this.slideNotice(1);
                }, this.interval);
            }
        },

        stopAutoSlide() {
            if (!this.loading && this.notices.length > 1) {
                clearInterval(this.timer);
                this.timer = null;
            }
        },

        handleAction(action, index) {
            if (action.confirm_message) {
                Swal.fire({
                    title: this.__('Are you sure?', 'dokan-lite'),
                    icon: 'warning',
                    html: action.confirm_message,
                    showCancelButton: true,
                    confirmButtonText: action.text,
                    cancelButtonText: this.__('Cancel', 'dokan-lite'),
                }).then((response) => {
                    if (response.value) {
                        this.handleRequest(action, index);
                    }
                });
            } else {
                this.handleRequest(action, index);
            }
        },

        handleRequest(action, index) {
            this.loading = true;
            this.button_text = action.loading_text ? action.loading_text : this.__('Loading...', 'dokan-lite');

            // Handle AJAX request if ajax_data exists
            const ajaxPromise = action.ajax_data
                ? $.ajax({
                    url: dokan_promo.ajaxurl,
                    method: 'post',
                    dataType: 'json',
                    data: action.ajax_data,
                })
                : Promise.resolve();

            ajaxPromise
                .always(() => {
                    this.loading = false;
                })
                .then(() => {
                    this.button_text = action.completed_text ? action.completed_text : action.text;
                    this.task_completed = true;

                    // Remove notice and slide to next
                    this.notices.splice(index, 1);
                    this.slideNotice(1);

                    // Redirect to close_url if provided
                    if (action.action) {
                        window.location.href = action.action;
                    }

                    if (action.reload) {
                        window.location.reload();
                    }
                });
        }
    }
}
</script>
