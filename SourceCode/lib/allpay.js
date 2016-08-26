"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // dependencies


var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _crypto = require("crypto");

var _crypto2 = _interopRequireDefault(_crypto);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _https = require("https");

var _https2 = _interopRequireDefault(_https);

var _querystring = require("querystring");

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _iconvLite = require("iconv-lite");

var _iconvLite2 = _interopRequireDefault(_iconvLite);

var _constants = require("./constants");

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * API 錯誤訊息
 *
 * @constant {object}
 */
var ERROR_MESSAGE = {
  initializeRequired: "Allpay has not been initialized",
  missingParameter: "Missing required parameter: %s",
  parameterShouldBe: "%s should be %s",
  parameterCannotBe: "%s cannot be %s",
  reachMaxLength: "The maximum length for %s is %d",
  fixedLength: "The length for %s should be %d",
  wrongDataFormat: "The format for %s is wrong",
  removeParameter: "Please remove %s",
  cannotBeEmpty: "%s cannot be empty",
  checkMacValueVerifyFail: "CheckMacValue verify fail"
};

/**
 * 設定
 *
 * @property {string} merchantID - 廠商編號
 * @property {string} hashKey - HashKey
 * @property {string} hashIV - HashIV
 * @property {boolean} debug - 顯示除錯訊息
 * @property {boolean} initialized - 初始化標記
 * @private
 */
var CONFIG = {
  merchantID: "",
  hashKey: "",
  hashIV: "",
  debug: false,
  isInitialized: false
};

var errorMsg = "";

