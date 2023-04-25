dokanWebpack([6],{

/***/ 287:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_toConsumableArray__ = __webpack_require__(288);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_toConsumableArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_toConsumableArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__);



;

(function ($) {
  var modal = $('#dokan-product-category-modal');
  var searchResultContainer = $('#dokan-cat-search-res');
  var searchResUl = $('#dokan-cat-search-res-ul');
  var rightIndicator = $('.dokan-single-categories-right');
  var leftIndicator = $('.dokan-single-categories-left');
  var categoriesState = [];
  var searchResultState = [];
  var inputHolder = '';
  var selectedFrom = 0;
  var selectedCatId = '';
  var ProductCategory = {
    init: function init() {
      $('body').on('click', '.dokan-product-category-li', this.categoryLiClick);
      $('body').on('click', '.dokan-cat-search-res-li', this.clickSearchResLi);
      $('body').on('keyup', '#dokan-single-cat-search-input', ProductCategory.debounce(this.typeToSearch, 500));
      $('body').on('scroll', '#dokan-single-categories', this.categoryScroll);
      $('body').on('click', '.dokan-single-categories-right-box', ProductCategory.indicatorScrollTo);
      $('body').on('click', '.dokan-single-categories-left-box', function () {
        ProductCategory.indicatorScrollTo(false);
      });
      $('body').on('click', '.dokan-single-cat-select-btn', ProductCategory.chooseCatButton);
      $('body').on('click', '.dokan-category-open-modal', ProductCategory.initModal);
      $('body').on('click', '#dokan-category-close-modal', ProductCategory.hideCategoryModal);
      $('body').on('click', '.dokan-single-cat-add-btn', ProductCategory.addANewCatBox);
      $('body').on('click', '.dokan-select-product-category-remove-container', ProductCategory.removeCatBox);
    },
    initModal: function initModal() {
      inputHolder = $(this).data('dokansclevel');
      selectedFrom = $(this).data('selectfor');
      var chosenCat = $(this).siblings(".dokan-cat-inputs-holder").find(".dokan_chosen_product_cat");
      $(this).parent().attr('data-activate', 'yes');
      ProductCategory.openModal(chosenCat);
    },
    removeCatBox: function removeCatBox() {
      $(this).closest('.dokan-select-product-category-container')[0].remove();
    },
    categoryLiClick: function categoryLiClick() {
      var _$$data = $(this).data(),
          catlevel = _$$data.catlevel,
          termId = _$$data.termId,
          name = _$$data.name,
          haschild = _$$data.haschild;

      selectedCatId = termId;
      ProductCategory.removeAfterClickedUls(catlevel, termId);
      ProductCategory.loadChildCategories(catlevel, termId, name, haschild);
    },
    clickSearchResLi: function clickSearchResLi() {
      var _$$data2 = $(this).data(),
          termid = _$$data2.termid,
          index = _$$data2.index,
          name = _$$data2.name;

      if (termid) {
        selectedCatId = termid;
        ProductCategory.setCatUiBasedOnOneCat(termid, searchResultState[index]);
      }
    },
    typeToSearch: function typeToSearch() {
      var inputText = $(this).val();
      $('#dokan-cat-search-text-limit').html(inputText.length);

      if (inputText.length > 0) {
        ProductCategory.hideSearchResults(false);
        ProductCategory.doSearchCates(inputText);
      } else {
        ProductCategory.hideSearchResults();
      }
    },
    categoryScroll: function categoryScroll() {
      var totalScrollable = $('#dokan-single-categories').get(0).scrollWidth - $('#dokan-single-categories').innerWidth();
      var left = $(this).scrollLeft();
      var right = totalScrollable - left;
      ProductCategory.showIndicators(leftIndicator, left);
      ProductCategory.showIndicators(rightIndicator, right);
    },
    chooseCatButton: function chooseCatButton() {
      var category_box = ".dokan-select-product-category-container.dokan_select_cat_for_".concat(selectedFrom, "_").concat(inputHolder, "[data-activate='yes']");
      var cat_exists_in_list = $(category_box).parent().children('.dokan-select-product-category-container').children('.dokan-cat-inputs-holder').find(".dokan_chosen_product_cat_".concat(selectedCatId)).length;

      if (cat_exists_in_list) {
        dokan_sweetalert(dokan_product_category_data.i18n.duplicate_category, {
          icon: 'warning'
        });
        return;
      }

      ProductCategory.setCatName(ProductCategory.getSelectedLabel(), $(category_box));
      ProductCategory.setCatId(selectedCatId, $(category_box));
      ProductCategory.hideCategoryModal(); // Any one can use this hook and do anything after any category is selected.

      wp.hooks.doAction('dokan_selected_multistep_category', selectedCatId);
      $(category_box).attr('data-activate', 'no');
    },
    setCatUiBasedOnOneCat: function setCatUiBasedOnOneCat(catId, category) {
      var disable = undefined !== category.children.length && category.children.length > 0;
      ProductCategory.disableDoneBtn(disable);

      var allUl = __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_toConsumableArray___default()(category.parents);

      var selectedInUls = __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_toConsumableArray___default()(category.parents);

      allUl.unshift(0);
      selectedInUls.push(Number(catId));
      var UL = allUl.map(function (id, index) {
        return ProductCategory.getCategoriesWithParentId(id, index + 1, selectedInUls[index]);
      });
      categoriesState = UL;
      ProductCategory.updateCategoryUi();
      ProductCategory.hideSearchResults();
      ProductCategory.scrollTo(UL.length);
    },
    doSearchCates: function doSearchCates(text) {
      return __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.mark(function _callee() {
        var searchResult, key, category, fullText, found;
        return __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                searchResult = [];

                for (key in dokan_product_category_data.categories) {
                  category = dokan_product_category_data.categories[key];
                  fullText = category.name;
                  text = text.toLowerCase();
                  found = fullText.toLowerCase().indexOf(text);

                  if (found >= 0) {
                    searchResult.push(category);
                  }
                }

                searchResultState = searchResult;
                ProductCategory.updateSearchResultUi();

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    hideSearchResults: function hideSearchResults() {
      var status = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      status ? searchResultContainer.addClass('dokan-hide') : searchResultContainer.removeClass('dokan-hide');
    },
    showIndicators: function showIndicators(element, scrolled) {
      scrolled > 5 ? element.removeClass('dokan-hide') : element.addClass('dokan-hide');
    },
    showCategoryModal: function showCategoryModal() {
      selectedCatId = '';
      ProductCategory.disableDoneBtn();
      modal.css('display', 'flex');
      ProductCategory.hideSearchResults();
      $('#dokan-single-cat-search-input').val('');
      categoriesState = [];
      ProductCategory.loadAllParentCategories();
    },
    disableDoneBtn: function disableDoneBtn() {
      var disable = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      $('.dokan-single-cat-select-btn').prop('disabled', disable);
    },
    hideCategoryModal: function hideCategoryModal() {
      modal.css('display', 'none');
      $('.dokan-select-product-category-container').attr('data-activate', 'no');
    },
    loadAllParentCategories: function loadAllParentCategories() {
      categoriesState.push(ProductCategory.getCategoriesWithParentId());
      ProductCategory.updateCategoryUi();
    },
    getCategoriesWithParentId: function getCategoriesWithParentId() {
      var parentId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var selectedId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var returnableCategories = [];

      for (var key in dokan_product_category_data.categories) {
        var currentCategory = dokan_product_category_data.categories[key];

        if (currentCategory.parent_id == parentId) {
          currentCategory.uiActivaion = Number(currentCategory.term_id) === selectedId ? 'dokan-product-category-li-active' : false;
          returnableCategories.push(currentCategory);
        }
      } // sort categories by name


      returnableCategories.sort(function (a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 0;
      });
      return {
        categories: returnableCategories,
        level: level,
        term_id: parentId
      };
    },
    loadChildCategories: function loadChildCategories(catlevel, termId, name, haschild) {
      /**
       * If enabled any one middle category in dokan product multi-step category selection.
       */
      var middleCategorySelection = dokan_product_category_data.any_category_selection; // If selected category has no child OR middle category selection is true then enable the category select done button else disable.

      if (!haschild || true === Boolean(middleCategorySelection)) {
        ProductCategory.disableDoneBtn(false);
      } else {
        ProductCategory.disableDoneBtn();
      } // If the selected category has more children category then show them.


      if (haschild) {
        var categories = ProductCategory.getCategoriesWithParentId(termId, catlevel + 1);
        categoriesState.push(categories);
        ProductCategory.updateCategoryUi();
        ProductCategory.scrollTo(catlevel);
      }
    },
    updateSearchResultUi: function updateSearchResultUi() {
      var html = '';
      html = searchResultState.map(function (element, index) {
        return "<li data-name=\"".concat(element.name, "\" data-termid=\"").concat(element.term_id, "\" data-index=\"").concat(index, "\" class=\"dokan-cat-search-res-li\">\n                        <div class=\"dokan-cat-search-res-item\">\n                            ").concat(element.name, "\n                        </div>\n                        <div class=\"dokan-cat-search-res-history\">\n                            ").concat(ProductCategory.getSearchedParentHistory(element.parents, element.name), "\n                        </div>\n                    </li>");
      });

      if (0 == searchResultState.length) {
        html = "<li data-name=\"\" data-termid=\"\" data-index=\"\" class=\"dokan-cat-search-res-li\">\n                        <div class=\"dokan-cat-search-res-item\">\n                            ".concat(window.dokan.i18n_no_result_found, "\n                        </div>\n                        <div class=\"dokan-cat-search-res-history\">\n                        </div>\n                    </li>");
      }

      searchResUl.html(html);
    },
    getSearchedParentHistory: function getSearchedParentHistory(parents, searched) {
      var html = "";
      html = parents.map(function (parentId, index) {
        return "<span class=\"dokan-cat-search-res-suggestion\">".concat(ProductCategory.findCategory(parentId).name, "</span>\n                    <span class=\"dokan-cat-search-res-indicator\"><i class=\"fas fa-caret-right\"></i></span>");
      }).join('');
      html += "<span class=\"dokan-cat-search-res-suggestion-selected\">".concat(ProductCategory.highlight(searched), "</span>");
      return html;
    },
    highlight: function highlight(fullText) {
      var text = $('#dokan-single-cat-search-input').val().toLowerCase();
      var index = fullText.toLowerCase().indexOf(text);

      if (index >= 0) {
        return "<span>".concat(fullText.substring(0, index), "</span>\n                    <span class='dokan-cat-highlight'>").concat(fullText.substring(index, index + text.length), "</span>\n                    <span>").concat(fullText.substring(index + text.length), "</span>");
      }
    },
    updateCategoryUi: function updateCategoryUi() {
      var html = ProductCategory.getCatUlHtml();
      $('#dokan-single-categories').html(html);
      ProductCategory.updateSelectedLabel();
      ProductCategory.adjustCategoryPosition();
    },
    updateSelectedLabel: function updateSelectedLabel() {
      $('#dokan-selected-category-span').html(ProductCategory.getSelectedLabel());
    },
    adjustCategoryPosition: function adjustCategoryPosition() {
      $.each($('.dokan-product-category-ul').find('.dokan-product-category-li-active'), function (index, item) {
        var _$$data3 = $(item).data(),
            catlevel = _$$data3.catlevel,
            indexli = _$$data3.indexli;

        $("#".concat(catlevel, "-level-cat-ul")).scrollTop(36.38 * indexli);
      });
    },
    getSelectedLabel: function getSelectedLabel() {
      var activatedLi = $('.dokan-product-category-li-active');
      var liLength = activatedLi.length;
      var ui = '';
      activatedLi.each(function (index, obj) {
        var allDataSets = obj.dataset;
        ui += "<span class=\"dokan-selected-category-product ".concat(liLength == index + 1 ? 'dokan-cat-selected' : '', "\">").concat(allDataSets.name, "</span>\n                ").concat(liLength != index + 1 ? '<span class="dokan-selected-category-icon"><i class="fas fa-chevron-right"></i></span>' : '');
      });
      return ui;
    },
    updateCategorySelection: function updateCategorySelection(catlevel, termId) {
      var expectedLi = categoriesState[catlevel - 1];
      var updatedLi = expectedLi.categories.map(function (element) {
        element.term_id == termId ? element.uiActivaion = 'dokan-product-category-li-active' : element.uiActivaion = '';
        return element;
      });
      categoriesState[catlevel - 1].categories = updatedLi;
      ProductCategory.updateCategoryUi();
    },
    getCatUlHtml: function getCatUlHtml() {
      var html = categoriesState.map(function (element, index) {
        var li = ProductCategory.getCatLiHtml(element.categories, element.level);
        return "<ul id=\"".concat(element.level, "-level-cat-ul\" class=\"dokan-product-category-ul ").concat(element.level, "-level-cat\" data-level=\"").concat(element.level, "\">").concat(li, "</ul>");
      });
      return html;
    },
    getCatLiHtml: function getCatLiHtml(element, level) {
      var html = '';
      element.forEach(function (category, index) {
        html += "<li data-indexli=\"".concat(index, "\" data-haschild=\"").concat(category.children.length > 0, "\" data-name=\"").concat(category.name, "\" data-catLevel=\"").concat(level, "\" class=\"").concat(category.uiActivaion ? category.uiActivaion : '', " dokan-product-category-li ").concat(category.children.length > 0 ? 'dokan-cat-has-child' : '', "\" data-term-id=\"").concat(category.term_id, "\" data-taxonomy=\"product_cat\">\n                        <span class=\"dokan-product-category\">").concat(category.name, "</span>\n                        <span class=\"dokan-product-category-icon\"><i class=\"fas fa-chevron-right\"></i></span>\n                    </li>");
      });
      return html;
    },
    removeAfterClickedUls: function removeAfterClickedUls(catlevel, termId) {
      var newCategories = categoriesState.filter(function (data) {
        if (data.level <= catlevel) {
          return data;
        }
      });
      categoriesState = newCategories;
      ProductCategory.updateCategorySelection(catlevel, termId);
    },
    scrollTo: function scrollTo() {
      var to = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      $('#dokan-single-categories').animate({
        scrollLeft: 300 * to
      }, 800);
    },
    indicatorScrollTo: function indicatorScrollTo() {
      var left = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      $('#dokan-single-categories').animate({
        scrollLeft: "".concat(left ? '+' : '-', "=350px")
      }, 800);
    },
    setCatId: function setCatId(id, category_box) {
      var ui = "<input data-field-name=\"chosen_product_cat\" type=\"hidden\" class=\"dokan_chosen_product_cat dokan_chosen_product_cat_".concat(id, "\" name=\"chosen_product_cat[]\" value=\"").concat(id, "\"></input>");
      ui += "<input type=\"hidden\" name=\"chosen_product_cat_bulk[]\" value=\"".concat(id, "\"></input>");
      category_box.children(".dokan-cih-level-".concat(inputHolder)).html(ui);
    },
    setCatName: function setCatName(name, category_box) {
      category_box.children('.dokan-select-product-category').children(".dokan-ssct-level-".concat(inputHolder)).html(name);
    },
    addANewCatBox: function addANewCatBox() {
      var addCatBtn = $(this)[0];
      var from = $(addCatBtn).data('selectfor');
      selectedFrom = from;
      var lastCatElement = $(this).parent().siblings('.dokan-add-new-cat-box').children('.dokan-select-product-category-container').length;
      var lastCat = $(this).parent().siblings('.dokan-add-new-cat-box').children('.dokan-select-product-category-container')[lastCatElement - 1];
      var boxCounter = $(lastCat).find('#dokan-category-open-modal').data('dokansclevel') + 1;

      if (isNaN(boxCounter)) {
        boxCounter = 0;
      }

      var html = "\n                <div data-activate=\"no\" class=\"dokan-select-product-category-container dokan_select_cat_for_".concat(from, "_").concat(boxCounter, "\">\n                    <div class=\"dokan-form-group dokan-select-product-category dokan-category-open-modal\" data-dokansclevel=\"").concat(boxCounter, "\" id=\"dokan-category-open-modal\" data-selectfor=\"").concat(from, "\">\n                        <span id=\"dokan_product_cat_res\" class=\"dokan-select-product-category-title dokan-ssct-level-").concat(boxCounter, "\">- ").concat(dokan_product_category_data.i18n.select_a_category, " -</span>\n                        <span class=\"dokan-select-product-category-icon\"><i class=\"fas fa-edit\"></i></span>\n                    </div>\n                        ").concat(!dokan_product_category_data.is_single ? "\n                        <div class=\"dokan-select-product-category-remove-container\">\n                            <span class=\"dokan-select-product-category-remove\"><i class=\"fas fa-times\"></i></span>\n                        </div>" : '', "\n                    <span class=\"dokan-cat-inputs-holder dokan-cih-level-").concat(boxCounter, "\" ></span>\n                </div>\n                ");
      $(this).parent().parent().children(".cat_box_for_".concat(from)).append(html);
    },
    findCategory: function findCategory(id) {
      return dokan_product_category_data.categories[id];
    },
    debounce: function debounce(func, wait, immediate) {
      var timeout;
      return function () {
        var context = this,
            args = arguments;

        var later = function later() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    openModal: function openModal(chosenCat) {
      ProductCategory.showCategoryModal();

      if (chosenCat.length > 0) {
        var catId = chosenCat.val();
        selectedCatId = catId;
        var category = dokan_product_category_data.categories[catId];
        ProductCategory.setCatUiBasedOnOneCat(catId, category);
      }
    }
  }; // On DOM ready.

  $(document).ready(function () {
    ProductCategory.init();
  });
})(jQuery);

/***/ })

},[287]);