mySPA.controller('pluginController',['$scope', '$rootScope', '$window','$http','$location','$timeout','PluginService', function($scope, $rootScope,$window,$http,$location,$timeout,PluginService) {
	$('.scrollbar-inner').scrollbar();
	window.onbeforeunload = null;
	document.getElementById("currentYear").innerHTML = new Date().getFullYear()
	var userInfo = JSON.parse(window.localStorage['_UI']);
	var availablePlugins = userInfo.pluginsInfo;
	$("#plugin-container").empty().hide();
	$("body").css("background", "#fff");
	if(window.localStorage['navigateScreen'] != "plugin"){
		$rootScope.redirectPage();
		return;
	}

	$rootScope.plugins = [];
	for(i=0; i<availablePlugins.length; i++){
		if(availablePlugins[i].pluginValue != false){
			var pluginName = availablePlugins[i].pluginName;
			var pluginTxt = availablePlugins[i].pluginName.replace(/\s/g,''); 
			var dataName = Encrypt.encode("p_"+pluginTxt);
			$rootScope.plugins.push("p_"+pluginName);
			$("#plugin-container").append('<div class="col-md-4 plugin-block"><span class="toggleClick pluginBox" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].pluginName+'" title="'+availablePlugins[i].pluginName+'">'+availablePlugins[i].pluginName+'</span><input class="plugins" type="hidden" id="'+availablePlugins[i].pluginName+"_"+dataName+'"  title="'+pluginTxt+"_"+dataName+'"></div>').fadeIn();
		}
	}
	
	//Integration with Mindmaps
	$(".plugin-block span").each(function() {
		if($(this).text() == "RAID")
		{
			$(this).parent().hide();
		}
	});
	/*window.localStorage["_VP"] = false;
	window.localStorage["_VM"] = false;*/
	//$("#plugin-container").addClass("inactiveLink");
	if(window.localStorage['_UI'])
	{
		var userInfo =  JSON.parse(window.localStorage['_UI']);
		var userRole = window.localStorage['_SR'];
		if(userRole == "Test Manager") {
			$(".task-content").hide();
		}
		var userid = userInfo.user_id;
		PluginService.getProjectIDs_Nineteen68()
		.then(function (data) {
			if(data != "Fail" && data != "Invalid Session") {
				var obj=data;
				PluginService.getTaskJson_mindmaps(obj)
				.then(function (data) {
					if(data == "Invalid Session"){
						$rootScope.redirectPage();
					}else{
						var tasksJson = data;
						//window.localStorage['_TJ'] = angular.toJson(tasksJson);
						// 	var tasksJson = [{
						// 	"appType": "Web",
						// 	"projectId": "5122b95c-84ad-40fd-9f10-e29988323fb5",
						// 	"releaseId": "7f71b58f-ad8c-46ac-80f5-5c4145585c08",
						// 	"cycleId": "472b2499-761c-4e5d-bf8b-19d85e377bc4",
						// 	"screenId": "",
						// 	"screenName": "",
						// 	"testCaseId": "",
						// 	"testCaseName": "",
						// 	"scenarioId": "",
						// 	"scenarioName": "",
						// 	"assignedTestScenarioIds": ["4c1142f8-7851-477c-b25b-6504c86fe6b4"],
						// 	"testSuiteId": "476a4674-380b-49a6-8449-4d91ff3755e1",
						// 	"testSuiteName": "Web_Suite_Vidya",
						// 	"scenarioFlag": "True",
						// 	"taskDetails": [{
						// 		"taskName": "Task1",
						// 		"taskDescription": "null",
						// 		"taskType": "Execution",
						// 		"subTaskType": "TestSuite",
						// 		"subTaskId": "6299a0b0-7488-480f-835a-d769fa2092ae",
						// 		"assignedTo": "5829afa9-d661-477e-ba75-42163c728e2d",
						// 		"startDate": "",
						// 		"expectedEndDate": "",
						// 		"status": "assigned"
						// 	}]
						// }]
					 window.localStorage['_TJ'] = angular.toJson(tasksJson);
						$(".plugin-taks-listing").empty().hide()
						var counter = 1;
						for(i=0; i<tasksJson.length; i++){
							//console.log("taskJson", tasksJson[i]);
							for(j=0; j<tasksJson[i].taskDetails.length; j++){
								//console.log("TASKJSONDETAILS",tasksJson[i].taskDetails);
								if(tasksJson[i].taskDetails[j].taskType == "Design"){
									var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo" style="margin-top: -1px; padding-right: 6px;">'+ counter +'</h4><span class="assignedTask" data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'" data-screenid="'+tasksJson[i].screenId+'" data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'"  data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'"  onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="imgs/ic-taskType-yellow-plus.png"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn()
								} 
								else if(tasksJson[i].taskDetails[j].taskType == "Execution"){
									
									//console.log("test",tasksJson[i].assignedTestScenarioIds);
									var testSuiteDetails = JSON.stringify(tasksJson[i].testSuiteDetails);
									//console.log(i,testSuiteDetails);
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><div style="margin-top: 9px;min-height: 40px;margin-top: 15px;" href="#collapse'+counter+'"><h4 class="taskNo" style="margin-top: -1px; padding-right: 6px;">'+ counter +'</h4><span class="assignedTask"  data-testsuitedetails='+testSuiteDetails+' data-scenarioflag='+tasksJson[i].scenarioFlag+' data-apptype="'+tasksJson[i].appType+'" data-projectid="'+tasksJson[i].projectId+'"  data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-scenarioid="'+tasksJson[i].scenarioId+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskdes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedtestscenarioids="'+tasksJson[i].assignedTestScenarioIds+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" data-versionnumber="'+tasksJson[i].versionnumber+'" data-batchTaskIDs="'+tasksJson[i].taskDetails[j].batchTaskIDs+'" onclick="taskRedirection(this.dataset.testsuitedetails,this.dataset.scenarioflag,this.dataset.assignedtestscenarioids,this.dataset.subtask,this.dataset.subtaskid,this.dataset.screenid,this.dataset.screenname,this.dataset.projectid,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.scenarioid,this.dataset.versionnumber,this.dataset.status,this.dataset.batchtaskids)">'+tasksJson[i].taskDetails[j].taskName+'</span><!--Addition--><div class="panel-additional-details"><img style="height: 20px;" src="imgs/ic-taskType-blue-plus.png"/><button class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</button></div><!--Addition--></div></div></div>').fadeIn()
								}
								counter++
							}
						  }
						  	//prevent mouseclick before loading tasks
						  	$("span.toggleClick").removeClass('toggleClick');
						}
					
					//$("#plugin-container").removeClass("inactiveLink");
				}, function (error) { 
					console.log("Error:::::::::::::", error);
				})
				// $("#plugin-container").removeClass("inactiveLink");
			}	
			else{
				$rootScope.redirectPage();
			}
		}, function (error) { console.log("Error:::::::::::::", error) })
	}

	//Search form

	var isOpen = false;
	$(document).on('click',".searchIcon", function(){
		if(isOpen == false){
			$(this).parents('.list-inline').children("li:first-child").hide();
			$(this).parents('.list-inline').children("li:nth-child(2)").hide();
			$(this).parent().find("input").show();
			$(this).css("border-radius","0px 7px 7px 0px")
			isOpen = true;
			$(".searchInput").focus();
		}

		else
		{
			$(this).parents('.list-inline').children("li:first-child").show();
			$(this).parents('.list-inline').children("li:nth-child(2)").show();
			$(this).parent().find("input").hide();
			$(this).css("border-radius","7px 7px 7px 7px")
			isOpen = false;
		}
	})

	//Search form filter
	$('.searchInput').keyup(function() {
		filter(this); 
	});


	function filter(element) {
		var value = $(element).val();
		$(".panel-default span.assignedTask").each(function () {
			if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) > -1) {
				$(this).parents(".panel-default").show();
			} else {
				$(this).parents(".panel-default").hide();
			}
		});
		var counter=1;
		$(".panel-default h4:visible").each(function () {
			$(this).text(counter) 
			counter++;
		});
	} 

	//Plugin click event 
	$scope.pluginFunction = function(name){
		window.localStorage["_VP"] = true;
		if(name == "p_Mindmap"){
			//window.localStorage["_VM"] = true;
			name = 'home'
		}
		else if(name == "p_NeuronGraphs") name = 'neuronGraphs';
		else if(name == "p_NeuronGraphs3D") name = 'neuronGraphs3D';
		window.localStorage['navigateScreen'] = name;
		$timeout(function () {
			$location.path('/'+ name);
	   	}, 100);
	}
	window.localStorage['_TJ'] = "";
	window.localStorage['_CT'] = "";
	//Task Function
	/*$scope.getTask = function(){
    	$("#fileInputJson").attr("type","file");
    	$("#fileInputJson").trigger('click');
    	fileInputJson.addEventListener('change', function(e) {
				// Put the rest of the demo code here.
				var file = fileInputJson.files[0];
				var textType = /json./;
				var reader = new FileReader();
				reader.onload = function(e) {
					if((file.name.split('.')[file.name.split('.').length-1]).toLowerCase() == "json"){
						var tasksJson = JSON.parse(reader.result);
						window.localStorage['_TJ'] = angular.toJson(tasksJson);
						$(".plugin-taks-listing").empty().hide()
						var counter = 1;
						for(i=0; i<tasksJson.length; i++){
							for(j=0; j<tasksJson[i].taskDetails.length; j++){
								if(tasksJson[i].taskDetails[j].taskType == "Design"){
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-design-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-apptype="'+tasksJson[i].appType+'" data-projectname="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'" data-cycleid="'+tasksJson[i].cycleId+'" data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'" data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskDes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirection(this.dataset.subtask,this.dataset.screenid,this.dataset.screenname,this.dataset.projectname,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
								} 
								else if(tasksJson[i].taskDetails[j].taskType == "Execution"){
									$(".plugin-taks-listing").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-apptype="'+tasksJson[i].appType+'" data-projectname="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'" data-cycleid="'+tasksJson[i].cycleId+'" data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'" data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskDes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirection(this.dataset.subtask,this.dataset.screenid,this.dataset.screenname,this.dataset.projectname,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
								}
								counter++
							}
						}
					}
					else{
						alert("Upload only JSON file");
					}
				}
				reader.readAsText(file);
		});
    }*/

	$scope.taskRedirection = function(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs){
		console.log("subTaskId",subtaskid);
		var taskObj = {};
		if(status=='assigned'){
			status='inprogress';
			PluginService.updateTaskStatus(subtaskid)
					.then(function(data) {
							status=data;
						},
						function(error) {
							console.log("Error updating task status " + (error.data));
						});
		}
		//taskObj.projectidts = projectIdTS;
		taskObj.testSuiteDetails = JSON.parse(testsuitedetails);
		taskObj.scenarioFlag = scenarioflag;
		taskObj.assignedTestScenarioIds = assignedtestscenarioids;
		taskObj.screenId = screenid;
		taskObj.screenName = screenname;
		taskObj.projectId = projectid;
		taskObj.taskName = taskname;
		taskObj.versionnumber = versionnumber;
		taskObj.testCaseId = testcaseid;
		taskObj.testCaseName = testcasename;
		taskObj.appType = apptype;
		taskObj.status=status;
	//	taskObj.releaseId = releaseid;
	//	taskObj.cycleId = cycleid;
	//	taskObj.testSuiteId = testsuiteid;
		taskObj.scenarioId = scenarioid;
		taskObj.batchTaskIDs=batchTaskIDs;
	//	taskObj.testSuiteName = testsuitename;
		taskObj.subTask = subtask; 
		taskObj.subTaskId=subtaskid;
	//	taskObj.assignedTestScenarioIds = assignedtestscenarioids;
	//	taskObj.scenarioFlag = scenarioflag;
	
		window.localStorage['_CT'] = JSON.stringify(taskObj);
		if(subtask == "Scrape"){
			window.localStorage['navigateScreen'] = "Scrape";
			window.localStorage['navigateScrape'] = true;
			$window.location.assign("/design")
		}
		else if(subtask == "TestCase"){
			window.localStorage['navigateScreen'] = "TestCase";
			window.localStorage['navigateTestcase'] = true;
			$window.location.assign("/designTestCase")
		}
		else if(subtask == "TestSuite"){
			window.localStorage['navigateScreen'] = "TestSuite";
			$window.location.assign("/execute")
		}
		else if(subtask == "Scheduling"){
			window.localStorage['navigateScreen'] = "scheduling";
			$window.location.assign("/scheduling")
		}
	}
	
}]);

//Plugin click event - Creating Scope to define the function and returning back to controller
	$(document).on("click", ".pluginBox ", function(e){
		var name = $(this).attr('data-name');
		var pluginDetails = [];
		var selectedPlugin ='';
		var selectedPluginTxt = '';
		var encodedVal =  Encrypt.encode(name);
		var pluginVal = $(this).next('input[type=hidden]').attr('title').split("_")[1];
		var pluginPath = "p_"+ $(this).next('input[type=hidden]').attr('title').split("_")[0];
	// 	var pluginTxt = angular.element(document.body).scope().$root.plugins;
		$(".plugins").each(function() {
			var id = $(this).attr('title').split("_")[1];
			path = pluginPath;
			if(id == encodedVal)
			{
				angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(path);
				return;
			}
	  });
	});

// function p_event(name){ 	
// }

function taskRedirection(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs){
	angular.element(document.getElementsByClassName("assignedTask")).scope().taskRedirection(testsuitedetails,scenarioflag,assignedtestscenarioids,subtask,subtaskid,screenid,screenname,projectid,taskname,testcaseid,testcasename,apptype,scenarioid,versionnumber,status,batchTaskIDs)

}
