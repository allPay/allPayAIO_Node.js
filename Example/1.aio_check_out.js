// 訂單產生並開立電子發票範例

var Allpay = require("allpay");
var allpay = new Allpay({
  // 測試用 MerchantID，請自行帶入 AllPay 提供的 MerchantID
  merchantID: "2000214",
  // 測試用 Hashkey，請自行帶入 AllPay 提供的 HashKey
  hashKey: "5294y06JbISpM5x9",
  // 測試用 HashIV，請自行帶入 AllPay 提供的 HashIV
  hashIV: "v77hoKGq4kWxNNIS"
});

allpay.aioCheckOut({
  // 服務位置
  ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2",
  // 表單送出按鈕要呈現的字樣，不帶此參數時表單會自動送出
  // PaymentButton: "送出",
  // 廠商交易編號
  MerchantTradeNo: "TS20160622900002",
  // 廠商交易時間
  MerchantTradeDate: "2016/06/22 02:00:00",
  // 交易金額
  TotalAmount: 100,
  // 交易描述
  TradeDesc: "Hello World 網路商城",
  // 訂單商品資料
  Items: [{
    name: "德國原裝進口自動鉛筆",
    price: 60,
    currency: "元",
    quantity: 1,
  }, {
    name: "橡皮擦",
    price: 20,
    currency: "元",
    quantity: 2,
  }],
  // 付款完成通知回傳網址
  ReturnURL: "http://localhost/receive",
  // 付款方式: 不指定
  ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL,
  // 檢查碼，SDK 會依照帶入資料自行計算，若要使用自行算出的數值才需帶入
  // CheckMacValue: "",
  // 電子發票開立註記
  InvoiceMark: Allpay.CONSTANTS.INVOICE_MARK.YES,
  // 廠商自訂編號
  RelateNumber: "TS20160622900002",
  // 客戶手機號碼
  CustomerPhone: "0987654321",
  // 課稅類別: 應稅
  TaxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
  // 載具類別: 無載具
  CarruerType: Allpay.CONSTANTS.CARRIER_TYPE.NONE,
  // 捐贈註記: 不捐贈
  Donation: Allpay.CONSTANTS.DONATION.NO,
  // 列印註記: 不列印
  Print: Allpay.CONSTANTS.PRINT_MARK.NO,
  // 電子發票商品資料
  InvoiceItems: [{
    name: "德國原裝進口自動鉛筆",
    count: 1,
    word: "支",
    price: 60,
    taxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
  }, {
    name: "橡皮擦",
    count: 2,
    word: "個",
    price: 20,
    taxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
  }],
  // 字軌類別: 一般稅額
  InvType: Allpay.CONSTANTS.INV_TYPE.GENERAL
}, function(err, result) {
  if (err) {
    // 錯誤處理
  } else {
    // 使用 result.html 即可取得 HTML 表單資料
  }
});
