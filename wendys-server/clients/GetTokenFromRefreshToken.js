/**
 *
 * Client code to generate Access Token by passing existing Refresh Token.
 * This client calls /v1/oauth2/token API with grant_type=refresh_token to generate Access Token. This token is valid for 15 minutes.
 *
 * Created by Prabhash Rathore on 10/17/14.
 */

var https = require('https');

var CLIENT_ID = "AVHBKRBeCwEWnvYb7GRzR7EibKoWZ7PkBko_BDoTycwXlmv1sb1aN2_Saucb";
var SECRET = "EFxaDRB_pBnkhRS9JoOsVAEitKksa2PF6mkXHcS94EFbC16hAZGxAO8_VWrd";

//existing Refresh Token for a Provisional Account # m129-prrathore3@ebay.com
var REFRESH_TOKEN = 'Dl78Wvr5rj4V_3R8-219g8F8HljR7XoOGZjp_l88rHzDqhK-O6Lf7GhNlr0QnRdlggq4nAw-Ev1ewOnM9y4zsE1FjLFuO89uZEre5UkScHi3UXuzu6L0-v0ND00';

var options = {
    hostname: 'api.sandbox.paypal.com',
    port: 443,
    path: '/v1/oauth2/token?grant_type=refresh_token&refresh_token=' + REFRESH_TOKEN,
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
        console.log("Here is raw Response Data from Token Service: " + d);
        var parsedData = JSON.parse(d);
        console.log("Access Token: " + parsedData.access_token);
        console.log("Access Token Expiration Time in seconds: " + parsedData.expires_in);
    });

});

req.end();

req.on('error', function(e) {
    console.error("Error Occured: " + e);
});