var Allpay = function () {
  _createClass(Allpay, [{
    key: "CONSTANTS",
    get: function get() {
      return this.constructor.CONSTANTS;
    }
  }, {
    key: "VERSION",
    get: function get() {
      return this.constructor.VERSION;
    }

    /**
     * 建構子
     */

  }], [{
    key: "CONSTANTS",
    get: function get() {
      return _constants2.default;
    }
  }, {
    key: "VERSION",
    get: function get() {
      return require("../package.json").version;
    }
  }]);

  function Allpay(_ref) {
    var merchantID = _ref.merchantID;
    var hashKey = _ref.hashKey;
    var hashIV = _ref.hashIV;
    var mode = _ref.mode;
    var debug = _ref.debug;

    _classCallCheck(this, Allpay);

    if (typeof merchantID === "undefined") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "merchantID");
      return sendErrorResponse(errorMsg);
    }
    if (typeof merchantID !== "string") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "merchantID", "string");
      return sendErrorResponse(errorMsg);
    }
    if (merchantID.length === 0) {
      errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "merchantID");
      return sendErrorResponse(errorMsg, callback);
    }
    if (merchantID.length > 10) {
      errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "merchantID", 10);
      return sendErrorResponse(errorMsg);
    }
    CONFIG.merchantID = merchantID;

    if (typeof hashKey === "undefined") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "hashKey");
      return sendErrorResponse(errorMsg);
    }
    if (typeof hashKey !== "string") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "hashKey", "string");
      return sendErrorResponse(errorMsg);
    }
    if (hashKey.length === 0) {
      errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "hashKey");
      return sendErrorResponse(errorMsg, callback);
    }
    CONFIG.hashKey = hashKey;

    if (typeof hashIV === "undefined") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "hashIV");
      return sendErrorResponse(errorMsg);
    }
    if (typeof hashIV !== "string") {
      errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "hashIV", "string");
      return sendErrorResponse(errorMsg);
    }
    if (hashIV.length === 0) {
      errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "hashIV");
      return sendErrorResponse(errorMsg, callback);
    }
    CONFIG.hashIV = hashIV;

    if (typeof debug !== "undefined") {
      if (typeof debug !== "boolean") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "debug", "boolean");
        return sendErrorResponse(errorMsg);
      }

      CONFIG.debug = debug;
    }

    if (!(this instanceof Allpay)) {
      return new Allpay(arguments[0]);
    }

    CONFIG.isInitialized = true;

    log("==================================================");
    log("Allpay SDK config");
    log("==================================================");
    log(CONFIG);
  }

  /**
   * 訂單產生
   *
   * @param {object} opts - 訂單產生相關參數
   * @param {requestCallback} callback - 處理回應的 callback
   */


  _createClass(Allpay, [{
    key: "aioCheckOut",
    value: function aioCheckOut(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeDate")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeDate");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeDate !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeDate", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(opts.MerchantTradeDate)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "MerchantTradeDate");
        return sendErrorResponse(errorMsg, callback);
      }

      //
      // NOTE: 目前預設自動帶入 aio
      //
      // if (!opts.hasOwnProperty("PaymentType")) {
      //   errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "PaymentType");
      //   return sendErrorResponse(errorMsg, callback);
      // }
      // if (typeof opts.PaymentType !== "string") {
      //   errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentType", "string");
      //   return sendErrorResponse(errorMsg, callback);
      // }
      // if (opts.PaymentType.length === 0) {
      //   errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "PaymentType");
      //   return sendErrorResponse(errorMsg, callback);
      // }
      // if (opts.PaymentType.length > 20) {
      //   errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PaymentType", 20);
      //   return sendErrorResponse(errorMsg, callback);
      // }

      if (!opts.hasOwnProperty("TotalAmount")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TotalAmount");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Number.isInteger(opts.TotalAmount)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TotalAmount", "Integer");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TotalAmount <= 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TotalAmount", "greater than 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("TradeDesc")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TradeDesc");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.TradeDesc !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TradeDesc", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeDesc.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "TradeDesc");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeDesc.length > 200) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "TradeDesc", 200);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("Items")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Items");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Array.isArray(opts.Items)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items", "array");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.Items.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "Items");
        return sendErrorResponse(errorMsg, callback);
      }
      opts.Items.forEach(function (item) {
        if (!item.hasOwnProperty("name")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Items.name");
          return false;
        }
        if (typeof item.name !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.name", "string");
          return false;
        }
        if (item.name.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "Items.name");
          return sendErrorResponse(errorMsg, callback);
        }

        if (!item.hasOwnProperty("price")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Items.price");
          return false;
        }
        if (!Number.isInteger(item.price)) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.price", "Integer");
          return false;
        }
        if (item.price <= 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.price", "greater than 0");
          return false;
        }

        if (!item.hasOwnProperty("currency")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Items.currency");
          return false;
        }
        if (typeof item.currency !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.currency", "string");
          return false;
        }
        if (item.currency.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "Items.currency");
          return sendErrorResponse(errorMsg, callback);
        }

        if (!item.hasOwnProperty("quantity")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Items.quantity");
          return false;
        }
        if (!Number.isInteger(item.quantity)) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.quantity", "Integer");
          return false;
        }
        if (item.quantity <= 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Items.quantity", "greater than 0");
          return false;
        }
      });
      if (errorMsg !== "") {
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("ReturnURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ReturnURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ReturnURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ReturnURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ReturnURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ReturnURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ReturnURL.length > 200) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "ReturnURL", 200);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("ChoosePayment")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ChoosePayment");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ChoosePayment !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChoosePayment", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      var paymentMethods = getObjectValues(_constants2.default.PAYMENT_METHOD);
      if (paymentMethods.indexOf(opts.ChoosePayment) === -1) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChoosePayment", genReadableKeys("PAYMENT_METHOD"));
        return sendErrorResponse(errorMsg, callback);
      }

      // NOTE: 目前由 API 檢查最低金額
      // if ([constants.PAYMENT_METHOD.CVS, constants.PAYMENT_METHOD.BARCODE].indexOf(opts.ChoosePayment) > -1 && opts.TotalAmount < 30) {
      //   errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TotalAmount", "greater than or equal to 30");
      //   return sendErrorResponse(errorMsg, callback);
      // }

      if (opts.hasOwnProperty("ClientBackURL")) {
        if (typeof opts.ClientBackURL !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ClientBackURL", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.ClientBackURL.length > 200) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "ClientBackURL", 200);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("ItemURL")) {
        if (typeof opts.ItemURL !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ItemURL", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.ItemURL.length > 200) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "ItemURL", 200);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("Remark")) {
        if (typeof opts.Remark !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Remark", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.Remark.length > 100) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Remark", 100);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("ChooseSubPayment")) {
        if (typeof opts.ChooseSubPayment !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChooseSubPayment", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var paymentMethodItems = getObjectValues(_constants2.default.PAYMENT_METHOD_ITEM);
        if (paymentMethodItems.indexOf(opts.ChooseSubPayment) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChooseSubPayment", genReadableKeys("PAYMENT_METHOD_ITEM"));
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("OrderResultURL")) {
        if (typeof opts.OrderResultURL !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "OrderResultURL", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.OrderResultURL.length > 200) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "OrderResultURL", 200);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("NeedExtraPaidInfo")) {
        if (typeof opts.NeedExtraPaidInfo !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "NeedExtraPaidInfo", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var extraPaymentInfos = getObjectValues(_constants2.default.EXTRA_PAYMENT_INFO);
        if (extraPaymentInfos.indexOf(opts.NeedExtraPaidInfo) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "NeedExtraPaidInfo", genReadableKeys("EXTRA_PAYMENT_INFO"));
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("DeviceSource")) {
        if (typeof opts.DeviceSource !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DeviceSource", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var deviceTypes = getObjectValues(_constants2.default.DEVICE_TYPE);
        if (deviceTypes.indexOf(opts.DeviceSource) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DeviceSource", genReadableKeys("DEVICE_TYPE"));
          return sendErrorResponse(errorMsg, callback);
        }

        if (opts.DeviceSource === _constants2.default.DEVICE_TYPE.MOBILE && opts.ChoosePayment !== _constants2.default.PAYMENT_METHOD.ALL) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DeviceSource", "P or change ChoosePayment to ALL");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("IgnorePayment")) {
        var _ret = function () {
          if (typeof opts.IgnorePayment !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "IgnorePayment", "string");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (opts.IgnorePayment.length > 100) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "IgnorePayment", 100);
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          var ignorePayments = opts.IgnorePayment.split("#");
          var validOptions = getObjectValues(_constants2.default.PAYMENT_METHOD);
          var index = validOptions.indexOf("ALL");
          var optionsForMessage = genReadableKeys("PAYMENT_METHOD").replace("Allpay.CONSTANTS.PAYMENT_METHOD.ALL, ", "");

          if (index > -1) {
            validOptions.splice(index, 1);
          }

          ignorePayments.forEach(function (item) {
            if (validOptions.indexOf(item) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "IgnorePayment", optionsForMessage);
              return false;
            }
          });
          if (errorMsg !== "") {
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
      }

      if (opts.hasOwnProperty("PlatformID")) {
        if (typeof opts.PlatformID !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformID", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformID.length > 10) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PlatformID", 10);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("InvoiceMark")) {
        if (typeof opts.InvoiceMark !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceMark", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var invoiceMarks = getObjectValues(_constants2.default.INVOICE_MARK);
        if (invoiceMarks.indexOf(opts.InvoiceMark) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceMark", genReadableKeys("INVOICE_MARK"));
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("HoldTradeAMT")) {
        if (!Number.isInteger(opts.HoldTradeAMT)) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "HoldTradeAMT", "Integer");
          return sendErrorResponse(errorMsg, callback);
        }
        var holdTradeTypes = getObjectValues(_constants2.default.HOLD_TRADE_TYPE);
        if (holdTradeTypes.indexOf(opts.HoldTradeAMT) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "HoldTradeAMT", genReadableKeys("HOLD_TRADE_TYPE"));
          return sendErrorResponse(errorMsg, callback);
        }

        if ([_constants2.default.PAYMENT_METHOD.CREDIT, _constants2.default.PAYMENT_METHOD.TENPAY].indexOf(opts.ChoosePayment) > -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "HoldTradeAMT");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("EncryptType")) {
        if (!Number.isInteger(opts.EncryptType)) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "EncryptType", "Integer");
          return sendErrorResponse(errorMsg, callback);
        }
        var encryptTypes = getObjectValues(_constants2.default.ENCRYPT_TYPE);
        if (encryptTypes.indexOf(opts.EncryptType) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "EncryptType", genReadableKeys("ENCRYPT_TYPE"));
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("UseRedeem")) {
        if (typeof opts.UseRedeem !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UseRedeem", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var useRedeems = getObjectValues(_constants2.default.USE_REDEEM);
        if (useRedeems.indexOf(opts.UseRedeem) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UseRedeem", genReadableKeys("USE_REDEEM"));
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if ([_constants2.default.PAYMENT_METHOD.ATM, _constants2.default.PAYMENT_METHOD.CVS, _constants2.default.PAYMENT_METHOD.BARCODE].indexOf(opts.ChoosePayment) > -1) {
        if (opts.ChoosePayment === _constants2.default.PAYMENT_METHOD.ATM) {
          if (opts.hasOwnProperty("ExpireDate")) {
            if (!Number.isInteger(opts.ExpireDate)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExpireDate", "Integer");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.ExpireDate < 1 || opts.ExpireDate > 60) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExpireDate", "1 ~ 60");
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (!opts.hasOwnProperty("PaymentInfoURL")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "PaymentInfoURL");
            return sendErrorResponse(errorMsg, callback);
          }
          if (typeof opts.PaymentInfoURL !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentInfoURL", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.PaymentInfoURL.length === 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "PaymentInfoURL");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.PaymentInfoURL.length > 200) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PaymentInfoURL", 200);
            return sendErrorResponse(errorMsg, callback);
          }
        } else {
          if (opts.hasOwnProperty("StoreExpireDate")) {
            if (!Number.isInteger(opts.StoreExpireDate)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "StoreExpireDate", "Integer");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.StoreExpireDate <= 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "StoreExpireDate", "greater than 0");
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (opts.hasOwnProperty("Desc_1")) {
            if (typeof opts.Desc_1 !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Desc_1", "string");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.Desc_1.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Desc_1", 20);
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (opts.hasOwnProperty("Desc_2")) {
            if (typeof opts.Desc_2 !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Desc_2", "string");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.Desc_2.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Desc_2", 20);
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (opts.hasOwnProperty("Desc_3")) {
            if (typeof opts.Desc_3 !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Desc_3", "string");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.Desc_3.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Desc_3", 20);
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (opts.hasOwnProperty("Desc_4")) {
            if (typeof opts.Desc_4 !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Desc_4", "string");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.Desc_4.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Desc_4", 20);
              return sendErrorResponse(errorMsg, callback);
            }
          }

          if (opts.hasOwnProperty("PaymentInfoURL")) {
            if (typeof opts.PaymentInfoURL !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentInfoURL", "string");
              return sendErrorResponse(errorMsg, callback);
            }
            if (opts.PaymentInfoURL.length > 200) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PaymentInfoURL", 200);
              return sendErrorResponse(errorMsg, callback);
            }
          }
        }

        if (opts.hasOwnProperty("ClientRedirectURL")) {
          if (typeof opts.ClientRedirectURL !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ClientRedirectURL", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.ClientRedirectURL.length > 200) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "ClientRedirectURL", 200);
            return sendErrorResponse(errorMsg, callback);
          }
        }
      }

      if (opts.ChoosePayment === _constants2.default.PAYMENT_METHOD.TENPAY) {
        if (opts.hasOwnProperty("ExpireTime")) {
          if (typeof opts.ExpireTime !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExpireTime", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (!/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(opts.ExpireTime)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "ExpireTime");
            return sendErrorResponse(errorMsg, callback);
          }
        }
      }

      if (opts.ChoosePayment === _constants2.default.PAYMENT_METHOD.CREDIT) {
        if (opts.hasOwnProperty("CreditInstallment")) {
          if (!Number.isInteger(opts.CreditInstallment)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CreditInstallment", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.CreditInstallment < 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CreditInstallment", "greater than or equal to 0");
            return sendErrorResponse(errorMsg, callback);
          }
          if (!opts.hasOwnProperty("InstallmentAmount")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InstallmentAmount");
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("InstallmentAmount")) {
          if (!opts.hasOwnProperty("CreditInstallment")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CreditInstallment");
            return sendErrorResponse(errorMsg, callback);
          }
          if (!Number.isInteger(opts.InstallmentAmount)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InstallmentAmount", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.InstallmentAmount < 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InstallmentAmount", "greater than or equal to 0");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.InstallmentAmount > 0 && opts.CreditInstallment === 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CreditInstallment", "greater than 0");
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("Redeem")) {
          if (typeof opts.Redeem !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Redeem", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.Redeem.length > 1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Redeem", 1);
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("UnionPay")) {
          if (!Number.isInteger(opts.UnionPay)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UnionPay", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          var unionPays = getObjectValues(_constants2.default.UNION_PAY);
          if (unionPays.indexOf(opts.UnionPay) === -1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UnionPay", genReadableKeys("UNION_PAY"));
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("Language")) {
          if (typeof opts.Language !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Language", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.Language.length > 3) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Language", 3);
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("PeriodAmount")) {
          if (!Number.isInteger(opts.PeriodAmount)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PeriodAmount", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.PeriodAmount !== opts.TotalAmount) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PeriodAmount", "equal to TotalAmount");
            return sendErrorResponse(errorMsg, callback);
          }

          if (!opts.hasOwnProperty("PeriodType")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "PeriodType");
            return sendErrorResponse(errorMsg, callback);
          }
          if (!opts.hasOwnProperty("Frequency")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Frequency");
            return sendErrorResponse(errorMsg, callback);
          }
          if (!opts.hasOwnProperty("ExecTimes")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ExecTimes");
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("PeriodType")) {
          if (typeof opts.PeriodType !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PeriodType", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          var periodTypes = getObjectValues(_constants2.default.PERIOD_TYPE);
          if (periodTypes.indexOf(opts.PeriodType) === -1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PeriodType", genReadableKeys("PERIOD_TYPE"));
            return sendErrorResponse(errorMsg, callback);
          }
        }

        if (opts.hasOwnProperty("Frequency")) {
          if (!Number.isInteger(opts.Frequency)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Frequency", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.Frequency < 1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Frequency", "greater than or equal to 1");
            return sendErrorResponse(errorMsg, callback);
          }

          if (opts.PeriodType === _constants2.default.PERIOD_TYPE.DAY) {
            if (opts.Frequency > 365) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Frequency", "1 ~ 365");
              return sendErrorResponse(errorMsg, callback);
            }
          } else if (opts.PeriodType === _constants2.default.PERIOD_TYPE.MONTH) {
            if (opts.Frequency > 12) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Frequency", "1 ~ 12");
              return sendErrorResponse(errorMsg, callback);
            }
          } else {
            if (opts.Frequency > 1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Frequency", "1");
              return sendErrorResponse(errorMsg, callback);
            }
          }
        }

        if (opts.hasOwnProperty("ExecTimes")) {
          if (!Number.isInteger(opts.ExecTimes)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExecTimes", "Integer");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.ExecTimes < 2) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExecTimes", "greater than or equal to 2");
            return sendErrorResponse(errorMsg, callback);
          }

          if (opts.PeriodType === _constants2.default.PERIOD_TYPE.DAY) {
            if (opts.ExecTimes > 999) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExecTimes", "2 ~ 999");
              return sendErrorResponse(errorMsg, callback);
            }
          } else if (opts.PeriodType === _constants2.default.PERIOD_TYPE.MONTH) {
            if (opts.ExecTimes > 99) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExecTimes", "2 ~ 99");
              return sendErrorResponse(errorMsg, callback);
            }
          } else {
            if (opts.ExecTimes > 9) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ExecTimes", "2 ~ 9");
              return sendErrorResponse(errorMsg, callback);
            }
          }
        }

        if (opts.hasOwnProperty("PeriodReturnURL")) {
          if (typeof opts.PeriodReturnURL !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PeriodReturnURL", "string");
            return sendErrorResponse(errorMsg, callback);
          }
          if (opts.PeriodReturnURL.length > 200) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PeriodReturnURL", 200);
            return sendErrorResponse(errorMsg, callback);
          }
        }
      }

      if (opts.InvoiceMark === _constants2.default.INVOICE_MARK.YES) {
        var _ret2 = function () {
          if (!opts.hasOwnProperty("RelateNumber")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "RelateNumber");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (typeof opts.RelateNumber !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "RelateNumber", "string");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (opts.RelateNumber.length === 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "RelateNumber");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (opts.RelateNumber.length > 30) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "RelateNumber", 30);
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("CustomerIdentifier")) {
            if (typeof opts.CustomerIdentifier !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerIdentifier", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerIdentifier !== "" && opts.CustomerIdentifier.length !== 8) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.fixedLength, "CustomerIdentifier", 8);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (opts.hasOwnProperty("CarruerType")) {
            if (typeof opts.CarruerType !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CarruerType", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            var carrierTypes = getObjectValues(_constants2.default.CARRIER_TYPE);
            if (carrierTypes.indexOf(opts.CarruerType) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CarruerType", genReadableKeys("CARRIER_TYPE"));
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }

            if ([_constants2.default.CARRIER_TYPE.MEMBER, _constants2.default.CARRIER_TYPE.CITIZEN].indexOf(opts.CarruerType) > -1) {
              if (opts.hasOwnProperty("CustomerIdentifier") && opts.CustomerIdentifier !== "") {
                errorMsg = genErrorMessage(ERROR_MESSAGE.parameterCannotBe, "CarruerType", _constants2.default.CARRIER_TYPE.MEMBER + " or " + _constants2.default.CARRIER_TYPE.CITIZEN);
                return {
                  v: sendErrorResponse(errorMsg, callback)
                };
              }
            }
          }

          if (opts.CarruerType === _constants2.default.CARRIER_TYPE.MEMBER) {
            if (!opts.hasOwnProperty("CustomerID") || !opts.CustomerID) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CustomerID");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (typeof opts.CustomerID !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerID", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerID.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CustomerID");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerID.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CustomerID", 20);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (opts.hasOwnProperty("Donation")) {
            if (typeof opts.Donation !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Donation", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            var donations = getObjectValues(_constants2.default.DONATION);
            if (donations.indexOf(opts.Donation) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Donation", genReadableKeys("DONATION"));
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.Donation === _constants2.default.DONATION.YES) {
              if (opts.hasOwnProperty("CustomerIdentifier") && opts.CustomerIdentifier !== "") {
                errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Donation", "" + _constants2.default.DONATION.NO);
                return {
                  v: sendErrorResponse(errorMsg, callback)
                };
              }
            }
          }

          if (opts.hasOwnProperty("Print")) {
            if (typeof opts.Print !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Print", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            var printMarks = getObjectValues(_constants2.default.PRINT_MARK);
            if (printMarks.indexOf(opts.Print) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Print", genReadableKeys("PRINT_MARK"));
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (opts.Donation === _constants2.default.DONATION.YES && opts.Print === _constants2.default.PRINT_MARK.YES) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Print", "" + _constants2.default.PRINT_MARK.NO);
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("CustomerIdentifier") && opts.CustomerIdentifier !== "") {
            if (!opts.hasOwnProperty("Print") || opts.Print === _constants2.default.PRINT_MARK.NO) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Print", "" + _constants2.default.PRINT_MARK.YES);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (opts.Print === _constants2.default.PRINT_MARK.YES) {
            if (!opts.hasOwnProperty("CustomerName") || !opts.CustomerName) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CustomerName");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (typeof opts.CustomerName !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerName", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerName.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CustomerName");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerName.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CustomerName", 20);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }

            if (!opts.hasOwnProperty("CustomerAddr") || !opts.CustomerAddr) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CustomerAddr");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (typeof opts.CustomerAddr !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerAddr", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerAddr.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CustomerAddr");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerAddr.length > 200) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CustomerAddr", 200);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (!opts.CustomerPhone && !opts.CustomerEmail) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CustomerPhone or CustomerEmail");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("CustomerPhone")) {
            if (typeof opts.CustomerPhone !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerPhone", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (!opts.hasOwnProperty("CustomerEmail") && opts.CustomerPhone.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CustomerPhone");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerPhone.length > 20) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CustomerPhone", 20);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (opts.hasOwnProperty("CustomerEmail")) {
            if (typeof opts.CustomerEmail !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CustomerEmail", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (!opts.hasOwnProperty("CustomerPhone") && opts.CustomerEmail.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CustomerEmail");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CustomerEmail.length > 200) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CustomerEmail", 200);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (!opts.hasOwnProperty("TaxType")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TaxType");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (typeof opts.TaxType !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TaxType", "string");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          var taxTypes = getObjectValues(_constants2.default.TAX_TYPE);
          if (taxTypes.indexOf(opts.TaxType) === -1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TaxType", genReadableKeys("TAX_TYPE"));
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("ClearanceMark")) {
            if (typeof opts.ClearanceMark !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ClearanceMark", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            var clearanceMarks = getObjectValues(_constants2.default.CLEARANCE_MARK);
            if (clearanceMarks.indexOf(opts.ClearanceMark) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ClearanceMark", genReadableKeys("CLEARANCE_MARK"));
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          } else if (opts.TaxType === _constants2.default.TAX_TYPE.ZERO) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ClearanceMark");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("CarruerNum")) {
            if (typeof opts.CarruerNum !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CarruerNum", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.CarruerNum.length > 64) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "CarruerNum", 64);
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          switch (opts.CarruerType) {
            case undefined:
            case _constants2.default.CARRIER_TYPE.NONE:
            case _constants2.default.CARRIER_TYPE.MEMBER:
              if (opts.hasOwnProperty("CarruerNum") && opts.CarruerNum !== "") {
                errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "CarruerNum");
                return {
                  v: sendErrorResponse(errorMsg, callback)
                };
              }
              break;
            case _constants2.default.CARRIER_TYPE.CITIZEN:
              if (!/^[a-zA-Z]{2}\d{14}$/.test(opts.CarruerNum)) {
                errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "CarruerNum");
                return {
                  v: sendErrorResponse(errorMsg, callback)
                };
              }
              break;
            case _constants2.default.CARRIER_TYPE.CELLPHONE:
              if (!/^\/{1}[0-9a-zA-Z+-.]{7}$/.test(opts.CarruerNum)) {
                errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "CarruerNum");
                return {
                  v: sendErrorResponse(errorMsg, callback)
                };
              }
              break;
            default:
              errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "CarruerNum");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
          }

          if (opts.Donation === _constants2.default.DONATION.YES) {
            if (!opts.hasOwnProperty("LoveCode") || !opts.LoveCode) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "LoveCode");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (typeof opts.LoveCode !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "LoveCode", "string");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (!/^([xX]{1}[0-9]{2,6}|[0-9]{3,7})$/.test(opts.LoveCode)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "LoveCode");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          } else {
            if (opts.hasOwnProperty("LoveCode")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "LoveCode");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (!opts.hasOwnProperty("InvoiceItems")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (!Array.isArray(opts.InvoiceItems)) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems", "array");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (opts.InvoiceItems.length === 0) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "InvoiceItems");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          opts.InvoiceItems.forEach(function (invoiceItem) {
            if (!invoiceItem.hasOwnProperty("name")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems.name");
              return false;
            }
            if (typeof invoiceItem.name !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.name", "string");
              return false;
            }
            if (invoiceItem.name.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "InvoiceItems.name");
              return sendErrorResponse(errorMsg, callback);
            }

            if (!invoiceItem.hasOwnProperty("count")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems.count");
              return false;
            }
            if (!Number.isInteger(invoiceItem.count)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.count", "Integer");
              return false;
            }
            if (invoiceItem.count <= 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.count", "greater than 0");
              return false;
            }

            if (!invoiceItem.hasOwnProperty("word")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems.word");
              return false;
            }
            if (typeof invoiceItem.word !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.word", "string");
              return false;
            }
            if (invoiceItem.word.length === 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "InvoiceItems.word");
              return sendErrorResponse(errorMsg, callback);
            }

            if (!invoiceItem.hasOwnProperty("price")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems.price");
              return false;
            }
            if (!Number.isInteger(invoiceItem.price)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.price", "Integer");
              return false;
            }
            if (invoiceItem.price <= 0) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.price", "greater than 0");
              return false;
            }

            if (!invoiceItem.hasOwnProperty("taxType")) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvoiceItems.taxType");
              return false;
            }
            if (typeof invoiceItem.taxType !== "string") {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.taxType", "string");
              return false;
            }
            if (taxTypes.indexOf(invoiceItem.taxType) === -1) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvoiceItems.taxType", genReadableKeys("TAX_TYPE"));
              return false;
            }
          });
          if (errorMsg !== "") {
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }

          if (opts.hasOwnProperty("DelayDay")) {
            if (!Number.isInteger(opts.DelayDay)) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DelayDay", "Integer");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
            if (opts.DelayDay < 0 || opts.DelayDay > 15) {
              errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DelayDay", "0 ~ 15");
              return {
                v: sendErrorResponse(errorMsg, callback)
              };
            }
          }

          if (!opts.hasOwnProperty("InvType")) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "InvType");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          if (typeof opts.InvType !== "string") {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "InvType", "string");
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
          var InvTypes = getObjectValues(_constants2.default.INV_TYPE);
          if (InvTypes.indexOf(opts.InvType) === -1) {
            errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ClearanceMark", genReadableKeys("INV_TYPE"));
            return {
              v: sendErrorResponse(errorMsg, callback)
            };
          }
        }();

        if ((typeof _ret2 === "undefined" ? "undefined" : _typeof(_ret2)) === "object") return _ret2.v;
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;
      var paymentButton = opts.PaymentButton;
      delete opts.PaymentButton;
      var target = opts.Target || "_self";
      delete opts.Target;

      // 商品名稱
      var items = [];
      opts.Items.forEach(function (item) {
        items.push(item.name + " " + item.price + " " + item.currency + " x " + item.quantity);
      });
      delete opts.Items;

      var itemObj = { ItemName: items.join("#").substr(0, 200) };
      var invoiceItemObj = {};

      if (opts.InvoiceMark === _constants2.default.INVOICE_MARK.YES) {
        (function () {
          // 客戶名稱
          invoiceItemObj.CustomerName = urlEncode(opts.CustomerName || "");

          // 客戶地址
          invoiceItemObj.CustomerAddr = urlEncode(opts.CustomerAddr || "");

          // 客戶電子信箱
          invoiceItemObj.CustomerEmail = urlEncode(opts.CustomerEmail || "");

          var itemNames = [];
          var itemCounts = [];
          var itemWords = [];
          var itemPrices = [];
          var itemTaxTypes = [];
          opts.InvoiceItems.forEach(function (item) {
            itemNames.push(urlEncode(item.name));
            itemCounts.push(item.count);
            itemWords.push(urlEncode(item.word));
            itemPrices.push(item.price);
            itemTaxTypes.push(item.taxType);
          });
          delete opts.InvoiceItems;

          // 商品名稱
          invoiceItemObj.InvoiceItemName = itemNames.join("|");

          // 商品數量
          invoiceItemObj.InvoiceItemCount = itemCounts.join("|");

          // 商品單位
          invoiceItemObj.InvoiceItemWord = itemWords.join("|");

          // 商品價格
          invoiceItemObj.InvoiceItemPrice = itemPrices.join("|");

          // 商品課稅別
          invoiceItemObj.InvoiceItemTaxType = itemTaxTypes.join("|");

          // 備註
          invoiceItemObj.InvoiceRemark = urlEncode(opts.InvoiceRemark || "");

          // 延遲天數
          invoiceItemObj.DelayDay = opts.DelayDay || 0;
        })();
      }

      var data = Object.assign({
        MerchantID: CONFIG.merchantID,
        PaymentType: "aio"
      }, opts, itemObj, invoiceItemObj);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      // 產生表單資料
      var html = '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
      html += "<form id=\"_allpayForm\" method=\"post\" target=\"" + target + "\" action=\"" + serviceUrl + "\">";
      Object.keys(data).forEach(function (key) {
        html += "<input type=\"hidden\" name=\"" + key + "\" value=\"" + data[key] + "\" />";
      });
      if (paymentButton && paymentButton !== "") {
        html += "<input type=\"submit\" id=\"_paymentButton\" value=\"" + paymentButton + "\" />";
      } else {
        html += '<script type="text/javascript">document.getElementById("_allpayForm").submit();</script>';
      }
      html += "</form>";

      if (callback) {
        callback(undefined, {
          json: data,
          html: html
        });
      }
    }

    /**
     * 付款結果通知驗證
     *
     * @param {object} opts - 歐付寶回傳之付款結果
     */

  }, {
    key: "verifyCheckOutFeedback",
    value: function verifyCheckOutFeedback(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object" || !opts) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON");
        return sendErrorResponse(errorMsg, callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      var returnParams = {};
      Object.keys(opts).map(function (key) {
        if (key !== "CheckMacValue") {
          var value = opts[key];

          if (key === "PaymentType") {
            value = value.replace("_CVS", "");
            value = value.replace("_BARCODE", "");
            value = value.replace("_Alipay", "");
            value = value.replace("_Tenpay", "");
            value = value.replace("_CreditCard", "");
          } else if (key === "PeriodType") {
            value = value.replace("Y", "Year");
            value = value.replace("M", "Month");
            value = value.replace("D", "Day");
          }

          returnParams[key] = value;
        }
      });

      if (!this.isDataValid(opts)) {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.checkMacValueVerifyFail), callback);
      }

      if (callback) {
        callback(undefined, returnParams);
      }
    }

    /**
     * 訂單查詢
     *
     * @param {object} opts - 訂單查詢相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "queryTradeInfo",
    value: function queryTradeInfo(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.hasOwnProperty("PlatformID")) {
        if (typeof opts.PlatformID !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformID", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformID.length > 10) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PlatformID", 10);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID,
        TimeStamp: Date.now()
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        callback: function (err, result) {
          if (callback) {
            if (err) {
              callback(err, result);
            } else {
              if (!this.isDataValid(result)) {
                return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.checkMacValueVerifyFail), callback);
              }

              callback(undefined, result);
            }
          }
        }.bind(this)
      });
    }

    /**
     * 信用卡定期定額訂單查詢
     *
     * @param {object} opts - 信用卡定期定額訂單查詢相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "queryCreditCardPeriodInfo",
    value: function queryCreditCardPeriodInfo(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID,
        TimeStamp: Date.now()
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        isJsonResponse: true,
        callback: callback
      });
    }

    /**
     * 信用卡關帳/退刷/取消/放棄
     *
     * @param {object} opts - 信用卡關帳/退刷/取消/放棄相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "doAction",
    value: function doAction(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("TradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.TradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "TradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "TradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("Action")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "Action");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.Action !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Action", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      var actionTypes = getObjectValues(_constants2.default.ACTION_TYPE);
      if (actionTypes.indexOf(opts.Action) === -1) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Action", genReadableKeys("ACTION_TYPE"));
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("TotalAmount")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TotalAmount");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Number.isInteger(opts.TotalAmount)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TotalAmount", "Integer");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TotalAmount <= 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TotalAmount", "greater than 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.hasOwnProperty("PlatformID")) {
        if (typeof opts.PlatformID !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformID", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformID.length > 10) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PlatformID", 10);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        callback: callback
      });
    }

    /**
     * 廠商通知退款
     *
     * @param {object} opts - 廠商通知退款相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "aioChargeback",
    value: function aioChargeback(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("TradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "TradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.TradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "TradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "TradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.TradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "TradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("ChargeBackTotalAmount")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ChargeBackTotalAmount");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Number.isInteger(opts.ChargeBackTotalAmount)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChargeBackTotalAmount", "Integer");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ChargeBackTotalAmount <= 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ChargeBackTotalAmount", "greater than 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.hasOwnProperty("Remark")) {
        if (typeof opts.Remark !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Remark", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.Remark.length > 100) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Remark", 100);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("PlatformID")) {
        if (typeof opts.PlatformID !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformID", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformID.length > 10) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PlatformID", 10);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        callback: callback
      });
    }

    /**
     * 廠商申請撥款/退款
     *
     * @param {object} opts - 廠商申請撥款/退款相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "capture",
    value: function capture(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MerchantTradeNo")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MerchantTradeNo !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MerchantTradeNo", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "MerchantTradeNo");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.MerchantTradeNo.length > 20) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "MerchantTradeNo", 20);
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("CaptureAMT")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "CaptureAMT");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Number.isInteger(opts.CaptureAMT)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CaptureAMT", "Integer");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.CaptureAMT < 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CaptureAMT", "greater than or equal to 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("UserRefundAMT")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "UserRefundAMT");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!Number.isInteger(opts.UserRefundAMT)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UserRefundAMT", "Integer");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.UserRefundAMT < 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UserRefundAMT", "greater than or equal to 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.CaptureAMT + opts.UserRefundAMT === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CaptureAMT + UserRefundAMT", "greater than 0");
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.UserRefundAMT > 0) {
        if (!opts.hasOwnProperty("UserName")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "UserName");
          return sendErrorResponse(errorMsg, callback);
        }
        if (typeof opts.UserName !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UserName", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.UserName.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "UserName");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.UserName.length > 20) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "UserName", 20);
          return sendErrorResponse(errorMsg, callback);
        }

        if (!opts.hasOwnProperty("UserCellPhone")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "UserCellPhone");
          return sendErrorResponse(errorMsg, callback);
        }
        if (typeof opts.UserCellPhone !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UserCellPhone", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.UserCellPhone.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "UserCellPhone");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.UserCellPhone.length > 20) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "UserCellPhone", 20);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("PlatformID") && opts.PlatformID !== "") {
        if (typeof opts.PlatformID !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformID", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformID.length > 10) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "PlatformID", 10);
          return sendErrorResponse(errorMsg, callback);
        }
      } else {
        if (opts.hasOwnProperty("UpdatePlatformChargeFee")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "UpdatePlatformChargeFee");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.hasOwnProperty("PlatformChargeFee")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "PlatformChargeFee");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("UpdatePlatformChargeFee")) {
        if (typeof opts.UpdatePlatformChargeFee !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UpdatePlatformChargeFee", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (["N", "Y"].indexOf(opts.UpdatePlatformChargeFee) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "UpdatePlatformChargeFee", "N or Y");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.UpdatePlatformChargeFee === "Y") {
        if (!opts.hasOwnProperty("PlatformChargeFee")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "PlatformChargeFee");
          return sendErrorResponse(errorMsg, callback);
        }
        if (!Number.isInteger(opts.PlatformChargeFee)) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformChargeFee", "Integer");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.PlatformChargeFee < 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformChargeFee", "greater than or equal to 0");
          return sendErrorResponse(errorMsg, callback);
        }
      } else {
        if (opts.hasOwnProperty("PlatformChargeFee")) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.removeParameter, "PlatformChargeFee");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("Remark")) {
        if (typeof opts.Remark !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Remark", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.Remark.length > 30) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.reachMaxLength, "Remark", 30);
          return sendErrorResponse(errorMsg, callback);
        }
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        callback: callback
      });
    }

    /**
     * 下載廠商對帳媒體檔
     *
     * @param {object} opts - 下載廠商對帳媒體檔相關參數
     * @param {requestCallback} callback - 處理回應的 callback
     */

  }, {
    key: "downloadAioPaymentMedia",
    value: function downloadAioPaymentMedia(opts) {
      var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      errorMsg = "";

      // 參數檢查
      if ((typeof opts === "undefined" ? "undefined" : _typeof(opts)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"), callback);
      }

      if (callback !== undefined) {
        if (typeof callback !== "function") {
          return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "callback", "function"), callback);
        }
      }

      if (!opts.hasOwnProperty("ServiceURL")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.ServiceURL !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "ServiceURL", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (opts.ServiceURL.length === 0) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "ServiceURL");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("DateType")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "DateType");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.DateType !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DateType", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      var dateTypes = getObjectValues(_constants2.default.TRADE_DATE_TYPE);
      if (dateTypes.indexOf(opts.DateType) === -1) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "DateType", genReadableKeys("TRADE_DATE_TYPE"));
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("BeginDate")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "BeginDate");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.BeginDate !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "BeginDate", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.BeginDate)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "BeginDate");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("EndDate")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "EndDate");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.EndDate !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "EndDate", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.EndDate)) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.wrongDataFormat, "EndDate");
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("MediaFormated")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "MediaFormated");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.MediaFormated !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MediaFormated", "string");
        return sendErrorResponse(errorMsg, callback);
      }
      var mediaFormats = getObjectValues(_constants2.default.MEDIA_FORMAT);
      if (mediaFormats.indexOf(opts.MediaFormated) === -1) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "MediaFormated", genReadableKeys("MEDIA_FORMAT"));
        return sendErrorResponse(errorMsg, callback);
      }

      if (!opts.hasOwnProperty("FilePath")) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.missingParameter, "FilePath");
        return sendErrorResponse(errorMsg, callback);
      }
      if (typeof opts.FilePath !== "string") {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "FilePath", "string");
        return sendErrorResponse(errorMsg, callback);
      }

      if (opts.hasOwnProperty("PaymentType")) {
        if (typeof opts.PaymentType !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentType", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var paymentTypes = getObjectValues(_constants2.default.PAYMENT_TYPE);
        if (paymentTypes.indexOf(opts.PaymentType) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentType", genReadableKeys("PAYMENT_TYPE"));
          return sendErrorResponse(errorMsg, callback);
        }

        // 若為全部時，忽略此參數
        if (opts.PaymentType === _constants2.default.PAYMENT_TYPE.ALL) {
          delete opts.PaymentType;
        }
      }

      if (opts.hasOwnProperty("PlatformStatus")) {
        if (typeof opts.PlatformStatus !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformStatus", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var platformStatuses = getObjectValues(_constants2.default.PLATFORM_STATUS);
        if (platformStatuses.indexOf(opts.PlatformStatus) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PlatformStatus", genReadableKeys("PLATFORM_STATUS"));
          return sendErrorResponse(errorMsg, callback);
        }

        // 若為全部時，忽略此參數
        if (opts.PlatformStatus === _constants2.default.PLATFORM_STATUS.ALL) {
          delete opts.PlatformStatus;
        }
      }

      if (opts.hasOwnProperty("PaymentStatus")) {
        if (typeof opts.PaymentStatus !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentStatus", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var paymentStatuses = getObjectValues(_constants2.default.PAYMENT_STATUS);
        if (paymentStatuses.indexOf(opts.PaymentStatus) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "PaymentStatus", genReadableKeys("PAYMENT_STATUS"));
          return sendErrorResponse(errorMsg, callback);
        }

        // 若為全部時，忽略此參數
        if (opts.PaymentStatus === _constants2.default.PAYMENT_STATUS.ALL) {
          delete opts.PaymentStatus;
        }
      }

      if (opts.hasOwnProperty("AllocateStatus")) {
        if (typeof opts.AllocateStatus !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "AllocateStatus", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        var allocateStatuses = getObjectValues(_constants2.default.ALLOCATE_STATUS);
        if (allocateStatuses.indexOf(opts.AllocateStatus) === -1) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "AllocateStatus", genReadableKeys("ALLOCATE_STATUS"));
          return sendErrorResponse(errorMsg, callback);
        }

        // 若為全部時，忽略此參數
        if (opts.AllocateStatus === _constants2.default.ALLOCATE_STATUS.ALL) {
          delete opts.AllocateStatus;
        }
      }

      if (opts.hasOwnProperty("CheckMacValue")) {
        if (typeof opts.CheckMacValue !== "string") {
          errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "CheckMacValue", "string");
          return sendErrorResponse(errorMsg, callback);
        }
        if (opts.CheckMacValue.length === 0) {
          errorMsg = genErrorMessage(ERROR_MESSAGE.cannotBeEmpty, "CheckMacValue");
          return sendErrorResponse(errorMsg, callback);
        }
      }

      var serviceUrl = opts.ServiceURL;
      delete opts.ServiceURL;

      var filePath = opts.FilePath;
      delete opts.FilePath;

      var data = Object.assign({
        MerchantID: CONFIG.merchantID
      }, opts);

      // 檢查碼
      if (!opts.hasOwnProperty("CheckMacValue")) {
        data.CheckMacValue = this.genCheckMacValue(data);
      }

      sendRequest({
        method: _constants2.default.HTTP_METHOD.HTTP_POST,
        serviceUrl: serviceUrl,
        data: data,
        downloadable: true,
        filePath: filePath,
        callback: callback
      });
    }

    /**
     * 產生交易檢查碼
     *
     * @param {Object} data - 交易資料
     * @param {string} encryptType - 加密類型
     */

  }, {
    key: "genCheckMacValue",
    value: function genCheckMacValue(data) {
      errorMsg = "";

      if ((typeof data === "undefined" ? "undefined" : _typeof(data)) !== "object") {
        return sendErrorResponse(genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "Parameter", "JSON"));
      }

      var encryptTypes = getObjectValues(_constants2.default.ENCRYPT_TYPE);

      if (data.hasOwnProperty("EncryptType") && encryptTypes.indexOf(data.EncryptType) === -1) {
        errorMsg = genErrorMessage(ERROR_MESSAGE.parameterShouldBe, "EncryptType", genReadableKeys("ENCRYPT_TYPE"));
        return sendErrorResponse(errorMsg);
      }

      // 若有 CheckMacValue 則先移除
      if (data.hasOwnProperty("CheckMacValue")) {
        delete data.CheckMacValue;
      }

      var hashKey = data.hashKey || CONFIG.hashKey;
      var hashIV = data.hashIV || CONFIG.hashIV;

      if (data.hasOwnProperty("hashKey")) {
        delete data.hashKey;
      }

      if (data.hasOwnProperty("hashIV")) {
        delete data.hashIV;
      }

      // 使用物件 key 排序資料
      var keys = Object.keys(data).sort(function (s1, s2) {
        var s1lower = s1.toLowerCase();
        var s2lower = s2.toLowerCase();

        return s1lower > s2lower ? 1 : s1lower < s2lower ? -1 : 0;
      });
      var uri = keys.map(function (key) {
        return key + "=" + data[key];
      }).join("&");

      uri = "HashKey=" + hashKey + "&" + uri + "&HashIV=" + hashIV;

      log("==================================================");
      log("The data below will be used to generate CheckMacValue");
      log("==================================================");
      log(uri);

      uri = urlEncode(uri);
      uri = uri.toLowerCase();

      var checksum = _crypto2.default.createHash(data.EncryptType === _constants2.default.ENCRYPT_TYPE.SHA256 ? "SHA256" : "MD5").update(uri).digest("hex").toUpperCase();

      log("==================================================");
      log("Generated CheckMacValue");
      log("==================================================");
      log(checksum);

      return checksum;
    }

    /**
     * 驗證資料正確性
     *
     * @param {Object} data - 待驗證資料
     * @param {string} encryptType - 加密類型
     */

  }, {
    key: "isDataValid",
    value: function isDataValid(data) {
      log("==================================================");
      log("Start to verify the following data");
      log("==================================================");
      log(data);

      var receivedCheckMacValue = data.CheckMacValue;
      var generatedCheckMacValue = this.genCheckMacValue(data);
      var isMatched = receivedCheckMacValue === generatedCheckMacValue;

      log("Verify Result: " + (isMatched ? "Match" : "Not match"));

      return isMatched;
    }
  }]);

  return Allpay;
}();

