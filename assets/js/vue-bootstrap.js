dokanWebpack([2],{

/***/ 42:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _vue = __webpack_require__(0);

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = __webpack_require__(3);

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _vueNotification = __webpack_require__(13);

var _vueNotification2 = _interopRequireDefault(_vueNotification);

var _vueWpListTable = __webpack_require__(5);

var _vueWpListTable2 = _interopRequireDefault(_vueWpListTable);

var _Api = __webpack_require__(43);

var _Api2 = _interopRequireDefault(_Api);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_vue2.default.use(_vueNotification2.default);

window.dokan.api = new _Api2.default();
window.dokan.libs['Vue'] = _vue2.default;
window.dokan.libs['Router'] = _vueRouter2.default;
window.dokan.libs['ListTable'] = _vueWpListTable2.default;

window.dokan_get_lib = function (lib) {
    return window.dokan.libs[lib];
};

window.dokan_add_route = function (component) {
    window.dokan.routeComponents[component.name] = component;
};

/***/ }),

/***/ 43:
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

            data._method = 'PUT';
            return this.post(path, data);
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

            return $.ajax({
                url: this.endpoint() + path,
                beforeSend: function beforeSend(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', window.wpApiSettings.nonce);
                },
                type: method,
                data: data
            });
        }
    }]);

    return Dokan_API;
}();

exports.default = Dokan_API;

/***/ })

},[42]);