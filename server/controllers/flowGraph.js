var myserver = require('../lib/socket.js');
var logger = require('../../logger');
var redisServer = require('../lib/redisSocketHandler');
var Client = require("node-rest-client").Client;
var client = new Client();
var epurl = "http://"+process.env.NDAC_IP+":"+process.env.NDAC_PORT+"/";
//var fs = require('fs');

function isSessionActive(req){
	var sessionToken = req.session.uniqueId;
    return sessionToken != undefined && req.session.id == sessionToken;
}

exports.flowGraphResults = function(req, res){
	logger.info("Inside UI service: flowGraphResults");
	try{
		if(isSessionActive(req)){
			var name = req.session.username;
			var version = req.body.version;
			var path = req.body.path;
			/*validatePath(path);
			function validatePath(path){
				logger.info("Inside function: validatePath");
				valid = true;
				try{
					fs.lstatSync(path).isDirectory();
					fs.lstatSync(path).isFile();
				}catch(exception){
					valid = false; 
				}
			}*/
			redisServer.redisSub2.subscribe('ICE2_' + name ,1);
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					logger.info("Sending socket request for generateFlowGraph to redis");
					dataToIce = {"emitAction" : "generateFlowGraph","username" : name, "version":version, "path" : path};
					redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function generateFlowGraph_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSub2.removeListener('message',generateFlowGraph_listener);	
								logger.error("Error occured in flowGraphResults: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}
							} else if (data.onAction == "flowgraph_result") {
								try {
									var mySocketUI = myserver.allSocketsMapUI[name];
									mySocketUI.emit("newdata", value);
								} catch (exception) {
									logger.error(exception.message);
								}
							} else if (data.onAction == "result_flow_graph_finished") {
								redisServer.redisSub2.removeListener('message',generateFlowGraph_listener);	
								try {
									var mySocketUI = myserver.allSocketsMapUI[name];
									mySocketUI.emit("endData", value);
									res.status(200).json({success: true});
								} catch (exception) {
									logger.error(exception.message);
									res.status(500).json({success: false, data: exception});
								}
							}
						}
					};
					redisServer.redisSub2.on("message",generateFlowGraph_listener);
				} else {
					logger.info("ICE socket not available for Address : %s", name);
					res.send("unavailableLocalServer");
				}
			});
		}
		else{
			logger.info("Error occured in the service flowGraphResults: Invalid Session");
			return res.send("Invalid session");
		}
	}catch(exception){
		logger.error(exception.message);
		logger.error("Error occured in flowGraphResults");
	}
}
/**
 * @author nikunj.jain
 * the service is used to open the file (with the line number) in a specified editor
 */
exports.APG_OpenFileInEditor = function (req, res) {
	try {
		logger.info("Inside UI service: APG_OpenFileInEditor");
		if (isSessionActive(req)) {
			var name = req.session.username;
			redisServer.redisSub2.subscribe('ICE2_' + name);
			redisServer.redisPub1.pubsub('numsub','ICE1_normal_' + name,function(err,redisres){
				if (redisres[1]>0) {
					var editorName = req.body.editorName;
					var filePath = req.body.filePath;
					var lineNumber = req.body.lineNumber;
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					logger.info("ICE Socket requesting Address: %s" , name);
					logger.info("Sending socket request for apgOpenFileInEditor to redis");
					dataToIce = {"emitAction" : "apgOpenFileInEditor","username" : name,
								"editorName":editorName,"filePath":filePath,"lineNumber":lineNumber};
					redisServer.redisPub1.publish('ICE1_normal_' + name,JSON.stringify(dataToIce));
					function apgOpenFileInEditor_listener(channel,message) {
						data = JSON.parse(message);
						if(name == data.username){
							var value = data.value;
							if (data.onAction == "unavailableLocalServer") {
								redisServer.redisSub2.removeListener('message',apgOpenFileInEditor_listener);	
								logger.error("Error occured in APG_OpenFileInEditor: Socket Disconnected");
								if('socketMapNotify' in myserver &&  name in myserver.socketMapNotify){
									var soc = myserver.socketMapNotify[name];
									soc.emit("ICEnotAvailable");
								}

							}  else if (data.onAction == "open_file_in_editor_result") {
								redisServer.redisSub2.removeListener('message',apgOpenFileInEditor_listener);	
								try {
									res.send(data.value);
								} catch (exception) {
									logger.error(exception.message);
									res.status(500).json({success: false, data: exception});
								}
							}
						}
					};
					redisServer.redisSub2.on("message",apgOpenFileInEditor_listener);
				} else {
					logger.info("ICE socket not available for Address : %s", name);
					res.send("unavailableLocalServer");
				}
			});
		} else {
			logger.error("Error occured in the service APG_OpenFileInEditor: Invalid Session");
			res.send("Invalid Session");
		}
	} catch (exception) {
		logger.error("Exception in the service APG_OpenFileInEditor: %s",exception);
	}
};

/**
 * @author nikunj.jain
 * the service is used to create an APG project in the DB
 */
exports.APG_createAPGProject = function(req,res){
	try{
			logger.info("Inside UI service: APG_createAPGProject");
			if(isSessionActive(req)){
				var name = req.session.username;
				var inputs = req.body.data;
				inputs.createdby = name;
				inputs.modifiedby = name;
				logger.debug(inputs);
				var args = {
					data: inputs,
					headers: {
						"Content-Type": "application/json"
					}
				};
				logger.info("Calling NDAC Service from APG_createAPGProject: /apg/createAPGProject");
				client.post(epurl+"apg/createAPGProject", args,
				function (result, response) {
					if (response.statusCode != 200 || result.rows == "fail") {
						logger.error("Error occured in apg/createAPGProject: APG_createAPGProject service");
						res.status(response.statusCode).json({success: false})
					}
					else {
						res.status(200).json({success: true});
					}
				});
				
			}else {
				logger.error("Error occured in the service APG_createAPGProject: Invalid Session");
				res.send("Invalid Session");
			}
	}
	catch(exception){
		logger.error(exception.message);
		logger.error("Error occured in APG_createAPGProject");
	}
};