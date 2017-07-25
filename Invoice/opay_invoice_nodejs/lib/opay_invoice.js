/**
 * Created by ying.wu on 2017/7/10.
 */
const version = require('./opay_invoice/version.js');
const invoice_client = require('./opay_invoice/invoice_client.js');
const query_client = require('./opay_invoice/query_client.js');
const notify_client = require('./opay_invoice/notify_client.js');

class OPayInvoice{
    constructor(){
        this.version = new version();
        this.invoice_client = new invoice_client();
        this.query_client = new query_client();
        this.notify_client = new notify_client();
    }
}
module.exports = OPayInvoice;