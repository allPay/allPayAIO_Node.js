/**
 * Created by ying.wu on 2017/6/27.
 */
 // 愛心碼碼驗證
const opay_invoice = require('../lib/opay_invoice.js');
// 參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
let base_param = {
	LoveCode:"329580" // 愛心碼，長度為7字元
};

let create = new opay_invoice();
let res = create.query_client.opay_query_check_love_code(parameters = base_param);
res.then(function (result) {
    console.log(result);
}).catch(function (err) {
    console.log(err);
});