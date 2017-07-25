/**
 * Created by ying.wu on 2017/6/12.
 */
const OPayError = require('./error.js');
const fs = require('fs');
const et = require('elementtree');

class InvoiceVerifyBase{
    constructor(){
        this.param_xml_file = fs.readFileSync(__dirname + '/../../lib/opay_invoice/OPayInvoice.xml').toString();
        this.param_xml = et.parse(this.param_xml_file);
    }

    get_svc_url(apiname, mode){
        let url = this.param_xml.findtext(`./${apiname}/ServiceAddress/url[@type=\"${mode}\"]`);
        return url;
    }

    get_special_encode_param(apiname){
        let ret = [];
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@urlencode=\"1\"]`);
        // console.log(node);
        node.forEach(function (elem) {
            // console.log(elem.attrib.name);
            ret.push(elem.attrib.name);
        });
        return ret;
    }

    get_basic_params(apiname){
        let basic_param = [];
        this.param_xml.findall(`./${apiname}/Parameters/param[@require=\"1\"]`).forEach(function (elem) {
           // console.log(elem.attrib.name);
           basic_param.push(elem.attrib.name);
        });
        return basic_param;
    }

    get_cond_param(apiname){
        let aio_sw_param = [];
        let conditional_param = {};
        this.param_xml.findall(`./${apiname}/Config/switchparam/n`).forEach(function (elem) {
           // console.log(elem.text);
           aio_sw_param.push(elem.text);
        });
        let param_xml = this.param_xml;
        aio_sw_param.forEach(function (pname) {
            let opt_param = {};
            let node = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${pname}\"]/condparam`);
            node.forEach(function (elem) {
               let opt = elem.attrib.owner;
               let params = [];
               param_xml.findall(`./${apiname}/Parameters//param[@name=\"${pname}\"]//condparam[@owner=\"${opt}\"]/param[@require="1"]`).forEach(function (pa) {
                  params.push(pa.attrib.name);
               });
               opt_param[opt] = params;
            });
            conditional_param[pname] = opt_param;
        });
        return conditional_param;
    }

    get_param_type(apiname){
        let param_type ={};
        this.param_xml.findall(`./${apiname}/Parameters//param`).forEach(function (elem) {
           param_type[elem.attrib.name] = elem.attrib.type;
        });
        return param_type;
    }

