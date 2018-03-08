<div class="wrap">
    <h2><?php _e( 'Dokan - Pro Features', 'dokan-lite' ); ?></h2>
    <hr>
    <?php
    $pro_features = array(
        array(
            'title'     => 'Vendor Listing',
            'desc'      => 'View vendor listing with vendor details and earnings.',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/seller@2x.png?58e47e',
            'class'     => 'seller-listing',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Commission Per Vendor Report',
            'desc'      => 'View commission per vendor with vendor earnings. You can charge your vendors percentage, giving them an e-commerce solution free of any monthly fees.',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/earn@2x.png?58e47e',
            'class'     => 'commission-per-seller-report',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Birds Eye View With Reports',
            'desc'      => 'Every vendor can see his/her own sales report and see a bird eye view on the sales they are making. ',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2017/01/Store-Insights-with-Reports-and-Statement@2x.png?x21811',
            'class'     => 'report-bird-view',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Coupon Management',
            'desc'      => 'Every vendor manages their own products and discounts they offer. create discount coupons for special sales! ',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/coupon@2x.png?58e47e',
            'class'     => 'coupon-management',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Manage Product Reviews',
            'desc'      => 'Each vendor manages their own product reviews independently. Delete, mark as spam or modify the product reviews on the fly.',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/reviews@2x.png?58e47e',
            'class'     => 'manage-product-reviews',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Vendor Profile Completeness',
            'desc'      => 'Dokan manage vendors profile completeness par on vendors dashboard. Vendor can view his/her profile completeness percent by the bar. ',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/Dashboard-profile-completion.png?58e47e',
            'class'     => 'profile-completeness',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Vendor Payment Method Setup',
            'desc'      => 'Vendor can manage there payment methods from their dashboard settings. They can set their withdraw method from there.',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/Dashboard-payment.png?58e47e',
            'class'     => 'payment-method',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        ),
        array(
            'title'     => 'Admin Announcement System for Vendor',
            'desc'      => 'Admin can set announcement for vendors from back-end. Admin can choose all vendor or select individuals as he/she wants. the announcement will then show on vendor dashboard which leads to a announcement list template. ',
            'thumbnail' => 'https://wedevs-com-wedevs.netdna-ssl.com/wp-content/uploads/2014/02/Dashboard-announcement.png?58e47e',
            'class'     => 'announcement',
            'url'       => 'https://wedevs.com/products/plugins/dokan/'
        )
    );

    if ( count( $pro_features ) ) {
        foreach ($pro_features as $pro_feature) {
            ?>
            <div class="pro-feature">
                <div class="pro-feature-thumb">
                    <a href="<?php echo $pro_feature['url']; ?>" target="_blank">
                        <img src="<?php echo $pro_feature['thumbnail']; ?>" alt="<?php echo esc_attr( $pro_feature['title'] ); ?>" />
                    </a>
                </div>

                <div class="pro-detail">
                    <h3 class="title">
                        <a href="<?php echo $pro_feature['url']; ?>" target="_blank"><?php echo $pro_feature['title']; ?></a>
                    </h3>

                    <div class="text"><?php echo $pro_feature['desc']; ?></div>
                </div>
            </div>

            <?php
        }
    } else {
        echo '<div class="error"><p>Error fetching add-ons. Please reload the page again!</p></div>';
    }
    ?>

    <style type="text/css">
        .pro-feature {
            width: 48%;
            float: none;
            margin-right: 20px;
            margin-bottom: 20px;
            border: 1px solid #E6E6E6;
            display: inline-block;
            vertical-align: top;
        }

        @media screen and (max-width: 782px) {
	        .pro-feature {
		        width: 100%;
	        }
        }

        .pro-feature:nth-child(2n) {
            margin-right: 0px;
        }

        .pro-feature-thumb img {
            width: 100%;
            height: auto;
        }

        .pro-detail {
            padding: 10px 20px;
            min-height: 100px;
            background: #fff;
        }

        .pro-detail h3.title {
            margin: 5px 0 10px;
            padding: 0;
        }

        .pro-detail h3.title a {
            text-decoration: none;
            color: #111;
        }

        .pro-links {
            padding: 10px;
            background: #F5F5F5;
            border-top: 1px solid #E6E6E6;
        }

        a.button.disabled {
            background: #eee;
        }
    </style>

</div>
