dokanWebpack([0],[
/* 0 */,
/* 1 */,
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Switches_vue__ = __webpack_require__(10);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aa8ad7dc_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Switches_vue__ = __webpack_require__(29);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(28)
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
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__ = __webpack_require__(16);

/* harmony default export */ __webpack_exports__["a"] = ({
  extends: __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__["Line"],
  props: ['data'],
  data: function data() {
    return {
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          xAxes: [{
            type: 'time',
            scaleLabel: {
              display: false
            },
            gridLines: {
              display: false
            },
            ticks: {
              fontColor: '#aaa',
              fontSize: 11
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: false
            },
            ticks: {
              fontColor: '#aaa'
            }
          }]
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
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UpgradeBanner_vue__ = __webpack_require__(47);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75a73b30_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UpgradeBanner_vue__ = __webpack_require__(117);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(116)
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
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__ = __webpack_require__(55);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
      required: true,
      default: ''
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
      required: false,
      default: true
    },
    disableFields: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data: function data() {
    return {
      showColorPicker: false
    };
  },
  methods: {
    updateColor: function updateColor(colors) {
      var color = '';

      if (colors[this.format]) {
        color = colors[this.format];
      }

      this.$emit('input', color);
    },
    toggleColorPicker: function toggleColorPicker() {
      this.showColorPicker = !this.showColorPicker;
    },
    setHexColor: function setHexColor(color) {
      this.updateColor({
        hex: color
      });
    }
  }
});

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_debounce__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_Switches_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_components_UploadImage_vue__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_components_PasswordGenerator_vue__ = __webpack_require__(18);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* 10 */
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
/* 11 */
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
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'UploadImage',
  inheritAttrs: false,
  props: {
    src: {
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
  methods: {
    uploadImage: function uploadImage() {
      this.openMediaManager(this.onSelectImage);
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
/* 12 */
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
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_multiselect__ = __webpack_require__(3);
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
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Switches_vue__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_multiselect__ = __webpack_require__(3);
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
      getPyamentFields: dokan.hooks.applyFilters('AfterPyamentFields', [])
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
/* 15 */,
/* 16 */,
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_UploadImage_vue__ = __webpack_require__(11);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_40b3524c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_UploadImage_vue__ = __webpack_require__(31);
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
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_PasswordGenerator_vue__ = __webpack_require__(12);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4084a478_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_PasswordGenerator_vue__ = __webpack_require__(32);
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
/* 19 */,
/* 20 */,
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__ = __webpack_require__(6);
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
/* 22 */,
/* 23 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ }),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__ = __webpack_require__(8);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__ = __webpack_require__(26);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(25)
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
/* 25 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 26 */
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
          style: { backgroundColor: _vm.value },
          attrs: { type: "button" },
          on: { click: _vm.toggleColorPicker }
        },
        [_c("span", [_vm._v(_vm._s(_vm.__("Select Color", "dokan-lite")))])]
      ),
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
            _c(
              "button",
              {
                staticClass: "button button-small",
                attrs: { type: "button" },
                on: {
                  click: function($event) {
                    return _vm.updateColor({})
                  }
                }
              },
              [_vm._v(_vm._s(_vm.__("Clear", "dokan-lite")))]
            ),
            _vm._v(" "),
            _c(
              "button",
              {
                staticClass: "button button-small",
                attrs: { type: "button" },
                on: { click: _vm.toggleColorPicker }
              },
              [_vm._v(_vm._s(_vm.__("Close", "dokan-lite")))]
            )
          ])
        : _vm._e(),
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
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAccountFields_vue__ = __webpack_require__(9);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2b13daea_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAccountFields_vue__ = __webpack_require__(33);
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
/* 28 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 29 */
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
    { staticClass: "dokan-upload-image", on: { click: _vm.uploadImage } },
    [
      !_vm.showButton
        ? _c("img", { attrs: { src: _vm.image.src ? _vm.image.src : _vm.src } })
        : _vm._e(),
      _vm._v(" "),
      _vm.showButton
        ? _c(
            "button",
            {
              on: {
                click: function($event) {
                  $event.preventDefault()
                  return _vm.uploadImage($event)
                }
              }
            },
            [_vm._v("\n        " + _vm._s(_vm.buttonLabel) + "\n    ")]
          )
        : _vm._e()
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
/* 32 */
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
                return _vm.generatePassword($event)
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
                return _vm.regenratePassword($event)
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
                return _vm.cancelButton($event)
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
/* 33 */
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
                        "You can change your profile picutre on %s",
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
            _c("label", { attrs: { for: "store-email" } }, [
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
            _c("label", { attrs: { for: "store-email" } }, [
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
                _c("label", { attrs: { for: "store-url" } }, [
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
                  _c("label", { attrs: { for: "store-username" } }, [
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
                          attrs: { type: "text", placeholder: "********" },
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
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorAddressFields_vue__ = __webpack_require__(13);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_9504c01e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorAddressFields_vue__ = __webpack_require__(36);
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
              attrs: { type: "text", placeholder: _vm.__("Zip", "dokan-lite") },
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
/* 37 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorPaymentFields_vue__ = __webpack_require__(14);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_2ed34783_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorPaymentFields_vue__ = __webpack_require__(39);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(38)
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
/* 38 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 39 */
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
                  _c("label", { attrs: { for: "account-name" } }, [
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
                          _c("label", [
                            _vm._v(
                              _vm._s(
                                _vm.__("Admin Commission Type", "dokan-lite")
                              )
                            )
                          ]),
                          _vm._v(" "),
                          _c("Multiselect", {
                            attrs: {
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
              ])
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
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */
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
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(7);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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


/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Dashboard',
  components: {
    Postbox: Postbox,
    Loading: Loading,
    Chart: __WEBPACK_IMPORTED_MODULE_0_admin_components_Chart_vue__["a" /* default */],
    Currency: Currency,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */]
  },
  data: function data() {
    return {
      overview: null,
      feed: null,
      report: null,
      subscribe: {
        success: false,
        loading: false,
        email: ''
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

      var action = 'https://wedevs.us16.list-manage.com/subscribe/post-json?u=66e606cfe0af264974258f030&id=0d176bb256&c=?';

      if (!this.validEmail(this.subscribe.email)) {
        return;
      }

      this.subscribe.loading = true;
      jQuery.ajax({
        url: action,
        data: {
          EMAIL: this.subscribe.email,
          'group[3555][8]': '1'
        },
        type: 'GET',
        dataType: 'json',
        cache: false,
        contentType: "application/json; charset=utf-8"
      }).always(function (response) {
        _this4.subscribe.success = true;
        _this4.subscribe.loading = false;
      });
    }
  }
});

/***/ }),
/* 47 */
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
/* harmony default export */ __webpack_exports__["a"] = ({
  name: "UpgradeBanner",
  data: function data() {
    return {
      show: true,
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
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__ = __webpack_require__(7);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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

/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Withdraw',
  components: {
    ListTable: ListTable,
    Modal: Modal,
    Currency: Currency,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__["a" /* default */]
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
      this.fetchRequests();
    },
    '$route.query.page': function $routeQueryPage() {
      this.fetchRequests();
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
      dokan.api.get('/withdraw?per_page=' + this.perPage + '&page=' + this.currentPage + '&status=' + this.currentStatus).done(function (response, status, xhr) {
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
          page: page
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
    }
  }
});

/***/ }),
/* 49 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css__ = __webpack_require__(126);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_slick_carousel_slick_slick_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_vue_slick__ = __webpack_require__(129);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProCta_vue__ = __webpack_require__(51);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_1ccc06d3_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProCta_vue__ = __webpack_require__(125);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(124)
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
/* 51 */
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
/* 52 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__ = __webpack_require__(7);
//
//
//
//
//
//
//
//
//
//
//
//
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

/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Help',
  components: {
    Postbox: Postbox,
    Loading: Loading,
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_0_admin_components_UpgradeBanner_vue__["a" /* default */]
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
/* 53 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_admin_components_Fields_vue__ = __webpack_require__(136);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_SettingsBanner_vue__ = __webpack_require__(166);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_components_UpgradeBanner_vue__ = __webpack_require__(7);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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



/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Settings',
  components: {
    Fields: __WEBPACK_IMPORTED_MODULE_0_admin_components_Fields_vue__["a" /* default */],
    Loading: Loading,
    SettingsBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_SettingsBanner_vue__["a" /* default */],
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_2_admin_components_UpgradeBanner_vue__["a" /* default */]
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
      hasPro: dokan.hasPro ? true : false,
      searchText: '',
      awaitingSearch: false
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

      if (typeof localStorage != 'undefined') {
        localStorage.setItem("activetab", this.currentTab);
      }
    },
    showSectionTitle: function showSectionTitle(fields) {
      return !_.findWhere(fields, {
        type: 'sub_section'
      });
    },
    sectionTitle: function sectionTitle(index) {
      return _.findWhere(this.settingSections, {
        id: index
      }).title;
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
                self.settingValues[section][field] = resp.data[section][field];
              }
            });
          });
          self.settingValues = jQuery.extend({}, self.settingValues);
          self.showLoading = false;
          self.isLoaded = true;
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
      if (!this.formIsValid(section)) {
        return;
      }

      var self = this,
          data = {
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
      }).fail(function (jqXHR) {
        var messages = jqXHR.responseJSON.data.map(function (error) {
          return error.message;
        });
        alert(messages.join(' '));
      }).always(function () {
        self.showLoading = false;
      });
    },
    formIsValid: function formIsValid(section) {
      var _this = this;

      var allFields = Object.keys(this.settingFields);
      var requiredFields = this.requiredFields;

      if (!allFields) {
        return false;
      }

      allFields.forEach(function (fields, index) {
        if (section === fields) {
          var sectionFields = _this.settingFields[fields];
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
        Object.values(_this.settingValues).forEach(function (value) {
          if (field in value && value[field].length < 1) {
            if (!_this.errors.includes(field)) {
              _this.errors.push(field); // If flat or percentage commission is set. Remove the required field.


              if ('flat' === value['commission_type'] || 'percentage' === value['commission_type']) {
                _this.errors = _this.arrayRemove(_this.errors, 'admin_percentage');
                _this.errors = _this.arrayRemove(_this.errors, 'additional_fee');
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
      var _this2 = this;

      if (!this.validateBlankSearch()) {
        return;
      }

      if (!this.awaitingSearch) {
        setTimeout(function () {
          var searchText = _this2.$refs.searchInSettings.value.toLowerCase();

          _this2.doSearch(searchText);

          _this2.awaitingSearch = false;
        }, 1000);
      }

      this.awaitingSearch = true;
    },
    doSearch: function doSearch(searchText) {
      var _this3 = this;

      var self = this;
      var settingFields = {};
      var filteredSettingSections = [];
      var settingSections = [];
      var dokan_setting_fields = dokan.settings_fields;
      Object.keys(dokan_setting_fields).forEach(function (section, index) {
        Object.keys(dokan_setting_fields[section]).forEach(function (field, i) {
          if (dokan_setting_fields[section][field].type === "sub_section") {
            return;
          }

          var label = dokan_setting_fields[section][field]['label'].toLowerCase();

          if (label && label.includes(searchText)) {
            if (!settingFields[section]) {
              settingFields[section] = {};
            }

            settingFields[section][field] = dokan_setting_fields[section][field];

            if (filteredSettingSections.indexOf(section) === -1) {
              filteredSettingSections.push(section);
            }
          }
        });
      });
      var currentTab = 0;
      Object.keys(dokan.settings_sections).forEach(function (section, index) {
        if (filteredSettingSections.indexOf(dokan.settings_sections[section].id) !== -1) {
          if (!currentTab) {
            _this3.changeTab(dokan.settings_sections[section]);

            currentTab = 1;
          }

          settingSections.push(dokan.settings_sections[section]);
        }
      });
      self.settingFields = settingFields;
      self.settingSections = settingSections;
    }
  },
  created: function created() {
    this.fetchSettingValues();
    this.currentTab = 'dokan_general';

    if (typeof localStorage != 'undefined') {
      this.currentTab = localStorage.getItem("activetab") ? localStorage.getItem("activetab") : 'dokan_general';
    }

    this.settingSections = dokan.settings_sections;
    this.settingFields = dokan.settings_fields;
  }
});

/***/ }),
/* 54 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__ = __webpack_require__(138);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_defineProperty__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray__ = __webpack_require__(139);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__babel_runtime_helpers_slicedToArray__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_components_ColorPicker_vue__ = __webpack_require__(24);



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

var TextEditor = dokan_get_lib('TextEditor');
var GoogleMaps = dokan_get_lib('GoogleMaps');
var Mapbox = dokan_get_lib('Mapbox');
var RefreshSettingOptions = dokan_get_lib('RefreshSettingOptions');
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Fields',
  components: {
    colorPicker: __WEBPACK_IMPORTED_MODULE_2_admin_components_ColorPicker_vue__["a" /* default */],
    TextEditor: TextEditor,
    GoogleMaps: GoogleMaps,
    Mapbox: Mapbox,
    RefreshSettingOptions: RefreshSettingOptions
  },
  props: ['id', 'fieldData', 'sectionId', 'fieldValue', 'allSettingsValues', 'errors', 'toggleLoadingState'],
  data: function data() {
    return {
      repeatableItem: {},
      hideMap: false
    };
  },
  computed: {
    shoudShow: function shoudShow() {
      var shoudShow = true;

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
                shoudShow = false;
              }

              break;

            case 'greater_than_equal':
              if (!(dependencyValue >= value)) {
                shoudShow = false;
              }

              break;

            case 'less_than':
              if (!(dependencyValue < value)) {
                shoudShow = false;
              }

              break;

            case 'less_than':
              if (!(dependencyValue <= value)) {
                shoudShow = false;
              }

              break;

            case 'equal':
            default:
              if (dependencyValue != value) {
                shoudShow = false;
              }

              break;
          }

          if (!shoudShow) {
            break;
          }
        }
      }

      return shoudShow;
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
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        address: "".concat(location.address),
        zoom: parseInt(location.zoom)
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
    }
  }
});

