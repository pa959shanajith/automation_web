var screenshotObj, scrapedGlobJson, enableScreenShotHighlight, mirrorObj, eaCheckbox, finalViewString, scrapedData, deleteFlag, globalSelectedBrowserType, selectedKeywordList, keywordListData, dependentTestCaseFlag = false;
checkedTestcases = [];
pasteSelecteStepNo = [];
var initScraping = {};
var mirrorObj = {};
var scrapeTypeObj = {};
var newScrapedList;
var viewString = {};
var scrapeObject = {};
var screenViewObject = {};
var readTestCaseData;
var getRowJsonCopy;
var selectRowStepNoFlag = false; //var deleteStep = false;
var dataFormat12, getScrapeDataforCustomObj, deleteScrapeDataservice = true;
var getAllAppendedObj; //Getting all appended scraped objects
var gsElement = [];
window.localStorage['selectRowStepNo'] = '';
window.localStorage['_modified'] = "";
var getWSTemplateData = {} //Contains Webservice saved data
var appType, projectId, projectDetails, screenName, testCaseName, subTaskType, subTask, draggedEle, getDraggedEle, allTasks;
var updatedViewString = {};
var allScreenNames = [];
var reusedScreens = [];
var reusedScreenNames = false;
var noSave = "false";
var allScreenTestcaseNames = [];
var reusedScreensTestcase = [];
var reusedScreenTestcaseNames = false;
var allTestcases = [];
var reusedTestcases = [];
var modifiednames = [];
var reusedTestcaseNames = false;
var noSaveTestcase = "false";
var saveFlag = '';
var copiedViewstring = false;
var getIndexOfDeletedObjects = [];
var newScrapedData;
var saveScrapeDataFlag = false;
var deleteObjectsFlag = false;
var certObj={};
var scrape_data = '';
window.localStorage['disableEditing'] = "false";
mySPA.controller('designController', ['$scope', '$rootScope', '$http', '$location', '$timeout', 'DesignServices', 'mindmapServices', 'cfpLoadingBar', '$window', 'socket', function ($scope, $rootScope, $http, $location, $timeout, DesignServices, mindmapServices, cfpLoadingBar, $window, socket) {
	$rootScope.compareFlag = false;
	$("body").css("background", "#eee");
	$("#tableActionButtons, .designTableDnd").delay(500).animate({
		opacity: "1"
	}, 500);
	$timeout(function () {
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		if (navigator.appVersion.indexOf("Mac") != -1) {
			$(".safariBrowser").show();
		}

	}, 500)

	// if($("#compareChangedObjectsBox").is(":visible") == true)
	// {
	//	$("#viewscrapedObjects").show();
	// }
	// else{
	//	 $("#viewscrapedObjects").hide();
	// }

	//Task Listing
	loadUserTasks()
	var taskAuth = false;
	if (window.localStorage['navigateScreen'] == "Scrape" && window.localStorage['navigateScrape'] == "true" && window.location.href.split("/")[3] == "design") {
		taskAuth = true;
		window.localStorage['navigateTestcase'] = false;
	} else if (window.localStorage['navigateScreen'] == "TestCase" && window.localStorage['navigateTestcase'] == "true" && window.location.href.split("/")[3] == "designTestCase") {
		taskAuth = true;
		window.localStorage['navigateScrape'] = false;
	}
	if (taskAuth == false) {
		return $rootScope.redirectPage();
	}
	//Default Function to reset all input, select
	$scope.resetTextFields = function () {
		$("input").val('');
		$("select").prop('selectedIndex', 0);
		$(".addObj-row").find("input").removeClass('inputErrorBorder')
		$(".addObj-row").find("select").removeClass('selectErrorBorder')
		$scope.errorMessage = "";
	}
	//Default Function to reset all input, select
	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openDialog("Debug Testcase", $rootScope.unavailableLocalServer_msg);
	});
	var current_task = JSON.parse(window.localStorage['_CT']);
	var getTaskName = current_task.taskName;
	appType = current_task.appType;
	screenName = current_task.screenName;
	testCaseName = current_task.testCaseName;
	subTaskType = current_task.subTaskType;
	subTask = current_task.subtask;
	status = current_task.status;
	if (status == 'underReview') {
		$('.submitTaskBtn').text('Approve');
		$('.reassignTaskBtn').show();
	}

	$("#page-taskName").empty().append('<span class="taskname">' + getTaskName + '</span>');
	$(".projectInfoWrap").empty()
	//Loading Project Info

	//Getting Apptype or Screen Type
	if (appType != "Web" && window.location.href.split("/")[3] == "design") {
		$("#left-bottom-section").hide();
	}
	if (appType == "Webservice" && window.location.href.split("/")[3] == "designTestCase") {
		$("#right-dependencies-section .thumbnail:first-child").hide();
	}
	//console.log(appType);
	$scope.getScreenView = appType
	$scope.isMac =  navigator.userAgent.indexOf('Mac');
	//Getting Apptype orScreen Type
	cfpLoadingBar.start()
	$timeout(function () {
		if (window.location.href.split("/")[3] == "designTestCase" || $scope.getScreenView == "Webservice" && window.location.href.split("/")[3] == "designTestCase") {
			angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
		} else if (window.location.href.split("/")[3] == "design" && $scope.getScreenView != "Webservice") {
			angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
		}
		if ($scope.getScreenView == "Webservice" && window.location.href.split("/")[3] != "designTestCase") {
			angular.element(document.getElementById("left-nav-section")).scope().getWSData();
		}
		cfpLoadingBar.complete()
	}, 1500)


	$timeout(function () {
		// projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		// releaseName = angular.element(document.getElementById("left-nav-section")).scope().releaseDetails;
		// cycleName = angular.element(document.getElementById("left-nav-section")).scope().cycleDetails;
		// var getTaskName = JSON.parse(window.localStorage['_CT']).taskName;
		// appType = JSON.parse(window.localStorage['_CT']).appType;
		// screenName = angular.element(document.getElementById("left-nav-section")).scope().screenName;
		// testCaseName = JSON.parse(window.localStorage['_CT']).testCaseName;
		// subTaskType = JSON.parse(window.localStorage['_CT']).subTaskType;
		// subTask = JSON.parse(window.localStorage['_CT']).subTask;
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var filterData = JSON.parse(window.localStorage['_FD']);
		if (taskInfo.subTaskType == "Scrape" || taskInfo.subTask == "Scrape") {
			$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">' + filterData.idnamemapprj[taskInfo.projectId] + '</span></p><p class="proj-info-wrap"><span class="content-label">Screen :</span><span class="content">' + taskInfo.screenName + '</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">' + filterData.idnamemaprel[taskInfo.releaseid] + '</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">' + filterData.idnamemapcyc[taskInfo.cycleid] + '</span></p>')
		} else {
			$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project: </span><span class="content">' + filterData.idnamemapprj[taskInfo.projectId] + '</span></p><p class="proj-info-wrap"><span class="content-label">Screen: </span><span class="content">' + taskInfo.screenName + '</span></p><p class="proj-info-wrap"><span class="content-label">TestCase: </span><span class="content">' + taskInfo.testCaseName + '</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">' + filterData.idnamemaprel[taskInfo.releaseid] + '</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">' + filterData.idnamemapcyc[taskInfo.cycleid] + '</span></p>')
		}

	}, 3000)

	//console.log("screenName:", screenName);
	// if (window.localStorage['_TJ']) {
	//	 allTasks = JSON.parse(window.localStorage['_TJ']);
	//	 if(allTasks.length > 0)
	//	 {
	//			 allTasks =  allTasks.filter(function(n){
	//				 return n.appType === appType
	//			 });
	//	 }

	//	 for (var i = 0; i < allTasks.length; i++) {
	//		 //Screen with no testcases
	//		 if (allTasks[i].screenName != "" && allTasks[i].testCaseId == "") {
	//			 allScreenNames.push(allTasks[i].screenName);
	//		 }
	//		 //screen with testcases
	//		 if (allTasks[i].screenName != "" && allTasks[i].testCaseId != "") {
	//			 allScreenTestcaseNames.push(allTasks[i].screenName);
	//		 }
	//		 //testcases
	//		 if (allTasks[i].testCaseName != "" && allTasks[i].testCaseId != "") {
	//			 allTestcases.push(allTasks[i].testCaseName);
	//		 }
	//	 }
	//	 var sorted_screens = allScreenNames.slice().sort();
	//	 for (var i = 0; i < allScreenNames.length - 1; i++) {
	//		 if (sorted_screens[i + 1] == sorted_screens[i]) {
	//			 reusedScreens.push(sorted_screens[i]);
	//		 }
	//	 }
	//	 var sorted_screensTestcase = allScreenTestcaseNames.slice().sort();
	//	 for (var i = 0; i < allScreenTestcaseNames.length - 1; i++) {
	//		 if (sorted_screensTestcase[i + 1] == sorted_screensTestcase[i]) {
	//			 reusedScreensTestcase.push(sorted_screensTestcase[i]);
	//		 }
	//	 }
	//	 var sorted_testcases = allTestcases.slice().sort();
	//	 for (var i = 0; i < allTestcases.length - 1; i++) {
	//		 if (sorted_testcases[i + 1] == sorted_testcases[i]) {
	//			 reusedTestcases.push(sorted_testcases[i]);
	//		 }
	//	 }
	//	 //console.log("reusedScreens",reusedScreens);
	//	 //console.log("reusedScreensTestcase",reusedScreensTestcase);
	//	 //console.log("reusedTestcases", reusedTestcases);
	//	 if (reusedScreens.length > 0) {
	//		 for (var j = 0; j < reusedScreens.length; j++) {
	//			 if ($.trim(reusedScreens[j]) == $.trim(screenName)) {
	//				 reusedScreenNames = true;
	//			 }
	//		 }
	//	 }
	//	 if (reusedScreens.length > 0) {
	//		 for (var j = 0; j < reusedScreensTestcase.length; j++) {
	//			 if ($.trim(reusedScreensTestcase[j]) == $.trim(screenName)) {
	//				 reusedScreenTestcaseNames = true;
	//			 }
	//		 }
	//	 }
	//	 if (reusedTestcases.length > 0) {
	//		 for (var j = 0; j < reusedTestcases.length; j++) {
	//			 if ($.trim(reusedTestcases[j]) == $.trim(testCaseName)) {
	//				 reusedTestcaseNames = true;
	//			 }
	//		 }
	//	 }
	// }

	var custnameArr = [];
	var keywordValArr = [];
	var proceed = false;

	//Submit Task Screen
	$scope.submitTasksScreen = function (action) {
		$("#submitTasksScreen").modal("show")
		if (action == 'reassign') {
			$scope.stask = 'reassign';
			$("#submitTasksScreen").find('.modal-title').text('Reassign Task');
			$("#submitTasksScreen").find('.modal-body p').text('Are you sure you want to reassign the task ?')
			//$("#submitTasksScreen").find('.modal-footer button')[0].setAttribute('ng-click',"submit_task('reassign')")
		}
		if (action == 'submit' && $(".submitTaskBtn:visible").text() == 'Approve') {
			$scope.stask = 'approve';
			$("#submitTasksScreen").find('.modal-title').text('Approve Task');
			$("#submitTasksScreen").find('.modal-body p').text('Are you sure you want to approve the task ?')
		}
		// else{
		//	 $("#submitTasksScreen").find('.modal-footer button')[0].setAttribute('onclick',"submit_task('"+action+"')")
		// }

	}
	//Submit Task Screen

	//Submit Tast Test Case
	$scope.submitTasksTestCase = function (action) {

		$("#submitTasksTestCase").modal("show")
		if (action == 'reassign') {
			$scope.stask = 'reassign';
			$("#submitTasksTestCase").find('.modal-title').text('Reassign Task');
			$("#submitTasksTestCase").find('.modal-body p').text('Are you sure you want to reassign the task ?')
			//$("#submitTasksTestCase").find('.modal-footer button')[0].setAttribute('ng-click',"submit_task('reassign')")
		}
		if (action == 'submit' && $(".submitTaskBtn:visible").text() == 'Approve') {
			$scope.stask = 'approve';
			$("#submitTasksTestCase").find('.modal-title').text('Approve Task');
			$("#submitTasksTestCase").find('.modal-body p').text('Are you sure you want to approve the task ?')
		}
		// else{
		//	 $("#submitTasksTestCase").find('.modal-footer button')[0].setAttribute('onclick',"submit_task('"+action+"')")
		// }

	}
	//Submit task Test Case

	$scope.readTestCase_ICE = function () {
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var versionnumber = taskInfo.versionnumber;
		appType = taskInfo.appType;
		enabledEdit = "false";
		blockUI("Loading...");
		// service call # 1 - getTestScriptData service call
		DesignServices.readTestCase_ICE(testCaseId, testCaseName, versionnumber, screenName)
			.then(function (data) {
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				if(data.screenName){
					taskObj = JSON.parse(window.localStorage['_CT']);
					screenName = data.screenName;
					taskObj.screenName = data.screenName;
					window.localStorage['_CT'] = JSON.stringify(taskObj);
				}
				if(data.del_flag){
					//pop up for presence of deleted objects
					openDialog("Deleted objects found", "Deleted objects found in some teststeps, Please delete or modify those steps.");
					//disable left-top-section
					$("#left-top-section").addClass('disableActions');
					$("a[title='Export TestCase']").addClass('disableActions');
				}
				else{
					//enable left-top-section
					$("#left-top-section").removeClass('disableActions');
					$("a[title='Export TestCase']").removeClass('disableActions');
				}
				//console.log(data);
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
					.then(function (data2) {
						if (data2 == "Invalid Session") {
							return $rootScope.redirectPage();
						}
						if (appType == "Webservice"){
							if (data2.view.length > 0) dataFormat12 = data2.view[0].header[0].split("##").join("\n");
						}
						custnameArr.length = 0;
						// counter to append the items @ correct indexes of custnameArr
						var indexCounter = '';
						//window.localStorage['newTestScriptDataList'] = data2.view;
						$scope.newTestScriptDataLS = data2.view;
						getScrapeDataforCustomObj = data2.view;
						$("#window-scrape-screenshotTs .popupContent").empty()
						if (data2.mirror == undefined)
							$("#window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrapeTS">No Screenshot Available</div>')
						else{
							if(data2.scrapetype=='caa')
								$("#window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrapeTS"><img id="screenshotTS" src="data:image/PNG;base64,' + data2.mirror.substring(2,data2.mirror.length-1) + '" /></div>')
							else
								$("#window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrapeTS"><img id="screenshotTS" src="data:image/PNG;base64,' + data2.mirror + '" /></div>')
						}	
						// service call # 3 -objectType service call
						DesignServices.getKeywordDetails_ICE(appType)
							.then(function (data3) {
								if (data3 == "Invalid Session") {
									return $rootScope.redirectPage();
								}
								keywordValArr.length = 0;
								keywordListData = angular.toJson(data3);
								var emptyStr = "{}";
								if (data == "" || data == null || data == emptyStr || data == "[]" || data.testcase.toString() == "" || data.testcase == "[]") {
									var appTypeLocal1 = "Generic";
									var datalist = [{
										"stepNo": "1",
										"custname": "",
										"objectName": "",
										"keywordVal": "",
										"inputVal": "",
										"outputVal": "",
										"url": "",
										"_id_": "",
										"appType": appTypeLocal1,
										"remarksStatus": "",
										"remarks": "",
										"addTestCaseDetails": "",
										"addTestCaseDetailsInfo": ""
									}];
									readTestCaseData = JSON.stringify(datalist);
									$("#jqGrid").jqGrid('GridUnload');
									$("#jqGrid").trigger("reloadGrid");
									contentTable(data2.view);
									$('.cbox').prop('disabled', false);
									$('.cbox').parent().removeClass('disable_a_href');
									return;
								} else {
									var testcase = data.testcase;//JSON.parse(data.testcase);
									var testcaseArray = [];
									for (var i = 0; i < testcase.length; i++) {
										if ("comments" in testcase[i]) {
											delete testcase[i];
											testcase = testcase.filter(function (n) {
												return n != null
											});
										} else {
											if (appType == "Webservice") {
												if (testcase[i].keywordVal == "setHeader" || testcase[i].keywordVal == "setHeaderTemplate") {
													testcase[i].inputVal[0] = testcase[i].inputVal[0].split("##").join("\n")
												}
											}
											testcase[i].stepNo = (i + 1).toString();
											testcaseArray.push(testcase[i]);
										}
									}
									//  console.log("readTestCase:::", testcaseArray)

									readTestCaseData = JSON.stringify(testcaseArray)
									$("#jqGrid_addNewTestScript").jqGrid('clearGridData');
									$("#jqGrid").jqGrid('GridUnload');
									$("#jqGrid").trigger("reloadGrid");
									contentTable(data2.view);
									$('.cbox').prop('disabled', false);
									$('.cbox').parent().removeClass('disable_a_href');
									return;
								}
							},
							function (error) {
								console.log("Error in designController.js file getObjectType method! \r\n " + (error.data));
							}); //	getObjectType end
						unblockUI();
					},
					function (error) {
						console.log("Error in designController.js file getObjectType method! \r\n " + (error.data));
					}); //	getScrapeData end
			},
			function (error) {
				console.log("Error in designController.js file getTestScriptData method! \r\n " + (error.data));
			});

	}; //	getTestScriptData end

	// browser icon clicked
	$scope.debugTestCase_ICE = function (selectedBrowserType, e) {
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var testcaseID = [];
		var browserType = [];
		browserType.push(selectedBrowserType)
		if (appType == "MobileWeb" || appType == "Mainframe") browserType = [];
		globalSelectedBrowserType = selectedBrowserType;

		if (dependentTestCaseFlag == true) {
			testcaseID = checkedTestcases;
		} else {
			testcaseID.push(taskInfo.testCaseId);
		}

		var blockMsg = 'Debug in Progress. Please Wait...';
		blockUI(blockMsg);
		$rootScope.resetSession.start();
		DesignServices.debugTestCase_ICE(browserType, testcaseID, appType)
			.then(function (data) {
				unblockUI();
				$rootScope.resetSession.end();
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				} else if (data == "unavailableLocalServer") {
					openDialog("Debug Testcase", $rootScope.unavailableLocalServer_msg)
				} else if (data == "success") {
					openDialog("Debug Testcase", "Debug completed successfully.")
				} else if (data == "fail") {
					openDialog("Debug Testcase", "Failed to debug.")
				} else if (data == "Terminate") {
					openDialog("Debug Testcase", "Debug Terminated")
				} else if (data == "browserUnavailable") {
					openDialog("Debug Testcase", "Browser is not available")
				} else if (data == "scheduleModeOn") {
					openDialog("Debug Testcase", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.")
				} else if (data == "ExecutionOnlyAllowed") {
					openDialog("Debug Testcase", "Execution Only Allowed")   
				} else if (data.status == "success"){
					rows={}
					$('tr.ui-widget-content.jqgrow.ui-row-ltr.ui-sortable-handle').each(function () {
						if($(this)[0].id in data){
							$('#jqGrid').jqGrid('setCell', $(this)[0].id, 'objectName', data[$(this)[0].id].xpath);
							// $(this).children()[3].title=data[$(this)[0].id].xpath
							rows[$(this)[0].childNodes[4].innerText]=data[$(this)[0].id].xpath
							// $(this).children()[3].innerText=
							console.log($(this));
						}
					});
					localStorage['_modified']=JSON.stringify(rows)
					openDialog("Debug Testcase", "Debug completed successfully.")
				}
				//Transaction Activity for DebugTestCase
				// var labelArr = [];
				// var infoArr = [];
				// infoArr.push({"appType" : appType});
				// infoArr.push({"status" : data});
				// labelArr.push(txnHistory.codesDict['DebugTestCase']);
				// txnHistory.log(e.type,labelArr,infoArr,$location.$$path); 										
			}, function (error) {
				unblockUI();
				$rootScope.resetSession.end();
				openDialog("Debug Testcase", "Failed to debug.");
				console.log("Error while traversing while executing debugTestcase method!! \r\n " + (error.data));
			});
	}; // browser invocation ends
	
	//Submit cert data WS
	$scope.showWSAuthPopup = function(){
		$('#WSglobalModal').modal('show');
	}
	
	$scope.submitCertObject = function($event) {
		certObj.certsDetails = $("#importCertificate").val()+";;"+$('#getPassData').val();
		certObj.authDetails =  $('#getAuthUserName').val()+";"+$('#getAuthUserPassword').val();	
	   // $("#WSglobalModal").modal('hide');
	   //$('.validateCert').removeClass('validateCert');
		$(document).on('shown.bs.modal', '#WSglobalModal', function () {
			$('.validateCert').removeClass('validateCert');
		});
		var impCert = $("#importCertificate").val();
		if(impCert == "")
		{
			$('#importCertificate').addClass('validateCert');
			$('#WSglobalModal').modal('show')
			return false;
		} else{
			$('.close:visible').trigger('click');
		}
		if(certObj.certsDetails == ""){
			certObj = '';
			openDialog("Certificate", "Failed to save certificate");
		}else{
			openDialog("Certificate", "Certificate Saved successfully");
		}
	}
	//Submit cert data WS End
	//Import Test case
	$scope.importTestCase = function ($event) {
		var counter1 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var versionnumber = taskInfo.versionnumber;
		var testCaseName = taskInfo.testCaseName;
		var appType = taskInfo.appType;
		var import_status = true;
		var flag = false;
		var defaultTestScript = '[{"stepNo":"1","custname":"","objectName":"","keywordVal":"","inputVal":"","outputVal":"","url":"","_id_":"","appType":"Generic"}]';
		if (readTestCaseData == defaultTestScript) {
			$("#importTestCaseFile").attr("type", "file");
			$("#importTestCaseFile").trigger("click");
			importTestCaseFile.addEventListener('change', function (e) {
				if (counter1 == 0) {
					// Put the rest of the demo code here.
					var file = importTestCaseFile.files[0];
					var textType = /json.*/;
					var reader = new FileReader();
					reader.onload = function (e) {
						if ((file.name.split('.')[file.name.split('.').length - 1]).toLowerCase() == "json") {
							var resultString = JSON.parse(reader.result);
							//var resultString = reader.result;
							for (i = 0; i < resultString.length; i++) {
								if (resultString[i].appType.toLowerCase() == "generic" || resultString[i].appType.toLowerCase() == "pdf") {
									flag = true;
								} else if (resultString[i].appType == appType) {
									flag = true;
									break;
								} else {
									flag = false;
									break;
								}
							}
							if (flag == false) {
								openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
							} else {
								DesignServices.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, versionnumber, import_status)
									.then(function (data) {
										if (data == "Invalid Session") {
											return $rootScope.redirectPage();
										}
										if (data == "success") {
											angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
											openDialog("Import Testcase", "TestCase Json imported successfully.");
											//Transaction Activity for Import Testcase Button Action
											// var labelArr = [];
											// var infoArr = [];
											// labelArr.push(txnHistory.codesDict['ImportTestCase']);
											// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);	
										} else {
											openDialog("Import Testcase", "Please Check the file format you have uploaded!")
										}
									}, function (error) { });
							}
						} else {
							openDialog("Import Testcase", "Please Check the file format you have uploaded!")
						}
					}
					reader.readAsText(file);
					counter1 = 1;
					$("#importTestCaseFile").val('');
				}
			});
		} else {
			$("#fileInputJson").removeAttr("type", "file");
			$("#fileInputJson").attr("type", "text");
			$("#globalModalYesNo").find('.modal-title').text("Table Consists of Data");
			$("#globalModalYesNo").find('.modal-body p').text("Import will erase your old data. Do you want to continue??").css('color', 'black');
			$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id", "btnImportEmptyErrorYes")
			$("#globalModalYesNo").modal("show");
		}
	}

	$(document).on('click', '#btnImportEmptyErrorYes', function () {
		$("#globalModalYesNo").modal("hide");
		var counter2 = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var versionnumber = taskInfo.versionnumber;
		var appType = taskInfo.appType;
		var import_status = true;
		var flag = false;
		$("#overWriteJson").trigger("click");
		overWriteJson.addEventListener('change', function (e) {
			if (counter2 == 0) {
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				reader.onload = function (e) {
					if ((file.name.split('.')[file.name.split('.').length - 1]).toLowerCase() == "json") {
						var resultString = JSON.parse(reader.result);
						for (i = 0; i < resultString.length; i++) {
							if (resultString[i].appType.toLowerCase() == "generic") {
								flag = true;
							} else if (resultString[i].appType == appType) {
								flag = true;
								break;
							} else {
								flag = false;
								break;
							}
						}
						if (flag == false) {
							openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
						} else {
							DesignServices.updateTestCase_ICE(testCaseId, testCaseName, resultString, userInfo, versionnumber, import_status)
								.then(function (data) {
									// console.log("hello");
									if (data == "Invalid Session") {
										return $rootScope.redirectPage();
									}
									if (data == "success") {
										angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
										openDialog("Import Testcase", "TestCase Json imported successfully.");
									} else {
										openDialog("Import Testcase", "Please Check the file format you have uploaded!")
									}
								}, function (error) { });
						}
					} else {
						openDialog("Import Testcase", "Please Check the file format you have uploaded!")
					}
				}

				reader.readAsText(file);
				counter2 = 1;
				$("#overWriteJson").val('');
			}
		});
	})

	$("#overWriteJson").on("click", function (e) {
		angular.element(document.getElementById("left-bottom-section")).scope().importTestCase1(e);
	})
	//Import Testcase1
	$scope.importTestCase1 = function ($event) {
		var counter = 0;
		var userInfo = JSON.parse(window.localStorage['_UI']);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var versionnumber = taskInfo.versionnumber;
		var appType = taskInfo.appType;
		var import_status = true;
		var flag = false;
		overWriteJson.addEventListener('change', function (e) {
			if (counter == 0) {
				// Put the rest of the demo code here.
				var file = overWriteJson.files[0];
				var textType = /json.*/;
				var reader = new FileReader();
				if ((file.name.split('.')[file.name.split('.').length - 1]).toLowerCase() == "json") {
					reader.onload = function (e) {
						var resultString = JSON.parse(reader.result);
						for (i = 0; i < resultString.length; i++) {
							if (resultString[i].appType.toLowerCase() == "generic" || resultString[i].appType.toLowerCase() == "pdf") {
								flag = true;
							}
							else if (resultString[i].appType == appType) {
								flag = true;
								break;
							} else {
								flag = false;
								break;
							}
						}
						if (flag == false) {
							openDialog("App Type Error", "Project application type and Imported JSON application type doesn't match, please check!!")
						} else {
							DesignServices.updateTestCase_ICE( testCaseId, testCaseName, resultString, userInfo, versionnumber, import_status)
								.then(function (data) {
									if (data == "Invalid Session") {
										return $rootScope.redirectPage();
									}
									if (data == "success") {
										angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
										openDialog("Import Testcase", "TestCase Json imported successfully.");
										//Transaction Activity for Import Testcase Button Action
										// var labelArr = [];
										// var infoArr = [];
										// labelArr.push(txnHistory.codesDict['ImportTestCase']);
										// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);
									} else {
										openDialog("Import Testcase", "Please Check the file format you have uploaded!")
									}
								}, function (error) { });
						}
					}
					reader.readAsText(file);
					$("#overWriteJson").val('');
				} else {
					openDialog("Import Testcase", "Please Check the file format you have uploaded!")
				}
				counter = 1;
			}
		});
	}
	//Import Test case

	//Export Test case
	$scope.exportTestCase = function ($event) {
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var screenId = taskInfo.screenId;
		var testCaseId = taskInfo.testCaseId;
		var testCaseName = taskInfo.testCaseName;
		var versionnumber = taskInfo.versionnumber;
		DesignServices.readTestCase_ICE(testCaseId, testCaseName, versionnumber)
			.then(function (response) {
				if (response == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				var temp, responseData;
				if (typeof response === 'object') {
					temp = response.testcase;//JSON.parse(response.testcase);
					responseData = JSON.stringify(temp, undefined, 2);
				}
				filename = testCaseName + ".json";
				var objAgent = $window.navigator.userAgent;
				var objbrowserName = navigator.appName;
				var objfullVersion = '' + parseFloat(navigator.appVersion);
				var objBrMajorVersion = parseInt(navigator.appVersion, 10);
				var objOffsetName, objOffsetVersion, ix;
				// In Chrome
				if ((objOffsetVersion = objAgent.indexOf("Chrome")) != -1) {
					objbrowserName = "Chrome";
					objfullVersion = objAgent.substring(objOffsetVersion + 7);
				}
				// In Microsoft internet explorer
				else if ((objOffsetVersion = objAgent.indexOf("MSIE")) != -1) {
					objbrowserName = "Microsoft Internet Explorer";
					objfullVersion = objAgent.substring(objOffsetVersion + 5);
				}
				// In Firefox
				else if ((objOffsetVersion = objAgent.indexOf("Firefox")) != -1) {
					objbrowserName = "Firefox";

				}
				// In Safari
				else if ((objOffsetVersion = objAgent.indexOf("Safari")) != -1) {
					objbrowserName = "Safari";
					objfullVersion = objAgent.substring(objOffsetVersion + 7);
					if ((objOffsetVersion = objAgent.indexOf("Version")) != -1)
						objfullVersion = objAgent.substring(objOffsetVersion + 8);
				}
				// For other browser "name/version" is at the end of userAgent
				else if ((objOffsetName = objAgent.lastIndexOf(' ') + 1) < (objOffsetVersion = objAgent.lastIndexOf('/'))) {
					objbrowserName = objAgent.substring(objOffsetName, objOffsetVersion);
					objfullVersion = objAgent.substring(objOffsetVersion + 1);
					if (objbrowserName.toLowerCase() == objbrowserName.toUpperCase()) {
						objbrowserName = navigator.appName;
					}
				}
				// trimming the fullVersion string at semicolon/space if present
				if ((ix = objfullVersion.indexOf(";")) != -1) objfullVersion = objfullVersion.substring(0, ix);
				if ((ix = objfullVersion.indexOf(" ")) != -1) objfullVersion = objfullVersion.substring(0, ix);
				objBrMajorVersion = parseInt('' + objfullVersion, 10);
				if (isNaN(objBrMajorVersion)) {
					objfullVersion = '' + parseFloat(navigator.appVersion);
					objBrMajorVersion = parseInt(navigator.appVersion, 10);
				}
				if (objBrMajorVersion == "9") {
					if (objbrowserName == "Microsoft Internet Explorer") {
						window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
							type: "text/json;charset=utf-8"
						}), filename);
					}
				} else {
					var blob = new Blob([responseData], {
						type: 'text/json'
					}),
						e = document.createEvent('MouseEvents'),
						a = document.createElement('a');
					a.download = filename;
					if (objbrowserName == "Microsoft Internet Explorer" || objbrowserName == "Netscape") {
						window.navigator.msSaveOrOpenBlob(new Blob([responseData], {
							type: "text/json;charset=utf-8"
						}), filename);
					} else {
						a.href = window.URL.createObjectURL(blob);
						a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
						e.initMouseEvent('click', true, true, window,
							0, 0, 0, 0, 0, false, false, false, false, 0, null);
						a.dispatchEvent(e);
					}
				}
				//Transaction Activity for Export Testcase Button Action
				//  var labelArr = [];
				//  var infoArr = [];
				//  labelArr.push(txnHistory.codesDict['ExportTestCase']);
				//  txnHistory.log($event.type,labelArr,infoArr,$location.$$path); 
			},
			function (error) { });
	}
	//Export Test Case

	//Enable Append Checkbox (if after checking the, browser doesn't enables)
	$(document).on("click", "#enableAppend", function () {
		if ($(this).is(":checked") == true) {
			$.each($(this).parents("ul").children("li"), function () {
				if ($(this).find("a").hasClass("disableActions") == true) {
					$(this).find("a").addClass("enableActions").removeClass("disableActions")
				}
			})
		$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');			
		}
		else{
			var objectsLength = $('span.ellipsis').length;
			if(objectsLength == 0)
			{
				$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');													 
			}
			else{
				$("li.compareObjects").removeClass('disableActions compareObjectDisable').addClass('enableActions');																	 
			}
		}
	})
	//Enable Append Checkbox (if after checking the, browser doesn't enables)

	//Populating Saved Scrape Data
	$scope.getScrapeData = function () {
		blockUI("Loading...");
		$('.scrollbar-compare').hide();
		//window.localStorage['_modified'] = "";
		modifiednames = [];
		$("#enableAppend").prop("checked", false)
		window.localStorage['checkEditWorking'] = "false";
		if ($("#finalScrap").find("#scrapTree").length == 0) {
			$(".disableActions").addClass("enableActions").removeClass("disableActions");
			$("#enableAppend").prop("disabled", true).css('cursor', 'no-drop')
		} else {
			$(".enableActions").addClass("disableActions").removeClass("enableActions").parent('li').css('cursor', 'not-allowed');
			$("#enableAppend").prop("disabled", false).css('cursor', 'pointer')
		}
	  
		//enableScreenShotHighlight = true;
		DesignServices.getScrapeDataScreenLevel_ICE()
			.then(function (data) {
			    localStorage['_cust']=JSON.stringify({})
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				var objectsLength = $("ellipsis:visible").length;
			
				if(objectsLength == 0)
				{
					$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');
					$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');
				}
			   
				gsElement = [];
				$(".popupWrap").animate({
					opacity: 0,
					right: "70px"
				}, 100).css({
					'z-index': '0',
					'pointer-events': 'none'
				});
				$(".filterObjects").removeClass("popupContent-filter-active").addClass("popupContent-default");
				$(".thumb-ic").removeClass("thumb-ic-highlight");

				if (data != null && data != "getScrapeData Fail." && data != "" && data != " ") {

					viewString = data;

					newScrapedList = viewString
					$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").empty()
					if(viewString.scrapetype=='caa')
						$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,' + viewString.mirror.substring(2,viewString.mirror.length-1) + '" /></div>')
					else
						$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,' + viewString.mirror + '" /></div>')
					$("#finalScrap").empty()
					if (jQuery.isEmptyObject(viewString)) {
						console.log("Data is Empty");
						$(".disableActions").addClass("enableActions").removeClass("disableActions");
						$("#enableAppend").prop("disabled", true).css('cursor', 'no-drop');
						$("#screenShotScrape").text("No Screenshot Available");
						unblockUI();

						//return;
					} else {
					   
						$(".enableActions").addClass("disableActions").removeClass("enableActions").parent('li').css('cursor', 'not-allowed');
						$("#enableAppend").prop("disabled", false).css('cursor', 'pointer')
					}
					//console.log("response data: ", viewString);
					$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px' data-toggle='tooltip' title='Save Objects'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 10' data-toggle='tooltip' title='Delete Objects' disabled>Delete</button><button data-toggle='modal' id='editObjects' data-target='#editObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' data-toggle='tooltip' title='Edit Objects' disabled>Edit</button></span><span class='searchScrapEle'><img src='imgs/ic-search-icon.png'></input></span><span><input type='text' class='searchScrapInput'></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
					$("#saveObjects").attr('disabled', true);
					var custN;
					var imgTag, addcusOb;
					var scrapTree = $("#finalScrap").children('#scrapTree');
					var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');
					localStorage['_cust']=JSON.stringify({})
					if (viewString.view != undefined) {
						for (var i = 0; i < viewString.view.length; i++) {
							// if(viewString.scrapetype == 'caa'){
							// var li = "<li  class='item select_all'><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='"+viewString.view[i].custname+"' class='ellipsis'>"+viewString.view[i].custname+"</span></a></li>";
							// }
							// else{
							var path = viewString.view[i].xpath;
							var ob = viewString.view[i];
							var objId = viewString.view[i]._id
							addcusOb = '';
							ob.tempId = i;
							custN = ob.custname.replace(/[<>]/g, '').trim();
							var tag = ob.tag;
							if (tag == "dropdown") {
								imgTag = "select"
							} else if (tag == "textbox/textarea") {
								imgTag = "input"
							} else imgTag = tag;
							if (path == "") addcusOb = 'addCustObj';
							// if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
							//	 var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis " + addcusOb + "'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
							// } 
							// else {
							if (ob.cord && ob.cord != '') {  //in case of iris object
								addcusOb = ""
								ob.hiddentag = "No",
									tag = "iris;" + ob.objectType,
									ob.url = "",
									ob.xpath = "iris;" + ob.custname + ";" + ob.left + ";" + ob.top + ";" + (ob.width + ob.left) + ";" + (ob.height + ob.top) + ";" + ob.tag
							}
							if(ob.hasOwnProperty('editable')){
								var li = "<li data-id="+objId+" data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a><span id='decrypt' href='#' class='userObject'><img src='imgs/ic-jq-editstep.png' style='display:none'></span></li>";
							}else{
								var li = "<li data-id="+objId+" data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' /><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis " + addcusOb + "'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
							}
							// }									   
							// }
							angular.element(innerUL).append(li);
						}
						$(".checkStylebox, .checkall").prop("disabled", false);
						if (viewString.view.length == 0) {
							$(".disableActions").addClass("enableActions").removeClass("disableActions");
							$("#enableAppend").prop("disabled", true).css('cursor', 'no-drop');
							$(document).find(".checkStylebox").prop("disabled", true);
						}
					}

					$(document).find('#scrapTree').scrapTree({
						multipleSelection: {
							//checkbox : checked,
							classes: ['.item']
						},
						editable: true,
						radio: true
					});
				   

					if (appType == 'Web') {
						if ($(".ellipsis").length > 0) {
							$("li.compareObjects").removeClass('disableActions compareObjectDisable').addClass('enableActions');
							$("li.generateObj").removeClass('disableActions addObjectDisable').addClass('enableActions');

						} else {
							$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');
							$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');
						}
					} else {
						$("li.compareObjects").hide();
					}
				}
				if ($(".ellipsis:visible").length == 0) {
					$(".checkStylebox").prop("disabled", true);
				}
			  var customObjLength =  $('.addCustObj').length;
			  var objectsLength = $(".ellipsis:visible").length;
			 if(customObjLength == objectsLength)
			 {
				$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');
				$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');
			 }
			if(customObjLength == 0)
			{
				$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');
			}
				unblockUI();
			},
			function (error) {
				console.log("error");
			})
	}
	//Populating Saved Scrape Data

	//Disabling Filter
	$("a[title='Filter']").mouseover(function () {

		if (viewString == "") {
			$(this).children("img").addClass("thumb-ic-disabled").removeClass("thumb-ic");
			$(this).parent().css("cursor", "no-drop");
		} else if (viewString.view.length == 0) {
			$(this).children("img").addClass("thumb-ic-disabled").removeClass("thumb-ic");
			$(this).parent().css("cursor", "no-drop");
		} else {
			$(this).children("img").addClass("thumb-ic").removeClass("thumb-ic-disabled");
			$(this).parent().css("cursor", "pointer");
		}
		if ($("#viewscrapedObjects").is(":visible") == true) {
			$(this).parent().addClass('disableFilter');
		}
	})

	//Initialization for apptype(Desktop, Mobility, OEBS) to redirect on initScraping function
	$scope.initScrape = function (e) {
		if (e.currentTarget.className == "disableActions") return false
		else {
			$(document).find("#desktopPath").removeClass("inputErrorBorder")
			$(document).find("#OEBSPath").removeClass("inputErrorBorder")
			if ($scope.getScreenView == "Desktop") {
				$("#launchDesktopApps").modal("show")
				$(document).find("#desktopPath").val('')
				$(document).find('#app_pid').val('');
				$(document).find("#desktopPath").removeClass("inputErrorBorder");
			} else if ($scope.getScreenView == "DesktopJava") {
				$("#launchOEBSApps").modal("show");
				$(document).find("#OEBSPath").val('');
				$(document).find("#OEBSPath").removeClass("inputErrorBorder");
			} else if ($scope.getScreenView == "SAP") {
				$("#launchSAPApps").modal("show")
				$(document).find("#SAPPath").val('')
				$(document).find("#SAPPath").removeClass("inputErrorBorder");
			} else if ($scope.getScreenView == "MobileApp") {
				$("#launchMobilityApps").modal("show")
				$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").val('')
				$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
				$(".androidIcon").removeClass("androidIconActive")
			} else if ($scope.getScreenView == "MobileWeb") {
				$("#launchMobilityWeb").modal("show")
				$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").val('')
				$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
				$(".androidIcon").removeClass("androidIconActive")
			} else if ($scope.getScreenView == "pdf") {
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

	$scope.showWsdlRequest = function () {
		$(".wsdlRqstWrap").show();
		$(".wsdlRspnsWrap").hide();
		$("#showWsdlRequest").addClass("wsButtonActive")
		$("#showWsdlResponse").removeClass("wsButtonActive")
	}

	$scope.showWsdlResponse = function () {
		$(".wsdlRspnsWrap").show();
		$(".wsdlRqstWrap").hide();
		$("#showWsdlResponse").addClass("wsButtonActive")
		$("#showWsdlRequest").removeClass("wsButtonActive")
	}

	$scope.getWSData = function () {
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
		var type = "WS_screen"
		DesignServices.getScrapeDataScreenLevel_ICE(type)
			.then(function (data) {
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				if (typeof data === "object") {
					data = data[0]
					//Printing the Save data in UI
					$("#endPointURL").val(data.endPointURL);
					$("#wsdlMethods option").each(function () {
						if ($(this).val() == data.method) {
							$(this).prop("selected", true)
						}
					})
					$("#wsdlOperation").val(data.operations)
					//Printing Request Data
					$("#wsdlRequestHeader").val(data.header[0].split("##").join("\n"));
					if (data.body[0].indexOf("{") == 0 || data.body[0].indexOf("[") == 0) {
						var jsonStr = data.body;
						var jsonObj = JSON.parse(jsonStr);
						var jsonPretty = JSON.stringify(jsonObj, null, '\t');
						xml_neat2 = jsonPretty;
						$("#wsdlRequestBody").val(jsonPretty)
					} else {
						var getXML = formatXml(data.body[0].replace(/>\s+</g, '><'));
						$("#wsdlRequestBody").val(getXML)
					}

					//Printing Response Data
					$("#wsdlResponseHeader").val(data.responseHeader[0].split("##").join("\n"));
					if (data.responseBody[0].indexOf("{") == 0 || data.responseBody[0].indexOf("[") == 0) {
						var jsonStr = data.responseBody;
						var jsonObj = JSON.parse(jsonStr);
						var jsonPretty = JSON.stringify(jsonObj, null, '\t');
						xml_neat2 = jsonPretty;
						$("#wsdlResponseBody").val(jsonPretty)
					} else {
						var getXML = formatXml(data.responseBody[0].replace(/>\s+</g, '><'));
						$("#wsdlResponseBody").val(getXML)
					}

					//Printing the Save data in UI
					if ($("#wsdlRequestHeader, #wsdlRequestBody").val().length > 0) {
						$(".saveWS").prop("disabled", true);
						$("#enbledWS").prop("disabled", false)
						$(".enableActionsWS").addClass("disableActionsWS").removeClass("enableActionsWS")
						$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody, #wsdlResponseHeader, #wsdlResponseBody").prop("disabled", true)
					} else {
						$(".saveWS").prop("disabled", false);
						$("#enbledWS").prop("disabled", true)
						$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
					}
				} else {
					$("#wsdlMethods").prop("selectedIndex", 0)
					$(".saveWS").prop("disabled", false);
					$("#enbledWS").prop("disabled", true)
					$(".disableActionsWS").addClass("enableActionsWS").removeClass("disableActionsWS")
				}
			},
			function (error) {
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
	$scope.saveWS = function () {
		$("#endPointURL, #wsdlMethods, #wsdlRequestHeader").removeClass("inputErrorBorderFull").removeClass("selectErrorBorder")
		var tasks = JSON.parse(window.localStorage['_CT']);
		var endPointURL = $("#endPointURL").val();
		var wsdlMethods = $("#wsdlMethods option:selected").val();
		var wsdlOperation = $("#wsdlOperation").val();
		var wsdlRequestHeader = $("#wsdlRequestHeader").val().replace(/[\n\r]/g, '##').replace(/"/g, '\"');
		var wsdlRequestBody = $("#wsdlRequestBody").val().replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		var wsdlResponseHeader = $("#wsdlResponseHeader").val().replace(/[\n\r]/g, '##').replace(/"/g, '\"');
		var wsdlResponseBody = $("#wsdlResponseBody").val().replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if (!endPointURL) $("#endPointURL").addClass("inputErrorBorderFull")
		else if (!$scope.wsdlMethods && !wsdlMethods) $("#wsdlMethods").addClass("selectErrorBorder")
		//else if(!wsdlRequestHeader) $("#wsdlRequestHeader").addClass("inputErrorBorderFull")
		else {
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
			scrapeObject.versionnumber = tasks.versionnumber;
			DesignServices.updateScreen_ICE(scrapeObject)
				.then(function (data) {
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					if (data == "success") {
						openDialog("Save WebService Template", "WebService Template saved successfully.");
						//$("#WSSaveSuccess").modal("show");
						$("#enbledWS").prop("checked", false)
						angular.element(document.getElementById("left-nav-section")).scope().getWSData();
					} else {
						openDialog("Save WebService Template", "Failed to save WebService Template.");
						//$("#WSSaveFail").modal("show")
					}
				}, function (error) {
					console.log("Error")
				})
		}
	}
	//Save Webservice Data

	//Enable Save WS Button
	$(document).on("click", "#enbledWS", function () {
		if ($(this).is(":checked") == true) {
			$(".saveWS").prop("disabled", false)
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", false)
			//Additional to enable the web service icon
			$.each($(this).parents("ul").children("li"), function () {
				if ($(this).find("a").hasClass("disableActionsWS") == true) {
					$(this).find("a").addClass("enableActionsWS").removeClass("disableActionsWS")
				}
			})
			//Additional to enable the web service icon
		} else {
			$(".saveWS").prop("disabled", true)
			$("#endPointURL, #wsdlMethods, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody").prop("disabled", true)
		}
	})

	//Init Webservice
	$scope.initScrapeWS = function (e) {
		$("#endPointURL, #wsdlMethods, #wsdlRequestHeader, #wsdlOperation, #wsdlRequestBody").removeClass("inputErrorBorderFull").removeClass("selectErrorBorder")
		var initWSJson = {}
		var testCaseWS = []
		var proceed = false;
		var auth_cert = false;
		var keywordVal;
		var appType = $scope.getScreenView;
		var wsdlInputs = []
		wsdlInputs.push($("#endPointURL").val());
		wsdlInputs.push($("#wsdlMethods").val());
		wsdlInputs.push($("#wsdlOperation").val());
		wsdlInputs.push($("#wsdlRequestHeader").val().replace(/[\n\r]/g, '##').replace(/"/g, '\"'));
		wsdlInputs.push($("#wsdlRequestBody").val().replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').replace(/"/g, '\"'));
		var cert_data =$("#importCertificate").val();
		if (cert_data.length!=0){
			wsdlInputs.push($("#importCertificate").val()+";;"+$('#getPassData').val()+";");
			wsdlInputs.push($('#getAuthUserName').val()+";"+$('#getAuthUserPassword').val());
		}
		var endPointURLCert = $("#endPointURL").val();
		var cert_url = endPointURLCert.indexOf('https')
		if (cert_url==0){
			initWSJson.res = certObj;
		}
		var param = 'debugTestCaseWS_ICE';
		//var wsdlRequestHeader = $("#wsdlRequestHeader").val().replace(/[\n\r]/g,'##').replace(/"/g, '\"');
		//var wsdlRequestBody = $("#wsdlRequestBody").val().replace(/[\n\r]/g,'').replace(/\s\s+/g, ' ').replace(/"/g, '\"');
		if (e.currentTarget.className == "disableActionsWS") return false
		else if (!wsdlInputs[0]) $("#endPointURL").addClass("inputErrorBorderFull")
		else if (!$scope.wsdlMethods && !wsdlInputs[1]) $("#wsdlMethods").addClass("selectErrorBorder")
		else if (wsdlInputs[5]){
			auth_cert = true;
			proceed = true;
		}
		else {
			if (wsdlInputs[1] == "GET" || wsdlInputs[1] == "HEAD" || wsdlInputs[1] == "PUT" || wsdlInputs[1] == "DELETE") {
				if (wsdlInputs[3]) {
					if (!wsdlInputs[2]) $("#wsdlOperation").addClass("inputErrorBorderFull")
					else proceed = true;
				} else proceed = true;
			} else if (wsdlInputs[1] == "POST") {
				if (!wsdlInputs[3]) $("#wsdlRequestHeader").addClass("inputErrorBorderFull")
				else if (!wsdlInputs[4]) $("#wsdlRequestBody").addClass("inputErrorBorderFull")
				else proceed = true;
			}
		}
		if (proceed) {
			if (auth_cert){
				keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody","addClientCertificate","setBasicAuth"]
			}else{
				keywordVal = ["setEndPointURL", "setMethods", "setOperations", "setHeader", "setWholeBody"]
			}
			var blockMsg = "Fetching Response Header & Body..."
			blockUI(blockMsg);
			$rootScope.resetSession.start();
			for (i = 0; i < wsdlInputs.length; i++) {
				if (wsdlInputs[i] != "") {
					testCaseWS.push({
						"stepNo": i + 1,
						"appType": appType,
						"objectName": "",
						"inputVal": [wsdlInputs[i]],
						"keywordVal": keywordVal[i],
						"outputVal": "",
						"url": "",
						"custname": "",
						"remarks": [""],
						"addTestCaseDetails": "",
						"addTestCaseDetailsInfo": ""
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
				"remarks": [""],
				"addTestCaseDetails": "",
				"addTestCaseDetailsInfo": ""
			});
			initWSJson.testcasename = "";
			initWSJson.apptype = "Webservice";
			initWSJson.testcase = testCaseWS;
			DesignServices.initScrapeWS_ICE(initWSJson)
				.then(function (data) {
					unblockUI();
					$rootScope.resetSession.end();
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					} else if (data == "unavailableLocalServer") {
						openDialog("Web Service Screen", $rootScope.unavailableLocalServer_msg);
						return false
					}else if (data == "scheduleModeOn") {
						openDialog("Web Service Screen", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.")
						return false
					}else if (data == "ExecutionOnlyAllowed" || data["responseHeader"] == "ExecutionOnlyAllowed"){
						openDialog("Web Service Screen", "Execution Only Allowed")
						return false
					} else if (typeof data == "object") {
						openDialog("Data Retrieve", "Web Service response received successfully");
						//$("#webserviceDeubgSuccess").modal("show")
						$("#wsdlResponseHeader").val(data.responseHeader[0].split("##").join("\n"));
						if (data.responseBody[0].indexOf("{") == 0 || data.responseBody[0].indexOf("[") == 0) {
							var jsonStr = data.responseBody;
							var jsonObj = JSON.parse(jsonStr);
							var jsonPretty = JSON.stringify(jsonObj, null, '\t');
							xml_neat2 = jsonPretty;
							$("#wsdlResponseBody").val(jsonPretty.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<'))
						} else {
							var getXML = formatXml(data.responseBody[0].replace(/>\s+</g, '><'));
							$("#wsdlResponseBody").val(getXML.replace(/\&gt;/g, '>').replace(/\&lt;/g, '<'))
						}
					} else {
						openDialog("Debug Web Service", "Debug Terminated.");
					}
				}, function (error) {
					unblockUI();
					$rootScope.resetSession.end();
					openDialog("Web Service Screen", "Error while performing operation.");
					console.error("Fail to initScrapeWS_ICE. Cause:", error);
				});
		}
	};
	//Init Webservice

	//Launch WSDL Functionality
	$scope.launchWSDLGo = function () {
		var blockMsg = 'Please Wait...';
		$("#wsldInput").removeClass("inputErrorBorderFull")
		var wsdlUrl = $("#wsldInput").val();
		if (!wsdlUrl) openDialog("Launch WSDL", "Invalid WSDL url."); //$("#wsldInput").addClass("inputErrorBorderFull")
	   //else if (wsdlUrl.toLowerCase().indexOf(".svc?wsdl") === -1 && wsdlUrl.toLowerCase().indexOf(".asmx?wsdl") === -1) openDialog("Launch WSDL", "Invalid WSDL url."); //$("#wsldInput").addClass("inputErrorBorderFull")
		else {
			blockUI(blockMsg);
			$rootScope.resetSession.start();
			DesignServices.launchWSDLGo(wsdlUrl)
				.then(function (data) {
					unblockUI();
					$rootScope.resetSession.end();
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					} else if (data == "fail") {
						openDialog("WSDL-Scrape Screen", "Invalid WSDL url.");
						return false
					}else if (data == "unavailableLocalServer") {
						openDialog("WSDL-Scrape Screen", $rootScope.unavailableLocalServer_msg);
						return false
					}else if (data == "scheduleModeOn") {
						openDialog("WSDL-Scrape Screen", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.")
						return false
					}else if (data == "ExecutionOnlyAllowed"){
						openDialog("WSDL-Scrape Screen", "Execution Only Allowed")
						return false
					}
					document.getElementById("wsldInput").value = wsdlUrl.trim()
					$("#wsldSelect").empty().append('<option value selected disabled>Select Operation</option>')
					for (i = 0; i < data.listofoperations.length; i++) {
						$("#wsldSelect").append('<option value="' + data.listofoperations[i] + '">' + data.listofoperations[i] + '</option>')
					}
				}, function (error) {
					unblockUI();
					$rootScope.resetSession.end();
					openDialog("WSDL-Scrape Screen", "Error while performing operation.");
					console.error("Fail to launch WSDL_GO. Cause:", error);
				});
		}
	}
	//Launch WSDL Functionality

	//WSDL Add Functionality
	$scope.wsdlAdd = function () {
		var resutFile='';
		if (Object.keys(certObj).length!==0) resutFile=certObj;
		$("#endPointURL, #wsdlOperation, #wsdlRequestHeader, #wsdlRequestBody, #wsdlResponseHeader, #wsdlResponseBody").val("");
		$("#wsdlMethods").prop('selectedIndex', 0);
		$("#wsldInput").removeClass("inputErrorBorderFull");
		$("#wsldSelect").removeClass("selectErrorBorder");
		var wsdlUrl = $("#wsldInput").val();
		var wsdlSelectedMethod = $("#wsldSelect option:selected").val();
		if (!wsdlUrl) $("#wsldInput").addClass("inputErrorBorderFull");
		else if (!wsdlSelectedMethod) $("#wsldSelect").addClass("selectErrorBorder");
		else {
			var blockMsg = 'Please Wait...';
			blockUI(blockMsg);
			$rootScope.resetSession.start();
			DesignServices.wsdlAdd(wsdlUrl, wsdlSelectedMethod,resutFile)
				.then(function (data) {
					unblockUI();
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					} else if (data == "unavailableLocalServer") {
						openDialog("WSDL Add-Scrape Screen", $rootScope.unavailableLocalServer_msg);
						return false
					} else if (data == "scheduleModeOn") {
						openDialog("WSDL Add-Scrape Screen", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.")
						return false
					} else if (typeof data === "object") {
						//Printing the Save data in UI
						$("#endPointURL").val(data.endPointURL);
						$("#wsdlMethods option").each(function () {
							if ($(this).val() == data.method) {
								$(this).prop("selected", true)
							}
						})
						$("#wsdlOperation").val(data.operations)
						//Printing Request Data
						$("#wsdlRequestHeader").val(data.header[0].split("##").join("\n"));
						if (data.body[0].indexOf("{") == 0 || data.body[0].indexOf("[") == 0) {
							var jsonStr = data.body;
							var jsonObj = JSON.parse(jsonStr);
							var jsonPretty = JSON.stringify(jsonObj, null, '\t');
							xml_neat2 = jsonPretty;
							$("#wsdlRequestBody").val(jsonPretty)
						} else {
							var getXML = formatXml(data.body[0].replace(/>\s+</g, '><'));
							$("#wsdlRequestBody").val(getXML)
						}
						$(".saveWS").prop("disabled", false)
					}
				}, function (error) {
					unblockUI();
					$rootScope.resetSession.end();
					openDialog("WSDL Add-Scrape Screen", "Error while performing operation.");
					console.error("Fail to Add-Scrape. Cause:", error);
				});
		}
	}
	//WSDL Add Functionality

	$("#deviceName, #versionNumber, #bundleId, #ipAddress").hide();
	//Mobile Serial Number Keyup Function
	$("#mobilityAPKPath").on("keyup", function() {
		if ($(this).val().toLowerCase().indexOf(".apk") >= 0) {
			$("#deviceName, #versionNumber, #bundleId, #ipAddress").hide();
			$("#mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").hide();
			$("#mobilitySerialPath").show();
			$(".rightAlign").prop("style", "top: 20px;");
			$("#launchMobilityApps").find(".androidIcon").prop("style", "background: url('../imgs/ic-andrd-active.png') left top no-repeat !important;");
		} 
		//  else if ($(this).val().toLowerCase().indexOf(".ipa") >= 0 || $(this).val().toLowerCase().indexOf(".app") >= 0) {
		//	 if ($(this).val().toLowerCase().indexOf(".app") >= 0) {
		//		 $("#mobilitySerialPath, #mobilityUDID").hide();
		//		 $("#mobilityDeviceName, #mobilityiOSVersion").show();
		//		 $(".rightAlign").prop("style", "top: 20px;");
		//	 } else if ($(this).val().toLowerCase().indexOf(".ipa") >= 0) {
		// 		$("#deviceName, #versionNumber, #bundleId, #ipAddress").hide();
		//		 $("#mobilitySerialPath").hide();
		//		 $("#mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").show();
		//		 $(".rightAlign").prop("style", "top: -10px;");
		//	 }
		// 	$("#deviceName, #versionNumber, #bundleId, #ipAddress").hide();
		//	 $("#launchMobilityApps").find(".androidIcon").prop("style", "background: url('../imgs/ic-ios-active.png') left top no-repeat !important;");
		// }
		else if ($(this).val().toLowerCase().indexOf(".ios") >= 0 ) {
			$("#deviceName, #versionNumber, #bundleId, #ipAddress").show();
			$("#mobilitySerialPath").hide();

			$("#launchMobilityApps").find(".androidIcon").prop("style", "background: url('../imgs/ic-ios-active.png') left top no-repeat !important;");
		}
		else
			$("#launchMobilityApps").find(".androidIcon").prop("style", "background: ''");
	})
	//Mobile Serial Number Keyup Function

	//toggling radio buttons in desktop app launch modal

	$('#radio_check1').click(function () {
		var isChecked = $('#radio_check2').is(':checked');
		if (isChecked == true) {
			//$('input[type="radio"]').not(':checked').prop("checked", true);
			$('#radio_check1').attr('checked', true);
			$('#radio_check2').attr('checked', false);
		}
		else {
			$('#radio_check1').attr('checked', true);
			$('#radio_check2').attr('checked', false);
			//$('input[type="radio"]:not(.checked').prop("checked", true);
		}

	});

	$('#radio_check2').click(function () {
		var isChecked = $('#radio_check1').is(':checked');
		if (isChecked == true) {
			//$('input[type="radio"]').not(':checked').prop("checked", true);
			$('#radio_check2').attr('checked', true);
			$('#radio_check1').attr('checked', false);
		}
		else {
			$('#radio_check2').attr('checked', true);
			$('#radio_check1').attr('checked', false);
			//$('input[type="radio"]:not(.checked').prop("checked", true);
		}

	});
	//toggling radio buttons in desktop app launch modal

	// Number filter in desktop application lauch modal
	$(document).on('keypress', '#app_pid', function (e) {
		if ((e.charCode >= 48 && e.charCode <= 57) || e.charCode == 59) return true;
		else return false;
	})


	//Initiating Scraping
	$scope.initScraping = function (e, browserType) {
		$('#compareObjectModal').modal('hide');
		$(".addObject span img").removeClass("left-bottom-selection");
		$(".compareObject span img").removeClass("left-bottom-selection");
		$(".generateObj span img").removeClass("left-bottom-selection");
		if (e.currentTarget.className == "disableActions") return false
		else {
			eaCheckbox = $("#enableAppend").is(":checked")
			//enableScreenShotHighlight = false;
			screenViewObject = {}
			var blockMsg = 'Scraping in progress. Please Wait...';
			var blockMsg2 = 'Comparing objects in progress...';
			$(document).find("#desktopPath").removeClass("inputErrorBorder");
			$(document).find("#OEBSPath").removeClass("inputErrorBorder");
			$(document).find("#mobilityAPKPath, #mobilitySerialPath, #mobilityDeviceName, #mobilityiOSVersion, #mobilityUDID").removeClass("inputErrorBorder");
			$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion").removeClass("inputErrorBorder");

			//Transaction Activity for InitCompareAndUpdate/initScraping Button Action
			// var labelArr = [];
			// var infoArr = [];
			// if($rootScope.compareFlag == true)
			//	 labelArr.push(txnHistory.codesDict['InitCompareAndUpdate']);
			// else
			//	 labelArr.push(txnHistory.codesDict['InitScraping']);
			// infoArr.push($scope.getScreenView);
			// txnHistory.log(e.type,labelArr,infoArr,$location.$$path); 

			//For Desktop
			if ($scope.getScreenView == "Desktop") {
				if ($(document).find("#desktopPath").val() == "" && $(document).find("#app_pid").val() == "" && browserType != 'pdf') {
					$(document).find("#desktopPath").addClass("inputErrorBorder")
					return false
				} else if (browserType == 'pdf'){
					screenViewObject.appType = browserType;
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				} else {
					$(document).find("#desktopPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
						screenViewObject.applicationPath = $(document).find("#desktopPath").val();
					screenViewObject.processID = $(document).find("#app_pid").val();
					screenViewObject.scrapeMethod = $("input[name='first']:checked").val();
					$("#launchDesktopApps").modal("hide");
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				}
			}
			//For Desktop
			//For SAP
			else if ($scope.getScreenView == "SAP") {
				if ($(document).find("#SAPPath").val() == "" && browserType != 'pdf') {
					$(document).find("#SAPPath").addClass("inputErrorBorder")
					return false
				} else if (browserType == 'pdf'){
					screenViewObject.appType = browserType;
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				} else {
					$(document).find("#SAPPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
						screenViewObject.applicationPath = $(document).find("#SAPPath").val();
					$("#launchSAPApps").modal("hide");
					//blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				}
			}

			//For Mobility
			else if ($scope.getScreenView == "MobileApp") {
				if (!$("#mobilityAPKPath").val() && browserType != 'pdf') {
					$(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
					return false
				} else if (browserType == 'pdf'){
					screenViewObject.appType = browserType;
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				} else if ($("#mobilityAPKPath").val().toLowerCase().indexOf(".apk") >= 0) {
					if ($(document).find("#mobilityAPKPath").val() == "") {
						$(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
						return false
					} else if ($(document).find("#mobilitySerialPath").val() == "") {
						$(document).find("#mobilitySerialPath").addClass("inputErrorBorder")
						return false
					} else {
						$(document).find("#mobilityAPKPath, #mobilitySerialPath").removeClass("inputErrorBorder")
						screenViewObject.appType = $scope.getScreenView,
							screenViewObject.apkPath = $(document).find("#mobilityAPKPath").val();
						screenViewObject.mobileSerial = $(document).find("#mobilitySerialPath").val();
						$("#launchMobilityApps").modal("hide");
						// blockUI(blockMsg);
						if ($rootScope.compareFlag == true) {
							blockUI(blockMsg2);
							e.stopImmediatePropagation();
						}
						else {
							blockUI(blockMsg);
							e.stopImmediatePropagation();
						}
					}
				} // else if ($("#mobilityAPKPath").val().toLowerCase().indexOf(".ipa") >= 0 || $("#mobilityAPKPath").val().toLowerCase().indexOf(".app") >= 0) {
					//	 if ($(document).find("#mobilityAPKPath").val() == "") {
					//		 $(document).find("#mobilityAPKPath").addClass("inputErrorBorder")
					//		 return false
	
					//	 } else if ($(document).find("#mobilityDeviceName").val() == "") {
					//		 $(document).find("#mobilityDeviceName").addClass("inputErrorBorder")
					//		 return false
	
					//	 } else if ($(document).find("#mobilityiOSVersion").val() == "") {
					//		 $(document).find("#mobilityiOSVersion").addClass("inputErrorBorder")
					//		 return false
	
					//	 } else if ($(document).find("#mobilityUDID").val() == "" && $("#mobilityAPKPath").val().toLowerCase().indexOf(".ipa") >= 0) {
					//		 $(document).find("#mobilityUDID").addClass("inputErrorBorder")
					//		 return false
					//	 }
					
					else if ($("#mobilityAPKPath").val().toLowerCase().indexOf(".ios") >= 0) {
								  screenViewObject.appType = $scope.getScreenView;
								  screenViewObject.deviceName = $('#deviceName').val();
								  screenViewObject.versionNumber = $('#versionNumber').val();
								  screenViewObject.bundleId = $('#bundleId').val();
								  screenViewObject.ipAddress =  $('#ipAddress').val();
								  screenViewObject.param = 'ios';
								  $('#launchMobilityApps').modal("hide");
								  if( $rootScope.compareFlag == true){
									blockUI(blockMsg2);
									e.stopImmediatePropagation();
								}
								else{
									blockUI(blockMsg);
									e.stopImmediatePropagation();
								}
					}
					else {
							$(document).find("#mobilityAPKPath,#mobilityDeviceName,#mobilityiOSVersion,#mobilityUDID").removeClass("inputErrorBorder")
							screenViewObject.appType = $scope.getScreenView,
								screenViewObject.apkPath = $(document).find("#mobilityAPKPath").val();
							screenViewObject.mobileDeviceName = $(document).find("#mobilityDeviceName").val();
							screenViewObject.mobileIosVersion = $(document).find("#mobilityiOSVersion").val();
							screenViewObject.mobileUDID = $(document).find("#mobilityUDID").val();
							$("#launchMobilityApps").modal("hide");
							// blockUI(blockMsg);
							if( $rootScope.compareFlag == true){
							blockUI(blockMsg2);
							e.stopImmediatePropagation();
							}
							else{
								blockUI(blockMsg);
								e.stopImmediatePropagation();
								
								
								
								
								
								
							}
						}
					
				}
			//For Mobility

			//For Mobility Web
			else if ($scope.getScreenView == "MobileWeb") {
				if ($(document).find("#mobilityWebSerialNo").val() == "" && browserType != 'pdf') {
					$(document).find("#mobilityWebSerialNo").addClass("inputErrorBorder" && browserType != 'pdf')
					return false
				} else if ($(document).find("#mobilityAndroidVersion").val() == "" && browserType != 'pdf') {
					$(document).find("#mobilityAndroidVersion").addClass("inputErrorBorder")
					return false
				} else if (browserType == 'pdf'){
					screenViewObject.appType = browserType;
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				} 
				else {
					$(document).find("#mobilityWebSerialNo, #mobilityAndroidVersion").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
						screenViewObject.mobileSerial = $(document).find("#mobilityWebSerialNo").val();
					screenViewObject.androidVersion = $(document).find("#mobilityAndroidVersion").val();
					$("#launchMobilityWeb").modal("hide");
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				}
			}
			//For Mobility Web

			//For OEBS
			else if ($scope.getScreenView == "DesktopJava") {
				if ($(document).find("#OEBSPath").val() == "" && browserType != 'pdf' ) {
					$(document).find("#OEBSPath").addClass("inputErrorBorder")
					return false
				} else if (browserType == 'pdf'){
					screenViewObject.appType = browserType;
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				} 
				else {
					$(document).find("#OEBSPath").removeClass("inputErrorBorder")
					screenViewObject.appType = $scope.getScreenView,
						screenViewObject.applicationPath = $(document).find("#OEBSPath").val();
					$("#launchOEBSApps").modal("hide");
					// blockUI(blockMsg);
					if ($rootScope.compareFlag == true) {
						blockUI(blockMsg2);
						e.stopImmediatePropagation();
					}
					else {
						blockUI(blockMsg);
						e.stopImmediatePropagation();
					}
				}
			}
			//For PDF
			else if(browserType == "pdf"){
				screenViewObject.appType = browserType;
				// blockUI(blockMsg);
				if ($rootScope.compareFlag == true) {
					blockUI(blockMsg2);
					e.stopImmediatePropagation();
				}
				else {
					blockUI(blockMsg);
					e.stopImmediatePropagation();
				}
			}
			//For Web
			else {
				if ($rootScope.compareFlag == true) {
					screenViewObject.viewString = viewString;
					screenViewObject.action = "compare";
				}
				screenViewObject.browserType = browserType
				// blockUI(blockMsg);
				if ($rootScope.compareFlag == true) {
					blockUI(blockMsg2);
					e.stopImmediatePropagation();
				}
				else {
					blockUI(blockMsg);
					e.stopImmediatePropagation();
				}
			}
			//For Web
			$rootScope.resetSession.start();
			DesignServices.initScraping_ICE(screenViewObject)
				.then(function (data) {
					unblockUI();
					$rootScope.resetSession.end();
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					} else if (data == "Response Body exceeds max. Limit.") {
						openDialog("Scrape Screen", "Scraped data exceeds max. Limit.");
						return false
					} else if (data == 'scheduleModeOn') {
						eaCheckbox = false;
						var scrapedObjectsLen = $("span.ellipsis").length;
						if (scrapedObjectsLen > 0) {
							$(".enableActions").removeClass("enableActions").addClass("disableActions").parent('li').css('cursor', 'not-allowed');
						} else {
							$(".disableActions").removeClass("disableActions").addClass("enableActions");
						}
						$("#enableAppend").prop('checked', false);
						openDialog("Scrape Screen", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
						return false
					} else if (data == "unavailableLocalServer") {
						eaCheckbox = false;
						var scrapedObjectsLen = $("span.ellipsis").length;
						if (scrapedObjectsLen > 0) {
							$(".enableActions").removeClass("enableActions").addClass("disableActions").parent('li').css('cursor', 'not-allowed');
						} else {
							$(".disableActions").removeClass("disableActions").addClass("enableActions");
						}
						$("#enableAppend").prop('checked', false);
						openDialog("Scrape Screen", $rootScope.unavailableLocalServer_msg);
						return false
					} else if (data == "fail") {
						openDialog("Scrape", "Failed to scrape.")
						//$("#scrapeFailModal").modal("show");
						return false
					} else if (data == "Terminate") {
						unblockUI();
						openDialog("Scrape Screen", "Scrape Terminated")
						return false
					} else if (data == "wrongWindowName") {
						openDialog("Scrape", "Wrong window name.")
					} else if (data == "ExecutionOnlyAllowed"){
						openDialog("Scrape Screen", "Execution Only Allowed")
						return false
					}
					//COMPARE & UPDATE SCRAPE OPERATION
					if (data.action == "compare") {
						if (data.status == 'SUCCESS') {
							$('.scrollbar-compare, .saveCompareDiv').show();
							updatedViewString = data;
							$("#changedOrdList li,#compareUnchangedObjectsBox li ,#compareNotFoundObjectsBox li").empty();
							$("#viewscrapedObjects").show();
							//Hide Scrape Objects
							$("#scrapTree,.fsScroll").hide();
							if (data.view[0].changedobject.length > 0) {
								$("#compareChangedObjectsBox,#saveComparedObjects").show();
								//changed objects list
								for (var i = 0; i < data.view[0].changedobject.length; i++) {
									var innerUL = $('.changedObjOrdList');
									var path = data.view[0].changedobject[i].xpath;
									var ob = data.view[0].changedobject[i];
									//ob.tempId= i;
									var custN = ob.custname.replace(/[<>]/g, '').trim();
									var tag = ob.tag;
									if (tag == "dropdown") {
										imgTag = "select"
									} else if (tag == "textbox/textarea") {
										imgTag = "input"
									} else imgTag = tag;
									var tag1 = tag.replace(/ /g, "_");
									var tag2;
									if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><input type='checkbox' class='checkCompareAll' name='selectAllChangedItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									} else {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><input type='checkbox' class='checkCompareAll' name='selectAllChangedItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									}
									angular.element(innerUL).append(li);
								}
								$(document).find('#changedOrdList').scrapTree({
									multipleSelection: {
										//checkbox : checked,
										classes: ['.item .treeChangedObjects']
									},
									editable: false,
									radio: true
								});
							} else {
								$("#compareChangedObjectsBox").hide();
							}
							if (data.view[1].notchangedobject.length > 0) {
								$("#compareUnchangedObjectsBox").show();

								//unchanged objects list
								for (var j = 0; j < data.view[1].notchangedobject.length; j++) {
									var innerUL = $('.unchangedObjOrdList');
									var path = data.view[1].notchangedobject[j].xpath;
									var ob = data.view[1].notchangedobject[j];
									//ob.tempId= j;
									var custN = ob.custname.replace(/[<>]/g, '').trim();
									var tag = ob.tag;
									if (tag == "dropdown") {
										imgTag = "select"
									} else if (tag == "textbox/textarea") {
										imgTag = "input"
									} else imgTag = tag;
									var tag1 = tag.replace(/ /g, "_");
									var tag2;
									if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									} else {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									}
									angular.element(innerUL).append(li);
								}
								$(document).find('#unchangedOrdList').scrapTree({
									multipleSelection: {
										// checkbox : checked,
										classes: ['.item .treeUnChangedObjects']
									},
									editable: false,
									radio: true
								});
							} else {
								$("#compareUnchangedObjectsBox").hide();
							}
							// console.log("nf", data.view[2].notfoundobject);
							if (data.view[2].notfoundobject.length > 0) {
								$("#compareNotFoundObjectsBox, #saveComparedObjects").show();
								// //Objects not found
								for (var k = 0; k < data.view[2].notfoundobject.length; k++) {
									var innerUL = $('.notfoundObjOrdList');
									var path = data.view[2].notfoundobject[k].xpath;
									var ob = data.view[2].notfoundobject[k];
									//ob.tempId= i;
									var custN = ob.custname.replace(/[<>]/g, '').trim();
									var tag = ob.tag;
									if (tag == "dropdown") {
										imgTag = "select"
									} else if (tag == "textbox/textarea") {
										imgTag = "input"
									} else imgTag = tag;
									var tag1 = tag.replace(/ /g, "_");
									var tag2;
									if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									} else {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x'><a class='customTxtName'><span class='highlight'></span><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									}
									angular.element(innerUL).append(li);
								}
								$(document).find('#notfoundOrdList').scrapTree({
									multipleSelection: {
										//checkbox : checked,
										classes: ['.item .treenotFoundObjects']
									},
									editable: false,
									radio: true
								});
							} else {
								$("#compareNotFoundObjectsBox").hide();
							}
						}
						
						else {
							if (data.status =="EMPTY_OBJECT"){
								openDialog("Compare Objects", "Failed to compare objects - Unmapped object(s) found");
							}
							else{
								openDialog("Compare Objects", "Failed to compare objects");
							}
							$rootScope.compareFlag = false;
							return;
						}

					} else {
						saveScrapeDataFlag = false;
						$('.scrollbar-compare').hide();
						if (data.view.length > 0) {
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
						if(viewString.scrapetype=='caa')
								$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,' + viewString.mirror.substring(2,viewString.mirror.length-1) + '" /></div>')
						else	
							$("#window-scrape-screenshot .popupContent, #window-scrape-screenshotTs .popupContent").html('<div id="screenShotScrape"><img id="screenshot" src="data:image/PNG;base64,' + viewString.mirror + '" /></div>')
						$("#finalScrap").empty()
						$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox'/><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 10' disabled>Delete</button><button data-toggle='modal' id='editObjects' data-target='#editObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' data-toggle='tooltip' title='Edit Objects' disabled>Edit</button></span><span class='searchScrapEle'><img src='imgs/ic-search-icon.png'></input></span><span><input type='text' class='searchScrapInput'></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
						var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');

						// console.log("data", viewString);
						//If enable append is active
						if (eaCheckbox) {
							if (viewString.view.length != 0){
							//Getting the Existing Scrape Data
							for (var i = 0; i < newScrapedList.view.length; i++) {
								// if(newScrapedList.scrapetype == 'caa'){
								//	 var li = "<li  class='item select_all'><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='"+newScrapedList.view[i].custname+"'>"+newScrapedList.view[i].custname+"</span></a></li>";
								// }
								// else{
								var path = newScrapedList.view[i].xpath;
								var ob = newScrapedList.view[i];
								ob.tempId = i;
								if (appType == "DesktopJava" || appType == "Desktop") {
									custN = ob.custname.replace('/\s/g', ' ').replace('\n', ' ').replace(/[<>]/g, '');
								}
								else {
									custN = ob.custname.replace(/[<>]/g, '');
								}
								var tag = ob.tag;
								if (tag == "dropdown") {
									imgTag = "select"
								} else if (tag == "textbox/textarea") {
									imgTag = "input"
								} else imgTag = tag;

								if (ob.cord && ob.cord != '') {  //in case of iris object
									addcusOb = ""
									ob.hiddentag = "No",
										tag = "iris;" + ob.objectType,
										ob.url = "",
										ob.xpath = "iris;" + ob.custname + ";" + ob.left + ";" + ob.top + ";" + (ob.width + ob.left) + ";" + (ob.height + ob.top) + ";" + ob.tag
								}

								// if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
								//	 var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								// } else {
								// }
								// }								
								if (appType == "DesktopJava" || appType == "Desktop") {
									var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/[\'\"]/g, "\"") + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								}
								else {
									var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								}
								angular.element(innerUL).append(li);
							}
						}else{
							//when viewsstring.view is empty after click and add
							$("#saveObjects").removeClass('hide');
							$("#saveObjects").trigger('click');
							return;
						}
							//Getting the Existing Scrape Data

							generateScrape()
							
							
							//Autocomplete feature for scrape input fields
							$(function(){
								var device_Name = screenViewObject.deviceName
								var version_Number = screenViewObject.versionNumber
								var bundle_Id = screenViewObject.bundleId
								var ip_Address = screenViewObject.ipAddress
								var apk = screenViewObject.apkPath 
								var serial = screenViewObject.mobileSerial

								$("#deviceName").autocomplete({
									source: device_Name
								});
								$("#versionNumber").autocomplete({
									source: version_Number
								});
								$("#bundleId").autocomplete({
									source: bundle_Id
								});
								$("#ipAddress").autocomplete({
									source: ip_Address
								});
								$("#mobilityAPKPath").autocomplete({
									source: apk
								});
								$("#mobilitySerialPath").autocomplete({
									source: serial
								});

							});

							
							
							//Getting appended scraped object irrespective to the dynamic value
							function generateScrape() {
								var tempId = newScrapedList.view.length - 1;
								for (var i = 0; i < viewString.view.length; i++) {
									// if(viewString.scrapetype == 'caa'){
									//	 var li = "<li  class='item select_all'><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='"+viewString.view[i].custname+"'>"+viewString.view[i].custname+"</span></a></li>";
									// }
									// else{
									tempId++
									var path = viewString.view[i].xpath;
									var ob = viewString.view[i];
									if (appType == "DesktopJava" || appType == "Desktop") {
										var custN = ob.custname.replace('/\s/g', ' ').replace('\n', ' ').replace(/[<>]/g, '');
									}
									else {
										var custN = ob.custname.replace(/[<>]/g, '').trim();
									}
									var tag = ob.tag;
									if (tag == "dropdown") {
										imgTag = "select"
									} else if (tag == "textbox/textarea") {
										imgTag = "input"
									} else imgTag = tag;

									// if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
									//	 var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									// } else {
									if (ob.cord && ob.cord != '') {  //in case of iris object
										addcusOb = ""
										ob.hiddentag = "No",
										tag = "iris;" + ob.objectType,
										ob.url = "",
										ob.xpath = "iris;" + ob.custname + ";" + ob.left + ";" + ob.top + ";" + (ob.width + ob.left) + ";" + (ob.height + ob.top) + ";" + ob.tag
									}
									if (appType == "DesktopJava" || appType == "Desktop") {
										var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/[\'\"]/g, "\"") + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
									}
									else {
										if (typeof(ob.xpath) == 'String'){
											var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
										}else{
											var li = "<li data-xpath='" + ob.xpath + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
										}
										
									}
									// }	

									// }									
									angular.element(innerUL).append(li)
									//newScrapedList.view.push(viewString.view[i]);
								}
								//newScrapedList.mirror = viewString.mirror;
								//newScrapedList.scrapetype = viewString.scrapetype;
							}
							//Getting appended scraped object irrespective to the dynamic value
						}
						//If enable append is active


						//If enable append is inactive
						else {
							//Before Saving the Scrape JSON to the Database
							for (var i = 0; i < viewString.view.length; i++) {
								var innerUL = $("#finalScrap").children('#scrapTree').children('ul').children().children('#scraplist');

								// if(viewString.scrapetype == 'caa'){
								//	 var li = "<li  class='item select_all'><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='"+viewString.view[i].custname+"'>"+viewString.view[i].custname+"</span></a></li>";
								// }
								// else{
								var path = viewString.view[i].xpath;
								var ob = viewString.view[i];
								ob.tempId = i;
								if (appType == "DesktopJava" || appType == "Desktop") {
									var custN = ob.custname.replace('/\s/g', ' ').replace('\n', ' ').replace(/[<>]/g, '');
								}
								else {
									var custN = ob.custname.replace(/[<>]/g, '').trim();
								}
								var tag = ob.tag;
								if (tag == "dropdown") {
									imgTag = "select"
								} else if (tag == "textbox/textarea") {
									imgTag = "input"
								} else imgTag = tag;
								// if (tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") {
								//	 var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								// } else {
								if (ob.cord && ob.cord != '') {  //in case of iris object
									addcusOb = ""
									ob.hiddentag = "No",
										tag = "iris;" + ob.objectType,
										ob.url = "",
										ob.xpath = "iris;" + ob.custname + ";" + ob.left + ";" + ob.top + ";" + (ob.width + ob.left) + ";" + (ob.height + ob.top) + ";" + ob.tag
								}
								// }
								// }
								if (appType == "DesktopJava" || appType == "Desktop") {
									var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/[\'\"]/g, "\"") + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								}
								else {
									var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems'/><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
								}
								angular.element(innerUL).append(li);


							}
							//Before Saving the Scrape JSON to the Database
						}
						$("li.item:visible").each(function () {
							if ($(this).attr('data-xpath') == "" && $(this).attr('data-tag') != "iris") {
								$(this).children().find('span.ellipsis').addClass('customObject');
							}
						});
						//If enable append is inactive
						//Build Scrape Tree using dmtree.scrapper.js file
						$(document).find('#scrapTree').scrapTree({
							multipleSelection: {
								//checkbox : checked,
								classes: ['.item']
							},
							editable: true,
							radio: true
						});

						//Build Scrape Tree using dmtree.scrapper.js file
						if (viewString.view.length > 0) {
							$("#saveObjects").removeClass('hide');
							//$("#deleteObjects").prop("disabled", false);
							deleteScrapeDataservice = false;
						} else $("#saveObjects").addClass('hide');
					}

					if('view' in  data)
					{
						if(data.view.length == 0)
						{
							$(".checkStylebox").prop('disabled', true);
						}
					}

					if ($("#compareChangedObjectsBox").is(":visible") == true || $("#compareNotFoundObjectsBox").is(":visible") == true) {
						$("#saveComparedObjects").show();
					}
					else {
						$("#saveComparedObjects").hide();
					}

					if ($("#compareChangedObjectsBox").is(":visible") == true || $("#compareNotFoundObjectsBox").is(":visible") == true || $("#compareUnchangedObjectsBox").is(":visible") == true) {
						$("#viewscrapedObjects").show();
						$("#left-top-section,#left-bottom-section").addClass('disableClick');
						//  $("a[title='Filter']").parent().removeAttr( 'style' ).css("cursor", "no-drop");
					}
					else {
						$("#viewscrapedObjects").hide();
					}

					$(document).on('click', '#viewscrapedObjects', function () {
						$(".scrollbar-compare,.saveCompareDiv").hide(); //Hide Compare Div
						angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
						$("#scrapTree,.fsScroll").show(); //Show Scraped Objects
						$rootScope.compareFlag = false;
						$("#left-top-section,#left-bottom-section").removeClass('disableClick');
					});

				}, function (error) {
					unblockUI();
					$rootScope.resetSession.end();
					openDialog("Scrape Screen", "Error while performing Scrape.");
					console.error("Fail to Load design_ICE. Cause:", error);
				});
		}
	}
	
	$(document).on("click", ".ellipsis", function(e) {
		if(this.clicks === undefined) this.clicks=0;
		this.clicks++;
		setTimeout(function(){
			var clicks = e.target.clicks;
			e.target.clicks = 0;
			if(clicks != 1) return false;
			if(!e.target.parentNode.parentNode.attributes['data-tag'].value.startsWith('iris')) return false;
			obj_xpath = e.target.parentNode.parentNode.attributes['data-xpath'].value;
			objType = '';
			for(var i=0;i<viewString.view.length;i++){
				if(obj_xpath == viewString.view[i].xpath && viewString.view[i].objectType != ''){
					objType = viewString.view[i].objectType[0].toUpperCase() + viewString.view[i].objectType.slice(1,viewString.view[i].objectType.length);
					break;
				}  
			}
			$("#dialog-irisObject").modal("show");
			$("#addIrisObjContainer").empty()
			if ($(".addObj-row").length > 1) $(".addObj-row").remove()
			$("#addIrisObjContainer").append('<div class = "row row-modal addObj-row"><div class = "form-group"><span><strong>Object Detected as:	'+objType+'</strong></span></div><br><br><span style="float:left"><strong>User input: </strong></span><div class = "form-group form-group-2" style="float:left; margin-left:10px;"><select class = "form-control form-control-custom" id="objectType"><option selected disabled > Select Object Type </option><option value = "textbox" > Textbox / Textarea </option><option value = "table" > Table </option><option value = "dropdown" > Dropdown </option><option value = "button" > Button </option><option value = "radiobutton" > Radiobutton </option><option value = "checkbox" > Checkbox </option><option value = "others" > Others </option></select></div> </div>');
		}, 500);
	});
	
	$scope.submitIrisObjectType = function (e) {
		var obj_cord = '';
		var obj_id = '';
		var task = JSON.parse(window.localStorage['_CT']);
		var identified_obj_type = objType.toLowerCase();
		var user_obj_type = $('#objectType').val();
		if(user_obj_type!=null && user_obj_type != identified_obj_type){
			for(var i=0;i<viewString.view.length;i++){
				if(viewString.view[i].xpath == obj_xpath){
					obj_cord = viewString.view[i].cord;
					if("_id" in viewString.view[i]){obj_id = viewString.view[i]._id;}
					break;
				}
			}
			var data = {"_id":obj_id,"cord":obj_cord,"type":user_obj_type,"projectid":task.projectId,"screenid":task.screenId,
			"screenname":task.screenName,"versionnumber":task.versionnumber,"xpath":obj_xpath};
			DesignServices.updateIrisDataset(data)
				.then(function (val) {
					$("#dialog-irisObject").find("button.close").click();
					if(val=='unavailableLocalServer')  openDialog("Iris Object Type", $rootScope.unavailableLocalServer_msg);
					else if(val=='unsavedObject') openDialog("Iris Object Type","Please save the object first.");
					else{
						if(val){
							openDialog("Iris Object Type","Submitted Successfully.");
							for(var i=0;i<viewString.view.length;i++){
								if(viewString.view[i].xpath == obj_xpath){
									viewString.view[i].objectType = user_obj_type;
									break;
								}
							}
						}
						else
							openDialog("Iris Object Type","Failed.");
					}
				}, function (error) {
					
				});
		}
		else{
			$("#dialog-irisObject").find("button.close").click();
			openDialog("Iris Object Type","Submitted Successfully.");
		}
	}
	
	$scope.updateComparedObjects = function (event) {
		var tasks = JSON.parse(window.localStorage['_CT']);
		var userinfo = JSON.parse(window.localStorage['_UI']);
		var scrapeObject = {};
		var updatedSelection = [];
		scrapeObject.param = 'updateComparedObjects';
		$("#changedOrdList").find("input[type='checkbox'].checkCompareAll:checked").each(function () {
			var id = parseInt($(this).parent().attr('id').split('_')[1]);
			updatedViewString.view[0].changedobject[id]._id = viewString.view[updatedViewString.changedobjectskeys[id]]._id
			updatedSelection.push(updatedViewString.view[0].changedobject[id]);
		});
		updatedViewString.view[0].changedobject = updatedSelection;
		scrapeObject.updatedViewString = updatedViewString;
		scrapeObject.userinfo = userinfo;
		scrapeObject.screenId = tasks.screenId;
		scrapeObject.screenName = tasks.screenName;
		scrapeObject.projectId = tasks.projectId;
		scrapeObject.appType = tasks.app
		scrapeObject.versionnumber = tasks.versionnumber;
		DesignServices.updateScreen_ICE(scrapeObject)
			.then(function (data) {
				//console.log("out", data);
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				if (data == 'success') {
					//openDialog("Compared Objects", "Scraped data updated successfully.");
					$("#compareBox").modal("show");
					$("#compareBox .modal-body p").text("Scraped data updated successfully.");
					$(document).on('click', '#btnNavDesign', function () {
						$(".scrollbar-compare,.saveCompareDiv").hide(); //Hide Compare Div
						angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
						$("#scrapTree,.fsScroll").show(); //Show Scraped Objects
						$rootScope.compareFlag = false;
						$("#left-top-section,#left-bottom-section").removeClass('disableClick');
						$("#changedOrdList li,#compareUnchangedObjectsBox li ,#compareNotFoundObjectsBox li").empty();
						//window.location.href = "/design";
					});
				} else {
					openDialog("Compared Objects", "Failed to update objects");
					$("#changedOrdList li,#compareUnchangedObjectsBox li ,#compareNotFoundObjectsBox li").empty();
				}
			}, function (error) {

			});
	}
	//Edit Objects
	$(document).on('click', '#editObjects', function () {
		ele=$("input[type=checkbox].checkall:checked:visible").parents('li.item.select_all')
		$('.errorMessage').val('');
			custObjProps=[]
			custObjProps.push('decrypt')
			custObjProps.push(ele.attr('data-xpath'))
			custObjProps.push(ele.attr('data-url'))
			custObjProps.push(ele.attr('data-tag'))
			DesignServices.userObjectElement_ICE(custObjProps)
			.then(function (data) {
				if (data == "unavailableLocalServer") {
					openDialog("Fail", "Failed to create object ICE not available")
				}
				else if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				else if (data == "fail") {
					openDialog("Fail", "Failed to create object")
				}
				else{
					console.log("success!::::" + data);
					obj=JSON.stringify(data)
					$("#dialog-userObject").modal("show");
					$("#userObjContainer").empty()
					$("#addMoreObject").attr("style","display:none");
					objname=ele.find('.ellipsis')[0].textContent
					$("#userObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name" value="'+objname.slice(0,objname.lastIndexOf("_"))+'"></div><div class="form-group form-group-2"><select class="form-control form-control-custom" ><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObjRow" ng-click="addMoreUserObject()" src="imgs/ic-add.png" style="display:none"><div class="propertiesTab"><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter URL" id="url"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter name" id="name"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Relative xpath" id="rpath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Absolute xpath" id="apath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter class name" id="classname"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter ID"  id="id"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Query Selector"  id="selector"><button class="btn btn-defaultsave" id="saveProperties" ng-click="saveProp()">Save</button></div></div><img class="editAddObjRow" src="imgs/ic-jq-editstep.png" /></div>')
					$(".deleteAddObjRow").attr("style","display:none");
					$('.form-group-2 select').val(data.tag)
					$('#url').val(data.url)
					$('#name').val(data.name)
					$('#rpath').val(data.rpath)
					$('#apath').val(data.apath)
					$('#id').val(data.id)
					$('#classname').val(data.classname)
					$('#selector').val(data.selector)
				}
				// angular.element(document.getElementById("tableActionButtons")).scope().removeAddObjectSelection();
			}, function (error) { });
	});
	//Show compared objects
	$(document).on('click', '#comparedObjects', function () {
		$("#scrapTree,.fsScroll").hide();
		$("#compareChangedObjectsBox,#compareUnchangedObjectsBox,#compareNotFoundObjectsBox").show();
		//$("#viewScrapedObjects").show();
	});
	$(document).on('shown.bs.modal', '#deleteObjectsModal', function () {
		var task = JSON.parse(window.localStorage['_CT'])
		deleteObjectsFlag = true;
		if (task.reuse == 'True') {
			$("#deleteObjectsModal").find('.modal-body p').text("Screen is been reused. Are you sure you want to delete objects?").css('color', 'black');
		} else {
			$("#deleteObjectsModal").find('.modal-body p').text("Are you sure you want to delete objects?").css('color', 'black');
		}
	});

	//Delete Scraped Objects
	function deleteScrapedObjects(e) {
		var totalElements = $(".ellipsis").length;
		var selectedElements = $("input[type=checkbox].checkall:checked:visible").length;
		// var currentElements = $(".ellipsis:visible").length
		var filterActiveLen = $(".popupContent-filter-active").length;
		//Delete All Elements
		getIndexOfDeletedObjects = []
		if (totalElements == selectedElements) {
			$("#scraplist").empty();
			var currentElements = $(".ellipsis:visible").length;
			$("a.disableActions").removeClass("disableActions");
			$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');
			$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');

			getIndexOfDeletedObjects = []
			viewString = {};
			if (newScrapedList != undefined) {
				newScrapedList.view = [];
				newScrapedList.mirror = "";
			}
			if (currentElements > 0) {
				$("#deleteObjects,#saveObjects").prop("disabled", false);
				$(".checkStylebox").prop("checked", false);
			}
			else {
				$("#deleteObjects,.checkStylebox").prop("disabled", true);
				$(".checkStylebox").prop("checked", false);
				$(".popupContent-filter-active").trigger('click');
				$("#saveObjects").prop("disabled", false);
			}
			getIndexOfDeletedObjects = ["deleteAll"]
		}
		else {
					$.each($("input[type=checkbox].checkall:checked"), function (index) {
						$(this).parents("li.select_all").remove();
						var deleteObjId = $(this)[0].parentElement.id.split('_')[1];
						var deleteObject = viewString.view[deleteObjId]; 
						getIndexOfDeletedObjects.push(deleteObject);	})
					
		}
		var isduplicate = duplicateCheck();
		if (isduplicate == false) {
			unblockUI();
			return;
		}
		var tasks = JSON.parse(window.localStorage['_CT']);
		var screenId = tasks.screenId;
		var screenName = tasks.screenName;
		var projectId = tasks.projectId;
		var userinfo = JSON.parse(window.localStorage['_UI']);
		scrapeObject = {};
		scrapeObject.getScrapeData =JSON.stringify(getIndexOfDeletedObjects);
		scrapeObject.projectId = projectId;
		scrapeObject.screenId = screenId;
		scrapeObject.screenName = screenName;
		scrapeObject.userinfo = userinfo;
		scrapeObject.param = "delete_updateScrapeData_ICE";
		scrapeObject.appType = tasks.appType;
		scrapeObject.versionnumber = tasks.versionnumber;
		scrapeObject.newData = viewString;
		if(deleteObjectsFlag==true){
			scrapeObject.type = "delete";
			deleteObjectsFlag = false;
		}
		else
			scrapeObject.type = "save";
		//Update Service to Save Scrape Objects
		DesignServices.updateScreen_ICE(scrapeObject)
			.then(function (data) {
				getIndexOfDeletedObjects = [];
				angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
				unblockUI()
				//add popoup for error and saved 
			}, function (error) {unblockUI() })
		
		var currentElements = $(".ellipsis:visible").length;
		if (currentElements > 0) {
			$("#saveObjects").prop("disabled", false);
			$(".checkStylebox").prop("checked", false);
			$("#deleteObjects").prop("disabled", true);
		}
		else {
			$("#deleteObjects,.checkStylebox").prop("disabled", true);
			$(".checkStylebox").prop("checked", false);
			$(".popupContent-filter-active").trigger('click');
			$("#saveObjects").prop("disabled", false);
		}
	}

	//Validtion for Duplicate Scraped Objects
	function duplicateCheck()
	{
		var xpath;
		var duplicateCustnames = [];
		var duplicateXpath = [];
		var duplicateXpathElements = {};
		var duplicateCustnamesElements = {};
		var isDuplicateCustNames = false;
		var isDuplicateXpath = false;
		//validateDuplicateObjects
		if ($("#scraplist .ellipsis").length > 0) {
			$.each($("#scraplist span.ellipsis"), function () {
				$(this).removeClass('duplicateCustname duplicateXpath');
				var count = 0;
				if ($(this).parent().parent().attr("data-xpath") != "" && $(this).parent().parent().attr("data-xpath") != undefined) {
					xpath = $(this).parent().parent().attr("data-xpath");
					if (appType == 'MobileWeb') {
						xpath = xpath.split(";")[2];
					}
					else {
						xpath = xpath;
					}
					if (count == 0 && !duplicateCustnamesElements.hasOwnProperty($(this).text())) {
						duplicateCustnamesElements[$(this).text()] = xpath;
					} else if (duplicateCustnamesElements.hasOwnProperty($(this).text())) {
						if (count == 0) {
							duplicateCustnames.push($(this).text());
							isDuplicateCustNames = true;
							$(this).addClass('duplicateCustname').css('color', 'red');
						}
					}
				} else {
					xpath = "";
					if (!duplicateCustnamesElements.hasOwnProperty($(this).text())) {
						duplicateCustnamesElements[$(this).text()] = xpath;
					} else {
						duplicateCustnames.push($(this).text());
						isDuplicateCustNames = true;
						$(this).addClass('duplicateCustname').css('color', 'red');
					}
				}
			});
			if (!isDuplicateCustNames) {
				var count = 0;
				$.each($("#scraplist span.ellipsis"), function () {
					xpath = $(this).parent().parent().attr("data-xpath");
					if ($(this).parent().parent().attr("data-xpath") != "" && $(this).parent().parent().attr("data-xpath") != undefined) {
						if (appType == 'MobileWeb') {
							xpath = xpath.split(";")[2];
						}
						else {
							xpath = xpath;
						}
						if (!duplicateXpathElements.hasOwnProperty(xpath)) {
							duplicateXpathElements[xpath] = $(this).text();
						} else {
							$(this).addClass('duplicateXpath').css('color', 'red');
							duplicateCustnames.push($(this).text());
							isDuplicateXpath = true;
							count = 1;
						}
					}
				});
			}

			if (isDuplicateCustNames) {
				openDialog("Save Scrape data", "");
				$("#globalModal").find('.modal-body p').html("<span><strong>Please rename/delete duplicate scraped objects</strong></span><br /><br /><strong>Object characterstics are same for:</strong>").css("color", "#000").append("<ul class='custList'></ul>");
				for (var j = 0; j < duplicateCustnames.length; j++) {
					$("#globalModal").find('.modal-body p ul').append("<li>" + duplicateCustnames[j] + "</li>");
				}
				return false;
			}
			//for delete if there are multiple xpath goes to save
			/*
			else {
				if (isDuplicateXpath) {
					$("#saveConfirmObjects").modal('show');
					$("#saveConfirmObjects").find('.modal-body p').html("<strong>Object characteristics are same for the below list of objects:").css("color", "#000").append("<ul class='custList'></ul><br /> Do you still want to continue?");
					for (var j = 0; j < duplicateCustnames.length; j++) {
						$("#saveConfirmObjects").find('.modal-body p ul').append("<li>" + duplicateCustnames[j] + "</li>");
					}
					return false;
				}
			}*/
		}
	}

	//To delete Scrape Objects
	$scope.del_Objects = function (e) {
		blockUI('Deleting objects..please wait..')
		$("#deleteObjectsModal").modal("hide");

		if (deleteScrapeDataservice) {
			var userinfo = JSON.parse(window.localStorage['_UI']);
			//var tasks = JSON.parse(window.localStorage['_TJ']);
			var tasks = JSON.parse(window.localStorage['_CT']);
			var delList = {};
			var deletedCustNames = [];
			var deletedCustPath = [];
			var deletedIndex = [];

			var checkCondLen = $("#scraplist li").children('a').find('input[type=checkbox].checkall:checked:visible').length;
			if (checkCondLen > 0) {
				$('input[type=checkbox].checkall:checked:visible').each(function () {
					var id = $(this).parent().attr('id').split("_");
					id = id[1];
					if (eaCheckbox == false && Object.keys(viewString.view).length != 0) {
						deletedCustNames.push(viewString.view[id].custname);
						deletedCustPath.push(viewString.view[id].xpath);
						deletedIndex.push(id);
					}
					else if (eaCheckbox == true && Object.keys(viewString.view).length == 0) {
						deletedCustNames.push(newScrapedList.view[id].custname);
						deletedCustPath.push(newScrapedList.view[id].xpath);
						deletedIndex.push(id);
					}

					//deletedIndex.push()
					// console.log(viewString.view[id])
				});
				delList.deletedCustName = deletedCustNames;
				delList.deletedXpath = deletedCustPath;
				delList.deletedIndex = deletedIndex;
				//console.log(deletedCustNames);
			}

			//updating renamed objects
			var tempModifiednames;
			if (window.localStorage['_modified']) {
				modifiednames = JSON.parse(window.localStorage['_modified']);
				tempModifiednames = JSON.parse(window.localStorage['_modified']);
			}
			if (eaCheckbox) {
				if (copiedViewstring != true) {
					for (var j = 0; j < viewString.view.length; j++) {
						newScrapedList.view.push(viewString.view[j]);
					}
					copiedViewstring = true;
				}
			}
			if (modifiednames.length > 0) {
				var mdName;
				for (var i = 0; i < modifiednames.length; i++) {
					mdName = modifiednames[i].split("^^");
					if (eaCheckbox) {
						if (mdName[1] != undefined) {
							if (newScrapedList.view[mdName[1]])
								newScrapedList.view[mdName[1]].custname = mdName[0];
							tempModifiednames[i] = mdName[0];
							//tempModifiednames = tempModifiednames.filter(function(n) {return n != null});
							window.localStorage['_modified'] = JSON.stringify(tempModifiednames)
						}
					}
					else {
						if (mdName[1] != undefined) {
							if (viewString.view[mdName[1]])
								viewString.view[mdName[1]].custname = mdName[0];
							tempModifiednames[i] = mdName[0];
							//tempModifiednames = tempModifiednames.filter(function(n) {return n != null});
							window.localStorage['_modified'] = JSON.stringify(tempModifiednames)
						}
					}
				}
			}
			//Delete all objects ------------------------------------------
			deleteScrapedObjects(e);
			//$("#saveObjects").trigger('click');
		} else {
			var tempModifiednames;
			if (window.localStorage['_modified']) {
				modifiednames = JSON.parse(window.localStorage['_modified']);
				tempModifiednames = JSON.parse(window.localStorage['_modified']);
			}
			if (eaCheckbox) {
				if (copiedViewstring != true) {
					for (var j = 0; j < viewString.view.length; j++) {
						newScrapedList.view.push(viewString.view[j]);
					}
					copiedViewstring = true;
				}
			}
			if (modifiednames.length > 0) {
				var mdName;
				for (var i = 0; i < modifiednames.length; i++) {
					mdName = modifiednames[i].split("^^");
					if (eaCheckbox) {
						if (mdName[1] != undefined) {
							if (newScrapedList.view[mdName[1]])
								newScrapedList.view[mdName[1]].custname = mdName[0];
							tempModifiednames[i] = mdName[0];
							window.localStorage['_modified'] = JSON.stringify(tempModifiednames)
						}
					}
					else {
						if (mdName[1] != undefined) {
							if (viewString.view[mdName[1]])
								viewString.view[mdName[1]].custname = mdName[0];
							tempModifiednames[i] = mdName[0];
							window.localStorage['_modified'] = JSON.stringify(tempModifiednames)
						}
					}
				}
			}
			if ($(".parentObjContainer").find(".checkStylebox").is(":checked") && saveScrapeDataFlag == true) {
				viewString.view = [];
				viewString.mirror = "";
				if (newScrapedList != undefined) {
					newScrapedList.view = [];
					newScrapedList.mirror = "";
				}
				var totalElements = $(".ellipsis").length;
				var selectedElements = $(".ellipsis:visible").length;
				if (totalElements == selectedElements) {
					$("#scraplist").empty();
				}
				else {
					$("#scraplist").children("li:visible").empty();
				}
				var currentElements = $(".ellipsis:visible").length;
				if (currentElements > 0) {
					$("#deleteObjects,#saveObjects").prop("disabled", false);
					$(".checkStylebox").prop("checked", false);
				}
				else {
					$("#deleteObjects,.checkStylebox").prop("disabled", true);
					$(".checkStylebox").prop("checked", false);

				}
			} else if (!$("input[type=checkbox].checkall").is(":checked")) {
				openDialog("Delete Scrape data", "Please select objects to delete.")
			} else {
				if (eaCheckbox) {
					var totalElements = $(".ellipsis").length;
					var selectedElements = $("input[type=checkbox].checkall:checked:visible").length;
					if (totalElements == selectedElements) {
						$("#scraplist").empty();
						var currentElements = $(".ellipsis:visible").length;
						$("a.disableActions").removeClass("disableActions");
						$("li.compareObjects").removeClass('enableActions').addClass('disableActions compareObjectDisable');
						$("li.generateObj").removeClass('enableActions').addClass('disableActions addObjectDisable');

						getIndexOfDeletedObjects = [];
						viewString = {};
						if (newScrapedList != undefined) {
							newScrapedList.view = [];
							newScrapedList.mirror = "";
						}
					}
					else {
						var temp_scrapedlist = JSON.stringify(newScrapedList)
						var dontChkViewString = 0;
						$.each($("input[type=checkbox].checkall:checked"), function () {
							var delId = $(this).parent().attr('id').split('_')[1];
							$(this).parents("li.select_all").remove();
							delete newScrapedList.view[delId];
						});						
						var isduplicate = duplicateCheck();
						if (isduplicate == false) {
							unblockUI();
							//newScrapedList.view = JSON.parse(temp_scrapedlist).view
							return;
						}
						newScrapedList.view = newScrapedList.view.filter(function (n) {
							return n != null;
						})
						var tasks = JSON.parse(window.localStorage['_CT']);
						var screenId = tasks.screenId;
						var screenName = tasks.screenName;
						var projectId = tasks.projectId;
						var userinfo = JSON.parse(window.localStorage['_UI']);
						scrapeObject = {};
						scrapeObject.getScrapeData =JSON.stringify(newScrapedList);
						scrapeObject.projectId = projectId;
						scrapeObject.screenId = screenId;
						scrapeObject.screenName = screenName;
						scrapeObject.userinfo = userinfo;
						scrapeObject.param = "updateScrapeData_ICE";
						scrapeObject.appType = tasks.appType;
						scrapeObject.versionnumber = tasks.versionnumber;
						scrapeObject.newData = viewString;
						if(deleteObjectsFlag==true){
							scrapeObject.type = "delete";
							deleteObjectsFlag = false;
						}
						else
							scrapeObject.type = "save";
						//Update Service to Save Scrape Objects
						DesignServices.updateScreen_ICE(scrapeObject)
							.then(function (data) {
								getIndexOfDeletedObjects = [];
								angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
								unblockUI()
								//add popoup for error and saved 
							}, function (error) {unblockUI()  })
							return;
/*	
						$.each($("input[type=checkbox].checkall:checked"), function () {
							for (var i = 0; i < newScrapedList.view.length; i++) {
								if (appType == 'DesktopJava'|| appType == 'Desktop' || appType == 'MobileApp') {
									if ($(this).parents("li").data("xpath").replace(/[\"]/g, "\'") == newScrapedList.view[i].xpath.replace(/\n/g," ") && ($(this).parent('.objectNames').siblings(".ellipsis").text().trim()).replace(/[<>]/g, '').replace('\n', ' ') == newScrapedList.view[i].custname.trim().replace(/[<>]/g, '').replace('/\s/g', ' ').replace(/  +/g, ' ').replace('\n', ' ')) {
										if (!(isInArray(newScrapedList.view.indexOf(newScrapedList.view[i]), getIndexOfDeletedObjects))) {
											getIndexOfDeletedObjects.push(newScrapedList.view.indexOf(newScrapedList.view[i]))
											$(this).parents("li.select_all").remove();
											dontChkViewString++;
											break;
										}
									}
								}
								else {
									if ($(this).parents("li").data("xpath") == newScrapedList.view[i].xpath && ($(this).parent('.objectNames').siblings(".ellipsis").text().trim().replace('/\s/g', ' ')).replace('\n', ' ') == newScrapedList.view[i].custname.trim().replace(/[<>]/g, '')) {
										if (!(isInArray(newScrapedList.view.indexOf(newScrapedList.view[i]), getIndexOfDeletedObjects))) {
											getIndexOfDeletedObjects.push(newScrapedList.view.indexOf(newScrapedList.view[i]))
											$(this).parents("li.select_all").remove();
											dontChkViewString++;
											break;
										}
									}
								}
							}
						})
						if ($("input[type=checkbox].checkall:checked").length != dontChkViewString) {
							$.each($("input[type=checkbox].checkall:checked"), function () {
								for (var i = 0; i < viewString.view.length; i++) {
									if (appType == 'DesktopJava' || appType == 'MobileApp') {
										if ($(this).parents("li").data("xpath") == viewString.view[i].xpath && ($(this).parent('.objectNames').siblings(".ellipsis").text().trim().replace('/\s/g', ' ')).replace('\n', ' ').replace(/[<>]/g, '') == viewString.view[i].custname.trim().replace(/[<>]/g, '').replace('/\s/g', ' ').replace(/  +/g, ' ').replace('\n', ' ')) {
											if (!(isInArray(viewString.view.indexOf(viewString.view[i]), getIndexOfDeletedObjects))) {
												getIndexOfDeletedObjects.push(viewString.view.indexOf(viewString.view[i]))
												$(this).parents("li.select_all").remove();
												break;
											}
										}
									}
									else {
										if ($(this).parents("li").data("xpath") == viewString.view[i].xpath && ($(this).parent('.objectNames').siblings(".ellipsis").text().trim().replace('/\s/g', ' ')).replace('\n', ' ').replace(/[<>]/g, '') == viewString.view[i].custname.trim().replace(/[<>]/g, '')) {
											if (!(isInArray(viewString.view.indexOf(viewString.view[i]), getIndexOfDeletedObjects))) {
												getIndexOfDeletedObjects.push(viewString.view.indexOf(viewString.view[i]))
												$(this).parents("li.select_all").remove();
												break;
											}
										}
									}
								}
							})
						}*/
					}
					deleteScrapedObjects(e)
					//$("#saveObjects").trigger('click');
				}
				else {
					deleteScrapedObjects(e);
					$("#saveObjects").trigger('click');
				}
				$("#deleteObjects").prop("disabled", true);
			}
		}
		if ($(".ellipsis").length == 0) {
			$(".checkStylebox").prop('disabled', true);
			if (saveScrapeDataFlag == false) {
				$("#saveObjects").prop("disabled", true);
			}

		}
	}

	function isInArray(value, array) {
		return array.indexOf(value) > -1;
	}

	var showSearchBox = true;
	//Search scraped objects
	$(document).on("click", ".searchScrapEle", function () {
		if (showSearchBox) {
			$(".searchScrapInput").show();
			showSearchBox = false;
			$(".searchScrapInput").focus();
		} else {
			$(".searchScrapInput").hide();
			showSearchBox = true;
		}
	})

	//Search Scrape objects filter
	$(document).on('keyup', '.searchScrapInput', function () {
		var count = 0;
		var numberOfElems = 0;
		var value = $(this).val();

		$(".select_all").each(function () {
			if ($(this).find("span.ellipsis").text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				numberOfElems++;
				$(this).show();
				//console.log($(this).find("input").hasClass("checked"));
				if (!$(this).find("input").hasClass("checked")) {
					count = 1;
				}
			} else {
				$(this).hide();
			}
		});

		if (numberOfElems == 0) {
			$("#deleteObjects,.checkStylebox").prop("disabled", true);
		}
		else {
			$("#deleteObjects,.checkStylebox").prop("disabled", false);
		}
		//  var checkedLen = $(".ellipsis:checked").length;
		var checkedLen = $("#scraplist li").children('a').find('input[type=checkbox].checkall:checked:visible').length;
		if (checkedLen == 0) {
			$("#deleteObjects").prop("disabled", true);
		}
		if (numberOfElems == 0 && count == 0) {
			$('.checkStylebox').prop("checked", false);
		}
		if (numberOfElems != 0 && count == 0) {
			if ($("#scraplist li").children('a').find('input[type=checkbox].checkall:checked:visible').length > 0) {
				$('.checkStylebox').prop("checked", true);
			}
			else {
				$('.checkStylebox').prop("checked", false);
			}

		} else {
			$('.checkStylebox').prop("checked", false);
		}
	});

	//Highlight Element on browser
	$scope.highlightScrapElement = function (xpath, url) {
		var appType = $scope.getScreenView;
		//if(enableScreenShotHighlight == true){
		console.log("Init ScreenShot Highlight")
		var data = {
			args: [$("#scrapTree").find(".focus-highlight").parents("a")[0]],
			rlbk: false,
			rslt: {
				obj: $("#scrapTree").find(".focus-highlight").closest("li")
			}
		}
		//console.log(data)
		var rect, type, ref, name, id, value, label, visible, l10n, source;
		if (appType == "MobileWeb") {
			if (parseInt(viewString.mirrorwidth) > 500) {
				x = (parseInt(data.rslt.obj.data("left") * 490) / parseInt(viewString.mirrorwidth))
				y = (parseInt(data.rslt.obj.data("top") * 761) / parseInt(viewString.mirrorheight))
				w = (parseInt(data.rslt.obj.data("width") * 490) / parseInt(viewString.mirrorwidth))
				h = (parseInt(data.rslt.obj.data("height") * 761) / parseInt(viewString.mirrorheight))
				rect = {
					x: x.toString(),
					y: y.toString(),
					w: w.toString(),
					h: h.toString()
				}

			}
			else {
				rect = {
					x: data.rslt.obj.data("left"),
					y: data.rslt.obj.data("top"),
					w: data.rslt.obj.data("width"),
					h: data.rslt.obj.data("height")
				}
			}

		}
		else {
			rect = {
				x: data.rslt.obj.data("left"),
				y: data.rslt.obj.data("top"),
				w: data.rslt.obj.data("width"),
				h: data.rslt.obj.data("height")
			}
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
			var getTopValue, getTopValueios;

			var screen_width = document.getElementById('screenshot').height;
			var real_width = document.getElementById('screenshot').naturalHeight;
			scale_highlight = 1 / (real_width / screen_width);
			d.appendTo("#screenShotScrape");
			d.css('border', "1px solid red");
			if (appType == "MobileApp") {
				if (navigator.appVersion.indexOf("Win") != -1) {
					d.css('left', (rect.x * scale_highlight) + 'px');
					d.css('top', (rect.y * scale_highlight) + 'px');
					d.css('height', (rect.h * scale_highlight) + 'px');
					d.css('width', (rect.w * scale_highlight) + 'px');
				} else if (navigator.appVersion.indexOf("Mac") != -1) {
					d.css('left', (rect.x * scale_highlight) + 'px');
					d.css('top', (rect.y * scale_highlight) + 'px');
					d.css('height', (rect.h * scale_highlight) + 'px');
					d.css('width', (rect.w * scale_highlight) + 'px');
				}
			} else if (appType == "MobileWeb") {
				if (navigator.appVersion.indexOf("Mac") != -1) {
					d.css('left', (rect.x + 15) + 'px');
					d.css('top', (rect.y + 112) + 'px');
					d.css('height', rect.h + 'px');
					d.css('width', rect.w + 'px');
				} else {
					if (parseInt(viewString.mirrorwidth) > 500) {
						d.css('left', (rect.x) + 'px');
						d.css('top', (rect.y) + 'px');
						d.css('height', rect.h + 'px');
						d.css('width', rect.w + 'px');
					}
					else {
						d.css('left', (rect.x - 2) + 'px');
						d.css('top', (rect.y - 6) + 'px');
						d.css('height', rect.h + 'px');
						d.css('width', rect.w + 'px');
					}

				}
			} else if (appType == "SAP") {
				d.css('left', (Math.round(rect.x) * scale_highlight) + 3 + 'px');
				d.css('top', (Math.round(rect.y) * scale_highlight) + 2 + 'px');
				d.css('height', Math.round(rect.h) * scale_highlight + 'px');
				d.css('width', Math.round(rect.w) * scale_highlight + 'px');
			} else {
				d.css('left', Math.round(rect.x) * scale_highlight + 'px');
				d.css('top', Math.round(rect.y) * scale_highlight + 'px');
				d.css('height', Math.round(rect.h) * scale_highlight + 'px');
				d.css('width', Math.round(rect.w) * scale_highlight + 'px');
			}
			d.css('position', 'absolute');
			d.css('background-color', 'yellow');
			d.css('z-index', '3');
			d.css('opacity', '0.7');
			getTopValue = Math.round(rect.y) * scale_highlight + 'px';
			getTopValueios = Math.round(rect.y) * scale_highlight + 100 + 'px'
			if (appType == "MobileApp")
				if (navigator.appVersion.indexOf("Mac") != -1) $(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(getTopValueios) }, 500);
				else $(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(Math.round(rect.y) - 600) + 'px' }, 500);
			else
				$(".scroll-wrapper > .scrollbar-screenshot").animate({ scrollTop: parseInt(getTopValue) }, 500);
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
		if(!xpath.startsWith('iris')){
			DesignServices.highlightScrapElement_ICE(xpath, url, appType)
				.then(function (data) {
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					if (data == "fail") {
						openDialog("Fail", "Failed to highlight")
					}
					console.log("success!::::" + data);
				}, function (error) { });
		}
	};
	//Highlight Element on browser

	//Highlight compared and updated objects
	//Highlight Element on browser
	$scope.highlightComparedScrapElements = function (xpath, url, uid) {
		var appType = $scope.getScreenView;
		//console.log("uid",uid);
		//if(enableScreenShotHighlight == true){
		console.log("Init ScreenShot Highlight");
		var data = {
			args: [$("#" + uid).find(".focus-highlight").parents("a")[0]],
			rlbk: false,
			rslt: {
				obj: $("#" + uid).find(".focus-highlight").closest("li")
			}
		}
		// console.log(data)
		var rect, type, ref, name, id, value, label, visible, l10n, source;
		rect = {
			x: data.rslt.obj.data("left"),
			y: data.rslt.obj.data("top"),
			w: data.rslt.obj.data("width"),
			h: data.rslt.obj.data("height")
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
			scale_highlight = 1 / (real_width / screen_width)
			d.appendTo("#screenShotScrape");
			d.css('border', "1px solid red");
			if (appType == "MobileWeb") {
				d.css('left', Math.round(rect.x) * 1.5 * scale_highlight + 'px');
				d.css('top', Math.round(rect.y) * 1.5 * scale_highlight + 'px');
				d.css('height', Math.round(rect.h) * 1.5 * scale_highlight + 'px');
				d.css('width', Math.round(rect.w) * 1.5 * scale_highlight + 'px');
			} else if (appType == "SAP") {
				d.css('left', (Math.round(rect.x) * scale_highlight) + 3 + 'px');
				d.css('top', (Math.round(rect.y) * scale_highlight) + 2 + 'px');
				d.css('height', Math.round(rect.h) * scale_highlight + 'px');
				d.css('width', Math.round(rect.w) * scale_highlight + 'px');
			} else {
				d.css('left', Math.round(rect.x) * scale_highlight + 'px');
				d.css('top', Math.round(rect.y) * scale_highlight + 'px');
				d.css('height', Math.round(rect.h) * scale_highlight + 'px');
				d.css('width', Math.round(rect.w) * scale_highlight + 'px');
			}
			d.css('position', 'absolute');
			d.css('background-color', 'yellow');
			d.css('z-index', '3');
			d.css('opacity', '0.7');
			getTopValue = Math.round(rect.y) * scale_highlight + 'px'
			$(".scroll-wrapper > .scrollbar-screenshot").animate({
				scrollTop: parseInt(getTopValue)
			}, 500);
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
		if(!xpath.startsWith('iris')){
			DesignServices.highlightScrapElement_ICE(xpath, url, appType)
				.then(function (data) {
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					if (data == "fail") {
						openDialog("Fail", "Failed to highlight")
					}
					console.log("success!::::" + data);
				}, function (error) { });
		}
	};
	//Highlight compared and updated objects

	//Add Object Functionality
	$scope.addObj = function () {

		$(".generateObj span img").removeClass("left-bottom-selection");
		$(".compareObject span img").removeClass("left-bottom-selection");
		$(".addObject span img").addClass("left-bottom-selection");

		$scope.errorMessage = "";
		$("#dialog-addObject").modal("show");
		$("#addObjContainer").empty();
		$("#userObjContainer").empty();						
		if ($(".addObj-row").length > 1) $(".addObj-row").remove()
		$("#addObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObject" src="imgs/ic-add.png"></div>')

		$scope.removeAddObjectSelection = function () {
			$("img.left-bottom-selection").removeClass('left-bottom-selection');
		};
	};
	//Add Object Functionality
	
	//User Object Functionality
	$(document).on('click', '.userObject', function(e) {
		// alert(e.target.id);
		var param =e.currentTarget.id;
		$(".generateObj span img").removeClass("left-bottom-selection");
		$(".compareObject span img").removeClass("left-bottom-selection");
		$(".addObject span img").removeClass("left-bottom-selection");
		$(".userObject span img").addClass("left-bottom-selection");
		if(param=='encrypt'){
			//$scope.errorMessage = "";
			$('.errorMessage').val('');
			$("#dialog-userObject").modal("show");
			$("#userObjContainer").empty();
			$("#addObjContainer").empty();					
			$("#addMoreObject").attr("style","display:block");
			$("#dialog-userObject").find("#rubmitObjRow").attr("disabled","disabled")
			if ($(".addObj-row").length > 1) $(".addObj-row").remove()
			$("#userObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObjRow" ng-click="addMoreUserObject()" src="imgs/ic-add.png"><div class="propertiesTab"><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter URL" id="url"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter name" id="name"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Relative xpath" id="rpath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Absolute xpath" id="apath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter class name" id="classname"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter ID" id="id"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Query Selector" id="selector"><button class="btn btn-defaultsave" id="saveProperties" ng-click="saveProp()">Save</button></div></div><img class="editAddObjRow" src="imgs/ic-jq-editstep.png" /></div>')
		
		}else if(param=='decrypt'){
			//$scope.errorMessage = "";
			$('.errorMessage').val('');
			custObjProps=[]
			custObjProps.push('decrypt')
			custObjProps.push($(e.target.parentElement.parentElement).attr('data-xpath'))
			custObjProps.push($(e.target.parentElement.parentElement).attr('data-url'))
			custObjProps.push($(e.target.parentElement.parentElement).attr('data-tag'))
			DesignServices.userObjectElement_ICE(custObjProps)
			.then(function (data) {
				if (data == "unavailableLocalServer") {
					openDialog("Fail", "Failed to create object ICE not available")
				}
				else if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				else if (data == "fail") {
					openDialog("Fail", "Failed to create object")
				}
				else{
					console.log("success!::::" + data);
					obj=JSON.stringify(data)
					$("#dialog-userObject").modal("show");
					$("#userObjContainer").empty()
					$("#addMoreObject").attr("style","display:none");
					$("#userObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name" value='+e.currentTarget.parentElement.children[0].children[2].textContent.split("_")[0]+'></div><div class="form-group form-group-2"><select class="form-control form-control-custom" ><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObjRow" ng-click="addMoreUserObject()" src="imgs/ic-add.png"><div class="propertiesTab"><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter URL" id="url"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter name" id="name"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Relative xpath" id="rpath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Absolute xpath" id="apath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter class name" id="classname"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter ID"  id="id"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Query Selector"  id="selector"><button class="btn btn-defaultsave" id="saveProperties" ng-click="saveProp()">Save</button></div></div><img class="editAddObjRow" src="imgs/ic-jq-editstep.png" /></div>')
					$(".deleteAddObjRow").attr("style","display:none");
					$('.form-group-2 select').val(data.tag)
					$('#url').val(data.url)
					$('#name').val(data.name)
					$('#rpath').val(data.rpath)
					$('#apath').val(data.apath)
					$('#id').val(data.id)
					$('#classname').val(data.classname)
					$('#selector').val(data.selector)
				}
				// angular.element(document.getElementById("tableActionButtons")).scope().removeAddObjectSelection();
			}, function (error) { });
		}
		$scope.removeAddObjectSelection = function () {
			$("img.left-bottom-selection").removeClass('left-bottom-selection');
		};
		angular.element(document.getElementById("tableActionButtons")).scope().removeAddObjectSelection();
	});
	//User Object Functionality
	
	//Save User Object
	$(document).on("click", ".btn-defaultsave", function () {
			custObjProps=[];
			custObjNames=[];
			var flag="false";
			custObjProps.push('encrypt');
			$('input.form-control.form-control-custom').removeAttr("style");
			$("select.form-control.form-control-custom").removeAttr("style");
			$('#url').removeAttr("style");
			ele=$(this).offsetParent()
			$('.addObj-row').each(function(){
				if ($.trim(ele.find('input.form-control.form-control-custom').val()) == "") {
					ele.find('input.form-control.form-control-custom').attr("style", "border-bottom: 2px solid #d33c3c !important;").focus();
					flag="true";
				}else if (ele.find("select option:selected").val() == "Select Object Type") {
					//$scope.errorMessage = "Please select object type";
					//$(".addObjTopWrap").find(".error-msg-abs").text("Please select object type");
					ele.find("select").attr("style", "border-bottom: 4px solid #d33c3c !important;").focus(); //.addClass('selectErrorBorder')
					flag = "true";
				}else if($.trim(ele.find('#url').val())==""){
					ele.find('#url').attr("style", "border-bottom: 2px solid #d33c3c !important;").focus();
					flag="true";
				}else if(ele.find('#id').val()=="" && ele.find('#classname').val()=="" && ele.find('#rpath').val()=="" && ele.find('#apath').val()=="" && ele.find('#name').val()=="" && ele.find('#selector').val()==""){
					flag="true";
					openDialog("Warning!!","Please enter at least one property")
				}
			}); 
			if(flag=="true"){
				return false;
			}
			ele.find('input.form-control-custom-prop').each(function () {
				custObjProps.push($.trim($(this).val()));
			});
			var typeOfElement=ele.find('select option:selected').attr('typeofelement');
			custObjProps.push(typeOfElement)
			obj={}
			DesignServices.userObjectElement_ICE(custObjProps)
			.then(function (data) {
				if (data == "unavailableLocalServer") {
					openDialog("Fail", "Failed to create object ICE not available")
				}
				else if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				else if (data == "fail") {
					openDialog("Fail", "Failed to create object")
				}
				else{
					console.log("success!::::" + data);

					ele.find('input.form-control-custom').each(function () {
						custObjNames.push($.trim($(this).val()));
					});
					obj=JSON.parse(localStorage['_cust'])
					obj[custObjNames]={url:data.url,xpath:data.xpath}
					localStorage["_cust"]=JSON.stringify(obj)
					ele.find(".propertiesTab").hide();
					if($('.btn-defaultsave').is("visible") == false)
					{
						$("#dialog-userObject").find("#rubmitObjRow").removeAttr("disabled")
					}
				}
			}, function (error) { });
		});
	//Save User Object
	
	//Delete Custom Object Row
	$(document).on("click", ".deleteAddObjRow", function () {
		if($(this).parent().parent().find('img.deleteAddObjRow').length>1){
			if($(this).parent().find('img.addMoreObjRow').is(':visible')){
				$(this).parent().prev().find('img.addMoreObjRow').show()
			}
			if($(this).parent().find('img.addMoreObject').is(':visible')){
				$(this).parent().prev().find('img.addMoreObject').show()
			}
			$(this).parent(".addObj-row").remove();
		}else if($(this).parent().parent().find('img.deleteAddObjRow').length==1){
			$(this).parent().find("input").val('');
			$(this).parent().find("input").removeClass('inputErrorBorderBottom')
			$("select").prop('selectedIndex', 0);
		}
	});
	
	
	//Edit User Object Row
	$(document).on("click", ".editAddObjRow", function () {
		$(this).offsetParent().find('.propertiesTab').show()
	});
	
	//Add More Object Functionality
	// $scope.addMoreObject = function () {
	// 	$("#addObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a">Link</option><option value="input">Textbox/Textarea</option><option value="table">Table</option><option value="list">List</option><option value="select">Dropdown</option><option value="img">Image</option><option value="button">Button</option><option value="radiobutton">Radiobutton</option><option value="checkbox">Checkbox</option><option value="Element">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObject" src="imgs/ic-add.png"></div>')
	// };
	$(document).on("click",".addMoreObject", function(){
		$(this).parent().children('.addMoreObject').hide();
		$("#addObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><img class="addMoreObject" src="imgs/ic-add.png"></div>')
	});
	//Add More Object Functionality
	
	//Add More User Object Functionality
	// $scope.addMoreUserObject = function () {
	// 	$("#userObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a">Link</option><option value="input">Textbox/Textarea</option><option value="table">Table</option><option value="list">List</option><option value="select">Dropdown</option><option value="img">Image</option><option value="button">Button</option><option value="radiobutton">Radiobutton</option><option value="checkbox">Checkbox</option><option value="Element">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><div class="propertiesTab"><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter URL" id="url"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter name" id="name"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Relative xpath" id="rpath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Absolute xpath" id="apath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter class name" id="classname"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter ID" id="id"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Query Selector" id="selector"><button class="btn btn-defaultsave" id="saveProperties" ng-click="saveProp()">Save</button></div></div><img class="editAddObjRow" src="imgs/ic-jq-editstep.png" /><img class="addMoreObjRow" ng-click="addMoreObject()" src="imgs/ic-add.png"></div>')
	// };
	$(document).on("click",".addMoreObjRow", function(){
		$(this).parent().children('.addMoreObjRow').hide();
		$("#userObjContainer").append('<div class="row row-modal addObj-row"><div class="form-group"><input type="text" class="form-control form-control-custom" placeholder="Enter object name"></div><div class="form-group form-group-2"><select class="form-control form-control-custom"><option selected disabled>Select Object Type</option><option value="a" typeOfElement="lnk">Link</option><option value="input" typeOfElement="txtbox">Textbox/Textarea</option><option value="table" typeOfElement="tbl">Table</option><option value="list" typeOfElement="lst">List</option><option value="select" typeOfElement="select">Dropdown</option><option value="img" typeOfElement="img">Image</option><option value="button" typeOfElement="btn";>Button</option><option value="radiobutton" typeOfElement="radiobtn">Radiobutton</option><option value="checkbox" typeOfElement="chkbox">Checkbox</option><option value="Element" typeOfElement="elmnt">Element</option></select></div><img class="deleteAddObjRow" src="imgs/ic-delete.png" /><div class="propertiesTab"><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter URL" id="url"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter name" id="name"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Relative xpath" id="rpath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Absolute xpath" id="apath"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter class name" id="classname"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter ID" id="id"></div><div class="form-group"><input type="text" class="form-control form-control-custom-prop" placeholder="Enter Query Selector" id="selector"><button class="btn btn-defaultsave" id="saveProperties" ng-click="saveProp()">Save</button></div></div><img class="editAddObjRow" src="imgs/ic-jq-editstep.png" /><img class="addMoreObjRow" ng-click="addMoreObject()" src="imgs/ic-add.png"></div>')
		$("#dialog-userObject").find("#rubmitObjRow").attr("disabled","disabled")
	});
	//Add More User Object Functionality
	
	//WSDL Functionality
	$scope.selectedWsdlTab = "requestWrap"
	//WSDL Functionality

	//Submit Custom Object Functionality
	$scope.submitCustomObject = function (e) {
		var err = "false";
		var custflag = "false";
		$('input.inputErrorBorderBottom').removeClass('inputErrorBorderBottom');
		$scope.errorMessage = "";
		$(".addObjTopWrap").find(".error-msg-abs").text("");
		$(".addObj-row").find("input").removeAttr("style");
		var flag = "false";
		$(".addObj-row").find("input").removeClass('inputErrorBorder');
		$(".addObj-row").find("select").removeClass('selectErrorBorder');
		var custObjNames = [];
		var dupCustObjNames = [];
		$('input.form-control-custom').each(function () {
			var typeOfElement=$(this).offsetParent().find('select option:selected').attr('typeofelement');
			if($.trim($(this).val())==""){
				$(this).addClass('inputErrorBorderBottom');
				flag = 'true';
			}
			custObjNames.push($.trim($(this).val())+"_"+typeOfElement);
		});
		if(flag=='true'){ return false; }
		var sorted_custObjNames = custObjNames.slice().sort();
		for (var i = 0; i < custObjNames.length - 1; i++) {
			if (sorted_custObjNames[i + 1] == sorted_custObjNames[i]) {
				dupCustObjNames.push(sorted_custObjNames[i]);
			}
		}
		if (dupCustObjNames.length > 0) {
			openDialog("Add Object", "Duplicate custom names");
			$('input.form-control-custom').each(function () {
				for (var j = 0; j < dupCustObjNames.length; j++) {
					if ($.trim($(this).val()+"_"+$(this).offsetParent().find('select option:selected').attr('typeofelement')) == $.trim(dupCustObjNames[j])) {
						$(this).addClass('inputErrorBorderBottom');
					}
				}

			});
			return false;
		}
		$.each($(".addObj-row"), function () {
			if ($(this).find("input").val() == "") {
				//$scope.errorMessage = "Please enter object name";
				//$(".addObjTopWrap").find(".error-msg-abs").text("Please enter object name");
				$(this).find("input").attr("style", "border-bottom: 2px solid #d33c3c !important;").focus(); //.addClass('inputErrorBorder')
				flag = "false";
				return false
			} else if ($(this).find("select option:selected").val() == "Select Object Type") {
				//$scope.errorMessage = "Please select object type";
				//$(".addObjTopWrap").find(".error-msg-abs").text("Please select object type");
				$(this).find("select").attr("style", "border-bottom: 4px solid #d33c3c !important;").focus(); //.addClass('selectErrorBorder')
				flag = "false";
				return false
			} else {
				// if(window.localStorage['_modified']){
				// 	modifiednames = JSON.parse(window.localStorage['_modified']);
				// }
				// if(modifiednames.length > 0){
				// 	var mdName;
				// 	for(var i=0; i<modifiednames.length; i++){
				// 		mdName = modifiednames[i].split("^^");
				// 		if (eaCheckbox)	newScrapedList.view[mdName[1]].custname = mdName[0];
				// 		else viewString.view[mdName[1]].custname = mdName[0];
				// 	}
				// }
				// if (Object.keys(viewString.view).length > 0) {
				//	 for (var i = 0; i < viewString.view.length; i++) {
				//		 if ($(this).find("input").val() == viewString.view[i].custname) {
				//			 $("#dialog-addObject").modal("hide");
				//			 openDialog("Add Object", "Object characterstics are same for " + $(this).find("input").val() + "");
				//			 return false;
				//		 }
				//	 }
				// }find("span.ellipsis").text()
				var typeOfElement=$(this).find('select option:selected').attr('typeofelement');
				if (viewString.view != undefined && viewString.view.length != undefined) {
					scrapeObjList={}
					for (var i = 0; i < viewString.view.length; i++) {
						scrapeObjList[$.trim(viewString.view[i].custname)]=i.toString();
					}
					for (var i = 0; i < viewString.view.length; i++) {
						if ($.trim($(this).find("input").val()+"_"+typeOfElement) == $.trim(viewString.view[i].custname) || $("input[type=checkbox].checkall:checked:visible").parents('span.objectNames').length>0 && $("input[type=checkbox].checkall:checked:visible").parents('span.objectNames')[0].id.split('_')[1]==i.toString() ) {
							//$("#dialog-addObject").modal("hide");
							if($('.addMoreObjRow').is(':visible') == false && $('.editAddObjRow').is(':visible') == true && 'editable' in viewString.view[i] && (!($.trim($(this).find("input").val()+"_"+typeOfElement) in scrapeObjList) || scrapeObjList[$.trim($(this).find("input").val()+"_"+typeOfElement)]==i.toString()) ){
								custflag=i
							}else{
								openDialog("Add Object", "Object characterstics are same for " + $(this).find("input").val() + "");
								$(this).find("input").addClass('inputErrorBorderBottom');
								err = "true";
							}
						}
					}
				}
				if (err == "true") {
					flag = "false";
					return false;
				}
				else {
					//If no field is empty, proceed to service call
					flag = "true";
					$scope.errorMessage = "";
					$(".addObj-row").find("input").removeClass('inputErrorBorder')
					$(".addObj-row").find("select").removeClass('selectErrorBorder')
				}
			}
		})
		if (flag == "true") {
			var customObj = [];
			//window.localStorage['disableEditing'] = "true";
			//Pushing custom object in array
			$.each($(".addObj-row"), function () {
				var typeOfElement=$(this).find('select option:selected').attr('typeofelement');
				var eleType = $(this).find("select option:selected").val();
				// switch (eleType) {
				// 	case "button":
				// 		typeOfElement = "btn";
				// 		break;
				// 	case "checkbox":
				// 		typeOfElement = "chkbox";
				// 		break;
				// 	case "select":
				// 		typeOfElement = "select";
				// 		break;
				// 	case "img":
				// 		typeOfElement = "img";
				// 		break;
				// 	case "a":
				// 		typeOfElement = "lnk";
				// 		break;
				// 	case "radiobutton":
				// 		typeOfElement = "radiobtn";
				// 		break;
				// 	case "input":
				// 		typeOfElement = "txtbox";
				// 		break;
				// 	case "list":
				// 		typeOfElement = "lst";
				// 		break;
				// 	case "table":
				// 		typeOfElement = "tbl";
				// 		break;
				// 	case "Element":
				// 		typeOfElement = "elmnt";
				// 		break;
				// 	default:
				// 		break;
				// }
				if($('.editAddObjRow').is(':visible')){
					if($.trim($(this).find("input").val()) in JSON.parse(localStorage['_cust'])){
						obj=JSON.parse(localStorage['_cust'])[$.trim($(this).find("input").val())];
					}
					else{
						openDialog("Add Object","This element has been modified, please save the object.")
						$(this).find("input.form-control.form-control-custom").addClass('inputErrorBorderBottom');
						flag = "false";
						return false;
					}
					if($(this).find("input").val()!=" "){
						customObj.push({
							custname: $.trim($(this).find("input").val()) + "_" + typeOfElement,
							tag: eleType,
							url: obj.url,
							xpath: obj.xpath,
							editable: "yes"
						})
					}
				}else{
					if($(this).find("input").val()!=" "){
						customObj.push({
							custname: $.trim($(this).find("input").val()) + "_" + typeOfElement,
							tag: eleType,
							xpath: ''
						})
					}
				}
			})
			if(flag=='false'){ return false; }
			if (viewString == "" || viewString.view == undefined) {
				viewString = {
					view: []
				}
			}
			//Pushing custom object array in viewString.view
			for (i = 0; i < customObj.length; i++) {
				if (custflag!="false"){
					customObj[i]._id = viewString.view[custflag]._id
					viewString.view[custflag]=customObj[i]
					if(window.localStorage['_modified'])
					{
						modifiednames = JSON.parse(window.localStorage['_modified']);
						modifiednames.push("editObj"+JSON.stringify(viewString.view[custflag]))
						window.localStorage['_modified'] = JSON.stringify(modifiednames)
					}
					else{
						window.localStorage['_modified'] = JSON.stringify(["editObj"+JSON.stringify(viewString.view[custflag])])
					}
					window.localStorage['checkEditWorking'] = "true";
				}else{
					viewString.view.push(customObj[i])
				}
			}

			//Reloading List Items
			$("#finalScrap").empty()
			$("#finalScrap").append("<div id='scrapTree' class='scrapTree'><ul><li><span class='parentObjContainer'><input title='Select all' type='checkbox' class='checkStylebox' disabled /><span class='parentObject'><a id='aScrapper'>Select all </a><button id='saveObjects' class='btn btn-xs btn-xs-custom objBtn' style='margin-left: 10px'>Save</button><button data-toggle='modal' id='deleteObjects' data-target='#deleteObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 10' disabled>Delete</button><button data-toggle='modal' id='editObjects' data-target='#editObjectsModal' class='btn btn-xs btn-xs-custom objBtn' style='margin-right: 0' data-toggle='tooltip' title='Edit Objects' disabled>Edit</button></span><span class='searchScrapEle'><img src='imgs/ic-search-icon.png'></input></span><span><input type='text' class='searchScrapInput'></span></span><ul id='scraplist' class='scraplistStyle'></ul></li></ul></div>");
			$('#scraplist').empty()
			for (i = 0; i < viewString.view.length; i++) {
				var innerUL = $('#scraplist');
				var path = viewString.view[i].xpath;
				var ob = viewString.view[i];
				ob.tempId = i;
				var custN = ob.custname.replace(/[<>]/g, '').trim();
				var tag = ob.tag;
				if (tag == "dropdown") {
					imgTag = "select"
				} else if (tag == "textbox/textarea") {
					imgTag = "input"
				} else imgTag = tag;
				var tag1 = tag.replace(/ /g, "_");
				var tag2;
				if ((tag == "a" || tag == "input" || tag == "table" || tag == "list" || tag == "select" || tag == "img" || tag == "button" || tag == "radiobutton" || tag == "checkbox" || tag == "tablecell") && ob.hasOwnProperty('editable')) {
					var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a><span id='decrypt' class='userObject'></span></li>";
				} else {
					var li = "<li data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + "><a><span class='highlight'></span><input type='checkbox' class='checkall' name='selectAllListItems' disabled /><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></a></li>";
				}
				angular.element(innerUL).append(li);
			}
			$("li.item:visible").each(function () {
				if ($(this).attr('data-xpath') == "") {
					$(this).children().find('span.ellipsis').addClass('customObject');
				}
			});
			$(".checkStylebox, .checkall").prop("disabled", false);
			//$(".checkStylebox").trigger("click");
			//$timeout(function(){
			//$("#saveObjects").trigger("click");
			//},500)
			$("#dialog-addObject").modal("hide");
			$("#dialog-userObject").modal("hide");
			$(".addObject span img").removeClass("left-bottom-selection");
			$(".userObject span img").removeClass("left-bottom-selection");
			openDialog("Add Object", "Objects has been added successfully.")
			//$("#addObjectSuccess").modal("show")
			$("#saveObjects").prop("disabled", false)
			flag = "false";
			//Transaction Activity for Submit Custom Objects Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['SubmitCustomObject']);
			// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);				   
		}

		//Building Tree
		$(document).find('#scrapTree').scrapTree({
			multipleSelection: {
				//checkbox : checked,
				classes: ['.item']
			},
			editable: true,
			radio: true
		});
		$("img.left-bottom-selection").removeClass('left-bottom-selection');
	};
	//Submit Custom Object Functionality

	//Map Object Drag and Drop Functionality
	$scope.generateMapObj = function () {

		$(".addObject span img").removeClass("left-bottom-selection");
		$(".compareObject span img").removeClass("left-bottom-selection");
		$(".generateObj span img").addClass("left-bottom-selection");

		$(".submitObjectWarning, .objectExistMap, .noObjectToMap").hide();
		$("#dialog-mapObject").modal("show");
		$('#scrapedObjforMap, #customObjforMap').empty();

		// if viewstring.view has scraped objects, then populate these in map object popup 
		if (viewString.view) {
			for (i = 0; i < viewString.view.length; i++) {
				var path = viewString.view[i].xpath;
				var ob = viewString.view[i];
				ob.tempId = i;
				var objId = viewString.view[i]._id;
				var custN = ob.custname.replace(/[<>]/g, '').trim();
				var tag = ob.tag;
				if (tag == "dropdown") {
					imgTag = "select"
				} else if (tag == "textbox/textarea") {
					imgTag = "input"
				} else imgTag = tag;
				var tag1 = tag.replace(/ /g, "_");
				var tag2;
				if (path != "") {
					var innerUL = $('#scrapedObjforMap');
					var li = "<li data-id="+objId+"  data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-left='" + ob.left + "' data-top='" + ob.top + "' data-width='" + ob.width + "' data-height='" + ob.height + "' data-tag='" + tag + "' data-url='" + ob.url + "' data-hiddentag='" + ob.hiddentag + "' class='item select_all " + tag + "x' val=" + ob.tempId + " draggable='true' ondragstart='drag(event)'> <span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' data-xpath='" + ob.xpath + "' data-id="+objId+" class='ellipsis'>" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></li>";
					angular.element(innerUL).append(li);
				} else {
					var li = "<li data-id="+objId+" data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' data-tag='" + tag + "' class='item select_all " + tag + "x' dropzone='move s:text/plain' ondrop='drop(event)' ondragover='allowDrop(event)'><span title='" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ').replace(/["]/g, '&quot;').replace(/[']/g, '&#39;') + "' data-xpath='" + ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "' class='ellipsis' data-id="+objId+">" + custN.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ') + "</span></li>";
					$('#customObjforMap').append('<div class="accd-Obj"><div class="accd-Obj-head">' + tag + '</div><div class="accd-Obj-body">' + li + '</div></div>')

					/****Filtering same object type in one container****/
					$(".accd-Obj .accd-Obj-head").each(function () {
						if ($(this).text() == $(li).data("tag") && $(this).siblings().text() != $(li).children("span").text()) {
							$(this).parent().children(".accd-Obj-body").append(li);
						}
					})
					/****Filtering same object type in one container****/
				}
			}
		}

		/****Removing same objects type for custom objects****/
		var seen = {};
		$('.accd-Obj .accd-Obj-head').each(function () {
			var txt = $(this).text();
			if (seen[txt]) $(this).remove();
			else seen[txt] = true;
		});
		/****Removing same objects type for custom objects****/

		$(".accd-Obj-head").append('<span class="showactiveArrow"></span>');
		$(".accd-Obj-body li").append('<span class="showPreviousVal" title="Show Previous Text"></span>');

		$(document).on('shown.bs.modal', '#dialog-mapObject', function () {
			$(".unlinkButton").attr("disabled", true);
			if ($("#scrapedObjforMap").find(".ellipsis:visible").length > 0) {
				$(".showAllObjects,#submitMapObj").attr("disabled", false);
			} else {
				$(".showAllObjects,#submitMapObj").attr("disabled", true);
			}
			if ($(".accd-Obj-head").length > 0) {
				$("#submitMapObj").attr("disabled", false);
			} else {
				$("#submitMapObj").attr("disabled", true);
			}
		});

		$scope.removeMapObjectSelection = function () {
			$('#scrapedObjforMap, #customObjforMap').empty();
			$("img.left-bottom-selection").removeClass('left-bottom-selection');
		};
	}
	$rootScope.compareFlag = false;
	//Compare Objects
	$scope.compareObj = function () {

		$(".generateObj span img").removeClass("left-bottom-selection");
		$(".addObject span img").removeClass("left-bottom-selection");
		$(".compareObject span img").addClass("left-bottom-selection");

		//openDialog("Compare Object", "");
		$rootScope.compareFlag = true;
		if ($rootScope.compareFlag == true) {
			$("#compareObjectModal").modal("show");
			$timeout(function () {
				if (navigator.appVersion.indexOf("Mac") != -1) {
					$(".safariBrowser").show();
				}
			}, 300)
		}
		$scope.removeCompareSelection = function () {
			$rootScope.compareFlag = false;
			$("img.left-bottom-selection").removeClass('left-bottom-selection');
		};
	};

	$(document).on("click", ".showAllObjects", function () {
		//console.log("hello");
		$('#scrapedObjforMap li').each(function () {
			$(this).show();
			$(".accd-Obj-body").slideUp("fast");
			$(".accd-Obj-head").find(".showactiveArrow").fadeOut("fast");
		});

	})

	/****Custom object Accoridan****/
	$(document).on("click", ".accd-Obj-head", function () {
		var clickElem = $(this).text().trim();
		$('#scrapedObjforMap li').each(function () {
			if ($(this).data("tag").trim() != clickElem && clickElem != "Element") {
				$(this).hide();
			} else if (clickElem == "Element") {
				var elem = $(this).data("tag")
				if (elem == "a" || elem == "input" || elem == "table" || elem == "list" || elem == "select" || elem == "img" || elem == "button" || elem == "radiobutton" || elem == "checkbox") {
					$(this).hide();
				} else {
					$(this).show();
				}
			} else {
				$(this).show();
			}
			//  if (clickElem == "Element" && ($(this).data("tag") == "a" || $(this).data("tag") == "image")) {
			// 	$(this).hide();
			// }
		});
		// for (var i = 0; i < viewString.view.length; i++) {
		// 	if (viewString.view[i].tag == $(this).text() && viewString.view[i].xpath != "") {
		// 		//console.log(viewString.view[i].tag);
		// 		console.log(innerUL);
		//
		// 	}
		// 	//console.log(viewString.view[i].tag);
		// }
		$(this).siblings(".accd-Obj-body").slideToggle("fast", function () {
			$(this).siblings(".accd-Obj-head").find(".showactiveArrow").fadeIn("fast");
			if ($(this).parent().siblings().children(".accd-Obj-body").is(":visible") == true) {
				$(this).parent().siblings().children(".accd-Obj-body").slideUp("fast");
				$(this).parent().siblings().children(".accd-Obj-head").find(".showactiveArrow").fadeOut("fast");
			} else if ($(this).is(":visible") == false) {
				$(this).siblings(".accd-Obj-head").find(".showactiveArrow").fadeOut("fast");
			}
			return false
		});
	})
	/****Custom object Accoridan****/

	/***Un-link Functonality***/
	$(document).on("click", ".valueMerged", function () {
		$(this).toggleClass("valueMergedSelected")

		//Enable-Disable Unlink button based on the valueMergedSelected Class
		if ($(".valueMergedSelected").length > 0) $(".unlinkButton").prop("disabled", false)
		else $(".unlinkButton").prop("disabled", true)
	});

	$scope.unlinkMapObj = function () {
		$(".submitObjectWarning, .objectExistMap").hide();
		var mergedObj = $(".valueMergedSelected");
		var sXpath;
		$.each(mergedObj, function () {
			sXpath = $(this).children(".fromMergeObj").data("xpath")
			$(this).children(".showPreviousVal").hide();
			$(this).children(".fromMergeObj").remove();
			$(this).children(".toMergeObj").show().removeClass("toMergeObj")
			$(this).removeClass("valueMerged valueMergedSelected");

			/***Reseting Selected Dragged Object for Left Scrapped Tree***/
			$.each($("#scrapedObjforMap li"), function () {
				if ($(this).data("xpath") == sXpath) {
					$(this).attr("draggable", true)
					$(this).children(".ellipsis").css({
						'background': '',
						'cursor': 'auto'
					})
				}
			})
			/***Reseting Selected Dragged Object for Left Scrapped Tree***/
		});
		$(".unlinkButton").prop("disabled", true)
	}
	/***Un-link Functonality***/

	/****Show prev value functionality for map object****/
	$(document).on("click", function (e) {
		if (e.target.className == "showPreviousVal") {
			$(e.target).siblings(".fromMergeObj").hide();
			$(e.target).siblings(".toMergeObj").show();
		} else {
			$(".showPreviousVal").siblings(".fromMergeObj").show();
			$(".showPreviousVal").siblings(".toMergeObj").hide();
		}
	})
	/****Show prev value functionality for map object****/

	/****Submit Map Object Functionality****/
	$scope.submitMapObject = function (e) {
		$(".submitObjectWarning, .objectExistMap, .noObjectToMap").hide()
		if ($("#customObjforMap").text() == "") {
			$(".noObjectToMap").show()
			return false
		} else {
			if ($(".valueMerged").length == 0) {
				$(".submitObjectWarning").show()
				return false
			} else {
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
				scrapeObject.fromMerge = [];//update custname
				scrapeObject.toMerge = [];//delete list
				scrapeObject.versionnumber = tasks.versionnumber;

				//Filtering the Object which has been mapped
				var valueToMap = $(".valueMerged")
				$.each(valueToMap, function () {
					scrapeObject.editedListmodifiedCustNames.push($(this).children(".fromMergeObj").text());
					scrapeObject.editedListoldCustName.push($(this).children(".toMergeObj").text());
					scrapeObject.editedListoldXpath.push($(this).children(".toMergeObj").data("xpath"));
					scrapeObject.editedListmodifiedXpaths.push($(this).children(".fromMergeObj").data("xpath"));
					scrapeObject.fromMerge.push([$(this).children(".fromMergeObj").data("id"),$(this).children(".toMergeObj").text()])
					scrapeObject.toMerge.push($(this).children(".toMergeObj").data("id"))
					/***Resetting Values to Default***/
					$(this).children(".showPreviousVal").hide();
					$(this).children(".fromMergeObj").remove();
					$(this).children(".toMergeObj").show().removeClass("toMergeObj")
					$(this).removeClass("valueMerged valueMergedSelected")
					/***Resetting Values to Default***/
				})
				//Filtering the Object which has been mapped

				DesignServices.mapScrapeData_ICE(scrapeObject)
					.then(function (data) {
						if (data == "Invalid Session") {
							return $rootScope.redirectPage();
						}
						$("#dialog-mapObject").modal("hide");
						if (data == "success") {
							openDialog("Map Object", "Objects have been mapped successfully."); //$("#mapObjSuccess").modal("show");
							//Transaction Activity for Submit Map Objects Action
							// var labelArr = [];
							// var infoArr = [];
							// labelArr.push(txnHistory.codesDict['SubmitMapObject']);
							// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
						}
						else if (data == "TagMissMatch") openDialog("Map Object", "Failed to map objects."); //$("#mapObjTagMissMatch").modal("show");
						else if (typeof data == "object") openDialog("Map Object", "Failed to map objects."); //$("mapObjSameObject").modal("show");
						angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
					},
					function (error) {
						console.log("Error::::", error)
					})
				$("#scrapedObjforMap li").attr("draggable", true);
				$("#scrapedObjforMap li").children(".ellipsis").css({
					'background': '',
					'cursor': 'auto'
				});
			}
		}
	}


	//Save Scrape Objects
	$(document).on('click', "#saveObjects", function (e) {
		//console.log("reused", reusedScreenNames);
		//console.log("reusedT", reusedScreenTestcaseNames);
		var task = JSON.parse(window.localStorage['_CT'])
		if (task.reuse == 'True') {
			$("#reUsedObjectsModal").find('.modal-title').text("Save Scraped data");
			$("#reUsedObjectsModal").find('.modal-body p').text("Screen is been reused. Are you sure you want to save objects?").css('color', 'black');
			$("#reUsedObjectsModal").modal("show");
			return false;
		}
		saveScrapedObjects(e);
	})

	$scope.saveScrapedObjects = function () {
		$("#reUsedObjectsModal").modal("hide");
		noSave = "false";
		saveScrapedObjects();
	};

	$scope.noSaveScrapedObjects = function () {
		$("#reUsedObjectsModal").modal("hide");
		noSave = "true";
		return false;
	};


	function saveScrapedObjects(e) {
		if (noSave = "false") {
			var xpath;
			var duplicateCustnames = [];
			var duplicateXpath = [];
			var duplicateXpathElements = {};
			var duplicateCustnamesElements = {};
			var isDuplicateCustNames = false;
			var isDuplicateXpath = false;
			//validateDuplicateObjects
			if ($("#scraplist .ellipsis").length > 0) {
				$.each($("#scraplist span.ellipsis"), function () {
					$(this).removeClass('duplicateCustname duplicateXpath');
					var count = 0;
					if ($(this).parent().parent().attr("data-xpath") != "" && $(this).parent().parent().attr("data-xpath") != undefined) {
						xpath = $(this).parent().parent().attr("data-xpath");
						if (appType == 'MobileWeb') {
							xpath = xpath.split(";")[2];
						}
						else {
							xpath = xpath;
						}
						if (count == 0 && !duplicateCustnamesElements.hasOwnProperty($(this).text())) {
							duplicateCustnamesElements[$(this).text()] = xpath;
						} else if (duplicateCustnamesElements.hasOwnProperty($(this).text())) {
							if (count == 0) {
								duplicateCustnames.push($(this).text());
								isDuplicateCustNames = true;
								$(this).addClass('duplicateCustname').css('color', 'red');
							}
						}
					} else {
						xpath = "";
						if (!duplicateCustnamesElements.hasOwnProperty($(this).text())) {
							duplicateCustnamesElements[$(this).text()] = xpath;
						} else {
							duplicateCustnames.push($(this).text());
							isDuplicateCustNames = true;
							$(this).addClass('duplicateCustname').css('color', 'red');
						}
					}
				});
				if (!isDuplicateCustNames) {
					var count = 0;
					$.each($("#scraplist span.ellipsis"), function () {
						xpath = $(this).parent().parent().attr("data-xpath");
						if ($(this).parent().parent().attr("data-xpath") != "" && $(this).parent().parent().attr("data-xpath") != undefined) {
							if (appType == 'MobileWeb') {
								xpath = xpath.split(";")[2];
							}
							else {
								xpath = xpath;
							}
							if (!duplicateXpathElements.hasOwnProperty(xpath)) {
								duplicateXpathElements[xpath] = $(this).text();
							} else {
								$(this).addClass('duplicateXpath').css('color', 'red');
								duplicateCustnames.push($(this).text());
								isDuplicateXpath = true;
								count = 1;
							}
						}
					});
				}

				if (isDuplicateCustNames) {
					openDialog("Save Scrape data", "");
					$("#globalModal").find('.modal-body p').html("<span><strong>Please rename/delete duplicate scraped objects</strong></span><br /><br /><strong>Object characterstics are same for:</strong>").css("color", "#000").append("<ul class='custList'></ul>");
					for (var j = 0; j < duplicateCustnames.length; j++) {
						$("#globalModal").find('.modal-body p ul').append("<li>" + duplicateCustnames[j] + "</li>");
					}
					return false;
				}
				else {
					if (isDuplicateXpath) {
						$("#saveConfirmObjects").modal('show');
						$("#saveConfirmObjects").find('.modal-body p').html("<strong>Object characteristics are same for the below list of objects:").css("color", "#000").append("<ul class='custList'></ul><br /> Do you still want to continue?");
						for (var j = 0; j < duplicateCustnames.length; j++) {
							$("#saveConfirmObjects").find('.modal-body p ul').append("<li>" + duplicateCustnames[j] + "</li>");
						}
						return false;
					}
				}
			}
			renameScrapedObjects(e);
		}
	}

	$(document).on('click', '#saveElements', function (e) {
		$("#saveConfirmObjects").modal('hide');
		renameScrapedObjects(e);
	});
	$(document).on('click', '#noSaveElements', function (e) {
		$("#saveConfirmObjects").modal('hide');
		unblockUI()
		return false;
	});

	function renameScrapedObjects(e) {
		blockUI("Saving in progress. Please wait...");
		var edit = [];
		var propedit = [];
		var propeditFlag =  false
		var unsavedObj = [];
		var custnames = [];
		var viewStringXpath = [];
		var modifiedCustXpath = [];
		var modifiedXpath = '';
		var modifiedCustname = '';
		var modifiedCustObj = [];
		var modifiedCustObjName = '';
		var tempId = '';
		if (window.localStorage['_modified']) {
			modifiednames = JSON.parse(window.localStorage['_modified']);
		}
		if (eaCheckbox) {
			if (!copiedViewstring) {
				for (var j = 0; j < viewString.view.length; j++) {
					newScrapedList.view.push(viewString.view[j]);
				}
			}
			newScrapedList.mirror = viewString.mirror;
			if (appType == "MobileApp" || appType == "MobileWeb") {
				newScrapedList.mirrorheight = viewString.mirrorheight;
				newScrapedList.mirrorwidth = viewString.mirrorwidth;
			}
		}
		var modifiedobj = [];
		if (modifiednames.length > 0) {
			var mdName;
			for (var i = 0; i < modifiednames.length; i++) {
				mdName = modifiednames[i].split("^^");
				editName = modifiednames[i].split("editObj");
				if (editName[1]) {
					propedit.push(JSON.parse(editName[1]))
					propeditFlag = true
				}
				if (eaCheckbox) {
					if (mdName[1]) {
						if (newScrapedList.view[mdName[1]]){
							newScrapedList.view[mdName[1]].custname = mdName[0];
							if(newScrapedList.view[mdName[1]].cord != undefined && newScrapedList.view[mdName[1]].cord != ''){
								var newxpath = newScrapedList.view[mdName[1]].xpath;
								var ind = newxpath.indexOf(';');
								var s_ind = newxpath.indexOf(';',ind);
								newxpath = newxpath.slice(0,ind+1)+mdName[0]+newxpath.slice(newxpath.indexOf(';',ind+s_ind),newxpath.length);
								newScrapedList.view[mdName[1]].xpath = newxpath;
							}
							if ("_id" in newScrapedList.view[mdName[1]]){
								modifiedobj.push([newScrapedList.view[mdName[1]]._id,mdName[0]])
							}
						}
					}
				}
				else {
					if (mdName[1]) {
						if (viewString.view[mdName[1]]){
							if (viewString.view[mdName[1]]._id == undefined){
								viewString.view[mdName[1]].custname = mdName[0];
							}
							else{
								edit.push([viewString.view[mdName[1]]._id,mdName[0]]);
							}
							/*
							if(viewString.view[mdName[1]].cord != undefined && viewString.view[mdName[1]].cord != ''){
								var newxpath = viewString.view[mdName[1]].xpath;
								var ind = newxpath.indexOf(';');
								var s_ind = newxpath.indexOf(';',ind);
								newxpath = newxpath.slice(0,ind+1)+mdName[0]+newxpath.slice(newxpath.indexOf(';',ind+s_ind),newxpath.length);
								viewString.view[mdName[1]].xpath = newxpath;
							}*/
						}	
					}
				}
			}
			if (edit.length > 0){
				window.localStorage['_modified'] = JSON.stringify(edit)
			}
		}
		//End of Filter Duplicate Values in ViewString based on custname
		window.localStorage['disableEditing'] = "false";
		//var tasks = JSON.parse(window.localStorage['_TJ']);
		var tasks = JSON.parse(window.localStorage['_CT']);
		var getScrapeData;
		if (eaCheckbox) {
			for (var i = 0; i < getIndexOfDeletedObjects.length; i++) {
				//delete newScrapedList.view[getIndexOfDeletedObjects[i].tempId];
				if (getIndexOfDeletedObjects[i].hasOwnProperty("tempId")) {
					delete newScrapedList.view[getIndexOfDeletedObjects[i].tempId];
				}
				else {
					delete newScrapedList.view[getIndexOfDeletedObjects[i]];
				}

				//newScrapedList.view.splice(getIndexOfDeletedObjects[i], 1);
			}
			newScrapedList.view = newScrapedList.view.filter(function (n) { return n != null });
			if (modifiedobj.length > 0){
				newScrapedList.modobj = modifiedobj
			}
			getScrapeData = JSON.stringify(newScrapedList);
			//console.log(newScrapedList.view)
		}
		else {
			if (getIndexOfDeletedObjects.length > 0) {
				for (var i = 0; i < getIndexOfDeletedObjects.length; i++) {
					delete viewString.view[getIndexOfDeletedObjects[i].tempId];
					//viewString.view.splice(getIndexOfDeletedObjects[i], 1);
				}
				viewString.view = viewString.view.filter(function (n) { return n != null });
			}
			getScrapeData = JSON.stringify(viewString);
			//console.log(viewString.view)
		}
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
		if (propeditFlag){
			scrapeObject.propedit = propedit 
		}
		if (!eaCheckbox && window.localStorage['_modified'] != "" && edit.length > 0){
			scrapeObject.param = "edit_updateScrapeData_ICE";
			scrapeObject.getScrapeData = window.localStorage['_modified'];
			scrapeObject.scrapedobj = viewString.view
		}
		scrapeObject.appType = tasks.appType;
		scrapeObject.versionnumber = tasks.versionnumber;
		scrapeObject.newData = viewString;
		if(deleteObjectsFlag==true){
			scrapeObject.type = "delete";
			deleteObjectsFlag = false;
		}
		else
			scrapeObject.type = "save";
		//Update Service to Save Scrape Objects
		DesignServices.updateScreen_ICE(scrapeObject)
			.then(function (data) {
				unblockUI();
				if (data == "Invalid Session") {
					return $rootScope.redirectPage();
				}
				if(typeof(data)=="object" || data=="success"){
					eaCheckbox = false;
					//window.localStorage['_modified'] = "";
					modifiednames = [];
					getIndexOfDeletedObjects = [];
					copiedViewstring = false;
					//enableScreenShotHighlight = true;
					localStorage.removeItem("_modified");
					saveScrapeDataFlag = true;
					if(typeof(data)=="object" && data.length>0){
						openDialog("Save Scrape data", "");
						$("#globalModal").find('.modal-body p').html("<span>Scraped data saved successfully. <br><br> <strong>Warning: Please scrape an IRIS reference object.</strong></span><br/><br/>Matching objects found for:").css("color", "#000").append("<ul class='custList'></ul>");
						for (var j = 0; j < data.length; j++) {
							$("#globalModal").find('.modal-body p ul').append("<li>" + data[j] + "</li>");
						}
					}
					else  openDialog("Save Scraped data", "Scraped data saved successfully.")
					$("a.browserIcon").removeClass("enableActions").addClass("disableActions").parent('li').css('cursor', 'not-allowed');
					angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
					$("#saveObjects").attr('disabled', true);
					deleteScrapeDataservice = true;
					//Transaction Activity for Save Scraped Objects Button Action
					// var labelArr = [];
					// var infoArr = [];
					// labelArr.push(txnHistory.codesDict['SaveScrapedObjects']);
					// infoArr.push(scrapeObject.appType)
					// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
				}else {
					//enableScreenShotHighlight = false;
					openDialog("Save Scraped data", "Failed to save");
				}
			}, function (error) { })

		if ($("#window-filter").is(":visible")) {
			var filters = $(".popupContent-filter .filterObjects");
			$.each(filters, function () {
				if ($(this).hasClass('popupContent-filter-active')) {
					$(this).removeClass('popupContent-filter-active').addClass("popupContent-default");
				}
			})
			if ($('.checkStyleboxFilter').is(':checked')) {
				$('.checkStyleboxFilter').prop('checked', false);
			}
		}
	}
	//To Select and unSelect all objects
	$(document).on("click", ".checkStylebox", function () {
		if ($(this).is(":checked")) {
			$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", true).addClass('checked');
			$("#deleteObjects").prop("disabled", false)
		} else {
			$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", false).removeClass('checked');
			$("#deleteObjects").prop("disabled", true)
		}
	})

	//Triggered When each checkbox objects are clicked 
	$(document).on('click', "input[name='selectAllListItems']", function () {
		if ($(this).is(":checked")) {
			$(this).addClass('checked');
		} else {
			$(this).removeClass('checked');
		}
		var checkedLength = $("input.checked").length;
		var totalLength = $("#scraplist li:visible").length;
		if (totalLength == checkedLength) {
			$('.checkStylebox').prop("checked", true);
		} else {
			$('.checkStylebox').prop("checked", false);
		}
		if (checkedLength > 0) {
			$("#deleteObjects").prop("disabled", false)
		} else {
			$("#deleteObjects").prop("disabled", true)
		}
		if (checkedLength == 1 && $('input.checkall.checked').offsetParent().parent().find('#decrypt').length==1) {
			$("#editObjects").prop("disabled", false)
		} else {
			$("#editObjects").prop("disabled", true)
		}
	});


	//To Select and unSelect all objects in compare and update screen
	$(document).on("click", ".checkStyleComparebox", function () {
		if ($(this).is(":checked")) {
			$("#changedOrdList li").find('input[name="selectAllChangedItems"]').prop("checked", true).addClass('checked');
		} else {
			$("#changedOrdList li").find('input[name="selectAllChangedItems"]').prop("checked", false).removeClass('checked');
		}
	})

	//Triggered When each checkbox objects are clicked in compare & update screen
	$(document).on('click', "input[name='selectAllChangedItems']", function () {
		if ($(this).is(":checked")) {
			$(this).addClass('checked');
		} else {
			$(this).removeClass('checked');
		}
		var checkedLength = $("input.checked").length;
		var totalLength = $("#changedOrdList li:visible").length;
		if (totalLength == checkedLength) {
			$('.checkStyleComparebox').prop("checked", true);
		} else {
			$('.checkStyleComparebox').prop("checked", false);
		}
	});
	$(document).find('#load_jqGrid').prop('display', 'none !important');

	//save button clicked - save the testcase steps
	$scope.updateTestCase_ICE = function (e) {
		var task = JSON.parse(window.localStorage['_CT'])
		if (task.reuse == 'True') {
			//$("#reUsedTestcaseModal").find('.modal-title').text("");
			$("#reUsedTestcaseModal").find('.modal-body p').text("Testcase is been reused. Are you sure you want to save ?").css('color', 'black');
			$("#reUsedTestcaseModal").modal("show");
			return false;
		}
		updateTestCase(e);
	};

	$scope.saveTestcase = function (e) {
		$("#reUsedTestcaseModal").modal("hide");
		noSaveTestcase = "false";
		updateTestCase(e);
	};

	$scope.noSaveTestcaseFn = function () {
		$("#reUsedTestcaseModal").modal("hide");
		noSaveTestcase = "true";
		return false;
	};
	if ($rootScope.compareFlag == true) {
		$('.submitTaskBtn').hide();
	}


	function updateTestCase(e) {
		if (noSaveTestcase == "false") {
			cfpLoadingBar.start();
			var userInfo = JSON.parse(window.localStorage['_UI']);
			var taskInfo = JSON.parse(window.localStorage['_CT']);
			if (userInfo.role == "Viewer") return false;
			else {
				var screenId = taskInfo.screenId;
				/*if(window.localStorage['screenIdVal'] == undefined || !window.localStorage['screenIdVal'] || window.localStorage['screenIdVal'] == ""){
					screenId = window.localStorage['scrnId'];
				}else{
					screenId = window.localStorage['screenIdVal'];
				}*/
				var testCaseId = taskInfo.testCaseId;
				var testCaseName = taskInfo.testCaseName;
				var versionnumber = taskInfo.versionnumber;
				var import_status = false;
				if ((screenId != undefined) && (screenId != "undefined") && (testCaseId != undefined) && (testCaseId != "undefined")) {
					//#D5E7FF  DBF5DF
					var serviceCallFlag = false;
					var mydata = $("#jqGrid").jqGrid('getGridParam', 'data');
					var getTR = $("#jqGrid tbody tr:visible td:nth-child(10)");
					for (var i = 0; i < mydata.length; i++) {
						//						if (mydata[i].hasOwnProperty("_id_")) {
						//							if (mydata[i]._id_.indexOf('jpg') !== -1 || mydata[i]._id_.indexOf('jqg') !== -1) {
						//								var index = mydata.indexOf(mydata[i]);
						//								mydata.splice(index, 1);
						//							} else {
						mydata[i].stepNo = i + 1;
						if (mydata[i].custname == undefined || mydata[i].custname == "") {
							var stepNoPos = parseInt(mydata[i].stepNo);
							openDialog("Save Testcase", "Please select Object Name at Step No. " + stepNoPos)
							serviceCallFlag = true;
							break;
						} else {
							//check - keyword column should be mandatorily populated by User
							mydata[i].custname = mydata[i].custname.trim();
							if (mydata[i].keywordVal == undefined || mydata[i].keywordVal == "") {
								var stepNoPos = parseInt(mydata[i].stepNo);
								openDialog("Save Testcase", "Please select keyword at Step No. " + stepNoPos)
								serviceCallFlag = true;
								break;
							} else if (mydata[i].keywordVal == 'SwitchToFrame') {
								if ($scope.newTestScriptDataLS != "undefined" || $scope.newTestScriptDataLS != undefined) {
									var testScriptTableData = $scope.newTestScriptDataLS;
									for (j = 0; j < testScriptTableData.length; j++) {
										if (testScriptTableData[j].custname != '@Browser' && testScriptTableData[j].custname != '@Oebs' && testScriptTableData[j].custname != '@Window' && testScriptTableData[j].custname != '@Generic' && testScriptTableData[j].custname != '@Custom') {
											if (testScriptTableData[j].url != "") {
												mydata[i].url = testScriptTableData[j].url;
												break;
											}
										}
									}
								}
							}
							if (mydata[i].keywordVal == "setHeader" || mydata[i].keywordVal == "setHeaderTemplate") {
								if (typeof (mydata[i].inputVal) === "string") {
									mydata[i].inputVal = mydata[i].inputVal.replace(/[\n\r]/g, '##');
								} else mydata[i].inputVal[0] = mydata[i].inputVal[0].replace(/[\n\r]/g, '##');
							}
							//console.log("updateTestCase:::", mydata)
						}
						if (mydata[i].url == undefined) {
							mydata[i].url = "";
						}
						if (mydata[i].cord == null) {
							mydata[i].cord = "";
						}
						if (mydata[i].remarks != undefined) {
							if (mydata[i].remarks != getTR[i].textContent && getTR[i].textContent.trim().length > 0) {
								if (mydata[i].remarks.length > 0) {
									mydata[i].remarks = mydata[i].remarks.concat(" ; " + getTR[i].textContent);
								} else {
									mydata[i].remarks = getTR[i].textContent;
								}
							}
						} else {
							mydata[i].remarks = getTR[i].textContent;
						}
						//							}
						//						}
						/*else{
							if(mydata[i].remarks != undefined){
								if(mydata[i].remarks != getTR[i].textContent  && getTR[i].textContent.trim().length > 0 )	{
									if(mydata[i].remarks.length > 0 ){
										mydata[i].remarks = mydata[i].remarks.concat( " ; " + getTR[i].textContent);
									}
									else{
										mydata[i].remarks = getTR[i].textContent;
									}
								}
							}
							else{
								mydata[i].remarks = getTR[i].textContent;
							}
						}*/
					}
					if (serviceCallFlag == true) {
						console.log("no service call being made");
					} else {
						DesignServices.getScrapeDataScreenLevel_ICE()
							.then(function (res) {
								getScrapeData=res
								scrape_data = JSON.parse(JSON.stringify(getScrapeData));
							});
							DesignServices.updateTestCase_ICE(testCaseId, testCaseName, mydata, userInfo, versionnumber, import_status)
							.then(function (data) {
								if (data == "Invalid Session") {
									return $rootScope.redirectPage();
								}
								if (data == "success") {
									/*if(window.localStorage['UITSCrtd'] == "true") window.localStorage['UITSCrtd'] = "false"
						else{
							$("#tabs,#tabo2,#tabo1").tabs("destroy");
							showDialogMesgsBtn("Save Test Script", "Test Script saved successfully", "btnSave");
							selectRowStepNoFlag = true;
							$("#tabs,#tabo2,#tabo1").tabs();
						}*/
									angular.element(document.getElementById("tableActionButtons")).scope().readTestCase_ICE();
									openDialog("Save Testcase", "Testcase saved successfully")
									if(taskInfo.appType.toLowerCase()=="web" && '_modified' in localStorage && localStorage['_modified'] != ""){
										var screenId = taskInfo.screenId;
										var screenName = angular.element(document.getElementById("left-nav-section")).scope().screenName;
										var projectId = taskInfo.projectId;
										var userinfo = JSON.parse(window.localStorage['_UI']);
										scrapeObject = {};
										if(localStorage['_modified'])
										{
											data1=JSON.parse(localStorage['_modified'])
											for(i=0;i<scrape_data.view.length;i++){
												if(scrape_data.view[i].custname in data1){
													scrape_data.view[i].xpath=data1[scrape_data.view[i].custname]
												}
											} 
										}
										scrapeObject.getScrapeData = JSON.stringify(scrape_data);
										scrapeObject.projectId = projectId;
										scrapeObject.screenId = screenId;
										scrapeObject.screenName = screenName;
										scrapeObject.userinfo = userinfo;
										scrapeObject.param = "updateScrapeData_ICE";
										scrapeObject.appType = taskInfo.appType;
										scrapeObject.versionnumber = taskInfo.versionnumber;
										scrapeObject.newData = viewString;
										if(deleteObjectsFlag==true){
											scrapeObject.type = "delete";
											deleteObjectsFlag = false;
										}
										else
											scrapeObject.type = "save";
										//Update Service to Save Scrape Objects
										DesignServices.updateScreen_ICE(scrapeObject)
											.then(function (data1) {
												if (data1 == "Invalid Session") {
													return $rootScope.redirectPage();
												}
												if (data1 == "success") {
													openDialog("Save Testcase", "Testcase saved successfully.");
													//$("#WSSaveSuccess").modal("show");
													$("#enbledWS").prop("checked", false)
													angular.element(document.getElementById("left-nav-section")).scope().getScrapeData();
												} else {
													openDialog("Save Testcase", "Failed to save Testcase.");
													//$("#WSSaveFail").modal("show")
												}
											}, function (error) {
												console.log("Error")
											})
									}
									//Transaction Activity for SaveTestcase Button Action
									// var labelArr = [];
									// var infoArr = [];
									// labelArr.push(txnHistory.codesDict['SaveTestcase']);
									// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
									/*if(deleteStep == false){
										selectRowStepNoFlag = true;

									}
									else{
										$("#globalModal").find('.modal-title').text("Delete Testcase step");
										$("#globalModal").find('.modal-body p').text("Successfully deleted the steps").css('color','black');
										$("#globalModal").modal("show");
										deleteStep = false;
									}*/
								} else {
									openDialog("Save Testcase", "Failed to save Testcase")
								}
							},
							function (error) { });
						serviceCallFlag = false;
					}
				} else {
					openDialog("Save Testcase", "ScreenID or TestscriptID is undefined")
					return false;
				}
			}
			cfpLoadingBar.complete();
		}
	}

	//Filter Scrape Objects
	$(document).on("click", ".checkStyleboxFilter", function () {
		cfpLoadingBar.start();
		blockUI("Filtering in progress. Please Wait...")
		$("html").css({
			'cursor': 'wait'
		});
		gsElement = []
		$(".popupContent-filter-active").each(function () {
			gsElement.push($(this).data("tag"))
		})
		$timeout(function () {
			filter()
			unblockUI();
		}, 500);
	})
	$(document).on("click", ".selectAllTxt", function () {
		cfpLoadingBar.start();
		blockUI("Filtering in progress. Please Wait...")
		$("html").css({
			'cursor': 'wait'
		});
		gsElement = []
		$(".popupContent-filter-active").each(function () {
			gsElement.push($(this).data("tag"))
		})
		$timeout(function () {
			filter()
			unblockUI();
		}, 500);
	})
	$(document).on("click", ".filterObjects", function () {
		cfpLoadingBar.start();
		blockUI('Filtering in progress. Please Wait...');
		//$(".checkStylebox").prop("checked", false);
		$("html").css({
			'cursor': 'wait'
		});
		$("#scraplist li").hide()
		if ($(this).hasClass("popupContent-filter-active") == false) {
			var getSpliceIndex = gsElement.indexOf($(this).data("tag"))
			gsElement.splice(getSpliceIndex, 1)
		} else gsElement.push($(this).data("tag"))
		$timeout(function () {
			filter()
			if (($("#scraplist li").find('input[name="selectAllListItems"]:checked').length == $("#scraplist li").find('input[name="selectAllListItems"]:visible').length) && $("#scraplist li").find('input[name="selectAllListItems"]:visible').length != 0) {
				$(".checkStylebox").prop("checked", true);
				$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", true).addClass('checked');
				$("#deleteObjects").prop("disabled", false)
			} else {
				$(".checkStylebox").prop("checked", false);
				$("#scraplist li").find('input[name="selectAllListItems"]:visible').prop("checked", false).removeClass('checked');
				$("#deleteObjects").prop("disabled", true)
			}
			//$(".checkStylebox,.checkall").prop("checked", false);
			if ($("#scraplist li").children('a').find('input[type=checkbox].checkall:checked:visible').length == 0) {
				$(".checkStylebox").prop("checked", false);
			}
			if ($("#scraplist li").children('a').find('input[type=checkbox]:visible').length == 0) {
				$(".checkStylebox").attr("disabled", true);
			}
			else {
				$(".checkStylebox").attr("disabled", false);
			}
			// var currentElements = $("span.ellipsis:visible").length;
			// if(currentElements == 0)
			// {
			//	 $("#saveObjects").prop('disabled',true);
			// }
			// else{
			//	 $("#saveObjects").prop('disabled',false);
			// }
			unblockUI();
		}, 500);
	})

	function filter() {
		if (gsElement.length > 0) {
			for (var i = 0; i < gsElement.length; i++) {
				if (gsElement[i] == "others") {
					$.each($("#scraplist li"), function () {
						if ($(this).data("tag") != "button" &&
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
							//$(this).data("tag") != "tab" &&
							$(this).data("tag").toLowerCase().indexOf("button") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("edit") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("edit box") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("text") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("edittext") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("combo box") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("hyperlink") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("check box") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("checkbox") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("image") == -1 &&
							($(this).data("tag").toLowerCase().indexOf("table") == -1 || $(this).data("tag").toLowerCase() == "tablecell") &&
							$(this).data("tag").toLowerCase().indexOf("radio button") == -1) {
							$(this).show();
						}
					});
				}
				else if (gsElement[i] == "othersAndroid"){
					$.each($("#scraplist li"), function () {
						if ($(this).data("tag") != "android.widget.Button" &&
							$(this).data("tag") != "android.widget.CheckBox" &&
							$(this).data("tag") != "android.widget.NumberPicker" &&
							$(this).data("tag") != "android.widget.TimePicker" &&
							$(this).data("tag") != "android.widget.DatePicker" &&
							$(this).data("tag") != "android.widget.RadioButton" &&
							$(this).data("tag") != "android.widget.EditText" &&
							$(this).data("tag") != "android.widget.ListView" &&
							$(this).data("tag") != "android.widget.Spinner" &&
							$(this).data("tag") != "android.widget.Switch" &&
							$(this).data("tag") != "android.widget.ImageButton" &&
							$(this).data("tag") != "android.widget.SeekBar" &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.button") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.checkbox") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.numberpicker") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.timepicker") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.datepicker") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.radiobutton") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.edittext") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.listview") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.spinner") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.switch") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.imagebutton") == -1 &&
							$(this).data("tag").toLowerCase().indexOf("android.widget.seekbar") == -1){
								$(this).show();
							}
					});
				}
				/*** Filtering Duplicate Objects ***/
				else if (gsElement[i] == "duplicateCustnames") {
					var allCustnames = [];
					var duplicateCustnames = [];
					if (window.localStorage['_modified']) {
						modifiednames = JSON.parse(window.localStorage['_modified']);
					}
					//if object names are modified
					if (modifiednames.length > 0) {
						var mdName;
						for (var j = 0; j < modifiednames.length; j++) {
							mdName = modifiednames[j].split("^^");
							if (eaCheckbox) {
								if (mdName[1]) {
									if (newScrapedList.view[mdName[1]])
										newScrapedList.view[mdName[1]].custname = mdName[0];
								}
							}
							else {
								if (mdName[1]) {
									if (viewString.view[mdName[1]])
										viewString.view[mdName[1]].custname = mdName[0];
								}
							}
						}
					}
					//If Enable Append checkbox is true
					if (eaCheckbox) {
						//If Enable Append checkbox is true and object names are modified
						if (modifiednames.length > 0) {
							var mdName;
							for (var k = 0; k < modifiednames.length; k++) {
								mdName = modifiednames[k].split("^^");
								if (eaCheckbox) {
									if (mdName[1]) {
										if (newScrapedList.view[mdName[1]])
											newScrapedList.view[mdName[1]].custname = mdName[0];
									}
								}
								else {
									if (mdName[1]) {
										if (viewString.view[mdName[1]])
											viewString.view[mdName[1]].custname = mdName[0];
									}
								}
							}
						}
						if ('view' in newScrapedList) {
							for (var l = 0; l < newScrapedList.view.length; l++) {
								allCustnames.push($.trim(newScrapedList.view[l].custname).replace(/[<>]/g, ''));	   //get all custnames
							}
						}
						if ('view' in viewString) {
							for (var m = 0; m < viewString.view.length; m++) {
								allCustnames.push($.trim(viewString.view[m].custname).replace(/[<>]/g, ''));		   //get all custnames
							}
						}

					}
					//If Enable Append checkbox is false
					else {
						if ('view' in viewString) {
							for (var n = 0; n < viewString.view.length; n++) {
								allCustnames.push($.trim(viewString.view[n].custname).replace(/[<>]/g, ''));		   //get all custnames
							}
						}
					}
					var custnameIndices = {};

					for (var p = 0; p < allCustnames.length; p++) {
						if (!custnameIndices.hasOwnProperty(allCustnames[p])) {
							//custnameIndices[allCustnames[p]] = custnameIndices[allCustnames[p]] + 1;
							custnameIndices[allCustnames[p]] = [];
						}
						custnameIndices[allCustnames[p]].push(p);
					}
					var custnameIndices = Object.values(custnameIndices);

					for (var q = 0; q < custnameIndices.length; q++) {
						if (custnameIndices[q].length > 1) {
							$.each($("#scraplist li"), function () {
								for (var r = 0; r < custnameIndices[q].length - 1; r++) {
									if ($.trim(parseInt($(this)[0].getAttribute("val"))) == $.trim(parseInt(custnameIndices[q][r])))								   // if($.trim($(this)[0].childNodes[0].childNodes[2].innerHTML) == $.trim(duplicateCustnamesLen[q]))
									{
										$(this)[0].style.display = 'block';					 //Display duplicate custnames only
										$(this)[0].children[0].children[2].style.color = 'red'; //Display duplicate custnames in red color
									}
								}

							});
						}
						// else if(custnameIndices[q].length == 1)
						// {
						//   console.log('QQQQQ',custnameIndices[q]);
						// }
					}
				}
				else if(gsElement[i] == "userobj"){
					$.each($("#scraplist li"), function () {
						if ($(this).find('#decrypt').length==1) 
						{
							$(this).show();
						}
					});
				}
				else {
					$.each($("#scraplist li"), function () {
						if (gsElement[i] == $(this).data("tag") || ($(this).data("tag").toLowerCase().indexOf(gsElement[i].toLowerCase()) >= 0 && gsElement[i] != "a" && $(this).data("tag").toLowerCase() != "radio button" && $(this).data("tag").toLowerCase() != "radiobutton" && $(this).data("tag").toLowerCase().indexOf("listview") < 0 && $(this).data("tag").toLowerCase().indexOf("tablecell") < 0) ||
							(gsElement[i] == "input" && ($(this).data("tag").indexOf("edit") >= 0 || $(this).data("tag").indexOf("Edit Box") >= 0 || $(this).data("tag").indexOf("text") >= 0 || $(this).data("tag").indexOf("EditText") >= 0 || $(this).data("tag").indexOf("TextField") >= 0)) ||
							(gsElement[i] == "select" && $(this).data("tag").indexOf("combo box") >= 0) ||
							(gsElement[i] == "a" && ($(this).data("tag").indexOf("hyperlink") >= 0 /* || $(this).data("tag").indexOf("Static") >= 0*/)) ||
							(gsElement[i] == "checkbox" && $(this).data("tag").indexOf("check box") >= 0) ||
							(gsElement[i] == "radiobutton" && $(this).data("tag").indexOf("radio button") >= 0)
							/*|| (gsElement[i] == "others" && $(this).data("tag").indexOf("scroll bar") >= 0)
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
							|| (gsElement[i] == "others" && $(this).data("tag").indexOf("XCUIElementTypeSearchField") >= 0)*/
						) {
							$(this).show();
						}
					});
				}
			}

		} else {
			$("#scraplist li").show();
			$("#scraplist li").find("span.ellipsis:visible").css('color', '#33363B');
		}
		$("html").css({
			'cursor': 'auto'
		});
		cfpLoadingBar.complete()

	}

	//Click on add dependent testcase
	$(document).on("click", "#addDependent", function () {
		if (!$(this).is(":checked")) {
			$("input[type=checkbox]:checked").prop("checked", false);
			dependentTestCaseFlag = false;
		} else {
			$("span.errTestCase").addClass("hide");
			//subTask = JSON.parse(window.localStorage['_CT']).subtask;
			//var testScenarioId = "e191bb4a-2c4f-4909-acef-32bc60e527bc";
			var ctj = JSON.parse(window.localStorage['_CT']);
			var testScenarioId = ctj.scenarioId;
			//var screenId = ctj.screenId;
			DesignServices.getTestcasesByScenarioId_ICE(testScenarioId)
				.then(function (data) {
					if (data == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					$("#dependentTestCasesContent").empty();
					//data = data.sort();
					for (var i = 0; i < data.length; i++) {
						$("#dependentTestCasesContent").append("<span class='testcaseListItem'><input data-attr = " + data[i].testcaseId + " class='checkTestCase' type='checkbox' id='dependentTestCase_" + i + "' /><label title=" + data[i].testcaseName + " class='dependentTestcases' for='dependentTestCase_" + i + "'>" + data[i].testcaseName + "</label></span><span class='viewReadOnlyTC'  data-id = " + data[i].testcaseId + " data-name = " + data[i].testcaseName + "><button type='button' class='btn btn-link'>View</button></span><br />");
					}
					$(".viewReadOnlyTC").click(function () {
						var testCaseName = this.getAttribute('data-name'),
							testCaseId = this.getAttribute('data-id');
						DesignServices.readTestCase_ICE(testCaseId, testCaseName, 0)
							.then(function (response) {
								if (response == "Invalid Session") {
									return $rootScope.redirectPage();
								}
								var source = $("#handlebar-template-testcase").html();
								var template = Handlebars.compile(source);
								// try {
								// 	JSON.parse(response.testcasesteps);
								// }
								// catch (err) {
								// 	response.testcasesteps = '[]';
								// }
								var dat = template({ name: [{ testcasename: response.testcasename }], rows: response.testcase });
								var newWindow = window.open();
								newWindow.document.write(dat);
							},
							function (error) { });
						//alert( "Handler for .click() called." );
					});
					//$(document).on('shown.bs.modal','#dialog-addDependentTestCase', function () {
					if (checkedTestcases.length > 0)
						$("input[type=checkbox].checkTestCase").prop("checked", false);
					else $("input[type=checkbox].checkTestCase").prop("checked", true);
					var currentTestCase = JSON.parse(window.localStorage['_CT']).testCaseName;
					$("span.testcaseListItem").each(function () {
						if (currentTestCase == $(this).children("label").text()) {
							$(this).children('input.checkTestCase').attr("disabled", true)
							//$(".checkTestCase[disabled=disabled]").prop('checked',false);
							$(this).nextAll('.testcaseListItem').children('input.checkTestCase').attr("disabled", true);
							$(".checkTestCase[disabled=disabled]").prop('checked', false);
						}
						for (i = 0; i < checkedTestcases.length; i++) {
							if ($(this).children('input.checkTestCase').data("attr") == checkedTestcases[i] && currentTestCase != $(this).children("label").text()) {
								$(this).children('input.checkTestCase').prop("checked", true);
							}
						}
					});
					//});
					//Display testcase in the modal
					$("#dialog-addDependentTestCase").modal("show");

					$(document).on('click', '#debugOn', function (e) {
						var checkedLength = $(".checkTestCase:checked").length;
						checkedTestcases = [];
						if (checkedLength == 0) {
							$("span.errTestCase").removeClass("hide");
							return false;
						} else {
							$("span.errTestCase").addClass("hide");
							$("input[type=checkbox].checkTestCase:checked").each(function () {
								checkedTestcases.push($(this).attr("data-attr"));
							});
							if (checkedTestcases.length > 0) {
								checkedTestcases.push(JSON.parse(window.localStorage['_CT']).testCaseId);
								$("button.close:visible").trigger('click');
								$("#globalModal").find('.modal-title').text("Dependent Test Cases");
								$("#globalModal").find('.modal-body p').html("Dependent Test Cases saved successfully");
								$("#globalModal").modal("show");
								dependentTestCaseFlag = true;
							} else {
								$("button.close:visible").trigger('click');
								$("#globalModal").find('.modal-title').text("Dependent Test Cases");
								$("#globalModal").find('.modal-body p').html("Failed to save dependent testcases");
								$("#globalModal").modal("show");
							}
							//Transaction Activity for AddDependentTestCase Button Action
							// var labelArr = [];
							// var infoArr = [];
							// labelArr.push(txnHistory.codesDict['AddDependentTestCase']);
							// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);						
						}
					});
				}, function (error) { });
		}
	});



	// Details Icon Click
	$(document).on('click', '.detailsIcon', function (e) {
		modalId = '';
		modalId = e.target.id;
		modalId = parseInt(modalId.split("_")[1]);
		if (e.target.className.includes('inActiveDetails')) {
			openModalFormDialog('Add Test Step Details', '');
			$(".stepDetailsContainer").empty()
			$(".stepDetailsContainer").append("<div class='formGroup form-inline form-custom'><input autocomplete='off' id='testDetails_" + modalId + "' maxlength='50' type='text' class='form-control form-control-custom form-control-width' placeholder='Enter Expected Result'></div><div id='pass_" + modalId + "' class='passFormFields'><div class='formGroup form-inline form-custom'><input autocomplete='off' id='actualResult_" + modalId + "' type='text'  maxlength='50' class='form-control form-control-custom form-control-width' placeholder='Enter Actual Result for Pass Status'></div></div><div id ='fail_" + modalId + "' class='failFormFields'><div class='formGroup form-inline form-custom'><input autocomplete='off' id='actualResult_" + modalId + "' type='text'  maxlength='50' class='form-control form-control-custom form-control-width' placeholder='Enter Actual Result for Fail Status'></div></div>")

		}
		else {
			var taskInfo = JSON.parse(window.localStorage['_CT']);
			var screenId = taskInfo.screenId;
			var testCaseId = taskInfo.testCaseId;
			var testCaseName = taskInfo.testCaseName;
			var versionnumber = taskInfo.versionnumber;
			DesignServices.readTestCase_ICE(testCaseId, testCaseName, versionnumber)
				.then(function (response) {
					if (response == "Invalid Session") {
						return $rootScope.redirectPage();
					}
					var testcaseSteps = response.testcase;//JSON.parse(response.testcase);
					if (typeof (testcaseSteps[modalId - 1].addTestCaseDetailsInfo) == "object") {
						var details = testcaseSteps[modalId - 1].addTestCaseDetailsInfo;
					}
					else {
						var details = JSON.parse(testcaseSteps[modalId - 1].addTestCaseDetailsInfo);
					}

					openModalFormDialog('Add Test Step Details', '');
					$(".stepDetailsContainer").empty()
					$(".stepDetailsContainer").append("<div class='formGroup form-inline form-custom'><input autocomplete='off' id='testDetails_" + modalId + "' maxlength='50' type='text' class='form-control form-control-custom form-control-width' placeholder='Enter Expected Result'></div><div id='pass_" + modalId + "' class='passFormFields'><div class='formGroup form-inline form-custom'><input autocomplete='off' id='actualResult_" + modalId + "' type='text'  maxlength='50' class='form-control form-control-custom form-control-width' placeholder='Enter Actual Result for Pass Status'></div></div><div id ='fail_" + modalId + "' class='failFormFields'><div class='formGroup form-inline form-custom'><input autocomplete='off' id='actualResult_" + modalId + "' type='text'  maxlength='50' class='form-control form-control-custom form-control-width' placeholder='Enter Actual Result for Fail Status'></div></div>");
					$("#testDetails_" + modalId + "").val(details.testcaseDetails);
					//$("#pass_"+modalId+"").find("#expectedResult_"+modalId+"").val(details.expectedResult_pass);
					$("#pass_" + modalId + "").find("#actualResult_" + modalId + "").val(details.actualResult_pass);
					// $("#fail_"+modalId+"").find("#expectedResult_"+modalId+"").val(details.expectedResult_fail);
					$("#fail_" + modalId + "").find("#actualResult_" + modalId + "").val(details.actualResult_fail);
					// var currentTestStep = testcaseSteps[modalId -1];
					// console.log('currentTeststep', currentTestStep);
					// if('hideTestcaseDetails' in currentTestStep)
					// {
					//	 if(currentTestStep.hideTestcaseDetails == true)
					//	 {
					//		 $('input#hideDetailsCheck_'+modalId+'').prop('checked', true);
					//	 }
					//	 else{
					//		 $('input#hideDetailsCheck_'+modalId+'').prop('checked', false);
					//	 }
					// }
				},
				function (error) { });
		}
		e.stopImmediatePropagation();
	});;


	$scope.submit_task = function (action, e) {
		var taskinfo = JSON.parse(window.localStorage['_CT']);
		var taskid = taskinfo.subTaskId;
		var taskstatus = taskinfo.status;
		var version = taskinfo.versionnumber;
		var batchTaskIDs = taskinfo.batchTaskIDs;
		var projectId = taskinfo.projectId;
		if (action != undefined && action == 'reassign') {
			taskstatus = action;
		}
		//Transaction Activity for Task Submit/Approve/Reassign Button Action
		// var labelArr = [];
		// var infoArr = [];

		mindmapServices.reviewTask(projectId, taskid, taskstatus, version, batchTaskIDs,false).then(function (result) {
			if (result == 'fail') {
				openDialog("Task Submission Error", "Reviewer is not assigned !", true)
			} else if (taskstatus == 'reassign') {
				openDialog("Task Reassignment Success", "Task Reassigned successfully!", true)
				// labelArr.push(txnHistory.codesDict['TaskReassign']);
			} else if (taskstatus == 'underReview') {
				openDialog("Task Completion Success", "Task Approved successfully!", true)
				// labelArr.push(txnHistory.codesDict['TaskApprove']);
			} else {
				openDialog("Task Submission Success", "Task Submitted successfully!", true)
				// labelArr.push(txnHistory.codesDict['TaskSubmit']);
			}

			//txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
			$timeout(function () {
				$(".close:visible").addClass('globalSubmit');
			}, 200)

		}, function (error) {
			console.log(error);
		})
	}
	//Filter Scrape Objects
}]);

function updateTestCase_ICE() {
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
	if (newTestScriptData == "undefined" || newTestScriptData == null || newTestScriptData == "") {
		scrappedData = "";
	} else {
		scrappedData = newTestScriptData;
	}
	$("#jqGrid").jqGrid({
		datastr: obj,
		datatype: "jsonstring",
		editUrl: 'obj',
		page: 1,
		scroll: 1,
		colModel: [
			{ label: 'Step No', name: 'stepNo', key: true, editable: false, sortable: false, resizable: false, hidden: true },
			{ name: 'objectName', editable: false, sortable: false, resizable: false, hidden: true },
			{
				label: 'Object Name', name: 'custname', editable: true, resizable: false, sortable: false,
				edittype: 'select',
				editoptions: {
					value: getTags(scrappedData),
					dataEvents: [{
						type: 'change',
						'fn': editCell
					}]
				}
			},
			{
				label: 'Keyword', name: 'keywordVal', editable: true, resizable: false, sortable: false,
				edittype: 'select',
				editoptions: {
					value: getKeywordList(keywordArrayList),
					dataEvents: [{
						type: 'change',
						'fn': editkeyWord
					}]
				}
			},
			{ label: 'Input', name: 'inputVal', editable: true, resizable: false, sortable: false },
			{ label: 'Output', name: 'outputVal', editable: true, resizable: false, sortable: false },
			{ label: 'Remarks', name: 'remarksStatus', editable: false, resizable: false, sortable: false },
			{ label: 'Remarks', name: 'remarks', editable: false, resizable: false, sortable: false, hidden: true },
			{ label: 'URL', name: 'url', editable: false, resizable: false, hidden: true },
			{ label: 'appType', name: 'appType', editable: false, resizable: false, hidden: true },
			{ label: 'Details', name: 'addTestCaseDetails', editable: false, resizable: false, sortable: false },
			{ label: 'Details', name: 'addTestCaseDetailsInfo', editable: false, resizable: false, sortable: false, hidden: true },
			{ label: 'cord', name: 'cord', editable: false, resizable: false, hidden: true }
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
				return false; // doesnot allow to select the row
			}
			return true; // allows to select the row
		},
		//width:950,
		drag: true,
		height: 'auto',
		rowList: [],
		rowNum: 1000,
		rownumbers: true,
		toppager: true,
		autoencode: true,
		scrollrows: true,
		loadComplete: function (data) {
			loadedGridData = JSON.parse(JSON.stringify(data));
			$("#jqGrid tr[id^='jqg']").remove();
			var v = 1;

			$("#jqGrid tr:visible").each(function () {

				if ($(this).find("td:nth-child(10)").text().trim().length <= 0) {
					$(this).find("td:nth-child(9)").text('');
					$(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-inactive.png" class="remarksIcon"/>');
				} else {
					$(this).find("td:nth-child(9)").text('');
					$(this).find("td:nth-child(9)").append('<img src="imgs/ic-remarks-active.png" class="remarksIcon"/>');
				}

				var rowId = parseInt($(this).children("td[aria-describedby='jqGrid_stepNo']").text());
				if ('rows' in data) {
					if (typeof (data.rows[rowId - 1].addTestCaseDetailsInfo) == 'object') {
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetailsInfo', angular.toJson(data.rows[rowId - 1].addTestCaseDetailsInfo));
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetails', angular.toJson(data.rows[rowId - 1].addTestCaseDetails));
					}
					else {
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetailsInfo', data.rows[rowId - 1].addTestCaseDetailsInfo);
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetails', data.rows[rowId - 1].addTestCaseDetails);
					}
					var str = typeof (data.rows[rowId - 1].addTestCaseDetailsInfo);

				}
				else {

					if (typeof (data[rowId - 1].addTestCaseDetailsInfo) == 'object') {
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetailsInfo', angular.toJson(data[rowId - 1].addTestCaseDetailsInfo));
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetails', angular.toJson(data[rowId - 1].addTestCaseDetails));
					}
					else {
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetailsInfo', data[rowId - 1].addTestCaseDetailsInfo);
						$('#jqGrid').jqGrid('setCell', rowId, 'addTestCaseDetails', data[rowId - 1].addTestCaseDetails);
					}
					var str = typeof (data[rowId - 1].addTestCaseDetailsInfo);
				}



				var getRowData = $('#jqGrid').jqGrid('getRowData', rowId);

				if (str == "string" && 'rows' in data) {
					if (data.rows[rowId - 1].addTestCaseDetailsInfo.length > 0) {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img alt="activeDetails" title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon activeDetails"/>');
					}
					else if (data.rows[rowId - 1].addTestCaseDetails.length == 0) {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img alt="inActiveDetails"  title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
					}
					else {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img  alt="inActiveDetails" title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
					}
				}
				else if (str == "string") {
					if (data[rowId - 1].addTestCaseDetailsInfo.length > 0) {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img  alt="activeDetails"  title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon activeDetails"/>');
					}
					else if (data[rowId - 1].addTestCaseDetails.length == 0) {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img alt="inActiveDetails" title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
					}
					else {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img alt="inActiveDetails"  title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
					}
				}

				if (str != "string") {
					if (str != "" && str != "undefined" && str != undefined && (data[rowId - 1].addTestCaseDetailsInfo.testcaseDetails!= "" || data[rowId - 1].addTestCaseDetailsInfo.actualResult_pass!= ""||data[rowId - 1].addTestCaseDetailsInfo.actualResult_fail!= "") ){
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img  alt="activeDetails" title="" id="details_' + v + '" src="imgs/ic-details-active.png" class="detailsIcon activeDetails"/>');
					}
					else {
						$(this).find("td:nth-child(13)").text('');
						$(this).find("td:nth-child(13)").append('<img  alt="inActiveDetails" title="" id="details_' + v + '" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
					}
				}
				v++;
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
			for (i = 0; i < gridArrayData.length; i++) {
				if (gridArrayData[i].outputVal.indexOf('##') !== -1 || gridArrayData[i].outputVal.indexOf(';##') !== -1) {
					$(this).find('tr.jqgrow')[i].style.borderLeft = "5px solid red";
					$(this).find('tr.jqgrow')[i].childNodes[0].style.paddingRight = "7px"
					$(this).find('tr.jqgrow')[i].childNodes[1].childNodes[0].style.marginLeft = "-4px";
					$(this).find('tr.jqgrow')[i].childNodes[7].style.color = "red";
				} else {
					//$(this).find('tr.jqgrow')[i].style.borderLeft = "5px solid transparent";
					//$(this).find('tr.jqgrow')[i].childNodes[0].style.marginLeft = "-4px"
					$(this).find('tr.jqgrow')[i].childNodes[7].style.color = "";
				}
			}
			hideOtherFuncOnEdit();
			$("#jqGrid").parent('div').css('height', 'auto');
			if (getScrapeDataforCustomObj != "" && getScrapeDataforCustomObj != undefined) {
				for (i = 0; i < getScrapeDataforCustomObj.length; i++) {
					if (getScrapeDataforCustomObj[i].xpath == "" && !getScrapeDataforCustomObj[i].cord) {
						var testGridData = $("#jqGrid tbody tr:not(.jqgfirstrow)");
						$.each(testGridData, function () {
							if ($(this).find("td[aria-describedby='jqGrid_custname']").text() == scrappedData[i].custname) {
								$(this).find("td[aria-describedby='jqGrid_custname']").addClass("addCustObj");

							}
						})
					}
				}
			}
		},
	})

		//commented the sorting of rows (drag and drop) on purpose - Dated: 5/12/2015
		.jqGrid('sortableRows', {
			update: function (ev, ui) {
				var item = ui.item[0],
					ri = item.rowIndex,
					itemId = item.id,
					message = "The row with the id=" + itemId + " is moved. The new row index is " + ri;
				var gridArrayData = $("#jqGrid").jqGrid('getRowData');
				for (var i = 0; i < gridArrayData.length; i++) {
					gridArrayData[i].stepNo = i + 1;
				}
				$("#jqGrid").jqGrid('restoreRow', lastSelection);
				$("#jqGrid").jqGrid('clearGridData');
				$("#jqGrid").jqGrid('setGridParam', {
					data: gridArrayData
				});
				$("#jqGrid").trigger("reloadGrid");
				$("#jqGrid").parent('div').css('height', 'auto');
				//tsrows_reorder();
			}
		});

	//Focus JqGrid onLoad
	$("#jqGrid").focus().css("outline", "none");

	$(document).on('click', "[name='inputVal'],[name='custname'],[name='keywordVal'],[name='outputVal']", function () {
		if ($("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "getBody" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeader" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setWholeBody" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeaderTemplate") {
			var getValueInput = $("[name='inputVal']").parent().attr('title');
			if (getValueInput == undefined) {
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='editable form-control'></textarea>")
			} else {
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='editable form-control'>" + getValueInput.split('##').join('\n') + "</textarea>")
			}
		}
	});
	$(document).on('focus', "[name='inputVal'],[name='custname'],[name='keywordVal'],[name='outputVal']", function (e) {
		if ($("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "getBody" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeader" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setWholeBody" ||
			$("[name='inputVal']").parent().siblings("[aria-describedby='jqGrid_keywordVal']").children().val() == "setHeaderTemplate") {
			var getValueInput = $("[name='inputVal']").parent().attr('title');
			if (getValueInput == undefined) {
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='editable form-control'></textarea>")
			} else {
				$("[name='inputVal']").parent().html("<textarea rows='1' style='resize:none;width:98%;min-height:25px;' class='editable form-control'>" + getValueInput.split('##').join('\n') + "</textarea>")
			}
		}
		e.preventDefault();
	});

	$("#jqGrid_rn").css("width", "54px");
	$('#jqGrid').navGrid("#jqGridPager", {
		edit: false,
		add: false,
		del: false,
		refresh: false,
		view: false,
		search: false,
		position: "left",
		cloneToTop: true
	});
	$('#jqGrid').inlineNav('#jqGrid_toppager', {
		// the buttons to appear on the toolbar of the grid
		edit: false,
		add: false,
		del: false,
		save: false,
		cancel: false,
		addParams: {
			keys: true,
			position: "last"
		}
	});

	$("#jqGrid_toppager").hide();
	$("#jqGrid").find(">tbody").sortable("disable");
	$("#jqGrid").jqGrid("setColProp", "stepNo", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "objectName", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "custname", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "url", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "appType", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "addTestCaseDetails", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "addTestCaseDetailsInfo", {
		editable: false
	});
	$("#jqGrid").resetSelection();

	$(document).on('click', '.remarksIcon', function () {
		$('td[aria-describedby="jqGrid_remarks"]').removeClass('selectedRemarkCell');
		$(this).parent('td').next('td[aria-describedby="jqGrid_remarks"]').addClass('selectedRemarkCell');
		var historyDetails = $(this).parent('td').next('td[aria-describedby="jqGrid_remarks"]').text().trim();
		var historyArray = [];
		/*$("#getremarksData").val('');
		$("#modalDialogRemarks").modal("show");*/
		if (historyDetails.indexOf(";") >= 0)
			historyArray = historyDetails.split(";");
		else {
			if (historyDetails) historyArray.push(historyDetails);
		}

		if (historyArray.length > 0) {
			$(".historyContents").empty();
			for (i = 0; i < historyArray.length; i++) {
				if (historyArray[i] != "" && historyArray[i] != " ") {
					$(".historyContents").append("<span class=''>" + historyArray[i] + "</span>");
				}
			}
			$(".historyDetailsContainer").show();
		} else $(".historyDetailsContainer").hide();
		//$("#modalDialogRemarks").find('.modal-title').text("Remarks");
		//$("#modalDialogRemarks").find('#labelContent').text("Add Remarks");
		$("#getremarksData").val('');
		//$("#modalDialogRemarks").find('.modal-footer button').attr("id","btnaddRemarks");
		$("#modalDialogRemarks").modal("show");
	})

	$(document).on('click', '#btnaddRemarks', function (e) {
		//var oldRemarks = $("#jqGrid tbody tr td.selectedRemarkCell").text().trim();
		if (!$("#getremarksData").val().trim()) {
			$("#getremarksData").addClass("errorClass");
		} else {
			var userinfo = JSON.parse(window.localStorage['_UI']);
			var d = new Date();
			var DATE = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
			var TIME = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
			var getremarks = $("#getremarksData").val().trim() + " (From: " + userinfo.firstname + " " + userinfo.lastname + " On: " + DATE + " " + TIME + ")";
			if (getremarks.length > 0) {
				$("#jqGrid tbody tr td.selectedRemarkCell").text(getremarks);
				//$("#jqGrid tbody tr td.selectedRemarkCell").attr('title',getremarks);
				$("#jqGrid tbody tr td.selectedRemarkCell").removeClass('selectedRemarkCell');
				$(this).parent(".modal-footer").parent(".modal-content").find(".close").trigger('click');
			}
			//Transaction Activity for AddRemarksTestStep Button Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['AddRemarksTestStep']);
			// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);				   
		}
	})
	$("#getremarksData").change(function() {
		$("#getremarksData").removeClass('errorClass');
	});

	$(document).on('click', '.close', function (e) {
		$("#getremarksData").removeClass('errorClass');
	})

	//Save teststep details
	$(document).on('click', '#saveTestStepDetails', function (e) {
		var $grid = $('#jqGrid');
		getTestStepDetailsRowData = $grid.jqGrid('getRowData', modalId);
		getTestStepDetailsRowData.addTestCaseDetailsInfo = {};
		var testDetails = $.trim($('#testDetails_' + modalId + '').val());
		//  var expectedResult_pass = $.trim($('#pass_'+modalId+'').find('#expectedResult_'+modalId+'').val());
		var actualResult_pass = $.trim($('#pass_' + modalId + '').find('#actualResult_' + modalId + '').val());
		//  var expectedResult_fail = $.trim($('#fail_'+modalId+'').find('#expectedResult_'+modalId+'').val());
		var actualResult_fail = $.trim($('#fail_' + modalId + '').find('#actualResult_' + modalId + '').val());

		//if (testDetails == '' && actualResult_pass == '' && actualResult_fail == '') {
		//	$('#globalModalForm').modal('hide');
		//	openDialog('Add Test Step Details', 'Please enter atleast one field to save test step details');
		//}
		//else {

			if (testDetails == '' && actualResult_pass == '' && actualResult_fail == '') {
				getTestStepDetailsRowData.addTestCaseDetails = '';
				getTestStepDetailsRowData.addTestCaseDetailsInfo = {
					"testcaseDetails": "",
					"actualResult_pass": "",
					"actualResult_fail": "",
				};
			}

			getTestStepDetailsRowData.addTestCaseDetailsInfo = {
				"testcaseDetails": testDetails,
				"actualResult_pass": actualResult_pass,
				"actualResult_fail": actualResult_fail,
			};
			var hideDetails = $('#hideDetailsCheck_' + modalId + '').is(':checked');
			//getTestStepDetailsRowData.hideTestcaseDetails = hideDetails;
			$grid.jqGrid('setCell', modalId, 'addTestCaseDetailsInfo', JSON.stringify(getTestStepDetailsRowData.addTestCaseDetailsInfo));
			//$grid.jqGrid('setCell', modalId, 'hideTestcaseDetails', getTestStepDetailsRowData.hideTestcaseDetails);
			var gridData = $grid.jqGrid('getGridParam', 'data');
			for (let i = 0; i < gridData.length; i++) {
				if (gridData[i].stepNo === getTestStepDetailsRowData.stepNo) {
					gridData[i] = getTestStepDetailsRowData;
				}
				// if('addTestCaseDetailsInfo' in  gridData[i])
				// {
				//	 if(gridData[i].addTestCaseDetailsInfo != "undefined")
				//	 {
				//		 $("tr#"+modalId).find("td:nth-child(13)").text('');
				//		 $("tr#"+modalId).find("td:nth-child(13)").append('<img id="details_'+modalId+'" src="imgs/ic-details-active.png" class="detailsIcon activeDetails"/>');
				//	 }
				//	 else{
				//		 $("tr#"+modalId).find("td:nth-child(13)").text('');
				//		 $("tr#"+modalId).find("td:nth-child(13)").append('<img id="details_'+modalId+'" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
				//	 }
				// }
				// else{
				//	 $("tr#"+modalId).find("td:nth-child(13)").text('');
				//	 $("tr#"+modalId).find("td:nth-child(13)").append('<img id="details_'+modalId+'" src="imgs/ic-details-inactive.png" class="detailsIcon inActiveDetails"/>');
				// }
			}

			$(".close:visible").trigger('click');
			//Transaction Activity for Filter Button Action
			// var labelArr = [];
			// var infoArr = [];
			// labelArr.push(txnHistory.codesDict['SaveTestStepDetails']);
			// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);					 
		//}
	});

	//Reset test step details
	$(document).on('click', '#resetTestStepDetails', function (e) {
		$('input:visible').val('');
	});

	function hideOtherFuncOnEdit() {
		$("#jqGrid").each(function () {
			var cboxCheckedLen = $(".cbox:not(#cb_jqGrid):checked").length;
			var cboxLen = $(".cbox:not(#cb_jqGrid)").length;
			var editableLen = $(".editable").length;
			var cboxParentCheckedLen = $('#cb_jqGrid:checked').length;
			var rowHighlightLen = $("tr.rowHighlight").length;
			var rowSelectedLen = $("tr.ui-state-highlight").length;
			$("tr.rowHighlight").each(function () {
				if (rowSelectedLen > 0) {
					$("tr.rowHighlight").removeClass("rowHighlight");
				}
			});

			if (cboxLen == cboxCheckedLen) {
				$("#cb_jqGrid").prop('checked', true);
			} else {
				$("#cb_jqGrid").prop('checked', false);
			}
		});

		$(".cbox:not(#cb_jqGrid)").each(function () {
			$(this).on('click', function (e) {
				var isCboxChecked = $(this).is(":checked");
				var checkedLen = $(".cbox:checked").length;
				if (isCboxChecked == true) {
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});

		$("tr.jqgrow").each(function () {
			$(this).on('click', function (e) {
				var rowId = $(this).attr("id");
				if (rowId == (e.target.parentElement.id || e.target.parentElement.parentElement.id)) {
					$(".cbox:not(:checked):not(#cb_jqGrid)").parent().parent("tr.ui-state-highlight").removeClass('ui-state-highlight');
				}
			});
		});

		$(".cbox:checked:not(#cb_jqGrid)").parent().parent().siblings("tr.jqgrow").each(function () {
			var checkedBoxLen = $(".cbox:checked").length;
			if ($(this).hasClass('ui-state-highlight') && checkedBoxLen == 1) {
				$(this).removeClass('ui-state-highlight');
				$(this).find(".cbox").attr("checked", false);
			}
		});

		//Hide EditTestStep when multiple rows selected
		var checkedLen = $(".cbox:checked:not(#cb_jqGrid)").length;
		if (checkedLen > 1) {
			$("#editTestStep").hide();
		} else {
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

	function editRow(id, status, e) {
		if (id && id !== lastSelection) {
			var grid = $("#jqGrid");
			if (grid[0].children[0].children[id].children[1].children[0].checked) {
				var selectedText = grid.jqGrid('getRowData', id).custname;
				var selectedKeyword = grid.jqGrid('getRowData', id).keywordVal;
				grid.jqGrid('restoreRow', lastSelection);
				grid.jqGrid('editRow', id, {
					keys: true
				});
				setKeyword(e, selectedText, grid, selectedKeyword);
				lastSelection = id;
				window.localStorage['selectRowStepNo'] = id;
			}
			//else return false;
		} else {
			var grid = $("#jqGrid");
			grid.jqGrid('restoreRow', lastSelection);
			lastSelection = "";
		}
		shortString(); //Call to wrap the select option text in JqGrid
		//get Input and Output Syntax for selected Keyword
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		$.each(keywordArrayList, function (index, value) {
			keywordArrayKey = index;
			keywordArrayValue = value; //JSON.parse(value);
			if (selectedKeywordList == keywordArrayKey) {
				$.each(keywordArrayValue, function (k, v) {
					if (selectedKeyword == k) {
						if (v != "") {
							inputSyntax = v.inputval;//JSON.parse(v).inputVal;
							outputSyntax = v.outputval;//JSON.parse(v).outputVal;
						}
						else {
							inputSyntax = v;
							outputSyntax = v;
						}
						grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	function setKeyword(e, selectedText, $grid, selectedKeyword) {
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var appTypeLocal = taskInfo.appType; //window.localStorage['appTypeScreen'];
		var cord = null;
		if (selectedText == "") {
			selectedText = "@Generic"
		}
		if (selectedText == "@Generic" || selectedText == undefined) {
			objName = " ";
			url = " ";
			if (appTypeLocal == "MobileApp") {
				var sc = Object.keys(keywordArrayList.defaultListMobility);
				selectedKeywordList = "defaultListMobility";
				var res = '';
				for (var i = 0; i < sc.length; i++) {
					if (selectedKeyword == sc[i]) {
						res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
					} else
						res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
			} else {
				if (appTypeLocal == 'MobileApp') {
					var sc = Object.keys(keywordArrayList.defaultListMobility);
					selectedKeywordList = "defaultListMobility";
				} else {
					var sc = Object.keys(keywordArrayList.defaultList);
					selectedKeywordList = "defaultList";
				}
				var res = '';
				for (var i = 0; i < sc.length; i++) {
					if (selectedKeyword == sc[i]) {
						res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
					} else
						res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
				}
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'appType', "Generic");
				$grid.jqGrid('setCell', rowId, 'url', url);
				$grid.jqGrid('setCell', rowId, 'objectName', objName);
				$grid.jqGrid('setCell', rowId, 'cord', cord);
			}
		}
		else if (selectedText == "@System") {
			var sc = Object.keys(keywordArrayList.system);
			selectedKeywordList = "getOsInfo";
			objName = " ";
			url = " ";
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', "System");
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		}
		else if (selectedText == "@Browser") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.browser);
			selectedKeywordList = "browser";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} else if (selectedText == "@BrowserPopUp") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.browserPopUp);
			selectedKeywordList = "browserPopUp";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		}
		/**
		 * To Handle custom objects mapping @custom to element keywords
		 * @author sushma.p
		 * Date Sept-09-2015
		 */
		else if (selectedText == "@Custom") {
			objName = "@Custom";
			url = "";
			var sc;
			var res = '';
			if (appTypeLocal == 'Desktop') {
				sc = Object.keys(keywordArrayList.customDp);
				selectedKeywordList = "customDp";
			} else if (appTypeLocal == 'DesktopJava') {
				sc = Object.keys(keywordArrayList.customOEBS);
				selectedKeywordList = "customOEBS";
				var newTSDataLS = angular.element(document.getElementById('jqGrid')).scope().newTestScriptDataLS;
				if (newTSDataLS) {
					if (newTSDataLS != "undefined") {
						//var testScriptTableData = JSON.parse(newTSDataLS);
						for (j = 0; j < newTSDataLS.length; j++) {
							if (newTSDataLS[j].custname != '@Browser' && newTSDataLS[j].custname != '@Oebs' && newTSDataLS[j].custname != '@Window' && newTSDataLS[j].custname != '@Generic' && newTSDataLS[j].custname != '@Custom') {
								if (newTSDataLS[j].url != "") {
									url = newTSDataLS[j].url;
									break;
								}
							}
						}
					}
				}
			} else {
				sc = Object.keys(keywordArrayList.custom);
				selectedKeywordList = "custom";
			}
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		}
		//ends here
		//Object
		else if (selectedText == "@Object") {
			var sc = Object.keys(keywordArrayList.object);
			selectedKeywordList = "object";
			objName = "@Object";
			url = "";
			var sc;
			var res = '';
			if (appTypeLocal == 'Web') {


				var newTSDataLS = angular.element(document.getElementById('jqGrid')).scope().newTestScriptDataLS;
				if (newTSDataLS) {
					if (newTSDataLS != "undefined") {
						//var testScriptTableData = JSON.parse(newTSDataLS);
						for (j = 0; j < newTSDataLS.length; j++) {
							if (newTSDataLS[j].custname != '@Browser' && newTSDataLS[j].custname != '@Oebs' && newTSDataLS[j].custname != '@Window' && newTSDataLS[j].custname != '@Generic' && newTSDataLS[j].custname != '@Custom') {
								if (newTSDataLS[j].url != "") {
									url = newTSDataLS[j].url;
									break;
								}
							}
						}
					}
				}
			} else {
				sc = Object.keys(keywordArrayList.object);
				selectedKeywordList = "object";
			}
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		}
		//ends here
		else if (selectedText == "WebService List") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListWS);
			selectedKeywordList = "defaultListWS";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "Mainframe List") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListMF);
			selectedKeywordList = "defaultListMF";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "@Email") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.defaultListDP);
			selectedKeywordList = "defaultListDP";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} else if (selectedText == "@Window") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} else if (selectedText == "@Oebs") {
			objName = "";
			url = "";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} else if (selectedText == "@Mobile") {
			objName = " ";
			url = " ";
			if (navigator.appVersion.indexOf("Mac") != -1){
				var sc = Object.keys(keywordArrayList.genericIos);
				selectedKeywordList = "genericIos";
			}
			else{
				var sc = Object.keys(keywordArrayList.generic);
				selectedKeywordList = "generic";
			}
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "@Action") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.action);
			selectedKeywordList = "a";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] +
						'" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' +
						sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'objectName', objName);
			$grid.jqGrid('setCell', rowId, 'url', url);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} else if (selectedText == "@Android_Custom"){
            objName = " ";
            url = " ";
            var sc = Object.keys(keywordArrayList.Android_Custom);
            selectedKeywordList = "Android_Custom";
            var res = '';
            for (var i = 0; i < sc.length; i++) {
                if (selectedKeyword == sc[i]) {
                    res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
                } else
                    res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
            }
            var row = $(e.target).closest('tr.jqgrow');
            var rowId = row.attr('id');
            $("select#" + rowId + "_keywordVal", row[0]).html(res);
            selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
            $grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "@CustomiOS") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.CustomiOS);
			selectedKeywordList = "CustomiOS";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "@MobileiOS") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.genericiOS);
			selectedKeywordList = "genericiOS";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
		} else if (selectedText == "@Sap") {
			objName = " ";
			url = " ";
			var sc = Object.keys(keywordArrayList.generic);
			selectedKeywordList = "generic";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		}
		//Adding @Excel to the objectName dropdown
		else if (selectedText == "@Excel") {
			objName = " ";
			url = " ";
			//new
			var sc = Object.keys(keywordArrayList.excelList);
			selectedKeywordList = "excelList";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', 'Generic');
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		} //Adding @Word to the objectName dropdown
		else if (selectedText == "@Word") {
			objName = " ";
			url = " ";
			//new
			var sc = Object.keys(keywordArrayList.word);
			selectedKeywordList = "word";
			var res = '';
			for (var i = 0; i < sc.length; i++) {
				if (selectedKeyword == sc[i]) {
					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
				} else
					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
			}
			var row = $(e.target).closest('tr.jqgrow');
			var rowId = row.attr('id');
			$("select#" + rowId + "_keywordVal", row[0]).html(res);
			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
			$grid.jqGrid('setCell', rowId, 'appType', 'Generic');
			$grid.jqGrid('setCell', rowId, 'cord', cord);
		}
		// else if (selectedText.startsWith("@PDF")) {
		// 	var scrappedDataCustnames = [];
		// 	selectedText = replaceHtmlEntites(selectedText.trim());
		// 	for (var i = 0; i < scrappedData.length; i++) {
		// 		var ob = scrappedData[i];
		// 		var custname1;
		// 		var custval = ob.custname;
		// 		custname1 = $('<input>').html(custval).text().trim();
		// 		scrappedDataCustnames.push(custval);
		// 		if ((custname1.replace(/\s/g, ' ') == (selectedText.replace('/\s/g', ' ')).replace('\n', ' '))) {
		// 			var isIos = scrappedData[i].text;
		// 			if(isIos == 'ios')
		// 			{
		// 				objName = ob.xpath;
		// 			}
		// 			else{
		// 				objName = ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ');
		// 			}
		// 			url = ob.url;
		// 			var obType = ob.tag;
		// 			var listType = ob.canselectmultiple;
		// 			if (ob.cord) {
		// 				selectedKeywordList = 'iris';
		// 				cord = ob.cord;
		// 				obType = "iris";
		// 				url = "";
		// 			}
		// 			//new
		// 			var sc = Object.keys(keywordArrayList.pdfList);
		// 			selectedKeywordList = "pdfList";
		// 			var res = '';
		// 			for (var i = 0; i < sc.length; i++) {
		// 				if (selectedKeyword == sc[i]) {
		// 					res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
		// 				} else
		// 					res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
		// 			}
		// 			var row = $(e.target).closest('tr.jqgrow');
		// 			var rowId = row.attr('id');
		// 			$("select#" + rowId + "_keywordVal", row[0]).html(res);
		// 			selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
		// 			$grid.jqGrid('setCell', rowId, 'appType', 'pdf');
		// 			$grid.jqGrid('setCell', rowId, 'cord', cord);
		// 			$grid.jqGrid('setCell', rowId, 'objectName', objName);
		// 			break;
		// 		}
		// 	}
			
		// }
		else {
			var scrappedDataCustnames = [];
			selectedText = replaceHtmlEntites(selectedText.trim());
			for (var i = 0; i < scrappedData.length; i++) {
				debugger;
				console.log(scrappedData[i])
				var ob = scrappedData[i];
				var custname1;
				var custval = $.trim(ob.custname);
				custname1 = $('<input>').html(custval).text().trim();
				scrappedDataCustnames.push(custval);
				console.log('scrappedDataCustnames', scrappedDataCustnames);
				if ((custname1.replace(/\s/g, ' ') == (selectedText.replace('/\s/g', ' ')).replace('\n', ' '))) {
					var isIos = scrappedData[i].text;
					if(isIos == 'ios')
					{
						objName = ob.xpath;
					}
					else{
						objName = ob.xpath.replace(/\r?\n|\r/g, " ").replace(/\s+/g, ' ');
					}
					url = ob.url;
					var obType = ob.tag;
					var listType = ob.canselectmultiple;
					if (ob.cord) {
						selectedKeywordList = 'iris';
						cord = ob.cord;
						obType = "iris";
						url = "";
					}

					//changes from wasim
					if (obType != 'a' && obType != 'select' && obType != 'radiobutton' && obType != 'checkbox' && obType != 'input' && obType != 'list' &&
						obType != 'tablecell' && obType != 'table' && obType != 'img' && obType != 'button' && obType != 'iris' && (appTypeLocal == 'Web' || appTypeLocal == 'MobileWeb') && !ob.tag.startsWith('@PDF')) {
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						var res = '';
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					} else if (ob.tag.startsWith("@PDF")) {
						//new
						var sc = Object.keys(keywordArrayList.pdfList);
						selectedKeywordList = "pdfList";
						var res = '';
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'appType', 'pdf');
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						break;
					} else if (obType == 'elementWS') {
						var sc = Object.keys(keywordArrayList.elementWS);
						selectedKeywordList = "elementWS";
						var res = '';
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					} else if (appTypeLocal == 'Desktop' && (obType == 'button' || obType == 'input' || obType == 'select' || obType == 'list_item' || obType == 'hyperlink' || obType == 'lbl' || obType == 'treeview' || obType == 'TreeView' || obType == 'tree' ||
						obType == 'list' || obType == 'edit' || obType == null || obType == 'checkbox' || obType == 'radiobutton' || obType == 'tab' || obType == 'datepicker' || obType == 'table' || obType != undefined)) {
						var res = '';
						var sc;
						var listType = ob.canselectmultiple;
						if (obType == 'button') {
							sc = Object.keys(keywordArrayList.button);
							selectedKeywordList = "button";
						} else if (obType == 'input' || obType == 'edit') {
							sc = Object.keys(keywordArrayList.text);
							selectedKeywordList = "text";
						} else if (obType == 'select') {
							sc = Object.keys(keywordArrayList.select);
							selectedKeywordList = "select";
						} else if (obType == 'list_item') {
							sc = Object.keys(keywordArrayList.list);
							selectedKeywordList = "list";
						} else if (obType == 'tab') {
							sc = Object.keys(keywordArrayList.tab);
							selectedKeywordList = "tab";
						} else if (obType == 'datepicker') {
							sc = Object.keys(keywordArrayList.datepicker);
							selectedKeywordList = "datepicker";
						} else if (obType == 'list_item' || obType == 'list') {
							if (listType == 'true') {
								sc = Object.keys(keywordArrayList.list);
								selectedKeywordList = "list";
							} else {
								sc = Object.keys(keywordArrayList.select);
								selectedKeywordList = "select";
							}
						} else if (obType == 'checkbox') {
							sc = Object.keys(keywordArrayList.checkbox);
							selectedKeywordList = "checkbox";
						} else if (obType == 'radiobutton') {
							sc = Object.keys(keywordArrayList.radiobutton);
							selectedKeywordList = "radiobutton";
						} else if (obType == 'hyperlink' || obType == 'lbl') {
							sc = Object.keys(keywordArrayList.link);
							selectedKeywordList = "link";
						} else if (obType == 'treeview' || obType == 'TreeView' || obType == 'tree') {
							sc = Object.keys(keywordArrayList.tree);
							selectedKeywordList = "tree";
						} else if (obType == 'iris') {
							sc = Object.keys(keywordArrayList.iris);
							selectedKeywordList = "iris";
						} else if (obType == 'table') {
							sc = Object.keys(keywordArrayList.table);
							selectedKeywordList = "table";
						} else {
							sc = Object.keys(keywordArrayList.element);
							selectedKeywordList = "element";
						}
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					} else if (appTypeLocal == 'Desktop' && (!(obType == 'push_button' || obType == 'text' || obType == 'combo_box' || obType == 'list_item' || obType == 'hyperlink' || obType == 'lbl' || obType == 'treeview' || obType == 'TreeView' || obType == 'tree' ||
						obType == 'list' || obType == 'edit' || obType == null || obType == 'Static' || obType == 'check_box' || obType == 'radio_button' || obType == 'tab' || obType == 'datepicker' || obType == 'table'))) {
						var res = '';
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					}
					//adding for SAP
					else if (appTypeLocal == 'SAP' && (obType == 'GuiTextField' || obType == 'GuiTitlebar' || obType == 'GuiButton' || obType == 'GuiUserArea' || obType == 'GuiRadioButton' ||
						obType == 'GuiLabel' || obType == 'GuiBox' || obType == 'GuiSimpleContainer' || obType == 'GuiPasswordField' || obType == 'GuiComboBox' || obType == 'GuiCheckBox' ||
						obType == 'GuiStatusbar' || obType == 'GuiStatusPane' || obType == 'text' || obType == 'combo_box' || obType == 'list_item' || obType == 'GuiCTextField' ||
						obType == 'hyperlink' || obType == 'lbl' || obType == 'list' || obType == 'edit' || obType == null || obType == 'check_box' || obType == 'GuiTableControl' ||
						obType == 'radio_button' || obType == 'button' || obType == 'checkbox' || obType == 'radiobutton' || obType == 'table' || obType == 'a' || obType == 'input' || obType == 'GuiScrollContainer' || obType == 'GuiTab' || obType == 'scroll' || obType != undefined)) {
						var res = '';
						var sc;
						var listType = '';
						if (obType == 'push_button' || obType == 'GuiButton' || obType == 'button') {
							sc = Object.keys(keywordArrayList.button);
							selectedKeywordList = "button";
						} else if (obType == 'GuiTextField' || obType == 'GuiCTextField' || obType == 'text' || obType == 'input') {
							sc = Object.keys(keywordArrayList.text);
							selectedKeywordList = "text";
						} else if (obType == 'GuiLabel' || obType == 'lbl') {
							sc = Object.keys(keywordArrayList.element);
							selectedKeywordList = "element";
						} else if (obType == 'GuiPasswordField') {
							sc = Object.keys(keywordArrayList.text);
							selectedKeywordList = "text";
						} else if (obType == 'GuiTab') {
							sc = Object.keys(keywordArrayList.tabs);
							selectedKeywordList = "tabs";
						} else if (obType == 'GuiScrollContainer' || obType == 'scroll') {
							sc = Object.keys(keywordArrayList.scroll);
							selectedKeywordList = "scroll";
						} else if (obType == 'combo_box' || obType == 'GuiBox' || obType == 'GuiComboBox' || obType == 'select') {
							sc = Object.keys(keywordArrayList.select);
							selectedKeywordList = "select";
						} else if (obType == 'list_item') {
							sc = Object.keys(keywordArrayList.list);
							selectedKeywordList = "list";
						} else if (obType == 'GuiTableControl' || obType == 'table') {
							sc = Object.keys(keywordArrayList.table);
							selectedKeywordList = "table";
						} else if (obType == 'GuiShell' || obType == 'shell') {
							sc = Object.keys(keywordArrayList.shell);
							selectedKeywordList = "shell";
						} else if (obType == 'list_item' || obType == 'list') {
							if (listType == 'true') {
								sc = Object.keys(keywordArrayList.list);
								selectedKeywordList = "list";
							} else {
								sc = Object.keys(keywordArrayList.select);
								selectedKeywordList = "select";
							}
						} else if (obType == 'check_box' || obType == 'GuiCheckBox' || obType == 'checkbox') {
							sc = Object.keys(keywordArrayList.checkbox);
							selectedKeywordList = "checkbox";
						} else if (obType == 'radio_button ' || obType == 'GuiRadioButton' || obType == 'radiobutton') {
							sc = Object.keys(keywordArrayList.radiobutton);
							selectedKeywordList = "radiobutton";
						} else if (obType == 'hyperlink' || obType == 'a') {
							sc = Object.keys(keywordArrayList.link);
							selectedKeywordList = "link";
						} else if (obType == 'iris') {
							sc = Object.keys(keywordArrayList.iris);
							selectedKeywordList = "iris";
						} else {
							sc = Object.keys(keywordArrayList.element);
							selectedKeywordList = "element";
						}
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					} else if (appTypeLocal == 'MobileApp' &&
						(obType.indexOf("RadioButton") >= 0 || obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0 || obType.indexOf("EditText") >= 0 ||
							obType.indexOf("Switch") >= 0 || obType.indexOf("CheckBox") >= 0 || obType.indexOf("Spinner") >= 0 || obType.indexOf("TimePicker") >= 0 || obType.indexOf("DatePicker") >= 0 ||
							obType.indexOf("NumberPicker") >= 0 || obType.indexOf("RangeSeekBar") >= 0 || obType.indexOf("SeekBar") >= 0 || obType.indexOf("ListView") >= 0 || obType.indexOf("iOSEditText") >= 0 ||
							obType.indexOf("PickerWheel") >= 0 || obType.indexOf("Slider") >= 0 || obType.indexOf("SearchField") >= 0 || obType.indexOf("XCUIElementTypeTable") >= 0 || obType.indexOf("SecureTextField") >= 0)) {
						var res = '';
						var sc;
						if (obType.indexOf("RadioButton") >= 0) {
							sc = Object.keys(keywordArrayList.radiobutton);
							selectedKeywordList = "radiobutton";
						} else if (obType.indexOf("iOSEditText") >= 0 || obType.indexOf("SearchField") >= 0 || obType.indexOf("SecureTextField") >= 0){
							sc = Object.keys(keywordArrayList.inputIos);
							selectedKeywordList = "inputIos";
						} else if (obType.indexOf("EditText") >= 0) {
							sc = Object.keys(keywordArrayList.input);
							selectedKeywordList = "input";
						} else if (obType.indexOf("PickerWheel") >= 0) {
							sc = Object.keys(keywordArrayList.pickerwheel);
							selectedKeywordList = "pickerwheel";
						} else if (obType.indexOf("Slider") >= 0) {
							sc = Object.keys(keywordArrayList.slider);
							selectedKeywordList = "slider";
						} else if (obType.indexOf("Switch") >= 0) {
							sc = Object.keys(keywordArrayList.togglebutton);
							selectedKeywordList = "togglebutton";
						} else if (obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0) {
							sc = Object.keys(keywordArrayList.button);
							selectedKeywordList = "button";
						} else if (obType.indexOf("Spinner") >= 0) {
							sc = Object.keys(keywordArrayList.spinners);
							selectedKeywordList = "spinners";
						} else if (obType.indexOf("CheckBox") >= 0) {
							sc = Object.keys(keywordArrayList.checkbox);
							selectedKeywordList = "checkbox";
						} else if (obType.indexOf("TimePicker") >= 0) {
							sc = Object.keys(keywordArrayList.timepicker);
							selectedKeywordList = "timepicker";
						} else if (obType.indexOf("DatePicker") >= 0) {
							sc = Object.keys(keywordArrayList.datepicker);
							selectedKeywordList = "datepicker";
						} else if (obType.indexOf("Time") >= 0) {
							sc = Object.keys(keywordArrayList.time);
							selectedKeywordList = "time";
						} else if (obType.indexOf("Date") >= 0) {
							sc = Object.keys(keywordArrayList.date);
							selectedKeywordList = "date";
						} else if (obType.indexOf("NumberPicker") >= 0) {
							sc = Object.keys(keywordArrayList.numberpicker);
							selectedKeywordList = "numberpicker";
						} else if (obType.indexOf("RangeSeekBar") >= 0) {
							sc = Object.keys(keywordArrayList.rangeseekbar);
							selectedKeywordList = "rangeseekbar";
						} else if (obType.indexOf("SeekBar") >= 0) {
							sc = Object.keys(keywordArrayList.seekbar);
							selectedKeywordList = "seekbar";
						} else if (obType.indexOf("ListView") >= 0) {
							sc = Object.keys(keywordArrayList.listview);
							selectedKeywordList = "listview";
						} else if (obType.indexOf("XCUIElementTypeTable") >= 0) {
							sc = Object.keys(keywordArrayList.table);
							selectedKeywordList = "table";
						}
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] +
									'" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] +
									'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					} else if (appTypeLocal == 'MobileApp' && (!(obType.indexOf("RadioButton") >= 0 || obType.indexOf("ImageButton") >= 0 || obType.indexOf("Button") >= 0 || obType.indexOf("EditText") >= 0 ||
						obType.indexOf("Switch") >= 0 || obType.indexOf("CheckBox") >= 0 || obType.indexOf("Spinner") >= 0 || obType.indexOf("TimePicker") >= 0 || obType.indexOf("DatePicker") >= 0 ||
						obType.indexOf("android.widget.NumberPicker") >= 0 || obType.indexOf("RangeSeekBar") >= 0 || obType.indexOf("android.widget.SeekBar") >= 0 || obType.indexOf("ListView") >= 0 || obType.indexOf("XCUIElementTypeTextField") >= 0 ||
						obType.indexOf("XCUIElementTypePickerWheel") >= 0 || obType.indexOf("XCUIElementTypeSlider") >= 0 || obType.indexOf("XCUIElementTypeSearchField") >= 0 || obType.indexOf("XCUIElementTypeTable") >= 0 || obType.indexOf("android.widget.TimePicker") >= 0 || obType.indexOf("android.widget.DatePicker") >= 0))) {
						var res = '';
						var sc = Object.keys(keywordArrayList.element);
						selectedKeywordList = "element";
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] +
									'" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] +
									'">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						break;
					} else if (appTypeLocal == 'DesktopJava' && (obType == 'push button' || obType == 'text' || obType == 'combo box' || obType == 'list item' || obType == 'hyperlink' || obType == 'label' || obType == 'scroll bar' || obType == 'toggle button' || obType == 'menu' ||
						obType == 'list' || obType == 'edit' || obType == 'Edit Box' || obType == null || obType == 'Static' || obType == 'check box' || obType == 'radio button' || obType == 'panel' || obType != undefined || obType == 'table') || obType == 'password text') {
						var sc;
						if (obType == 'push button' || obType == 'toggle button') {
							sc = Object.keys(keywordArrayList.button);
							selectedKeywordList = "button";
						} else if (obType == 'edit' || obType == 'Edit Box' || obType == 'text' || obType == 'password text') {
							sc = Object.keys(keywordArrayList.text);
							selectedKeywordList = "text";
						} else if (obType == 'combo box') {
							sc = Object.keys(keywordArrayList.select);
							selectedKeywordList = "select";
						} else if (obType == 'list item' || obType == 'list') {
							sc = Object.keys(keywordArrayList.list);
							selectedKeywordList = "list";
						} else if (obType == 'hyperlink' || obType == 'Static') {
							sc = Object.keys(keywordArrayList.link);
							selectedKeywordList = "link";
						} else if (obType == 'check box') {
							sc = Object.keys(keywordArrayList.checkbox);
							selectedKeywordList = "checkbox";
						} else if (obType == 'radio button') {
							sc = Object.keys(keywordArrayList.radiobutton);
							selectedKeywordList = "radiobutton";
						} else if (obType == 'table') {
							sc = Object.keys(keywordArrayList.table);
							selectedKeywordList = "table";
						} else if (obType == 'scroll bar') {
							sc = Object.keys(keywordArrayList.scrollbar);
							selectedKeywordList = "scrollbar";
						} else if (obType == 'internal frame') {
							sc = Object.keys(keywordArrayList.internalframe);
							selectedKeywordList = "internalframe";
						} else if (obType == 'iris') {
							sc = Object.keys(keywordArrayList.iris);
							selectedKeywordList = "iris";
						} else {
							sc = Object.keys(keywordArrayList.element);
							selectedKeywordList = "element";
						}
						var res = '';
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					} else {
						var sc = Object.keys(keywordArrayList[obType]);
						selectedKeywordList = obType;
						var res = '';
						for (var i = 0; i < sc.length; i++) {
							if (selectedKeyword == sc[i]) {
								res += '<option role="option" value="' + sc[i] + '" selected>' + sc[i] + '</option>';
							} else
								res += '<option role="option" value="' + sc[i] + '">' + sc[i] + '</option>';
						}
						var row = $(e.target).closest('tr.jqgrow');
						var rowId = row.attr('id');
						$("select#" + rowId + "_keywordVal", row[0]).html(res);
						selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
						$grid.jqGrid('setCell', rowId, 'url', url);
						$grid.jqGrid('setCell', rowId, 'objectName', objName);
						$grid.jqGrid('setCell', rowId, 'appType', appTypeLocal);
						$grid.jqGrid('setCell', rowId, 'cord', cord);
						break;
					}
				}
			}
			if ($.inArray(selectedText, scrappedDataCustnames) == '-1' && ($(e.target).parents('tr').children('td').find('.editable').length > 0 || $(e.target).children('td').find('select.editable').length > 0)) {
				console.log(scrappedData);
				var mydata = $grid.jqGrid('getRowData');
				dataObject = "";
				console.log('mydata', mydata);
				var row = $(e.target).closest('tr.jqgrow');
				var rowId = row.attr('id');
				$("select#" + rowId + "_keywordVal", row[0]).html(res);
				selectedKey = $grid.find("tr.jqgrow:visible").find("td[aria-describedby^=jqGrid_keywordVal]:visible").children('select').find('option:selected').text();
				$grid.jqGrid('setCell', rowId, 'objectName', ' ');
				$grid.jqGrid('setCell', rowId, 'url', ' ');
				$grid.jqGrid('setCell', rowId, 'appType', 'Generic');
			}
		}
	}

	function setKeyword1(e, selectedText, $grid, selectedKeyword) {
		var keywordArrayList1 = keywordListData;
		var keywordArrayList = JSON.parse(keywordArrayList1);
		var taskInfo = JSON.parse(window.localStorage['_CT']);
		var appTypeLocal = taskInfo.appType; //window.localStorage['appTypeScreen'];
		if (selectedText == "getBody") {
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		} else if (selectedText == "setHeader") {
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		} else if (selectedText == "setWholeBody") {
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'></textarea>");
		} else if (selectedText == "setHeaderTemplate") {
			var header;
			if (dataFormat12.length == 1) header = dataFormat12.val();
			else if (dataFormat12.length > 1) header = dataFormat12.replace(/##/g, '\n');
			$(e.target).parent().next().html("<textarea class='editable form-control' rows='1' style='width: 98%;resize:none;min-height:25px;'>" + header + "</textarea>");
		} else {
			$(e.target).parent().next().html("<input type='text' class='editable form-control' style='width: 100%;'/>");
		}
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editkeyWord(e) {
		var keywordArrayList = keywordListData;
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'keywordVal';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam', 'selrow');
		var selId = '#' + currRowId + '_' + selName;
		var selectedText = $(selId + ' option:selected').val();
		var url = " ";
		var objName = " ";
		setKeyword1(e, selectedText, $grid, "empty");
		$(selId).parent().next().find('input').val('');
		$(selId).parent().next().next().find('input').val('');
		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList, function (index, value) {
			keywordArrayKey = index;
			keywordArrayValue = value; //JSON.parse(value);
			if (selectedKeywordList == keywordArrayKey) {
				$.each(keywordArrayValue, function (k, v) {
					if (selectedText == k) {
						inputSyntax = v.inputval;//JSON.parse(v).inputVal;
						outputSyntax = v.outputval;//JSON.parse(v).outputVal;
						$grid.find("td[aria-describedby = jqGrid_inputVal]:visible").find('input').attr("placeholder", inputSyntax).attr("title", inputSyntax);
						$grid.find("td[aria-describedby = jqGrid_outputVal]:visible").find('input').attr("placeholder", outputSyntax).attr("title", outputSyntax);
					}
				});
			}
		});
	}

	//function editCell(rowid, iCol, cellcontent, e){
	function editCell(e) {
		var keywordArrayList = keywordListData;
		keywordArrayList = jQuery.parseJSON(keywordArrayList);
		var selName = 'custname';
		var $grid = $('#jqGrid');
		//get current selected row
		var currRowId = $grid.jqGrid('getGridParam', 'selrow');
		var selId = '#' + currRowId + '_' + selName;
		var selectedText = $(selId + ' option:selected').val();
		var url = " ";
		var objName = " ";
		setKeyword(e, selectedText, $grid, "empty");
		//uncomment below two sections to verify change in URL
		//set the URL to the cell 'url'
		if (selectedText == "@Generic" || selectedText == undefined || selectedText == "@Browser" || selectedText == "@Excel" || selectedText == "@BrowserPopUp") {
			$grid.jqGrid('setCell', currRowId, 'objectName', objName);
			$grid.jqGrid('setCell', currRowId, 'url', url);
		}
		// else{

		//	 $grid.jqGrid('setCell', currRowId, 'objectName', objName);
		//	 $grid.jqGrid('setCell', currRowId, 'url', url);
		// }

		//get Input and Output Syntax for selected Keyword
		$.each(keywordArrayList, function (index, value) {
			keywordArrayKey = index;
			keywordArrayValue = value; //JSON.parse(value);
			if (selectedKeywordList == keywordArrayKey) {
				$.each(keywordArrayValue, function (k, v) {
					if (selectedKey == k) {
						inputSyntax = v.inputval;//JSON.parse(v).inputVal;
						outputSyntax = v.outputval;//JSON.parse(v).outputVal;
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
function deleteTestScriptRow(e) {
	if ($('.ui-state-highlight').find('td:nth-child(2)').find('input').is(":checked") && $('.ui-state-highlight').find('td:nth-child(7)').find('input').length > 0) {

	} else if ($('#jqGrid tbody tr.ui-widget-content').length <= 0) {
		openDialog("Delete Testcase step", "No steps to Delete")
	} else {
		if ($(document).find("#cb_jqGrid:checked").length > 0 || $("#jqGrid").find(".cbox:checked").length > 0) {
			$("#globalModalYesNo").find('.modal-title').text("Delete Test Step");
			var task = JSON.parse(window.localStorage['_CT'])
			if (task.reuse == 'True') {
				$("#globalModalYesNo").find('.modal-body p').text("Testcase is been reused. Are you sure, you want to delete?").css('color', 'black');
			} else {
				$("#globalModalYesNo").find('.modal-body p').text("Are you sure, you want to delete?").css('color', 'black');
			}
			$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id", "btnDeleteStepYes")
			$("#globalModalYesNo").modal("show");
			/*angular.element(document.getElementById("tableActionButtons")).scope().updateTestCase_ICE();*/
		} else {
			openDialog("Delete Test step", "Select steps to delete")
		}
	}
}

$(document).on('click', '#btnDeleteStepYes', function (e) {
	var selectedRowIds = []; //$("#jqGrid").jqGrid('getGridParam','selarrrow').map(Number);
	$.each($(".ui-state-highlight"), function () {
		selectedRowIds.push($(this).attr("id"));
	})
	var gridArrayData = $("#jqGrid").jqGrid('getRowData');
	// console.log("array data test ***** " + JSON.stringify(gridArrayData));
	for (var i = 0; i < selectedRowIds.length; i++) {
		$("#jqGrid").delRowData(selectedRowIds[i]);
	}
	var gridData = $("#jqGrid").jqGrid('getRowData');
	for (var i = 0; i < gridData.length; i++) {
		//new to parse str to int (step No)
		gridData[i].stepNo = i + 1;
	}
	$("#jqGrid").jqGrid('clearGridData');
	$("#jqGrid").jqGrid('setGridParam', {
		data: gridData
	});
	$("#jqGrid").trigger("reloadGrid");
	$('.modal-header:visible').find('.close').trigger('click')
	//deleteStep = true;
	//Transaction Activity for DeleteTestScriptRow Button Action
	// var labelArr = [];
	// var infoArr = [];
	// labelArr.push(txnHistory.codesDict['DeleteTestScriptRow']);
	// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);						   
})

function addTestScriptRow(e) {
	if ($('.ui-state-highlight').find('td:nth-child(2)').find('input').is(":checked") && $('.ui-state-highlight').find('td:nth-child(7)').find('input').length > 0) {

	} else {
		var flagClass;
		if ($("#jqGrid tr").hasClass("ui-state-highlight") == true) {
			flagClass = "true";
			window.localStorage['selectedRowStepNo'] = $("#jqGrid tr.ui-state-highlight td:nth-child(1)").text();
			if ($("#jqGrid tr.ui-state-highlight").length > 1) flagClass = "false";
		} else flagClass = "false";
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
			"remarks": "",
			"_id_": "",
			"addTestCaseDetails": "",
			"addTestCaseDetailsInfo": ""
		};

		$("#jqGrid tr").each(function () {
			if ($(this).find("td:nth-child(9)").find(".remarksIcon").length > 0) {
				$(this).find("td:nth-child(9)").find(".remarksIcon").remove();
			}
		})

		var gridArrayData = $("#jqGrid").jqGrid('getRowData');
		var arrayLength = gridArrayData.length;
		if (arrayLength <= 0) {
			gridArrayData.splice(arrayLength, 0, emptyRowData);
			gridArrayData[0].stepNo = parseInt("1");
			window.localStorage['emptyTable'] = true;
		} else {
			window.localStorage['emptyTable'] = false;
			if (flagClass == "true") {
				gridArrayData.splice(parseInt(selectedStepNo), 0, emptyRowData);
				if (gridArrayData[parseInt(selectedStepNo) + 1] == undefined) {
					gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength - 1].stepNo) + 1;
				} else {
					gridArrayData[parseInt(selectedStepNo)].stepNo = parseInt(gridArrayData[parseInt(selectedStepNo) + 1].stepNo)
					//i=gridArrayData[parseInt(selectedStepNo)].stepNo
					for (i = 0; i < gridArrayData.length; i++) {
						gridArrayData[i].stepNo = i + 1;
					}
				}
				var allRowsInGrid = $('#jqGrid').jqGrid('getGridParam', 'data');
			} else {
				gridArrayData.splice(arrayLength, 0, emptyRowData);
				gridArrayData[arrayLength].stepNo = parseInt(gridArrayData[arrayLength - 1].stepNo) + 1;
			}
		}
		for (var i = 0; i < gridArrayData.length; i++) {
			if (!gridArrayData[i].hasOwnProperty("_id_")) {
				gridArrayData[i]._id_ = "";
			}
		}
		$("#jqGrid").jqGrid('clearGridData');
		$("#jqGrid").jqGrid('setGridParam', {
			data: gridArrayData
		});
		$("#jqGrid").trigger("reloadGrid");

		$("#jqGrid tr:last").focus();
		if (flagClass == "true") {
			$("#jqGrid tr").each(function () {
				if ($(this).children("td:nth-child(1)").text() == window.localStorage['selectedRowStepNo']) {
					$(this).siblings().removeClass("ui-state-highlight")
					$(this).next().addClass("ui-state-highlight").focus();
				}
			})
			flagClass == "false"
		}
	}

	//Transaction Activity for AddTestScriptRow Button Action
	// var labelArr = [];
	// var infoArr = [];
	// labelArr.push(txnHistory.codesDict['AddTestScriptRow']);
	// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);
}

function rearrangeTestScriptRow(e) {
	$("#jqGrid").trigger("reloadGrid");
	$("#jqGrid").jqGrid("setColProp", "stepNo", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "objectName", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "custname", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "keywordVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "inputVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "outputVal", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "url", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "appType", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "remarks", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "remarksIcon", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "addTestCaseDetails", {
		editable: false
	});
	$("#jqGrid").jqGrid("setColProp", "addTestCaseDetailsInfo", {
		editable: false
	});
	$("#jqGrid").resetSelection();
	$("#jqGrid").find(">tbody").sortable("enable");
	enabledEdit = "false";

	//Transaction Activity for RearrangeTestScriptRow Button Action
	// var labelArr = [];
	// var infoArr = [];
	// labelArr.push(txnHistory.codesDict['RearrangeTestScriptRow']);
	// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);
}

var selectedRow;
var rowSelect;
var selectedRowIds;
var lastSelectedRowId

//Edit Testscript Row
function editTestCaseRow(e) {
	var rowSelect = $(document).find(".ui-state-highlight").children("td:nth-child(1)").text();
	if ($('#jqGrid tbody tr.ui-widget-content').length <= 0) {
		openDialog("Edit step", "No steps to edit")
	} else if (rowSelect == "" || rowSelect == " ") {
		openDialog("Edit step", "Select step to edit")
	} else {
		var editSelRow = parseInt(rowSelect) + parseInt(1);
		var rowIsChecked = $(document).find(".ui-state-highlight").find(".cbox").is(":checked");
		var checkedLen = $(".cbox:checked").length;
		$("#jqGrid").jqGrid("setColProp", "stepNo", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "objectName", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "custname", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "url", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "appType", {
			editable: true
		});
		$("#jqGrid").jqGrid("setColProp", "addTestCaseDetails", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "addTestCaseDetailsInfo", {
			editable: false
		});
		$("#jqGrid").resetSelection();
		$("#jqGrid").trigger("reloadGrid");
		$("#jqGrid tr").each(function () {
			$(this).attr("id", $(this).index());
			$(this).children("td[aria-describedby='jqGrid_stepNo']").attr("title", $(this).index()).text($(this).index());
			$(this).children("td[aria-describedby='jqGrid_cb']").children("input").attr("id", "jqg_jqGrid_" + $(this).index()).attr("name", "jqg_jqGrid_" + $(this).index());
		})
		$("#jqGrid").find(">tbody").sortable("disable");
		$(this).focus();
		$("#jqGrid tr").each(function () {
			if (rowSelect == $(this).children("td:nth-child(1)").text() && rowIsChecked == true) {
				$(this).focus().addClass("rowHighlight");
				$("tr.rowHighlight").trigger('click');
			} else {
				$("tr.rowHighlight").removeClass("rowHighlight");
			}
		});
		enabledEdit = "true";
		$("#errorMsg").text('');
		if (rowSelect != "") {
			$("tr:nth-child(" + editSelRow + ")").focus().trigger('click'); //Focus row on checkbox selection
		}
		//Trigger Focus on selected row when multiple rows are checked and unchecked and is not editable
		$("tr.ui-state-highlight").each(function () {
			var checkedLen = $(".cbox:checked").length;
			var editableLen = $(".editable").length;
			if (checkedLen == 1 && editableLen == 0) {
				$(this).focus().trigger('click');
			}
		});

		//Transaction Activity for EditTestCaseRow Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['EditTestCaseRow']);
		// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);					 
	}
}

//Copy-Paste TestStep Functionality
function copyTestStep(e) {
	window.localStorage['emptyTestStep'] = "false";
	var taskInfo = JSON.parse(window.localStorage['_CT']);
	if (($(document).find(".ui-state-highlight").length <= 0 && $('#jqGrid tbody tr.ui-widget-content').children('td:nth-child(5)').text().trim() == "") || ($(document).find(".ui-state-highlight").length == 1 && $(document).find(".ui-state-highlight").children('td:nth-child(5)').text().trim() == "")) {
		openDialog("Copy step", "Empty step can not be copied.")
	} else if (!$(document).find(".cbox:checked").parent().parent("tr").hasClass("ui-state-highlight")) {
		openDialog("Copy step", "Select step to copy")
	} else {
		getSelectedRowData = [];
		getRowJsonCopy = [];
		getSelectedRowData = $(document).find(".cbox:checked").parent().parent("tr.ui-state-highlight")
		$.each(getSelectedRowData, function () {
			if ($(this).children(":nth-child(5)").html() == "&nbsp;") {
				window.localStorage['emptyTestStep'] = "true";
				openDialog("Copy Test Step", "The operation cannot be performed as the steps contains invalid/blank object references")
				getSelectedRowData = [];
				getRowJsonCopy = [];
				return false
			} else {
				var rowId = parseInt($(this).children("td:nth-child(1)").text());
				var getRowData = $('#jqGrid').jqGrid('getRowData', rowId);
				getRowJsonCopy.push({
					"objectName": $(this).children("td:nth-child(4)").text().trim(),
					"custname": $(this).children("td:nth-child(5)").text(),
					"keywordVal": $(this).children("td:nth-child(6)").text(),
					"inputVal": $(this).children("td:nth-child(7)").text(),
					"outputVal": $(this).children("td:nth-child(8)").text().trim(),
					"stepNo": parseInt($(this).children("td:nth-child(1)").text()),
					"remarksIcon": $(this).children("td:nth-child(9)").text(),
					"remarks": $(this).children("td:nth-child(10)").text(),
					"url": $(this).children("td:nth-child(11)").text().trim(),
					"appType": $(this).children("td:nth-child(12)").text(),
					"addTestCaseDetails": getRowData.addTestCaseDetails,
					"addTestCaseDetailsInfo": getRowData.addTestCaseDetailsInfo,
					"cord": getRowData.cord
				});
			}
		});
		window.localStorage['getRowJsonCopy'] = angular.toJson(getRowJsonCopy);
		//Reloading Row
		$("#jqGrid").trigger("reloadGrid");
		$("#jqGrid").jqGrid("setColProp", "stepNo", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "objectName", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "custname", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "keywordVal", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "inputVal", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "outputVal", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "url", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "appType", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "remarks", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "remarksIcon", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "addTestCaseDetails", {
			editable: false
		});
		$("#jqGrid").jqGrid("setColProp", "addTestCaseDetailsInfo", {
			editable: false
		});
		$("#jqGrid").resetSelection();
		$("#jqGrid").find(">tbody").sortable("enable");
		window.localStorage['anotherScriptId'] = JSON.parse(window.localStorage['_CT']).testCaseId; //window.localStorage['testScriptIdVal'];
		window.localStorage['getAppTypeForPaste'] = taskInfo.appType; //window.localStorage['appTypeScreen']
		//Transaction Activity for CopyTestStep Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['CopyTestStep']);
		// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);						 
	}
}
//Need to work
function pasteTestStep(e) {
	var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
	if (getRowJsonToPaste == [] || getRowJsonToPaste == undefined || getRowJsonToPaste.length <= 0) {
		openDialog("Paste Testcase step", "Copy steps to paste")
	} else {
		if ($("#jqGrid tr.ui-state-highlight td:nth-child(5)").find("select").length > 0) {
			var esc = $.Event("keydown", {
				keyCode: 27
			});
			$("#jqGrid tr.ui-state-highlight td:nth-child(7)").find("input").trigger(esc);
		}
		if (window.localStorage['anotherScriptId'] != JSON.parse(window.localStorage['_CT']).testCaseId) {
			var flg = true;
			for (var i = 0; i < getRowJsonToPaste.length; i++) {
				if (getRowJsonToPaste[i].appType == "Web" || getRowJsonToPaste[i].appType == "Desktop" || getRowJsonToPaste[i].appType == "Mainframe" || getRowJsonToPaste[i].appType == "DesktopJava" || getRowJsonToPaste[i].appType == "MobileApp" || getRowJsonToPaste[i].appType == "MobileWeb" || getRowJsonToPaste[i].appType == "MobileApp" || getRowJsonToPaste[i].appType == "SAP") {
					flg = false;
					break;
				}
			}
			if (window.localStorage['emptyTestStep'] == "true" || getRowJsonToPaste == undefined) return false
			else if (window.localStorage['getAppTypeForPaste'] != JSON.parse(window.localStorage['_CT']).appType && flg == false) {
				openDialog("Paste Test Step", "Project type is not same");
				return false
			} else {
				$("#globalModalYesNo").find('.modal-title').text("Paste Test Step");
				$("#globalModalYesNo").find('.modal-body p').text("Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?").css('color', 'black');
				$("#globalModalYesNo").find('.modal-footer button:nth-child(1)').attr("id", "btnPasteTestStepYes")
				$("#globalModalYesNo").modal("show");
				//showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			}
		} else {
			if (window.localStorage['emptyTestStep'] == "true" || getRowJsonToPaste == undefined) return false
			else if ($("#jqGrid").jqGrid('getRowData').length == 1 && $("#jqGrid").jqGrid('getRowData')[0].custname == "") showDialogMesgsYesNo("Paste Test Step", "Copied step(s) might contain object reference which will not be supported for other screen. Do you still want to continue ?", "btnPasteTestStepYes", "btnPasteTestStepNo")
			else {
				$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
				$("#modalDialog-inputField").find('#labelContent').html("Paste after step no:").css('color', 'black').append("<br/><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>");
				$("#modalDialog-inputField").find('.modal-footer button').attr("id", "btnPasteTestStep");
				$("#modalDialog-inputField").find('#getInputData').attr("placeholder", "Enter a value");
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
$(document).on('hide.bs.modal', '#modalDialog-inputField', function () {
	$("#getInputData").val('')
});


$(document).on("click", "#btnPasteTestStepYes", function () {
	$("#globalModalYesNo").find('.modal-footer button:nth-child(2)').trigger("click");
	if ($("#jqGrid tr.ui-widget-content td:nth-child(5)").html() == "&nbsp;" && $("#jqGrid tr.ui-widget-content").length == 1) {
		pasteInGrid()
	} else {
		$("#modalDialog-inputField").find('.modal-title').text("Paste Test Step");
		$("#modalDialog-inputField").find('#labelContent').text("Paste after step no:").css('color', 'black').append("</br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>");
		//$("</br><span style='font-size:11px; color: #000;'>For multiple paste. Eg: 5;10;20</span>").insertAfter('#labelContent');
		$("#modalDialog-inputField").find('.modal-footer button').attr("id", "btnPasteTestStep");
		$("#modalDialog-inputField").find('#getInputData').attr("placeholder", "Enter a value");
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

$(document).on("click", "#btnPasteTestStep", function (e) {
	var chkNo;
	var selectedStepNo = [];
	var proceed = true;
	$("#errorMsgs1, #errorMsgs2, #errorMsgs3").hide();
	if (!$("#getInputData").val()) $("#errorMsgs1").show();
	else if (!/^[0-9;]+$/.test($("#getInputData").val())) $("#errorMsgs2").show();
	else {
		var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
		//$(document).find(".dialogContent").append('<img src="imgs/loader1.gif" class="domainLoader" style="bottom: 20px; left: 20px;" />')
		chkNo = $("#getInputData").val().split(";");

		if (chkNo.length > 1) {
			selectedStepNo.push(parseInt(chkNo[0]));
			for (j = 1; j < chkNo.length; j++) {
				selectedStepNo.push(parseInt(chkNo[j]) + (getRowJsonToPaste.length * selectedStepNo.length));
			}
		} else selectedStepNo.push(chkNo[0]);
		for (i = 0; i < chkNo.length; i++) {
			if (isNaN(parseInt(chkNo[i]))) {
				$("#errorMsgs2").show();
				proceed = false;
				break;
			} else if (parseInt(chkNo[i]) >= $("#jqGrid tr").length || parseInt(chkNo[i]) < 0) {
				$("#errorMsgs3").show();
				proceed = false;
				break;
			}
		}
		if (proceed == true) {
			for (i = 0; i < selectedStepNo.length; i++) {
				pasteSelecteStepNo[i] = selectedStepNo[i];
			}
			pasteInGrid(e);
			/*$('.domainLoader').remove();
			$("#dialogOverlay, #dialogContainer").remove();*/
			$("#modalDialog-inputField").find(".close").trigger("click");
		}
	}
})

$(document).on('keypress', '.copyPasteValidation', function (e) {
	if ((e.charCode >= 48 && e.charCode <= 57) || e.charCode == 59) return true;
	else return false;
})
$(document).on('focusout', '.copyPasteValidation', function () {
	var reg = /^[0-9;]+$/;
	if (reg.test($(this).val())) {
		return true;
	} else {
		//$(this).val('');
		//$('#errorMsgs2').show();
		return false;
	}
})
$(document).on('focus', '.copyPasteValidation', function () {
	$('#errorMsgs1, #errorMsgs2, #errorMsgs3').hide();
})

function pasteInGrid(e) {
	var gridData = $("#jqGrid").jqGrid('getRowData');
	var increaseSplice;
	var getRowJsonCopyTemp = [];
	var newVal;
	var getRowJsonToPaste = JSON.parse(window.localStorage['getRowJsonCopy']);
	var highlightPasted = [];
	if (pasteSelecteStepNo.length <= 0) {
		pasteSelecteStepNo.push(0);
	}
	for (a = 0; a < pasteSelecteStepNo.length; a++) {
		newVal = parseInt(pasteSelecteStepNo[a]);
		if (gridData.length == 1 && gridData[0].custname == "") {
			gridData.splice(gridData[0], 1)
			for (k = 0; k < getRowJsonToPaste.length; k++) {
				getRowJsonToPaste[k].stepNo=k+1
				gridData.push(getRowJsonToPaste[k])
			}
		} else {
			if (pasteSelecteStepNo[a] > 0) {
				for (i = 0; i < gridData.length; i++) {
					if (gridData[i].stepNo == pasteSelecteStepNo[a]) {
						for (j = 0; j < getRowJsonToPaste.length; j++) {
							getRowJsonToPaste[j].stepNo = parseInt(gridData[i].stepNo) + 1
							if (increaseSplice == "true") gridData.splice(newVal, 0, getRowJsonToPaste[j]);
							else gridData.splice(pasteSelecteStepNo[a], 0, getRowJsonToPaste[j]);
							//ReArranging Step No
							for (var l = 0; l < gridData.length; l++) gridData[l].stepNo = l + 1;
							//ReArranging Step No
							increaseSplice = "true";
							newVal++
						}
					}
				}
			} else {
				for (i = 0; i < getRowJsonToPaste.length; i++) {
					getRowJsonCopyTemp.push(getRowJsonToPaste[i]);
				}
				for (j = 0; j < gridData.length; j++) {
					getRowJsonCopyTemp.push(gridData[j]);
					for (var l = 0; l < getRowJsonCopyTemp.length; l++) getRowJsonCopyTemp[l].stepNo = l + 1;
				}
				gridData = [];
				for (k = 0; k < getRowJsonCopyTemp.length; k++) {
					gridData.push(getRowJsonCopyTemp[k]);
				}
			}

		}
		$("#jqGrid").jqGrid('clearGridData');
		$("#jqGrid").jqGrid('setGridParam', {
			data: gridData
		});
		$("#jqGrid").trigger("reloadGrid");
		if (pasteSelecteStepNo[a] > 0) {
			for (var i = parseInt(pasteSelecteStepNo[a]) + 1; i <= parseInt(pasteSelecteStepNo[a]) + getRowJsonToPaste.length; i++) {
				highlightPasted.push(i);
				/*$.each($("#jqGrid tr"), function(){
					if(parseInt($(this).children("td:nth-child(1)").text()) == i){
						$(this).find("input.cbox").trigger("click")
						return false;
					}
				})*/
			}
		} else {
			for (var i = parseInt(pasteSelecteStepNo[a]) + 1; i <= getRowJsonToPaste.length; i++) {
				highlightPasted.push(i);
				/*$.each($("#jqGrid tr"), function(){
					if(parseInt($(this).children("td:nth-child(1)").text()) == i){
						$(this).find("input.cbox").trigger("click")
						return false;
					}
				})*/
			}
		}
		$.each($("#jqGrid tr"), function () {
			for (j = 0; j < highlightPasted.length; j++) {
				if (parseInt($(this).children("td:nth-child(1)").text()) == highlightPasted[j]) {
					//$(this).find("input.cbox").prop("checked",true);
					$(this).addClass("row-highlight-background");
					$(this).addClass("ui-state-highlight");
					//$(this).siblings().removeClass("ui-state-highlight");
				}
			}
			$(this).attr("id", $(this).index());
			$(this).children("td[aria-describedby='jqGrid_stepNo']").attr("title", $(this).index()).text($(this).index());
			$(this).children("td[aria-describedby='jqGrid_cb']").children("input").attr("id", "jqg_jqGrid_" + $(this).index()).attr("name", "jqg_jqGrid_" + $(this).index());
		})
	}
	//Transaction Activity for PasteTestStep Button Action
	// var labelArr = [];
	// var infoArr = [];
	// labelArr.push(txnHistory.codesDict['PasteTestStep']);
	// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);							   
}
//Copy-Paste TestStep Functionality

//Commenting TestScript Row
function commentStep(e) {
	if ($('#jqGrid tbody tr.ui-widget-content').length <= 0) {
		openDialog("Comment step", "No steps to comment")
	} else if (($(document).find(".ui-state-highlight").length <= 0 && $('#jqGrid tbody tr.ui-widget-content').children('td:nth-child(5)').text().trim() == "") || ($(document).find(".ui-state-highlight").length == 1 && $(document).find(".ui-state-highlight").children('td:nth-child(5)').text().trim() == "")) {
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
	else if ($(document).find(".ui-state-highlight").length > 0) {
		var myData = $("#jqGrid").jqGrid('getGridParam', 'data')
		$(document).find(".ui-state-highlight").each(function () {
			for (i = 0; i < myData.length; i++) {
				if (myData[i].stepNo == parseInt($(this).attr("id").trim())) {
					//Check whether output coloumn is empty
					if (myData[i].outputVal == "") {
						myData[i].outputVal = "##";
						//$("#jqGrid").trigger("reloadGrid");
					} else {
						//Check whether output coloumn has some value
						if (myData[i].outputVal != "") {
							//If already commented but no additional value
							if (myData[i].outputVal == "##") {
								myData[i].outputVal = "";
								//$("#jqGrid").trigger("reloadGrid");
							}
							//If already commented and contains additional value
							else if (myData[i].outputVal.indexOf(";##") !== -1) {
								var lastTwo = myData[i].outputVal.substr(myData[i].outputVal.length - 3);
								myData[i].outputVal = myData[i].outputVal.replace(lastTwo, "");
								//$("#jqGrid").trigger("reloadGrid");
							}
							//If contains value but not commented
							else {
								myData[i].outputVal = myData[i].outputVal.concat(";##");
								//$("#jqGrid").trigger("reloadGrid");
							}
						}
					}
				}
			}
		});
		$("#jqGrid").trigger("reloadGrid");

		//Transaction Activity for CommentStep Button Action
		// var labelArr = [];
		// var infoArr = [];
		// labelArr.push(txnHistory.codesDict['CommentStep']);
		// txnHistory.log(e.type,labelArr,infoArr,window.location.pathname);					 
	} else {
		openDialog("Skip Testcase step", "Please select step to skip")
	}
}

function shortString() {
	var shorts = document.querySelectorAll('.ellipsisText');
	if (shorts) {
		Array.prototype.forEach.call(shorts, function (ele) {
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
	if (appTypeLocal == "Web") {
		obnames = ["@Generic", "@Excel", "@Custom", "@Browser", "@BrowserPopUp", "@Object", "@Word"];
	} else if (appTypeLocal == "Webservice") {
		obnames = ["@Generic", "@Excel", "WebService List", "@Word"];
	} else if (appTypeLocal == "Mainframe") {
		obnames = ["@Generic", "@Excel", "Mainframe List", "@Word"];
	} else if (appTypeLocal == "Desktop") {
		obnames = ["@Generic", "@Excel", "@Window", "@Custom", "@Email", "@Word"];
	} else if (appTypeLocal == "DesktopJava") {
		obnames = ["@Generic", "@Excel", "@Oebs", "@Custom", "@Word"];
	} else if (appTypeLocal == "MobileApp" && navigator.appVersion.indexOf("Mac") == -1) {
		obnames = ["@Generic", "@Mobile", "@Android_Custom", "@Action"];
	} else if (appTypeLocal == "MobileApp" && navigator.appVersion.indexOf("Mac") != -1) {
		obnames = ["@Generic", "@Mobile", "@CustomiOS"];
	} else if (appTypeLocal == "MobileWeb") {
		obnames = ["@Generic", "@Browser", "@BrowserPopUp", "@Action"];
	} else if (appTypeLocal == "SAP") {
		obnames = ["@Generic", "@Sap", "@Custom", "@Word"]
	} else if (appTypeLocal = "System") {
		obnames = ["@Generic", "@Excel", "@System", "@Word"];
	}
	for (var i = 0; i < data.length; i++) {
		obnames.push(data[i].custname);
	}
	return obnames;
}

function getKeywordList(data) {

	var keywordList = [];
	if ("defaultList" in data) {
		var arr = Object.keys(data.defaultList);
		for (var i = 0; i < arr.length; i++) {
			keywordList.push(arr[i]);

		}
		return keywordList;
	} else return keywordList;
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
	// //Enable-Disable dragged element based on drop event
	// draggedEle.setAttribute("draggable", false)
	// draggedEle.childNodes[1].style.background = "#e0e0e0";
	// draggedEle.childNodes[1].style.cursor = "no-drop"
	// //Enable-Disable dragged element based on drop event
	$(".submitObjectWarning").hide();
	if ($(ev.target).parent().children(".ellipsis").hasClass("fromMergeObj") == true) {
		draggedEle.setAttribute("draggable", true)
		draggedEle.childNodes[1].style.background = "";
		draggedEle.childNodes[1].style.cursor = "pointer";
		$(".objectExistMap").show();
		return false
	} else {
		$(".objectExistMap").hide()
		getDraggedEle = ev.dataTransfer.getData("text/plain").trim()
		getDraggedEle = $(getDraggedEle)[0];
		$(getDraggedEle).addClass("fromMergeObj");
		$(ev.target).parent("li").addClass("valueMerged");
		$(ev.target).parent("li").find(".ellipsis").hide().addClass("toMergeObj");
		$(ev.target).parent("li").find(".showPreviousVal").show()
		$(ev.target).parent("li").append(getDraggedEle);
	}
	ev.preventDefault();
	if ($(ev.target).parent("li").find(".ellipsis").hide().hasClass("toMergeObj") == true) {
		//Enable-Disable dragged element based on drop event
		$('.fromMergeObj[draggable=true]').attr("data-id",draggedEle.childNodes[1].getAttribute("data-id"))
		draggedEle.setAttribute("draggable", false)
		draggedEle.childNodes[1].style.background = "#e0e0e0";
		draggedEle.childNodes[1].style.cursor = "no-drop";
		$(".modal-body:visible").trigger('click');
		//Enable-Disable dragged element based on drop event
	}
}
//Map Object Drag nad Drop Functionality

//XML Beatuifier
function formatXml(xml) {
	var formatted = '';
	var reg = /(>)(<)(\/*)/g;
	xml = xml.replace(reg, '$1\r\n$2$3');
	var pad = 0;
	jQuery.each(xml.split('\r\n'), function (index, node) {
		var indent = 0;
		if (node.match(/.+<\/\w[^>]*>$/)) {
			indent = 0;
		} else if (node.match(/^<\/\w/)) {
			if (pad != 0) {
				pad -= 1;
			}
		} else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
			indent = 1;
		} else {
			indent = 0;
		}
		var padding = '';
		for (var i = 0; i < pad; i++) {
			padding += '  ';
		}
		formatted += padding + node + '\r\n';
		pad += indent;
	});
	return formatted;
}

function openDialog(title, body, submitflag) {
	if (submitflag == undefined) {
		$("#globalModal").find('.modal-title').text(title);
		$("#globalModal").find('.modal-body p').text(body).css('color', 'black');
		$("#globalModal").modal("show");
		setTimeout(function () {
			$("#globalModal").find('.btn-default').focus();
		}, 300);
	} else {
		$("#globalTaskSubmit").find('.modal-title').text(title);
		$("#globalTaskSubmit").find('.modal-body p').text(body);
		$("#globalTaskSubmit").modal("show");
	}

}

function openModalFormDialog(title, body) {
	$("#globalModalForm").find('.modal-title').text(title);
	$("#globalModalForm").next('.modal-sm').removeClass('modal-');
	$("#globalModalForm").find('.modal-body p').text(body).css('color', 'black');
	$("#globalModalForm").modal("show");
	setTimeout(function () {
		$("#globalModalForm").find('.btn-default').focus();
	}, 300);
}