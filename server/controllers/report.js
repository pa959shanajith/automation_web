/**
 * Dependencies.
 */
var Joi = require('joi');
var cassandra = require('cassandra-driver');
var async = require('async');
var uuid = require('uuid-random');
var dbConnICE = require('../../server/config/icetestautomation');

exports.getMainReport_ICE = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var IP = req.headers.host.split(":")[0];//req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
		console.log("Jsreport server IP:::::",IP);
		var client = require("jsreport-client")("https://"+IP+":8001/");
		console.log("Jsreport server ::::::",client)
		client.render({
			template: { 
				shortid: "HJP1pqMcg", 
				recipe: "html",
				engine: "none" 
			}
		}, function(err, response) {
			if (err) {
				console.log('Error when trying to render report:', err);
				res.send("fail");
			}
			else{
				try{
					response.pipe(res);
				}
				catch(exception){
					console.log(exception);
					res.send("fail");
				}
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
}

	catch(exception){
		console.log(exception);
		res.send("fail");
	}
}

exports.renderReport_ICE = function(req, res){
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{

		var finalReports = req.body.finalreports;
		var reportType = req.body.reporttype;
		var shortId;
		var IP = req.headers.host.split(":")[0];//req.connection.servername;//localAddress.split(":")[req.connection.localAddress.split(":").length-1];
		console.log("Jsreport server IP:::::",IP);
		if(reportType == "html") shortId = "rkE973-5l";
		else shortId = "H1Orcdvhg";
		var client = require("jsreport-client")("https://"+IP+":8001/");
		console.log("Jsreport server ::::::",client)
		client.render({
			template: { 
				shortid: shortId, 
				recipe: reportType,
				engine: "handlebars" 
			},
			data: {
				"overallstatus": finalReports.overallstatus,
				"rows": finalReports.rows
			}
		}, function(err, response) {
			if (err) {
				console.log('Error when trying to render report:', err);
				res.send("fail");
			}
			else{
				try{
					if(reportType == "html"){
						response.pipe(res)						
					}
					else{
						/*var filename = shortId;
						var file = tmpdir + filename;
						res.header('Content-disposition', 'inline; filename=' + filename);
						res.header('Content-type', 'application/pdf');
						Phantom.create(function(phantom) {
						    phantom.createPage(function(page) {
						      // Render PDF and send to browser
						      function dispatchPDF() {
						        page.render(file, function() {
						          fs.createReadStream(file).pipe(res);
						          phantom.exit();
						        });
						      };

						      page.set('content', response);
						      page.set('paperSize', '5in');
						      page.set('onLoadFinished', dispatchPDF);
						   });
						});*/
						response.pipe(res)
					}
				}
				catch(exception){
					console.log(exception);
					res.send("fail");
				}
			}
		});		
	}
	else{
		res.send("Invalid Session");
	}
}
	catch(exception){
		console.log(exception);
		res.send("fail")
	}
}

