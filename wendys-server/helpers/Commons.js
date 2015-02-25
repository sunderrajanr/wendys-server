/**
 * Container for reusable utility functions.
 *
 * Created by Prabhash Rathore on 11/3/14.
 */

var errorDO = require('../models/Error.js');

//Validate Request Headers
exports.validateHeader = function(request, response) {
    var errorObject;

    //Validate Content-Type header
    if(request.header('Content-Type') !== "application/json") {
        console.log(request.header('Content-Type') + " MIME type is not supported by this service!!!");
        errorObject = this.createErrorObject(415, "Not Acceptable Content-Type header", "Please send application/json in request header for Content-Type attribute!!");
        response.send(415, errorObject);
        return false;
    }

    //Validate Accept Header
    if(request.header('Accept') !== "application/json") {
        console.log(request.header('Accept') + " MIME type is not supported by this service!!!");
        errorObject = this.createErrorObject(406, "Not Acceptable Accept Type header.", "Please send application/json in request header for Accept attribute!!");
        response.send(406, errorObject);
        return false;
    }

    console.log("Header looks good!!");
    return true;
}

//Validate Authorization Header. Use this function only if you are expecting Authorization header in request
exports.validateAuthHeader = function(request, response) {
    var authHeader = request.header('Authorization');
    console.log("Authorization header: " + authHeader);

    if(this.isPropertyEmpty(authHeader)) {
        var errStr = "Authorization header missing. Need valid authorization header";
        console.log(errStr);
        var errorObject = this.createErrorObject(401, "Authorization Header missing", errStr);
        response.send(401, errorObject);
        return false;
    }

    console.log("Authorization header looks good");
    return true;
}

//Add general header attributes to Response Object
exports.addResponseHeaders = function(response) {
    console.log("setting some generic header attributes to response objects..")
    response.setHeader('Access-Control-Allow-Origin','*');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept-Charset, Accept');

}

//generic method to create error object, use this method whenever a new error object needs to be created
exports.createErrorObject = function(errorCode, errorID, errorMessage) {
    errorDO.errorCode = errorCode;
    errorDO.errorID = errorID;
    errorDO.errorMessage = errorMessage;

    return errorDO;
}

//reusable function to check if a scalar property is undefined
exports.isPropertyEmpty = function(property) {
    if(property === undefined || property === null || property === "") {
        return true;
    }

    return false;

}

//reusable function to check if an object is undefined or null
exports.isObjectNull = function(obj) {
    if(obj === undefined || obj === null) {
        return true;
    }

    return false;
}

/**
 * This function is used to validate any Address Object.
 * Address Line 2 is optional so it's not validated as part of this function.
 *
 * @params request
 * @params response
 * @return boolean
 */
exports.validateAddress = function(address, response) {

    console.log("Commons: inside validateAddress method ");

    if(this.isObjectNull(address)) {
        errorDO = this.createErrorObject(400, "Empty Address", "Empty Address");
        response.send(400, errorDO);
        return false;
    }

    if(this.isPropertyEmpty(address.line1)) {
        errorDO = this.createErrorObject(400, "Empty Line1 in Address", "Can't add a Card without a valid Line 1 in Address");
        response.send(400, errorDO);
        return false;
    }

    if(this.isPropertyEmpty(address.city)) {
        errorDO = this.createErrorObject(400, "Empty City in Address", "Can't add a Card without a valid City in Address");
        response.send(400, errorDO);
        return false;
    }

    if(this.isPropertyEmpty(address.state)) {
        errorDO = this.createErrorObject(400, "Empty State in Address", "Can't add a Card without a valid State in Address");
        response.send(400, errorDO);
        return false;
    }

    if(this.isPropertyEmpty(address.postal_code)) {
        errorDO = this.createErrorObject(400, "Empty Postal Code in Address", "Can't add a Card without a valid Postal Code in Address");
        response.send(400, errorDO);
        return false;
    }

    if(this.isPropertyEmpty(address.country_code)) {
        errorDO = this.createErrorObject(400, "Empty Country Code in Address", "Can't add a Card without a valid Country Code in Address");
        response.send(400, errorDO);
        return false;
    }

    console.log("Valid Address Object!!");
    return true;

}




