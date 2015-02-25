/**
 * This RESTful API is developed using RESTIFY Node package and data is persisted in MongoDB.
 *
 * Create a Node Process using Restify at the desired host and port number. Define URIs and map the corresponding handlers which will
 * run when these URIs will be invoked using a REST call.
 *
 * Created by Prabhash Rathore on 9/24/14.
 */

var restify = require('restify');
var os = require('os');

var provAccountHandler = require('./handlers/ProvisionalAccountHandler');
var walletHandler = require('./handlers/WalletHandler');
var creditCardHandler = require('./handlers/CreditCardHandler');

//var hostName = os.hostname(); //Dynamic Host Name where this service is deployed
//var hostName = "localhost";
var hostName = "52.10.163.243";
var port    =  '8080';
//var port    =  '3000';

var debug = typeof v8debug === 'object'; //Nodejs v8debug global object when running in debug mode

if(debug) {
    console.log("Running in Debug Mode!!")
    port = '60498'; //Port for Debug Mode
}

var server = restify.createServer({
    name : "provisionalaccountserv"
});

var serverURL = "http://" + hostName + ":" + port; //host URL where provisionalaccountserv is running

server.listen(port, hostName, function(){
    //console.log('%s listening at %s ', server.name , server.url);
    console.log('%s listening at %s ', server.name , serverURL);
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());

var baseResource = '/v1/provisionalaccounts';

//CRUD for ProvisionalAccount Resource
server.post({path : baseResource , version: '0.0.1'}, provAccountHandler.createProvisionalAccount); //create a new provisional account
server.get({path : baseResource , version : '0.0.1'}, provAccountHandler.findAllProvisionalAccounts); //get all the accounts, just for testing, not to be exposed
server.get({path : baseResource +'/:provisionalAccountID', version : '0.0.1'}, provAccountHandler.findProvisionalAccount); //get a provisional account based on id match

//CRUD for Wallet Resource
server.post({path : baseResource + '/:provisionalAccountID/wallets', version: '0.0.1'}, walletHandler.addWallet);
server.get({path : baseResource + '/:provisionalAccountID/wallets', version: '0.0.1'}, walletHandler.findWallet);

// CRUD for credit card
server.post({path : baseResource + '/:provisionalAccountID/cards', version: '0.0.1'}, creditCardHandler.addCreditCard); //add a new credit card to an existing provisional account
server.get({path : baseResource + '/:provisionalAccountID/cards', version: '0.0.1'}, creditCardHandler.getCreditCard); // get credit card details for a provisional account

//need to add PUT operations for Provisional Account and Wallet


