var Allpay = require("../lib/allpay");
var iconv = require("iconv-lite");
var path = require("path");
var fs = require("fs");

var config = { merchantID: "2000214", hashKey: "5294y06JbISpM5x9", hashIV: "v77hoKGq4kWxNNIS" };
var allpay = new Allpay(config);

describe("Allpay", function() {
  describe(".aioCheckOut", function() {
    it("should check parameter type", function(done) {
      expect(allpay.aioCheckOut.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.aioCheckOut.bind(allpay, {
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016/06/22 01:00:00",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        Items: [{
          name: "德國原裝進口自動鉛筆",
          price: 60,
          currency: "元",
          quantity: 1
        }, {
          name: "橡皮擦",
          price: 20,
          currency: "元",
          quantity: 2
        }],
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should check parameter format", function(done) {
      expect(allpay.aioCheckOut.bind(allpay, {
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2",
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016-06-22 01:00:00",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        Items: [{
          name: "德國原裝進口自動鉛筆",
          price: 60,
          currency: "元",
          quantity: 1
        }, {
          name: "橡皮擦",
          price: 20,
          currency: "元",
          quantity: 2
        }],
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      })).to.throw(Error, /^The format for \w+ is wrong$/)

      done();
    });

    it("should return checkout form data with MD5 CheckMacValue", function(done) {
      allpay.aioCheckOut({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2",
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016/06/22 01:00:00",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        Items: [{
          name: "德國原裝進口自動鉛筆",
          price: 60,
          currency: "元",
          quantity: 1
        }, {
          name: "橡皮擦",
          price: 20,
          currency: "元",
          quantity: 2
        }],
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result.json).to.be.a("object");
        expect(result.html).to.match(/^<meta.+\/form>$/);

        var formData = result.json;
        expect(formData.MerchantID).to.equal(config.merchantID);
        expect(formData.MerchantTradeNo).to.equal("TS20160622900001");
        expect(formData.MerchantTradeDate).to.equal("2016/06/22 01:00:00");
        expect(formData.PaymentType).to.equal("aio");
        expect(formData.TotalAmount).to.equal(100);
        expect(formData.TradeDesc).to.equal("Hello World 網路商城");
        expect(formData.ItemName).to.equal("德國原裝進口自動鉛筆 60 元 x 1#橡皮擦 20 元 x 2");
        expect(formData.ReturnURL).to.equal("http://localhost/receive");
        expect(formData.ChoosePayment).to.equal("ALL");
        expect(formData.CheckMacValue).to.equal("54642B0DC72A9586945F70AB30276486");

        done();
      });
    });

    it("should return checkout form data with SHA256 CheckMacValue", function(done) {
      allpay.aioCheckOut({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2",
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016/06/22 01:00:00",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        EncryptType: Allpay.CONSTANTS.ENCRYPT_TYPE.SHA256,
        Items: [{
          name: "德國原裝進口自動鉛筆",
          price: 60,
          currency: "元",
          quantity: 1
        }, {
          name: "橡皮擦",
          price: 20,
          currency: "元",
          quantity: 2
        }],
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result.json).to.be.a("object");
        expect(result.html).to.match(/^<meta.+\/form>$/);

        var formData = result.json;
        expect(formData.MerchantID).to.equal(config.merchantID);
        expect(formData.MerchantTradeNo).to.equal("TS20160622900001");
        expect(formData.MerchantTradeDate).to.equal("2016/06/22 01:00:00");
        expect(formData.PaymentType).to.equal("aio");
        expect(formData.TotalAmount).to.equal(100);
        expect(formData.TradeDesc).to.equal("Hello World 網路商城");
        expect(formData.ItemName).to.equal("德國原裝進口自動鉛筆 60 元 x 1#橡皮擦 20 元 x 2");
        expect(formData.ReturnURL).to.equal("http://localhost/receive");
        expect(formData.ChoosePayment).to.equal("ALL");
        expect(formData.CheckMacValue).to.equal("D1EE584C38B6AE6A1DCFA34455C3DE492731A0B4E0CD7FEF6A61D573EA516012");

        done();
      });
    });

    it("should return checkout form data with e-invoice", function(done) {
      allpay.aioCheckOut({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/AioCheckOut/V2",
        MerchantTradeNo: "TS20160622900002",
        MerchantTradeDate: "2016/06/22 02:00:00",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        Items: [{
          name: "德國原裝進口自動鉛筆",
          price: 60,
          currency: "元",
          quantity: 1,
        }, {
          name: "橡皮擦",
          price: 20,
          currency: "元",
          quantity: 2,
        }],
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL,
        InvoiceMark: Allpay.CONSTANTS.INVOICE_MARK.YES,
        RelateNumber: "TS20160622900002",
        CustomerPhone: "0987654321",
        TaxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
        CarruerType: Allpay.CONSTANTS.CARRIER_TYPE.NONE,
        Donation: Allpay.CONSTANTS.DONATION.NO,
        Print: Allpay.CONSTANTS.PRINT_MARK.NO,
        InvoiceItems: [{
          name: "德國原裝進口自動鉛筆",
          count: 1,
          word: "支",
          price: 60,
          taxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
        }, {
          name: "橡皮擦",
          count: 2,
          word: "個",
          price: 20,
          taxType: Allpay.CONSTANTS.TAX_TYPE.DUTIABLE,
        }],
        InvType: Allpay.CONSTANTS.INV_TYPE.GENERAL
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result.json).to.be.a("object");
        expect(result.html).to.be.a("string");
        expect(result.html).to.match(/^<meta.+\/form>$/);

        var formData = result.json;
        expect(formData.MerchantID).to.equal(config.merchantID);
        expect(formData.PaymentType).to.equal("aio");
        expect(formData.TradeDesc).to.equal("Hello World 網路商城");
        expect(formData.MerchantTradeNo).to.equal("TS20160622900002");
        expect(formData.InvoiceMark).to.equal("Y");
        expect(formData.ChoosePayment).to.equal("ALL");
        expect(formData.CarruerType).to.equal("");
        expect(formData.Donation).to.equal("2");
        expect(formData.TaxType).to.equal("1");
        expect(formData.ReturnURL).to.equal("http://localhost/receive");
        expect(formData.MerchantTradeDate).to.equal("2016/06/22 02:00:00");
        expect(formData.RelateNumber).to.equal("TS20160622900002");
        expect(formData.Print).to.equal("0");
        expect(formData.InvType).to.equal("07");
        expect(formData.TotalAmount).to.equal(100);
        expect(formData.CustomerPhone).to.equal("0987654321");
        expect(formData.ItemName).to.equal("德國原裝進口自動鉛筆 60 元 x 1#橡皮擦 20 元 x 2");
        expect(formData.CustomerName).to.equal("");
        expect(formData.CustomerAddr).to.equal("");
        expect(formData.CustomerEmail).to.equal("");
        expect(formData.InvoiceItemName).to.equal("%E5%BE%B7%E5%9C%8B%E5%8E%9F%E8%A3%9D%E9%80%B2%E5%8F%A3%E8%87%AA%E5%8B%95%E9%89%9B%E7%AD%86|%E6%A9%A1%E7%9A%AE%E6%93%A6");
        expect(formData.InvoiceItemCount).to.equal("1|2");
        expect(formData.InvoiceItemWord).to.equal("%E6%94%AF|%E5%80%8B");
        expect(formData.InvoiceItemPrice).to.equal("60|20");
        expect(formData.InvoiceItemTaxType).to.equal("1|1");
        expect(formData.InvoiceRemark).to.equal("");
        expect(formData.DelayDay).to.equal(0);
        expect(formData.CheckMacValue).to.equal("7775AEE554F212DF6C32CC08CF408644");

        done();
      });
    });
  });

  describe(".verifyCheckOutFeedback", function() {
    it("should check parameter type", function(done) {
      expect(allpay.verifyCheckOutFeedback.bind(allpay)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should verify check out feedback data", function(done) {
      var feedbackData = {
        MerchantID: "2000214",
        MerchantTradeNo: "TS20160619000001",
        PayAmt: "100",
        PaymentDate: "2016/06/19 14:23:00",
        PaymentType: "WebATM_TAISHIN",
        PaymentTypeChargeFee: "1",
        RedeemAmt: "0",
        RtnCode: "1",
        RtnMsg: "交易成功",
        SimulatePaid: "0",
        TradeAmt: "100",
        TradeDate: "2016/06/19 14:22:58",
        TradeNo: "1606191422583352",
        CheckMacValue: "C0D4189820ECEEF4BE9B914549CBD61D"
      };

      allpay.verifyCheckOutFeedback(feedbackData, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        done();
      });
    });
  });

  describe(".queryTradeInfo", function() {
    it("should check parameter type", function(done) {
      expect(allpay.queryTradeInfo.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.queryTradeInfo.bind(allpay, {
        MerchantTradeNo: "TS20160622900001"
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should return trade information", function(done) {
      allpay.queryTradeInfo({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/QueryTradeInfo/V2",
        MerchantTradeNo: "TS20160622900001"
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        done();
      });
    });
  });

  describe(".queryCreditCardPeriodInfo", function() {
    it("should check parameter type", function(done) {
      expect(allpay.queryCreditCardPeriodInfo.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.queryCreditCardPeriodInfo.bind(allpay, {
        MerchantTradeNo: "TS20160622900003"
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should return credit card period information", function(done) {
      allpay.queryCreditCardPeriodInfo({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/QueryCreditCardPeriodInfo",
        MerchantTradeNo: "TS20160622900003"
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result).to.have.property("MerchantID");
        expect(result.MerchantID).to.equal(config.merchantID);
        expect(result).to.have.property("MerchantTradeNo");
        expect(result.MerchantTradeNo).to.equal("TS20160622900003");
        expect(result).to.have.property("TradeNo");
        expect(result).to.have.property("RtnCode");
        expect(result).to.have.property("PeriodType");
        expect(result).to.have.property("Frequency");
        expect(result).to.have.property("ExecTimes");
        expect(result).to.have.property("PeriodAmount");
        expect(result).to.have.property("amount");
        expect(result).to.have.property("gwsr");
        expect(result).to.have.property("process_date");
        expect(result).to.have.property("auth_code");
        expect(result).to.have.property("card4no");
        expect(result).to.have.property("card6no");
        expect(result).to.have.property("TotalSuccessTimes");
        expect(result).to.have.property("TotalSuccessAmount");
        expect(result).to.have.property("ExecLog");
        expect(result).to.have.property("ExecStatus");

        done();
      });
    })
  });

  describe(".doAction", function() {
    it("should check parameter type", function(done) {
      expect(allpay.doAction.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.doAction.bind(allpay, {
        MerchantTradeNo: "T20160622900002",
        TradeNo: "1606221349270431",
        Action: Allpay.CONSTANTS.ACTION_TYPE.N,
        TotalAmount: 200
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should check parameter value", function(done) {
      expect(allpay.doAction.bind(allpay, {
        ServiceURL: "https://payment-stage.allpay.com.tw/CreditDetail/DoAction",
        MerchantTradeNo: "T20160622900002",
        TradeNo: "1606221349270431",
        Action: Allpay.CONSTANTS.ACTION_TYPE.X,
        TotalAmount: 200
      })).to.throw(Error, /^\w+ should be .+$/)

      done();
    });

    it("should return action result", function(done) {
      allpay.doAction({
        ServiceURL: "https://payment-stage.allpay.com.tw/CreditDetail/DoAction",
        MerchantTradeNo: "T20160622900002",
        TradeNo: "1606221349270431",
        Action: Allpay.CONSTANTS.ACTION_TYPE.N,
        TotalAmount: 200
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result).to.have.property("Merchant");
        expect(result.Merchant).to.equal(config.merchantID);
        expect(result).to.have.property("MerchantTradeNo");
        expect(result.MerchantTradeNo).to.equal("T20160622900002");
        expect(result).to.have.property("TradeNo");
        expect(result).to.have.property("RtnCode");
        expect(result).to.have.property("RtnMsg");

        done();
      });
    });
  });

  describe(".aioChargeback", function() {
    it("should check parameter type", function(done) {
      expect(allpay.aioChargeback.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.aioChargeback.bind(allpay, {
        MerchantTradeNo: "TS20160622900004",
        TradeNo: "1606220931009299",
        ChargeBackTotalAmount: 500
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    // NOTE: Only return OK at first time
    it.skip("should return charge back information", function(done) {
      allpay.aioChargeback({
        ServiceURL: "https://payment-stage.allpay.com.tw//Cashier/AioChargeback",
        MerchantTradeNo: "TS20160622900004",
        TradeNo: "1606220931009299",
        ChargeBackTotalAmount: 500
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result).to.have.property("RtnCode");
        expect(result.RtnCode).to.equal("1");
        expect(result).to.have.property("RtnMsg");
        expect(result.RtnMsg).to.equal("OK");

        done();
      });
    });
  });

  describe(".capture", function() {
    it("should check parameter type", function(done) {
      expect(allpay.capture.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.capture.bind(allpay, {
        MerchantTradeNo: "TS20160622900005",
        CaptureAMT: 30,
        UserRefundAMT: 270,
        UserName: "王大明",
        UserCellPhone: "0987654321"
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should return capture information", function(done) {
      allpay.capture({
        ServiceURL: "https://payment-stage.allpay.com.tw/Cashier/Capture",
        MerchantTradeNo: "TS20160622900005",
        CaptureAMT: 30,
        UserRefundAMT: 270,
        UserName: "王大明",
        UserCellPhone: "0987654321"
      }, function(err, result) {
        expect(err).to.be.undefined;
        expect(result).to.be.a("object");

        expect(result).to.have.property("MerchantID");
        expect(result.MerchantID).to.equal(config.merchantID);
        expect(result).to.have.property("MerchantTradeNo");
        expect(result.MerchantTradeNo).to.equal("TS20160622900005");
        expect(result).to.have.property("TradeNo");
        expect(result).to.have.property("RtnCode");
        expect(result).to.have.property("RtnMsg");
        expect(result).to.have.property("AllocationDate");

        done();
      });
    });
  });

  describe(".downloadAioPaymentMedia", function() {
    before(function() {
      global.tmpDir = path.join(__dirname, "..", ".tmp");
      global.newVersionCsvPath = path.join(global.tmpDir, "new.csv");
      global.oldVersionCsvPath = path.join(global.tmpDir, "old.csv");

      // Create temporary directory if not exist
      try {
        fs.accessSync(global.tmpDir);
      } catch (error) {
        fs.mkdirSync(global.tmpDir);
      }
    });

    after(function() {
      // runs after all tests in this block
      try {
        fs.accessSync(global.newVersionCsvPath);
        fs.unlinkSync(global.newVersionCsvPath);
      } catch (error) {}

      try {
        fs.accessSync(global.oldVersionCsvPath);
        fs.unlinkSync(global.oldVersionCsvPath);
      } catch (error) {}
    });

    it("should check parameter type", function(done) {
      expect(allpay.downloadAioPaymentMedia.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should check required parameter", function(done) {
      expect(allpay.downloadAioPaymentMedia.bind(allpay, {
        DateType: Allpay.CONSTANTS.TRADE_DATE_TYPE.PAYMENT,
        BeginDate: "2016-06-22",
        EndDate: "2016-06-22",
        MediaFormated: Allpay.CONSTANTS.MEDIA_FORMAT.NEW,
        FilePath: global.newVersionCsvPath
      })).to.throw(Error, /^Missing required parameter: \w+$/)

      done();
    });

    it("should check parameter format", function(done) {
      expect(allpay.downloadAioPaymentMedia.bind(allpay, {
        ServiceURL: "https://vendor-stage.allpay.com.tw/PaymentMedia/TradeNoAio",
        DateType: Allpay.CONSTANTS.TRADE_DATE_TYPE.PAYMENT,
        BeginDate: "2016/06/22",
        EndDate: "2016/06/22",
        MediaFormated: Allpay.CONSTANTS.MEDIA_FORMAT.NEW,
        FilePath: global.newVersionCsvPath
      })).to.throw(Error, /^The format for \w+ is wrong$/)

      done();
    });

    it("should download AIO payment media(old version)", function(done) {
      allpay.downloadAioPaymentMedia({
        ServiceURL: "https://vendor-stage.allpay.com.tw/PaymentMedia/TradeNoAio",
        DateType: Allpay.CONSTANTS.TRADE_DATE_TYPE.PAYMENT,
        BeginDate: "2016-06-22",
        EndDate: "2016-06-22",
        MediaFormated: Allpay.CONSTANTS.MEDIA_FORMAT.OLD,
        FilePath: global.oldVersionCsvPath
      }, function(err) {
        var header = '交易日期,歐付寶交易序號,特店訂單編號,ATM條碼,交易金額,付款方式,付款結果,付款日期,款項來源(銀行/超商),通路費,交易服務費率(%數 / $筆),交易服務費金額,應收款項(淨額),撥款狀態,撥款日期,備註';
        var mediaData = fs.readFileSync(global.oldVersionCsvPath);

        if (/^win/.test(process.platform)) {
          mediaData = iconv.decode(mediaData, 'Big5');
        } else {
          mediaData = mediaData.toString("utf8")
        }

        expect(mediaData).to.include(header);

        done();
      });
    });

    it("should download AIO payment media(new version)", function(done) {
      allpay.downloadAioPaymentMedia({
        ServiceURL: "https://vendor-stage.allpay.com.tw/PaymentMedia/TradeNoAio",
        DateType: Allpay.CONSTANTS.TRADE_DATE_TYPE.PAYMENT,
        BeginDate: "2016-06-22",
        EndDate: "2016-06-22",
        MediaFormated: Allpay.CONSTANTS.MEDIA_FORMAT.NEW,
        FilePath: global.newVersionCsvPath
      }, function(err) {
        var header = '="訂單日期",="廠商訂單編號",="歐付寶訂單編號",="平台名稱",="付款方式",="費率(每筆)",="信用卡授權單號",="信用卡卡號末4碼",="超商資訊/ATM繳款帳號",="付款狀態",="交易金額",="退款日期",="退款金額",="交易手續費",="平台手續費",="應收款項(淨額)",="撥款狀態",="買家備註",="廠商備註"';
        var mediaData = fs.readFileSync(global.newVersionCsvPath);

        if (/^win/.test(process.platform)) {
          mediaData = iconv.decode(mediaData, 'Big5');
        } else {
          mediaData = mediaData.toString("utf8")
        }

        expect(mediaData).to.include(header);

        done();
      });
    });
  });

  describe(".genCheckMacValue", function() {
    it("should check parameter type", function(done) {
      expect(allpay.genCheckMacValue.bind(allpay, undefined)).to.throw(Error, /^Parameter should be \w+$/)

      done();
    });

    it("should generate CheckMacValue by MD5", function() {
      var checkMacValue = allpay.genCheckMacValue({
        MerchantID: "2000214",
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016/06/22 01:00:00",
        PaymentType: "aio",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        ItemName: "德國原裝進口自動鉛筆 60 元 x 1#橡皮擦 20 元 x 2",
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      });

      expect(checkMacValue).to.equal("54642B0DC72A9586945F70AB30276486");
    });

    it("should generate CheckMacValue by SHA256", function() {
      var checkMacValue = allpay.genCheckMacValue({
        MerchantID: "2000214",
        MerchantTradeNo: "TS20160622900001",
        MerchantTradeDate: "2016/06/22 01:00:00",
        PaymentType: "aio",
        TotalAmount: 100,
        TradeDesc: "Hello World 網路商城",
        EncryptType: Allpay.CONSTANTS.ENCRYPT_TYPE.SHA256,
        ItemName: "德國原裝進口自動鉛筆 60 元 x 1#橡皮擦 20 元 x 2",
        ReturnURL: "http://localhost/receive",
        ChoosePayment: Allpay.CONSTANTS.PAYMENT_METHOD.ALL
      });

      expect(checkMacValue).to.equal("D1EE584C38B6AE6A1DCFA34455C3DE492731A0B4E0CD7FEF6A61D573EA516012");
    });
  });
});
