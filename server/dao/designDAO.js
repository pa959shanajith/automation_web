/**
 * Dependencies.
 */
var Hapi = require('hapi');
var Joi = require('joi');
var dbConnICE = require('../../server/config/icetestautomation');
var cassandra = require('cassandra-driver');
var cb = require('callback');
var fs = require('fs');
var myserver = require('../../server.js');
var in_array = require('in_array');

var reqScrapJson =  {};
module.exports = {
		initScraping_ICE: function initScraping_ICE(req, cb, data) {
			var browserType = req.payload.browserType;
			//console.log(browserType);
			reqScrapJson.appType = "Web";
			reqScrapJson.action =  "SCRAPE"
				if(browserType == "chrome")
				{
					var data = "OPEN BROWSER CH";
				}
				else if(browserType == "ie")
				{
					var data = "OPEN BROWSER IE";
				}
				else if(browserType == "mozilla")
				{
					var data = "OPEN BROWSER FX";
				}
			var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
			var mySocket =  myserver.allSocketsMap[ip];
			mySocket.send(data);
			mySocket.on('message', function(data){
				cb(null, data);
			});
		},

		highlightScrapElement_ICE: function highlightScrapElement_ICE(req, cb, data) {
			var focusParam = req.payload.elementXpath+","+req.payload.elementUrl;
			var ip = req.headers['x-forwarded-for'] || req.info.remoteAddress;
			var mySocket =  myserver.allSocketsMap[ip];
			mySocket.emit("focus", focusParam);
			var flag = 'success';
			cb(null, flag);
		},

		updateScreen_ICE : function updateScreen_ICE(req, cb, data){
			var updateData = req.payload.scrapeObject;
			var param = updateData.param;
			if(param == "updateScrapeData_ICE")
			{

				var appType = updateData.appType;
			    var scrapedJSON = updateData.getScrapeData;
			    var flag = "fail";
			    var userInfo =  updateData.userinfo;
			    var moduleID, screenID, modifiedBy;
			    moduleID = updateData.moduleId;
			    screenID = updateData.screenId;
			    screenName = updateData.screenName;
			    modifiedBy = userInfo.username;
			    scrapedJSON = scrapedJSON.replace(/'+/g,"''")
				var updateScreenData = "update icetestautomation.screens set screendata='"
			          + scrapedJSON + "', modifiedby ='" + modifiedBy + "', modifiedon = '" + new Date().getTime() 
			          + "' where screenid= "+screenID+" and moduleid ="+moduleID+" and screenname ='" + screenName +"'IF EXISTS; "
			    console.log(updateScreenData);
			    
			     dbConnICE.execute(updateScreenData, function(err, result){
			          if (err) {
			                 console.log("updateScreenData=============",err);
			                 	cb(null, flag);
			          }      
			          else{
			                 flag = "success";
			                 cb(null, flag);
			          }
			    });
			}
			else if(param == "deleteScrapeData_ICE"){
				
			    var flag = "fail";
			    var userInfo =  updateData.userinfo;
			    var moduleID, screenID, modifiedBy;
			    moduleID = updateData.moduleId;
			    screenID = updateData.screenId;
			    screenName = updateData.screenName;
			    modifiedBy = userInfo.username;
				var delObjects = updateData.deletedObjectsList;
				var delCust;
				var deletedRes = [];
				var deletedCustName = [];
				var deletedCustPath = [];
				var deletedJson = [];
				var scrapedJsonObject ={};
			
			for(var d=0;d<delObjects.length;d++)
			{
				delCust = delObjects[d].split("!");
				deletedRes.push(delCust);
			}
			 for(var k= 0;k<deletedRes.length;k++)
				{
				        deletedCustName.push(deletedRes[k][0]);
				        deletedCustPath.push(deletedRes[k][1]);
				}
			var allObjects = {};
			var allObjectsView;
			
			var screenQuery = "select screendata from icetestautomation.screens where screenid= " + screenID + ";";
			dbConnICE.execute(screenQuery, function(err, result){	
				
				 for (var i = 0; i < result.rows.length; i++) {
					 allObjects = result.rows[i].screendata;
					 console.log("Result", allObjects);
					 allObjects = JSON.parse(allObjects);
					  for(var j=0; j < allObjects.view.length; j++)
					   {
						  allObjectsView = allObjects.view[j];
						  
						   custname  = allObjectsView.custname;
						   xpath = allObjectsView.xpath;
						   if(in_array(custname, deletedCustName) &&  in_array(xpath, deletedCustPath))
						   {
							   //console.log("TRUE________________________________________________________");
							    	   deletedJson.push(allObjectsView);
							    	   delete allObjects.view[j];
						   }
				       }
				 }
				 allObjects.view =  allObjects.view.filter(function(n){ return n != null });
				 allObjects.scrapeType = updateData.view.scrapeTypeObj;
				 allObjects = JSON.stringify(allObjects);
				 allObjects = allObjects.replace(/'+/g,"''");
				 var updateScreenData = "update icetestautomation.screens set screendata='"
			          + allObjects + "', modifiedby ='" + modifiedBy + "', modifiedon = '" + new Date().getTime() 
			          + "' where screenid= "+screenID+" and moduleid ="+moduleID+" and screenname ='" + screenName +"'IF EXISTS;"
			      
			     dbConnICE.execute(updateScreenData, function(err, result){
			          if (err) {
			                 cb(null, flag);
			          }
			          else{
			                 flag = "success";
			                 cb(null, flag);
			          }
			    });
				
			});
		}
		},

		getScrapeDataScreenLevel_ICE : function getScrapeDataScreenLevel_ICE(req, cb, data) {
			var viewString = {};
			var getScrapeData = "select screendata from screens where screenid ="
				+ req.payload.screenId + " allow filtering  ";
			
			//console.log("GET", getScrapeData);
			
			dbConnICE.execute(getScrapeData, function(err, result){
				if (err) {
					console.log("getScrapeDataScreenLevel=============",err);
					cb(null, flag);
				}
				else{
					for (var i = 0; i < result.rows.length; i++) {
						viewString = result.rows[i].screendata;
					}
					if(viewString == null)
					{
						console.log("Data Null");
					}
					else{
						viewString = JSON.parse(viewString)
					}
					
					cb(null, viewString) 
				}
			});
		},

		/**
		 * @author vishvas.a
		 * @service readTestCase_ICE
		 * reading TestCase data from icetestautomation keyspace
		 */
		readTestCase_ICE: function readTestCase_ICE(req, cb, data){
			//base output elements
			var testcasesteps = "";
			var testcasename="";
			var template="";
			// base request elements
			var requestedscreenid=req.payload.screenid;
//			var requestedtestscasename=req.payload.testcasename;
			var requestedtestscaseid=req.payload.testcaseid;
			//complete response data
			var responsedata={
					template: "",
					testcase:"",
					testcasename:""
			};
			//Query 1 fetching the testcasesteps from the test cases based on requested screenid,testcasename,testcaseid
			var  getTestCases="select testcasesteps,testcasename from testcases where screenid= "+requestedscreenid+
//			" and testcasename='"+requestedtestscasename+"' " +
			" and testcaseid="+requestedtestscaseid;
			
			//var  getTestCases="select testcasesteps,testcasename from testCases where screenid= d61c95d4-c23b-4899-94a4-0b87c28c7a9c and testcasename='Dev_Testing1' and testcaseid= 634068fc-b459-4a7e-b4cb-2e25c0af2f2c";
			dbConnICE.execute(getTestCases, function (err, result) {
				if (err) {
					var flag = "Error in readTestCase_ICE : Fail";
					cb(null, flag);
				}else {
					for (var i = 0; i < result.rows.length; i++) {
						testcasesteps=result.rows[i].testcasesteps;
						testcasename=result.rows[i].testcasename;
					}
					if ((testcasesteps == "" || testcasesteps == null) && testcasename != ""){
						responsedata={ template : "", testcase:"[]", testcasename:testcasename}
						cb(null, responsedata);
					}else if ((testcasesteps == "" || testcasesteps == null) && testcasename == ""){
						responsedata={ template : "", testcase:"[]", testcasename:""}
						cb(null, responsedata);
					}else{
						//only web related logic is handledWeb Service related logic is pending
						responsedata.template=template;
						responsedata.testcase=testcasesteps;
						responsedata.testcasename=testcasename;
						cb(null, responsedata);
					}
				}
			})
		},

		/**
		 * @author vishvas.a
		 * @service updateTestCase_ICE
		 * update TestCase data from icetestautomation keyspace
		 */
		updateTestCase_ICE: function updateTestCase_ICE(req, cb, data){
			/*
			 *internal variables 
			 */
			var hasrow=false;
			/*
			 * base request elements
			 */
			var requestedscreenid=req.payload.screenid;
			var requestedtestcaseid=req.payload.testcaseid;
			var requestedtestcasename=req.payload.testcasename;
			var requestedtestcasesteps=req.payload.testcasesteps;
			console.log(requestedtestcasesteps);
			var userinfo=req.payload.userinfo;
			//these value has to be modified later
			var requestedskucodetestcase=req.payload.skucodetestcase;
			var requestedtags=req.payload.tags;
			var requestedversionnumber=req.payload.versionnumber;
			var requesthistorydetails="updated testcase action by "+userinfo.username+" having role:"+userinfo.role+""+
			" skucodetestcase='"+requestedskucodetestcase+"', tags="+requestedtags+","+
			" testcasesteps="+requestedtestcasesteps+" versionnumber="+requestedversionnumber;

			var requestedhistory={date:new Date().getTime(), historydetails:requesthistorydetails};
			/*
			 * Query 1 checking whether the testcaseid belongs to the same screen
			 * based on requested screenid,testcasename,testcaseid and testcasesteps
			 */
			var checktestcaseexist="select testcaseid from testCases where screenid="+requestedscreenid;

			dbConnICE.execute(checktestcaseexist, function (err, result) {
				if (err) {
					var flag = "Error in Query 1 testcaseexist: Fail";
					cb(null, flag);
				}else{
					for (var i = 0; i < result.rows.length; i++) {
						if(result.rows[i].testcaseid == requestedtestcaseid){
							hasrow=true;
							break;
						}
					}
					if(hasrow == true){
						/*
						 * Query 2 updating the testcasedata based on
						 * based on requested screenid,testcaseid and testcasesteps
						 */
						var updateTestCaseData="UPDATE testcases SET modifiedby='"+userinfo.username+
						"', modifiedbyrole='"+userinfo.role+"', modifiedon="+new Date().getTime()+
						", skucodetestcase='"+requestedskucodetestcase+
						"', testcasesteps='"+requestedtestcasesteps+"', versionnumber="+requestedversionnumber+
						" where screenid="+requestedscreenid+" and testcaseid="+requestedtestcaseid+" and testcasename='"+requestedtestcasename+"' IF EXISTS;"; 
						console.log(updateTestCaseData);
						dbConnICE.execute(updateTestCaseData, function (err, result) {
							if (err) {
								console.log(err)
								var flag = "Error in Query 1 updateTestCaseData: Fail";
								cb(null, flag);
							}else{
								var flag="Testcase updation : Success";
								cb("Testcase updation","Success");
							}
						});
					}
				}
			});
			/*
			 * Query 2 updating the testcasesteps
			 * based on requested screenid,testcasename,testcaseid and testcasesteps
			 */
		},
		
		/**
	     * debugTestCase_ICE for debuging of testcases
	     * @author vishvas.a
	     */
		debugTestCase_ICE: function debugTestCase_ICE(req,cb,data) {
			/*
			 * request variables
			 */
			var requestedbrowsertypes=req.payload.browsertypes;
			var requestedtestcaseids=req.payload.testcaseids;
			/**
			 * output data 
			 */
			var responsedata=[];
			var responseobject={
					template:"",
					testcasename:"",
					testcase:[]    
			};
			var browsertypeobject={browsertype:requestedbrowsertypes};
			var flag = "";
			for(var indexes=0;indexes<requestedtestcaseids.length;indexes++){
				var getProjectTestcasedata="select testcasename,testcasesteps from testcases where testcaseid="+requestedtestcaseids[indexes];
				dbConnICE.execute(getProjectTestcasedata, function (errgetTestcasedata, testcasedataresult) {
					if (errgetTestcasedata) {
						flag = "Error in getProjectTestcasedata : Fail";
						cb(null, flag);
					}else{
						for(var ids=0;ids<testcasedataresult.rows.length;ids++){
							responseobject.testcase=testcasedataresult.rows[ids].testcasesteps;
							responseobject.template="";
							responseobject.testcasename=testcasedataresult.rows[ids].testcasename;
							responsedata.push(responseobject);
						}
					}
				});
			}
			responsedata.push(browsertypeobject);
			var maxtimeout=requestedtestcaseids.length * 1000;
			setTimeout(cb,maxtimeout,flag,responsedata);
		}
};