Provisionalaccountserv RESTful API:
===================================

Create a new Provisional Account:
---------------------------------

POST /v1/provisionalaccounts

Request
email : String <N/A if phone and pin is sent in request>
password : String <N/A if phone and pin is sent in request>
phoneNumber : String <N/A if email and pwd is sent in request>
pin : Number <N/A if email and pwd is sent in request>
merchantID : String <Mandatory to create an account>
fullName : string <Optional>

Response
If request is successful, then it will return an unique id for the created Provisional Account.

provisionalAccountID : String





Create/Add a new Credit Card to an existing Provisional Account:
-----------------------------------------------------------------

POST /v1/provisionalaccounts/{account_id}/cards

Request
creditCard : CreditCard<Object>

Response
201 Status Code in header or error.


Create/Add a new Wallet (any third party wallet or PayPal Wallet) to an existing Provisional Account:
------------------------------------------------------------------------------------------------------

POST /v1/provisionalaccounts/{account_id}/wallets

Request
wallet : Wallet

Response
201 Status Code in header or error.



Fetch Provisional Account Details. This will return Provisional Account + all associated wallet objects:
----------------------------------------------------------------------------------------------------------

GET /v1/provisionalaccounts/{account_id}

Request
Nothing needs to be sent in Request Payload.

Response
provisionalAccount : ProvisionalAccount<Object> - If request is successful. This ProvisionalAccount object will contain both Account Data and associated assets.




Update an existing Provisional Account:
----------------------------------------

PUT /v1/provisionalaccounts/{account_id}

Request
provisionalAccount : ProvisionalAccount – Object with updated data.

Response
If your request is successful, the API returns the HTTP Status Code of 204.





Update an existing credit card for a Provisional Account:
-----------------------------------------------------------

PUT /v1/provisionalaccounts/{account_id}/cards/{card_id}

Request
creditCard : CreditCard – Object with updated data.


Response
If your request is successful, the API returns the HTTP Status Code of 204.



Update an existing Wallet for a Provisional Account:
-----------------------------------------------------------

PUT /v1/provisionalaccounts/{account_id}/wallets/{wallet_id}

Request
creditCard : CreditCard – Object with updated data.


Response
If your request is successful, the API returns the HTTP Status Code of 204.
