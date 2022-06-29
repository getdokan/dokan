;( function( $ ) {
    let modal                 = $( '#dokan-product-category-modal' );
    let searchResultContainer = $( '#dokan-cat-search-res' );
    let searchResUl           = $( '#dokan-cat-search-res-ul' );
    let rightIndicator        = $( '.dokan-single-categories-right' );
    let leftIndicator         = $( '.dokan-single-categories-left' );

    let categoriesState   = [];
    let searchResultState = [];
    let inputHolder       = '';
    let selectedCatId     = '';

    var ProductCategory = {

        init() {

            $( 'body' ).on( 'click', '.dokan-product-category-li', this.categoryLiClick );

            $( 'body' ).on( 'click', '.dokan-cat-search-res-li', this.clickSearchResLi );

            $( 'body' ).on( 'keyup', '#dokan-single-cat-search-input', ProductCategory.debounce( this.typeToSearch, 500 ) );

            $( '#dokan-single-categories' ).scroll( this.categoryScroll );

            $( 'body' ).on( 'click', '.dokan-single-categories-right-box', ProductCategory.indicatorScrollTo );

            $( 'body' ).on( 'click', '.dokan-single-categories-left-box', function() {
                ProductCategory.indicatorScrollTo( false );
            } );

            $( 'body' ).on( 'click', '.dokan-single-cat-select-btn', ProductCategory.chooseCatButton );

            $( 'body' ).on( 'click', '.dokan-category-open-modal', ProductCategory.initModal );

            $( 'body' ).on( 'click', '#dokan-category-close-modal', ProductCategory.hideCategoryModal );

            $( 'body' ).on( 'click', '.dokan-single-cat-add-btn', ProductCategory.addANewCatBox );

            $( 'body' ).on( 'click', '.dokan-select-product-category-remove-container', ProductCategory.removeCatBox );
        },

        initModal() {
            inputHolder   = $( this ).data( 'dokansclevel' );
            let chosenCat = $( this ).siblings( ".dokan-cat-inputs-holder" ).find( ".dokan_chosen_product_cat" );

            ProductCategory.openModal( chosenCat );
        },

        removeCatBox() {
            $( this ).closest( '.dokan-select-product-category-container' )[0].remove();
        },

        categoryLiClick() {
            let { catlevel, termId, name, haschild } = $( this ).data();
            selectedCatId = termId;

            ProductCategory.removeAfterClickedUls( catlevel, termId );
            ProductCategory.loadChildCategories( catlevel, termId, name, haschild );
        },

        clickSearchResLi() {
            let { termid, index, name } = $( this ).data();
            if ( termid ) {
                selectedCatId = termid;
                ProductCategory.setCatUiBasedOnOneCat( termid, searchResultState[ index ] );
            }
        },

        typeToSearch() {
            let inputText = $( this ).val();
            $( '#dokan-cat-search-text-limit' ).html( inputText.length );

            if ( inputText.length > 0 ) {
                ProductCategory.hideSearchResults( false );
                ProductCategory.doSearchCates( inputText );
            } else {
                ProductCategory.hideSearchResults();
            }
        },

        categoryScroll() {
            let totalScrollable = $( '#dokan-single-categories' ).get( 0 ).scrollWidth - $( '#dokan-single-categories' ).innerWidth();
            let left = $( this ).scrollLeft();
            let right = totalScrollable - left;

            ProductCategory.showIndicators( leftIndicator, left );
            ProductCategory.showIndicators( rightIndicator, right );
        },

        chooseCatButton() {
            if ( $(`.dokan_chosen_product_cat_${selectedCatId}`).length ) {
                dokan_sweetalert( dokan_product_category_data.i18n.duplicate_category, { icon: 'warning', } );
                return;
            }

            ProductCategory.setCatName( ProductCategory.getSelectedLabel() );
            ProductCategory.setCatId( selectedCatId );
            ProductCategory.hideCategoryModal();
        },

        setCatUiBasedOnOneCat: function( catId, category ) {
            ProductCategory.disableDoneBtn( category.children.length > 0 );

            let allUl = [ ...category.parents ];
            let selectedInUls = [ ...category.parents ];

            allUl.unshift( 0 );
            selectedInUls.push( Number( catId ) );

            let UL = allUl.map( ( id, index ) => {
                return ProductCategory.getCategoriesWithParentId( id, index + 1, selectedInUls[ index ] );
            });

            categoriesState = UL;
            ProductCategory.updateCategoryUi();

            ProductCategory.hideSearchResults();
            ProductCategory.scrollTo( UL.length );
        },

        async doSearchCates( text ) {
            let searchResult = [];
            for ( const key in dokan_product_category_data.categories ) {
                let category = dokan_product_category_data.categories[ key ];
                let fullText = category.name;
                text = text.toLowerCase();
                let found    = fullText.toLowerCase().indexOf( text );

                if ( found >= 0 ) {
                    searchResult.push( category );
                }
            }

            searchResultState = searchResult;
            ProductCategory.updateSearchResultUi();
        },

        hideSearchResults( status = true ) {
            status ? searchResultContainer.addClass( 'dokan-hide' ) : searchResultContainer.removeClass( 'dokan-hide' );
        },

        showIndicators( element, scrolled ) {
            ( scrolled > 5 ) ? element.removeClass( 'dokan-hide' ) : element.addClass( 'dokan-hide' );
        },

        showCategoryModal() {
            selectedCatId = '';
            ProductCategory.disableDoneBtn();
            modal.css( 'display', 'flex' );
            categoriesState = [];
            ProductCategory.loadAllParentCategories();
        },

        disableDoneBtn( disable = true ) {
            $( '.dokan-single-cat-select-btn' ).prop( 'disabled', disable );
        },

        hideCategoryModal() {
            modal.css( 'display', 'none' );
        },

        loadAllParentCategories() {
            categoriesState.push( ProductCategory.getCategoriesWithParentId() );
            ProductCategory.updateCategoryUi();
        },

        getCategoriesWithParentId( parentId = 0, level = 1, selectedId = false ) {
            let returnableCategories = [];

            for ( const key in dokan_product_category_data.categories ) {
                let currentCategory = dokan_product_category_data.categories[ key ];
                if ( currentCategory.parent_id == parentId ) {
                    currentCategory.uiActivaion = Number( currentCategory.term_id ) === selectedId ? 'dokan-product-category-li-active' : false;
                    returnableCategories.push( currentCategory );
                }
            }

            return {
                categories: returnableCategories,
                level: level,
                term_id: parentId,
            };
        },

        loadChildCategories( catlevel, termId, name, haschild ) {
            if ( ! haschild ) {
                ProductCategory.disableDoneBtn(false);
                return;
            }
            ProductCategory.disableDoneBtn();

            let categories = ProductCategory.getCategoriesWithParentId( termId, catlevel + 1 );
            categoriesState.push( categories );
            ProductCategory.updateCategoryUi();
            ProductCategory.scrollTo( catlevel - 1 );
        },

        updateSearchResultUi() {
            let html = '';

            html = searchResultState.map( ( element, index ) => {
                return `<li data-name="${ element.name }" data-termid="${ element.term_id }" data-index="${ index }" class="dokan-cat-search-res-li">
                        <div class="dokan-cat-search-res-item">
                            ${ element.name }
                        </div>
                        <div class="dokan-cat-search-res-history">
                            ${ ProductCategory.getSearchedParentHistory( element.parents, element.name ) }
                        </div>
                    </li>`;
            });

            if ( 0 == searchResultState.length ) {
                html = `<li data-name="" data-termid="" data-index="" class="dokan-cat-search-res-li">
                        <div class="dokan-cat-search-res-item">
                            ${ window.dokan.i18n_no_result_found }
                        </div>
                        <div class="dokan-cat-search-res-history">
                        </div>
                    </li>`;
            }

            searchResUl.html( html );
        },

        getSearchedParentHistory( parents, searched ) {
            let html = "";

            html = parents.map( ( parentId, index ) => {
                return `<span class="dokan-cat-search-res-suggestion">${ ProductCategory.findCategory( parentId ).name }</span>
                    <span class="dokan-cat-search-res-indicator"><i class="fas fa-caret-right"></i></span>`;
            }).join('');

            html += `<span class="dokan-cat-search-res-suggestion-selected">${ ProductCategory.highlight( searched ) }</span>`;

            return html;
        },

        highlight( fullText ) {
            let text = $( '#dokan-single-cat-search-input' ).val().toLowerCase();
            let index = fullText.toLowerCase().indexOf( text );

            if ( index >= 0 ) {
                return `<span>${ fullText.substring( 0, index ) }</span>
                    <span class='dokan-cat-highlight'>${ fullText.substring( index, index + text.length ) }</span>
                    <span>${ fullText.substring( index + text.length ) }</span>`;
            }
        },

        updateCategoryUi() {
            let html = ProductCategory.getCatUlHtml();

            $( '#dokan-single-categories' ).html( html );
            ProductCategory.updateSelectedLabel();
            ProductCategory.adjustCategoryPosition();
        },

        updateSelectedLabel() {
            $( '#dokan-selected-category-span' ).html( ProductCategory.getSelectedLabel() );
        },

        adjustCategoryPosition() {
            $.each(  $('.dokan-product-category-ul').find('.dokan-product-category-li-active'), function ( index, item ) {
                let { catlevel, indexli } = $(item).data();
                $( `#${catlevel}-level-cat-ul` ).scrollTop( 36.38 * indexli );
            } );
        },

        getSelectedLabel() {
            let activatedLi = $( '.dokan-product-category-li-active' );
            let liLength    = activatedLi.length;
            let ui          = '';

            activatedLi.each( ( index, obj ) => {
                var allDataSets = obj.dataset;

                ui += `<span class="dokan-selected-category-product ${ liLength == index + 1 ? 'dokan-cat-selected' : '' }">${ allDataSets.name }</span>
                ${ liLength != index + 1 ? '<span class="dokan-selected-category-icon"><i class="fas fa-chevron-right"></i></span>' : '' }`;
            });

            return ui;
        },

        updateCategorySelection( catlevel, termId ) {
            let expectedLi = categoriesState[ catlevel - 1 ];
            let updatedLi  = expectedLi.categories.map( element => {
                element.term_id == termId ? element.uiActivaion = 'dokan-product-category-li-active' : element.uiActivaion = '';
                return element;
            });

            categoriesState[ catlevel - 1 ].categories = updatedLi;
            ProductCategory.updateCategoryUi();
        },

        getCatUlHtml() {
            let html = categoriesState.map( ( element, index ) => {
                let li = ProductCategory.getCatLiHtml( element.categories, element.level );
                return `<ul id="${ element.level }-level-cat-ul" class="dokan-product-category-ul ${ element.level }-level-cat" data-level="${ element.level }">${ li }</ul>`;
            });

            return html;
        },

        getCatLiHtml( element, level ) {
            let html = '';

            element.forEach( ( category, index ) => {
                html += `<li data-indexli="${ index }" data-haschild="${ category.children.length > 0 }" data-name="${ category.name }" data-catLevel="${ level }" class="${ category.uiActivaion ? category.uiActivaion : '' } dokan-product-category-li ${ category.children.length > 0 ? 'dokan-cat-has-child' : '' }" data-term-id="${ category.term_id }" data-taxonomy="product_cat">
                        <span class="dokan-product-category">${ category.name }</span>
                        <span class="dokan-product-category-icon"><i class="fas fa-chevron-right"></i></span>
                    </li>`;
            });

            return html;
        },

        removeAfterClickedUls( catlevel, termId ) {
            let newCategories = categoriesState.filter( data => {
                if ( data.level <= catlevel ) {
                    return data;
                }
            });

            categoriesState = newCategories;
            ProductCategory.updateCategorySelection( catlevel, termId );
        },

        scrollTo( to = 0 ) {
            $( '#dokan-single-categories' ).animate( { scrollLeft: 300 * to }, 800 );
        },

        indicatorScrollTo( left = true ) {
            $( '#dokan-single-categories' ).animate( { scrollLeft: `${ left ? '+' : '-' }=350px` }, 800 );
        },

        setCatId( id ) {
            let ui = `<input type="hidden" class="dokan_chosen_product_cat dokan_chosen_product_cat_${id}" name="chosen_product_cat[]" value="${ id }"></input>`;

            $( `.dokan-cih-level-${ inputHolder }` ).html( ui );
        },

        setCatName( name ) {
            $( `.dokan-ssct-level-${ inputHolder }` ).html( name );
        },

        addANewCatBox() {
            let lastCatElement = $( '.dokan-add-new-cat-box .dokan-select-product-category-container' ).length;
            let lastCat = $( '.dokan-add-new-cat-box .dokan-select-product-category-container' )[lastCatElement-1];
            let boxCounter = $(lastCat).find('#dokan-category-open-modal').data('dokansclevel') + 1;

            if ( isNaN( boxCounter ) ) {
                boxCounter = 0;
            }

            let html = `
                <div class="dokan-select-product-category-container">
                    <div class="dokan-form-group dokan-select-product-category dokan-category-open-modal" data-dokansclevel="${ boxCounter }" id="dokan-category-open-modal">
                        <span id="dokan_product_cat_res" class="dokan-select-product-category-title dokan-ssct-level-${ boxCounter }">- ${dokan_product_category_data.i18n.select_a_category} -</span>
                        <span class="dokan-select-product-category-icon"><i class="fas fa-edit"></i></span>
                    </div>
                        ${ ! dokan_product_category_data.is_single ? `
                        <div class="dokan-select-product-category-remove-container">
                            <span class="dokan-select-product-category-remove"><i class="fas fa-times"></i></span>
                        </div>`
                        : ''}
                    <span class="dokan-cat-inputs-holder dokan-cih-level-${ boxCounter }" ></span>
                </div>
                `;

            $( '.dokan-add-new-cat-box' ).append( html );
        },

        findCategory( id ) {
            return dokan_product_category_data.categories[ id ];
        },

        debounce(func, wait, immediate) {
            var timeout;
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        openModal( chosenCat ) {
            ProductCategory.showCategoryModal();

            if ( chosenCat.length > 0 ) {
                let catId    = chosenCat.val();
                let category = dokan_product_category_data.categories[ catId ];

                ProductCategory.setCatUiBasedOnOneCat( catId, category );
            }
        }
    };

    // On DOM ready.
    $( document ).ready( function() {
        ProductCategory.init();
    });
} )( jQuery );
