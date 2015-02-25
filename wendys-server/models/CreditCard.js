/**
 * Object representation for Credit Card
 *
 * Created by Nidhi Chitalia on 11/5/2014.
 *
 */

var address = require('./Address');

var creditCard = {
    cardType : String,
    cardNumber : String,
    expirationMonth : Number,
    expirationYear : Number,
    CVV : Number,
    address : address,
    entryType : String,
    firstName : String,
    lastName : String,
    confirmation_status : String
};

module.exports = creditCard;