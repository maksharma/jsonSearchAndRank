'use strict';

var express = require('express');
var router = express.Router();

router.get('/', readCsv, sendError, sendResponse);

function readCsv(err, req, res,next){
	console.log('in middleware 1');
	return next();
}

function sendResponse(err,req, res, next) {
    res.json(req.sendResult);
};

function sendError(err,req, res, next) {
	if(err){
		return res.status(req.errorStatus||400).json(req.error);		
	}
	return next();
};
module.exports = router;