exports.getAllSuites_ICE = function (req, res) {
	if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
	console.log("coming into getAllSuites_ICE service")
	var req_userId=req.body.userId;
	//req_userId = 'a144b468-e84f-4e7c-9a8a-0a658330212e';
	var getDomain="SELECT domainid FROM icepermissions WHERE userid="+req_userId+";";
	var testSuiteDetails=[];
	var flag="";
	async.series({
			domainAssignedWithUserID: function(callback){
				dbConnICE.execute(getDomain,function(err,result){
					console.log("Exe getAllSuites_ICE service")
					if(err){
						flag="fail";
						res.send(flag);
						console.log(err);
					}else{
						try{
							var domainid = JSON.parse(JSON.stringify(result.rows[0].domainid));
							resultdata = domainid;
							//console.log(resultdata);
							callback(err,resultdata);					
						}catch(ex){
							console.log("Exception occured in fetching domain_id getAllSuites_ICE : ",ex);
							res.send("fail");
						}
					}
				});
			},
			projectsUnderDomain: function(callback){
				var getProjectIDs="SELECT projectid FROM projects WHERE domainid="+resultdata+";";
				dbConnICE.execute(getProjectIDs,function(err,result){
					if(err){
						flag="fail";
						console.log("Error occured in getAllSuites_ICE : Fail");
						res.send(flag);
					}else{
						async.forEachSeries(result.rows, function(iterator, callback2) {
							try{
								var releaseids = "SELECT releaseid FROM releases WHERE projectid="+iterator.projectid;
								dbConnICE.execute(releaseids,function(err,releaseidsdata){
									if(err){
										console.log(err);
									}else{
										async.forEachSeries(releaseidsdata.rows,function(releaseiditr,callback3){
											try{
												var cycleids = "SELECT cycleid FROM cycles WHERE releaseid="+releaseiditr.releaseid;
												dbConnICE.execute(cycleids,function(err,cycleidsdata){
													if(err){
														console.log(err);  
													}else{
														async.forEachSeries(cycleidsdata.rows,function(cycleiditr,callback4){
															try{
																var testsuiteids = "SELECT testsuiteid,testsuitename FROM testsuites WHERE cycleid="+cycleiditr.cycleid;
																dbConnICE.execute(testsuiteids,function(err,testsuiteidsdata){
																	if(err){
																		console.log(err);  
																	}else{
																		async.forEachSeries(testsuiteidsdata.rows,function(testsuiteiditr,callback5){
																			try{
																				testSuiteDetails.push({
																					testsuiteid :  testsuiteiditr.testsuiteid ,
																					testsuitename: testsuiteiditr.testsuitename
																				});
																				callback5();
																			}
																			catch(exception){
																				console.log(exception);
																				res.send("fail");
																			}
																		},callback4);
																	}
																});
															}
															catch(exception){
																console.log(exception);
																res.send("fail");
															}
														},callback3);
													}
												});
											}
											catch(exception){
												console.log(exception);
												res.send("fail");
											}
										},callback2);
									}
								});
							}
							catch(exception){
								console.log(exception);
								res.send("fail");
							}
						}, callback);
					}
				});

			}
			},
			function(err,results){
				//data.setHeader('Content-Type','application/json');
				if(err){
					console.log("Error::::::",err)
					res.send("fail");
				} 
				else{
					//console.log(JSON.stringify(testSuiteDetails));
					res.send(JSON.stringify(testSuiteDetails));
				} 
			})
		}
	else{
		res.send("Invalid Session");
	}	
}


exports.getSuiteDetailsInExecution_ICE = function (req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{

		var req_testsuiteId=req.body.testsuiteid;
		var startTime, endTime, starttime, endtime;
		var executionDetailsJSON=[];
		var getExecutionDetails="SELECT executionid,starttime,endtime FROM execution WHERE testsuiteid="
			+ req_testsuiteId ;

		dbConnICE.execute(getExecutionDetails,function(err,executionData){
			try{
				if(err){
					console.log(err);
					res.send("fail");
				}else{
					for (var i = 0; i < executionData.rows.length; i++) {
						startTime = executionData.rows[i].starttime;
						endTime = executionData.rows[i].endtime;
						starttime = startTime.getDate()+"-"+(startTime.getMonth()+1)+"-"+startTime.getFullYear()+" "+startTime.getHours()+":"+startTime.getMinutes();
						endtime =  endTime.getDate()+"-"+(endTime.getMonth()+1)+"-"+endTime.getFullYear()+" "+endTime.getHours()+":"+endTime.getMinutes();
						executionDetailsJSON.push({
							execution_id :  executionData.rows[i].executionid,
							start_time: starttime,
							end_time: endtime
						});
						//executionDetailsArray.push(executionDetailsJSON);
					}
					//console.log('executionDetailsJSON ',JSON.stringify(executionDetailsJSON));
					res.send(JSON.stringify(executionDetailsJSON));
				}
			}
			catch(exception){
				console.log(exception);
				res.send("fail");
			}
		});
	}
	else{
		res.send("Invalid Session");
	}
	}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
}


