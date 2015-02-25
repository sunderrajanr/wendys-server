Database Table Design:
======================

ProvisionalAccount:
--------------------
  	provisionalAccountID <Primary Key>
  	email
  	pwd
  	phoneNumber
  	pin
  	status
  	fullName
  	merchantID
  	ghostAccountID
	


ExternalWallet:
----------------
  	walletID <Primary Key>
  	provisionalAccountID <Foreign Key>
  	walletProvider
  	walletAccountNumber
  	walletToken
  	isPreferred
  	status

OAuth:
-------
  	provisionalAccountID <Foreign Key>
  	socialSite
  	oAuthToken
  	status
