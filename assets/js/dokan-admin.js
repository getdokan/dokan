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
});

