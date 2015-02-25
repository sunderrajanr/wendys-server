/**
 * Handlers for all HTTP CRUD operations on Provisional Account Resources.
 *
 * Created by Prabhash Rathore on 10/1/14.
 */

var https = require('https');
var mongojs = require('mongojs');
var async = require('async');
var provisionalAccount = require('../models/ProvisionalAccount');
var onboardingReqObject = require('../models/OnboardingServiceRequest');
var errorObject = require('../models/Error');
var commons = require('../helpers/Commons');
var walletHelper = require('../helpers/WalletHelper');
var creditCardHelper = require('../helpers/CreditCardHelper');
var hostConfig = require('../config/HostConfig');
var config = require('../config/Config');

var connection_string = hostConfig.provAccountDBHost + ":" + hostConfig.provAccountDBPort + '/provisionalaccountdb';
var db = mongojs(connection_string, ['provisionalaccountdb']);

var provisionalAccounts = db.collection("provisionalaccount");
var externalWallets = db.collection("externalwallet");

var CLIENT_ID = config.CLIENT_ID;
var SECRET = config.SECRET;

var ONBOARDING_CLIENT_ID = config.ONBOARDING_CLIENT_ID;
var ONBOARDING_SECRET = config.ONBOARDING_SECRET;

var ENDPOINT = hostConfig.adminServiceHost;
var ADMIN_PORT = hostConfig.adminServicePort;

/**
 * This method will accept Provisional Account data in the request to create a new account.
 *
 * Before creating a new provisional account, following validation will be done:
 *  - Content Negotiation and Content Type must be application/json as this is the only supported MIME for this service as of now.
 *  - At least one of these data pairs are available: email/pwd OR phoneNumber/pin
 *  - merchantID is available to tie this account to a Merchant
 *  - Check local database and make sure this account doesn't already exist with this merchant. Prevent account duplication.
 *
 *  After validating the request data, it makes following PayPal API calls:
 *      - Call OAuth Token Service to fetch the API Token
 *      - After receiving the token, call Onboarding Service to create PayPal Ghost Account
 *      - After creating the account, get a refresh token by calling oAuth2/login API
 *      - Once all 3 API calls are successful, take relevant data and update ProvisionalAccount Data Object and persist to DB
 *
 * Additionally it also does:
 *  - Sets full name it is is available
 *  - By default set the status to "active"
 *  - generate unique field provisionalAccountID by concatenating merchantID + [email OR phoneNumber]
 *
 * @param req
 * @param res
 * @param next
 */
