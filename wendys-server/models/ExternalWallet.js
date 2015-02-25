/**
 * Object representation of a third party wallet
 *
 * Created by Prabhash Rathore on 11/5/14.
 */

var externalWallet = {
    walletID : String,
    walletProvider : String,
    walletAccountNumber : String,
    walletToken : String,
    isPreferred : Boolean,
    status : String
};

module.exports = externalWallet;
