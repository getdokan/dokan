<template>
    <div class="dokan-card-fun-fact mr-[20px] last:mr-0 mt-[20px]">
        <div class="card-fun-fact__icon">
            <span class="fa-stack fa-2x">
                <i class="fas fa-circle fa-stack-2x" v-bind:style="{ color: circle_background }"></i>
                <i v-bind:class="[ icon, 'fa-stack-1x', 'fa-inverse' ]" v-bind:style="{ color: icon_background }"></i>
            </span>
        </div>
        <div class="card-fun-fact__text">
            <h3 class="card-fun-fact__title" v-if="count !== ''">
                <Currency :amount="count" v-if="is_currency"></Currency>
                <span v-if="!is_currency">{{ count }}</span>
            </h3>
            <p class="card-fun-fact__description" v-if="title !== ''">{{ title }}</p>
        </div>
    </div>
</template>

<script>
import Currency from "admin/components/Currency.vue"


export default {
    name: "CardFunFact",

    components: {
        Currency,
    },

    props: {
        icon: {
            type: String,
            default: 'fas fa-info'
        },
        icon_background: {
            type: String,
            default: '#ffffff'
        },
        circle_background: {
            type: String,
            default: '#3f444b'
        },
        count: {
            type: Number|String,
            default: '',
        },
        title: {
            type: String,
            default: '',
        },
        is_currency: {
            type: Boolean,
            default: false,
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
    },

    methods: {
    }
}
</script>
<style lang="less">
.dokan-card-fun-fact {
    background: white;
    border-radius: 8px;
    box-shadow: 0 5px 7px -3px #BCBCBC, 0 4px 6px -4px rgb(255 255 255 / 0.1);
    cursor: pointer;
    height: 110px;
    padding: 0 20px;
    -webkit-tap-highlight-color: rgba(0,0,0,0.025);
    text-align: center;
    transition: height 1000ms;
    display: flex;
    align-items: center;
    width: calc(25% - 15px);
    //margin: 10px;

    .rounded-icon {
        background-color: #ccc;
        width: 70px;
        height: 70px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50px;
        color: #fff;
        font-size: 22px;
    }

    .card-fun-fact__text {
        text-align: left;
        flex: 1 1 auto;
        h3 {
            font-size: 1.5em;
            margin: 0 0 5px;
        }
        p {
            font-size: 1em;
            margin: 0;
            color: #666666;
        }
    }

    @media (max-width: 1024px) {
        flex-basis: 25%;
    }

    @media (max-width: 480px) {
        flex-basis: 100%;
    }
}
</style>
