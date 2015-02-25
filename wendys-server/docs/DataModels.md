Date Model (this is Data Model not DB Schema Design):
======================================================

ProvisionalAccount
-------------------
	provisionalAccountID : String <Unique ID for Provisional Account across different Merchants. Combination of merchantID + [emailID OR phoneNumber] >
	email : String
	password : String
	phoneNumber : String
	pin : Number
	status : String
	fullName : String
	merchantID :  String
	ghostAccountID : String 
	wallet : Wallet<Object>
	oAuth : List<OAuth>
	address : List<Address>



Wallet
-------
	instruments : Instruments
	externalWallet : List<ExternalWallet>


Instruments
------------
	creditCard : List<CreditCard>
  	bankAccount : List<BankAccount>
  	.
  	.
  	.
 

ExternalWallet
---------------
	walletID : String [Unique Field, Combination of walletProvider + walletAccountNumber]
  	walletProvider : String
	walletAccountNumber : String
	walletToken : String
	isPreferred : Boolean
	status : String
	




CreditCard
------------
	cardType : String
	cardNumber : String
	expirationMonth : Number
	expirationYear : Number
	CVV : Number
  	postalCode : Number
	entryType : String [Enum of values: Scanned or Manual-Entry]


OAuth
------
  	socialSite : String
	oAuthToken : String
	status : String

Address:
---------
	address1 : String
	address2 : String
	city : String
	state : String
	zipCode : Number
	isPrimary : Boolean
