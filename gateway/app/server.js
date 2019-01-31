var http = require('http'); 
var chalk = require('chalk');
var MqttShepherd = require('mqtt-shepherd');
var _ = require('busyman');
var request = require('request');
var parseString = require('xml2js').parseString;

var model = require('./model/model');
var qnode1 = model.qnode1;
var qnode;

var server=http.createServer(function(req,res){
    if (req.method === 'POST') {
        var body = '';
        req.on('data', function (chunk) {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', function () {
            if(req.url=='/DATA'){
                parseString(body, function (err, result) {
                    parseString(result['m2m:sgn']['nev'][0]['rep'][0]['m2m:cin'][0]['con'], function (err, result) {
                        var type = result['obj']['str'][0]['$']['val'],
                            auxId = result['obj']['str'][1]['$']['val'],
                            value = result['obj']['int'][0]['$']['val'];

                        var path = auxId.replace(/\s+/g,"")+'/'+(type=='Pressure' ? 'sensorValue':'dInState');

                        if(!qnode)return;
                        qnode.readReq(path, function (err, rsp) {
                            if(rsp.data!=value){
                                var id = auxId.replace(/\s+/g,"").split('/');
                                qnode1.so.write(id[0], id[1], (type=='Pressure' ? 'sensorValue':'dInState'), value, function (err, val) {
                                });

                            }
                        });

                    });
                });
                res.end();
            }

            if(req.url=='/STATE'){
                parseString(body, function (err, result) {
                    parseString(result['m2m:sgn']['nev'][0]['rep'][0]['m2m:cin'][0]['con'], function (err, result) {
                        var state = result['obj']['str'][1]['$']['val'];
                        if(state!= 'off'){
                           if (!isDemoRunning)
                               startDemoApp();
                           qserver.permitJoin(30);
                        }
                    });
                });
                res.end();

            }
        });

    }

});

server.listen(4000);

var qserver = new MqttShepherd();

qserver.start(function (err) {
    if (!err)
        showWelcomeMsg();
    else
        console.log(err);
});

 qserver.on('ind', function (msg) {
     //console.log(msg.type);
     //console.log(msg.data);
 });

 qserver.on('ind:changed', function (ind) {
     //console.log(ind);
 });

var isDemoRunning = false;
var isD01Observed = false;

var startDemoApp = function () {
    isDemoRunning = true;

    setTimeout(function () {
        qnode1.connect('mqtt://localhost', function () {});
    }, 1000);
    /*
    setTimeout(function () {
        console.log(chalk.cyan('[   Simulator   ] the switch is on'));
        qnode1.so.write('onOffSwitch', 0, 'dInState', 1, function (err, val) {});
        setTimeout(function () {
            console.log(chalk.cyan('[   Simulator   ] the switch is off'));
            qnode1.so.write('onOffSwitch', 0, 'dInState', 0, function (err, val) {});
        }, 3000);
        qnode1.so.write('pressure', 0, 'sensorValue', 200, function (err, val) {});
    }, 6000);

    setTimeout(function () {
        console.log(chalk.cyan('[   Simulator   ] the pet is eating'));
        qnode1.so.write('presence', 0, 'dInState', 1, function (err, val) {});
        setTimeout(function () {
            console.log(chalk.cyan('[   Simulator   ] the pet has left'));
            qnode1.so.write('presence', 0, 'dInState', 0, function (err, val) {});
        }, 6000);
    }, 10000);

    setTimeout(function () {
        console.log(chalk.cyan('[   Simulator   ] the pet food has been supplemented'));
        qnode1.so.write('pressure', 0, 'sensorValue', 800, function (err, val) {});
    }, 15000);
    */
};

var validGads = [ 'presence', 'pressure' ,'onOffSwitch'];

function getDevInfo(clientId) {
    var qnode = qserver.find(clientId);
    if (!qnode)
        return;
    var permAddr = qnode.mac + '#' + qnode.clientId;
    var dumped = qnode.dump(),
        dev = {
            permAddr: permAddr,
            status: qnode.status,
            gads: {}
        };

    validGads.forEach(function (name) {
        if (dumped.so[name]) {
            _.forEach(dumped.so[name], function (gad, iid) {
                var auxId = name + '/' + iid,
                    type = getGadType(name, gad.appType),
                    val = getGadValue(qnode, name, iid);

                dev.gads[auxId] = {
                    type: type,
                    auxId: auxId,
                    value: val
                };
            });
        }
    });

    return dev;
}

