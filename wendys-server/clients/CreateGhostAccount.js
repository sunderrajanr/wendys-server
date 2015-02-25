/**
 * Create a Ghost Account on PayPal side by calling PayPal Onboarding Service.
 *
 * Created by prrathore on 10/20/14.
 */

var https = require('https');
var querystring = require('querystring');

//var CLIENT_ID = "AVHBKRBeCwEWnvYb7GRzR7EibKoWZ7PkBko_BDoTycwXlmv1sb1aN2_Saucb";
//var SECRET = "EFxaDRB_pBnkhRS9JoOsVAEitKksa2PF6mkXHcS94EFbC16hAZGxAO8_VWrd";
var ACCESS_TOKEN = 'A015o-KCs7KQMsP3pSXJksxtY8BJ2iuhHC0RA5VN9md.4ZY'; //Generated from OAuth-Token Service call

var ENDPOINT="api.sandbox.paypal.com";
//var ARIES_URL="https://sandbox.paypal.com/checkoutnow/2?token=";

var options = {
    hostname: ENDPOINT,
    port: 443,
    path: '/v1/customer/onboarding/applications/',
    method: 'POST',
    headers: {
        //'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Type': 'application/json',
        'Accept-Charset': 'utf8',
        'Authorization': 'Bearer ' + ACCESS_TOKEN,
        'Accept': 'application/json',
        'paypal-entry-point': 'http://uri.paypal.com/Web/Web/Consumer/consonbdnodeweb/createAccount',
        'npp_remote_addr': '127.0.0.1',
        'browser_raw_data': '=na~a3=na~a4=Mozilla~a5=Netscape~a6=5.0(Macintosh)~a7=20100101~a8=na~',
        'fso_id': 'QfEdm_0flMaZ9dCx36ShlQ620yWv6ibiOYEBQnMUGZGVYHSAbxG_DPWTwTC',
        'fso_blocked': 'false',
        'flash_enabled': 'true',
        'visitor_id': '1234567890'
    }

};

var reqJSONObject = {
    "dimension": {
        "country": "US",
        "customer_type": "CONSUMER",
        "business_channel": "ANY",
        "technical_channel": "WEB",
        "partner_channel": null,
        "experience_channel": "ANY",
        "intents": ["CREATE_ACCOUNT",
            "LINK_BANK_ACCOUNT",
            "LINK_CREDIT_CARD"]
    },
    "customer_id_type": null,
    "customer_id": null,
    "status": "IN_PROGRESS",
    "id": null,
    "errors": [],
    "links": [],
    "documents": [{
        "id": "",
        "name": "DocumentConsumerCreateAccountFormI",
        "dimension": {
            "country": "US",
            "customer_type": "CONSUMER",
            "business_channel": "ANY",
            "technical_channel": "WEB",
            "partner_channel": null,
            "experience_channel": "ANY",
            "capability": "CREATE_ACCOUNT"
        },
        "content": {
            "country_of_account": {
                "country": "US"
            },
            "personal_preferences": {
                "language": "en_US"
            },
            "credentials": {
                "email": "aegree2@ebay.com",
                "password": "12345"
            },
            "personal_information_name": {
                "first": "Saravanan",
                "middle": "K",
                "last": "Shanmugam"
            },
            "personal_information_location": {
                "line1": "3000 Aurora Ter",
                "line2": "M300",
                "city": "Fremont",
                "county": "CA",
                "post_code": "94536",
                "country": "US"
            },
            "personal_information_contact": {
                "country_code": "00",
                "phone_number": "4082451112",
                "extn": "",
                "tag": "MOBILE"
            },
            "personal_information_identification": {
                "date_of_birth": "19800101",
                "country_of_citizenship": "US",
                "tax_identifier": "619634287"
            },
            "password_recovery": {
                "security_question_1": "What was the name of your first school?",
                "security_question_2": "PayPal",
                "security_answer_1": "What was the name of your first pet",
                "security_answer_2": "eBay"
            },
            "legal_consent": {
                "credit_header_consent_flag": false,
                "market_email_opt_out_flag": false,
                "legal_agreement_flag": false,
                "major_version": "3",
                "minor_version": "2",
                "agreement_type": "C"
            }
        },
        "section_meta_data": [],
        "status": null,
        "errors": [],
        "links": []
    }]
};

//var reqJSONObject = {
//    "dimension": {
//        "country": "US",
//        "customer_type": "CONSUMER",
//        "business_channel": "ANY",
//        "technical_channel": "WEB",
//        "partner_channel": null,
//        "experience_channel": "ANY",
//        "intents": ["CREATE_ACCOUNT",
//            "LINK_BANK_ACCOUNT",
//            "LINK_CREDIT_CARD"]
//    },
//    "customer_id_type": null,
//    "customer_id": null,
//    "status": "IN_PROGRESS",
//    "id": null,
//    "errors": [],
//    "links": [],
//    "documents": [{
//        "id": "",
//        "name": "DocumentConsumerCreateAccountFormI",
//        "dimension": {
//            "country": "US",
//            "customer_type": "CONSUMER",
//            "business_channel": "ANY",
//            "technical_channel": "WEB",
//            "partner_channel": null,
//            "experience_channel": "ANY",
//            "capability": "CREATE_ACCOUNT"
//        },
//        "content": {
//            "country_of_account": {
//                "country": "US"
//            },
//            "personal_preferences": {
//                "language": "en_US"
//            },
//            "credentials": {
//                "email": "aegree2@ebay.com",
//                "password": "12345"
//            },
//            "personal_information_name": {
//                "first": "Prabhash",
//                "middle": "",
//                "last": "Rathore"
//            },
//            "personal_information_location": {
//                "line1": "",
//                "line2": "",
//                "city": "",
//                "county": "",
//                "post_code": "",
//                "country": ""
//            },
//            "personal_information_contact": {
//                "country_code": "",
//                "phone_number": "",
//                "extn": "",
//                "tag": ""
//            },
//            "personal_information_identification": {
//                "date_of_birth": "",
//                "country_of_citizenship": "",
//                "tax_identifier": ""
//            },
//            "password_recovery": {
//                "security_question_1": "",
//                "security_question_2": "",
//                "security_answer_1": "",
//                "security_answer_2": ""
//            },
//            "legal_consent": {
//                "credit_header_consent_flag": false,
//                "market_email_opt_out_flag": false,
//                "legal_agreement_flag": false,
//                "major_version": "3",
//                "minor_version": "2",
//                "agreement_type": "C"
//            }
//        },
//        "section_meta_data": [],
//        "status": null,
//        "errors": [],
//        "links": []
//    }]
//};

var postData1 = querystring.stringify(reqJSONObject);
console.log("PostData1 : " + postData1);

var postData2 = JSON.stringify(reqJSONObject);
console.log("JSON Stringfy PostData : " + postData2);

var postData = JSON.stringify(reqJSONObject);
console.log("JSON Parsed PostData : " + postData);

var req = https.request(options, function(res) {

    console.log("Service statusCode: ", res.statusCode);
    console.log("Response headers: ", res.headers);

    res.on('data', function(d) {
        console.log("Here is Response Data: " + d);
        var parsedObject = JSON.parse(d);
        console.log("Account Created. ID: " + parsedObject.id + " :: status: " + parsedObject.status);
    });

});

req.write(postData);
req.end();

req.on('error', function(e) {
    console.error("Error Occured: " + e);
});


