dokanWebpack([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__ = __webpack_require__(5);



/* harmony default export */ __webpack_exports__["a"] = ({
    extends: __WEBPACK_IMPORTED_MODULE_0_vue_chartjs__["Line"],
    props: ['data'],
    data() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        label: function (tooltipItems, data) {
                            let label = data.datasets[tooltipItems.datasetIndex].label || '';
                            let customLabel = data.datasets[tooltipItems.datasetIndex].tooltipLabel || '';
                            let prefix = data.datasets[tooltipItems.datasetIndex].tooltipPrefix || '';

                            let tooltipLabel = customLabel ? customLabel + ': ' : label + ': ';

                            tooltipLabel += prefix + tooltipItems.yLabel;

                            return tooltipLabel;
                        }
                    }
                }
            }
        };
    },
    mounted() {
        this.renderChart(this.data, this.options);
    }
});

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_color_src_components_Sketch_vue__ = __webpack_require__(29);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
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
            validator(type) {
                return ['hsl', 'hex', 'rgba', 'hsv'].indexOf(type) !== -1;
            }
        },

        presetColors: {
            type: Array,
            required: false,
            default() {
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

    data() {
        return {
            showColorPicker: false
        };
    },

    methods: {
        updateColor(colors) {
            let color = '';

            if (colors[this.format]) {
                color = colors[this.format];
            }

            this.$emit('input', color);
        },

        toggleColorPicker() {
            this.showColorPicker = !this.showColorPicker;
        },

        setHexColor(color) {
            this.updateColor({
                hex: color
            });
        }
    }
});

/***/ }),
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Chart_vue__ = __webpack_require__(3);
/* empty harmony namespace reexport */
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

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 11 */,
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_ColorPicker_vue__ = __webpack_require__(4);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_01dc0d51_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_ColorPicker_vue__ = __webpack_require__(14);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(13)
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

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 13 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 14 */
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
                _vm.setHexColor($event.target.value)
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
                    _vm.updateColor({})
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
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */
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

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Postbox',
    props: {
        title: {
            type: String,
            required: true,
            default: ''
        },
        extraClass: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            showing: true
        };
    }
});

/***/ }),
/* 43 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Loading',

    data() {
        return {};
    }
});

/***/ }),
/* 44 */
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

    name: 'Modal',

    props: {
        footer: {
            type: Boolean,
            required: false,
            default: true
        },
        width: {
            type: String,
            required: false,
            default: '500px'
        },
        height: {
            type: String,
            required: false,
            default: 'auto'
        },
        title: {
            type: String,
            required: true,
            default: ''
        }
    },

    data() {
        return {};
    }
});

/***/ }),
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

    name: 'Switches',

    props: {
        enabled: {
            type: Boolean, // String, Number, Boolean, Function, Object, Array
            required: true,
            default: false
        },
        value: {
            type: [String, Number]
        }
    },

    data() {
        return {};
    },

    methods: {

        trigger(e) {
            this.$emit('input', e.target.checked, e.target.value);
        }
    }
});

