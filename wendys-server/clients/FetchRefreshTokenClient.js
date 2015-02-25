/**
 * Get a Refresh Token by calling oauth2/login PayPal API.
 *
 * Created by prrathore on 10/22/14.
 */

var https = require('https');

var CLIENT_ID = "AVHBKRBeCwEWnvYb7GRzR7EibKoWZ7PkBko_BDoTycwXlmv1sb1aN2_Saucb";
var SECRET = "EFxaDRB_pBnkhRS9JoOsVAEitKksa2PF6mkXHcS94EFbC16hAZGxAO8_VWrd";

var ENDPOINT = "api.sandbox.paypal.com";

var options = {
    hostname: ENDPOINT,
    port: 443,
    path: '/v1/oauth2/login?response_type=token&grant_type=password&email=aegree2@ebay.com&password=12345$&redirect_uri=http://stage2p1108.qa.paypal.com:10080/openid-connect-client/clientregistration.jsp&rememberme=true&scope=address',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    },
    auth: CLIENT_ID + ':' + SECRET
};

var req = https.request(options, function(res) {

    console.log("Service statusCode: ", res.statusCode);
    console.log("Response headers: ", res.headers);

    res.on('data', function(d) {
        console.log("Here is Response Data: " + d);
        var refreshToken = JSON.parse(d).refresh_token;
        console.log("Refresh Token: " + refreshToken);
    });

});

req.end();

req.on('error', function(e) {
    console.error("Error Occured: " + e);
});
