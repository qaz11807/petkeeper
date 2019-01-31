var schedule = require('node-schedule');
var om2m = require('./om2mController');
var Q = require('q');
var Datastore = require('nedb')
    , db = new Datastore({ filename: './Database/log.db' });
db.loadDatabase(function (err) {    // Callback is optional
    console.log('log start');
});

var data = {
    weight:0,onOff:0,pir:0
};

function  Tasker() {
    var tasks = [];
    var propWritable = { writable: true, enumerable: true, configurable: true };

    Object.defineProperty(this, 'tasks', { value: tasks}, propWritable);
};

Tasker.prototype.addCycleTask = function (parm) {
    var deferred = Q.defer();
    var self = this;
    update().then(function(){
        var time = new Date(parm.time);
        var hour = time.getHours(),min = time.getMinutes();
        var wait = Number(parm.back.value);
        var weight = Number(parm.weight.value.split('g')[0]);

        var task = schedule.scheduleJob({hour: hour, minute: min}, function(){
            data.weight -=weight;
            if(data.weight-weight>=0){

                db.insert({
                    startTime:new Date(),
                    parm:parm
                }, function (err, newDoc) {   // Callback is optional

                });

                om2m._writeAttrs({
                    type:'Pressure',
                    auxId:'pressure/0',
                    value:String(data.weight),
                    units:'g'
                });
                om2m._writeAttrs({
                    type:'Switch',
                    auxId:'onOffSwitch/0',
                    value:1,
                    units:''
                });

                var startTime = new Date();
                var total = startTime.getMinutes()+wait;
                startTime.setHours(startTime.getHours()+parseInt(total/60));
                startTime.setMinutes(total%60);
                schedule.scheduleJob(startTime, function(){
                    om2m._writeAttrs({
                        type:'Switch',
                        auxId:'onOffSwitch/0',
                        value:0,
                        units:''
                    });
                });
            }
        });
        self.tasks.push({task:task,parm:parm});
        deferred.resolve();
    });

    return deferred.promise;
};

Tasker.prototype.addSingleTask = function (parm) {
    var deferred = Q.defer();
    update().then(function(){
        var wait = Number(parm.back.value);
        var weight = Number(parm.weight.value.split('g')[0]);

        db.insert({
            startTime:new Date(),
            parm:parm
        }, function (err, newDoc) {   // Callback is optional

        });

        if(data.weight-weight>=0){
            data.weight -=weight;
            om2m._writeAttrs({
                type:'Pressure',
                auxId:'pressure/0',
                value:String(data.weight),
                units:'g'
            });
            om2m._writeAttrs({
                type:'Switch',
                auxId:'onOffSwitch/0',
                value:1,
                units:''
            });

            var startTime = new Date();
            var total = startTime.getMinutes()+wait;
            startTime.setHours(startTime.getHours()+parseInt(total/60));
            startTime.setMinutes(total%60);
            schedule.scheduleJob(startTime, function(){
                om2m._writeAttrs({
                    type:'Switch',
                    auxId:'onOffSwitch/0',
                    value:0,
                    units:''
                });
            });
        }
        deferred.resolve();
    });

    return deferred.promise;
};

Tasker.prototype.getAllTask = function () {
    var self = this;
    var list = [];
    update();
    self.tasks.forEach(function(task){
        list.push(task.parm);
    });
    return list;
};

Tasker.prototype.removeTask = function (index) {
    var self = this;
    var task = self.tasks[index].task;
    task.cancel();
    delete  self.tasks[index];
};

Tasker.prototype.getLogs = function () {
    var deferred = Q.defer();
    db.find({}, function (err, docs) {
        deferred.resolve(docs);
    });
    return deferred.promise;
};

Tasker.prototype.getStates = function () {
    update();
    return data;
};

function update(){
    var deferred = Q.defer();
    om2m.getDevList().then(function (list) {
        list.forEach(function(dev){
            switch(dev.auxId){
                case 'pressure/0 ':
                    data.weight = Number(dev.value);
                    break;
                case 'onOffSwitch/0 ':
                    data.onOff = dev.value;
                    break;
                case 'presence/0 ':
                    data.pir = dev.value;
                    break;
            }
        });
        deferred.resolve();
    });
    return deferred.promise;
}

module.exports = Tasker;