/***/ }),
/* 46 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
//
//
//
//

/* harmony default export */ __webpack_exports__["a"] = ({
    props: {
        value: {
            type: String,
            required: true
        },

        shortcodes: {
            type: Object,
            required: false
        }
    },

    data() {
        return {
            editorId: this._uid,
            fileFrame: null
        };
    },

    mounted() {
        const vm = this;

        window.tinymce.init({
            selector: `#dokan-tinymce-${this.editorId}`,
            branding: false,
            height: 200,
            menubar: false,
            convert_urls: false,
            theme: 'modern',
            skin: 'lightgray',
            fontsize_formats: '10px 11px 13px 14px 16px 18px 22px 25px 30px 36px 40px 45px 50px 60px 65px 70px 75px 80px',
            font_formats: 'Arial=arial,helvetica,sans-serif;' + 'Comic Sans MS=comic sans ms,sans-serif;' + 'Courier New=courier new,courier;' + 'Georgia=georgia,palatino;' + 'Lucida=Lucida Sans Unicode, Lucida Grande, sans-serif;' + 'Tahoma=tahoma,arial,helvetica,sans-serif;' + 'Times New Roman=times new roman,times;' + 'Trebuchet MS=trebuchet ms,geneva;' + 'Verdana=verdana,geneva;',
            plugins: 'textcolor colorpicker wplink wordpress code hr wpeditimage',
            toolbar: ['shortcodes bold italic underline bullist numlist alignleft aligncenter alignjustify alignright link image wp_adv', 'formatselect forecolor backcolor blockquote hr code fontselect fontsizeselect removeformat undo redo'],
            setup(editor) {
                const shortcodeMenuItems = [];

                _.forEach(vm.shortcodes, (shortcodeObj, shortcodeType) => {
                    shortcodeMenuItems.push({
                        text: shortcodeObj.title,
                        classes: 'menu-section-title'
                    });

                    _.forEach(shortcodeObj.codes, (codeObj, shortcode) => {
                        shortcodeMenuItems.push({
                            text: codeObj.title,
                            onclick() {
                                let code = `[${shortcodeType}:${shortcode}]`;

                                if (codeObj.default) {
                                    code = `[${shortcodeType}:${shortcode} default="${codeObj.default}"]`;
                                }

                                if (codeObj.text) {
                                    code = `[${shortcodeType}:${shortcode} text="${codeObj.text}"]`;
                                }

                                if (codeObj.plainText) {
                                    code = codeObj.text;
                                }

                                editor.insertContent(code);
                            }
                        });
                    });
                });

                // editor.addButton('shortcodes', {
                //     type: 'menubutton',
                //     icon: 'shortcode',
                //     tooltip: 'Shortcodes',
                //     menu: shortcodeMenuItems
                // });

                editor.addButton('image', {
                    icon: 'image',
                    onclick() {
                        vm.browseImage(editor);
                    }
                });

                // editor change triggers
                editor.on('change keyup NodeChange', () => {
                    vm.$emit('input', editor.getContent());
                });
            }
        });
    },

    methods: {
        browseImage(editor) {
            const vm = this;
            const selectedFile = {
                id: 0,
                url: '',
                type: ''
            };

            if (vm.fileFrame) {
                vm.fileFrame.open();
                return;
            }

            const fileStates = [new wp.media.controller.Library({
                library: wp.media.query(),
                multiple: false,
                title: this.__('Select an image', 'dokan-lite'),
                priority: 20,
                filterable: 'uploaded'
            })];

            vm.fileFrame = wp.media({
                title: this.__('Select an image', 'dokan-lite'),
                library: {
                    type: ''
                },
                button: {
                    text: this.__('Select an image', 'dokan-lite')
                },
                multiple: false,
                states: fileStates
            });

            vm.fileFrame.on('select', () => {
                const selection = vm.fileFrame.state().get('selection');

                selection.map(image => {
                    image = image.toJSON();

                    if (image.id) {
                        selectedFile.id = image.id;
                    }

                    if (image.url) {
                        selectedFile.url = image.url;
                    }

                    if (image.type) {
                        selectedFile.type = image.type;
                    }

                    vm.insertImage(editor, selectedFile);

                    return null;
                });
            });

            vm.fileFrame.on('ready', () => {
                vm.fileFrame.uploader.options.uploader.params = {
                    type: 'dokan-image-uploader'
                };
            });

            vm.fileFrame.open();
        },

        insertImage(editor, image) {
            if (!image.id || image.type !== 'image') {
                this.alert({
                    type: 'error',
                    text: this.__('Please select an image,', 'dokan-lite')
                });

                return;
            }

            const img = `<img src="${image.url}" alt="${image.alt}" title="${image.title}" style="max-width: 100%; height: auto;">`;

            editor.insertContent(img);
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

/* harmony default export */ __webpack_exports__["a"] = ({
    props: ['amount'],

    methods: {
        formattedPrice(value) {
            return accounting.formatMoney(value, dokan.currency);
        }
    }
});

/***/ }),
/* 48 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_debounce__);
//
//
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
    name: 'LazyInput',

    props: {
        value: {
            type: String,
            required: true,
            default: ''
        },

        type: {
            type: String,
            required: false,
            default: 'text'
        },

        placeholder: {
            type: String,
            required: false,
            default: ''
        }
    },

    data() {
        return {
            delay: 500,
            debouncer: null
        };
    },

    methods: {
        updateValue(value) {
            const vm = this;

            if (vm.debouncer) {
                vm.debouncer.clear();
            }

            vm.debouncer = Object(__WEBPACK_IMPORTED_MODULE_0_debounce__["debounce"])(() => {
                vm.triggerInput(value);
            }, vm.delay);

            vm.debouncer();
        },

        focus() {
            this.$emit('focus');
        },

        blur() {
            this.$emit('blur');
        },

        triggerInput(value) {
            this.$emit('input', value);
        }
    }
});

/***/ }),
/* 49 */
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

