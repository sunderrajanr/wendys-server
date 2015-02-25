/**
 * This is used to map request to DB object for persistance and then map DB resultset object back to Response Object to be sent to clients.
 *
 * Created by Prabhash Rathore on 11/7/14.
 *
 */

var commons = require('./Commons');

/**
 * Utility function to map Request Object to DB Entity for final persistence.
 *
 * @param sourceObj
 * @param destinationObj
 * @returns destinationObj
 */
exports.mapWalletReqToDBEntity = function(sourceObj, destinationObj) {

    console.log("WalletMapper: inside method mapReqToDBEntity");

    if(sourceObj.params === null) {
        console.log("WalletMapper:mapWalletReqToDBEntity - Empty Source Object, can't perform mapping!!");
        throw "Request is NULL, please try again with a valid request!!";
    }

    if(sourceObj.params.walletProvider !== undefined) {
        destinationObj.walletProvider = sourceObj.params.walletProvider;
    } else {
        throw "Wallet Provider can't be blank!!";
    }

    if(sourceObj.params.walletAccountNumber !== undefined) {
        destinationObj.walletAccountNumber = sourceObj.params.walletAccountNumber;
    } else {
        throw "Wallet Account Number can't be blank!!";
    }

    if(sourceObj.params.walletToken !== undefined) {
        destinationObj.walletToken = sourceObj.params.walletToken;
    } else {
        throw "Wallet Token can't be blank!!";
    }

    if(sourceObj.params.isPreferred !== undefined) {
        destinationObj.isPreferred = sourceObj.params.isPreferred;
    } else {
        throw "Preferred field can't be blank!!";
    }

    if(sourceObj.params.status !== undefined) {
        destinationObj.status = sourceObj.params.status;
    } else {
        throw "Status field can't be blank!!";
    }

    //generate an unique wallet id by concatenating
    destinationObj.walletID = sourceObj.params.walletProvider + "-" + sourceObj.params.walletAccountNumber;
    console.log("Unique Wallet ID: " + destinationObj.walletID);

    console.log("Provisional Account ID sent in the request URI: " + sourceObj.params.provisionalAccountID);
    destinationObj.provisionalAccountID = sourceObj.params.provisionalAccountID;

    return destinationObj;

}

/**
 * Map Wallet DB Object to the Response Object to be sent to clients
 *
 * @param walletDB
 * @return Array of External Wallets
 *
 */
exports.mapWalletDBToResponseObj = function(walletDB) {

    console.log("WalletHelper: inside method mapWalletDBToResponseObj");

    if(walletDB === undefined) {
        console.log("walletDB object is undefined");
        var errorObj = commons.createErrorObject(500, "Undefined DB Object", "Can't perform mapping from an undefined wallet object");
        throw errorObj;
    }

    var responseDO = []; //array to store list of linked wallets

    var extWallet = require('../models/ExternalWallet');

    for(var i = 0; i < walletDB.length; i++) {

        extWallet = Object.create(extWallet); //create a new object to prevent overwriting of objects in array as Array.push copy references not actual object

        if(walletDB[i].walletID !== undefined) {
            extWallet.walletID = walletDB[i].walletID;
        }

        if(walletDB[i].walletProvider !== undefined) {
            extWallet.walletProvider = walletDB[i].walletProvider;
        }

        if(walletDB[i].walletAccountNumber !== undefined) {
            extWallet.walletAccountNumber = walletDB[i].walletAccountNumber;
        }

        if(walletDB[i].walletToken !== undefined) {
            extWallet.walletToken = walletDB[i].walletToken;
        }

        if(walletDB[i].isPreferred !== undefined) {
            extWallet.isPreferred = walletDB[i].isPreferred;
        }

        if(walletDB[i].status !== undefined) {
            extWallet.status = walletDB[i].status;
        }

        responseDO.push(extWallet);

    }

    return responseDO;

}


