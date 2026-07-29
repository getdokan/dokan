/**
 * Front-end behaviour for the store filter bar block.
 *
 * Dokan's listing script binds these controls by id and only initialises on the
 * classic store listing page, so the block carries its own behaviour. It steps
 * aside when that script is already driving the page, and scopes everything to
 * the block so several filter bars can coexist.
 */
document.addEventListener( 'DOMContentLoaded', function () {
	if ( window.dokan && window.dokan.storeLists ) {
		return;
	}

	const bars = document.querySelectorAll( '.dokan-store-filter-bar-block' );

	if ( ! bars.length ) {
		return;
	}

	const readLayout = () => {
		try {
			return window.localStorage.getItem( 'dokan-layout' );
		} catch ( error ) {
			return null;
		}
	};

	const applyLayout = ( view ) => {
		document
			.querySelectorAll( '.dokan-store-list-block [id="dokan-seller-listing-wrap"]' )
			.forEach( ( wrap ) => {
				wrap.classList.remove( 'grid-view', 'list-view' );
				wrap.classList.add( view );
			} );

		document
			.querySelectorAll( '.dokan-store-filter-bar-block .toggle-view span' )
			.forEach( ( span ) => {
				span.classList.toggle( 'active', span.dataset.view === view );
			} );

		try {
			window.localStorage.setItem( 'dokan-layout', view );
		} catch ( error ) {
			// Layout preference is optional.
		}
	};

	const storedLayout = readLayout();

	if ( storedLayout ) {
		applyLayout( storedLayout );
	}

	bars.forEach( ( bar ) => {
		const form = bar.querySelector( 'form[name="dokan_store_lists_filter_form"]' );

		const toggleForm = ( event ) => {
			event.preventDefault();

			if ( ! form ) {
				return;
			}

			const hidden = window.getComputedStyle( form ).display === 'none';
			form.style.display = hidden ? 'block' : 'none';
		};

		bar.querySelectorAll( '.dokan-store-list-filter-button, .dokan-icons' ).forEach(
			( trigger ) => trigger.addEventListener( 'click', toggleForm )
		);

		const cancel = bar.querySelector( '#cancel-filter-btn' );

		if ( cancel ) {
			cancel.addEventListener( 'click', toggleForm );
		}

		const sort = bar.querySelector( 'select[name="stores_orderby"]' );

		if ( sort ) {
			sort.addEventListener( 'change', () => {
				const url = new URL( window.location.href );

				url.searchParams.set( 'stores_orderby', sort.value );
				url.searchParams.delete( 'paged' );

				window.location.assign( url.toString() );
			} );
		}

		bar.querySelectorAll( '.toggle-view span' ).forEach( ( span ) =>
			span.addEventListener( 'click', () => applyLayout( span.dataset.view ) )
		);
	} );

	// Keep the filter form open when a search is active, matching the classic page.
	if ( new URL( window.location.href ).searchParams.get( 'dokan_seller_search' ) ) {
		bars.forEach( ( bar ) => {
			const form = bar.querySelector( 'form[name="dokan_store_lists_filter_form"]' );

			if ( form ) {
				form.style.display = 'block';
			}
		} );
	}
} );
