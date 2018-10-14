'use strict';

var redisUtils = require('../lib/redis-utils');
var csv = require('csv');
var fs = require('fs');
var async = require('async');

const CSV_DATA_REDIS_KEY = 'csv_data';
const MAX_SCORE = 1;
const DEFAULT_SUB_SCORE = 0.2;
// the order of the data from csv maps to the below hash
const SCORE_OFFSET_MAP = {
	1: {
		0.05: {
			gt: 0,
			lt: 5
		},
		0.1: {
			gt: 6,
			lt: 10
		}
	},
	2: {
		0.05: {
			gt: 0,
			lt: 0.05
		},
		0.1: {
			gt: 0.06,
			lt: 0.1
		},
	},
	3: {
		0.05: {
			gt: 0,
			lt: 0.05
		},
		0.1: {
			gt: 0.06,
			lt: 0.1
		},
	},
	4: {
		0.05: {
			gt: 0,
			lt: 500
		},
		0.1: {
			gt: 501,
			lt: 1000
		},
	},
}

const FILTER_INDEX_MAP = {
	'name': 0,
	'age': 1,
	'latitude': 2,
	'longitude': 3,
	'monthly income': 4,
	'experienced': 5,
}

const INDEX_MAP = {
	0: 'name',
	1: 'age',
	2: 'latitude',
	3: 'longitude',
	4: 'monthly income',
	5: 'experienced',
	6: 'score',
}

var peopleApi = {
	getData: function(options, cback) {
		fetchFromRedis(CSV_DATA_REDIS_KEY, (redisErr, redisRes) => {
			if (redisErr || !redisRes) {
				readCsvData((csvErr, csvResult) => {
					cback(csvErr, csvResult.slice(1, csvResult.length))
					// store in redis in the background
					// skip the column heading row
					redisUtils.setx(CSV_DATA_REDIS_KEY, csvResult.slice(1, csvResult.length), 60 * 5);
				});
			} else {
				return cback(null, redisRes);
			}
		});

	},

	scoreMatches: function(data, options) {
		let finalRes = [];
		data.forEach(item => {
			let score = 1;
			options && options.filters && Object.keys(options.filters) && Object.keys(options.filters).forEach(
				o => {
					let idx = FILTER_INDEX_MAP[o];
					let offsetFlag = false; // found a match in the score offset map
					let alreadyDeducted = false;
					if (options.filters[o] != item[idx]) {
						Object.keys(SCORE_OFFSET_MAP[idx]).forEach(k => {
							Object.keys(SCORE_OFFSET_MAP[idx]).forEach(x => {
								if (!alreadyDeducted && Math.abs(Number(options.filters[o]) - item[idx]) <=
									SCORE_OFFSET_MAP[idx][x].lt && Math.abs(Number(options.filters[o]) - item[idx]) >=
									SCORE_OFFSET_MAP[idx][x].gt) {
									score -= k;
									offsetFlag = true;
									alreadyDeducted = true;
								}
							});
							if (!alreadyDeducted && !offsetFlag) {
								score -= DEFAULT_SUB_SCORE;
							}
						});
					}
				});
			item.push(Math.round(score * 100) / 100);
			let index = 0;
			let obj = {};
			item.forEach(i => {
				obj[INDEX_MAP[index]] = i;
				index++;
			});
			finalRes.push(obj);
		});

		return finalRes;
	}
};

function convertToJson(filename, cb) {
	var parser = csv.parse({
		delimiter: ','
	}, cb);
	fs.createReadStream(filename).pipe(parser);
};

function readCsvData(cback) {
	convertToJson('data.csv', (err, result) => {
		if (err || !result) {
			console.log(err || 'No result after reading file.');
			return cback(err || 'No result after reading file.');
		}
		return cback(null, result);
	});
}

function fetchFromRedis(key, cb) {
	redisUtils.getx(key, cb);
}

module.exports = peopleApi;
