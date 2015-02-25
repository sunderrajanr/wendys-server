/**
 *
 * This is the request object which is sent to PayPal Onboarding Service tp create a new ghost account.
 *
 * Created by prrathore on 10/31/14.
 */

var onboardingReqObject = {
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
            "capability": String          //Possible Values: CREATE_ACCOUNT, ADD_CARD
        },
        "content": {
            "country_of_account": {
                "country": "US"
            },
            "personal_preferences": {
                "language": "en_US"
            },
            "credentials": {
                "email": String,
                "password": String
            },
            "personal_information_name": {
                "first": "Provisional",
                "middle": "Account",
                "last": "Service"
            },
            "personal_information_location": { //intentionally address is hard coded as we don't receive address from Mobile SDK and this is needed to create account
                "line1": "2211",
                "line2": "N First St",
                "city": "San Jose",
                "county": "CA",
                "post_code": "95131",
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

module.exports = onboardingReqObject;
