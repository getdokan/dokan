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
    	<?php $to =  $value['open'] == 'close' ? 'Off Day' : '-' ?>
    	<?php $is_open =  $value['open'] == 'open' ? true : false ?>
        <div class="<?php echo esc_attr( $day ) . '-time' ?>">
            <label for=""><?php echo esc_attr( ucfirst( $day ) ) ?></label>:
            <?php echo sprintf( __( '<span> %s %s %s </span>', 'dokan-lite' ), $is_open ? esc_attr( ucfirst( $value['opening_time'] ) ) : '' , $to, $is_open ? esc_attr( ucfirst( $value['closing_time'] ) ) : '' ); ?> 
        </div>
    <?php endforeach; ?>
</div>
<style>
	.dokan-store-open-close
	 label {
	    width: 85px;
	}
	.dokan-store-open-close span {
	    padding-left: 10px;
	}	
</style>