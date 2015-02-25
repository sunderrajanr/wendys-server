provisionalaccountserv
======================

This is a RESTful service written in NodeJS. This service will provide CRUD operations for Provisional Account, various FIs and third party Wallet entities.

This is a quick prototype to support open Commerce Platform project for Mobile SDK.

Note: In it's current state, this is just a Prototype and can only be used for Internal Projects. *** Do not use it for any Production feature until it's ready for Production Usage.***

WORK IN PROGRESS........

For any questions, please send an email to prrathore@paypal.com/gcross@paypal.com.


Technologies Used:
-------------------
  - Node.JS
  - MongoDB
  

API Set up Instruction
----------------------
- Fork this project from RSE-Americas/provisionalaccountserv repo.
- Do a local clone on your computer or hyper machine.
- Assuming you already have Node installed, run following command under your Github repo "provisionalaccountserv" directory
    - npm install
  - Note: The above command will install all the dependent node-modules under your project. Before you run "npm install", make sure your current
directory have package.json file.
- Run provisionalaccountserv service by executing: 
     - node server.js
- Before you start hitting the RESTful service from any REST Client (you could use Chrome's Postman as a RESTful client to interact with any RESTful service), make sure you have MongoDB installed and mongod process is running.


Install MongoDB
----------------
- Go to mongodb.org and download mongodb package for installation.
- Extract the package and install it on your computer. For Mac, install it under /usr/local. For Windows, install it under Program Files.
- Set the environment path to access MongoDB shell commands from anywhere on your computer.
- After installing Mongo, create  a "/data/db" directory on your computer where MongoDB will create DB Schemas by default.
  Note: For Mac, create /data/db under root directory and make sure there is full permission to the "data" directory for the user who is going to run DB queries.
        For Windows, create "data/db" directory under C:/
- To start mongo process, run following from command line:
    mongod


Test or Connect to provisionalaccountserv service:
---------------------------------------------------
- Open POSTMAN (Google Chrome Plugin) in browser which will be used as a RESTful client to connect and query provisionalaccountserv service.
- To create a new Provisional Account, use following details in POSTMAN and then click send.
      - URI: http://127.0.0.1:8080/v1/provisionalaccounts
      - HTTP Action: POST
      - Headers:
	   - Content-Type : application/json
	   - Accept : application/json
      - Body [Sample body in JSON format]:
      
          	{
  			"email" : "prabhash@ebay.com",
  			"pwd" : "12345",
   			"merchantID" : "m140"
			}


  
- The above request will create a Provisional Account and return the Provisional Account data in the Response Object.


- To retrieve all the data for a Provisional Account, run a GET operation on provisionalaccount resource in the following way using POSTMAN:
      - URI: http://127.0.0.1:8080/v1/provisionalaccounts/m141-prabhash@ebay.com
      - HTTP Action: GET
      - Headers:
	   - Content-Type : application/json
	   - Accept : application/json
     
- Following Response will be returned if a matching resource exists:
  
	    {
	    "provisionalAccountID": "m141-prabhash@ebay.com",
	    "email": "prabhash@ebay.com",
	    "pwd": "12345",
	    "status": "active",
	    "merchantID": "m141",
	    "ghostAccountID": "1ce8b9d48f25940bbb03754c66a6e46d81415307813472KJM4AB7M8UP5X81SNW",
	    "refreshToken": "cJ7BgST4GLezQbnh5Ibw0vzZt8DTivbC8k7cs97uBp5_O9br1b6s8PWkdliuZewRi6rtOH_-dBQNvj_17VrlceU_898jZ6p_WzyMYkLHquiFfTFS5WVauauwusk",
	    "wallet": {
	        "instruments": {
	            "creditCards": [
	                {}
	            ]
	        },
	        "externalWallets": [
	            {}
	        ]
	    },
	    "oAuth": {},
	    "address": {},
	    "_id": "5461b8f91bb8b7d89bcc4b85"
	    }


- Add a new wallet to an existing Provisional Account by executing the following URI:
	- URI: http://127.0.0.1:8080/v1/provisionalaccounts/m141-prabhash@ebay.com/wallets
	- HTTP Action: POST
	- Headers:
	   - Content-Type : application/json
	   - Accept : application/json
	   
	- Body [Sample JSON Request]:
	
		  {
		  "walletProvider" : "ApplePay",
		  "walletAccountNumber" : "100",
		  "walletToken" : "xbcw230mhzzxx77dwwlm",
		  "isPreferred" : "true",
		  "status" : "active"
		  }
		
	- Following Response will be received if the operation executes successfully:
	
		    {
    		    "walletID": "ApplePay-100",
		    "provisionalAccountID": "m141-prabhash@ebay.com",
		    "walletProvider": "ApplePay",
		    "walletAccountNumber": "100",
		    "walletToken": "xbcw230mhzzxx77dwwlm",
		    "isPreferred": "true",
		    "status": "active",
		    "_id": "5462b20a1bb8b7d89bcc4b86"
	 	    }


- Retieve Wallet Data
   	- To retrieve wallet data for a Provisional Account, run a GET operation on provisionalaccount resource in the following way using POSTMAN:
    	- URI: http://127.0.0.1:8080/v1/provisionalaccounts/m10-provtestacct141@paypal.com/wallets
    	- HTTP Action: GET

	- Following response will be returned if a matching resource exists:
		- [
		    {
		        "_id": "54629705e007fa1704311e91",
		        "walletID": "Google-12345",
		        "provisionalAccountID": "m10-provtestacct15@paypal.com",
		        "walletProvider": "Google",
		        "walletAccountNumber": "12345",
		        "walletToken": "zasbjh234mh45",
		        "isPreferred": "true",
		        "status": "active"
		    },
		    {
		        "_id": "5462ac71c5e6ffc21287fd31",
		        "walletID": "ApplePay-12345",
		        "provisionalAccountID": "m10-provtestacct15@paypal.com",
		        "walletProvider": "ApplePay",
		        "walletAccountNumber": "12345",
		        "walletToken": "zasbjh234mh45",
		        "isPreferred": "true",
		        "status": "active"
		    }
		]

	- Following response will be returned if a matching resource exists, but no wallet data yet added to the account
		- []

	- Following response will be returned if a matching resource does not exists
		- {
		    "errorCode": 404,
		    "errorID": "Provisional account does not exist!",
		    "errorMessage": "provisional account m10-provtestacct141@paypal.com does not exist in db"
		}




Design Docs and Diagrams
------------------------

[See here (docs/DesignDoc.md):](docs/DesignDoc.md)
