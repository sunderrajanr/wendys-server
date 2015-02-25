Sequence Diagrams:
------------------

- These are some sequence diagrams of what provisionalaccountserv is doing 

###1. Create Provisional Account ![](img/pas_createaccount.png)
---
###2. Get Provisional Account ![](img/pas_getAccount.png)
---
###3. Add Credit Card ![](img/pas_addcard.png)
---
###4. Get Credit Cards ![](img/pas_getCreditCard.png)
---
###5. Add External Wallet ![](img/pas_addWallet.png)
---
###6. Get External Wallets ![](img/pas_getWallet.png)
---


Source for the Sequence Diagrams:
=================================

You can paste these into http://www.websequencediagrams.com.

1.  title Account Create Sequence

	MerchantMobileSDK->v1/provisionalaccounts: POST  
	v1/provisionalaccounts->validate: validate header  
  	validate->validate: Content-Type: application/json  
	validate-->MerchantMobileSDK: not valid error 415  
	validate->validate: Accept: application/json  
	validate-->MerchantMobileSDK: not valid error 406  
	validate->v1/provisionalaccounts: valid  
	validate->validate: validate merchantID  
	validate-->MerchantMobileSDK: Require valid Merchant ID  
	validate->validate: validate email/pwd or phone/PIN  
	v1/provisionalaccounts->mongoDB: check account not exists  
	validate-->MerchantMobileSDK: account exists 409  
		note right of v1/provisionalaccounts: generate ghost email/pwd  
	v1/provisionalaccounts->oauth2/token: POST w/CLIENT_ID & SECRET  
	oauth2/token-->v1/provisionalaccounts: error  
	v1/provisionalaccounts-->MerchantMobileSDK: token service error 500  
	oauth2/token->v1/provisionalaccounts: access token  
	v1/provisionalaccounts->onboarding/application: POST w/ access_token, email/pwd  
	note right of onboarding/application: CREATE_ACCOUNT  
	onboarding/application-->v1/provisionalaccounts: error  
	v1/provisionalaccounts-->MerchantMobileSDK: error 500  
	onboarding/application->v1/provisionalaccounts: ghost AccountID  
	v1/provisionalaccounts->oauth2/login: POST w/ CLIENT_ID/SECRET, ghost email/pwd  
	oauth2/login-->v1/provisionalaccounts: error  
	v1/provisionalaccounts-->MerchantMobileSDK: error 500   
	oauth2/login->v1/provisionalaccounts: refresh token  
	v1/provisionalaccounts->mongoDB: store ghost AccountID & refresh token  
	mongoDB-->v1/provisionalaccounts: error  
	v1/provisionalaccounts-->MerchantMobileSDK: error  
	v1/provisionalaccounts->MerchantMobileSDK: success 201  


2.  title Add Card - Sequence Diagram

	MerchantMobileSDK->v1/provisionalaccounts: POST :provisionalAccountID/cards <br>
	v1/provisionalaccounts->validate: validate header <br>
	validate->validate: Content-Type: application/json <br>
	validate-->MerchantMobileSDK: not valid error 415 <br>
	validate->validate: Accept: application/json <br>
	validate-->MerchantMobileSDK: not valid error 406 <br>
	validate->validate: Authorization: Bearer [access token] <br>
	validate-->MerchantMobileSDK: not valid error 401 <br>
	validate->v1/provisionalaccounts: valid <br>
	v1/provisionalaccounts->mongoDB: lookup account <br>
	mongoDB-->v1/provisionalaccounts: not found <br>
	v1/provisionalaccounts-->MerchantMobileSDK: not found error 404 <br>
	v1/provisionalaccounts->v1/wallet: POST /[ghost acct id]/financial-instruments/payment-cards <br>
	v1/wallet->v1/provisionalaccounts: Card Added/Card Error <br>
	v1/provisionalaccounts->MerchantMobileSDK: Card Added/Card Error <br>
	v1/provisionalaccounts->v1/wallet: If Card Added, Initiate Card Confirmation POST /[card_id]/initiate-confirmation/paypal-code <br>
	v1/wallet-->v1/provisionalaccounts: Non 200 Status Code, Log Error <br>
	v1/provisionalaccounts->v1/wallet: if 200 status from initiate confirmation API, POST /[card_id]/complete-confirmation/paypal-code <br>
	v1/wallet->v1/provisionalaccounts: Log Card Confirmation Success/Error <br>


