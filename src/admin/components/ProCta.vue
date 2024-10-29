<template>
    <div class="cta-section" v-bind:style="{ 'background-image': 'url(' + styles.bgPattern + ')' }">
        <div class="feature-thumb flex justify-center items-center">
            <img :src="thumbnail" alt="Dokan Lite">
        </div>
        <div class="content-area">
            <h2 style="color: #FFC700">{{ __( 'Convinced?', 'dokan-lite' ) }}</h2>
            <p style="max-width: 335px; margin: 0 auto 1rem auto; ">{{ __( 'With all the advance features you get it’s hard to resist buying Dokan Pro.', 'dokan-lite' ) }}</p>
            <a :href="url" class="btn gap-4" target="_blank">
                <p class='flex !m-0'>
                    {{ __( 'Upgrade to Pro', 'dokan-lite' ) }}
                </p>
                <svg xmlns="http://www.w3.org/2000/svg" width="38" height="31" viewBox="0 0 38 31" fill="none">
                    <path d="M35.1409 3.76007C33.6536 3.76007 32.4489 5.07177 32.4489 6.68536C32.4489 7.73502 32.957 8.64884 33.7222 9.16812C32.1054 11.595 29.8239 14.4132 27.4722 15.2296C24.3775 16.3049 21.4922 9.69695 20.0719 5.76991C21.1247 5.37366 21.8916 4.29208 21.8916 3.00919C21.8916 1.3956 20.6885 0.0854492 19.206 0.0854492C17.7265 0.0854492 16.5219 1.39552 16.5219 3.00919C16.5219 4.29208 17.2871 5.37211 18.3416 5.76991C16.9245 9.69695 14.0423 16.3049 10.9429 15.2296C8.59435 14.4132 6.30809 11.595 4.6945 9.16812C5.45656 8.64892 5.9662 7.73665 5.9662 6.68536C5.9662 5.07177 4.75997 3.76007 3.27733 3.76007C1.79786 3.76007 0.593262 5.07177 0.593262 6.68536C0.593262 8.30377 1.79786 9.61384 3.27733 9.61384C3.30769 9.61384 3.32843 9.60584 3.35724 9.60266L6.98394 26.4499H31.4329L35.0611 9.60266C35.0867 9.60429 35.1122 9.61384 35.1426 9.61384C36.6204 9.61384 37.825 8.30377 37.825 6.68536C37.8234 5.07177 36.6188 3.76007 35.1409 3.76007Z" fill="white"/>
                    <path d="M31.3082 27.042H7.10693V30.3284H31.3082V27.042Z" fill="white"/>
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
    //background-image: -moz-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    //background-image: -webkit-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    //background-image: -ms-linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    //background-image: linear-gradient( 15deg, rgb(255,125,144) 0%, rgb(255,173,111) 100%);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: cover;
    text-align: center;
    padding: 70px 0;
    color: #fff;

    img {

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
        background-color: #A244FF;
        color: #FFFFFF;
        font-size: 1.2rem;
        line-height: 1.538em;
        font-weight: 300;
        border-radius: 14px;
        text-decoration: none;
        display: inline-flex;
        padding: 16.05px 45.167px;
        align-items: center;

        &:hover {
            box-shadow: 2.736px 7.518px 20px 0 rgba(0,0,0,.15);
        }
        p{
            color: #FFF;
            font-size: 24px;
            font-style: normal;
            font-weight: 600;
            line-height: normal;
        }
        svg {
            width: 37.232px;
            height: 30.243px;
        }
    }
}
</style>
