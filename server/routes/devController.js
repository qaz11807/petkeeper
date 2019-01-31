var om2m = require('../om2mController');
var express = require('express');
var router = express.Router();

router.post('/getDevs',function(req, res) {    //{}
    om2m.getDevList().then(function (list) {
        res.json(list);
    });
});

router.post('/writeAttrs',function(req, res) { //{type,auxId,value,units}
    om2m._writeAttrs(req.body.parm);
    res.end();
});

router.post('/permitJoin',function(req, res) { //{}
    om2m._writeServerState();
    res.end();
});

module.exports = router;