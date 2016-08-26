// 廠商通知退款範例

var Allpay = require("allpay");
var allpay = new Allpay({
  // 測試用 MerchantID，請自行帶入 AllPay 提供的 MerchantID
  merchantID: "2000214",
  // 測試用 Hashkey，請自行帶入 AllPay 提供的 HashKey
  hashKey: "5294y06JbISpM5x9",
  // 測試用 HashIV，請自行帶入 AllPay 提供的 HashIV
  hashIV: "v77hoKGq4kWxNNIS"
});

allpay.aioChargeback({
  // 服務位置
  ServiceURL: "https://payment-stage.allpay.com.tw//Cashier/AioChargeback",
  // 廠商交易編號
  MerchantTradeNo: "TS20160622900004",
  // allpay 的交易編號
  TradeNo: "1606220931009299",
  // 退款金額
  ChargeBackTotalAmount: 500,
  // 檢查碼，SDK 會依照帶入資料自行計算，若要使用自行算出的數值才需帶入
  // CheckMacValue: "",
  // 備註欄位
  // Remark: "",
  // 特約合作平台商代號
  // PlatformID: ""
}, function(err, result) {
  if (err) {
    // 錯誤處理
  } else {
    // 後續資料處理
  }
});
