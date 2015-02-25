/**
 * Sample client code to call provisionalaccountServ service with a POST on provisionalaccounts resource
 *
 * Created by prrathore on 10/21/14.
 */

var http = require('http');

var endPoint = '127.0.0.1';

var options = {
    hostname: endPoint,
    port: '8080',
    path: '/v1/provisionalaccounts',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept-Charset': 'utf8',
        'Accept': 'application/json'
    }

};

var reqObject = {
    'email' : 'prabhash@ebay.com',
    'pwd' : '12345',
    'merchantID' : 'm139'
};

var req = http.request(options, function(res) {

    console.log("Service statusCode: ", res.statusCode);
    console.log("Response headers: ", res.headers);

    res.on('data', function(d) {
        console.log("Here is Response Data: " + d);
    });


});

req.write(JSON.stringify(reqObject));
req.end();

req.on('error', function(e) {
    console.error("Error Occured: " + e);
});


