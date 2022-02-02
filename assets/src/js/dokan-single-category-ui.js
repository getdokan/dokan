;(function($){
  let modal     = $('#dokan-single-category-modal');
  let loader    = $('#dokan-single-categories-loader');
  let searchRes = $('#dokan-cat-search-res');
  let searchResUl = $('#dokan-cat-search-res-ul');
  let rightIndicator = $('.dokan-single-categories-right');
  let leftIndicator = $('.dokan-single-categories-left');
  var progress = null;

  let categoriesState = [];
  let searchResultState = [];

  var SingleCategory = {

    init: function() {
      $('#dokan-single-categories-loader img').attr("src", dokan.ajax_loader);
      $('body').on('click', '.dokan-single-category-li', function() {
        let {catlevel,termId,name} = $(this).data();

        SingleCategory.setCatId( termId );
        SingleCategory.setCatName( name );
        SingleCategory.removeAfterClickedUls( catlevel, termId );

        var data = {
          action: 'dokan_json_get_add_product_categories',
          level: catlevel,
          term_id: termId,
          selected: 0,
          taxonomy: 'product_cat',
          _wpnonce : dokan.nonce
        };
        SingleCategory.loadChildCategories( data, catlevel );
      });
      $('body').on('click', '.dokan-cat-search-res-li', function() {
        let {termid,index,name} = $(this).data();

        SingleCategory.setCatId( termid );
        SingleCategory.setCatName( name );

        let allParents = '';
        if ( searchResultState[index].parents ) {
          allParents += searchResultState[index].parents.map( parent => {
            return parent.term_id;
          } ).join('|');
        }

        SingleCategory.loadingCategories();
        var data = {
            action: 'dokan_json_load_selected_categories',
            term_id: termid,
            parents: allParents,
            taxonomy: 'product_cat',
            _wpnonce : dokan.nonce
        };
        $.post( dokan.ajaxurl, data, function( resp ) {
          if ( resp.success ) {
            SingleCategory.loadingCategories( false );

            if ( ! resp.data.categories || resp.data.categories.length < 1) {
              return;
            }

            categoriesState = resp.data.categories;
            SingleCategory.updateCategoryUi();

            SingleCategory.hideSearchRes();
            SingleCategory.scrollTo(resp.data.scroll_to - 1);
          } else {
            SingleCategory.loadingCategories( false );
          }
        });
      });
      $('body').on('keyup', '#dokan-single-cat-search-input', function() {
        let inputText = $(this).val();
        $('#dokan-cat-search-text-limit').html(inputText.length);

        if ( inputText.length > 0 ) {
          SingleCategory.loadingCategories();
          SingleCategory.hideSearchRes(false);
          SingleCategory.doSearchCates(inputText);
        } else {
          SingleCategory.hideSearchRes()
        }
      })
      $( "#dokan-single-categories" ).scroll(function() {
        let totalScrollable = $('#dokan-single-categories').get(0).scrollWidth-$('#dokan-single-categories').innerWidth();
        let left = $( this ).scrollLeft();
        let right = totalScrollable - left;

        SingleCategory.showIndicators( leftIndicator, left );
        SingleCategory.showIndicators( rightIndicator, right );
      });
      $('body').on('click', '.dokan-single-categories-right', function() {
        SingleCategory.indicatorScrollTo();
      });
      $('body').on('click', '.dokan-single-categories-left', function() {
        SingleCategory.indicatorScrollTo(false);
      });
      $('body').on('click', '.dokan-single-cat-select-btn', function() {
        SingleCategory.hideCategoryModal();
      });
    },

    doSearchCates: ( text ) => {
      var data = {
        action: 'dokan_json_search_product_categories',
        text: text,
        taxonomy: 'product_cat',
        _wpnonce : dokan.nonce
      };

      progress = $.ajax({
        type: 'POST',
        data: data,
        url: dokan.ajaxurl,
        beforeSend : function() {
          //checking progress status and aborting pending request if any
          progress != null ? progress.abort() : '';
        },
        success: function(response) {
          if ( response.success ) {
            searchResultState = response.data;
            SingleCategory.updateSearchResultUi();
            SingleCategory.loadingCategories(false);
          }
        },
        complete: function(){
          // after ajax xomplets progress set to null
          progress = null;
        }
      });
    },
    hideSearchRes: (status = true ) => {
      status ? searchRes.addClass('dokan-hide') : searchRes.removeClass('dokan-hide');
    },
    showIndicators: ( element, scrolled ) => {
      ( scrolled > 5 ) ? element.removeClass('dokan-hide') : element.addClass('dokan-hide');
    },
    showCategoryModal: () => {
      modal.css('display','flex');
      categoriesState = [];
      SingleCategory.loadAllParentCategories();
    },
    hideCategoryModal: () => {
      modal.css('display','none');
    },
    loadingCategories: ( loading = true ) => {
      loading ? loader.removeClass('dokan-hide') : loader.addClass('dokan-hide');
    },
    loadAllParentCategories: () => {
      SingleCategory.loadingCategories();
      var data = {
          action: 'dokan_json_get_add_product_categories',
          level: 0,
          term_id: 0,
          selected: 0,
          taxonomy: 'product_cat',
          _wpnonce : dokan.nonce
      };
      $.post( dokan.ajaxurl, data, function( resp ) {
        if ( resp.success ) {
          SingleCategory.loadingCategories( false );

          if ( ! resp.data.categories || resp.data.categories.length < 1) {
            return;
          }

          categoriesState.push( resp.data );

          SingleCategory.updateCategoryUi();
        } else {
          SingleCategory.loadingCategories( false );
        }
      });
    },
    loadChildCategories: ( data, catlevel ) => {
      SingleCategory.loadingCategories();

      $.post( dokan.ajaxurl, data, function( resp ) {
        if ( resp.success ) {
          SingleCategory.loadingCategories( false );

          if ( ! resp.data.categories || resp.data.categories.length < 1) {
            return;
          }

          categoriesState.push( resp.data );

          SingleCategory.updateCategoryUi();
          SingleCategory.scrollTo(catlevel - 1);
        } else {
          SingleCategory.loadingCategories( false );
        }
      });
    },
    updateSearchResultUi: () => {
      let html = '';

      html = searchResultState.map( (element, index) => {
        return `<li data-name="${element.name}" data-termid="${element.term_id}" data-index="${index}" class="dokan-cat-search-res-li">
          <div class="dokan-cat-search-res-item">
            ${element.name}
          </div>
          <div class="dokan-cat-search-res-history">
            ${SingleCategory.getSearchedParentHistory( element.parents, element.name )}
          </div>
        </li>`;
      } );

      searchResUl.html( html );
    },
    getSearchedParentHistory: ( parents, searched ) => {
      let html = "";
      let allParentsLength =parents.length;

      html = parents.map( (element , index) => {
        return `<span class="dokan-cat-search-res-suggestion">${element.name}</span>
        <span class="dokan-cat-search-res-indicator"><i class="fas fa-caret-right"></i></span>`;
      } ).join('');

      html += `<span class="dokan-cat-search-res-suggestion-selected">${SingleCategory.highlight( searched )}</span>`;

      return html;
    },
    highlight: ( fullText ) => {
      let text = $('#dokan-single-cat-search-input').val().toLowerCase();
      let index = fullText.toLowerCase().indexOf(text);
      if (index >= 0) {
        return `<span>${fullText.substring(0,index)}</span><span class='dokan-cat-highlight'>${fullText.substring(index,index+text.length)}</span><span>${fullText.substring(index + text.length)}</span>`;
      }
    },
    updateCategoryUi: () => {
      let html = SingleCategory.getCatUlHtml();

      $('#dokan-single-categories').html(html);
      SingleCategory.updateSelectedLabel();
    },
    updateSelectedLabel: () => {
      let activatedLi = $('.dokan-single-category-li-active');
      let liLength = activatedLi.length;
      let ui = '';
      activatedLi.each((index,obj)=>{
        var allDataSets = obj.dataset;

        ui += `
        <span class="dokan-selected-category-single ${liLength == index+1 ? 'dokan-cat-selected' : ''}">${allDataSets.name}</span>
        ${liLength != index+1 ? '<span class="dokan-selected-category-icon"><i class="fas fa-chevron-right"></i></span>' : ''}
        `;

      });
      $('#dokan-selected-category-span').html(ui);
    },
    updateCategorySelection: (catlevel, termId) => {
      let expectedLi = categoriesState[catlevel-1];
      let updatedLi = expectedLi.categories.map( element => {
        element.term_id == termId ? element.uiActivaion = 'dokan-single-category-li-active' : element.uiActivaion = '';
        return element;
      } );

      categoriesState[catlevel-1].categories = updatedLi;
    },
    getCatUlHtml: () => {
      let html = categoriesState.map( ( element, index ) => {
        let li = SingleCategory.getCatLiHtml(element.categories,element.level);
        return `<ul id="${element.level}-level-cat-ul" class="dokan-single-category-ul ${element.level}-level-cat" data-level="${element.level}">${li}</ul> `;
      } );

      return html;
    },
    getCatLiHtml: (element,level) => {
      let html = '';

      element.forEach( ( category, index ) => {
        html += `<li data-name="${category.name}" data-catLevel="${level}" class="${ category.uiActivaion ? category.uiActivaion : '' } dokan-single-category-li ${category.has_child ? 'dokan-cat-has-child' : ''}" data-term-id="${category.term_id}" data-taxonomy="product_cat">
              <span class="dokan-single-category">${category.name}</span>
              <span class="dokan-single-category-icon"><i class="fas fa-chevron-right"></i></span>
          </li>`;
      } );

      return html;
    },
    removeAfterClickedUls: (catlevel, termId) => {
      let newCategories = categoriesState.filter(data=>{
        if ( data.level <= catlevel ) {
          return data;
        }
      });

      categoriesState = newCategories;
      SingleCategory.updateCategorySelection(catlevel, termId);
      SingleCategory.updateCategoryUi();
    },
    scrollTo: ( to = 0 ) => {
      $('#dokan-single-categories').animate( { scrollLeft: 300*to }, 800);
    },
    indicatorScrollTo: ( left = true ) => {
      jQuery("#dokan-single-categories").animate({scrollLeft: `${left ? '+' : '-'}=350px`}, 800);
    },

    setCatId: (id) => {
      $( '.dokan_product_cat' ).val(id);
    },
    setCatName: (name) => {
      $( '.dokan-select-single-category-title' ).html(name);
    },

  };

  // On DOM ready.
  $(function() {
    SingleCategory.init();

    $('body').on('click', '#dokan-category-open-modal', function(){
      SingleCategory.showCategoryModal();
    });
    $('body').on('click', '#dokan-category-close-modal', function(){
      SingleCategory.hideCategoryModal();
    });
  });
})(jQuery);

// window.onclick = function(event) {
//   if (event.target == document.getElementById("dokan-single-category-modal")) {
//     document.getElementById("dokan-single-category-modal").style.display = "flex";
//   }
// }
