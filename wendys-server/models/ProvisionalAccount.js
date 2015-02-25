/**
 * This entity represents a Provisional Account
 *
 * Created by Prabhash Rathore on 9/25/14.
 */

var wallet = require('./Wallet');
var oAuth = require('./OAuth');
var address = require('./Address');

var provisionalAccount = {
    provisionalAccountID : String, //unique id, combination of merchantID + [email or phoneNumber]
    email : String,
    pwd : String,
    phoneNumber : String,
    pin : Number,
    status : String,
    fullName : String,
    merchantID : String,

    ghostAccountID : String, //Ghost PP Account ID stored on PP Accounts Table, used to support transactions

    refreshToken : String, //PayPal refresh token for this provisional account
    accessToken : String, //PayPal access token for this provisional account

    //customFields -> placeholder object for 5 custom fields

    wallet : wallet,

    oAuth: oAuth,

    address : address

};

module.exports = provisionalAccount;


