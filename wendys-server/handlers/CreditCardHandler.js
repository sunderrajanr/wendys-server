/**
 * CRUD methods for Credit Card Resource.
 *
 * Created by nchitalia on 11/6/14.
 */

var https = require('https');
var mongojs = require('mongojs');
var creditCard = require('../models/CreditCard');
var commons = require('../helpers/Commons');
var creditCardHelper = require('../helpers/CreditCardHelper');
var hostConfig = require('../config/HostConfig');

var connection_string = hostConfig.provAccountDBHost + ":" + hostConfig.provAccountDBPort + '/provisionalaccountdb'
var db = mongojs(connection_string, ['provisionalaccountdb']);
var provisionalAccounts = db.collection("provisionalaccount");

var ENDPOINT = hostConfig.adminServiceHost
var ADMIN_PORT = hostConfig.adminServicePort;

/**
 * Handler to add Credit Card to an account.
 *
 * @param req
 * @param res
 * @param next
 */
exports.addCreditCard = function(req , res , next) {
    console.log("inside method addCreditCard");

    var errorDO = {}; //placeholder for error object

    if(req.params === null) {
        console.log("Empty Request for addCreditCard!!")
        errorDO = commons.createErrorObject(400, "Empty Request", "Request is NULL, please try again with a valid request")
        res.send(400, errorDO);
    }

    console.log("Header Object: " + JSON.stringify(req.headers, null, 4));
    console.log("Request Object: " + JSON.stringify(req.body, null, 4));

    //Header validation for Content Negotiation and Authorization header
    if(!commons.validateHeader(req, res) || !commons.validateAuthHeader(req, res)) {
        return next();
    }

    // add common response headers
    commons.addResponseHeaders(res);

    //validate request object
    if(!creditCardHelper.validateCardRequest(req, res)) {
        console.log("Credit Card Validation failed!!");
        return next();
    }

    //make sure provisonal account is valid and exists in local DB
    console.log("Provisional Account ID to be validated in DB: " + req.params.provisionalAccountID);

    provisionalAccounts.find({provisionalAccountID : req.params.provisionalAccountID} , function(provAccountError , provAccountRes) {

        if(provAccountRes) {

            console.log("Provisional Account DB transaction successful!!");

            if(!commons.isObjectNull(provAccountRes[0])) {

                console.log("Provisonal Account exists: " + provAccountRes[0].provisionalAccountID);

                //since account exists, let's add Credit Card
                console.log("Going to call Wallet API to add Credit Card");
                var cardOptions = {
                    hostname: ENDPOINT,
                    port: ADMIN_PORT,
                    path: '/v1/wallet/@me/financial-instruments/payment-cards',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': req.header('Authorization')
                    }

                };

                //set up the Credit Card Request Payload
                var cardReqPayload = {
                    type : req.params.type,
                    card_number : req.params.card_number,
                    expire_month : req.params.expire_month,
                    expire_year : req.params.expire_year,
                    first_name : req.params.first_name,
                    last_name : req.params.last_name,
                    cvv2 : req.params.cvv2,
                    billing_address : {
                        address : {
                            line1 : req.params.billing_address.address.line1,
                            line2 : req.params.billing_address.address.line2,
                            city : req.params.billing_address.address.city,
                            state : req.params.billing_address.address.state,
                            postal_code : req.params.billing_address.address.postal_code,
                            country_code : req.params.billing_address.address.country_code
                        }
                    }

                };

                var cardReqJSONPayload = JSON.stringify(cardReqPayload);
                console.log("Request Payload to be sent to Wallet API: " + cardReqJSONPayload);

                var cardReq = https.request(cardOptions, function(cardRes) {

                    console.log("Card Service statusCode: ", cardRes.statusCode);
                    console.log("Card Service Response headers: ", cardRes.headers);

                    cardRes.on('data', function(cardData) {
                        console.log("Here is Response Data from Card Service: " + cardData);

                        var parsedCardObj = JSON.parse(cardData);

                        if(cardRes.statusCode === 200)  { //if Credit Card was successfully added

                            var cardID = parsedCardObj.id; //this id will be used while confirming the card
                            console.log("Here is the Card ID added to the Prov Account: " + cardID);

                            var creditCard = creditCardHelper.mapSingleCardToResponseObj(parsedCardObj);

                            res.send(201, creditCard); //once card is successfully added, return the response to the clients

                            //After returning the response to clients, continue to call Card Confirmation APIs in the background
                            console.log("Going to initiate Card Confirmation!!");

                            var confirmationHateoasLinks = parsedCardObj.links;  //array of HATEOAS links

                            var confirmationAPILink, confirmationAPIRel, confirmationAPIMethod; //variables to store HATEOAS states

                            for(var i = 0; i < confirmationHateoasLinks.length; i++) {
                                console.log("Rel Type in HATEOAS: " + confirmationHateoasLinks[i].rel);

                                if(confirmationHateoasLinks[i].rel === "initiate_confirmation") {
                                    confirmationAPILink = confirmationHateoasLinks[i].href;
                                    confirmationAPIRel = confirmationHateoasLinks[i].rel;
                                    confirmationAPIMethod = confirmationHateoasLinks[i].method;

                                    console.log("Next link to be called for Card Confirmation: " + confirmationAPILink + " :::: Method: " + confirmationAPIMethod);
                                }
                            }

                            //call initiate-confirmation API for the Card
                            var initiateConfirmationOptions = {
                                hostname: ENDPOINT,
                                port: ADMIN_PORT,
                                path: confirmationAPILink,
                                method: confirmationAPIMethod,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization' : req.header('Authorization')
                                }
                            };

                            var initiateConfReq = https.request(initiateConfirmationOptions, function(initiateConfRes) {

                                console.log("Service statusCode from Initiate Card Confirmation Service: ", initiateConfRes.statusCode);
                                console.log("Response headers from Initiate Card Confirmation Service: ", initiateConfRes.headers);

                                initiateConfRes.on('data', function(initiateConfData) {
                                    console.log("Here is Response Data from Initiate Confirmation Service: " + initiateConfData);

                                    var parsedinitConfData = JSON.parse(initiateConfData);
                                    console.log("Status value from Parsed Initiate Card Confirmation API Response: " + parsedinitConfData.status);

                                    /**
                                     * Call Complete Confirmation if following condition satisfies from Initiate Confirmation Service Call
                                     *  if(status === 200 && status == "initiate" -> call complete_confirmation service
                                     *  else -> show error and skip card_confirmation service call
                                     *
                                     */
                                    if((initiateConfRes.statusCode === 200) && (parsedinitConfData.status === "inititated")) { //"inititated" status value comes misspelled from Card Confirmation Service
                                        console.log("Initiate Card Confirmation Service call is successful!!");

                                        //Call Complete Confirmation API for added card

                                        var completeConfirmationLink = '/v1/wallet/@me/financial-instruments/payment-cards/' + cardID + '/complete-confirmation/paypal-code';
                                        console.log("Here is Complete Confirmation API Link: " + completeConfirmationLink);

                                        var completeConfReqPayload = {
                                            confirmation_code : '6152'
                                        };

                                        var completeConfStringifiedReq = JSON.stringify(completeConfReqPayload);
                                        console.log("Complete Card Confirmation Req Payload: " + completeConfStringifiedReq);

                                        var completeConfirmationOptions = {
                                            hostname: ENDPOINT,
                                            port: ADMIN_PORT,
                                            path: completeConfirmationLink,
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                'Accept': 'application/json',
                                                'Authorization' : req.header('Authorization')
                                            }
                                        };

                                        console.log("Going to call Complete Card Confirmation API!!");

                                        var completeConfirmationReq = https.request(completeConfirmationOptions, function(completeConfirmationRes) {

                                            console.log("Service statusCode from Complete Confirmation Service: ", completeConfirmationRes.statusCode);
                                            console.log("Response headers from Complete Confirmation Service: ", completeConfirmationRes.headers);

                                            completeConfirmationRes.on('data', function(completeConfData) {
                                                console.log("Here is Response Data from Complete Confirmation Service: " + completeConfData);

                                                var parsedCompleteConfData = JSON.parse(completeConfData);

                                                var completeConfStatus = parsedCompleteConfData.status;
                                                console.log("Status value from Parsed Complete Card Confirmation API Response: " + completeConfStatus);

                                                if((completeConfirmationRes.statusCode === 200) && (completeConfStatus === "confirmed")) {
                                                    console.log("This Credit Card was successfully confirmed: " + cardID);
                                                    return next();
                                                } else {
                                                    console.log("This Credit Card confirmation FAILED: " + cardID + ", please try again by calling Card Complete Confirmation API.");
                                                    return next();
                                                }

                                            });

                                        });

                                        completeConfirmationReq.write(completeConfStringifiedReq);

                                        completeConfirmationReq.end();

                                        completeConfirmationReq.on('error', function(e) {
                                            console.error("Error occurred while completing Card Confirmation call: " + e);
                                            return next();
                                        });

                                    } else {
                                        console.log("Initiate Card Confirmation Service call Failed, re-initiate card confirmation for this card: " + cardID);
                                        return next();
                                    }

                                });

                            });

                            initiateConfReq.end();

                            initiateConfReq.on('error', function(e) {
                                console.error("Error Occured during Initiate Card Confirmation Service: " + e);
                            });

                        } else {

                            console.log("Some error occurred while adding card!!");

                            //Populate Error Object Received from Add Card Service
                            var cardErrorDetails; //variable to store error Message Details from Card Service

                            if(!commons.isObjectNull(parsedCardObj.details[0])) {
                                cardErrorDetails = parsedCardObj.details[0].issue;
                            }
                            errorDO = commons.createErrorObject(cardRes.statusCode, parsedCardObj.message, cardErrorDetails);
                            res.send(cardRes.statusCode, errorDO);
                            return next();
                        }

                    });

                });

                cardReq.write(cardReqJSONPayload);

                cardReq.end();

                cardReq.on('error', function(cardError) {
                    console.error("Error Occurred while executing Card Service Request: " + cardError);
                });



            } else {

                console.log("No matching Provisional Account Found");
                errorDO = commons.createErrorObject(404, "Account doesn't exist!!", "This account doesn't exist, please provide a valid account to add a new Credit Card!!");
                res.send(404, errorDO);
                return next();

            }


        } else {

            console.log("Provisional Account DB transaction failed!!");
            res.send(500, "DB Transaction Error", provAccountError);
            return next();

        }

    });

}

