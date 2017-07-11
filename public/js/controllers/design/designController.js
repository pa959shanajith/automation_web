var screenshotObj,scrapedGlobJson,enableScreenShotHighlight,mirrorObj, eaCheckbox, finalViewString, scrapedData, deleteFlag, globalSelectedBrowserType,selectedKeywordList,keywordListData,dependentTestCaseFlag = false;checkedTestcases = []; pasteSelecteStepNo = [];
var initScraping = {}; var mirrorObj = {}; var scrapeTypeObj = {}; var newScrapedList; var viewString = {}; var scrapeObject = {}; var screenViewObject = {}; var readTestCaseData; var getRowJsonCopy;
var selectRowStepNoFlag = false; //var deleteStep = false;
var dataFormat12;
var getAllAppendedObj; //Getting all appended scraped objects
var gsElement = []; window.localStorage['selectRowStepNo'] = '';
var getWSTemplateData = {} //Contains Webservice saved data
var appType;var projectId;var projectDetails;var screenName;var testCaseName;var subTaskType;var subTask; var draggedEle; var getDraggedEle; 
window.localStorage['disableEditing'] = "false";
mySPA.controller('designController', ['$scope', '$http', '$location', '$timeout', 'DesignServices','cfpLoadingBar','$window', function($scope,$http,$location,$timeout,DesignServices,cfpLoadingBar,$window) {
	$("body").css("background","#eee");
	$("#tableActionButtons, .designTableDnd").delay(500).animate({opacity:"1"}, 500)
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	}, 500)

	//Task Listing
	loadUserTasks()
	var taskAuth = false;
	if(window.localStorage['navigateScreen'] == "Scrape" && window.localStorage['navigateScrape'] == "true" && window.location.href.split("/")[3] == "design")
	{
		taskAuth = true;
		window.localStorage['navigateTestcase'] = false;
	}
	else if(window.localStorage['navigateScreen'] == "TestCase" && window.localStorage['navigateTestcase'] == "true" && window.location.href.split("/")[3] == "designTestCase"){
		taskAuth = true;
		window.localStorage['navigateScrape'] = false;
	}
	if(taskAuth == false){
		window.location.href = "/";		
	}
	//Default Function to reset all input, select
	$scope.resetTextFields = function(){
		$("input").val('');
		$("select").prop('selectedIndex', 0);
		$(".addObj-row").find("input").removeClass('inputErrorBorder')
		$(".addObj-row").find("select").removeClass('selectErrorBorder')
		$scope.errorMessage = "";
	}
	//Default Function to reset all input, select
	
	var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
	appType = JSON.parse(window.localStorage['_CT']).appType;
	screenName =  JSON.parse(window.localStorage['_CT']).screenName;
	testCaseName = JSON.parse(window.localStorage['_CT']).testCaseName;
	subTaskType = JSON.parse(window.localStorage['_CT']).subTaskType;
	subTask = JSON.parse(window.localStorage['_CT']).subtask;
	$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
	$(".projectInfoWrap").empty()
	//Loading Project Info
	
	//Getting Apptype or Screen Type
	if(appType != "Web" && window.location.href.split("/")[3] == "design"){
		$("#left-bottom-section").hide();
	}
	//console.log(appType);
	$scope.getScreenView = appType
	//Getting Apptype orScreen Type

	cfpLoadingBar.start()
	$timeout(function(){
		if(window.location.href.split("/")[3] == "designTestCase" || $scope.getScreenView == "Webservice" && window.location.href.split("/")[3] == "designTestCase"){
			angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
		}
		else if(window.location.href.split("/")[3] == "design" && $scope.getScreenView != "Webservice"){
			angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();			
		}
		if($scope.getScreenView == "Webservice" && window.location.href.split("/")[3] != "designTestCase"){
			angular.element(document.getElementById("left-nav-section")).scope().getWSData();
		}
		cfpLoadingBar.complete()
	}, 1500)


	$timeout(function(){
		projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
		appType = JSON.parse(window.localStorage['_CT']).appType;
		screenName =  JSON.parse(window.localStorage['_CT']).screenName;
		testCaseName = JSON.parse(window.localStorage['_CT']).testCaseName;
		subTaskType = JSON.parse(window.localStorage['_CT']).subTaskType;
		subTask = JSON.parse(window.localStorage['_CT']).subTask;
		if(subTaskType == "Scrape" || subTask == "Scrape")
		{
			$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.respnames[0]+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">'+screenName+'</span></p>')
		}
		else{
			$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project: </span><span class="content">'+projectDetails.respnames[0]+'</span></p><p class="proj-info-wrap"><span class="content-label">Screen: </span><span class="content">'+screenName+'</span></p><p class="proj-info-wrap"><span class="content-label">TestCase: </span><span class="content">'+testCaseName+'</span></p>')
		}

	}, 3000)
	

	var custnameArr = [];
	var keywordValArr = [];
	var proceed = false;
	
	//Submit Task Screen
	$scope.submitTasksScreen = function(){
		$("#submitTasksScreen").modal("show")
	} 
	//Submit Task Screen
	
	//Submit Tast Test Case
	$scope.submitTasksTestCase = function(){
		$("#submitTasksTestCase").modal("show")
	} 
	//Submit task Test Case

	$scope.readTestCase_ICE = function()	{	
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		appType = taskInfo.appType;
		enabledEdit = "false";
		blockUI("Loading...");
			// service call # 1 - getTestScriptData service call
			DesignServices.readTestCase_ICE(screenId, testCaseId, testCaseName)	
			.then(function(data) {
				if(data == "Invalid Session")
				{
					window.location.href = "/";
				}
				console.log(data);
				var appType = taskInfo.appType;
				$('#jqGrid').removeClass('visibility-hide').addClass('visibility-show');
				// removing the down arrow from grid header columns - disabling the grid menu pop-up
				$('.ui-grid-icon-angle-down').removeClass('ui-grid-icon-angle-down');
				$("#jqGrid").jqGrid('clearGridData');
				/*if(itemLabelName == "Runtime_Settings"){
				}else {
				}*/
				$('#jqGrid').show();
				// service call # 2 - objectType service call
				DesignServices.getScrapeDataScreenLevel_ICE(screenId)
				.then(function(data2)	{
						if(data2 == "Invalid Session")
						{
							window.location.href = "/";
						}
					if(appType == "Webservice") {
						if(data2 != "") dataFormat12 = data2.header[0].split("##").join("\n");
					}
					custnameArr.length = 0;
					// counter to append the items @ correct indexes of custnameArr
					var indexCounter = '';
					//window.localStorage['newTestScriptDataList'] = data2.view;
					$scope.newTestScriptDataLS = data2.view;
					$("#window-scrape-screenshotTs .popupContent").empty()
					$("#window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrapeTS"><img id="screenshotTS" src="data:image/PNG;base64,'+data2.mirror+'" /></div>')
					
					// service call # 3 -objectType service call
					DesignServices.getKeywordDetails_ICE(appType)
					.then(function(data3)	{
							if(data3 == "Invalid Session")
						{
							window.location.href = "/";
						}
						keywordValArr.length = 0;
						keywordListData = angular.toJson(data3);						
						var emptyStr = "{}";
						var len = data.testcase.length;
						if (data == "" || data == null || data == emptyStr || data == "[]" || data.testcase.toString() == "" || data.testcase == "[]"|| len == 1)	{
							var appTypeLocal1 = "Generic";
							var datalist = [{  
								"stepNo":"1",
								"custname":"",
								"objectName":"",
								"keywordVal":"",
								"inputVal":"",
								"outputVal":"",
								"url":"",
								"_id_":"",
								"appType":appTypeLocal1,
								"remarksStatus": "",
							    "remarks": ""
							}];
							readTestCaseData = JSON.stringify(datalist);
							$("#jqGrid").jqGrid('GridUnload');
							$("#jqGrid").trigger("reloadGrid");
							contentTable(data2.view);
							/*if(itemLabelName == "Runtime_Settings" || window.localStorage['RunFlag'] == "true" || usrRole.role == "Viewer"){
								$('.cbox').prop('disabled',true);
								$('.cbox').addClass('disabled');
								$('.cbox').closest('tr').addClass('state-disabled ui-jqgrid-disablePointerEvents');
								$('.cbox').parent().addClass('disable_a_href');
								if(usrRole.role == "Viewer"){
									$('#triggerDialog').prop('disabled',true);
								}else $('#triggerDialog').prop('disabled',false);
							}else{
								$('.cbox').prop('disabled',false);
								$('.cbox').parent().removeClass('disable_a_href');			
							}*/
							$('.cbox').prop('disabled',false);
							$('.cbox').parent().removeClass('disable_a_href');
							return;
						}
						else{
							var testcase = JSON.parse(data.testcase);
							var testcaseArray = [];
							for(var i = 0; i < testcase.length; i++)	{
								if(appType == "Webservice"){
									if(testcase[i].keywordVal == "setHeader" || testcase[i].keywordVal == "setHeaderTemplate"){
										testcase[i].inputVal[0] = testcase[i].inputVal[0].split("##").join("\n")
									}
								}
								testcase[i].stepNo = (i + 1).toString();
								testcaseArray.push(testcase[i]);						
							}
							console.log("readTestCase:::", testcaseArray)
											
							readTestCaseData = JSON.stringify(testcaseArray)
							$("#jqGrid_addNewTestScript").jqGrid('clearGridData');
							$("#jqGrid").jqGrid('GridUnload');
							$("#jqGrid").trigger("reloadGrid");
							contentTable(data2.view);
							/*if(itemLabelName == "Runtime_Settings" || window.localStorage['RunFlag'] == "true" || usrRole.role == "Viewer"){
								$('.cbox').prop('disabled',true);
								$('.cbox').addClass('disabled');
								$('.cbox').closest('tr').addClass('state-disabled ui-jqgrid-disablePointerEvents');
								$('.cbox').parent().addClass('disable_a_href');
								if(usrRole.role == "Viewer"){
									$('#triggerDialog').prop('disabled',true);
								}else $('#triggerDialog').prop('disabled',false);
							}else{
								$('.cbox').prop('disabled',false);
								$('.cbox').addClass('disabled');
								$('.cbox').parent().removeClass('disable_a_href');
							}*/
							$('.cbox').prop('disabled',false);
							//$('.cbox').addClass('disabled');
							$('.cbox').parent().removeClass('disable_a_href');
							/*if(selectRowStepNoFlag == true){
								if($("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev('tr[class="ui-widget-content"]').length > 0){
									$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").trigger('click');
									$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").prev().focus();
								}else{
									$("#jqGrid").find("tr[id='"+window.localStorage['selectRowStepNo']+"']").focus().trigger('click');
								}					
								selectRowStepNoFlag = false;
							}*/
							return;
						}
					},
					function(error) {	console.log("Error in designController.js file getObjectType method! \r\n "+(error.data));
					}); //	getObjectType end
					unblockUI();
				},
				function(error) {	console.log("Error in designController.js file getObjectType method! \r\n "+(error.data));
				}); //	getScrapeData end
			},
			function(error) {	console.log("Error in designController.js file getTestScriptData method! \r\n "+(error.data));	
			});
	
	};//	getTestScriptData end

	// browser icon clicked
	$scope.debugTestCase_ICE = function (selectedBrowserType) {
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var testcaseID = [];
		testcaseID.push(taskInfo.testCaseId);
		var browserType = [];
		browserType.push(selectedBrowserType)
		if(appType == "MobileWeb") browserType = [];
		globalSelectedBrowserType = selectedBrowserType;
		//if(jQuery("#addDependent").is(":checked"))	triggerPopUp();
		var blockMsg = 'Debug in Progress. Please Wait...';		
		if(dependentTestCaseFlag == true)
		{
			blockUI(blockMsg); 
			DesignServices.debugTestCase_ICE(browserType,checkedTestcases)
			.then(function(data)	{
				if(data == "Invalid Session")
				{
					window.location.href = "/";
				}
				console.log("debug-----",data);
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("Debug Testcase", "ICE Engine is not available. Please run the batch file and connect to the Server.")
				}
				else if(data == "success"){
					unblockUI();
					openDialog("Debug Testcase", "Debug completed successfully.")
				}
				else if(data == "fail"){
					unblockUI();
					openDialog("Debug Testcase", "Failed to debug.")
				}
				else if(data == "Terminate"){
					unblockUI();
					openDialog("Debug Testcase", "Debug Terminated")
				}
				else if(data == "browserUnavailable"){
					unblockUI();
					openDialog("Debug Testcase", "Browser is not available")
				}
			},
			function(error) {console.log("Error while traversing while executing debugTestcase method!! \r\n "+(error.data));});		
		}
		else {
			blockUI(blockMsg);    
			DesignServices.debugTestCase_ICE(browserType,testcaseID)
			.then(function(data)	{
					if(data == "Invalid Session")
				{
					window.location.href = "/";
				}
				console.log("debug-----",data);
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("Debug Testcase", "ICE Engine is not available. Please run the batch file and connect to the Server.")
				}
				else if(data == "success"){
					unblockUI();
					openDialog("Debug Testcase", "Debug completed successfully.")
				}
				else if(data == "fail"){
					unblockUI();
					openDialog("Debug Testcase", "Failed to debug.")
				}
				else if(data == "Terminate"){
					unblockUI();
					openDialog("Debug Testcase", "Debug Terminated")
				}
				else if(data == "browserUnavailable"){
					unblockUI();
					openDialog("Debug Testcase", "Browser is not available")
				}
			},
			function(error) {console.log("Error while traversing while executing debugTestcase method!! \r\n "+(error.data));});			
		}
	};	// browser invocation ends
	
	//Add Dependence
	/*$scope.multipleDebugOnBrowser1 = function (selectedBrowserType) {
		selectedBrowserType = window.localStorage['selectedBrowserType'];
		tsNewId.push(window.localStorage['testScriptIdVal']);
		window.localStorage['tsNewId'] = '{"'+tsNewId+'"}';
		if(jQuery("#triggerDialog").is(":checked")){
			triggerPopUp();
			window.localStorage['selectedBrowserType'] = selectedBrowserType;
		}
		$.blockUI({ message: '<h1><img src="imgs/busy.gif" />Debug in Progress<a id="btnTerminate">Terminate?<img src="imgs/terminate.png"/></a></h1>' }); 
		DesignServices.multiDebugOnBrowser(selectedBrowserType)
		.then(function(data) 	{
			if (data == "unavailableLocalServer"){
				showDialogMesgs("Server not found", "Local Server is not available. Please run the batch file from the Bundle.");
				$.unblockUI();
			} 
			else if(data.indexOf("<!") == 0  ){
				location.href = 'login_post.html';
			}
			else{
				$('#divTestScript').dialog("close");
				var executionId =  data;
				(function poll() {
					setTimeout(function(){
						DesignServices.pollExecutionStatus(executionId)
						.then(function(data) 	{
							$("#debugSuccessDialog").hide();
							$("#executionFailDialog").hide();
							$("#terminateDialog").hide();
							$("#browserUnavailableDialog").hide();
							$("#serverNotFoundDialog").hide();
							console.log("data is here:::"+data);			       			
							if (data == "complete"){
								$.unblockUI();
								showDialogMesgsBtn("Success", "Debug completed.", "btnDebugOk");
							}
							else  if (data == "fail"){
								$.unblockUI();
								showDialogMesgs("Fail", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Something has gone wrong. Please contact the support team!");
							}
							else if (data == "terminate"){
								$.unblockUI();
								showDialogMesgsBtn("Debug Terminated", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Debug terminated successfully.", "btnTerminateOk");
							}
							else if (data == "browserUnavailable"){
								$.unblockUI();
								showDialogMesgs("Error", "<img src='imgs/Warning.png' style='width: 24px; height: 24px;'>Browser is not available");
							}
							else if (data == "unavailableLocalServer"){
								$.unblockUI();
								showDialogMesgs("Server not found", "Local Server is not available. Please run the batch file from the Bundle.");
							}
							else if (data == "progress"){
								{
									poll();
								}
							}
						})
					}, 5000);})();
			}
			tsNewId = [];
			window.localStorage['tsNewId'].clear();
		},
		function(error){
		});
	};*/
	
	//Import Test case
	$scope.importTestCase=function(){
		var counter1 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		var defaultTestScript='[{"stepNo":"1","custname":"","objectName":"","keywordVal":"","inputVal":"","outputVal":"","url":"","_id_":"","appType":"Generic"}]';
		if(readTestCaseData == defaultTestScript){
			$("#importTestCaseFile").attr("type","file");
			$("#importTestCaseFile").trigger("click");
			importTestCaseFile.addEventListener('change', function(e) {
				if(counter1 == 0){
					// Put the rest of the demo code here.
					var file = importTestCaseFile.files[0];
					var textType = /json.*/;
					var reader = new FileReader();
					reader.onload = function(e) {
						if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
							var resultString = JSON.parse(reader.result);
							//var resultString = reader.result;
							for(i = 0; i < resultString.length; i++){
								if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
									flag = true;
									break;
								}else{
									flag = false;
									break;
								}
							}
							if (flag == false){
								openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
							}
							else{
								DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
								.then(function(data) {
										if(data == "Invalid Session")
										{
											window.location.href = "/";
										}
									if (data == "success") {
										angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
										openDialog("Import Testcase", "TestCase Json imported successfully.");
									} else {
										openDialog("Import Testcase", "Please Check the file format you have uploaded!")
									}
								}, function(error) {
								});
							}
						}
						else{
							openDialog("Import Testcase", "Please Check the file format you have uploaded!")
						}
					}
					reader.readAsText(file);
					counter1 = 1;
					$("#importTestCaseFile").val('');
				}
			});
		} else{
			$("#fileInputJson").removeAttr("type","file");
			$("#fileInputJson").attr("type","text");			
			$("#globalModalYesNo").find('.modal-title').text("Table Consists of Data");
			$("#globalModalYesNo").find('.modal-body p').text("Import will erase your old data. Do you want to continue??").css('color','black');
			$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnImportEmptyErrorYes")
			$("#globalModalYesNo").modal("show");
		}
	}
	
	$(document).on('click', '#btnImportEmptyErrorYes', function(){
		$("#globalModalYesNo").modal("hide");
		var counter2 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		$("#overWriteJson").trigger("click");
		overWriteJson.addEventListener('change', function(e) {
			if(counter2 == 0){
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				reader.onload = function(e) {
					if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
						var resultString = JSON.parse(reader.result);
						for(i = 0; i < resultString.length; i++){
							if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
								flag = true;
								break;
							}else{
								flag = false;
								break;
							}
						}
						if(flag == false){
							openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
						}
						else{
							DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
							.then(function(data) {
											if(data == "Invalid Session")
										{
											window.location.href = "/";
										}
										if (data == "success") {
											angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
											openDialog("Import Testcase", "TestCase Json imported successfully.");
										} else {
											openDialog("Import Testcase", "Please Check the file format you have uploaded!")
										} /*else if (data == "appTypeError"){
											showDialogMesgsBtn("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!", "btnAppTypeErrorOk");
											$.unblockUI();
										}	*/											
									}, function(error) {
							});
						}
					}
					else{
						openDialog("Import Testcase", "Please Check the file format you have uploaded!")
					}					
				}
				reader.readAsText(file);
				counter2 = 1;
				$("#overWriteJson").val('');
			}
		});
	})
	
	$("#overWriteJson").on("click", function(){
		angular.element(document.getElementById("left-bottom-section")).scope().importTestCase1();
	})
	//Import Testcase1
	$scope.importTestCase1=function(){
		var counter = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var flag = false;
		overWriteJson.addEventListener('change', function(e) {
			if(counter == 0){
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
					reader.onload = function(e) {
						var resultString = JSON.parse(reader.result);
						for(i = 0; i < resultString.length; i++){
							if(resultString[i].appType == appType || resultString[i].appType.toLowerCase() == "generic"){
								flag = true;
								break;
							}else{
								flag = false;
								break;
							}
						}
						if(flag == false){
							openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
						}
						else{
							DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,resultString,userInfo)
							.then(function(data) {
								if(data == "Invalid Session")
										{
											window.location.href = "/";
										}
								if (data == "success") {
									angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
									openDialog("Import Testcase", "TestCase Json imported successfully.");
								} else {
									openDialog("Import Testcase", "Please Check the file format you have uploaded!")
								} /*else if (data == "appTypeError"){
									showDialogMesgsBtn("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!", "btnAppTypeErrorOk");
									$.unblockUI();
								}*/												
							}, function(error) {});
						}						
					}	
					reader.readAsText(file);
					$("#overWriteJson").val('');
				}
				else{
					openDialog("Import Testcase", "Please Check the file format you have uploaded!")
				}
				counter = 1;
			}				
		});
	}
	//Import Test case
	
	//Export Test case
	$scope.exportTestCase=function() {
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		DesignServices.readTestCase_ICE(screenId, testCaseId, testCaseName)
		.then(function(response) {	
			if(response == "Invalid Session")
				{
					window.location.href = "/";
				}
			var temp, responseData;
			if (typeof response === 'object') {
				temp=JSON.parse(response.testcase);
				responseData = JSON.stringify(temp, undefined, 2);
			}
			filename = testCaseName+".json";
			var objAgent = $window.navigator.userAgent;
			var objbrowserName = navigator.appName;
			var objfullVersion = ''+parseFloat(navigator.appVersion);
			var objBrMajorVersion = parseInt(navigator.appVersion,10);
			var objOffsetName,objOffsetVersion,ix;
			// In Chrome 
			if ((objOffsetVersion=objAgent.indexOf("Chrome"))!=-1) { 
				objbrowserName = "Chrome";
				objfullVersion = objAgent.substring(objOffsetVersion+7);
			}
			// In Microsoft internet explorer
			else if ((objOffsetVersion=objAgent.indexOf("MSIE"))!=-1) { 
				objbrowserName = "Microsoft Internet Explorer"; 
				objfullVersion = objAgent.substring(objOffsetVersion+5);
			}
			// In Firefox 
			else if ((objOffsetVersion=objAgent.indexOf("Firefox"))!=-1) { 
				objbrowserName = "Firefox";

			} 
			// In Safari 
			else if ((objOffsetVersion=objAgent.indexOf("Safari"))!=-1) { 
				objbrowserName = "Safari"; 
				objfullVersion = objAgent.substring(objOffsetVersion+7); 
				if ((objOffsetVersion=objAgent.indexOf("Version"))!=-1)
					objfullVersion = objAgent.substring(objOffsetVersion+8);
			}
			// For other browser "name/version" is at the end of userAgent 
			else if ( (objOffsetName=objAgent.lastIndexOf(' ')+1) < (objOffsetVersion=objAgent.lastIndexOf('/')) ) {
				objbrowserName = objAgent.substring(objOffsetName,objOffsetVersion); 
				objfullVersion = objAgent.substring(objOffsetVersion+1); 
				if (objbrowserName.toLowerCase()==objbrowserName.toUpperCase()) { 
					objbrowserName = navigator.appName; 
				} 
			} 
			// trimming the fullVersion string at semicolon/space if present 
			if ((ix=objfullVersion.indexOf(";"))!=-1) objfullVersion=objfullVersion.substring(0,ix);
			if ((ix=objfullVersion.indexOf(" "))!=-1) objfullVersion=objfullVersion.substring(0,ix); 
			objBrMajorVersion = parseInt(''+objfullVersion,10);
			if (isNaN(objBrMajorVersion)) { 
				objfullVersion = ''+parseFloat(navigator.appVersion); 
				objBrMajorVersion = parseInt(navigator.appVersion,10); 
			}	
			if(objBrMajorVersion== "9"){
				if(objbrowserName == "Microsoft Internet Explorer"){
					window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
				}
			}else{	
				var blob = new Blob([responseData], {type: 'text/json'}),
				e = document.createEvent('MouseEvents'),
				a = document.createElement('a');
				a.download = filename;
				if(objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape"){
					window.navigator.msSaveOrOpenBlob(new Blob([responseData], {type:"text/json;charset=utf-8"}), filename);
				}else{
					a.href = window.URL.createObjectURL(blob);
					a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
					e.initMouseEvent('click', true, true, window,
							0, 0, 0, 0, 0, false, false, false, false, 0, null);
					a.dispatchEvent(e);
				}
			}
		},
		function(error) {
		});
	}
	//Export Test Case
	
	//Enable Append Checkbox (if after checking the, browser doesn't enables)
	$(document).on("click", "#enableAppend", function(){
		if($(this).is(":checked") == true){
			$.each($(this).parents("ul").children("li"),function(){
				if($(this).find("a").hasClass("disableActions") == true){
					$(this).find("a").addClass("enableActions").removeClass("disableActions")
				}
			})
		}
	})
	//Enable Append Checkbox (if after checking the, browser doesn't enables)
	
	
	//Populating Saved Scrape Data
	$scope.getScrapeData = function(){
		blockUI("Loading...");
		$("#enableAppend").prop("checked", false)
		window.localStorage['checkEditWorking'] = "false";	
		if($("#finalScrap").find("#scrapTree").length == 0){
			$(".disableActions").addClass("enableActions").removeClass("disableActions");
			$("#enableAppend").prop("disabled", true).css('cursor','no-drop')
		}
		else{
			$(".enableActions").addClass("disableActions").removeClass("enableActions");
			$("#enableAppend").prop("disabled", false).css('cursor','pointer')
		}
		//enableScreenShotHighlight = true;
		DesignServices.getScrapeDataScreenLevel_ICE() 
		.then(function(data){
			if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
			gsElement = [];
			$(".popupWrap").animate({ opacity: 0, right: "70px" }, 100).css({'z-index':'0','pointer-events':'none'});
			$(".filterObjects").removeClass("popupContent-filter-active").addClass("popupContent-default");
			$(".thumb-ic").removeClass("thumb-ic-highlight");
			if(data != null && data != "getScrapeData Fail."){
				viewString = data;
				newScrapedList = viewString
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString.mirror+'" /></div>')
				$("#finalScrap").empty()
				if (jQuery.isEmptyObject(viewString)){	
					console.log("Data is Empty");
					$(".disableActions").addClass("enableActions").removeClass("disableActions");
					$("#enableAppend").prop("disabled", true).css('cursor','no-drop');
					$("#screenShotScrape").text("No Screenshot Available");
					unblockUI();
					return;
				}
				else{
					console.log("Data There");
					$(".enableActions").addClass("disableActions").removeClass("enableActions");
					$("#enableAppend").prop("disabled", false).css('cursor','pointer')
				}
				//console.log("response data: ", viewString);
				$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px' data-toggle='tooltip' title='Save Objects'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' data-toggle='tooltip' title='Delete Objects' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
				$("#saveObjects").attr('disabled', true);
				var custN;
				var imgTag;
				var scrapTree = $("#finalScrap").children('#scrapTree');
				var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
				
				for (var i = 0; i < viewString.view.length; i++) {        			
					var path = viewString.view[i].xpath;
					var ob = viewString.view[i];
					ob.tempId= i; 
					custN = ob.custname;
					var tag = ob.tag;
					if(tag == "dropdown"){imgTag = "select"}
					else if(tag == "textbox/textarea"){imgTag = "input"}
					else imgTag = tag;
					if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
						var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
					} 
					else {
						var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
					}
					angular.element(innerUL).append(li);
				}

				$(document).find('#scrapTree').scrapTree({
					multipleSelection : {
						//checkbox : checked,
						classes : [ '.item' ]
					},
					editable: true,
					radio: true
				});
				
				$(".checkStylebox, .checkall").prop("disabled", false)
				
				if(viewString.view.length == 0){
					$(".disableActions").addClass("enableActions").removeClass("disableActions");
					$("#enableAppend").prop("disabled", true).css('cursor','no-drop');
					$(document).find(".checkStylebox").prop("disabled", true);
				}
			}
			unblockUI();
		}, 
		function(error){console.log("error");})
	}
	//Populating Saved Scrape Data
	
	//Disabling Filter
	$("a[title='Filter']").mouseover(function(){
		if(viewString == ""){
			$(this).children("img").addClass("thumb-ic-disabled").removeClass("thumb-ic");
			$(this).parent().css("cursor", "no-drop");
		}
		else if(viewString.view.length == 0){
			$(this).children("img").addClass("thumb-ic-disabled").removeClass("thumb-ic");
			$(this).parent().css("cursor", "no-drop");
		}
		else{
			$(this).children("img").addClass("thumb-ic").removeClass("thumb-ic-disabled");
			$(this).parent().css("cursor", "pointer");
		}
	})
	
	//Initialization for apptype(Desktop, Mobility, OEBS) to redirect on initScraping function
	$scope.initScrape = function(e){
		if(e.currentTarget.className == "disableActions") return false
		else{
			$(document).find("#desktopPath").removeClass("inputErrorBorder")
			$(document).find("#OEBSPath").removeClass("inputErrorBorder")
			if($scope.getScreenView == "Desktop"){
				$("#launchDesktopApps").modal("show")
				$(document).find("#desktopPath").val('')
				$(document).find("#desktopPath").removeClass("inputErrorBorder");
			}
			else if($scope.getScreenView == "DesktopJava"){
				$("#launchOEBSApps").modal("show");
				$(document).find("#OEBSPath").val('');
				$(document).find("#OEBSPath").removeClass("inputErrorBorder");
			}
			else if($scope.getScreenView == "SAP"){
				$("#launchSAPApps").modal("show")
				$(document).find("#SAPPath").val('')
				$(document).find("#SAPPath").removeClass("inputErrorBorder");
			}
			else if($scope.getScreenView == "MobileApp"){
				$("#launchMobilityApps").modal("show")
				$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").val('')
				$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
				$(".androidIcon").removeClass("androidIconActive")
			}
			else if($scope.getScreenView == "MobileWeb"){
				$("#launchMobilityWeb").modal("show")
				$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").val('')
				$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
				$(".androidIcon").removeClass("androidIconActive")
			}
		}
	}
	//Initialization for apptype(Desktop, Mobility, OEBS) to redirect on initScraping function
	
	
	//Get Webservice Data
	$(".wsdlRqstWrap").show();
	$("#showWsdlRequest").addClass("wsButtonActive")
	
	$scope.showWsdlRequest = function(){
		$(".wsdlRqstWrap").show();
		$(".wsdlRspnsWrap").hide();
		$("#showWsdlRequest").addClass("wsButtonActive")
		$("#showWsdlResponse").removeClass("wsButtonActive")
	}

	$scope.showWsdlResponse = function(){
		$(".wsdlRspnsWrap").show();
		$(".wsdlRqstWrap").hide();
		$("#showWsdlResponse").addClass("wsButtonActive")
		$("#showWsdlRequest").removeClass("wsButtonActive")
	}

	$scope.getWSData = function(){
		/*if($("#wsdlRequestHeader, #wsdlRequestBody").val().length > 0){
			$(".saveWS").prop("disabled", true);
			$("#enbledWS").prop("disabled", false);
			$(".enableActionsWS").addClass("disableActionsWS").removeClass("enableActionsWS");
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", true)
		}
		else{
			$(".saveWS").prop("disabled", false);
			$("#enbledWS").prop("disabled", true)
			$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", false)
		}*/
		DesignServices.getScrapeDataScreenLevel_ICE() 
		.then(function(data){
				if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
			if(typeof data === "object"){
				//Printing the Save data in UI
				$("#endPointURL").val(data.endPointURL);
				$("#wsdlMethods option").each(function(){
					if($(this).val() == data.method){
						$(this).prop("selected", true)
					}
				})
				$("#wsdlOperation").val(data.operations)
				//Printing Request Data
				$("#wsdlRequestHeader").val(data.header[0].split("##").join("\n"));
				if(data.body[0].indexOf("{") == 0 || data.body[0].indexOf("[") == 0){
					var jsonStr = data.body;
					var jsonObj = JSON.parse(jsonStr);
					var jsonPretty = JSON.stringify(jsonObj, null, '\t');
					xml_neat2 = jsonPretty;
					$("#wsdlRequestBody").val(jsonPretty)
				}
				else{
					var getXML = formatXml(data.body[0].replace(/>\s+</g,'><'));
					$("#wsdlRequestBody").val(getXML)
				}

				//Printing Response Data
				$("#wsdlResponseHeader").val(data.responseHeader[0].split("##").join("\n"));
				if(data.responseBody[0].indexOf("{") == 0 || data.responseBody[0].indexOf("[") == 0){
					var jsonStr = data.responseBody;
					var jsonObj = JSON.parse(jsonStr);
					var jsonPretty = JSON.stringify(jsonObj, null, '\t');
					xml_neat2 = jsonPretty;
					$("#wsdlResponseBody").val(jsonPretty)
				}
				else{
					var getXML = formatXml(data.responseBody[0].replace(/>\s+</g,'><'));
					$("#wsdlResponseBody").val(getXML)
				}

				//Printing the Save data in UI
				if($("#wsdlRequestHeader, #wsdlRequestBody").val().length > 0){
					$(".saveWS").prop("disabled", true);
					$("#enbledWS").prop("disabled", false)
					$(".enableActionsWS").addClass("disableActionsWS").removeClass("enableActionsWS")
					$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody, #wsdlResponseHeader, #wsdlResponseBody").prop("disabled", true)
				}
				else{
					$(".saveWS").prop("disabled", false);
					$("#enbledWS").prop("disabled", true)
					$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
				}
			}
			else{
				$("#wsdlMethods").prop("selectedIndex", 0)
				$(".saveWS").prop("disabled", false);
				$("#enbledWS").prop("disabled", true)
				$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
			}
		}, 
		function(error){ 
			console.log(error) 
		})
		/*if($("#wsdlRequestHeader, #wsdlRequestBody").val().length > 0){
			$(".saveWS").prop("disabled", true);
			$("#enbledWS").prop("disabled", false)
			$(".enableActionsWS").addClass("disableActionsWS").removeClass("enableActionsWS")
		}
		else{
			$(".saveWS").prop("disabled", false);
			$("#enbledWS").prop("disabled", true)
			$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
		}*/
	}
	//Get Webservice Data
	
	
	//Save Webservice Data
	$scope.saveWS = function(){
		$("#endPointURL, #wsdlMethods, #wsdlRequestHeader").removeClass("inputErrorBorderFull").removeClass("selectErrorBorder")
		var tasks = JSON.parse(window.localStorage['_CT']);
		var endPointURL = $("#endPointURL").val();
		var wsdlMethods = $("#wsdlMethods option:selected").val();
		var wsdlOperation = $("#wsdlOperation").val();
		var wsdlRequestHeader = $("#wsdlRequestHeader").val().replace(/[\n\r]/g,'##').replace(/"/g, '\"');
		var wsdlRequestBody = $("#wsdlRequestBody").val().replace(/[\n\r]/g,'').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		var wsdlResponseHeader = $("#wsdlResponseHeader").val().replace(/[\n\r]/g,'##').replace(/"/g, '\"');
		var wsdlResponseBody = $("#wsdlResponseBody").val().replace(/[\n\r]/g,'').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if(!endPointURL) $("#endPointURL").addClass("inputErrorBorderFull")
		else if(!$scope.wsdlMethods && !wsdlMethods) $("#wsdlMethods").addClass("selectErrorBorder")
		//else if(!wsdlRequestHeader) $("#wsdlRequestHeader").addClass("inputErrorBorderFull")
		else{
			var getWSData = {
				"body": [wsdlRequestBody],
				"operations": [wsdlOperation],
				"responseHeader": [wsdlResponseHeader],
				"responseBody": [wsdlResponseBody],
				"method": [wsdlMethods],
				"endPointURL": [endPointURL],
				"header": [wsdlRequestHeader]
			};
			var appType = $scope.getScreenView;
			getWSTemplateData = JSON.stringify(getWSData)
			var projectId = tasks.projectId;
			var screenId = tasks.screenId;
			var screenName = tasks.screenName;
			var userinfo = JSON.parse(window.localStorage['_UI']);
			scrapeObject = {};
			scrapeObject.param = 'updateScrapeData_ICE';
			scrapeObject.getScrapeData = getWSTemplateData;
			scrapeObject.projectId = projectId;
			scrapeObject.appType = appType;
			scrapeObject.screenId = screenId;
			scrapeObject.screenName = screenName;
			scrapeObject.userinfo = userinfo;
			DesignServices.updateScreen_ICE(scrapeObject)
			.then(function(data){
					if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
				if(data == "success"){
					openDialog("Save WebService Template", "WebService Template saved successfully.");
					//$("#WSSaveSuccess").modal("show");
					$("#enbledWS").prop("checked", false)
					angular.element(document.getElementById("left-nav-section")).scope().getWSData();
				}
				else{
					openDialog("Save WebService Template", "Failed to save WebService Template.");
					//$("#WSSaveFail").modal("show")
				}
			}, function(error){ console.log("Error") })
		}
	}
	//Save Webservice Data
	
	
	//Enable Save WS Button
	$(document).on("click", "#enbledWS", function(){
		if($(this).is(":checked") == true){
			$(".saveWS").prop("disabled", false)
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", false)
			//Additional to enable the web service icon
			$.each($(this).parents("ul").children("li"),function(){
				if($(this).find("a").hasClass("disableActionsWS") == true){
					$(this).find("a").addClass("enableActionsWS").removeClass("disableActionsWS")
				}
			})
			//Additional to enable the web service icon
		}
		else {
			$(".saveWS").prop("disabled", true)
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", true)
		}
	})
	
	//Init Webservice
	$scope.initScrapeWS = function(e){
		$("#endPointURL, #wsdlMethods, #wsdlRequestHeader, #wsdlOperation, #wsdlRequestBody").removeClass("inputErrorBorderFull").removeClass("selectErrorBorder")
		var initWSJson = {}
		var testCaseWS = []
		var proceed = false;
		var appType = $scope.getScreenView;
		var wsdlInputs = []
		wsdlInputs.push($("#endPointURL").val());
		wsdlInputs.push($("#wsdlMethods").val());
		wsdlInputs.push($("#wsdlOperation").val());
		wsdlInputs.push($("#wsdlRequestHeader").val().replace(/[\n\r]/g,'##').replace(/"/g, '\"'));
		wsdlInputs.push($("#wsdlRequestBody").val().replace(/[\n\r]/g,'').replace(/\s\s+/g, ' ').replace(/"/g, '\"'));
		//var endPointURL = $("#endPointURL").val();
		//var wsdlMethods = $("#wsdlMethods").val();
		//var wsdlOperation = $("#wsdlOperation").val();
		var param = 'debugTestCaseWS_ICE';
		//var wsdlRequestHeader = $("#wsdlRequestHeader").val().replace(/[\n\r]/g,'##').replace(/"/g, '\"');
		//var wsdlRequestBody = $("#wsdlRequestBody").val().replace(/[\n\r]/g,'').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if(e.currentTarget.className == "disableActionsWS") return false
		else if(!wsdlInputs[0]) $("#endPointURL").addClass("inputErrorBorderFull")
		else if(!$scope.wsdlMethods && !wsdlInputs[1]) $("#wsdlMethods").addClass("selectErrorBorder")
		else{
			if(wsdlInputs[1] == "GET" || wsdlInputs[1] == "HEAD" || wsdlInputs[1] == "PUT" || wsdlInputs[1] == "DELETE"){
				if(wsdlInputs[3]){
					if(!wsdlInputs[2]) $("#wsdlOperation").addClass("inputErrorBorderFull")
					else proceed = true;
				}
				else proceed = true;
			}
			else if(wsdlInputs[1] == "POST"){
				if(!wsdlInputs[3]) $("#wsdlRequestHeader").addClass("inputErrorBorderFull")
				else if(!wsdlInputs[4]) $("#wsdlRequestBody").addClass("inputErrorBorderFull")
				else proceed = true;
			}
		}
		if(proceed){
			var keywordVal = ["setEndPointURL","setMethods","setOperations","setHeader","setWholeBody"]
			var blockMsg = "Fetching Response Header & Body..."
			blockUI(blockMsg);
			for(i = 0; i < wsdlInputs.length; i++){
				if(wsdlInputs[i] != ""){
					testCaseWS.push({
						"stepNo": i+1,
						"appType": appType,
						"objectName": "",
						"inputVal": [wsdlInputs[i]],
						"keywordVal": keywordVal[i],
						"outputVal": "",
						"url": "",
						"custname": "",
						"remarks":[""]
					})
				}
			}
			testCaseWS.push({
				"stepNo": testCaseWS.length + 1,
				"appType": appType,
				"objectName": "",
				"inputVal": [""],
				"keywordVal": "executeRequest",
				"outputVal": "",
				"url": "",
				"custname": "",
				"remarks":[""]
			})
			initWSJson.testcasename = "",
			initWSJson.testcase = testCaseWS
			DesignServices.initScrapeWS_ICE(initWSJson)
			.then(function (data) {
					if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("Web Service Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
					return false
				}
				unblockUI();
				if(typeof data == "object"){
					openDialog("Data Retrieve", "Web Service response received successfully");
					//$("#webserviceDeubgSuccess").modal("show")
					$("#wsdlResponseHeader").val(data.responseHeader[0].split("##").join("\n"));
					if(data.responseBody[0].indexOf("{") == 0 || data.responseBody[0].indexOf("[") == 0){
						var jsonStr = data.responseBody;
						var jsonObj = JSON.parse(jsonStr);
						var jsonPretty = JSON.stringify(jsonObj, null, '\t');
						xml_neat2 = jsonPretty;
						$("#wsdlResponseBody").val(jsonPretty.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<'))
					}
					else{
						var getXML = formatXml(data.responseBody[0].replace(/>\s+</g,'><'));
						$("#wsdlResponseBody").val(getXML.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<'))
					}
				}
				else{
					openDialog("Debug Web Service", "Debug Terminated.");
					//$("#webserviceDeubgFail").modal("show")
				}
			}, function (error) { 
				console.log("Error") 
			});
		}
	};
	//Init Webservice
	
	//Launch WSDL Functionality
	$scope.launchWSDLGo = function(){
		var blockMsg = 'Please Wait...';
		$("#wsldInput").removeClass("inputErrorBorderFull")
		var wsdlUrl = $("#wsldInput").val();
		if(!wsdlUrl) openDialog("Launch WSDL", "Invalid WSDL url.");//$("#wsldInput").addClass("inputErrorBorderFull")
		else if(wsdlUrl.toLowerCase().indexOf(".svc?wsdl") === -1 && wsdlUrl.toLowerCase().indexOf(".asmx?wsdl") === -1)	openDialog("Launch WSDL", "Invalid WSDL url.");//$("#wsldInput").addClass("inputErrorBorderFull")
		else {
			blockUI(blockMsg);
			DesignServices.launchWSDLGo(wsdlUrl)
			.then(function(data) {
					if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
				if (data == "fail")	{
					unblockUI();
					openDialog("WSDL-Scrape Screen", "Invalid WSDL url.");
					return false
				}
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("WSDL-Scrape Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
					return false
				}
				console.log(data)
				$("#wsldSelect").empty().append('<option value selected disabled>Select Operation</option>')
				for(i=0; i<data.listofoperations.length; i++){
					$("#wsldSelect").append('<option value="'+data.listofoperations[i]+'">'+data.listofoperations[i]+'</option>')
				}
				unblockUI()
			}, 
			function (error) { 
				console.log("Error") 
			});
		}
	}
	//Launch WSDL Functionality
	
	//WSDL Add Functionality
	$scope.wsdlAdd = function(){
		$("#endPointURL, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody, #wsdlResponseHeader, #wsdlResponseBody").val("");
		$("#wsdlMethods").prop('selectedIndex', 0);
		$("#wsldInput").removeClass("inputErrorBorderFull");
		$("#wsldSelect").removeClass("selectErrorBorder");
		var wsdlUrl = $("#wsldInput").val();
		var wsdlSelectedMethod = $("#wsldSelect option:selected").val();
		if(!wsdlUrl) $("#wsldInput").addClass("inputErrorBorderFull");
		else if(!wsdlSelectedMethod) $("#wsldSelect").addClass("selectErrorBorder");
		else{
			DesignServices.wsdlAdd(wsdlUrl, wsdlSelectedMethod)
			.then(function(data) {
					if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("WSDL Add-Scrape Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
					return false
				}
				if(typeof data === "object"){
					//Printing the Save data in UI
					$("#endPointURL").val(data.endPointURL);
					$("#wsdlMethods option").each(function(){
						if($(this).val() == data.method){
							$(this).prop("selected", true)
						}
					})
					$("#wsdlOperation").val(data.operations)
					//Printing Request Data
					$("#wsdlRequestHeader").val(data.header[0].split("##").join("\n"));
					if(data.body[0].indexOf("{") == 0 || data.body[0].indexOf("[") == 0){
						var jsonStr = data.body;
						var jsonObj = JSON.parse(jsonStr);
						var jsonPretty = JSON.stringify(jsonObj, null, '\t');
						xml_neat2 = jsonPretty;
						$("#wsdlRequestBody").val(jsonPretty)
					}
					else{
						var getXML = formatXml(data.body[0].replace(/>\s+</g,'><'));
						$("#wsdlRequestBody").val(getXML)
					}
					$(".saveWS").prop("disabled", false)
				}
			}, 
			function (error) { 
				console.log("Error") 
			});
		}
	}
	//WSDL Add Functionality
	
	
	//Mobile Serial Number Keyup Function
	$("#mobilityAPKPath").on("keyup", function(){
		if($(this).val().toLowerCase().indexOf(".apk") >= 0){
			$("#mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").hide();
			$("#mobilitySerialPath").show();
			$(".rightAlign").prop("style","top: 20px;");
			$("#launchMobilityApps").find(".androidIcon").prop("style","background: url('../imgs/ic-andrd-active.png') left top no-repeat !important;");			
		}
		else if($(this).val().toLowerCase().indexOf(".ipa") >= 0 || $(this).val().toLowerCase().indexOf(".app") >= 0){
			if($(this).val().toLowerCase().indexOf(".app") >= 0){
				$("#mobilitySerialPath, #mobilityUDID").hide();
				$("#mobilityDeviceName, #mobilityiOSVersion").show();
				$(".rightAlign").prop("style","top: 20px;");
			}
			else if($(this).val().toLowerCase().indexOf(".ipa") >= 0){
				$("#mobilitySerialPath").hide();
				$("#mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").show();
				$(".rightAlign").prop("style","top: -10px;");
			}
			$("#launchMobilityApps").find(".androidIcon").prop("style","background: url('../imgs/ic-ios-active.png') left top no-repeat !important;");			
		}
		else
			$("#launchMobilityApps").find(".androidIcon").prop("style","background: ''");
	})
	//Mobile Serial Number Keyup Function
	
 	
	//Initiating Scraping
	$scope.initScraping = function(e, browserType){
		if(e.currentTarget.className == "disableActions") return false
		else{
			eaCheckbox = $("#enableAppend").is(":checked")
			//enableScreenShotHighlight = false;
			screenViewObject = {}
			var blockMsg = 'Scrapping in progress. Please Wait...';
			$(document).find("#desktopPath").removeClass("inputErrorBorder");
			$(document).find("#OEBSPath").removeClass("inputErrorBorder");
			$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
			$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion").removeClass("inputErrorBorder");
			//For Desktop
			if($scope.getScreenView == "Desktop"){
				if($(document).find("#desktopPath").val() == "") {
					$(document).find("#desktopPath").addClass("inputErrorBorder")
					return false
				}
				else{
					$(document).find("#desktopPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
					screenViewObject.applicationPath = $(document).find("#desktopPath").val();
					$("#launchDesktopApps").modal("hide");
					blockUI(blockMsg);
				}
			}
			//For Desktop
			//For SAP
			else if($scope.getScreenView == "SAP"){
				if($(document).find("#SAPPath").val() == "") {
					$(document).find("#SAPPath").addClass("inputErrorBorder")
					return false
				}
				else{
					$(document).find("#SAPPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
					screenViewObject.applicationPath = $(document).find("#SAPPath").val();
					$("#launchSAPApps").modal("hide");
					blockUI(blockMsg);
				}
			}
			
			//For Mobility
			else if($scope.getScreenView == "MobileApp"){
				if(!$("#mobilityAPKPath").val()){
					$(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
					return false
				}
				else if($("#mobilityAPKPath").val().toLowerCase().indexOf(".apk") >= 0){
					if($(document).find("#mobilityAPKPath").val() == ""){
						$(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
						return false
					}
					else if($(document).find("#mobilitySerialPath").val() == ""){
						$(document).find("#mobilitySerialPath").addClass("inputErrorBorder")
						return false
					}
					else{
						$(document).find("#mobilityAPKPath, #mobilitySerialPath").removeClass("inputErrorBorder")
						screenViewObject.appType = $scope.getScreenView,
						screenViewObject.apkPath = $(document).find("#mobilityAPKPath").val();
						screenViewObject.mobileSerial = $(document).find("#mobilitySerialPath").val();
						$("#launchMobilityApps").modal("hide");
						blockUI(blockMsg);
					}					
				}
				else if($("#mobilityAPKPath").val().toLowerCase().indexOf(".ipa") >= 0 || $("#mobilityAPKPath").val().toLowerCase().indexOf(".app") >= 0){
					if($(document).find("#mobilityAPKPath").val() == ""){
						$(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
						return false
					}
					else if($(document).find("#mobilityDeviceName").val() == ""){
						$(document).find("#mobilityDeviceName").addClass("inputErrorBorder")
						return false
					}
					else if($(document).find("#mobilityiOSVersion").val() == ""){
						$(document).find("#mobilityiOSVersion").addClass("inputErrorBorder")
						return false
					}
					else if($(document).find("#mobilityUDID").val() == "" && $("#mobilityAPKPath").val().toLowerCase().indexOf(".ipa") >= 0){
						$(document).find("#mobilityUDID").addClass("inputErrorBorder")
						return false
					}
					else{
						$(document).find("#mobilityAPKPath,#mobilityDeviceName,#mobilityiOSVersion,#mobilityUDID").removeClass("inputErrorBorder")
						screenViewObject.appType = $scope.getScreenView,
						screenViewObject.apkPath = $(document).find("#mobilityAPKPath").val();
						screenViewObject.mobileDeviceName = $(document).find("#mobilityDeviceName").val();
						screenViewObject.mobileIosVersion = $(document).find("#mobilityiOSVersion").val();
						screenViewObject.mobileUDID = $(document).find("#mobilityUDID").val();
						$("#launchMobilityApps").modal("hide");
						blockUI(blockMsg);
					}					
				}
			}
			//For Mobility
			
			//For Mobility Web
			else if($scope.getScreenView == "MobileWeb"){
				if($(document).find("#mobilityWebSerialNo").val() == ""){
					$(document).find("#mobilityWebSerialNo").addClass("inputErrorBorder")
					return false
				}
				else if($(document).find("#mobilityAndroidVersion").val() == ""){
					$(document).find("#mobilityAndroidVersion").addClass("inputErrorBorder")
					return false
				}
				else{
					$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
					screenViewObject.mobileSerial = $(document).find("#mobilityWebSerialNo").val();
					screenViewObject.androidVersion = $(document).find("#mobilityAndroidVersion").val();
					$("#launchMobilityWeb").modal("hide");
					blockUI(blockMsg);
				}
			}
			//For Mobility Web
			
			//For OEBS
			else if($scope.getScreenView == "DesktopJava"){
				if($(document).find("#OEBSPath").val() == "") {
					$(document).find("#OEBSPath").addClass("inputErrorBorder")
					return false
				}
				else{
					$(document).find("#OEBSPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
					screenViewObject.applicationPath = $(document).find("#OEBSPath").val();
					$("#launchOEBSApps").modal("hide");
					blockUI(blockMsg);
				}
			}
			//For OEBS
			
			//For Web
			else{
				screenViewObject.browserType = browserType
				blockUI(blockMsg);
			}
			//For Web
			DesignServices.initScraping_ICE(screenViewObject)
			.then(function (data) {
					if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
				window.localStorage['disableEditing'] = "true";
				unblockUI();
				if(data == "Response Body exceeds max. Limit.")
				{
					unblockUI();
					openDialog("Scrape Screen", "Scraped data exceeds max. Limit.");
					return false
				}
				if (data == "unavailableLocalServer")	{
					unblockUI();
					openDialog("Scrape Screen", "ICE Engine is not available. Please run the batch file and connect to the Server.");
					return false
				}
				if(data == "fail"){
					openDialog("Scrape", "Failed to scrape.")
					//$("#scrapeFailModal").modal("show");
					return false
				}
				if(data == "wrongWindowName"){
					openDialog("Scrape", "Wrong window name.")
				} 
				if(data.view.length > 0)
				{
					$("#finalScrap").show();
				}
				viewString = data;
				//var data = JSON.stringify(data);
				//var scrapeJson = JSON.parse(data);
				//screenshotObj = scrapeJson;
				//initScraping = scrapeJson[0];
				//mirrorObj = scrapeJson[1];
				//scrapeTypeObj = scrapeJson[2];
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
				$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,'+viewString.mirror+'" /></div>')
				$("#finalScrap").empty()
				$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox' disabled /><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
				var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');

				console.log("data", viewString);
				//If enable append is active
				if(eaCheckbox){
					//Getting the Existing Scrape Data					
					for (var i = 0; i < newScrapedList.view.length; i++) {
						var path = newScrapedList.view[i].xpath;
						var ob = newScrapedList.view[i];
						ob.tempId= i; 
						custN = ob.custname;
						var tag = ob.tag;
						if(tag == "dropdown"){imgTag = "select"}
						else if(tag == "textbox/textarea"){imgTag = "input"}
						else imgTag = tag;
						if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
							var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						} 
						else {
							var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						}
						angular.element(innerUL).append(li)
					}
					//Getting the Existing Scrape Data

					generateScrape()

					//Getting appended scraped object irrespective to the dynamic value
					function generateScrape(){ 
						var tempId = newScrapedList.view.length - 1;
						for (var i = 0; i < viewString.view.length; i++) { 
							tempId++
							var path = viewString.view[i].xpath;
							var ob = viewString.view[i];

							var custN = ob.custname.replace(/[<>]/g, '').trim();
							var tag = ob.tag;
							if(tag == "dropdown"){imgTag = "select"}
							else if(tag == "textbox/textarea"){imgTag = "input"}
							else imgTag = tag;
							var tag1 = tag.replace(/ /g, "_");
							var tag2;

							if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
								var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							} 
							else {
								var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
							}
							angular.element(innerUL).append(li)
							newScrapedList.view.push(viewString.view[i]);
						}
						newScrapedList.mirror = viewString.mirror;
						newScrapedList.scrapetype = viewString.scrapetype;
					}
					//Getting appended scraped object irrespective to the dynamic value
				}
				//If enable append is active

				//If enable append is inactive
				else{
					//Before Saving the Scrape JSON to the Database
					for (var i = 0; i < viewString.view.length; i++) {
						
						var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
						var path = viewString.view[i].xpath;
						var ob = viewString.view[i];
						ob.tempId= i;
						var custN = ob.custname.replace(/[<>]/g, '').trim();
						var tag = ob.tag;
						if(tag == "dropdown"){imgTag = "select"}
						else if(tag == "textbox/textarea"){imgTag = "input"}
						else imgTag = tag;
						var tag1 = tag.replace(/ /g, "_");
						var tag2;
						if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
							var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						} 
						else {
							var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
						}
						angular.element(innerUL).append(li);
					}

					//Before Saving the Scrape JSON to the Database
				}
				//If enable append is inactive
				//Build Scrape Tree using dmtree.scrapper.js file
				$(document).find('#scrapTree').scrapTree({
					multipleSelection : {
						//checkbox : checked,
						classes : [ '.item' ]
					},
					editable: true,
					radio: true
				});   
				
				//Build Scrape Tree using dmtree.scrapper.js file
				if(viewString.view.length > 0) $("#saveObjects").removeClass('hide');
				else $("#saveObjects").addClass('hide');
			}, function (error) { console.log("Fail to Load design_ICE") });
		}
	}

//To delete Scrape Objects 
	$scope.del_Objects = function() 
	{
		$("#deleteObjectsModal").modal("hide")
		var userinfo = JSON.parse(window.localStorage['_UI']);
		//var tasks = JSON.parse(window.localStorage['_TJ']);
		var tasks = JSON.parse(window.localStorage['_CT']);
		var delList = {};
		var deletedCustNames = [];
		var deletedCustPath = [];

		var checkCondLen = $("#scraplist li").children('a').find('input[type=checkbox].checkall:checked').length;
		if(checkCondLen > 0)
		{		
			$('input[type=checkbox].checkall:checked').each(function() {
				var id = $(this).parent().attr('id').split("_");
				id = id[1];
				deletedCustNames.push(viewString.view[id].custname);
				deletedCustPath.push(viewString.view[id].xpath);
				// console.log(viewString.view[id])
			});	
			delList.deletedCustName = deletedCustNames;
			delList.deletedXpath = deletedCustPath;
			//console.log(deletedCustNames);
		}
		//console.log("Delete", viewString);
	    var screenId = tasks.screenId;
	    var screenName = tasks.screenName;
		var projectId = tasks.projectId;
		scrapeObject = {};
		scrapeObject.param = 'deleteScrapeData_ICE';
		scrapeObject.getScrapeData = viewString;
	    scrapeObject.projectId = projectId;
	    scrapeObject.screenId = screenId;
	    scrapeObject.screenName = screenName;
		scrapeObject.deletedList = delList;
		scrapeObject.userinfo = userinfo;
		DesignServices.updateScreen_ICE(scrapeObject)
		.then(function(data) {
				if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
			if(data == "success")
			{
				openDialog("Delete Scrape Objects", "Scraped Objects deleted successfully.")
                deleteFlag = true;
				$(".checkStylebox").prop("checked", false);
                angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();	
			}
			else{
				openDialog("Delete Scrape Objects", "Scraped Objects fail to delete.")
                deleteFlag = false;
			}
			//Service to be integrated as it has dependency of ($scope.newTestScriptDataLS)
		}, function(error) {

		});
	}
	//Highlight Element on browser
	$scope.highlightScrapElement = function(xpath,url) {
		var appType = $scope.getScreenView;
		//if(enableScreenShotHighlight == true){
			console.log("Init ScreenShot Highlight")
			var data = {
				args : [$("#scrapTree").find(".focus-highlight").parents("a")[0]],
				rlbk : false,
				rslt :	{
					obj : $("#scrapTree").find(".focus-highlight").closest("li")
				}
			}
			console.log(data)
			var rect, type, ref, name, id, value, label, visible, l10n, source;
			rect = {
					x : data.rslt.obj.data("left"),
					y : data.rslt.obj.data("top"),
					w : data.rslt.obj.data("width"),
					h : data.rslt.obj.data("height")
			}

			type = data.rslt.obj.data("tag");
			ref = data.rslt.obj.data("reference");
			name = data.rslt.obj.find(".ellipsis").text();
			id = data.rslt.obj.attr("val");
			value = data.rslt.obj.attr("val");
			label = data.rslt.obj.find(".ellipsis").text();
			visible = data.rslt.obj.data('hiddentag');
			l10n = {
					matches: 0
			};

			source = "";
			if (rect === undefined) return;
			var translationFound = false;
			if (l10n) {
				translationFound = (l10n.matches != 0);
			}

			if (typeof rect.x != 'undefined') {
				$(".hightlight").remove();
				var d = $("<div></div>", {
					"class": "hightlight"
				});
				var getTopValue;

				var screen_width = document.getElementById('screenshot').height;
				var real_width = document.getElementById('screenshot').naturalHeight;
				scale_highlight = 1 / (real_width / screen_width);
				d.appendTo("#screenShotScrape");
				d.css('border', "1px solid red");
				if(appType == "MobileApp"){
					if(navigator.appVersion.indexOf("Win")!=-1){
						d.css('left', (rect.x/3) + 'px');
						d.css('top', (rect.y/3) + 'px');
						d.css('height', (rect.h/3) + 'px');
						d.css('width', (rect.w/3) + 'px');						
					}
					else if(navigator.appVersion.indexOf("Mac")!=-1){
						d.css('left', rect.x + 'px');
						d.css('top', rect.y + 'px');
						d.css('height', rect.h + 'px');
						d.css('width', rect.w + 'px');						
					}
				}
				else if(appType == "MobileWeb"){
					d.css('left', (rect.x - 2) + 'px');
					d.css('top', (rect.y - 6)+ 'px');
					d.css('height', rect.h + 'px');
					d.css('width', rect.w + 'px');
				}
				else if(appType == "SAP"){
					d.css('left', (Math.round(rect.x) * scale_highlight) + 3 + 'px');
					d.css('top', (Math.round(rect.y) * scale_highlight) + 2 + 'px');
					d.css('height', Math.round(rect.h) * scale_highlight + 'px');
					d.css('width', Math.round(rect.w) * scale_highlight + 'px');
				}
				else{
					d.css('left', Math.round(rect.x)  * scale_highlight + 'px');
					d.css('top', Math.round(rect.y) * scale_highlight + 'px');
					d.css('height', Math.round(rect.h) * scale_highlight + 'px');
					d.css('width', Math.round(rect.w) * scale_highlight + 'px');
				}
				d.css('position', 'absolute');
				d.css('background-color', 'yellow');
				d.css('z-index', '3');
				d.css('opacity', '0.7');
				getTopValue = Math.round(rect.y) * scale_highlight + 'px'
				if(appType == "MobileApp" || appType == "MobileWeb")
					$(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(Math.round(rect.y) + 'px') },500);
				else 
					$(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(getTopValue) },500);
				//$('.scroll-wrapper > .scrollbar-screenshot').scrollTo(d.offset().top);
				var color;
				if (translationFound) {
					color = "blue";
				} else {
					color = "yellow";
				}
				d.css("background-color", color);
			} else {
				$(".hightlight").remove();
			}
		//}	
	//	else{
			DesignServices.highlightScrapElement_ICE(xpath,url, appType)
			.then(function(data) {
				if(data == "Invalid Session")
				{
					window.location.href = "/";
				}
				if(data == "fail"){
					openDialog("Fail", "Failed to highlight")
				}
				console.log("success!::::"+data);
			}, function(error) { });
	//	}    
	};
	//Highlight Element on browser
	
	
	//Add Object Functionality
	$scope.addObj = function(){
		$scope.errorMessage = "";
		$("#dialog-addObject").modal("show");
		$("#addObjContainer").empty()
		if($(".addObj-row").length > 1) $(".addObj-row").remove()
		$("#addObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a">Link</option><option value="input">Textbox/Textarea</option><option value="table">Table</option><option value="list">List</option><option value="select">Dropdown</option><option value="img">Image</option><option value="button">Button</option><option value="radiobutton">Radiobutton</option><option value="checkbox">Checkbox</option><option value="Element">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /></div>')
	};
	//Add Object Functionality
	
	
	//Delete Custom Object Row
	$(document).on("click", ".deleteAddObjRow", function(){
		$(this).parent(".addObj-row").remove();
	});
	
	//Add More Object Functionality
	$scope.addMoreObject = function(){
		$("#addObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a">Link</option><option value="input">Textbox/Textarea</option><option value="table">Table</option><option value="list">List</option><option value="select">Dropdown</option><option value="img">Image</option><option value="button">Button</option><option value="radiobutton">Radiobutton</option><option value="checkbox">Checkbox</option><option value="Element">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /></div>')
	};
	//Add More Object Functionality
	
	//WSDL Functionality
	$scope.selectedWsdlTab = "requestWrap"
	//WSDL Functionality
	
	
	//Submit Custom Object Functionality
	$scope.submitCustomObject = function(){
		$scope.errorMessage = "";
		$(".addObjTopWrap").find(".error-msg-abs").text("");
		$(".addObj-row").find("input").removeAttr("style");
		var flag = "false";
		$(".addObj-row").find("input").removeClass('inputErrorBorder')
		$(".addObj-row").find("select").removeClass('selectErrorBorder')
		$.each($(".addObj-row"), function(){
			if($(this).find("input").val() == ""){
				//$scope.errorMessage = "Please enter object name";
				//$(".addObjTopWrap").find(".error-msg-abs").text("Please enter object name");
				$(this).find("input").attr("style","border-bottom: 2px solid #d33c3c !important;").focus();//.addClass('inputErrorBorder')
				flag = "false";
				return false
			}
			else if($(this).find("select option:selected").val() == "Select Object Type"){
				//$scope.errorMessage = "Please select object type";
				//$(".addObjTopWrap").find(".error-msg-abs").text("Please select object type");
				$(this).find("select").attr("style","border-bottom: 4px solid #d33c3c !important;").focus();//.addClass('selectErrorBorder')
				flag = "false";
				return false
			}
			else{
				//If no field is empty, proceed to service call
				flag = "true";
				$scope.errorMessage = "";
				$(".addObj-row").find("input").removeClass('inputErrorBorder')
				$(".addObj-row").find("select").removeClass('selectErrorBorder')
			}
		})
		if(flag == "true"){
			var customObj = [];
			window.localStorage['disableEditing'] = "true";
			//Pushing custom object in array
			$.each($(".addObj-row"), function(){
				customObj.push({
					custname : $(this).find("input").val(),
					tag : $(this).find("select option:selected").val(),
					xpath : ''
				})
			})
			
			if(viewString == "" || viewString.view == undefined){
				viewString = {view: []}
			}
			//Pushing custom object array in viewString.view
			for(i=0; i<customObj.length; i++){
				viewString.view.push(customObj[i])
			}
			
			//Reloading List Items
			$("#finalScrap").empty()
			$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox' disabled /><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' disabled>Delete</button></span><span></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
			$('#scraplist').empty()
			for(i=0; i<viewString.view.length; i++){
				var innerUL = $('#scraplist');
				var path = viewString.view[i].xpath;
				var ob = viewString.view[i];
				ob.tempId= i;
				var custN = ob.custname.replace(/[<>]/g, '').trim();
				var tag = ob.tag;
				if(tag == "dropdown"){imgTag = "select"}
				else if(tag == "textbox/textarea"){imgTag = "input"}
				else imgTag = tag;
				var tag1 = tag.replace(/ /g, "_");
				var tag2;
				if(tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell"){
					var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
				} 
				else {
					var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+"><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></a></li>";
				}
				angular.element(innerUL).append(li);
			}
			$("#saveObjects").trigger("click");
			$("#dialog-addObject").modal("hide");
			openDialog("Add Object", "Objects has been added successfully.")
			//$("#addObjectSuccess").modal("show")
			$("#saveObjects").prop("disabled", false)
			flag = "false";
		}
		
		//Building Tree
		$(document).find('#scrapTree').scrapTree({
			multipleSelection : {
				//checkbox : checked,
				classes : [ '.item' ]
			},
			editable: true,
			radio: true
		});
	};
	//Submit Custom Object Functionality
	
	
	//Map Object Drag and Drop Functionality
	$scope.generateMapObj = function(){
		$(".submitObjectWarning, .objectExistMap, .noObjectToMap").hide();
		$("#dialog-mapObject").modal("show");
		$('#scrapedObjforMap, #customObjforMap').empty();
		for(i=0; i<viewString.view.length; i++){
			var path = viewString.view[i].xpath;
			var ob = viewString.view[i];
			ob.tempId= i;
			var custN = ob.custname.replace(/[<>]/g, '').trim();
			var tag = ob.tag;
			if(tag == "dropdown"){imgTag = "select"}
			else if(tag == "textbox/textarea"){imgTag = "input"}
			else imgTag = tag;
			var tag1 = tag.replace(/ /g, "_");
			var tag2;
			if(path != ""){
				var innerUL = $('#scrapedObjforMap');
				var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-left='"+ob.left+"' data-top='"+ob.top+"' data-width='"+ob.width+"' data-height='"+ob.height+"' data-tag='"+tag+"' data-url='"+ob.url+"' data-hiddentag='"+ob.hiddentag+"' class='item select_all "+tag+"x' val="+ob.tempId+" draggable='true' ondragstart='drag(event)'><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' data-xpath='"+ob.xpath+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></li>";
				angular.element(innerUL).append(li);
			}
			else {
				var li = "<li data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' data-tag='"+tag+"' class='item select_all "+tag+"x' dropzone='move s:text/plain' ondrop='drop(event)' ondragover='allowDrop(event)'><span title='"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;')+"' data-xpath='"+ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"' class='ellipsis'>"+custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ')+"</span></li>";
				$('#customObjforMap').append('<div class="accd-Obj"><div class="accd-Obj-head">'+tag+'</div><div class="accd-Obj-body">'+li+'</div></div>')
				
				/****Filtering same object type in one container****/
				$(".accd-Obj .accd-Obj-head").each(function(){
					if($(this).text() == $(li).data("tag") && $(this).siblings().text() != $(li).children("span").text()){
						$(this).parent().children(".accd-Obj-body").append(li);
					}
				})
				/****Filtering same object type in one container****/
			}
		}
		
		/****Removing same objects type for custom objects****/
		var seen = {};
		$('.accd-Obj .accd-Obj-head').each(function() {
		    var txt = $(this).text();
		    if (seen[txt]) $(this).remove();
		    else seen[txt] = true;
		});
		/****Removing same objects type for custom objects****/
		
		$(".accd-Obj-head").append('<span class="showactiveArrow"></span>');
		$(".accd-Obj-body li").append('<span class="showPreviousVal" title="Show Previous Text"></span>');
	}
	
	/****Custom object Accoridan****/
	$(document).on("click", ".accd-Obj-head", function(){
		$(this).siblings(".accd-Obj-body").slideToggle("fast", function(){
			$(this).siblings(".accd-Obj-head").find(".showactiveArrow").fadeIn("fast");
			if($(this).parent().siblings().children(".accd-Obj-body").is(":visible") == true){
				$(this).parent().siblings().children(".accd-Obj-body").slideUp("fast");
				$(this).parent().siblings().children(".accd-Obj-head").find(".showactiveArrow").fadeOut("fast");
			}
			else if($(this).is(":visible") == false){
				$(this).siblings(".accd-Obj-head").find(".showactiveArrow").fadeOut("fast");
			}
			return false
		});
	})
	/****Custom object Accoridan****/
	
	
	/***Un-link Functonality***/
	$(document).on("click", ".valueMerged", function(){
		$(this).toggleClass("valueMergedSelected")
		
		//Enable-Disable Unlink button based on the valueMergedSelected Class
		if($(".valueMergedSelected").length > 0) $(".unlinkButton").prop("disabled", false)
		else $(".unlinkButton").prop("disabled", true)
	});
	
	$scope.unlinkMapObj = function(){
		$(".submitObjectWarning, .objectExistMap").hide();
		var mergedObj = $(".valueMergedSelected");
		var sXpath;
		$.each(mergedObj, function(){
			sXpath = $(this).children(".fromMergeObj").data("xpath")
			$(this).children(".showPreviousVal").hide();
			$(this).children(".fromMergeObj").remove();
			$(this).children(".toMergeObj").show().removeClass("toMergeObj")
			$(this).removeClass("valueMerged valueMergedSelected");
			
			/***Reseting Selected Dragged Object for Left Scrapped Tree***/
			$.each($("#scrapedObjforMap li"), function(){
				if($(this).data("xpath") == sXpath){
					$(this).attr("draggable", true)
					$(this).children(".ellipsis").css({'background':'', 'cursor':'auto'})
				}
			})
			/***Reseting Selected Dragged Object for Left Scrapped Tree***/
		});
		$(".unlinkButton").prop("disabled", true)
	}
	/***Un-link Functonality***/
	
	
	/****Show prev value functionality for map object****/
	$(document).on("click", function(e){
		if(e.target.className == "showPreviousVal"){
			$(e.target).siblings(".fromMergeObj").hide();
			$(e.target).siblings(".toMergeObj").show();
		}
		else {
			$(".showPreviousVal").siblings(".fromMergeObj").show();
			$(".showPreviousVal").siblings(".toMergeObj").hide();
		}
	})
	/****Show prev value functionality for map object****/
	
	
	/****Submit Map Object Functionality****/
	$scope.submitMapObject = function(){
		$(".submitObjectWarning, .objectExistMap, .noObjectToMap").hide()
		if($("#customObjforMap").text() == ""){
			$(".noObjectToMap").show()
			return false
		}
		else{
			if($(".valueMerged").length == 0){
				$(".submitObjectWarning").show()
				return false
			}
			else{
				var tasks = JSON.parse(window.localStorage['_CT'])
				var screenId = tasks.screenId;
				var screenName = tasks.screenName;
				var projectId = tasks.projectId;
				var userinfo = JSON.parse(window.localStorage['_UI']);
				scrapeObject = {};
				scrapeObject.projectId = projectId;
				scrapeObject.screenId = screenId;
				scrapeObject.screenName = screenName;
				scrapeObject.userinfo = userinfo;
				scrapeObject.param = "mapScrapeData_ICE";
				scrapeObject.appType = tasks.appType;
				scrapeObject.editedListmodifiedCustNames = [];
				scrapeObject.editedListoldCustName = [];
				scrapeObject.editedListoldXpath = [];
				scrapeObject.editedListmodifiedXpaths = [];
				
				//Filtering the Object which has been mapped
				var valueToMap = $(".valueMerged")
				$.each(valueToMap, function(){
					scrapeObject.editedListmodifiedCustNames.push($(this).children(".fromMergeObj").text());
					scrapeObject.editedListoldCustName.push($(this).children(".toMergeObj").text());
					scrapeObject.editedListoldXpath.push($(this).children(".toMergeObj").data("xpath"));
					scrapeObject.editedListmodifiedXpaths.push($(this).children(".fromMergeObj").data("xpath"));
					
					/***Resetting Values to Default***/
					$(this).children(".showPreviousVal").hide();
					$(this).children(".fromMergeObj").remove();
					$(this).children(".toMergeObj").show().removeClass("toMergeObj")
					$(this).removeClass("valueMerged valueMergedSelected")
					/***Resetting Values to Default***/
				})
				//Filtering the Object which has been mapped
				
				DesignServices.mapScrapeData_ICE(scrapeObject)
				.then(function(data){
						if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
					$("#dialog-mapObject").modal("hide");
					if(data == "Success") 				openDialog("Map Object", "Objects has been mapped successfully.");//$("#mapObjSuccess").modal("show");
					else if(data == "TagMissMatch") 	openDialog("Map Object", "Failed to map objects.");//$("#mapObjTagMissMatch").modal("show");
					else if(typeof data == "object") 	openDialog("Map Object", "Failed to map objects.");//$("mapObjSameObject").modal("show");
					angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
				}, 
				function(error){
					console.log("Error::::", error)
				})
				
				$("#scrapedObjforMap li").attr("draggable", true);
				$("#scrapedObjforMap li").children(".ellipsis").css({'background':'', 'cursor':'auto'});
			}
		}
	}
	/****Submit Map Object Functionality****/
	//Map Object Drag and Drop Functionality

	
	//Save Scrape Objects
	$(document).on('click', "#saveObjects", function(){
		// Start of Filter Duplicate Values in ViewString based on custname
		var arr = newScrapedList.view; //Scraped objects obtained after enable append
		var temp=[];
		arr=arr.filter((x, i)=> {
			var xpath = x.xpath.split(";");
				xpath = xpath[0];
		if (temp.indexOf(xpath) < 0) {
			temp.push(xpath);
			return true;
		}
		return false;
		})
		//End of Filter Duplicate Values in ViewString based on custname
		newScrapedList.view = arr;
		console.log("noduplicates", newScrapedList.view);
		window.localStorage['disableEditing'] = "false";
		//var tasks = JSON.parse(window.localStorage['_TJ']);
		var tasks = JSON.parse(window.localStorage['_CT'])
		if(eaCheckbox) var getScrapeData = JSON.stringify(newScrapedList);
		else var getScrapeData = JSON.stringify(viewString);		
		var screenId = tasks.screenId;
		var screenName = tasks.screenName;
		var projectId = tasks.projectId;
		var userinfo = JSON.parse(window.localStorage['_UI']);
		scrapeObject = {};
		scrapeObject.getScrapeData = getScrapeData;
		scrapeObject.projectId = projectId;
		scrapeObject.screenId = screenId;
		scrapeObject.screenName = screenName;
		scrapeObject.userinfo = userinfo;
		scrapeObject.param = "updateScrapeData_ICE";
		scrapeObject.appType = tasks.appType;
		
		if(window.localStorage['checkEditWorking'] == "true")
		{
			console.log("inside edit");
			var modifiedCust = JSON.parse(window.localStorage['_modified']);
			var currlistItems = [];
        	var modifiedListItems = [];
        	var modList = [];
        	var screenId = tasks.screenId;
        	var userinfo = JSON.parse(window.localStorage['_UI']);
        	getScrapeData = JSON.parse(getScrapeData);
        	scrapeObject.projectId = projectId;
    		scrapeObject.screenId = screenId;
    		scrapeObject.screenName = screenName;
    		scrapeObject.userinfo = userinfo;
        	scrapeObject.param = "editScrapeData_ICE";
        	scrapeObject.appType = tasks.appType;
        	for(i=0; i<getScrapeData.view.length; i++){
        		currlistItems.push(getScrapeData.view[i].custname);
        	}
        	$(".ellipsis").children().parent().parent().parent().remove();
        	$.each($(".ellipsis"), function(){            
    			modifiedListItems.push($(this).text());
    		});
    		for(i=0; i<modifiedListItems.length; i++){
    			if(modifiedListItems[i] != "" || modifiedListItems[i] != undefined){
    				modList.push(modifiedListItems[i])
    			}
    		}
    		scrapeObject.getScrapeData = getScrapeData; 
    		scrapeObject.editedList = modifiedCust; 
		}
		
		//Update Service to Save Scrape Objects
		DesignServices.updateScreen_ICE(scrapeObject)
		.then(function(data){
				if(data == "Invalid Session")
			{
				window.location.href = "/";
			}
			if(data == "success"){
				window.localStorage['_modified'] = "";
				//enableScreenShotHighlight = true;
				localStorage.removeItem("_modified");
				openDialog("Save Scraped data", "Scraped data saved successfully.")
				angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
				$("#saveObjects").attr('disabled', true);
			}
			else{
				//enableScreenShotHighlight = false;
				openDialog("Save Scraped data", "Failed to save")
			}

		}, function(error){})
		
		if($("#window-filter").is(":visible")){
			var filters = $(".popupContent-filter .filterObjects");
			$.each(filters, function(){
				if($(this).hasClass('popupContent-filter-active')){
					$(this).removeClass('popupContent-filter-active').addClass("popupContent-default");
				}
			})
			if($('.checkStyleboxFilter').is(':checked')){
				$('.checkStyleboxFilter').prop('checked',false);
			}
		}

	})

	//To Select and unSelect all objects 
	$(document).on("click", ".checkStylebox", function(){
		if($(this).is(":checked")){
			$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", true).addClass('checked');
			$("#deleteObjects").prop("disabled", false)
		}
		else{
			$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", false).removeClass('checked');
			$("#deleteObjects").prop("disabled", true)
		}
	})

	//Triggered When each checkbox objects are clicked
	$(document).on('click', "input[name='selectAllListItems']", function(){
		if($(this).is(":checked")){
			$(this).addClass('checked');
		} else{
			$(this).removeClass('checked');
		}
		var checkedLength = $("input.checked").length;
		var totalLength = $("#scraplist li").find('input[name="selectAllListItems"]').length;
		if(totalLength == checkedLength)
		{
			$('.checkStylebox').prop("checked", true);
		}
		else{
			$('.checkStylebox').prop("checked", false);
		}		

		if(checkedLength > 0 )
		{
			$("#deleteObjects").prop("disabled", false)
		}
		else{
			$("#deleteObjects").prop("disabled", true)
		}
	})

	$(document).find('#load_jqGrid').prop('display','none !important');

	//save button clicked - save the testcase steps
	$scope.updateTestCase_ICE = function()	{
		cfpLoadingBar.start();
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		if(userInfo.role == "Viewer") return false;
		else{
			var screenId = taskInfo.screenId;
			/*if(window.localStorage['screenIdVal'] == undefined || !window.localStorage['screenIdVal'] || window.localStorage['screenIdVal'] == ""){
				screenId = window.localStorage['scrnId'];
			}else{
				screenId = window.localStorage['screenIdVal'];
			}*/
			var testCaseId = taskInfo.testCaseId;
			var testCaseName = taskInfo.testCaseName;
			if((screenId != undefined) && (screenId != "undefined") && (testCaseId != undefined) && (testCaseId != "undefined")){
				//#D5E7FF  DBF5DF
				var serviceCallFlag = false;
				var mydata = $("#jqGrid").jqGrid('getGridParam','data');
				for(var i=0; i<mydata.length;i++){
					//new to parse str to int (step No)
					if(mydata[i].hasOwnProperty("_id_")){
						if(mydata[i]._id_.indexOf('jpg') !== -1 || mydata[i]._id_.indexOf('jqg') !== -1){
							var index = mydata.indexOf(mydata[i]);
							mydata.splice(index, 1)
						}
					}
				}
				
				for(var i=0; i<mydata.length;i++){
					mydata[i].stepNo = i+1;
					if(mydata[i].custname == undefined || mydata[i].custname == ""){
						var stepNoPos = parseInt(mydata[i].stepNo);
						openDialog("Save Testcase", "Please select Object Name at Step No. "+stepNoPos)
						serviceCallFlag  = true;
						break;
					}
					else{
						//check - keyword column should be mandatorily populated by User
						mydata[i].custname = mydata[i].custname.trim();
						if(mydata[i].keywordVal == undefined || mydata[i].keywordVal == ""){
							var stepNoPos = parseInt(mydata[i].stepNo);
							openDialog("Save Testcase", "Please select keyword at Step No. "+stepNoPos)
							serviceCallFlag  = true;
							break;
						}
						else if(mydata[i].keywordVal == 'SwitchToFrame'){
							if($scope.newTestScriptDataLS != "undefined" || $scope.newTestScriptDataLS != undefined){
								var testScriptTableData = $scope.newTestScriptDataLS;
								for(j=0;j<testScriptTableData.length;j++){
									if(testScriptTableData[j].custname != '@Browser' && testScriptTableData[j].custname != '@Oebs' && testScriptTableData[j].custname != '@Window' && testScriptTableData[j].custname != '@Generic' && testScriptTableData[j].custname != '@Custom'){
										if(testScriptTableData[j].url != ""){
											mydata[i].url = testScriptTableData[j].url;
											break;
										}
									}
								}
							}
						}
						if(mydata[i].keywordVal == "setHeader" || mydata[i].keywordVal == "setHeaderTemplate"){
							if(typeof(mydata[i].inputVal) === "string"){
								mydata[i].inputVal = mydata[i].inputVal.replace(/[\n\r]/g,'##');
							}
							else mydata[i].inputVal[0] = mydata[i].inputVal[0].replace(/[\n\r]/g,'##');
						}
						console.log("updateTestCase:::", mydata)
					}
					if(mydata[i].url == undefined){mydata[i].url="";}
					if(mydata[i].remarks != undefined)
					{
						if(  mydata[i].remarks != $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent  && $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent.trim().length > 0 )	{
							if( mydata[i].remarks.length > 0 ){
								mydata[i].remarks = mydata[i].remarks.concat( " ; " + $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent);
							}
						     else{
								  mydata[i].remarks = $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent;
							 }	 
					     }
					}
					else{
						mydata[i].remarks = $("#jqGrid tbody tr td:nth-child(10)")[i+1].textContent;
					}						
				}
				if(serviceCallFlag  == true)
				{
					console.log("no service call being made");
				}
				else{
					DesignServices.updateTestCase_ICE(screenId,testCaseId,testCaseName,mydata,userInfo)
					.then(function(data){
							if(data == "Invalid Session")
							{
								window.location.href = "/";
							}
						if(data == "success"){
							/*if(window.localStorage['UITSCrtd'] == "true") window.localStorage['UITSCrtd'] = "false"
		        			else{
		        				$("#tabs,#tabo2,#tabo1").tabs("destroy");
		        				showDialogMesgsBtn("Save Test Script", "Test Script saved successfully", "btnSave");
		        				selectRowStepNoFlag = true;
			        			$("#tabs,#tabo2,#tabo1").tabs();
		        			}*/
							angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
							openDialog("Save Testcase", "Testcase saved successfully")
							/*if(deleteStep == false){
								selectRowStepNoFlag = true;
								
							}
							else{
								$("#globalModal").find('.modal-title').text("Delete Testcase step");
								$("#globalModal").find('.modal-body p').text("Successfully deleted the steps").css('color','black');
								$("#globalModal").modal("show");
								deleteStep = false;
							}*/
						}
						else{
							openDialog("Save Testcase", "Failed to save Testcase")
						}
					},
					function(error) {
					});
					serviceCallFlag = false;
				}
			}
			else{
				openDialog("Save Testcase", "ScreenID or TestscriptID is undefined")
				return false;
			}
		}
		cfpLoadingBar.complete();
	}
	
	//Filter Scrape Objects
	$(document).on("click", ".checkStyleboxFilter", function(){
		cfpLoadingBar.start();
		$("html").css({'cursor':'wait'});
		gsElement = []
		$(".popupContent-filter-active").each(function(){
			gsElement.push($(this).data("tag"))
		})
		$timeout(function(){
			filter()
		}, 500);
	})
	$(document).on("click", ".selectAllTxt", function(){
		cfpLoadingBar.start();
		$("html").css({'cursor':'wait'});
		gsElement = []
		$(".popupContent-filter-active").each(function(){
			gsElement.push($(this).data("tag"))
		})
		$timeout(function(){
			filter()
		}, 500);
	})
	$(document).on("click", ".filterObjects", function(){
		cfpLoadingBar.start();
		$("html").css({'cursor':'wait'});
		$("#scraplist li").hide()
		if($(this).hasClass("popupContent-filter-active") == false) {
			var getSpliceIndex = gsElement.indexOf($(this).data("tag"))
			gsElement.splice(getSpliceIndex, 1)
		}
		else gsElement.push($(this).data("tag"))	
		$timeout(function(){
			filter()
			if(($("#scraplist li").find('input[name="selectAllListItems"]:checked').length == $("#scraplist li").find('input[name="selectAllListItems"]:visible').length) && $("#scraplist li").find('input[name="selectAllListItems"]:visible').length != 0){
				$(".checkStylebox").prop("checked",true);
			}
			else $(".checkStylebox").prop("checked",false);
		}, 500);
	})
	
	function filter(){
		if(gsElement.length > 0){
			for(i=0; i<gsElement.length; i++){
				$.each($("#scraplist li"), function(){
					if(gsElement[i] == $(this).data("tag") || ($(this).data("tag").toLowerCase().indexOf(gsElement[i].toLowerCase()) >= 0 && gsElement[i] != "a" && $(this).data("tag").toLowerCase() != "radio button" && $(this).data("tag").toLowerCase() != "radiobutton")
							|| (gsElement[i] == "input" && ($(this).data("tag").indexOf("edit") >= 0 || $(this).data("tag").indexOf("Edit Box") >= 0 || $(this).data("tag").indexOf("text") >= 0 || $(this).data("tag").indexOf("EditText") >= 0))
							|| (gsElement[i] == "select" && $(this).data("tag").indexOf("combo box") >= 0)
							|| (gsElement[i] == "a" && $(this).data("tag").indexOf("hyperlink") >= 0 || $(this).data("tag").indexOf("Static") >= 0)
							|| (gsElement[i] == "checkbox" && $(this).data("tag").indexOf("check box") >= 0)
							|| (gsElement[i] == "radiobutton" && $(this).data("tag").indexOf("radio button") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("scroll bar") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("internal frame") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("tab") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypeTable") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("SeekBar") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("RangeSeekBar") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("NumberPicker") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("DatePicker") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("TimePicker") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("Spinner") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypeSlider") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypePickerWheel") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypeTextField") >= 0)
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypeSearchField") >= 0)
					){
						$(this).show();
					}
				})
				$.each($("#scraplist li"), function(){
					if(gsElement[i] == "Element"){
						$.each($("#scraplist li"), function(){
							if($(this).data("tag") != "button" &&
								$(this).data("tag") != "checkbox" &&
								$(this).data("tag") != "select" &&
								$(this).data("tag") != "img" &&
								$(this).data("tag") != "a" &&
								$(this).data("tag") != "radiobutton" &&
								$(this).data("tag") != "input" &&
								$(this).data("tag") != "list" &&
								$(this).data("tag") != "link" &&
								$(this).data("tag") != "scroll bar" &&
								$(this).data("tag") != "internal frame" &&
								$(this).data("tag") != "table" &&
								$(this).data("tag") != "tab")
							{
									$(this).show();
							}
						})
					}
				})
			}
		} 
		else{
			$("#scraplist li").show()
		}
		$("html").css({'cursor':'auto'});
		cfpLoadingBar.complete()
	}
		
	//Click on add dependent testcase
	$(document).on("click","#addDependent",function() {
		if(!$(this).is(":checked")){
			$("input[type=checkbox]:checked").prop("checked",false);
			dependentTestCaseFlag = false;
		}
		else{
			$("span.errTestCase").addClass("hide");
			$(document).on('shown.bs.modal','#dialog-addDependentTestCase', function () {
				$("input[type=checkbox].checkTestCase").prop("checked",true);
					var currentTestCase = JSON.parse(window.localStorage['_CT']).testCaseName;
					$("span.testcaseListItem").each(function(){
						if(currentTestCase == $(this).children("label").text()){
							$(this).children('input.checkTestCase').attr("disabled",true)
							//$(".checkTestCase[disabled=disabled]").prop('checked',false);
							$(this).nextAll('.testcaseListItem').children('input.checkTestCase').attr("disabled",true);
							$(".checkTestCase[disabled=disabled]").prop('checked',false);
						}
					});
			});
			$("#dialog-addDependentTestCase").modal("show");
			//subTask = JSON.parse(window.localStorage['_CT']).subtask;
			//var testScenarioId = "e191bb4a-2c4f-4909-acef-32bc60e527bc";
			var testScenarioId = JSON.parse(window.localStorage['_CT']).scenarioId;
			DesignServices.getTestcasesByScenarioId_ICE(testScenarioId)
			.then(function(data) {
				if(data == "Invalid Session")
				{
					window.location.href = "/";
				}
				$("#dependentTestCasesContent").empty();
				//data = data.sort();
				for(var i=0;i<data.length;i++)
				{
					$("#dependentTestCasesContent").append("<span class='testcaseListItem'><input data-attr = "+data[i].testcaseId+" class='checkTestCase' type='checkbox' id='dependentTestCase_"+i+"' /><label title="+data[i].testcaseName+" class='dependentTestcases' for='dependentTestCase_"+i+"'>"+data[i].testcaseName+"</label></span><br />");
				}

				$(document).on('click','#debugOn',function() {
					var checkedLength = $(".checkTestCase:checked").length;
					checkedTestcases = [];
					if(checkedLength == 0){
						$("span.errTestCase").removeClass("hide");
						return false;
					}
					else{
						$("span.errTestCase").addClass("hide");
						$("input[type=checkbox].checkTestCase:checked").each(function() {
							checkedTestcases.push($(this).attr("data-attr"));
						});
						if(checkedTestcases.length > 0){
							checkedTestcases.push(JSON.parse(window.localStorage['_CT']).testCaseId);
							$("button.close:visible").trigger('click');
							$("#globalModal").find('.modal-title').text("Dependent Test Cases");
							$("#globalModal").find('.modal-body p').html("Dependent Test Cases saved successfully");
							$("#globalModal").modal("show");
							dependentTestCaseFlag = true;
						}
						else{
							$("button.close:visible").trigger('click');
							$("#globalModal").find('.modal-title').text("Dependent Test Cases");
							$("#globalModal").find('.modal-body p').html("Failed to save dependent testcases");
							$("#globalModal").modal("show");
						}
					}
				});
			}, function(error) {});
		}		
	});
	//Filter Scrape Objects
}]);

function updateTestCase_ICE(){
	angular.element(document.getElementById("tableActionButtons")).scope().updateTestCase_ICE()
}

//Loading table action buttons
function contentTable(newTestScriptDataLS) {
	//get keyword list
	var keywordArrayList = keywordListData;
	keywordArrayList = JSON.parse(keywordArrayList);
	testContent = JSON.parse(readTestCaseData);
	var emptyStr = "{}";
	var obj = testContent;
	var scrappedData = "";
	//scrap data
	var newTestScriptData = newTestScriptDataLS;
	if(newTestScriptData == "undefined" || newTestScriptData == null || newTestScriptData == ""){
		scrappedData = "";
	}
	else{	
		scrappedData = newTestScriptData;
	}

	$("#jqGrid").jqGrid({
		datastr: obj,    
		datatype: "jsonstring",
		editUrl:'obj',
		page:1,
		scroll:1,
		colModel: [
		           { label: 'Step No', 	name: 'stepNo', key:true, editable: false, sortable:false, resizable:false, hidden: true},
		           { name: 'objectName', editable: false, sortable:false, resizable:false, hidden: true},
		           { label: 'Object Name', name: 'custname', editable: true,  resizable:false, sortable:false, 
		        	   edittype:'select', 
		        	   editoptions : {
		        		   value : getTags(scrappedData),
		        		   dataEvents : [{            					
		        			   type : 'change',
		        			   'fn' : editCell
		        		   }]
		        	   }
		           },
		           { label: 'Keyword', 	name: 'keywordVal', editable: true, resizable:false, sortable:false ,
		        	   edittype:'select',
		        	   editoptions :{
		        		   value : getKeywordList(keywordArrayList),
		        		   dataEvents : [{            					
		        			   type : 'change' ,
		        			   'fn' : editkeyWord
		        		   }]
		        	   }
		           },
		           { label: 'Input', name: 'inputVal', editable: true,  resizable:false, sortable:false },
		           { label: 'Output', name: 'outputVal', editable: true,  resizable:false, sortable:false },
		           { label: 'Remarks', name:'remarksStatus', editable: false,  resizable:false, sortable:false},
		           { label: 'Remarks', name: 'remarks', editable: false,  resizable:false, sortable:false, hidden:true},
		           { label: 'URL', 	name: 'url', editable: false, resizable:false, hidden:true },
		           { label: 'appType', name: 'appType', editable: false, resizable:false, hidden:true }
		           ],
		           loadonce: false,
		           viewrecords: false,
		           onSelectRow: editRow,
		           autowidth: true,
		           shrinkToFit: true,
		           multiselect: true, //Appends Checkbox for multiRowSelection
		           multiboxonly: true, //Selects single row
		           beforeSelectRow: function (rowid, e) {
		        	   if ($(e.target).closest("tr.jqgrow").hasClass("state-disabled")) {
		        		   return false;   // doesnot allow to select the row
		        	   }
		        	   return true;    // allows to select the row
		           },
		           //width:950,
		           drag: true,
		           height: 'auto',
		           rowList:[],
		           rowNum: 1000,
		           rownumbers: true,
		           toppager:true,
		           autoencode: true,
		           scrollrows : true,
		           loadComplete: function() {
		        	   $("#jqGrid tr[id^='jqg']").remove();
		        	   $("#jqGrid tr").each(function(){
		        		   if($(this).find("td:nth-child(10)").text().trim().length <= 0){
		        			   $(this).find("td:nth-child(9)").text('');
		        			   $(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-inactive.png" class="remarksIcon"/>');
		        		   }
		        		   else{
		        			   $(this).find("td:nth-child(9)").text('');
		        			   $(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-active.png" class="remarksIcon"/>');
		        		   }
		        	   })
		        	   //$("#cb_jqGrid").on('click', function() {
		        		   /*var cboxParent =  $(this).is(":checked");
		        		   var editableLen = $(".editable").length;
		        		   if (cboxParent == true && editableLen == 0){
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").show();
		        		   }
		        		   else{
		        			   $(".commentIcon,.unCommentIcon,.deleteIcon").hide();
		        		   }
		        		   window.localStorage['selectRowStepNo']='';*/
		        	   //});		        	   
		        	   /*$("#jqGrid tr").children("td[aria-describedby='jqGrid_outputVal']").each(function(){
		        		   if($(this).text().trim() == "##" || $(this).is(":contains(';##')")){
		        			   if($(this).parent('tr:nth-child(odd)').length > 0){
		        				   $(this).parent().css("background","linear-gradient(90deg, red 0.6%, #e8e6ff 0)").focus();
		        			   }
		        			   else{
			        			   $(this).parent().css("background","linear-gradient(90deg, red 0.6%, white 0)").focus();		        				   
		        			   }
		        			   $(this).css('color','red');
		        		   }background: linear-gradient(to right, #d41e2d, #b31f2d) !important;
		        	   });*/
		        	   var gridArrayData = $("#jqGrid").jqGrid('getRowData');
		        	   for(i=0; i<gridArrayData.length; i++){
		        		   if(gridArrayData[i].outputVal.indexOf('##') !== -1  || gridArrayData[i].outputVal.indexOf(';##') !== -1){
		        			   $(this).find('tr.jqgrow')[i].style.borderLeft = "5px solid red";
		        			   $(this).find('tr.jqgrow')[i].childNodes[0].style.marginLeft = "-4px"
		        			   $(this).find('tr.jqgrow')[i].childNodes[7].style.color = "red";
		        		   }
		        		   else{
		        			   //$(this).find('tr.jqgrow')[i].style.borderLeft = "5px solid transparent";
		        			   //$(this).find('tr.jqgrow')[i].childNodes[0].style.marginLeft = "-4px"
		        			   $(this).find('tr.jqgrow')[i].childNodes[7].style.color = "";
		        		   }
		        	   }
		        	   hideOtherFuncOnEdit();
		        	   $("#jqGrid").parent('div').css('height','auto');
		           },
	})

	//commented the sorting of rows (drag and drop) on purpose - Dated: 5/12/2015
	.jqGrid('sortableRows', {
		update: function (ev, ui) {
			var item = ui.item[0],
			ri = item.rowIndex,
			itemId = item.id,
			message = "The row with the id=" + itemId +" is moved. The new row index is " + ri;
			var gridArrayData = $("#jqGrid").jqGrid('getRowData');
			for(var i=0; i<gridArrayData.length;i++){
				gridArrayData[i].stepNo = i+1;
			}
			$("#jqGrid").jqGrid('restoreRow',lastSelection);
			$("#jqGrid").jqGrid('clearGridData');
			$("#jqGrid").jqGrid('setGridParam',{data: gridArrayData});
			$("#jqGrid").trigger("reloadGrid");
			$("#jqGrid").parent('div').css('height','auto');
			//tsrows_reorder();
		}
	});
	//Focus JqGrid onLoad 
	$("#jqGrid").focus().css("outline","none");
	
	$(document).on('click', "[name='inputVal'],[name='custname'],[name='keywordVal'],[name='outputVal']", function() {
		if($("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "getBody" 
			|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeader"
				|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setWholeBody"
					|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeaderTemplate"	){    	
			var getValueInput =$("[name='inputVal']").parent().attr('title');
			if(getValueInput == undefined){
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='form-control'></textarea>")
			}
			else{
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='form-control'>"+getValueInput.split('##').join('\n')+"</textarea>")
			}
		}
	});
	$(document).on('focus', "[name='inputVal'],[name='custname'],[name='keywordVal'],[name='outputVal']", function(e) {
		if($("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "getBody"
			|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeader"
				|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setWholeBody"
					|| $("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeaderTemplate"){
			var getValueInput =$("[name='inputVal']").parent().attr('title');
			if(getValueInput == undefined){
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='form-control'></textarea>")
			}
			else{
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='form-control'>"+getValueInput.split('##').join('\n')+"</textarea>")
			}
		}
		e.preventDefault();
	});

	$("#jqGrid_rn").css("width","54px");
	$('#jqGrid').navGrid("#jqGridPager", {edit: false, add: false, del: false, refresh: false, view: false, search:false, position:"left", cloneToTop: true });
	$('#jqGrid').inlineNav('#jqGrid_toppager',{
		// the buttons to appear on the toolbar of the grid
		edit: false, 
		add: false, 
		del: false,
		save: false,
		cancel: false,
		addParams: {
			keys: true,
			position:"last"
		}
	});

	$("#jqGrid_toppager").hide();
	$("#jqGrid").find(">tbody").sortable("disable");
	$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
	$("#jqGrid").resetSelection();
	
	$(document).on('click', '.remarksIcon', function(){
		$(this).parent('td').next('td[aria-describedby="jqGrid_remarks"]').addClass('selectedRemarkCell');
		var historyDetails = $(this).parent('td').next('td[aria-describedby="jqGrid_remarks"]').text().trim();
		var historyArray = [];
		/*$("#getremarksData").val('');
		$("#modalDialogRemarks").modal("show");*/
		if(historyDetails.indexOf(";") >= 0)
			historyArray = historyDetails.split(";");
		else{
			if(historyDetails)	historyArray.push(historyDetails);
		}
		
		if(historyArray.length > 0){
			$(".historyContents").empty();
			for(i=0; i<historyArray.length; i++){
				if(historyArray[i] != "" && historyArray[i] != " "){
					$(".historyContents").append("<span class=''>"+historyArray[i]+"</span>");					
				}		
			}
			$(".historyDetailsContainer").show();
		}
		else $(".historyDetailsContainer").hide();
		//$("#modalDialogRemarks").find('.modal-title').text("Remarks");
		//$("#modalDialogRemarks").find('#labelContent').text("Add Remarks");
		$("#getremarksData").val('');
		//$("#modalDialogRemarks").find('.modal-footer button').attr("id","btnaddRemarks");
		$("#modalDialogRemarks").modal("show");
	})

	$(document).on('click', '#btnaddRemarks', function(){
		//var oldRemarks = $("#jqGrid tbody tr td.selectedRemarkCell").text().trim();
		if(!$("#getremarksData").val().trim()){
			$("#getremarksData").addClass("inputErrorBorderFull");
		}
		else{
			var userinfo = JSON.parse(window.localStorage['_UI']);
			var d = new Date();
			var DATE = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
			var TIME = d.getHours() +":"+ d.getMinutes() +":"+ d.getSeconds();
			var getremarks = $("#getremarksData").val().trim() + " (From: "+userinfo.firstname+" "+userinfo.lastname+" On: "+ DATE + " " + TIME +")";
			if(getremarks.length > 0){
				$("#jqGrid tbody tr td.selectedRemarkCell").text(getremarks);
				$("#jqGrid tbody tr td.selectedRemarkCell").attr('title',getremarks);
				$("#jqGrid tbody tr td.selectedRemarkCell").removeClass('selectedRemarkCell');
				$(this).parent(".modal-footer").parent(".modal-content").find(".close").trigger('click');
			}			
		}
	})
	
	function hideOtherFuncOnEdit()
	{
		$("#jqGrid").each(function() {
			var cboxCheckedLen = $(".cbox:not(#cb_jqGrid):checked").length;
			var cboxLen = $(".cbox:not(#cb_jqGrid)").length;
			var editableLen = $(".editable").length;
			var cboxParentCheckedLen = $('#cb_jqGrid:checked').length;
			var rowHighlightLen = $("tr.rowHighlight").length;
			var rowSelectedLen = $("tr.ui-state-highlight").length;
			$("tr.rowHighlight").each(function() {
				if(rowSelectedLen > 0 )
				{
					$("tr.rowHighlight").removeClass("rowHighlight");
				}
			});

			if(cboxLen == cboxCheckedLen ){
				$("#cb_jqGrid").prop('checked',true);
			}
			else{
				$("#cb_jqGrid").prop('checked',false);
			}
		});

		$(".cbox:not(#cb_jqGrid)").each(function() {
			$(this).on('click', function(e) {
				var isCboxChecked = $(this).is(":checked");
				var checkedLen = $(".cbox:checked").length;
				if (isCboxChecked == true)
				{
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});

		$("tr.jqgrow").each(function() {
			$(this).on('click', function(e) {
				var rowId = $(this).attr("id");
				if(rowId == (e.target.parentElement.id || e.target.parentElement.parentElement.id))
				{
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});	

		$(".cbox:checked:not(#cb_jqGrid)").parent().parent().siblings("tr.jqgrow").each(function() { 
			var checkedBoxLen = $(".cbox:checked").length;
			if ($(this).hasClass('ui-state-highlight') && checkedBoxLen == 1 ) 
			{ 
				$(this).removeClass('ui-state-highlight'); 
				$(this).find(".cbox").attr("checked",false);
			} 
		});

		//Hide EditTestStep when multiple rows selected
		var checkedLen = $(".cbox:checked:not(#cb_jqGrid)").length;
		if(checkedLen > 1 )
		{
			$("#editTestStep").hide();
		} 
		else{
			$("#editTestStep").show();
		}
	}

	//Enable/disable Functions on start/end of editing
	$("#jqGrid").bind("jqGridInlineEditRow jqGridInlineAfterSaveRow jqGridInlineAfterRestoreRow", function (e) {
		var $self = $(this),
		savedRows = $self.jqGrid("getGridParam", "savedRow");
		if (savedRows.length > 0) {
			hideOtherFuncOnEdit();
		} else {
			hideOtherFuncOnEdit();
		}
	});

	var lastSelection = '';
	function editRow(id,status,e) {
		if (id && id !== lastSelection) {
			var grid = $("#jqGrid");
			if(grid[0].children[0].children[id].children[1].children[0].checked){
				var selectedText = grid.jqGrid('getRowData',id).custname;
				var selectedKeyword = grid.jqGrid('getRowData', id).keywordVal;
				grid.jqGrid('restoreRow',lastSelection);                        
				grid.jqGrid('editRow',id, {keys: true} );
				setKeyword(e,selectedText,grid,selectedKeyword);
				lastSelection = id;
				window.localStorage['selectRowStepNo'] = id;
			}
			//else return false;
		}
		else{
			var grid = $("#jqGrid");
			grid.jqGrid('restoreRow',lastSelection);
			lastSelection = "";
		}
		shortString(); //Call to wrap the select option text in JqGrid
		//get Input and Output Syntax for selected Keyword
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		$.each(keywordArrayList, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  value;//JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedKeyword == k)
					{
						inputSyntax = JSON.parse(v).inputVal;
						outputSyntax = JSON.parse(v).outputVal;
						grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	function setKeyword(e,selectedText,$grid,selectedKeyword){
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var appTypeLocal = taskInfo.appType;//window.localStorage['appTypeScreen'];
		if(selectedText == ""){selectedText = "@Generic"}
		if(selectedText == "@Generic" || selectedText == undefined) 
		{
			objName = " ";
			url = " ";    
			if(appTypeLocal == "MobileApp"){
				var sc = Object.keys(keywordArrayList.defaultListMobility);
				selectedKeywordList = "defaultListMobilityiOS";
				var res = '';
				for(var i = 0; i < sc.length; i++){
					if(selectedKeyword == sc[i]){
						res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
					}
					else
						res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
			}
			else{
				if (appTypeLocal == 'MobileApp') {
					var sc = Object.keys(keywordArrayList.defaultListMobility);
					selectedKeywordList = "defaultListMobility";
				} else {
					var sc = Object.keys(keywordArrayList.defaultList);
					selectedKeywordList = "defaultList";
				}
				var res = '';
				for(var i = 0; i < sc.length; i++){
					if(selectedKeyword == sc[i]){
						res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
					}
					else
						res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
			}			
		}

		else if(selectedText == "@Browser" )
		{
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.browser);
			selectedKeywordList = "browser";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		else if(selectedText == "@BrowserPopUp" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.browserPopUp);
			selectedKeywordList = "browserPopUp";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		/**
		 * To Handle custom objects mapping @custom to element keywords
		 * @author sushma.p
		 * Date Sept-09-2015
		 */
		else if(selectedText == "@Custom" ){
			objName = "@Custom";
			url = "";
			var sc;
			var res = '';
			if(appTypeLocal == 'Desktop'){
				sc = Object.keys(keywordArrayList.customDp);
				selectedKeywordList = "customDp";
			}
			else if(appTypeLocal == 'DesktopJava'){
				sc = Object.keys(keywordArrayList.customOEBS);
				selectedKeywordList = "customOEBS";
				var newTSDataLS = angular.element(document.getElementById('jqGrid')).scope().newTestScriptDataLS;
				if(newTSDataLS){
					if(newTSDataLS != "undefined"){
						//var testScriptTableData = JSON.parse(newTSDataLS);
						for(j=0;j<newTSDataLS.length;j++){
							if(newTSDataLS[j].custname != '@Browser' && newTSDataLS[j].custname != '@Oebs' && newTSDataLS[j].custname != '@Window' && newTSDataLS[j].custname != '@Generic' && newTSDataLS[j].custname != '@Custom'){
								if(newTSDataLS[j].url != ""){
									url = newTSDataLS[j].url;
									break;
								}
							}
						}
					}
				}
			}
			else {
				sc = Object.keys(keywordArrayList.custom);
				selectedKeywordList = "custom";
			}
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);			
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'objectName', objName); 
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		//ends here
		else if(selectedText == "WebService List" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListWS);
			selectedKeywordList = "defaultListWS";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "Mainframe List" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListMF);
			selectedKeywordList = "defaultListMF";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "@Email" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListDP);
			selectedKeywordList = "defaultListDP";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "@Window" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		else if(selectedText == "@Oebs" ){
			objName = "";
			url = "";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
		}
		else if(selectedText == "@Mobile" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if (selectedText == "@Action") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.action);
			selectedKeywordList = "a";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i]
					+ '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">'
					+ sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
		}
		else if(selectedText == "@MobileiOS" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.genericiOS);
			selectedKeywordList = "genericiOS";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		else if(selectedText == "@Sap" ){
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		}
		//Adding @Excel to the objectName dropdown
		else if(selectedText == "@Excel") 
		{
			objName = " ";
			url = " ";    		
			//new
			var sc = Object.keys(keywordArrayList.excelList);
			selectedKeywordList = "excelList";
			var res = '';
			for(var i = 0; i < sc.length; i++){
				if(selectedKeyword == sc[i]){
					res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
				}
				else
					res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', 'Generic');
		}
		else{
			selectedText = replaceHtmlEntites(selectedText.trim());
			for (var i=0; i<scrappedData.length; i++){
				var ob = scrappedData[i];
				var custname1;
				var custval=ob.custname;	
				custname1 = $('<input>').html(custval).text().trim();
				if (custname1.replace(/\s/g, ' ') == selectedText.replace('/\s/g', ' ')){
					objName = ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ');
					url = ob.url;					
					var obType = ob.tag;
					var listType=ob.canselectmultiple;

					//changes from wasim
					if(obType!='a' && obType!='select' && obType!='radiobutton' && obType!='checkbox' && obType!='input' && obType!='list' 
						&& obType!='tablecell' && obType!='table' && obType!='img' && obType!='button' && (appTypeLocal == 'Web' || appTypeLocal == 'MobileWeb')){						
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}	
					else if(obType =='elementWS'){
						var sc = Object.keys(keywordArrayList.elementWS);
						selectedKeywordList = "elementWS";
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'Desktop' &&(obType =='button' ||obType =='input' ||obType =='select' || obType =='list_item'|| obType =='hyperlink' || obType =='lbl'
                        ||obType =='list' || obType == 'edit' || obType == null || obType == 'checkbox' || obType == 'radiobutton' || obType == 'tab' || obType =='datepicker' || obType != undefined)){
                        var res = '';
                        var sc;
                        var listType = ob.canselectmultiple;
                        if(obType =='button')      {sc = Object.keys(keywordArrayList.button);selectedKeywordList = "button";}             
                        else if(obType =='input' || obType == 'edit'){  sc = Object.keys(keywordArrayList.text);selectedKeywordList = "text";}
                        else if(obType =='select'){ sc = Object.keys(keywordArrayList.select);selectedKeywordList = "select";}
                        else if(obType =='list_item')     {sc = Object.keys(keywordArrayList.list);selectedKeywordList = "list";}
                        else if(obType =='tab')     {sc = Object.keys(keywordArrayList.tab);selectedKeywordList = "tab";}
                        else if(obType =='datepicker')     {sc = Object.keys(keywordArrayList.datepicker);selectedKeywordList = "datepicker";}
                        else if (obType == 'list_item' || obType == 'list') {
                               if (listType == 'true') {
                                      sc = Object.keys(keywordArrayList.list);
                                      selectedKeywordList = "list";
                               } else {
                                      sc = Object.keys(keywordArrayList.select);
                                      selectedKeywordList = "select";
                               }
                        }
                        else if(obType =='checkbox'){     sc = Object.keys(keywordArrayList.checkbox);selectedKeywordList = "checkbox";}
                        else if(obType == 'radiobutton')  {sc = Object.keys(keywordArrayList.radiobutton);selectedKeywordList = "radiobutton";}
                        else if(obType =='hyperlink' || obType =='lbl'){       sc = Object.keys(keywordArrayList.link);selectedKeywordList = "link";}
                        else   {sc = Object.keys(keywordArrayList.element);selectedKeywordList = "element";}
                        for(var i = 0; i < sc.length; i++){
                               if(selectedKeyword == sc[i]){
                                      res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
                               }
                               else
                                      res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
                        }
                        var row = $(e.target).closest('tr.jqgrow');
                        var rowId = row.attr('id');
                        $("select#" + rowId + "_keywordVal", row[0]).html(res);
                        selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
                        $grid.jqGrid('setCell', rowId, 'url', url);
                        $grid.jqGrid('setCell', rowId, 'objectName', objName); 
                        $grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
                        break;
					}
					else if(appTypeLocal == 'Desktop' &&(!(obType =='push_button' ||obType =='text' ||obType =='combo_box' || obType =='list_item'|| obType =='hyperlink' || obType =='lbl'
						||obType =='list' || obType == 'edit' || obType == null || obType == 'Static' || obType == 'check_box'|| obType == 'radio_button' || obType =='tab' || obType =='datepicker'))){
						var res = '';
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					//adding for SAP
					else if(appTypeLocal == 'SAP' &&(obType =='GuiTextField' ||obType =='GuiTitlebar' ||obType =='GuiButton' ||obType =='GuiUserArea'||obType =='GuiRadioButton' 
					    ||obType =='GuiLabel' ||obType =='GuiBox' ||obType =='GuiSimpleContainer' ||obType =='GuiPasswordField'||obType=='GuiComboBox'||obType=='GuiCheckBox'
						||obType =='GuiStatusbar' ||obType =='GuiStatusPane' ||obType =='text' ||obType =='combo_box' || obType =='list_item' || obType =='GuiCTextField'
						|| obType =='hyperlink' || obType =='lbl'||obType =='list' || obType == 'edit' || obType == null || obType == 'check_box'|| obType== 'GuiTableControl' 
						|| obType == 'radio_button' || obType=='button' || obType=='checkbox' || obType=='radiobutton' || obType=='table' || obType=='a' || obType=='input' || obType == 'GuiScrollContainer' || obType == 'GuiTab' || obType == 'scroll' ||obType != undefined)){
						var res = '';
						var sc;
						var listType = '';
						if(obType =='push_button' || obType =='GuiButton' || obType =='button' )	{sc = Object.keys(keywordArrayList.button);selectedKeywordList = "button";}		
						else if(obType =='GuiTextField' || obType =='GuiCTextField' || obType =='text' || obType=='input'){	sc = Object.keys(keywordArrayList.text);selectedKeywordList = "text";}
						else if(obType =='GuiLabel' || obType =='lbl'){	sc = Object.keys(keywordArrayList.element);selectedKeywordList = "element";}
						else if(obType =='GuiPasswordField'){	sc = Object.keys(keywordArrayList.text);selectedKeywordList = "text";}
						else if(obType == 'GuiTab'){	sc = Object.keys(keywordArrayList.tabs);selectedKeywordList = "tabs";}
						else if(obType =='GuiScrollContainer' || obType == 'scroll'){	sc = Object.keys(keywordArrayList.scroll);selectedKeywordList = "scroll";}
						else if(obType =='combo_box'||obType =='GuiBox'|| obType=='GuiComboBox' || obType=='select'){	sc = Object.keys(keywordArrayList.select);selectedKeywordList = "select";}
						else if(obType =='list_item')	{sc = Object.keys(keywordArrayList.list);selectedKeywordList = "list";}
						else if(obType =='GuiTableControl' || obType=='table')	{sc = Object.keys(keywordArrayList.table);selectedKeywordList = "table";}
						else if(obType =='GuiShell' || obType=='shell')	{sc = Object.keys(keywordArrayList.shell);selectedKeywordList = "shell";} 
						else if (obType == 'list_item' || obType == 'list') {
							if (listType == 'true') {
								sc = Object.keys(keywordArrayList.list);
								selectedKeywordList = "list";
							} else {
								sc = Object.keys(keywordArrayList.select);
								selectedKeywordList = "select";
							}
						}
						else if(obType =='check_box'||obType=='GuiCheckBox' || obType=='checkbox'){	sc = Object.keys(keywordArrayList.checkbox);selectedKeywordList = "checkbox";}
						else if(obType == 'radio_button '||obType =='GuiRadioButton' || obType=='radiobutton')	{sc = Object.keys(keywordArrayList.radiobutton);selectedKeywordList = "radiobutton";}
						else if(obType =='hyperlink' || obType=='a'){	sc = Object.keys(keywordArrayList.link);selectedKeywordList = "link";}
						else	{sc = Object.keys(keywordArrayList.element);selectedKeywordList = "element";}
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if (appTypeLocal == 'MobileApp'
						&& (obType.indexOf("RadioButton") >= 0 || obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0|| obType.indexOf("EditText") >= 0 
								|| obType.indexOf("Switch") >= 0 || obType.indexOf("CheckBox") >= 0 || obType.indexOf("Spinner") >= 0 || obType.indexOf("TimePicker") >= 0 || obType.indexOf("DatePicker") >= 0 
								|| obType.indexOf("NumberPicker") >= 0 || obType.indexOf("RangeSeekBar") >= 0 || obType.indexOf("SeekBar") >= 0 || obType.indexOf("ListView") >= 0 || obType.indexOf("XCUIElementTypeTextField") >= 0 
								|| obType.indexOf("XCUIElementTypePickerWheel") >= 0 || obType.indexOf("XCUIElementTypeSlider") >= 0 || obType.indexOf("XCUIElementTypeSearchField") >= 0 || obType.indexOf("XCUIElementTypeTable") >=0)) {
						var res = '';
						var sc;
						if (obType.indexOf("RadioButton") >= 0)
						{sc = Object.keys(keywordArrayList.radiobutton);
						selectedKeywordList = "radiobutton";}
						else if (obType.indexOf("EditText") >= 0 || obType.indexOf("XCUIElementTypeTextField") >= 0 || obType.indexOf("XCUIElementTypeSearchField") >= 0)
						{sc = Object.keys(keywordArrayList.input);
						selectedKeywordList = "input";}
						else if (obType.indexOf("XCUIElementTypePickerWheel") >= 0)
						{sc = Object.keys(keywordArrayList.pickerwheel);
						selectedKeywordList = "pickerwheel";}
						else if (obType.indexOf("XCUIElementTypeSlider") >= 0)
						{sc = Object.keys(keywordArrayList.slider);
						selectedKeywordList = "slider";}
						else if (obType.indexOf("Switch") >= 0)
						{sc = Object.keys(keywordArrayList.togglebutton);
						selectedKeywordList = "togglebutton";}
						else if (obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0)
						{sc = Object.keys(keywordArrayList.button); selectedKeywordList = "button";}
						else if (obType.indexOf("Spinner") >= 0)
						{sc = Object.keys(keywordArrayList.spinners);selectedKeywordList = "spinners";}
						else if (obType.indexOf("CheckBox") >= 0)
						{sc = Object.keys(keywordArrayList.checkbox);selectedKeywordList = "checkbox";}
						else if (obType.indexOf("TimePicker") >= 0)
						{sc = Object.keys(keywordArrayList.time);selectedKeywordList = "time";}
						else if (obType.indexOf("DatePicker") >= 0)
						{sc = Object.keys(keywordArrayList.date);selectedKeywordList = "date";}
						else if (obType.indexOf("NumberPicker") >= 0)
						{sc = Object.keys(keywordArrayList.numberpicker);selectedKeywordList = "numberpicker";}
						else if (obType.indexOf("RangeSeekBar") >= 0)
						{sc = Object.keys(keywordArrayList.rangeseekbar);selectedKeywordList = "rangeseekbar";}
						else if (obType.indexOf("SeekBar") >= 0)
						{sc = Object.keys(keywordArrayList.seekbar);selectedKeywordList = "seekbar";}
						else if (obType.indexOf("ListView") >= 0)
						{sc = Object.keys(keywordArrayList.listview);selectedKeywordList = "listview";}
						else if(obType.indexOf("XCUIElementTypeTable") >=0)
						{sc = Object.keys(keywordArrayList.table);selectedKeywordList = "table";}
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i]
								+ '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i]
							+ '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					} else if (appTypeLocal == 'MobileApp' && (!(obType.indexOf("RadioButton") >= 0 || obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0 || obType.indexOf("EditText") >= 0 
							|| obType.indexOf("Switch") >= 0  || obType.indexOf("CheckBox") >= 0 || obType.indexOf("Spinner") >= 0 || obType.indexOf("TimePicker") >= 0 || obType.indexOf("DatePicker") >= 0 
							|| obType.indexOf("NumberPicker") >= 0 || obType.indexOf("RangeSeekBar") >= 0 || obType.indexOf("SeekBar") >= 0 || obType.indexOf("ListView") >= 0 || obType.indexOf("XCUIElementTypeTextField") >= 0 
							|| obType.indexOf("XCUIElementTypePickerWheel") >= 0 || obType.indexOf("XCUIElementTypeSlider") >= 0 || obType.indexOf("XCUIElementTypeSearchField") >= 0 || obType.indexOf("XCUIElementTypeTable") >=0 ))) {
						var res = '';
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i]
								+ '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i]
							+ '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'MobileApp' && (( obType == 'UIATableView' || obType == 'UIASecureTextField' || obType == 'UIATextField' || obType=='UIASwitch' || obType=='UIAButton'  || obType == 'UIASearchBar' || obType == 'UIASlider' || obType =='UIAPickerWheel'))){
						var res = '';
						var sc;
						if(obType == 'UIASecureTextField' || obType == 'UIATextField' || obType == 'UIASearchBar'){ sc = Object.keys(keywordArrayList.text);selectedKeywordList = "text";}
						else if(obType =='UIASwitch'){ sc = Object.keys(keywordArrayList.Switch);selectedKeywordList = "Switch";}
						else if(obType =='UIAButton') {sc= Object.keys(keywordArrayList.button);selectedKeywordList = "button";}
						else if(obType == 'UIASlider') {sc = Object.keys(keywordArrayList.slider);selectedKeywordList = "slider";}
						else if(obType =='UIAPickerWheel'){ sc = Object.keys(keywordArrayList.picker);selectedKeywordList = "picker";}
						else if(obType =='UIATableView') {sc = Object.keys(keywordArrayList.table);selectedKeywordList = "table";}
						else	{sc = Object.keys(keywordArrayList.generic);selectedKeywordList = "generic";}
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;						
					}
					else if(appTypeLocal == 'MobileApp' && (!(obType == 'UIATableView' || obType == 'UIASecureTextField' || obType == 'UIATextField' || obType=='UIASwitch' || obType=='UIAButton'  || obType == 'UIASearchBar' || obType == 'UIASlider' || obType =='UIAPickerWheel'))){
						var res = '';
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else if(appTypeLocal == 'DesktopJava' && (obType =='push button' ||obType =='text' ||obType =='combo box' || obType =='list item'|| obType =='hyperlink' || obType =='label' || obType =='scroll bar' || obType =='toggle button' || obType =='menu' 
						||obType =='list' || obType == 'edit' || obType == 'Edit Box' || obType == null || obType == 'Static' || obType == 'check box'|| obType == 'radio button' || obType == 'panel' || obType != undefined || obType == 'table') || obType == 'password text'){
						var sc;
						if(obType =='push button' || obType =='toggle button'){
							sc = Object.keys(keywordArrayList.button);		
							selectedKeywordList = "button";
						}
						else if(obType == 'edit'|| obType == 'Edit Box' || obType =='text' || obType =='password text'){
							sc = Object.keys(keywordArrayList.text);
							selectedKeywordList = "text";
						}
						else if(obType =='combo box'){
							sc = Object.keys(keywordArrayList.select);
							selectedKeywordList = "select";
						}
						else if(obType =='list item' || obType =='list' ){
							sc = Object.keys(keywordArrayList.list);
							selectedKeywordList = "list";
						}
						else if(obType =='hyperlink' || obType =='Static'){
							sc = Object.keys(keywordArrayList.link);
							selectedKeywordList = "link";
						}
						else if(obType =='check box'){
							sc = Object.keys(keywordArrayList.checkbox);
							selectedKeywordList = "checkbox";
						}
						else if(obType =='radio button'){
							sc = Object.keys(keywordArrayList.radiobutton);
							selectedKeywordList = "radiobutton";
						}
						else if(obType == 'table'){
							sc = Object.keys(keywordArrayList.table);
							selectedKeywordList = "table";
						}
						else if(obType == 'scroll bar'){
							sc = Object.keys(keywordArrayList.scrollbar);
							selectedKeywordList = "scrollbar";
						}
						else if(obType == 'internal frame'){
							sc = Object.keys(keywordArrayList.internalframe);
							selectedKeywordList = "internalframe";
						}
						else{
							sc = Object.keys(keywordArrayList.element);
							selectedKeywordList = "element";
						}
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
					else {
						var sc = Object.keys(keywordArrayList[obType]);
						selectedKeywordList = obType;
						var res = '';
						for(var i = 0; i < sc.length; i++){
							if(selectedKeyword == sc[i]){
								res += '<option role="option" value="' + sc[i]+'" selected>' + sc[i] + '</option>';
							}
							else
								res += '<option role="option" value="' + sc[i]+'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName); 
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					}
				}
			}
		}
	}

	function setKeyword1(e,selectedText,$grid,selectedKeyword){
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var appTypeLocal = taskInfo.appType;//window.localStorage['appTypeScreen'];
		if(selectedText == "getBody"){
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if (selectedText == "setHeader"){
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if (selectedText == "setWholeBody"){
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		}
		else if(selectedText == "setHeaderTemplate"){
			var header;
			if(dataFormat12.length == 1) header = dataFormat12.val();
			else if(dataFormat12.length > 1) header = dataFormat12.replace(/##/g, '\n');
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'>"+header+"</textarea>");
		}
		else{
			$(e.target).parent().next().html("<input type='text' class='editable form-control' style='width: 100%;'/>");
		}
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editkeyWord(e){
		var keywordArrayList = keywordListData;
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'keywordVal';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam','selrow');
		var selId = '#' + currRowId + '_'+selName;
		var selectedText = $(selId+' option:selected').val();
		var url = " " ;
		var objName = " ";
		setKeyword1(e,selectedText,$grid,"empty");
		$(selId).parent().next().find('input').val('');
		$(selId).parent().next().next().find('input').val('');
		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  value;//JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedText == k)
					{
						inputSyntax = JSON.parse(v).inputVal;
						outputSyntax = JSON.parse(v).outputVal;
						$grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						$grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editCell(e){
		var keywordArrayList = keywordListData;
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'custname';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam','selrow'); 
		var selId = '#' + currRowId + '_'+selName;             	
		var selectedText = $(selId+' option:selected').val();
		var url = " " ;
		var objName = " ";
		setKeyword(e,selectedText,$grid,"empty");
		//uncomment below two sections to verify change in URL 
		//set the URL to the cell 'url'
		if(selectedText == "@Generic" || selectedText == undefined || selectedText == "@Browser" || selectedText == "@Excel" || selectedText == "@BrowserPopUp"){
			$grid.jqGrid('setCell', currRowId, 'objectName', objName); 
			$grid.jqGrid('setCell', currRowId, 'url', url); 
		}
		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList, function( index, value ) {
			keywordArrayKey = index;
			keywordArrayValue =  value;//JSON.parse(value);
			if(selectedKeywordList == keywordArrayKey)
			{
				$.each(keywordArrayValue, function(k, v) {
					if(selectedKey == k)
					{
						inputSyntax = JSON.parse(v).inputVal;
						outputSyntax = JSON.parse(v).outputVal;
						$grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						$grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}
	$("#load_jqGrid").hide();
}	
//contentTable

//Delete Testscripts
function deleteTestScriptRow(e){
	if($('.ui-state-highlight').find('td:nth-child(2)').find('input').is(":checked") && $('.ui-state-highlight').find('td:nth-child(7)').find('input').length > 0){
		
	}
	else if($('#jqGrid tbody tr.ui-widget-content').length <= 0){
		openDialog("Delete Testcase step", "No steps to Delete")
	}
	else{
		if($(document).find("#cb_jqGrid:checked").length > 0 || $("#jqGrid").find(".cbox:checked").length > 0 ){
			$("#globalModalYesNo").find('.modal-title').text("Delete Test Step");
			$("#globalModalYesNo").find('.modal-body p').text("Are you sure, you want to delete?").css('color','black');
			$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnDeleteStepYes")
			$("#globalModalYesNo").modal("show");
			/*angular.element(document.getElementById("tableActionButtons")).scope().updateTestCase_ICE();*/		
		}
		else{
			openDialog("Delete Test step", "Select steps to delete")
		}
	}
}

$(document).on('click','#btnDeleteStepYes', function(){
	var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
	var gridArrayData = $("#jqGrid").jqGrid('getRowData');
	console.log("array data test ***** "+JSON.stringify(gridArrayData));
	for(var i=0;i<selectedRowIds.length;i++){
		$("#jqGrid").delRowData(selectedRowIds[i]);
	}
	var gridData = $("#jqGrid").jqGrid('getRowData');
	for(var i=0; i<gridData.length;i++){
		//new to parse str to int (step No)
		gridData[i].stepNo = i+1;
	}
	$("#jqGrid").jqGrid('clearGridData');
	$("#jqGrid").jqGrid('setGridParam',{data: gridData});
	$("#jqGrid").trigger("reloadGrid");
	$('.modal-header:visible').find('.close').trigger('click')
	//deleteStep = true;
})

function addTestScriptRow(){
	if($('.ui-state-highlight').find('td:nth-child(2)').find('input').is(":checked") && $('.ui-state-highlight').find('td:nth-child(7)').find('input').length > 0){
		
	}
	else{
		var flagClass;
		if($("#jqGrid tr").hasClass("ui-state-highlight") == true) {
			flagClass = "true";
			window.localStorage['selectedRowStepNo'] = $("#jqGrid tr.ui-state-highlight td:nth-child(1)").text();
			if($("#jqGrid tr.ui-state-highlight").length > 1) flagClass = "false";
		}
		else flagClass = "false";
		var selectedStepNo = window.localStorage['selectedRowStepNo']
		//$("#jqGrid").trigger("reloadGrid");
		appTypeLocal = JSON.parse(window.localStorage['_CT']).appType;
		var emptyRowData = {
				"objectName": "",
				"custname": "",
				"keywordVal": "",
				"inputVal": [""],
				"outputVal": "",
				"stepNo": "",
				"url": "",
				"appType": "Generic",
				"remarksStatus": "",
			    "remarks": ""
		};
		
		$("#jqGrid tr").each(function(){
			if($(this).find("td:nth-child(9)").find(".remarksIcon").length > 0){
				$(this).find("td:nth-child(9)").find(".remarksIcon").remove();
			}
		})
		   
		var gridArrayData = $("#jqGrid").jqGrid('getRowData');
		var arrayLength = gridArrayData.length;
		if(arrayLength <= 0){
			gridArrayData.splice(arrayLength,0,emptyRowData);
			gridArrayData[0].stepNo = parseInt("1");
			window.localStorage['emptyTable'] = true;
		}else{
			window.localStorage['emptyTable'] = false;
			if(flagClass == "true"){
				gridArrayData.splice(parseInt(selectedStepNo),0,emptyRowData);
				if(gridArrayData[parseInt(selectedStepNo)+1] == undefined){
					gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength-1].stepNo)+1;
				}
				else{
					gridArrayData[parseInt(selectedStepNo)].stepNo = parseInt(gridArrayData[parseInt(selectedStepNo)+1].stepNo)
					//i=gridArrayData[parseInt(selectedStepNo)].stepNo
					for(i=0; i < gridArrayData.length; i++){
						gridArrayData[i].stepNo = i+1;
					}
				}
			} 
			else{
				gridArrayData.splice(arrayLength,0,emptyRowData);
				gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength-1].stepNo)+1;
			}
		}
		$("#jqGrid").jqGrid('clearGridData');
		$("#jqGrid").jqGrid('setGridParam',{data: gridArrayData});
		$("#jqGrid").trigger("reloadGrid");

		$("#jqGrid tr:last").focus();
		if(flagClass == "true"){
			$("#jqGrid tr").each(function(){
				if($(this).children("td:nth-child(1)").text() == window.localStorage['selectedRowStepNo']){
					$(this).siblings().removeClass("ui-state-highlight")
					$(this).next().addClass("ui-state-highlight").focus();
				}
			})
			flagClass == "false"
		}
	}	
}

function rearrangeTestScriptRow(){
	$("#jqGrid").trigger("reloadGrid");	
	$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "remarks", {editable: false});
	$("#jqGrid").jqGrid("setColProp", "remarksIcon", {editable: false});
	$("#jqGrid").resetSelection();
	$("#jqGrid").find(">tbody").sortable("enable");
	enabledEdit = "false";
}

var selectedRow;
var rowSelect;
var selectedRowIds;
var lastSelectedRowId

//Edit Testscript Row
function editTestCaseRow(){
	var rowSelect = $(document).find(".ui-state-highlight").children("td:nth-child(1)").text();
	if($('#jqGrid tbody tr.ui-widget-content').length <= 0){
		openDialog("Edit step", "No steps to edit")
	}
	else if(rowSelect == "" || rowSelect == " "){
		openDialog("Edit step", "Select step to edit")
	}
	else{
		var editSelRow = parseInt(rowSelect) + parseInt(1);
		var rowIsChecked =  $(document).find(".ui-state-highlight").find(".cbox").is(":checked");
		var checkedLen = $(".cbox:checked").length;	
		$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false });
		$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "custname", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "url", {editable: true});
		$("#jqGrid").jqGrid("setColProp", "appType", {editable: true});
		$("#jqGrid").resetSelection();
		$("#jqGrid").trigger("reloadGrid");
		$("#jqGrid tr").each(function(){
			$(this).attr("id",$(this).index());
			$(this).children("td[aria-describedby='jqGrid_stepNo']").attr("title",$(this).index()).text($(this).index());
			$(this).children("td[aria-describedby='jqGrid_cb']").children("input").attr("id","jqg_jqGrid_"+$(this).index()).attr("name","jqg_jqGrid_"+$(this).index());
		})
		$("#jqGrid").find(">tbody").sortable("disable");
		$(this).focus();
		$("#jqGrid tr").each(function(){
			if(rowSelect == $(this).children("td:nth-child(1)").text() && rowIsChecked == true )
			{
				$(this).focus().addClass("rowHighlight");
				$("tr.rowHighlight").trigger('click');
			}
			else
			{
				$("tr.rowHighlight").removeClass("rowHighlight");
			}
		});
		enabledEdit = "true";
		$("#errorMsg").text('');
		if(rowSelect != "")
		{
			$("tr:nth-child("+editSelRow+")").focus().trigger('click'); //Focus row on checkbox selection
		}
		//Trigger Focus on selected row when multiple rows are checked and unchecked and is not editable
		$("tr.ui-state-highlight").each(function() {
			var checkedLen = $(".cbox:checked").length;
			var editableLen = $(".editable").length;
			if(checkedLen == 1 && editableLen == 0)
			{
				$(this).focus().trigger('click');
			}
		});
	}
}

//Copy-Paste TestStep Functionality
function copyTestStep(){
	window.localStorage['emptyTestStep'] = "false";
	var taskInfo = JSON.parse(window.localStorage['_CT']);
	if(($(document).find(".ui-state-highlight").length <= 0 && $('#jqGrid tbody tr.ui-widget-content').children('td:nth-child(5)').text().trim() == "") || ($(document).find(".ui-state-highlight").length == 1 && $(document).find(".ui-state-highlight").children('td:nth-child(5)').text().trim() == "")){
		openDialog("Copy step", "Empty step can not be copied.")
	}
	else if(!$(document).find(".cbox:checked").parent().parent("tr").hasClass("ui-state-highlight")){
		openDialog("Copy step", "Select step to copy")
	}
	else{
		getSelectedRowData = [];
		getRowJsonCopy = [];
		getSelectedRowData = $(document).find(".cbox:checked").parent().parent("tr.ui-state-highlight")
		$.each(getSelectedRowData, function(){
			if($(this).children(":nth-child(5)").html() == "&nbsp;"){
				window.localStorage['emptyTestStep'] = "true";
				openDialog("Copy Test Step", "The operation cannot be performed as the steps contains invalid/blank object references")
				getSelectedRowData = [];
				getRowJsonCopy = [];
				return false
			}
			else{
				getRowJsonCopy.push({
					"objectName"	: $(this).children("td:nth-child(4)").text().trim(),
					"custname"		: $(this).children("td:nth-child(5)").text(),
					"keywordVal"	: $(this).children("td:nth-child(6)").text(),
					"inputVal"		: $(this).children("td:nth-child(7)").text(),
					"outputVal"		: $(this).children("td:nth-child(8)").text().trim(),
					"stepNo"		: parseInt($(this).children("td:nth-child(1)").text()),
					"remarksIcon"		: $(this).children("td:nth-child(9)").text(),
					"remarks"		: $(this).children("td:nth-child(10)").text(),
					"url"			: $(this).children("td:nth-child(11)").text().trim(),
					"appType"		: $(this).children("td:nth-child(12)").text()					
				});
			}
		});
		window.localStorage['getRowJsonCopy'] = angular.toJson(getRowJsonCopy);
		//Reloading Row
		$("#jqGrid").trigger("reloadGrid");	
		$("#jqGrid").jqGrid("setColProp", "stepNo", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "objectName", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "custname", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "url", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "appType", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "remarks", {editable: false});
		$("#jqGrid").jqGrid("setColProp", "remarksIcon", {editable: false});
		$("#jqGrid").resetSelection();
		$("#jqGrid").find(">tbody").sortable("enable");
		window.localStorage['anotherScriptId'] = JSON.parse(window.localStorage['_CT']).testCaseId;//window.localStorage['testScriptIdVal'];
		window.localStorage['getAppTypeForPaste'] = taskInfo.appType;//window.localStorage['appTypeScreen']
	}
}
//Need to work
function pasteTestStep(){
	var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
	if(getRowJsonToPaste == [] || getRowJsonToPaste == undefined || getRowJsonToPaste.length <= 0){
		openDialog("Paste Testcase step", "Copy steps to paste")
	}
	else{
		if($("#jqGrid tr.ui-state-highlight td:nth-child(5)").find("select").length > 0){
			var esc = $.Event("keydown", { keyCode: 27 });
			$("#jqGrid tr.ui-state-highlight td:nth-child(7)").find("input").trigger(esc);
		}
		if(window.localStorage['anotherScriptId'] != JSON.parse(window.localStorage['_CT']).testCaseId){
			if (window.localStorage['emptyTestStep'] == "true" || getRowJsonToPaste == undefined) return false
			else if(window.localStorage['getAppTypeForPaste'] != JSON.parse(window.localStorage['_CT']).appType){
				openDialog("Paste Test Step", "Project type is not same");
				return false
			}
			else{
				$("#globalModalYesNo").find('.modal-title').text("Paste Test Step");
				$("#globalModalYesNo").find('.modal-body p').text("Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?").css('color','black');
				$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id","btnPasteTestStepYes")
				$("#globalModalYesNo").modal("show");
				//showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			}
		} 
		else{
			if (window.localStorage['emptyTestStep'] == "true" || getRowJsonToPaste == undefined) return false
			else if($("#jqGrid").jqGrid('getRowData').length == 1 && $("#jqGrid").jqGrid('getRowData')[0].custname == "") showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			else{
				$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
				$("#modalDialog-inputField").find('#labelContent').html("Paste after step no:").css('color','black').append("<br/><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>");				
				$("#modalDialog-inputField").find('.modal-footer button').attr("id","btnPasteTestStep");
				$("#modalDialog-inputField").find('#getInputData').attr("placeholder","Enter a value");
				$("#modalDialog-inputField").find('#getInputData').addClass("copyPasteValidation");
				$("#modalDialog-inputField").find('#errorMsgs1').text("*Textbox cannot be empty");
				$("#modalDialog-inputField").find('#errorMsgs2').text("*Textbox cannot contain characters other than numbers seperated by single semi colon");
				$("#modalDialog-inputField").find('#errorMsgs3').text("*Please enter a valid step no");
				$("#modalDialog-inputField").modal("show");
				//createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
				/*$("#btnPasteTestStep").text("Paste")
				$("#textBoxID").css({'margin-bottom':'0'})*/
			}
		}
	}	
}
// TO Clear Input Val on Close of Bootstrap Modal Dialog
$(document).on('hide.bs.modal','#modalDialog-inputField', function () {
	$("#getInputData").val('')
});


$(document).on("click", "#btnPasteTestStepYes", function(){
	$("#globalModalYesNo").find('.modal-footer button:nth-child(2)').trigger("click");
	if($("#jqGrid tr.ui-widget-content td:nth-child(5)").html() == "&nbsp;" && $("#jqGrid tr.ui-widget-content").length == 1){
		pasteInGrid()
	}
	else{
		$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
		$("#modalDialog-inputField").find('#labelContent').text("Paste after step no:").css('color','black').append("</br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>");
		//$("</br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>").insertAfter('#labelContent');
		$("#modalDialog-inputField").find('.modal-footer button').attr("id","btnPasteTestStep");
		$("#modalDialog-inputField").find('#getInputData').attr("placeholder","Enter a value");
		$("#modalDialog-inputField").find('#getInputData').addClass("copyPasteValidation");
		$("#modalDialog-inputField").find('#errorMsgs1').text("*Textbox cannot be empty")
		$("#modalDialog-inputField").find('#errorMsgs2').text("*Textbox cannot contain characters other than numbers seperated by single semi colon")
		$("#modalDialog-inputField").find('#errorMsgs3').text("*Please enter a valid step no")
		$("#modalDialog-inputField").modal("show");
		/*createDialogsCopyPaste("Paste Test Step", "Paste after step no:<br/><span style='font-size:11px;'>For multiple paste, provide step numbers separated by semicolon Eg: 5;10;20</span>", "*Textbox cannot be empty", "*Textbox cannot contain characters other than numbers seperated by single semi colon", "*Please enter a valid step no", "btnPasteTestStep");
		$("#btnPasteTestStep").text("Paste")
		$("#textBoxID").css({'margin-bottom':'0'})*/
	}
})

$(document).on("click","#btnPasteTestStep", function(){
	var chkNo;
	var selectedStepNo = [];
	var proceed = true;
	$("#errorMsgs1, #errorMsgs2, #errorMsgs3").hide();
	if(!$("#getInputData").val()) $("#errorMsgs1").show();
	else if(!/^[0-9;]+$/.test($("#getInputData").val())) $("#errorMsgs2").show();
	else{
		var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
		//$(document).find(".dialogContent").append('<img src="imgs/loader1.gif" class="domainLoader" style="bottom: 20px; left: 20px;" />')
		chkNo = $("#getInputData").val().split(";");

		if(chkNo.length > 1){
			selectedStepNo.push(parseInt(chkNo[0]));
			for(j=1; j<chkNo.length; j++){
				selectedStepNo.push(parseInt(chkNo[j])+(getRowJsonToPaste.length * selectedStepNo.length));
			}
		}
		else selectedStepNo.push(chkNo[0]);
		for(i=0; i<chkNo.length; i++){
			if(isNaN(parseInt(chkNo[i]))){
				$("#errorMsgs2").show();
				proceed = false;
				break;
			}
			else if(parseInt(chkNo[i]) >= $("#jqGrid tr").length || parseInt(chkNo[i]) < 0){
				$("#errorMsgs3").show();
				proceed = false;
				break;
			}
		}
		if(proceed == true){
			for(i=0; i<selectedStepNo.length; i++){
				pasteSelecteStepNo[i] = selectedStepNo[i];
			}
			pasteInGrid();
			/*$('.domainLoader').remove();
			$("#dialogOverlay, #dialogContainer").remove();*/
			$("#modalDialog-inputField").find(".close").trigger("click");
		}
	}	
})

$(document).on('keypress', '.copyPasteValidation', function(e){
	if((e.charCode >= 48 && e.charCode <= 57) || e.charCode == 59) return true;
	else return false;
})
$(document).on('focusout', '.copyPasteValidation', function(){
	var reg = /^[0-9;]+$/;
	if(reg.test($(this).val())){
		return true;
	}else{
		//$(this).val('');
		//$('#errorMsgs2').show();
		return false;
	}
})
$(document).on('focus', '.copyPasteValidation', function(){
	$('#errorMsgs1, #errorMsgs2, #errorMsgs3').hide();	
})

function pasteInGrid(){
	var gridData = $("#jqGrid").jqGrid('getRowData');
	var increaseSplice; var getRowJsonCopyTemp = [];
	var newVal;
	var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
	var highlightPasted = [];
	if(pasteSelecteStepNo.length <= 0){
		pasteSelecteStepNo.push(0);
	}
	for(a=0; a<pasteSelecteStepNo.length; a++){
		newVal = parseInt(pasteSelecteStepNo[a]);
		if(gridData.length == 1 && gridData[0].custname == ""){
			gridData.splice(gridData[0],1)
			for(k=0; k<getRowJsonToPaste.length; k++){
				gridData.push(getRowJsonToPaste[k])
			}
		}
		else{
			if(pasteSelecteStepNo[a] > 0){
				for(i=0; i<gridData.length; i++){
					if(gridData[i].stepNo == pasteSelecteStepNo[a]){
						for(j=0; j<getRowJsonToPaste.length; j++){
							getRowJsonToPaste[j].stepNo = parseInt(gridData[i].stepNo) + 1
							if(increaseSplice == "true") gridData.splice(newVal,0,getRowJsonToPaste[j]);
							else gridData.splice(pasteSelecteStepNo[a],0,getRowJsonToPaste[j]);
							//ReArranging Step No
							for(var l=0; l<gridData.length;l++) gridData[l].stepNo = l+1;
							//ReArranging Step No
							increaseSplice = "true";
							newVal++
						}
					}
				}
			}
			else{
				for(i=0; i<getRowJsonToPaste.length; i++){
					getRowJsonCopyTemp.push(getRowJsonToPaste[i]);
				}
				for(j=0; j<gridData.length;j++){
					getRowJsonCopyTemp.push(gridData[j]);
					for(var l=0; l<getRowJsonCopyTemp.length;l++) getRowJsonCopyTemp[l].stepNo = l+1;
				}
				gridData = [];
				for(k=0; k<getRowJsonCopyTemp.length; k++){
					gridData.push(getRowJsonCopyTemp[k]);
				}
			}

		}
		$("#jqGrid").jqGrid('clearGridData');
		$("#jqGrid").jqGrid('setGridParam',{data: gridData});
		$("#jqGrid").trigger("reloadGrid");
		if(pasteSelecteStepNo[a] > 0){
			for(var i=parseInt(pasteSelecteStepNo[a])+1; i<=parseInt(pasteSelecteStepNo[a])+getRowJsonToPaste.length; i++){
				highlightPasted.push(i);
				/*$.each($("#jqGrid tr"), function(){
					if(parseInt($(this).children("td:nth-child(1)").text()) == i){				
						$(this).find("input.cbox").trigger("click")
						return false;
					}
				})*/
			}
		}
		else{
			for(var i=parseInt(pasteSelecteStepNo[a])+1; i<=getRowJsonToPaste.length; i++){
				highlightPasted.push(i);
				/*$.each($("#jqGrid tr"), function(){
					if(parseInt($(this).children("td:nth-child(1)").text()) == i){				
						$(this).find("input.cbox").trigger("click")
						return false;
					}
				})*/
			}
		}
		$.each($("#jqGrid tr"), function(){
			for(j=0;j<highlightPasted.length;j++){
				if(parseInt($(this).children("td:nth-child(1)").text()) == highlightPasted[j]){				
					//$(this).find("input.cbox").prop("checked",true);
					$(this).addClass("row-highlight-background");
					$(this).addClass("ui-state-highlight");
					//$(this).siblings().removeClass("ui-state-highlight");
				}
			}
			$(this).attr("id",$(this).index());
			$(this).children("td[aria-describedby='jqGrid_stepNo']").attr("title",$(this).index()).text($(this).index());
			$(this).children("td[aria-describedby='jqGrid_cb']").children("input").attr("id","jqg_jqGrid_"+$(this).index()).attr("name","jqg_jqGrid_"+$(this).index());
		})
	}

}
//Copy-Paste TestStep Functionality

//Commenting TestScript Row
function commentStep(){
	if($('#jqGrid tbody tr.ui-widget-content').length <= 0){
		openDialog("Comment step", "No steps to comment")
	}
	else if(($(document).find(".ui-state-highlight").length <= 0 && $('#jqGrid tbody tr.ui-widget-content').children('td:nth-child(5)').text().trim() == "") || ($(document).find(".ui-state-highlight").length == 1 && $(document).find(".ui-state-highlight").children('td:nth-child(5)').text().trim() == "")){
		openDialog("Comment step", "Empty step can not be commented.")
	}
	/*else if($(document).find(".ui-state-highlight").length > 0 && $(document).find(".ui-state-highlight").children('td:nth-child(5)').text().trim() != ""){
		var getOutputVal = $(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").text();
		if(!getOutputVal.match("##") && !getOutputVal.match(";##")){
			var myData = $("#jqGrid").jqGrid('getGridParam','data')
			var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
			selectedRowIds = selectedRowIds.sort();
			$(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").each(function() {
				var outputValLen = $(this).text().trim().length;
				var outputHashMatch = $(this).text().match("##");
				if(outputValLen == 0){
					for(i=0; i<myData.length; i++){
						if($.inArray(myData[i].stepNo, (selectedRowIds)) != -1 && (myData[i].outputVal == "")) {
							myData[i].outputVal = "##";
							$("#jqGrid").trigger("reloadGrid");
						}
						else if($.inArray(myData[i].stepNo, (selectedRowIds.map(String))) != -1 && (myData[i].outputVal == "")) {
							myData[i].outputVal = "##";
							$("#jqGrid").trigger("reloadGrid");
						}
					}
				}
				else if(outputValLen != 0 &&  outputHashMatch == null)
				{
					for(i=0; i<myData.length; i++){
						if(($.inArray(myData[i].stepNo, (selectedRowIds) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match(";##") == null && myData[i].outputVal != "##")
							{
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								$("#jqGrid").trigger("reloadGrid");
							}								
						}
						else if(($.inArray(myData[i].stepNo, (selectedRowIds.map(String)) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match(";##") == null && myData[i].outputVal != "##"){
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			});
		}
		else{
			var myData = $("#jqGrid").jqGrid('getGridParam','data')
			var selectedRowIds = $("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
			selectedRowIds = selectedRowIds.sort();
			$(document).find(".ui-state-highlight").children("td[aria-describedby='jqGrid_outputVal']").each(function() {
				var outputValLen = $(this).text().trim().length;
				var outputHashMatch = $(this).text().match("##");
				if(outputValLen != 0 &&  outputHashMatch != null)
				{
					for(i=0; i<myData.length; i++){
						if(($.inArray(myData[i].stepNo, (selectedRowIds) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length > 2)
							{
								var lastThree = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								if (lastThree == ";##")
								{
									myData[i].outputVal = 	myData[i].outputVal.replace(lastThree,"");
									$("#jqGrid").trigger("reloadGrid");
								}
							}
							else if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length == 2){
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 2);
								myData[i].outputVal = 	myData[i].outputVal.replace(lastTwo,"");
								$("#jqGrid").trigger("reloadGrid");
							}						
						}
						else if(($.inArray(myData[i].stepNo, (selectedRowIds.map(String)) ) != -1 && myData[i].outputVal != "")) {
							if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length > 2)
							{
								var lastThree = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								if (lastThree == ";##")
								{
									myData[i].outputVal = 	myData[i].outputVal.replace(lastThree,"");
									$("#jqGrid").trigger("reloadGrid");
								}
							}
							else if(myData[i].outputVal.match("##") == '##' && myData[i].outputVal.length == 2){
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 2);
								myData[i].outputVal = 	myData[i].outputVal.replace(lastTwo,"");
								$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			});
		}
	}*/
	else if($(document).find(".ui-state-highlight").length > 0){
		var myData = $("#jqGrid").jqGrid('getGridParam','data')
		$(document).find(".ui-state-highlight").each(function(){
			for(i=0; i<myData.length; i++){
				if(myData[i].stepNo == parseInt($(this).attr("id").trim())){
					//Check whether output coloumn is empty
					if(myData[i].outputVal == ""){
						myData[i].outputVal = "##";
						//$("#jqGrid").trigger("reloadGrid");
					}
					else{
						//Check whether output coloumn has some value
						if(myData[i].outputVal != "") {
							//If already commented but no additional value
							if(myData[i].outputVal == "##"){
								myData[i].outputVal = "";
								//$("#jqGrid").trigger("reloadGrid");
							}
							//If already commented and contains additional value
							else if(myData[i].outputVal.indexOf(";##") !== -1){
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								myData[i].outputVal = myData[i].outputVal.replace(lastTwo,"");
								//$("#jqGrid").trigger("reloadGrid");
							}
							//If contains value but not commented
							else{
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								//$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			}
		});
		$("#jqGrid").trigger("reloadGrid");
	}
	else{
		openDialog("Skip Testcase step", "Please select step to skip")
	}
}

function shortString() {
	var shorts = document.querySelectorAll('.ellipsisText');
	if (shorts) {
		Array.prototype.forEach.call(shorts, function(ele) {
			var str = ele.innerText,
			indt = '...';

			if (ele.hasAttribute('data-limit')) {
				if (str.length > ele.dataset.limit) {
					//var result = `${str.substring(0, ele.dataset.limit - indt.length).trim()}${indt}`;
					var result = str.substring(0, ele.dataset.limit - indt.length).trim().concat(indt);
					ele.innerText = result;
					str = null;
					result = null;
				}
			} else {
				throw Error('Cannot find attribute \'data-limit\'');
			}
		});
	}
}

function getTags(data) {
	var obnames = [];
	var appTypeLocal = JSON.parse(window.localStorage['_CT']).appType;
		if(appTypeLocal == "Web"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Custom");
			obnames.push("@Browser");
			obnames.push("@BrowserPopUp");
		}
		else if(appTypeLocal == "Webservice"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("WebService List");
		}
		else if(appTypeLocal == "Mainframe"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("Mainframe List");
		}
		else if(appTypeLocal == "Desktop"){
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Window");
			obnames.push("@Custom");
			obnames.push("@Email");
		}
		else if(appTypeLocal == "DesktopJava")	{
			obnames.push("@Generic");
			obnames.push("@Excel");
			obnames.push("@Oebs");
			obnames.push("@Custom");
		}
		else if(appTypeLocal == "MobileApp")	{
			obnames.push("@Generic");
			obnames.push("@Mobile");
			obnames.push("@Action");
		}
		else if(appTypeLocal == "MobileWeb")	{
			obnames.push("@Generic");
			obnames.push("@Browser");
			obnames.push("@BrowserPopUp");
			obnames.push("@Action");
		}
		else if(appTypeLocal == "MobileApp")	{
			obnames.push("@Generic");
			obnames.push("@MobileiOS");
		}
		else if(appTypeLocal == "SAP")	{
			obnames.push("@Generic");
			obnames.push("@Sap");
			obnames.push("@Custom");
		}
	for (var i=0; i<data.length; i++){
		obnames.push(data[i].custname);
	}
	return obnames;
}

function getKeywordList(data) {
	var arr = Object.keys(data.defaultList);
	var keywordList = [];
	for (var i=0; i<arr.length; i++){
		keywordList.push(arr[i]);
	}
	return keywordList;
}
//Map Object Drag nad Drop Functionality
function allowDrop(ev) {
	ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.innerHTML);
    draggedEle = ev.currentTarget;
}

function drop(ev) {
	//Enable-Disable dragged element based on drop event
	draggedEle.setAttribute("draggable", false)
	draggedEle.childNodes[1].style.background = "#e0e0e0";
	draggedEle.childNodes[1].style.cursor = "no-drop"
	//Enable-Disable dragged element based on drop event	
	$(".submitObjectWarning").hide();	
	if($(ev.target).parent().children(".ellipsis").hasClass("fromMergeObj") == true){
		draggedEle.setAttribute("draggable", true)
		draggedEle.childNodes[1].style.background = "";
		draggedEle.childNodes[1].style.cursor = "pointer";
		$(".objectExistMap").show();
		return false
	}
	else{
		$(".objectExistMap").hide()
		getDraggedEle = ev.dataTransfer.getData("text/plain").trim()
		getDraggedEle = $(getDraggedEle)[1];
		$(getDraggedEle).addClass("fromMergeObj");
		$(ev.target).parent("li").addClass("valueMerged");
		$(ev.target).parent("li").find(".ellipsis").hide().addClass("toMergeObj");
		$(ev.target).parent("li").find(".showPreviousVal").show()
		$(ev.target).parent("li").append(getDraggedEle);
	}
	ev.preventDefault();
}
//Map Object Drag nad Drop Functionality

//XML Beatuifier
function formatXml(xml) {
	var formatted = '';
	var reg = /(>)(<)(\/*)/g;
	xml = xml.replace(reg, '$1\r\n$2$3');
	var pad = 0;
	jQuery.each(xml.split('\r\n'), function(index, node){
		var indent = 0;
		if (node.match( /.+<\/\w[^>]*>$/ ))
		{
			indent = 0;
		}
		else if (node.match( /^<\/\w/ ))
		{
			if (pad != 0)
			{
				pad -= 1;
			}
		}
		else if (node.match( /^<\w[^>]*[^\/]>.*$/ ))
		{
			indent = 1;
		}
		else
		{
			indent = 0;
		}
		var padding = '';
		for (var i = 0; i < pad; i++)
		{
			padding += '  ';
		}
		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted;
}

function openDialog(title, body){
	$("#globalModal").find('.modal-title').text(title);
    $("#globalModal").find('.modal-body p').text(body).css('color','black');
	$("#globalModal").modal("show");
	setTimeout(function(){
		$("#globalModal").find('.btn-default').focus();					
	}, 300);
}
//XML Beatuifier