exports.createProvisionalAccount = function(req , res , next) {

    console.log("inside method createProvisionalAccount");

    if(req.params == null) {
        console.log("Empty Request!!")
        throw "Request is NULL, please try again with a valid request!!"
    }

    console.log("Header Object: " + JSON.stringify(req.headers, null, 4));
    console.log("Request Object: " + JSON.stringify(req.body, null, 4));

    //Header validation for Content Negotiation
    if(!commons.validateHeader(req, res)) {
        return next();
    }

    //Make sure Merchant ID is available before creating an account
    if(req.params.merchantID != null) {
        provisionalAccount.merchantID = req.params.merchantID;
        provisionalAccount.provisionalAccountID = req.params.merchantID + '-'; //concatenate merchantID with a separator '-' to make provisionalAccountID unique for a merchant
    } else {
        throw "Account can't be created without a valid Merchant ID!!";
    }

    //validate minimum requirements before creating a new Provisional Account
    if(req.params.email != null && req.params.pwd != null) {
        provisionalAccount.email = req.params.email;
        provisionalAccount.pwd = req.params.pwd;
        provisionalAccount.provisionalAccountID += req.params.email; //append email to provisionalAccountID if email is available
    } else if(req.params.phoneNumber != null && req.params.pin != null) {
        provisionalAccount.phoneNumber = req.params.phoneNumber;
        provisionalAccount.pin = req.params.pin;
        provisionalAccount.provisionalAccountID += req.params.phoneNumber; //append phoneNumber to provisionalAccountID if phoneNumber is available
    } else {
        throw "Either Email/Pwd or Phone/Pin is missing in the request!!"; //throw error if email/pwd or phone/pin is not in request
    }

    //optional field, it will be saved if a value is sent in request
    if(req.params.fullName != null) {
        provisionalAccount.fullName = req.params.fullName;
    }

    provisionalAccount.status = 'active'; //status would be set by default to 'active' while creating a Provisional account

    commons.addResponseHeaders(res); //add some general headers to response

    /**
     * Validate the user doesn't already have an account with this merchant before creating this new user
     *
     */
    console.log("Provisional Account ID to be validated in DB: " + provisionalAccount.provisionalAccountID);
    provisionalAccounts.find({provisionalAccountID : provisionalAccount.provisionalAccountID} , function(err , success) {

        console.log("Going to check if this account already exists with this merchant!!")
        if (success) {
            console.log('Response success on DB validation ' + JSON.stringify(success));

            if(success[0] !== undefined && success[0].provisionalAccountID !== undefined) { //if provisionalaccountid is found in local DB then do not create a new account and return error to api caller

                console.log("Provisional Account ID already exists for this merchant, can't create a duplicate account with this id: " + success[0].provisionalAccountID);
                errorObject = commons.createErrorObject(409, "Dulicate Account Request", "This account already exists so you can't create a new account. Please use these credentials to login directly to the application.");
                res.send(409, errorObject); //send 409 as duplication is not allowed

            } else {

                console.log("Account does not exist, going to create a new account!!");

                /**
                 *
                 * Before persisting provisional account data to DB, call PayPal Services to get Token, create Ghost PayPal Account and get Refresh
                 * Tokens.
                 *
                 */

                 //Call PayPal Token Service /oauth2/token to get the access token

                console.log("Going to call oauth2/token service");
                var tokenOptions = {
                    hostname: ENDPOINT,
                    port: ADMIN_PORT,
                    path: '/v1/oauth2/token?grant_type=client_credentials',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    //auth: CLIENT_ID + ':' + SECRET
                    auth: ONBOARDING_CLIENT_ID + ':' + ONBOARDING_SECRET
                };

                var tokenReq = https.request(tokenOptions, function(tokenRes) {

                    console.log("OAuth Token Service statusCode: ", tokenRes.statusCode);
                    console.log("OAuth Token Service Response headers: ", tokenRes.headers);

                    tokenRes.on('data', function(tokenData) {
                        console.log("Here is Response Data from OAuth Token Service: " + tokenData);
                        var accessToken = JSON.parse(tokenData).access_token; //this access token need to be fed to Onboarding Service header in order to create an account
                        console.log("API Access Token: " + accessToken);

                        //if Token Service returned error then create error object and stop calling other services
                        if(tokenData.error !== undefined) {
                            console.log("Error occurred in Token Service: " + tokenData.error + " <==> MESSAGE: " + tokenData.error_description)
                            errorObject = commons.createErrorObject(500, tokenData.error, tokenData.error_description);
                            res.send(500, errorObject);
                        } else {

                            //Call to Onboarding Service to Create Ghost PayPal Account on PayPal side

                            console.log("Going to call onboarding service");
                            var onboardingOptions = {
                                hostname: ENDPOINT,
                                port: ADMIN_PORT,
                                path: '/v1/customer/onboarding/applications/',
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept-Charset': 'utf8',
                                    'Authorization': 'Bearer ' + accessToken,
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

                            /**
                             *
                             * Onboarding Service only supports email/pwd along with address and terms and conditions information as options to create an Account. It doesn't support phone/pin
                             * so for the prototype as a workaround, we will manipulate email and pwd from provided phone/pin in cases where email/pwd is not provided during sign up. Also fields
                             * like address and terms & conditions are mandatory so we will just stub dummy data in order for this service to work. This is what I will do as workaround for email/pwd:
                             *  if(email == null && phoneNumber != null) {
                             *      email = phoneNumber + "_ghost@paypal.com";
                             *      pwd = pin + "_ghostpwd";
                             *  }
                             *
                             *
                             */

                            var generatedEmail = "ghost-" + req.params.merchantID + "-" + req.params.email; //ghost email linked to specific merchant to be sent to Onboarding service
                            var generatedPwd = "ghostpwd-" + req.params.pwd; //to be sent to Onboarding service

                            if(req.params.email === null) {
                                console.log("No email provided during sign up request!!");
                                generatedEmail = "ghost-" + req.params.merchantID + "-" + req.params.phoneNumber + "@paypal.com";
                                generatedPwd = "ghostpwd-" + req.params.pin;
                            }

                            console.log("Generated Email: " + generatedEmail + " || Generated Password: " + generatedPwd);

                            //customize onboarding request object
                            onboardingReqObject.documents[0].dimension.capability = "CREATE_ACCOUNT";
                            onboardingReqObject.documents[0].content.credentials.email = generatedEmail;
                            onboardingReqObject.documents[0].content.credentials.password = generatedPwd;

                            var onBoardingJSONReqObject = JSON.stringify(onboardingReqObject);
                            console.log("JSON Parsed PostData for Onboarding Service : " + onBoardingJSONReqObject);

                            var onBoardingReq = https.request(onboardingOptions, function(onBoardingRes) {

                                console.log("Service statusCode from Onboarding Service: ", onBoardingRes.statusCode);
                                console.log("Response headers from Onboarding Service: ", onBoardingRes.headers);

                                onBoardingRes.on('data', function(onboardingData) {
                                    console.log("Here is Response Data from Onboarding Service: " + onboardingData);
                                    var parsedOnboardingData = JSON.parse(onboardingData);
                                    console.log("Onboarding Service: Account Created. See below account details:");
                                    console.log("Onboarded Account Application ID: " + parsedOnboardingData.id);
                                    console.log("Onboarded Account Number:" + parsedOnboardingData.customer_id);
                                    console.log("Onboarded Account Status: " + parsedOnboardingData.status);


                                    //if Onboarding Service returned error then create error object and stop calling other services
                                    if(onboardingData.errors !== undefined) {
                                        console.log("Error occurred in Token Service: " + onboardingData.errors.name + " <==> MESSAGE: " + onboardingData.errors.message);
                                        errorObject = commons.createErrorObject(500, onboardingData.errors.name, onboardingData.errors.message);
                                        res.send(500, errorObject);
                                    } else {

                                        provisionalAccount.ghostAccountID = parsedOnboardingData.id; //generated ghost account id need to be persisted

                                        //Call to get Refresh Token

                                        console.log("Going to call Refresh Token service");

                                        var queryStringForRefreshToken = "?response_type=token&grant_type=password&email=" + generatedEmail + "&password=" + generatedPwd + "&redirect_uri=http://stage2p1108.qa.paypal.com:10080/openid-connect-client/clientregistration.jsp&rememberme=true&scope=https://uri.paypal.com/services/mis/customer%20https://uri.paypal.com/services/pos/payments%20https://uri.paypal.com/services/identity/activities%20https://uri.paypal.com/services/wallet/financial-instruments/view%20https://uri.paypal.com/services/wallet/financial-instruments/update";
                                        console.log("Query String for RefreshToken API: " + queryStringForRefreshToken);

                                        var refreshTokenOptions = {
                                            hostname: ENDPOINT,
                                            port: ADMIN_PORT,
                                            path: '/v1/oauth2/login' + queryStringForRefreshToken,
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/x-www-form-urlencoded',
                                                'Accept': 'application/json'
                                            },
                                            auth: CLIENT_ID + ':' + SECRET
                                        };

                                        var refreshTokenReq = https.request(refreshTokenOptions, function(refreshTokenRes) {

                                            console.log("Service statusCode from Refresh Token Service: ", refreshTokenRes.statusCode);
                                            console.log("Response headers from Refresh Token Service: ", refreshTokenRes.headers);

                                            refreshTokenRes.on('data', function(refreshTokenData) {
                                                console.log("Here is Response Data from Refresh Token Service: " + refreshTokenData);

                                                var parsedTokenResponse = JSON.parse((refreshTokenData));

                                                var refreshToken = parsedTokenResponse.refresh_token;
                                                var accessToken = parsedTokenResponse.access_token;
                                                console.log("Refresh Token from Refresh Token Service: " + refreshToken);
                                                console.log("Ning: Acess Token from Refresh Token Service: " + accessToken);

                                                var serviceErrorID = parsedTokenResponse.error;
                                                var serviceErrorMessage = parsedTokenResponse.error_description;

                                                if(serviceErrorID !== undefined) {
                                                    console.log("Error occurred in Refresh Token Service: " + serviceErrorID + " <==> MESSAGE: " + serviceErrorMessage)
                                                    errorObject = commons.createErrorObject(500, serviceErrorID, serviceErrorMessage);
                                                    res.send(500, errorObject);
                                                } else {

                                                    provisionalAccount.refreshToken = refreshToken; //refresh token need to be saved for future API calls
                                                    provisionalAccount.accessToken = accessToken; //refresh token need to be saved for future API calls

                                                    //finally persist data in our Database

                                                    console.log("Going to persist final response in DB");

                                                    provisionalAccounts.save(provisionalAccount , function(err , success) {
                                                        if(success) {
                                                            console.log('Response success after pushing data to DB ' + success);
                                                            res.send(201 , provisionalAccount);
                                                            return next();
                                                        } else {
                                                            console.log('Response error after pushing data to DB' + err);
                                                            return next(err);
                                                        }
                                                    });

                                                    console.log("Going to persist final response in DB ends");

                                                    /** Add code to close Mongo DB Connection after data persistence is done **/

                                                }

                                            });

                                        });

                                        refreshTokenReq.end();

                                        refreshTokenReq.on('error', function(e) {
                                            console.error("Error Occured in Refresh Token Service: " + e);
                                        });

                                        console.log("Going to call Refresh Token service ends");

                                        //Call to get Refresh Token ends here

                                    }

                                });

                            });

                            onBoardingReq.write(onBoardingJSONReqObject);
                            onBoardingReq.end();

                            onBoardingReq.on('error', function(e) {
                                console.error("Error Occured in Onboarding Service: " + e);
                            });

                            console.log("Going to call onboarding service ends");


                            //Call to Onboarding Service to Create Ghost PayPal Account on PayPal side ends

                        }

                    });

                });

                tokenReq.end();

                tokenReq.on('error', function(e) {
                    console.error("Error Occured in Oauth Token Service: " + e);
                });

                console.log("Going to call oauth2/token service ended");

                //Call to PayPal Token Service ends


            }

        } else {
            console.log('DB check failed while validating the account with error ' + err);
            return next(err);
        }

    });

}