exports.reportStatusScenarios_ICE = function (req, res) {
	try{
		f(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var req_executionId = req.body.executionId;
		var reportList=[];
		var report=[];
		async.series({
			executiondetails:function(callback){
				var reportFetchQuery = "SELECT * FROM reports where executionid="+req_executionId+" ALLOW FILTERING";
				dbConnICE.execute(reportFetchQuery, function (err, result) {
					if (err) {
						var flag = "fail";
						console.log(err);
						res.send(flag);
					}else {
						async.forEachSeries(result.rows, function(iterator, callback2) {
							try{
								var executedtimeTemp = iterator.executedtime;
								if(executedtimeTemp != null){
									executedtimeTemp = executedtimeTemp.getDate()+"-"+(executedtimeTemp.getMonth()+1)+"-"+executedtimeTemp.getFullYear()+" "+executedtimeTemp.getHours()+":"+executedtimeTemp.getMinutes();
								}						
								var browserTemp = iterator.browser;
								var statusTemp = iterator.status;
								var reportidTemp = iterator.reportid;
								var testscenarioidTemp = iterator.testscenarioid;
								var scenarioName = "SELECT testscenarioname FROM testscenarios where testscenarioid="+iterator.testscenarioid+" ALLOW FILTERING";
								dbConnICE.execute(scenarioName,function(err,scenarioNameDetails){
									if(err){
										var flag = "fail";
										console.log(err);
										res.send(flag);  
									}else{
										async.forEachSeries(scenarioNameDetails.rows,function(testScenarioNameitr,callback3){
											try{
												report.push({
													executedtime :  executedtimeTemp ,
													browser: browserTemp,
													status: statusTemp,
													reportid :  reportidTemp ,
													testscenarioid: testscenarioidTemp,
													testscenarioname :  testScenarioNameitr.testscenarioname
												})
												callback3();
											}
											catch(exception){
												console.log(exception);
												res.send("fail");
											}
										},callback2);
									}
								});
								//reportList.push(report);
							}
							catch(exception){
								console.log(exception);
								res.send("fail");
							}
						},callback);  
					}
				});
			}
		},
		function(err,results){
			if(err){
				console.log('Error:--',err);
				res.send("fail");
			} 
			else{
				res.send(JSON.stringify(report));
			} 
		})		
	}
		else{
		res.send("Invalid Session");
	}
}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
}


exports.getReport = function (req, res) {
	if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
	var reportDetails=[];
	async.series({	
		reportdetails:function(callback){
			var reportDetailsQuery = "select report,time,testscenario_id from reports where report_id="
				+ reportId + "ALLOW FILTERING";
			dbConnICE.execute(reportDetailsQuery, function (err, result) {
				if(err){
					console.log(err);  
				}else{
					async.forEachSeries(result.rows,function(reportitr,callback2){
						reportDetails.push({
							report :  reportitr.rows[i].report ,
							testscenarioid: reportitr.rows[i].testscenarioid
						})
						var releaseids = "SELECT testsuiteid,cycleid,testsuitename FROM testsuites WHERE testscenarioids CONTAINS "+iterator.projectid;
						dbConnICE.execute(releaseids,function(err,releaseidsdata){
							if(err){
								console.log(err);  
							}else{

							}
						})
					}, callback);
				}
			});
		}
	})
		}
	else{
		res.send("Invalid Session");
	}
}

