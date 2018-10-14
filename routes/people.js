var express = require('express');
var router = express.Router();

var peopleApi = require('../api/peopleApi');

router.get('/', getData, scoreMatches, sendError, sendResponse);
 function getData(req, res,next){
	peopleApi.getData(null,function (err, result){
		if(err || !result){
			req.sendError={
				error: new Error('Unable to get csv data.'),
				errorStatus:412
			}
			return next();
		}
		req.csvData = result;
		return next();
	});
}

function scoreMatches(req, res, next){
	let scoredRes = peopleApi.scoreMatches(req.csvData, {filters:req.query});
	req.sendResult = scoredRes;
	return next();
}

function sendResponse(req, res, next) {
    res.json(req.sendResult);
};

function sendError(req, res, next) {
	if(res.sendError){
		return res.status(req.sendError.errorStatus||400).json(req.sendError.error);		
	}
	return next();
};

module.exports = router;