/**
 * This function fetches all the data from Provisional Table.
 * Only used for initial testing purpose. This method wouldn't be exposed to any clients.
 *
 * @param req
 * @param res
 * @param next
 */
exports.findAllProvisionalAccounts = function(req, res , next) {

    console.log("inside method findAllProvisionalAccounts");

    commons.addResponseHeaders(res); //add some general headers to response

    provisionalAccounts.find().limit(20).sort({email : -1} , function(err , success) {

        if(success) {
            console.log('Response success '+success);
            res.send(200 , success);
            return next();
        } else {
            console.log('Response error '+err);
            return next(err);
        }

    });

}

/**
 * This method finds the external wallet data for a provisional
 * account
 *
 * @param req - request
 * @param res - response
 * @param callback - callback function
 */
var findExternalWallet = function(req, res, callback) {
    var walletList = [];
    console.log("inside findExternalWallet method");

    //call External Wallet table to fetch all the linked Wallets
    externalWallets.find({provisionalAccountID : req.params.provisionalAccountID}, function(walletError, walletResponse) {
        if(walletResponse) {
            console.log("Number of Wallets linked to this account " + walletResponse.length);

            if(walletResponse.length > 0) {
                walletList = walletHelper.mapWalletDBToResponseObj(walletResponse);
            } else {
                console.log("No linked wallets found with this account");
            }
        } else {
            console.log('External Wallet DB transaction error ' + walletError);
        }
        callback(null, walletList);
    });
}

