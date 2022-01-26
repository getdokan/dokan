<p>
    <label for="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>"><?php esc_html_e( 'Titlesada:', 'dokan-lite' ); ?></label>
    <input class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'title' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'title' ) ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
</p>
<p>
    <label for="<?php echo esc_attr( $this->get_field_id( 'attribute' ) ); ?>"><?php echo __( 'Attribute', 'dokan-lite' ); ?></label>
    <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'attribute' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'attribute' ) ); ?>">
        <?php foreach ( $attribute_array as $option_key => $option_value ) : ?>
            <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $option_key, $attribute_value ); ?>><?php echo esc_html( $option_value ); ?></option>
        <?php endforeach; ?>
    </select>
</p>
<p>
    <label for="<?php echo esc_attr( $this->get_field_id( 'query_type' ) ); ?>"><?php echo __( 'Query Type', 'dokan-lite' ); ?></label>
    <select class="widefat" id="<?php echo esc_attr( $this->get_field_id( 'query_type' ) ); ?>" name="<?php echo esc_attr( $this->get_field_name( 'query_type' ) ); ?>">
        <?php foreach ( $query_type as $option_key => $option_value ) : ?>
            <option value="<?php echo esc_attr( $option_key ); ?>" <?php selected( $option_key, $query_value ); ?>><?php echo esc_html( $option_value ); ?></option>
        <?php endforeach; ?>
    </select>
</p>
