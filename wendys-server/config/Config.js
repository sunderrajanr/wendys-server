/**
 * This file stores all the configurations for provAcctServ.
 *
 * Created by nchitalia on 12/1/14.
 */

var config = {

    CLIENT_ID : 'AVHBKRBeCwEWnvYb7GRzR7EibKoWZ7PkBko_BDoTycwXlmv1sb1aN2_Saucb', // client id for provAcctServ
    SECRET: 'EFxaDRB_pBnkhRS9JoOsVAEitKksa2PF6mkXHcS94EFbC16hAZGxAO8_VWrd', // secret for provAcctServ

    //Client ID and Secret for Onboarding Service on Sandbox, this is used as a workaround to create account as our Client ID is
    // blocked on Sandbox. After moratorium once Onboarding makes changes to allow our account to create account, we will be able to use our Client
    // Id to create accounts.
    ONBOARDING_CLIENT_ID : 'AXxTdBDUD6wNU4Uk7zdXonB0OSM1oh_sDOOrN1R2QtNgDysj4cpz__e2I-oR',
    ONBOARDING_SECRET : 'EHEOQBBxwQ94BYDqxeb6qeuYbyY-dvt82Nl2R0mgpcrdT-CnbCqagWLC0-b6'
};

module.exports = config;