exports.getReport_Nineteen68 = function(req, res) {
	try{
		
if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{
		var reportId = req.body.reportId;
		var testsuiteId = req.body.testsuiteId;
		var testsuitename = req.body.testsuitename;
		var reportInfoObj = {};
		var reportjson = {};
		var flag="";
		async.series({
			projectsUnderDomain: function(callback) {
				var getReportQuery = "select report,executedtime,testscenarioid from reports where reportid=" +
				reportId + " ALLOW FILTERING";
				dbConnICE.execute(getReportQuery, function(err, reportResult) {
					if (err) {
						flag="fail";
						console.log("Failed to get report, executed time and scenarioIds from reports");
						res.send(flag);
					} else {
						var reportres = reportResult.rows.length;
						async.forEachSeries(reportResult.rows, function(iterator, callback1) {
							try{
								var reportdata = iterator.report;
								var executedtime = iterator.executedtime;
								var testscenarioid = iterator.testscenarioid;
								reportjson.reportdata = reportdata;
								reportInfoObj.reportId = reportId;
								reportInfoObj.executedtime = executedtime;
								reportInfoObj.testscenarioid = testscenarioid;
								var getReportQuery2 = "select testscenarioname,projectid from testscenarios where testscenarioid=" + testscenarioid + " ALLOW FILTERING";
								dbConnICE.execute(getReportQuery2, function(err, scenarioResult) {
									if (err) {
										console.log("Failed to get scenario name and projectId from scenarios.");
									} else {
										async.forEachSeries(scenarioResult.rows, function(sceiditr, callback2) {
											try{
												var testscenarioname = sceiditr.testscenarioname;
												var projectid = sceiditr.projectid;
												reportInfoObj.testscenarioname = testscenarioname;
												reportInfoObj.projectid = projectid;
												//	var getReportQuery3 = "select testscenarioids,cycleid from testsuites ";
												var getReportQuery3 = "select cycleid from testsuites where testsuiteid=" + testsuiteId + " and testsuitename = '" + testsuitename + "' ALLOW FILTERING";
												dbConnICE.execute(getReportQuery3, function(err, suiteResult) {
													if (err) {
														console.log("Failed to get cycle Ids from test suites.");
													} else {
														// var   testscenarioids=[];
														async.forEachSeries(suiteResult.rows, function(suiteiditr, callback3) {
															try{
																var cycleid = suiteiditr.cycleid;
																reportInfoObj.cycleid = cycleid;
																// count=0;
																/*	console.log('suiteResult.rows', suiteResult.rows.length);
	                                                    	testscenarioids12 = suiteiditr.testscenarioids;
	                                                    	if (testscenarioids12 != null) {
	                                                    		for (var i = 0; i < testscenarioids12.length; i++) {
	                                                    			if (testscenarioids12[i].toString() == testscenarioid.toString()) {
	                                                    				cycleid = suiteiditr.cycleid;
	                                                    				reportInfoObj.cycleid = cycleid;
	                                                    				break;
	                                                    			}
	                                                    		}
	                                                    	}*/
																//   callback3();
																//	var cycledetails = "select cyclename,releaseid from cycles";
																var cycledetails = "select cyclename,releaseid from cycles where cycleid=" + cycleid + "ALLOW FILTERING";
																dbConnICE.execute(cycledetails, function(err, cycleResult) {
																	if (err) {
																		console.log("Failed to get cycle name and releaseId from cycles.");
																	} else {
																		async.forEachSeries(cycleResult.rows, function(cycleiditr, callback4) {
																			try{
																				var cyclename = cycleiditr.cyclename;
																				var releaseid = cycleiditr.releaseid;
																				reportInfoObj.cyclename = cyclename;
																				reportInfoObj.releaseid = releaseid;
																				// callback4();
																				var releasedetails = "select releasename,projectid from releases where releaseid=" + releaseid + " ALLOW FILTERING";
																				dbConnICE.execute(releasedetails, function(err, releaseResult) {
																					if (err) {
																						console.log("Failed to get release name and projectsId from releases.");
																					} else {
																						async.forEachSeries(releaseResult.rows, function(reliditr, callback5) {
																							try{
																								var releasename = reliditr.releasename;
																								var projectid = reliditr.projectid;
																								reportInfoObj.releasename = releasename;
																								reportInfoObj.projectid = projectid;
																								//console.log('final reportInfoObj in release deatails', reportInfoObj);
																								var projectdeatils = "select projectname,domainid from projects where projectid=" + projectid + " ALLOW FILTERING";
																								dbConnICE.execute(projectdeatils, function(err, projectResult) {
																									if (err) {
																										console.log("Failed to get project name and domainId from projects.");
																									} else {
																										async.forEachSeries(projectResult.rows, function(proiditr, callback6) {
																											try{
																												var projectname = proiditr.projectname;
																												var domainid = proiditr.domainid;
																												reportInfoObj.projectname = projectname;
																												reportInfoObj.domainid = domainid;

																												var domaindetails = "select domainname from domains where domainid=" + domainid + " ALLOW FILTERING";
																												dbConnICE.execute(domaindetails, function(err, domainResult) {
																													if (err) {
																														console.log("Failed to get domain name from domains.");
																													} else {
																														async.forEachSeries(domainResult.rows, function(domainiditr, callback7) {
																															try{
																																var domainname = domainiditr.domainname;
																																reportInfoObj.domainname = domainname;
																																//console.log('final reportInfoObj in domain deatails', reportInfoObj);
																																callback7();
																															}catch(exception){
																																console.log(exception);
																																res.send("fail");
																															}
																														}, callback6);
																													}
																												});
																											}catch(exception){
																												console.log(exception);
																												res.send("fail");
																											}
																										}, callback5);
																									}
																								});
																							}catch(exception){
																								console.log(exception);
																								res.send("fail");
																							}
																						}, callback4);
																					}
																				});
																			}catch(exception){
																				console.log(exception);
																				res.send("fail");
																			}
																		}, callback3);
																	}
																});
															}catch(exception){
																console.log(exception);
																res.send("fail");
															} 
														}, callback2);
													}
												});
											}catch(exception){
												console.log(exception);
												res.send("fail");
											} 
										}, callback1);
									}
								});
							}catch(exception){
								console.log(exception);
								res.send("fail");
							} 
						}, callback);
					}
				});
				//adding false check paran
				// }
			}
		},
		function(err, results) {
			// data.setHeader('Content-Type','application/json');
			if (err) {
				console.log(err);
				cb(err);
				res.send("fail");
			} else {
				console.log('in last function');
				var finalReport = [];
				finalReport.push(reportInfoObj);
				finalReport.push(reportjson)
				res.send(finalReport);
			}
		});		
	}
	else{
		res.send("Invalid Session");
	}
}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
};


