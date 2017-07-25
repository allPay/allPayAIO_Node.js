/**
 * Created by ying.wu on 2017/6/27.
 */
 // 開立折讓
const opay_invoice = require('../lib/opay_invoice.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	InvoiceNo:"TQ00000182", // 發票號碼，長度為10字元
	AllowanceNotify:"E", // 通知類別
	CustomerName:"", // 客戶名稱
	NotifyPhone:"0922652130", // 通知手機號碼
	NotifyMail:"ying.wu@ecpay.com.tw", // 通知電子信箱
	AllowanceAmount:"300", // 折讓單總金額
	ItemName:"洗衣精", // 商品名稱，如果超過一樣商品時請以｜分隔
	ItemCount:"3", // 商品數量，如果超過一樣商品時請以｜分隔
	ItemWord:"瓶", // 商品單位，如果超過一樣商品時請以｜分隔
	ItemPrice:"100", // 商品價格，如果超過一樣商品時請以｜分隔
	ItemTaxType:"3", // 商品課稅別，如果超過一樣商品時請以｜分隔
	ItemAmount:"300" // 商品合計，如果超過一樣商品時請以｜分隔
};

let create = new opay_invoice();
let res = create.invoice_client.opay_invoice_allowance(parameters = base_param);
res.then(function (result) {
    console.log(result);
}).catch(function (err) {
    console.log(err);
});