/**
 * This method gets credit card data for a provisional account.
 *
 * @param req - http request
 * @param res - http response
 * @param next - next middleware function to be called
 */
exports.getCreditCard = function(req, res, next) {
    var errStr;
    var errorObject;

    console.log("inside getCreditCard method");
    console.log("Header Object: " + JSON.stringify(req.headers, null, 4));

    //Header validation for Content Negotiation and Authorization header
    if(!commons.validateHeader(req, res) || !commons.validateAuthHeader(req, res)) {
        return next();
    }

    // check request params, if null throw error.
    if(!creditCardHelper.validateGetCreditCardReq(req, res)) {
        console.log("getCreditCard: invalid request for getCreditCard");
        return next();
    }

    var provAcctId = req.params.provisionalAccountID;

    // first find if the provisional account id exists in db, so as to make sure the account for which the credit
    // card details are requested is a valid account
    provisionalAccounts.find({provisionalAccountID : provAcctId} , function(provAcctError , provAcctResponse) {
        if(provAcctResponse) {
            if(!commons.isObjectNull(provAcctResponse[0])) {
                console.log("Provisional account " + provAcctId + " exists in db. Invoke wallet payment-cards api to get credit card details");

                var paymentCardOptions = {
                    hostname: ENDPOINT,
                    port: ADMIN_PORT,
                    path: '/v1/wallet/@me/financial-instruments/payment-cards',
                    method: 'GET',
                    headers: {
                        'Content-Type': req.header('Content-Type'),
                        'Accept': req.header('Accept'),
                        'Authorization' : req.header('Authorization')
                    }

                };

                var paymentCardReq = https.request(paymentCardOptions, function(paymentCardResponse) {
                    var statusCode = paymentCardResponse.statusCode
                    console.log("Wallet payment-cards service statusCode: ", statusCode);
                    console.log("Wallet payment-cards service response headers: ", paymentCardResponse.headers);

                    if(statusCode != 200) {
                        console.log("Non 200 statusCode: " + statusCode);
                        errorObject = errorObject = commons.createErrorObject(statusCode, "Non 200 response", "Error fetching credit card data for provisional account: " + provAcctId);
                        res.send(statusCode, errorObject);
                        return next();
                    }

                    paymentCardResponse.on('data', function(paymentCardData) {
                        console.log("payment-card response: " + paymentCardData);

                        var responseObj = JSON.parse(paymentCardData);

                        if(commons.isObjectNull(responseObj)) {
                            errorObject = commons.createErrorObject(500, "Undefined payment card response object", "Can't perform mapping from an undefined object");
                            res.send(500, errorObject);
                            return next();
                        } else {
                            var creditCardList = creditCardHelper.mapPaymentCardRespToResponseObj(responseObj);
                            res.send(200, creditCardList);
                            return next();
                        }
                    });

                });

                paymentCardReq.end();

                paymentCardReq.on('error', function(e) {
                    errStr = "Error fetching credit card data for provisional account " + provAcctId + " " + e;
                    errorObject = commons.createErrorObject(500, "Get credit card error", errStr);
                    res.send(500, errorObject);
                    return next();
                });

            } else {
                errStr = "provisional account " + provAcctId + " does not exist in db";
                console.log(errStr);
                errorObject = commons.createErrorObject(404, "Provisional account does not exist!", errStr);
                res.send(404, errorObject);
                return next();
            }
        } else {
            errStr = "Error fetching provisional account from db: " + provAcctError;
            console.log(errStr);
            errorObject = commons.createErrorObject(500, "Internal Server Error", errStr);
            res.send(500, errorObject);
            return next();
        }
    });
}