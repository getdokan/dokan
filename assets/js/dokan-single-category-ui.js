;(function($){
  let modal = $('#dokan-single-category-modal');
  let loader = $('#dokan-single-categories-loader');

  let categoriesState = [];

  var SingleCategory = {

    init: function() {
      $('#dokan-single-categories-loader img').attr("src", dokan.ajax_loader);
      $('body').on('click', '.dokan-single-category-li', function(){
        let {catlevel,termId} = $(this).data();

        SingleCategory.removeAfterClickedUls( catlevel, termId );

        var data = {
          action: 'dokan_json_get_add_product_categories',
          level: catlevel,
          term_id: termId,
          selected: 0,
          taxonomy: 'product_cat',
          _wpnonce : dokan.nonce
        };
        SingleCategory.loadChildCategories(data);
      });
    },

    showCategoryModal: () => {
      modal.css('display','block');
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
        // if ( resp.success ) {
        //     self.removeAttr( 'disabled' );
        //     if ( btn_id == 'create_new' ) {
        //         $.magnificPopup.close();
        //         window.location.href = resp.data;
        //     } else {
        //         $('.dokan-dashboard-product-listing-wrapper').load( window.location.href + ' table.product-listing-table' );
        //         $.magnificPopup.close();
        //         Dokan_Editor.openProductPopup();
        //         $( 'span.dokan-show-add-product-success' ).html( dokan.product_created_response );

        //         setTimeout(function() {
        //             $( 'span.dokan-show-add-product-success' ).html( '' );
        //         }, 3000);
        //     }
        //   } else {
        //       self.removeAttr( 'disabled' );
        //       $( 'span.dokan-show-add-product-error' ).html( resp.data );
        //   }
        //   form.find( 'span.dokan-add-new-product-spinner' ).css( 'display', 'none' );
      });
    },
    loadChildCategories: (data) => {
      SingleCategory.loadingCategories();

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
        return `<ul class="dokan-single-category-ul ${element.level}-level-cat" data-level="${element.level}">${li}</ul> `;
      } );

      return html;
    },
    getCatLiHtml: (element,level) => {
      let html = '';

      element.forEach( ( category, index ) => {
        html += `<li data-name="${category.name}" data-catLevel="${level}" class="${ category.uiActivaion ? category.uiActivaion : '' } dokan-single-category-li ${category.has_child ? 'has-children' : ''}" data-term-id="${category.term_id}" data-taxonomy="product_cat">
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

window.onclick = function(event) {
  if (event.target == document.getElementById("dokan-single-category-modal")) {
    document.getElementById("dokan-single-category-modal").style.display = "none";
  }
}
