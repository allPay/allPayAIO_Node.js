// 付款結果通知範例

var Allpay = require("allpay");
var allpay = new Allpay({
  // 測試用 MerchantID，請自行帶入 AllPay 提供的 MerchantID
  merchantID: "2000214",
  // 測試用 Hashkey，請自行帶入 AllPay 提供的 HashKey
  hashKey: "5294y06JbISpM5x9",
  // 測試用 HashIV，請自行帶入 AllPay 提供的 HashIV
  hashIV: "v77hoKGq4kWxNNIS"
});

// 測試用付款結果
var feedbackData = {
  MerchantID: '2000214',
  MerchantTradeNo: 'TS20160619000001',
  PayAmt: '100',
  PaymentDate: '2016/06/19 14:23:00',
  PaymentType: 'WebATM_TAISHIN',
  PaymentTypeChargeFee: '1',
  RedeemAmt: '0',
  RtnCode: '1',
  RtnMsg: '交易成功',
  SimulatePaid: '0',
  TradeAmt: '100',
  TradeDate: '2016/06/19 14:22:58',
  TradeNo: '1606191422583352',
  CheckMacValue: 'C0D4189820ECEEF4BE9B914549CBD61D'
};

// 驗證結果，計算並比對 CheckMacValue 確保資料正確性
allpay.verifyCheckOutFeedback(feedbackData, function(err, result) {
  if (err) {
    // 錯誤處理
  } else {
    // 後續資料處理
  }
});
