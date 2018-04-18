/**
 * Admin helper functions
 *
 * @package WeDevs Framework
 */
jQuery(function($) {

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

