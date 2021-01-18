
var logger = require('../../logger');
var utils = require('../lib/utils');

exports.getAccessibilityTestingData_ICE = async function(req, res) {
    try {
		const fnName = "getAccessibilityTestingData_ICE"
		var inputs = {};
		var result = {};
		var query = req.body.input;
		switch(query.type){
			case "screendata":
				inputs ={query: "screendata", "cycleid": query.cycleId}; 
				result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
				break;
			case "reportdata":
				inputs ={query: "reportdata", "screenname": query.screendata}; 
				result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
				break;
			default:
				res.send('fail');
		}
		if (result == "fail") res.status(500).send("fail");
		else res.send(result)
	} catch(e){
		logger.error(e.message);
		res.status(500).send("fail");
	}
};

exports.saveAccessibilityReports = async function (reports){
	try {
		const fnName = "getAccessibilityTestingData_ICE"
		var inputs = {
			"query": "insertdata",
			"reports": reports
		}
		const result = await utils.fetchData(inputs, "reports/getAccessibilityTestingData_ICE", fnName);
	} catch(e){
		logger.error(e.message);
	}
}