/* harmony default export */ __webpack_exports__["a"] = ({
    props: {
        value: {
            type: Number,
            default: 0
        },
        hidden: {
            type: Boolean,
            default: false
        },
        bgColor: {
            type: String,
            default: 'defaultBg'
        },
        fgColor: {
            type: String,
            default: 'defaultFg'
        }
    }
});

/***/ }),
/* 50 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_debounce___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_debounce__);
//
//
//
//
//
//




/* harmony default export */ __webpack_exports__["a"] = ({

    name: 'Search',
    props: {
        title: {
            type: String,
            default: 'Search'
        }
    },

    data() {
        return {
            delay: 500,
            searchItems: ''
        };
    },

    watch: {
        searchItems() {
            this.makeDelay();
        }
    },

    created() {
        this.makeDelay = Object(__WEBPACK_IMPORTED_MODULE_0_debounce__["debounce"])(this.doSearch, this.delay);
    },

    methods: {
        doSearch() {
            this.$emit('searched', this.searchItems);
        }
    }
});

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

/* harmony default export */ __webpack_exports__["a"] = ({
    props: {
        value: {
            type: String,
            required: true,
            default: ''
        },

        format: {
            type: String,
            required: false,
            default: ''
        },

        placeholder: {
            type: String,
            required: false,
            default: ''
        },

        changeMonthYear: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    mounted() {
        const vm = this;

        $(vm.$el).datepicker({
            dateFormat: vm.format,
            changeMonth: vm.changeMonthYear,
            changeYear: vm.changeMonthYear,

            beforeShow() {
                $(this).datepicker('widget').addClass('dokan-datepicker');
            },

            onSelect(date) {
                vm.updateValue(date);
            }
        });
    },

    methods: {
        updateValue(value) {
            if (!value) {
                value = moment().format('YYYY-MM-DD');
            }

            this.$emit('input', value);
        }
    }
});

/***/ }),
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
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
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(1);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(9);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _moment = __webpack_require__(120);

var _moment2 = _interopRequireDefault(_moment);

var _vueNotification = __webpack_require__(37);

var _vueNotification2 = _interopRequireDefault(_vueNotification);

var _vueWpListTable = __webpack_require__(38);

var _vueWpListTable2 = _interopRequireDefault(_vueWpListTable);

var _vueMultiselect = __webpack_require__(40);

var _vueMultiselect2 = _interopRequireDefault(_vueMultiselect);

var _Api = __webpack_require__(124);

var _Api2 = _interopRequireDefault(_Api);

var _vueChartjs = __webpack_require__(5);

var _vueChartjs2 = _interopRequireDefault(_vueChartjs);

var _Mixin = __webpack_require__(125);

var _Mixin2 = _interopRequireDefault(_Mixin);

var _debounce = __webpack_require__(6);

var _debounce2 = _interopRequireDefault(_debounce);

var _vueContentLoading = __webpack_require__(41);

var _Postbox = __webpack_require__(127);

var _Postbox2 = _interopRequireDefault(_Postbox);

var _Loading = __webpack_require__(130);

var _Loading2 = _interopRequireDefault(_Loading);

var _Chart = __webpack_require__(10);

var _Chart2 = _interopRequireDefault(_Chart);

var _Modal = __webpack_require__(133);

var _Modal2 = _interopRequireDefault(_Modal);

var _Switches = __webpack_require__(136);

var _Switches2 = _interopRequireDefault(_Switches);

var _TextEditor = __webpack_require__(139);

var _TextEditor2 = _interopRequireDefault(_TextEditor);

var _Currency = __webpack_require__(141);

var _Currency2 = _interopRequireDefault(_Currency);

var _LazyInput = __webpack_require__(143);

var _LazyInput2 = _interopRequireDefault(_LazyInput);