    get_opt_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"Opt\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let opt_elems = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//option`);
            // console.log(opt_elems);
            let opt = [];
            opt_elems.forEach(function (oe) {opt.push(oe.text);});
            // console.log(opt);
            pattern[opt_params] = opt;
        });
        if (apiname === 'AioCheckOut'){
            pattern['ChoosePayment'].splice(3, 13);
        }
        // console.log(pattern);
        return pattern;
    }

    get_int_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"Int\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let mode = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//mode`);
            let mx = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//maximum`);
            let mn = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//minimal`);
            // console.log(mode);
            let arr = [];
            mode.forEach(function (md) {arr.push(md.text);});
            mx.forEach(function (mx) {arr.push(mx.text);});
            mn.forEach(function (mn) {arr.push(mn.text);});
            // console.log(arr);
            pattern[opt_params] = arr;
        });
        if (apiname === 'AioCheckOut'){
            pattern['StoreExpireDate'].splice(1, 2);
            pattern['StoreExpireDate'].splice(2, 1);
        }
        // console.log(pattern);
        return pattern;
    }

    get_str_param_pattern(apiname){
        let pattern = {};
        let temp_arr = [];
        let param_xml = this.param_xml;
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"String\"]`);
        node.forEach(function (param_elem) {
            temp_arr.push(param_elem.attrib.name);
        });
        // console.log(temp_arr);
        temp_arr.forEach(function (opt_params) {
            // console.log(opt_params);
            let pat_elems = param_xml.findall(`./${apiname}/Parameters//param[@name=\"${opt_params}\"]//pattern`);
            let arr = [];
            pat_elems.forEach(function (pa) {arr.push(pa.text);});
            // console.log(arr);
            pattern[opt_params] = arr.toString();
        });
        if (apiname === 'AioCheckOut'){
            pattern['InvoiceMark'] = '';
            pattern['PaymentInfoURL'] = pattern['PaymentInfoURL'].slice(11,21);
            pattern['ClientRedirectURL'] = pattern['ClientRedirectURL'].slice(11,21);
            pattern['Desc_1'] = pattern['Desc_1'].slice(10,20);
            pattern['Desc_2'] = pattern['Desc_2'].slice(10,20);
            pattern['Desc_3'] = pattern['Desc_3'].slice(10,20);
            pattern['Desc_4'] = pattern['Desc_4'].slice(10,20);
        }
        // console.log(pattern);
        return pattern;
    }

    get_depopt_param_pattern(apiname){
        let pattern = {};
        let param_xml = this.param_xml;
        let p_name, parent_name;
        let k, get_opts;
        let k_opts = [];
        let sub_opts = {};
        let parent_n_opts = {};
        let node = this.param_xml.findall(`./${apiname}/Parameters//param[@type=\"DepOpt\"]`);
        node.forEach(function (param_elem) {
            p_name = param_elem.attrib.name;
            parent_name = param_elem.attrib.main;
        });
        k = this.param_xml.findall(`./${apiname}/Parameters//param[@name=\"${p_name}\"]//mainoption`);
        k.forEach(function (elem) {
           k_opts.push(elem.attrib.name);
        });
        k_opts.forEach(function (elem) {
            get_opts = param_xml.findall(`./${apiname}/Parameters//mainoption[@name=\"${elem}\"]//option`);
            let opt = [];
            get_opts.forEach(function (c) {
                opt.push(c.text);
                sub_opts[elem] = opt;
            });
        });
        // console.log(sub_opts);
        parent_n_opts[parent_name] = sub_opts;
        // console.log(parent_n_opts);
        pattern[p_name] = parent_n_opts;
        // console.log(pattern['ChooseSubPayment']['ChoosePayment']['BARCODE']);
        return pattern;
    }

    get_all_pattern(apiname){
        let res = {};
        res['Type_idx'] = this.get_param_type(apiname);
        res['Int'] = this.get_int_param_pattern(apiname);
        res['String'] = this.get_str_param_pattern(apiname);
        res['Opt'] = this.get_opt_param_pattern(apiname);
        res['DepOpt'] = this.get_depopt_param_pattern(apiname);
        return res;
    }

    verify_param_by_pattern(params, pattern){
        // console.log(params);
        // console.log(pattern);
        let type_index = pattern['Type_idx'];
        console.log(type_index);
        Object.keys(params).forEach(function (p_name) {
           // console.log(p_name);
           let p_type = type_index[p_name];
           // console.log(p_type);
           let patt_container = pattern[p_type];
           // console.log(patt_container);
           switch (p_type) {
               case 'String':
                   let regex_patt = patt_container[p_name];
                   console.log(regex_patt);
                   let mat = params[p_name].match(new RegExp(regex_patt));
                   console.log(mat);
                   if (mat === null){
                       throw new OPayError.OPayInvalidParam(`Wrong format of param ${p_name} or length exceeded.`);
                   }
                   break;
               case 'Opt':
                   let aval_opt = patt_container[p_name];
                   let mat_opt = aval_opt.includes(params[p_name]);
                   if (mat_opt === false){
                       throw new OPayError.OPayInvalidParam(`Unexpected option of param ${p_name} (${params[p_name]}). Available option: (${aval_opt}).`);
                   }
                   break;
               case 'Int':
                   let criteria = patt_container[p_name];
                   // console.log('criteria: '+ criteria);
                   let mode = criteria[0];
                   let max = parseInt(criteria[1]);
                   let min = parseInt(criteria[2]);
                   let val = parseInt(params[p_name]);
                   // console.log('mode: '+ mode);
                   // console.log('max: '+  max);
                   // console.log('min: '+  min);
                   // console.log('val: '+  val);
                   switch (mode){
                       case 'BETWEEN':
                           if (val < min || val > max){
                               throw new OPayError.OPayInvalidParam(`Value of ${p_name} should be between ${min} and ${max}.`);
                           }
                           break;
                       case 'GE':
                           if (val < min){
                               throw new OPayError.OPayInvalidParam(`Value of ${p_name} should be greater than or equal to ${min}.`);
                           }
                           break;
                       case 'LE':
                           if (val > max){
                               throw new OPayError.OPayInvalidParam(`Value of ${p_name} should be less than or equal to ${max}.`);
                           }
                           break;
                       case 'EXCLUDE':
                           if (val >= max && val <= max){
                               throw new OPayError.OPayInvalidParam(`Value of ${p_name} can NOT be between ${min} and ${max}..`);
                           }
                           break;
                       default:
                           throw new OPayError.OPayInvalidParam(`Unexpected integer verification mode for parameter ${p_name}: ${mode}.`);
                   }
                   break;
               case 'DepOpt':
                   let dep_opt = patt_container[p_name];
                   let parent_param = Object.keys(dep_opt)[0];
                   let all_dep_opt = dep_opt[parent_param];
                   let parent_val = params[parent_param];
                   let aval_dopt = all_dep_opt[parent_val];
                   if (aval_dopt === null && pattern['Opt'][parent_param].includes(parent_val) === false){
                       throw new OPayError.OPayInvalidParam(`Cannot find available option of [${p_name}] by related param [${parent_param}](Value: ${parent_val}.`);
                   } else if (aval_dopt.constructor === Array){
                       if (!aval_dopt.includes(params[p_name])){
                           throw new OPayError.OPayInvalidParam(`Unexpected option of param ${p_name} (${params[p_name]}). Available option: (${aval_dopt}).`);
                       }
                   }
                   break;
               default:
                   throw new Error(`Unexpected type (${p_type}) for parameter ${p_name}.`);
           }
        });
    }
}

