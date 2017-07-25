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

class NotifyClient{
    constructor(){
        this.helper = new helper();
        // this.verify_notify_api = new verify.ActParamVerify();
    }

    opay_invoice_notify(parameters){
        this._notify_base_proc(parameters);
        parameters['TimeStamp'] = (parseInt(this._get_curr_unix_time()) + 120).toString();
        let res = this._notify_pos_proc(parameters, 'InvoiceNotify');
        return res;
    }

    _get_curr_unix_time(){
        return this.helper.get_curr_unixtime();
    }

    _notify_base_proc(params){
        if (params.constructor === Object){
            params['MerchantID'] = this.helper.get_mercid();
        } else {
            throw new OPayError.OPayInvalidParam(`Received parameter object must be a Object.`);
        }
    }

    _notify_pos_proc(params, apiname){
        let verify_notify_api = new verify.NotifyParamVerify(apiname);
        verify_notify_api.verify_notify_param(params);
        // encode special param
        let sp_param = verify_notify_api.get_special_encode_param(apiname);
        this.helper.encode_special_param(params, sp_param);

        // Insert chkmacval
        // console.log(params);
        let chkmac = this.helper.gen_chk_mac_value(params, 0);
        params['CheckMacValue'] = chkmac;
        params['NotifyMail'] = decodeURIComponent(params['NotifyMail']);
        // gen post html
        let api_url = verify_notify_api.get_svc_url(apiname, this.helper.get_op_mode());
        //post from server
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
module.exports = NotifyClient;