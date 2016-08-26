// 下載廠商對帳媒體檔範例

var fs = require("fs");
var Allpay = require("allpay");
var allpay = new Allpay({
  // 測試用 MerchantID，請自行帶入 AllPay 提供的 MerchantID
  merchantID: "2000214",
  // 測試用 Hashkey，請自行帶入 AllPay 提供的 HashKey
  hashKey: "5294y06JbISpM5x9",
  // 測試用 HashIV，請自行帶入 AllPay 提供的 HashIV
  hashIV: "v77hoKGq4kWxNNIS"
});


allpay.downloadAioPaymentMedia({
  // 服務位置
  ServiceURL: "https://vendor-stage.allpay.com.tw/PaymentMedia/TradeNoAio",
  // 查詢日期類別: 付款日期
  DateType: Allpay.CONSTANTS.TRADE_DATE_TYPE.PAYMENT,
  // 查詢開始日期
  BeginDate: "2016-06-21",
  // 查詢結束日期
  EndDate: "2016-06-21",
  // CSV 格式: 新版
  MediaFormated: Allpay.CONSTANTS.MEDIA_FORMAT.NEW,
  // 儲存檔案的實體路徑(含檔名)
  FilePath: "/tmp/aio_payment_media.csv",
  // 付款方式: 信用卡付費
  // PaymentType: Allpay.CONSTANTS.PAYMENT_TYPE.CREDIT,
  // 訂單類型: 一般
  // PlatformStatus: Allpay.CONSTANTS.PLATFORM_STATUS.GENERAL,
  // 付款狀態: 已付款
  // PaymentStatus: Allpay.CONSTANTS.PAYMENT_STATUS.PAID,
  // 撥款狀態: 已撥款
  // AllocateStauts: Allpay.CONSTANTS.ALLOCATE_STAUTS.APPROPRIATIONS,
  // 檢查碼，SDK 會依照帶入資料自行計算，若要使用自行算出的數值才需帶入
  // CheckMacValue: ""
}, function(err) {
  if (err) {
    // 錯誤處理
  }
});
