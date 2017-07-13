/**
 * Created by ying.wu on 2017/6/27.
 */
const opay_payment = require('../lib/opay_payment.js');
//參數值為[PLEASE MODIFY]者，請在每次測試時給予獨特值
//若要測試非必帶參數請將base_param內註解的參數依需求取消註解 //
let base_param = {
    PayDateType: 'close',
    StartDate: 'PLEASE MODIFY', //日期格式為「yyyy-MM-dd」, ex: 2017-02-12
    EndDate: 'PLEASE MODIFY' //日期格式為「yyyy-MM-dd」, ex: 2017-02-12
};

let query = new opay_payment();
let res = query.query_client.query_credit_csv(parameters = base_param);
res.then(function (result) {
    console.log(result);
}).catch(function (err) {
    console.log(err);
});