var app = function () {
    setLeaveMsg();

    /************************/
    /* Event handle         */
    /************************/
    /*** ready            ***/
    qserver.on('ready', function () {
        readyInd();
        if (!isDemoRunning)
            startDemoApp();
        qserver.permitJoin(30);
    });

    /*** error            ***/
    qserver.on('error', function (err) {
        errorInd(err.message);
    });

    /*** permitJoining    ***/
    qserver.on('permitJoining', function (joinTimeLeft) {
        permitJoiningInd(joinTimeLeft);
        if(joinTimeLeft==0)uploadServerStateToOM2M();
    });

    qserver.on('ind', function (msg) {
        var permAddr = msg.qnode ? (msg.qnode.mac + '#' + msg.qnode.clientId) : '';
        qnode = qserver.find(msg.qnode.clientId);
        if (msg.type === 'devIncoming') {
            /*** devIncoming      ***/
            var devInfo = getDevInfo(msg.qnode.clientId)
            devIncomingInd(devInfo);
        } else if (msg.type === 'devStatus') {
            /*** devStatus        ***/
            devStatusInd(permAddr, msg.data);
            if (msg.qnode.clientId === 'd01' && !isD01Observed)
                startObservingD01(msg.qnode);
        } else if (msg.type === 'devChange') {
            /*** attrsChange      ***/

            var data = msg.data;
            var mainResource = mainResourceName(data.oid);
            if (data.rid) {
                attrsChangeInd(permAddr, {
                    type: getGadType(data.oid, (data.oid === 'dOut') ? 'flame' : undefined),  // make flame sensor
                    auxId: data.oid + '/' + data.iid,
                    value: data.data
                });
                uploadDataToOM2M({
                    type: getGadType(data.oid, (data.oid === 'dOut') ? 'flame' : undefined),  // make flame sensor
                    auxId: data.oid + '/' + data.iid,
                    value: data.data,
                    units: data.oid === 'pressure' ? 'g'  : '',
                    urlName : uriRouter(data.oid)
                });
            }

            if (data.oid === 'presence' && parseInt(data.iid) === 0 && data.rid === 'dInState') {

            }


            if (data.oid === 'pressure' && parseInt(data.iid) === 0 && data.rid === 'sensorValue') {
                if(data.data<250){
                    console.log(chalk.red('[    Warning    ] the pet food is not enough! pls supply it'));
                }
            }

            if (data.oid === 'onOffSwitch' && parseInt(data.iid) === 0 && data.rid === 'dInState') {

            }

        }
    });
};
/**********************************/
/* welcome function               */
/**********************************/
function showWelcomeMsg() {
    var mqttPart1 = chalk.blue('      __  ___ ____  ______ ______        ____ __ __ ____ ___   __ __ ____ ___   ___ '),
        mqttPart2 = chalk.blue('     /  |/  // __ \\/_  __//_  __/ ____  / __// // // __// _ \\ / // // __// _ \\ / _ \\'),
        mqttPart3 = chalk.blue('    / /|_/ // /_/ / / /    / /   /___/ _\\ \\ / _  // _/ / ___// _  // _/ / , _// // /'),
        mqttPart4 = chalk.blue('   /_/  /_/ \\___\\_\\/_/    /_/         /___//_//_//___//_/   /_//_//___//_/|_|/____/ ');

    console.log('');
    console.log('');
    console.log('Welcome to mqtt-shepherd webapp... ');
    console.log('');
    console.log(mqttPart1);
    console.log(mqttPart2);
    console.log(mqttPart3);
    console.log(mqttPart4);
    console.log(chalk.gray('   A Lightweight MQTT Machine Network Server'));
    console.log('');
    console.log('   >>> Author:     Simen Li (simenkid@gmail.com)');
    console.log('   >>> Version:    mqtt-shepherd v0.6.x');
    console.log('   >>> Document:   https://github.com/lwmqn/mqtt-shepherd');
    console.log('   >>> Copyright (c) 2016 Simen Li, The MIT License (MIT)');
    console.log('');
    console.log('The server is up and running, press Ctrl+C to stop server.');
    console.log('---------------------------------------------------------------');
}

