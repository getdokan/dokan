dokanWebpack([0],[
/* 0 */,
/* 1 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Switches_vue__ = __webpack_require__(13);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aa8ad7dc_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Switches_vue__ = __webpack_require__(33);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(32)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Switches_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aa8ad7dc_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Switches_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Switches.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-aa8ad7dc", Component.options)
  } else {
    hotAPI.reload("data-v-aa8ad7dc", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UpgradeBanner_vue__ = __webpack_require__(55);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75a73b30_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UpgradeBanner_vue__ = __webpack_require__(135);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(134)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UpgradeBanner_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75a73b30_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UpgradeBanner_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/UpgradeBanner.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-75a73b30", Component.options)
  } else {
    hotAPI.reload("data-v-75a73b30", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_chartjs_adapter_moment__ = __webpack_require__(27);


/* harmony default export */ __webpack_exports__["a"] = ({
  extends: __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__["Line"],
  props: ['data'],
  data: function data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          x: {
            type: 'time',
            title: {
              display: false
            },
            gridLines: {
              display: false
            },
            ticks: {
              fontColor: '#aaa',
              fontSize: 11
            }
          },
          y: {
            title: {
              display: false
            },
            ticks: {
              fontColor: '#aaa'
            }
          }
        },
        legend: {
          position: 'top',
          onClick: false
        },
        elements: {
          line: {
            tension: 0,
            borderWidth: 4
          },
          point: {
            radius: 5,
            borderWidth: 3,
            backgroundColor: '#fff',
            borderColor: '#fff'
          }
        },
        tooltips: {
          displayColors: false,
          callbacks: {
            label: function label(tooltipItems, data) {
              var label = data.datasets[tooltipItems.datasetIndex].label || '';
              var customLabel = data.datasets[tooltipItems.datasetIndex].tooltipLabel || '';
              var prefix = data.datasets[tooltipItems.datasetIndex].tooltipPrefix || '';
              var tooltipLabel = customLabel ? customLabel + ': ' : label + ': ';
              tooltipLabel += prefix + tooltipItems.yLabel;
              return tooltipLabel;
            }
          }
        }
      }
    };
  },
  mounted: function mounted() {
    this.renderChart(this.data, this.options);
  }
});

/***/ }),
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__ = __webpack_require__(66);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  components: {
    Sketch: __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__["a" /* default */]
  },
  props: {
    value: {
      type: String,
      default: '',
      required: true
    },
    format: {
      type: String,
      required: false,
      default: 'hex',
      validator: function validator(type) {
        return ['hsl', 'hex', 'rgba', 'hsv'].indexOf(type) !== -1;
      }
    },
    presetColors: {
      type: Array,
      required: false,
      default: function _default() {
        return ['#000', '#fff', '#d33', '#d93', '#ee2', '#81d742', '#1e73be', '#8224e3'];
      }
    },
    disableAlpha: {
      type: Boolean,
      default: true,
      required: false
    },
    disableFields: {
      type: Boolean,
      default: true,
      required: false
    },
    customData: {
      type: Object,
      required: true
    },
    itemKey: {
      type: String,
      required: true
    }
  },
  data: function data() {
    return {
      isPicked: false,
      prevColor: '',
      showColorPicker: false,
      selectedColor: ''
    };
  },
  watch: {
    customData: {
      handler: function handler() {
        this.showColorPicker = this.customData.show_pallete;

        if (!this.showColorPicker) {
          this.updateColor({
            hex: this.prevColor
          });
        }
      },
      deep: true
    }
  },
  methods: {
    updateColor: function updateColor(colors) {
      var color = '';

      if (colors[this.format]) {
        color = colors[this.format];
        this.selectedColor = color;
      }

      this.$emit('input', color);
      this.$emit('custom-change', color);
    },
    toggleColorPicker: function toggleColorPicker() {
      this.prevColor = this.value;
      var data = {
        key: this.itemKey,
        values: this.customData
      };

      if (!this.isPicked) {
        this.updateColor({
          hex: this.prevColor
        });
      }

      this.$emit('toggleColorPicker', data);
    },
    setLastColor: function setLastColor(color) {
      var data = {
        key: this.itemKey,
        values: this.customData
      };
      this.updateColor({
        hex: color
      });
      this.$emit('toggleColorPicker', data);
    },
    setHexColor: function setHexColor(color) {
      this.updateColor({
        hex: color
      });
    }
  }
});

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Switches',
  props: {
    enabled: {
      type: Boolean,
      // String, Number, Boolean, Function, Object, Array
      required: true,
      default: false
    },
    value: {
      type: [String, Number]
    }
  },
  data: function data() {
    return {};
  },
  methods: {
    trigger: function trigger(e) {
      this.$emit('input', e.target.checked, e.target.value);
    }
  }
});

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_debounce__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_Switches_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_components_UploadImage_vue__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_components_PasswordGenerator_vue__ = __webpack_require__(24);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'VendorAccountFields',
  components: {
    Switches: __WEBPACK_IMPORTED_MODULE_1_admin_components_Switches_vue__["a" /* default */],
    UploadImage: __WEBPACK_IMPORTED_MODULE_2_admin_components_UploadImage_vue__["a" /* default */],
    PasswordGenerator: __WEBPACK_IMPORTED_MODULE_3_admin_components_PasswordGenerator_vue__["a" /* default */]
  },
  props: {
    vendorInfo: {
      type: Object
    },
    errors: {
      type: Array,
      required: false
    }
  },
  data: function data() {
    return {
      showStoreUrl: true,
      showPassword: false,
      otherStoreUrl: null,
      banner: '',
      defaultUrl: dokan.urls.siteUrl + dokan.urls.storePrefix + '/',
      showButton: true,
      placeholderData: '',
      delay: 500,
      storeAvailable: null,
      userNameAvailable: null,
      emailAvailable: null,
      storeAvailabilityText: '',
      userNameAvailabilityText: '',
      emailAvailabilityText: '',
      getAccountFields: dokan.hooks.applyFilters('getVendorAccountFields', [])
    };
  },
  watch: {
    'vendorInfo.store_name': function vendorInfoStore_name(value) {
      this.showStoreUrl = true;
    },
    'vendorInfo.user_nicename': function vendorInfoUser_nicename(newValue) {
      if (typeof newValue !== 'undefined') {
        this.showStoreUrl = false;
        this.otherStoreUrl = this.defaultUrl + newValue.trim().split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace(/-+/g, '-');
        this.vendorInfo.user_nicename = newValue.split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace(/-+/g, '-'); // check if the typed url is available

        this.checkStoreName();
      }
    },
    'vendorInfo.user_login': function vendorInfoUser_login(value) {
      this.checkUsername();
    },
    'vendorInfo.email': function vendorInfoEmail(value) {
      this.checkEmail();
    }
  },
  computed: {
    storeUrl: function storeUrl() {
      var storeUrl = this.vendorInfo.store_name.trim().split(' ').join('-').toLowerCase().replace(/[^\w\s/-]/g, '').replace(/-+/g, '-');
      this.vendorInfo.user_nicename = storeUrl;
      this.otherStoreUrl = this.defaultUrl + storeUrl;
      return this.defaultUrl + storeUrl;
    }
  },
  created: function created() {
    var _this = this;

    this.checkStoreName = Object(__WEBPACK_IMPORTED_MODULE_0_debounce__["debounce"])(this.checkStore, this.delay);
    this.checkUsername = Object(__WEBPACK_IMPORTED_MODULE_0_debounce__["debounce"])(this.searchUsername, this.delay);
    this.checkEmail = Object(__WEBPACK_IMPORTED_MODULE_0_debounce__["debounce"])(this.searchEmail, this.delay);
    this.$root.$on('passwordCancelled', function () {
      _this.showPassword = false;
    });
  },
  methods: {
    uploadBanner: function uploadBanner(image) {
      this.vendorInfo.banner_id = image.id; // hide button and footer text after uploading banner

      this.showButton = false;
    },
    uploadGravatar: function uploadGravatar(image) {
      this.vendorInfo.gravatar_id = image.id;
    },
    // getId function has been used to identify whether is it vendor edit page or not
    getId: function getId() {
      return this.$route.params.id;
    },
    onSelectBanner: function onSelectBanner(image) {
      this.banner = image.url;
      this.vendorInfo.banner_id = image.id;
    },
    getError: function getError(key) {
      var errors = this.errors;

      if (!errors || typeof errors === 'undefined') {
        return false;
      }

      if (errors.length < 1) {
        return false;
      }

      if (errors.includes(key)) {
        return key;
      }
    },
    checkStore: function checkStore() {
      var _this2 = this;

      var storeName = this.vendorInfo.user_nicename;

      if (!storeName) {
        return;
      }

      this.storeAvailabilityText = this.__('Searching...', 'dokan-lite');
      dokan.api.get("/stores/check", {
        store_slug: storeName
      }).then(function (response) {
        if (response.available) {
          _this2.storeAvailable = true;

          _this2.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this2.userNameAvailable,
            storeAvailable: _this2.storeAvailable,
            emailAvailable: _this2.emailAvailable
          });

          _this2.storeAvailabilityText = _this2.__('Available', 'dokan-lite');
        } else {
          _this2.storeAvailable = false;

          _this2.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this2.userNameAvailable,
            storeAvailable: _this2.storeAvailable,
            emailAvailable: _this2.emailAvailable
          });

          _this2.storeAvailabilityText = _this2.__('Not Available', 'dokan-lite');
        }
      });
    },
    searchUsername: function searchUsername() {
      var _this3 = this;

      var userName = this.vendorInfo.user_login;

      if (!userName) {
        return;
      }

      this.userNameAvailabilityText = this.__('Searching...', 'dokan-lite');
      dokan.api.get("/stores/check", {
        username: userName
      }).then(function (response) {
        if (response.available) {
          _this3.userNameAvailable = true;

          _this3.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this3.userNameAvailable,
            storeAvailable: _this3.storeAvailable,
            emailAvailable: _this3.emailAvailable
          });

          _this3.userNameAvailabilityText = _this3.__('Available', 'dokan-lite');
        } else {
          _this3.userNameAvailable = false;

          _this3.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this3.userNameAvailable,
            storeAvailable: _this3.storeAvailable,
            emailAvailable: _this3.emailAvailable
          });

          _this3.userNameAvailabilityText = _this3.__('Not Available', 'dokan-lite');
        }
      });
    },
    searchEmail: function searchEmail() {
      var _this4 = this;

      var userEmail = this.vendorInfo.email;

      if (!userEmail) {
        return;
      }

      this.emailAvailabilityText = this.__('Searching...', 'dokan-lite');
      dokan.api.get("/stores/check", {
        email: userEmail
      }).then(function (response) {
        if (response.available) {
          _this4.emailAvailable = true;

          _this4.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this4.userNameAvailable,
            storeAvailable: _this4.storeAvailable,
            emailAvailable: _this4.emailAvailable
          });

          _this4.emailAvailabilityText = _this4.__('Available', 'dokan-lite');
        } else {
          _this4.emailAvailable = false;

          _this4.$root.$emit('vendorInfoChecked', {
            userNameAvailable: _this4.userNameAvailable,
            storeAvailable: _this4.storeAvailable,
            emailAvailable: _this4.emailAvailable
          });

          _this4.emailAvailabilityText = response.message ? response.message : _this4.__('This email is already registered, please choose another one.', 'dokan-lite');
        }
      });
    },
    setPassword: function setPassword(password) {
      this.showPassword = true;
      this.vendorInfo.user_pass = password;
    },
    sendEmail: function sendEmail(status, key) {
      if ('notify_vendor' !== key) {
        return;
      }

      this.vendorInfo.notify_vendor = status;
    },
    getUploadBannerText: function getUploadBannerText() {
      var width = dokan.store_banner_dimension.width;
      var height = dokan.store_banner_dimension.height;
      return this.__("Upload banner for your store. Banner size is (".concat(width, "x").concat(height, ") pixels."), 'dokan-lite');
    }
  }
});

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'UploadImage',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      default: dokan.urls.assetsUrl + '/images/store-pic.png'
    },
    showButton: {
      type: Boolean,
      default: false
    },
    buttonLabel: {
      type: String,
      default: 'Upload Image'
    },
    croppingWidth: {
      type: Number
    },
    croppingHeight: {
      type: Number
    }
  },
  data: function data() {
    return {
      image: {
        src: '',
        id: ''
      }
    };
  },
  created: function created() {
    var _this = this;

    this.$root.$on('resetDokanUploadImage', function (obj) {
      _this.resetImage(obj);
    });
  },
  mounted: function mounted() {},
  methods: {
    getDefaultImageSrc: function getDefaultImageSrc() {
      return dokan.urls.assetsUrl + '/images/store-pic.png';
    },
    uploadImage: function uploadImage() {
      this.openMediaManager(this.onSelectImage);
    },
    resetImage: function resetImage() {
      var _obj$src;

      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.image.src = (_obj$src = obj.src) !== null && _obj$src !== void 0 ? _obj$src : this.getDefaultImageSrc();
      this.image.id = 0;
    },
    onSelectImage: function onSelectImage(image) {
      this.image.src = image.url;
      this.image.id = image.id;
      this.$emit('uploadedImage', this.image);
    },

    /**
     * Open Image Media Uploader
     *
     * @param  function callback
     *
     * @return callback
     */
    openMediaManager: function openMediaManager(callback) {
      var self = this;

      if (self.fileFrame) {
        self.fileFrame.open();
        return;
      }

      var fileStatesOptions = {
        library: wp.media.query(),
        multiple: false,
        // set it true for multiple image
        title: this.__('Select & Crop Image', 'dokan-lite'),
        priority: 20,
        filterable: 'uploaded',
        autoSelect: true,
        suggestedWidth: 500,
        suggestedHeight: 300
      };
      var cropControl = {
        id: "control-id",
        params: {
          width: this.croppingWidth ? parseInt(this.croppingWidth, 10) : parseInt(dokan.store_banner_dimension.width, 10),
          height: this.croppingHeight ? parseInt(this.croppingHeight, 10) : parseInt(dokan.store_banner_dimension.height, 10),
          flex_width: !!parseInt(dokan.store_banner_dimension['flex-width'], 10),
          flex_height: !!parseInt(dokan.store_banner_dimension['flex-height'], 10)
        }
      };

      cropControl.mustBeCropped = function (flexW, flexH, dstW, dstH, imgW, imgH) {
        // If the width and height are both flexible
        // then the user does not need to crop the image.
        if (true === flexW && true === flexH) {
          return false;
        } // If the width is flexible and the cropped image height matches the current image height,
        // then the user does not need to crop the image.


        if (true === flexW && dstH === imgH) {
          return false;
        } // If the height is flexible and the cropped image width matches the current image width,
        // then the user does not need to crop the image.


        if (true === flexH && dstW === imgW) {
          return false;
        } // If the cropped image width matches the current image width,
        // and the cropped image height matches the current image height
        // then the user does not need to crop the image.


        if (dstW === imgW && dstH === imgH) {
          return false;
        } // If the destination width is equal to or greater than the cropped image width
        // then the user does not need to crop the image...


        if (imgW <= dstW) {
          return false;
        }

        return true;
      };

      var fileStates = [new wp.media.controller.Library(fileStatesOptions), new wp.media.controller.CustomizeImageCropper({
        imgSelectOptions: self.calculateImageSelectOptions,
        control: cropControl
      })];
      var mediaOptions = {
        title: this.__('Select Image', 'dokan-lite'),
        button: {
          text: this.__('Select Image', 'dokan-lite'),
          close: false
        },
        multiple: false
      };
      mediaOptions.states = fileStates;
      self.fileFrame = wp.media(mediaOptions);
      self.fileFrame.on('select', function () {
        self.fileFrame.setState('cropper');
      });
      self.fileFrame.on('cropped', function (croppedImage) {
        callback(croppedImage);
        self.fileFrame = null;
      });
      self.fileFrame.on('skippedcrop', function () {
        var selection = self.fileFrame.state().get('selection');
        var files = selection.map(function (attachment) {
          return attachment.toJSON();
        });
        var file = files.pop();
        callback(file);
        self.fileFrame = null;
      });
      self.fileFrame.on('close', function () {
        self.fileFrame = null;
      });
      self.fileFrame.on('ready', function () {
        self.fileFrame.uploader.options.uploader.params = {
          type: 'dokan-vendor-option-media'
        };
      });
      self.fileFrame.open();
    },

    /**
     * Calculate image section options
     *
     * @param  object attachment
     * @param  object controller
     *
     * @return object
     */
    calculateImageSelectOptions: function calculateImageSelectOptions(attachment, controller) {
      var xInit = this.croppingWidth ? parseInt(this.croppingWidth, 10) : parseInt(dokan.store_banner_dimension.width, 10);
      var yInit = this.croppingHeight ? parseInt(this.croppingHeight, 10) : parseInt(dokan.store_banner_dimension.height, 10);
      var flexWidth = !!parseInt(dokan.store_banner_dimension['flex-width'], 10);
      var flexHeight = !!parseInt(dokan.store_banner_dimension['flex-height'], 10);
      var ratio, xImg, yImg, realHeight, realWidth, imgSelectOptions;
      realWidth = attachment.get('width');
      realHeight = attachment.get('height');
      var control = controller.get('control');
      controller.set('canSkipCrop', !control.mustBeCropped(flexWidth, flexHeight, xInit, yInit, realWidth, realHeight));
      ratio = xInit / yInit;
      xImg = realWidth;
      yImg = realHeight;

      if (xImg / yImg > ratio) {
        yInit = yImg;
        xInit = yInit * ratio;
      } else {
        xInit = xImg;
        yInit = xInit / ratio;
      }

      imgSelectOptions = {
        handles: true,
        keys: true,
        instance: true,
        persistent: true,
        imageWidth: realWidth,
        imageHeight: realHeight,
        x1: 0,
        y1: 0,
        x2: xInit,
        y2: yInit
      };

      if (flexHeight === false && flexWidth === false) {
        imgSelectOptions.aspectRatio = xInit + ':' + yInit;
      }

      if (flexHeight === false) {
        imgSelectOptions.maxHeight = yInit;
      }

      if (flexWidth === false) {
        imgSelectOptions.maxWidth = xInit;
      }

      return imgSelectOptions;
    }
  }
});

/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'PasswordGenerator',
  props: {
    title: {
      type: String,
      default: 'Generate Password'
    },
    cancelTitle: {
      type: String,
      default: 'Cancel'
    },
    regenrateTitle: {
      type: String,
      default: 'Regenrate'
    },
    length: {
      type: Number,
      default: 25
    }
  },
  data: function data() {
    return {
      password: '',
      hideGenerateButton: false,
      showCancelButton: false
    };
  },
  methods: {
    generatePassword: function generatePassword() {
      this.password = this.makePassword(this.length);
      this.$emit('passwordGenerated', this.password);
      this.hideGenerateButton = true;
      this.showCancelButton = true;
    },
    makePassword: function makePassword() {
      var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 25;
      var lowerCaseChars = 'abcdefghijklmnopqurstuvwxyz';
      var upperCaseChars = 'ABCDEFGHIJKLMNOPQURSTUVWXYZ';
      var specialChars = '!@#$%^&*()';
      var randomChars = '';

      for (var i = 0; i <= len; i++) {
        var mixUp = lowerCaseChars[Math.floor(Math.random() * len)] + upperCaseChars[Math.floor(Math.random() * 10)] + specialChars[Math.floor(Math.random() * specialChars.length)];
        randomChars += mixUp;
      }

      return randomChars.slice(-len);
    },
    cancelButton: function cancelButton() {
      this.hideGenerateButton = false;
      this.showCancelButton = false;
      this.$root.$emit('passwordCancelled');
    },
    regenratePassword: function regenratePassword() {
      this.password = this.makePassword(this.length);
      this.$emit('passwordGenerated', this.password);
    }
  }
});

/***/ }),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_multiselect__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_multiselect___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue_multiselect__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'VendorAddressFields',
  components: {
    Multiselect: __WEBPACK_IMPORTED_MODULE_0_vue_multiselect__["Multiselect"]
  },
  props: {
    vendorInfo: {
      type: Object
    }
  },
  data: function data() {
    return {
      countries: [],
      states: [],
      selectedCountry: {},
      selectedState: {},
      getAddressFields: dokan.hooks.applyFilters('getVendorAddressFields', [])
    };
  },
  computed: {
    selectedCode: function selectedCode() {
      // let selected = this.selectedCountry;
      var selected = this.vendorInfo.address.country;

      if ('' !== selected) {
        return selected;
      }

      return [];
    }
  },
  created: function created() {
    this.countries = this.transformCountries(dokan.countries);
    this.states = dokan.states;
    var savedCountry = this.vendorInfo.address.country;
    var savedState = this.vendorInfo.address.state;

    if ('' !== savedCountry) {
      this.selectedCountry = {
        name: this.getCountryFromCountryCode(savedCountry),
        code: savedCountry
      };
      this.selectedState = {
        name: this.getStateFromStateCode(savedState, savedCountry),
        code: savedState
      };
    }
  },
  methods: {
    transformCountries: function transformCountries(countryObject) {
      var countries = [];

      for (var key in countryObject) {
        countries.push({
          name: countryObject[key],
          code: key
        });
      }

      return countries;
    },
    getCountryFromCountryCode: function getCountryFromCountryCode(countryCode) {
      if ('' === countryCode) {
        return;
      }

      return dokan.countries[countryCode];
    },
    getStateFromStateCode: function getStateFromStateCode(stateCode, countryCode) {
      if ('' === stateCode) {
        return;
      }

      var states = dokan.states[countryCode];
      var state = states && states[stateCode];
      return typeof state !== 'undefined' ? state : [];
    },
    getStatesFromCountryCode: function getStatesFromCountryCode(countryCode) {
      if ('' === countryCode) {
        return;
      }

      var states = [];
      var statesObject = this.states;

      for (var state in statesObject) {
        if (state !== countryCode) {
          continue;
        }

        if (statesObject[state] && statesObject[state].length < 1) {
          continue;
        }

        for (var name in statesObject[state]) {
          states.push({
            name: statesObject[state][name],
            code: name
          });
        }
      }

      return states;
    },
    saveCountry: function saveCountry(value) {
      if (!value) return; // if reset default state values

      this.vendorInfo.address.state = null;
      this.selectedState = {};
      this.vendorInfo.address.country = value.code;
    },
    saveState: function saveState(value) {
      if (!value) return;
      this.vendorInfo.address.state = value.code;
    }
  }
});

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Switches_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_multiselect__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_multiselect___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_vue_multiselect__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'VendorPaymentFields',
  components: {
    Switches: __WEBPACK_IMPORTED_MODULE_0_admin_components_Switches_vue__["a" /* default */],
    Multiselect: __WEBPACK_IMPORTED_MODULE_1_vue_multiselect__["Multiselect"]
  },
  props: {
    vendorInfo: {
      type: Object
    }
  },
  data: function data() {
    return {
      enabled: false,
      trusted: false,
      featured: false,
      commissionTypes: [{
        name: 'flat',
        label: this.__('Flat', 'dokan-lite')
      }, {
        name: 'percentage',
        label: this.__('Percentage', 'dokan-lite')
      }, {
        name: 'combine',
        label: this.__('Combine', 'dokan-lite')
      }],
      selectedCommissionType: {
        name: 'flat',
        label: this.__('Flat', 'dokan-lite')
      },
      getBankFields: dokan.hooks.applyFilters('getVendorBankFields', []),
      getPyamentFields: dokan.hooks.applyFilters('AfterPyamentFields', []),
      afterFeaturedCheckbox: dokan.hooks.applyFilters('afterFeaturedCheckbox', [])
    };
  },
  created: function created() {
    if (this.vendorInfo.enabled) {
      this.enabled = true;
      this.vendorInfo.enabled = true;
    }

    if (this.vendorInfo.trusted) {
      this.trusted = true;
      this.vendorInfo.trusted = true;
    }

    if (this.vendorInfo.featured) {
      this.featured = true;
      this.vendorInfo.featured = true;
    }

    var commissionType = this.vendorInfo.admin_commission_type;

    if (commissionType) {
      var _$findWhere = _.findWhere(this.commissionTypes, {
        name: commissionType
      }),
          name = _$findWhere.name,
          label = _$findWhere.label;

      this.selectedCommissionType.name = name;
      this.selectedCommissionType.label = label;
    }
  },
  methods: {
    setValue: function setValue(status, key) {
      if ('enabled' === key) {
        if (status) {
          this.vendorInfo.enabled = true;
        } else {
          this.vendorInfo.enabled = false;
        }
      }

      if ('trusted' === key) {
        if (status) {
          this.vendorInfo.trusted = true;
        } else {
          this.vendorInfo.trusted = false;
        }
      }

      if ('featured' === key) {
        if (status) {
          this.vendorInfo.featured = true;
        } else {
          this.vendorInfo.featured = false;
        }
      }
    },
    getId: function getId() {
      return this.$route.params.id;
    },
    saveCommissionType: function saveCommissionType(_ref) {
      var name = _ref.name;

      if (!name) {
        this.vendorInfo.admin_commission_type = 'flat';
      }

      this.vendorInfo.admin_commission_type = name;
    }
  }
});

/***/ }),
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UploadImage_vue__ = __webpack_require__(15);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_40b3524c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UploadImage_vue__ = __webpack_require__(36);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(35)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UploadImage_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_40b3524c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UploadImage_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/UploadImage.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-40b3524c", Component.options)
  } else {
    hotAPI.reload("data-v-40b3524c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_PasswordGenerator_vue__ = __webpack_require__(16);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4084a478_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_PasswordGenerator_vue__ = __webpack_require__(37);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_PasswordGenerator_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4084a478_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_PasswordGenerator_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/PasswordGenerator.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4084a478", Component.options)
  } else {
    hotAPI.reload("data-v-4084a478", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 25 */,
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__ = __webpack_require__(8);
/* unused harmony namespace reexport */
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */
var __vue_template__ = null
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__["a" /* default */],
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Chart.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-28c376de", Component.options)
  } else {
    hotAPI.reload("data-v-28c376de", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 27 */,
/* 28 */,
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__ = __webpack_require__(12);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__ = __webpack_require__(31);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(30)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-01dc0d51"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/ColorPicker.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-01dc0d51", Component.options)
  } else {
    hotAPI.reload("data-v-01dc0d51", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 30 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "color-picker-container" },
    [
      _c(
        "button",
        {
          staticClass: "button color-picker-button",
          attrs: { type: "button" },
          on: { click: _vm.toggleColorPicker }
        },
        [
          _c("div", {
            staticClass: "color",
            style: { backgroundColor: _vm.value }
          }),
          _vm._v(" "),
          _c("span", { staticClass: "dashicons dashicons-arrow-down-alt2" })
        ]
      ),
      _vm._v(" "),
      _vm.showColorPicker
        ? _c("sketch", {
            attrs: {
              value: _vm.value,
              "preset-colors": _vm.presetColors,
              "disable-alpha": _vm.disableAlpha,
              "disable-fields": _vm.disableFields
            },
            on: { input: _vm.updateColor }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.showColorPicker && _vm.format === "hex"
        ? _c("input", {
            staticClass: "hex-input",
            attrs: { type: "text" },
            domProps: { value: _vm.value },
            on: {
              input: function($event) {
                return _vm.setHexColor($event.target.value)
              }
            }
          })
        : _vm._e(),
      _vm._v(" "),
      _vm.showColorPicker
        ? _c("div", { staticClass: "button-group" }, [
            _c("button", {
              staticClass: "button button-small dashicons dashicons-no-alt",
              attrs: { type: "button" },
              on: {
                click: function($event) {
                  return _vm.setLastColor(_vm.prevColor)
                }
              }
            }),
            _vm._v(" "),
            _c("button", {
              staticClass: "button button-small dashicons dashicons-saved",
              attrs: { type: "button" },
              on: { click: _vm.toggleColorPicker }
            })
          ])
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-01dc0d51", esExports)
  }
}

/***/ }),
/* 32 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("label", { staticClass: "switch tips" }, [
    _c("input", {
      staticClass: "toogle-checkbox",
      attrs: { type: "checkbox" },
      domProps: { checked: _vm.enabled, value: _vm.value },
      on: { change: _vm.trigger }
    }),
    _vm._v(" "),
    _c("span", { staticClass: "slider round" })
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-aa8ad7dc", esExports)
  }
}

/***/ }),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAccountFields_vue__ = __webpack_require__(14);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2b13daea_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAccountFields_vue__ = __webpack_require__(38);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAccountFields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2b13daea_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAccountFields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/VendorAccountFields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2b13daea", Component.options)
  } else {
    hotAPI.reload("data-v-2b13daea", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 35 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 36 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-upload-image", on: { click: _vm.uploadImage } },
    [
      !_vm.showButton
        ? _c(
            "div",
            { staticClass: "dokan-upload-image-container" },
            [
              _c("img", {
                attrs: { src: _vm.image.src ? _vm.image.src : _vm.src }
              }),
              _vm._v(" "),
              _vm._t("imagePlaceholder")
            ],
            2
          )
        : _c(
            "button",
            {
              on: {
                click: function($event) {
                  $event.preventDefault()
                  return _vm.uploadImage.apply(null, arguments)
                }
              }
            },
            [_vm._v("\n        " + _vm._s(_vm.buttonLabel) + "\n    ")]
          )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-40b3524c", esExports)
  }
}

/***/ }),
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "password-generator" }, [
    !_vm.hideGenerateButton
      ? _c(
          "button",
          {
            staticClass: "button button-secondary",
            on: {
              click: function($event) {
                $event.preventDefault()
                return _vm.generatePassword.apply(null, arguments)
              }
            }
          },
          [_vm._v("\n        " + _vm._s(_vm.title) + "\n    ")]
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.showCancelButton
      ? _c(
          "button",
          {
            staticClass: "button regen-button",
            on: {
              click: function($event) {
                $event.preventDefault()
                return _vm.regenratePassword.apply(null, arguments)
              }
            }
          },
          [
            _c("span", { staticClass: "dashicons dashicons-controls-repeat" }),
            _vm._v("\n        " + _vm._s(_vm.regenrateTitle) + "\n    ")
          ]
        )
      : _vm._e(),
    _vm._v(" "),
    _vm.showCancelButton
      ? _c(
          "button",
          {
            staticClass: "button cancel-button",
            on: {
              click: function($event) {
                $event.preventDefault()
                return _vm.cancelButton.apply(null, arguments)
              }
            }
          },
          [_vm._v("\n        " + _vm._s(_vm.cancelTitle) + "\n    ")]
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4084a478", esExports)
  }
}

/***/ }),
/* 38 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("form", { staticClass: "account-info" }, [
    _c("div", { staticClass: "content-header" }, [
      _vm._v(
        "\n        " + _vm._s(_vm.__("Account Info", "dokan-lite")) + "\n    "
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "content-body" }, [
      !_vm.getId()
        ? _c("div", { staticClass: "vendor-image" }, [
            _c("div", { staticClass: "picture" }, [
              _c("p", { staticClass: "picture-header" }, [
                _vm._v(_vm._s(_vm.__("Vendor Picture", "dokan-lite")))
              ]),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "profile-image" },
                [
                  _c("upload-image", {
                    attrs: { croppingWidth: 150, croppingHeight: 150 },
                    on: { uploadedImage: _vm.uploadGravatar }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c("p", {
                staticClass: "picture-footer",
                domProps: {
                  innerHTML: _vm._s(
                    _vm.sprintf(
                      _vm.__(
                        "You can change your profile picture on %s",
                        "dokan-lite"
                      ),
                      "<a href='https://gravatar.com/' target='_blank'>Gravatar</a>"
                    )
                  )
                }
              })
            ]),
            _vm._v(" "),
            _c(
              "div",
              {
                class: [
                  "picture banner",
                  { "has-banner": _vm.vendorInfo.banner_id }
                ]
              },
              [
                _c(
                  "div",
                  { staticClass: "banner-image" },
                  [
                    _c("upload-image", {
                      attrs: {
                        showButton: _vm.showButton,
                        buttonLabel: _vm.__("Upload Banner", "dokan-lite")
                      },
                      on: { uploadedImage: _vm.uploadBanner }
                    })
                  ],
                  1
                ),
                _vm._v(" "),
                _vm.showButton
                  ? _c("p", { staticClass: "picture-footer" }, [
                      _vm._v(_vm._s(_vm.getUploadBannerText()))
                    ])
                  : _vm._e()
              ]
            )
          ])
        : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "dokan-form-group" },
        [
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "first-name" } }, [
              _vm._v(_vm._s(_vm.__("First Name", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.first_name,
                  expression: "vendorInfo.first_name"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "email",
                id: "first-name",
                placeholder: _vm.__("First Name", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.first_name },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo, "first_name", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "last-name" } }, [
              _vm._v(_vm._s(_vm.__("Last Name", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.last_name,
                  expression: "vendorInfo.last_name"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "email",
                id: "last-name",
                placeholder: _vm.__("Last Name", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.last_name },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo, "last_name", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "store-name" } }, [
              _vm._v(_vm._s(_vm.__("Store Name", "dokan-lite")))
            ]),
            _vm._v(" "),
            !_vm.getId()
              ? _c("span", { staticClass: "required-field" }, [_vm._v("*")])
              : _vm._e(),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.store_name,
                  expression: "vendorInfo.store_name"
                }
              ],
              class: {
                "dokan-form-input": true,
                "has-error": _vm.getError("store_name")
              },
              attrs: {
                type: "text",
                id: "store-name",
                placeholder: _vm.getError("store_name")
                  ? _vm.__("Store Name is required", "dokan-lite")
                  : _vm.__("Store Name", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.store_name },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo, "store_name", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          !_vm.getId()
            ? _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "user-nicename" } }, [
                  _vm._v(_vm._s(_vm.__("Store URL", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.user_nicename,
                      expression: "vendorInfo.user_nicename"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "user-nicename",
                    placeholder: _vm.__("Store Url", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.user_nicename },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo,
                        "user_nicename",
                        $event.target.value
                      )
                    }
                  }
                }),
                _vm._v(" "),
                _c("div", { staticClass: "store-avaibility-info" }, [
                  _vm.showStoreUrl
                    ? _c("p", { staticClass: "store-url" }, [
                        _vm._v(_vm._s(_vm.storeUrl))
                      ])
                    : _c("p", { staticClass: "store-url" }, [
                        _vm._v(_vm._s(_vm.otherStoreUrl))
                      ]),
                  _vm._v(" "),
                  _c(
                    "span",
                    {
                      class: {
                        "is-available": _vm.storeAvailable,
                        "not-available": !_vm.storeAvailable
                      }
                    },
                    [_vm._v(_vm._s(_vm.storeAvailabilityText))]
                  )
                ])
              ])
            : _vm._e(),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "store-phone" } }, [
              _vm._v(_vm._s(_vm.__("Phone Number", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.phone,
                  expression: "vendorInfo.phone"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "number",
                id: "store-phone",
                placeholder: _vm.__("123456789", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.phone },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo, "phone", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "store-email" } }, [
              _vm._v(_vm._s(_vm.__("Email", "dokan-lite")))
            ]),
            _vm._v(" "),
            !_vm.getId()
              ? _c("span", { staticClass: "required-field" }, [_vm._v("*")])
              : _vm._e(),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.email,
                  expression: "vendorInfo.email"
                }
              ],
              class: {
                "dokan-form-input": true,
                "has-error": _vm.getError("email")
              },
              attrs: {
                type: "email",
                id: "store-email",
                placeholder: _vm.getError("email")
                  ? _vm.__("Email is required", "dokan-lite")
                  : _vm.__("store@email.com", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.email },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo, "email", $event.target.value)
                }
              }
            }),
            _vm._v(" "),
            _c("div", { staticClass: "store-avaibility-info" }, [
              _c(
                "span",
                {
                  class: {
                    "is-available": _vm.emailAvailable,
                    "not-available": !_vm.emailAvailable
                  }
                },
                [_vm._v(_vm._s(_vm.emailAvailabilityText))]
              )
            ])
          ]),
          _vm._v(" "),
          !_vm.getId()
            ? [
                _c("div", { staticClass: "column" }, [
                  _c("label", { attrs: { for: "user-login" } }, [
                    _vm._v(_vm._s(_vm.__("Username", "dokan-lite")))
                  ]),
                  _c("span", { staticClass: "required-field" }, [_vm._v("*")]),
                  _vm._v(" "),
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.vendorInfo.user_login,
                        expression: "vendorInfo.user_login"
                      }
                    ],
                    staticClass: "dokan-form-input",
                    class: {
                      "dokan-form-input": true,
                      "has-error": _vm.getError("user_login")
                    },
                    attrs: {
                      type: "text",
                      id: "user-login",
                      placeholder: _vm.getError("user_login")
                        ? _vm.__("Username is required", "dokan-lite")
                        : _vm.__("Username", "dokan-lite")
                    },
                    domProps: { value: _vm.vendorInfo.user_login },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.$set(
                          _vm.vendorInfo,
                          "user_login",
                          $event.target.value
                        )
                      }
                    }
                  }),
                  _vm._v(" "),
                  _c("div", { staticClass: "store-avaibility-info" }, [
                    _c(
                      "span",
                      {
                        class: {
                          "is-available": _vm.userNameAvailable,
                          "not-available": !_vm.userNameAvailable
                        }
                      },
                      [_vm._v(_vm._s(_vm.userNameAvailabilityText))]
                    )
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "checkbox-left notify-vendor" },
                    [
                      _c("switches", {
                        attrs: { enabled: true, value: "notify_vendor" },
                        on: { input: _vm.sendEmail }
                      }),
                      _vm._v(" "),
                      _c("span", { staticClass: "desc" }, [
                        _vm._v(
                          _vm._s(
                            _vm.__(
                              "Send the vendor an email about their account.",
                              "dokan-lite"
                            )
                          )
                        )
                      ])
                    ],
                    1
                  )
                ]),
                _vm._v(" "),
                _c(
                  "div",
                  { staticClass: "column" },
                  [
                    _c("label", { attrs: { for: "store-password" } }, [
                      _vm._v(_vm._s(_vm.__("Password", "dokan-lite")))
                    ]),
                    _vm._v(" "),
                    _vm.showPassword
                      ? _c("input", {
                          directives: [
                            {
                              name: "model",
                              rawName: "v-model",
                              value: _vm.vendorInfo.user_pass,
                              expression: "vendorInfo.user_pass"
                            }
                          ],
                          staticClass: "dokan-form-input",
                          attrs: {
                            id: "store-password",
                            type: "text",
                            placeholder: "********"
                          },
                          domProps: { value: _vm.vendorInfo.user_pass },
                          on: {
                            input: function($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.$set(
                                _vm.vendorInfo,
                                "user_pass",
                                $event.target.value
                              )
                            }
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _c("password-generator", {
                      attrs: {
                        title: _vm.__("Generate Password", "dokan-lite")
                      },
                      on: { passwordGenerated: _vm.setPassword }
                    })
                  ],
                  1
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm._l(_vm.getAccountFields, function(component, index) {
            return _c(component, {
              key: index,
              tag: "component",
              attrs: { vendorInfo: _vm.vendorInfo }
            })
          })
        ],
        2
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2b13daea", esExports)
  }
}

/***/ }),
/* 39 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAddressFields_vue__ = __webpack_require__(17);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_9504c01e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAddressFields_vue__ = __webpack_require__(41);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(40)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAddressFields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_9504c01e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAddressFields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/VendorAddressFields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-9504c01e", Component.options)
  } else {
    hotAPI.reload("data-v-9504c01e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 40 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 41 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "account-info" }, [
    _c("div", { staticClass: "content-header" }, [
      _vm._v("\n        " + _vm._s(_vm.__("Address", "dokan-lite")) + "\n    ")
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "content-body" }, [
      _c(
        "div",
        { staticClass: "dokan-form-group" },
        [
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "street-1" } }, [
              _vm._v(_vm._s(_vm.__("Street 1", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.address.street_1,
                  expression: "vendorInfo.address.street_1"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "text",
                id: "street-1",
                placeholder: _vm.__("Street 1", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.address.street_1 },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.vendorInfo.address,
                    "street_1",
                    $event.target.value
                  )
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "street-2" } }, [
              _vm._v(_vm._s(_vm.__("Street 2", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.address.street_2,
                  expression: "vendorInfo.address.street_2"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "text",
                id: "street-2",
                placeholder: _vm.__("Street 2", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.address.street_2 },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(
                    _vm.vendorInfo.address,
                    "street_2",
                    $event.target.value
                  )
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "city" } }, [
              _vm._v(_vm._s(_vm.__("City", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.address.city,
                  expression: "vendorInfo.address.city"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "text",
                id: "city",
                placeholder: _vm.__("City", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.address.city },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo.address, "city", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "column" }, [
            _c("label", { attrs: { for: "zip" } }, [
              _vm._v(_vm._s(_vm.__("Zip", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("input", {
              directives: [
                {
                  name: "model",
                  rawName: "v-model",
                  value: _vm.vendorInfo.address.zip,
                  expression: "vendorInfo.address.zip"
                }
              ],
              staticClass: "dokan-form-input",
              attrs: {
                type: "text",
                id: "zip",
                placeholder: _vm.__("Zip", "dokan-lite")
              },
              domProps: { value: _vm.vendorInfo.address.zip },
              on: {
                input: function($event) {
                  if ($event.target.composing) {
                    return
                  }
                  _vm.$set(_vm.vendorInfo.address, "zip", $event.target.value)
                }
              }
            })
          ]),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "address-multiselect" },
            [
              _c("label", { attrs: { for: "country" } }, [
                _vm._v(_vm._s(_vm.__("Country", "dokan-lite")))
              ]),
              _vm._v(" "),
              _c("Multiselect", {
                attrs: {
                  id: "country",
                  options: _vm.countries,
                  multiselect: false,
                  label: "name",
                  "track-by": "name",
                  showLabels: false,
                  placeholder: _vm.__("Select Country", "dokan-lite")
                },
                on: { input: _vm.saveCountry },
                model: {
                  value: _vm.selectedCountry,
                  callback: function($$v) {
                    _vm.selectedCountry = $$v
                  },
                  expression: "selectedCountry"
                }
              })
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "address-multiselect" },
            [
              _c("label", { attrs: { for: "state" } }, [
                _vm._v(_vm._s(_vm.__("State", "dokan-lite")))
              ]),
              _vm._v(" "),
              _vm.getStatesFromCountryCode(_vm.selectedCode).length < 1
                ? [
                    _c("input", {
                      directives: [
                        {
                          name: "model",
                          rawName: "v-model",
                          value: _vm.vendorInfo.address.state,
                          expression: "vendorInfo.address.state"
                        }
                      ],
                      staticClass: "dokan-form-input",
                      attrs: {
                        id: "state",
                        type: "text",
                        placeholder: _vm.__("State", "dokan-lite")
                      },
                      domProps: { value: _vm.vendorInfo.address.state },
                      on: {
                        input: function($event) {
                          if ($event.target.composing) {
                            return
                          }
                          _vm.$set(
                            _vm.vendorInfo.address,
                            "state",
                            $event.target.value
                          )
                        }
                      }
                    })
                  ]
                : [
                    _c("Multiselect", {
                      attrs: {
                        id: "state",
                        options: _vm.getStatesFromCountryCode(_vm.selectedCode),
                        multiselect: false,
                        showLabels: false,
                        label: "name",
                        "track-by": "name",
                        placeholder: _vm.__("Select State", "dokan-lite")
                      },
                      on: { input: _vm.saveState },
                      model: {
                        value: _vm.selectedState,
                        callback: function($$v) {
                          _vm.selectedState = $$v
                        },
                        expression: "selectedState"
                      }
                    })
                  ]
            ],
            2
          ),
          _vm._v(" "),
          _vm._l(_vm.getAddressFields, function(component, index) {
            return _c(component, {
              key: index,
              tag: "component",
              attrs: { vendorInfo: _vm.vendorInfo }
            })
          })
        ],
        2
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-9504c01e", esExports)
  }
}

/***/ }),
/* 42 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorPaymentFields_vue__ = __webpack_require__(18);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2ed34783_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorPaymentFields_vue__ = __webpack_require__(44);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(43)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorPaymentFields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2ed34783_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorPaymentFields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/VendorPaymentFields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-2ed34783", Component.options)
  } else {
    hotAPI.reload("data-v-2ed34783", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 43 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 44 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { class: { "payment-info": true, "edit-mode": _vm.getId() } },
    [
      _c("div", { staticClass: "content-header" }, [
        _vm._v(
          "\n        " +
            _vm._s(_vm.__("Payment Options", "dokan-lite")) +
            "\n    "
        )
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "content-body" },
        [
          _c(
            "div",
            { staticClass: "dokan-form-group" },
            [
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "account-name" } }, [
                  _vm._v(_vm._s(_vm.__("Account Name", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.ac_name,
                      expression: "vendorInfo.payment.bank.ac_name"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "account-name",
                    placeholder: _vm.__("Account Name", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.ac_name },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "ac_name",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "account-number" } }, [
                  _vm._v(_vm._s(_vm.__("Account Number", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.ac_number,
                      expression: "vendorInfo.payment.bank.ac_number"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "account-number",
                    placeholder: _vm.__("1233456789", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.ac_number },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "ac_number",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "account-type" } }, [
                  _vm._v(_vm._s(_vm.__("Account Type", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c(
                  "select",
                  {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.vendorInfo.payment.bank.ac_type,
                        expression: "vendorInfo.payment.bank.ac_type"
                      }
                    ],
                    staticClass: "dokan-form-input",
                    attrs: { id: "account-type" },
                    on: {
                      change: function($event) {
                        var $$selectedVal = Array.prototype.filter
                          .call($event.target.options, function(o) {
                            return o.selected
                          })
                          .map(function(o) {
                            var val = "_value" in o ? o._value : o.value
                            return val
                          })
                        _vm.$set(
                          _vm.vendorInfo.payment.bank,
                          "ac_type",
                          $event.target.multiple
                            ? $$selectedVal
                            : $$selectedVal[0]
                        )
                      }
                    }
                  },
                  [
                    _c("option", { attrs: { value: "" } }, [
                      _vm._v(_vm._s(_vm.__("Please Select...", "dokan-lite")))
                    ]),
                    _vm._v(" "),
                    _c("option", { attrs: { value: "personal" } }, [
                      _vm._v(_vm._s(_vm.__("Personal", "dokan-lite")))
                    ]),
                    _vm._v(" "),
                    _c("option", { attrs: { value: "business" } }, [
                      _vm._v(_vm._s(_vm.__("Business", "dokan-lite")))
                    ])
                  ]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "bank-name" } }, [
                  _vm._v(_vm._s(_vm.__("Bank Name", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.bank_name,
                      expression: "vendorInfo.payment.bank.bank_name"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "bank-name",
                    placeholder: _vm.__("Bank Name", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.bank_name },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "bank_name",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "bank-address" } }, [
                  _vm._v(_vm._s(_vm.__("Bank Address", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.bank_addr,
                      expression: "vendorInfo.payment.bank.bank_addr"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "bank-address",
                    placeholder: _vm.__("Bank Address", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.bank_addr },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "bank_addr",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "routing-number" } }, [
                  _vm._v(_vm._s(_vm.__("Routing Number", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.routing_number,
                      expression: "vendorInfo.payment.bank.routing_number"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "routing-number",
                    placeholder: _vm.__("123456789", "dokan-lite")
                  },
                  domProps: {
                    value: _vm.vendorInfo.payment.bank.routing_number
                  },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "routing_number",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "iban" } }, [
                  _vm._v(_vm._s(_vm.__("IBAN", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.iban,
                      expression: "vendorInfo.payment.bank.iban"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "iban",
                    placeholder: _vm.__("123456789", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.iban },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "iban",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "column" }, [
                _c("label", { attrs: { for: "swift" } }, [
                  _vm._v(_vm._s(_vm.__("Swift", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.vendorInfo.payment.bank.swift,
                      expression: "vendorInfo.payment.bank.swift"
                    }
                  ],
                  staticClass: "dokan-form-input",
                  attrs: {
                    type: "text",
                    id: "swift",
                    placeholder: _vm.__("123456789", "dokan-lite")
                  },
                  domProps: { value: _vm.vendorInfo.payment.bank.swift },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.vendorInfo.payment.bank,
                        "swift",
                        $event.target.value
                      )
                    }
                  }
                })
              ]),
              _vm._v(" "),
              _vm._l(_vm.getBankFields, function(component, index) {
                return _c(component, {
                  key: index,
                  tag: "component",
                  attrs: { vendorInfo: _vm.vendorInfo }
                })
              })
            ],
            2
          ),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "dokan-form-group" },
            [
              _c(
                "div",
                {
                  class: { column: _vm.getId(), "checkbox-group": !_vm.getId() }
                },
                [
                  _c("label", { attrs: { for: "paypal-email" } }, [
                    _vm._v(_vm._s(_vm.__("PayPal Email", "dokan-lite")))
                  ]),
                  _vm._v(" "),
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.vendorInfo.payment.paypal.email,
                        expression: "vendorInfo.payment.paypal.email"
                      }
                    ],
                    staticClass: "dokan-form-input",
                    attrs: {
                      type: "email",
                      id: "paypal-email",
                      placeholder: _vm.__("store@email.com", "dokan-lite")
                    },
                    domProps: { value: _vm.vendorInfo.payment.paypal.email },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.$set(
                          _vm.vendorInfo.payment.paypal,
                          "email",
                          $event.target.value
                        )
                      }
                    }
                  })
                ]
              ),
              _vm._v(" "),
              _vm.getId()
                ? [
                    _c("div", { staticClass: "column" }, [
                      _c(
                        "div",
                        { staticClass: "column" },
                        [
                          _c("label", { attrs: { for: "commission-type" } }, [
                            _vm._v(
                              _vm._s(
                                _vm.__("Admin Commission Type", "dokan-lite")
                              )
                            )
                          ]),
                          _vm._v(" "),
                          _c("Multiselect", {
                            attrs: {
                              id: "commission-type",
                              options: _vm.commissionTypes,
                              "track-by": "name",
                              label: "label",
                              "allow-empty": false,
                              multiselect: false,
                              searchable: false,
                              showLabels: false
                            },
                            on: { input: _vm.saveCommissionType },
                            model: {
                              value: _vm.selectedCommissionType,
                              callback: function($$v) {
                                _vm.selectedCommissionType = $$v
                              },
                              expression: "selectedCommissionType"
                            }
                          })
                        ],
                        1
                      )
                    ]),
                    _vm._v(" "),
                    "combine" === _vm.selectedCommissionType.name
                      ? _c(
                          "div",
                          { staticClass: "column combine-commission" },
                          [
                            _c("label", [
                              _vm._v(
                                _vm._s(_vm.__("Admin Commission", "dokan-lite"))
                              )
                            ]),
                            _vm._v(" "),
                            _c(
                              "div",
                              { staticClass: "combine-commission-field" },
                              [
                                _c("input", {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.vendorInfo.admin_commission,
                                      expression: "vendorInfo.admin_commission"
                                    }
                                  ],
                                  staticClass:
                                    "wc_input_decimal dokan-form-input percent_fee",
                                  attrs: { type: "text" },
                                  domProps: {
                                    value: _vm.vendorInfo.admin_commission
                                  },
                                  on: {
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.$set(
                                        _vm.vendorInfo,
                                        "admin_commission",
                                        $event.target.value
                                      )
                                    }
                                  }
                                }),
                                _vm._v(
                                  "\n                        " +
                                    _vm._s("%    +") +
                                    "\n                        "
                                ),
                                _c("input", {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value:
                                        _vm.vendorInfo.admin_additional_fee,
                                      expression:
                                        "vendorInfo.admin_additional_fee"
                                    }
                                  ],
                                  staticClass:
                                    "wc_input_price dokan-form-input fixed_fee",
                                  attrs: { type: "text" },
                                  domProps: {
                                    value: _vm.vendorInfo.admin_additional_fee
                                  },
                                  on: {
                                    input: function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.$set(
                                        _vm.vendorInfo,
                                        "admin_additional_fee",
                                        $event.target.value
                                      )
                                    }
                                  }
                                })
                              ]
                            )
                          ]
                        )
                      : _c("div", { staticClass: "column" }, [
                          _c("label", [
                            _vm._v(
                              _vm._s(_vm.__("Admin Commission", "dokan-lite"))
                            )
                          ]),
                          _vm._v(" "),
                          _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.vendorInfo.admin_commission,
                                expression: "vendorInfo.admin_commission"
                              }
                            ],
                            staticClass: "dokan-form-input",
                            class: {
                              wc_input_price:
                                _vm.selectedCommissionType.name == "flat",
                              wc_input_decimal:
                                _vm.selectedCommissionType.name != "flat"
                            },
                            attrs: { type: "text" },
                            domProps: {
                              value: _vm.vendorInfo.admin_commission
                            },
                            on: {
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.vendorInfo,
                                  "admin_commission",
                                  $event.target.value
                                )
                              }
                            }
                          })
                        ])
                  ]
                : _vm._e(),
              _vm._v(" "),
              _c("div", { staticClass: "checkbox-group" }, [
                _c(
                  "div",
                  { staticClass: "checkbox-left" },
                  [
                    _c("switches", {
                      attrs: { enabled: _vm.enabled, value: "enabled" },
                      on: { input: _vm.setValue }
                    }),
                    _vm._v(" "),
                    _c("span", { staticClass: "desc" }, [
                      _vm._v(_vm._s(_vm.__("Enable Selling", "dokan-lite")))
                    ])
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "checkbox-group" }, [
                _c(
                  "div",
                  { staticClass: "checkbox-left" },
                  [
                    _c("switches", {
                      attrs: { enabled: _vm.trusted, value: "trusted" },
                      on: { input: _vm.setValue }
                    }),
                    _vm._v(" "),
                    _c("span", { staticClass: "desc" }, [
                      _vm._v(
                        _vm._s(_vm.__("Publish Product Directly", "dokan-lite"))
                      )
                    ])
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "checkbox-group" }, [
                _c(
                  "div",
                  { staticClass: "checkbox-left" },
                  [
                    _c("switches", {
                      attrs: { enabled: _vm.featured, value: "featured" },
                      on: { input: _vm.setValue }
                    }),
                    _vm._v(" "),
                    _c("span", { staticClass: "desc" }, [
                      _vm._v(
                        _vm._s(_vm.__("Make Vendor Featured", "dokan-lite"))
                      )
                    ])
                  ],
                  1
                )
              ]),
              _vm._v(" "),
              _vm._l(_vm.afterFeaturedCheckbox, function(component, index) {
                return _c(component, {
                  key: index,
                  tag: "component",
                  attrs: { vendorInfo: _vm.vendorInfo }
                })
              })
            ],
            2
          ),
          _vm._v(" "),
          _vm._l(_vm.getPyamentFields, function(component, index) {
            return _c(component, {
              key: index,
              tag: "component",
              attrs: { vendorInfo: _vm.vendorInfo }
            })
          })
        ],
        2
      )
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-2ed34783", esExports)
  }
}

/***/ }),
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'App'
});

/***/ }),
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var Postbox = dokan_get_lib('Postbox');
var Loading = dokan_get_lib('Loading');
var Currency = dokan_get_lib('Currency');
var AdminNotice = dokan_get_lib('AdminNotice');


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Dashboard',
  components: {
    Postbox: Postbox,
    Loading: Loading,
    Chart: __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__["a" /* default */],
    Currency: Currency,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      overview: null,
      feed: null,
      report: null,
      subscribe: {
        success: false,
        loading: false,
        email: '',
        full_name: ''
      },
      hasPro: dokan.hasPro ? true : false
    };
  },
  created: function created() {
    this.fetchOverview();
    this.fetchFeed();
    this.fetchReport();
  },
  methods: {
    fetchOverview: function fetchOverview() {
      var _this = this;

      dokan.api.get('/admin/report/summary').done(function (response) {
        _this.overview = response;
      });
    },
    fetchFeed: function fetchFeed() {
      var _this2 = this;

      dokan.api.get('/admin/dashboard/feed').done(function (response) {
        _this2.feed = response;
      });
    },
    fetchReport: function fetchReport() {
      var _this3 = this;

      dokan.api.get('/admin/report/overview').done(function (response) {
        _this3.report = response;
      });
    },
    validEmail: function validEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },
    emailSubscribe: function emailSubscribe() {
      var _this4 = this;

      if (!this.validEmail(this.subscribe.email)) {
        return;
      }

      var action = 'https://api.getwemail.io/v1/embed/subscribe/8da67b42-c367-4ad3-ae70-5cf63635a832';
      this.subscribe.loading = true;
      var options = {
        type: 'POST',
        url: action,
        data: {
          email: this.subscribe.email,
          full_name: this.subscribe.full_name,
          tag: '8e0ae2bb-e838-4ec8-9aa1-c9e5dd96fe34'
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      };
      wp.ajax.send(options, options.data).always(function (response) {
        _this4.subscribe.success = true;
        _this4.subscribe.loading = false;
      });
    }
  }
});

/***/ }),
/* 54 */,
/* 55 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: "UpgradeBanner",
  data: function data() {
    return {
      show: dokan.showPromoBanner,
      upgradeURL: dokan.urls.upgradeToPro
    };
  },
  computed: {
    showUpgrade: function showUpgrade() {
      return !dokan.hasPro && dokan.proNag === "show";
    }
  },
  methods: {
    dismiss: function dismiss() {
      this.show = false;
      wp.ajax.post("dokan-upgrade-dissmiss");
    }
  }
});

/***/ }),
/* 56 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var ListTable = dokan_get_lib('ListTable');
var Modal = dokan_get_lib('Modal');
var Currency = dokan_get_lib('Currency');
var AdminNotice = dokan_get_lib('AdminNotice');


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Withdraw',
  components: {
    ListTable: ListTable,
    Modal: Modal,
    Currency: Currency,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      showModal: false,
      editing: {
        id: null,
        note: null
      },
      totalPages: 1,
      perPage: 10,
      totalItems: 0,
      filter: {
        user_id: 0
      },
      counts: {
        pending: 0,
        approved: 0,
        cancelled: 0
      },
      notFound: this.__('No requests found.', 'dokan-lite'),
      massPayment: this.__('Paypal Mass Payment File is Generated.', 'dokan-lite'),
      showCb: true,
      loading: false,
      columns: {
        'seller': {
          label: this.__('Vendor', 'dokan-lite')
        },
        'amount': {
          label: this.__('Amount', 'dokan-lite')
        },
        'status': {
          label: this.__('Status', 'dokan-lite')
        },
        'method_title': {
          label: this.__('Method', 'dokan-lite')
        },
        'method_details': {
          label: this.__('Details', 'dokan-lite')
        },
        'note': {
          label: this.__('Note', 'dokan-lite')
        },
        'created': {
          label: this.__('Date', 'dokan-lite')
        },
        'actions': {
          label: this.__('Actions', 'dokan-lite')
        }
      },
      requests: [],
      actionColumn: 'seller',
      hasPro: dokan.hasPro ? true : false
    };
  },
  watch: {
    '$route.query.status': function $routeQueryStatus() {
      this.filter.user_id = 0;
      this.clearSelection('#filter-vendors');
      this.fetchRequests();
    },
    '$route.query.page': function $routeQueryPage() {
      this.fetchRequests();
    },
    '$route.query.user_id': function $routeQueryUser_id() {
      this.fetchRequests();
    },
    'filter.user_id': function filterUser_id(user_id) {
      if (user_id === 0) {
        this.clearSelection('#filter-vendors');
      }

      this.goTo(this.query);
    }
  },
  computed: {
    currentStatus: function currentStatus() {
      return this.$route.query.status || 'pending';
    },
    currentPage: function currentPage() {
      var page = this.$route.query.page || 1;
      return parseInt(page);
    },
    actions: function actions() {
      if ('pending' == this.currentStatus) {
        return [{
          key: 'trash',
          label: this.__('Delete', 'dokan-lite')
        }, {
          key: 'cancel',
          label: this.__('Cancel', 'dokan-lite')
        }];
      } else if ('cancelled' == this.currentStatus) {
        return [{
          key: 'trash',
          label: this.__('Delete', 'dokan-lite')
        }, {
          key: 'pending',
          label: this.__('Pending', 'dokan-lite')
        }];
      } else {
        return [];
      }
    },
    bulkActions: function bulkActions() {
      if ('pending' == this.currentStatus) {
        return [{
          key: 'approved',
          label: this.__('Approve', 'dokan-lite')
        }, {
          key: 'cancelled',
          label: this.__('Cancel', 'dokan-lite')
        }, {
          key: 'delete',
          label: this.__('Delete', 'dokan-lite')
        }, {
          key: 'paypal',
          label: this.__('Download PayPal mass payment file', 'dokan-lite')
        }];
      } else if ('cancelled' == this.currentStatus) {
        return [{
          key: 'pending',
          label: this.__('Pending', 'dokan-lite')
        }, {
          key: 'delete',
          label: this.__('Delete', 'dokan-lite')
        }, {
          key: 'paypal',
          label: this.__('Download PayPal mass payment file', 'dokan-lite')
        }];
      } else {
        return [{
          key: 'paypal',
          label: this.__('Download PayPal mass payment file', 'dokan-lite')
        }];
      }
    }
  },
  created: function created() {
    this.fetchRequests();
  },
  mounted: function mounted() {
    var self = this;
    __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#filter-vendors').selectWoo({
      ajax: {
        url: "".concat(dokan.rest.root, "dokan/v1/stores"),
        dataType: 'json',
        headers: {
          "X-WP-Nonce": dokan.rest.nonce
        },
        data: function data(params) {
          return {
            search: params.term
          };
        },
        processResults: function processResults(data) {
          return {
            results: data.map(function (store) {
              return {
                id: store.id,
                text: store.store_name
              };
            })
          };
        }
      }
    });
    __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#filter-vendors').on('select2:select', function (e) {
      self.filter.user_id = e.params.data.id;
    });
  },
  methods: {
    updatedCounts: function updatedCounts(xhr) {
      this.counts.pending = parseInt(xhr.getResponseHeader('X-Status-Pending'));
      this.counts.approved = parseInt(xhr.getResponseHeader('X-Status-Completed'));
      this.counts.cancelled = parseInt(xhr.getResponseHeader('X-Status-Cancelled'));
    },
    updatePagination: function updatePagination(xhr) {
      this.totalPages = parseInt(xhr.getResponseHeader('X-WP-TotalPages'));
      this.totalItems = parseInt(xhr.getResponseHeader('X-WP-Total'));
    },
    vendorUrl: function vendorUrl(id) {
      if (window.dokan.hasPro === '1') {
        return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/' + id;
      }

      return dokan.urls.adminRoot + 'user-edit.php?user_id=' + id;
    },
    fetchRequests: function fetchRequests() {
      var _this = this;

      this.loading = true;
      var user_id = '';

      if (parseInt(this.filter.user_id) > 0) {
        user_id = this.filter.user_id;
      }

      var data = {
        per_page: this.perPage,
        page: this.currentPage,
        status: this.currentStatus,
        user_id: user_id
      };
      dokan.api.get('/withdraw', data).done(function (response, status, xhr) {
        _this.requests = response;
        _this.loading = false;

        _this.updatedCounts(xhr);

        _this.updatePagination(xhr);
      });
    },
    goToPage: function goToPage(page) {
      this.$router.push({
        name: 'Withdraw',
        query: {
          status: this.currentStatus,
          page: page,
          user_id: this.filter.user_id
        }
      });
    },
    goTo: function goTo(page) {
      this.$router.push({
        name: 'Withdraw',
        query: {
          status: this.currentStatus,
          user_id: this.filter.user_id
        }
      });
    },
    updateItem: function updateItem(id, value) {
      var index = this.requests.findIndex(function (x) {
        return x.id == id;
      });
      this.$set(this.requests, index, value);
    },
    changeStatus: function changeStatus(status, id) {
      var _this2 = this;

      this.loading = true;
      dokan.api.put('/withdraw/' + id, {
        status: status
      }).done(function (response) {
        // this.requests = response;
        _this2.loading = false; // this.updateItem(id, response);

        _this2.fetchRequests();
      });
    },
    onActionClick: function onActionClick(action, row) {
      var _this3 = this;

      if ('cancel' === action) {
        this.changeStatus('cancelled', row.id);
      }

      if ('pending' === action) {
        this.changeStatus('pending', row.id);
      }

      if ('trash' === action) {
        if (confirm(this.__('Are you sure?', 'dokan-lite'))) {
          this.loading = true;
          dokan.api.delete('/withdraw/' + row.id).done(function (response) {
            _this3.loading = false;

            _this3.fetchRequests();
          });
        }
      }
    },
    getPaymentTitle: function getPaymentTitle(method, data) {
      var title = data.method_title;

      if (data.details[method] !== undefined && 'dokan_custom' === method) {
        var _data$details$method$;

        title = (_data$details$method$ = data.details[method].method) !== null && _data$details$method$ !== void 0 ? _data$details$method$ : '';
      }

      return dokan.hooks.applyFilters('dokan_get_payment_title', title, method, data);
    },
    getPaymentDetails: function getPaymentDetails(method, data) {
      var details = '—';

      if (data[method] !== undefined) {
        if ('paypal' === method || 'skrill' === method) {
          details = data[method].email || '';
        } else if ('bank' === method) {
          if (data.bank.hasOwnProperty('ac_name')) {
            details = '<p>' + this.sprintf(this.__('Account Name: %s', 'dokan-lite'), data.bank.ac_name) + '</p>';
          }

          if (data.bank.hasOwnProperty('ac_number')) {
            details += '<p>' + this.sprintf(this.__('Account Number: %s', 'dokan-lite'), data.bank.ac_number) + '</p>';
          }

          if (data.bank.hasOwnProperty('bank_name')) {
            details += '<p>' + this.sprintf(this.__('Bank Name: %s', 'dokan-lite'), data.bank.bank_name) + '</p>';
          }

          if (data.bank.hasOwnProperty('iban')) {
            details += '<p>' + this.sprintf(this.__('IBAN: %s', 'dokan-lite'), data.bank.iban) + '</p>';
          }

          if (data.bank.hasOwnProperty('routing_number')) {
            details += '<p>' + this.sprintf(this.__('Routing Number: %s', 'dokan-lite'), data.bank.routing_number) + '</p>';
          }

          if (data.bank.hasOwnProperty('swift')) {
            details += '<p>' + this.sprintf(this.__('Swift Code: %s', 'dokan-lite'), data.bank.swift) + '</p>';
          }
        } else if ('dokan_custom' === method) {
          var _data$method$value;

          details = (_data$method$value = data[method].value) !== null && _data$method$value !== void 0 ? _data$method$value : '';
        }
      }

      return dokan.hooks.applyFilters('dokan_get_payment_details', details, method, data);
    },
    moment: function (_moment) {
      function moment(_x) {
        return _moment.apply(this, arguments);
      }

      moment.toString = function () {
        return _moment.toString();
      };

      return moment;
    }(function (date) {
      return moment(date);
    }),
    onBulkAction: function onBulkAction(action, items) {
      var _this4 = this;

      var self = this;

      if (_.contains(['delete', 'approved', 'cancelled', 'pending'], action)) {
        var jsonData = {};
        jsonData[action] = items;
        this.loading = true;
        dokan.api.put('/withdraw/batch', jsonData).done(function (response) {
          _this4.loading = false;

          _this4.fetchRequests();
        });
      }

      if ('paypal' === action) {
        var ids = items.join(",");
        jQuery.post(ajaxurl, {
          'dokan_withdraw_bulk': 'paypal',
          'id': ids,
          'action': 'withdraw_ajax_submission',
          'nonce': dokan.nonce
        }, function (response, status, xhr) {
          if ('html/csv' === xhr.getResponseHeader('Content-type')) {
            var filename = "";
            var disposition = xhr.getResponseHeader('Content-Disposition');

            if (disposition && disposition.indexOf('attachment') !== -1) {
              var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              var matches = filenameRegex.exec(disposition);

              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }

            var type = xhr.getResponseHeader('Content-Type');
            var blob = typeof File === 'function' ? new File([response], filename, {
              type: type
            }) : new Blob([response], {
              type: type
            });

            if (typeof window.navigator.msSaveBlob !== 'undefined') {
              // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
              window.navigator.msSaveBlob(blob, filename);
            } else {
              var URL = window.URL || window.webkitURL;
              var downloadUrl = URL.createObjectURL(blob);

              if (filename) {
                // use HTML5 a[download] attribute to specify filename
                var a = document.createElement("a"); // safari doesn't support this yet

                if (typeof a.download === 'undefined') {
                  window.location = downloadUrl;
                } else {
                  a.href = downloadUrl;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                }
              } else {
                window.location = downloadUrl;
              }

              setTimeout(function () {
                URL.revokeObjectURL(downloadUrl);
              }, 100); // cleanup
            }
          }

          if (response) {
            alert(self.massPayment);
            return;
          }
        });
      }
    },
    openNoteModal: function openNoteModal(note, id) {
      this.showModal = true;
      this.editing = {
        id: id,
        note: note
      };
    },
    updateNote: function updateNote() {
      var _this5 = this;

      this.showModal = false;
      this.loading = true;
      dokan.api.put('/withdraw/' + this.editing.id, {
        note: this.editing.note
      }).done(function (response) {
        _this5.loading = false;

        _this5.updateItem(_this5.editing.id, response);

        _this5.editing = {
          id: null,
          note: null
        };
      });
    },
    clearSelection: function clearSelection(element) {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element).val(null).trigger('change');
    }
  }
});

/***/ }),
/* 57 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__ = __webpack_require__(58);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css__ = __webpack_require__(144);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_slick__ = __webpack_require__(147);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//



/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Premium',
  components: {
    Slick: __WEBPACK_IMPORTED_MODULE_2_vue_slick__["a" /* default */],
    ProCta: __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__["a" /* default */]
  },
  data: function data() {
    return {
      asstesUrl: dokan.urls.assetsUrl,
      buyNowProUrl: 'https://wedevs.com/account/',
      services: [{
        "title": this.__("Premium modules to make everything easier & better", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-01@2x.png'
      }, {
        "title": this.__("Frontend dashboard for vendors with advanced controls", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-02@2x.png'
      }, {
        "title": this.__("Unlimited Product Variations and group product upload", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-03@2x.png'
      }, {
        "title": this.__("Zone wise shipping with multiple method for vendors", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-04@2x.png'
      }, {
        "title": this.__("Store support based on ticket system for your customers", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-05@2x.png'
      }, {
        "title": this.__("Vendors will be able to generate coupon codes", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-06@2x.png'
      }, {
        "title": this.__("Earning, Selling and Commission Reports & Statement", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-07@2x.png'
      }, {
        "title": this.__("24/7 super fast premium customer support for you", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-08@2x.png'
      }, {
        "title": this.__("Add Social profile to your vendor’s store and support for store SEO", "dokan-lite"),
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/service-09@2x.png'
      }],
      comparisons: [{
        "title": this.__("Frontend order management", "dokan-lite"),
        "compare": {
          "lite": "available",
          "pro": 'available'
        }
      }, {
        "title": this.__("Seller Statement Reports", "dokan-lite"),
        "compare": {
          "lite": "available",
          "pro": 'available'
        }
      }, {
        "title": this.__("Making Announcements", "dokan-lite"),
        "compare": {
          "lite": "available",
          "pro": 'available'
        }
      }, {
        "title": this.__("Customized Product Categories", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Store SEO", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Back Ordering System", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Store Contact Form", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Single Product Multiple Seller", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Seller Verification", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Featured Seller", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Multiple Commission Types", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Frontend Shipping Tracking", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Setup Wizard", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Google Maps", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Manage reviews", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }, {
        "title": this.__("Bookable Product", "dokan-lite"),
        "compare": {
          "lite": "unavailable",
          "pro": 'available'
        }
      }],
      modules: [{
        "title": "Domain",
        "url": "https:\/\/wedevs.com\/dokan\/",
        "starter": {
          "type": "numeric",
          "value": '01'
        },
        "professional": {
          "type": "numeric",
          "value": '03'
        },
        "business": {
          "type": "numeric",
          "value": '05'
        },
        "enterprise": {
          "type": "numeric",
          "value": '20'
        }
      }, {
        "title": "Modules",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/",
        "starter": {
          "type": "numeric",
          "value": '01'
        },
        "professional": {
          "type": "numeric",
          "value": '08'
        },
        "business": {
          "type": "numeric",
          "value": '14'
        },
        "enterprise": {
          "type": "numeric",
          "value": '14'
        }
      }, {
        "title": "Color Scheme",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/color-scheme-customizer\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Vendor Review",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-vendor-review\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Store Support",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/store-support\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Auction",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/dokan-simple-auctions\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Ajax Live Search",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/ajax-live-search\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Stripe Connect",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/stripe-connect\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Subscriptions",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/subscription\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Single Product Multivendor",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/single-product-multivendor\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Seller Verification",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/seller-verification\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "WC Booking Integration",
        "url": "https:\/\/wedevs.com\/dokan\/extensions\/woocommerce-booking-integration\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Vendor Staff Manager",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-staff-manager\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Export Import",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/export-import\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Product Enquiry",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/product-enquiry\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Vendor Vacation",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/vendor-vacation\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Return and Warranty Request",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/rma\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Moip",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/moip\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Follow Store",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/follow-store\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Geolocation",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/geolocation\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Shipstation",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/shipstation\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }, {
        "title": "Wholesale",
        "url": "https:\/\/wedevs.com\/dokan\/modules\/wholesale\/",
        "starter": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "professional": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/unavailable@2x.png'
        },
        "business": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        },
        "enterprise": {
          "type": "icon",
          "value": dokan.urls.assetsUrl + '/images/premium/available@2x.png'
        }
      }],
      payment: {
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/payment-options.png',
        "guaranteeThumbnail": dokan.urls.assetsUrl + '/images/premium/gaurantee-thumb.png',
        "viewIcon": dokan.urls.assetsUrl + '/images/premium/view-icon@2x.png',
        "termsPolicyUrl": "https:\/\/wedevs.com\/refund-policy\/"
      },
      slickOptions: {
        //options can be used from the plugin documentation
        slidesToShow: 1,
        fade: true,
        speed: 500,
        cssEase: 'linear',
        autoplay: true,
        autoplaySpeed: 2000,
        infinite: true,
        accessibility: true,
        adaptiveHeight: false,
        arrows: false,
        dots: true,
        draggable: true,
        edgeFriction: 0.30,
        swipe: true
      },
      testimonials: [{
        "name": "Melissa McGovern",
        "designation": "Director, Hawk And PeddleProjects",
        "pic": dokan.urls.assetsUrl + '/images/premium/melissa.jpg',
        "content": "We're still a new business and are continuing to build our platform. Dokan has halved the time it would take us to build our ecommerce platform by being feature rich and easy to install and configure."
      }, {
        "name": "Morten J. Christensen",
        "designation": "Owner, Dincatering",
        "pic": dokan.urls.assetsUrl + '/images/premium/Morten-J.-Christensen.jpg',
        "content": "First and foremost it enables the possibility for actually creating the kind of marketplace i wanted. The plugin lets me create a local marketplace for local danish catering suppliers to showcase and sell their offers of the season."
      }, {
        "name": "Cédric Lefrancq",
        "designation": "Webmaster, Unwebmaster.Be",
        "pic": dokan.urls.assetsUrl + '/images/premium/cedric-lefrancq.jpeg',
        "content": "The support is very good. The plugin is perfect. Bugs are fixed very quickly. That’s a very good plugin."
      }, {
        "name": "David Gaz",
        "designation": "Founder, The Bureau Of Small Projects",
        "pic": dokan.urls.assetsUrl + '/images/premium/david-gaz.jpeg',
        "content": "It’s hands down an amazing plugin. But their support is even more amazing. They got back to me within hours on the weekend."
      }],
      cta: {
        "styles": {
          "bgPattern": dokan.urls.assetsUrl + '/images/premium/cta-pattern@2x.png'
        },
        "thumbnail": dokan.urls.assetsUrl + '/images/premium/cta-dokan-logo.png',
        "url": dokan.urls.buynowpro
      }
    };
  },
  methods: {
    next: function next() {
      this.$refs.slick.next();
    },
    prev: function prev() {
      this.$refs.slick.prev();
    },
    reInit: function reInit() {
      var _this = this;

      // Helpful if you have to deal with v-for to update dynamic lists
      this.$nextTick(function () {
        _this.$refs.slick.reSlick();
      });
    }
  },
  computed: {
    bannerBg: function bannerBg() {
      return {
        backgroundImage: "url(".concat(dokan.urls.assetsUrl, "/images/dokan-vendor-capabilities-banner-bg.svg)")
      };
    },
    bannerImage: function bannerImage() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-settings-banner.svg");
    }
  }
});

/***/ }),
/* 58 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProCta_vue__ = __webpack_require__(59);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1ccc06d3_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProCta_vue__ = __webpack_require__(143);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(142)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProCta_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1ccc06d3_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProCta_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/ProCta.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1ccc06d3", Component.options)
  } else {
    hotAPI.reload("data-v-1ccc06d3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 59 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'ProCta',
  data: function data() {
    return {
      "styles": {
        "bgPattern": dokan.urls.assetsUrl + '/images/premium/cta-pattern@2x.png'
      },
      "thumbnail": dokan.urls.assetsUrl + '/images/premium/cta-dokan-logo.png',
      "url": dokan.urls.upgradeToPro
    };
  }
});

/***/ }),
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var Postbox = dokan_get_lib('Postbox');
var Loading = dokan_get_lib('Loading');
var AdminNotice = dokan_get_lib('AdminNotice');

/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Help',
  components: {
    Postbox: Postbox,
    Loading: Loading,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      docs: null,
      hasPro: dokan.hasPro ? true : false
    };
  },
  created: function created() {
    this.fetch();
  },
  methods: {
    fetch: function fetch() {
      var _this = this;

      dokan.api.get('/admin/help').done(function (response) {
        _this.docs = response;
      });
    }
  }
});

/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var Loading = dokan_get_lib('Loading');
var AdminNotice = dokan_get_lib('AdminNotice');


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'ChangeLog',
  components: {
    Loading: Loading,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      active_package: 'lite',
      current_version: 'lite-0',
      scrollPosition: null,
      openVersions: [],
      activeVersionBorder: '',
      lite_versions: null,
      pro_versions: null,
      loading: false,
      hasPro: dokan.hasPro ? true : false
    };
  },
  methods: {
    formatReleaseDate: function formatReleaseDate(date) {
      return __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.datepicker.formatDate(dokan_get_i18n_date_format(), new Date(date));
    },
    badgeClass: function badgeClass(key) {
      switch (key) {
        case 'New':
        case 'New Module':
        case 'New Feature':
          return 'badge-green';

        case 'Fix':
          return 'badge-red';

        default:
          return 'badge-blue';
      }
    },
    getDokanLiteChangeLog: function getDokanLiteChangeLog() {
      var _this = this;

      this.loading = true;
      dokan.api.get('/admin/changelog/lite').done(function (response) {
        _this.lite_versions = JSON.parse(response);
        _this.loading = false;
      }).fail(function (response) {
        _this.loading = false;

        _this.$notify({
          type: 'error',
          title: _this.__('Error', 'dokan-lite'),
          text: _this.__('Something went wrong', 'dokan-lite')
        });
      });
    },
    getDokanProChangeLog: function getDokanProChangeLog() {
      var _this2 = this;

      this.loading = true;
      dokan.api.get('/admin/changelog/pro').done(function (response) {
        _this2.pro_versions = JSON.parse(response);
        _this2.loading = false;
      }).fail(function (response) {
        _this2.loading = false;

        _this2.$notify({
          type: 'error',
          title: _this2.__('Error', 'dokan-lite'),
          text: _this2.__('Something went wrong', 'dokan-lite')
        });
      });
    },
    dismissWhatsNewNotice: function dismissWhatsNewNotice() {
      var action = 'pro' === this.active_package ? 'dokan-pro-whats-new-notice' : 'dokan-whats-new-notice';
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.ajax({
        url: dokan.ajaxurl,
        method: 'post',
        dataType: 'json',
        data: {
          action: action,
          nonce: dokan.nonce,
          dokan_promotion_dismissed: true
        }
      });
    },
    toggleReading: function toggleReading(index) {
      if (this.isOpenVersion(index)) {
        return this.openVersions.splice(this.openVersions.indexOf(index), 1);
      }

      return this.openVersions.push(index);
    },
    isOpenVersion: function isOpenVersion(index) {
      return this.openVersions.includes(index);
    },
    switchPackage: function switchPackage(pack) {
      this.active_package = pack;

      if (null === this.pro_versions && 'pro' === pack) {
        this.getDokanProChangeLog();
      }

      if (null === this.lite_versions && 'lite' === pack) {
        this.getDokanLiteChangeLog();
      }

      if (dokan.hasNewVersion) {
        this.dismissWhatsNewNotice();
      }
    },
    isActivePackage: function isActivePackage(pack) {
      return this.active_package === pack;
    },
    addBorder: function addBorder() {
      var _this3 = this;

      var timeout;
      clearTimeout(timeout);
      this.activeVersionBorder = 'border: 1px solid #2271b1';
      timeout = setTimeout(function () {
        _this3.activeVersionBorder = '';
      }, 3000);
    },
    jumpVersion: function jumpVersion(id) {
      this.current_version = id;
      this.goToPosition(id);
      this.addBorder();
    },
    isCurrentVersion: function isCurrentVersion(index) {
      return this.current_version === index;
    },
    updatePosition: function updatePosition() {
      this.scrollPosition = window.scrollY;
    },
    scrollTop: function scrollTop() {
      this.goToPosition('change-log');
    },
    goToPosition: function goToPosition(id) {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').animate({
        scrollTop: __WEBPACK_IMPORTED_MODULE_0_jquery___default()("#".concat(id)).offset().top - 50
      }, 500);
    },
    loadChangelogData: function loadChangelogData() {
      if ('dokan-pro' === this.$route.query.plugin) {
        this.switchPackage('pro');
      } else {
        this.switchPackage('lite');
      }
    }
  },
  watch: {
    '$route.query.plugin': function $routeQueryPlugin() {
      this.loadChangelogData();
    }
  },
  created: function created() {
    this.loadChangelogData();
    window.addEventListener('scroll', this.updatePosition);
  },
  destroyed: function destroyed() {
    window.removeEventListener('scroll', this.updatePosition);
  }
});

/***/ }),
/* 62 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_components_Fields_vue__ = __webpack_require__(159);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_admin_components_SettingsBanner_vue__ = __webpack_require__(190);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var Loading = dokan_get_lib('Loading');
var AdminNotice = dokan_get_lib('AdminNotice');



/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Settings',
  components: {
    Fields: __WEBPACK_IMPORTED_MODULE_3_admin_components_Fields_vue__["a" /* default */],
    Loading: Loading,
    SettingsBanner: __WEBPACK_IMPORTED_MODULE_4_admin_components_SettingsBanner_vue__["a" /* default */],
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_5_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      isSaved: false,
      showLoading: false,
      isUpdated: false,
      isLoaded: false,
      message: '',
      currentTab: null,
      settingSections: [],
      settingFields: {},
      settingValues: {},
      requiredFields: [],
      errors: [],
      validationErrors: [],
      hasPro: dokan.hasPro ? true : false,
      searchText: '',
      awaitingSearch: false,
      withdrawMethods: {},
      disbursementSchedule: {},
      isSaveConfirm: false,
      dokanAssetsUrl: dokan.urls.assetsUrl
    };
  },
  computed: {
    refreshable_props: function refreshable_props() {
      var props = {};
      var sectionId;

      for (sectionId in this.settingFields) {
        var sectionFields = this.settingFields[sectionId];
        var optionId = void 0;

        for (optionId in sectionFields) {
          if (sectionFields[optionId].refresh_after_save) {
            props["".concat(sectionId, ".").concat(optionId)] = true;
          }
        }
      }

      return props;
    }
  },
  methods: {
    changeTab: function changeTab(section) {
      var activetab = '';
      this.currentTab = section.id;
      this.requiredFields = [];
      this.$refs.settingsWrapper.scrollIntoView({
        behavior: 'smooth'
      });

      if (typeof localStorage != 'undefined') {
        localStorage.setItem("activetab", this.currentTab);
      }
    },
    fetchSettingValues: function fetchSettingValues() {
      var self = this,
          data = {
        action: 'dokan_get_setting_values',
        nonce: dokan.nonce
      };
      self.showLoading = true;
      jQuery.post(dokan.ajaxurl, data, function (resp) {
        if (resp.success) {
          Object.keys(self.settingFields).forEach(function (section, index) {
            Object.keys(self.settingFields[section]).forEach(function (field, i) {
              if (!self.settingValues[section]) {
                self.settingValues[section] = {};
              }

              if (typeof resp.data[section][field] === 'undefined') {
                if (typeof self.settingFields[section][field].default === 'undefined') {
                  self.settingValues[section][field] = '';
                } else {
                  self.settingValues[section][field] = self.settingFields[section][field].default;
                }
              } else {
                self.settingValues[section] = resp.data[section];
              }
            });
          });
          self.settingValues = jQuery.extend({}, self.settingValues);
          self.showLoading = false;
          self.isLoaded = true;
          self.setWithdrawMethods();
          self.setWithdrawDisbursementSchedule();
        }
      });
    },
    showMedia: function showMedia(data, $event) {
      var self = this;
      var file_frame = wp.media.frames.file_frame = wp.media({
        title: this.__('Choose your file', 'dokan-lite'),
        button: {
          text: this.__('Select', 'dokan-lite')
        },
        multiple: false
      });
      file_frame.on('select', function () {
        var attachment = file_frame.state().get('selection').first().toJSON();
        self.settingValues[data.sectionId][data.name] = attachment.url;
      });
      file_frame.open();
    },
    saveSettings: function saveSettings(fieldData, section) {
      var _this = this;

      return __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.mark(function _callee() {
        var consent, consentOfScheduleChange, self, data;
        return __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (_this.formIsValid(section)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return");

              case 2:
                if (!('dokan_withdraw' === section)) {
                  _context.next = 15;
                  break;
                }

                _context.next = 5;
                return _this.setPaymentChangeAnnouncementAction(fieldData, section);

              case 5:
                consent = _context.sent;
                fieldData.send_announcement_for_payment_change = false;

                if ('value' in consent && consent.value === true) {
                  fieldData.send_announcement_for_payment_change = _this.getDifference(_this.withdrawMethods, fieldData.withdraw_methods);
                }

                _this.withdrawMethods = fieldData.withdraw_methods; // Disbursement Schedule Option Change.

                _context.next = 11;
                return _this.setDisbursementScheduleChangeAnnouncementAction(fieldData, section);

              case 11:
                consentOfScheduleChange = _context.sent;
                fieldData.send_announcement_for_disbursement_schedule_change = false;

                if ('value' in consentOfScheduleChange && consentOfScheduleChange.value === true) {
                  fieldData.send_announcement_for_disbursement_schedule_change = _this.getDifference(_this.disbursementSchedule, fieldData.disbursement_schedule);
                }

                _this.disbursementSchedule = fieldData.disbursement_schedule;

              case 15:
                self = _this, data = {
                  action: 'dokan_save_settings',
                  nonce: dokan.nonce,
                  settingsData: fieldData,
                  section: section
                };
                self.showLoading = true;
                jQuery.post(dokan.ajaxurl, data).done(function (response) {
                  var settings = response.data.settings;
                  self.isSaved = true;
                  self.isUpdated = true;
                  self.message = response.data.message;
                  self.settingValues[settings.name] = settings.value;
                  var option;

                  for (option in fieldData) {
                    var fieldName = "".concat(section, ".").concat(option);

                    if (self.refreshable_props[fieldName]) {
                      window.location.reload();
                      break;
                    }
                  }

                  self.validationErrors = [];
                }).fail(function (jqXHR) {
                  self.validationErrors = jqXHR.responseJSON.data.errors;
                }).always(function () {
                  self.showLoading = false;
                });

                _this.$refs.settingsWrapper.scrollIntoView({
                  behavior: 'smooth'
                });

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    setWithdrawMethods: function setWithdrawMethods() {
      if ('withdraw_methods' in this.settingValues.dokan_withdraw) {
        this.withdrawMethods = _objectSpread({}, this.settingValues.dokan_withdraw.withdraw_methods);
      }
    },
    setWithdrawDisbursementSchedule: function setWithdrawDisbursementSchedule() {
      if ('disbursement_schedule' in this.settingValues.dokan_withdraw) {
        this.disbursementSchedule = _objectSpread({}, this.settingValues.dokan_withdraw.disbursement_schedule);
      }
    },
    setPaymentChangeAnnouncementAction: function setPaymentChangeAnnouncementAction(fieldData, section) {
      var _this2 = this;

      return __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.mark(function _callee2() {
        var diff;
        return __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(!('withdraw_methods' in fieldData) || 'dokan_withdraw' !== section)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", Promise.resolve({
                  value: false
                }));

              case 2:
                diff = _this2.getDifference(_this2.withdrawMethods, fieldData.withdraw_methods);

                if (!(Object.keys(diff).length === 0)) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt("return", Promise.resolve({
                  value: false
                }));

              case 5:
                return _context2.abrupt("return", Swal.fire({
                  title: _this2.__('Withdraw Method Changed', 'dokan-lite'),
                  text: _this2.__('Do you want to send an announcement to vendors about the removal of currently active payment method?', 'dokan-lite'),
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: _this2.__('Save & send announcement', 'dokan-lite'),
                  cancelButtonText: _this2.__('Save only', 'dokan-lite'),
                  allowOutsideClick: false,
                  allowEscapeKey: false
                }));

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }))();
    },
    setDisbursementScheduleChangeAnnouncementAction: function setDisbursementScheduleChangeAnnouncementAction(fieldData, section) {
      var _this3 = this;

      return __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.mark(function _callee3() {
        var diff;
        return __WEBPACK_IMPORTED_MODULE_2__babel_runtime_regenerator___default.a.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (!(!('disbursement_schedule' in fieldData) || 'dokan_withdraw' !== section)) {
                  _context3.next = 2;
                  break;
                }

                return _context3.abrupt("return", Promise.resolve({
                  value: false
                }));

              case 2:
                diff = _this3.getDifference(_this3.disbursementSchedule, fieldData.disbursement_schedule);

                if (!(Object.keys(diff).length === 0)) {
                  _context3.next = 5;
                  break;
                }

                return _context3.abrupt("return", Promise.resolve({
                  value: false
                }));

              case 5:
                return _context3.abrupt("return", Swal.fire({
                  title: _this3.__('Disbursement Schedule Updated', 'dokan-lite'),
                  text: _this3.__('Do you want to inform your vendors about the removal of the previous disbursement schedule by sending them an announcement?', 'dokan-lite'),
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: _this3.__('Save and Send Announcement', 'dokan-lite'),
                  cancelButtonText: _this3.__('Save Only', 'dokan-lite'),
                  allowOutsideClick: false,
                  allowEscapeKey: false
                }));

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }))();
    },
    getDifference: function getDifference(objA, objB) {
      var keys = Object.keys(objB);
      var difference = {};
      keys.forEach(function (key) {
        if ('' !== objA[key] && '' === objB[key]) {
          difference[key] = key;
        }
      });
      return difference;
    },
    formIsValid: function formIsValid(section) {
      var _this4 = this;

      var allFields = Object.keys(this.settingFields);
      var requiredFields = this.requiredFields;

      if (!allFields) {
        return false;
      }

      allFields.forEach(function (fields, index) {
        if (section === fields) {
          var sectionFields = _this4.settingFields[fields];
          Object.values(sectionFields).forEach(function (field) {
            var subFields = field.fields;

            if (subFields) {
              Object.values(subFields).forEach(function (subField) {
                if (subField && subField.required && subField.required === 'yes' && !requiredFields.includes(subField.name)) {
                  requiredFields.push(subField.name);
                }
              });
            }

            if (field && field.required && field.required === 'yes') {
              if (!requiredFields.includes(field.name)) {
                requiredFields.push(field.name);
              }
            }
          });
        }
      }); // empty the errors array on new form submit

      this.errors = [];
      requiredFields.forEach(function (field) {
        Object.values(_this4.settingValues).forEach(function (value) {
          if (field in value && value[field].length < 1) {
            if (!_this4.errors.includes(field)) {
              _this4.errors.push(field); // If flat or percentage commission is set. Remove the required field.


              if ('flat' === value['commission_type'] || 'percentage' === value['commission_type']) {
                _this4.errors = _this4.arrayRemove(_this4.errors, 'admin_percentage');
                _this4.errors = _this4.arrayRemove(_this4.errors, 'additional_fee');
              }
            }
          }
        });
      });

      if (this.errors.length < 1) {
        return true;
      }

      return false;
    },
    arrayRemove: function arrayRemove(array, value) {
      return array.filter(function (element) {
        return element !== value;
      });
    },
    toggleLoadingState: function toggleLoadingState() {
      this.showLoading = !this.showLoading;
    },
    clearSearch: function clearSearch() {
      this.searchText = '';
      this.validateBlankSearch();
    },
    validateBlankSearch: function validateBlankSearch() {
      var searchText = this.searchText.toLowerCase();

      if ('' === searchText) {
        this.settingSections = dokan.settings_sections;
        this.settingFields = dokan.settings_fields;
        return false;
      }

      return true;
    },
    searchInSettings: function searchInSettings(input) {
      var _this5 = this;

      if (!this.validateBlankSearch()) {
        return;
      }

      if (!this.awaitingSearch) {
        setTimeout(function () {
          var searchText = _this5.$refs.searchInSettings.value; // If more than two (space/tab) found, replace with space > trim > lowercase.

          searchText = searchText.replace(/\s\s+/g, ' ').trim().toLowerCase(); // Create an empty string search first to resolve all previous-state issues.

          _this5.doSearch(''); // Search now with searchText.


          _this5.doSearch(searchText);

          _this5.awaitingSearch = false;
        }, 1000);
      }

      this.awaitingSearch = true;
    },
    doSearch: function doSearch(searchText) {
      var _this6 = this;

      var self = this;
      var settingFields = {};
      var filteredSettingSections = [];
      var settingSections = [];
      var dokanSettingFields = dokan.settings_fields;
      var dokanSettingSections = dokan.settings_sections;
      Object.keys(dokanSettingFields).forEach(function (section, index) {
        Object.keys(dokanSettingFields[section]).forEach(function (field) {
          var label = ''; // Append section field label and description.

          if ('sub_section' !== dokanSettingFields[section][field].type) {
            label += " ".concat(dokanSettingFields[section][field]['label'], " ").concat(dokanSettingFields[section][field]['desc']);
          } // Append section label and description.


          Object.keys(dokanSettingSections).forEach(function (foundSectionIndex) {
            var foundSection = dokanSettingSections[foundSectionIndex];

            if ((foundSection === null || foundSection === void 0 ? void 0 : foundSection.id) === section) {
              label += " ".concat(foundSection.title, " ").concat(foundSection.description, " ").concat(foundSection.settings_description);
            }
          }); // Make the label lowercase, as `searchText` is also like that.

          label = label.toLocaleLowerCase();

          if (label && label.includes(searchText)) {
            if (!settingFields[section]) {
              settingFields[section] = {};
            }

            settingFields[section][field] = dokanSettingFields[section][field];

            if (filteredSettingSections.indexOf(section) === -1) {
              filteredSettingSections.push(section);
            }
          }
        });
      });
      var currentTab = 0;
      Object.keys(dokan.settings_sections).forEach(function (section) {
        if (filteredSettingSections.indexOf(dokan.settings_sections[section].id) !== -1) {
          if (!currentTab) {
            _this6.changeTab(dokan.settings_sections[section]);

            currentTab = 1;
          }

          settingSections.push(dokan.settings_sections[section]);
        }
      });
      self.settingFields = settingFields;
      self.settingSections = settingSections;
      this.$root.$emit('reinitWpTextEditor');
    },
    scrollToTop: function scrollToTop() {
      this.$refs.settingsWrapper.scrollIntoView({
        behavior: 'smooth'
      });
    },
    handleScroll: function handleScroll() {
      if (this.$route.name === 'Settings' && this.$refs.backToTop) {
        this.$refs.backToTop.style.transform = window.scrollY > document.body.scrollHeight - 800 ? 'scale(1)' : 'scale(0)';
      }
    }
  },
  created: function created() {
    var _this7 = this;

    this.fetchSettingValues();
    this.currentTab = 'dokan_general';

    if (typeof localStorage !== 'undefined') {
      this.currentTab = localStorage.getItem("activetab") ? localStorage.getItem("activetab") : 'dokan_general';
    }

    this.$root.$on('onFieldSwitched', function (value, fieldName) {
      if ('on' === value && 'dokan_general' in _this7.settingValues && 'data_clear_on_uninstall' === fieldName) {
        Swal.fire({
          icon: 'warning',
          html: _this7.__('All data and tables related to Dokan and Dokan Pro will be deleted permanently after deleting the Dokan plugin. You will not be able to recover your lost data unless you keep a backup. Do you want to continue?', 'dokan-lite'),
          title: _this7.__('Are you sure?', 'dokan-lite'),
          showCancelButton: true,
          cancelButtonText: _this7.__('Cancel', 'dokan-lite'),
          confirmButtonText: _this7.__('Okay', 'dokan-lite')
        }).then(function (response) {
          if (response.dismiss) {
            _this7.settingValues.dokan_general.data_clear_on_uninstall = 'off';

            _this7.$emit('switcHandler', 'data_clear_on_uninstall', _this7.settingValues.dokan_general.data_clear_on_uninstall);
          }
        });
      }
    });
    this.settingSections = dokan.settings_sections;
    this.settingFields = dokan.settings_fields;
    window.addEventListener('scroll', this.handleScroll);
  }
});

/***/ }),
/* 63 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray__ = __webpack_require__(161);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_components_ColorPicker_vue__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_components_Switches_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__SocialFields_vue__ = __webpack_require__(185);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__FieldHeading_vue__ = __webpack_require__(187);



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//




var Mapbox = dokan_get_lib('Mapbox');
var TextEditor = dokan_get_lib('TextEditor');
var GoogleMaps = dokan_get_lib('GoogleMaps');
var RefreshSettingOptions = dokan_get_lib('RefreshSettingOptions');
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Fields',
  components: {
    Mapbox: Mapbox,
    Switches: __WEBPACK_IMPORTED_MODULE_3_admin_components_Switches_vue__["a" /* default */],
    TextEditor: TextEditor,
    GoogleMaps: GoogleMaps,
    colorPicker: __WEBPACK_IMPORTED_MODULE_2_admin_components_ColorPicker_vue__["a" /* default */],
    FieldHeading: __WEBPACK_IMPORTED_MODULE_5__FieldHeading_vue__["a" /* default */],
    SocialFields: __WEBPACK_IMPORTED_MODULE_4__SocialFields_vue__["a" /* default */],
    RefreshSettingOptions: RefreshSettingOptions
  },
  props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState', 'validationErrors', 'dokanAssetsUrl'],
  data: function data() {
    return {
      hideMap: false,
      checked: this.isChecked(),
      expandSocials: false,
      repeatableItem: {},
      repeatableTime: [],
      singleColorPicker: {
        default: this.fieldData.default,
        label: '',
        show_pallete: false
      },
      yourStringTimeValue: '',
      customFieldComponents: dokan.hooks.applyFilters('getDokanCustomFieldComponents', [])
    };
  },
  created: function created() {
    var _this = this;

    this.$root.$on('hasError', function (key) {
      _this.hasValidationError(key);
    });
    this.$root.$on('getError', function (key) {
      _this.getValidationErrorMessage(key);
    });
    this.$parent.$on('switcHandler', function (fieldKey, value) {
      if (_this.fieldData.name === fieldKey) {
        _this.checked = value;
      }
    });
  },
  computed: {
    shouldShow: function shouldShow(e) {
      var shouldShow = true;

      if (this.fieldData.show_if) {
        var conditions = this.fieldData.show_if;
        var dependencies = Object.keys(conditions);
        var i = 0;

        for (i = 0; i < dependencies.length; i++) {
          var dependency = dependencies[i];

          var _dependency$split$rev = dependency.split('.').reverse(),
              _dependency$split$rev2 = __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray___default()(_dependency$split$rev, 2),
              optionId = _dependency$split$rev2[0],
              _dependency$split$rev3 = _dependency$split$rev2[1],
              sectionId = _dependency$split$rev3 === void 0 ? this.sectionId : _dependency$split$rev3;

          var dependencyValue = this.allSettingsValues[sectionId][optionId];

          var _$chain$pairs$first$v = _.chain(conditions[dependency]).pairs().first().value(),
              _$chain$pairs$first$v2 = __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray___default()(_$chain$pairs$first$v, 2),
              operator = _$chain$pairs$first$v2[0],
              value = _$chain$pairs$first$v2[1];

          switch (operator) {
            case 'greater_than':
              if (!(dependencyValue > value)) {
                shouldShow = false;
              }

              break;

            case 'greater_than_equal':
              if (!(dependencyValue >= value)) {
                shouldShow = false;
              }

              break;

            case 'less_than':
              if (!(dependencyValue < value)) {
                shouldShow = false;
              }

              break;

            case 'less_than':
              if (!(dependencyValue <= value)) {
                shouldShow = false;
              }

              break;

            case 'contains':
              if (!Object.values(dependencyValue).includes(value)) {
                shouldShow = false;
              }

              break;

            case 'equal':
            default:
              if (dependencyValue !== value) {
                shouldShow = false;
              }

              break;
          }

          if (!shouldShow) {
            break;
          }
        }
      }

      return shouldShow;
    },
    mapApiSource: function mapApiSource() {
      var _this$allSettingsValu, _this$allSettingsValu2;

      return (_this$allSettingsValu = this.allSettingsValues) === null || _this$allSettingsValu === void 0 ? void 0 : (_this$allSettingsValu2 = _this$allSettingsValu.dokan_appearance) === null || _this$allSettingsValu2 === void 0 ? void 0 : _this$allSettingsValu2.map_api_source;
    },
    mapLocation: function mapLocation() {
      var location = _objectSpread(_objectSpread({}, {
        latitude: 23.709921,
        longitude: 90.40714300000002,
        address: 'Dhaka',
        zoom: 10
      }), this.fieldValue[this.fieldData.name]);

      location = {
        zoom: parseInt(location.zoom),
        address: "".concat(location.address),
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude)
      };
      return location;
    },
    googleMapApiKey: function googleMapApiKey() {
      var _this$allSettingsValu3, _this$allSettingsValu4;

      return (_this$allSettingsValu3 = this.allSettingsValues) === null || _this$allSettingsValu3 === void 0 ? void 0 : (_this$allSettingsValu4 = _this$allSettingsValu3.dokan_appearance) === null || _this$allSettingsValu4 === void 0 ? void 0 : _this$allSettingsValu4.gmap_api_key;
    },
    mapboxAccessToken: function mapboxAccessToken() {
      var _this$allSettingsValu5, _this$allSettingsValu6;

      return (_this$allSettingsValu5 = this.allSettingsValues) === null || _this$allSettingsValu5 === void 0 ? void 0 : (_this$allSettingsValu6 = _this$allSettingsValu5.dokan_appearance) === null || _this$allSettingsValu6 === void 0 ? void 0 : _this$allSettingsValu6.mapbox_access_token;
    }
  },
  beforeMount: function beforeMount() {
    if ('multicheck' === this.fieldData.type && !this.fieldValue[this.fieldData.name]) {
      this.fieldValue[this.fieldData.name] = this.fieldData.default;
    }
  },
  methods: {
    containCommonFields: function containCommonFields(type) {
      return _.contains([undefined, 'text', 'email', 'url', 'phone', 'time'], type);
    },
    setCheckedValue: function setCheckedValue(checked, value) {
      this.fieldValue[this.fieldData.name][value] = checked ? value : '';
    },
    addItem: function addItem(type, name) {
      this.fieldValue[name] = this.fieldValue[name] || [];

      if (typeof this.repeatableItem[name] == 'undefined' || !this.repeatableItem[name]) {
        return;
      }

      this.fieldValue[name].push({
        id: this.repeatableItem[name].trim().replace(/\s+/g, '_').toLowerCase(),
        value: this.repeatableItem[name]
      });
      this.repeatableItem[name] = '';
    },
    removeItem: function removeItem(optionVal, name) {
      this.fieldValue[name].splice(optionVal, 1);
    },
    haveCondition: function haveCondition(fieldData) {
      return fieldData.hasOwnProperty('condition');
    },
    checkConditionLogic: function checkConditionLogic(fieldData, fieldValue) {
      var logic = fieldData.condition.logic;
      var isValid = false;

      _.each(logic, function (value, key) {
        if (_.contains(value, fieldValue[key])) {
          isValid = true;
        }
      });

      return isValid;
    },
    onHideMap: function onHideMap(hideMap) {
      this.hideMap = hideMap;
    },
    onUpdateMap: function onUpdateMap(payload) {
      this.fieldValue[this.fieldData.name] = _objectSpread(_objectSpread({}, this.mapLocation), payload);
    },
    isSocialChecked: function isSocialChecked() {
      return !this.fieldValue[this.fieldData.name] ? this.fieldData.default : this.fieldValue[this.fieldData.name];
    },
    thisSomeEvent: function thisSomeEvent(value) {
      console.log('hello priting...', value);
    },
    isSwitchOptionChecked: function isSwitchOptionChecked(optionKey) {
      if ('multicheck' === this.fieldData.type) {
        return this.fieldValue[this.fieldData.name] && this.fieldValue[this.fieldData.name][optionKey] === optionKey;
      } else if ('radio' === this.fieldData.type) {
        return this.fieldValue[this.fieldData.name] && this.fieldValue[this.fieldData.name] === optionKey;
      }

      return false;
    },
    expandSocial: function expandSocial() {
      this.expandSocials = !this.expandSocials;
    },
    getSocialValue: function getSocialValue(optionValue) {
      this.fieldValue[optionValue.name] = this.fieldValue[optionValue.name] ? this.fieldValue[optionValue.name] : '';
    },
    isChecked: function isChecked() {
      return !this.fieldValue[this.fieldData.name] ? this.fieldData.default : this.fieldValue[this.fieldData.name];
    },
    onToggleSwitch: function onToggleSwitch(status, key) {
      if ('isChecked' !== key) {
        return;
      }

      this.checked = status ? 'on' : 'off';
      this.fieldValue[this.fieldData.name] = status ? 'on' : 'off';
      this.$root.$emit('onFieldSwitched', this.fieldValue[this.fieldData.name], this.fieldData.name);
    },
    hasError: function hasError(key) {
      var errors = this.errors;

      if (!errors || typeof errors === 'undefined') {
        return false;
      }

      if (errors.length < 1) {
        return false;
      }

      if (errors.includes(key)) {
        return key;
      }
    },
    getError: function getError(label) {
      return label + ' ' + this.__('is required.', 'dokan-lite');
    },
    hasValidationError: function hasValidationError(key) {
      if (this.validationErrors.filter(function (e) {
        return e.name === key;
      }).length > 0) {
        return key;
      }
    },
    getValidationErrorMessage: function getValidationErrorMessage(key) {
      var errorMessage = '';
      this.validationErrors.forEach(function (obj) {
        if (obj.name === key) {
          errorMessage = obj.error;
        }
      });
      return errorMessage;
    },
    toggleColorPicker: function toggleColorPicker(data) {
      if (this.fieldData.name === data.key) {
        this.singleColorPicker.show_pallete = !data.values.show_pallete;
      } else {
        this.singleColorPicker.show_pallete = false;
      }
    },
    setCustomColor: function setCustomColor(value, key) {
      if (!key) {
        return;
      }

      this.fieldData[key] = value;
    }
  }
});

/***/ }),
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  props: {
    fieldData: {
      type: Object,
      required: true
    },
    fieldValue: {
      type: Object,
      required: true
    }
  },
  methods: {
    isSocialOptionChecked: function isSocialOptionChecked(optionKey) {
      if ('radio' === this.fieldData.type) {
        return this.fieldValue[this.fieldData.name] === optionKey ? true : false;
      }

      return false;
    }
  }
});

/***/ }),
/* 75 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'FieldHeading',
  props: ['fieldData']
});

/***/ }),
/* 76 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: "SettingsBanner",
  data: function data() {
    return {
      upgradeURL: dokan.urls.upgradeToPro
    };
  },
  computed: {
    bannerImage: function bannerImage() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-settings-banner.svg");
    }
  }
});

/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AddVendor_vue__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(4);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var ListTable = dokan_get_lib('ListTable');
var Switches = dokan_get_lib('Switches');
var Search = dokan_get_lib('Search');
var AdminNotice = dokan_get_lib('AdminNotice');
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Vendors',
  components: {
    ListTable: ListTable,
    Switches: Switches,
    Search: Search,
    AddVendor: __WEBPACK_IMPORTED_MODULE_0__AddVendor_vue__["a" /* default */],
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */],
    AdminNotice: AdminNotice
  },
  data: function data() {
    return {
      showCb: true,
      hasPro: dokan.hasPro,
      counts: {
        pending: 0,
        approved: 0,
        all: 0
      },
      vendorId: 0,
      totalItems: 0,
      perPage: 20,
      totalPages: 1,
      loading: false,
      columns: {
        'store_name': {
          label: this.__('Store', 'dokan-lite'),
          sortable: true
        },
        'email': {
          label: this.__('E-mail', 'dokan-lite')
        },
        'phone': {
          label: this.__('Phone', 'dokan-lite')
        },
        'registered': {
          label: this.__('Registered', 'dokan-lite'),
          sortable: true
        },
        'enabled': {
          label: this.__('Status', 'dokan-lite')
        }
      },
      actionColumn: 'title',
      actions: [{
        key: 'edit',
        label: this.__('Edit', 'dokan-lite')
      }, {
        key: 'products',
        label: this.__('Products', 'dokan-lite')
      }, {
        key: 'orders',
        label: this.__('Orders', 'dokan-lite')
      }],
      bulkActions: [{
        key: 'approved',
        label: this.__('Approve Vendors', 'dokan-lite')
      }, {
        key: 'pending',
        label: this.__('Disable Selling', 'dokan-lite')
      }],
      vendors: [],
      loadAddVendor: false,
      dokanVendorHeaderArea: dokan.hooks.applyFilters('getDokanVendorHeaderArea', []),
      isVendorSwitchingEnabled: false,
      dokanVendorFilterSectionStart: dokan.hooks.applyFilters('dokanVendorFilterSectionStart', [])
    };
  },
  watch: {
    '$route.query.status': function $routeQueryStatus() {
      this.fetchVendors();
    },
    '$route.query.page': function $routeQueryPage() {
      this.fetchVendors();
    },
    '$route.query.orderby': function $routeQueryOrderby() {
      this.fetchVendors();
    },
    '$route.query.order': function $routeQueryOrder() {
      this.fetchVendors();
    }
  },
  computed: {
    currentStatus: function currentStatus() {
      return this.$route.query.status || 'all';
    },
    currentPage: function currentPage() {
      var page = this.$route.query.page || 1;
      return parseInt(page);
    },
    sortBy: function sortBy() {
      return this.$route.query.orderby || 'ID';
    },
    sortOrder: function sortOrder() {
      return this.$route.query.order || 'desc';
    },
    storeCategory: function storeCategory() {
      return this.$route.query.store_categories || null;
    }
  },
  created: function created() {
    var _this = this;

    this.$root.$on('modalClosed', function () {
      _this.loadAddVendor = false;
      _this.vendorId = 0;
    });
    this.fetchVendors();
    this.$root.$on('vendorAdded', function (payload) {
      _this.vendors.unshift(payload);
    });
    this.$root.$on('addAnotherVendor', function () {
      _this.loadAddVendor = true;
    });
    this.$root.$on('categoryFetched', function (payload) {
      _this.categories = payload.categories;
      _this.isCategoryMultiple = payload.isCategoryMultiple;
      _this.columns = payload.columns;
    });
    this.isVendorSwitchingEnabled = dokan.is_vendor_switching_enabled ? true : false;

    if (this.isVendorSwitchingEnabled) {
      this.actions.push({
        key: 'switch_to',
        label: this.__('Switch To', 'dokan-lite')
      });
    }
  },
  methods: {
    addNew: function addNew() {
      this.loadAddVendor = true;
    },
    updateVendorComponent: function updateVendorComponent() {
      var rerender = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (rerender) {
        this.fetchVendors();
      }
    },
    doSearch: function doSearch(payload) {
      var _this2 = this;

      var self = this;
      self.loading = true;
      dokan.api.get("/stores", {
        search: payload,
        page: this.currentPage,
        orderby: this.sortBy,
        order: this.sortOrder
      }).done(function (response, status, xhr) {
        self.vendors = response;
        self.loading = false;

        _this2.updatedCounts(xhr);

        _this2.updatePagination(xhr);
      });
    },
    updatedCounts: function updatedCounts(xhr) {
      this.counts.pending = parseInt(xhr.getResponseHeader('X-Status-Pending'));
      this.counts.approved = parseInt(xhr.getResponseHeader('X-Status-Approved'));
      this.counts.all = parseInt(xhr.getResponseHeader('X-Status-All'));
    },
    updatePagination: function updatePagination(xhr) {
      this.totalPages = parseInt(xhr.getResponseHeader('X-WP-TotalPages'));
      this.totalItems = parseInt(xhr.getResponseHeader('X-WP-Total'));
    },
    fetchVendors: function fetchVendors() {
      var self = this;
      self.loading = true;
      var data = {
        per_page: self.perPage,
        page: self.currentPage,
        status: self.currentStatus,
        orderby: self.sortBy,
        order: self.sortOrder,
        store_categories: self.storeCategory
      };
      data = dokan.hooks.applyFilters('DokanGetVendorArgs', data, this.$route.query);
      dokan.api.get('/stores', data).done(function (response, status, xhr) {
        self.vendors = response;
        self.loading = false;
        self.updatedCounts(xhr);
        self.updatePagination(xhr);
      });
    },
    onActionClick: function onActionClick(action, row) {
      if ('trash' === action) {
        if (confirm('Are you sure to delete?')) {
          alert('deleted: ' + row.title);
        }
      }
    },
    onSwitch: function onSwitch(status, vendor_id) {
      var _this3 = this;

      var message = status === false ? this.__('The vendor has been disabled.', 'dokan-lite') : this.__('Selling has been enabled', 'dokan-lite');
      dokan.api.put('/stores/' + vendor_id + '/status', {
        status: status === false ? 'inactive' : 'active'
      }).done(function (response) {
        _this3.$notify({
          title: _this3.__('Success!', 'dokan-lite'),
          type: 'success',
          text: message
        });

        if ('all' === _this3.currentStatus || 'pending' === _this3.currentStatus || 'approved' === _this3.currentStatus) {
          _this3.fetchVendors();
        }
      });
    },
    moment: function (_moment) {
      function moment(_x) {
        return _moment.apply(this, arguments);
      }

      moment.toString = function () {
        return _moment.toString();
      };

      return moment;
    }(function (date) {
      return moment(date);
    }),
    goToPage: function goToPage(page) {
      this.$router.push({
        name: 'Vendors',
        query: {
          status: this.currentStatus,
          page: page
        }
      });
    },
    onBulkAction: function onBulkAction(action, items) {
      var _this4 = this;

      var jsonData = {};
      jsonData[action] = items;
      this.loading = true;
      dokan.api.put('/stores/batch', jsonData).done(function (response) {
        _this4.loading = false;

        _this4.fetchVendors();
      });
    },
    sortCallback: function sortCallback(column, order) {
      this.$router.push({
        name: 'Vendors',
        query: {
          status: this.currentStatus,
          page: 1,
          orderby: column,
          order: order
        }
      });
    },
    productUrl: function productUrl(id) {
      return dokan.urls.adminRoot + 'edit.php?post_type=product&author=' + id;
    },
    ordersUrl: function ordersUrl(id) {
      return dokan.urls.adminRoot + 'edit.php?post_type=shop_order&vendor_id=' + id;
    },
    editUrl: function editUrl(id) {
      return dokan.urls.adminRoot + 'user-edit.php?user_id=' + id;
    },
    switchToUrl: function switchToUrl(row) {
      return row.switch_url;
    }
  }
});

/***/ }),
/* 78 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__VendorAccountFields_vue__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__VendorAddressFields_vue__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__VendorPaymentFields_vue__ = __webpack_require__(42);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
var Modal = dokan_get_lib('Modal');
var Loading = dokan_get_lib('Loading');



/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'AddVendor',
  props: ['vendorId'],
  components: {
    Modal: Modal,
    Loading: Loading,
    VendorAccountFields: __WEBPACK_IMPORTED_MODULE_0__VendorAccountFields_vue__["a" /* default */],
    VendorAddressFields: __WEBPACK_IMPORTED_MODULE_1__VendorAddressFields_vue__["a" /* default */],
    VendorPaymentFields: __WEBPACK_IMPORTED_MODULE_2__VendorPaymentFields_vue__["a" /* default */]
  },
  data: function data() {
    return {
      isLoading: false,
      storeId: '',
      nextBtn: this.__('Next', 'dokan-lite'),
      title: this.__('Add New Vendor', 'dokan-lite'),
      tabs: {
        VendorAccountFields: {
          label: this.__('Account Info', 'dokan-lite'),
          name: 'VendorAccountFields',
          icon: 'dashicons dashicons-admin-users'
        },
        VendorAddressFields: {
          label: this.__('Address', 'dokan-lite'),
          name: 'VendorAddressFields',
          icon: 'dashicons dashicons-admin-home'
        },
        VendorPaymentFields: {
          label: this.__('Payment Options', 'dokan-lite'),
          name: 'VendorPaymentFields',
          icon: 'dashicons dashicons-money'
        }
      },
      currentTab: 'VendorAccountFields',
      store: {
        store_name: '',
        user_pass: '',
        store_url: '',
        user_login: '',
        email: '',
        user_nicename: '',
        notify_vendor: true,
        phone: '',
        banner: '',
        banner_id: '',
        gravatar: '',
        gravatar_id: '',
        social: {
          fb: '',
          youtube: '',
          twitter: '',
          linkedin: '',
          pinterest: '',
          instagram: ''
        },
        payment: {
          bank: {
            ac_name: '',
            ac_type: '',
            ac_number: '',
            bank_name: '',
            bank_addr: '',
            routing_number: '',
            iban: '',
            swift: ''
          },
          paypal: {
            email: ''
          }
        },
        address: {
          street_1: '',
          street_2: '',
          city: '',
          zip: '',
          state: '',
          country: ''
        }
      },
      requiredFields: ['store_name', 'user_login', 'email'],
      errors: [],
      storeAvailable: false,
      userNameAvailable: false,
      emailAvailable: false,
      hasPro: dokan.hasPro
    };
  },
  created: function created() {
    var _this = this;

    this.$root.$on('vendorInfoChecked', function (payload) {
      _this.storeAvailable = payload.storeAvailable;
      _this.userNameAvailable = payload.userNameAvailable;
      _this.emailAvailable = payload.emailAvailable;
    });
  },
  methods: {
    getId: function getId() {
      return this.$route.params.id;
    },
    showAlert: function showAlert($title, $des, $status) {
      Swal.fire($title, $des, $status);
    },
    createVendor: function createVendor() {
      var _this2 = this;

      if (!this.formIsValid()) {
        return;
      }

      if ('VendorPaymentFields' === this.currentTab) {
        this.isLoading = true;
        dokan.api.post('/stores/', this.store).done(function (response) {
          _this2.$root.$emit('vendorAdded', response);

          Swal.fire({
            icon: 'success',
            title: _this2.__('Vendor Created', 'dokan-lite'),
            text: _this2.__('A vendor has been created successfully!', 'dokan-lite'),
            showCloseButton: true,
            showCancelButton: true,
            confirmButtonText: _this2.__('Add Another', 'dokan-lite'),
            cancelButtonText: _this2.__('Edit Vendor', 'dokan-lite'),
            focusConfirm: false
          }).then(function (result) {
            if (result.value) {
              _this2.$root.$emit('addAnotherVendor');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              if (_this2.hasPro) {
                _this2.$router.push({
                  path: 'vendors/' + response.id,
                  query: {
                    edit: 'true'
                  }
                });
              } else {
                window.location.replace("".concat(dokan.urls.adminRoot, "user-edit.php?user_id=").concat(response.id));
              }
            }
          });
        }).fail(function (response) {
          _this2.showAlert(_this2.__(response.responseJSON.message, 'dokan-lite'), '', 'error');
        }).always(function () {
          _this2.$root.$emit('modalClosed');
        });
      } // move next tab


      this.currentTab = 'VendorPaymentFields' === this.currentTab ? 'VendorPaymentFields' : this.nextTab(this.tabs, this.currentTab);
    },
    nextTab: function nextTab(tabs, currentTab) {
      var keys = Object.keys(tabs);
      var nextIndex = keys.indexOf(currentTab) + 1;
      var nextTab = keys[nextIndex];
      return nextTab;
    },
    closeModal: function closeModal() {
      this.$root.$emit('modalClosed');
    },
    formIsValid: function formIsValid() {
      var _this3 = this;

      var requiredFields = this.requiredFields;
      var allFields = this.store; // empty the errors array on new form submit

      this.errors = [];
      requiredFields.forEach(function (field) {
        if (field in allFields && allFields[field].length < 1) {
          _this3.errors.push(field);
        }
      }); // if no error && store_slug & username is available, return true

      if (this.errors.length < 1 && this.storeAvailable && this.userNameAvailable && this.emailAvailable) {
        return true;
      } // go back to first tab, if there are errors


      this.currentTab = 'VendorAccountFields';
      return false;
    }
  }
});

/***/ }),
/* 79 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_regenerator__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_regenerator___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_regenerator__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_papaparse__ = __webpack_require__(80);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_papaparse___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_papaparse__);


//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'DummyData',
  data: function data() {
    return {
      errorMsg: '',
      csvFileUrl: dokan.urls.dummy_data,
      progress: 0,
      dummyData: [],
      loading: true,
      allVendors: [],
      allProducts: [],
      done: false,
      statusLoader: true,
      vendorsDataToRemove: ['sku', 'status', 'catalog_visibility', 'short_description', 'date_on_sale_from', 'date_on_sale_to', 'tax_status', 'tax_class', 'stock_status', 'manage_stock', 'stock_quantity', 'children', 'backorders', 'sold_individually', 'reviews_allowed', 'purchase_note', 'sale_price', 'regular_price', 'category_ids', 'tag_ids', 'shipping_class_id', 'raw_image_id', 'raw_gallery_image_ids', 'download_limit', 'download_expiry', 'parent_id', 'grouped_products', 'upsell_ids', 'cross_sell_ids', 'product_url', 'button_text', 'menu_order', 'virtual', 'downloadable', 'status', 'attribute_1_name', 'attribute_1_value', 'attribute_1_visible', 'attribute_1_global', 'attribute_2_name', 'attribute_2_value', 'attribute_2_visible', 'attribute_2_global', '_wpcom_is_markdown', 'download1_name', 'download_1_url', 'download_2_name', 'download_2_url', 'vendor'],
      productsDataToRemove: ['email', 'password', 'store_name', 'social', 'payment', 'phone', 'show_email', 'address', 'location', 'banner', 'icon', 'gravatar', 'show_more_tpab', 'show_ppp', 'enable_tnc', 'store_tnc', 'show_min_order_discount', 'store_seo', 'dokan_store_time', 'enabled', 'trusted', 'attribute_1_name', 'attribute_1_value', 'attribute_1_visible', 'attribute_1_global', 'attribute_2_name', 'attribute_2_value', 'attribute_2_visible', 'attribute_2_global']
    };
  },
  created: function created() {
    this.loadImportStatus();
    this.loadCsvFile();
  },
  methods: {
    // Loads and sets if import already successfully.
    loadImportStatus: function loadImportStatus() {
      this.statusLoader = true;
      var self = this;
      dokan.api.get("/dummy-data/status", {
        'nonce': dokan.nonce
      }).done(function (response, status, xhr) {
        if (response.import_status == 'yes') {
          self.done = true;
        }

        self.statusLoader = false;
      }).fail(function (jqXHR) {
        var message = window.dokan_handle_ajax_error(jqXHR);

        if (message) {
          Swal.fire(message, '', 'error');
        }
      });
    },
    // Resets data states
    resetDataState: function resetDataState() {
      this.dummyData = [];
      this.allVendors = [];
      this.allProducts = [];
    },
    // Loads csv file and parse csv data.
    loadCsvFile: function loadCsvFile() {
      var self = this;
      self.loading = true;
      self.resetDataState();
      jQuery.ajax({
        type: 'GET',
        url: this.csvFileUrl,
        data: {},
        success: function success(data) {
          Object(__WEBPACK_IMPORTED_MODULE_2_papaparse__["parse"])(data, {
            header: true,
            complete: function complete(results) {
              self.loading = false;
              self.dummyData = results.data;
              self.loadCsvData();
            }
          });
          self.loading = false;
        }
      });
    },
    // Lodes and sates vendor and products data.
    loadCsvData: function loadCsvData() {
      var _this = this;

      this.dummyData.forEach(function (item) {
        if ('vendor' === item.type) {
          _this.allVendors.push(_this.formatVendorData(item));
        } else {
          _this.allProducts.push(_this.formatProductData(item));
        }
      });
    },
    // Request ajax to import data to database.
    requestToImport: function requestToImport(data) {
      var self = this;
      dokan.api.post("/dummy-data/import", data).done(function (response, status, xhr) {
        self.handleImport(response.vendor_index);
        self.updateProgress(response.vendor_index);
      }).fail(function (jqXHR) {
        var message = window.dokan_handle_ajax_error(jqXHR);

        if (message) {
          Swal.fire(message, '', 'error');
        }
      });
    },
    // Run importer button handler.
    importBtnHandler: function importBtnHandler() {
      this.handleImport();
    },
    // Updates progress bar progress.
    updateProgress: function updateProgress(numVendorSucceed) {
      this.progress = 100 * numVendorSucceed / this.allVendors.length;
    },
    // Requrests to server.
    handleImport: function handleImport() {
      var vendor_index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var vendorData = this.allVendors[vendor_index];

      if (!vendorData || undefined == vendorData) {
        this.loading = false;
        this.done = true;
        return;
      }

      var data = {
        nonce: dokan.nonce,
        vendor_data: vendorData,
        vendor_products: this.getVendorProducts(vendorData.id),
        vendor_index: vendor_index,
        total_vendors: this.allVendors.length
      };
      this.loading = true;
      this.requestToImport(data);
    },
    // Formats data for vendor removing products data
    formatVendorData: function formatVendorData(data) {
      this.vendorsDataToRemove.forEach(function (item) {
        delete data[item];
      });
      return data;
    },
    // Formats products data removing vendors data.
    formatProductData: function formatProductData(data) {
      data.raw_attributes = [{
        name: data.attribute_1_name,
        value: data.attribute_1_value.split(','),
        visible: data.attribute_1_visible,
        taxonomy: data.attribute_1_global
      }, {
        name: data.attribute_2_name,
        value: data.attribute_2_value.split(','),
        visible: data.attribute_2_visible,
        taxonomy: data.attribute_2_global
      }];
      data.manage_stock = Boolean(data.manage_stock);
      this.productsDataToRemove.forEach(function (item) {
        delete data[item];
      });
      return data;
    },
    // Returns single vendors products from all products array.
    getVendorProducts: function getVendorProducts(vendorId) {
      return this.allProducts.filter(function (item) {
        return item.vendor == vendorId;
      });
    },
    // Reset import state.
    resetToImport: function resetToImport() {
      this.errorMsg = '';
      this.progress = 0;
      this.loading = false;
      this.done = false;
    },
    // Request to server to clear dummy data from this site.
    clearAllDummyData: function clearAllDummyData() {
      var _this2 = this;

      return __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_asyncToGenerator___default()( /*#__PURE__*/__WEBPACK_IMPORTED_MODULE_1__babel_runtime_regenerator___default.a.mark(function _callee() {
        var self, answer;
        return __WEBPACK_IMPORTED_MODULE_1__babel_runtime_regenerator___default.a.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                self = _this2;
                _context.next = 3;
                return dokan_sweetalert("Are you sure? You want to remove all dummy data!", {
                  action: 'confirm',
                  icon: 'warning'
                });

              case 3:
                answer = _context.sent;

                if ('undefined' !== answer && answer.isConfirmed) {
                  self.loading = true;
                  dokan.api.delete("/dummy-data/clear", {
                    'nonce': dokan.nonce
                  }).done(function (response, status, xhr) {
                    dokan_sweetalert('', {
                      toast: true,
                      icon: 'success',
                      title: response.message,
                      position: 'bottom-right',
                      showConfirmButton: false,
                      timer: 3000,
                      timerProgressBar: true,
                      didOpen: function didOpen(toast) {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                      }
                    });
                    self.resetToImport();
                  }).fail(function (jqXHR) {
                    var message = window.dokan_handle_ajax_error(jqXHR);

                    if (message) {
                      Swal.fire(message, '', 'error');
                    }
                  });
                }

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    // Returns woocommerce admin products list page url.
    getProductsPageUrl: function getProductsPageUrl() {
      return "".concat(dokan.urls.adminRoot, "edit.php?post_type=product");
    }
  }
});

/***/ }),
/* 80 */,
/* 81 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__ = __webpack_require__(58);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  name: "VendorCapabilities",
  components: {
    ProCta: __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__["a" /* default */]
  },
  data: function data() {
    return {
      showPopup: false,
      selectedCapabilityImage: '',
      capabilityCards: [{
        title: this.__('Coupons', 'dokan-lite'),
        content: this.__('Each vendor can create unlimited discount coupon codes for their products.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-coupon.svg")
      }, {
        title: this.__('Shipping', 'dokan-lite'),
        content: this.__('Vendors can configure their own shipping costs for each country, state & single products.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-shipping.svg")
      }, {
        title: this.__('Duplicate Product', 'dokan-lite'),
        content: this.__('Vendors can duplicate their own products for ease and time saving.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-duplicate-product.svg")
      }, {
        title: this.__('Reporting', 'dokan-lite'),
        content: this.__('Earning, selling and commissions reports for vendors to improve sales & take major decisions.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-reports.svg")
      }, {
        title: this.__('Create Tags', 'dokan-lite'),
        content: this.__('Vendors can create & attach tags to products to categorize & for better search engine optimization.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-create-tags.svg")
      }, {
        title: this.__('Vendor Biography', 'dokan-lite'),
        content: this.__('Vendors can write about themselves & about their store in a text field which visitors can see from the store page', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-vendor-biography.svg")
      }, {
        title: this.__('Vendor Product Upload', 'dokan-lite'),
        content: this.__('New vendors can start uploading products upon registration if admins allow.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-vendor-product-upload.svg")
      }, {
        title: this.__('Order Status Change', 'dokan-lite'),
        content: this.__('Vendors will be able to mark products as draft & update the order status to inform customers about progress.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-order-status-change.svg")
      }, {
        title: this.__('Social Share', 'dokan-lite'),
        content: this.__('Visitors and customers can share a store page with their friends and acquaintances on their social profiles.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-social-share.svg")
      }, {
        title: this.__('Variable Product', 'dokan-lite'),
        content: this.__('Vendors can create variable products with predefined and custom attributes.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-variable-product.svg")
      }, {
        title: this.__('Store Opening & Closing Time', 'dokan-lite'),
        content: this.__('Vendors can define the working hours of their online store for each day of the week for visitors to see.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-opening-closing-hours.svg")
      }, {
        title: this.__('Woocommerce Booking Integration', 'dokan-lite'),
        content: this.__('Create hotel rooms, resorts, conference rooms, cars, bikes, etc for renting out.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-woocommerce-booking.svg")
      }, {
        title: this.__('Announcement For Vendors', 'dokan-lite'),
        content: this.__('Admins can make announcements targeted to a single vendor, multiple or all vendors.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-announcement-vendors.svg")
      }, {
        title: this.__('Woocommerce Simple Auctions Integration', 'dokan-lite'),
        content: this.__('Sell auction-able products in your store with Dokan’s integration.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-simple-auction.svg")
      }, {
        title: this.__('Social Profiles', 'dokan-lite'),
        content: this.__('Vendors can upload & showcase their Facebook, Twitter and Linkedin profiles on their store page.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-social-profile.svg")
      }, {
        title: this.__('Refund', 'dokan-lite'),
        content: this.__('Vendors can send refund requests for an order to the admins who can approve or deny it from the dashboard.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-refund.svg")
      }, {
        title: this.__('Store Seo', 'dokan-lite'),
        content: this.__('The Yoast SEO integration lets vendors define Store Title, Description, Slug and Keyword to appear in search engine results.', 'dokan-lite'),
        image: "".concat(dokan.urls.assetsUrl, "/images/vendor-capability/cap-store-seo.svg")
      }]
    };
  },
  methods: {
    closePopup: function closePopup() {
      this.showPopup = false;
    },
    openPopup: function openPopup(image) {
      this.showPopup = true;
      this.selectedCapabilityImage = image;
    }
  },
  computed: {
    bannerBg: function bannerBg() {
      return {
        backgroundImage: "url(".concat(dokan.urls.assetsUrl, "/images/dokan-vendor-capabilities-banner-bg.svg)")
      };
    },
    bannerImage: function bannerImage() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-vendor-capabilities-banner.svg");
    }
  }
});

/***/ }),
/* 82 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ModuleUpgradePopup_vue__ = __webpack_require__(208);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
  name: "ProModules",
  components: {
    ModuleUpgradePopup: __WEBPACK_IMPORTED_MODULE_0__components_ModuleUpgradePopup_vue__["a" /* default */]
  },
  data: function data() {
    return {
      modules: [{
        name: this.__('WooCommerce Booking Integration', 'dokan-lite'),
        description: this.__('Integrates WooCommerce Booking with Dokan.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/booking.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-bookings/',
        modLink: 'https://wedevs.com/dokan/extensions/woocommerce-booking-integration/'
      }, {
        name: this.__('Color Scheme Customizer', 'dokan-lite'),
        description: this.__('A Dokan plugin Add-on to Customize Colors of Dokan Dashboard', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/color-scheme-customizer.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/color-scheme/',
        modLink: 'https://wedevs.com/dokan/modules/color-scheme-customizer/'
      }, {
        name: this.__('Elementor', 'dokan-lite'),
        description: this.__('Elementor Page Builder widgets for Dokan', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/elementor.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/elementor-dokan/',
        modLink: 'https://wedevs.com/dokan/modules/elementor/'
      }, {
        name: this.__('Vendor Product Importer and Exporter', 'dokan-lite'),
        description: this.__('This is simple product import and export plugin for vendor', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/import-export.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-and-use-dokan-exportimport-add/',
        modLink: 'https://wedevs.com/dokan/modules/export-import/'
      }, {
        name: this.__('Follow Store', 'dokan-lite'),
        description: this.__('Send emails to customers when their favorite store updates.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/follow-store.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/follow-store/',
        modLink: 'https://wedevs.com/dokan/modules/follow-store/'
      }, {
        name: this.__('Geolocation', 'dokan-lite'),
        description: this.__('Search Products and Vendors by geolocation.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/geolocation.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-geolocation/',
        modLink: 'https://wedevs.com/dokan/modules/geolocation/'
      }, {
        name: this.__('Live Chat', 'dokan-lite'),
        description: this.__('Live Chat Between Vendor & Customer.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/live-chat.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-live-chat/',
        modLink: 'https://wedevs.com/dokan/modules/live-chat/'
      }, {
        name: this.__('Live Search', 'dokan-lite'),
        description: this.__('Live product search for WooCommerce store.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/ajax-live-search.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-configure-use-dokan-live-search/',
        modLink: 'https://wedevs.com/dokan/modules/ajax-live-search/'
      }, {
        name: this.__('Wirecard', 'dokan-lite'),
        description: this.__('Wirecard payment gateway for Dokan.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/wirecard-connect.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-moip-connect/',
        modLink: 'https://wedevs.com/dokan/modules/moip/'
      }, {
        name: this.__('PayPal Adaptive Payment', 'dokan-lite'),
        description: this.__('Allows to send split payments to vendor via PayPal Adaptive Payment gateway.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/paypal-adaptive.png"),
        docLink: '#',
        modLink: '#'
      }, {
        name: this.__('Product Addon', 'dokan-lite'),
        description: this.__('WooCommerce Product Addon support.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/product-addon.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/product-addon/',
        modLink: 'https://wedevs.com/dokan/modules/product-addons/'
      }, {
        name: this.__('Product Enquiry', 'dokan-lite'),
        description: this.__('Enquiry for a specific product to a seller.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/product-enquiry.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-configure-use-dokan-product-enquiry/',
        modLink: 'https://wedevs.com/dokan/modules/product-enquiry/'
      }, {
        name: this.__('Report Abuse', 'dokan-lite'),
        description: this.__('Let customers report fraudulent or fake products.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/report-abuse.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-report-abuse/',
        modLink: 'https://wedevs.com/docs/dokan/modules/dokan-report-abuse/'
      }, {
        name: this.__('Return and Warranty Request', 'dokan-lite'),
        description: this.__('Manage return and warranty from vendor end.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/report-abuse.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/vendor-rma/',
        modLink: 'https://wedevs.com/dokan/modules/rma/'
      }, {
        name: this.__('Seller Vacation', 'dokan-lite'),
        description: this.__('Using this plugin seller can go to vacation by closing their stores.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/seller-vacation.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-vendor-vacation/',
        modLink: 'https://wedevs.com/dokan/modules/vendor-vacation/'
      }, {
        name: this.__('ShipStation Integration', 'dokan-lite'),
        description: this.__('Adds ShipStation label printing support to Dokan. Requires server DomDocument support.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/shipstation.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/shipstation-dokan-wedevs/',
        modLink: 'https://wedevs.com/dokan/modules/shipstation/'
      }, {
        name: this.__('Auction Integration', 'dokan-lite'),
        description: this.__('A plugin that combined WooCommerce simple auction and Dokan plugin.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/auction.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/woocommerce-auctions-frontend-multivendor-marketplace/',
        modLink: 'https://wedevs.com/dokan/modules/dokan-simple-auctions/'
      }, {
        name: this.__('Single Product Multiple Vendor', 'dokan-lite'),
        description: this.__('A module that offers multiple vendor to sell a single product.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/single-product-multivendor.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/single-product-multiple-vendor/',
        modLink: 'https://wedevs.com/dokan/modules/single-product-multivendor/'
      }, {
        name: this.__('Store Reviews', 'dokan-lite'),
        description: this.__('A plugin that allows customers to rate the sellers.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/vendor-review.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/vendor-review/',
        modLink: 'https://wedevs.com/dokan/modules/dokan-vendor-review/'
      }, {
        name: this.__('Store Support', 'dokan-lite'),
        description: this.__('Enable vendors to provide support to customers from store page.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/store-support.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-and-use-store-support/',
        modLink: 'https://wedevs.com/dokan/modules/store-support/'
      }, {
        name: this.__('Stripe Connect', 'dokan-lite'),
        description: this.__('Accept credit card payments and allow your sellers to get automatic split payment in Dokan via Stripe.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/stripe.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-and-configure-dokan-stripe-connect/',
        modLink: 'https://wedevs.com/dokan/modules/store-support/'
      }, {
        name: this.__('Vendor Subscription', 'dokan-lite'),
        description: this.__('Product subscription pack add-on for Dokan vendors.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/subscription.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/how-to-install-use-dokan-subscription/',
        modLink: 'https://wedevs.com/dokan/modules/subscription/'
      }, {
        name: this.__('Vendor Analytics', 'dokan-lite'),
        description: this.__('A plugin for store and product analytics for vendor.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/analytics.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-vendor-analytics/',
        modLink: 'https://wedevs.com/docs/dokan/modules/dokan-vendor-analytics/'
      }, {
        name: this.__('Vendor Staff Manager', 'dokan-lite'),
        description: this.__('A plugin for manage store via vendor staffs.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/vendor-staff.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-vendor-staff-manager/',
        modLink: 'https://wedevs.com/dokan/modules/vendor-staff-manager/'
      }, {
        name: this.__('Vendor Subscription Product', 'dokan-lite'),
        description: this.__('WooCommerce Subscription integration for Dokan', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/vendor-subscription-product.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-vendor-subscription-product/',
        modLink: 'https://wedevs.com/dokan/modules/vendor-subscription-product/'
      }, {
        name: this.__('Vendor Verification', 'dokan-lite'),
        description: this.__('Dokan add-on to verify sellers.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/vendor-verification.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-seller-verification-admin-settings/',
        modLink: 'https://wedevs.com/dokan/modules/seller-verification/'
      }, {
        name: this.__('Wholesale', 'dokan-lite'),
        description: this.__('Offer any customer to buy product as a wholesale price from any vendors.', 'dokan-lite'),
        thumbnail: "".concat(dokan.urls.assetsUrl, "/images/modules/wholesale.png"),
        docLink: 'https://wedevs.com/docs/dokan/modules/dokan-wholesale/',
        modLink: 'https://wedevs.com/dokan/modules/wholesale/'
      }],
      showPopup: true
    };
  },
  methods: {
    togglePopup: function togglePopup(isShowing) {
      this.showPopup = isShowing;
    }
  }
});

/***/ }),
/* 83 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
/* harmony default export */ __webpack_exports__["a"] = ({
  name: "ModuleUpgradePopup",
  props: {
    showPopup: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  data: function data() {
    return {
      upgradeURL: dokan.urls.upgradeToPro
    };
  },
  methods: {
    closePopup: function closePopup() {
      this.$emit('toggle', false);
    }
  }
});

/***/ }),
/* 84 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_moment__);


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var ListTable = dokan_get_lib('ListTable');
var Multiselect = dokan_get_lib('Multiselect');
var Debounce = dokan_get_lib('debounce');
var DateRangePicker = dokan_get_lib('DateRangePicker');
var AdminNotice = dokan_get_lib('AdminNotice');
var Currency = dokan_get_lib('Currency');
var CardFunFact = dokan_get_lib('CardFunFact');
var swal = Swal.mixin({
  customClass: {
    confirmButton: 'button button-primary',
    cancelButton: 'button button-secondary'
  },
  buttonsStyling: false
});
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'ReverseWithdrawal',
  components: {
    Currency: Currency,
    ListTable: ListTable,
    Multiselect: Multiselect,
    Debounce: Debounce,
    swal: swal,
    DateRangePicker: DateRangePicker,
    AdminNotice: AdminNotice,
    CardFunFact: CardFunFact
  },
  data: function data() {
    return {
      transactionData: [],
      loading: false,
      clearingFilters: false,
      counts: {
        debit: 0,
        credit: 0,
        balance: 0,
        total_transactions: 0,
        total_vendors: 0
      },
      dateTimePickerFormat: _objectSpread({
        format: dokan_get_daterange_picker_format().toLowerCase()
      }, dokan_helper.daterange_picker_local),
      dateRangePickerRanges: {
        'Today': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate()],
        'Last 30 Days': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(29, 'days').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate()],
        'This Month': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().endOf('month').toDate()],
        'Last Month': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(1, 'month').startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(1, 'month').endOf('month').toDate()],
        'This Year': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().month(0).startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().month(11).endOf('month').toDate()],
        'Last Year': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().month(0).subtract(1, 'year').startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().month(11).subtract(1, 'year').endOf('month').toDate()]
      },
      totalPages: 1,
      perPage: 20,
      totalItems: 0,
      showCb: true,
      notFound: this.__('No transaction found.', 'dokan-lite'),
      columns: {
        'store_name': {
          label: this.__('Stores', 'dokan-lite')
        },
        'balance': {
          label: this.__('Balance', 'dokan-lite')
        },
        'last_payment_date': {
          label: this.__('Last Payment Date', 'dokan-lite')
        }
      },
      actions: [],
      filter: {
        stores: this.getDefaultStore(),
        selected_store: this.getDefaultStore()[0],
        transaction_date: {
          startDate: '',
          endDate: ''
        }
      }
    };
  },
  created: function created() {
    this.setDefaultTransactionDate();
    this.fetchStoreLists();
    this.fetchBalances();
  },
  mounted: function mounted() {
    this.mountToolTips();
  },
  updated: function updated() {
    this.mountToolTips();
  },
  filters: {
    getFormattedDate: function getFormattedDate(date) {
      return date ? __WEBPACK_IMPORTED_MODULE_1_jquery___default.a.datepicker.formatDate(dokan_get_i18n_date_format(), new Date(date)) : '';
    }
  },
  computed: {
    getCurrentPage: function getCurrentPage() {
      return this.$route.query.page ? parseInt(this.$route.query.page) : 1;
    },
    getSortBy: function getSortBy() {
      var _this$$route$query$or;

      return (_this$$route$query$or = this.$route.query.orderby) !== null && _this$$route$query$or !== void 0 ? _this$$route$query$or : 'added';
    },
    getSortOrder: function getSortOrder() {
      var _this$$route$query$or2;

      return (_this$$route$query$or2 = this.$route.query.order) !== null && _this$$route$query$or2 !== void 0 ? _this$$route$query$or2 : 'desc';
    },
    filterStoreID: function filterStoreID() {
      return this.filter.selected_store ? this.filter.selected_store.id : 0;
    },
    filterTransactionDate: function filterTransactionDate() {
      var data = {
        from: '',
        to: ''
      };

      if (!this.filter.transaction_date.startDate || !this.filter.transaction_date.endDate) {
        return data;
      }

      data.from = __WEBPACK_IMPORTED_MODULE_2_moment___default()(this.filter.transaction_date.startDate).format('YYYY-MM-DD HH:mm:ss');
      data.to = __WEBPACK_IMPORTED_MODULE_2_moment___default()(this.filter.transaction_date.endDate).format('YYYY-MM-DD HH:mm:ss'); // fix from param

      if (data.from === data.to) {
        data.from = '';
      }

      return data;
    },
    bulkActions: function bulkActions() {
      return [];
    }
  },
  watch: {
    '$route.query.page': function $routeQueryPage() {
      this.fetchBalances();
    },
    '$route.query.orderby': function $routeQueryOrderby() {
      this.fetchBalances();
    },
    '$route.query.order': function $routeQueryOrder() {
      this.fetchBalances();
    },
    'filter.selected_store': function filterSelected_store() {
      // added this condition to avoid multiple fetchBalances call
      if (!this.clearingFilters && !this.loading) {
        this.fetchBalances();
      }
    },
    'filter.transaction_date.startDate': function filterTransaction_dateStartDate() {
      // added this condition to avoid multiple fetchBalances call
      if (!this.clearingFilters && !this.loading) {
        this.fetchBalances();
      }
    }
  },
  methods: {
    updatedCounts: function updatedCounts(xhr) {
      var _xhr$getResponseHeade, _xhr$getResponseHeade2, _xhr$getResponseHeade3, _xhr$getResponseHeade4, _xhr$getResponseHeade5;

      this.counts.debit = parseFloat((_xhr$getResponseHeade = xhr.getResponseHeader('X-Status-Debit')) !== null && _xhr$getResponseHeade !== void 0 ? _xhr$getResponseHeade : 0);
      this.counts.credit = parseFloat((_xhr$getResponseHeade2 = xhr.getResponseHeader('X-Status-Credit')) !== null && _xhr$getResponseHeade2 !== void 0 ? _xhr$getResponseHeade2 : 0);
      this.counts.balance = parseFloat((_xhr$getResponseHeade3 = xhr.getResponseHeader('X-Status-Balance')) !== null && _xhr$getResponseHeade3 !== void 0 ? _xhr$getResponseHeade3 : 0);
      this.counts.total_transactions = parseInt((_xhr$getResponseHeade4 = xhr.getResponseHeader('X-Status-Total-Transactions')) !== null && _xhr$getResponseHeade4 !== void 0 ? _xhr$getResponseHeade4 : 0);
      this.counts.total_vendors = parseInt((_xhr$getResponseHeade5 = xhr.getResponseHeader('X-Status-Total-Vendors')) !== null && _xhr$getResponseHeade5 !== void 0 ? _xhr$getResponseHeade5 : 0);
    },
    updatePagination: function updatePagination(xhr) {
      var _xhr$getResponseHeade6, _xhr$getResponseHeade7;

      this.totalPages = parseInt((_xhr$getResponseHeade6 = xhr.getResponseHeader('X-WP-TotalPages')) !== null && _xhr$getResponseHeade6 !== void 0 ? _xhr$getResponseHeade6 : 0);
      this.totalItems = parseInt((_xhr$getResponseHeade7 = xhr.getResponseHeader('X-WP-Total')) !== null && _xhr$getResponseHeade7 !== void 0 ? _xhr$getResponseHeade7 : 0);
    },
    resetCounts: function resetCounts() {
      this.counts.debit = 0;
      this.counts.credit = 0;
      this.counts.balance = 0;
      this.counts.total_transactions = 0;
      this.counts.total_vendors = 0;
      this.totalPages = 0;
      this.totalItems = 0;
    },
    // clear filter
    clearFilters: function clearFilters() {
      this.clearingFilters = true;
      this.filter.selected_store = this.getDefaultStore()[0];
      this.setDefaultTransactionDate();
      this.clearingFilters = false;
      this.fetchBalances();
    },
    getDefaultStore: function getDefaultStore() {
      return [{
        id: 0,
        name: this.__('All Stores', 'dokan-lite')
      }];
    },
    // filter by stores
    fetchStoreLists: Debounce(function () {
      var search = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var self = this;
      dokan.api.get('/reverse-withdrawal/stores', {
        paged: 1,
        search: search
      }).done(function (response) {
        self.filter.stores = self.getDefaultStore().concat(response);
      }).fail(function (jqXHR) {
        self.filter.stores = self.getDefaultStore();
      });
    }, 300),
    getDefaultTransactionDate: function getDefaultTransactionDate() {
      var today = __WEBPACK_IMPORTED_MODULE_2_moment___default()().endOf('today').hour(23).minute(59).second(59).toDate();

      return {
        startDate: today,
        endDate: today
      };
    },
    setDefaultTransactionDate: function setDefaultTransactionDate() {
      var transaction_date = this.getDefaultTransactionDate();
      this.filter.transaction_date.startDate = transaction_date.startDate;
      this.filter.transaction_date.endDate = transaction_date.endDate;

      if (this.$refs.picker) {
        this.$refs.picker.togglePicker(false);
      }
    },
    fetchBalances: function fetchBalances() {
      this.loading = true;
      var self = this;
      var data = {
        per_page: self.perPage,
        page: self.getCurrentPage,
        orderby: self.getSortBy,
        order: self.getSortOrder,
        trn_date: self.filterTransactionDate
      };

      if (self.filterStoreID) {
        data.vendor_id = self.filterStoreID;
      }

      dokan.api.get('/reverse-withdrawal/stores-balance', data).done(function (response, status, xhr) {
        self.transactionData = response;
        self.updatedCounts(xhr);
        self.updatePagination(xhr);
      }).always(function () {
        self.loading = false;
      }).fail(function (jqXHR) {
        self.transactionData = [];
        self.resetCounts();
        var message = self.renderApiError(jqXHR);

        if (message) {
          self.showErrorAlert(message);
        }
      });
    },
    goToPage: function goToPage(page) {
      this.$router.push({
        name: 'ReverseWithdrawal',
        query: {
          page: page
        }
      });
    },
    doSort: function doSort(column, order) {
      this.$router.push({
        name: 'ReverseWithdrawal',
        query: {
          page: 1,
          orderby: column,
          order: order
        }
      });
    },
    orderUrl: function orderUrl(id) {
      return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
    },
    vendorUrl: function vendorUrl(id) {
      return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/' + id;
    },
    productUrl: function productUrl(id) {
      return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
    },
    mountToolTips: function mountToolTips() {
      __WEBPACK_IMPORTED_MODULE_1_jquery___default()('.tips').tooltip();
    },
    moment: function moment(date) {
      return __WEBPACK_IMPORTED_MODULE_2_moment___default()(date);
    },
    showErrorAlert: function showErrorAlert(message) {
      var self = this;
      swal.fire(self.__('Something went wrong', 'dokan-lite'), message, 'error');
    },
    renderApiError: function renderApiError(jqXHR) {
      var message = '';

      if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
        message = jqXHR.responseJSON.message;
      } else if (jqXHR.responseJSON && jqXHR.responseJSON.data && jqXHR.responseJSON.data.message) {
        message = jqXHR.responseJSON.data.message;
      } else if (jqXHR.responseText) {
        message = jqXHR.responseText;
      }

      return message;
    }
  }
});

/***/ }),
/* 85 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_moment__);


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var ListTable = dokan_get_lib('ListTable');
var Multiselect = dokan_get_lib('Multiselect');
var Debounce = dokan_get_lib('debounce');
var DateRangePicker = dokan_get_lib('DateRangePicker');
var AdminNotice = dokan_get_lib('AdminNotice');
var Currency = dokan_get_lib('Currency');
var CardFunFact = dokan_get_lib('CardFunFact');
var swal = Swal.mixin({
  customClass: {
    confirmButton: 'button button-primary',
    cancelButton: 'button button-secondary'
  },
  buttonsStyling: false
});
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'ReverseWithdrawalTransactions',
  components: {
    Currency: Currency,
    ListTable: ListTable,
    Multiselect: Multiselect,
    Debounce: Debounce,
    swal: swal,
    DateRangePicker: DateRangePicker,
    AdminNotice: AdminNotice,
    CardFunFact: CardFunFact
  },
  data: function data() {
    return {
      storeDetails: {},
      transactionData: [],
      loading: false,
      clearingFilters: false,
      counts: {
        debit: 0,
        credit: 0,
        total_transaction: 0
      },
      dateTimePickerFormat: _objectSpread({
        format: dokan_get_daterange_picker_format().toLowerCase()
      }, dokan_helper.daterange_picker_local),
      dateRangePickerRanges: {
        'Today': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate()],
        'Last 30 Days': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(29, 'days').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().toDate()],
        'This Month': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().endOf('month').toDate()],
        'Last Month': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(1, 'month').startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(1, 'month').endOf('month').toDate()],
        'This Year': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().month(0).startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().month(11).endOf('month').toDate()],
        'Last Year': [__WEBPACK_IMPORTED_MODULE_2_moment___default()().month(0).subtract(1, 'year').startOf('month').toDate(), __WEBPACK_IMPORTED_MODULE_2_moment___default()().month(11).subtract(1, 'year').endOf('month').toDate()]
      },
      totalPages: 1,
      perPage: 100,
      totalItems: 0,
      showCb: true,
      notFound: this.__('No transaction found.', 'dokan-lite'),
      columns: {
        'trn_id': {
          label: this.__('Transaction ID', 'dokan-lite')
        },
        'trn_date': {
          label: this.__('Date', 'dokan-lite')
        },
        'trn_type': {
          label: this.__('Transaction Type', 'dokan-lite')
        },
        'note': {
          label: this.__('Note', 'dokan-lite')
        },
        'debit': {
          label: this.__('Debit', 'dokan-lite')
        },
        'credit': {
          label: this.__('Credit', 'dokan-lite')
        },
        'balance': {
          label: this.__('Balance', 'dokan-lite')
        }
      },
      actions: [],
      filter: {
        transaction_date: {
          startDate: '',
          endDate: ''
        }
      }
    };
  },
  created: function created() {
    this.setDefaultTransactionDate();
    this.fetchTransactions();
  },
  mounted: function mounted() {
    this.fetchStoreDetails();
    this.mountToolTips();
    this.scrollToTop();
  },
  updated: function updated() {
    this.mountToolTips();
  },
  filters: {
    getFormattedDate: function getFormattedDate(date) {
      return date ? __WEBPACK_IMPORTED_MODULE_1_jquery___default.a.datepicker.formatDate(dokan_get_i18n_date_format(), new Date(date)) : '';
    }
  },
  computed: {
    ID: function ID() {
      return this.$route.params.store_id;
    },
    getCurrentPage: function getCurrentPage() {
      return this.$route.query.page ? parseInt(this.$route.query.page) : 1;
    },
    getSortBy: function getSortBy() {
      var _this$$route$query$or;

      return (_this$$route$query$or = this.$route.query.orderby) !== null && _this$$route$query$or !== void 0 ? _this$$route$query$or : 'added';
    },
    getSortOrder: function getSortOrder() {
      var _this$$route$query$or2;

      return (_this$$route$query$or2 = this.$route.query.order) !== null && _this$$route$query$or2 !== void 0 ? _this$$route$query$or2 : 'desc';
    },
    filterTransactionDate: function filterTransactionDate() {
      var data = {};

      if (!this.filter.transaction_date.startDate || !this.filter.transaction_date.endDate) {
        return data;
      }

      data.from = __WEBPACK_IMPORTED_MODULE_2_moment___default()(new Date(this.filter.transaction_date.startDate)).format('YYYY-MM-DD HH:mm:ss');
      data.to = __WEBPACK_IMPORTED_MODULE_2_moment___default()(new Date(this.filter.transaction_date.endDate)).format('YYYY-MM-DD HH:mm:ss');
      return data;
    },
    bulkActions: function bulkActions() {
      return [];
    }
  },
  watch: {
    '$route.query.page': function $routeQueryPage() {
      this.fetchTransactions();
    },
    '$route.query.orderby': function $routeQueryOrderby() {
      this.fetchTransactions();
    },
    '$route.query.order': function $routeQueryOrder() {
      this.fetchTransactions();
    },
    'filter.transaction_date.startDate': function filterTransaction_dateStartDate() {
      // added this condition to avoid multiple fetchBalances call
      if (!this.clearingFilters && !this.loading) {
        this.fetchTransactions();
      }
    }
  },
  methods: {
    updatedCounts: function updatedCounts(xhr) {
      var _xhr$getResponseHeade, _xhr$getResponseHeade2, _xhr$getResponseHeade3, _xhr$getResponseHeade4;

      this.counts.debit = parseFloat((_xhr$getResponseHeade = xhr.getResponseHeader('X-Status-Debit')) !== null && _xhr$getResponseHeade !== void 0 ? _xhr$getResponseHeade : 0);
      this.counts.credit = parseFloat((_xhr$getResponseHeade2 = xhr.getResponseHeader('X-Status-Credit')) !== null && _xhr$getResponseHeade2 !== void 0 ? _xhr$getResponseHeade2 : 0);
      this.counts.balance = parseFloat((_xhr$getResponseHeade3 = xhr.getResponseHeader('X-Status-Balance')) !== null && _xhr$getResponseHeade3 !== void 0 ? _xhr$getResponseHeade3 : 0);
      this.counts.total_transactions = parseInt((_xhr$getResponseHeade4 = xhr.getResponseHeader('X-Status-Total-Transactions')) !== null && _xhr$getResponseHeade4 !== void 0 ? _xhr$getResponseHeade4 : 0);
    },
    updatePagination: function updatePagination(xhr) {
      var _xhr$getResponseHeade5, _xhr$getResponseHeade6;

      this.totalPages = parseInt((_xhr$getResponseHeade5 = xhr.getResponseHeader('X-WP-TotalPages')) !== null && _xhr$getResponseHeade5 !== void 0 ? _xhr$getResponseHeade5 : 0);
      this.totalItems = parseInt((_xhr$getResponseHeade6 = xhr.getResponseHeader('X-WP-Total')) !== null && _xhr$getResponseHeade6 !== void 0 ? _xhr$getResponseHeade6 : 0);
    },
    resetCounts: function resetCounts() {
      this.counts.debit = 0;
      this.counts.credit = 0;
      this.counts.balance = 0;
      this.counts.total_transaction = 0;
    },
    resetPagination: function resetPagination() {
      this.totalPages = 0;
      this.totalItems = 0;
    },
    // clear filter
    clearFilters: function clearFilters() {
      this.clearingFilters = true;
      this.setDefaultTransactionDate();
      this.fetchTransactions();
      this.clearingFilters = false;
    },
    getDefaultTransactionDate: function getDefaultTransactionDate() {
      return {
        startDate: __WEBPACK_IMPORTED_MODULE_2_moment___default()().subtract(29, 'days').hour(0).minute(0).second(0).toDate(),
        endDate: __WEBPACK_IMPORTED_MODULE_2_moment___default()().hour(23).minute(59).second(59).toDate()
      };
    },
    setDefaultTransactionDate: function setDefaultTransactionDate() {
      var default_transaction_date = this.getDefaultTransactionDate();
      this.filter.transaction_date.startDate = default_transaction_date.startDate;
      this.filter.transaction_date.endDate = default_transaction_date.endDate;

      if (this.$refs.picker) {
        this.$refs.picker.togglePicker(false);
      }
    },
    goToPage: function goToPage(page) {
      this.$router.push({
        name: 'ReverseWithdrawalTransactions',
        query: {
          page: page
        }
      });
    },
    fetchTransactions: function fetchTransactions() {
      this.loading = true;
      var self = this;
      var data = {
        orderby: self.getSortBy,
        order: self.getSortOrder,
        vendor_id: self.ID,
        trn_date: self.filterTransactionDate,
        per_page: -1
      };
      dokan.api.get('/reverse-withdrawal/transactions/', data).done(function (response, status, xhr) {
        self.transactionData = response;
        self.updatedCounts(xhr);
        self.updatePagination(xhr);
      }).always(function () {
        self.loading = false;
      }).fail(function (jqXHR) {
        self.transactionData = [];
        self.resetPagination();
        var message = dokan_handle_ajax_error(jqXHR);

        if (message) {
          self.showErrorAlert(message);
        }
      });
    },
    fetchStoreDetails: function fetchStoreDetails() {
      var self = this;
      dokan.api.get('/stores/' + self.ID).done(function (response, status, xhr) {
        self.storeDetails = response;
      }).always(function () {}).fail(function (jqXHR) {
        self.storeDetails = {};
        var message = dokan_handle_ajax_error(jqXHR);

        if (message) {
          self.showErrorAlert(message);
        }
      });
    },
    doSort: function doSort(column, order) {
      this.$router.push({
        name: 'ReverseWithdrawalTransactions',
        query: {
          page: 1,
          orderby: column,
          order: order
        }
      });
    },
    reverseWithdrawalUrl: function reverseWithdrawalUrl(id) {
      return dokan.urls.adminRoot + 'admin.php?page=dokan#/reverse-withdrawal';
    },
    orderUrl: function orderUrl(id) {
      return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
    },
    vendorUrl: function vendorUrl(id) {
      return dokan.urls.adminRoot + 'admin.php?page=dokan#/vendors/' + id;
    },
    productUrl: function productUrl(id) {
      return dokan.urls.adminRoot + 'post.php?post=' + id + '&action=edit';
    },
    mountToolTips: function mountToolTips() {
      __WEBPACK_IMPORTED_MODULE_1_jquery___default()('.tips').tooltip();
    },
    moment: function moment(date) {
      return __WEBPACK_IMPORTED_MODULE_2_moment___default()(date);
    },
    showErrorAlert: function showErrorAlert(message) {
      var self = this;
      swal.fire(self.__('Something went wrong', 'dokan-lite'), message, 'error');
    },
    scrollToTop: function scrollToTop() {
      window.scrollTo(0, 0);
    }
  }
});

/***/ }),
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */,
/* 98 */,
/* 99 */,
/* 100 */,
/* 101 */,
/* 102 */,
/* 103 */,
/* 104 */,
/* 105 */,
/* 106 */,
/* 107 */,
/* 108 */,
/* 109 */,
/* 110 */,
/* 111 */,
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__App_vue__ = __webpack_require__(125);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__router__ = __webpack_require__(128);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_admin_menu_fix__ = __webpack_require__(218);



/* eslint-disable no-new */

var Vue = dokan_get_lib('Vue');
new Vue({
  el: '#dokan-vue-admin',
  router: __WEBPACK_IMPORTED_MODULE_1__router__["a" /* default */],
  render: function render(h) {
    return h(__WEBPACK_IMPORTED_MODULE_0__App_vue__["a" /* default */]);
  },
  created: function created() {
    this.setLocaleData(dokan.i18n['dokan-lite']);

    if (dokan.dokan_pro_i18n) {
      this.setLocaleData(dokan.dokan_pro_i18n['dokan']);
    }
  },
  methods: {
    listTableTexts: function listTableTexts() {
      return {
        loading: this.__('Loading', 'dokan-lite'),
        select_bulk_action: this.__('Select bulk action', 'dokan-lite'),
        bulk_actions: this.__('Bulk Actions', 'dokan-lite'),
        items: this.__('items', 'dokan-lite'),
        apply: this.__('Apply', 'dokan-lite')
      };
    }
  }
}); // fix the admin menu for the slug "vue-app"

Object(__WEBPACK_IMPORTED_MODULE_2__utils_admin_menu_fix__["a" /* default */])('dokan');

/***/ }),
/* 125 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(52);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(127);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(126)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/App.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-3a030f38", Component.options)
  } else {
    hotAPI.reload("data-v-3a030f38", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 126 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 127 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "vue-backend-app" } },
    [
      _c("router-view"),
      _vm._v(" "),
      _c("notifications", { attrs: { position: "bottom right" } })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-3a030f38", esExports)
  }
}

/***/ }),
/* 128 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof__ = __webpack_require__(129);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_pages_Dashboard_vue__ = __webpack_require__(130);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_pages_Withdraw_vue__ = __webpack_require__(137);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_pages_Premium_vue__ = __webpack_require__(140);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_admin_pages_Help_vue__ = __webpack_require__(150);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_admin_pages_ChangeLog_vue__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_admin_pages_Settings_vue__ = __webpack_require__(156);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_admin_pages_Vendors_vue__ = __webpack_require__(194);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_admin_pages_DummyData_vue__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_admin_pages_VendorCapabilities_vue__ = __webpack_require__(203);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10_admin_pages_ProModules_vue__ = __webpack_require__(206);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11_admin_pages_ReverseWithdrawal_vue__ = __webpack_require__(212);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_admin_pages_ReverseWithdrawalTransactions_vue__ = __webpack_require__(215);













var Vue = dokan_get_lib('Vue');
var Router = dokan_get_lib('Router');
var VersionCompare = dokan_get_lib('VersionCompare');
Vue.use(Router);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_1_admin_pages_Dashboard_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_2_admin_pages_Withdraw_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_3_admin_pages_Premium_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_5_admin_pages_ChangeLog_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_4_admin_pages_Help_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_6_admin_pages_Settings_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_9_admin_pages_VendorCapabilities_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_10_admin_pages_ProModules_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_8_admin_pages_DummyData_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_11_admin_pages_ReverseWithdrawal_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_12_admin_pages_ReverseWithdrawalTransactions_vue__["a" /* default */]); // if dokan pro not installed or dokan pro is greater than 2.9.14 register the `vendors` route.

if (!dokan.hasPro || VersionCompare(dokan.proVersion, '2.9.14', '>')) {
  dokan_add_route(__WEBPACK_IMPORTED_MODULE_7_admin_pages_Vendors_vue__["a" /* default */]);
}
/**
 * Parse the route array and bind required components
 *
 * This changes the dokan.routes array and changes the components
 * so we can use dokan.routeComponents.{compontent} component.
 *
 * @param  {array} routes
 *
 * @return {void}
 */


function parseRouteComponent(routes) {
  for (var i = 0; i < routes.length; i++) {
    if (__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof___default()(routes[i].children) === 'object') {
      parseRouteComponent(routes[i].children);

      if (typeof routes[i].component !== 'undefined') {
        routes[i].component = dokan.routeComponents[routes[i].component];
      }
    } else {
      routes[i].component = dokan.routeComponents[routes[i].component];
    }
  }
} // mutate the localized array


parseRouteComponent(dokan.routes);
/* harmony default export */ __webpack_exports__["a"] = (new Router({
  routes: dokan.routes
}));

/***/ }),
/* 129 */,
/* 130 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__ = __webpack_require__(53);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__ = __webpack_require__(136);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(131)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Dashboard.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-219ffca0", Component.options)
  } else {
    hotAPI.reload("data-v-219ffca0", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 131 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 132 */,
/* 133 */,
/* 134 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 135 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.show && _vm.showUpgrade
    ? _c("div", { staticClass: "dokan-promo-banner" }, [
        _c("div", { staticClass: "thumbnail" }, [
          _c(
            "svg",
            {
              attrs: {
                width: "219",
                height: "146",
                viewBox: "0 0 219 146",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg"
              }
            },
            [
              _c("g", { attrs: { filter: "url(#filter0_d_248_61)" } }, [
                _c("rect", {
                  attrs: {
                    x: "38.7051",
                    y: "24.564",
                    width: "122.83",
                    height: "92.5357",
                    rx: "2.75404",
                    fill: "white"
                  }
                })
              ]),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M38.7051 27.318C38.7051 25.797 39.9381 24.564 41.4591 24.564H158.781C160.302 24.564 161.535 25.797 161.535 27.318V34.4785H38.7051V27.318Z",
                  fill: "#5165FF"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "46.1409",
                  cy: "29.7966",
                  r: "1.37702",
                  fill: "#FF2323"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "51.0982",
                  cy: "29.7966",
                  r: "1.37702",
                  fill: "#FF9A23"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  cx: "56.0555",
                  cy: "29.7966",
                  r: "1.37702",
                  fill: "#3FD826"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  x: "48.6196",
                  y: "42.7406",
                  width: "58.9364",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "56.5109",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "62.0189",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "67.527",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "73.035",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "78.5431",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "84.0513",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "89.5592",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  opacity: "0.2",
                  x: "48.6196",
                  y: "95.0674",
                  width: "103.001",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  x: "48.6196",
                  y: "46.5962",
                  width: "25.888",
                  height: "1.65242",
                  rx: "0.826212",
                  fill: "#35D893"
                }
              }),
              _vm._v(" "),
              _c("rect", {
                attrs: {
                  x: "48.6196",
                  y: "102.779",
                  width: "21.4815",
                  height: "4.95727",
                  rx: "2.47864",
                  fill: "#F86C57"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  opacity: "0.91",
                  cx: "165.911",
                  cy: "71.0891",
                  r: "48.0891",
                  fill: "url(#paint0_linear_248_61)",
                  "fill-opacity": "0.08"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  opacity: "0.91",
                  cx: "165.911",
                  cy: "71.0891",
                  r: "42.9732",
                  fill: "url(#paint1_linear_248_61)",
                  "fill-opacity": "0.08"
                }
              }),
              _vm._v(" "),
              _c("circle", {
                attrs: {
                  opacity: "0.91",
                  cx: "165.911",
                  cy: "71.0892",
                  r: "38.3689",
                  fill: "url(#paint2_linear_248_61)",
                  "fill-opacity": "0.09"
                }
              }),
              _vm._v(" "),
              _c("g", { attrs: { filter: "url(#filter1_d_248_61)" } }, [
                _c("circle", {
                  attrs: {
                    cx: "166.253",
                    cy: "71.0891",
                    r: "33.2531",
                    fill: "url(#paint3_linear_248_61)"
                  }
                })
              ]),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M161.113 57.209H157.627V54.7871H160.933V54.0059H157.627V51.7451H161.113V50.9541H156.748V58H161.113V57.209ZM162.144 58H162.993V55.0117C162.993 54.1523 163.516 53.5859 164.316 53.5859C165.098 53.5859 165.483 54.0352 165.483 54.8555V58H166.333V54.7041C166.333 53.5518 165.688 52.834 164.575 52.834C163.789 52.834 163.247 53.1855 162.964 53.7324H162.944V52.9219H162.144V58ZM168.311 52.9219H167.461V58.2588C167.461 58.8252 167.261 59.0352 166.709 59.0352C166.704 59.0352 166.587 59.0352 166.577 59.0352V59.7432C166.587 59.748 166.724 59.748 166.738 59.748C167.822 59.748 168.311 59.2793 168.311 58.249V52.9219ZM167.886 52.0674C168.179 52.0674 168.418 51.8281 168.418 51.54C168.418 51.2471 168.179 51.0127 167.886 51.0127C167.598 51.0127 167.358 51.2471 167.358 51.54C167.358 51.8281 167.598 52.0674 167.886 52.0674ZM171.562 58.0879C172.964 58.0879 173.911 57.0771 173.911 55.4609C173.911 53.8398 172.964 52.834 171.562 52.834C170.156 52.834 169.209 53.8398 169.209 55.4609C169.209 57.0771 170.156 58.0879 171.562 58.0879ZM171.562 57.3408C170.664 57.3408 170.073 56.6572 170.073 55.4609C170.073 54.2646 170.664 53.5811 171.562 53.5811C172.461 53.5811 173.047 54.2646 173.047 55.4609C173.047 56.6572 172.461 57.3408 171.562 57.3408ZM175.044 59.8994C175.962 59.8994 176.382 59.543 176.816 58.3564L178.813 52.9219H177.92L176.514 57.1504H176.499L175.093 52.9219H174.185L176.06 58.0049L175.942 58.3613C175.747 58.9521 175.483 59.1816 175.01 59.1816C174.902 59.1816 174.771 59.1768 174.678 59.1572V59.8701C174.771 59.8896 174.941 59.8994 175.044 59.8994Z",
                  fill: "white"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M159.657 85.8369C157.66 85.8369 156.41 87.2432 156.41 89.4795C156.41 91.7158 157.66 93.1172 159.657 93.1172C161.654 93.1172 162.904 91.7158 162.904 89.4795C162.904 87.2432 161.654 85.8369 159.657 85.8369ZM159.657 86.6475C161.098 86.6475 162.001 87.7412 162.001 89.4795C162.001 91.2129 161.098 92.3066 159.657 92.3066C158.217 92.3066 157.313 91.2129 157.313 89.4795C157.313 87.7412 158.217 86.6475 159.657 86.6475ZM164.877 93V89.9482H167.997V89.167H164.877V86.7451H168.275V85.9541H163.998V93H164.877ZM170.16 93V89.9482H173.28V89.167H170.16V86.7451H173.559V85.9541H169.281V93H170.16Z",
                  fill: "white"
                }
              }),
              _vm._v(" "),
              _c("g", { attrs: { filter: "url(#filter2_d_248_61)" } }, [
                _c("path", {
                  attrs: {
                    d:
                      "M149.708 73.6738H151.268C152.344 73.6738 152.98 74.176 152.98 75.0188C152.98 75.8527 152.308 76.4086 151.304 76.4086C150.192 76.4086 149.51 75.8796 149.483 75.0188H145.861C145.986 77.655 148.085 79.3587 151.223 79.3587C154.657 79.3587 156.845 77.8254 156.845 75.4044C156.845 73.638 155.599 72.5171 153.698 72.3109V72.2392C155.258 71.9612 156.397 70.8314 156.397 69.2712C156.397 67.0834 154.46 65.7025 151.402 65.7025C148.219 65.7025 146.112 67.4151 146.103 70.0065H149.528C149.528 69.1008 150.219 68.4732 151.241 68.4732C152.281 68.4732 152.9 68.9753 152.9 69.7913C152.9 70.6162 152.281 71.1273 151.286 71.1273H149.708V73.6738ZM163.83 79.3587C167.327 79.3587 169.524 76.7583 169.524 72.4902C169.524 68.1863 167.3 65.6935 163.83 65.6935C160.36 65.6935 158.127 68.1952 158.127 72.4992C158.127 76.7763 160.333 79.3587 163.83 79.3587ZM163.83 76.4355C162.772 76.4355 162.001 75.1623 162.001 72.4992C162.001 69.8271 162.772 68.6167 163.83 68.6167C164.888 68.6167 165.65 69.8271 165.65 72.4992C165.65 75.1623 164.888 76.4355 163.83 76.4355ZM176.939 69.2174C176.939 67.0565 175.729 65.7294 173.756 65.7294C171.783 65.7294 170.573 67.0565 170.573 69.2174C170.573 71.3784 171.783 72.7054 173.756 72.7054C175.729 72.7054 176.939 71.3784 176.939 69.2174ZM173.756 70.6252C173.38 70.6252 173.155 70.0961 173.155 69.1905C173.155 68.2849 173.38 67.7559 173.756 67.7559C174.133 67.7559 174.357 68.2849 174.357 69.1905C174.357 70.0961 174.133 70.6252 173.756 70.6252ZM175.146 79L179.665 72.7951L184.57 66.0612H181.79L177.415 72.0688L172.366 79H175.146ZM186.363 75.7451C186.363 73.5842 185.153 72.2571 183.18 72.2571C181.207 72.2571 179.997 73.5842 179.997 75.7451C179.997 77.9061 181.207 79.2331 183.18 79.2331C185.153 79.2331 186.363 77.9061 186.363 75.7451ZM183.18 77.1529C182.803 77.1529 182.579 76.6238 182.579 75.7182C182.579 74.8126 182.803 74.2836 183.18 74.2836C183.557 74.2836 183.781 74.8126 183.781 75.7182C183.781 76.6238 183.557 77.1529 183.18 77.1529Z",
                    fill: "white"
                  }
                })
              ]),
              _vm._v(" "),
              _c("g", { attrs: { filter: "url(#filter3_d_248_61)" } }, [
                _c("rect", {
                  attrs: {
                    x: "19",
                    y: "38.3818",
                    width: "50.2355",
                    height: "17.2853",
                    rx: "8.64266",
                    fill: "white"
                  }
                })
              ]),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M42.394 48.9926C42.394 50.0814 41.6317 50.7359 40.0117 50.7359C38.3917 50.7359 37.6294 50.0814 37.6294 48.9926V47.1386C37.6294 46.0497 38.3931 45.3953 40.0117 45.3953C41.6303 45.3953 42.394 46.0497 42.394 47.1386V48.9926ZM41.1062 47.2885C41.1062 46.6831 40.9184 46.337 40.0061 46.337C39.0938 46.337 38.9074 46.6831 38.9074 47.2885V48.844C38.9074 49.448 39.0952 49.7941 40.0061 49.7941C40.917 49.7941 41.1062 49.448 41.1062 48.844V47.2885Z",
                  fill: "#4D4D4F"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M46.011 47.7439C47.4881 48.2694 47.5371 49.4676 48.1425 50.5578C47.9012 50.6184 47.6557 50.6614 47.4082 50.6867C46.0419 50.6867 46.814 48.6253 44.7736 48.289V50.6867C44.7736 50.6867 43.4844 50.6867 43.4844 50.0421V43.0465C43.4844 43.0465 44.7736 43.0465 44.7736 43.6911V47.2982C45.358 47.2086 45.6845 46.7727 46.1302 45.9305C46.3193 45.5732 46.6907 45.4442 47.0817 45.4442C47.3199 45.4489 47.556 45.489 47.7824 45.5634C47.24 46.3061 46.9037 47.3865 46.011 47.7439Z",
                  fill: "#4D4D4F"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M51.6206 47.0307C51.6206 46.6733 51.4216 46.3566 50.6592 46.3566C49.8268 46.3566 49.0743 46.6369 49.0743 47.4777C48.7856 47.0909 48.6973 46.784 48.6973 46.5164C48.6973 45.6545 49.8563 45.3953 50.669 45.3953C52.1251 45.3953 52.8986 46.0091 52.8986 47.0895V50.712C52.6603 50.5991 52.3984 50.5448 52.1349 50.5537C51.6402 50.5537 51.1441 50.7317 50.5794 50.7317C49.5592 50.7317 48.5586 50.3547 48.5586 49.1761C48.5586 47.3277 51.2142 47.8126 51.6206 47.0307ZM51.65 48.041C51.4216 48.5666 49.8366 48.2793 49.8366 49.1621C49.8366 49.6078 50.1632 49.8362 50.7279 49.8362C51.0439 49.8362 51.357 49.7753 51.65 49.6568V48.041Z",
                  fill: "#4D4D4F"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M57.2093 47.1792C57.2093 46.6537 56.9613 46.3566 56.2578 46.3566C55.9389 46.3599 55.6221 46.4071 55.3161 46.4967V50.6868C55.3161 50.6868 54.0282 50.6868 54.0282 50.0422V45.3953C54.3062 45.5298 54.6106 45.6007 54.9195 45.6027C55.4057 45.6027 55.8612 45.3953 56.3965 45.3953C57.4167 45.3953 58.4986 45.7414 58.4986 47.0307V50.6868C58.4986 50.6868 57.2107 50.6672 57.2107 50.0422L57.2093 47.1792Z",
                  fill: "#4D4D4F"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M29.8406 42.6191C29.8406 42.6191 34.4371 42.2814 34.4371 46.2486C34.4371 50.2159 33.2221 51.0133 32.157 51.2641C32.157 51.2641 36.5881 52.332 36.5881 46.7503C36.5881 41.1687 30.9364 41.9745 29.8406 42.6191Z",
                  fill: "#F2634D"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M33.5781 49.3681C33.5781 49.3681 33.1352 50.9082 31.7899 51.103C30.4446 51.2978 30.2022 50.5719 29.2675 50.6209C29.2568 50.522 29.266 50.422 29.2945 50.3267C29.323 50.2314 29.3702 50.1427 29.4333 50.0658C29.4965 49.989 29.5743 49.9255 29.6623 49.8791C29.7503 49.8327 29.8466 49.8042 29.9457 49.7955C30.7011 49.6932 32.115 49.8922 33.0554 49.298C33.0554 49.298 33.6159 49.0065 33.721 48.865L33.5781 49.3681Z",
                  fill: "#F2634D"
                }
              }),
              _vm._v(" "),
              _c("path", {
                attrs: {
                  d:
                    "M29.7705 42.8966V44.8066V49.5615C29.8165 49.549 29.8634 49.5397 29.9106 49.5334C30.1755 49.505 30.4417 49.491 30.708 49.4914C30.9883 49.4914 31.2868 49.4802 31.5895 49.4536V47.2086C31.5895 46.4644 31.5432 45.7021 31.5895 44.9664C31.6149 44.7457 31.7 44.5361 31.8355 44.36C31.971 44.184 32.152 44.0482 32.3588 43.9672C32.5252 43.9058 32.7028 43.8801 32.8798 43.892C33.0568 43.9038 33.2293 43.9528 33.386 44.0359C32.3334 43.2799 31.0664 42.8807 29.7705 42.8966Z",
                  fill: "#F2634D"
                }
              }),
              _vm._v(" "),
              _c(
                "defs",
                [
                  _c(
                    "filter",
                    {
                      attrs: {
                        id: "filter0_d_248_61",
                        x: "1.43361",
                        y: "0.796654",
                        width: "197.373",
                        height: "167.079",
                        filterUnits: "userSpaceOnUse",
                        "color-interpolation-filters": "sRGB"
                      }
                    },
                    [
                      _c("feFlood", {
                        attrs: {
                          "flood-opacity": "0",
                          result: "BackgroundImageFix"
                        }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          in: "SourceAlpha",
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                          result: "hardAlpha"
                        }
                      }),
                      _vm._v(" "),
                      _c("feOffset", { attrs: { dy: "13.5042" } }),
                      _vm._v(" "),
                      _c("feGaussianBlur", {
                        attrs: { stdDeviation: "18.6357" }
                      }),
                      _vm._v(" "),
                      _c("feComposite", {
                        attrs: { in2: "hardAlpha", operator: "out" }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in2: "BackgroundImageFix",
                          result: "effect1_dropShadow_248_61"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in: "SourceGraphic",
                          in2: "effect1_dropShadow_248_61",
                          result: "shape"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "filter",
                    {
                      attrs: {
                        id: "filter1_d_248_61",
                        x: "113.644",
                        y: "28.4061",
                        width: "105.219",
                        height: "105.219",
                        filterUnits: "userSpaceOnUse",
                        "color-interpolation-filters": "sRGB"
                      }
                    },
                    [
                      _c("feFlood", {
                        attrs: {
                          "flood-opacity": "0",
                          result: "BackgroundImageFix"
                        }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          in: "SourceAlpha",
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                          result: "hardAlpha"
                        }
                      }),
                      _vm._v(" "),
                      _c("feOffset", { attrs: { dy: "9.92629" } }),
                      _vm._v(" "),
                      _c("feGaussianBlur", {
                        attrs: { stdDeviation: "9.67814" }
                      }),
                      _vm._v(" "),
                      _c("feComposite", {
                        attrs: { in2: "hardAlpha", operator: "out" }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.11 0"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in2: "BackgroundImageFix",
                          result: "effect1_dropShadow_248_61"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in: "SourceGraphic",
                          in2: "effect1_dropShadow_248_61",
                          result: "shape"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "filter",
                    {
                      attrs: {
                        id: "filter2_d_248_61",
                        x: "131.878",
                        y: "65.3495",
                        width: "68.4692",
                        height: "41.6322",
                        filterUnits: "userSpaceOnUse",
                        "color-interpolation-filters": "sRGB"
                      }
                    },
                    [
                      _c("feFlood", {
                        attrs: {
                          "flood-opacity": "0",
                          result: "BackgroundImageFix"
                        }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          in: "SourceAlpha",
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                          result: "hardAlpha"
                        }
                      }),
                      _vm._v(" "),
                      _c("feOffset", { attrs: { dy: "13.6395" } }),
                      _vm._v(" "),
                      _c("feGaussianBlur", {
                        attrs: { stdDeviation: "6.99175" }
                      }),
                      _vm._v(" "),
                      _c("feComposite", {
                        attrs: { in2: "hardAlpha", operator: "out" }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          type: "matrix",
                          values:
                            "0 0 0 0 0.633333 0 0 0 0 0.0860081 0 0 0 0 0 0 0 0 0.38 0"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in2: "BackgroundImageFix",
                          result: "effect1_dropShadow_248_61"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in: "SourceGraphic",
                          in2: "effect1_dropShadow_248_61",
                          result: "shape"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "filter",
                    {
                      attrs: {
                        id: "filter3_d_248_61",
                        x: "0.094183",
                        y: "29.7392",
                        width: "88.0471",
                        height: "55.0969",
                        filterUnits: "userSpaceOnUse",
                        "color-interpolation-filters": "sRGB"
                      }
                    },
                    [
                      _c("feFlood", {
                        attrs: {
                          "flood-opacity": "0",
                          result: "BackgroundImageFix"
                        }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          in: "SourceAlpha",
                          type: "matrix",
                          values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                          result: "hardAlpha"
                        }
                      }),
                      _vm._v(" "),
                      _c("feOffset", { attrs: { dy: "10.2632" } }),
                      _vm._v(" "),
                      _c("feGaussianBlur", {
                        attrs: { stdDeviation: "9.45291" }
                      }),
                      _vm._v(" "),
                      _c("feComposite", {
                        attrs: { in2: "hardAlpha", operator: "out" }
                      }),
                      _vm._v(" "),
                      _c("feColorMatrix", {
                        attrs: {
                          type: "matrix",
                          values:
                            "0 0 0 0 0 0 0 0 0 0.095 0 0 0 0 0.2375 0 0 0 0.25 0"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in2: "BackgroundImageFix",
                          result: "effect1_dropShadow_248_61"
                        }
                      }),
                      _vm._v(" "),
                      _c("feBlend", {
                        attrs: {
                          mode: "normal",
                          in: "SourceGraphic",
                          in2: "effect1_dropShadow_248_61",
                          result: "shape"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "linearGradient",
                    {
                      attrs: {
                        id: "paint0_linear_248_61",
                        x1: "216.161",
                        y1: "71.332",
                        x2: "122.442",
                        y2: "71.332",
                        gradientUnits: "userSpaceOnUse"
                      }
                    },
                    [
                      _c("stop", { attrs: { "stop-color": "#FFA5A5" } }),
                      _vm._v(" "),
                      _c("stop", {
                        attrs: {
                          offset: "1",
                          "stop-color": "#FFA5A5",
                          "stop-opacity": "0"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "linearGradient",
                    {
                      attrs: {
                        id: "paint1_linear_248_61",
                        x1: "218.051",
                        y1: "74.8431",
                        x2: "133.515",
                        y2: "74.3029",
                        gradientUnits: "userSpaceOnUse"
                      }
                    },
                    [
                      _c("stop", { attrs: { "stop-color": "#FF6262" } }),
                      _vm._v(" "),
                      _c("stop", {
                        attrs: {
                          offset: "1",
                          "stop-color": "#FF6262",
                          "stop-opacity": "0"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "linearGradient",
                    {
                      attrs: {
                        id: "paint2_linear_248_61",
                        x1: "212.38",
                        y1: "71.3321",
                        x2: "133.245",
                        y2: "71.3321",
                        gradientUnits: "userSpaceOnUse"
                      }
                    },
                    [
                      _c("stop", { attrs: { "stop-color": "#FE6868" } }),
                      _vm._v(" "),
                      _c("stop", {
                        attrs: {
                          offset: "1",
                          "stop-color": "#FE6868",
                          "stop-opacity": "0"
                        }
                      })
                    ],
                    1
                  ),
                  _vm._v(" "),
                  _c(
                    "linearGradient",
                    {
                      attrs: {
                        id: "paint3_linear_248_61",
                        x1: "166.253",
                        y1: "28.3761",
                        x2: "166.253",
                        y2: "104.342",
                        gradientUnits: "userSpaceOnUse"
                      }
                    },
                    [
                      _c("stop", { attrs: { "stop-color": "#FF9F8F" } }),
                      _vm._v(" "),
                      _c("stop", {
                        attrs: { offset: "1", "stop-color": "#F95F47" }
                      })
                    ],
                    1
                  )
                ],
                1
              )
            ]
          )
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "content" }, [
          _c("div", { staticClass: "details" }, [
            _c("h3", [
              _vm._v(_vm._s(_vm.__("Dokan Premium", "dokan-lite")) + " "),
              _c("span", { staticClass: "dokan-offer" }, [
                _vm._v(_vm._s(_vm.__("Enjoy", "dokan-lite")) + " "),
                _c("span", { staticClass: "penchant-off" }, [
                  _vm._v(_vm._s(_vm.__("30%", "dokan-lite")))
                ]),
                _vm._v(_vm._s(_vm.__("OFF", "dokan-lite")))
              ])
            ]),
            _vm._v(" "),
            _c("p", [
              _vm._v(
                _vm._s(
                  _vm.__(
                    "Unleash the full potential of your marketplace with more premium features.",
                    "dokan-lite"
                  )
                )
              )
            ])
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "features" }, [
            _c("label", [
              _vm._v(
                "\n                " +
                  _vm._s(_vm.__("Table rate shipping", "dokan-lite")) +
                  "\n                "
              ),
              _c("span")
            ]),
            _vm._v(" "),
            _c("label", [
              _vm._v(
                "\n                " +
                  _vm._s(_vm.__("Vendor Reviews", "dokan-lite")) +
                  "\n                "
              ),
              _c("span")
            ]),
            _vm._v(" "),
            _c("label", { staticClass: "hidden-sm" }, [
              _vm._v(
                "\n                " +
                  _vm._s(_vm.__("Product Subscriptions", "dokan-lite")) +
                  "\n                "
              ),
              _c("span")
            ]),
            _vm._v(" "),
            _c("label", { staticClass: "hidden-sm" }, [
              _vm._v(
                "\n                " +
                  _vm._s(_vm.__("Auction", "dokan-lite")) +
                  "\n                "
              ),
              _c("span")
            ]),
            _vm._v(" "),
            _c("label", { staticClass: "hidden-sm" }, [
              _vm._v(
                "\n                " +
                  _vm._s(_vm.__("Delivery Time", "dokan-lite")) +
                  "\n                "
              ),
              _c("span")
            ]),
            _vm._v(" "),
            _c(
              "a",
              {
                attrs: {
                  target: "_blank",
                  href: "https://wedevs.com/dokan/modules"
                }
              },
              [_vm._v(_vm._s(_vm.__("See All Premium Modules", "dokan-lite")))]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "btn-upgrade" }, [
          _c(
            "a",
            {
              attrs: {
                target: "_blank",
                href:
                  "https://wedevs.com/dokan-lite-upgrade-to-pro/?utm_source=dokan-plugin-dashboard&utm_medium=wp-admin-promotion&utm_campaign=dokan-lite"
              }
            },
            [_vm._v(_vm._s(_vm.__("Upgrade to Premium", "dokan-lite")))]
          )
        ]),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "close-banner",
            on: {
              click: function($event) {
                return _vm.dismiss()
              }
            }
          },
          [_c("span", { staticClass: "dashicons dashicons-no-alt" })]
        )
      ])
    : _vm._e()
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-75a73b30", esExports)
  }
}

/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-dashboard" },
    [
      _c("h1", [_vm._v(_vm._s(_vm.__("Dashboard", "dokan-lite")))]),
      _vm._v(" "),
      _c("AdminNotice"),
      _vm._v(" "),
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _c("div", { staticClass: "widgets-wrapper" }, [
        _c(
          "div",
          { staticClass: "left-side" },
          [
            _c(
              "postbox",
              {
                attrs: {
                  title: _vm.__("At a Glance", "dokan-lite"),
                  extraClass: "dokan-status"
                }
              },
              [
                _vm.overview !== null
                  ? _c("div", { staticClass: "dokan-status" }, [
                      _c("ul", [
                        _c(
                          "li",
                          { staticClass: "sale" },
                          [
                            _c("div", {
                              staticClass: "dashicons dashicons-chart-bar"
                            }),
                            _vm._v(" "),
                            _c(
                              "router-link",
                              {
                                attrs: {
                                  to: _vm.hasPro ? { name: "Reports" } : ""
                                }
                              },
                              [
                                _c(
                                  "strong",
                                  [
                                    _c("currency", {
                                      attrs: {
                                        amount: _vm.overview.sales.this_month
                                      }
                                    })
                                  ],
                                  1
                                ),
                                _vm._v(" "),
                                _c("div", { staticClass: "details" }, [
                                  _vm._v(
                                    "\n                                    " +
                                      _vm._s(
                                        _vm.__(
                                          "net sales this month",
                                          "dokan-lite"
                                        )
                                      ) +
                                      " "
                                  ),
                                  _c(
                                    "span",
                                    { class: _vm.overview.sales.class },
                                    [_vm._v(_vm._s(_vm.overview.sales.parcent))]
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c(
                          "li",
                          { staticClass: "commission" },
                          [
                            _c("div", {
                              staticClass: "dashicons dashicons-chart-pie"
                            }),
                            _vm._v(" "),
                            _c(
                              "router-link",
                              {
                                attrs: {
                                  to: _vm.hasPro ? { name: "Reports" } : ""
                                }
                              },
                              [
                                _c(
                                  "strong",
                                  [
                                    _c("currency", {
                                      attrs: {
                                        amount: _vm.overview.earning.this_month
                                      }
                                    })
                                  ],
                                  1
                                ),
                                _vm._v(" "),
                                _c("div", { staticClass: "details" }, [
                                  _vm._v(
                                    "\n                                    " +
                                      _vm._s(
                                        _vm.__(
                                          "commission earned",
                                          "dokan-lite"
                                        )
                                      ) +
                                      " "
                                  ),
                                  _c(
                                    "span",
                                    { class: _vm.overview.earning.class },
                                    [
                                      _vm._v(
                                        _vm._s(_vm.overview.earning.parcent)
                                      )
                                    ]
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c(
                          "li",
                          { staticClass: "vendor" },
                          [
                            _c("div", {
                              staticClass: "dashicons dashicons-id"
                            }),
                            _vm._v(" "),
                            _c(
                              "router-link",
                              {
                                attrs: {
                                  to: _vm.hasPro ? { name: "Vendors" } : ""
                                }
                              },
                              [
                                _c("strong", [
                                  _vm._v(
                                    _vm._s(_vm.overview.vendors.this_month) +
                                      " " +
                                      _vm._s(_vm.__("Vendor", "dokan-lite"))
                                  )
                                ]),
                                _vm._v(" "),
                                _c("div", { staticClass: "details" }, [
                                  _vm._v(
                                    "\n                                    " +
                                      _vm._s(
                                        _vm.__(
                                          "signup this month",
                                          "dokan-lite"
                                        )
                                      ) +
                                      " "
                                  ),
                                  _c(
                                    "span",
                                    { class: _vm.overview.vendors.class },
                                    [
                                      _vm._v(
                                        _vm._s(_vm.overview.vendors.parcent)
                                      )
                                    ]
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c(
                          "li",
                          { staticClass: "approval" },
                          [
                            _c("div", {
                              staticClass: "dashicons dashicons-businessman"
                            }),
                            _vm._v(" "),
                            _c(
                              "router-link",
                              {
                                attrs: {
                                  to: _vm.hasPro
                                    ? {
                                        name: "Vendors",
                                        query: { status: "pending" }
                                      }
                                    : ""
                                }
                              },
                              [
                                _c("strong", [
                                  _vm._v(
                                    _vm._s(_vm.overview.vendors.inactive) +
                                      " " +
                                      _vm._s(_vm.__("Vendor", "dokan-lite"))
                                  )
                                ]),
                                _vm._v(" "),
                                _c("div", { staticClass: "details" }, [
                                  _vm._v(
                                    _vm._s(
                                      _vm.__("awaiting approval", "dokan-lite")
                                    )
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c("li", { staticClass: "product" }, [
                          _c("div", {
                            staticClass: "dashicons dashicons-cart"
                          }),
                          _vm._v(" "),
                          _c("a", { attrs: { href: "#" } }, [
                            _c("strong", [
                              _vm._v(
                                _vm._s(_vm.overview.products.this_month) +
                                  " " +
                                  _vm._s(_vm.__("Products", "dokan-lite"))
                              )
                            ]),
                            _vm._v(" "),
                            _c("div", { staticClass: "details" }, [
                              _vm._v(
                                "\n                                    " +
                                  _vm._s(
                                    _vm.__("created this month", "dokan-lite")
                                  ) +
                                  " "
                              ),
                              _c(
                                "span",
                                { class: _vm.overview.products.class },
                                [_vm._v(_vm._s(_vm.overview.products.parcent))]
                              )
                            ])
                          ])
                        ]),
                        _vm._v(" "),
                        _c(
                          "li",
                          { staticClass: "withdraw" },
                          [
                            _c("div", {
                              staticClass: "dashicons dashicons-money"
                            }),
                            _vm._v(" "),
                            _c(
                              "router-link",
                              {
                                attrs: {
                                  to: {
                                    name: "Withdraw",
                                    query: { status: "pending" }
                                  }
                                }
                              },
                              [
                                _c("strong", [
                                  _vm._v(
                                    _vm._s(_vm.overview.withdraw.pending) +
                                      " " +
                                      _vm._s(
                                        _vm.__("Withdrawals", "dokan-lite")
                                      )
                                  )
                                ]),
                                _vm._v(" "),
                                _c("div", { staticClass: "details" }, [
                                  _vm._v(
                                    _vm._s(
                                      _vm.__("awaiting approval", "dokan-lite")
                                    )
                                  )
                                ])
                              ]
                            )
                          ],
                          1
                        )
                      ])
                    ])
                  : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
              ]
            ),
            _vm._v(" "),
            _c(
              "postbox",
              { attrs: { title: _vm.__("Dokan News Updates", "dokan-lite") } },
              [
                _vm.feed !== null
                  ? _c("div", { staticClass: "rss-widget" }, [
                      _c(
                        "ul",
                        _vm._l(_vm.feed, function(news) {
                          return _c("li", [
                            _c(
                              "a",
                              {
                                attrs: {
                                  href:
                                    news.link +
                                    "?utm_source=wp-admin&utm_campaign=dokan-news",
                                  target: "_blank"
                                }
                              },
                              [_vm._v(_vm._s(news.title))]
                            )
                          ])
                        }),
                        0
                      ),
                      _vm._v(" "),
                      _c(
                        "div",
                        { staticClass: "subscribe-box" },
                        [
                          !_vm.subscribe.success
                            ? [
                                _vm.subscribe.loading
                                  ? _c(
                                      "div",
                                      { staticClass: "loading" },
                                      [_c("loading")],
                                      1
                                    )
                                  : _vm._e(),
                                _vm._v(" "),
                                _c("h3", [
                                  _vm._v(
                                    _vm._s(
                                      _vm.__("Stay up-to-date", "dokan-lite")
                                    )
                                  )
                                ]),
                                _vm._v(" "),
                                _c("p", [
                                  _vm._v(
                                    "\n                                " +
                                      _vm._s(
                                        _vm.__(
                                          "We're constantly developing new features, stay up-to-date by subscribing to our newsletter.",
                                          "dokan-lite"
                                        )
                                      ) +
                                      "\n                            "
                                  )
                                ]),
                                _vm._v(" "),
                                _c("div", { staticClass: "form-wrap" }, [
                                  _c("input", {
                                    directives: [
                                      {
                                        name: "model",
                                        rawName: "v-model",
                                        value: _vm.subscribe.full_name,
                                        expression: "subscribe.full_name"
                                      }
                                    ],
                                    attrs: {
                                      type: "text",
                                      placeholder: _vm.__(
                                        "Your Name",
                                        "dokan-lite"
                                      )
                                    },
                                    domProps: {
                                      value: _vm.subscribe.full_name
                                    },
                                    on: {
                                      input: function($event) {
                                        if ($event.target.composing) {
                                          return
                                        }
                                        _vm.$set(
                                          _vm.subscribe,
                                          "full_name",
                                          $event.target.value
                                        )
                                      }
                                    }
                                  }),
                                  _vm._v(" "),
                                  _c("input", {
                                    directives: [
                                      {
                                        name: "model",
                                        rawName: "v-model",
                                        value: _vm.subscribe.email,
                                        expression: "subscribe.email"
                                      }
                                    ],
                                    attrs: {
                                      type: "email",
                                      placeholder: _vm.__(
                                        "Your Email Address",
                                        "dokan-lite"
                                      )
                                    },
                                    domProps: { value: _vm.subscribe.email },
                                    on: {
                                      keyup: function($event) {
                                        if (
                                          !$event.type.indexOf("key") &&
                                          _vm._k(
                                            $event.keyCode,
                                            "enter",
                                            13,
                                            $event.key,
                                            "Enter"
                                          )
                                        ) {
                                          return null
                                        }
                                        return _vm.emailSubscribe()
                                      },
                                      input: function($event) {
                                        if ($event.target.composing) {
                                          return
                                        }
                                        _vm.$set(
                                          _vm.subscribe,
                                          "email",
                                          $event.target.value
                                        )
                                      }
                                    }
                                  }),
                                  _vm._v(" "),
                                  _c(
                                    "button",
                                    {
                                      staticClass: "button",
                                      on: {
                                        click: function($event) {
                                          return _vm.emailSubscribe()
                                        }
                                      }
                                    },
                                    [
                                      _vm._v(
                                        _vm._s(
                                          _vm.__("Subscribe", "dokan-lite")
                                        )
                                      )
                                    ]
                                  )
                                ])
                              ]
                            : _c("div", { staticClass: "thank-you" }, [
                                _vm._v(
                                  _vm._s(
                                    _vm.__(
                                      "Thank you for subscribing!",
                                      "dokan-lite"
                                    )
                                  )
                                )
                              ])
                        ],
                        2
                      )
                    ])
                  : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
              ]
            )
          ],
          1
        ),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "right-side" },
          [
            _c(
              "postbox",
              {
                staticClass: "overview-chart",
                attrs: { title: _vm.__("Overview", "dokan-lite") }
              },
              [
                _vm.report !== null
                  ? _c("div", [_c("chart", { attrs: { data: _vm.report } })], 1)
                  : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
              ]
            )
          ],
          1
        )
      ])
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-219ffca0", esExports)
  }
}

/***/ }),
/* 137 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__ = __webpack_require__(56);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__ = __webpack_require__(139);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(138)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Withdraw.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-62373ea4", Component.options)
  } else {
    hotAPI.reload("data-v-62373ea4", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 138 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 139 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticClass: "withdraw-requests" },
      [
        _c("h1", [_vm._v(_vm._s(_vm.__("Withdraw Requests", "dokan-lite")))]),
        _vm._v(" "),
        _c("AdminNotice"),
        _vm._v(" "),
        !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
        _vm._v(" "),
        _vm.showModal
          ? _c(
              "modal",
              {
                attrs: { title: _vm.__("Update Note", "dokan-lite") },
                on: {
                  close: function($event) {
                    _vm.showModal = false
                  }
                }
              },
              [
                _c("template", { slot: "body" }, [
                  _c("textarea", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.editing.note,
                        expression: "editing.note"
                      }
                    ],
                    attrs: { rows: "3" },
                    domProps: { value: _vm.editing.note },
                    on: {
                      input: function($event) {
                        if ($event.target.composing) {
                          return
                        }
                        _vm.$set(_vm.editing, "note", $event.target.value)
                      }
                    }
                  })
                ]),
                _vm._v(" "),
                _c("template", { slot: "footer" }, [
                  _c(
                    "button",
                    {
                      staticClass: "button button-primary button-large",
                      on: {
                        click: function($event) {
                          return _vm.updateNote()
                        }
                      }
                    },
                    [_vm._v(_vm._s(_vm.__("Update Note", "dokan-lite")))]
                  )
                ])
              ],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _c("ul", { staticClass: "subsubsub" }, [
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  class: { current: _vm.currentStatus === "pending" },
                  attrs: {
                    to: { name: "Withdraw", query: { status: "pending" } }
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("Pending", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.pending))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  class: { current: _vm.currentStatus === "approved" },
                  attrs: {
                    to: { name: "Withdraw", query: { status: "approved" } }
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("Approved", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.approved))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  class: { current: _vm.currentStatus === "cancelled" },
                  attrs: {
                    to: { name: "Withdraw", query: { status: "cancelled" } }
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("Cancelled", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.cancelled))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          )
        ]),
        _vm._v(" "),
        _c(
          "list-table",
          {
            attrs: {
              columns: _vm.columns,
              rows: _vm.requests,
              loading: _vm.loading,
              "action-column": _vm.actionColumn,
              actions: _vm.actions,
              "show-cb": _vm.showCb,
              "bulk-actions": _vm.bulkActions,
              "not-found": _vm.notFound,
              "total-pages": _vm.totalPages,
              "total-items": _vm.totalItems,
              "per-page": _vm.perPage,
              "current-page": _vm.currentPage,
              text: _vm.$root.listTableTexts()
            },
            on: {
              pagination: _vm.goToPage,
              "action:click": _vm.onActionClick,
              "bulk:click": _vm.onBulkAction
            },
            scopedSlots: _vm._u([
              {
                key: "seller",
                fn: function(data) {
                  return [
                    _c("img", {
                      attrs: {
                        src: data.row.user.gravatar,
                        alt: data.row.user.store_name,
                        width: "50"
                      }
                    }),
                    _vm._v(" "),
                    _c("strong", [
                      _c(
                        "a",
                        { attrs: { href: _vm.vendorUrl(data.row.user.id) } },
                        [
                          _vm._v(
                            _vm._s(
                              data.row.user.store_name
                                ? data.row.user.store_name
                                : _vm.__("(no name)", "dokan-lite")
                            )
                          )
                        ]
                      )
                    ])
                  ]
                }
              },
              {
                key: "vendor",
                fn: function(ref) {
                  var row = ref.row
                  return [
                    _c(
                      "router-link",
                      { attrs: { to: "/vendors/" + row.vendor.id } },
                      [
                        _vm._v(
                          "\n                    " +
                            _vm._s(
                              row.vendor.name
                                ? row.vendor.name
                                : _vm.__("(no name)", "dokan-lite")
                            ) +
                            "\n                "
                        )
                      ]
                    )
                  ]
                }
              },
              {
                key: "amount",
                fn: function(data) {
                  return [
                    _c("currency", { attrs: { amount: data.row.amount } })
                  ]
                }
              },
              {
                key: "status",
                fn: function(data) {
                  return [
                    _c("span", { class: data.row.status }, [
                      _vm._v(_vm._s(_vm._f("capitalize")(data.row.status)))
                    ])
                  ]
                }
              },
              {
                key: "created",
                fn: function(data) {
                  return [
                    _vm._v(
                      "\n                " +
                        _vm._s(
                          _vm.moment(data.row.created).format("MMM D, YYYY")
                        ) +
                        "\n            "
                    )
                  ]
                }
              },
              {
                key: "method_title",
                fn: function(data) {
                  return [
                    _c("div", {
                      staticClass: "method_title_inner",
                      domProps: {
                        innerHTML: _vm._s(
                          _vm.getPaymentTitle(data.row.method, data.row)
                        )
                      }
                    })
                  ]
                }
              },
              {
                key: "method_details",
                fn: function(data) {
                  return [
                    _c("div", {
                      staticClass: "method_details_inner",
                      domProps: {
                        innerHTML: _vm._s(
                          _vm.getPaymentDetails(
                            data.row.method,
                            data.row.details
                          )
                        )
                      }
                    })
                  ]
                }
              },
              {
                key: "actions",
                fn: function(data) {
                  return [
                    data.row.status === "pending"
                      ? [
                          _c("div", { staticClass: "button-group" }, [
                            _c(
                              "button",
                              {
                                staticClass: "button button-small",
                                attrs: {
                                  title: _vm.__("Approve Request", "dokan-lite")
                                },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.changeStatus(
                                      "approved",
                                      data.row.id
                                    )
                                  }
                                }
                              },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-yes"
                                })
                              ]
                            ),
                            _vm._v(" "),
                            _c(
                              "button",
                              {
                                staticClass: "button button-small",
                                attrs: {
                                  title: _vm.__("Add Note", "dokan-lite")
                                },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.openNoteModal(
                                      data.row.note,
                                      data.row.id
                                    )
                                  }
                                }
                              },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-testimonial"
                                })
                              ]
                            )
                          ])
                        ]
                      : data.row.status === "approved"
                      ? [
                          _c("div", { staticClass: "button-group" }, [
                            _c(
                              "button",
                              {
                                staticClass: "button button-small",
                                attrs: {
                                  title: _vm.__("Add Note", "dokan-lite")
                                },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.openNoteModal(
                                      data.row.note,
                                      data.row.id
                                    )
                                  }
                                }
                              },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-testimonial"
                                })
                              ]
                            )
                          ])
                        ]
                      : [
                          _c("div", { staticClass: "button-group" }, [
                            _c(
                              "button",
                              {
                                staticClass: "button button-small",
                                attrs: {
                                  title: _vm.__("Mark as Pending", "dokan-lite")
                                },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.changeStatus(
                                      "pending",
                                      data.row.id
                                    )
                                  }
                                }
                              },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-backup"
                                })
                              ]
                            ),
                            _vm._v(" "),
                            _c(
                              "button",
                              {
                                staticClass: "button button-small",
                                attrs: {
                                  title: _vm.__("Add Note", "dokan-lite")
                                },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.openNoteModal(
                                      data.row.note,
                                      data.row.id
                                    )
                                  }
                                }
                              },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-testimonial"
                                })
                              ]
                            )
                          ])
                        ]
                  ]
                }
              }
            ])
          },
          [
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _c("template", { slot: "filters" }, [
              _c("select", {
                staticStyle: { width: "190px" },
                attrs: {
                  id: "filter-vendors",
                  "data-placeholder": _vm.__("Filter by vendor", "dokan-lite")
                }
              }),
              _vm._v(" "),
              _vm.filter.user_id
                ? _c(
                    "button",
                    {
                      staticClass: "button",
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          _vm.filter.user_id = 0
                        }
                      }
                    },
                    [_vm._v("×")]
                  )
                : _vm._e()
            ])
          ],
          2
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-62373ea4", esExports)
  }
}

/***/ }),
/* 140 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__ = __webpack_require__(57);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__ = __webpack_require__(149);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(141)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Premium.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b38fd83a", Component.options)
  } else {
    hotAPI.reload("data-v-b38fd83a", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 141 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 142 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 143 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      staticClass: "cta-section",
      style: {
        "background-image":
          "url(" +
          _vm.styles.bgPattern +
          "), linear-gradient( 45deg, rgb(255,125,144) 33%, rgb(255,173,111) 100%)"
      }
    },
    [
      _c("div", { staticClass: "feature-thumb" }, [
        _c("img", { attrs: { src: _vm.thumbnail, alt: "Dokan Lite" } })
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "content-area" }, [
        _c("h2", [_vm._v(_vm._s(_vm.__("Convinced?", "dokan-lite")))]),
        _vm._v(" "),
        _c("p", [
          _vm._v(
            _vm._s(
              _vm.__(
                "With all the advance features you get it’s hard to resist buying Dokan Pro.",
                "dokan-lite"
              )
            )
          )
        ]),
        _vm._v(" "),
        _c(
          "a",
          { staticClass: "btn", attrs: { href: _vm.url, target: "_blank" } },
          [
            _vm._v(
              "\n            " +
                _vm._s(_vm.__("Upgrade to Pro", "dokan-lite")) +
                "\n            "
            ),
            _c(
              "svg",
              {
                staticStyle: { "enable-background": "new 0 0 17.5 12.5" },
                attrs: {
                  version: "1.1",
                  id: "Layer_1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  x: "0px",
                  y: "0px",
                  viewBox: "0 0 17.5 12.5",
                  "xml:space": "preserve"
                }
              },
              [
                _c("path", {
                  staticClass: "st0",
                  attrs: {
                    d:
                      "M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7\n                l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z\n                 M10.6,1.5"
                  }
                })
              ]
            )
          ]
        )
      ])
    ]
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1ccc06d3", esExports)
  }
}

/***/ }),
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-pro-features" },
    [
      _c("div", { staticClass: "header-section" }, [
        _c("div", { staticClass: "feature-thumb" }, [
          _c("img", {
            attrs: {
              src:
                _vm.asstesUrl + "/images/premium/header-feature-thumb@2x.png",
              alt: _vm.__("Upgrade to Dokan Pro!", "dokan-lite"),
              title: _vm.__("Upgrade to Dokan Pro!", "dokan-lite")
            }
          })
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "content-area" }, [
          _c("h1", [
            _vm._v(_vm._s(_vm.__("Upgrade to Dokan Pro!", "dokan-lite")))
          ]),
          _vm._v(" "),
          _c("p", [
            _vm._v(
              _vm._s(
                _vm.__(
                  "Seems To Be Convinced, You Need More Out Of Your Marketplace",
                  "dokan-lite"
                )
              )
            )
          ])
        ])
      ]),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "vendor-capabilities-banner", style: _vm.bannerBg },
        [
          _c("img", {
            attrs: {
              src: _vm.bannerImage,
              alt: _vm.__("Dokan Vendor Capabilities Banner", "dokan-lite")
            }
          }),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "content" },
            [
              _c("p", { staticClass: "title" }, [
                _vm._v(_vm._s(_vm.__("Vendor Capabilities", "dokan-lite")))
              ]),
              _vm._v(" "),
              _c("p", [
                _vm._v(
                  "\n                " +
                    _vm._s(
                      _vm.__(
                        "One of the finest attractions of Dokan PRO is the vast array of powerful vendor controls & functions it provides so sellers can enjoy ownership, automation & freedom to run their stores. To use these awesome vendor features listed below, consider Upgrading to PRO.",
                        "dokan-lite"
                      )
                    ) +
                    "\n            "
                )
              ]),
              _vm._v(" "),
              _c(
                "router-link",
                {
                  staticClass: "button",
                  attrs: { to: { name: "VendorCapabilities" } }
                },
                [
                  _vm._v(
                    "\n                " +
                      _vm._s(
                        _vm.__(
                          "Check Out All Vendor Functionalities",
                          "dokan-lite"
                        )
                      ) +
                      "\n            "
                  )
                ]
              )
            ],
            1
          )
        ]
      ),
      _vm._v(" "),
      _c("div", { staticClass: "service-section" }, [
        _c("h2", { staticClass: "section-title" }, [
          _vm._v(_vm._s(_vm.__("Why Upgrade", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "service-list" },
          _vm._l(_vm.services, function(service) {
            return _c("div", { staticClass: "service-box" }, [
              _c("div", { staticClass: "service-thumb" }, [
                _c("img", {
                  attrs: {
                    src: service.thumbnail,
                    alt: service.title,
                    title: service.title
                  }
                })
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "service-detail" }, [
                _c("h3", { staticClass: "title" }, [
                  _vm._v(_vm._s(service.title))
                ])
              ])
            ])
          }),
          0
        ),
        _vm._v(" "),
        _c(
          "a",
          {
            staticClass: "btn",
            attrs: {
              href: "https://wedevs.com/dokan/features/",
              target: "_blank"
            }
          },
          [
            _vm._v(
              "\n            " +
                _vm._s(_vm.__("And Many More", "dokan-lite")) +
                "\n            "
            ),
            _c(
              "svg",
              {
                staticStyle: { "enable-background": "new 0 0 17.5 12.5" },
                attrs: {
                  version: "1.1",
                  id: "Layer_1",
                  xmlns: "http://www.w3.org/2000/svg",
                  "xmlns:xlink": "http://www.w3.org/1999/xlink",
                  x: "0px",
                  y: "0px",
                  viewBox: "0 0 17.5 12.5",
                  "xml:space": "preserve"
                }
              },
              [
                _c("path", {
                  staticClass: "st0",
                  attrs: {
                    d:
                      "M10.6,1.5c-0.4-0.4-0.4-0.9,0-1.3c0.4-0.3,0.9-0.3,1.3,0l5.3,5.3c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7\n                    l-5.3,5.3c-0.4,0.4-0.9,0.4-1.3,0c-0.4-0.4-0.4-0.9,0-1.3l3.8-3.8H0.9C0.4,7.1,0,6.7,0,6.2s0.4-0.9,0.9-0.9h13.5L10.6,1.5z\n                     M10.6,1.5"
                  }
                })
              ]
            )
          ]
        )
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "comparison-section" }, [
        _c("h2", { staticClass: "section-title" }, [
          _vm._v(_vm._s(_vm.__("Comparison With Dokan PRO", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "comparison-area" }, [
          _c("div", { staticClass: "compare-box dokan-lite" }, [
            _c("div", { staticClass: "logo-section" }, [
              _c("img", {
                attrs: {
                  src: _vm.asstesUrl + "/images/premium/dokan-lite-logo@2x.png",
                  alt: "Dokan Lite"
                }
              })
            ]),
            _vm._v(" "),
            _c(
              "ul",
              { staticClass: "compare-list" },
              _vm._l(_vm.comparisons, function(comparison) {
                return _c("li", { class: comparison.compare.lite }, [
                  comparison.compare.lite === "available"
                    ? _c("img", {
                        attrs: {
                          src:
                            _vm.asstesUrl + "/images/premium/available@2x.png",
                          alt: ""
                        }
                      })
                    : _c("img", {
                        attrs: {
                          src:
                            _vm.asstesUrl +
                            "/images/premium/unavailable@2x.png",
                          alt: ""
                        }
                      }),
                  _vm._v(" "),
                  _c("span", [_vm._v(_vm._s(comparison.title))])
                ])
              }),
              0
            )
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "compare-box dokan-pro" }, [
            _c("div", { staticClass: "logo-section" }, [
              _c("img", {
                attrs: {
                  src: _vm.asstesUrl + "/images/premium/dokan-pro-logo@2x.png",
                  alt: "Dokan Pro"
                }
              })
            ]),
            _vm._v(" "),
            _c(
              "ul",
              { staticClass: "compare-list" },
              _vm._l(_vm.comparisons, function(comparison) {
                return _c("li", { class: comparison.compare.pro }, [
                  comparison.compare.pro === "available"
                    ? _c("img", {
                        attrs: {
                          src:
                            _vm.asstesUrl + "/images/premium/available@2x.png",
                          alt: ""
                        }
                      })
                    : _c("img", {
                        attrs: {
                          src:
                            _vm.asstesUrl +
                            "/images/premium/unavailable@2x.png",
                          alt: ""
                        }
                      }),
                  _vm._v(" "),
                  _c("span", [_vm._v(_vm._s(comparison.title))])
                ])
              }),
              0
            )
          ])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "pricing-section" }, [
        _c("h2", { staticClass: "section-title" }, [
          _vm._v(_vm._s(_vm.__("The Packages We Provide", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "pricing-wrapper" },
          [
            _vm._m(0),
            _vm._v(" "),
            _vm._l(_vm.modules, function(module) {
              return _c("div", { staticClass: "table-row" }, [
                _c("div", { staticClass: "table-col" }, [
                  _c(
                    "a",
                    {
                      staticClass: "module-name",
                      attrs: { href: module.url, target: "_blank" }
                    },
                    [_vm._v(_vm._s(module.title))]
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "table-col" }, [
                  module.starter.type === "numeric"
                    ? _c("div", { staticClass: "plan-data" }, [
                        _vm._v(_vm._s(module.starter.value))
                      ])
                    : _c("div", { staticClass: "plan-data" }, [
                        _c("img", {
                          attrs: { src: module.starter.value, alt: "" }
                        })
                      ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "table-col popular" }, [
                  module.professional.type === "numeric"
                    ? _c("div", { staticClass: "plan-data" }, [
                        _vm._v(_vm._s(module.professional.value))
                      ])
                    : _c("div", { staticClass: "plan-data" }, [
                        _c("img", {
                          attrs: { src: module.professional.value, alt: "" }
                        })
                      ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "table-col" }, [
                  module.business.type === "numeric"
                    ? _c("div", { staticClass: "plan-data" }, [
                        _vm._v(_vm._s(module.business.value))
                      ])
                    : _c("div", { staticClass: "plan-data" }, [
                        _c("img", {
                          attrs: { src: module.business.value, alt: "" }
                        })
                      ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "table-col" }, [
                  module.enterprise.type === "numeric"
                    ? _c("div", { staticClass: "plan-data" }, [
                        _vm._v(_vm._s(module.enterprise.value))
                      ])
                    : _c("div", { staticClass: "plan-data" }, [
                        _c("img", {
                          attrs: { src: module.enterprise.value, alt: "" }
                        })
                      ])
                ])
              ])
            }),
            _vm._v(" "),
            _c("div", { staticClass: "table-row" }, [
              _c("div", { staticClass: "table-col" }),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                _c(
                  "a",
                  {
                    staticClass: "buy-btn starter",
                    attrs: {
                      href:
                        _vm.buyNowProUrl +
                        "?add-to-cart=15310&variation_id=15316&attribute_pa_license=starter",
                      target: "_blank"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col popular" }, [
                _c(
                  "a",
                  {
                    staticClass: "buy-btn professional",
                    attrs: {
                      href:
                        _vm.buyNowProUrl +
                        "?add-to-cart=15310&variation_id=15314&attribute_pa_license=professional",
                      target: "_blank"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                _c(
                  "a",
                  {
                    staticClass: "buy-btn business",
                    attrs: {
                      href:
                        _vm.buyNowProUrl +
                        "?add-to-cart=15310&variation_id=15315&attribute_pa_license=business",
                      target: "_blank"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
                )
              ]),
              _vm._v(" "),
              _c("div", { staticClass: "table-col" }, [
                _c(
                  "a",
                  {
                    staticClass: "buy-btn enterprise",
                    attrs: {
                      href:
                        _vm.buyNowProUrl +
                        "?add-to-cart=15310&variation_id=103829&attribute_pa_license=enterprise",
                      target: "_blank"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Buy Now", "dokan-lite")))]
                )
              ])
            ])
          ],
          2
        )
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "payment-section" }, [
        _c("div", { staticClass: "guarantee-section" }, [
          _c("div", { staticClass: "feature-thumb" }, [
            _c("img", {
              attrs: { src: _vm.payment.guaranteeThumbnail, alt: "Dokan" }
            })
          ]),
          _vm._v(" "),
          _c("div", { staticClass: "guarantee-detail" }, [
            _c("h2", [
              _vm._v(
                _vm._s(_vm.__("14 Days Money Back Guarantee", "dokan-lite"))
              )
            ]),
            _vm._v(" "),
            _c("p", [
              _vm._v(
                _vm._s(
                  _vm.__(
                    "After successful purchase, you will be eligible for conditional refund",
                    "dokan-lite"
                  )
                )
              )
            ]),
            _vm._v(" "),
            _c(
              "a",
              { attrs: { href: _vm.payment.termsPolicyUrl, target: "_blank" } },
              [
                _c("img", {
                  attrs: { src: _vm.payment.viewIcon, alt: "Dokan" }
                }),
                _vm._v(
                  " " +
                    _vm._s(_vm.__("Terms & Condition Applied", "dokan-lite"))
                )
              ]
            )
          ])
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "payment-area" }, [
          _c("h3", [_vm._v(_vm._s(_vm.__("Payment Options:", "dokan-lite")))]),
          _vm._v(" "),
          _c("div", { staticClass: "option" }, [
            _c("img", {
              attrs: { src: _vm.payment.thumbnail, alt: "Credit Card" }
            })
          ])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "testimonial-section" }, [
        _c("h2", { staticClass: "section-title" }, [
          _vm._v(_vm._s(_vm.__("People We Have Helped", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "testimonial-wrapper" },
          [
            _c(
              "slick",
              { ref: "slick", attrs: { options: _vm.slickOptions } },
              _vm._l(_vm.testimonials, function(testimonial) {
                return _c("div", { staticClass: "testimonial-box" }, [
                  _c("div", { staticClass: "profile-pic" }, [
                    _c("img", { attrs: { src: testimonial.pic, alt: "" } })
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      staticClass: "content-detail",
                      style: {
                        "background-image":
                          "url(" +
                          _vm.asstesUrl +
                          "/images/premium/quote-icon.png" +
                          ")"
                      }
                    },
                    [
                      _c("h4", [_vm._v(_vm._s(testimonial.name))]),
                      _vm._v(" "),
                      _c("span", [_vm._v(_vm._s(testimonial.designation))]),
                      _vm._v(" "),
                      _c("p", [_vm._v(_vm._s(testimonial.content))])
                    ]
                  )
                ])
              }),
              0
            )
          ],
          1
        ),
        _vm._v(" "),
        _c("p", {
          domProps: {
            innerHTML: _vm._s(
              _vm.sprintf(
                "%s <a href='%s' target='_blank'>%s</a> %s",
                _vm.__("We are proud to say the official", "dokan-lite"),
                "https://themes.getbootstrap.com/",
                "Bootstrap theme marketplace",
                _vm.__("is built using Dokan", "dokan-lite")
              )
            )
          }
        })
      ]),
      _vm._v(" "),
      _c("ProCta")
    ],
    1
  )
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "table-row" }, [
      _c("div", { staticClass: "table-col" }),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name starter" }, [_vm._v("Starter")]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("149")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col popular" }, [
        _c("div", { staticClass: "plan-name professional" }, [
          _vm._v("Professional")
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("249")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name business" }, [_vm._v("Business")]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("499")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "table-col" }, [
        _c("div", { staticClass: "plan-name enterprise" }, [
          _vm._v("Enterprise")
        ]),
        _vm._v(" "),
        _c("div", { staticClass: "price" }, [
          _c("span", [_c("sup", [_vm._v("$")]), _vm._v("999")]),
          _vm._v(" "),
          _c("span", [_vm._v("/year")])
        ])
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-b38fd83a", esExports)
  }
}

/***/ }),
/* 150 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__ = __webpack_require__(60);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__ = __webpack_require__(152);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(151)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Help.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-c289d136", Component.options)
  } else {
    hotAPI.reload("data-v-c289d136", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 151 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 152 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-help-page" },
    [
      _c("h1", [_vm._v(_vm._s(_vm.__("Help", "dokan-lite")))]),
      _vm._v(" "),
      _c("AdminNotice"),
      _vm._v(" "),
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _vm.docs !== null
        ? _c(
            "div",
            { staticClass: "section-wrapper" },
            _vm._l(_vm.docs, function(section, index) {
              return _c(
                "postbox",
                { key: index, attrs: { title: section.title } },
                [
                  _c(
                    "ul",
                    _vm._l(section.questions, function(item) {
                      return _c("li", [
                        _c("span", {
                          staticClass: "dashicons dashicons-media-text"
                        }),
                        _vm._v(" "),
                        _c(
                          "a",
                          {
                            attrs: {
                              href:
                                item.link +
                                "?utm_source=wp-admin&utm_medium=dokan-help-page",
                              target: "_blank"
                            }
                          },
                          [_vm._v(_vm._s(item.title))]
                        )
                      ])
                    }),
                    0
                  )
                ]
              )
            }),
            1
          )
        : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-c289d136", esExports)
  }
}

/***/ }),
/* 153 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ChangeLog_vue__ = __webpack_require__(61);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_254fdb80_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ChangeLog_vue__ = __webpack_require__(155);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(154)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-254fdb80"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ChangeLog_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_254fdb80_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ChangeLog_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/ChangeLog.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-254fdb80", Component.options)
  } else {
    hotAPI.reload("data-v-254fdb80", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 154 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 155 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-help-page" }, [
    _c("div", { staticClass: "section-wrapper" }, [
      _c(
        "div",
        { staticClass: "dokan-notice" },
        [
          _c("h2"),
          _vm._v(" "),
          _c("AdminNotice"),
          _vm._v(" "),
          !_vm.hasPro ? _c("UpgradeBanner") : _vm._e()
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        {
          staticClass: "change-log",
          class: _vm.hasPro ? "pro-change-log" : "lite-change-log",
          attrs: { id: "change-log" }
        },
        [
          _c("h3", [_vm._v(_vm._s(_vm.__("Dokan Changelog", "dokan-lite")))]),
          _vm._v(" "),
          _vm.hasPro
            ? _c(
                "div",
                { staticClass: "switch-button-wrap" },
                [
                  _c("transition-group", { attrs: { name: "fade" } }, [
                    _c("span", {
                      key: 1,
                      staticClass: "active",
                      style: _vm.isActivePackage("pro") ? "right: 0" : "left: 0"
                    }),
                    _vm._v(" "),
                    _c(
                      "button",
                      {
                        key: 2,
                        staticClass: "switch-button lite",
                        class: { "active-case": _vm.isActivePackage("lite") },
                        on: {
                          click: function($event) {
                            return _vm.switchPackage("lite")
                          }
                        }
                      },
                      [_vm._v(_vm._s(_vm.__("Lite", "dokan-lite")))]
                    ),
                    _vm._v(" "),
                    _c(
                      "button",
                      {
                        key: 3,
                        staticClass: "switch-button pro",
                        class: { "active-case": _vm.isActivePackage("pro") },
                        on: {
                          click: function($event) {
                            return _vm.switchPackage("pro")
                          }
                        }
                      },
                      [_vm._v(_vm._s(_vm.__("PRO", "dokan-lite")))]
                    )
                  ])
                ],
                1
              )
            : _vm._e(),
          _vm._v(" "),
          !_vm.loading
            ? _c("div", { staticClass: "jump-version" }, [
                _c("p", [
                  _vm._v(
                    _vm._s(_vm.__("Jump to version", "dokan-lite")) + "... "
                  ),
                  _c("span", {
                    staticClass: "dashicons dashicons-arrow-down-alt2"
                  })
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "version-menu" }, [
                  _c("div", { staticClass: "version-dropdown" }, [
                    _c(
                      "ul",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.isActivePackage("lite"),
                            expression: "isActivePackage( 'lite' )"
                          }
                        ]
                      },
                      _vm._l(_vm.lite_versions, function(version, index) {
                        return _c(
                          "li",
                          {
                            class: {
                              current: _vm.isCurrentVersion("lite-" + index)
                            },
                            on: {
                              click: function($event) {
                                return _vm.jumpVersion("lite-" + index)
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                " +
                                _vm._s(version.version) +
                                "\n                                "
                            ),
                            0 === index
                              ? _c("span", [
                                  _vm._v(
                                    "(" +
                                      _vm._s(_vm.__("Latest", "dokan-lite")) +
                                      ")"
                                  )
                                ])
                              : _vm._e(),
                            _vm._v(" "),
                            _vm.isCurrentVersion("lite-" + index) && 0 !== index
                              ? _c("span", [
                                  _vm._v(
                                    "(" +
                                      _vm._s(_vm.__("Current", "dokan-lite")) +
                                      ")"
                                  )
                                ])
                              : _vm._e()
                          ]
                        )
                      }),
                      0
                    ),
                    _vm._v(" "),
                    _c(
                      "ul",
                      {
                        directives: [
                          {
                            name: "show",
                            rawName: "v-show",
                            value: _vm.isActivePackage("pro"),
                            expression: "isActivePackage( 'pro' )"
                          }
                        ]
                      },
                      _vm._l(_vm.pro_versions, function(version, index) {
                        return _c(
                          "li",
                          {
                            class: {
                              current: _vm.isCurrentVersion("pro-" + index)
                            },
                            on: {
                              click: function($event) {
                                return _vm.jumpVersion("pro-" + index)
                              }
                            }
                          },
                          [
                            _vm._v(
                              "\n                                " +
                                _vm._s(version.version) +
                                "\n                                "
                            ),
                            0 === index
                              ? _c("span", [
                                  _vm._v(
                                    "(" +
                                      _vm._s(_vm.__("Latest", "dokan-lite")) +
                                      ")"
                                  )
                                ])
                              : _vm._e(),
                            _vm._v(" "),
                            _vm.isCurrentVersion("pro-" + index) && 0 !== index
                              ? _c("span", [
                                  _vm._v(
                                    "(" +
                                      _vm._s(_vm.__("Current", "dokan-lite")) +
                                      ")"
                                  )
                                ])
                              : _vm._e()
                          ]
                        )
                      }),
                      0
                    )
                  ])
                ])
              ])
            : _c("div", { staticClass: "loading" }, [_c("loading")], 1)
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "version-list" },
        [
          _vm._l(_vm.lite_versions, function(version, index) {
            return _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.isActivePackage("lite"),
                    expression: "isActivePackage( 'lite' )"
                  }
                ],
                staticClass: "version",
                class: 0 === index ? "latest-version" : "old-version",
                attrs: { id: "lite-" + index }
              },
              [
                _c("div", { staticClass: "version-number" }, [
                  _c("h4", [_vm._v(_vm._s(version.version))]),
                  _vm._v(" "),
                  _c("p", [
                    _vm._v(
                      _vm._s(_vm.formatReleaseDate(version.released)) + " "
                    ),
                    0 === index
                      ? _c("label", [
                          _vm._v(_vm._s(_vm.__("Latest", "dokan-lite")))
                        ])
                      : _vm._e()
                  ])
                ]),
                _vm._v(" "),
                _c(
                  "div",
                  {
                    staticClass: "card-version",
                    style: _vm.isCurrentVersion("lite-" + index)
                      ? _vm.activeVersionBorder
                      : ""
                  },
                  [
                    _c(
                      "transition-group",
                      { attrs: { name: "slide", tag: "div" } },
                      _vm._l(version.changes, function(changes, key, i) {
                        return 0 === index ||
                          i < 1 ||
                          _vm.isOpenVersion("lite-" + index)
                          ? _c(
                              "div",
                              {
                                key: "index-" + i,
                                staticClass: "feature-list"
                              },
                              [
                                _c(
                                  "span",
                                  {
                                    staticClass: "feature-badge",
                                    class: _vm.badgeClass(key)
                                  },
                                  [_vm._v(_vm._s(key))]
                                ),
                                _vm._v(" "),
                                _vm._l(changes, function(change, j) {
                                  return 0 === index ||
                                    j < 2 ||
                                    _vm.isOpenVersion("lite-" + index)
                                    ? _c("div", { staticClass: "feature" }, [
                                        _c("h5", [
                                          _vm._v(_vm._s(change.title))
                                        ]),
                                        _vm._v(" "),
                                        _c("div", {
                                          domProps: {
                                            innerHTML: _vm._s(
                                              change.description
                                            )
                                          }
                                        })
                                      ])
                                    : _vm._e()
                                })
                              ],
                              2
                            )
                          : _vm._e()
                      }),
                      0
                    ),
                    _vm._v(" "),
                    0 !== index && Object.keys(version.changes).length > 1
                      ? _c("div", { staticClass: "continue-reading" }, [
                          _c(
                            "a",
                            {
                              attrs: { href: "#" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  return _vm.toggleReading("lite-" + index)
                                }
                              }
                            },
                            [
                              _vm._v(
                                _vm._s(
                                  _vm.isOpenVersion("lite-" + index)
                                    ? _vm.__("View Less...", "dokan-lite")
                                    : _vm.__(
                                        "Continue reading...",
                                        "dokan-lite"
                                      )
                                )
                              )
                            ]
                          )
                        ])
                      : _vm._e()
                  ],
                  1
                )
              ]
            )
          }),
          _vm._v(" "),
          _vm._l(_vm.pro_versions, function(version, index) {
            return _c(
              "div",
              {
                directives: [
                  {
                    name: "show",
                    rawName: "v-show",
                    value: _vm.isActivePackage("pro"),
                    expression: "isActivePackage( 'pro' )"
                  }
                ],
                staticClass: "version",
                class: 0 === index ? "latest-version" : "old-version",
                attrs: { id: "pro-" + index }
              },
              [
                _c("div", { staticClass: "version-number" }, [
                  _c("h4", [_vm._v(_vm._s(version.version))]),
                  _vm._v(" "),
                  _c("p", [
                    _vm._v(
                      _vm._s(_vm.formatReleaseDate(version.released)) + " "
                    ),
                    0 === index
                      ? _c("label", [
                          _vm._v(_vm._s(_vm.__("Latest", "dokan-lite")))
                        ])
                      : _vm._e()
                  ])
                ]),
                _vm._v(" "),
                _c(
                  "div",
                  {
                    staticClass: "card-version",
                    style: _vm.isCurrentVersion("pro-" + index)
                      ? _vm.activeVersionBorder
                      : ""
                  },
                  [
                    _c(
                      "transition-group",
                      { attrs: { name: "slide", tag: "div" } },
                      _vm._l(version.changes, function(changes, key, i) {
                        return 0 === index ||
                          i < 1 ||
                          _vm.isOpenVersion("pro-" + index)
                          ? _c(
                              "div",
                              {
                                key: "index-" + i,
                                staticClass: "feature-list"
                              },
                              [
                                _c(
                                  "span",
                                  {
                                    staticClass: "feature-badge",
                                    class: _vm.badgeClass(key)
                                  },
                                  [_vm._v(_vm._s(key))]
                                ),
                                _vm._v(" "),
                                _vm._l(changes, function(change, j) {
                                  return 0 === index ||
                                    j < 2 ||
                                    _vm.isOpenVersion("pro-" + index)
                                    ? _c("div", { staticClass: "feature" }, [
                                        _c("h5", [
                                          _vm._v(_vm._s(change.title))
                                        ]),
                                        _vm._v(" "),
                                        _c("div", {
                                          domProps: {
                                            innerHTML: _vm._s(
                                              change.description
                                            )
                                          }
                                        })
                                      ])
                                    : _vm._e()
                                })
                              ],
                              2
                            )
                          : _vm._e()
                      }),
                      0
                    ),
                    _vm._v(" "),
                    0 !== index && Object.keys(version.changes).length > 1
                      ? _c("div", { staticClass: "continue-reading" }, [
                          _c(
                            "a",
                            {
                              attrs: { href: "#" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  return _vm.toggleReading("pro-" + index)
                                }
                              }
                            },
                            [
                              _vm._v(
                                _vm._s(
                                  _vm.isOpenVersion("pro-" + index)
                                    ? _vm.__("View Less...", "dokan-lite")
                                    : _vm.__(
                                        "Continue reading...",
                                        "dokan-lite"
                                      )
                                )
                              )
                            ]
                          )
                        ])
                      : _vm._e()
                  ],
                  1
                )
              ]
            )
          })
        ],
        2
      )
    ]),
    _vm._v(" "),
    _c(
      "button",
      {
        staticClass: "scroll-to-top",
        style:
          _vm.scrollPosition > 300 ? "opacity: 1; visibility: visible" : "",
        on: { click: _vm.scrollTop }
      },
      [_c("span", { staticClass: "dashicons dashicons-arrow-up-alt" })]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-254fdb80", esExports)
  }
}

/***/ }),
/* 156 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__ = __webpack_require__(62);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__ = __webpack_require__(193);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(157)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Settings.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e4dc4572", Component.options)
  } else {
    hotAPI.reload("data-v-e4dc4572", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 157 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 158 */,
/* 159 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__ = __webpack_require__(63);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__ = __webpack_require__(189);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(160)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Fields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-a96ce32e", Component.options)
  } else {
    hotAPI.reload("data-v-a96ce32e", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 160 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SocialFields_vue__ = __webpack_require__(74);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_d90d6894_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SocialFields_vue__ = __webpack_require__(186);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SocialFields_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_d90d6894_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SocialFields_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/SocialFields.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-d90d6894", Component.options)
  } else {
    hotAPI.reload("data-v-d90d6894", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 186 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("fieldset", [
    _c("div", { staticClass: "html_contents" }, [
      _c("h3", { staticClass: "field_heading", attrs: { scope: "row" } }, [
        _vm._v(
          "\n            " + _vm._s(_vm.fieldData.label) + "\n            "
        ),
        _vm.fieldData.tooltip
          ? _c("span", [
              _c("i", {
                directives: [
                  {
                    name: "tooltip",
                    rawName: "v-tooltip",
                    value: _vm.fieldData.tooltip,
                    expression: "fieldData.tooltip"
                  }
                ],
                staticClass: "dashicons dashicons-editor-help tips",
                attrs: { title: _vm.fieldData.tooltip }
              })
            ])
          : _vm._e()
      ]),
      _vm._v(" "),
      _c("p", {
        staticClass: "field_desc",
        domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
      })
    ]),
    _vm._v(" "),
    _vm.fieldData.url || _vm.fieldData.type !== "html"
      ? _c(
          "div",
          {
            staticClass: "fields",
            class: [_vm.fieldData.type === "radio" ? "radio_fields" : ""]
          },
          [
            _vm.fieldData.url
              ? _c("input", {
                  staticClass: "regular-text large",
                  attrs: { disabled: "", type: "text" },
                  domProps: { value: _vm.fieldData.url }
                })
              : _vm._e(),
            _vm._v(" "),
            _vm.fieldData.type === "checkbox" && _vm.fieldData.type === "text"
              ? _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.fieldValue[_vm.fieldData.name],
                      expression: "fieldValue[fieldData.name]"
                    }
                  ],
                  staticClass: "regular-text large",
                  attrs: { type: "checkbox" },
                  domProps: {
                    checked: Array.isArray(_vm.fieldValue[_vm.fieldData.name])
                      ? _vm._i(_vm.fieldValue[_vm.fieldData.name], null) > -1
                      : _vm.fieldValue[_vm.fieldData.name]
                  },
                  on: {
                    change: function($event) {
                      var $$a = _vm.fieldValue[_vm.fieldData.name],
                        $$el = $event.target,
                        $$c = $$el.checked ? true : false
                      if (Array.isArray($$a)) {
                        var $$v = null,
                          $$i = _vm._i($$a, $$v)
                        if ($$el.checked) {
                          $$i < 0 &&
                            _vm.$set(
                              _vm.fieldValue,
                              _vm.fieldData.name,
                              $$a.concat([$$v])
                            )
                        } else {
                          $$i > -1 &&
                            _vm.$set(
                              _vm.fieldValue,
                              _vm.fieldData.name,
                              $$a.slice(0, $$i).concat($$a.slice($$i + 1))
                            )
                        }
                      } else {
                        _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$c)
                      }
                    }
                  }
                })
              : _vm.fieldData.type === "radio" && _vm.fieldData.type === "text"
              ? _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.fieldValue[_vm.fieldData.name],
                      expression: "fieldValue[fieldData.name]"
                    }
                  ],
                  staticClass: "regular-text large",
                  attrs: { type: "radio" },
                  domProps: {
                    checked: _vm._q(_vm.fieldValue[_vm.fieldData.name], null)
                  },
                  on: {
                    change: function($event) {
                      return _vm.$set(_vm.fieldValue, _vm.fieldData.name, null)
                    }
                  }
                })
              : _vm.fieldData.type === "text"
              ? _c("input", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.fieldValue[_vm.fieldData.name],
                      expression: "fieldValue[fieldData.name]"
                    }
                  ],
                  staticClass: "regular-text large",
                  attrs: { type: _vm.fieldData.type },
                  domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.fieldValue,
                        _vm.fieldData.name,
                        $event.target.value
                      )
                    }
                  }
                })
              : _vm._e(),
            _vm._v(" "),
            _vm.fieldData.type === "textarea"
              ? _c("textarea", {
                  directives: [
                    {
                      name: "model",
                      rawName: "v-model",
                      value: _vm.fieldValue[_vm.fieldData.name],
                      expression: "fieldValue[fieldData.name]"
                    }
                  ],
                  staticClass: "large",
                  domProps: { value: _vm.fieldValue[_vm.fieldData.name] },
                  on: {
                    input: function($event) {
                      if ($event.target.composing) {
                        return
                      }
                      _vm.$set(
                        _vm.fieldValue,
                        _vm.fieldData.name,
                        $event.target.value
                      )
                    }
                  }
                })
              : _vm._e(),
            _vm._v(" "),
            _vm.fieldData.type === "radio"
              ? _vm._l(_vm.fieldData.options, function(optionVal, optionKey) {
                  return _c(
                    "label",
                    {
                      key: optionKey,
                      class: _vm.isSocialOptionChecked(optionKey)
                        ? "checked"
                        : ""
                    },
                    [
                      _c("span", { staticClass: "dashicons dashicons-yes" }),
                      _vm._v(" "),
                      _vm.fieldData.type === "checkbox"
                        ? _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "radio",
                            attrs: { name: optionKey, type: "checkbox" },
                            domProps: {
                              value: optionKey,
                              checked: Array.isArray(
                                _vm.fieldValue[_vm.fieldData.name]
                              )
                                ? _vm._i(
                                    _vm.fieldValue[_vm.fieldData.name],
                                    optionKey
                                  ) > -1
                                : _vm.fieldValue[_vm.fieldData.name]
                            },
                            on: {
                              change: function($event) {
                                var $$a = _vm.fieldValue[_vm.fieldData.name],
                                  $$el = $event.target,
                                  $$c = $$el.checked ? true : false
                                if (Array.isArray($$a)) {
                                  var $$v = optionKey,
                                    $$i = _vm._i($$a, $$v)
                                  if ($$el.checked) {
                                    $$i < 0 &&
                                      _vm.$set(
                                        _vm.fieldValue,
                                        _vm.fieldData.name,
                                        $$a.concat([$$v])
                                      )
                                  } else {
                                    $$i > -1 &&
                                      _vm.$set(
                                        _vm.fieldValue,
                                        _vm.fieldData.name,
                                        $$a
                                          .slice(0, $$i)
                                          .concat($$a.slice($$i + 1))
                                      )
                                  }
                                } else {
                                  _vm.$set(
                                    _vm.fieldValue,
                                    _vm.fieldData.name,
                                    $$c
                                  )
                                }
                              }
                            }
                          })
                        : _vm.fieldData.type === "radio"
                        ? _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "radio",
                            attrs: { name: optionKey, type: "radio" },
                            domProps: {
                              value: optionKey,
                              checked: _vm._q(
                                _vm.fieldValue[_vm.fieldData.name],
                                optionKey
                              )
                            },
                            on: {
                              change: function($event) {
                                return _vm.$set(
                                  _vm.fieldValue,
                                  _vm.fieldData.name,
                                  optionKey
                                )
                              }
                            }
                          })
                        : _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "radio",
                            attrs: {
                              name: optionKey,
                              type: _vm.fieldData.type
                            },
                            domProps: {
                              value: optionKey,
                              value: _vm.fieldValue[_vm.fieldData.name]
                            },
                            on: {
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.fieldValue,
                                  _vm.fieldData.name,
                                  $event.target.value
                                )
                              }
                            }
                          }),
                      _vm._v(
                        "\n                " +
                          _vm._s(optionVal) +
                          "\n            "
                      )
                    ]
                  )
                })
              : _vm._e()
          ],
          2
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-d90d6894", esExports)
  }
}

/***/ }),
/* 187 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_FieldHeading_vue__ = __webpack_require__(75);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_929c9450_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_FieldHeading_vue__ = __webpack_require__(188);
var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_FieldHeading_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_929c9450_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_FieldHeading_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/FieldHeading.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-929c9450", Component.options)
  } else {
    hotAPI.reload("data-v-929c9450", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 188 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "field_data" }, [
    _c("h3", { staticClass: "field_heading", attrs: { scope: "row" } }, [
      _vm._v("\n        " + _vm._s(_vm.fieldData.label) + "\n        "),
      _vm.fieldData.icon_class ? _c("span") : _vm._e(),
      _vm._v(" "),
      _vm.fieldData.tooltip || _vm.fieldData.field_icon
        ? _c("span", [
            _c("i", {
              directives: [
                {
                  name: "tooltip",
                  rawName: "v-tooltip",
                  value: _vm.fieldData.tooltip
                    ? _vm.fieldData.tooltip
                    : _vm.fieldData.field_icon,
                  expression:
                    "fieldData.tooltip ? fieldData.tooltip : fieldData.field_icon"
                }
              ],
              staticClass: "tips",
              class: [
                { "dashicons dashicons-editor-help": _vm.fieldData.tooltip },
                { "fas fa-exclamation-triangle": _vm.fieldData.field_icon }
              ],
              attrs: {
                title: _vm.fieldData.tooltip
                  ? _vm.fieldData.tooltip
                  : _vm.fieldData.field_icon
              }
            })
          ])
        : _vm._e()
    ]),
    _vm._v(" "),
    _c("p", {
      staticClass: "field_desc",
      domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
    })
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-929c9450", esExports)
  }
}

/***/ }),
/* 189 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.shouldShow
    ? _c(
        "div",
        { class: [_vm.id, "dokan-settings-field-type-" + _vm.fieldData.type] },
        [
          "sub_section" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "dokan-settings-sub-section",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c("h3", { staticClass: "sub-section-title" }, [
                      _vm._v(_vm._s(_vm.fieldData.label))
                    ]),
                    _vm._v(" "),
                    _c("p", { staticClass: "sub-section-description" }, [
                      _vm._v(
                        "\n                " +
                          _vm._s(_vm.fieldData.description) +
                          "\n            "
                      )
                    ])
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.containCommonFields(_vm.fieldData.type)
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field" }, [
                          (_vm.fieldData.type || "text") === "checkbox"
                            ? _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium",
                                class: [
                                  {
                                    "dokan-input-validation-error": _vm.hasValidationError(
                                      _vm.fieldData.name
                                    )
                                  },
                                  _vm.fieldData.class
                                ],
                                attrs: {
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  type: "checkbox"
                                },
                                domProps: {
                                  checked: Array.isArray(
                                    _vm.fieldValue[_vm.fieldData.name]
                                  )
                                    ? _vm._i(
                                        _vm.fieldValue[_vm.fieldData.name],
                                        null
                                      ) > -1
                                    : _vm.fieldValue[_vm.fieldData.name]
                                },
                                on: {
                                  change: function($event) {
                                    var $$a =
                                        _vm.fieldValue[_vm.fieldData.name],
                                      $$el = $event.target,
                                      $$c = $$el.checked ? true : false
                                    if (Array.isArray($$a)) {
                                      var $$v = null,
                                        $$i = _vm._i($$a, $$v)
                                      if ($$el.checked) {
                                        $$i < 0 &&
                                          _vm.$set(
                                            _vm.fieldValue,
                                            _vm.fieldData.name,
                                            $$a.concat([$$v])
                                          )
                                      } else {
                                        $$i > -1 &&
                                          _vm.$set(
                                            _vm.fieldValue,
                                            _vm.fieldData.name,
                                            $$a
                                              .slice(0, $$i)
                                              .concat($$a.slice($$i + 1))
                                          )
                                      }
                                    } else {
                                      _vm.$set(
                                        _vm.fieldValue,
                                        _vm.fieldData.name,
                                        $$c
                                      )
                                    }
                                  }
                                }
                              })
                            : (_vm.fieldData.type || "text") === "radio"
                            ? _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium",
                                class: [
                                  {
                                    "dokan-input-validation-error": _vm.hasValidationError(
                                      _vm.fieldData.name
                                    )
                                  },
                                  _vm.fieldData.class
                                ],
                                attrs: {
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  type: "radio"
                                },
                                domProps: {
                                  checked: _vm._q(
                                    _vm.fieldValue[_vm.fieldData.name],
                                    null
                                  )
                                },
                                on: {
                                  change: function($event) {
                                    return _vm.$set(
                                      _vm.fieldValue,
                                      _vm.fieldData.name,
                                      null
                                    )
                                  }
                                }
                              })
                            : _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium",
                                class: [
                                  {
                                    "dokan-input-validation-error": _vm.hasValidationError(
                                      _vm.fieldData.name
                                    )
                                  },
                                  _vm.fieldData.class
                                ],
                                attrs: {
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  type: _vm.fieldData.type || "text"
                                },
                                domProps: {
                                  value: _vm.fieldValue[_vm.fieldData.name]
                                },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.$set(
                                      _vm.fieldValue,
                                      _vm.fieldData.name,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n              " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "number" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field" }, [
                          _c(
                            "label",
                            {
                              attrs: {
                                for:
                                  _vm.sectionId + "[" + _vm.fieldData.name + "]"
                              }
                            },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium",
                                class: [
                                  {
                                    "dokan-input-validation-error": _vm.hasValidationError(
                                      _vm.fieldData.name
                                    )
                                  },
                                  _vm.fieldData.class
                                ],
                                attrs: {
                                  type: "number",
                                  min: _vm.fieldData.min,
                                  max: _vm.fieldData.max,
                                  step: _vm.fieldData.step,
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]"
                                },
                                domProps: {
                                  value: _vm.fieldValue[_vm.fieldData.name]
                                },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.$set(
                                      _vm.fieldValue,
                                      _vm.fieldData.name,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            ]
                          )
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n              " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "price" === _vm.fieldData.type &&
          _vm.allSettingsValues.dokan_selling &&
          "combine" !== _vm.allSettingsValues.dokan_selling.commission_type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field" }, [
                          _c(
                            "label",
                            {
                              attrs: {
                                for:
                                  _vm.sectionId + "[" + _vm.fieldData.name + "]"
                              }
                            },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium",
                                class: {
                                  wc_input_decimal:
                                    _vm.allSettingsValues.dokan_selling
                                      .commission_type == "percentage",
                                  wc_input_price:
                                    _vm.allSettingsValues.dokan_selling
                                      .commission_type == "flat"
                                },
                                attrs: {
                                  type: "text",
                                  min: _vm.fieldData.min,
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]"
                                },
                                domProps: {
                                  value: _vm.fieldValue[_vm.fieldData.name]
                                },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.$set(
                                      _vm.fieldValue,
                                      _vm.fieldData.name,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            ]
                          )
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n              " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "combine" === _vm.fieldData.type &&
          _vm.haveCondition(_vm.fieldData) &&
          _vm.fieldData.condition.type == "show" &&
          _vm.checkConditionLogic(_vm.fieldData, _vm.fieldValue)
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field combine_fields" }, [
                          _c("div", { staticClass: "percent_fee" }, [
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value:
                                    _vm.fieldValue[
                                      _vm.fieldData.fields.percent_fee.name
                                    ],
                                  expression:
                                    "fieldValue[fieldData.fields.percent_fee.name]"
                                }
                              ],
                              staticClass:
                                "wc_input_decimal regular-text medium",
                              attrs: {
                                type: "text",
                                id:
                                  _vm.sectionId +
                                  "[" +
                                  _vm.fieldData.name +
                                  "]" +
                                  "[" +
                                  "percent_fee" +
                                  "]",
                                name:
                                  _vm.sectionId +
                                  "[" +
                                  _vm.fieldData.fields.percent_fee.name +
                                  "]"
                              },
                              domProps: {
                                value:
                                  _vm.fieldValue[
                                    _vm.fieldData.fields.percent_fee.name
                                  ]
                              },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.fieldValue,
                                    _vm.fieldData.fields.percent_fee.name,
                                    $event.target.value
                                  )
                                }
                              }
                            }),
                            _vm._v(
                              "\n                        " +
                                _vm._s("%") +
                                "\n                    "
                            )
                          ]),
                          _vm._v(" "),
                          _c("div", { staticClass: "fixed_fee" }, [
                            _vm._v(
                              "\n                        " +
                                _vm._s("+") +
                                "\n                        "
                            ),
                            _c("input", {
                              directives: [
                                {
                                  name: "model",
                                  rawName: "v-model",
                                  value:
                                    _vm.fieldValue[
                                      _vm.fieldData.fields.fixed_fee.name
                                    ],
                                  expression:
                                    "fieldValue[fieldData.fields.fixed_fee.name]"
                                }
                              ],
                              staticClass: "wc_input_price regular-text medium",
                              attrs: {
                                type: "text",
                                id:
                                  _vm.sectionId +
                                  "[" +
                                  _vm.fieldData.name +
                                  "]" +
                                  "[" +
                                  "fixed_fee" +
                                  "]",
                                name:
                                  _vm.sectionId +
                                  "[" +
                                  _vm.fieldData.fields.fixed_fee.name +
                                  "]"
                              },
                              domProps: {
                                value:
                                  _vm.fieldValue[
                                    _vm.fieldData.fields.fixed_fee.name
                                  ]
                              },
                              on: {
                                input: function($event) {
                                  if ($event.target.composing) {
                                    return
                                  }
                                  _vm.$set(
                                    _vm.fieldValue,
                                    _vm.fieldData.fields.fixed_fee.name,
                                    $event.target.value
                                  )
                                }
                              }
                            })
                          ])
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.fields.percent_fee.name) &&
                    _vm.hasError(_vm.fieldData.fields.fixed_fee.name)
                      ? _c(
                          "p",
                          { staticClass: "dokan-error combine-commission" },
                          [
                            _vm._v(
                              "\n                " +
                                _vm._s(
                                  _vm.__(
                                    "Both percentage and fixed fee is required.",
                                    "dokan-lite"
                                  )
                                ) +
                                "\n            "
                            )
                          ]
                        )
                      : _vm.hasError(_vm.fieldData.fields.percent_fee.name)
                      ? _c(
                          "p",
                          { staticClass: "dokan-error combine-commission" },
                          [
                            _vm._v(
                              "\n                " +
                                _vm._s(
                                  _vm.getError(
                                    _vm.fieldData.fields.percent_fee.label
                                  )
                                ) +
                                "\n            "
                            )
                          ]
                        )
                      : _vm.hasError(_vm.fieldData.fields.fixed_fee.name)
                      ? _c(
                          "p",
                          { staticClass: "dokan-error combine-commission" },
                          [
                            _vm._v(
                              "\n                " +
                                _vm._s(
                                  _vm.getError(
                                    _vm.fieldData.fields.fixed_fee.label
                                  )
                                ) +
                                "\n            "
                            )
                          ]
                        )
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "textarea" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field" }, [
                          _c("textarea", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "regular-text medium",
                            attrs: {
                              type: "textarea",
                              rows: _vm.fieldData.rows,
                              cols: _vm.fieldData.cols,
                              id:
                                _vm.sectionId + "[" + _vm.fieldData.name + "]",
                              name:
                                _vm.sectionId + "[" + _vm.fieldData.name + "]"
                            },
                            domProps: {
                              value: _vm.fieldValue[_vm.fieldData.name]
                            },
                            on: {
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.fieldValue,
                                  _vm.fieldData.name,
                                  $event.target.value
                                )
                              }
                            }
                          })
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "switcher" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field" }, [
                          _c(
                            "label",
                            {
                              attrs: {
                                for:
                                  _vm.sectionId + "[" + _vm.fieldData.name + "]"
                              }
                            },
                            [
                              _c("switches", {
                                attrs: {
                                  enabled: _vm.checked === "on" ? true : false,
                                  value: "isChecked"
                                },
                                on: { input: _vm.onToggleSwitch }
                              })
                            ],
                            1
                          )
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "multicheck" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c(
                          "div",
                          { staticClass: "field multicheck_fields" },
                          [
                            _vm._l(_vm.fieldData.options, function(
                              optionVal,
                              optionKey
                            ) {
                              return [
                                _c(
                                  "div",
                                  { key: optionKey },
                                  [
                                    _vm._v(
                                      "\n                            " +
                                        _vm._s(optionVal) +
                                        "\n                            "
                                    ),
                                    _c("switches", {
                                      attrs: {
                                        enabled: _vm.isSwitchOptionChecked(
                                          optionKey
                                        ),
                                        value: optionKey
                                      },
                                      on: { input: _vm.setCheckedValue }
                                    })
                                  ],
                                  1
                                )
                              ]
                            })
                          ],
                          2
                        )
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n              " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "select" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c(
                          "div",
                          { staticClass: "field" },
                          [
                            !_vm.fieldData.grouped
                              ? _c(
                                  "select",
                                  {
                                    directives: [
                                      {
                                        name: "model",
                                        rawName: "v-model",
                                        value:
                                          _vm.fieldValue[_vm.fieldData.name],
                                        expression: "fieldValue[fieldData.name]"
                                      }
                                    ],
                                    staticClass: "regular medium",
                                    attrs: {
                                      name:
                                        _vm.sectionId +
                                        "[" +
                                        _vm.fieldData.name +
                                        "]",
                                      id:
                                        _vm.sectionId +
                                        "[" +
                                        _vm.fieldData.name +
                                        "]"
                                    },
                                    on: {
                                      change: function($event) {
                                        var $$selectedVal = Array.prototype.filter
                                          .call($event.target.options, function(
                                            o
                                          ) {
                                            return o.selected
                                          })
                                          .map(function(o) {
                                            var val =
                                              "_value" in o ? o._value : o.value
                                            return val
                                          })
                                        _vm.$set(
                                          _vm.fieldValue,
                                          _vm.fieldData.name,
                                          $event.target.multiple
                                            ? $$selectedVal
                                            : $$selectedVal[0]
                                        )
                                      }
                                    }
                                  },
                                  [
                                    _vm.fieldData.placeholder
                                      ? _c("option", {
                                          attrs: { value: "" },
                                          domProps: {
                                            innerHTML: _vm._s(
                                              _vm.fieldData.placeholder
                                            )
                                          }
                                        })
                                      : _vm._e(),
                                    _vm._v(" "),
                                    _vm._l(_vm.fieldData.options, function(
                                      optionVal,
                                      optionKey
                                    ) {
                                      return _c("option", {
                                        key: optionKey,
                                        domProps: {
                                          value: optionKey,
                                          innerHTML: _vm._s(optionVal)
                                        }
                                      })
                                    })
                                  ],
                                  2
                                )
                              : _c(
                                  "select",
                                  {
                                    directives: [
                                      {
                                        name: "model",
                                        rawName: "v-model",
                                        value:
                                          _vm.fieldValue[_vm.fieldData.name],
                                        expression: "fieldValue[fieldData.name]"
                                      }
                                    ],
                                    staticClass: "regular medium",
                                    attrs: {
                                      name:
                                        _vm.sectionId +
                                        "[" +
                                        _vm.fieldData.name +
                                        "]",
                                      id:
                                        _vm.sectionId +
                                        "[" +
                                        _vm.fieldData.name +
                                        "]"
                                    },
                                    on: {
                                      change: function($event) {
                                        var $$selectedVal = Array.prototype.filter
                                          .call($event.target.options, function(
                                            o
                                          ) {
                                            return o.selected
                                          })
                                          .map(function(o) {
                                            var val =
                                              "_value" in o ? o._value : o.value
                                            return val
                                          })
                                        _vm.$set(
                                          _vm.fieldValue,
                                          _vm.fieldData.name,
                                          $event.target.multiple
                                            ? $$selectedVal
                                            : $$selectedVal[0]
                                        )
                                      }
                                    }
                                  },
                                  [
                                    _vm.fieldData.placeholder
                                      ? _c("option", {
                                          attrs: { value: "", disabled: "" },
                                          domProps: {
                                            innerHTML: _vm._s(
                                              _vm.fieldData.placeholder
                                            )
                                          }
                                        })
                                      : _vm._e(),
                                    _vm._v(" "),
                                    _vm._l(_vm.fieldData.options, function(
                                      optionGroup,
                                      optionGroupKey
                                    ) {
                                      return _c(
                                        "optgroup",
                                        {
                                          key: optionGroupKey,
                                          attrs: {
                                            label: optionGroup.group_label
                                          }
                                        },
                                        _vm._l(
                                          optionGroup.group_values,
                                          function(option, optionKey) {
                                            return _c("option", {
                                              key: optionKey,
                                              domProps: {
                                                value: option.value,
                                                innerHTML: _vm._s(option.label)
                                              }
                                            })
                                          }
                                        ),
                                        0
                                      )
                                    })
                                  ],
                                  2
                                ),
                            _vm._v(" "),
                            _vm.fieldData.refresh_options
                              ? _c("RefreshSettingOptions", {
                                  attrs: {
                                    field: _vm.fieldData,
                                    section: _vm.sectionId,
                                    "toggle-loading-state":
                                      _vm.toggleLoadingState
                                  }
                                })
                              : _vm._e()
                          ],
                          1
                        )
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasValidationError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(
                                _vm.getValidationErrorMessage(
                                  _vm.fieldData.name
                                )
                              ) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "file" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field add_files" }, [
                          _c(
                            "label",
                            {
                              attrs: {
                                for:
                                  _vm.sectionId + "[" + _vm.fieldData.name + "]"
                              }
                            },
                            [
                              _c("input", {
                                staticClass: "button wpsa-browse",
                                attrs: { type: "button", value: "Choose File" },
                                on: {
                                  click: function($event) {
                                    $event.preventDefault()
                                    return _vm.$emit(
                                      "openMedia",
                                      {
                                        sectionId: _vm.sectionId,
                                        name: _vm.fieldData.name
                                      },
                                      $event
                                    )
                                  }
                                }
                              }),
                              _vm._v(" "),
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.fieldValue[_vm.fieldData.name],
                                    expression: "fieldValue[fieldData.name]"
                                  }
                                ],
                                staticClass: "regular-text medium wpsa-url",
                                attrs: {
                                  type: "text",
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "]"
                                },
                                domProps: {
                                  value: _vm.fieldValue[_vm.fieldData.name]
                                },
                                on: {
                                  input: function($event) {
                                    if ($event.target.composing) {
                                      return
                                    }
                                    _vm.$set(
                                      _vm.fieldValue,
                                      _vm.fieldData.name,
                                      $event.target.value
                                    )
                                  }
                                }
                              })
                            ]
                          )
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "color" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c(
                          "div",
                          { staticClass: "field" },
                          [
                            _c("color-picker", {
                              attrs: {
                                itemKey: _vm.fieldData.name,
                                customData: _vm.singleColorPicker
                              },
                              on: {
                                "custom-change": function(e) {
                                  return _vm.setCustomColor(
                                    e,
                                    _vm.fieldData.name
                                  )
                                },
                                toggleColorPicker: _vm.toggleColorPicker
                              },
                              model: {
                                value: _vm.fieldValue[_vm.fieldData.name],
                                callback: function($$v) {
                                  _vm.$set(
                                    _vm.fieldValue,
                                    _vm.fieldData.name,
                                    $$v
                                  )
                                },
                                expression: "fieldValue[fieldData.name]"
                              }
                            })
                          ],
                          1
                        )
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "html" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "warning" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c("fieldset", [
                      _c("div", { staticClass: "field_data" }, [
                        _c(
                          "h3",
                          {
                            staticClass:
                              "field_heading dokan-setting-warning error",
                            attrs: { scope: "row" }
                          },
                          [
                            _c(
                              "span",
                              { staticClass: "dokan-setting-warning-label" },
                              [
                                _c("span", {
                                  staticClass: "dashicons dashicons-warning"
                                }),
                                _vm._v(
                                  "\n                            " +
                                    _vm._s(_vm.fieldData.label) +
                                    "\n                        "
                                )
                              ]
                            ),
                            _vm._v(" "),
                            _c("span", {
                              staticClass: "field_desc",
                              domProps: {
                                innerHTML: _vm._s(_vm.fieldData.desc)
                              }
                            })
                          ]
                        )
                      ])
                    ])
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "radio" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c(
                          "div",
                          { staticClass: "field radio_fields" },
                          [
                            _vm._l(_vm.fieldData.options, function(
                              optionVal,
                              optionKey
                            ) {
                              return [
                                _c(
                                  "label",
                                  {
                                    key: optionKey,
                                    class: _vm.isSwitchOptionChecked(optionKey)
                                      ? "checked"
                                      : "",
                                    attrs: {
                                      for:
                                        _vm.sectionId +
                                        "[" +
                                        _vm.fieldData.name +
                                        "][" +
                                        optionKey +
                                        "]"
                                    }
                                  },
                                  [
                                    _c("span", {
                                      staticClass: "dashicons dashicons-yes"
                                    }),
                                    _vm._v(" "),
                                    _c("input", {
                                      directives: [
                                        {
                                          name: "model",
                                          rawName: "v-model",
                                          value:
                                            _vm.fieldValue[_vm.fieldData.name],
                                          expression:
                                            "fieldValue[fieldData.name]"
                                        }
                                      ],
                                      staticClass: "radio",
                                      attrs: {
                                        type: "radio",
                                        name: optionKey,
                                        id:
                                          _vm.sectionId +
                                          "[" +
                                          _vm.fieldData.name +
                                          "][" +
                                          optionKey +
                                          "]"
                                      },
                                      domProps: {
                                        value: optionKey,
                                        checked: _vm._q(
                                          _vm.fieldValue[_vm.fieldData.name],
                                          optionKey
                                        )
                                      },
                                      on: {
                                        change: function($event) {
                                          return _vm.$set(
                                            _vm.fieldValue,
                                            _vm.fieldData.name,
                                            optionKey
                                          )
                                        }
                                      }
                                    }),
                                    _vm._v(
                                      "\n                            " +
                                        _vm._s(optionVal) +
                                        "\n                        "
                                    )
                                  ]
                                )
                              ]
                            })
                          ],
                          2
                        )
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "wpeditor" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "field editor_field" },
                      [
                        _c("text-editor", {
                          domProps: {
                            innerHTML: _vm._s(_vm.fieldData.default)
                          },
                          model: {
                            value: _vm.fieldValue[_vm.fieldData.name],
                            callback: function($$v) {
                              _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$v)
                            },
                            expression: "fieldValue[fieldData.name]"
                          }
                        })
                      ],
                      1
                    )
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "repeatable" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        }),
                        _vm._v(" "),
                        _c("div", { staticClass: "field repeatable_fields" }, [
                          _c("input", {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.repeatableItem[_vm.fieldData.name],
                                expression: "repeatableItem[fieldData.name]"
                              }
                            ],
                            staticClass: "regular-text medium",
                            attrs: { type: "text" },
                            domProps: {
                              value: _vm.repeatableItem[_vm.fieldData.name]
                            },
                            on: {
                              input: function($event) {
                                if ($event.target.composing) {
                                  return
                                }
                                _vm.$set(
                                  _vm.repeatableItem,
                                  _vm.fieldData.name,
                                  $event.target.value
                                )
                              }
                            }
                          }),
                          _vm._v(" "),
                          _c(
                            "a",
                            {
                              staticClass:
                                "button dokan-repetable-add-item-btn",
                              attrs: { href: "#" },
                              on: {
                                click: function($event) {
                                  $event.preventDefault()
                                  return _vm.addItem(
                                    _vm.fieldData.type,
                                    _vm.fieldData.name
                                  )
                                }
                              }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-plus-alt2"
                              })
                            ]
                          )
                        ])
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "ul",
                      { staticClass: "dokan-settings-repeatable-list" },
                      [
                        _vm._l(_vm.fieldValue[_vm.fieldData.name], function(
                          optionVal,
                          optionKey
                        ) {
                          return [
                            _vm.fieldValue[_vm.fieldData.name]
                              ? _c("li", { key: optionKey }, [
                                  _vm._v(
                                    "\n                        " +
                                      _vm._s(optionVal.value) +
                                      "\n                        "
                                  ),
                                  !optionVal.must_use
                                    ? _c("span", {
                                        staticClass:
                                          "dashicons dashicons-no-alt remove-item",
                                        on: {
                                          click: function($event) {
                                            $event.preventDefault()
                                            return _vm.removeItem(
                                              optionKey,
                                              _vm.fieldData.name
                                            )
                                          }
                                        }
                                      })
                                    : _vm._e(),
                                  _vm._v(" "),
                                  _c("span", {
                                    staticClass: "repeatable-item-description",
                                    domProps: {
                                      innerHTML: _vm._s(optionVal.desc)
                                    }
                                  })
                                ])
                              : _vm._e()
                          ]
                        })
                      ],
                      2
                    )
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "radio_image" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "field radio-image-container" },
                      [
                        _vm._l(_vm.fieldData.options, function(image, name) {
                          return [
                            _c(
                              "label",
                              {
                                key: name,
                                staticClass: "radio-image",
                                class: {
                                  active:
                                    _vm.fieldValue[_vm.fieldData.name] === name,
                                  "not-active":
                                    _vm.fieldValue[_vm.fieldData.name] !== name
                                }
                              },
                              [
                                _c("input", {
                                  directives: [
                                    {
                                      name: "model",
                                      rawName: "v-model",
                                      value: _vm.fieldValue[_vm.fieldData.name],
                                      expression: "fieldValue[fieldData.name]"
                                    }
                                  ],
                                  staticClass: "radio",
                                  attrs: {
                                    type: "radio",
                                    name: _vm.fieldData.name
                                  },
                                  domProps: {
                                    value: name,
                                    checked: _vm._q(
                                      _vm.fieldValue[_vm.fieldData.name],
                                      name
                                    )
                                  },
                                  on: {
                                    change: function($event) {
                                      return _vm.$set(
                                        _vm.fieldValue,
                                        _vm.fieldData.name,
                                        name
                                      )
                                    }
                                  }
                                }),
                                _vm._v(" "),
                                _c(
                                  "span",
                                  { staticClass: "current-option-indicator" },
                                  [
                                    _c("span", {
                                      staticClass: "dashicons dashicons-yes"
                                    }),
                                    _vm._v(
                                      "\n                            " +
                                        _vm._s(_vm.__("Active", "dokan-lite")) +
                                        "\n                        "
                                    )
                                  ]
                                ),
                                _vm._v(" "),
                                _c("img", { attrs: { src: image } }),
                                _vm._v(" "),
                                _c("span", { staticClass: "active-option" }, [
                                  _c(
                                    "button",
                                    {
                                      staticClass:
                                        "button button-primary button-hero",
                                      attrs: { type: "button" },
                                      on: {
                                        click: function($event) {
                                          $event.preventDefault()
                                          _vm.fieldValue[
                                            _vm.fieldData.name
                                          ] = name
                                        }
                                      }
                                    },
                                    [
                                      _vm._v(
                                        "\n                                " +
                                          _vm._s(
                                            _vm.__("Select", "dokan-lite")
                                          ) +
                                          "\n                            "
                                      )
                                    ]
                                  )
                                ])
                              ]
                            )
                          ]
                        })
                      ],
                      2
                    )
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "gmap" === _vm.fieldData.type && !_vm.hideMap
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "field gmap-field" },
                      [
                        _c("input", {
                          attrs: {
                            type: "hidden",
                            name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                          },
                          domProps: { value: _vm.mapLocation }
                        }),
                        _vm._v(" "),
                        _vm.mapApiSource === "mapbox"
                          ? _c("Mapbox", {
                              attrs: {
                                width: "100%",
                                height: "300px",
                                location: _vm.mapLocation,
                                accessToken: _vm.mapboxAccessToken
                              },
                              on: {
                                hideMap: _vm.onHideMap,
                                updateMap: _vm.onUpdateMap
                              }
                            })
                          : _c("GoogleMaps", {
                              attrs: {
                                location: _vm.mapLocation,
                                apiKey: _vm.googleMapApiKey
                              },
                              on: {
                                hideMap: _vm.onHideMap,
                                updateMap: _vm.onUpdateMap
                              }
                            })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.hasError(_vm.fieldData.name)
                      ? _c("p", { staticClass: "dokan-error" }, [
                          _vm._v(
                            "\n                " +
                              _vm._s(_vm.getError(_vm.fieldData.label)) +
                              "\n            "
                          )
                        ])
                      : _vm._e()
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "social" === _vm.fieldData.type
            ? [
                _c(
                  "div",
                  {
                    staticClass: "field_contents",
                    class: [
                      _vm.fieldData.content_class
                        ? _vm.fieldData.content_class
                        : ""
                    ]
                  },
                  [
                    _c(
                      "fieldset",
                      [
                        _c("FieldHeading", {
                          attrs: { fieldData: _vm.fieldData }
                        })
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _c(
                      "div",
                      { staticClass: "field scl_fields" },
                      [
                        _c("div", { staticClass: "scl_header" }, [
                          _c("div", { staticClass: "scl_contents" }, [
                            _c("div", { staticClass: "scl_icon" }, [
                              _c("img", {
                                attrs: {
                                  src: _vm.fieldData.icon_url,
                                  alt: _vm.fieldData.label
                                }
                              })
                            ]),
                            _vm._v(" "),
                            _c("p", { staticClass: "scl_desc" }, [
                              _vm._v(_vm._s(_vm.fieldData.social_desc))
                            ])
                          ]),
                          _vm._v(" "),
                          _c(
                            "div",
                            {
                              staticClass: "expand_btn",
                              on: { click: _vm.expandSocial }
                            },
                            [
                              _c("span", {
                                staticClass: "dashicons",
                                class: [
                                  !this.expandSocials
                                    ? "dashicons-arrow-down-alt2"
                                    : "dashicons-arrow-up-alt2"
                                ]
                              })
                            ]
                          )
                        ]),
                        _vm._v(" "),
                        _vm._l(_vm.fieldData, function(fields, index) {
                          return [
                            _vm.expandSocials && fields.social_field
                              ? _c(
                                  "div",
                                  { key: index, staticClass: "scl_info" },
                                  [
                                    _c(
                                      "div",
                                      {
                                        class: [
                                          { scl_html: fields.type === "html" },
                                          { scl_text: fields.type !== "html" },
                                          fields.content_class
                                            ? fields.content_class
                                            : ""
                                        ]
                                      },
                                      [
                                        _c("SocialFields", {
                                          attrs: {
                                            fieldData: fields,
                                            fieldValue: _vm.fieldValue
                                          }
                                        })
                                      ],
                                      1
                                    )
                                  ]
                                )
                              : _vm._e()
                          ]
                        })
                      ],
                      2
                    )
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.customFieldComponents
            ? _vm._l(_vm.customFieldComponents, function(
                settingsComponent,
                index
              ) {
                return _c(settingsComponent, {
                  key: index,
                  tag: "component",
                  attrs: {
                    sectionId: _vm.sectionId,
                    fieldData: _vm.fieldData,
                    fieldValue: _vm.fieldValue,
                    assetsUrl: _vm.dokanAssetsUrl,
                    validationErrors: _vm.validationErrors,
                    toggleLoadingState: _vm.toggleLoadingState
                  },
                  on: { "some-event": _vm.thisSomeEvent }
                })
              })
            : _vm._e()
        ],
        2
      )
    : _vm._e()
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-a96ce32e", esExports)
  }
}

/***/ }),
/* 190 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingsBanner_vue__ = __webpack_require__(76);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b725e442_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SettingsBanner_vue__ = __webpack_require__(192);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(191)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingsBanner_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b725e442_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SettingsBanner_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/SettingsBanner.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-b725e442", Component.options)
  } else {
    hotAPI.reload("data-v-b725e442", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 191 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 192 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "dokan-settings-banner" } }, [
    _c("img", {
      attrs: {
        src: _vm.bannerImage,
        alt: _vm.__("Dokan Settings Banner", "dokan-lite")
      }
    }),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "content" },
      [
        _c("h1", [
          _vm._v(
            _vm._s(
              _vm.__(
                "Looking for Coupons, Variable Products, SEO or Shipping?",
                "dokan-lite"
              )
            )
          )
        ]),
        _vm._v(" "),
        _c("p", [
          _vm._v(
            _vm._s(
              _vm.__(
                "Unlock these awesome frontend features with Dokan PRO",
                "dokan-lite"
              )
            )
          )
        ]),
        _vm._v(" "),
        _c(
          "a",
          {
            staticClass: "button",
            attrs: {
              target: "_blank",
              rel: "noopener noreferrer",
              href: _vm.upgradeURL
            }
          },
          [_vm._v(_vm._s(_vm.__("Upgrade to Pro", "dokan-lite")))]
        ),
        _vm._v(" "),
        _c(
          "router-link",
          {
            staticClass: "button custom-button",
            attrs: { to: { name: "VendorCapabilities" } }
          },
          [
            _vm._v(
              "\n            " +
                _vm._s(
                  _vm.__("Check Out All Vendor Functionalities", "dokan-lite")
                ) +
                "\n        "
            )
          ]
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-b725e442", esExports)
  }
}

/***/ }),
/* 193 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      _c(
        "div",
        { staticClass: "dokan-settings" },
        [
          _c("h2", { staticStyle: { "margin-bottom": "15px" } }, [
            _vm._v(_vm._s(_vm.__("Settings", "dokan-lite")))
          ]),
          _vm._v(" "),
          _c("AdminNotice"),
          _vm._v(" "),
          !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
          _vm._v(" "),
          _vm.isSaved
            ? _c(
                "div",
                {
                  staticClass: "settings-error notice is-dismissible",
                  class: { updated: _vm.isUpdated, error: !_vm.isUpdated },
                  attrs: { id: "setting-message_updated" }
                },
                [
                  _c("p", [
                    _c("strong", {
                      domProps: { innerHTML: _vm._s(_vm.message) }
                    })
                  ]),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "notice-dismiss",
                      attrs: { type: "button" },
                      on: {
                        click: function($event) {
                          $event.preventDefault()
                          _vm.isSaved = false
                        }
                      }
                    },
                    [
                      _c("span", { staticClass: "screen-reader-text" }, [
                        _vm._v(
                          _vm._s(_vm.__("Dismiss this notice.", "dokan-lite"))
                        )
                      ])
                    ]
                  )
                ]
              )
            : _vm._e(),
          _vm._v(" "),
          _c(
            "div",
            { ref: "settingsWrapper", staticClass: "dokan-settings-wrap" },
            [
              _c("div", { staticClass: "nav-tab-wrapper" }, [
                _c(
                  "div",
                  { staticClass: "nab-section" },
                  [
                    _c("div", { staticClass: "search-box" }, [
                      _c("label", {
                        staticClass: "dashicons dashicons-search",
                        attrs: { for: "dokan-admin-search" }
                      }),
                      _vm._v(" "),
                      _c("input", {
                        directives: [
                          {
                            name: "model",
                            rawName: "v-model",
                            value: _vm.searchText,
                            expression: "searchText"
                          }
                        ],
                        ref: "searchInSettings",
                        staticClass: "dokan-admin-search-settings",
                        attrs: {
                          type: "text",
                          id: "dokan-admin-search",
                          placeholder: _vm.__(
                            "Search e.g. vendor",
                            "dokan-lite"
                          )
                        },
                        domProps: { value: _vm.searchText },
                        on: {
                          input: [
                            function($event) {
                              if ($event.target.composing) {
                                return
                              }
                              _vm.searchText = $event.target.value
                            },
                            _vm.searchInSettings
                          ]
                        }
                      }),
                      _vm._v(" "),
                      "" !== _vm.searchText
                        ? _c("span", {
                            staticClass: "dashicons dashicons-no-alt",
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                return _vm.clearSearch.apply(null, arguments)
                              }
                            }
                          })
                        : _vm._e()
                    ]),
                    _vm._v(" "),
                    _vm._l(_vm.settingSections, function(section) {
                      return [
                        _c(
                          "div",
                          {
                            key: section.id,
                            class: [
                              "nav-tab",
                              _vm.currentTab === section.id
                                ? "nav-tab-active"
                                : ""
                            ],
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                return _vm.changeTab(section)
                              }
                            }
                          },
                          [
                            _c("img", {
                              attrs: {
                                src: section.icon_url,
                                alt: section.settings_title
                              }
                            }),
                            _vm._v(" "),
                            _c("div", { staticClass: "nav-content" }, [
                              _c("div", { staticClass: "nav-title" }, [
                                _vm._v(_vm._s(section.title))
                              ]),
                              _vm._v(" "),
                              _c("div", { staticClass: "nav-description" }, [
                                _vm._v(_vm._s(section.description))
                              ])
                            ])
                          ]
                        )
                      ]
                    })
                  ],
                  2
                )
              ]),
              _vm._v(" "),
              _c(
                "div",
                { staticClass: "metabox-holder" },
                [
                  _vm._l(_vm.settingSections, function(section) {
                    return _vm.currentTab === section.id
                      ? _c("fieldset", { staticClass: "settings-header" }, [
                          _c("div", { staticClass: "settings-content" }, [
                            _c("h2", { staticClass: "settings-title" }, [
                              _vm._v(_vm._s(section.settings_title))
                            ]),
                            _vm._v(" "),
                            _c("p", { staticClass: "settings-description" }, [
                              _vm._v(_vm._s(section.settings_description))
                            ])
                          ]),
                          _vm._v(" "),
                          section.document_link
                            ? _c(
                                "div",
                                { staticClass: "settings-document-button" },
                                [
                                  _c(
                                    "a",
                                    {
                                      staticClass: "doc-link",
                                      attrs: {
                                        href: section.document_link,
                                        target: "_blank"
                                      }
                                    },
                                    [
                                      _vm._v(
                                        _vm._s(
                                          _vm.__("Documentation", "dokan-lite")
                                        )
                                      )
                                    ]
                                  )
                                ]
                              )
                            : _vm._e()
                        ])
                      : _vm._e()
                  }),
                  _vm._v(" "),
                  _vm._l(_vm.settingFields, function(fields, index) {
                    return _vm.isLoaded
                      ? [
                          _vm.currentTab === index
                            ? _c(
                                "div",
                                {
                                  key: index,
                                  staticClass: "group",
                                  attrs: { id: index }
                                },
                                [
                                  _c(
                                    "form",
                                    {
                                      attrs: {
                                        method: "post",
                                        action: "options.php"
                                      }
                                    },
                                    [
                                      _c("input", {
                                        attrs: {
                                          type: "hidden",
                                          name: "option_page"
                                        },
                                        domProps: { value: index }
                                      }),
                                      _vm._v(" "),
                                      _c("input", {
                                        attrs: {
                                          type: "hidden",
                                          name: "action",
                                          value: "update"
                                        }
                                      }),
                                      _vm._v(" "),
                                      _c("div", { staticClass: "form-table" }, [
                                        _c(
                                          "div",
                                          {
                                            staticClass: "dokan-settings-fields"
                                          },
                                          _vm._l(fields, function(
                                            field,
                                            fieldId
                                          ) {
                                            return _c("Fields", {
                                              key: fieldId,
                                              attrs: {
                                                "section-id": index,
                                                id: fieldId,
                                                "field-data": field,
                                                "field-value":
                                                  _vm.settingValues[index],
                                                "all-settings-values":
                                                  _vm.settingValues,
                                                errors: _vm.errors,
                                                validationErrors:
                                                  _vm.validationErrors,
                                                "toggle-loading-state":
                                                  _vm.toggleLoadingState,
                                                dokanAssetsUrl:
                                                  _vm.dokanAssetsUrl
                                              },
                                              on: { openMedia: _vm.showMedia }
                                            })
                                          }),
                                          1
                                        )
                                      ]),
                                      _vm._v(" "),
                                      _c("p", { staticClass: "submit" }, [
                                        _c("input", {
                                          staticClass: "button button-primary",
                                          attrs: {
                                            type: "submit",
                                            name: "submit",
                                            id: "submit",
                                            value: "Save Changes"
                                          },
                                          on: {
                                            click: function($event) {
                                              $event.preventDefault()
                                              return _vm.saveSettings(
                                                _vm.settingValues[index],
                                                index
                                              )
                                            }
                                          }
                                        })
                                      ])
                                    ]
                                  )
                                ]
                              )
                            : _vm._e()
                        ]
                      : _vm._e()
                  }),
                  _vm._v(" "),
                  _c(
                    "div",
                    {
                      directives: [
                        {
                          name: "tooltip",
                          rawName: "v-tooltip",
                          value: _vm.__("Back to top", "dokan-lite"),
                          expression: "__( 'Back to top', 'dokan-lite' )"
                        }
                      ],
                      ref: "backToTop",
                      staticClass: "back-to-top tips",
                      attrs: { title: _vm.__("Back to top", "dokan-lite") },
                      on: { click: _vm.scrollToTop }
                    },
                    [
                      _c("img", {
                        attrs: {
                          src: _vm.dokanAssetsUrl + "/images/up-arrow.svg",
                          alt: _vm.__("Dokan Back to Top Button", "dokan-lite")
                        }
                      })
                    ]
                  )
                ],
                2
              ),
              _vm._v(" "),
              _vm.showLoading
                ? _c("div", { staticClass: "loading" }, [_c("loading")], 1)
                : _vm._e()
            ]
          )
        ],
        1
      ),
      _vm._v(" "),
      !_vm.hasPro ? _c("SettingsBanner") : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-e4dc4572", esExports)
  }
}

/***/ }),
/* 194 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Vendors_vue__ = __webpack_require__(77);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_f81b8092_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Vendors_vue__ = __webpack_require__(199);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(195)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Vendors_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_f81b8092_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Vendors_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/Vendors.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-f81b8092", Component.options)
  } else {
    hotAPI.reload("data-v-f81b8092", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 195 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 196 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_AddVendor_vue__ = __webpack_require__(78);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75e0fcd5_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_AddVendor_vue__ = __webpack_require__(198);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(197)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_AddVendor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75e0fcd5_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_AddVendor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/AddVendor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-75e0fcd5", Component.options)
  } else {
    hotAPI.reload("data-v-75e0fcd5", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 197 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 198 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-vendor-edit" },
    [
      _c(
        "modal",
        {
          attrs: { title: _vm.title, width: "800px" },
          on: { close: _vm.closeModal }
        },
        [
          _c("div", { attrs: { slot: "body" }, slot: "body" }, [
            _c("div", { staticClass: "tab-header" }, [
              _c(
                "ul",
                { staticClass: "tab-list" },
                _vm._l(_vm.tabs, function(tab, index) {
                  return _c(
                    "li",
                    {
                      key: index,
                      class: {
                        "tab-title": true,
                        active: _vm.currentTab === tab.name,
                        last: tab.name === "VendorPaymentFields"
                      }
                    },
                    [
                      _c("div", { staticClass: "tab-link" }, [
                        _c(
                          "a",
                          {
                            class: {
                              first: tab.name === "VendorAccountFields"
                            },
                            attrs: { href: "#" },
                            on: {
                              click: function($event) {
                                $event.preventDefault()
                                _vm.currentTab = tab.name
                              }
                            }
                          },
                          [
                            _c("span", { class: [tab.icon] }),
                            _vm._v(
                              "\n                                " +
                                _vm._s(tab.label) +
                                "\n                            "
                            )
                          ]
                        )
                      ])
                    ]
                  )
                }),
                0
              )
            ]),
            _vm._v(" "),
            _vm.currentTab
              ? _c(
                  "div",
                  { staticClass: "tab-contents" },
                  [
                    _vm.isLoading
                      ? _c(
                          "div",
                          { staticClass: "loading" },
                          [_c("loading")],
                          1
                        )
                      : _vm._e(),
                    _vm._v(" "),
                    !_vm.isLoading
                      ? _c(
                          "transition",
                          { attrs: { name: "component-fade", mode: "out-in" } },
                          [
                            _c(_vm.currentTab, {
                              tag: "component",
                              attrs: {
                                vendorInfo: _vm.store,
                                errors: _vm.errors
                              }
                            })
                          ],
                          1
                        )
                      : _vm._e()
                  ],
                  1
                )
              : _vm._e()
          ]),
          _vm._v(" "),
          _c("div", { attrs: { slot: "footer" }, slot: "footer" }, [
            _c(
              "button",
              {
                staticClass: "button button-primary button-hero",
                on: { click: _vm.createVendor }
              },
              [
                _vm._v(
                  _vm._s(
                    "VendorPaymentFields" === _vm.currentTab
                      ? _vm.__("Create Vendor", "dokan-lite")
                      : this.nextBtn
                  )
                )
              ]
            )
          ])
        ]
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-75e0fcd5", esExports)
  }
}

/***/ }),
/* 199 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c(
      "div",
      { staticClass: "vendor-list" },
      [
        _c("h1", { staticClass: "wp-heading-inline" }, [
          _vm._v(_vm._s(_vm.__("Vendors", "dokan-lite")))
        ]),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "page-title-action",
            on: {
              click: function($event) {
                return _vm.addNew()
              }
            }
          },
          [_vm._v(_vm._s(_vm.__("Add New", "dokan-lite")))]
        ),
        _vm._v(" "),
        _vm._l(_vm.dokanVendorHeaderArea, function(vendorHeaderArea, index) {
          return _c(vendorHeaderArea, { key: index, tag: "component" })
        }),
        _vm._v(" "),
        _c("AdminNotice"),
        _vm._v(" "),
        !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
        _vm._v(" "),
        _c("hr", { staticClass: "wp-header-end" }),
        _vm._v(" "),
        _c("ul", { staticClass: "subsubsub" }, [
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  attrs: {
                    to: { name: "Vendors", query: { status: "all" } },
                    "active-class": "current",
                    exact: ""
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("All", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.all))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  attrs: {
                    to: { name: "Vendors", query: { status: "approved" } },
                    "active-class": "current",
                    exact: ""
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("Approved", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.approved))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          ),
          _vm._v(" "),
          _c(
            "li",
            [
              _c(
                "router-link",
                {
                  attrs: {
                    to: { name: "Vendors", query: { status: "pending" } },
                    "active-class": "current",
                    exact: ""
                  }
                },
                [
                  _vm._v(_vm._s(_vm.__("Pending", "dokan-lite")) + " "),
                  _c("span", { staticClass: "count" }, [
                    _vm._v(_vm._s(_vm.counts.pending))
                  ])
                ]
              ),
              _vm._v(" | ")
            ],
            1
          )
        ]),
        _vm._v(" "),
        _c("search", {
          attrs: { title: _vm.__("Search Vendors", "dokan-lite") },
          on: { searched: _vm.doSearch }
        }),
        _vm._v(" "),
        _c("list-table", {
          attrs: {
            columns: _vm.columns,
            loading: _vm.loading,
            rows: _vm.vendors,
            actions: _vm.actions,
            actionColumn: "store_name",
            "show-cb": _vm.showCb,
            "total-items": _vm.totalItems,
            "bulk-actions": _vm.bulkActions,
            "total-pages": _vm.totalPages,
            "per-page": _vm.perPage,
            "current-page": _vm.currentPage,
            "action-column": _vm.actionColumn,
            "not-found": "No vendors found.",
            "sort-by": _vm.sortBy,
            "sort-order": _vm.sortOrder,
            text: _vm.$root.listTableTexts()
          },
          on: {
            sort: _vm.sortCallback,
            pagination: _vm.goToPage,
            "action:click": _vm.onActionClick,
            "bulk:click": _vm.onBulkAction,
            searched: _vm.doSearch
          },
          scopedSlots: _vm._u([
            {
              key: "store_name",
              fn: function(data) {
                return [
                  _c("img", {
                    attrs: {
                      src: data.row.gravatar,
                      alt: data.row.store_name,
                      width: "50"
                    }
                  }),
                  _vm._v(" "),
                  _c(
                    "strong",
                    [
                      _vm.hasPro
                        ? _c(
                            "router-link",
                            { attrs: { to: "/vendors/" + data.row.id } },
                            [
                              _vm._v(
                                _vm._s(
                                  data.row.store_name
                                    ? data.row.store_name
                                    : _vm.__("(no name)", "dokan-lite")
                                )
                              )
                            ]
                          )
                        : _c(
                            "a",
                            { attrs: { href: _vm.editUrl(data.row.id) } },
                            [
                              _vm._v(
                                _vm._s(
                                  data.row.store_name
                                    ? data.row.store_name
                                    : _vm.__("(no name)", "dokan-lite")
                                )
                              )
                            ]
                          )
                    ],
                    1
                  )
                ]
              }
            },
            {
              key: "email",
              fn: function(data) {
                return [
                  _c("a", { attrs: { href: "mailto:" + data.row.email } }, [
                    _vm._v(_vm._s(data.row.email))
                  ])
                ]
              }
            },
            {
              key: "categories",
              fn: function(ref) {
                var row = ref.row
                return [
                  _vm._v(
                    "\n                " +
                      _vm._s(
                        row.categories
                          .map(function(category) {
                            return category.name
                          })
                          .join(", ")
                      ) +
                      "\n            "
                  )
                ]
              }
            },
            {
              key: "registered",
              fn: function(data) {
                return [
                  _vm._v(
                    "\n                " +
                      _vm._s(
                        _vm.moment(data.row.registered).format("MMM D, YYYY")
                      ) +
                      "\n            "
                  )
                ]
              }
            },
            {
              key: "enabled",
              fn: function(data) {
                return [
                  _c("switches", {
                    attrs: { enabled: data.row.enabled, value: data.row.id },
                    on: { input: _vm.onSwitch }
                  })
                ]
              }
            },
            {
              key: "row-actions",
              fn: function(data) {
                return _vm._l(_vm.actions, function(action, index) {
                  return _c(
                    "span",
                    { class: action.key },
                    [
                      _vm.hasPro && action.key == "edit"
                        ? _c(
                            "router-link",
                            {
                              attrs: {
                                to: {
                                  path: "vendors/" + data.row.id,
                                  query: { edit: "true" }
                                }
                              }
                            },
                            [_vm._v(_vm._s(action.label))]
                          )
                        : !_vm.hasPro && action.key == "edit"
                        ? _c(
                            "a",
                            { attrs: { href: _vm.editUrl(data.row.id) } },
                            [_vm._v(_vm._s(action.label))]
                          )
                        : action.key == "products"
                        ? _c(
                            "a",
                            { attrs: { href: _vm.productUrl(data.row.id) } },
                            [_vm._v(_vm._s(action.label))]
                          )
                        : action.key == "orders"
                        ? _c(
                            "a",
                            { attrs: { href: _vm.ordersUrl(data.row.id) } },
                            [_vm._v(_vm._s(action.label))]
                          )
                        : action.key == "switch_to"
                        ? _c(
                            "a",
                            { attrs: { href: _vm.switchToUrl(data.row) } },
                            [_vm._v(_vm._s(action.label))]
                          )
                        : _c("a", { attrs: { href: "#" } }, [
                            _vm._v(_vm._s(action.label))
                          ]),
                      _vm._v(" "),
                      index !== _vm.actions.length - 1
                        ? [_vm._v(" | ")]
                        : _vm._e()
                    ],
                    2
                  )
                })
              }
            },
            {
              key: "filters",
              fn: function(data) {
                return _vm._l(_vm.dokanVendorFilterSectionStart, function(
                  dokanVendorFilterSection,
                  index
                ) {
                  return _c(dokanVendorFilterSection, {
                    key: index,
                    tag: "component",
                    on: { updateVendorComponent: _vm.updateVendorComponent }
                  })
                })
              }
            }
          ])
        }),
        _vm._v(" "),
        _vm.loadAddVendor
          ? _c("add-vendor", { attrs: { "vendor-id": _vm.vendorId } })
          : _vm._e()
      ],
      2
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-f81b8092", esExports)
  }
}

/***/ }),
/* 200 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DummyData_vue__ = __webpack_require__(79);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_33b27104_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_DummyData_vue__ = __webpack_require__(202);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(201)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-33b27104"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_DummyData_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_33b27104_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_DummyData_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/DummyData.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-33b27104", Component.options)
  } else {
    hotAPI.reload("data-v-33b27104", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 201 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 202 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("h1", [_vm._v(_vm._s(_vm.__("Import dummy data", "dokan-lite")))]),
    _vm._v(" "),
    !_vm.statusLoader
      ? _c("div", { staticClass: "dokan-importer-wrapper" }, [
          _c("ol", { staticClass: "dokan-importer-progress-steps" }, [
            _c("li", { staticClass: "active" }, [
              _vm._v(_vm._s(_vm.__("Import", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("li", { class: _vm.done ? "active" : "" }, [
              _vm._v(_vm._s(_vm.__("Done!", "dokan-lite")))
            ])
          ]),
          _vm._v(" "),
          "" != _vm.errorMsg
            ? _c("div", { staticClass: "error inline" }, [
                _c("p", [_vm._v(_vm._s(_vm.errorMsg))])
              ])
            : _vm._e(),
          _vm._v(" "),
          !_vm.done
            ? _c("div", { staticClass: "dokan-importer" }, [
                _c("header", [
                  _c("h2", [
                    _vm._v(
                      _vm._s(
                        _vm.__(
                          "Import dummy vendors and products",
                          "dokan-lite"
                        )
                      )
                    )
                  ]),
                  _vm._v(" "),
                  _c("p", [
                    _vm._v(
                      _vm._s(
                        _vm.__(
                          "This tool allows you to import vendor and some products for vendors to your marketplace.",
                          "dokan-lite"
                        )
                      )
                    )
                  ])
                ]),
                _vm._v(" "),
                _c("section", [
                  _c("div", [
                    _c("progress", {
                      staticClass: "dokan-dummy-data-progress-bar",
                      attrs: { max: "100" },
                      domProps: { value: _vm.progress }
                    })
                  ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "dokan-importer-action" }, [
                  _c(
                    "button",
                    {
                      staticClass: "dokan-import-continue-btn",
                      class: _vm.loading ? "is-loading" : "",
                      attrs: { disabled: _vm.loading },
                      on: { click: _vm.importBtnHandler }
                    },
                    [_vm._v(_vm._s(_vm.__("Run the importer", "dokan-lite")))]
                  )
                ])
              ])
            : _c("div", { staticClass: "dokan-importer" }, [
                _c("section", { staticClass: "import-done" }, [
                  _c(
                    "svg",
                    {
                      attrs: {
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0 0 512 512",
                        width: "100",
                        height: "100"
                      }
                    },
                    [
                      _c("path", {
                        attrs: {
                          d:
                            "M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM371.8 211.8C382.7 200.9 382.7 183.1 371.8 172.2C360.9 161.3 343.1 161.3 332.2 172.2L224 280.4L179.8 236.2C168.9 225.3 151.1 225.3 140.2 236.2C129.3 247.1 129.3 264.9 140.2 275.8L204.2 339.8C215.1 350.7 232.9 350.7 243.8 339.8L371.8 211.8z",
                          fill: "#1BAC9E"
                        }
                      })
                    ]
                  ),
                  _vm._v(" "),
                  _c("p", [
                    _vm._v(
                      "\n                    " +
                        _vm._s(_vm.__("Import complete!", "dokan-lite")) +
                        "\n                "
                    )
                  ]),
                  _vm._v(" "),
                  _c(
                    "div",
                    { staticClass: "links" },
                    [
                      _c(
                        "router-link",
                        {
                          attrs: {
                            to: { name: "Vendors", query: { status: "all" } },
                            exact: ""
                          }
                        },
                        [_vm._v(_vm._s(_vm.__("View vendors", "dokan-lite")))]
                      ),
                      _vm._v("\n                     \n                    "),
                      _c("a", { attrs: { href: _vm.getProductsPageUrl() } }, [
                        _vm._v(_vm._s(_vm.__("View products", "dokan-lite")))
                      ])
                    ],
                    1
                  )
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "dokan-importer-action" }, [
                  _c(
                    "button",
                    {
                      staticClass: "cancel-btn dokan-import-continue-btn",
                      class: _vm.loading ? "is-busy" : "",
                      attrs: { disabled: _vm.loading },
                      on: { click: _vm.clearAllDummyData }
                    },
                    [_vm._v(_vm._s(_vm.__("Clear dummy data", "dokan-lite")))]
                  )
                ])
              ])
        ])
      : _c("div", { staticClass: "dokan-importer-wrapper" }, [_vm._m(0)])
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "dokan-importer" }, [
      _c("header", [
        _c("span", { staticClass: "loader-title skeleton-loader" }),
        _vm._v(" "),
        _c("span", { staticClass: "loader-description skeleton-loader" })
      ]),
      _vm._v(" "),
      _c("section", [
        _c("div", [
          _c("span", { staticClass: "loader-loader skeleton-loader" })
        ])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "dokan-importer-action" }, [
        _c("span", { staticClass: "loader-btn skeleton-loader" })
      ])
    ])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-33b27104", esExports)
  }
}

/***/ }),
/* 203 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorCapabilities_vue__ = __webpack_require__(81);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_276be9c2_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorCapabilities_vue__ = __webpack_require__(205);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(204)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorCapabilities_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_276be9c2_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorCapabilities_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/VendorCapabilities.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-276be9c2", Component.options)
  } else {
    hotAPI.reload("data-v-276be9c2", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 204 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 205 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "dokan-vendor-capabilities" } },
    [
      _c(
        "div",
        { staticClass: "vendor-capabilities-banner", style: _vm.bannerBg },
        [
          _c("img", {
            attrs: {
              src: _vm.bannerImage,
              alt: _vm.__("Dokan Vendor Capabilities Banner", "dokan-lite")
            }
          }),
          _vm._v(" "),
          _c("div", { staticClass: "content" }, [
            _c("p", { staticClass: "title" }, [
              _vm._v(_vm._s(_vm.__("Vendor Capabilities", "dokan-lite")))
            ]),
            _vm._v(" "),
            _c("p", [
              _vm._v(
                "\n                " +
                  _vm._s(
                    _vm.__(
                      "One of the finest attractions of Dokan PRO is the vast array of powerful vendor controls & functions it provides so sellers can enjoy ownership, automation & freedom to run their stores. To use these awesome vendor features listed below, consider Upgrading to PRO.",
                      "dokan-lite"
                    )
                  ) +
                  "\n            "
              )
            ])
          ])
        ]
      ),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "grid" },
        _vm._l(_vm.capabilityCards, function(card) {
          return _c("div", { staticClass: "col-6" }, [
            _c("div", { staticClass: "capability-card" }, [
              _c("div", { staticClass: "capability-image" }, [
                _c("img", {
                  staticClass: "image",
                  attrs: {
                    src: card.image,
                    alt: _vm.__("Dokan Capability", "dokan-lite")
                  }
                }),
                _vm._v(" "),
                _c("div", { staticClass: "middle" }, [
                  _c(
                    "div",
                    {
                      staticClass: "zoom",
                      on: {
                        click: function($event) {
                          return _vm.openPopup(card.image)
                        }
                      }
                    },
                    [_c("div", { staticClass: "dashicons dashicons-search" })]
                  )
                ])
              ]),
              _vm._v(" "),
              _c("p", { staticClass: "title" }, [_vm._v(_vm._s(card.title))]),
              _vm._v(" "),
              _c("p", { staticClass: "content" }, [
                _vm._v(_vm._s(card.content))
              ])
            ])
          ])
        }),
        0
      ),
      _vm._v(" "),
      _c("ProCta"),
      _vm._v(" "),
      _vm.showPopup
        ? _c(
            "div",
            {
              attrs: { id: "dokan-capability-image-popup" },
              on: { click: _vm.closePopup }
            },
            [
              _c("div", { staticClass: "modal-content" }, [
                _c("div", { staticClass: "body" }, [
                  _c("img", {
                    attrs: {
                      src: this.selectedCapabilityImage,
                      alt: _vm.__("Dokan Capability", "dokan-lite")
                    }
                  })
                ])
              ])
            ]
          )
        : _vm._e()
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-276be9c2", esExports)
  }
}

/***/ }),
/* 206 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProModules_vue__ = __webpack_require__(82);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ca20ca84_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProModules_vue__ = __webpack_require__(211);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(207)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProModules_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ca20ca84_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProModules_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/ProModules.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ca20ca84", Component.options)
  } else {
    hotAPI.reload("data-v-ca20ca84", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 207 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 208 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ModuleUpgradePopup_vue__ = __webpack_require__(83);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_5ae162ac_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ModuleUpgradePopup_vue__ = __webpack_require__(210);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(209)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ModuleUpgradePopup_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_5ae162ac_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ModuleUpgradePopup_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/ModuleUpgradePopup.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5ae162ac", Component.options)
  } else {
    hotAPI.reload("data-v-5ae162ac", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 209 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 210 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "dokan-upgrade-to-pro-wrapper" } }, [
    _vm.showPopup
      ? _c(
          "div",
          {
            attrs: { id: "dokan-upgrade-popup" },
            on: {
              click: function($event) {
                if ($event.target !== $event.currentTarget) {
                  return null
                }
                return _vm.closePopup.apply(null, arguments)
              }
            }
          },
          [
            _c("div", { staticClass: "modal-content" }, [
              _c("div", { staticClass: "body" }, [
                _c(
                  "svg",
                  {
                    attrs: {
                      width: "128",
                      height: "109",
                      viewBox: "0 0 128 109",
                      fill: "none",
                      xmlns: "http://www.w3.org/2000/svg"
                    }
                  },
                  [
                    _c("path", {
                      attrs: {
                        d:
                          "M127.502 37.5077C127.406 37.2181 127.141 37.0125 126.827 36.9851L122.568 36.6104L120.884 32.7907C120.76 32.5108 120.477 32.3296 120.163 32.3296C119.848 32.3296 119.566 32.5108 119.441 32.7914L117.757 36.6104L113.497 36.9851C113.184 37.0132 112.92 37.2181 112.823 37.5077C112.726 37.7972 112.815 38.1148 113.052 38.315L116.272 41.0508L115.322 45.1028C115.253 45.4008 115.372 45.7087 115.627 45.8874C115.764 45.9834 115.925 46.0323 116.087 46.0323C116.226 46.0323 116.364 45.9959 116.489 45.9239L120.163 43.7962L123.835 45.9239C124.104 46.0805 124.443 46.0662 124.697 45.8874C124.953 45.7082 125.072 45.4001 125.002 45.1028L124.053 41.0508L127.272 38.3155C127.509 38.1148 127.6 37.7978 127.502 37.5077Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M16.8209 38.1758C16.7105 37.8194 16.4076 37.5663 16.0492 37.5326L11.1816 37.0714L9.25677 32.3703C9.11485 32.0258 8.79162 31.8027 8.4325 31.8027C8.07338 31.8027 7.75015 32.0258 7.60823 32.3711L5.68343 37.0714L0.815005 37.5326C0.457297 37.5671 0.155176 37.8194 0.0441323 38.1758C-0.0669114 38.5321 0.0356399 38.923 0.306237 39.1693L3.98561 42.5365L2.90064 47.5236C2.82125 47.8903 2.95765 48.2694 3.24922 48.4893C3.40594 48.6074 3.5893 48.6676 3.7742 48.6676C3.93362 48.6676 4.09176 48.6228 4.23368 48.5341L8.4325 45.9155L12.6298 48.5341C12.9369 48.7269 13.3241 48.7094 13.615 48.4893C13.9067 48.2687 14.043 47.8895 13.9636 47.5236L12.8786 42.5365L16.558 39.17C16.8286 38.923 16.9319 38.5328 16.8209 38.1758Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M110.124 10.7456C110.062 10.5674 109.891 10.4409 109.69 10.424L106.952 10.1934L105.869 7.84286C105.789 7.67059 105.607 7.55908 105.405 7.55908C105.203 7.55908 105.022 7.67059 104.942 7.84326L103.859 10.1934L101.121 10.424C100.919 10.4413 100.749 10.5674 100.687 10.7456C100.624 10.9238 100.682 11.1192 100.834 11.2424L102.904 12.926L102.294 15.4195C102.249 15.6029 102.326 15.7924 102.49 15.9024C102.578 15.9614 102.681 15.9915 102.785 15.9915C102.875 15.9915 102.964 15.9691 103.044 15.9248L105.405 14.6155L107.766 15.9248C107.939 16.0212 108.157 16.0124 108.321 15.9024C108.485 15.7921 108.561 15.6025 108.517 15.4195L107.906 12.926L109.976 11.2427C110.128 11.1192 110.186 10.9241 110.124 10.7456Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M34.2322 8.63769C34.1701 8.45951 33.9998 8.33297 33.7982 8.31612L31.0601 8.08551L29.9774 5.73495C29.8976 5.56268 29.7158 5.45117 29.5138 5.45117C29.3118 5.45117 29.13 5.56268 29.0501 5.73535L27.9674 8.08551L25.2289 8.31612C25.0277 8.33337 24.8578 8.45951 24.7953 8.63769C24.7329 8.81586 24.7906 9.01129 24.9428 9.13448L27.0124 10.8181L26.4021 13.3116C26.3575 13.495 26.4342 13.6845 26.5982 13.7945C26.6863 13.8535 26.7895 13.8836 26.8935 13.8836C26.9832 13.8836 27.0721 13.8612 27.152 13.8169L29.5138 12.5076L31.8748 13.8169C32.0475 13.9133 32.2653 13.9045 32.429 13.7945C32.593 13.6842 32.6697 13.4946 32.625 13.3116L32.0147 10.8181L34.0844 9.13481C34.2366 9.01129 34.2947 8.8162 34.2322 8.63769Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M36.3471 79.5168C36.3023 79.3832 36.1792 79.2883 36.0337 79.2757L34.0562 79.1027L33.2742 77.3398C33.2166 77.2106 33.0853 77.127 32.9394 77.127C32.7935 77.127 32.6622 77.2106 32.6045 77.3401L31.8226 79.1027L29.8448 79.2757C29.6994 79.2886 29.5767 79.3832 29.5316 79.5168C29.4865 79.6505 29.5282 79.797 29.6381 79.8894L31.1328 81.1521L30.6921 83.0223C30.6598 83.1598 30.7152 83.3019 30.8337 83.3844C30.8973 83.4287 30.9718 83.4513 31.0469 83.4513C31.1117 83.4513 31.1759 83.4345 31.2336 83.4012L32.9394 82.4192L34.6445 83.4012C34.7693 83.4735 34.9266 83.4669 35.0448 83.3844C35.1633 83.3017 35.2186 83.1595 35.1864 83.0223L34.7456 81.1521L36.2404 79.8897C36.3503 79.797 36.3923 79.6507 36.3471 79.5168Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        d:
                          "M115.928 67.9221C115.883 67.7885 115.76 67.6936 115.615 67.6809L113.637 67.508L112.855 65.7451C112.798 65.6159 112.666 65.5322 112.52 65.5322C112.375 65.5322 112.243 65.6159 112.186 65.7454L111.404 67.508L109.426 67.6809C109.281 67.6939 109.158 67.7885 109.113 67.9221C109.068 68.0557 109.109 68.2023 109.219 68.2947L110.714 69.5574L110.273 71.4276C110.241 71.5651 110.296 71.7072 110.415 71.7897C110.478 71.834 110.553 71.8566 110.628 71.8566C110.693 71.8566 110.757 71.8397 110.815 71.8065L112.52 70.8245L114.226 71.8065C114.35 71.8788 114.508 71.8722 114.626 71.7897C114.744 71.707 114.8 71.5648 114.767 71.4276L114.327 69.5574L115.821 68.295C115.931 68.2023 115.973 68.056 115.928 67.9221Z",
                        fill: "#FFC107"
                      }
                    }),
                    _vm._v(" "),
                    _c("g", { attrs: { filter: "url(#filter0_d_1098_419)" } }, [
                      _c("circle", {
                        attrs: {
                          cx: "65.5727",
                          cy: "47.0224",
                          r: "35.0473",
                          fill: "url(#paint0_linear_1098_419)"
                        }
                      })
                    ]),
                    _vm._v(" "),
                    _c("path", {
                      attrs: {
                        "fill-rule": "evenodd",
                        "clip-rule": "evenodd",
                        d:
                          "M73.2509 40.3179C73.2509 35.8737 69.6482 32.271 65.204 32.271C60.7598 32.271 57.1571 35.8737 57.1571 40.3179V44.2984H56.5271C54.9772 44.2984 53.7207 45.5549 53.7207 47.1048V58.5595C53.7207 60.1094 54.9772 61.3659 56.5271 61.3659H74.11C75.6599 61.3659 76.9164 60.1094 76.9164 58.5595V47.1048C76.9164 45.5549 75.6599 44.2984 74.11 44.2984H59.3335V40.4324L59.3345 40.3196C59.3947 37.1295 61.9995 34.5619 65.204 34.5619C68.4462 34.5619 71.0745 37.1902 71.0745 40.4324L71.0745 40.5756H73.2509V40.3179ZM65.3185 50.9994C66.4098 50.9994 67.2944 51.884 67.2944 52.9753C67.2944 53.9393 66.6042 54.742 65.6909 54.9162L65.6908 57.7863C65.6908 57.9919 65.5241 58.1585 65.3185 58.1585C65.1129 58.1585 64.9462 57.9919 64.9462 57.7863L64.9464 54.9163C64.033 54.7422 63.3426 53.9394 63.3426 52.9753C63.3426 51.884 64.2272 50.9994 65.3185 50.9994Z",
                        fill: "white"
                      }
                    }),
                    _vm._v(" "),
                    _c(
                      "defs",
                      [
                        _c(
                          "filter",
                          {
                            attrs: {
                              id: "filter0_d_1098_419",
                              x: "11.5524",
                              y: "0.90753",
                              width: "108.041",
                              height: "108.041",
                              filterUnits: "userSpaceOnUse",
                              "color-interpolation-filters": "sRGB"
                            }
                          },
                          [
                            _c("feFlood", {
                              attrs: {
                                "flood-opacity": "0",
                                result: "BackgroundImageFix"
                              }
                            }),
                            _vm._v(" "),
                            _c("feColorMatrix", {
                              attrs: {
                                in: "SourceAlpha",
                                type: "matrix",
                                values:
                                  "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                                result: "hardAlpha"
                              }
                            }),
                            _vm._v(" "),
                            _c("feOffset", { attrs: { dy: "7.90541" } }),
                            _vm._v(" "),
                            _c("feGaussianBlur", {
                              attrs: { stdDeviation: "9.48649" }
                            }),
                            _vm._v(" "),
                            _c("feComposite", {
                              attrs: { in2: "hardAlpha", operator: "out" }
                            }),
                            _vm._v(" "),
                            _c("feColorMatrix", {
                              attrs: {
                                type: "matrix",
                                values:
                                  "0 0 0 0 0.743854 0 0 0 0 0.925 0 0 0 0 0.850411 0 0 0 1 0"
                              }
                            }),
                            _vm._v(" "),
                            _c("feBlend", {
                              attrs: {
                                mode: "normal",
                                in2: "BackgroundImageFix",
                                result: "effect1_dropShadow_1098_419"
                              }
                            }),
                            _vm._v(" "),
                            _c("feBlend", {
                              attrs: {
                                mode: "normal",
                                in: "SourceGraphic",
                                in2: "effect1_dropShadow_1098_419",
                                result: "shape"
                              }
                            })
                          ],
                          1
                        ),
                        _vm._v(" "),
                        _c(
                          "linearGradient",
                          {
                            attrs: {
                              id: "paint0_linear_1098_419",
                              x1: "65.5727",
                              y1: "11.9751",
                              x2: "65.5727",
                              y2: "82.0697",
                              gradientUnits: "userSpaceOnUse"
                            }
                          },
                          [
                            _c("stop", { attrs: { "stop-color": "#01CB70" } }),
                            _vm._v(" "),
                            _c("stop", {
                              attrs: { offset: "1", "stop-color": "#1CE385" }
                            })
                          ],
                          1
                        )
                      ],
                      1
                    )
                  ]
                ),
                _vm._v(" "),
                _c("p", { staticClass: "unlock" }, [
                  _vm._v(_vm._s(_vm.__("Unlock", "dokan-lite")))
                ]),
                _vm._v(" "),
                _c("h1", [_vm._v(_vm._s(_vm.__("20+ Modules", "dokan-lite")))]),
                _vm._v(" "),
                _c("p", { staticClass: "text-brand" }, [
                  _vm._v(
                    _vm._s(_vm.__("with Dokan Premium Plans", "dokan-lite"))
                  )
                ]),
                _vm._v(" "),
                _c("p", {
                  staticClass: "upgrade-text",
                  domProps: {
                    innerHTML: _vm._s(
                      _vm.sprintf(
                        _vm.__(
                          "We’re sorry %s Dokan Modules are not available on %s. Please upgrade to a PRO plan to unlock the modules of your choice.",
                          "dokan-lite"
                        ),
                        "<br>",
                        "<strong>Dokan Lite</strong>"
                      )
                    )
                  }
                }),
                _vm._v(" "),
                _c(
                  "a",
                  {
                    staticClass: "upgrade-button",
                    attrs: {
                      target: "_blank",
                      rel: "noopener noreferrer",
                      href: _vm.upgradeURL
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Upgrade to Pro", "dokan-lite")))]
                ),
                _vm._v(" "),
                _c("div", { staticClass: "promo-card" }, [
                  _c(
                    "svg",
                    {
                      attrs: {
                        width: "318",
                        height: "181",
                        viewBox: "0 0 318 181",
                        fill: "none",
                        xmlns: "http://www.w3.org/2000/svg"
                      }
                    },
                    [
                      _c("rect", {
                        attrs: {
                          width: "318",
                          height: "181",
                          rx: "10",
                          fill: "url(#paint0_linear_1061_678)"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M69.7623 78.1796C19.6582 89.3268 8.33272 60.917 0 47.3061V10C0 4.47715 4.47714 0 9.99999 0H308C313.523 0 318 4.47716 318 10V122C287.77 58.7592 226.42 82.2094 166.516 91.1265C119.684 98.098 114.527 68.2204 69.7623 78.1796Z",
                          fill: "#7867FF",
                          "fill-opacity": "0.1"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M50.6582 112H54.5068C56.6055 112 57.8496 110.968 57.8496 109.238V109.225C57.8496 107.926 56.9951 107.003 55.6484 106.832V106.723C56.5986 106.552 57.3506 105.622 57.3506 104.604V104.59C57.3506 103.086 56.2432 102.136 54.4316 102.136H50.6582V112ZM54.1719 103.223C55.3955 103.223 56.1064 103.804 56.1064 104.802V104.815C56.1064 105.854 55.3477 106.388 53.8574 106.388H51.8887V103.223H54.1719ZM54.2061 107.447C55.7783 107.447 56.585 108.028 56.585 109.163V109.177C56.585 110.312 55.8057 110.913 54.3223 110.913H51.8887V107.447H54.2061ZM62.7373 112.13C64.8359 112.13 66.1348 110.681 66.1348 108.322V108.309C66.1348 105.943 64.8359 104.501 62.7373 104.501C60.6387 104.501 59.3398 105.943 59.3398 108.309V108.322C59.3398 110.681 60.6387 112.13 62.7373 112.13ZM62.7373 111.077C61.3428 111.077 60.5566 110.059 60.5566 108.322V108.309C60.5566 106.565 61.3428 105.554 62.7373 105.554C64.1318 105.554 64.918 106.565 64.918 108.309V108.322C64.918 110.059 64.1318 111.077 62.7373 111.077ZM67.9805 112H69.1699V107.639C69.1699 106.347 69.915 105.554 71.0908 105.554C72.2666 105.554 72.8135 106.189 72.8135 107.516V112H74.0029V107.229C74.0029 105.479 73.0801 104.501 71.4258 104.501C70.3389 104.501 69.6484 104.959 69.2793 105.738H69.1699V104.631H67.9805V112ZM78.624 112.13C79.7041 112.13 80.4492 111.686 80.8115 110.899H80.9209V112H82.1104V104.631H80.9209V108.992C80.9209 110.284 80.2305 111.077 78.9316 111.077C77.7559 111.077 77.2773 110.441 77.2773 109.115V104.631H76.0879V109.402C76.0879 111.146 76.9492 112.13 78.624 112.13ZM86.8613 112.13C88.5361 112.13 89.8145 111.221 89.8145 109.908V109.895C89.8145 108.842 89.1445 108.24 87.7568 107.905L86.6221 107.632C85.7539 107.42 85.3848 107.105 85.3848 106.606V106.593C85.3848 105.943 86.0273 105.492 86.9023 105.492C87.791 105.492 88.3652 105.896 88.5225 106.477H89.6914C89.5273 105.273 88.4541 104.501 86.9092 104.501C85.3438 104.501 84.168 105.424 84.168 106.647V106.654C84.168 107.714 84.79 108.315 86.1709 108.644L87.3125 108.917C88.2217 109.136 88.5977 109.484 88.5977 109.983V109.997C88.5977 110.667 87.8936 111.139 86.9023 111.139C85.959 111.139 85.3711 110.735 85.1729 110.12H83.9561C84.0928 111.337 85.2207 112.13 86.8613 112.13ZM92.6309 106.777C93.123 106.777 93.5195 106.374 93.5195 105.889C93.5195 105.396 93.123 105 92.6309 105C92.1455 105 91.7422 105.396 91.7422 105.889C91.7422 106.374 92.1455 106.777 92.6309 106.777ZM92.6309 112.068C93.123 112.068 93.5195 111.665 93.5195 111.18C93.5195 110.688 93.123 110.291 92.6309 110.291C92.1455 110.291 91.7422 110.688 91.7422 111.18C91.7422 111.665 92.1455 112.068 92.6309 112.068ZM99.9043 112H103.288C106.221 112 107.943 110.175 107.943 107.071V107.058C107.943 103.961 106.214 102.136 103.288 102.136H99.9043V112ZM101.135 110.893V103.243H103.206C105.394 103.243 106.686 104.665 106.686 107.071V107.085C106.686 109.484 105.407 110.893 103.206 110.893H101.135ZM112.954 112.13C115.053 112.13 116.352 110.681 116.352 108.322V108.309C116.352 105.943 115.053 104.501 112.954 104.501C110.855 104.501 109.557 105.943 109.557 108.309V108.322C109.557 110.681 110.855 112.13 112.954 112.13ZM112.954 111.077C111.56 111.077 110.773 110.059 110.773 108.322V108.309C110.773 106.565 111.56 105.554 112.954 105.554C114.349 105.554 115.135 106.565 115.135 108.309V108.322C115.135 110.059 114.349 111.077 112.954 111.077ZM118.266 112H119.455V109.204L120.146 108.534L122.907 112H124.404L120.979 107.728L124.192 104.631H122.75L119.564 107.851H119.455V101.705H118.266V112ZM127.617 112.13C128.608 112.13 129.381 111.699 129.846 110.913H129.955V112H131.145V106.955C131.145 105.424 130.14 104.501 128.342 104.501C126.77 104.501 125.648 105.28 125.457 106.436L125.45 106.477H126.64L126.646 106.456C126.838 105.882 127.419 105.554 128.301 105.554C129.401 105.554 129.955 106.046 129.955 106.955V107.625L127.843 107.755C126.127 107.857 125.156 108.616 125.156 109.929V109.942C125.156 111.282 126.216 112.13 127.617 112.13ZM126.373 109.915V109.901C126.373 109.17 126.865 108.773 127.986 108.705L129.955 108.582V109.252C129.955 110.305 129.073 111.098 127.863 111.098C127.009 111.098 126.373 110.66 126.373 109.915ZM133.318 112H134.508V107.639C134.508 106.347 135.253 105.554 136.429 105.554C137.604 105.554 138.151 106.189 138.151 107.516V112H139.341V107.229C139.341 105.479 138.418 104.501 136.764 104.501C135.677 104.501 134.986 104.959 134.617 105.738H134.508V104.631H133.318V112ZM145.582 112H151.57V110.893H146.812V102.136H145.582V112ZM154.018 103.209C154.469 103.209 154.838 102.84 154.838 102.389C154.838 101.938 154.469 101.568 154.018 101.568C153.566 101.568 153.197 101.938 153.197 102.389C153.197 102.84 153.566 103.209 154.018 103.209ZM153.416 112H154.605V104.631H153.416V112ZM159.466 112.055C159.698 112.055 159.924 112.027 160.156 111.986V110.975C159.938 110.995 159.821 111.002 159.609 111.002C158.844 111.002 158.543 110.653 158.543 109.785V105.615H160.156V104.631H158.543V102.724H157.312V104.631H156.15V105.615H157.312V110.086C157.312 111.494 157.948 112.055 159.466 112.055ZM164.832 112.13C166.568 112.13 167.621 111.146 167.874 110.147L167.888 110.093H166.698L166.671 110.154C166.473 110.599 165.857 111.07 164.859 111.07C163.547 111.07 162.706 110.182 162.672 108.657H167.977V108.192C167.977 105.991 166.76 104.501 164.757 104.501C162.754 104.501 161.455 106.06 161.455 108.336V108.343C161.455 110.653 162.727 112.13 164.832 112.13ZM164.75 105.561C165.837 105.561 166.644 106.251 166.767 107.707H162.692C162.822 106.306 163.656 105.561 164.75 105.561ZM176.228 112.13C177.308 112.13 178.053 111.686 178.415 110.899H178.524V112H179.714V104.631H178.524V108.992C178.524 110.284 177.834 111.077 176.535 111.077C175.359 111.077 174.881 110.441 174.881 109.115V104.631H173.691V109.402C173.691 111.146 174.553 112.13 176.228 112.13ZM184.465 112.13C186.14 112.13 187.418 111.221 187.418 109.908V109.895C187.418 108.842 186.748 108.24 185.36 107.905L184.226 107.632C183.357 107.42 182.988 107.105 182.988 106.606V106.593C182.988 105.943 183.631 105.492 184.506 105.492C185.395 105.492 185.969 105.896 186.126 106.477H187.295C187.131 105.273 186.058 104.501 184.513 104.501C182.947 104.501 181.771 105.424 181.771 106.647V106.654C181.771 107.714 182.394 108.315 183.774 108.644L184.916 108.917C185.825 109.136 186.201 109.484 186.201 109.983V109.997C186.201 110.667 185.497 111.139 184.506 111.139C183.562 111.139 182.975 110.735 182.776 110.12H181.56C181.696 111.337 182.824 112.13 184.465 112.13ZM192.271 112.13C194.008 112.13 195.061 111.146 195.313 110.147L195.327 110.093H194.138L194.11 110.154C193.912 110.599 193.297 111.07 192.299 111.07C190.986 111.07 190.146 110.182 190.111 108.657H195.416V108.192C195.416 105.991 194.199 104.501 192.196 104.501C190.193 104.501 188.895 106.06 188.895 108.336V108.343C188.895 110.653 190.166 112.13 192.271 112.13ZM192.189 105.561C193.276 105.561 194.083 106.251 194.206 107.707H190.132C190.262 106.306 191.096 105.561 192.189 105.561ZM197.262 112H198.451V107.434C198.451 106.354 199.258 105.636 200.393 105.636C200.652 105.636 200.878 105.663 201.124 105.704V104.549C201.008 104.528 200.755 104.501 200.529 104.501C199.531 104.501 198.841 104.952 198.561 105.725H198.451V104.631H197.262V112ZM204.986 112.13C206.661 112.13 207.939 111.221 207.939 109.908V109.895C207.939 108.842 207.27 108.24 205.882 107.905L204.747 107.632C203.879 107.42 203.51 107.105 203.51 106.606V106.593C203.51 105.943 204.152 105.492 205.027 105.492C205.916 105.492 206.49 105.896 206.647 106.477H207.816C207.652 105.273 206.579 104.501 205.034 104.501C203.469 104.501 202.293 105.424 202.293 106.647V106.654C202.293 107.714 202.915 108.315 204.296 108.644L205.438 108.917C206.347 109.136 206.723 109.484 206.723 109.983V109.997C206.723 110.667 206.019 111.139 205.027 111.139C204.084 111.139 203.496 110.735 203.298 110.12H202.081C202.218 111.337 203.346 112.13 204.986 112.13ZM216.758 114.598C218.768 114.598 220.039 113.545 220.039 111.897V104.631H218.85V105.848H218.768C218.316 105.014 217.51 104.501 216.471 104.501C214.543 104.501 213.354 105.998 213.354 108.062V108.076C213.354 110.141 214.536 111.617 216.443 111.617C217.455 111.617 218.289 111.159 218.754 110.346H218.863V111.836C218.863 112.923 218.077 113.545 216.758 113.545C215.698 113.545 215.042 113.148 214.912 112.588L214.905 112.581H213.675L213.661 112.588C213.846 113.798 214.98 114.598 216.758 114.598ZM216.703 110.564C215.336 110.564 214.57 109.539 214.57 108.076V108.062C214.57 106.6 215.336 105.554 216.703 105.554C218.063 105.554 218.891 106.6 218.891 108.062V108.076C218.891 109.539 218.07 110.564 216.703 110.564ZM225.262 112.13C226.998 112.13 228.051 111.146 228.304 110.147L228.317 110.093H227.128L227.101 110.154C226.902 110.599 226.287 111.07 225.289 111.07C223.977 111.07 223.136 110.182 223.102 108.657H228.406V108.192C228.406 105.991 227.189 104.501 225.187 104.501C223.184 104.501 221.885 106.06 221.885 108.336V108.343C221.885 110.653 223.156 112.13 225.262 112.13ZM225.18 105.561C226.267 105.561 227.073 106.251 227.196 107.707H223.122C223.252 106.306 224.086 105.561 225.18 105.561ZM232.87 112.055C233.103 112.055 233.328 112.027 233.561 111.986V110.975C233.342 110.995 233.226 111.002 233.014 111.002C232.248 111.002 231.947 110.653 231.947 109.785V105.615H233.561V104.631H231.947V102.724H230.717V104.631H229.555V105.615H230.717V110.086C230.717 111.494 231.353 112.055 232.87 112.055ZM242.304 112.13C244.402 112.13 245.701 110.681 245.701 108.322V108.309C245.701 105.943 244.402 104.501 242.304 104.501C240.205 104.501 238.906 105.943 238.906 108.309V108.322C238.906 110.681 240.205 112.13 242.304 112.13ZM242.304 111.077C240.909 111.077 240.123 110.059 240.123 108.322V108.309C240.123 106.565 240.909 105.554 242.304 105.554C243.698 105.554 244.484 106.565 244.484 108.309V108.322C244.484 110.059 243.698 111.077 242.304 111.077ZM248.039 112H249.229V105.615H250.903V104.631H249.229V103.845C249.229 103.038 249.57 102.621 250.418 102.621C250.63 102.621 250.828 102.628 250.972 102.655V101.705C250.726 101.657 250.466 101.637 250.179 101.637C248.777 101.637 248.039 102.341 248.039 103.811V104.631H246.815V105.615H248.039V112ZM253.111 112H254.301V105.615H255.976V104.631H254.301V103.845C254.301 103.038 254.643 102.621 255.49 102.621C255.702 102.621 255.9 102.628 256.044 102.655V101.705C255.798 101.657 255.538 101.637 255.251 101.637C253.85 101.637 253.111 102.341 253.111 103.811V104.631H251.888V105.615H253.111V112ZM260.385 112.13C262.121 112.13 263.174 111.146 263.427 110.147L263.44 110.093H262.251L262.224 110.154C262.025 110.599 261.41 111.07 260.412 111.07C259.1 111.07 258.259 110.182 258.225 108.657H263.529V108.192C263.529 105.991 262.312 104.501 260.31 104.501C258.307 104.501 257.008 106.06 257.008 108.336V108.343C257.008 110.653 258.279 112.13 260.385 112.13ZM260.303 105.561C261.39 105.561 262.196 106.251 262.319 107.707H258.245C258.375 106.306 259.209 105.561 260.303 105.561ZM265.375 112H266.564V107.434C266.564 106.354 267.371 105.636 268.506 105.636C268.766 105.636 268.991 105.663 269.237 105.704V104.549C269.121 104.528 268.868 104.501 268.643 104.501C267.645 104.501 266.954 104.952 266.674 105.725H266.564V104.631H265.375V112ZM30.335 133H31.5244L33.165 127.299H33.2744L34.9219 133H36.1182L38.1826 125.631H37L35.5508 131.523H35.4414L33.7939 125.631H32.666L31.0186 131.523H30.9092L29.46 125.631H28.2705L30.335 133ZM40.3838 124.209C40.835 124.209 41.2041 123.84 41.2041 123.389C41.2041 122.938 40.835 122.568 40.3838 122.568C39.9326 122.568 39.5635 122.938 39.5635 123.389C39.5635 123.84 39.9326 124.209 40.3838 124.209ZM39.7822 133H40.9717V125.631H39.7822V133ZM45.832 133.055C46.0645 133.055 46.29 133.027 46.5225 132.986V131.975C46.3037 131.995 46.1875 132.002 45.9756 132.002C45.21 132.002 44.9092 131.653 44.9092 130.785V126.615H46.5225V125.631H44.9092V123.724H43.6787V125.631H42.5166V126.615H43.6787V131.086C43.6787 132.494 44.3145 133.055 45.832 133.055ZM48.3682 133H49.5576V128.639C49.5576 127.347 50.3027 126.554 51.4785 126.554C52.6543 126.554 53.2012 127.189 53.2012 128.516V133H54.3906V128.229C54.3906 126.479 53.4678 125.501 51.8135 125.501C50.7266 125.501 50.0361 125.959 49.667 126.738H49.5576V122.705H48.3682V133ZM60.4814 133H61.6709V128.434C61.6709 127.354 62.4775 126.636 63.6123 126.636C63.8721 126.636 64.0977 126.663 64.3438 126.704V125.549C64.2275 125.528 63.9746 125.501 63.749 125.501C62.751 125.501 62.0605 125.952 61.7803 126.725H61.6709V125.631H60.4814V133ZM68.6162 133.13C70.3525 133.13 71.4053 132.146 71.6582 131.147L71.6719 131.093H70.4824L70.4551 131.154C70.2568 131.599 69.6416 132.07 68.6436 132.07C67.3311 132.07 66.4902 131.182 66.4561 129.657H71.7607V129.192C71.7607 126.991 70.5439 125.501 68.541 125.501C66.5381 125.501 65.2393 127.06 65.2393 129.336V129.343C65.2393 131.653 66.5107 133.13 68.6162 133.13ZM68.5342 126.561C69.6211 126.561 70.4277 127.251 70.5508 128.707H66.4766C66.6064 127.306 67.4404 126.561 68.5342 126.561ZM76.6416 135.598C78.6514 135.598 79.9229 134.545 79.9229 132.897V125.631H78.7334V126.848H78.6514C78.2002 126.014 77.3936 125.501 76.3545 125.501C74.4268 125.501 73.2373 126.998 73.2373 129.062V129.076C73.2373 131.141 74.4199 132.617 76.3271 132.617C77.3389 132.617 78.1729 132.159 78.6377 131.346H78.7471V132.836C78.7471 133.923 77.9609 134.545 76.6416 134.545C75.582 134.545 74.9258 134.148 74.7959 133.588L74.7891 133.581H73.5586L73.5449 133.588C73.7295 134.798 74.8643 135.598 76.6416 135.598ZM76.5869 131.564C75.2197 131.564 74.4541 130.539 74.4541 129.076V129.062C74.4541 127.6 75.2197 126.554 76.5869 126.554C77.9473 126.554 78.7744 127.6 78.7744 129.062V129.076C78.7744 130.539 77.9541 131.564 76.5869 131.564ZM84.6055 133.13C85.6855 133.13 86.4307 132.686 86.793 131.899H86.9023V133H88.0918V125.631H86.9023V129.992C86.9023 131.284 86.2119 132.077 84.9131 132.077C83.7373 132.077 83.2588 131.441 83.2588 130.115V125.631H82.0693V130.402C82.0693 132.146 82.9307 133.13 84.6055 133.13ZM90.3818 133H91.5713V122.705H90.3818V133ZM95.8779 133.13C96.8691 133.13 97.6416 132.699 98.1064 131.913H98.2158V133H99.4053V127.955C99.4053 126.424 98.4004 125.501 96.6025 125.501C95.0303 125.501 93.9092 126.28 93.7178 127.436L93.7109 127.477H94.9004L94.9072 127.456C95.0986 126.882 95.6797 126.554 96.5615 126.554C97.6621 126.554 98.2158 127.046 98.2158 127.955V128.625L96.1035 128.755C94.3877 128.857 93.417 129.616 93.417 130.929V130.942C93.417 132.282 94.4766 133.13 95.8779 133.13ZM94.6338 130.915V130.901C94.6338 130.17 95.126 129.773 96.2471 129.705L98.2158 129.582V130.252C98.2158 131.305 97.334 132.098 96.124 132.098C95.2695 132.098 94.6338 131.66 94.6338 130.915ZM101.579 133H102.769V128.434C102.769 127.354 103.575 126.636 104.71 126.636C104.97 126.636 105.195 126.663 105.441 126.704V125.549C105.325 125.528 105.072 125.501 104.847 125.501C103.849 125.501 103.158 125.952 102.878 126.725H102.769V125.631H101.579V133ZM110.849 135.461H112.038V131.838H112.147C112.551 132.624 113.433 133.13 114.444 133.13C116.317 133.13 117.534 131.633 117.534 129.322V129.309C117.534 127.012 116.311 125.501 114.444 125.501C113.419 125.501 112.599 125.986 112.147 126.807H112.038V125.631H110.849V135.461ZM114.171 132.077C112.831 132.077 112.011 131.024 112.011 129.322V129.309C112.011 127.606 112.831 126.554 114.171 126.554C115.518 126.554 116.317 127.593 116.317 129.309V129.322C116.317 131.038 115.518 132.077 114.171 132.077ZM119.394 133H120.583V128.434C120.583 127.354 121.39 126.636 122.524 126.636C122.784 126.636 123.01 126.663 123.256 126.704V125.549C123.14 125.528 122.887 125.501 122.661 125.501C121.663 125.501 120.973 125.952 120.692 126.725H120.583V125.631H119.394V133ZM125.354 124.209C125.806 124.209 126.175 123.84 126.175 123.389C126.175 122.938 125.806 122.568 125.354 122.568C124.903 122.568 124.534 122.938 124.534 123.389C124.534 123.84 124.903 124.209 125.354 124.209ZM124.753 133H125.942V125.631H124.753V133ZM131.199 133.13C132.97 133.13 133.961 132.18 134.262 130.847L134.275 130.771L133.1 130.778L133.086 130.819C132.812 131.64 132.184 132.077 131.192 132.077C129.88 132.077 129.032 130.99 129.032 129.295V129.281C129.032 127.62 129.866 126.554 131.192 126.554C132.252 126.554 132.908 127.142 133.093 127.866L133.1 127.887H134.282L134.275 127.846C134.057 126.533 132.983 125.501 131.192 125.501C129.128 125.501 127.815 126.991 127.815 129.281V129.295C127.815 131.633 129.135 133.13 131.199 133.13ZM139.026 133.13C140.763 133.13 141.815 132.146 142.068 131.147L142.082 131.093H140.893L140.865 131.154C140.667 131.599 140.052 132.07 139.054 132.07C137.741 132.07 136.9 131.182 136.866 129.657H142.171V129.192C142.171 126.991 140.954 125.501 138.951 125.501C136.948 125.501 135.649 127.06 135.649 129.336V129.343C135.649 131.653 136.921 133.13 139.026 133.13ZM138.944 126.561C140.031 126.561 140.838 127.251 140.961 128.707H136.887C137.017 127.306 137.851 126.561 138.944 126.561ZM143.716 135.509H144.598L145.671 131.619H144.311L143.716 135.509ZM154.134 133.13C155.125 133.13 155.897 132.699 156.362 131.913H156.472V133H157.661V127.955C157.661 126.424 156.656 125.501 154.858 125.501C153.286 125.501 152.165 126.28 151.974 127.436L151.967 127.477H153.156L153.163 127.456C153.354 126.882 153.936 126.554 154.817 126.554C155.918 126.554 156.472 127.046 156.472 127.955V128.625L154.359 128.755C152.644 128.857 151.673 129.616 151.673 130.929V130.942C151.673 132.282 152.732 133.13 154.134 133.13ZM152.89 130.915V130.901C152.89 130.17 153.382 129.773 154.503 129.705L156.472 129.582V130.252C156.472 131.305 155.59 132.098 154.38 132.098C153.525 132.098 152.89 131.66 152.89 130.915ZM162.303 133.13C163.383 133.13 164.128 132.686 164.49 131.899H164.6V133H165.789V125.631H164.6V129.992C164.6 131.284 163.909 132.077 162.61 132.077C161.435 132.077 160.956 131.441 160.956 130.115V125.631H159.767V130.402C159.767 132.146 160.628 133.13 162.303 133.13ZM170.629 133.055C170.861 133.055 171.087 133.027 171.319 132.986V131.975C171.101 131.995 170.984 132.002 170.772 132.002C170.007 132.002 169.706 131.653 169.706 130.785V126.615H171.319V125.631H169.706V123.724H168.476V125.631H167.313V126.615H168.476V131.086C168.476 132.494 169.111 133.055 170.629 133.055ZM176.016 133.13C178.114 133.13 179.413 131.681 179.413 129.322V129.309C179.413 126.943 178.114 125.501 176.016 125.501C173.917 125.501 172.618 126.943 172.618 129.309V129.322C172.618 131.681 173.917 133.13 176.016 133.13ZM176.016 132.077C174.621 132.077 173.835 131.059 173.835 129.322V129.309C173.835 127.565 174.621 126.554 176.016 126.554C177.41 126.554 178.196 127.565 178.196 129.309V129.322C178.196 131.059 177.41 132.077 176.016 132.077ZM181.259 133H182.448V128.434C182.448 127.395 183.18 126.554 184.144 126.554C185.073 126.554 185.675 127.121 185.675 127.996V133H186.864V128.263C186.864 127.326 187.541 126.554 188.566 126.554C189.605 126.554 190.104 127.094 190.104 128.181V133H191.294V127.907C191.294 126.362 190.453 125.501 188.949 125.501C187.931 125.501 187.09 126.014 186.693 126.793H186.584C186.242 126.027 185.545 125.501 184.547 125.501C183.583 125.501 182.886 125.959 182.558 126.752H182.448V125.631H181.259V133ZM195.464 133.13C196.455 133.13 197.228 132.699 197.692 131.913H197.802V133H198.991V127.955C198.991 126.424 197.986 125.501 196.188 125.501C194.616 125.501 193.495 126.28 193.304 127.436L193.297 127.477H194.486L194.493 127.456C194.685 126.882 195.266 126.554 196.147 126.554C197.248 126.554 197.802 127.046 197.802 127.955V128.625L195.689 128.755C193.974 128.857 193.003 129.616 193.003 130.929V130.942C193.003 132.282 194.062 133.13 195.464 133.13ZM194.22 130.915V130.901C194.22 130.17 194.712 129.773 195.833 129.705L197.802 129.582V130.252C197.802 131.305 196.92 132.098 195.71 132.098C194.855 132.098 194.22 131.66 194.22 130.915ZM203.783 133.055C204.016 133.055 204.241 133.027 204.474 132.986V131.975C204.255 131.995 204.139 132.002 203.927 132.002C203.161 132.002 202.86 131.653 202.86 130.785V126.615H204.474V125.631H202.86V123.724H201.63V125.631H200.468V126.615H201.63V131.086C201.63 132.494 202.266 133.055 203.783 133.055ZM206.88 124.209C207.331 124.209 207.7 123.84 207.7 123.389C207.7 122.938 207.331 122.568 206.88 122.568C206.429 122.568 206.06 122.938 206.06 123.389C206.06 123.84 206.429 124.209 206.88 124.209ZM206.278 133H207.468V125.631H206.278V133ZM212.725 133.13C214.495 133.13 215.486 132.18 215.787 130.847L215.801 130.771L214.625 130.778L214.611 130.819C214.338 131.64 213.709 132.077 212.718 132.077C211.405 132.077 210.558 130.99 210.558 129.295V129.281C210.558 127.62 211.392 126.554 212.718 126.554C213.777 126.554 214.434 127.142 214.618 127.866L214.625 127.887H215.808L215.801 127.846C215.582 126.533 214.509 125.501 212.718 125.501C210.653 125.501 209.341 126.991 209.341 129.281V129.295C209.341 131.633 210.66 133.13 212.725 133.13ZM219.567 133.13C220.559 133.13 221.331 132.699 221.796 131.913H221.905V133H223.095V127.955C223.095 126.424 222.09 125.501 220.292 125.501C218.72 125.501 217.599 126.28 217.407 127.436L217.4 127.477H218.59L218.597 127.456C218.788 126.882 219.369 126.554 220.251 126.554C221.352 126.554 221.905 127.046 221.905 127.955V128.625L219.793 128.755C218.077 128.857 217.106 129.616 217.106 130.929V130.942C217.106 132.282 218.166 133.13 219.567 133.13ZM218.323 130.915V130.901C218.323 130.17 218.815 129.773 219.937 129.705L221.905 129.582V130.252C221.905 131.305 221.023 132.098 219.813 132.098C218.959 132.098 218.323 131.66 218.323 130.915ZM225.337 133H226.526V122.705H225.337V133ZM228.878 133H230.067V122.705H228.878V133ZM232.979 135.584C234.285 135.584 234.894 135.105 235.502 133.451L238.38 125.631H237.129L235.112 131.694H235.003L232.979 125.631H231.708L234.436 133.007L234.299 133.444C234.032 134.292 233.622 134.6 232.945 134.6C232.781 134.6 232.597 134.593 232.453 134.565V135.543C232.617 135.57 232.822 135.584 232.979 135.584ZM245.913 133.13C246.904 133.13 247.677 132.699 248.142 131.913H248.251V133H249.44V127.955C249.44 126.424 248.436 125.501 246.638 125.501C245.065 125.501 243.944 126.28 243.753 127.436L243.746 127.477H244.936L244.942 127.456C245.134 126.882 245.715 126.554 246.597 126.554C247.697 126.554 248.251 127.046 248.251 127.955V128.625L246.139 128.755C244.423 128.857 243.452 129.616 243.452 130.929V130.942C243.452 132.282 244.512 133.13 245.913 133.13ZM244.669 130.915V130.901C244.669 130.17 245.161 129.773 246.282 129.705L248.251 129.582V130.252C248.251 131.305 247.369 132.098 246.159 132.098C245.305 132.098 244.669 131.66 244.669 130.915ZM251.614 135.461H252.804V131.838H252.913C253.316 132.624 254.198 133.13 255.21 133.13C257.083 133.13 258.3 131.633 258.3 129.322V129.309C258.3 127.012 257.076 125.501 255.21 125.501C254.185 125.501 253.364 125.986 252.913 126.807H252.804V125.631H251.614V135.461ZM254.937 132.077C253.597 132.077 252.776 131.024 252.776 129.322V129.309C252.776 127.606 253.597 126.554 254.937 126.554C256.283 126.554 257.083 127.593 257.083 129.309V129.322C257.083 131.038 256.283 132.077 254.937 132.077ZM260.159 135.461H261.349V131.838H261.458C261.861 132.624 262.743 133.13 263.755 133.13C265.628 133.13 266.845 131.633 266.845 129.322V129.309C266.845 127.012 265.621 125.501 263.755 125.501C262.729 125.501 261.909 125.986 261.458 126.807H261.349V125.631H260.159V135.461ZM263.481 132.077C262.142 132.077 261.321 131.024 261.321 129.322V129.309C261.321 127.606 262.142 126.554 263.481 126.554C264.828 126.554 265.628 127.593 265.628 129.309V129.322C265.628 131.038 264.828 132.077 263.481 132.077ZM268.772 133H269.962V122.705H268.772V133ZM272.874 124.209C273.325 124.209 273.694 123.84 273.694 123.389C273.694 122.938 273.325 122.568 272.874 122.568C272.423 122.568 272.054 122.938 272.054 123.389C272.054 123.84 272.423 124.209 272.874 124.209ZM272.272 133H273.462V125.631H272.272V133ZM278.712 133.13C280.448 133.13 281.501 132.146 281.754 131.147L281.768 131.093H280.578L280.551 131.154C280.353 131.599 279.737 132.07 278.739 132.07C277.427 132.07 276.586 131.182 276.552 129.657H281.856V129.192C281.856 126.991 280.64 125.501 278.637 125.501C276.634 125.501 275.335 127.06 275.335 129.336V129.343C275.335 131.653 276.606 133.13 278.712 133.13ZM278.63 126.561C279.717 126.561 280.523 127.251 280.646 128.707H276.572C276.702 127.306 277.536 126.561 278.63 126.561ZM286.423 133.13C287.448 133.13 288.269 132.645 288.72 131.824H288.829V133H290.019V122.705H288.829V126.793H288.72C288.316 126.007 287.435 125.501 286.423 125.501C284.55 125.501 283.333 126.998 283.333 129.309V129.322C283.333 131.619 284.557 133.13 286.423 133.13ZM286.696 132.077C285.35 132.077 284.55 131.038 284.55 129.322V129.309C284.55 127.593 285.35 126.554 286.696 126.554C288.036 126.554 288.856 127.606 288.856 129.309V129.322C288.856 131.024 288.036 132.077 286.696 132.077ZM122.203 155.055C122.436 155.055 122.661 155.027 122.894 154.986V153.975C122.675 153.995 122.559 154.002 122.347 154.002C121.581 154.002 121.28 153.653 121.28 152.785V148.615H122.894V147.631H121.28V145.724H120.05V147.631H118.888V148.615H120.05V153.086C120.05 154.494 120.686 155.055 122.203 155.055ZM127.59 155.13C129.688 155.13 130.987 153.681 130.987 151.322V151.309C130.987 148.943 129.688 147.501 127.59 147.501C125.491 147.501 124.192 148.943 124.192 151.309V151.322C124.192 153.681 125.491 155.13 127.59 155.13ZM127.59 154.077C126.195 154.077 125.409 153.059 125.409 151.322V151.309C125.409 149.565 126.195 148.554 127.59 148.554C128.984 148.554 129.771 149.565 129.771 151.309V151.322C129.771 153.059 128.984 154.077 127.59 154.077ZM139.785 155.13C141.556 155.13 142.547 154.18 142.848 152.847L142.861 152.771L141.686 152.778L141.672 152.819C141.398 153.64 140.77 154.077 139.778 154.077C138.466 154.077 137.618 152.99 137.618 151.295V151.281C137.618 149.62 138.452 148.554 139.778 148.554C140.838 148.554 141.494 149.142 141.679 149.866L141.686 149.887H142.868L142.861 149.846C142.643 148.533 141.569 147.501 139.778 147.501C137.714 147.501 136.401 148.991 136.401 151.281V151.295C136.401 153.633 137.721 155.13 139.785 155.13ZM144.673 155H145.862V150.639C145.862 149.347 146.607 148.554 147.783 148.554C148.959 148.554 149.506 149.189 149.506 150.516V155H150.695V150.229C150.695 148.479 149.772 147.501 148.118 147.501C147.031 147.501 146.341 147.959 145.972 148.738H145.862V144.705H144.673V155ZM155.856 155.13C157.593 155.13 158.646 154.146 158.898 153.147L158.912 153.093H157.723L157.695 153.154C157.497 153.599 156.882 154.07 155.884 154.07C154.571 154.07 153.73 153.182 153.696 151.657H159.001V151.192C159.001 148.991 157.784 147.501 155.781 147.501C153.778 147.501 152.479 149.06 152.479 151.336V151.343C152.479 153.653 153.751 155.13 155.856 155.13ZM155.774 148.561C156.861 148.561 157.668 149.251 157.791 150.707H153.717C153.847 149.306 154.681 148.561 155.774 148.561ZM163.861 155.13C165.632 155.13 166.623 154.18 166.924 152.847L166.938 152.771L165.762 152.778L165.748 152.819C165.475 153.64 164.846 154.077 163.854 154.077C162.542 154.077 161.694 152.99 161.694 151.295V151.281C161.694 149.62 162.528 148.554 163.854 148.554C164.914 148.554 165.57 149.142 165.755 149.866L165.762 149.887H166.944L166.938 149.846C166.719 148.533 165.646 147.501 163.854 147.501C161.79 147.501 160.478 148.991 160.478 151.281V151.295C160.478 153.633 161.797 155.13 163.861 155.13ZM168.749 155H169.938V152.204L170.629 151.534L173.391 155H174.888L171.463 150.728L174.676 147.631H173.233L170.048 150.851H169.938V144.705H168.749V155ZM178.969 155.13C181.067 155.13 182.366 153.681 182.366 151.322V151.309C182.366 148.943 181.067 147.501 178.969 147.501C176.87 147.501 175.571 148.943 175.571 151.309V151.322C175.571 153.681 176.87 155.13 178.969 155.13ZM178.969 154.077C177.574 154.077 176.788 153.059 176.788 151.322V151.309C176.788 149.565 177.574 148.554 178.969 148.554C180.363 148.554 181.149 149.565 181.149 151.309V151.322C181.149 153.059 180.363 154.077 178.969 154.077ZM186.68 155.13C187.76 155.13 188.505 154.686 188.867 153.899H188.977V155H190.166V147.631H188.977V151.992C188.977 153.284 188.286 154.077 186.987 154.077C185.812 154.077 185.333 153.441 185.333 152.115V147.631H184.144V152.402C184.144 154.146 185.005 155.13 186.68 155.13ZM195.006 155.055C195.238 155.055 195.464 155.027 195.696 154.986V153.975C195.478 153.995 195.361 154.002 195.149 154.002C194.384 154.002 194.083 153.653 194.083 152.785V148.615H195.696V147.631H194.083V145.724H192.853V147.631H191.69V148.615H192.853V153.086C192.853 154.494 193.488 155.055 195.006 155.055ZM198.444 155.068C198.937 155.068 199.333 154.665 199.333 154.18C199.333 153.688 198.937 153.291 198.444 153.291C197.959 153.291 197.556 153.688 197.556 154.18C197.556 154.665 197.959 155.068 198.444 155.068Z",
                          fill: "white"
                        }
                      }),
                      _vm._v(" "),
                      _c(
                        "g",
                        { attrs: { filter: "url(#filter0_d_1061_678)" } },
                        [
                          _c("path", {
                            attrs: {
                              d:
                                "M133.607 56.5262C139.149 56.5262 142.849 53.6156 142.849 49.3072V49.2743C142.849 46.0512 140.547 44.0121 137.011 43.6832V43.5845C139.79 43.009 141.961 41.085 141.961 38.125V38.0921C141.961 34.3099 138.672 31.7446 133.574 31.7446C128.592 31.7446 125.254 34.5073 124.908 38.7499L124.892 38.9472H129.463L129.48 38.7992C129.677 36.8259 131.239 35.5597 133.574 35.5597C135.91 35.5597 137.274 36.7766 137.274 38.7499V38.7828C137.274 40.7068 135.663 42.0223 133.163 42.0223H130.516V45.5578H133.229C136.107 45.5578 137.801 46.8076 137.801 49.0769V49.1098C137.801 51.116 136.14 52.5302 133.607 52.5302C131.042 52.5302 129.348 51.2147 129.134 49.3729L129.118 49.192H124.366L124.382 49.4058C124.711 53.6485 128.246 56.5262 133.607 56.5262ZM156.235 56.6084C162.105 56.6084 165.657 51.8067 165.657 44.1436V44.1107C165.657 36.4312 162.105 31.6624 156.235 31.6624C150.381 31.6624 146.812 36.4312 146.812 44.1107V44.1436C146.812 51.8067 150.381 56.6084 156.235 56.6084ZM156.235 52.6782C153.439 52.6782 151.844 49.5045 151.844 44.1436V44.1107C151.844 38.7334 153.439 35.5926 156.235 35.5926C159.047 35.5926 160.642 38.7334 160.642 44.1107V44.1436C160.642 49.5045 159.047 52.6782 156.235 52.6782ZM175.475 45.2783C178.961 45.2783 181.082 42.713 181.082 38.6019V38.5854C181.082 34.4744 178.961 31.9255 175.475 31.9255C172.005 31.9255 169.867 34.4744 169.867 38.5854V38.6019C169.867 42.713 172.005 45.2783 175.475 45.2783ZM179.125 56L195.093 32.2708H191.294L175.327 56H179.125ZM175.475 42.6472C174.044 42.6472 173.238 41.1837 173.238 38.6019V38.5854C173.238 35.9872 174.044 34.5566 175.475 34.5566C176.922 34.5566 177.727 35.9872 177.727 38.5854V38.6019C177.727 41.1837 176.922 42.6472 175.475 42.6472ZM194.928 56.3453C198.414 56.3453 200.536 53.78 200.536 49.6689V49.6525C200.536 45.5414 198.414 42.9925 194.928 42.9925C191.458 42.9925 189.321 45.5414 189.321 49.6525V49.6689C189.321 53.78 191.458 56.3453 194.928 56.3453ZM194.928 53.7142C193.498 53.7142 192.692 52.2507 192.692 49.6689V49.6525C192.692 47.0543 193.498 45.6236 194.928 45.6236C196.375 45.6236 197.181 47.0543 197.181 49.6525V49.6689C197.181 52.2507 196.375 53.7142 194.928 53.7142Z",
                              fill: "white"
                            }
                          })
                        ]
                      ),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M55.2031 48H60.4414V47.0508H56.2578V44.1445H60.2246V43.207H56.2578V40.4941H60.4414V39.5449H55.2031V48ZM62.2227 48H63.2422V44.2617C63.2422 43.1543 63.8809 42.4746 64.8887 42.4746C65.8965 42.4746 66.3652 43.0195 66.3652 44.1562V48H67.3848V43.9102C67.3848 42.4102 66.5938 41.5723 65.1758 41.5723C64.2441 41.5723 63.6523 41.9648 63.3359 42.6328H63.2422V41.6836H62.2227V48ZM69.7578 40.4648C70.1445 40.4648 70.4609 40.1484 70.4609 39.7617C70.4609 39.375 70.1445 39.0586 69.7578 39.0586C69.3711 39.0586 69.0547 39.375 69.0547 39.7617C69.0547 40.1484 69.3711 40.4648 69.7578 40.4648ZM68.3281 50.168C69.6523 50.168 70.2676 49.6113 70.2676 48.3105V41.6836H69.248V48.3281C69.248 49.0254 68.9902 49.2656 68.3047 49.2656H68.1523V50.168H68.3281ZM74.791 48.1113C76.5898 48.1113 77.7031 46.8691 77.7031 44.8477V44.8359C77.7031 42.8086 76.5898 41.5723 74.791 41.5723C72.9922 41.5723 71.8789 42.8086 71.8789 44.8359V44.8477C71.8789 46.8691 72.9922 48.1113 74.791 48.1113ZM74.791 47.209C73.5957 47.209 72.9219 46.3359 72.9219 44.8477V44.8359C72.9219 43.3418 73.5957 42.4746 74.791 42.4746C75.9863 42.4746 76.6602 43.3418 76.6602 44.8359V44.8477C76.6602 46.3359 75.9863 47.209 74.791 47.209ZM79.5898 50.2148C80.709 50.2148 81.2305 49.8047 81.752 48.3867L84.2188 41.6836H83.1465L81.418 46.8809H81.3242L79.5898 41.6836H78.5L80.8379 48.0059L80.7207 48.3809C80.4922 49.1074 80.1406 49.3711 79.5605 49.3711C79.4199 49.3711 79.2617 49.3652 79.1387 49.3418V50.1797C79.2793 50.2031 79.4551 50.2148 79.5898 50.2148ZM89.0703 48H90.125V44.3379H93.8691V43.4004H90.125V40.4941H94.2031V39.5449H89.0703V48ZM95.8672 48H96.8867V39.1758H95.8672V48ZM100.578 48.1113C101.428 48.1113 102.09 47.7422 102.488 47.0684H102.582V48H103.602V43.6758C103.602 42.3633 102.74 41.5723 101.199 41.5723C99.8516 41.5723 98.8906 42.2402 98.7266 43.2305L98.7207 43.2656H99.7402L99.7461 43.248C99.9102 42.7559 100.408 42.4746 101.164 42.4746C102.107 42.4746 102.582 42.8965 102.582 43.6758V44.25L100.771 44.3613C99.3008 44.4492 98.4688 45.0996 98.4688 46.2246V46.2363C98.4688 47.3848 99.377 48.1113 100.578 48.1113ZM99.5117 46.2129V46.2012C99.5117 45.5742 99.9336 45.2344 100.895 45.1758L102.582 45.0703V45.6445C102.582 46.5469 101.826 47.2266 100.789 47.2266C100.057 47.2266 99.5117 46.8516 99.5117 46.2129ZM107.709 48.0469C107.908 48.0469 108.102 48.0234 108.301 47.9883V47.1211C108.113 47.1387 108.014 47.1445 107.832 47.1445C107.176 47.1445 106.918 46.8457 106.918 46.1016V42.5273H108.301V41.6836H106.918V40.0488H105.863V41.6836H104.867V42.5273H105.863V46.3594C105.863 47.5664 106.408 48.0469 107.709 48.0469Z",
                          fill: "#0C0071"
                        }
                      }),
                      _vm._v(" "),
                      _c(
                        "g",
                        { attrs: { filter: "url(#filter1_d_1061_678)" } },
                        [
                          _c("rect", {
                            attrs: {
                              x: "216",
                              y: "34.1777",
                              width: "48",
                              height: "20",
                              rx: "10",
                              fill: "#573CFF"
                            }
                          })
                        ]
                      ),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M232.513 48.1942C234.867 48.1942 236.295 46.5089 236.295 43.881V43.8696C236.295 41.2302 234.855 39.5621 232.513 39.5621C230.182 39.5621 228.731 41.2245 228.731 43.8696V43.881C228.731 46.5146 230.148 48.1942 232.513 48.1942ZM232.513 47.2459C230.799 47.2459 229.782 45.9205 229.782 43.881V43.8696C229.782 41.8129 230.834 40.5104 232.513 40.5104C234.198 40.5104 235.244 41.8129 235.244 43.8696V43.881C235.244 45.9205 234.204 47.2459 232.513 47.2459ZM238.078 48H239.106V44.4294H242.756V43.5154H239.106V40.6818H243.082V39.7563H238.078V48ZM244.773 48H245.801V44.4294H249.452V43.5154H245.801V40.6818H249.778V39.7563H244.773V48Z",
                          fill: "white"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          opacity: "0.3",
                          d:
                            "M107.399 17.3745C103.071 13.4067 97.5458 18.8781 101.18 23.0547",
                          stroke: "#FF00F5",
                          "stroke-width": "1.72065",
                          "stroke-miterlimit": "10",
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M229.162 77.0844C226.678 76.4391 225.753 79.6327 225.299 81.4364C225.039 82.4955 224.714 83.5876 224 84.3984",
                          stroke: "#00FFC2",
                          "stroke-width": "1.72065",
                          "stroke-miterlimit": "10",
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M103.555 82.1191C105.333 79.408 101.942 77.0254 99.9777 75.752C98.8197 75.0126 97.6617 74.191 97 72.9997",
                          stroke: "#FFE600",
                          "stroke-width": "1.72065",
                          "stroke-miterlimit": "10",
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round"
                        }
                      }),
                      _vm._v(" "),
                      _c("path", {
                        attrs: {
                          d:
                            "M228.334 20.7854C228.097 19.5881 227.386 18.4985 226.411 17.8124C225.437 17.1263 224.172 16.8573 223 17.0725",
                          stroke: "#64E3FF",
                          "stroke-width": "1.72065",
                          "stroke-miterlimit": "10",
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round"
                        }
                      }),
                      _vm._v(" "),
                      _c(
                        "defs",
                        [
                          _c(
                            "filter",
                            {
                              attrs: {
                                id: "filter0_d_1061_678",
                                x: "118.378",
                                y: "31.6626",
                                width: "88.1453",
                                height: "39.9138",
                                filterUnits: "userSpaceOnUse",
                                "color-interpolation-filters": "sRGB"
                              }
                            },
                            [
                              _c("feFlood", {
                                attrs: {
                                  "flood-opacity": "0",
                                  result: "BackgroundImageFix"
                                }
                              }),
                              _vm._v(" "),
                              _c("feColorMatrix", {
                                attrs: {
                                  in: "SourceAlpha",
                                  type: "matrix",
                                  values:
                                    "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                                  result: "hardAlpha"
                                }
                              }),
                              _vm._v(" "),
                              _c("feOffset", { attrs: { dy: "8.9808" } }),
                              _vm._v(" "),
                              _c("feGaussianBlur", {
                                attrs: { stdDeviation: "2.9936" }
                              }),
                              _vm._v(" "),
                              _c("feColorMatrix", {
                                attrs: {
                                  type: "matrix",
                                  values:
                                    "0 0 0 0 0.192851 0 0 0 0 0.0922663 0 0 0 0 0.512993 0 0 0 0.278409 0"
                                }
                              }),
                              _vm._v(" "),
                              _c("feBlend", {
                                attrs: {
                                  mode: "normal",
                                  in2: "BackgroundImageFix",
                                  result: "effect1_dropShadow_1061_678"
                                }
                              }),
                              _vm._v(" "),
                              _c("feBlend", {
                                attrs: {
                                  mode: "normal",
                                  in: "SourceGraphic",
                                  in2: "effect1_dropShadow_1061_678",
                                  result: "shape"
                                }
                              })
                            ],
                            1
                          ),
                          _vm._v(" "),
                          _c(
                            "filter",
                            {
                              attrs: {
                                id: "filter1_d_1061_678",
                                x: "209",
                                y: "34.1777",
                                width: "62",
                                height: "35",
                                filterUnits: "userSpaceOnUse",
                                "color-interpolation-filters": "sRGB"
                              }
                            },
                            [
                              _c("feFlood", {
                                attrs: {
                                  "flood-opacity": "0",
                                  result: "BackgroundImageFix"
                                }
                              }),
                              _vm._v(" "),
                              _c("feColorMatrix", {
                                attrs: {
                                  in: "SourceAlpha",
                                  type: "matrix",
                                  values:
                                    "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0",
                                  result: "hardAlpha"
                                }
                              }),
                              _vm._v(" "),
                              _c("feOffset", { attrs: { dy: "8" } }),
                              _vm._v(" "),
                              _c("feGaussianBlur", {
                                attrs: { stdDeviation: "3.5" }
                              }),
                              _vm._v(" "),
                              _c("feComposite", {
                                attrs: { in2: "hardAlpha", operator: "out" }
                              }),
                              _vm._v(" "),
                              _c("feColorMatrix", {
                                attrs: {
                                  type: "matrix",
                                  values:
                                    "0 0 0 0 0.0507051 0 0 0 0 0 0 0 0 0 0.470833 0 0 0 0.11 0"
                                }
                              }),
                              _vm._v(" "),
                              _c("feBlend", {
                                attrs: {
                                  mode: "normal",
                                  in2: "BackgroundImageFix",
                                  result: "effect1_dropShadow_1061_678"
                                }
                              }),
                              _vm._v(" "),
                              _c("feBlend", {
                                attrs: {
                                  mode: "normal",
                                  in: "SourceGraphic",
                                  in2: "effect1_dropShadow_1061_678",
                                  result: "shape"
                                }
                              })
                            ],
                            1
                          ),
                          _vm._v(" "),
                          _c(
                            "linearGradient",
                            {
                              attrs: {
                                id: "paint0_linear_1061_678",
                                x1: "0",
                                y1: "0",
                                x2: "0",
                                y2: "181",
                                gradientUnits: "userSpaceOnUse"
                              }
                            },
                            [
                              _c("stop", {
                                attrs: { "stop-color": "#D0CAFD" }
                              }),
                              _vm._v(" "),
                              _c("stop", {
                                attrs: { offset: "1", "stop-color": "#7463FF" }
                              })
                            ],
                            1
                          )
                        ],
                        1
                      )
                    ]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "a",
                  {
                    staticClass: "already-updated",
                    attrs: {
                      target: "_blank",
                      rel: "noopener noreferrer",
                      href:
                        "https://wedevs.com/docs/dokan/getting-started/installation-2/"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Already upgraded?", "dokan-lite")))]
                )
              ]),
              _vm._v(" "),
              _c(
                "span",
                { staticClass: "close", on: { click: _vm.closePopup } },
                [
                  _c(
                    "svg",
                    {
                      attrs: {
                        width: "10",
                        height: "10",
                        viewBox: "0 0 10 10",
                        fill: "none",
                        xmlns: "http://www.w3.org/2000/svg"
                      }
                    },
                    [
                      _c("path", {
                        attrs: {
                          d:
                            "M6.18849 5.00002L9.75385 1.43465C10.082 1.10645 10.082 0.574344 9.75385 0.246195C9.42566 -0.0820022 8.89359 -0.0820022 8.5654 0.246195L4.99998 3.81161L1.43457 0.246148C1.10637 -0.0820492 0.574308 -0.0820492 0.246112 0.246148C-0.0820373 0.574344 -0.0820373 1.10645 0.246112 1.4346L3.81153 4.99998L0.246112 8.5654C-0.0820373 8.89359 -0.0820373 9.4257 0.246112 9.75385C0.574308 10.082 1.10637 10.082 1.43457 9.75385L4.99998 6.18843L8.5654 9.75385C8.89355 10.082 9.42566 10.082 9.75385 9.75385C10.082 9.42566 10.082 8.89359 9.75385 8.5654L6.18849 5.00002Z",
                          fill: "#95A5A6"
                        }
                      })
                    ]
                  )
                ]
              )
            ])
          ]
        )
      : _vm._e()
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-5ae162ac", esExports)
  }
}

/***/ }),
/* 211 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { attrs: { id: "lite-modules" } },
    [
      _c("div", { staticClass: "dokan-modules-wrap" }, [
        _c("h1", [_vm._v(_vm._s(_vm.__("Modules", "dokan-lite")))]),
        _vm._v(" "),
        _c("div", { staticClass: "module-content" }, [
          _c(
            "div",
            { staticClass: "wp-list-table widefat dokan-modules" },
            [
              _vm.modules.length > 0
                ? _vm._l(_vm.modules, function(module) {
                    return _c("div", { staticClass: "plugin-card" }, [
                      _c("div", { staticClass: "plugin-card-top" }, [
                        _c("div", { staticClass: "name column-name" }, [
                          _c("h3", [
                            _c(
                              "a",
                              {
                                staticClass: "plugin-name",
                                attrs: {
                                  href: module.modLink,
                                  target: "_blank"
                                }
                              },
                              [_vm._v(_vm._s(module.name))]
                            ),
                            _vm._v(" "),
                            _c(
                              "a",
                              {
                                staticClass: "plugin-name",
                                attrs: {
                                  href: module.modLink,
                                  target: "_blank"
                                }
                              },
                              [
                                _c("img", {
                                  staticClass: "plugin-icon",
                                  attrs: {
                                    src: module.thumbnail,
                                    alt: module.name
                                  }
                                })
                              ]
                            )
                          ])
                        ]),
                        _vm._v(" "),
                        _c("div", { staticClass: "action-links" }, [
                          _c("ul", { staticClass: "plugin-action-buttons" }, [
                            _c(
                              "li",
                              {
                                on: {
                                  click: function($event) {
                                    return _vm.togglePopup(true)
                                  }
                                }
                              },
                              [
                                _c(
                                  "svg",
                                  {
                                    attrs: {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      width: "42",
                                      height: "20"
                                    }
                                  },
                                  [
                                    _c("rect", {
                                      attrs: {
                                        width: "42",
                                        height: "20",
                                        rx: "10",
                                        fill: "#c0c3c6"
                                      }
                                    }),
                                    _c("circle", {
                                      attrs: {
                                        cx: "6",
                                        cy: "6",
                                        r: "6",
                                        transform: "translate(6 4)",
                                        fill: "#fff"
                                      }
                                    })
                                  ]
                                )
                              ]
                            )
                          ])
                        ]),
                        _vm._v(" "),
                        _c("div", { staticClass: "desc column-description" }, [
                          _c("p", {
                            domProps: { innerHTML: _vm._s(module.description) }
                          })
                        ]),
                        _vm._v(" "),
                        _c("div", { staticClass: "card-footer" }, [
                          _c(
                            "a",
                            {
                              attrs: { href: module.docLink, target: "_blank" }
                            },
                            [
                              _vm._v(
                                _vm._s(_vm.__("Documentation", "dokan-lite"))
                              )
                            ]
                          )
                        ])
                      ])
                    ])
                  })
                : [
                    _c(
                      "div",
                      {
                        staticClass: "notice notice-info",
                        attrs: { id: "message" }
                      },
                      [
                        _c("p", [
                          _c("strong", [
                            _vm._v(
                              _vm._s(_vm.__("No modules found.", "dokan-lite"))
                            )
                          ])
                        ])
                      ]
                    )
                  ]
            ],
            2
          )
        ])
      ]),
      _vm._v(" "),
      _c("ModuleUpgradePopup", {
        attrs: { "show-popup": _vm.showPopup },
        on: { toggle: _vm.togglePopup }
      })
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-ca20ca84", esExports)
  }
}

/***/ }),
/* 212 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ReverseWithdrawal_vue__ = __webpack_require__(84);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_36e64dc3_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ReverseWithdrawal_vue__ = __webpack_require__(214);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(213)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ReverseWithdrawal_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_36e64dc3_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ReverseWithdrawal_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/ReverseWithdrawal.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-36e64dc3", Component.options)
  } else {
    hotAPI.reload("data-v-36e64dc3", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 213 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 214 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    { staticClass: "dokan-reverse-withdrawal" },
    [
      _c("h1", { staticClass: "wp-heading-inline" }, [
        _vm._v(
          "\n        " +
            _vm._s(_vm.__("Reverse Withdrawal", "dokan-lite")) +
            "\n    "
        )
      ]),
      _vm._v(" "),
      _c("AdminNotice"),
      _vm._v(" "),
      _c("hr", { staticClass: "wp-header-end" }),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "dokan-reverse-withdrawal-fact-card" },
        [
          _c("CardFunFact", {
            attrs: {
              count: _vm.counts.credit,
              icon: "fas fa-comments-dollar",
              is_currency: "",
              title: _vm.__("Total Collected", "dokan-lite")
            }
          }),
          _vm._v(" "),
          _c("CardFunFact", {
            attrs: {
              count: _vm.counts.balance,
              icon: "fas fa-coins",
              is_currency: "",
              title: _vm.__("Remaining Balance", "dokan-lite")
            }
          }),
          _vm._v(" "),
          _c("CardFunFact", {
            attrs: {
              count: _vm.counts.total_transactions,
              icon: "fas fa-info",
              title: _vm.__("Total Transactions", "dokan-lite")
            }
          }),
          _vm._v(" "),
          _c("CardFunFact", {
            attrs: {
              count: _vm.counts.total_vendors,
              icon: "fas fa-users",
              title: _vm.__("Total Vendors", "dokan-lite")
            }
          })
        ],
        1
      ),
      _vm._v(" "),
      _c(
        "div",
        { attrs: { id: "dokan_reverse_withdrawal_list_table" } },
        [
          _c(
            "list-table",
            {
              attrs: {
                columns: _vm.columns,
                loading: _vm.loading,
                rows: _vm.transactionData,
                actions: _vm.actions,
                "show-cb": false,
                "total-items": _vm.totalItems,
                "bulk-actions": _vm.bulkActions,
                "total-pages": _vm.totalPages,
                "per-page": _vm.perPage,
                "current-page": _vm.getCurrentPage,
                "not-found": this.__("No transaction found.", "dokan-lite"),
                "sort-by": _vm.getSortBy,
                "sort-order": _vm.getSortOrder
              },
              on: { sort: _vm.doSort, pagination: _vm.goToPage },
              scopedSlots: _vm._u([
                {
                  key: "store_name",
                  fn: function(data) {
                    return [
                      _c("strong", [
                        _c(
                          "a",
                          {
                            attrs: {
                              href:
                                "?page=dokan#/reverse-withdrawal/store/" +
                                data.row.vendor_id
                            }
                          },
                          [
                            _vm._v(
                              _vm._s(
                                data.row.store_name
                                  ? data.row.store_name
                                  : _vm.__("(no name)", "dokan-lite")
                              )
                            )
                          ]
                        )
                      ])
                    ]
                  }
                },
                {
                  key: "balance",
                  fn: function(data) {
                    return [
                      data.row.balance === ""
                        ? _c("div", [_vm._v("--")])
                        : data.row.balance >= 0
                        ? _c("currency", {
                            attrs: { amount: data.row.balance }
                          })
                        : data.row.balance < 0
                        ? _c(
                            "div",
                            { staticClass: "negative-balance" },
                            [
                              _vm._v("\n                    ( "),
                              _c("currency", {
                                attrs: { amount: data.row.balance * -1 }
                              }),
                              _vm._v(" )\n                ")
                            ],
                            1
                          )
                        : _vm._e()
                    ]
                  }
                },
                {
                  key: "last_payment_date",
                  fn: function(data) {
                    return [
                      _vm._v(
                        "\n                " +
                          _vm._s(data.row.last_payment_date) +
                          "\n            "
                      )
                    ]
                  }
                }
              ])
            },
            [
              _vm._v(" "),
              _vm._v(" "),
              _vm._v(" "),
              _c("template", { slot: "filters" }, [
                _c(
                  "span",
                  { staticClass: "form-group" },
                  [
                    _c("multiselect", {
                      attrs: {
                        placeholder: this.__("Filter by store", "dokan-lite"),
                        options: _vm.filter.stores,
                        "track-by": "id",
                        label: "name",
                        "internal-search": false,
                        "clear-on-select": false,
                        "allow-empty": false,
                        multiselect: false,
                        searchable: true,
                        showLabels: false
                      },
                      on: { "search-change": _vm.fetchStoreLists },
                      model: {
                        value: _vm.filter.selected_store,
                        callback: function($$v) {
                          _vm.$set(_vm.filter, "selected_store", $$v)
                        },
                        expression: "filter.selected_store"
                      }
                    }),
                    _vm._v(" "),
                    _vm.filter.selected_store.id
                      ? _c(
                          "button",
                          {
                            staticClass: "button",
                            staticStyle: {
                              "line-height": "0",
                              padding: "0 5px",
                              "margin-right": "5px"
                            },
                            attrs: { type: "button" },
                            on: {
                              click: function($event) {
                                _vm.filter.selected_store = _vm.getDefaultStore()[0]
                              }
                            }
                          },
                          [_c("i", { staticClass: "dashicons dashicons-no" })]
                        )
                      : _vm._e()
                  ],
                  1
                ),
                _vm._v(" "),
                _c(
                  "span",
                  { staticClass: "form-group" },
                  [
                    _c("date-range-picker", {
                      ref: "picker",
                      staticClass: "mr-5",
                      attrs: {
                        "locale-data": this.dateTimePickerFormat,
                        singleDatePicker: false,
                        showDropdowns: true,
                        autoApply: false,
                        ranges: this.dateRangePickerRanges
                      },
                      scopedSlots: _vm._u([
                        {
                          key: "input",
                          fn: function(picker) {
                            return [
                              _vm.filter.transaction_date.startDate
                                ? _c("span", [
                                    _vm._v(
                                      _vm._s(
                                        _vm._f("getFormattedDate")(
                                          _vm.filter.transaction_date.startDate
                                        )
                                      ) +
                                        " - " +
                                        _vm._s(
                                          _vm._f("getFormattedDate")(
                                            _vm.filter.transaction_date.endDate
                                          )
                                        )
                                    )
                                  ])
                                : _vm._e(),
                              _vm._v(" "),
                              !_vm.filter.transaction_date.startDate
                                ? _c(
                                    "span",
                                    { staticClass: "date-range-placeholder" },
                                    [
                                      _vm._v(
                                        _vm._s(
                                          _vm.__(
                                            "Filter by expire date",
                                            "dokan-lite"
                                          )
                                        )
                                      )
                                    ]
                                  )
                                : _vm._e()
                            ]
                          }
                        },
                        {
                          key: "footer",
                          fn: function(data) {
                            return _c("div", { staticClass: "drp-buttons" }, [
                              _c("span", { staticClass: "drp-selected" }, [
                                _vm._v(_vm._s(data.rangeText))
                              ]),
                              _vm._v(" "),
                              _c(
                                "button",
                                {
                                  staticClass:
                                    "cancelBtn btn btn-sm btn-secondary",
                                  attrs: { type: "button" },
                                  on: {
                                    click: function($event) {
                                      return _vm.setDefaultTransactionDate()
                                    }
                                  }
                                },
                                [_vm._v(_vm._s(_vm.__("Cancel", "dokan-lite")))]
                              ),
                              _vm._v(" "),
                              !data.in_selection
                                ? _c(
                                    "button",
                                    {
                                      staticClass:
                                        "applyBtn btn btn-sm btn-success",
                                      attrs: { type: "button" },
                                      on: { click: data.clickApply }
                                    },
                                    [
                                      _vm._v(
                                        _vm._s(_vm.__("Apply", "dokan-lite"))
                                      )
                                    ]
                                  )
                                : _vm._e()
                            ])
                          }
                        }
                      ]),
                      model: {
                        value: _vm.filter.transaction_date,
                        callback: function($$v) {
                          _vm.$set(_vm.filter, "transaction_date", $$v)
                        },
                        expression: "filter.transaction_date"
                      }
                    })
                  ],
                  1
                ),
                _vm._v(" "),
                _c("span", { staticClass: "form-group" }, [
                  _c(
                    "button",
                    {
                      staticClass: "button action",
                      on: { click: this.clearFilters }
                    },
                    [_vm._v(_vm._s(this.__("Clear", "dokan-lite")))]
                  )
                ])
              ])
            ],
            2
          )
        ],
        1
      )
    ],
    1
  )
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-36e64dc3", esExports)
  }
}

/***/ }),
/* 215 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ReverseWithdrawalTransactions_vue__ = __webpack_require__(85);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6b51ff90_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ReverseWithdrawalTransactions_vue__ = __webpack_require__(217);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(216)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ReverseWithdrawalTransactions_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_6b51ff90_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ReverseWithdrawalTransactions_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/pages/ReverseWithdrawalTransactions.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-6b51ff90", Component.options)
  } else {
    hotAPI.reload("data-v-6b51ff90", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["a"] = (Component.exports);


/***/ }),
/* 216 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 217 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { staticClass: "dokan-reverse-withdrawal-transactions" }, [
    _c("h1", { staticClass: "wp-heading-inline" }, [
      _vm._v(
        "\n        " +
          _vm._s(_vm.__("Reverse Withdrawal", "dokan-lite")) +
          "\n        "
      ),
      _c(
        "a",
        { staticClass: "button", attrs: { href: this.reverseWithdrawalUrl() } },
        [_vm._v("← " + _vm._s(_vm.__("Go Back", "dokan-lite")))]
      )
    ]),
    _vm._v(" "),
    _c("hr", { staticClass: "wp-header-end" }),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "dokan-reverse-withdrawal-fact-card" },
      [
        _c("CardFunFact", {
          attrs: {
            icon: "fas fa-user",
            title: _vm.storeDetails.store_name
              ? _vm.storeDetails.store_name
              : ""
          }
        }),
        _vm._v(" "),
        _c("CardFunFact", {
          attrs: {
            count: _vm.counts.credit,
            icon: "fas fa-comments-dollar",
            is_currency: "",
            title: _vm.__("Total Collected", "dokan-lite")
          }
        }),
        _vm._v(" "),
        _c("CardFunFact", {
          attrs: {
            count: _vm.counts.balance,
            icon: "fas fa-coins",
            is_currency: "",
            title: _vm.__("Remaining Balance", "dokan-lite")
          }
        }),
        _vm._v(" "),
        _c("CardFunFact", {
          attrs: {
            count: _vm.counts.total_transactions,
            icon: "fas fa-info",
            title: _vm.__("Total Transactions", "dokan-lite")
          }
        })
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { attrs: { id: "dokan_reverse_withdrawal_transactions_list_table" } },
      [
        _c(
          "list-table",
          {
            attrs: {
              columns: _vm.columns,
              loading: _vm.loading,
              rows: _vm.transactionData,
              actions: _vm.actions,
              "show-cb": false,
              "total-items": _vm.totalItems,
              "bulk-actions": _vm.bulkActions,
              "total-pages": _vm.totalPages,
              "per-page": _vm.perPage,
              "current-page": _vm.getCurrentPage,
              "not-found": this.__("No transaction found.", "dokan-lite"),
              "sort-by": _vm.getSortBy,
              "sort-order": _vm.getSortOrder
            },
            on: { sort: _vm.doSort, pagination: _vm.goToPage },
            scopedSlots: _vm._u(
              [
                {
                  key: "trn_id",
                  fn: function(data) {
                    return data.row.trn_id !== "--"
                      ? [
                          _c(
                            "a",
                            {
                              attrs: {
                                href: data.row.trn_url,
                                target: "_blank"
                              }
                            },
                            [_vm._v(_vm._s(data.row.trn_id))]
                          )
                        ]
                      : undefined
                  }
                },
                {
                  key: "trn_date",
                  fn: function(data) {
                    return [
                      _vm._v(
                        "\n                " +
                          _vm._s(data.row.trn_date) +
                          "\n            "
                      )
                    ]
                  }
                },
                {
                  key: "trn_type",
                  fn: function(data) {
                    return [
                      _vm._v(
                        "\n                " +
                          _vm._s(data.row.trn_type) +
                          "\n            "
                      )
                    ]
                  }
                },
                {
                  key: "note",
                  fn: function(data) {
                    return [
                      _vm._v(
                        "\n                " +
                          _vm._s(data.row.note) +
                          "\n            "
                      )
                    ]
                  }
                },
                {
                  key: "debit",
                  fn: function(data) {
                    return [
                      data.row.debit === ""
                        ? _c("div", [_vm._v("--")])
                        : data.row.debit >= 0
                        ? _c("currency", { attrs: { amount: data.row.debit } })
                        : data.row.debit < 0
                        ? _c(
                            "div",
                            { staticClass: "negative-balance" },
                            [
                              _vm._v("\n                    ( "),
                              _c("currency", {
                                attrs: { amount: data.row.debit * -1 }
                              }),
                              _vm._v(" )\n                ")
                            ],
                            1
                          )
                        : _vm._e()
                    ]
                  }
                },
                {
                  key: "credit",
                  fn: function(data) {
                    return [
                      data.row.credit === ""
                        ? _c("div", [_vm._v("--")])
                        : data.row.credit >= 0
                        ? _c("currency", { attrs: { amount: data.row.credit } })
                        : data.row.credit < 0
                        ? _c(
                            "div",
                            { staticClass: "negative-balance" },
                            [
                              _vm._v("\n                    ( "),
                              _c("currency", {
                                attrs: { amount: data.row.credit * -1 }
                              }),
                              _vm._v(" )\n                ")
                            ],
                            1
                          )
                        : _vm._e()
                    ]
                  }
                },
                {
                  key: "balance",
                  fn: function(data) {
                    return [
                      data.row.balance === ""
                        ? _c("div", [_vm._v("--")])
                        : data.row.balance >= 0
                        ? _c("currency", {
                            attrs: { amount: data.row.balance }
                          })
                        : data.row.balance < 0
                        ? _c(
                            "div",
                            { staticClass: "negative-balance" },
                            [
                              _vm._v("\n                    ( "),
                              _c("currency", {
                                attrs: { amount: data.row.balance * -1 }
                              }),
                              _vm._v(" )\n                ")
                            ],
                            1
                          )
                        : _vm._e()
                    ]
                  }
                }
              ],
              null,
              true
            )
          },
          [
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _vm._v(" "),
            _c("template", { slot: "filters" }, [
              _c(
                "span",
                { staticClass: "form-group" },
                [
                  _c("date-range-picker", {
                    ref: "picker",
                    staticClass: "mr-5",
                    attrs: {
                      "locale-data": this.dateTimePickerFormat,
                      singleDatePicker: false,
                      timePicker: false,
                      timePicker24Hour: false,
                      showWeekNumbers: false,
                      showDropdowns: true,
                      autoApply: false,
                      ranges: this.dateRangePickerRanges,
                      linkedCalendars: true,
                      opens: "right"
                    },
                    scopedSlots: _vm._u([
                      {
                        key: "input",
                        fn: function(picker) {
                          return [
                            _vm.filter.transaction_date.startDate
                              ? _c("span", [
                                  _vm._v(
                                    _vm._s(
                                      _vm._f("getFormattedDate")(
                                        _vm.filter.transaction_date.startDate
                                      )
                                    ) +
                                      " - " +
                                      _vm._s(
                                        _vm._f("getFormattedDate")(
                                          _vm.filter.transaction_date.endDate
                                        )
                                      )
                                  )
                                ])
                              : _vm._e(),
                            _vm._v(" "),
                            !_vm.filter.transaction_date.startDate
                              ? _c(
                                  "span",
                                  { staticClass: "date-range-placeholder" },
                                  [
                                    _vm._v(
                                      _vm._s(
                                        _vm.__(
                                          "Filter by expire date",
                                          "dokan-lite"
                                        )
                                      )
                                    )
                                  ]
                                )
                              : _vm._e()
                          ]
                        }
                      },
                      {
                        key: "footer",
                        fn: function(data) {
                          return _c("div", { staticClass: "drp-buttons" }, [
                            _c("span", { staticClass: "drp-selected" }, [
                              _vm._v(_vm._s(data.rangeText))
                            ]),
                            _vm._v(" "),
                            _c(
                              "button",
                              {
                                staticClass:
                                  "cancelBtn btn btn-sm btn-secondary",
                                attrs: { type: "button" },
                                on: {
                                  click: function($event) {
                                    return _vm.setDefaultTransactionDate()
                                  }
                                }
                              },
                              [_vm._v(_vm._s(_vm.__("Cancel", "dokan-lite")))]
                            ),
                            _vm._v(" "),
                            !data.in_selection
                              ? _c(
                                  "button",
                                  {
                                    staticClass:
                                      "applyBtn btn btn-sm btn-success",
                                    attrs: { type: "button" },
                                    on: { click: data.clickApply }
                                  },
                                  [
                                    _vm._v(
                                      _vm._s(_vm.__("Apply", "dokan-lite"))
                                    )
                                  ]
                                )
                              : _vm._e()
                          ])
                        }
                      }
                    ]),
                    model: {
                      value: _vm.filter.transaction_date,
                      callback: function($$v) {
                        _vm.$set(_vm.filter, "transaction_date", $$v)
                      },
                      expression: "filter.transaction_date"
                    }
                  })
                ],
                1
              ),
              _vm._v(" "),
              _c("span", { staticClass: "form-group" }, [
                _c(
                  "button",
                  {
                    staticClass: "button action",
                    on: { click: this.clearFilters }
                  },
                  [_vm._v(_vm._s(this.__("Clear", "dokan-lite")))]
                )
              ])
            ])
          ],
          2
        )
      ],
      1
    )
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-6b51ff90", esExports)
  }
}

/***/ }),
/* 218 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * As we are using hash based navigation, hack fix
 * to highlight the current selected menu
 *
 * Requires jQuery
 */
function menuFix(slug) {
  var $ = jQuery;
  var menuRoot = $('#toplevel_page_' + slug);
  var currentUrl = window.location.href;
  var currentPath = currentUrl.substr(currentUrl.indexOf('admin.php'));
  menuRoot.on('click', 'a', function () {
    var self = $(this);
    $('ul.wp-submenu li', menuRoot).removeClass('current');

    if (self.hasClass('wp-has-submenu')) {
      $('li.wp-first-item', menuRoot).addClass('current');
    } else {
      self.parents('li').addClass('current');
    }
  });
  $('ul.wp-submenu a', menuRoot).each(function (index, el) {
    if ($(el).attr('href') === currentPath) {
      $(el).parent().addClass('current');
      return;
    }
  });
}

/* harmony default export */ __webpack_exports__["a"] = (menuFix);

/***/ })
],[124]);