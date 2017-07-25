/**
 * Created by ying.wu on 2017/6/27.
 */
 // 發送發票通知
const opay_invoice = require('../lib/opay_invoice.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	InvoiceNo:"TQ00000184", // 發票號碼，長度為10字元，必填欄位
	AllowanceNo:"", // 折讓號碼，長度為16字元，當InvoiceTag為'A' 或 'AI'時為必填
	Phone:"0922652130", // 發送簡訊號碼，長度為20字元，當Notify為'S' 或 'A'時為必填
	NotifyMail:"ying.wu@allpay.com.tw", // 發送電子郵件，長度為80字元，當Notify為'E' 或 'A'時為必填
	Notify:"A", // 發送方式，僅可帶入'S'、'E'、'A'
	InvoiceTag:"II", // 發送內容類型，僅可帶入'I'、'II'、'A'、'AI'、'AW'
	Notified:"A" // 發送對象，僅可帶入'C'、'M'、'A'
};

let create = new opay_invoice();
let res = create.notify_client.opay_invoice_notify(parameters = base_param);
res.then(function (result) {
    console.log(result);
}).catch(function (err) {
    console.log(err);
});