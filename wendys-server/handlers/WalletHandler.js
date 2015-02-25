/**
 * Handler for all the CRUD operations on Wallet Resource.
 *
 * Created by Prabhash Rathore on 11/5/14.
 *
 */

var mongojs = require('mongojs');

var externalWallet = require('../models/ExternalWallet');
var errorObject = require('../models/Error');

var commons = require('../helpers/Commons');
var helper = require('../helpers/WalletHelper');
var hostConfig = require('../config/HostConfig');

var connection_string = hostConfig.provAccountDBHost + ":" + hostConfig.provAccountDBPort + '/provisionalaccountdb'
var db = mongojs(connection_string, ['provisionalaccountdb']);

var provisionalAccounts = db.collection("provisionalaccount");
var externalWallets = db.collection("externalwallet");

/**
 * This method will accept Wallet Object in the request and link this Wallet to the given Provisional Account.
 *
 * Before adding the new wallet, following validations will be done:
 *  - Validate request
 *  - Validate headers
 *  - Validate if this wallet is already added to this provisional account
 *  - Validate if this is a valid provisional account
 *  - if everything is validated as expected then add the wallet to this provisional account.
 *
 * @param req
 * @param res
 * @param next
 */
exports.addWallet = function(req , res , next) {

    console.log("inside method addWallet");

    if(req.params === null) {
        console.log("Empty Request sent to addWallet!!");
        throw "Request is NULL, please try again with a valid request!!";
    }

    console.log("Request Header: " + JSON.stringify(req.headers, null, 4));
    console.log("Request Body: " + JSON.stringify(req.body, null, 4));

    //Header validation for Content Negotiation
    if(!commons.validateHeader(req, res)) {
        return next();
    }

    var externalWalletEntity = require('../entityobjects/ExternalWalletEntity'); //load the ExternalWalletEntity object
    externalWalletEntity = helper.mapWalletReqToDBEntity(req, externalWalletEntity);

    commons.addResponseHeaders(res); //add some general headers to response

    //validate if this wallet is already added to this provisional account
    externalWallets.find({provisionalAccountID : externalWalletEntity.provisionalAccountID, walletID : externalWalletEntity.walletID}, function(err, success) {
        if(success) {
            console.log("Here is Wallet DB Response: " + JSON.stringify(success, null, 4));
            if(!commons.isObjectNull(success[0])) {

                console.log("This Wallet is already added to this Provisional Account, can't add this duplicate wallet: " + success[0].walletID);
                errorObject = commons.createErrorObject(409, "Duplicate Wallet Request", "This Wallet is already added to this Provisional Account, add a new Wallet.");
                res.send(409, errorObject); //send 409 as duplication is not allowed

            } else {

                //Validate Provisional account exists in local DB
                provisionalAccounts.find({provisionalAccountID : req.params.provisionalAccountID} , function(err , success) {

                    if (success) {
                        console.log("Successful DB transaction, here is the object:  " + JSON.stringify(success));

                        if(!commons.isObjectNull(success[0])) {
                            console.log("First object in DB Response: " + JSON.stringify(success[0]));

                            //Persist Wallet in DB
                            externalWallets.save(externalWalletEntity , function(err , success) {
                                if(success) {
                                    console.log('Response success after pushing data to DB ' + success);
                                    res.send(201 , externalWalletEntity);
                                    return next();
                                } else {
                                    console.log('Response error after pushing data to DB' + err);
                                    return next(err);
                                }
                            });

                            return next();
                        } else {
                            console.log("No matching account found in DB collection: " + JSON.stringify(success[0]));
                            errorObject = commons.createErrorObject(404, "Account doesn't exist!!", "This account doesn't exist, please provide a valid account to add a new wallet!!");
                            res.send(404, errorObject);

                        }

                        return next();

                    } else {
                        console.log("DB Transaction error " + err);
                        errorObject = commons.createErrorObject(500, "Internal Server Error", "Error fetching provisional account from DB");
                        res.send(500, errorObject);
                        return next(err);
                    }

                });

            }
        } else {
            console.log("Some error occurred: " + err);
            errorObject = commons.createErrorObject(500, "Internal Server Error", "Some error occurred. " + err);
            res.send(500, errorObject);
            return next(err);
        }
    });

}

/**
 * This function gets the wallet information for a particular provisional account id.
 *
 * @param req
 * @param res
 * @param next
 */
exports.findWallet = function(req, res, next) {
    console.log("inside method findWallet");

    console.log("Request Header: " + JSON.stringify(req.headers, null, 4));

    // add general response headers
    commons.addResponseHeaders(res);

    var provAcctId = req.params.provisionalAccountID;

    if(commons.isPropertyEmpty(provAcctId)) {
        var errStr = "Request param provisionalAccountID is either null or undefined";
        console.log(errStr);
        errorObject = commons.createErrorObject(400, "Bad Request", errStr);
        res.send(400, errorObject);
    } else {
        // check if the provisional account exists in db. If account exists, find wallet data for the account
        // If wallet data is found, we return a 200 OK response
        // If provisional account does not exist, send a 404 error response
        provisionalAccounts.find({provisionalAccountID : provAcctId} , function(provAcctError , provAcctResponse) {
            if(provAcctResponse) {
                if(provAcctResponse[0] !== undefined) {
                    externalWallets.find({provisionalAccountID : provAcctId}, function(walletError , walletResponse) {
                        if(walletResponse) {
                            console.log("findWallet response from DB:  " + JSON.stringify(walletResponse));
                            var walletList = [];
                            if(walletResponse.length > 0) {
                                console.log("Wallet data found in db for provisional account: " + provAcctId);
                                walletList = helper.mapWalletDBToResponseObj(walletResponse);
                            } else {
                                console.log("No wallet data found in db for provisional account: " + provAcctId);
                            }
                            res.send(200 , walletList);
                        } else {
                            var errStr = "Error fetching wallet data from db: " + walletError;
                            console.log(errStr);
                            errorObject = commons.createErrorObject(500, "Internal Server Error", errStr);
                            res.send(500, errorObject);
                        }
                    });
                } else {
                    var errStr = "provisional account " + req.params.provisionalAccountID + " does not exist in db";
                    console.log(errStr);
                    errorObject = commons.createErrorObject(404, "Provisional account does not exist!", errStr);
                    res.send(404, errorObject);
                }
            } else {
                var errStr = "Error fetching provisional account from db: " + provAcctError;
                console.log(errStr);
                errorObject = commons.createErrorObject(500, "Internal Server Error", errStr);
                res.send(500, errorObject);
            }

            return next();
        });
    }
}