<?php
if ( dokan_get_option( 'product_style', 'dokan_selling', 'old' ) == 'old' ) {
    ?>
    <tr>
        <td>
            <p>
                <label class="form-label"><?php _e( 'File Name:', 'dokan-lite' ); ?> <span class="tips" title="<?php _e( 'This is the name of the download shown to the customer.', 'dokan-lite' ); ?>">[?]</span></label>
                <input type="text" class="input_text dokan-form-control" placeholder="<?php _e( 'File Name', 'dokan-lite' ); ?>" name="_wc_file_names[]" value="<?php echo esc_attr( $file['name'] ); ?>" />
            </p>

            <p>
                <label class="form-label"><?php _e( 'File URL:', 'dokan-lite' ); ?> <span class="tips" title="<?php _e( 'This is the URL or absolute path to the file which customers will get access to.', 'dokan-lite' ); ?>">[?]</span></label>
                <input type="text" class="input_text wc_file_url dokan-form-control" placeholder="<?php _e( "http://", 'dokan-lite' ); ?>" name="_wc_file_urls[]" value="<?php echo esc_attr( $file['file'] ); ?>" />
            </p>

            <p>
                <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-default upload_file_button" data-choose="<?php _e( 'Choose file', 'dokan-lite' ); ?>" data-update="<?php _e( 'Insert file URL', 'dokan-lite' ); ?>"><?php echo str_replace( ' ', '&nbsp;', __( 'Choose file', 'dokan-lite' ) ); ?></a>
                <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-danger delete"><span><?php _e( 'Delete', 'dokan-lite' ); ?></span></a>
            </p>
        </td>
    </tr>
    <?php
} elseif ( dokan_get_option( 'product_style', 'dokan_selling', 'old' ) == 'new' ) {
    ?>
    <tr>
        <td>
            <input type="text" class="dokan-form-control input_text" placeholder="<?php _e( 'File Name', 'dokan-lite' ); ?>" name="_wc_file_names[]" value="<?php echo esc_attr( $file['name'] ); ?>" />
        </td>
        <td>
            <p>
                <input type="text" class="dokan-form-control dokan-w8 input_text wc_file_url" placeholder="<?php _e( "http://", 'dokan-lite' ); ?>" name="_wc_file_urls[]" value="<?php echo esc_attr( $file['file'] ); ?>" style="margin-right: 8px;" />
                <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-default upload_file_button" data-choose="<?php _e( 'Choose file', 'dokan-lite' ); ?>" data-update="<?php _e( 'Insert file URL', 'dokan-lite' ); ?>"><?php echo str_replace( ' ', '&nbsp;', __( 'Choose file', 'dokan-lite' ) ); ?></a>
            </p>
        </td>

        <td>
            <p>
                <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-danger delete"><span><?php _e( 'Delete', 'dokan-lite' ); ?></span></a>
            </p>
        </td>
    </tr>
    <?php
}
?>
