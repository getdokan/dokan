<div id="vendor-store-times">
    <div class="store-times-heading">
        <i class="fas fa-calendar-day"></i>
        <h4><?php echo esc_html( $times_heading ); ?></h4>
    </div>
    <?php
    foreach ( $dokan_days as $day_key => $day ) :
        $store_info = ! empty( $dokan_store_times[ $day_key ] ) ? $dokan_store_times[ $day_key ] : [];
        $store_status = ! empty( $store_info['status'] ) ? $store_info['status'] : 'close';
        ?>
        <div class="store-time-tags">
            <div class="store-days <?php echo $today === $day_key ? 'current_day' : ''; ?>"><?php echo esc_html( $day ); ?></div>
            <div class="store-times">
                <?php if ( $store_status === 'close' ) : ?>
                    <span class="store-close"><?php echo esc_html( $closed_status ); ?></span>
                <?php endif; ?>

                <?php
                // Get store times.
                $opening_times = ! empty( $store_info['opening_time'] ) ? $store_info['opening_time'] : [];

                // If dokan pro doesn't exists then get single item.
                if ( ! dokan()->is_pro_exists() ) {
                    $opening_times = ! empty( $opening_times ) && is_array( $opening_times ) ? [ $opening_times[0] ] : [];
                }

                $times_length = ! empty( $opening_times ) ? count( (array) $opening_times ) : 0;

                // Get formatted times.
                for ( $index = 0; $index < $times_length; $index++ ) :
                    $formatted_opening_time = $store_info['opening_time'][ $index ] ? $current_time->modify( $store_info['opening_time'][ $index ] ) : '';
                    $formatted_closing_time = $store_info['closing_time'][ $index ] ? $current_time->modify( $store_info['closing_time'][ $index ] ) : '';
                    $exact_time             = '';

                    // Check if formatted opening time or closing time missing.
                    if ( ! $formatted_opening_time || ! $formatted_closing_time ) {
                        continue;
                    }

                    if ( $today === $day_key && $formatted_opening_time <= $current_time && $formatted_closing_time >= $current_time ) {
                        $exact_time = 'current_time';
                    }
                    ?>
                    <span class="store-open <?php echo esc_attr( $exact_time ); ?>" href="#">
                        <?php
                        echo esc_html(
                            $formatted_opening_time->format( wc_time_format() ) . ' - ' .
                            $formatted_closing_time->format( wc_time_format() )
                        );
                        ?>
                    </span>
                <?php endfor; ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>
