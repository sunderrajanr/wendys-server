/**
 * Helper functions to validate and map Credit Card objects.
 *
 * Created by nchitalia on 11/18/14.
 */

var commons = require('./Commons');

/**
 * This function is used to validate Credit Card object before persisting this object in our system.
 *
 * @params request
 * @params response
 * @return boolean
 */
exports.validateCardRequest = function(request, response) {
    console.log("CreditCardHelper: inside method validateCardRequest");

    var errorDO = {};

    if(commons.isObjectNull(request.params)) {
        console.log("Empty Request to add Credit Card!!");
        errorDO = commons.createErrorObject(400, "Empty Request", "Request is NULL, please try again with a valid request!!");
        response.send(errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.provisionalAccountID)) {
        errorDO = commons.createErrorObject(400, "Empty Provisional Account", "Can't add a Card to an empty Provisional Account");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.type)) {
        errorDO = commons.createErrorObject(400, "Empty Card Type", "Can't add a Card without a valid Card Type");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.card_number)) {
        errorDO = commons.createErrorObject(400, "Empty Card Number", "Can't add a Card without a valid Card Number");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.expire_month)) {
        errorDO = commons.createErrorObject(400, "Empty Card Expiration Month", "Can't add a Card without a valid Card Expiration Month");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.expire_year)) {
        errorDO = commons.createErrorObject(400, "Empty Card Expiration Year", "Can't add a Card without a valid Card Expiration Year");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.first_name)) {
        errorDO = commons.createErrorObject(400, "Empty First Name on Card", "Can't add a Card without a valid First Name on Card");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.last_name)) {
        errorDO = commons.createErrorObject(400, "Empty Last Name on Card", "Can't add a Card without a valid Last Name on Card");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.cvv2)) {
        errorDO = commons.createErrorObject(400, "Empty CVV value", "Can't add a Card without a valid CVV value on Card");
        response.send(400, errorDO);
        return false;
    }

    if(commons.isObjectNull(request.params.billing_address)) {
        errorDO = commons.createErrorObject(400, "Empty Billing Address", "Can't add a Card without a valid Billing Address");
        response.send(400, errorDO);
        return false;
    }

    if(!commons.validateAddress(request.params.billing_address.address, response)) {
        console.log("Address validation failed");
        return false;
    }

    console.log("Credit Card Request object looks good!!");
    return true;

}

/**
 * This method validates the getCreditCard request
 *
 * @param request
 * @param response
 * @returns true if the request is valid, false otherwise
 */
exports.validateGetCreditCardReq = function(request, response) {
    var errorObject;

    console.log("Inside validateGetCreditCardReq method");

    if(commons.isObjectNull(request.params)) {
        console.log("Empty Request for getCreditCard!!");
        errorObject = commons.createErrorObject(400, "Bad Request", "Request is NULL, please try again with a valid request!!");
        response.send(400, errorObject);
        return false;
    }

    if(commons.isPropertyEmpty(request.params.provisionalAccountID)) {
        var errStr = "Request param provisionalAccountID is either null or undefined";
        console.log(errStr);
        errorObject = commons.createErrorObject(400, "Bad Request", errStr);
        response.send(400, errorObject);
        return false;
    }

    console.log("Get Credit Card request looks good");
    return true;
}

/**
 * This method maps the response returned from payment-cards to
 * the response object.
 *
 * If you just need to map one Credit Card Object then instead call mapSingleCardToResponseObj() function.
 *
 * @param paymentCardRespObj - List of Credit Card
 * @returns list of credit card objects.
 */
exports.mapPaymentCardRespToResponseObj = function(paymentCardRespObj) {
    console.log("inside mapPaymentCardRespToResponseObj method");

    if(commons.isObjectNull(paymentCardRespObj)) {
        console.log("paymentCardRespObj is undefined");
        var errorObj = commons.createErrorObject(500, "Undefined payment card response object", "Can't perform mapping from an undefined object");
        throw errorObj;
    }

    var creditCardList = [];
    for(var i = 0; i < paymentCardRespObj.length; i++) {

        var creditCardObj = this.mapSingleCardToResponseObj(paymentCardRespObj[i]);
        creditCardList.push(creditCardObj);

    }

    console.log("payment-card response mapped successfully");
    return creditCardList;

}


/**
 * This function is used to map one Credit Card object to a Response Object to be sent to clients.
 *
 * If you want to map a list of cards then please use this function mapPaymentCardRespToResponseObj().
 *
 * @param cardObj - Single Credit Card Object received from API Call
 * @return Translated Credit Card Object to be sent to clients
 *
 */
exports.mapSingleCardToResponseObj = function(cardObj) {

    console.log("CreditCardHelper:: inside mapSingleCardToResObj method");

    if(commons.isObjectNull(cardObj)) {
        var errorObj = commons.createErrorObject(500, "Undefined Card Object", "Can't perform mapping from an undefined object");
        throw errorObj;
    }

    var creditCard = require('../models/CreditCard');

    creditCard = Object.create(creditCard); //create new Instance of Credit Card to prevent overwriting of objects when these are pushed to an array

    creditCard.cardNumber = cardObj.card_number_last_n;
    creditCard.cardType = cardObj.type;
    creditCard.expirationMonth = cardObj.expire_month;
    creditCard.expirationYear = cardObj.expire_year;
    creditCard.firstName = cardObj.first_name;
    creditCard.lastName = cardObj.last_name;
    creditCard.confirmation_status = cardObj.confirmation_status;

    var billingAddress = cardObj.billing_address;

    if (!commons.isObjectNull(billingAddress)) {
        var addressObj = billingAddress.address;

        var address = require('../models/Address');

        address = Object.create(address); //create new instance of address everytime in order to prevent overwriting of address objects in destination array

        address.address1 = addressObj.line1;
        address.address2 = addressObj.line2;
        address.city = addressObj.city;
        address.state = addressObj.state;
        address.zip = addressObj.postal_code;
        address.country = addressObj.country_code;
    }

    creditCard.address = address;

    return creditCard;

}