/**********************************/
/* goodBye function               */
/**********************************/
function setLeaveMsg() {
    process.stdin.resume();

    function showLeaveMessage() {
        console.log(' ');
        console.log(chalk.blue('      _____              __      __                  '));
        console.log(chalk.blue('     / ___/ __  ___  ___/ /____ / /  __ __ ___       '));
        console.log(chalk.blue('    / (_ // _ \\/ _ \\/ _  //___// _ \\/ // // -_)   '));
        console.log(chalk.blue('    \\___/ \\___/\\___/\\_,_/     /_.__/\\_, / \\__/ '));
        console.log(chalk.blue('                                   /___/             '));
        console.log(' ');
        console.log('    >>> This is a simple demonstration of how the shepherd works.');
        console.log('    >>> Please visit the link to know more about this project:   ');
        console.log('    >>>   ' + chalk.yellow('https://github.com/lwmqn/mqtt-shepherd'));
        console.log(' ');
        process.exit();
    }

    process.on('SIGINT', showLeaveMessage);
}

/**********************************/
/* Indication funciton            */
/**********************************/
function readyInd () {
    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.green('[         ready ] Waiting for device joining or messages...'));
}

function permitJoiningInd (timeLeft) {
    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.green('[ permitJoining ] ')+ timeLeft + ' sec');
}

function errorInd (msg) {
    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.red('[         error ] ') + msg);
}

function devIncomingInd (dev) {
    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.yellow('[   devIncoming ] ')  + '@' + dev.permAddr);
}

function devStatusInd (permAddr, status) {

    if (status === 'online')
        status = chalk.green(status);
    else 
        status = chalk.red(status);

    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.magenta('[     devStatus ] ')+ '@' + permAddr + ', ' + status);
}

function attrsChangeInd (permAddr, gad) {
    console.log(chalk.gray('['+new Date().toLocaleTimeString()+']')+chalk.blue('[   attrsChange ] ')+ '@' + permAddr + ', auxId: ' + gad.auxId + ', value: ' + gad.value);
}

function getGadType(name, appType) {
    if (name == 'onOffSwitch')
        return 'Switch';
    else if (name === 'presence')
        return 'Pir';
    else if (name === 'pressure')
        return 'Pressure';
    else
        return _.upperFirst(name);
}

function getGadValue(qnode, name, iid) {
    var val;

    if (name === 'pressure' )
        val = qnode.so.get(name, iid, 'sensorValue');
    else if (name === 'presence' || name === 'onOffSwitch')
        val = qnode.so.get(name, iid, 'dInState');

    return val;
}

function mainResourceName(name) {
    if (name === 'pressure' )
        return 'sensorValue';
    else if (name === 'onOffSwitch' || name === 'presence')
        return 'dInState';
}

function uriRouter(name) {
    if (name === 'pressure' )
        return 'PRESSURE_DATA';
    else if (name === 'onOffSwitch')
        return 'SWITCH_DATA';
    else if (name === 'presence')
        return 'PRESENCE_DATA';
}

function startObservingD01(qnode) {
    isD01Observed = true;
    setTimeout(function () {
        qnode.writeAttrsReq('pressure/0/sensorValue', { pmin: 1, pmax: 60, stp: 0.1 }).then(function (rsp) {
            return qnode.observeReq('pressure/0/sensorValue');
        }).done();
        qnode.writeAttrsReq('presence/0/dInState', { pmin: 1, pmax: 60, stp: 0.1 }).then(function (rsp) {
            return qnode.observeReq('presence/0/dInState');
        }).done();
        qnode.writeAttrsReq('onOffSwitch/0/dInState', { pmin: 1, pmax: 60, stp: 0.1 }).then(function (rsp) {
            return qnode.observeReq('onOffSwitch/0/dInState');
        }).done();
    }, 600);
}

function uploadDataToOM2M(dev) {
    request({
        uri: "http://localhost:8282/~/mn-cse/mn-name/PET_KEEPER/"+dev.urlName,
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
                    "&lt;str name=&quot;appId&quot; val=&quot;"+dev.type+"&quot;/&gt;\n" +
                    "&lt;str name=&quot;auxId&quot; val=&quot;"+dev.auxId+" &quot;/&gt;\n" +
                    "&lt;int name=&quot;data&quot; val=&quot;"+dev.value+"&quot;/&gt;\n" +
                    "&lt;str name=&quot;unit&quot; val=&quot;"+dev.units+"&quot;/&gt;\n" +
                    "&lt;/obj&gt;\n" +
                "</con>\n" +
            "</om2m:cin>"
    }, function(error, response, body) {
    });
}

function uploadServerStateToOM2M() {
    request({
        uri: "http://localhost:8282/~/mn-cse/mn-name/PET_KEEPER/SERVER_STATE",
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
                "&lt;str name=&quot;state&quot; val=&quot;off&quot;/&gt;\n" +
                "&lt;/obj&gt;\n" +
            "</con>\n" +
        "</om2m:cin>"
    }, function(error, response, body) {
    });
}


app();
