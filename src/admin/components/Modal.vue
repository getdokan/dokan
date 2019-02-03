<template>
    <div class="dokan-modal-dialog">
        <div class="dokan-modal">
            <div class="dokan-modal-content" :style="{ width: width, height:height }">
                <section :class="['dokan-modal-main', { 'has-footer': footer }]">
                    <header class="modal-header">
                        <slot name="header">
                            <h1>{{ title }}</h1>
                        </slot>

                        <button class="modal-close modal-close-link dashicons dashicons-no-alt" @click="$emit('close')">
                            <span class="screen-reader-text">{{ __( 'Close modal panel', 'dokan-lite' ) }}</span>
                        </button>
                    </header>
                    <div class="modal-body">
                        <slot name="body"></slot>
                    </div>
                    <footer class="modal-footer" v-if="footer">
                        <div class="inner">
                            <slot name="footer"></slot>
                        </div>
                    </footer>
                </section>
            </div>
        </div>
        <div class="dokan-modal-backdrop"></div>
    </div>
</template>

<script>
export default {

    name: 'Modal',

    props: {
        footer: {
            type: Boolean,
            required: false,
            default: true
        },
        width: {
            type: String,
            required: false,
            default: '500px'
        },
        height: {
            type: String,
            required: false,
            default: 'auto'
        },
        title: {
            type: String,
            required: true,
            default: ''
        },
    },

    data () {
        return {

        };
    }
};
</script>

<style lang="less">
.dokan-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    min-height: 360px;
    background: #000;
    opacity: .7;
    z-index: 99900;
}

.dokan-modal {

    * {
        box-sizing: border-box;
    }

    .dokan-modal-content {
        position: fixed;
        background: #fff;
        z-index: 100000;
        left: 50%;
        top: 50%;
        -webkit-transform: translate(-50%,-50%);
        -ms-transform: translate(-50%,-50%);
        transform: translate(-50%,-50%);
    }

    .dokan-modal-main.has-footer {
        padding-bottom: 55px;
    }

    header.modal-header {
        height: auto;
        background: #fcfcfc;
        padding: 1em 1.5em;
        border-bottom: 1px solid #ddd;

        h1 {
            margin: 0;
            padding: 0;
            font-size: 18px;
            font-weight: 700;
            line-height: 1.5em
        }

        .modal-close-link {
            cursor: pointer;
            color: #777;
            height: 54px;
            width: 54px;
            padding: 0;
            position: absolute;
            top: 0;
            right: 0;
            text-align: center;
            border: 0;
            border-left: 1px solid #ddd;
            background-color: transparent;
            -webkit-transition: color .1s ease-in-out,background .1s ease-in-out;
            transition: color .1s ease-in-out,background .1s ease-in-out;

            &::before {
                font: normal 22px/50px dashicons!important;
                color: #666;
                display: block;
                content: '\f335';
                font-weight: 300;
            }

            &:hover {
                background: #ddd;
                border-color: #ccc;
                color: #000;
            }
        }
    }

    .modal-body {
        min-height: 100px;
        padding: 15px;
        overflow-y: scroll;
    }

    footer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -30px;
        z-index: 100;
        padding: 1em 1.5em;
        background: #fcfcfc;
        border-top: 1px solid #dfdfdf;
        -webkit-box-shadow: 0 -4px 4px -4px rgba(0,0,0,.1);
        box-shadow: 0 -4px 4px -4px rgba(0,0,0,.1);

        .inner {
            text-align: right;
            line-height: 23px;
        }
    }
}

@media only screen and (max-width: 500px) {
    .dokan-modal-content {
        width: 400px !important;
        top: 300px !important;
    }
}

@media only screen and (max-width: 376px) {
    .dokan-modal-content {
        width: 350px !important;
        top: 300px !important;
    }
}

@media only screen and (max-width: 320px) {
    .dokan-modal-content {
        width: 300px !important;
        top: 300px !important;
    }
}

</style>
