/**
 *
 * Mocha Unit Test to test some of the utility functions defined in WalletHelper file. This uses Mocha TDD format for unit testing.
 *
 * Created by Prabhash Rathore on 12/2/14.
 */

'use strict';

var walletHelper = require('../../helpers/WalletHelper');

var assert = require('assert');

suite('Wallet Helper Test Suite', function() {

    //Test Case # 1
    test('Wallet Object Mapping Test for Single Wallet', function() {

        var walletDBList = []; //List of Wallets to be sent to Function to be tested

        var walletDBObj = {
            walletID : 'abcde',
            walletProvider : 'Square',
            walletAccountNumber : '12345',
            walletToken : 'xsqa6jgde90',
            isPreferred : 'true',
            status : 'active'
        };

        walletDBList.push(walletDBObj);

        var mappedWalletList = walletHelper.mapWalletDBToResponseObj(walletDBList);

        assert.equal(mappedWalletList[0].walletID, 'abcde');
        assert.equal(mappedWalletList[0].walletProvider, 'Square');
        assert.equal(mappedWalletList[0].walletAccountNumber, '12345');
        assert.equal(mappedWalletList[0].walletToken, 'xsqa6jgde90');
        assert.equal(mappedWalletList[0].isPreferred, 'true');
        assert.equal(mappedWalletList[0].status, 'active');


    });

    //Test Case # 2
    test('Wallet Object Mapping Test for List of Wallets', function() {

        var walletDBList = []; //List of Wallets to be sent to Function to be tested

        var walletDBObj1 = {
            walletID : 'abcde',
            walletProvider : 'Square',
            walletAccountNumber : '12345',
            walletToken : 'xsqa6jgde90',
            isPreferred : 'true',
            status : 'active'
        };

        var walletDBObj2 = {
            walletID : '123cde98',
            walletProvider : 'ApplePay',
            walletAccountNumber : '98346712',
            walletToken : 'xnh78sz0091qag6',
            isPreferred : 'false',
            status : 'active'
        };

        walletDBList.push(walletDBObj1);
        walletDBList.push(walletDBObj2);

        var mappedWalletList = walletHelper.mapWalletDBToResponseObj(walletDBList);

        assert.equal(mappedWalletList[0].walletID, 'abcde');
        assert.equal(mappedWalletList[0].walletProvider, 'Square');
        assert.equal(mappedWalletList[0].walletAccountNumber, '12345');
        assert.equal(mappedWalletList[0].walletToken, 'xsqa6jgde90');
        assert.equal(mappedWalletList[0].isPreferred, 'true');
        assert.equal(mappedWalletList[0].status, 'active');

        assert.equal(mappedWalletList[1].walletID, '123cde98');
        assert.equal(mappedWalletList[1].walletProvider, 'ApplePay');
        assert.equal(mappedWalletList[1].walletAccountNumber, '98346712');
        assert.equal(mappedWalletList[1].walletToken, 'xnh78sz0091qag6');
        assert.equal(mappedWalletList[1].isPreferred, 'false');
        assert.equal(mappedWalletList[1].status, 'active');


    });

});

