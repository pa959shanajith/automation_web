var uuidV4 = require('uuid-random');
var admin = require('../controllers/admin');
var create_ice = require('../controllers/create_ice');
var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var utils = require('../lib/utils');
var xlsx = require('xlsx');
var path = require('path');
var fs = require('fs');
var xl = require('excel4node');
var crypto = require("crypto");
var asynclib = require("async");
var Client = require("node-rest-client").Client;
var DOMParser = require('xmldom').DOMParser;
var epurl = process.env.DAS_URL;
var client = new Client();

/* Convert excel file to CSV Object. */
var xlsToCSV = function (workbook, sheetname) {
	var result = [];
	var csv = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetname]);
	if (csv.length > 0) {
		result.push(sheetname);
		result.push(csv);
	}
	//return result.join("\n");
	return result;
};

exports.populateProjects =  async(req, res) => {
	const fnName = "populateScenarios";
	try {
		logger.info("Inside UI service: " + fnName);
		var reqData = {
			"userid": req.session.userid,
			"allflag": true
		};
		const data = await create_ice.getProjectIDs(reqData);
		res.send(data);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.populateScenarios = async (req, res) => {
	const fnName = "populateScenarios";
	logger.info("Inside UI service: " + fnName);
	try {
		const moduleId = req.body.moduleId;
		const inputs= {
			"moduleid":moduleId,
			"name":"populateScenarios"
		}
		const result = await utils.fetchData(inputs, "mindmap/getScenarios", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch (exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.getProjectTypeMM = (req, res) =>{
	logger.info("Inside UI service: getProjectTypeMM");
	var inputs = req.body.projectId;
	create_ice.getProjectType(inputs, function (err, result) {
		if (err) {
			res.status(500).send('Fail');
		}
		else {
			res.status(200).send(result);
		}
	});
};

exports.populateUsers = async (req, res) => {
	const fnName = "populateUsers";
	logger.info("Inside UI service: " + fnName);
	try {
		var d = req.body;
		admin.getUsers({ prjId: d.projectId }, (err, data) => {
			res.setHeader('Content-Type', 'application/json');
			if (err)
				res.status(500).send('Fail');
			else {
				res.status(200).send(data);
			}
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

const getModule = async (d) => {
	const inputs = {
		"tab":d.tab,
		"projectid":d.projectid || null,
		"moduleid":d.moduleid,
		"cycleid":d.cycId,
		"name":"getModules"
	}
	return utils.fetchData(inputs, "mindmap/getModules", "getModules");
};

exports.getModules = async (req, res) => {
	const fnName = "getModules";
	logger.info("Inside UI service: " + fnName);
	try {
		const data = await getModule(req.body);
		res.send(data);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.reviewTask = async (req, res) => {
	const fnName = "reviewTask";
	logger.info("Inside UI service: " + fnName);
	try {
		var inputs = req.body;
		var taskID = inputs.taskId;
		var batchIds = inputs.batchIds;
		var userId = req.session.userid;
		var username = req.session.username;
		var date = new Date();
		var status = inputs.status;
		if (batchIds.indexOf(',') > -1) {
			taskID=JSON.stringify(batchIds.split(','));
		} else {
			taskID=batchIds[0];
		}
		var cur_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + ',' +date.toLocaleTimeString();
		var taskHistory = { "userid": userId, "status": "", "modifiedBy": username, "modifiedOn": cur_date };
		var inputs= {
			"id" : taskID,
			"action" : "updatetaskstatus",
			"status" : status,
			"history" : taskHistory
		};
		if (status == 'inprogress' || status == 'assigned' || status == 'reassigned' || status == 'reassign') {
			inputs.assignedto = userId;
		} else if (status == 'underReview') {
			inputs.reviewer = userId;
		}
		const result = await utils.fetchData(inputs, "mindmap/manageTask", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send('inprogress');
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.saveData = async (req, res) => {
	const fnName = "saveData";
	logger.info("Inside UI service: " + fnName);
	try {
		var tasks = [];
		var idDict = {};
		var inputs = req.body;
		var data = inputs.map;
		var vn_from="0.0";
		var vn_to="0.0";
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		var flag = inputs.write;
		var removeTask = inputs.unassignTask;
		var cycId = inputs.cycId;
		var createdthrough = inputs.createdthrough || "Web";
		var assignedObj = {};
        var regg= /[~*+=?^%<>()|\\|\/]/;
		for(var key in inputs){
			if(key=='map'){
				for(var i=0;i<inputs[key].length;i++){
					if(regg.test(inputs[key][i]['name'])){
						logger.error("Error occurred in mindmap/"+fnName+": Special characters found!!");
						return res.send('fail');
					}
					if(inputs[key][i]['task']!=null){
						var map_task=inputs[key][i]['task']
						if(regg.test(map_task['batchName']) || regg.test(map_task['details']) || regg.test(map_task['task'])){
							logger.error("Error occurred in mindmap/"+fnName+": Special characters found!!");
							return res.send('fail');
						}
					}
				}
			}
		}
		for (var k = 0; k < data.length; k++) {
			var task = data[k].task;
			if (task != null) {
				if ('assignedToName' in task) {
					var assignedTo = task.assignedToName;
					if (assignedTo != null && assignedTo != undefined) {
						if ('status' in task) {
							assignedObj[task.details] = assignedTo;
						}
					}
				}
			}
		}
		var notify = assignedObj;
		if (Object.keys(notify).length > 0 && Object.keys(notify).length != undefined) {
			var assignedToValues = Object.keys(notify).map(function (key) { return notify[key] });
			for (var i = 0; i < assignedToValues.length; i++) {
				if (Object.keys(myserver.socketMapNotify).indexOf(assignedToValues[i]) > -1) {
					var keys = Object.keys(notify);
					for (var j = 0; j < keys.length; j++) {
						if (i == j) {
							var tName = keys[j];
							var taskAssignment = 'assigned';
							var taskName = tName;
							var soc = myserver.socketMapNotify[assignedToValues[i]];
							var count = 0;
							var assignedTasksNotification = {};
							assignedTasksNotification.to = '/plugin';
							if (removeTask.length > 0) {
								for (var p = 0; p < removeTask.length; p++) {
									for (var q = 0; q < data.length; q++) {
										if (removeTask[p] == data[q].oid) {
											taskAssignment = "unassigned";
										}
										if (taskAssignment == "unassigned") {
											assignedTasksNotification.notifyMsg = "Task '" + taskName + "' has been unassigned by " + user + "";
										}
										assignedTasksNotification.isRead = false;
										assignedTasksNotification.count = count;
										soc.emit("notify", assignedTasksNotification);
									}
								}
							}

							if (taskAssignment == "assigned") {
								assignedTasksNotification.notifyMsg = "New task '" + taskName + "' has been assigned by " + user + "";
								assignedTasksNotification.isRead = false;
								assignedTasksNotification.count = count;
								soc.emit("notify", assignedTasksNotification);
							}
						}
					}
				}
			}
		}
		// This flag is for Save. Save and Create will now be merged.
		if (flag == 10) 
		{
			qpush=[]
			var uidx = 0, rIndex;
			// var idn_v_idc = {};
			var cycId=inputs.cycId;

			// Creating the data for running the Create Structure Query
			var qObj = { "projectid": prjId, "cycleId": cycId, "appType": "Web", "testsuiteDetails": [], "versionnumber": parseFloat(vn_from), "newversionnumber":  parseFloat(vn_to) ,"username": user, "userrole": userrole,"userid":userid,"userroleid":userroleid,"createdthrough":createdthrough ,"deletednodes":deletednodes };
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "modules") rIndex = uidx;
				if (e.task != null) delete e.task.oid;
				// idn_v_idc[e.id_n] = e.id_c;
				nObj.push({ _id:e._id||null, name: e.name,state: e.state, task: e.task, children: [],childIndex:e.childIndex });
				if (e.type == "testcases") nObj[nObj.length - 1]['pid_c'] = e._id||null;
				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
				idDict[e.id] = uidx++;
			});
			nObj[rIndex].children.forEach(function (ts, i) {
				var sList = [];
				ts.children.forEach(function (s, i) {
					var tcList = [];
					s.children.forEach(function (tc, i) {
						tcList.push({ "screenid": s._id||null, "testcaseid": tc._id||null, "testcaseName": tc.name, "task": tc.task,"state":tc.state ,"childIndex":parseInt(tc.childIndex)});
						
					});
					tcList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
					sList.push({ "screenid": s._id||null, "screenName": s.name, "task": s.task, "testcaseDetails": tcList,"state":s.state,"childIndex":parseInt(s.childIndex) });
					
				});
				sList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
				tsList.push({ "testscenarioid": ts._id||null, "testscenarioName": ts.name, "tasks": ts.task, "screenDetails": sList,"state":ts.state, "childIndex":parseInt(ts.childIndex) });
				
			});
			tsList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1);
			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex]._id||null, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList,"state":nObj[rIndex].state}];
			
			create_ice.saveMindmap(qObj, function (err, data) {
				if (err) {
					res.status(500).send(err);
				} else {
					res.status(200).send(data);
				}
			});
		}
		else if (flag == 30) { 
			//Assign
			var tasks_insert=[];
			var tasks_update=[];
			var tasks_remove=removeTask;
			var scenarioids=new Set();
			var screenids= new Set();
			var testcaseids = new Set();
			data.forEach(function (e, i) {
				idDict[e._id] = (e._id) || null;
				e._id = idDict[e._id];
				t = e.task;
				var tsk={}
				if (e.type == 'endtoend') {
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.batchname=t.batchName
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
				}
				else if (e.type == 'modules') {
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testsuites"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=""
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.batchname=t.batchName
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=""
						tsk.history=[]
						tsk.projectid=prjId
						
						
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							tasks_insert.push(tsk)
						}
					}
					tasks.push(tsk)
				}
				else if (e.type == 'scenarios') {					
					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype="testscenarios"
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						
						if (t._id!=null){
							tsk._id=t._id
							tasks_update.push(tsk)
						}
						else{
							if(!scenarioids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}

						scenarioids.add(tsk.nodeid);
					}
					
				}
				else if (e.type == 'screens') {
					uidx++; lts = idDict[e.pid];

					if (t != null && e._id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=prjId
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id != null) {
							if (cycId == t.cycleid) {
								tsk.projectid=prjId
								tsk._id=t._id
								tasks_update.push(tsk)
								
							}
						}else{
							if(!screenids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}
						screenids.add(tsk.nodeid)
					}
				}
				else if (e.type == 'testcases') {
					if (t != null && e.id != null) {
						if (t._id!=null && (removeTask.includes(t._id))) return;
						tsk.tasktype=t.task
						tsk.nodetype=e.type
						tsk.name=e.name
						tsk.nodeid=e._id
						tsk.cycleid=t.cycleid
						tsk.parent=t.parent
						tsk.createdon=""
						tsk.assignedtime=""
						tsk.startdate=t.startdate
						tsk.enddate=t.enddate
						tsk.assignedto=t.assignedto
						tsk.reviewer=t.reviewer
						tsk.owner=(tsk.owner!=null) ? tsk.owner : t.assignedto
						tsk.status=t.status
						tsk.details=t.details
						tsk.reestimation=t.reestimation
						tsk.complexity=t.complexity || ""
						tsk.history=[]
						tsk.projectid=prjId
						if (t._id != null) {
							if (cycId == t.cycleid) {
								tsk._id=t._id
								tasks_update.push(tsk)
							}
						}else{
							if(!testcaseids.has(tsk.nodeid))
								tasks_insert.push(tsk)
						}
						testcaseids.add(tsk.nodeid);
					}
				}
			});
			var inputs={
				"update": tasks_update,
				"insert": tasks_insert,
				"delete": tasks_remove,
				"action": "modify"
			}
			var args={
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			}
			logger.info("Calling DAS Service from saveData : admin/createProject_ICE");
			client.post(epurl+"mindmap/manageTask", args,
				function (data_var, response) {
					if (response.statusCode != 200 || data_var.rows == "fail") {
						logger.error("Error occurred in mindmap/manageTask from saveData Error Code : ERRDAS");
						res.send("fail");
					} else {
						var modid='fail'
						if (data_var.rows == "success"){
							modid=data[0]._id
						}
						res.send(modid);
					}
			});
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};


exports.saveEndtoEndData = function (req, res) {
	const fnName = "saveEndtoEndData";
	logger.info("Inside UI service: " + fnName);
	try {
		var nData = [], qList = [], idDict = {};
		var urlData = req.get('host').split(':');
		var inputs = req.body;
		var data = inputs.map;
		var prjId = inputs.prjId;
		var deletednodes = inputs.deletednode;
		var user = req.session.username;
		var userrole = req.session.activeRole;
		var userid = req.session.userid;
		var userroleid = req.session.activeRoleId;
		var flag = inputs.write;
		// var relId = inputs.relId;
		var cycId = inputs.cycId;
		var createdthrough=inputs.createdthrough || "Web";

		//TO support task deletion
		var removeTask = inputs.unassignTask;
		if (flag == 10) {
			var uidx = 0, rIndex;
			var vn_from = inputs.vn_from;
			var vn_to = inputs.vn_from;
			// var idn_v_idc = {};

			var qObj = { "projectid": prjId, "testsuiteDetails": [], "username": user, "userrole": userrole, "versionnumber": parseFloat(vn_from)|| 0, "newversionnumber": parseFloat(vn_to) || 0 , "userid":userid,"userroleid":userroleid ,"createdthrough":createdthrough,"deletednodes":deletednodes};
			var nObj = [], tsList = [];
			data.forEach(function (e, i) {
				if (e.type == "endtoend") rIndex = uidx; // check for normal modules
				if (e.task != null) delete e.task.oid;
				nObj.push({ projectID: e.projectID, _id: e._id || null, name: e.name, task: e.task, children: [] ,state: e.state, childIndex:e.childIndex});
				if (idDict[e.pid] !== undefined) nObj[idDict[e.pid]].children.push(nObj[uidx]);
				idDict[e.id] = uidx++;
			});

			nObj[rIndex].children.forEach(function (ts, i) {
				var sList = [];
				tsList.push({ "testscenarioid": ts._id||null, "testscenarioName": ts.name, "tasks": ts.task,"state":ts.state,"childIndex":parseInt(ts.childIndex)});
				
			});
			tsList.sort((a, b) => (a.childIndex > b.childIndex) ? 1 : -1)
			qObj.testsuiteDetails = [{ "testsuiteId": nObj[rIndex]._id||null, "testsuiteName": nObj[rIndex].name, "task": nObj[rIndex].task, "testscenarioDetails": tsList,"state":nObj[rIndex].state}];
			
			create_ice.saveMindmapE2E(qObj, function (err, data) {
				if (err) {
					res.status(500).send(err);
				} else {
					// if res.rows
					res.status(200).send(data);
				}
			});
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.excelToMindmap = function (req, res) {
	const fnName = "excelToMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		var wb1 = xlsx.read(req.body.data.content, { type: 'binary' });
		if (req.body.data.flag == 'sheetname') {
			return res.status(200).send(wb1.SheetNames);
		}
		var myCSV = xlsToCSV(wb1, req.body.data.sheetname);
		var numSheets = myCSV.length / 2;
		var qObj = [];
		var err;
		if (numSheets == 0) {
			return res.status(200).send("emptySheet");
		}
		for (var k = 0; k < numSheets; k++) {
			var cSheet = myCSV[k * 2 + 1];
			var cSheetRow = cSheet.split('\n');
			var scoIdx = -1, scrIdx = -1, sctIdx = -1,modIdx=-1;
			var uniqueIndex = 0;
			cSheetRow[0].split(',').forEach(function (e, i) {
				if(i== 0 && e.toLowerCase()=="module") modIdx = i;
				if(i== 1 && e.toLowerCase()=="scenario") scoIdx = i;
				if(i== 2 && e.toLowerCase()=="screen") scrIdx = i;
				if(i== 3 && e.toLowerCase()=="script") sctIdx = i;
			});
			if (modIdx == -1 || scoIdx == -1 || scrIdx == -1 || sctIdx == -1 || cSheetRow.length < 2) {
				err = true;
				break;
			}
			var e, lastSco = -1, lastScr = -1, nodeDict = {}, scrDict = {};
			for (var i = 1; i < cSheetRow.length; i++) {
				var row = cSheetRow[i].split(',');
				if (i==1 && (row[0]=="" || row[1]=="" || row[2]=="" || row[3]=="")) {
					return res.status(200).send('valueError');
				}
				if (row.length < 3) continue;
				if (row[modIdx] !== '') {
					e = { id: uuidV4(), name: row[modIdx], type: 0 };
					qObj.push(e);
				}
				if (row[scoIdx] !== '') {
					lastSco = uniqueIndex; lastScr = -1; scrDict = {};
					e = { id: uuidV4(), name: row[scoIdx], type: 1 };
					qObj.push(e);
					nodeDict[e.id] = uniqueIndex;
					uniqueIndex++;
				}
				if (row[scrIdx] !== '' && lastSco != -1) {
					var tName = row[scrIdx];
					var lScr = qObj[lastScr];
					if (lScr === undefined || (lScr)) {
						if (scrDict[tName] === undefined) scrDict[tName] = uuidV4();
						lastScr = uniqueIndex;
						e = { id: scrDict[tName], name: tName, type: 2, uidx: lastScr };
						qObj.push(e);
						nodeDict[e.id] = uniqueIndex;
						uniqueIndex++;
					}
				}
				if (row[sctIdx] !== '' && lastScr != -1) {
					e = { id: uuidV4(), name: row[sctIdx], type: 3, uidx: lastScr };
					qObj.push(e);
					nodeDict[e.id] = uniqueIndex;
					uniqueIndex++;
				}
			}
		}
		if (err) res.status(200).send('fail');
		else res.status(200).send(qObj);
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.getScreens = async (req, res) => {
	const fnName = "getScreens";
	logger.info("Inside UI service: " + fnName);
	try {
		const projectid = req.body.projectId;
		const inputs= { projectid }
		const result = await utils.fetchData(inputs, "mindmap/getScreens", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.exportToExcel = async (req, res) =>{
	const fnName = "exportToExcel";
	logger.info("Inside UI service: " + fnName);
	try {
		logger.info("Fetching Module details");
		var d = req.body;
		var excelMap = await getModule({modName:null,cycId:null,"tab":"tabCreate","projectid":d.projectid,"moduleid":d.moduleid})
		logger.info("Writing Module structure to Excel");
		var excelDirPath = path.join(__dirname, './../../output');
		var filePath = path.join(excelDirPath, 'samp234.xlsx');

		try {
			if (!fs.existsSync(excelDirPath)) fs.mkdirSync(excelDirPath); // To create directory for storing excel files if DNE.
			if (fs.existsSync(filePath)) fs.unlinkSync(path.join(filePath)); // To remove the created files
		} catch (e) {
			logger.error("Exception in mindmapService: exportToExcel: Create Directory/Remove file", e);
		}

		//create a new workbook file in current working directory
		var wb = new xl.Workbook();
		var ws = wb.addWorksheet('Sheet1');

		logger.debug(excelMap.name);

		//create the new worksheet with 10 coloumns and rows equal to number of testcases
		var curr = excelMap;

		//Sorting the positions of the child nodes according to their childindex
		for (i = 0; i < curr.children.length; i++) {
			for (j = 0; j < curr.children[i].children.length; j++) {
				//sort the testcases based on childindex
				curr.children[i].children[j].children.sort(function(a,b){
					return parseInt(a.childIndex)-parseInt(b.childIndex)});
			}
			//sort the screens based on childindex
			curr.children[i].children.sort(function(a,b){
				return parseInt(a.childIndex)-parseInt(b.childIndex)});
		}
		//sort the scenarios based on childindex
		curr.children.sort(function(a,b){
		return parseInt(a.childIndex)-parseInt(b.childIndex)});

		//Set some width for first 4 columns
		ws.column(1).setWidth(40);
		ws.column(2).setWidth(40);
		ws.column(3).setWidth(40);
		ws.column(4).setWidth(40);

		var style = wb.createStyle({
			font: {
				color: '000000',
				bold: true,
					size: 12,
				}
				});

		ws.cell(1, 1)
				.string('Module')
				.style(style);

		ws.cell(1, 2)
				.string('Scenario')
				.style(style);

		ws.cell(1, 3)
				.string('Screen')
				.style(style);

		ws.cell(1, 4)
				.string('Script')
				.style(style);

		var min_scen_idx = 1;
		var min_scr_idx = 1;
		ws.cell(2,1).string(curr.name);
		var tc_count=0;
		for (i = 0; i < curr.children.length; i++) {
			for (j = 0; j < curr.children[i].children.length; j++) {
				for (k = 0; k < curr.children[i].children[j].children.length; k++) {
					tc_count++;
					ws.cell(1 + tc_count,4).string(curr.children[i].children[j].children[k].name);
				}
				
				ws.cell(1 + min_scr_idx,3).string(curr.children[i].children[j].name);
				min_scr_idx= tc_count+1;
			}
			ws.cell( 1 + min_scen_idx,2).string(curr.children[i].name);
			min_scen_idx=tc_count+1;
		}
		//save it
		wb.write(filePath,function (err) {
			if (err) return res.send('fail');
			res.writeHead(200, {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
			var rstream = fs.createReadStream(filePath);
			rstream.pipe(res);
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}

};

function xml2json(xml, tab) {
	var X = {
	   toObj: function(xml) {
		  var o = {};
		  if (xml.nodeType==1) {   // element node ..
			 if (xml.attributes.length)   // element with attributes  ..
				for (var i=0; i<xml.attributes.length; i++)
				   o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
			 if (xml.firstChild) { // element has child nodes ..
				var textChild=0, cdataChild=0, hasElementChild=false;
				for (var n=xml.firstChild; n; n=n.nextSibling) {
				   if (n.nodeType==1) hasElementChild = true;
				   else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
				   else if (n.nodeType==4) cdataChild++; // cdata section node
				}
				if (hasElementChild) {
				   if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
					  X.removeWhite(xml);
					  for (var n=xml.firstChild; n; n=n.nextSibling) {
						 if (n.nodeType == 3)  // text node
							o["#text"] = X.escape(n.nodeValue);
						 else if (n.nodeType == 4)  // cdata node
							o["#cdata"] = X.escape(n.nodeValue);
						 else if (o[n.nodeName]) {  // multiple occurence of element ..
							if (o[n.nodeName] instanceof Array)
							   o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
							else
							   o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
						 }
						 else  // first occurence of element..
							o[n.nodeName] = X.toObj(n);
					  }
				   }
				   else { // mixed content
					  if (!xml.attributes.length)
						 o = X.escape(X.innerXml(xml));
					  else
						 o["#text"] = X.escape(X.innerXml(xml));
				   }
				}
				else if (textChild) { // pure text
				   if (!xml.attributes.length)
					  o = X.escape(X.innerXml(xml));
				   else
					  o["#text"] = X.escape(X.innerXml(xml));
				}
				else if (cdataChild) { // cdata
				   if (cdataChild > 1)
					  o = X.escape(X.innerXml(xml));
				   else
					  for (var n=xml.firstChild; n; n=n.nextSibling)
						 o["#cdata"] = X.escape(n.nodeValue);
				}
			 }
			 if (!xml.attributes.length && !xml.firstChild) o = null;
		  }
		  else if (xml.nodeType==9) { // document.node
			 o = X.toObj(xml.documentElement);
		  }
		  else
			 logger.debug("unhandled node type: " + xml.nodeType);
		  return o;
	   },
	   toJson: function(o, name, ind) {
		  var json = name ? ("\""+name+"\"") : "";
		  if (o instanceof Array) {
			 for (var i=0,n=o.length; i<n; i++)
				o[i] = X.toJson(o[i], "", ind+"\t");
			 json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
		  }
		  else if (o == null)
			 json += (name&&":") + "null";
		  else if (typeof(o) == "object") {
			 var arr = [];
			 for (var m in o)
				arr[arr.length] = X.toJson(o[m], m, ind+"\t");
			 json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
		  }
		  else if (typeof(o) == "string")
			 json += (name&&":") + "\"" + o.toString() + "\"";
		  else
			 json += (name&&":") + o.toString();
		  return json;
	   },
	   innerXml: function(node) {
		  var s = ""
		  if ("innerHTML" in node)
			 s = node.innerHTML;
		  else {
			 var asXml = function(n) {
				var s = "";
				if (n.nodeType == 1) {
				   s += "<" + n.nodeName;
				   for (var i=0; i<n.attributes.length;i++)
					  s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
				   if (n.firstChild) {
					  s += ">";
					  for (var c=n.firstChild; c; c=c.nextSibling)
						 s += asXml(c);
					  s += "</"+n.nodeName+">";
				   }
				   else
					  s += "/>";
				}
				else if (n.nodeType == 3)
				   s += n.nodeValue;
				else if (n.nodeType == 4)
				   s += "<![CDATA[" + n.nodeValue + "]]>";
				return s;
			 };
			 for (var c=node.firstChild; c; c=c.nextSibling)
				s += asXml(c);
		  }
		  return s;
	   },
	   escape: function(txt) {
		  return txt.replace(/[\\]/g, "\\\\")
					.replace(/[\"]/g, '\\"')
					.replace(/[\n]/g, '\\n')
					.replace(/[\r]/g, '\\r');
	   },
	   removeWhite: function(e) {
		  e.normalize();
		  for (var n = e.firstChild; n; ) {
			 if (n.nodeType == 3) {  // text node
				if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
				   var nxt = n.nextSibling;
				   e.removeChild(n);
				   n = nxt;
				}
				else
				   n = n.nextSibling;
			 }
			 else if (n.nodeType == 1) {  // element node
				X.removeWhite(n);
				n = n.nextSibling;
			 }
			 else                      // any other node
				n = n.nextSibling;
		  }
		  return e;
	   }
	};
	if (xml.nodeType == 9) // document node
	   xml = xml.documentElement;
	var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

var getAdjacentItems = function(activityJSON,taskidx,type){
	// get links
	if(type == 'task')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Task"][taskidx];
	else if (type == 'rhombus')
		var currentTask = activityJSON["mxGraphModel"]["root"]["Shape"][taskidx];

	// get previous links
	var previousLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@target"] == currentTask["@id"];
	});
	var previousNodes;
	// get next links
	var nextLinks = activityJSON["mxGraphModel"]["root"]["Edge"].filter(function(eachLink){
		return eachLink["mxCell"]["@source"] == currentTask["@id"];
	});	
	var previousLinksSourceList = [];	// list of id of sources
	// get next item
	
	if(previousLinks.length>0){
		// fill source list
		previousLinks.forEach(function(eachLink,eachLinkIdx){
			previousLinksSourceList.push(eachLink["mxCell"]["@source"]);
		})


		//search in shape just to check if node is connected to start node while generating scripts
		var filteredShape = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return previousLinksSourceList.indexOf(eachShape["@id"]) != -1;
		});
		if(filteredShape.length>0){previousNodes = filteredShape}
		else{
			//search in task
			var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
				return previousLinksSourceList.indexOf(eachTask["@id"]) != -1;
			});		
			if(filteredTask.length>0){
				previousNodes = filteredTask;
			}
			else{
				return {"error":"no match found!"};
			}
		}
	}
	// was assuming only 1 end node (target) earlier but since rhombus (if block) is introduced
	// can have multiple next links
	if(nextLinks.length>0){	
		//search in task
		var nextLinksList = [];
		nextLinks.forEach(function(eachNextLink,eachNextLinkIdx){
			nextLinksList.push(eachNextLink["mxCell"]["@target"]);
		})
		var filteredTask = activityJSON["mxGraphModel"]["root"]["Task"].filter(function(eachTask){
			return nextLinksList.indexOf(eachTask["@id"]) != -1;	//assuming only one earlier but now multiple
		});
		var filteredShapes = activityJSON["mxGraphModel"]["root"]["Shape"].filter(function(eachShape){
			return nextLinksList.indexOf(eachShape["@id"]) != -1;
		});		
		return {"sources":previousNodes,"targets":filteredTask.concat(filteredShapes)};
	}
}

exports.pdProcess = function (req, res) {
	try {
		const userid = req.session.userid;
		const role = req.session.activeRoleId;
		// orderlist contains {label:'',type:''}
		var file = JSON.parse(req.body.data.file);
		var sessionID = uuidV4();
		var orderMatrix = file.order;// 2d array list of all possible paths in case of multiple start nodes to guide through the order for mindmap creation
		// var doc = new DOMParser().parseFromString(file,'text/xml');

		// cleanup
		for(var i = 0; i < orderMatrix.length; i++) {
			var templist = orderMatrix[i];
			for(var j = 0; j < templist.length; j++) {
				orderMatrix[i][j].label = templist[j].label.replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');
			}
		}

		// testcase and screen creation
		var screenshotdatapertask = [],screendataobj = {},orderlist = [],nameMap = {},ordernameidlist = [],screendatamindmap=[];	
		var doc = new DOMParser().parseFromString(file.data,'text/xml');
		var activityJSON = JSON.parse(xml2json(doc).replace("\nundefined",""))
		// in case single task it returns object instead of list so make it list
		if(!activityJSON["mxGraphModel"]["root"]["Task"].length){
			activityJSON["mxGraphModel"]["root"]["Task"] = [activityJSON["mxGraphModel"]["root"]["Task"]];
		}

		// new logic
		//	 for each "task" create screen, testcase
		// 	 for each "if" create testcases 
		activityJSON["mxGraphModel"]["root"]["Task"].forEach(function(eachActivity,eachActivityIdx){
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'task');
			screendatamindmap = [];
			var custname_count = {};
			var custnames=[]
			var cust_flag=false
			try{
				screenshotdatapertask = JSON.parse(eachActivity["#cdata"]);	// list of objects
			}
			catch(ex){
				screenshotdatapertask = [];
			}
			// Encrypt for storage
			screenshotdatapertask.forEach(function(a,i){
				if(a['xpath']){
					if(a['apptype']=="WEB"){
						a['url']= encrypt(a['url'])
						xpath_string=a['xpath'].split(';').concat(['null',a['tag']]);
						left_part=encrypt(xpath_string.slice(0,2).join(';'));	// 0,1
						right_part=encrypt(xpath_string.slice(3,).join(';'));	// 3,4...
						a['xpath'] = left_part+';'+xpath_string[2]+';'+right_part;	
					}
					screendatamindmap.push(a);
				}
			});
			//renaming custname of objects
			custnames = screendatamindmap.map(ei => ei.custname);
			custnames.forEach(function(x,i) {
				if(custnames.indexOf(x) != i) {
					cust_flag=true;
					var c = custname_count[x] || 1;
					var j = c + 1;
					var k = x + '(' + j + ')';
					while( custnames.indexOf(k) !== -1 ) {
						k = x + '(' + (++j) + ')';
						custname_count[x] = j;
					}
					custnames[i] = k;
				}
			});
			if(cust_flag){
				for(i=0;i<custnames.length;i++){
					screendatamindmap[i].custname=custnames[i];
				}
			}
			// map data with screenname
			var tempName = eachActivity["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":screendatamindmap};
			var scrapedObjects = JSON.stringify(screendataobj[tempName].data);
			var parsedScrapedObj = JSON.parse(scrapedObjects);
			scrapedObjects = JSON.stringify(parsedScrapedObj);
			scrapedObjects = JSON.stringify(scrapedObjects);
			scrapedObjects = scrapedObjects.replace(/'+/g, "''");
			var newParse;
			if (scrapedObjects != null && scrapedObjects.trim() != '' && scrapedObjects != undefined) {
				newParse = JSON.parse(scrapedObjects);
			} else {
				newParse = JSON.parse("{}");
			}
			// scrapedObjects = newParse;		
			scrapedObjects = JSON.parse(newParse);	
			screendataobj[tempName].data = scrapedObjects;

			var testCaseOut = generateTestCaseMap(screenshotdatapertask,eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'task'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'task'});
			var requestedtestcasesteps = JSON.stringify(testCaseOut.data);
			requestedtestcasesteps = requestedtestcasesteps.replace(/'+/g, "''");
			screendataobj[tempName].script = JSON.parse(requestedtestcasesteps);
		});

		activityJSON["mxGraphModel"]["root"]["Shape"].forEach(function(eachShape,eachActivityIdx){
			if(eachShape.mxCell['@style']!='rhombus') return;
			var tempName = eachShape["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'');		// name id combo
			screendataobj[tempName] = {};
			screendataobj[tempName].data = {"mirror":"","view":[]};
			var adjacentItems = getAdjacentItems(activityJSON,eachActivityIdx,'rhombus');	// items adjacent to if block
			var testCaseOut = generateTestCaseMap([],eachActivityIdx,adjacentItems,sessionID);
			if(testCaseOut.start) orderlist.unshift({'label':tempName,'type':'rhombus'}) // in case of first script
			else orderlist.push({'label':tempName,'type':'rhombus'});
			screendataobj[tempName].script = testCaseOut.data;
		});

		// data insertion logic
		asynclib.forEachSeries(orderlist, function (nodeObj, savedcallback) {
			var name = nodeObj.label;
			if(screendataobj[name].data.view[0]!=undefined){
				var len1=(screendataobj[name].data.view).length
				var screenshotdeatils = screendataobj[name].data.view[len1-1].screenshot.split(";")[1];
			    var screenshotdata = screenshotdeatils.split(",")[1];
			}else{
				var screenshotdata = "";
			}
			var inputs = {
				'projectid': req.body.data.projectid,
				'screenname': 'Screen_'+name,
				'versionnumber': 0,
				'createdby': userid,
				'createdbyrole': role,
				'modifiedby': userid,
				'modifiedbyrole': role,
				'deleted': false,
				'createdthrough':'PD',
				'screenshot':screenshotdata,
				'scrapedurl':'',
				'createdthrough':'PD',
				'scrapedata': screendataobj[name].data
			};
			ordernameidlist.push({'name':'Screen_'+name,'type':3})

			var args = {
				data: inputs,
				headers: {
					"Content-Type": "application/json"
				}
			};

			client.post(epurl + "create_ice/updateScreenname_ICE", args,
				function (getScrapeDataQueryresult, response) {
					try {
						if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
							logger.error("Error occurred in create_ice/updateScreenname_ICE from fetchScrapedData Error Code : ERRDAS");
						} else {
							if(getScrapeDataQueryresult.rows[0]['parent']!=undefined){
								var screenid = getScrapeDataQueryresult.rows[0]['parent'][0];
								var dobjects = getScrapeDataQueryresult.rows;
							}else{
								var screenid = getScrapeDataQueryresult.rows;
								var dobjects = [];
							}
							var inputs = {
								'screenid': screenid,
								'testcasename': 'Testcase_'+name,
								'versionnumber': 0,
								'createdthrough': 'PD',
								'createdby': userid,
								'createdbyrole': role,
								'modifiedby': userid,
								'modifiedbyrole': role,
								'deleted': false,
								'parent':0,
								'dataobjects':dobjects,
								'steps':screendataobj[name].script
							};
							ordernameidlist.push({'name':'Testcase_'+name,'type':4})
							var args = {
								data: inputs,
								headers: {
									"Content-Type": "application/json"
								}
							};
							client.post(epurl + "create_ice/updateTestcasename_ICE", args,
								function (getScrapeDataQueryresult, response) {
									try {
										if (response.statusCode != 200 || getScrapeDataQueryresult.rows == "fail") {
											logger.error("Error occurred in design/getScrapeDataScreenLevel_ICE from fetchScrapedData Error Code : ERRDAS");
										} else {
											savedcallback();		
										}
									} catch (exception) {
										logger.error("Exception: %s",exception);
									}
								}
							);							
						}
					} catch (exception) {
						logger.error("Exception while sending scraped data from the function fetchScrapedData: %s",exception);
					}
				}
			);
		}, function(){
			//final callback
			res.send({"success":true,"data":orderMatrix,"history":activityJSON['mxGraphModel']['@history']});
		});
	} catch(exception) {
		logger.error("Error occurred in mindmap/pdProcess:", exception);
		res.status(500).send("fail");
	}
};

var getTestcaseStep = function(sno, ob, cn, keyVal, inp, out, url, app) {
	const tsp = {
		"stepNo": sno,
		"objectName": ob || ' ',
		"custname": cn,
		"keywordVal": keyVal,
		"inputVal": inp || [''],
		"outputVal": out || '',
		"remarks": "",
		"url": url || ' ',
		"appType": app,
		"addDetails": "",
		"cord": ''
	}
	if (app == "SAP") delete tsp["url"];
	return tsp;
};

var generateTestCaseMap = function(screendata,idx,adjacentItems,sessionID){
	var testCaseSteps = [],testcaseObj,step = 1;
	var firstScript = false,windowId;
	var temp_screendata=screendata;
	var menu_input='';
	var menu_count=step;
	var mflag=0;
	if(adjacentItems){
		// in case is first script
		// make orderlist global
		// move the script to first
		adjacentItems.sources.forEach(function(item,idx){
			if(item["@label"]=="Start" && screendata[0].apptype=="WEB"){
				firstScript = true;
				testCaseSteps = [getTestcaseStep(1,null,'@Browser','openBrowser',null,null,null,"Web")],step = 2;
			}
			else if(item["@label"]=="Start" && screendata[0].apptype=="SAP"){
				firstScript = true;
				testCaseSteps = [
					getTestcaseStep(1,null,'@Sap','LaunchApplication',null,null,null,"SAP"),
					getTestcaseStep(2,null,'@Sap','ServerConnect',null,null,null,"SAP")
				];
				mflag=1;
				step = 3;
				menu_count=step;
			}
			else if (item["@label"]=="Start" && screendata[0].apptype=="OEBS"){
				firstScript = true;
				testCaseSteps = [getTestcaseStep(1,null,'@Oebs','FindWindowAndAttach',screendata[0].url,null,null,"OEBS")],step = 2;
			}
		});	
	}

	screendata.forEach(function(eachScrapedAction,i){
		testcaseObj = '';
		var key, keycode_map;
		if(eachScrapedAction.apptype=="WEB"){
			if(eachScrapedAction.action){
				if(eachScrapedAction.action.windowId){
					if(windowId && windowId!=eachScrapedAction.action.windowId) {
						testcaseObj = getTestcaseStep(step,null,'@Browser','switchToWindow',null,null,eachScrapedAction.url,"Web");
						testCaseSteps.push(testcaseObj);
						windowId=eachScrapedAction.action.windowId;
						step++;
					}
					else{
						windowId=eachScrapedAction.action.windowId;
					}
				}            
				switch(eachScrapedAction.action.actionName){
					case "navigate":
						testcaseObj = getTestcaseStep(step,null,'@Browser','navigateToURL',[eachScrapedAction.action.actionData],null,null,"Web");
						break;
					case "click":
						if(eachScrapedAction.tag == "radiobutton") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'selectRadioButton',null,null,eachScrapedAction.url,"Web");
						} else if(eachScrapedAction.tag == "checkbox") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'selectCheckbox',null,null,eachScrapedAction.url,"Web");
						} else if(eachScrapedAction.tag == "table") {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'cellClick',null,null,eachScrapedAction.url,"Web");
						} else {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'click',null,null,eachScrapedAction.url,"Web");
							if(eachScrapedAction.custname.indexOf("_elmnt") !== -1) testcaseObj.keywordVal = 'clickElement';
						}
						break;
					case "inputChange":
						if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndex'){
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'selectValueByIndex',[eachScrapedAction.action.actionData.split(";")[0]],null,eachScrapedAction.url,"Web");                     
						}
						else if(eachScrapedAction.action.actionData.split(";").length == 2 && eachScrapedAction.action.actionData.split(";")[1] =='byIndexes'){
							var selectIdxList = eachScrapedAction.value.split(";")[0].replace(/,/g,';');
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'selectValueByIndex',[selectIdxList],null,eachScrapedAction.url,"Web");
							if(selectIdxList.length > 1) {
								testcaseObj.keywordVal = "selectMultipleValuesByIndexes";
							}
						}
						else {
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'setText',[eachScrapedAction.action.actionData],null,eachScrapedAction.url,"Web")
						}
						break;
                    case "inputReadOnly":
						testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,
								'setText',[eachScrapedAction.action.actionData],null,eachScrapedAction.url,"Web")
						break;
					case "sendKeys":
						key=eachScrapedAction.action.actionData;
						keycode_map = {
							'13': 'Enter'
						}
						testcaseObj = getTestcaseStep(step,null,'@Generic','sendFunctionKeys',[keycode_map[key]],null,null,"Generic")
						break;		
					default:
						break;
				}
				if(testcaseObj){
					testCaseSteps.push(testcaseObj);
					step++;
				}
			}
			else if(eachScrapedAction.tag == "browser_navigate"){
				testcaseObj = getTestcaseStep(step,null,"@Browser",'navigateToURL',[eachScrapedAction.url],null,null,"Web");
				testCaseSteps.push(testcaseObj);
				step++;
			}
		}
		//mapping for SAP objects 
		else if(eachScrapedAction.apptype=="SAP"){
			text = eachScrapedAction.text;
			input = text.split("  ");
			var menu_flg=0;
			var temp_mdata;
			//To concatinate menu objects into one
			if(eachScrapedAction.tag=="GuiMenu"){
				if(mflag==1) temp_mdata=temp_screendata[menu_count-2];
				else temp_mdata=temp_screendata[menu_count]
				if(temp_mdata && temp_mdata.tag=="GuiMenu"){
					menu_flg=1;
					menu_input=menu_input.concat(input+';');
				} else{
					menu_input=menu_input.concat(input);
				}
			}
			if(eachScrapedAction.tag=="tree" && eachScrapedAction.command[0][1]=="expandNode"){
				if(mflag==1) temp_mdata=temp_screendata[menu_count-2];
				else temp_mdata=temp_screendata[menu_count]
				if(temp_mdata && temp_mdata.tag=="tree") menu_flg=1;
			}
				
			if(menu_flg==0){
				if(eachScrapedAction.command[0][1]!='sendVKey'){
					switch(eachScrapedAction.tag){
						case "input":
						case "GuiOkCodeField":
							if(eachScrapedAction.command[0][1]!=undefined && eachScrapedAction.command[0][1]=='setFocus')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetFocus',null,null,null,"SAP");
							else if(eachScrapedAction.command[0][1]!=undefined && eachScrapedAction.command[0][1]=='text' && input[0]=='')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[eachScrapedAction.command[0][2]],null,null,"SAP");
							else
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"SAP");
							break;
						case "table":
							if(eachScrapedAction.command[0][1]=="getAbsoluteRow"){
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRow',[eachScrapedAction.command[0][2]+1],null,null,"SAP");
								if(eachScrapedAction.command[1][1]!="selected") testcaseObj.keywordVal = 'UnselectRow';
							}
							else if(eachScrapedAction.command[0][1]=="verticalScrollbar")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'scrollDown',null,null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="columns"){
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectColumn',[eachScrapedAction.command[1][2]+1],null,null,"SAP");
								if(eachScrapedAction.command[2][1]!="selected") testcaseObj.keywordVal = 'UnselectColumn';
							} else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "gridview":
							if(eachScrapedAction.command[0][1]=="selectColumn")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectColumns',[eachScrapedAction.command[0][2]],null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="pressToolbarButton")
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'PressToolbarButton',[eachScrapedAction.command[0][2]],null,null,"SAP");
							else if(eachScrapedAction.command[0][1]=="modifyCell"){
								var data = eachScrapedAction.command[0].slice(-3);
								var data1 = data.slice(0,2).map(i => 1 + i);
								data1.push(data[2]);
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetTextInCell',[data1.join(';')],null,null,"SAP");
							}	
							else if(eachScrapedAction.command[0][1]=="setCurrentCell"){
								const cell_inp = eachScrapedAction.command[0].slice(-2).map(i => 1 + i).join(';')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'ClickCell',[cell_inp],null,null,"SAP");
							}
							else if(eachScrapedAction.command[0][1]=="pressF4")
								testcaseObj = getTestcaseStep(step,null,"@Generic",'sendFunctionKeys',['F4'],null,null,"Generic");
							else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "GuiLabel":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							if(eachScrapedAction.command[0][1]=="setFocus") testcaseObj.keywordVal = 'SetFocus';
							break;
						case "calendar":
							if(eachScrapedAction.command[0][1]=="selectionInterval"){
								cal_range = (eachScrapedAction.command[0][2].split(',')).join(';')
								testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRange',[cal_range],null,null,"SAP");
							} else testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							break;
						case "button":
						case "shell":
						case "toolbar":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'Click',null,null,null,"SAP");
							if(eachScrapedAction.custname.indexOf("_elmnt") !== -1) testcaseObj.keywordVal = 'clickElement';
							break;
						case "GuiStatusbar":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'DoubleClickStatusBar',null,null,null,"SAP");
							break;
						case "GuiTab":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectTab',null,null,null,"SAP");
							break;
						case "select":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname, 'selectValueByText',[input[0]],null,null,"SAP");
							break;
						case "GuiMenu":
							testcaseObj = getTestcaseStep(step,null,'@Sap','SelectMenu',[menu_input],null,null,"SAP");
							break;
						case "GuiSimpleContainer":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname, 'DoubleClickOnCell',[input[0]],null,null,"SAP");
							break;
						case "radiobutton":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRadioButton',null,null,null,"SAP");
							break;
						case "checkbox":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectCheckbox',null,null,null,"SAP");
							if(eachScrapedAction.command[0][1]=='Unselected') testcaseObj.keywordVal = 'UnSelectCheckbox';
							break;
						case "tree":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectTreeElement',null,null,null,"SAP");
							break;
						case "picture":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'DoubleClick',null,null,null,"SAP");
							break;
						case "text":
							testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"SAP");
							break;
						case "GuiModalWindow":
						case "GuiDialogShell":
							if(eachScrapedAction.command[0][1]=='close')
								testcaseObj = getTestcaseStep(step,null,'@Sap','closedialogwindow',null,null,null,"SAP");
							break;
						default:
							logger.info("Import PD: No match found for "+eachScrapedAction.tag+" for SAP apptype.");
							break;
					}
				}
				else{
					key=eachScrapedAction.command[0][2]
					keycode_map = {
						'1': 'F1', '2': 'F2', '3': 'F3', '4': 'F4', '5': 'F5', '6': 'F6', '7': 'F7', '8': 'F8', '9': 'F9', '10': 'F10', '11': 'ctrl+s', '12': 'f12', '13': 'shift+f1',
						'14': 'shift+f2', '15': 'shift+f3', '16': 'shift+f4', '17': 'shift+f5', '18': 'shift+f6', '19': 'shift+f7', '20': 'shift+f8', '21': 'shift+f9',
						'22': 'shift+ctrl+0', '23': 'shift+f11', '24': 'shift+f12', '25': 'ctrl+f1', '26': 'ctrl+f2', '27': 'ctrl+f3', '28': 'ctrl+f4', '29': 'ctrl+f5',
						'30': 'ctrl+f6', '31': 'ctrl+f7', '32': 'ctrl+f8', '33': 'ctrl+f9', '34': 'ctrl+f10', '35': 'ctrl+f11', '36': 'ctrl+f12', '37': 'ctrl+shift+f1',
						'38': 'ctrl+shift+f2', '39': 'ctrl+shift+f3', '40': 'ctrl+shift+f4', '41': 'ctrl+shift+f5', '42': 'ctrl+shift+f6', '43': 'ctrl+shift+f7', '44': 'ctrl+shift+f8',
						'45': 'ctrl+shift+f9', '46': 'ctrl+shift+f10', '47': 'ctrl+shift+f11', '48': 'ctrl+shift+f12', '70': 'ctrl+e', '71': 'ctrl+f', '72': 'ctrl+/', '73': 'ctrl+\ ',
						'74': 'ctrl+n', '75': 'ctrl+o', '76': 'ctrl+x', '77': 'ctrl+c', '78': 'ctrl+v', '79': 'ctrl+z', '80': 'ctrl+pageup', '81': 'pageup', '82': 'pagedown', '83': 'ctrl+pagedown',
						'84': 'ctrl+g', '85': 'ctrl+r', '86': 'ctrl+p', '0': 'Enter'
					}
					testcaseObj = getTestcaseStep(step,null,'@Generic','sendFunctionKeys',[keycode_map[key]],null,null,"Generic");
				}
				if(testcaseObj){
					testCaseSteps.push(testcaseObj);
					step++;
					menu_count=step;
				}
			} else{
				menu_count++;
			}
		}
		//maping OEBS objects
		else if(eachScrapedAction.apptype=="OEBS"){
			text = eachScrapedAction.text;
			input = text.split("  ");
			switch(eachScrapedAction.tag){
				case "combo box":
				case "list":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectValueByText',[input[0]],null,null,"OEBS");
					break;
				case "push button":
				case "page tab":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'click',null,null,null,"OEBS");
					break;
				case "radio button":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectRadioButton',null,null,null,"OEBS");
					break;
				case "check box":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SelectCheckbox',null,null,null,"OEBS");
					break;
				case "text":
					if (eachScrapedAction.custname == '') eachScrapedAction.custname=eachScrapedAction.tag.concat("_elmnt");
					testcaseObj = getTestcaseStep(step,eachScrapedAction.xpath,eachScrapedAction.custname,'SetText',[input[0]],null,null,"OEBS");
					break;
				default:
					logger.info("Import PD: No match found for "+eachScrapedAction.tag+" for OEBS apptype.");
					break;
			}
			if(testcaseObj){
				testCaseSteps.push(testcaseObj);
				step++;
			}
		}
	});

	if(adjacentItems){
		// list of sources(only shapes) and targets (assuming only one)
		if(adjacentItems["error"]){
			logger.error("Error in pdProcess:generateTestCaseMap, Err: ", adjacentItems["error"]);
		}
		else{
			// old logic
			// in case target is if
			// 	get next items
			// 	add if step with jumpto those scripts (***outgoing connections equal to number of cases)

			// new logic
			// in case multiple targets, current node is "if" block create if steps
			// otherwise just jump to
			if(adjacentItems.targets.length>1){	// I am if block
				adjacentItems.targets.forEach(function(eachBox,eachBoxIdx){
					  testcaseObj = getTestcaseStep(step,null,"@Generic",'elseIf',null,null,null,"Generic");
					if(eachBoxIdx==0) testcaseObj["keywordVal"] = "if"; 		
					testCaseSteps.push(testcaseObj);
					step++;					
					if(eachBox["@label"]=="End"){// in case of end
						testcaseObj = getTestcaseStep(step,null,"@Generic",'stop',null,null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;
					}
					if(eachBox['mxCell']['@style'] == 'rhombus'){// in case of if
						testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
							['Testcase_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;
					}	
					else if(eachBox['mxCell']['@style'] == 'task'){	// in case of task
						testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
							['Testcase_'+eachBox["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
						testCaseSteps.push(testcaseObj);
						step++;								
					}
				});
				// end of if step
				testcaseObj = getTestcaseStep(step,null,"@Generic",'endIf',null,null,null,"Generic");
				testCaseSteps.push(testcaseObj);
				step++;							
			}

			// in case target is activity -> add jumpto activity
			else if(adjacentItems.targets[0]){	// assuming only 1 target // I am activity
				// in case activity target is end -> add end keyword
				if(adjacentItems.targets[0]["@label"]=="End"){	// assuming only 1 target // if end
					testcaseObj = getTestcaseStep(step,null,"@Generic",'stop',null,null,null,"Generic");
					testCaseSteps.push(testcaseObj);
					step++;			
				}	
				else{ // otherwise task or activity
					testcaseObj = getTestcaseStep(step,null,"@Generic",'jumpTo',
						['Testcase_'+adjacentItems.targets[0]["@label"].replace(/ /g,'_')+'_'+sessionID.replace(/-/g,'')],null,null,"Generic");
					testCaseSteps.push(testcaseObj);
					step++;													
				}
			}
		}
	}
	return {"data":testCaseSteps,"start":firstScript};
}

var encrypt = (data) => {
	const cipher = crypto.createCipheriv('aes-256-cbc', 'Nineeteen68@SecureScrapeDataPath', "0000000000000000");
	const encryptedData = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
	return 	encryptedData.toUpperCase();
}

/* Export data to Git repository. */
exports.exportToGit = async (req, res) => {
	const actionName = "exportToGit";
	logger.info("Inside UI service: " + actionName);
	try {
		const data = req.body;
		const gitVersionName = data.gitVersion;
		var gitFolderPath = data.gitFolderPath;
		const gitBranch = data.gitBranch;
		const moduleId = data.mindmapId;
		if(!gitFolderPath.startsWith("avoassuretest_artifacts")){
			gitFolderPath="avoassuretest_artifacts/"+gitFolderPath
		}
		const inputs = {
			"moduleId":moduleId,
			"userid":req.session.userid,
			"action":actionName,
			"gitBranch":gitBranch,
			"gitVersionName": gitVersionName,
			"gitFolderPath": gitFolderPath
		};
		const module_data = await utils.fetchData(inputs, "git/exportToGit", actionName);
		return res.send(module_data);
	} catch (ex) {
		logger.error("Exception in the service exportToGit: %s", ex);
		return res.status(500).send("fail");
	}
};

exports.exportMindmap = async (req, res) => {
	const fnName = "exportMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const mindmapId = req.body.mindmapId;
		const inputs= {
			"mindmapId": mindmapId,
			"query":"exportMindmap"
		}
		const result = await utils.fetchData(inputs, "mindmap/exportMindmap", fnName);
		if (result == "fail") {
			return res.send("fail");
		} else {
			return res.send(result);
		}
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.importMindmap = async (req, res) => {
	const fnName = "importMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const content = req.body;
		const inputs= {
			"mindmap": content,
			"query":"importMindmap"
		}
		const result = await utils.fetchData(inputs, "mindmap/importMindmap", fnName);
		res.send(result)
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};

exports.importGitMindmap = async (req, res) => {
	const fnName = "importGitMindmap";
	logger.info("Inside UI service: " + fnName);
	try {
		const projectid = req.body.projectid;
		const gitbranch = req.body.gitbranch;
		const gitversion = req.body.gitversion;
		var gitfolderpath = req.body.gitfolderpath;
		if(!gitfolderpath.startsWith("avoassuretest_artifacts")){
			gitfolderpath="avoassuretest_artifacts/"+gitfolderpath
		}
		const inputs= {
			"userid": req.session.userid,
			"roleid": req.session.activeRoleId,
			"projectid": projectid,
			"gitbranch": gitbranch,
			"gitversion":gitversion,
			"gitfolderpath":gitfolderpath
		}
		const result = await utils.fetchData(inputs, "git/importGitMindmap", fnName);
		res.send(result)
	} catch(exception) {
		logger.error("Error occurred in mindmap/"+fnName+":", exception);
		return res.status(500).send("fail");
	}
};