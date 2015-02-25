/**
 * This model encapsulates different kind of financial instrument objects.
 *
 * Created by Prabhash Rathore on 11/5/14.
 */

var creditCard = require('./CreditCard');

var instruments = {

    creditCards : [creditCard]

    // add other instruments like Bank Account, Gift Cards later

}

module.exports = instruments;
