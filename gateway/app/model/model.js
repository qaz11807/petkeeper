var MqttNode = require('mqtt-node'),
    SmartObject = require('smartobject');

var qnode1;

var so1 = new SmartObject();

so1.init('presence', 0, { dInState: 0 });
so1.init('pressure', 0, { sensorValue: 500 ,units:"g"});
so1.init('onOffSwitch', 0, { dInState: 0 });


//------------------------------------------------------------

qnode1 = new MqttNode('d01', so1);

exports = module.exports = {
    qnode1: qnode1
};
