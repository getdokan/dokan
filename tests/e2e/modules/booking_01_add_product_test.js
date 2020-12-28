Feature('modules/booking Product module');

Scenario('Vendor add booking product', ({ I }) => {
    I.loginAsVendor();
    	 I.click('Booking');
    	 I.wait(3);
    	 I.click(' Add New Booking Product');
    	 I.wait(2);
    	 I.fillField('#post_title','Hotel Seagull Booking 3');
    	 I.wait(3);
    	 I.selectOption('_wc_booking_duration_type','Customer defined blocks of');
    	 I.fillField('_wc_booking_duration','2');
    	 I.selectOption('#_wc_booking_duration_unit','Hour(s)');
    	 I.fillField('#_wc_booking_min_duration','1');
    	 I.fillField('#_wc_booking_max_duration','2');
    	 I.selectOption('_wc_booking_calendar_display_mode','Calendar always visible');
    	 I.checkOption('#_wc_booking_enable_range_picker');
    	 I.fillField('#_wc_booking_qty','2');
    	 I.fillField('#_wc_booking_min_date','2');
    	 I.selectOption('#_wc_booking_min_date_unit','week');
    	 I.fillField('#_wc_booking_max_date','1');
    	 I.selectOption('#_wc_booking_max_date_unit','month');
    	 I.fillField('#_wc_booking_buffer_period','1');
    	 I.click('Add Range');
    	 // I.selectOption('.select wc_booking_availability_type','Date range');
    	 I.fillField('wc_booking_availability_from_date[]','2020-02-25');
    	 I.fillField('wc_booking_availability_to_date[]','2020-02-29');
    	 I.selectOption('wc_booking_availability_bookable[]','Yes');
    	 I.fillField('wc_booking_availability_priority[]','10');
    	 I.fillField('#_wc_booking_cost','200');
    	 I.fillField('#_wc_booking_block_cost','250');
    	 I.fillField('#_wc_display_cost','100');
    	 I.click('Save Product');
        //  I.see('Success! The product has been saved successfully.');
        I.see('Edit Booking Product');
});