var _Progressbar = __webpack_require__(145);

var _Progressbar2 = _interopRequireDefault(_Progressbar);

var _Search = __webpack_require__(148);

var _Search2 = _interopRequireDefault(_Search);

var _Datepicker = __webpack_require__(151);

var _Datepicker2 = _interopRequireDefault(_Datepicker);

var _vueSweetalert = __webpack_require__(52);

var _vueSweetalert2 = _interopRequireDefault(_vueSweetalert);

var _ColorPicker = __webpack_require__(12);

var _ColorPicker2 = _interopRequireDefault(_ColorPicker);

__webpack_require__(156);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.__ = function (text, domain) {
    return __(text, domain);
};

// core components


_vue2.default.use(_vueNotification2.default);
_vue2.default.use(_vueSweetalert2.default);
// Vue.component('multiselect', Multiselect)

_vue2.default.mixin(_Mixin2.default);

_vue2.default.filter('currency', function (value) {
    return accounting.formatMoney(value, dokan.currency);
});

_vue2.default.filter('capitalize', function (value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
});

// Tooltip directive
_vue2.default.directive('tooltip', {
    bind: function bind(el, binding, vnode) {
        $(el).tooltip('show');
    },
    unbind: function unbind(el, binding, vnode) {
        $(el).tooltip('destroy');
    }
});

window.dokan_get_lib = function (lib) {
    return window.dokan.libs[lib];
};

window.dokan_add_route = function (component) {
    window.dokan.routeComponents[component.name] = component;
};

// setup global Dokan libraries
window.dokan.api = new _Api2.default();
window.dokan.libs['Vue'] = _vue2.default;
window.dokan.libs['Router'] = _vueRouter2.default;
window.dokan.libs['moment'] = _moment2.default;
window.dokan.libs['ListTable'] = _vueWpListTable2.default;
window.dokan.libs['Currency'] = _Currency2.default;
window.dokan.libs['Postbox'] = _Postbox2.default;
window.dokan.libs['Loading'] = _Loading2.default;
window.dokan.libs['ChartJS'] = _vueChartjs2.default;
window.dokan.libs['Chart'] = _Chart2.default;
window.dokan.libs['Modal'] = _Modal2.default;
window.dokan.libs['Switches'] = _Switches2.default;
window.dokan.libs['TextEditor'] = _TextEditor2.default;
window.dokan.libs['LazyInput'] = _LazyInput2.default;
window.dokan.libs['Progressbar'] = _Progressbar2.default;
window.dokan.libs['Search'] = _Search2.default;
window.dokan.libs['Datepicker'] = _Datepicker2.default;
window.dokan.libs['Multiselect'] = _vueMultiselect2.default;
window.dokan.libs['ColorPicker'] = _ColorPicker2.default;
window.dokan.libs['debounce'] = _debounce2.default;

window.dokan.libs['ContentLoading'] = {
    VclCode: _vueContentLoading.VclCode,
    VclList: _vueContentLoading.VclList,
    VclTwitch: _vueContentLoading.VclTwitch,
    VclFacebook: _vueContentLoading.VclFacebook,
    VclInstagram: _vueContentLoading.VclInstagram,
    VclBulletList: _vueContentLoading.VclBulletList,
    VueContentLoading: _vueContentLoading.VueContentLoading
};

// wp npm packages with backward compatibility
dokan.hooks = wp && wp.hooks ? wp.hooks : dokan.wpPackages.hooks;

if (dokan.hooks) {
    dokan.addFilterComponent = function (hookName, namespace, component) {
        var priority = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;

        dokan.hooks.addFilter(hookName, namespace, function (components) {
            components.push(component);
            return components;
        }, priority);
    };
}

