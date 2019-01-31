var express = require('express');
var Tasker = require('../tasker');

var router = express.Router();
var tasker = new Tasker();


router.post('/addCycleTask',function (req, res) {
    tasker.addCycleTask(req.body).then(function () {
        res.send(req.body);
    });
});

router.post('/addSingleTask',function (req, res) {
    tasker.addSingleTask(req.body).then(function () {
        res.send(req.body);
    });
});

router.get('/getAllTask',function (req, res) {
    res.json(tasker.getAllTask());
});

router.post('/removeTask',function (req, res) {
    var index = req.body;
    tasker.removeTask(index);
    res.end();
});

router.get('/getLogs',function (req, res) {
    tasker.getLogs().then(function (logs) {
        res.json(logs);
    })

});

router.get('/getStates',function (req, res) {
    res.json(tasker.getStates());
});

module.exports = router;