/***/ }),
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */
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
/* 64 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AddVendor_vue__ = __webpack_require__(172);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__ = __webpack_require__(7);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* harmony default export */ __webpack_exports__["a"] = ({
  name: 'Vendors',
  components: {
    ListTable: ListTable,
    Switches: Switches,
    Search: Search,
    AddVendor: __WEBPACK_IMPORTED_MODULE_0__AddVendor_vue__["a" /* default */],
    UpgradeBanner: __WEBPACK_IMPORTED_MODULE_1_admin_components_UpgradeBanner_vue__["a" /* default */]
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
      isVendorSwitchingEnabled: false
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
      return this.$route.query.orderby || 'registered';
    },
    sortOrder: function sortOrder() {
      return this.$route.query.order || 'desc';
    },
    storeCategory: function storeCategory() {
      return this.$route.query.store_category || null;
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
    doSearch: function doSearch(payload) {
      var _this2 = this;

      var self = this;
      self.loading = true;
      dokan.api.get("/stores?search=".concat(payload), {
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
        store_category: self.storeCategory
      };
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
/* 65 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__VendorAccountFields_vue__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__VendorAddressFields_vue__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__VendorPaymentFields_vue__ = __webpack_require__(37);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
      this.$swal($title, $des, $status);
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

          _this2.$swal({
            type: 'success',
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
            } else if (result.dismiss === _this2.$swal.DismissReason.cancel) {
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
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ProCta_vue__ = __webpack_require__(50);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* 67 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_ModuleUpgradePopup_vue__ = __webpack_require__(181);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
/* 68 */
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
    },
    openPopup: function openPopup() {
      this.$emit('toggle', true);
    }
  },
  computed: {
    headerImage: function headerImage() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-upgrade-popup-header.svg");
    },
    bonusImage: function bonusImage() {
      return "".concat(dokan.urls.assetsUrl, "/images/dokan-upgrade-popup-bonus.svg");
    }
  }
});

