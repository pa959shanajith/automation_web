mySPA.controller('pluginController',['$scope','$window','$http','$location','$timeout','PluginService', function($scope,$window,$http,$location,$timeout,PluginService) {
	$('.scrollbar-inner').scrollbar()
	document.getElementById("currentYear").innerHTML = new Date().getFullYear()
    var userInfo = JSON.parse(window.localStorage['_UI']);
    var availablePlugins = userInfo.pluginsInfo;
    $("#plugin-container").empty().hide()
    for(i=0; i<availablePlugins.length; i++){
        $("#plugin-container").append('<div class="col-md-4 plugin-block"><span onclick="p_event(this.dataset.name)" data-name="p_'+availablePlugins[i].pluginName.replace(/\s/g,'')+'" id="'+availablePlugins[i].id+'">'+availablePlugins[i].pluginName+'</span></div>').fadeIn()
    }

    //Plugin click event 
    $scope.pluginFunction = function(name){
    	$window.location.assign(name)
    }
    window.localStorage['_TJ'] = "";
	window.localStorage['_CT'] = "";
  //Task Function
    $scope.getTask = function(){
    	$("#fileInputJson").attr("type","file");
    	$("#fileInputJson").trigger('click');
    	fileInputJson.addEventListener('change', function(e) {
				// Put the rest of the demo code here.
				var file = fileInputJson.files[0];
				var textType = /json.*/;
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
									$(".plugin-taks-lissting").append('<div class="panel panel-default"><div class="panel-heading"><h4 class="panel-title"><div class="collapse-head" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'"><span class="taskNo">Task '+ counter +'</span><!--Addition--><div class="panel-additional-details"><span class="panel-head-tasktype">'+tasksJson[i].taskDetails[j].taskType+'</span><span class="panel-head-details details-execute-task">Details <span class="caret caret-absolute"></span></span></div><!--Addition--></div></h4></div><div id="collapse'+counter+'" class="panel-collapse collapse"><div class="panel-body"><span class="assignedTask" data-apptype="'+tasksJson[i].appType+'" data-projectname="'+tasksJson[i].projectId+'" data-releaseid="'+tasksJson[i].releaseId+'" data-cycleid="'+tasksJson[i].cycleId+'" data-screenid="'+tasksJson[i].screenId+'"  data-screenname="'+tasksJson[i].screenName+'" data-testcaseid="'+tasksJson[i].testCaseId+'" data-testcasename="'+tasksJson[i].testCaseName+'" data-testsuiteid="'+tasksJson[i].testSuiteId+'" data-testsuitename="'+tasksJson[i].testSuiteName+'" data-taskname="'+tasksJson[i].taskDetails[j].taskName+'" data-taskDes="'+tasksJson[i].taskDetails[j].taskDescription+'" data-tasktype="'+tasksJson[i].taskDetails[j].taskType+'" data-subtask="'+tasksJson[i].taskDetails[j].subTaskType+'" data-subtaskid="'+tasksJson[i].taskDetails[j].subTaskId+'" data-assignedto="'+tasksJson[i].taskDetails[j].assignedTo+'" data-startdate="'+tasksJson[i].taskDetails[j].startDate+'" data-exenddate="'+tasksJson[i].taskDetails[j].expectedEndDate+'" data-status="'+tasksJson[i].taskDetails[j].status+'" onclick="taskRedirection(this.dataset.subtask,this.dataset.screenid,this.dataset.screenname,this.dataset.projectname,this.dataset.taskname,this.dataset.testcaseid,this.dataset.testcasename,this.dataset.apptype,this.dataset.releaseid,this.dataset.cycleid,this.dataset.testsuiteid,this.dataset.testsuitename)">'+tasksJson[i].taskDetails[j].taskName+'</span></div></div></div>').fadeIn()
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
    }
    
    $scope.taskRedirection = function(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename){
		var taskObj = {};
		taskObj.screenId = screenid;
		taskObj.screenName = screenname;
		taskObj.projectId = projectname;
		taskObj.taskName = taskname;
		taskObj.testCaseId = testcaseid;
		taskObj.testCaseName = testcasename;
		taskObj.appType = apptype;
		taskObj.releaseId = releaseid;
		taskObj.cycleId = cycleid;
		taskObj.testSuiteId = testsuiteid;
		taskObj.testSuiteName = testsuitename;
		taskObj.subTask = subtask; 
		window.localStorage['_CT'] = JSON.stringify(taskObj);
    	if(subtask == "Scrape") 			$window.location.assign("/design")
    	else if(subtask == "TestCase")		$window.location.assign("/designTestCase")
    	else if(subtask == "TestSuite")		$window.location.assign("/execute")
    	else if(subtask == "Scheduling")	$window.location.assign("/scheduling")
    }

}]);

//Plugin click event - Creating Scope to define the function and returning back to controller
function p_event(name){
    angular.element(document.getElementsByClassName("plugin-block")).scope().pluginFunction(name)
}

function taskRedirection(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename){
	angular.element(document.getElementsByClassName("assignedTask")).scope().taskRedirection(subtask,screenid,screenname,projectname,taskname,testcaseid,testcasename,apptype,releaseid,cycleid,testsuiteid,testsuitename)
}
