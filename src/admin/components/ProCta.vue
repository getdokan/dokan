<template>
    <div class="cta-section" v-bind:style="{ 'background-image': 'url(' + styles.bgPattern + '), linear-gradient( 45deg, rgb(255,125,144) 33%, rgb(255,173,111) 100%)' }">
        <div class="feature-thumb">
            <img :src="thumbnail" alt="Dokan Lite">
        </div>
        <div class="content-area">
            <h2>{{ __( 'Convinced?', 'dokan-lite' ) }}</h2>
            <p>{{ __( 'With all the advance features you get it’s hard to resist buying Dokan Pro.', 'dokan-lite' ) }}</p>
            <a :href="url" class="btn" target="_blank">
                {{ __( 'Upgrade to Pro', 'dokan-lite' ) }}
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                     viewBox="0 0 17.5 12.5" style="enable-background:new 0 0 17.5 12.5;" xml:space="preserve">
                <path class="st0" d="M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7
                    l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z
                     M10.6,1.5"/>
                </svg>
            </a>
        </div>
    </div>
</template>

<script>
export default {

  name: 'ProCta',

  data () {
    return {
        "styles" : {
            "bgPattern": dokan.urls.assetsUrl + '/images/premium/cta-pattern@2x.png'
        },
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/cta-dokan-logo.png',
        "url": dokan.urls.upgradeToPro
    }
  }
}
</script>

<style lang="css" lang="less">
.cta-section {
    background-image: -moz-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    background-image: -webkit-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    background-image: -ms-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    background-image: linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: contain;
    text-align: center;
    padding: 35px 75px 40px;
    color: #fff;

    img {
        width: 60px;
        border-radius: 50%;
        box-shadow: 0px 3px 70px 0px rgba(126, 17, 0, 0.35);
    }

    h2 {
        font-size: 30px;
        color: #fff;
        font-weight: 400;
        line-height: 1.333em;
        text-align: center;
        margin: 10px 0;
        text-shadow: 0px 1px 2px rgba(255, 255, 255, 0.31);
    }

    p {
        font-size: 16px;
        line-height: 1.5em;
        font-weight: 300;
        margin: 10px 0 30px;
    }

    .btn {
        background-color: #fff;
        color: #f2624d;
        font-size: 16px;
        line-height: 1.538em;
        font-weight: 300;
        border: 1px solid #FF9381;
        border-radius: 3px;
        box-shadow: 0px 1px 2px 0px rgba(255, 128, 142, 0.05);
        display: inline-block;
        text-decoration: none;
        padding: 12px 27px;

        &:hover {
            box-shadow: 2.736px 7.518px 20px 0 rgba(0,0,0,.15);
        }

        svg {
            width: 15px;
            fill: #f2624d;
            margin-left: 6px;
        }
    }
}
</style>
