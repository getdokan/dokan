;(function($){
  let modal          = $('#dokan-single-category-modal');
  let loader         = $('#dokan-single-categories-loader');
  let searchRes      = $('#dokan-cat-search-res');
  let searchResUl    = $('#dokan-cat-search-res-ul');
  let rightIndicator = $('.dokan-single-categories-right');
  let leftIndicator  = $('.dokan-single-categories-left');

  let categoriesState   = [];
  let searchResultState = [];
  let inputHolder       = '';
  let boxCounter        = 1;
  let selectedCatId     = '';

  var SingleCategory = {

    init: function() {
      $('#dokan-single-categories-loader img').attr("src", dokan.ajax_loader);
      $('body').on('click', '.dokan-single-category-li', function() {
        let { catlevel, termId, name, haschild } = $(this).data();

        // SingleCategory.setCatId( termId );
        // SingleCategory.setCatName( name );
        selectedCatId = termId;
        SingleCategory.removeAfterClickedUls( catlevel, termId );

        SingleCategory.loadChildCategories( catlevel, termId, name, haschild );
      });
      $('body').on('click', '.dokan-cat-search-res-li', function() {
        let {termid,index,name} = $(this).data();
        SingleCategory.setCatUiBasedOnOneCat( termid, index, searchResultState[index] );
      });
      $('body').on('keyup', '#dokan-single-cat-search-input', function() {
        let inputText = $(this).val();
        $('#dokan-cat-search-text-limit').html(inputText.length);

        if ( inputText.length > 0 ) {
          SingleCategory.loadingCategories();
          SingleCategory.hideSearchRes(false);
          SingleCategory.doSearchCates(inputText);
        } else {
          SingleCategory.hideSearchRes();
        }
      })
      $( "#dokan-single-categories" ).scroll(function() {
        let totalScrollable = $('#dokan-single-categories').get(0).scrollWidth-$('#dokan-single-categories').innerWidth();
        let left = $( this ).scrollLeft();
        let right = totalScrollable - left;

        SingleCategory.showIndicators( leftIndicator, left );
        SingleCategory.showIndicators( rightIndicator, right );
      });
      $('body').on('click', '.dokan-single-categories-right-box', function() {
        SingleCategory.indicatorScrollTo();
      });
      $('body').on('click', '.dokan-single-categories-left-box', function() {
        SingleCategory.indicatorScrollTo(false);
      });
      $('body').on('click', '.dokan-single-cat-select-btn', function() {
        SingleCategory.setCatName( SingleCategory.getSelectedLabel() );
        SingleCategory.setCatId( selectedCatId );
        SingleCategory.hideCategoryModal();
      });
    },

    setCatUiBasedOnOneCat: function( catId, catIndex, category ) {
        SingleCategory.disableDoneBtn( category.has_child );

        selectedCatId = catId;
        let allParents = [];
        if ( category.parents ) {
          allParents = category.parents.map( parent => {
            return parent.term_id;
          } );
        }

        let allUl = [...allParents];
        let selectedInUls = [...allParents];

        allUl.unshift( 0 );
        selectedInUls.push( Number(catId) );

        let UL = allUl.map( (id, index) => {
          return SingleCategory.getCategoriesWithParentId( id, index+1, selectedInUls[index] );
        } );

        categoriesState = UL;
        SingleCategory.updateCategoryUi();

        SingleCategory.hideSearchRes();
        SingleCategory.scrollTo(UL.length);
    },

    doSearchCates: async ( text ) => {
      let allCategories = [...dokan_all_product_categories];
      let searchResult = await allCategories.filter( ( category, index ) => {
        let fullText = category.cat_name;
        let found = fullText.toLowerCase().indexOf(text);
        let res = false;
        found >= 0 ? res = true : '';
        return res;
      } );

      searchResultState = searchResult;
      SingleCategory.updateSearchResultUi();
      SingleCategory.loadingCategories(false);
    },
    hideSearchRes: (status = true ) => {
      status ? searchRes.addClass('dokan-hide') : searchRes.removeClass('dokan-hide');
    },
    showIndicators: ( element, scrolled ) => {
      ( scrolled > 5 ) ? element.removeClass('dokan-hide') : element.addClass('dokan-hide');
    },
    showCategoryModal: () => {
      selectedCatId = '';
      SingleCategory.disableDoneBtn();
      modal.css('display','flex');
      categoriesState = [];
      SingleCategory.loadAllParentCategories();
    },
    disableDoneBtn: ( disable = true ) => {
      $('.dokan-single-cat-select-btn').prop('disabled', disable);
    },
    hideCategoryModal: () => {
      modal.css('display','none');
    },
    loadingCategories: ( loading = true ) => {
      loading ? loader.removeClass('dokan-hide') : loader.addClass('dokan-hide');
    },
    loadAllParentCategories: () => {
      SingleCategory.loadingCategories();
      categoriesState.push( SingleCategory.getCategoriesWithParentId() );
      SingleCategory.updateCategoryUi();
      SingleCategory.loadingCategories( false );
    },
    getCategoriesWithParentId: ( parentId = 0, level = 1, selectedId = false ) => {
      let allCategories = [...dokan_all_product_categories];
      let categories = allCategories.filter( ( category, index ) => {
        if ( category.category_parent == parentId ) {
          allCategories[index].uiActivaion = category.cat_ID === selectedId ? 'dokan-single-category-li-active' : false;
          return true;
        }
      });

      return {
        categories: categories,
        level: level,
        term_id: parentId,
      };
    },
    loadChildCategories: ( catlevel, termId, name, haschild ) => {
      if ( ! haschild ) {
        SingleCategory.disableDoneBtn( false );
        return;
      }
      SingleCategory.disableDoneBtn();
      let categories = SingleCategory.getCategoriesWithParentId( termId, catlevel+1 );
      categoriesState.push( categories );
      SingleCategory.updateCategoryUi();
      SingleCategory.scrollTo(catlevel - 1);
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
      $('#dokan-selected-category-span').html(SingleCategory.getSelectedLabel());
    },
    getSelectedLabel: () => {
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

      return ui;
    },
    updateCategorySelection: (catlevel, termId) => {
      let expectedLi = categoriesState[catlevel-1];
      let updatedLi = expectedLi.categories.map( element => {
        element.term_id == termId ? element.uiActivaion = 'dokan-single-category-li-active' : element.uiActivaion = '';
        return element;
      } );

      categoriesState[catlevel-1].categories = updatedLi;
      SingleCategory.updateCategoryUi();
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
        html += `<li data-haschild="${category.has_child}" data-name="${category.name}" data-catLevel="${level}" class="${ category.uiActivaion ? category.uiActivaion : '' } dokan-single-category-li ${category.has_child ? 'dokan-cat-has-child' : ''}" data-term-id="${category.term_id}" data-taxonomy="product_cat">
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
    },
    scrollTo: ( to = 0 ) => {
      $('#dokan-single-categories').animate( { scrollLeft: 300*to }, 800);
    },
    indicatorScrollTo: ( left = true ) => {
      jQuery("#dokan-single-categories").animate({scrollLeft: `${left ? '+' : '-'}=350px`}, 800);
    },

    setCatId: (id) => {
      let ui = `<input type="hidden" name="${ dokan_is_single_category ? 'product_cat' : 'product_cat[]' }" class="dokan_product_cat" id="dokan_product_cat" value="${id}"></input>`;
      ui += `<input type="hidden" class="dokan_chosen_product_cat" name="chosen_product_cat[]" value="${id}"></input>`;
      let category = dokan_all_product_categories.filter( (element, index) => {
        return element.cat_ID == id;
      } );

      if ( ! dokan_is_single_category ) {
        ui += category[0].parents.map( (element, index) => {
          return `<input type="hidden" name="product_cat[]" class="dokan_product_cat" id="dokan_product_cat" value="${element.cat_ID}"></input>`;
        } ).join('');
      }

      $( `.dokan-cih-level-${inputHolder}` ).html( ui );
    },
    setCatName: (name) => {
      $( `.dokan-ssct-level-${inputHolder}` ).html(name);
    },
    addANewCatBox: () => {
      boxCounter++;
      let html = `
      <div class="dokan-select-single-category-container">
        <div class="dokan-form-group dokan-select-single-category" data-dokansclevel="${boxCounter}" id="dokan-category-open-modal">
            <span id="dokan_product_cat_res" class="dokan-select-single-category-title dokan-ssct-level-${boxCounter}">- Select a category -</span>
            <span class="dokan-select-single-category-icon"><i class="fas fa-edit"></i></span>
        </div>
            ${ ! dokan_is_single_category ? `
            <div class="dokan-select-single-category-remove-container">
                <span class="dokan-select-single-category-remove"><i class="fas fa-times"></i></span>
            </div>`
            : '' }
        <span class="dokan-cat-inputs-holder dokan-cih-level-${boxCounter}" ></span>
      </div>
      `

      $('.dokan-add-new-cat-box').append(html)
    },

    findCategory: (id) => {
      let allCategories = [...dokan_all_product_categories];

      return allCategories.findIndex( ( category, index ) => {
        return id == category.cat_ID;
      } );
    }

  };

  // On DOM ready.
  $(function() {
    SingleCategory.init();

    $('body').on('click', '#dokan-category-open-modal', function(){
      inputHolder = $(this).data('dokansclevel');
      let chosenCat = $(this).siblings(".dokan-cat-inputs-holder").find(".dokan_chosen_product_cat");
      SingleCategory.showCategoryModal();

      if ( chosenCat.length > 0 ) {
        let catId = chosenCat.val();
        let catIndex = SingleCategory.findCategory(catId);
        let category = dokan_all_product_categories[catIndex];
        SingleCategory.setCatUiBasedOnOneCat( catId, catIndex, category );
      }
    });
    $('body').on('click', '#dokan-category-close-modal', function(){
      SingleCategory.hideCategoryModal();
    });
    $('body').on('click', '.dokan-single-cat-add-btn', function(){
      SingleCategory.addANewCatBox();
    });
    $('body').on('click', '.dokan-select-single-category-remove-container', function(){
      $(this).closest( ".dokan-select-single-category-container" )[0].remove();
    });
  });
})(jQuery);

// window.onclick = function(event) {
//   if (event.target == document.getElementById("dokan-single-category-modal")) {
//     document.getElementById("dokan-single-category-modal").style.display = "flex";
//   }
// }
