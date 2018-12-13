<tr>
    <td>
        <input type="text" class="dokan-form-control input_text" placeholder="<?php esc_attr_e( 'File Name', 'dokan-lite' ); ?>" name="_wc_file_names[]" value="<?php echo esc_attr( $file['name'] ); ?>" />
    </td>
    <td>
        <p>
            <input type="text" class="dokan-form-control dokan-w8 input_text wc_file_url" placeholder="<?php esc_attr_e( "http://", 'dokan-lite' ); ?>" name="_wc_file_urls[]" value="<?php echo esc_attr( $file['file'] ); ?>" style="margin-right: 8px;" />
            <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-default upload_file_button" data-choose="<?php esc_attr_e( 'Choose file', 'dokan-lite' ); ?>" data-update="<?php esc_attr_e( 'Insert file URL', 'dokan-lite' ); ?>"><?php echo esc_html( str_replace( ' ', '&nbsp;', __( 'Choose file', 'dokan-lite' ) ) ); ?></a>
        </p>
    </td>

    <td>
        <p>
            <a href="#" class="dokan-btn dokan-btn-sm dokan-btn-danger delete"><span><?php esc_html_e( 'Delete', 'dokan-lite' ); ?></span></a>
        </p>
    </td>
</tr>