exports.exportToJson_ICE = function(req, res) {
	try{
		if(req.cookies['connect.sid'] != undefined)
		{
			var sessionCookie = req.cookies['connect.sid'].split(".");
			var sessionToken = sessionCookie[0].split(":");
			sessionToken = sessionToken[1];
		}
			if(sessionToken != undefined && req.session.id == sessionToken)
		{

		var reportId = req.body.reportId;
		var reportInfoObj = {};
		async.series({
			projectsUnderDomain: function(callback) {
				var getReportQuery = "select report from reports where reportid =" +reportId + " ALLOW FILTERING ";
				dbConnICE.execute(getReportQuery, function(err, reportResult) {
					if (err) {
						console.log("Failed to get reports.");
						res.send("fail");
					} 
					else {
						try{
							var reportres = reportResult.rows.length;
							async.forEachSeries(reportResult.rows, function(iterator, callback1) {
								try{
									var reportdata = iterator.report;
									reportInfoObj.reportdata = reportdata;
									var testScenarioQuery = "select testscenarioid from reports where reportid ="+ reportId + " ALLOW FILTERING ";
									dbConnICE.execute(testScenarioQuery, function(err, scenarioResult) {
										if (err) {
											console.log("Failed to get scenario Id from reports.");
										} else {
											var reportres = scenarioResult.rows.length;
											async.forEachSeries(scenarioResult.rows, function(sceiditr, callback2) {
												try{
													var scenarioid=sceiditr.testscenarioid;
													var testScenarionameQuery = "select testscenarioname from testscenarios where testscenarioid ="
														+ scenarioid + " ALLOW FILTERING ";
													dbConnICE.execute(testScenarionameQuery, function(err, scenarionameResult) {
														if (err) {
															console.log("Failed to get testscenarioname from testscenarios.");
														} 
														else {
															var scenameres = scenarionameResult.rows.length;
															async.forEachSeries(scenarionameResult.rows, function(scenameitr, callback3) {
																try{
																	var scenarioname=scenameitr.testscenarioname;
																	reportInfoObj.scenarioname = scenarioname;
																	callback3(); 
																}
																catch(exception){
																	console.log(exception);
																	res.send("fail");
																}                    
															},callback2);
														}
													});
												}
												catch(exception){
													console.log(exception);
													res.send("fail");
												}
											},callback1);
										}
									});
								}
								catch(exception){
									console.log(exception);
									res.send("fail");
								}
							}, callback);
						}
						catch(exception){
							console.log(exception);
							res.send("fail");
						}
					}
				});
			}
		},
		function(err, results) {
			if (err) {
				console.log(err);
				cb(err);
				res.send("fail");
			} else {
				console.log('in last function');
				res.send(reportInfoObj);
			}
		});		
	}
	else{
		res.send("Invalid Session");
	}
}
	catch(exception){
		console.log(exception);
		res.send("fail");
	}
};
//serviceController.createStructure= {
//handler: function(req, reply) {
//var RequestedJSON={ "projectId": "42c3238d-7c0f-48dc-a6e1-fd5deeab845f","releaseId":"05329457-f02f-4d41-8ffc-9e04d2d380e3","cycleId": "69906803-f30d-485a-9bd1-0719c3e70ff4","appType": "Web","testsuiteDetails": [{"testsuiteName": "AHRI_RFRN_Manage_Disciplinary_Mode_Penalty","testscenarioDetails": [{"testscenarioName": "RFRN_OEM_Prerequisites","screenDetails": [{"screenName": "AHRI_Login","testcaseDetails": [{"testcaseName": "AHRI_USHP_AT"}]}, {"screenName": "Common_Excel_Data","testcaseDetails": [{"testcaseName": "AHRI_USAC_PBM"}]}]}, {"testscenarioName": "RFRN_Manage_Disciplinary_Mode_Penalty","screenDetails": [{"screenName": "Common_Manage_Program","testcaseDetails": [{"testcaseName": "USAC_Systems"}, {"testcaseName": "USAC_PBM_Single_Entry"}]}, {"screenName": "AHRI_QuickSearch","testcaseDetails": [{"testcaseName": "USAC_QuickSearch"}, {"testcaseName": "USHP_QuickSearch"}]}]}]}]};
//var projectid=RequestedJSON.projectId;
//var cycleId=RequestedJSON.cycleId;
//console.log('projectid',projectid);
//console.log('cycleId',cycleId);
//var suite=RequestedJSON.testsuiteDetails.length;
//console.log('before async calllllllllllll');
//async.forEachSeries(suite, function(suiteiterator, callback1) {
//console.log('inside suite async series')
//var suiteID=uuid(); 
//var suitedetails=RequestedJSON.testsuiteDetails[i];
//var testsuiteName=suitedetails.testsuiteName;
//var insertInSuite="INSERT INTO testsuites (cycleid,testsuitename,testsuiteid,versionnumber,condtitioncheck,createdby,createdon,createdthrough,deleted,donotexecute,getparampaths,history,modifiedby,modifiedon,skucodetestsuite,tags,testscenarioids) VALUES ("+cycleId+",'"+testsuiteName+"',"+suiteID+",1,null,'Kavyashree',"+new Date().getTime()+",null,null,null,null,null,null,"+new Date().getTime()+",null,null,null);";
//dbConnICE.execute(insertInSuite,function(err,result){
//if(err){
//console.log(err);
//}else{
//var scenario=suitedetails.testscenarioDetails.length;
//async.forEachSeries(scenario, function(scenarioiterator, callback2) {
//var scenarioId=uuid();
//scenariosarray.push(scenarioId);
//var modifiedon=new Date().getTime();
//var scenariodetails=suitedetails.testscenarioDetails[j];
//var scenarioName=scenariodetails.testscenarioName;
//var insertInScenario="insert into testscenarios(projectid,testscenarioname,testscenarioid,createdby,createdon,deleted,history,modifiedby,modifiedbyrole,modifiedon,skucodetestscenario,tags,testcaseids) VALUES ("+projectid+",'"+scenarioName+"',"+scenarioId+",'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";

