/**
 * This represents instances of different wallets available to a Provisional Account
 *
 * Created by Prabhash Rathore on 10/1/14.
 */

var instruments = require('./Instruments');
var externalWallet = require('./ExternalWallet');

var wallet = {

    instruments : instruments,
    externalWallets : [externalWallet]

};

module.exports = wallet;