class InvoiceParamVerify extends InvoiceVerifyBase{
    constructor(apiname){
        super();
        this.inv_basic_param = this.get_basic_params(apiname);
        this.inv_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_inv_issue_param(params){
        if (params.constructor === Object){
            // 發票所有參數預設要全帶
            Object.keys(params).forEach(function (keys) {
               if (params[keys] === null){
                   throw new OPayError.OPayInvalidParam(`Parameter value cannot be null.`);
               }
            });
            // 1. 比對欄位是否缺乏
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // a [CarruerType]為1 => CustomerID 不能為空
            if (params['CarruerType'] === '1'){
                if (params['CustomerID'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CustomerID] can not be empty when [CarruryType] is 1.`);
                }
            }// [CustomerID]不為空 => CarruerType 不能為空
            else if (params['CarruerType'] === ''){
                if (params['CustomerID'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerType] can not be empty when [CustomerID] is given.`);
                }
            }
            // b 列印註記[Print]為1 => CustomerName, CustomerAddr 不能為空
            if (params['Print'] === '1'){
                if (params['CustomerName'] === '' && params['CustomerAddr'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CustomerName] and [CustomerAddr] can not be empty when [Print] is 1.`);
                }
                if (params['CustomerID'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CustomerID] is not empty.`);
                }
                if (params['CarruerType'] !== '') {
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CarruerType] is not empty.`);
                }
                if (params['CarruerNum'] !== '') {
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CarruerNum] is not empty.`);
                }
            }
            // c CustomerPhone和CustomerEmail至少一個要有值
            if (params['CustomerPhone'] === '' && params['CustomerEmail'] === ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[CustomerPhone] and [CustomerEmail] can not both be empty.`);
            }
            // d 別[TaxType]為2 => ClearanceMark = 1 or 2 and ItemTaxType 必須為空
            if (params['TaxType'] === '2'){
              if (params['ItemRemark'] !== ''){
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemRemark'];
              } else {
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              }
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== '1' && params['ClearanceMark'] !== '2'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] has to be 1 or 2 when [TaxType] is 2.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 2.`);
                }
                // 當[TaxType]為2時為零稅率，vat為0時商品單價為免稅，不須再加稅
                // 若vat為1時商品單價為含稅，須再退稅
                if (params['vat'] === '0'){
                  var tax_fee = 1
                } else if (params['vat'] === '1'){
                  var tax_fee = 1.05
                }
            }
            // d.1 別[TaxType]為1 => ClearanceMark and ItemTaxType 必須為空
            if (params['TaxType'] === '1'){
              if (params['ItemRemark'] !== ''){
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemRemark'];
              } else {
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              }
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] must be empty when [TaxType] is 1.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 1.`);
                }
                // 當[TaxType]為1時為應稅，vat為0時商品單價為免稅，須再加稅
                // 若vat為1時商品單價為含稅，不須再退稅
                if (params['vat'] === '0'){
                  var tax_fee = 1.05
                } else if (params['vat'] === '1'){
                  var tax_fee = 1
                }
            }
            // d.2 別[TaxType]為3 => ClearanceMark and ItemTaxType 必須為空
            if (params['TaxType'] === '3'){
              if (params['ItemRemark'] !== ''){
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemRemark'];
              } else {
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              }
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] must be empty when [TaxType] is 3.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 3.`);
                }
                // 當[TaxType]為3時為免稅，vat為0時商品單價為免稅，不須再加稅
                // 若vat為1時商品單價為含稅，須再退稅
                if (params['vat'] === '0'){
                  var tax_fee = 1
                } else if (params['vat'] === '1'){
                  var tax_fee = 1.05
                }
            }
            // d.3 別[TaxType]為9 => ItemTaxType 必須為兩項商品(含)以上，且不可為空
            if (params['TaxType'] === '9'){
              if (params['ItemRemark'] !== ''){
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemRemark', 'ItemTaxType'];
              } else {
                var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemTaxType'];
              }
              var vat_params_list = ['ItemCount', 'ItemAmount', 'ItemTaxType'];
                if (!params['ItemTaxType'].includes('|')){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must contain at lease one '|'.`);
                }
                if (params['ItemTaxType'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] can not be empty when [TaxType] is 9.`);
                }
                // 當[ItemTaxType]含2選項的話[ClearanceMark]須為1或2
                if (params['ItemTaxType'].includes('2')){
                  if (params['ClearanceMark'] !== '1' && params['ClearanceMark'] !== '2'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] has to be 1 or 2 when [ItemTaxType] has 2.`);
                  }
                }
            }
            // e 統一編號[CustomerIdentifier]有值時 => CarruerType != 1 or 2 or 3, Donation = 2, Print = 1
            if (params['CustomerIdentifier'] !== ''){
                if (params['CarruerType'] === '1' || params['CarruerType'] === '2' || params['CarruerType'] === '3'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerType] Cannot be 1, 2 or 3 when [CustomerIdentifier] is given.`);
                }
                if (params['Donation'] !== '2' && params['Print'] !== '1'){
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] must be 1 and [Donation] must be 2 when [CustomerIdentifier] is given.`);
                }
            }
            // [CarruerType]為'' or 1 時 : CarruerNum = '', [CarruerType]為2, CarruerNum = 固定長度為16且格式為2碼大小寫字母加上14碼數字。
            // [CarruerType]為3, 固定長度為8且格式為1碼斜線「/」加上7碼數字及大小寫字母組成
            if (params['CarruerType'] === '' || params['CarruerType'] === '1'){
                if (params['CarruerNum'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must be empty when [CarruerType] is empty or 1.`);
                }
            } else if (params['CarruerType'] === '2'){
                if (params['CarruerNum'].match(new RegExp(/^[A-Za-z]{2}[0-9]{14}$/)) === null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must be 2 alphabets and 14 numbers when [CarruerType] is 2.`);
                }
            } else if (params['CarruerType'] === '3'){
                if (params['CarruerNum'].match(new RegExp(/^\/[A-Za-z0-9\s+-]{7}$/)) === null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must start with '/' followed by 7 alphabet and number characters when [CarruerType] is 3.`);
                }
            } else {
                throw new OPayError.OPayInvoiceRuleViolate(`Unexpected value in [CarruerType].`);
            }
            // [CarruerType]有值時，Print必須有為0
            if (params['CarruerType'] !== '' && params['Print'] !== '0'){
                throw new  OPayError.OPayInvoiceRuleViolate(`[Print] must be 0 when [CarruerType] has value.`);
            }
            // Donation = 1 => LoveCode不能為空, Print = 0, Donation = 2 => LoveCode不能有值
            if (params['Donation'] === '1'){
                if (params['LoveCode'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[LoveCode] cannot be empty when [Donation] is 1.`);
                }
                if (params['Print'] !== '0'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[Print] must be 0 when [Donation] is 1.`);
                }
            } else if (params['Donation'] === '2'){
              if (params['LoveCode'] !== ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[LoveCode] must be empty when [Donation] is 2.`);
              }
            }

            // [vat]為0時 => ItemPrice = 未稅, ItemAmount = (ItemPrice * ItemCount) + (ItemPrice * ItemCount * tax(5%))
            // 未稅加稅單一商品時直接四捨五入帶入ItemAmount，且ItemAmount等於SalesAmount
            // 未稅加稅多樣商品時先算稅金加總帶入ItemAmount，且ItemAmount全部金額加總後帶入SalesAmount後四捨五入
            let vat_params = vat_params_list;
            // 商品價錢含有管線 => 認為是多樣商品 *ItemCount ， *ItemPrice ， *ItemAmount 逐一用管線分割，計算數量後與第一個比對
            if (params['vat'] === '0'){
              if (!params['ItemPrice'].includes('|')){
                if (parseInt(params['ItemAmount']) !== Math.round(parseInt(params['ItemPrice']) * parseInt(params['ItemCount']) * tax_fee)){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${params['ItemPrice']}) times [ItemCount] (${params['ItemCount']}) '*' tax (${tax_fee}) subtotal not equal [ItemAmount] (${params['ItemAmount']})`);
                }
                // 驗證單筆商品合計是否等於發票金額
                if (parseInt(params['SalesAmount']) !== parseInt(params['ItemAmount'])){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${params['ItemAmount']}) not equal [SalesAmount] (${params['SalesAmount']})`);
                }
              } else if (params['ItemPrice'].includes('|')){
                let vat_cnt = params['ItemPrice'].split('|').length
                vat_params.forEach(function (param_name){
                  // Check if there's empty value.
                  if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                  }
                  let p_cnt = params[param_name].split('|').length;
                  if (vat_cnt !== p_cnt){
                    throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemPrice] (${item_cnt}).`);
                  }
                });
                let vat_amount_arr = params['ItemAmount'].split('|');
                let vat_price_arr = params['ItemPrice'].split('|');
                let vat_count_arr = params['ItemCount'].split('|');
                let index_count = 0;
                vat_price_arr.forEach(function (val){
                  if (vat_params_list.length === 3){
                    let vat_tax_arr = params['ItemTaxType'].split('|');
                    if (vat_tax_arr[index_count] === '1'){
                      tax_fee = 1.05;
                    } else if (vat_tax_arr[index_count] === '2' || vat_tax_arr[index_count] === '3'){
                      tax_fee = 1;
                    } else {
                      throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] can not be (${vat_tax_arr[index_count]}), Available option: (1, 2, 3).`);
                    }
                  }
                  if (parseFloat(vat_amount_arr[index_count]) !== (parseInt(vat_price_arr[index_count]) * parseInt(vat_count_arr[index_count]) * tax_fee)){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${vat_price_arr[index_count]}) times [ItemCount] (${vat_count_arr[index_count]}) '*' tax (${tax_fee}) not match [ItemAmount] (${vat_amount_arr[index_count]})`);
                  }
                  index_count += 1;
                });
                // Verify ItemAmout subtotal equal SalesAmount
                let chk_amount_subtotal = 0;
                vat_amount_arr.forEach(function (val) {
                    chk_amount_subtotal += parseFloat(val);
                });
                if (parseInt(params['SalesAmount']) !== Math.round(chk_amount_subtotal)){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${vat_amount_arr}) subtotal not equal [SalesAmount] (${params['SalesAmount']})`);
                }
              }
            }

            // [vat]為1時 => ItemPrice = 含稅, ItemAmount = ItemPrice * ItemCount
            // 商品價錢含有管線 => 認為是多樣商品 *ItemCount ， *ItemPrice ， *ItemAmount 逐一用管線分割，計算數量後與第一個比對
            // 含稅扣稅單一商品時直接四捨五入帶入ItemAmount，且ItemAmount等於SalesAmount
            // 含稅扣稅多樣商品時先算稅金加總四捨五入後帶入ItemAmount，且ItemAmount全部金額加總後等於SalesAmount
            if (params['vat'] === '1'){
              if (!params['ItemPrice'].includes('|')){
                if (parseInt(params['ItemAmount']) !== Math.round(parseInt(params['ItemPrice']) * parseInt(params['ItemCount']) / tax_fee)){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${params['ItemPrice']}) times [ItemCount] (${params['ItemCount']}) '/' tax (${tax_fee}) subtotal not equal [ItemAmount] (${params['ItemAmount']})`);
                }
                // 驗證單筆商品合計是否等於發票金額
                if (parseInt(params['SalesAmount']) !== parseInt(params['ItemAmount'])){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${params['ItemAmount']}) not equal [SalesAmount] (${params['SalesAmount']})`);
                }
              } else if (params['ItemPrice'].includes('|')){
                let vat_cnt = params['ItemPrice'].split('|').length
                vat_params.forEach(function (param_name){
                  // Check if there's empty value.
                  if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                  }
                  let p_cnt = params[param_name].split('|').length;
                  if (vat_cnt !== p_cnt){
                    throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemPrice] (${vat_cnt}).`);
                  }
                });
                let vat_amount_arr = params['ItemAmount'].split('|');
                let vat_price_arr = params['ItemPrice'].split('|');
                let vat_count_arr = params['ItemCount'].split('|');
                let index_count = 0;
                vat_price_arr.forEach(function (val){
                  if (vat_params_list.length === 3){
                    let vat_tax_arr = params['ItemTaxType'].split('|');
                    if (vat_tax_arr[index_count] === '1'){
                      tax_fee = 1;
                    } else if (vat_tax_arr[index_count] === '2' || vat_tax_arr[index_count] === '3'){
                      tax_fee = 1.05;
                    } else {
                      throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] can not be (${vat_tax_arr[index_count]}), Available option: (1, 2, 3).`);
                    }
                  }
                  if (parseInt(vat_amount_arr[index_count]) !== Math.round(parseInt(vat_price_arr[index_count]) * parseInt(vat_count_arr[index_count]) / tax_fee)){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${vat_price_arr[index_count]}) times [ItemCount] (${vat_count_arr[index_count]}) '/' tax (${tax_fee}) not match [ItemAmount] (${vat_amount_arr[index_count]})`);
                  }
                  index_count += 1;
                });
                // Verify ItemAmout subtotal equal SalesAmount
                let chk_amount_subtotal = 0;
                vat_amount_arr.forEach(function (val) {
                    chk_amount_subtotal += parseInt(val);
                });
                if (parseInt(params['SalesAmount']) !== chk_amount_subtotal){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${vat_amount_arr}) subtotal not equal [SalesAmount] (${params['SalesAmount']})`);
                }
              }
            }

            // 3. 比對商品名稱，數量，單位，價格，tax項目數量是否一致
            if (params['ItemWord'] === ''){
              throw new OPayError.OPayInvoiceRuleViolate(`[ItemWord] cannot be empty.`);
            }

            let item_params = item_params_list;
            // 商品名稱含有管線 => 認為是多樣商品 *ItemName, *ItemCount, *ItemWord, *ItemPrice, *ItemAmount, *ItemTaxType, *ItemRemark逐一用管線分割，計算數量後與第一個比對
            if (params['ItemName'] === ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemName] is empty.`);
            } else {
                if (params['ItemName'].includes('|')){
                    let item_cnt = params['ItemName'].split('|').length;
                    item_params.forEach(function (param_name) {
                        // Check if there's empty value.
                        if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                            throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                        }
                        let p_cnt = params[param_name].split('|').length;
                        if (item_cnt !== p_cnt){
                            throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemName] (${item_cnt}).`);
                        }
                    });
                    // 課稅類別[TaxType] = 9時 => ItemTaxType 能含有1,2,3(and at least contains one 1 and other)
                    if (params['TaxType'] === '9') {
                      let item_tax = params['ItemTaxType'].split('|');
                      let aval_tax_type = ['1', '2', '3'];
                      let vio_tax_t = item_tax - aval_tax_type;
                      if (vio_tax_t === []){
                        throw new OPayError.OPayInvoiceRuleViolate(`Illegal [ItemTaxType]: ${vio_tax_t}`);
                      }
                      if (!item_tax.includes('1')){
                        throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must contain at lease one '1'.`);
                      }
                      if (item_cnt >= 2){
                        if (!item_tax.includes('2') && !item_tax.includes('3')){
                          throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot be all 1 when [TaxType] is 9.`);
                        }
                      }
                      if (item_tax.includes('2') && item_tax.includes('3')){
                        throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot contain 2 and 3 at the same time.`);
                      }
                    }
                } else {
                    // 沒有管線 => 逐一檢查後4項有無管線
                    item_params.forEach(function (param_name) {
                        if (params[param_name].includes('|')){
                            throw new OPayError.OPayInvoiceRuleViolate(`Item info [${param_name}] contain pipeline delimiter but there's only one item in param [ItemName].`);
                        }
                    });
                }
            }
            // 4. 比對所有欄位Pattern
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw TypeError(`Received argument is not a object.`);
        }
    }

    verify_inv_delay_param(params){
        if (params.constructor === Object){
            // 發票所有參數預設要全帶
            Object.keys(params).forEach(function (keys) {
               if (params[keys] === null){
                   throw new OPayError.OPayInvalidParam(`Parameter value cannot be null.`);
               }
            });
            // 1. 比對欄位是否缺乏
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // a [CarruerType]為1 => CustomerID 不能為空
            if (params['CarruerType'] === '1'){
                if (params['CustomerID'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CustomerID] can not be empty when [CarruryType] is 1.`);
                }
            }// [CustomerID]不為空 => CarruerType 不能為空
            else if (params['CarruerType'] === ''){
                if (params['CustomerID'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerType] can not be empty when [CustomerID] is given.`);
                }
            }
            // b 列印註記[Print]為1 => CustomerName, CustomerAddr 不能為空
            if (params['Print'] === '1'){
                if (params['CustomerName'] === '' && params['CustomerAddr'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CustomerName] and [CustomerAddr] can not be empty when [Print] is 1.`);
                }
                if (params['CustomerID'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CustomerID] is not empty.`);
                }
                if (params['CarruerType'] !== '') {
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CarruerType] is not empty.`);
                }
                if (params['CarruerNum'] !== '') {
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] can not be '1' when [CarruerNum] is not empty.`);
                }
            }
            // c CustomerPhone和CustomerEmail至少一個要有值
            if (params['CustomerPhone'] === '' && params['CustomerEmail'] === ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[CustomerPhone] and [CustomerEmail] can not both be empty.`);
            }
            // d 別[TaxType]為2 => ClearanceMark = 1 or 2 and ItemTaxType 必須為空
            if (params['TaxType'] === '2'){
              var tax_fee = 1.05
              var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== '1' && params['ClearanceMark'] !== '2'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] has to be 1 or 2 when [TaxType] is 2.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 2.`);
                }
            }
            // d.1 別[TaxType]為1 => ClearanceMark and ItemTaxType 必須為空
            if (params['TaxType'] === '1'){
              var tax_fee = 1
              var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] must be empty when [TaxType] is 1.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 1.`);
                }
            }
            // d.2 別[TaxType]為3 => ClearanceMark and ItemTaxType 必須為空
            if (params['TaxType'] === '3'){
              var tax_fee = 1.05
              var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
              var vat_params_list = ['ItemCount', 'ItemAmount'];
                if (params['ClearanceMark'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] must be empty when [TaxType] is 3.`);
                }
                if (params['ItemTaxType'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must be empty when [TaxType] is 3.`);
                }
            }
            // d.3 別[TaxType]為9 => ItemTaxType 必須為兩項商品(含)以上，且不可為空
            if (params['TaxType'] === '9'){
              var item_params_list = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount', 'ItemTaxType'];
              var vat_params_list = ['ItemCount', 'ItemAmount', 'ItemTaxType'];
                if (!params['ItemTaxType'].includes('|')){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must contain at lease one '|'.`);
                }
                if (params['ItemTaxType'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] can not be empty when [TaxType] is 9.`);
                }
                // 當[ItemTaxType]含2選項的話[ClearanceMark]須為1或2
                if (params['ItemTaxType'].includes('2')){
                  if (params['ClearanceMark'] !== '1' && params['ClearanceMark'] !== '2'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[ClearanceMark] has to be 1 or 2 when [ItemTaxType] has 2.`);
                  }
                }
            }
            // e 統一編號[CustomerIdentifier]有值時 => CarruerType != 1 or 2 or 3, Donation = 2, Print = 1
            if (params['CustomerIdentifier'] !== ''){
                if (params['CarruerType'] === '1' || params['CarruerType'] === '2' || params['CarruerType'] === '3'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerType] Cannot be 1, 2 or 3 when [CustomerIdentifier] is given.`);
                }
                if (params['Donation'] !== '2' && params['Print'] !== '1'){
                  throw new OPayError.OPayInvoiceRuleViolate(`[Print] must be 1 and [Donation] must be 2 when [CustomerIdentifier] is given.`);
                }
            }
            // DelayFlag Rules When [DelayFlag] is '1' the [DelayDay] range be between 1 and 15
            // When [DelayFlag] is '2' the [DelayDay] range be between 0 and 15
            if (params['DelayFlag'] === '1'){
              if (parseInt(params['DelayDay']) > 15 || parseInt(params['DelayDay']) < 1){
                throw new OPayError.OPayInvoiceRuleViolate(`[DelayDay] must be between 1 and 15 when [DelayFlag] is '1'.`);
              }
            } else if (params['DelayFlag'] === '2'){
              if (parseInt(params['DelayDay']) > 15 || parseInt(params['DelayDay']) < 0){
                throw new OPayError.OPayInvoiceRuleViolate(`[DelayDay] must be between 0 and 15 when [DelayFlag] is '2'.`);
              }
            }
            // [CarruerType]為'' or 1 時 : CarruerNum = '', [CarruerType]為2, CarruerNum = 固定長度為16且格式為2碼大小寫字母加上14碼數字。
            // [CarruerType]為3, 固定長度為8且格式為1碼斜線「/」加上7碼數字及大小寫字母組成
            if (params['CarruerType'] === '' || params['CarruerType'] === '1'){
                if (params['CarruerNum'] !== ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must be empty when [CarruerType] is empty or 1.`);
                }
            } else if (params['CarruerType'] === '2'){
                if (params['CarruerNum'].match(new RegExp(/^[A-Za-z]{2}[0-9]{14}$/)) === null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must be 2 alphabets and 14 numbers when [CarruerType] is 2.`);
                }
            } else if (params['CarruerType'] === '3'){
                if (params['CarruerNum'].match(new RegExp(/^\/[A-Za-z0-9\s+-]{7}$/)) === null){
                    throw new OPayError.OPayInvoiceRuleViolate(`[CarruerNum] must start with '/' followed by 7 alphabet and number characters when [CarruerType] is 3.`);
                }
            } else {
                throw new OPayError.OPayInvoiceRuleViolate(`Unexpected value in [CarruerType].`);
            }
            // [CarruerType]有值時，Print必須有為0
            if (params['CarruerType'] !== '' && params['Print'] !== '0'){
                throw new  OPayError.OPayInvoiceRuleViolate(`[Print] must be 0 when [CarruerType] has value.`);
            }
            // Donation = 1 => LoveCode不能為空, Print = 0, Donation = 2 => LoveCode不能有值
            if (params['Donation'] === '1'){
                if (params['LoveCode'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[LoveCode] cannot be empty when [Donation] is 1.`);
                }
                if (params['Print'] !== '0'){
                    throw new OPayError.OPayInvoiceRuleViolate(`[Print] must be 0 when [Donation] is 1.`);
                }
            } else if (params['Donation'] === '2'){
              if (params['LoveCode'] !== ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[LoveCode] must be empty when [Donation] is 2.`);
              }
            }

            let vat_params = vat_params_list;
            // 商品價錢含有管線 => 認為是多樣商品 *ItemCount ， *ItemPrice ， *ItemAmount 逐一用管線分割，計算數量後與第一個比對
            if (!params['ItemPrice'].includes('|')){
              if (parseInt(params['ItemAmount']) !== Math.round(parseInt(params['ItemPrice']) * parseInt(params['ItemCount']) / tax_fee)){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${params['ItemPrice']}) times [ItemCount] (${params['ItemCount']}) '/' tax (${tax_fee}) subtotal not equal [ItemAmount] (${params['ItemAmount']})`);
              }
              // 驗證單筆商品合計是否等於發票金額
              if (parseInt(params['SalesAmount']) !== parseInt(params['ItemAmount'])){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${params['ItemAmount']}) not equal [SalesAmount] (${params['SalesAmount']})`);
              }
            } else if (params['ItemPrice'].includes('|')){
              let vat_cnt = params['ItemPrice'].split('|').length
              vat_params.forEach(function (param_name){
                // Check if there's empty value.
                if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                  throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                }
                let p_cnt = params[param_name].split('|').length;
                if (vat_cnt !== p_cnt){
                  throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemPrice] (${vat_cnt}).`);
                }
              });
              let vat_amount_arr = params['ItemAmount'].split('|');
              let vat_price_arr = params['ItemPrice'].split('|');
              let vat_count_arr = params['ItemCount'].split('|');
              let index_count = 0;
              vat_price_arr.forEach(function (val){
                if (vat_params_list.length === 3){
                  let vat_tax_arr = params['ItemTaxType'].split('|');
                  if (vat_tax_arr[index_count] === '1'){
                    tax_fee = 1;
                  } else if (vat_tax_arr[index_count] === '2' || vat_tax_arr[index_count] === '3'){
                    tax_fee = 1.05;
                  } else {
                    throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] can not be (${vat_tax_arr[index_count]}), Available option: (1, 2, 3).`);
                  }
                }
                if (parseInt(vat_amount_arr[index_count]) !== Math.round(parseInt(vat_price_arr[index_count]) * parseInt(vat_count_arr[index_count]) / tax_fee)){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${vat_price_arr[index_count]}) times [ItemCount] (${vat_count_arr[index_count]}) '/' tax (${tax_fee}) not match [ItemAmount] (${vat_amount_arr[index_count]})`);
                }
                index_count += 1;
              });
              // Verify ItemAmout subtotal equal SalesAmount
              let chk_amount_subtotal = 0;
              vat_amount_arr.forEach(function (val) {
                  chk_amount_subtotal += parseInt(val);
              });
              if (parseInt(params['SalesAmount']) !== chk_amount_subtotal){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${vat_amount_arr}) subtotal not equal [SalesAmount] (${params['SalesAmount']})`);
              }
            }

            // 3. 比對商品名稱，數量，單位，價格，tax項目數量是否一致
            if (params['ItemWord'] === ''){
              throw new OPayError.OPayInvoiceRuleViolate(`[ItemWord] cannot be empty.`);
            }

            let item_params = item_params_list;
            // 商品名稱含有管線 => 認為是多樣商品 *ItemName, *ItemCount, *ItemWord, *ItemPrice, *ItemAmount, *ItemTaxType逐一用管線分割，計算數量後與第一個比對
            if (params['ItemName'] === ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemName] is empty.`);
            } else {
                if (params['ItemName'].includes('|')){
                    let item_cnt = params['ItemName'].split('|').length;
                    item_params.forEach(function (param_name) {
                        // Check if there's empty value.
                        if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                            throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                        }
                        let p_cnt = params[param_name].split('|').length;
                        if (item_cnt !== p_cnt){
                            throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemName] (${item_cnt}).`);
                        }
                    });
                    // 課稅類別[TaxType] = 9時 => ItemTaxType 能含有1,2,3(and at least contains one 1 and other)
                    if (params['TaxType'] === '9') {
                      let item_tax = params['ItemTaxType'].split('|');
                      let aval_tax_type = ['1', '2', '3'];
                      let vio_tax_t = item_tax - aval_tax_type;
                      if (vio_tax_t === []){
                        throw new OPayError.OPayInvoiceRuleViolate(`Illegal [ItemTaxType]: ${vio_tax_t}`);
                      }
                      if (!item_tax.includes('1')){
                        throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must contain at lease one '1'.`);
                      }
                      if (item_cnt >= 2){
                        if (!item_tax.includes('2') && !item_tax.includes('3')){
                          throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot be all 1 when [TaxType] is 9.`);
                        }
                      }
                      if (item_tax.includes('2') && item_tax.includes('3')){
                        throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot contain 2 and 3 at the same time.`);
                      }
                    }
                } else {
                    // 沒有管線 => 逐一檢查後4項有無管線
                    item_params.forEach(function (param_name) {
                        if (params[param_name].includes('|')){
                            throw new OPayError.OPayInvoiceRuleViolate(`Item info [${param_name}] contain pipeline delimiter but there's only one item in param [ItemName].`);
                        }
                    });
                }
            }
            // 4. 比對所有欄位Pattern
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw TypeError(`Received argument is not a object.`);
        }
    }

    verify_inv_trigger_param(params){
        if (params.constructor === Object){
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }

    verify_inv_allowance_param(params){
        if (params.constructor === Object){
            // 發票所有參數預設要全帶
            Object.keys(params).forEach(function (keys) {
               if (params[keys] === null){
                   throw new OPayError.OPayInvalidParam(`Parameter value cannot be null.`);
               }
            });
            // 1. 比對欄位是否缺乏
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // 2. 比對特殊欄位值相依需求
            // a NotifyPhone和NotifyMail至少一個有值，當AllowanceNotify為A時都為必填
            if (params['AllowanceNotify'] === 'S'){
                if (params['NotifyPhone'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[NotifyPhone] cannot be empty.`);
                }
            } else if (params['AllowanceNotify'] === 'E'){
                if (params['NotifyMail'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[NotifyMail] cannot be empty.`);
                }
            } else if (params['AllowanceNotify'] === 'A'){
                if (params['NotifyPhone'] === '' || params['NotifyMail'] === ''){
                    throw new OPayError.OPayInvoiceRuleViolate(`[NotifyPhone] and [NotifyMail] can not be empty.`);
                }
            }

            let vat_params = ['ItemCount', 'ItemAmount'];
            // 商品價錢含有管線 => 認為是多樣商品 *ItemCount ， *ItemPrice ， *ItemAmount 逐一用管線分割，計算數量後與第一個比對
            // 驗證單筆ItemAmount = (ItemPrice * ItemCount)
            if (!params['ItemPrice'].includes('|')){
              if (parseInt(params['ItemAmount']) !== Math.round(parseInt(params['ItemPrice']) * parseInt(params['ItemCount']))){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${params['ItemPrice']}) times [ItemCount] (${params['ItemCount']}) subtotal not equal [ItemAmount] (${params['ItemAmount']})`);
              }
              // 驗證單筆商品合計是否等於發票金額
              if (parseInt(params['AllowanceAmount']) !== parseInt(params['ItemAmount'])){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${params['ItemAmount']}) not equal [AllowanceAmount] (${params['AllowanceAmount']})`);
              }
            } else if (params['ItemPrice'].includes('|')){
              let vat_cnt = params['ItemPrice'].split('|').length
              vat_params.forEach(function (param_name){
                // Check if there's empty value.
                if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                  throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                }
                let p_cnt = params[param_name].split('|').length;
                if (vat_cnt !== p_cnt){
                  throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemPrice] (${vat_cnt}).`);
                }
              });
              let vat_amount_arr = params['ItemAmount'].split('|');
              let vat_price_arr = params['ItemPrice'].split('|');
              let vat_count_arr = params['ItemCount'].split('|');
              let index_count = 0;
              vat_price_arr.forEach(function (val){
                if (parseInt(vat_amount_arr[index_count]) !== Math.round(parseInt(vat_price_arr[index_count]) * parseInt(vat_count_arr[index_count]))){
                  throw new OPayError.OPayInvoiceRuleViolate(`[ItemPrice] (${vat_price_arr[index_count]}) times [ItemCount] (${vat_count_arr[index_count]}) not match [ItemAmount] (${vat_amount_arr[index_count]})`);
                }
                index_count += 1;
              });
              // Verify ItemAmout subtotal equal SalesAmount
              let chk_amount_subtotal = 0;
              vat_amount_arr.forEach(function (val) {
                  chk_amount_subtotal += parseInt(val);
              });
              if (parseInt(params['AllowanceAmount']) !== chk_amount_subtotal){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemAmount] (${vat_amount_arr}) subtotal not equal [AllowanceAmount] (${params['AllowanceAmount']})`);
              }
            }

            // 3. 比對商品名稱，數量，單位，價格，tax項目數量是否一致
            if (params['ItemWord'] === ''){
              throw new OPayError.OPayInvoiceRuleViolate(`[ItemWord] cannot be empty.`);
            }

            let item_params = ['ItemCount', 'ItemWord', 'ItemPrice', 'ItemAmount'];
            // 商品名稱含有管線 => 認為是多樣商品 *ItemName, *ItemCount, *ItemWord, *ItemPrice, *ItemAmount逐一用管線分割，計算數量後與第一個比對
            if (params['ItemName'] === ''){
                throw new OPayError.OPayInvoiceRuleViolate(`[ItemName] is empty.`);
            } else {
                if (params['ItemName'].includes('|')){
                    let item_cnt = params['ItemName'].split('|').length;
                    item_params.forEach(function (param_name) {
                        // Check if there's empty value.
                        if (params[param_name].match(new RegExp(/(\|\||^\||\|$)/)) !== null){
                            throw new OPayError.OPayInvoiceRuleViolate(`[${param_name}] contains empty value.`);
                        }
                        let p_cnt = params[param_name].split('|').length;
                        if (item_cnt !== p_cnt){
                            throw new OPayError.OPayInvoiceRuleViolate(`Count of item info [${param_name}] (${p_cnt}) not match count from [ItemName] (${item_cnt}).`);
                        }
                    });
                    // ItemTaxType 能含有1,3(and at least contains one 1 and other)
                    let item_tax = params['ItemTaxType'].split('|');
                    let aval_tax_type = ['1', '3'];
                    let vio_tax_t = item_tax - aval_tax_type;
                    if (vio_tax_t === []){
                      throw new OPayError.OPayInvoiceRuleViolate(`Illegal [ItemTaxType]: ${vio_tax_t}`);
                    }
                    // if (!item_tax.includes('1')){
                    //   throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] must contain at lease one '1'.`);
                    // }
                    // if (item_cnt >= 2){
                    //   if (!item_tax.includes('2') && !item_tax.includes('3')){
                    //     throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot be all 1 when [TaxType] is 9.`);
                    //   }
                    // }
                    // if (item_tax.includes('2') && item_tax.includes('3')){
                    //   throw new OPayError.OPayInvoiceRuleViolate(`[ItemTaxType] cannot contain 2 and 3 at the same time.`);
                    // }
                } else {
                    // 沒有管線 => 逐一檢查後4項有無管線
                    item_params.forEach(function (param_name) {
                      if (params[param_name].includes('|')){
                        throw new OPayError.OPayInvoiceRuleViolate(`Item info [${param_name}] contain pipeline delimiter but there's only one item in param [ItemName].`);
                      }
                    });
                }
            }
            // 4. 比對所有欄位Pattern
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw TypeError(`Received argument is not a object.`);
        }
    }

    verify_inv_issue_invalid_param(params){
        if (params.constructor === Object){
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            if (params['Reason'] === ''){
              throw new OPayError.OPayInvoiceRuleViolate(`[Reason] cannot be empty.`);
            }

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }

    verify_inv_allowance_invalid_param(params){
        if (params.constructor === Object){
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }
}

class QueryParamVerify extends InvoiceVerifyBase{
    constructor(apiname){
        super();
        this.inv_basic_param = this.get_basic_params(apiname);
        this.inv_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_query_param(params){
        if (params.constructor === Object){
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
          throw new TypeError(`Received argument is not a object`);
        }
    }
}

class NotifyParamVerify extends InvoiceVerifyBase{
    constructor(apiname){
        super();
        this.inv_basic_param = this.get_basic_params(apiname);
        this.inv_conditional_param = this.get_cond_param(apiname);
        this.all_param_pattern = this.get_all_pattern(apiname);
    }

    verify_notify_param(params){
        if (params.constructor === Object){
            let basic_param = this.inv_basic_param.sort();
            let input_param = Object.keys(params).sort();
            basic_param.forEach(function (pname) {
                if (input_param.indexOf(pname, 0) === -1){
                    throw new OPayError.OPayInvalidParam(`Lack required param ${pname}`);
                }
            });

            // Verify Value pattern of each param
            this.verify_param_by_pattern(params, this.all_param_pattern);
        } else {
            throw new TypeError(`Received argument is not a object`);
        }
    }
}
module.exports = {
    InvoiceVerifyBase: InvoiceVerifyBase,
    InvoiceParamVerify: InvoiceParamVerify,
    QueryParamVerify: QueryParamVerify,
    NotifyParamVerify: NotifyParamVerify
};