/***/ }),
/* 120 */
/***/ (function(module, exports) {

module.exports = moment;

/***/ }),
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Dokan_API = function () {
    function Dokan_API() {
        _classCallCheck(this, Dokan_API);
    }

    _createClass(Dokan_API, [{
        key: 'endpoint',
        value: function endpoint() {
            return window.dokan.rest.root + window.dokan.rest.version;
        }
    }, {
        key: 'headers',
        value: function headers() {
            return {};
        }
    }, {
        key: 'get',
        value: function get(path) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.ajax(path, 'GET', this.headers(), data);
        }
    }, {
        key: 'post',
        value: function post(path) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.ajax(path, 'POST', this.headers(), data);
        }
    }, {
        key: 'put',
        value: function put(path) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.ajax(path, 'PUT', this.headers(), data);
        }
    }, {
        key: 'delete',
        value: function _delete(path) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.ajax(path, 'DELETE', this.headers(), data);
        }

        // jQuery ajax wrapper

    }, {
        key: 'ajax',
        value: function ajax(path, method, headers, data) {
            var override = null;

            if ('PUT' === method || 'DELETE' === method) {
                override = method;
                method = 'POST';
            }

            return jQuery.ajax({
                url: this.endpoint() + path,
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', window.dokan.rest.nonce);

                    if (override) {
                        xhr.setRequestHeader('X-HTTP-Method-Override', override);
                    }
                },
                type: method,
                data: data
            });
        }
    }]);

    return Dokan_API;
}();

exports.default = Dokan_API;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _i18n = __webpack_require__(126);

exports.default = {
    methods: {
        setLocaleData: function setLocaleData(data) {
            return (0, _i18n.setLocaleData)(data);
        },
        __: function __(text, domain) {
            return (0, _i18n.__)(text, domain);
        },
        _nx: function _nx(single, plural, number, context, domain) {
            return (0, _i18n._nx)(single, plural, number, context, domain);
        },
        __n: function __n(single, plural, number, domain) {
            return _n(single, plural, number, domain);
        },
        sprintf: function sprintf(fmt) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            return _i18n.sprintf.apply(undefined, [fmt].concat(args));
        }
    }
};

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLocaleData = setLocaleData;
exports.getI18n = getI18n;
exports.__ = __;
exports._x = _x;
exports._n = _n;
exports._nx = _nx;
/**
 * External dependencies
 */
var i18n = {};

/**
 * Creates a new Jed instance with specified locale data configuration.
 *
 * @see http://messageformat.github.io/Jed/
 *
 * @param {Object} data Locale data configuration.
 */
function setLocaleData(data) {
  var jed = new Jed(data);
  i18n[jed._textdomain] = jed;
}

/**
 * Returns the current Jed instance, initializing with a default configuration
 * if not already assigned.
 *
 * @return {Jed} Jed instance.
 */
function getI18n() {
  var domain = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!i18n[domain]) {
    setLocaleData({ '': {} });
  }

  return i18n[domain];
}

/**
 * Retrieve the translation of text.
 *
 * @see https://developer.wordpress.org/reference/functions/__/
 *
 * @param {string} text Text to translate.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} Translated text.
 */
function __(text, domain) {
  return getI18n(domain) ? getI18n(domain).dgettext(domain, text) : text;
}

/**
 * Retrieve translated string with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_x/
 *
 * @param {string} text    Text to translate.
 * @param {string} context Context information for the translators.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} Translated context string without pipe.
 */
function _x(text, context, domain) {
  return getI18n(domain).dpgettext(domain, context, text);
}

/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number.
 *
 * @see https://developer.wordpress.org/reference/functions/_n/
 *
 * @param {string} single The text to be used if the number is singular.
 * @param {string} plural The text to be used if the number is plural.
 * @param {number} number The number to compare against to use either the
 *                         singular or plural form.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */
function _n(single, plural, number, domain) {
  return getI18n(domain).dngettext(domain, single, plural, number);
}

/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number, with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_nx/
 *
 * @param {string} single  The text to be used if the number is singular.
 * @param {string} plural  The text to be used if the number is plural.
 * @param {number} number  The number to compare against to use either the
 *                          singular or plural form.
 * @param {string} context Context information for the translators.
 * @param {string} domain Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */
function _nx(single, plural, number, context, domain) {
  return getI18n(domain).dnpgettext(domain, context, single, plural, number);
}

/**
 * Returns a formatted string.
 *
 * @see http://www.diveintojavascript.com/projects/javascript-sprintf
 *
 * @type {string}
 */
var sprintf = exports.sprintf = Jed.sprintf;

