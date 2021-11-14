<?php

$description_kses = [
    'strong' => [
        'class' => [],
    ],
    'a' => [
        'href'    => [],
    ],
];

?>

<div class="dokan-admin-notices notice">
    <?php foreach ( $notices as $key => $notice ) : ?>
        <div class="dokan-admin-notice <?php echo esc_attr( $notice['type'] ); ?> <?php echo 0 === $key ? 'active' : ''; ?>">
            <div class="notice-content" style="<?php echo empty( $notice['title'] ) || empty( $notice['actions'] ) ? 'align-items: center' : ''; ?>">
                <div class="logo-wrap">
                    <div class="logo"></div>
                    <span class="icon icon-<?php echo esc_attr( $notice['type'] ); ?>"></span>
                </div>
                <div class="message">
                    <?php if ( ! empty( $notice['title'] ) ) : ?>
                        <h3><?php echo esc_html( $notice['title'] ); ?></h3>
                    <?php endif; ?>
                    <div><?php echo wp_kses( $notice['description'], $description_kses ); ?></div>
                    <?php if ( ! empty( $notice['actions'] ) ) : ?>
                        <?php foreach( $notice['actions'] as $action ) : ?>
                            <?php if ( ! empty( $action['action'] ) ) : ?>
                                <a class="btn btn-<?php echo esc_attr( $action['type'] ); ?> <?php echo ! empty( $action['class'] ) ? esc_attr( $action['class'] ) : ''; ?>" href="<?php echo esc_url( $action['action'] ); ?>"><?php echo esc_html( $action['text'] ); ?></a>
                            <?php else : ?>
                                <button class="btn btn-<?php echo esc_attr( $action['type'] ); ?> <?php echo ! empty( $action['class'] ) ? esc_attr( $action['class'] ) : ''; ?>" data-ajax-data="<?php echo ! empty( $action['ajax_data'] ) ? esc_attr( json_encode( $action['ajax_data'] ) ) : ''; ?>" data-confirm="<?php echo ! empty( $action['confirm_message'] ) ? esc_attr( $action['confirm_message'] ) : ''; ?>" data-loading="<?php echo ! empty( $action['loading_text'] ) ? esc_attr( $action['loading_text'] ) : __('Loading...', 'dokan-lite'); ?>" data-completed="<?php echo ! empty( $action['completed_text'] ) ? esc_attr( $action['completed_text'] ) : $action['text']; ?>" data-reload="<?php echo ! empty( $action['reload'] ) ? esc_attr( $action['reload'] ) : false; ?>"><?php echo esc_html( $action['text'] ); ?></button>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>

                <?php if ( isset( $notice['show_close_button'] ) && $notice['show_close_button'] ) : ?>
                    <?php if ( ! empty( $notice['close_url'] ) ) : ?>
                        <a class="notice-close" href="<?php echo esc_attr( $notice['close_url'] ); ?>">
                            <span class="dashicons dashicons-no-alt"></span>
                        </a>
                    <?php else : ?>
                        <button class="close-notice" data-ajax-data="<?php echo ! empty( $notice['ajax_data'] ) ? esc_attr( json_encode( $notice['ajax_data'] ) ) : ''; ?>">
                            <span class="dashicons dashicons-no-alt"></span>
                        </button>
                    <?php endif; ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endforeach; ?>
    <?php if ( count( $notices ) > 1 ) : ?>
        <div class="slide-notice">
            <span class="dashicons dashicons-arrow-left-alt2 prev"></span>
            <span class="notice-count"><span class="current-notice">1</span> <?php esc_html_e( 'of', 'dokan-lite' ); ?> <span class="total-notice active"></span></span>
            <span class="dashicons dashicons-arrow-right-alt2 active next"></span>
        </div>
    <?php endif; ?>
