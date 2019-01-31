var request = require('request');
var parseString = require('xml2js').parseString;
var Q = require('q');

var uri = 'http://localhost:8282/~/mn-cse/mn-name/PET_KEEPER/';
var devList = [];
var om2mController = {};

om2mController.getDevList = function () {
    var deferred = Q.defer();
    om2mController._getPressureData().then(function () {
        return om2mController._getPresenceData();
    }).then(function () {
        return om2mController._getSwitchData();
    }).fail(function (err) {
        deferred.reject(err);
    }).done(function () {
        deferred.resolve(devList);
    });
    return deferred.promise;
};

om2mController._getPressureData = function () {
    var deferred = Q.defer();

    request({
        uri: uri+"PRESSURE_DATA/la",
        method: "GET",
        headers: {
            'X-M2M-Origin': 'admin:admin'
        }
    }, function(error, response, body) {
        parseString(body, function (err, result) {
            parseString(result['m2m:cin']['con'], function (err, result) {
                var type = result['obj']['str'][0]['$']['val'],
                    auxId = result['obj']['str'][1]['$']['val'],
                    value = result['obj']['int'][0]['$']['val'];
                devList[0] = {type:type,auxId:auxId,value:value};
                deferred.resolve();
            });
        });
    });


    return deferred.promise;
};

om2mController._getPresenceData = function () {
    var deferred = Q.defer();

    request({
        uri: uri+"PRESENCE_DATA/la",
        method: "GET",
        headers: {
            'X-M2M-Origin': 'admin:admin'
        }
    }, function(error, response, body) {
        parseString(body, function (err, result) {
            parseString(result['m2m:cin']['con'], function (err, result) {
                var type = result['obj']['str'][0]['$']['val'],
                    auxId = result['obj']['str'][1]['$']['val'],
                    value = result['obj']['int'][0]['$']['val'];
                devList[1] = {type:type,auxId:auxId,value:value};
                deferred.resolve();
            });
        });
    });


    return deferred.promise;
};

om2mController._getSwitchData = function () {
    var deferred = Q.defer();
    request({
        uri: uri+"SWITCH_DATA/la",
        method: "GET",
        headers: {
            'X-M2M-Origin': 'admin:admin'
        }
    }, function(error, response, body) {
        parseString(body, function (err, result) {
            parseString(result['m2m:cin']['con'], function (err, result) {
                var type = result['obj']['str'][0]['$']['val'],
                    auxId = result['obj']['str'][1]['$']['val'],
                    value = result['obj']['int'][0]['$']['val'];
                devList[2] = {type:type,auxId:auxId,value:value};
                deferred.resolve();
            });
        });
    });
    return deferred.promise;
};

om2mController._writeAttrs = function (dev) {
    request({
        uri: uri+urlRouter(dev.auxId),
        method: "POST",
        headers: {
            'X-M2M-Origin': 'admin:admin',
            'Content-Type': 'application/xml;ty=4'
        },
        body:
        "<om2m:cin xmlns:om2m=\"http://www.onem2m.org/xml/protocols\">\n" +
            "<cnf>message</cnf>\n" +
            "<con>\n" +
                "&lt;obj&gt;\n" +
                "&lt;str name=&quot;appId&quot; val=&quot;"+dev.type +"&quot;/&gt;\n" +
                "&lt;str name=&quot;auxId&quot; val=&quot;"+dev.auxId+" &quot;/&gt;\n" +
                "&lt;int name=&quot;data&quot;  val=&quot;"+dev.value+"&quot;/&gt;\n" +
                "&lt;str name=&quot;unit&quot;  val=&quot;"+dev.units+"&quot;/&gt;\n" +
                "&lt;/obj&gt;\n" +
            "</con>\n" +
        "</om2m:cin>"
    }, function(error, response, body) {
    });
};

function urlRouter(name) {
    if (name === 'pressure/0' )
        return 'PRESSURE_DATA';
    else if (name === 'onOffSwitch/0')
        return 'SWITCH_DATA';
    else if (name === 'presence')
        return 'PRESENCE_DATA/0';
}

om2mController._writeServerState = function () {
    request({
        uri: uri+"SERVER_STATE",
        method: "POST",
        headers: {
            'X-M2M-Origin': 'admin:admin',
            'Content-Type': 'application/xml;ty=4'
        },
        body:
        "<om2m:cin xmlns:om2m=\"http://www.onem2m.org/xml/protocols\">\n" +
            "<cnf>message</cnf>\n" +
            "<con>\n" +
                "&lt;obj&gt;\n" +
                "&lt;str name=&quot;permitJoin&quot; val=&quot;permitJoin&quot;/&gt;\n" +
                "&lt;str name=&quot;state&quot; val=&quot;on&quot;/&gt;\n" +
                "&lt;/obj&gt;\n" +
            "</con>\n" +
        "</om2m:cin>"
    }, function(error, response, body) {
    });
};

module.exports = om2mController;