/***/ }),
/* 127 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Postbox_vue__ = __webpack_require__(42);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_36a997ab_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Postbox_vue__ = __webpack_require__(129);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(128)
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Postbox_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_36a997ab_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Postbox_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Postbox.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-36a997ab", Component.options)
  } else {
    hotAPI.reload("data-v-36a997ab", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 128 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 129 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "div",
    {
      class: [
        "postbox",
        "dokan-postbox",
        { closed: !_vm.showing },
        _vm.extraClass
      ]
    },
    [
      _c(
        "button",
        {
          staticClass: "handlediv",
          attrs: { type: "button", "aria-expanded": "false" },
          on: {
            click: function($event) {
              _vm.showing = !_vm.showing
            }
          }
        },
        [
          _c("span", {
            staticClass: "toggle-indicator",
            attrs: { "aria-hidden": "true" }
          })
        ]
      ),
      _vm._v(" "),
      _c("h2", { staticClass: "hndle" }, [
        _c("span", [_vm._v(_vm._s(_vm.title))])
      ]),
      _vm._v(" "),
      _c("div", { staticClass: "inside" }, [
        _c("div", { staticClass: "main" }, [_vm._t("default")], 2)
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
    require("vue-hot-reload-api")      .rerender("data-v-36a997ab", esExports)
  }
}

/***/ }),
/* 130 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Loading_vue__ = __webpack_require__(43);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_67db673c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Loading_vue__ = __webpack_require__(132);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Loading_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_67db673c_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Loading_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Loading.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-67db673c", Component.options)
  } else {
    hotAPI.reload("data-v-67db673c", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 131 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 132 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _vm._m(0)
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "dokan-loader" }, [_c("div"), _c("div")])
  }
]
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-67db673c", esExports)
  }
}

/***/ }),
/* 133 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Modal_vue__ = __webpack_require__(44);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4bd79a2d_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Modal_vue__ = __webpack_require__(135);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Modal_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_4bd79a2d_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Modal_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Modal.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4bd79a2d", Component.options)
  } else {
    hotAPI.reload("data-v-4bd79a2d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
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
  return _c("div", { staticClass: "dokan-modal-dialog" }, [
    _c("div", { staticClass: "dokan-modal" }, [
      _c(
        "div",
        {
          staticClass: "dokan-modal-content",
          style: { width: _vm.width, height: _vm.height }
        },
        [
          _c(
            "section",
            { class: ["dokan-modal-main", { "has-footer": _vm.footer }] },
            [
              _c(
                "header",
                { staticClass: "modal-header" },
                [
                  _vm._t("header", [_c("h1", [_vm._v(_vm._s(_vm.title))])]),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass:
                        "modal-close modal-close-link dashicons dashicons-no-alt",
                      on: {
                        click: function($event) {
                          _vm.$emit("close")
                        }
                      }
                    },
                    [
                      _c("span", { staticClass: "screen-reader-text" }, [
                        _vm._v(
                          _vm._s(_vm.__("Close modal panel", "dokan-lite"))
                        )
                      ])
                    ]
                  )
                ],
                2
              ),
              _vm._v(" "),
              _c("div", { staticClass: "modal-body" }, [_vm._t("body")], 2),
              _vm._v(" "),
              _vm.footer
                ? _c("footer", { staticClass: "modal-footer" }, [
                    _c("div", { staticClass: "inner" }, [_vm._t("footer")], 2)
                  ])
                : _vm._e()
            ]
          )
        ]
      )
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "dokan-modal-backdrop" })
  ])
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4bd79a2d", esExports)
  }
}

/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Switches_vue__ = __webpack_require__(45);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_aa8ad7dc_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Switches_vue__ = __webpack_require__(138);
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

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 137 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 138 */
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
/* 139 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_TextEditor_vue__ = __webpack_require__(46);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_70730fac_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_TextEditor_vue__ = __webpack_require__(140);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_TextEditor_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_70730fac_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_TextEditor_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/TextEditor.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-70730fac", Component.options)
  } else {
    hotAPI.reload("data-v-70730fac", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 140 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("textarea", {
    attrs: { id: "dokan-tinymce-" + _vm.editorId },
    domProps: { value: _vm.value }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-70730fac", esExports)
  }
}

/***/ }),
/* 141 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Currency_vue__ = __webpack_require__(47);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7df58dc1_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Currency_vue__ = __webpack_require__(142);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Currency_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_7df58dc1_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Currency_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Currency.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-7df58dc1", Component.options)
  } else {
    hotAPI.reload("data-v-7df58dc1", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 142 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", {
    domProps: { innerHTML: _vm._s(_vm.formattedPrice(_vm.amount)) }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-7df58dc1", esExports)
  }
}

/***/ }),
/* 143 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_LazyInput_vue__ = __webpack_require__(48);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_588d4894_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_LazyInput_vue__ = __webpack_require__(144);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_LazyInput_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_588d4894_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_LazyInput_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/LazyInput.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-588d4894", Component.options)
  } else {
    hotAPI.reload("data-v-588d4894", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 144 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("input", {
    attrs: { type: _vm.type, placeholder: _vm.placeholder },
    domProps: { value: _vm.value },
    on: {
      input: function($event) {
        _vm.updateValue($event.target.value)
      },
      focus: _vm.focus,
      blur: _vm.blur
    }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-588d4894", esExports)
  }
}

/***/ }),
/* 145 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Progressbar_vue__ = __webpack_require__(49);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_356fabc6_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Progressbar_vue__ = __webpack_require__(147);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(146)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-356fabc6"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Progressbar_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_356fabc6_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Progressbar_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Progressbar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-356fabc6", Component.options)
  } else {
    hotAPI.reload("data-v-356fabc6", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 146 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 147 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { class: _vm.bgColor, attrs: { id: "progressbar" } }, [
    _c(
      "div",
      {
        class: _vm.fgColor,
        style: { width: _vm.value + "%" },
        attrs: { id: "value" }
      },
      [!_vm.hidden ? [_vm._v(_vm._s(_vm.value + "%"))] : _vm._e()],
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
    require("vue-hot-reload-api")      .rerender("data-v-356fabc6", esExports)
  }
}

/***/ }),
/* 148 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Search_vue__ = __webpack_require__(50);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_5d8365d8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Search_vue__ = __webpack_require__(150);
var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(149)
}
var normalizeComponent = __webpack_require__(0)
/* script */


