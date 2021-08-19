;(function($) {
    var storeLists = {
        /**
         * Query holder
         *
         * @type object
         */
        query: {},

        /**
         * Form holder
         *
         * @type object
         */
        form: null,

        /**
         * Category item string holder
         *
         * @type array
         */
        cateItemStringArray: [],

        /**
         * Init all the methods
         *
         * @return void
         */
        init: function() {
            $( '#dokan-store-listing-filter-wrap .sort-by #stores_orderby' ).on( 'change', this.buildSortByQuery );
            $( '#dokan-store-listing-filter-wrap .toggle-view span' ).on( 'click', this.toggleView );
            $( '#dokan-store-listing-filter-wrap .dokan-store-list-filter-button, #dokan-store-listing-filter-wrap .dokan-icons, #dokan-store-listing-filter-form-wrap .apply-filter #cancel-filter-btn ' ).on( 'click', this.toggleForm );

            // Build query string
            $( '#dokan-store-listing-filter-form-wrap .store-search-input' ).on( 'change', this.buildSearchQuery );

            // Submit the form
            $( '#dokan-store-listing-filter-form-wrap .apply-filter #apply-filter-btn' ).on( 'click', this.submitForm );

            this.maybeHideListView();

            const self = storeLists;

            self.form = document.forms.dokan_store_lists_filter_form;

            const view = self.getLocal( 'dokan-layout' );

            if ( view ) {
                const toggleBtns = $( '.toggle-view span' );
                self.setView( view, toggleBtns );
            }

            const params = self.getParams();

            if ( params.length ) {
                let openTheForm = false;

                params.forEach( function( param ) {
                    const keys = Object.keys( param );
                    const values = Object.values( param );

                    if ( ! keys.includes( 'stores_orderby' ) || params.length > 1 ) {
                        openTheForm = true;
                    }

                    self.setParams( keys, values );
                });

                if ( openTheForm ) {
                    $( '#dokan-store-listing-filter-form-wrap' ).slideToggle();
                }
            }

            if ( $( "#dokan-store-listing-filter-form-wrap" ).length ) {
                $('.store-search-input').keypress(function (e) {
                    var key = e.which;
                    if( key == 13 ) {
                        $( "#dokan-store-listing-filter-form-wrap" ).submit();
                        return false;  
                    }
                });
            }

            $( 'body' ).click( function ( evt ) {  
                if ( ! $( evt.target ).is( 'div#dokan-store-products-search-result li' ) ) {    
                    $("#dokan-store-products-search-result").html('');
                    $('#dokan-store-products-search-result').removeClass( 'dokan-store-products-search-has-results' );           
                }
            });

            $( 'body' ).on( 'keyup', '.dokan-store-products-filter-search', dokan_debounce_delay( function ( evt ) {
                evt.preventDefault();

                var self        = $(this);
                var search_term = self.val();
                var store_id    = self.data('store_id');

                if ( ! search_term ) {
                    return;
                }

                $('.dokan-store-products-filter-search').addClass('dokan-ajax-search-loader');
                $('#dokan-store-products-search-result').removeClass( 'dokan-store-products-search-has-results' );
                $('#dokan-store-products-search-result').hide();
                $("#dokan-store-products-search-result").html('');

                jQuery.ajax({
                    type     : "post",
                    dataType : "json",
                    url      : dokan.ajaxurl,
                    data: {
                        search_term : search_term,
                        store_id    : store_id,
                        _wpnonce    : dokan.store_product_search_nonce,
                        action      : 'dokan_store_product_search_action'
                    },
                    success: function(response) {
                        $('.dokan-store-products-filter-search').removeClass('dokan-ajax-search-loader');
                        $("#dokan-store-products-search-result").show();
                        $('#dokan-store-products-search-result').addClass( 'dokan-store-products-search-has-results' );

                        if ( response.type == 'success' ){
                            $("#dokan-store-products-search-result").html('<ul>'+response.data_list+'</ul>');
                        } else {
                            $("#dokan-store-products-search-result").html('<ul class="dokan-store-product-results-not-found">'+response.data_list+'</ul>');
                        }
                    }
                });
            }, 500 ) );
        },

        buildSortByQuery: function( event ) {
            const self = storeLists;

            self.query.stores_orderby = event.target.value;
            self.submitForm( event );
        },

        /**
         * Toggle store layout view
         *
         * @param  string event
         *
         * @return void
         */
        toggleView: function( event ) {
            const self = storeLists;
            const currentElement = $( event.target );
            const elements = currentElement.parent().find( 'span' );
            const view = currentElement.data( 'view' );

            self.setView( view, elements );
            self.setLocal( 'dokan-layout', view );
        },

        /**
         * Set grid or list view
         *
         * @param string view
         * @param array elements
         *
         * @return void
         */
        setView: function( view, elements ) {
            if ( typeof view === 'undefined'
                || view.length < 1
                || typeof elements === 'undefined'
                || elements.length < 1
                ) {
                return;
            }

            const listingWrap = $( '#dokan-seller-listing-wrap' );

            [...elements].forEach( function( value ) {
                const element = $( value );

                if ( view === element.data( 'view' ) ) {
                    element.addClass( 'active' );
                    listingWrap.addClass( view );
                } else {
                    element.removeClass( 'active' );
                    listingWrap.removeClass( element.data( 'view' ) );
                }
            });
        },

        /**
         * Toggle form
         *
         * @param  string event
         *
         * @return void
         */
        toggleForm: function( event ) {
            event.preventDefault();

            $( '#dokan-store-listing-filter-form-wrap' ).slideToggle();
        },

        /**
         * Build Search Query
         *
         * @param  string event
         *
         * @return void
         */
        buildSearchQuery: function( event ) {
            if ( event.target.value ) {
                storeLists.query.dokan_seller_search = event.target.value;
            } else {
                delete storeLists.query.dokan_seller_search;
            }
        },

        /**
         * Submit the form
         *
         * @param  string event
         *
         * @return void
         */
        submitForm: function( event ) {
            event.preventDefault();

            const queryString = decodeURIComponent( $.param( storeLists.query ) );
            const target      = '/page';
            const pathName    = window.location.pathname;
            const path        = pathName.includes( target ) ? pathName.substr( 0, pathName.indexOf( target ) ) : '';

            window.history.pushState( null, null, `${path}?${queryString}` );
            window.location.reload();
        },

        /**
         * Add data into local storage
         *
         * @param string key
         * @param mix value
         *
         * @return void
         */
        setLocal: function( key, value ) {
            window.localStorage.setItem( key, value );
        },

        /**
         * Get data from local storage
         *
         * @param  string key
         *
         * @return mix
         */
        getLocal: function( key ) {
            return window.localStorage.getItem( key );
        },

        setParams: function( key, value ) {
            const self = storeLists;
            const elements = self.form ? self.form.elements : '';
            const sortingForm = document.forms.stores_sorting;
            const sortingFormElements = sortingForm ? sortingForm.elements : '';

            Object.values( sortingFormElements ).forEach( function( element ) {
                if ( element.name === key[0] ) {
                    $( element ).val( value[0] );
                }
            });

            // on reload, if query string exists, set the form input elment value
            Object.values( elements ).forEach( function( element ) {
                if ( key.includes( element.name ) ) {
                    if ( element.type === 'checkbox' ) {
                        element.checked = ['yes', 'true', '1'].includes( value[0] ) ? true : false;
                    } else if ( [ 'text', 'search' ].includes( element.type ) ) {
                        element.value = value[0];
                    }
                }

                // for backward compatibility we'll allow `store_category[]` query_var.
                if ( key[0].includes( 'store_categories[' ) || key[0].includes( 'store_category[' ) ) {
                    const trimedValue = value[0].split( ' ' ).join( '-' );
                    const cateItem = $( `[data-slug=${trimedValue}]` );

                    if ( ! self.cateItemStringArray.includes( cateItem.text().trim() ) ) {
                        self.cateItemStringArray.push( cateItem.text().trim() );
                    }

                    cateItem.addClass( 'dokan-btn-theme' );

                } else if ( key[0] === 'rating' ) {
                    const trimedValue = value[0].split( ' ' ).join( '-' );

                    $( `[data-${key[0]}=${trimedValue}]` ).addClass( 'active' );
                    $( `[data-rating=${trimedValue}]` ).parent().addClass( 'selected' );
                }
            });

            key.forEach( function( param, index ) {
                if ( ! param.includes( '[' ) ) {
                    self.query[ param ] = value[ index ];
                }
            });
        },

        /**
         * Get params from
         *
         * @return array
         */
        getParams: function() {
            const params = new URLSearchParams( location.search );
            const allParams = [];

            params.forEach( function( value, key ) {
                allParams.push( {
                    [key]: value
                } );
            });

            return allParams;
        },

        /**
         * On mobile screen hide the grid, list view button
         *
         * @return void
         */
        maybeHideListView: function() {
            const self = storeLists;

            if ( window.matchMedia( '(max-width: 767px)' ).matches ) {
                if ( 'list-view' === self.getLocal( 'dokan-layout' ) ) {
                    self.setLocal( 'dokan-layout', 'grid-view' );
                }
            }

            $( window ).on( 'resize', function() {
                const container = $(this);

                if ( container.width() < 767 ) {
                    $( '#dokan-seller-listing-wrap' ).removeClass( 'list-view' );
                    $( '#dokan-seller-listing-wrap' ).addClass( 'grid-view' );
                } else {
                    $( '.toggle-view.item span' ).last().removeClass( 'active' );
                    $( '.toggle-view.item span' ).first().addClass( 'active' );
                }
            });
        }
    };

    if ( window.dokan ) {
        window.dokan.storeLists = storeLists;
        window.dokan.storeLists.init();
    }

    function dokan_debounce_delay( callback, ms ) {
        var timer = 0;

        return function() {
            var context = this, 
                args    = arguments;

            clearTimeout( timer );

            timer = setTimeout( function () {
              callback.apply( context, args );
            }, ms || 0);
        };
    }

})(jQuery);
