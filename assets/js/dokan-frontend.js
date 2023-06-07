;(function($, document, window) {
  // this file will load on every pages on frontend
  const DOKAN_FRONTEND_SCRIPT = {
    init() {
      $('.product-cat-stack-dokan li.has-children').on( 'click', '> a span.caret-icon', this.toggle_product_widget_category_dropdown );
      $('.store-cat-stack-dokan li.has-children').on( 'click', '> a span.caret-icon', this.toggle_store_category_widget_dropdown );
    },

    toggle_product_widget_category_dropdown( e ) {
      e.preventDefault();
      let self = $(this),
        liHasChildren = self.closest('li.has-children');

      if ( ! liHasChildren.find('> ul.children').is(':visible') ) {
        self.find('i.fa').addClass('fa-rotate-90');
        if ( liHasChildren.find('> ul.children').hasClass('level-0') ) {
          self.closest('a').css({ borderBottom: 'none' });
        }
      }

      liHasChildren.find('> ul.children').slideToggle('fast', function() {
        if ( ! $(this).is(':visible') ) {
          self.find('i.fa').removeClass('fa-rotate-90');

          if ( liHasChildren.find('> ul.children').hasClass('level-0') ) {
            self.closest('a').css({ borderBottom: '1px solid #eee' });
          }
        }
      });
    },

    toggle_store_category_widget_dropdown( e ) {
      e.preventDefault();
      var self = $(this),
        liHasChildren = self.closest('li.has-children');

      if ( ! liHasChildren.find('> ul.children').is(':visible') ) {
        self.find('i.fa').addClass('fa-rotate-90');
        if ( liHasChildren.find('> ul.children').hasClass('level-0') ) {
          self.closest('a').css({ borderBottom: 'none' });
        }
      }

      liHasChildren.find('> ul.children').slideToggle('fast', function() {
        if ( ! $(this).is(':visible') ) {
          self.find('i.fa').removeClass('fa-rotate-90');

          if (liHasChildren.find('> ul.children').hasClass('level-0')) {
            self.closest('a').css({ borderBottom: '1px solid #eee' });
          }
        }
      });
    },

    init_category_widget_css() {
      let selectedLi = $('.cat-drop-stack ul').find('a.selected');
      selectedLi.css({ fontWeight: 'bold' });

      selectedLi.parents('ul.children').each(function(i, val) {
        $(val).css({ display: 'block' });
      });
    }

  }

  $(function(){
    // DOM Ready - Let's invoke the init method
    DOKAN_FRONTEND_SCRIPT.init();
    DOKAN_FRONTEND_SCRIPT.init_category_widget_css();
  })

})(jQuery, document, window);