/**
 * 將資料編碼成與 .Net UrlEncode 相符的格式
 *
 * @param {string} value - 待編碼資料
 * @private
 */


function urlEncode(value) {
  log("==================================================");
  log("Data before urlEncode");
  log("==================================================");
  log(value);

  if (value === "") {
    return value;
  }

  var find = ["~", "%20", "'"];
  var replace = ["%7E", "+", "%27"];
  var encodedData = encodeURIComponent(value);

  find.forEach(function (encodedChar, index) {
    var regex = new RegExp(encodedChar, "g");
    encodedData = encodedData.replace(regex, replace[index]);
  });

  log("==================================================");
  log("Data after urlEncode");
  log("==================================================");
  log(encodedData);

  return encodedData;
}

/**
 * 發送 HTTP/HTTPS 請求
 *
 * @param {string} method - HTTP 方法
 * @param {string} serviceUrl - API 介接路徑
 * @param {object} data - 資料
 * @param {requestCallback} callback - 處理回應的 callback
 * @private
 */
function sendRequest(_ref2) {
  var method = _ref2.method;
  var serviceUrl = _ref2.serviceUrl;
  var data = _ref2.data;
  var _ref2$isJsonResponse = _ref2.isJsonResponse;
  var isJsonResponse = _ref2$isJsonResponse === undefined ? false : _ref2$isJsonResponse;
  var _ref2$downloadable = _ref2.downloadable;
  var downloadable = _ref2$downloadable === undefined ? false : _ref2$downloadable;
  var _ref2$filePath = _ref2.filePath;
  var filePath = _ref2$filePath === undefined ? "" : _ref2$filePath;
  var callback = _ref2.callback;

  if (!CONFIG.isInitialized) {
    throw ERROR_MESSAGE.initializeRequired;
  }

  log("==================================================");
  log("The data below will be sent");
  log("==================================================");
  log(data);

  var urlParser = _url2.default.parse(serviceUrl);
  var host = urlParser.hostname;
  var port = urlParser.port ? urlParser.port : urlParser.protocol === "http:" ? "80" : "443";
  var path = urlParser.path;
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };
  var dataString = _querystring2.default.stringify(data);

  // 使用 POST 時設定 Content-Length 標頭
  if (method === _constants2.default.HTTP_METHOD.HTTP_POST) {
    headers["Content-Length"] = dataString.length;
  } else {
    path = path + "?" + dataString;
  }

  var options = {
    host: host,
    port: port,
    path: path,
    method: method,
    headers: headers
  };

  var request = void 0;
  if (urlParser.protocol === "http:") {
    request = _http2.default.request(options);
  } else {
    request = _https2.default.request(options);
  }

  log("==================================================");
  log("HTTP/HTTPS request options");
  log("==================================================");
  log(options);

  if (method === _constants2.default.HTTP_METHOD.HTTP_POST) {
    log("==================================================");
    log("Send request");
    log("==================================================");
    log(dataString);
    request.write(dataString);
  }

  request.end();

  var chunks = [];
  request.on("response", function (response) {
    response.on("data", function (chunk) {
      chunks.push(chunk);
    });

    response.on("end", function () {
      var responseData = void 0;
      var buffer = Buffer.concat(chunks).toString('utf8');

      log("==================================================");
      log("Response data");
      log("==================================================");
      log(buffer);

      if (callback) {
        var err = undefined;

        // 另外處理非 JSON 物件的返回值
        if (isJsonResponse) {
          try {
            responseData = JSON.parse(buffer);
          } catch (error) {
            log("==================================================");
            log("Could not convert API response to JSON, the error below is ignored and raw API response is returned to client");
            log("==================================================");
            log(error);
            err = error;
          }
        } else {
          if (response.statusCode === 200) {
            if (downloadable) {
              var isWindows = /^win/.test(process.platform);
              var csvData = void 0;

              // 只在作業系統不是 Windows 時將 Big5 編碼內容轉換為 UTF-8
              if (isWindows) {
                csvData = Buffer.concat(chunks);
              } else {
                csvData = _iconvLite2.default.decode(Buffer.concat(chunks), 'Big5');
              }

              // 寫入實體檔案
              try {
                _fs2.default.writeFileSync(filePath, csvData);
              } catch (error) {
                return sendErrorResponse(error, callback);
              }
            } else {
              if (/^\d{1}\|.+$/.test(buffer)) {
                if (buffer === "1|OK") {
                  var _buffer$split = buffer.split("|");

                  var _buffer$split2 = _slicedToArray(_buffer$split, 2);

                  var returnCode = _buffer$split2[0];
                  var returnMessage = _buffer$split2[1];

                  responseData = {
                    RtnCode: returnCode,
                    RtnMsg: returnMessage
                  };
                } else {
                  errorMsg = buffer.replace("-", ": ");
                  return sendErrorResponse(errorMsg, callback);
                }
              } else {
                responseData = {};
                var responseArr = buffer.split("&");
                responseArr.forEach(function (param) {
                  var _param$split = param.split("=");

                  var _param$split2 = _slicedToArray(_param$split, 2);

                  var key = _param$split2[0];
                  var value = _param$split2[1];

                  responseData[key] = value;
                });
              }
            }
          } else {
            err = response.statusCode;
          }
        }

        callback(err, responseData);
      }
    });

    response.on("close", function (err) {
      log("==================================================");
      log("Problem with API request detailed stacktrace below");
      log("==================================================");
      log(err);
      sendErrorResponse(err, callback);
    });
  });

  request.on("error", function (err) {
    log("==================================================");
    log("Problem with API request detailed stacktrace below");
    log("==================================================");
    log(err);
    sendErrorResponse(err, callback);
  });
}

