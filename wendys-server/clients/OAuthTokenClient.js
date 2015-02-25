/**
 *
 * Client code to fetch Access Token by making a call to OAuth Token Service.
 *
 * Created by prrathore on 10/17/14.
 */

var https = require('https');

//var CLIENT_ID = "AVHBKRBeCwEWnvYb7GRzR7EibKoWZ7PkBko_BDoTycwXlmv1sb1aN2_Saucb";
//var SECRET = "EFxaDRB_pBnkhRS9JoOsVAEitKksa2PF6mkXHcS94EFbC16hAZGxAO8_VWrd";

var CLIENT_ID = "Provisional_Account_Serv";
var SECRET = "Partner@1";

var options = {
    //hostname: 'api.sandbox.paypal.com',
    hostname: 'stage2ms058.qa.paypal.com',
    port: 443,
    //port: 11888,
    path: '/v1/oauth2/token?grant_type=client_credentials',
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
        var accessToken = JSON.parse(d).access_token;
        console.log("Access Token: " + accessToken);
    });

});

req.end();

req.on('error', function(e) {
    console.error("Error Occured: " + e);
});