3. title GetCreditCard

	MerchantMobileSDK->   v1/provisionalaccounts: GET:provisionalAccountID/cards<br>
	v1/provisionalaccounts->validate: validate header<br>
	validate->validate: Content-Type: application/json<br>
	validate-->MerchantMobileSDK: Invalid Content-Type - Error 415<br>
	validate->validate: Accept: application/json<br>
	validate-->MerchantMobileSDK: Invalid Accept type - Error 406<br>
	validate->validate: Authorization: Bearer TOKEN<br>
	validate-->MerchantMobileSDK: Invalid Auth header - Error 401<br>
	validate->v1/provisionalaccounts:Headers look good<br>
	v1/provisionalaccounts->validate: validate credit card req params<br>
	validate->validate: validate provActID<br>
	validate-->MerchantMobileSDK: Invalid provActID - 400 Bad Req Error<br>
	validate->v1/provisionalaccounts: valid request<br>
	v1/provisionalaccounts->mongoDB: check if acct exists in DB<br>
	mongoDB-->v1/provisionalaccounts: acct does not exist<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 404 - Not Found Error<br>
	v1/provisionalaccounts->v1/wallet: GET @me/financial-instruments/payment-cards with headers: content-type/Accept/Authorization<br>
	v1/wallet->v1/provisionalaccounts: get Credit Card/CreditCard Error<br>
	v1/provisionalaccounts->MerchantMobileSDK: get Credit Card/CreditCard Error<br>

	
4. title GetWallet

	MerchantMobileSDK->   v1/provisionalaccounts: GET:provisionalAccountID/wallets<br>
	v1/provisionalaccounts->validate: validate provAcctId<br>
	validate-->v1/provisionalaccounts: Invalid provAcctId<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 400 Bad Request Error<br>
	validate->v1/provisionalaccounts: valid<br>
	v1/provisionalaccounts->mongoDB: check if acct exists in DB<br>
	mongoDB-->v1/provisionalaccounts: acct does not exist in DB<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 404 Not Found Error<br>
	v1/provisionalaccounts->mongoDB: If acct exists, getWalletData from DB<br>
	mongoDB->v1/provisionalaccounts: get wallet/Wallet Error<br>
	v1/provisionalaccounts->MerchantMobileSDK: get wallet/Wallet Error<br>
	
	
5. title AddWallet

	MerchantMobileSDK->   v1/provisionalaccounts: POST: provisionalAccountID/wallets<br>
	v1/provisionalaccounts->validate: validate header<br>
	validate->validate: Content-Type: application/json<br>
	validate-->MerchantMobileSDK: 415 - Invalid Content-Type Error<br>
	validate->validate: Accept: application/json<br>
	validate-->MerchantMobileSDK: 406 - Invalid Accept type Error<br>
	validate->v1/provisionalaccounts:Headers look good<br>
	v1/provisionalaccounts->validate: validate req params<br>
	validate-->v1/provisionalaccounts: Invalid post data<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 400 - Bad Request Error<br>
	v1/provisionalaccounts->mongoDB: find wallet data in DB<br>
	mongoDB-->v1/provisionalaccounts: wallet already exists in DB<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 409 - Conflict Error<br>
	v1/provisionalaccounts->mongoDB: if wallet does not exist in DB, check if acct exists in DB<br>
	mongoDB-->v1/provisionalaccounts: acct does not exist<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 404 - Not Found Error<br>
	v1/provisionalaccounts->mongoDB: If acct exists - save wallet data to DB<br>
	mongoDB->v1/provisionalaccounts: Wallet saved to DB/Wallet Error<br>
	v1/provisionalaccounts->MerchantMobileSDK: Wallet saved/Wallet Error<br>

6. title GetAccount

	MerchantMobileSDK->v1/provisionalaccounts: GET:provAcctId<br>
	v1/provisionalaccounts->validate: validate header<br>
	validate->validate: Content-Type: application/json<br>
	validate-->MerchantMobileSDK: 415 - Invalid Content-Type Error<br>
	validate->validate: Accept: application/json<br>
	validate-->MerchantMobileSDK: 406 - Invalid Accept type Error<br>
	validate->v1/provisionalaccounts: Headers look good<br>
	v1/provisionalaccounts->mongoDB: check if acct exists in DB<br>
	mongoDB-->v1/provisionalaccounts: acct does not exist in DB<br>
	v1/provisionalaccounts-->MerchantMobileSDK: 404 - Not Found Error<br>
	v1/provisionalaccounts->mongoDB: If acct exists, get wallet data from DB<br>
	v1/provisionalaccounts->v1/wallet:If acct exists, get credit card data - GET @me/financial-instruments/payment-cards<br>
	mongoDB-->v1/provisionalaccounts: On Error getting wallet data, return empty wallet list<br>
	v1/wallet-->v1/provisionalaccounts: On Error getting credit card data, return empty credit card list<br>
	mongoDB->v1/provisionalaccounts: On Success, return wallet list<br>
	v1/wallet->v1/provisionalaccounts: On Success, return credit card list<br>
	v1/provisionalaccounts->MerchantMobileSDK: 200 OK - return provisional account data<br>