/***/ }),
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
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
/* 105 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__App_vue__ = __webpack_require__(106);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__router__ = __webpack_require__(109);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_admin_menu_fix__ = __webpack_require__(185);



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
/* 106 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_App_vue__ = __webpack_require__(45);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_3a030f38_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_App_vue__ = __webpack_require__(108);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(107)
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
/* 107 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 108 */
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
/* 109 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof__ = __webpack_require__(110);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__babel_runtime_helpers_typeof__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_admin_pages_Dashboard_vue__ = __webpack_require__(111);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_admin_pages_Withdraw_vue__ = __webpack_require__(119);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_admin_pages_Premium_vue__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_admin_pages_Help_vue__ = __webpack_require__(131);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_admin_pages_Settings_vue__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_admin_pages_Vendors_vue__ = __webpack_require__(170);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_admin_pages_VendorCapabilities_vue__ = __webpack_require__(176);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_admin_pages_ProModules_vue__ = __webpack_require__(179);









var Vue = dokan_get_lib('Vue');
var Router = dokan_get_lib('Router');
var VersionCompare = dokan_get_lib('VersionCompare');
Vue.use(Router);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_1_admin_pages_Dashboard_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_2_admin_pages_Withdraw_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_3_admin_pages_Premium_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_4_admin_pages_Help_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_5_admin_pages_Settings_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_7_admin_pages_VendorCapabilities_vue__["a" /* default */]);
dokan_add_route(__WEBPACK_IMPORTED_MODULE_8_admin_pages_ProModules_vue__["a" /* default */]); // if dokan pro not installed or dokan pro is greater than 2.9.14 register the `vendors` route.