/**
 * This method gets the credit card details for a provisional account
 *
 * @param req - request
 * @param res - response
 * @param provAcctId - provisional account id
 * @param callback - callback function
 */
var getCreditCard = function(req, res, provAcctId, callback) {
    var creditCardList = [];

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
            callback(null, creditCardList);
        }

        paymentCardResponse.on('data', function(paymentCardData) {
            console.log("payment-card response: " + paymentCardData);

            var responseObj = JSON.parse(paymentCardData);
            if(commons.isObjectNull(responseObj)) {
                console.log("Undefined payment card response object");
            } else {
                creditCardList = creditCardHelper.mapPaymentCardRespToResponseObj(responseObj);
            }
            callback(null, creditCardList);
        });

    });

    paymentCardReq.end();

    paymentCardReq.on('error', function(e) {
        var errStr = "Error fetching credit card data for provisional account " + provAcctId + " " + e;
        console.log(errStr);
        callback(null, creditCardList);
    });
}
/**
 * This function fetches a Provisional Account profile based on Provisional ID match. This operation would return the complete Provisional Account
 * profile along with linked Wallet and wallet assets from PayPal side.
 *
 * @param req
 * @param res
 * @param next
 */
exports.findProvisionalAccount = function(req, res , next) {
    var errStr;
    var errorObject;

    console.log("inside method findProvisionalAccount");

    console.log("Header Object: " + JSON.stringify(req.headers, null, 4));

    //Header validation for Content Negotiation and Authorization header
    if(!commons.validateHeader(req, res) || !commons.validateAuthHeader(req, res)) {
        return next();
    }

    commons.addResponseHeaders(res); //add some general headers to response

    //search based on provisionalAccountID match
    provisionalAccounts.find({provisionalAccountID : req.params.provisionalAccountID} , function(provAcctError , provAcctSuccess) {

        if (provAcctSuccess) {
            console.log('Successful DB transaction, here is the object:  ' + JSON.stringify(provAcctSuccess));

            if(!commons.isObjectNull(provAcctSuccess[0])) {
                //copy the relevant data in response object and send it to clients
                provisionalAccount = mapProvisionalAccountResponseData(provAcctSuccess[0], provisionalAccount)();

                // we need wallet and instruments data to be linked to the provisional account.
                // getting wallet data and getting credit card data can be invoked in parallel
                // and the results of both these calls can be combined together while linking
                // to the provisional account
                var functions = {findExternalWallet : findExternalWallet.bind(null, req, res),
                    getCreditCard : getCreditCard.bind(null, req, res, req.params.provisionalAccountID)};

                async.parallel(functions, function onDone(asyncErr, asyncResponse) {
                    if(asyncErr) {
                        console.log("Error in async function calls: " + asyncErr);
                    } else {
                        var wallet = require('../models/Wallet');

                        // link instruments to provisional account
                        var instruments = require('../models/Instruments');
                        instruments.creditCards = asyncResponse.getCreditCard;
                        wallet.instruments = instruments;

                        // link external wallets to provisional account
                        wallet.externalWallets = asyncResponse.findExternalWallet;
                        res.send(200, provisionalAccount);
                    }
                });
            } else {
                //return 404 as this specific resource isn't found
                errStr = "provisional account " + req.params.provisionalAccountID + " does not exist in db";
                console.log(errStr);
                errorObject = commons.createErrorObject(404, "Provisional account does not exist!", errStr);
                res.send(404, errorObject);
            }

            return next();

        } else {
            console.log('Provisional Account DB error ' + provAcctError);
            errorObject = commons.createErrorObject(500, "Internal Server Error", 'Provisional Account DB error ' + provAcctError);
            res.send(500, errorObject);
            return next();
        }

    });

}

/**
 * Utility function to do data mapping
 *
 * This function will copy data from source object to destination object. This function is also used to prevent sending the whole database row to the clients and thus provide some sort of
 * data filtering.
 *
 */
function mapProvisionalAccountResponseData(source, destination) {
    console.log("Inside mapProvisionalAccountResponseData, map the desired data from DB Object to Response Object to be sent to clients")
    return function() {
      if(source !== undefined) {
          destination.provisionalAccountID = source.provisionalAccountID;
          destination.email = source.email;
          destination.pwd = source.pwd;
          destination.status = source.status;
          destination.merchantID = source.merchantID;
          destination.ghostAccountID = source.ghostAccountID;
          destination.refreshToken = source.refreshToken;
          return destination;
      }

    };

}
