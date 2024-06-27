/* global dokanPageViewsParams */

jQuery( document ).ready( function( $ ) {
    if( ! localStorage ) {
        return;
    }

    if ( ! window.dokanPageViewsParams ) {
        return;
    }

    // Get today's date in the format of YYYY-MM-DD
    let newDate = new Date().toISOString().slice(0, 10);
    let dokanPageViewCount = JSON.parse(localStorage.getItem("dokan_pageview_count"));

    // If there is no data in local storage or today's date is not same as the date in local storage.
    if ( dokanPageViewCount === null || ( dokanPageViewCount.today && dokanPageViewCount.today !== newDate ) ) {
        dokanPageViewCount = { "today": newDate, "post_ids": [] };
    }

    // If the post id is not in the local storage, then send the ajax request.
    if ( ! dokanPageViewCount.post_ids.includes( window.dokanPageViewsParams.post_id )  ) {
        $.post( window.dokanPageViewsParams.ajax_url, {
            action: "dokan_pageview",
            _ajax_nonce: window.dokanPageViewsParams.nonce,
            post_id: window.dokanPageViewsParams.post_id,
        } );

        // Add the post id to the local storage.
        dokanPageViewCount.post_ids.push( window.dokanPageViewsParams.post_id );
        localStorage.setItem( "dokan_pageview_count", JSON.stringify( dokanPageViewCount ) );
    }
} );