if (!dokan.hasPro || VersionCompare(dokan.proVersion, '2.9.14', '>')) {
  dokan_add_route(__WEBPACK_IMPORTED_MODULE_6_admin_pages_Vendors_vue__["a" /* default */]);
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
/* 110 */,
/* 111 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Dashboard_vue__ = __webpack_require__(46);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_219ffca0_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Dashboard_vue__ = __webpack_require__(118);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(112)
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
/* 112 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 117 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.show && _vm.showUpgrade
    ? _c("div", { staticClass: "dokan-upgrade-bar" }, [
        _vm._v("\n    You're using "),
        _c("span", [_vm._v("Dokan Lite")]),
        _vm._v(". To unlock more features, consider\n    "),
        _c(
          "a",
          {
            attrs: { target: "_blank", rel: "noopener", href: _vm.upgradeURL }
          },
          [_vm._v("\n        Upgrading to Pro")]
        ),
        _vm._v(".\n\n    "),
        _c(
          "div",
          {
            staticClass: "close-button",
            attrs: { title: "Dismiss the notice" },
            on: {
              click: function($event) {
                return _vm.dismiss()
              }
            }
          },
          [_vm._v("\n        ×\n    ")]
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
/* 118 */
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
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _c("h1", [_vm._v(_vm._s(_vm.__("Dashboard", "dokan-lite")))]),
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
                                        value: _vm.subscribe.email,
                                        expression: "subscribe.email"
                                      }
                                    ],
                                    attrs: {
                                      type: "email",
                                      required: "",
                                      placeholder: "Your Email Address"
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
/* 119 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Withdraw_vue__ = __webpack_require__(48);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_62373ea4_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Withdraw_vue__ = __webpack_require__(121);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(120)
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
/* 120 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 121 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _c(
        "div",
        { staticClass: "withdraw-requests" },
        [
          _c("h1", [_vm._v(_vm._s(_vm.__("Withdraw Requests", "dokan-lite")))]),
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
                    attrs: {
                      to: { name: "Withdraw", query: { status: "pending" } },
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
            ),
            _vm._v(" "),
            _c(
              "li",
              [
                _c(
                  "router-link",
                  {
                    attrs: {
                      to: { name: "Withdraw", query: { status: "approved" } },
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
                      to: { name: "Withdraw", query: { status: "cancelled" } },
                      "active-class": "current",
                      exact: ""
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
          _c("list-table", {
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
                key: "method_details",
                fn: function(data) {
                  return [
                    _c("div", {
                      staticClass: "method_details_inner",
                      domProps: {
                        innerHTML: _vm._s(
                          _vm.getPaymentDetails(
                            data.row.method,
                            data.row.user.payment
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
          })
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
    require("vue-hot-reload-api")      .rerender("data-v-62373ea4", esExports)
  }
}

/***/ }),
/* 122 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Premium_vue__ = __webpack_require__(49);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b38fd83a_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Premium_vue__ = __webpack_require__(130);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(123)
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
/* 123 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 124 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 125 */
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
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */
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
/* 131 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Help_vue__ = __webpack_require__(52);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_c289d136_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Help_vue__ = __webpack_require__(133);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(132)
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
/* 132 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 133 */
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
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _c("h1", [_vm._v(_vm._s(_vm.__("Help", "dokan-lite")))]),
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
/* 134 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Settings_vue__ = __webpack_require__(53);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_e4dc4572_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Settings_vue__ = __webpack_require__(169);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(135)
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
/* 135 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Fields_vue__ = __webpack_require__(54);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_a96ce32e_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Fields_vue__ = __webpack_require__(165);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(137)
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
/* 137 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm.shoudShow
    ? _c(
        "tr",
        { class: [_vm.id, "dokan-settings-field-type-" + _vm.fieldData.type] },
        [
          "sub_section" === _vm.fieldData.type
            ? [
                _c(
                  "th",
                  {
                    staticClass: "dokan-settings-sub-section-title",
                    attrs: { colspan: "2" }
                  },
                  [_c("label", [_vm._v(_vm._s(_vm.fieldData.label))])]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          _vm.containCommonFields(_vm.fieldData.type)
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
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
                        staticClass: "regular-text",
                        class: _vm.fieldData.class,
                        attrs: {
                          id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                          name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                          type: "checkbox"
                        },
                        domProps: {
                          checked: Array.isArray(
                            _vm.fieldValue[_vm.fieldData.name]
                          )
                            ? _vm._i(_vm.fieldValue[_vm.fieldData.name], null) >
                              -1
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
                        staticClass: "regular-text",
                        class: _vm.fieldData.class,
                        attrs: {
                          id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                          name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
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
                        staticClass: "regular-text",
                        class: _vm.fieldData.class,
                        attrs: {
                          id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                          name: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                          type: _vm.fieldData.type || "text"
                        },
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
                      }),
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "number" === _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular-text",
                    attrs: {
                      type: "number",
                      min: _vm.fieldData.min,
                      max: _vm.fieldData.max,
                      step: _vm.fieldData.step,
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
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
                  }),
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "price" == _vm.fieldData.type &&
          _vm.allSettingsValues.dokan_selling &&
          "combine" !== _vm.allSettingsValues.dokan_selling.commission_type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular-text",
                    class: {
                      wc_input_decimal:
                        _vm.allSettingsValues.dokan_selling.commission_type ==
                        "percentage",
                      wc_input_price:
                        _vm.allSettingsValues.dokan_selling.commission_type ==
                        "flat"
                    },
                    attrs: {
                      type: "text",
                      min: _vm.fieldData.min,
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
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
                  }),
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "combine" == _vm.fieldData.type &&
          _vm.haveCondition(_vm.fieldData) &&
          _vm.fieldData.condition.type == "show" &&
          _vm.checkConditionLogic(_vm.fieldData, _vm.fieldValue)
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", { staticClass: "percent_fee" }, [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value:
                          _vm.fieldValue[_vm.fieldData.fields.percent_fee.name],
                        expression:
                          "fieldValue[fieldData.fields.percent_fee.name]"
                      }
                    ],
                    staticClass: "wc_input_decimal regular-text",
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
                        _vm.fieldValue[_vm.fieldData.fields.percent_fee.name]
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
                  _vm._v("\n                " + _vm._s("%") + "\n            ")
                ]),
                _vm._v(" "),
                _c("td", { staticClass: "fixed_fee" }, [
                  _vm._v(
                    "\n                " + _vm._s("+") + "\n                "
                  ),
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value:
                          _vm.fieldValue[_vm.fieldData.fields.fixed_fee.name],
                        expression:
                          "fieldValue[fieldData.fields.fixed_fee.name]"
                      }
                    ],
                    staticClass: "wc_input_price regular-text",
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
                      value: _vm.fieldValue[_vm.fieldData.fields.fixed_fee.name]
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
                ]),
                _vm._v(" "),
                _vm.hasError(_vm.fieldData.fields.percent_fee.name) &&
                _vm.hasError(_vm.fieldData.fields.fixed_fee.name)
                  ? _c("p", { staticClass: "dokan-error combine-commission" }, [
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
                    ])
                  : _vm.hasError(_vm.fieldData.fields.percent_fee.name)
                  ? _c("p", { staticClass: "dokan-error combine-commission" }, [
                      _vm._v(
                        "\n                " +
                          _vm._s(
                            _vm.getError(_vm.fieldData.fields.percent_fee.label)
                          ) +
                          "\n            "
                      )
                    ])
                  : _vm.hasError(_vm.fieldData.fields.fixed_fee.name)
                  ? _c("p", { staticClass: "dokan-error combine-commission" }, [
                      _vm._v(
                        "\n                " +
                          _vm._s(
                            _vm.getError(_vm.fieldData.fields.fixed_fee.label)
                          ) +
                          "\n            "
                      )
                    ])
                  : _vm._e(),
                _vm._v(" "),
                _c("p", {
                  staticClass: "description",
                  domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                })
              ]
            : _vm._e(),
          _vm._v(" "),
          "textarea" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c("textarea", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular-text",
                    attrs: {
                      type: "textarea",
                      rows: _vm.fieldData.rows,
                      cols: _vm.fieldData.cols,
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
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
                  }),
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "checkbox" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c("fieldset", [
                    _c(
                      "label",
                      {
                        attrs: {
                          for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
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
                          staticClass: "checkbox",
                          attrs: {
                            type: "checkbox",
                            id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                            name:
                              _vm.sectionId + "[" + _vm.fieldData.name + "]",
                            "true-value": "on",
                            "false-value": "off"
                          },
                          domProps: {
                            checked: Array.isArray(
                              _vm.fieldValue[_vm.fieldData.name]
                            )
                              ? _vm._i(
                                  _vm.fieldValue[_vm.fieldData.name],
                                  null
                                ) > -1
                              : _vm._q(_vm.fieldValue[_vm.fieldData.name], "on")
                          },
                          on: {
                            change: function($event) {
                              var $$a = _vm.fieldValue[_vm.fieldData.name],
                                $$el = $event.target,
                                $$c = $$el.checked ? "on" : "off"
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
                        }),
                        _vm._v(
                          "\n                    " +
                            _vm._s(_vm.fieldData.desc) +
                            "\n                "
                        )
                      ]
                    )
                  ])
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "multicheck" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c(
                    "fieldset",
                    [
                      _vm._l(_vm.fieldData.options, function(
                        optionVal,
                        optionKey
                      ) {
                        return [
                          _c(
                            "label",
                            {
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
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value:
                                      _vm.fieldValue[_vm.fieldData.name][
                                        optionKey
                                      ],
                                    expression:
                                      "fieldValue[fieldData.name][optionKey]"
                                  }
                                ],
                                staticClass: "checkbox",
                                attrs: {
                                  type: "checkbox",
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "][" +
                                    optionKey +
                                    "]",
                                  name:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "][" +
                                    optionKey +
                                    "]",
                                  "true-value": optionKey,
                                  "false-value": ""
                                },
                                domProps: {
                                  checked: Array.isArray(
                                    _vm.fieldValue[_vm.fieldData.name][
                                      optionKey
                                    ]
                                  )
                                    ? _vm._i(
                                        _vm.fieldValue[_vm.fieldData.name][
                                          optionKey
                                        ],
                                        null
                                      ) > -1
                                    : _vm._q(
                                        _vm.fieldValue[_vm.fieldData.name][
                                          optionKey
                                        ],
                                        optionKey
                                      )
                                },
                                on: {
                                  change: function($event) {
                                    var $$a =
                                        _vm.fieldValue[_vm.fieldData.name][
                                          optionKey
                                        ],
                                      $$el = $event.target,
                                      $$c = $$el.checked ? optionKey : ""
                                    if (Array.isArray($$a)) {
                                      var $$v = null,
                                        $$i = _vm._i($$a, $$v)
                                      if ($$el.checked) {
                                        $$i < 0 &&
                                          _vm.$set(
                                            _vm.fieldValue[_vm.fieldData.name],
                                            optionKey,
                                            $$a.concat([$$v])
                                          )
                                      } else {
                                        $$i > -1 &&
                                          _vm.$set(
                                            _vm.fieldValue[_vm.fieldData.name],
                                            optionKey,
                                            $$a
                                              .slice(0, $$i)
                                              .concat($$a.slice($$i + 1))
                                          )
                                      }
                                    } else {
                                      _vm.$set(
                                        _vm.fieldValue[_vm.fieldData.name],
                                        optionKey,
                                        $$c
                                      )
                                    }
                                  }
                                }
                              }),
                              _vm._v(
                                "\n                        " +
                                  _vm._s(optionVal) +
                                  "\n                    "
                              )
                            ]
                          ),
                          _vm._v(" "),
                          _c("br")
                        ]
                      })
                    ],
                    2
                  )
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "select" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "td",
                  [
                    !_vm.fieldData.grouped
                      ? _c(
                          "select",
                          {
                            directives: [
                              {
                                name: "model",
                                rawName: "v-model",
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "regular",
                            attrs: {
                              name:
                                _vm.sectionId + "[" + _vm.fieldData.name + "]",
                              id: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                            },
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
                                    innerHTML: _vm._s(_vm.fieldData.placeholder)
                                  }
                                })
                              : _vm._e(),
                            _vm._v(" "),
                            _vm._l(_vm.fieldData.options, function(
                              optionVal,
                              optionKey
                            ) {
                              return _c("option", {
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
                                value: _vm.fieldValue[_vm.fieldData.name],
                                expression: "fieldValue[fieldData.name]"
                              }
                            ],
                            staticClass: "regular",
                            attrs: {
                              name:
                                _vm.sectionId + "[" + _vm.fieldData.name + "]",
                              id: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                            },
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
                                    innerHTML: _vm._s(_vm.fieldData.placeholder)
                                  }
                                })
                              : _vm._e(),
                            _vm._v(" "),
                            _vm._l(_vm.fieldData.options, function(
                              optionGroup
                            ) {
                              return _c(
                                "optgroup",
                                { attrs: { label: optionGroup.group_label } },
                                _vm._l(optionGroup.group_values, function(
                                  option
                                ) {
                                  return _c("option", {
                                    domProps: {
                                      value: option.value,
                                      innerHTML: _vm._s(option.label)
                                    }
                                  })
                                }),
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
                            section: _vm.sectionId,
                            field: _vm.fieldData,
                            "toggle-loading-state": _vm.toggleLoadingState
                          }
                        })
                      : _vm._e(),
                    _vm._v(" "),
                    _c("p", {
                      staticClass: "description",
                      domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                    })
                  ],
                  1
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "file" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.fieldValue[_vm.fieldData.name],
                        expression: "fieldValue[fieldData.name]"
                      }
                    ],
                    staticClass: "regular-text wpsa-url",
                    attrs: {
                      type: "text",
                      id: _vm.sectionId + "[" + _vm.fieldData.name + "]",
                      name: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                    },
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
                  }),
                  _vm._v(" "),
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "color" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "td",
                  [
                    _c("color-picker", {
                      model: {
                        value: _vm.fieldValue[_vm.fieldData.name],
                        callback: function($$v) {
                          _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$v)
                        },
                        expression: "fieldValue[fieldData.name]"
                      }
                    }),
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
                    _c("p", {
                      staticClass: "description",
                      domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                    })
                  ],
                  1
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "html" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
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
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "warning" == _vm.fieldData.type
            ? [
                _c(
                  "th",
                  {
                    staticClass: "dokan-setting-warning",
                    attrs: { scope: "row", colspan: "2" }
                  },
                  [
                    _c("div", { staticClass: "error" }, [
                      _c(
                        "p",
                        {
                          attrs: {
                            for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                          }
                        },
                        [
                          _c(
                            "span",
                            { staticClass: "dokan-setting-warning-label" },
                            [
                              _c("span", {
                                staticClass: "dashicons dashicons-warning"
                              }),
                              _vm._v(" " + _vm._s(_vm.fieldData.label))
                            ]
                          ),
                          _vm._v(" "),
                          _c(
                            "span",
                            { staticClass: "dokan-setting-warning-msg" },
                            [_vm._v(_vm._s(_vm.fieldData.desc))]
                          )
                        ]
                      )
                    ])
                  ]
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "radio" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", { staticClass: "dokan-settings-field-type-radio" }, [
                  _c(
                    "fieldset",
                    [
                      _vm._l(_vm.fieldData.options, function(
                        optionVal,
                        optionKey
                      ) {
                        return [
                          _c(
                            "label",
                            {
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
                                  id:
                                    _vm.sectionId +
                                    "[" +
                                    _vm.fieldData.name +
                                    "][" +
                                    optionKey +
                                    "]",
                                  name: optionKey
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
                                " " +
                                  _vm._s(optionVal) +
                                  "\n                    "
                              )
                            ]
                          )
                        ]
                      })
                    ],
                    2
                  ),
                  _vm._v(" "),
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "wpeditor" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "td",
                  { attrs: { width: "72%" } },
                  [
                    _c("text-editor", {
                      model: {
                        value: _vm.fieldValue[_vm.fieldData.name],
                        callback: function($$v) {
                          _vm.$set(_vm.fieldValue, _vm.fieldData.name, $$v)
                        },
                        expression: "fieldValue[fieldData.name]"
                      }
                    }),
                    _vm._v(" "),
                    _c("p", {
                      staticClass: "description",
                      domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                    })
                  ],
                  1
                )
              ]
            : _vm._e(),
          _vm._v(" "),
          "repeatable" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", { attrs: { width: "72%" } }, [
                  _c(
                    "ul",
                    { staticClass: "dokan-settings-repeatable-list" },
                    _vm._l(_vm.fieldValue[_vm.fieldData.name], function(
                      optionVal,
                      optionKey
                    ) {
                      return _vm.fieldValue[_vm.fieldData.name]
                        ? _c("li", [
                            _vm._v(
                              "\n                    " +
                                _vm._s(optionVal.value) +
                                " "
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
                              domProps: { innerHTML: _vm._s(optionVal.desc) }
                            })
                          ])
                        : _vm._e()
                    }),
                    0
                  ),
                  _vm._v(" "),
                  _c("input", {
                    directives: [
                      {
                        name: "model",
                        rawName: "v-model",
                        value: _vm.repeatableItem[_vm.fieldData.name],
                        expression: "repeatableItem[fieldData.name]"
                      }
                    ],
                    staticClass: "regular-text",
                    attrs: { type: "text" },
                    domProps: { value: _vm.repeatableItem[_vm.fieldData.name] },
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
                      staticClass: "button dokan-repetable-add-item-btn",
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
                    [_vm._v("+")]
                  ),
                  _vm._v(" "),
                  _c("p", {
                    staticClass: "description",
                    domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                  })
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "radio_image" == _vm.fieldData.type
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c("td", [
                  _c(
                    "div",
                    { staticClass: "radio-image-container" },
                    [
                      _vm._l(_vm.fieldData.options, function(image, name) {
                        return [
                          _c(
                            "label",
                            {
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
                                    " " + _vm._s(_vm.__("Active", "dokan-lite"))
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
                                        _vm._s(_vm.__("Select", "dokan-lite")) +
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
                ])
              ]
            : _vm._e(),
          _vm._v(" "),
          "gmap" == _vm.fieldData.type && !_vm.hideMap
            ? [
                _c("th", { attrs: { scope: "row" } }, [
                  _c(
                    "label",
                    {
                      attrs: {
                        for: _vm.sectionId + "[" + _vm.fieldData.name + "]"
                      }
                    },
                    [_vm._v(_vm._s(_vm.fieldData.label))]
                  )
                ]),
                _vm._v(" "),
                _c(
                  "td",
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
                            accessToken: _vm.mapboxAccessToken,
                            location: _vm.mapLocation,
                            width: "100%",
                            height: "300px"
                          },
                          on: {
                            hideMap: _vm.onHideMap,
                            updateMap: _vm.onUpdateMap
                          }
                        })
                      : _c("GoogleMaps", {
                          attrs: {
                            apiKey: _vm.googleMapApiKey,
                            location: _vm.mapLocation
                          },
                          on: {
                            hideMap: _vm.onHideMap,
                            updateMap: _vm.onUpdateMap
                          }
                        }),
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
                    _c("p", {
                      staticClass: "description",
                      domProps: { innerHTML: _vm._s(_vm.fieldData.desc) }
                    })
                  ],
                  1
                )
              ]
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
/* 166 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_SettingsBanner_vue__ = __webpack_require__(63);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_b725e442_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_SettingsBanner_vue__ = __webpack_require__(168);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(167)
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
/* 167 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 168 */
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
/* 169 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
      _c("div", { staticClass: "dokan-settings" }, [
        _c("h2", { staticStyle: { "margin-bottom": "15px" } }, [
          _vm._v(_vm._s(_vm.__("Settings", "dokan-lite")))
        ]),
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
                  _c("strong", { domProps: { innerHTML: _vm._s(_vm.message) } })
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
        _c("div", { staticClass: "dokan-settings-wrap" }, [
          _c(
            "div",
            { staticClass: "nav-tab-wrapper" },
            [
              _c("div", { staticClass: "search-box" }, [
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
                  attrs: { type: "text", placeholder: "Search e.g. vendor" },
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
                          return _vm.clearSearch($event)
                        }
                      }
                    })
                  : _vm._e()
              ]),
              _vm._v(" "),
              _vm._l(_vm.settingSections, function(section) {
                return [
                  _c(
                    "a",
                    {
                      class: [
                        "nav-tab",
                        _vm.currentTab === section.id ? "nav-tab-active" : ""
                      ],
                      attrs: { href: "#" },
                      on: {
                        click: function($event) {
                          $event.preventDefault()
                          return _vm.changeTab(section)
                        }
                      }
                    },
                    [
                      _c("span", {
                        staticClass: "dashicons",
                        class: section.icon
                      }),
                      _vm._v(
                        " " + _vm._s(section.title) + "\n                    "
                      )
                    ]
                  )
                ]
              })
            ],
            2
          ),
          _vm._v(" "),
          _c(
            "div",
            { staticClass: "metabox-holder" },
            [
              _vm._l(_vm.settingFields, function(fields, index) {
                return _vm.isLoaded
                  ? [
                      _vm.currentTab === index
                        ? _c(
                            "div",
                            { staticClass: "group", attrs: { id: index } },
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
                                  _c("table", { staticClass: "form-table" }, [
                                    _vm.showSectionTitle(fields)
                                      ? _c("thead", [
                                          _c(
                                            "tr",
                                            {
                                              staticClass:
                                                "dokan-settings-field-type-sub_section"
                                            },
                                            [
                                              _c(
                                                "th",
                                                {
                                                  staticClass:
                                                    "dokan-settings-sub-section-title",
                                                  attrs: { colspan: "2" }
                                                },
                                                [
                                                  _c("label", [
                                                    _vm._v(
                                                      _vm._s(
                                                        _vm.sectionTitle(index)
                                                      )
                                                    )
                                                  ])
                                                ]
                                              )
                                            ]
                                          )
                                        ])
                                      : _vm._e(),
                                    _vm._v(" "),
                                    _c(
                                      "tbody",
                                      _vm._l(fields, function(field, fieldId) {
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
                                            "toggle-loading-state":
                                              _vm.toggleLoadingState
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
              })
            ],
            2
          ),
          _vm._v(" "),
          _vm.showLoading
            ? _c("div", { staticClass: "loading" }, [_c("loading")], 1)
            : _vm._e()
        ])
      ]),
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
/* 170 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Vendors_vue__ = __webpack_require__(64);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_f81b8092_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Vendors_vue__ = __webpack_require__(175);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(171)
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
/* 171 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 172 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_AddVendor_vue__ = __webpack_require__(65);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_75e0fcd5_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_AddVendor_vue__ = __webpack_require__(174);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(173)
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
/* 173 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 174 */
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
/* 175 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    [
      !_vm.hasPro ? _c("UpgradeBanner") : _vm._e(),
      _vm._v(" "),
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
    require("vue-hot-reload-api")      .rerender("data-v-f81b8092", esExports)
  }
}

/***/ }),
/* 176 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_VendorCapabilities_vue__ = __webpack_require__(66);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_276be9c2_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_VendorCapabilities_vue__ = __webpack_require__(178);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(177)
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
/* 177 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 178 */
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
/* 179 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ProModules_vue__ = __webpack_require__(67);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ca20ca84_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ProModules_vue__ = __webpack_require__(184);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(180)
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
/* 180 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 181 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ModuleUpgradePopup_vue__ = __webpack_require__(68);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_5ae162ac_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ModuleUpgradePopup_vue__ = __webpack_require__(183);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(182)
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
/* 182 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 183 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "dokan-upgrade-to-pro-wrapper" } }, [
    _vm.showPopup
      ? _c("div", { attrs: { id: "dokan-upgrade-popup" } }, [
          _c("div", { staticClass: "modal-content" }, [
            _c("span", { staticClass: "close", on: { click: _vm.closePopup } }),
            _vm._v(" "),
            _c("div", { staticClass: "header" }, [
              _c("img", {
                attrs: {
                  src: _vm.headerImage,
                  alt: _vm.__("Dokan Upgrade Popup", "dokan-lite")
                }
              }),
              _vm._v(" "),
              _c("h1", [
                _vm._v(_vm._s(_vm.__("Unlock 20+ Modules", "dokan-lite")))
              ]),
              _vm._v(" "),
              _c("p", { staticClass: "text-brand" }, [
                _vm._v(_vm._s(_vm.__("with Dokan Premium Plans", "dokan-lite")))
              ]),
              _vm._v(" "),
              _c("p", { staticClass: "text-disabled" }, [
                _vm._v(
                  "\n                    " +
                    _vm._s(
                      _vm.__(
                        "We’re sorry, Dokan Modules are not available on Dokan Lite. Please upgrade to a PRO plan to unlock the modules of your choice.",
                        "dokan-lite"
                      )
                    ) +
                    "\n                "
                )
              ])
            ]),
            _vm._v(" "),
            _c("div", { staticClass: "body" }, [
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
              _c("div", { staticClass: "promo-card" }, [
                _c("img", {
                  attrs: {
                    src: _vm.bonusImage,
                    alt: _vm.__("Dokan Upgrade Promo", "dokan-lite")
                  }
                }),
                _vm._v(" "),
                _c("p", [
                  _vm._v(
                    _vm._s(
                      _vm.__(
                        "Bonus: Dokan Lite users get 30% off regular price. Click on the link above to obtain the coupon & apply it during checkout.",
                        "dokan-lite"
                      )
                    )
                  )
                ])
              ]),
              _vm._v(" "),
              _c("span", [
                _c(
                  "a",
                  {
                    attrs: {
                      target: "_blank",
                      rel: "noopener noreferrer",
                      href:
                        "https://wedevs.com/docs/dokan/getting-started/installation-2/"
                    }
                  },
                  [_vm._v(_vm._s(_vm.__("Already upgraded?", "dokan-lite")))]
                )
              ])
            ])
          ])
        ])
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
/* 184 */
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
        _c("h1", [_vm._v(_vm._s(_vm.__("Modules", "dokan")))]),
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
                            [_vm._v(_vm._s(_vm.__("Documentation", "dokan")))]
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
                            _vm._v(_vm._s(_vm.__("No modules found.", "dokan")))
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
/* 185 */
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
],[105]);