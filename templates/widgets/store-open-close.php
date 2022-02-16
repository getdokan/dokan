<?php
/**
 * Dokan Store Open Close Time Widget
 *
 * @since 3.3.8
 *
 * @package dokan
 */
?>
<div class="dokan-store-open-close">
    <?php foreach( $dokan_days as $day => $value ) : ?>
        <?php
        if ( ! isset( $dokan_store_time[ $day ] ) || ( isset( $dokan_store_time[ $day ]['status'] ) && 'close' === $dokan_store_time[ $day ]['status'] ) ) {
            echo sprintf(
                '<div class="open-close-day %1$s-time"><label for="">%2$s</label> :<span class="store-time"> %3$s </span></div>',
                esc_attr( $day ),
                esc_html( ucfirst( dokan_get_translated_days( $day ) ) ),
                __( 'Off Day', 'dokan-lite' )
                );
            continue;
        }

        // get store opening time
        $opening_times = ! empty( $dokan_store_time[ $day ]['opening_time'] ) ? $dokan_store_time[ $day ]['opening_time'] : [];

        // If dokan pro doesn't exists then show single item.
        if ( ! dokan()->is_pro_exists() ) {
            // Get single time.
            $opening_times = ! empty( $opening_times ) && is_array( $opening_times ) ? $opening_times[0] : [];
        }

        $times_length = ! empty( $opening_times ) ? count( (array) $opening_times ) : 0;
        // return if opening time length is zero
        if ( empty( $times_length ) ) {
            continue;
        }
        ?>

        <div class="open-close-day <?php echo esc_attr( $day ) . '-time' ?>">
            <?php
            // Get formatted store times.
            for ( $index = 0; $index < $times_length; $index++ ) :
                $opening_timestamps     = dokan_current_datetime()->modify( $dokan_store_time[ $day ]['opening_time'][ $index ] )->getTimestamp();
                $closing_timestamps     = dokan_current_datetime()->modify( $dokan_store_time[ $day ]['closing_time'][ $index ] )->getTimestamp();
                $formatted_opening_time = dokan_format_date( $opening_timestamps, wc_time_format() );
                $formatted_closing_time = dokan_format_date( $closing_timestamps, wc_time_format() );

                echo sprintf(
                    '<label for="">%1$s</label> :<span class="store-time">%2$s <span class="separator">-</span> %3$s</span>',
                    $index === 0 ? esc_html( ucfirst( dokan_get_translated_days( $day ) ) ) : '',
                    esc_html( $formatted_opening_time ),
                    esc_html( $formatted_closing_time )
                );
            endfor;
            ?>
        </div>
    <?php endforeach; ?>
</div>

<style>
	.dokan-store-open-close label {
        width: 100px;
        display: inline-block;
	}
	.dokan-store-open-close .store-time {
        display: inline-block;
	    padding-left: 10px;
	}
    .dokan-store-open-close .open-close-day {
        padding-top: 10px;
    }
    .dokan-store-open-close .store-time .separator {
        padding: 0 5px;
    }
</style>