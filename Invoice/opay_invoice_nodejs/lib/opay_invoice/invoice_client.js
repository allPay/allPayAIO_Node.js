/**
 * Created by ying.wu on 2017/6/21.
 */
const helper = require('./helper.js');
const verify = require('./verification.js');
const OPayError = require('./error.js');
const iconv = require('iconv-lite');
const crypto = require('crypto');
const url = require('url');
const querystring = require('querystring');
const http = require('http');
const https = require('https');

class InvoiceClient{
    constructor(){
        this.helper = new helper();
    }

    opay_invoice_issue(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        parameters['CarruerNum'] = parameters['CarruerNum'].replace(/\+/g," ");
        let res = this._invoice_pos_proc(parameters, 'InvoiceIssue');
        return res;
    }

    opay_invoice_delay(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        parameters['CarruerNum'] = parameters['CarruerNum'].replace(/\+/g," ");
        parameters['PayType'] = '3';
        parameters['PayAct'] = 'ALLPAY';
        let res = this._invoice_pos_proc(parameters, 'InvoiceDelayIssue');
        return res;
    }

    opay_invoice_trigger(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        parameters['PayType'] = '3';
        let res = this._invoice_pos_proc(parameters, 'InvoiceTriggerIssue');
        return res;
    }

    opay_invoice_allowance(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        let res = this._invoice_pos_proc(parameters, 'InvoiceAllowance');
        return res;
    }

    opay_invoice_issue_invalid(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        let res = this._invoice_pos_proc(parameters, 'InvoiceIssueInvalid');
        return res;
    }

    opay_invoice_allowance_invalid(parameters){
        this._invoice_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        let res = this._invoice_pos_proc(parameters, 'InvoiceAllowanceInvalid');
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _invoice_base_proc(params, inv, unsupport_param, pay_method){
        if (params.constructor === Object){
            params['MerchantID'] = this.helper.get_mercid();
        } else {
            throw new OPayError.OPayInvalidParam(`Received parameter object must be a Object.`);
        }
    }

    _invoice_pos_proc(params, apiname){
        let verify_invoice_api = new verify.InvoiceParamVerify(apiname);
        let exclusive_list = [];
        if (apiname === 'InvoiceIssue') {
            exclusive_list = ['InvoiceRemark', 'ItemName', 'ItemRemark', 'ItemWord'];
            verify_invoice_api.verify_inv_issue_param(params);
        } else if (apiname === 'InvoiceDelayIssue') {
            exclusive_list = ['InvoiceRemark', 'ItemName', 'ItemWord'];
            verify_invoice_api.verify_inv_delay_param(params);
        } else if (apiname === 'InvoiceTriggerIssue') {
            exclusive_list = [];
            verify_invoice_api.verify_inv_trigger_param(params);
        } else if (apiname === 'InvoiceAllowance') {
            exclusive_list = ['ItemName', 'ItemWord'];
            verify_invoice_api.verify_inv_allowance_param(params);
        } else if (apiname === 'InvoiceIssueInvalid') {
            exclusive_list = ['Reason'];
            verify_invoice_api.verify_inv_issue_invalid_param(params);
        } else if (apiname === 'InvoiceAllowanceInvalid') {
            exclusive_list = ['Reason'];
            verify_invoice_api.verify_inv_allowance_invalid_param(params);
        }
        // for exclusive_list
        let exclusive_ele = {};
        exclusive_list.forEach(function (param) {
           exclusive_ele[param] = params[param];
           delete params[param];
        });

        // encode special param
        let sp_param = verify_invoice_api.get_special_encode_param(apiname);
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        // console.log(params);
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;

        exclusive_list.forEach(function (param) {
           params[param] = exclusive_ele[param];
        });

        sp_param.forEach(function (key) {
           params[key] = decodeURIComponent(params[key]);
        });

        console.log(params);

        // gen post html
        let api_url = verify_invoice_api.get_svc_url(apiname, this.helper.get_op_mode());
        // post from server
        let resp = this.helper.http_request('POST', api_url, params);
        // return post response
        return new Promise((resolve, reject) => {
            resp.then(function (result) {
                return resolve(iconv.decode(Buffer.concat(result), 'utf-8'));
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}
module.exports = InvoiceClient;