/* template */

/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-5d8365d8"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Search_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_5d8365d8_hasScoped_true_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Search_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Search.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-5d8365d8", Component.options)
  } else {
    hotAPI.reload("data-v-5d8365d8", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 149 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 150 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("p", { staticClass: "search-box" }, [
    _c("input", {
      directives: [
        {
          name: "model",
          rawName: "v-model",
          value: _vm.searchItems,
          expression: "searchItems"
        }
      ],
      attrs: {
        type: "search",
        id: "post-search-input",
        name: "s",
        placeholder: _vm.title
      },
      domProps: { value: _vm.searchItems },
      on: {
        input: function($event) {
          if ($event.target.composing) {
            return
          }
          _vm.searchItems = $event.target.value
        }
      }
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
    require("vue-hot-reload-api")      .rerender("data-v-5d8365d8", esExports)
  }
}

/***/ }),
/* 151 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Datepicker_vue__ = __webpack_require__(51);
/* empty harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ae257028_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Datepicker_vue__ = __webpack_require__(152);
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
  __WEBPACK_IMPORTED_MODULE_0__babel_loader_node_modules_vue_loader_lib_selector_type_script_index_0_Datepicker_vue__["a" /* default */],
  __WEBPACK_IMPORTED_MODULE_1__node_modules_vue_loader_lib_template_compiler_index_id_data_v_ae257028_hasScoped_false_buble_transforms_node_modules_vue_loader_lib_selector_type_template_index_0_Datepicker_vue__["a" /* default */],
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "src/admin/components/Datepicker.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-ae257028", Component.options)
  } else {
    hotAPI.reload("data-v-ae257028", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

/* harmony default export */ __webpack_exports__["default"] = (Component.exports);


/***/ }),
/* 152 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("input", {
    attrs: { type: "text", placeholder: _vm.placeholder },
    domProps: { value: _vm.value },
    on: {
      input: function($event) {
        _vm.updateValue($event.target.value)
      }
    }
  })
}
var staticRenderFns = []
render._withStripped = true
var esExports = { render: render, staticRenderFns: staticRenderFns }
/* harmony default export */ __webpack_exports__["a"] = (esExports);
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-ae257028", esExports)
  }
}

/***/ })
],[119]);