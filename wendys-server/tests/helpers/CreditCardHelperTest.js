/**
 * Created by nchitalia on 12/2/14.
 */

'use strict';

var assert = require('assert');
var creditCardHelper = require('../../helpers/CreditCardHelper');
var creditCard = require('../../models/CreditCard');

suite('credit card helper suite', function creditCardHelperSuite() {
    test('mapSingleCardToResponseObj', function mapSingleCardToResponseObj() {
        var cardObj;

        cardObj = {"id": "CC3T7PZZ9RTQEL4",
            "type": "visa",
            "card_number_last_n": "5300",
            "expire_month": 2,
            "expire_year": 2017,
            "first_name": "provacct29",
            "last_name": "test",
            "confirmation_status": "unconfirmed",
            "billing_address": {
                "id": "16595557",
                "address": {"line1": "2211 N 1st Street","line2": "street","city": "San Jose","state": "California","postal_code": "95131","country_code": "US"
                }
            }
        };

        creditCard = creditCardHelper.mapSingleCardToResponseObj(cardObj);
        assert.equal(creditCard.cardNumber, "5300");
        assert.equal(creditCard.expirationYear, 2017);

        cardObj = {"id": "CC3T7PZZ9RTQEL4",
            "type": "visa",
            "card_number_last_n": "5394",
            "expire_month": 2,
            "expire_year": 2016,
            "first_name": "provacct29",
            "last_name": "test",
            "confirmation_status": "unconfirmed",
            "billing_address": {
                "id": "16595557",
                "address": {"line1": "2211 N 1st Street","line2": "street","city": "San Jose","state": "California","postal_code": "95131","country_code": "US"
                }
            }
        };
        creditCard = creditCardHelper.mapSingleCardToResponseObj(cardObj);
        assert.equal(creditCard.cardNumber, "5394");
        assert.notEqual(creditCard.expirationYear, 2017);

    });
});