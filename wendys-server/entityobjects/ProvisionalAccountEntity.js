/**
 * Entity Object to represent Provisional Account DB table.
 *
 * Created by Prabhash Rathore on 11/7/14.
 */


var provAccountEntity = {
    provisionalAccountID : String,
    email : String,
    pwd : String,
    phoneNumber : String,
    pin : String,
    status : String,
    fullName : String,
    merchantID : String,
    ghostAccountID : String
};

module.exports = provAccountEntity;