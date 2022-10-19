<label class="dokan-w3 control-label"></label>
<div class="dokan-w6" style="width: auto">
    <?php
    foreach ( $dokan_days as $day_key => $day ) {
        $status = isset( $store_info[ $day_key ]['status'] ) ? $store_info[ $day_key ]['status'] : '';
        $status = isset( $store_info[ $day_key ]['open'] ) ? $store_info[ $day_key ]['open'] : $status;

        $opening_time = dokan_get_store_times( $day_key, 'opening_time' );
        $closing_time = dokan_get_store_times( $day_key, 'closing_time' );
        ?>
        <div class="dokan-store-times">
            <div class="dokan-form-group">
                <label class="day control-label" for="opening-time[<?php echo esc_attr( $day_key ); ?>][working_status]">
                    <?php echo esc_html( dokan_get_translated_days( $day_key ) ); ?>
                </label>
                <label>
                    <select name="<?php echo esc_attr( $day_key ); ?>[working_status]" class="dokan-on-off dokan-form-control">
                        <?php foreach ( $dokan_status as $status_key => $status_value ) : ?>
                            <option value="<?php echo esc_attr( $status_key ); ?>" <?php echo ! empty( $status ) ? selected( $status, $status_key, false ) : ''; ?> >
                                <?php echo esc_html( $status_value ); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </label>
                <label for="opening-time[<?php echo esc_attr( $day_key ); ?>]" class="time" style="visibility: <?php echo isset( $status ) && $status === 'open' ? 'visible' : 'hidden'; ?>" >
                    <input type="text" class="dokan-form-control opening-time"
                        name="opening_time[<?php echo esc_attr( $day_key ); ?>]"
                        id="opening-time[<?php echo esc_attr( $day_key ); ?>]" placeholder="00:00"
                        value="<?php echo esc_attr( $opening_time ); ?>"/>
                </label>
                <label for="closing-time[<?php echo esc_attr( $day_key ); ?>]" class="time" style="visibility: <?php echo isset( $status ) && $status === 'open' ? 'visible' : 'hidden'; ?>" >
                    <input type="text" class="dokan-form-control closing-time"
                        name="closing_time[<?php echo esc_attr( $day_key ); ?>]"
                        id="closing-time[<?php echo esc_attr( $day_key ); ?>]" placeholder="00:00"
                        value="<?php echo esc_attr( $closing_time === '11:59 pm' ? '11:30 pm' : $closing_time ); ?>"/>
                </label>
            </div>
        </div>
    <?php } ?>
</div>
