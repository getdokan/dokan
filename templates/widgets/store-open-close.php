<?php
/**
 * Dokan Store Open Close Time Widget
 *
 * @since 2.7.3
 *
 * @package dokan
 */
?>
<div class="dokan-store-open-close">
    <?php foreach( $dokan_store_time as $day => $value ) : ?>
    	<?php
            $status  = isset( $value['open'] ) ? $value['open'] : $value['status'];
            $to      = ! empty( dokan_get_translated_days( $status ) ) ? dokan_get_translated_days( $status ) : '-';
            $is_open =  $status == 'open' ? true : false;

            // Get single time.
            $opening_times = dokan_get_store_times( $day, 'opening_time' );

            // If dokan pro exists then show multiple times.
            if ( dokan()->is_pro_exists() ) {
                $opening_times = ! empty( $value['opening_time'] ) ? $value['opening_time'] : [];
            }

            $times_length = ! empty( $opening_times ) ? count( (array) $opening_times ) : 0;
        ?>

        <div class="open-close-day <?php echo esc_attr( $day ) . '-time' ?>">
            <?php
            // Get formatted store times.
            for ( $index = 0; $index < $times_length; $index++ ) :
                $formatted_opening_time = dokan_current_datetime()->modify( $value['opening_time'][ $index ] )->format( wc_time_format() );
                $formatted_closing_time = dokan_current_datetime()->modify( $value['closing_time'][ $index ] )->format( wc_time_format() );

                echo sprintf(
                    __( '<label for="">%s</label> :<span> %s %s %s </span>', 'dokan-lite' ),
                    $index === 0 ? esc_html( ucfirst( dokan_get_translated_days( $day ) ) ) : '',
                    $is_open ? esc_html( $formatted_opening_time ) : '',
                    $to,
                    $is_open ? esc_html( $formatted_closing_time ) : '',
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
	.dokan-store-open-close span {
	    padding-left: 10px;
	}
    .dokan-store-open-close .open-close-day {
        padding-top: 10px;
    }
</style>
