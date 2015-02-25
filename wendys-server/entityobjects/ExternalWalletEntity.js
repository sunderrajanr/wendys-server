/**
 * Entity Object to represent External Wallet table.
 *
 * Created by Prabhash Rathore on 11/7/14.
 */

var externalWalletEntity = {
    walletID : String,
    provisionalAccountID : String,
    walletProvider : String,
    walletAccountNumber : String,
    walletToken : String,
    isPreferred : Boolean,
    status : String
}

module.exports = externalWalletEntity;