//dbConn.execute(insertInScenario,function(err,result){
//if(err){
//console.log(err);
//}else{

//console.log('scenario successfullly inserted');
//var screen=scenariodetails.screenDetails.length;
//async.forEachSeries(screen, function(screeniterator, callback3) {
//var screenId=uuid();
//var screenDetails=scenariodetails.screenDetails[k];
//var screenName=screenDetails.screenName;
////										console.log('screenName details',screenName);
//var insertInScreen="INSERT INTO screens (projectid,screenname,screenid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,screendata,skucodescreen,tags) VALUES ("+projectid+",'"+screenName+"',"+screenId+",1,'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";
//dbConn.execute(insertInScreen,function(err,result){
//if(err){
//console.log(err);
//}else{

//console.log('SCREEN successfullly inserted');
//var testcase=screenDetails.testcaseDetails.length;
//async.forEachSeries(testcase, function(testcaseiterator, callback4) {
//var testcaseID=uuid();
//testcasesarray.push(testcaseID);
////													console.log('testcasesarray lengthhhhhhhhhhhhhhhhhh',testcasesarray);
//var testcaseDetails=screenDetails.testcaseDetails[a];
//var testcaseName=testcaseDetails.testcaseName;
////													console.log('testcaseName details',testcaseName);
//var insertInTescase="INSERT INTO testcases (screenid,testcasename,testcaseid,versionnumber,createdby,createdon,createdthrough,deleted,history,modifiedby,modifiedon,skucodetestcase,tags,testcasesteps)VALUES ("+screenId+",'"+testcaseName+"',"+testcasesarray[a]+",1,'Kavyashree',"+new Date().getTime()+",null,null,null,null,"+new Date().getTime()+",null,null,null)";

//dbConn.execute(insertInTescase,function(err,result){
//if(err){
//console.log(err);
//}else{

//console.log('Tescase successfullly inserted');
//}
//});
//},callback3);
//}
//});
//},callback2);
//}
//});
//},callback1);
//}
//});
//});
//}
//})
//};