/**
 * 返回或拋出錯誤回應
 *
 * @param {requestCallback} callback - 處理回應的 callback
 * @param {Object} err - 錯誤物件
 * @param {Object} returnData - 回應資料
 * @private
 */
function sendErrorResponse(err) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];
  var returnData = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

  var error = void 0;
  if (err instanceof Error) {
    error = err;
  } else {
    error = new Error(err);
  }

  if (callback) {
    callback(error, returnData);
  } else {
    throw error;
  }
}

/**
 * 訊息紀錄
 *
 * @param {Object} message - 訊息物件
 * @private
 */
function log(message) {
  if (message instanceof Error) {
    console.log(message.stack);
  }

  if (CONFIG.debug) {
    if ((typeof message === "undefined" ? "undefined" : _typeof(message)) === "object") {
      console.log(JSON.stringify(message, null, 2));
    } else {
      console.log(message);
    }
  }
}

/**
 * 格式化錯誤訊息
 *
 * @param {string} template - 格式化字串
 * @param {string[]} values - 欲帶入格式化字串的資料
 * @private
 */
function genErrorMessage(template) {
  for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    values[_key - 1] = arguments[_key];
  }

  return _util2.default.format.apply(_util2.default, [template].concat(values));
}

/**
 * 取得 JSON 物件內所有值
 *
 * @param {Object} obj - JSON 格式物件
 * @private
 */
function getObjectValues(obj) {
  return Object.keys(obj).map(function (key) {
    return obj[key];
  });
}

/**
 * 將物件轉換為可讀性較好之字串，用於輸出錯誤訊息
 *
 * @param {string} objName - 物件名稱
 * @private
 */
function genReadableKeys(objName) {
  var arr = Object.keys(_constants2.default[objName]).map(function (key) {
    return "Allpay.CONSTANTS." + objName + "." + key;
  });

  var str = arr.join(", ");
  var position = str.lastIndexOf(", ");
  return str.substr(0, position) + ' or ' + str.substr(position + 2);
}

module.exports = Allpay;