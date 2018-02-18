/**
 * Admin helper functions
 *
 * @package WeDevs Framework
 */
jQuery(function($) {

    window.WeDevs_Admin = {

        /**
         * Image Upload Helper Function
         **/
        imageUpload: function (e) {
            e.preventDefault();

            var self = $(this),
                inputField = self.siblings('input.image_url');

            tb_show('', 'media-upload.php?post_id=0&amp;type=image&amp;TB_iframe=true');

            window.send_to_editor = function (html) {
                var url = $(html).attr('src');
                //if we find an image, get the src
                if($(html).find('img').length > 0) {
                    url = $(html).find('img').attr('src');
                }

                inputField.val(url);

                var image = '<img src="' + url + '" alt="image" />';
                    image += '<a href="#" class="remove-image"><span>Remove</span></a>';

                self.siblings('.image_placeholder').empty().append(image);
                tb_remove();
            }
        },

        removeImage: function (e) {
            e.preventDefault();
            var self = $(this);

            self.parent('.image_placeholder').siblings('input.image_url').val('');
            self.parent('.image_placeholder').empty();
        }
    }

    $('.tips').tooltip();

    // settings api - radio_image
    $('.dokan-settings-radio-image button').on('click', function (e) {
        e.preventDefault();

        var btn = $(this),
            template = btn.data('template'),
            input = btn.data('input'),
            container = btn.parents('.dokan-settings-radio-image-container');

        $('#' + input).val(template);

        container.find('.active').removeClass('active').addClass('not-active');

        btn.parents('.dokan-settings-radio-image').addClass('active').removeClass('not-active');
    });

    $(function(){
        $('#the-list').on('click', '.editinline', function(){
            var post_id = $(this).closest('tr').attr('id');

            post_id = post_id.replace("post-", "");

            var $vendor_id_inline_data = $('#dokan_vendor_id_inline_' + post_id).find('#dokan_vendor_id').text(),
                $wc_inline_data = $('#woocommerce_inline_' + post_id );

            $( 'select[name="dokan_product_author_override"] option:selected', '.inline-edit-row' ).attr( 'selected', false ).change();
            $( 'select[name="dokan_product_author_override"] option[value="' + $vendor_id_inline_data + '"]' ).attr( 'selected', 'selected' ).change();
        });
    });
});