</div>
<style>
    .dokan-admin-notices {
        position: relative;
    }

    .dokan-admin-notices.notice {
        border-width: 0;
        padding: 0;
        background: transparent;
        box-shadow: none;
    }

    .dokan-admin-notices .dokan-admin-notice {
        display: none;
        transition: .2s;
        animation-duration: 1s;
        animation-fill-mode: both;
        animation-name: fadeIn;
    }

    .dokan-admin-notices .dokan-admin-notice.active {
        display: block;
    }

    .dokan-admin-notices .dokan-admin-notice.success {
        border-left: 2px solid #82b642;
    }

    .dokan-admin-notices .dokan-admin-notice.info {
        border-left: 2px solid #2679b1;
    }

    .dokan-admin-notices .dokan-admin-notice.alert {
        border-left: 2px solid #b44445;
    }

    .dokan-admin-notices .dokan-admin-notice.warning {
        border-left: 2px solid #ffaa2c;
    }

    .dokan-admin-notices .dokan-admin-notice.promotion {
        border-left: 2px solid #f1644d;
    }

    .dokan-admin-notices .dokan-admin-notice .notice-content {
        display: flex;
        padding: 20px 25px;
        border: 1px solid #dfe2e7;
        border-radius: 0 5px 5px 0;
        background: #fff;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap {
        position: relative;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .logo {
        width: 60px;
        height: 60px;
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 62 62' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.90723' y='.79541' width='61' height='61' rx='30.5' fill='%23F16982'/%3E%3Cpath d='m19.688 25.014v-6.1614c1.4588-0.0303 7.7804 0.0301 13.407 3.6546-0.5844-0.2658-1.2264-0.4219-1.8846-0.4584-0.6581-0.0364-1.3177 0.0477-1.9361 0.2469-1.4936 0.5135-2.7441 1.8122-2.8483 3.2016-0.1737 2.3861 0 4.8627 0 7.2488v7.2186c-1.1115 0.0906-2.2577 0.1208-3.2649 0.1208-1.0768 0.0302-2.1188 0.0302-2.9524 0.1208l-0.521 0.0907v-15.283z' fill='%23fff'/%3E%3Cpath d='m17.848 43.77s-0.278-2.3257 2.5007-2.6579c2.7787-0.3323 8.0583 0.302 11.532-1.6008 0 0 2.0494-0.9363 2.4662-1.3893l-0.5558 1.6309s-1.6325 4.9534-6.5994 5.5876c-4.967 0.6041-5.9048-1.7517-9.3434-1.5705z' fill='%23fff'/%3E%3Cpath d='m28.546 45.824c3.9596-0.8457 8.4404-3.3828 8.4404-16.159 0-12.776-17.02-11.689-17.02-11.689 4.0639-2.084 25.008-4.6815 25.008 13.32 0 17.971-16.429 14.528-16.429 14.528z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon {
        width: 20px;
        height: 20px;
        position: absolute;
        top: -2px;
        right: -8px;
        border: 2px solid #fff;
        border-radius: 55px;
        background: #ffffff;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon-info {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg fill='none' viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m10.474 0.79468c-5.5718 0-10.09 4.5178-10.09 10.09 0 5.5718 4.5178 10.09 10.09 10.09 5.5719 0 10.09-4.5186 10.09-10.09 0-5.5719-4.5186-10.09-10.09-10.09zm2.1005 15.637c-0.5194 0.2051-0.9328 0.3605-1.2429 0.4681-0.3092 0.1077-0.6688 0.1615-1.0779 0.1615-0.62872 0-1.1182-0.1538-1.4667-0.4604-0.3485-0.3067-0.5219-0.6953-0.5219-1.1677 0-0.1836 0.01281-0.3716 0.03844-0.5629 0.02648-0.1913 0.06833-0.4066 0.12556-0.6483l0.65003-2.2961c0.05723-0.2203 0.10678-0.4296 0.14607-0.6244 0.03929-0.1964 0.05808-0.3766 0.05808-0.5407 0-0.2921-0.06064-0.4971-0.18108-0.6124-0.12215-0.1153-0.35193-0.17169-0.69445-0.17169-0.16742 0-0.33997 0.02479-0.51678 0.07689-0.17511 0.0538-0.32715 0.1025-0.45186 0.1503l0.17169-0.70724c0.42538-0.1734 0.83282-0.32202 1.2215-0.44503 0.38865-0.12471 0.75594-0.18621 1.1019-0.18621 0.6244 0 1.1062 0.15205 1.4453 0.45272 0.3374 0.30152 0.5074 0.69356 0.5074 1.1754 0 0.0999-0.012 0.2759-0.0351 0.527-0.023 0.252-0.0666 0.4818-0.1298 0.6928l-0.6466 2.2892c-0.053 0.1836-0.1 0.3937-0.1427 0.6286-0.0418 0.2349-0.0623 0.4143-0.0623 0.5348 0 0.304 0.0675 0.5116 0.2041 0.6218 0.135 0.1102 0.3716 0.1657 0.7064 0.1657 0.1581 0 0.3349-0.0282 0.5348-0.0828 0.1981-0.0547 0.3416-0.1034 0.4322-0.1453l-0.1734 0.7064zm-0.1145-9.2917c-0.3015 0.28017-0.6645 0.42026-1.0891 0.42026-0.4236 0-0.7892-0.14009-1.0933-0.42026-0.3024-0.28017-0.4553-0.62099-0.4553-1.019 0-0.39719 0.15375-0.73886 0.4553-1.0216 0.3041-0.28358 0.6697-0.42452 1.0933-0.42452 0.4246 0 0.7884 0.14094 1.0891 0.42452 0.3015 0.28274 0.4527 0.62441 0.4527 1.0216 0 0.39891-0.1512 0.73887-0.4527 1.019z' fill='%232579B1'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon-alert {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10.288' cy='10.885' r='10.09' fill='%23B44344'/%3E%3Cpath d='m15.457 13.46-4.11-6.5174c-0.2318-0.36758-0.6274-0.58705-1.0583-0.58705-0.43093 0-0.82657 0.21947-1.0583 0.58705l-4.11 6.5174c-0.24669 0.3913-0.26305 0.8872-0.04257 1.2943 0.22049 0.407 0.64232 0.6598 1.1009 0.6598h8.22c0.4585 0 0.8804-0.2528 1.1009-0.6599 0.2204-0.407 0.204-0.9029-0.0426-1.2942zm-5.1683 0.8571c-0.37797 0-0.68432-0.3101-0.68432-0.6926s0.30639-0.6926 0.68432-0.6926c0.3779 0 0.6843 0.3101 0.6843 0.6926s-0.3064 0.6926-0.6843 0.6926zm0.9485-4.8126-0.3371 2.2966c-0.0496 0.3381-0.3606 0.5714-0.6946 0.5212-0.26984-0.0405-0.47216-0.2547-0.51377-0.5133l-0.36601-2.2921c-0.08521-0.53366 0.27317-1.0362 0.80048-1.1224 0.5273-0.08624 1.0239 0.27646 1.1091 0.81011 0.016 0.1005 0.0155 0.20424 0.0019 0.29994z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon-success {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg fill='none' viewBox='0 0 21 22' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m10.475 0.73975c-5.542 0-10.09 4.5728-10.09 10.145 0 5.5723 4.548 10.145 10.09 10.145 5.542 0 10.09-4.5728 10.09-10.145 0-5.5723-4.548-10.145-10.09-10.145zm-1.2211 14.76-4.4185-4.4426 1.672-1.6811 2.8239 2.8392 5.669-5.1816 1.5912 1.759-7.3376 6.7071z' fill='%2382B641'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon-warning {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.38379' y='.79394' width='20.182' height='20.182' rx='10.091' fill='%23FFAA2C'/%3E%3Cpath d='m8.7656 13.41c0.02474 0.1979 0.04947 0.371 0.04947 0.5689h3.3142c0-0.1979 0.0248-0.3958 0.0495-0.5689h-3.4132z' fill='%23fff'/%3E%3Cpath d='m8.8149 14.474v0.8657c0 0.1484 0.09893 0.2473 0.24733 0.2473h0.0742c0.12367 0.6184 0.69253 1.113 1.3356 1.113 0.6678 0 1.2119-0.4699 1.3356-1.113h0.0742c0.1484 0 0.2473-0.0989 0.2473-0.2473v-0.8657h-3.3143z' fill='%23fff'/%3E%3Cpath d='m10.274 5.0748c-1.7561 0.09893-3.2154 1.484-3.4132 3.24-0.09893 0.98933 0.19787 1.9539 0.8162 2.6959 0.46993 0.5689 0.81619 1.2119 0.98932 1.8797h3.611c0.1732-0.6678 0.5194-1.3355 0.9894-1.9044 0.5441-0.6431 0.8409-1.4593 0.8409-2.3002 0-2.0528-1.7561-3.71-3.8336-3.611z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .logo-wrap .icon-promotion {
        background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg viewBox='0 0 21 21' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='.19824' y='.73975' width='20.18' height='20.18' rx='10.09' fill='%23F1634C'/%3E%3Cpath d='m5.3248 10.182c-0.00432 0.3752 0.227 0.713 0.57847 0.8446v-1.6082c0-0.02314 0.01156-0.05784 0.01156-0.08099-0.35384 0.13053-0.58917 0.4674-0.59003 0.84459z' fill='%23fff'/%3E%3Cpath d='m8.4834 12.172h-1.5156l0.56691 2.0594c0.08396 0.3142 0.36887 0.5327 0.69418 0.5322 0.23146 0.0027 0.45045-0.1046 0.59005-0.2893 0.14096-0.1756 0.18443-0.4102 0.11569-0.6247l-0.45121-1.6776z' fill='%23fff'/%3E%3Cpath d='m5.915 9.3264h0.01242v-0.01242c0 0.01242 0 0.01242-0.01242 0.01242z' fill='%23fff'/%3E%3Cpath d='m14.21 9.1641h-0.0925v2.0825h0.0925c0.5751 0 1.0413-0.4662 1.0413-1.0413 0-0.57504-0.4662-1.0412-1.0413-1.0412z' fill='%23fff'/%3E%3Cpath d='m6.25 9.418v1.6429c0.01251 0.4254 0.36112 0.7638 0.78672 0.7636h2.1057v-3.1238h-2.1057c-0.4165 0-0.78672 0.30082-0.78672 0.71732z' fill='%23fff'/%3E%3Cpath d='m9.4898 11.871 4.2808 1.7123v-6.6872l-4.2808 1.7123v3.2626z' fill='%23fff'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
    }

    .dokan-admin-notices .dokan-admin-notice .message {
        margin: 0 110px 0 23px;
    }

    .dokan-admin-notices .dokan-admin-notice .message h3 {
        font-weight: bold;
        font-size: 18px;
        font-family: Roboto, sans-serif;
        margin: 0 0 10px;
    }

    .dokan-admin-notices .dokan-admin-notice .message div {
        color: #4b4b4b;
        font-weight: 400;
        font-size: 13px;
        font-family: "SF Pro Text", sans-serif;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn {
        font-size: 12px;
        font-weight: 300;
        padding: 8px 15px;
        margin-right: 15px;
        margin-top: 10px;
        border-radius: 3px;
        border: 1px solid #00769d;
        cursor: pointer;
        transition: all .2s linear;
        text-decoration: none;
        font-family: "SF Pro Text", sans-serif;
        display: inline-block;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn:disabled {
        opacity: .7;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn-primary {
        color: #fff;
        background: #2579B1;
        margin-right: 15px;
        font-weight: 400;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn-primary:hover {
        background: transparent;
        color: #2579B1;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn-secondary {
        color: #2579B1;
        background: transparent;
        margin-right: 15px;
        font-weight: 400;
    }

    .dokan-admin-notices .dokan-admin-notice .message .btn-secondary:hover {
        color: #ffffff;
        background: #2579B1;
    }

    .dokan-admin-notices .dokan-admin-notice .message a {
        text-decoration: none;
    }

    .dokan-admin-notices .dokan-admin-notice .close-notice,
    .dokan-admin-notices .dokan-admin-notice .notice-close {
        position: absolute;
        top: 10px;
        right: 13px;
        border: 0;
        background: transparent;
        text-decoration: none;
    }

    .dokan-admin-notices .dokan-admin-notice .close-notice span,
    .dokan-admin-notices .dokan-admin-notice .notice-close span {
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c2c2c2;
        transition: all .2s ease;
        cursor: pointer;
        border: 1px solid #f3f3f3;
        border-radius: 55px;
        width: 20px;
        height: 20px;
    }

    .dokan-admin-notices .dokan-admin-notice .close-notice span:hover,
    .dokan-admin-notices .dokan-admin-notice .notice-close span:hover {
        color: #f16982;
        border-color: #f16982;
    }

    .dokan-admin-notices .slide-notice {
        position: absolute;
        top: 50%;
        right: 27px;
        padding: 6px 8px;
        border: 1px solid #b5bfc9;
        border-radius: 3px;
        color: #dadfe4;
        background: #fff;
        transform: translateY(-50%);
    }

    .dokan-admin-notices .slide-notice .notice-count {
        margin: 0 6px;
    }

    .dokan-admin-notices .slide-notice .active {
        color: #9da6ae;
        cursor: pointer;
    }

    @media only screen and (max-width: 576px) {
        .dokan-admin-notices .dokan-admin-notice .message {
            margin: 0 0 0 23px;
        }

        .dokan-admin-notices .slide-notice {
            bottom: 6px;
            top: unset;
        }
    }

    @font-face {
        font-family: "SF Pro Text";
        src: url(<?php echo DOKAN_PLUGIN_ASSEST . '/font/SF-Pro-Text-Regular.otf'; ?>) format('opentype');
        font-weight: 400;
    }

    @keyframes fadeIn {
        from {
            opacity: 0.3;
        }
        to {
            opacity: 1;
        }
    }
</style>
<script>
    jQuery( document ).ready( function ( $ ) {
        var currentSlide = 1,
            timer = null,
            totalNotice = $(".dokan-admin-notice").length;

        $('.dokan-admin-notices .total-notice').text(totalNotice);

        function plusNotices(n) {
            showNotices(currentSlide += n);
        }

        function showNotices(n) {
            if (n > totalNotice) {
                currentSlide = 1
            }

            if (n < 1) {
                currentSlide = totalNotice
            }

            if (currentSlide < totalNotice) {
                $('.dokan-admin-notices .total-notice, .dokan-admin-notices .next').addClass('active');
            }

            if (currentSlide === totalNotice) {
                $('.dokan-admin-notices .total-notice, .dokan-admin-notices .next').removeClass('active');
            }

            if (currentSlide === 1) {
                $('.dokan-admin-notices .current-notice, .dokan-admin-notices .prev').removeClass('active');
            }

            if (currentSlide > 1) {
                $('.dokan-admin-notices .current-notice, .dokan-admin-notices .prev').addClass('active');
            }

            $('.dokan-admin-notices .current-notice').text(currentSlide);
            $('.dokan-admin-notice').removeClass('active');
            $('.dokan-admin-notice:nth-child(' + currentSlide + ')').addClass('active');
        }


        $('.dokan-admin-notices').mouseover(function(){
            stopAutoSlide();
        }).mouseleave(function(){
            startAutoSlide();
        });

        startAutoSlide();

        function startAutoSlide() {
            timer = setInterval(() => {
                plusNotices(1);
            }, 5000)
        }

        function stopAutoSlide() {
            clearTimeout(timer);
            timer = null;
        }

        $('.dokan-admin-notices .next').click(function () {
            stopAutoSlide();
            plusNotices(1);
        });

        $('.dokan-admin-notices .prev').click(function () {
            stopAutoSlide();
            plusNotices(-1);
        });

        $( 'body' ).on( 'click', '.dokan-admin-notices .close-notice', function ( e ) {
            e.preventDefault();

            var self = $( this ),
                data = self.data( 'ajax-data' );

            self.attr( 'disabled', true );

            $.post( ajaxurl, data, function ( response ) {
                if ( response.success ) {
                    plusNotices(1);
                    self.closest('.dokan-admin-notice.active').remove();
                    $('.dokan-admin-notices .total-notice').text(totalNotice - 1);
                    $('.dokan-admin-notices .current-notice').text(currentSlide - 1);
                }
            } );
        } );

        $( 'body' ).on( 'click', '.dokan-admin-notices .message button', function ( e ) {
            e.preventDefault();
            var self = $( this );

            if ( self.data('confirm') ) {
                Swal.fire({
                    title: '<?php echo __("Are you sure?", "dokan-lite") ?>',
                    icon: 'warning',
                    html: self.data('confirm'),
                    showCancelButton: true,
                    confirmButtonText: self.text(),
                }).then((response) => {
                    if (response.isConfirmed) {
                        handleRequest( self );
                    }
                });
            } else {
                handleRequest( self );
            }
        } );

        function handleRequest(self) {
            var data = self.data('ajax-data');

            self.attr( 'disabled', true );
            self.text( self.data('loading') );

            $.ajax( {
                url: ajaxurl,
                method: 'post',
                dataType: 'json',
                data: data,
            } ).done( () => {
                self.text( self.data('completed') );

                if (self.data('reload')) {
                    window.location.reload();
                } else {
                    plusNotices(1);
                    self.closest('.dokan-admin-notice.active').remove();
                    $('.dokan-admin-notices .total-notice').text(totalNotice - 1);
                    $('.dokan-admin-notices .current-notice').text(currentSlide - 1);
                }
            } );
        }
    });
</script>
