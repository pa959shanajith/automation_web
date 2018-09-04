var appType;var releaseName;var cycleName;var testSuiteName;var rowId;var scenarioDescription;
mySPA.controller('executionController',['$scope', '$rootScope', '$http','$timeout','$location','ExecutionService','mindmapServices','DesignServices','cfpLoadingBar', 'socket', function ($scope, $rootScope, $http, $timeout, $location, ExecutionService, mindmapServices,DesignServices,cfpLoadingBar,socket) {
	cfpLoadingBar.start();
	var getEachScenario = [] //Contains Each RowData of Scenarios
	var userinfo = {} //Contains Userinfo
	var browserTypeExe = []; // Contains selected browser id for execution
	var scenarioIdQC;
	$scope.moduleInfo = [];
	$("body").css("background","#eee");
	$timeout(function(){
		$('.scrollbar-inner').scrollbar();
		$('.scrollbar-macosx').scrollbar();
		document.getElementById("currentYear").innerHTML = new Date().getFullYear()
		if(navigator.appVersion.indexOf("Mac")!=-1){
			$(".safariBrowser").show();
		}
	
	}, 500)

	//Set Modal Title 
	$('div.modal').on('shown.bs.modal', function() {
		$(this).find('.modal-title').attr('title',$(this).find('.modal-title').text());
		$('.sDInnerContents').each(function() {
			$(this).attr('title',$(this).text());
		})
	})
	//Task Listing
	loadUserTasks()

	socket.on('ICEnotAvailable', function () {
		unblockUI();
		openDialogExe("Execute Test Suite", "ICE Engine is not available. Please run the batch file and connect to the Server.");
	});
	/*var taskAuth;
	if(window.localStorage['_CT'] == "")
	{
		taskAuth = false;
	}*/
	if(window.localStorage['navigateScreen'] != "TestSuite")
	{
		$rootScope.redirectPage();
	}
	var current_task=JSON.parse(window.localStorage['_CT']);
	var getTaskName = current_task.taskName;
	appType = current_task.appType;
	//Task Name Commented
	//$("#page-taskName").empty().append('<span class="taskname">'+getTaskName+'</span>');
	$(".projectInfoWrap").empty()
	testSuiteName = current_task.testSuiteName;
	if(getTaskName.indexOf("Execute Batch") < 0){
		$(".parentBatchContainer").parent().hide();
		$(".btnPanel").css("left","0");
		$("#page-taskName span").text("Suite Execution");
		var status = current_task.status;
		if(status=='review'){
					$('.submitTaskBtn').text('Approve');
					$('.reassignTaskBtn').show();
		}
	}
	else	$("#page-taskName span").text("Batch Execution");
	//$timeout(function(){
  		//var releaseId = JSON.parse(window.localStorage['_CT']).releaseId;
	//	var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
	//	var projectId = JSON.parse(window.localStorage['_CT']).projectId;
		//projectDetails = angular.element(document.getElementById("left-nav-section")).scope().projectDetails;
		// releaseName = angular.element(document.getElementById("left-nav-section")).scope().releaseDetails.respnames[0];
		// cycleName = angular.element(document.getElementById("left-nav-section")).scope().cycleDetails.respnames[0];
		// if(projectDetails.respnames[0] !="" &&  releaseName!="" && cycleName !="" && testSuiteName != "")
		// {
		// 	$(".projectInfoWrap").append('<p class="proj-info-wrap"><span class="content-label">Project :</span><span class="content">'+projectDetails.respnames[0]+'</span></p><p class="proj-info-wrap"><span class="content-label">Release :</span><span class="content">'+releaseName+'</span></p><p class="proj-info-wrap"><span class="content-label">Cycle :</span><span class="content">'+cycleName+'</span></p><p class="proj-info-wrap"><span class="content-label">TestSuite :</span><span class="content">'+testSuiteName+'</span></p>')
		// }
	//}, 2000)

	//Global Information
	// var cycleId = JSON.parse(window.localStorage['_CT']).cycleId;
	// var testSuiteId = JSON.parse(window.localStorage['_CT']).testSuiteId;
	// var testSuiteName = JSON.parse(window.localStorage['_CT']).testSuiteName;
	var assignedTestScenarioId = current_task.assignedTestScenarioIds;
	if(window.localStorage['_CT']){
		var window_ct=JSON.parse(window.localStorage['_CT']);
		var readTestSuite = window_ct.testSuiteDetails;
		for(var rti=0;rti<readTestSuite.length;rti++){
			readTestSuite[rti].versionnumber = parseFloat(window_ct.versionnumber);
		}
		console.log("read",readTestSuite);
	}

	//Global Information
	//Getting Apptype or Screen Typef
	$scope.getScreenView = appType

	//Onload ServiceCall
	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
	}, 1000)

	$scope.readTestSuite_ICE = function(){
        $('.checkStylebox').attr("disabled", true); 
		$('#excSaveBtn').attr("disabled", true);
		//blockUI("Loading in Progress. Please Wait");
		ExecutionService.readTestSuite_ICE(readTestSuite, "execute")
		.then(function(data) {
			//unblockUI();
			if(data == "Invalid Session"){
					$rootScope.redirectPage();
			 }
			if(data == ""){
				// $('.checkStylebox').attr("disabled", true); 
				// $('#excSaveBtn').attr("disabled", true);
				// $('.checkStylebox').hide(); 
				// $('#excSaveBtn').hide();
			}
			else{
                $('.checkStylebox').attr("disabled", false); 
			    $('#excSaveBtn').attr("disabled", false);
				$(".executionTableDnd").empty()
				cfpLoadingBar.complete();
				var dataLen = Object.keys(data).length;
				var keys = Object.keys(data);
				var eachData = Object.keys(data).map(function(itm) { return data[itm]; });
				for(var m =0;m<dataLen;m++) {
					getEachScenario = []; // Empty scenarios for each module
					//create header for table
					$("#executionDataTable_"+m+" tbody tr").remove();
					rowData = eachData[m];
					$("div.executionTableDnd").attr('id','batch_'+m);
					$("#batch_"+m+"").append("<div class='suiteNameTxt' id='page-taskName_"+m+"'><span title="+rowData.testsuitename+" class='taskname'><input id='parentSuite_"+m+"' class='parentSuiteChk' type='checkbox' name='' />"+rowData.testsuitename+"</span></div><div id='exeData_"+m+"' class='exeDataTable testSuiteBatch'><table id='executionDataTable_"+m+"' class='executionDataTable' cellspacing='0' cellpadding='0'><thead><tr><th style='width: 4%' id='contextmenu'></th><th style='width: 3%; padding: 5px 0px'><i class='fa fa-ban' title='Do Not Execute' aria-hidden='true' style='font-size: 14px;'></i><input id='parentExecute_"+m+"' class='d-execute' type='checkbox' /></th>	<th style='width: 20%; text-align:left; border-right: 1px solid #fff;'>Scenario Name</th><th style='width: 24%; border-right: 1px solid #fff'>Data Parameterization</th>	<th style='width: 18%; border-right: 1px solid #fff'>Condition</th><th style='width: 19%; border-right: 1px solid #fff;'>Project Name</th><th style='width: 10%;text-align:center;cursor:pointer;'>Description</th></tr><input type='hidden' value='"+rowData.testsuiteid+"'/></thead><tbody class='scrollbar-inner testScenarioScroll'></tbody></table></div>");//<th style='width: 8%; text-align: center;'>ALM</th>
					//<img class='expandTable' src='imgs/icon-minus.png'>

				    var row = $("#executionDataTable_"+m+"").find('tbody');
					console.log("row",row);
					var count = 1

					//Building object for each row after getting the data from server
					for(var k=0; k<rowData.scenarioids.length; k++){
						if(JSON.parse(window.localStorage['_CT']).scenarioFlag == 'True'){
							if(rowData.scenarioids[k] == assignedTestScenarioId){
								getEachScenario.push({
									"condition" : rowData.condition[k],
									"dataParam" : rowData.dataparam[k],
									"executeStatus" : rowData.executestatus[k],
									"scenarioIds" : rowData.scenarioids[k],
									"scenarionames": rowData.scenarionames[k],
									"projectnames" : rowData.projectnames[k],
									"testSuiteId": rowData.testsuiteid[k]
								})
							}
						}
						else{
							getEachScenario.push({
								"condition" : rowData.condition[k],
								"dataParam" : rowData.dataparam[k],
								"executeStatus" : rowData.executestatus[k],
								"scenarioIds" : rowData.scenarioids[k],
								"scenarionames": rowData.scenarionames[k],
								"projectnames" : rowData.projectnames[k],
								"testSuiteId": rowData.testsuiteid[k]
							})
						}
					}

				//Building object for each row after getting the data from server
				var projectName=['Project Name'];
				//Creating Table Rows for each of the Scenarios
				for (var i = 0; i < getEachScenario.length; i++) {
					row = $("<tr id=\"" + count + "\"/>");
					$("#executionDataTable_"+m+"").append(row);
					row.append($("<td title="+count+" class='tabeleCellPadding' style='width:4%;' id=\"" + count + "\">"+ count + "</td>"));
					if(getEachScenario[i].executeStatus == undefined || getEachScenario[i].executeStatus == 0){
						row.append($("<td  class='tabeleCellPadding exe-ExecuteStatus noExe' style='width: 3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute'></td>"));
					}
					else if(getEachScenario[i].executeStatus == 1){
						row.append($("<td class='tabeleCellPadding exe-ExecuteStatus' style='width:3%; padding-top: 7px !important'><input ng-checked='executeAll' type='checkbox' title='Select to execute this scenario' class='doNotExecuteScenario d-execute' checked></td>"));
					}
					row.append($("<td title="+getEachScenario[i].scenarionames+"  class='tabeleCellPadding exe-scenarioIds' onclick='loadLocationDetails(this.innerHTML, this.getAttribute(\"sId\"))' sId="+getEachScenario[i].scenarioIds+" style='width: 18%; margin-right: 2%; cursor:pointer; word-break: break-all; text-align:left'>" + getEachScenario[i].scenarionames+ "</td>"));
					if(getEachScenario[i].dataParam == undefined){
						row.append($('<td style="width: 24%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value=""/></td>'));
					}
					else {
						row.append($('<td style="width: 24%" class="tabeleCellPadding exe-dataParam"><input class="getParamPath form-control" type="text" value="'+ getEachScenario[i].dataParam +'"/></td>'));
					}
					if(getEachScenario[i].condition == 0){
						row.append($('<td style="width:18%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertRed"><option value="1">True</option><option value="'+getEachScenario[i].condition+'" selected>False</option></select> </td>'));
					}
					else{
						row.append($('<td style="width:18%" class="tabeleCellPadding exe-conditionCheck"><select class="conditionCheck form-control alertGreen"><option value="'+getEachScenario[i].condition+'" selected>True</option><option value="0">False</option></select> </td>'));
					}
					row.append($("<td class='projectName' title="+getEachScenario[i].projectnames+" style='width:20%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important' class='tabeleCellPadding'>" + getEachScenario[i].projectnames + "</td>"));
					row.append($("<td class='variableMap' title='' style='width:10%; word-break: break-all; padding-left: 1% !important; padding-right: 1% !important;cursor:pointer;' class='tabeleCellPadding'><span class='descriptionContainer'><img alt='scenarioDescription' title='' id=scenarioDesc_"+count+" src='imgs/ic-details-inactive.png' class='scenarioDescIcon inactiveDesc'></span></td>"));	
					//row.append($("<td style='width:8%' class='tabeleCellPadding'><img src='../imgs/ic-alm.png' id='syncScenario' title='Sync Test Scenario' style='cursor: pointer;'/></td>"));
					count++;
					}

					//Add Scenario Description Functionality
					$(document).on('click','.descriptionContainer' , function(e) {
						var getScenarioDescVal;
						$('.scenarioDescTxt:visible').text('');
						rowId = parseInt(e.target.id.split('_')[1]);
						$("#dialog-addScenarioDesc").modal("show");
						$("#addScenarioDescContainer").empty();
						if ($(".addScenarioDesc-row").length > 1) $(".addScenarioDesc-row").remove()
						if($("#getScenarioDescVal_"+rowId+"").text() != '')
						{
							getScenarioDescVal = JSON.parse($("#getScenarioDescVal_"+rowId+"").text());
						}
						else{
							getScenarioDescVal = [];
						}
						
						if(getScenarioDescVal.length > 0)
						{
							for(var i=0;i<getScenarioDescVal.length;i++)
							{
								$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input max-length ="50" type="text" class="form-control form-control-custom varVal" placeholder="Enter Variable Key" value='+getScenarioDescVal[i].variableKey+' "></div><div class="form-group scenarioDescFormGroupval"><input max-length ="50" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Variable Value"  Value='+getScenarioDescVal[i].variableVal+'></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
							}
						}
						else{
								$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input max-length ="50" type="text" class="form-control form-control-custom varVal" placeholder="Enter Variable Key"></div><div class="form-group scenarioDescFormGroupval"><input max-length ="50" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Variable Value"></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
						}
						var getScenarioDescriptionText = $("#scenarioDescriptionTxt_"+rowId+"").text();
						if($("#scenarioDescriptionTxt_"+rowId+"").text() != '')
						{
							$("#"+event.target.id).parents('body.modal-open').find('input.scenarioDescTxt').val($("#scenarioDescriptionTxt_"+rowId+"").text())
						}
						else{
							$("#"+event.target.id).parents('body.modal-open').find('input.scenarioDescTxt').val('')
						}
						e.stopImmediatePropagation();
					});
						
					//Add More Scenario Description row Functionality
					$scope.addMoreScenarioObject = function() {
						$("#addScenarioDescContainer").append('<div class="row row-modal addScenarioDesc-row"><div class="form-group form-inline scenarioDescFormGroup"><input max-length ="50" type="text" class="form-control form-control-custom varVal" placeholder="Enter Variable Key"></div><div class="form-group scenarioDescFormGroupval"><input max-length ="50" type="text" class="form-control form-control-custom scenarioDescVal" placeholder="Enter Variable Value"></div><span class="delScenarioDesc"><img class="deleteScenarioDescRow" src="imgs/ic-delete.png" /></span></div>');
					};

					//Delete Scenario Description row Functionality
					$(document).on("click", ".deleteScenarioDescRow", function() {
						$(this).parent().parent(".addScenarioDesc-row").remove();
					});

					//Reset Scenario Description rows Functionality
					$scope.resetScenarioDescFields = function() {
						$('.addScenarioDesc-row').find("input:visible").val('');
					};

					//Save Scenario Description rows Functionality 
					$scope.saveScenarioDescDetails = function($event) {
						$scope.scenarioDescriptionObj = [];
						$('.addScenarioDesc-row').each(function() {
							$scope.scenarioDescriptionObj.push({'variableKey' : $(this).find('.varVal').val(), 'variableVal': $(this).find('.scenarioDescVal').val() });
						});
						var scenarioDescriptionText = $.trim($("#"+$event.target.id).parents('.modal-dialog').find('.scenarioDescTxt').val());
						$("#dialog-addScenarioDesc").modal("hide");
						openDialogExe("Scenario Description", "Scenario Description added successfully");
						if($scope.scenarioDescriptionObj.length > 0)
						{
							$scope.scenarioDescriptionObj = JSON.stringify($scope.scenarioDescriptionObj);
							$('img#scenarioDesc_'+rowId+'').attr('src','imgs/ic-details-active.png');
							$("img#scenarioDesc_"+rowId+"").append('<span id="getScenarioDescVal_'+rowId+'" class="getScenarioDescVal hide"></span><span id="scenarioDescriptionTxt_'+rowId+'" class ="scenarioDescriptionTxt hide"></span>');
							$("#getScenarioDescVal_"+rowId+"").text($scope.scenarioDescriptionObj);
						}
						else{
							$scope.scenarioDescriptionObj = JSON.stringify($scope.scenarioDescriptionObj);
							$('img#scenarioDesc_'+rowId+'').attr('src','imgs/ic-details-inactive.png');
							$("img#scenarioDesc_"+rowId+"").append('<span id="getScenarioDescVal_'+rowId+'" class="getScenarioDescVal hide"></span><span id="scenarioDescriptionTxt_'+rowId+'" class ="scenarioDescriptionTxt hide"></span>');
							$("#getScenarioDescVal_"+rowId+"").text($scope.scenarioDescriptionObj);
						}

						$("#scenarioDescriptionTxt_"+rowId+"").text(scenarioDescriptionText);
						//Service to be called for saving scenario description 
					};



				
					//No Execution Status Marking Red
					$(".noExe").parent("tr").css({'border-left':'4px solid red'});
					$(".noExe").prev().css({'width':'calc(3.9% - 4px)'})

					//check,uncheck parentSuite onload
					$('#parentExecute_'+m).each(function() {
						var checkedLen = $(this).parents('table').find('tbody tr input[type=checkbox]:checked').length;
						if(parseInt(checkedLen) > 0)
							$('#parentSuite_'+m).prop("checked", true);
						else
							$('#parentSuite_'+m).prop("checked", false);
						var totalLen =  $(this).parents('table').find('tbody tr input[type=checkbox]').length;
						if(totalLen == checkedLen)
						{
							$('#parentExecute_'+m).prop("checked", true);
							//$('#parentSuite_'+m).prop("checked", true);
						}
						else{
							$('#parentExecute_'+m).prop("checked", false);
							//$('#parentSuite_'+m).prop("checked", false);
						}
					});

					//check parent checkbox by default if all child checkboxes are checked
					if($("#executionDataTable_"+m+" tbody tr").length == $("#executionDataTable_"+m+" tbody tr td.exe-ExecuteStatus input:checked").length)
					{
						$("#parentExecute").prop("checked", true);
					}
					else{
						$("#parentExecute").prop("checked", false);
					}
				 }
				 if(dataLen >= 2){
					 $(".executionDataTable tbody").prop("style","max-height: 100px !important;");
				 }
				 if(dataLen == $(".parentSuiteChk:checked").length){
					 $(".checkStylebox").prop("checked", true);
				 }
				 else{
					 $(".checkStylebox").prop("checked", false);
				 }

				$('[id^=parentExecute_]').on('click',function(e){
						if($(this).is(":checked") == true)
						{
							$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', true);
							$(this).parents('table').parent().prev().children('span').children('input').prop('checked', true);
						}
						else{
							$(this).parents('table').find('tbody tr input[type=checkbox]').prop('checked', false);
							$(this).parents('table').parent().prev().children('span').children('input').prop('checked', false);
						}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen =  $('[id^=parentSuite_]').length;
					if(moduleLen == totalModuleLen)
					{
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					}
					else{
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				$('[id^=executionDataTable]').find('tbody tr td input').on('click',function(e){
					var totalLen = $(this).parent().parent().parent().children().find('input[type=checkbox]').length;
					var checkedLen = $(this).parent().parent().parent().children().find('input[type=checkbox]:checked').length;
					if(totalLen == checkedLen)
					{
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', true);
					}
					else{
						$(this).parents('table').find('thead input[type=checkbox]').prop('checked', false);
					}
					if(checkedLen > 0)
					{
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', true);
					}
					else{
						$(this).parents('table').parent().prev().children('span').children('input[type=checkbox]').prop('checked', false);
					}
					var moduleLen = $('[id^=parentSuite_]:checked').length;
					var totalModuleLen =  $('[id^=parentSuite_]').length;
					if(moduleLen == totalModuleLen)
					{
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					}
					else{
						$("input[type='checkbox'].checkStylebox").prop('checked', false);
					}
				});

				$('[id^=parentSuite_]').on('click',function(e){
					if($(this).is(":checked") == true)
						{
							$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', true);
						}
					else{
						$(this).parents('.suiteNameTxt').next().children().find('input[type=checkbox]').prop('checked', false);
					}
					 var checkedLen = $('[id^=parentSuite_]:checked').length;
					 var totalLen = $('[id^=parentSuite_]').length;
					 if(checkedLen == totalLen)
					 {
						$("input[type='checkbox'].checkStylebox").prop('checked', true);
					 }
					 else
					 {
						 $("input[type='checkbox'].checkStylebox").prop('checked', false);
					 }
				});

				$("input[type='checkbox'].checkStylebox").on('click',function(e){
						if($(this).is(":checked") == true)
						{
							$('[id^=parentSuite_]').prop('checked', true);
							$('[id^=parentExecute_]').prop('checked', true);
							$("tbody").find('input[type=checkbox]').prop('checked', true);
						}
						else{
							$('[id^=parentSuite_]').prop('checked', false);
							$('[id^=parentExecute_]').prop('checked', false);
							$("tbody").find('input[type=checkbox]').prop('checked', false);
						}
				});

			}

			if(getTaskName.indexOf("Execute Batch") < 0){
				$(".parentSuiteChk").hide();
			}
			//select all checkboxes by default on load
			//$("input[type=checkbox]:visible").prop('checked',true)

			// //check parent checkbox by default if all child checkboxes are checked
			// if($("#executionDataTable_"+m+" tbody tr").length == $("#executionDataTable_"+m+" tbody tr td.exe-ExecuteStatus input:checked").length)
			// {
			// 	$("#parentExecute").prop("checked", true);
			// }
			// else{
			// 	$("#parentExecute").prop("checked", false);
			// }
			//}
		},
		function(error) {
			console.log("Error")
		})
	};




	$(document).on('click', '.expandTable', function(){
		if ($(this).attr('src') ==  "imgs/icon-plus.png" ) {
			$(this).prop("src", "imgs/icon-minus.png")
			$(this).parent().parent().next().slideDown();
		}else {
			$(this).prop("src", "imgs/icon-plus.png")
			$(this).parent().parent().next().slideUp();
		}
	});

	//Show scenarios of testsuites
	$(document).dblclick(".taskname", function(e){
		if(e.target.className == "taskname"){			
			var scenarioNames = e.target.parentElement.nextSibling.getElementsByClassName("testScenarioScroll")[0].children;
			$("#suiteDetailsContent").empty();
			$("#modalSuiteDetails").find(".modal-title").text(e.target.textContent);
			var projectName = $(".projectName").text();
			for(var i=0; i<scenarioNames.length;i++){
				$("#suiteDetailsContent").append('<div class="sDInnerContentsWrap"><div class="sDInnerContents" style="width: 50%;">'+scenarioNames[i].getElementsByClassName("exe-scenarioIds")[0].textContent+'</div><div class="sDInnerContents" style="width: 50%;">'+projectName+'</div></div>');
			}
			$("#modalSuiteDetails").modal("show");
			$('#modalSuiteDetails').find('.btn-default').focus();
		}
	})
	//Load Location Details of Scenario
	$scope.loadLocationDetails = function(scenarioName, scenarioId) {
		//document.getElementById("scenarioDetailsContent").innerHTML = "";
		$("#scenarioDetailsContent").empty();
		$("#modalScenarioDetails").find(".modal-title").text(scenarioName);
		$("#modalScenarioDetails").modal("show");
		$('#modalScenarioDetails').find('.btn-default').focus();
		ExecutionService.loadLocationDetails(scenarioName, scenarioId)
		.then(function(data) {
			if(data == "Invalid Session"){
					$rootScope.redirectPage();
			 }
			for(i=0; i<data.projectnames.length && data.testcasenames.length && data.screennames.length; i++){
				//document.getElementById("scenarioDetailsContent").innerHTML += '<div class="sDInnerContentsWrap"><div class="sDInnerContents">'+data.testcasenames[i]+'</div><div class="sDInnerContents">'+data.screennames[i]+'</div><div class="sDInnerContents">'+data.projectnames[i]+'</div></div>'
				$("#scenarioDetailsContent").append('<div class="sDInnerContentsWrap"><div class="sDInnerContents viewReadOnlyTC" data-name='+data.testcasenames[i]+' data-id='+data.testcaseids[i]+'>'+data.testcasenames[i]+'</div><div class="sDInnerContents">'+data.screennames[i]+'</div><div class="sDInnerContents">'+data.projectnames[i]+'</div></div>')
			}
			$( ".viewReadOnlyTC" ).click(function() {
				var testCaseName = this.getAttribute('data-name'),
				testCaseId = this.getAttribute('data-id');
				DesignServices.readTestCase_ICE(undefined, testCaseId, testCaseName, 0)
				.then(function(response) {
						if (response == "Invalid Session") {
							$rootScope.redirectPage();
						}
						var source = $("#handlebar-template-testcase").html();
						var template = Handlebars.compile(source);
						try{
							JSON.parse(response.testcasesteps);
						}
						catch(err){
							response.testcasesteps = '[]';
						}
						var dat = template({name:[{testcasename:response.testcasename}],rows:JSON.parse(response.testcasesteps)});
						var newWindow = window.open();
						newWindow.document.write(dat);
					},
					function(error) {});
					//alert( "Handler for .click() called." );
			  });	
	
		},
		function(error){
			console.log(error)
		})
	}
	//Load Location Details of Scenario


	//Save TestSuite Functionality
	$scope.updateTestSuite = function(e){
		blockUI("Saving in progress. Please Wait...");
		var batchInfo = [];
		var batchDetails = {};
		//updateTestSuite
		var loopingtimes=0;
		$.each($(".parentSuiteChk"), function(){
			var suiteInfo = {};
			var suiteDetails = {};
			var testSuiteName = "";
			var testSuiteId = "";
			var testScenarioIds = [];
			var getParamPaths = [];
			var conditionCheck = [];
			var executeStatus = [];
			var scenarioDescObj = [];
			var scenarioDescriptionText = [];
			if(window.localStorage['_CT']){
				var window_ct=JSON.parse(window.localStorage['_CT']);
				var cycleid = window_ct.testSuiteDetails;
				var versionnumber = parseFloat(window_ct.versionnumber);
			}
			//if($(this).is(":checked") == true){
			//Getting ScenarioIds
			$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-scenarioIds'), function(){
				testScenarioIds.push($(this).attr("sId"));
				getParamPaths.push("\'"+$(this).parent().find(".getParamPath").val().trim()+"\'");
				conditionCheck.push($(this).parent().find(".conditionCheck option:selected").val());
				scenarioDescObj.push($.trim($(this).parent().find('.getScenarioDescVal').text()));
				scenarioDescriptionText.push($(this).parent().children('td.variableMap').find('.scenarioDescriptionTxt ').text());
				if($(this).parent().find(".doNotExecuteScenario").is(":checked"))
					executeStatus.push(1);
				else
					executeStatus.push(0);
			})
			/*//Getting DataParamPaths
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-dataParam'), function(){
					getParamPaths.push("\'"+$(this).find("input").val()+"\'")
				})
				//Getting ConditionChecks
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-conditionCheck'), function(){
					conditionCheck.push($(this).find("select option:selected").val())
				})
				//Getting Execution Status
				$.each($(this).parents('.suiteNameTxt').next('div').find('.exe-ExecuteStatus'), function(){
					if($(this).find("input").is(":checked")) executeStatus.push(1)
					else executeStatus.push(0)
				})*/
			testSuiteName = $(this).parents('span.taskname').text();
			testSuiteId =  $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();

			//scenarioDescObj = $(this).parents('div.executionTableDnd').find('span.descriptionContainer').text();
			// $variableMap = $(this).parents('div.executionTableDnd').children('div.testSuiteBatch').children().find('td.variableMap');

			// $variableMap.each(function() {
			// 	scenarioDescObj.push($.trim($(this).find('.getScenarioDescVal ').text()));
			// });
			scenarioDescObj = scenarioDescObj.toString();
			scenarioDescObj = JSON.stringify(scenarioDescObj);
			// console.log("testScenarioIds",testScenarioIds);
			// console.log("getParamPaths",getParamPaths);
			// console.log("conditionCheck",conditionCheck);
			// console.log("executeStatus",executeStatus);
			// console.log("suiteName", testSuiteName);
			// console.log("suiteId", testSuiteId);
			// console.log("cycleId", cycleId);// cycleId to be changed from taskJson
			// suiteDetails.push({
			// 		testSuiteId: testSuiteId,
			// 		testSuiteName: testSuiteName,
			// 		testScenarioIds :testScenarioIds,
			// 		getParamPaths : getParamPaths,
			// 		conditionCheck : conditionCheck,
			// 		executeStatus : executeStatus,
			// 		testscycleid : cycleId
			// 	})
			suiteDetails.requestedtestsuiteid = testSuiteId;
			suiteDetails.requestedtestsuitename= testSuiteName;
			suiteDetails.testscenarioids =testScenarioIds;
			suiteDetails.getparampaths = getParamPaths;
			suiteDetails.conditioncheck = conditionCheck;
			suiteDetails.donotexecute = executeStatus;
			suiteDetails.versionnumber = versionnumber;
			suiteDetails.testscycleid = JSON.parse(window.localStorage['_CT']).testSuiteDetails[loopingtimes].cycleid;
			suiteDetails.scenarioKeyVal = scenarioDescObj;
			suiteDetails.scenarioDescText = scenarioDescriptionText;
			//console.log("suiteDetails",suiteDetails);
			suiteInfo[testSuiteName] = suiteDetails;
			//console.log("suiteInfo", suiteInfo);
			batchInfo.push(suiteInfo);
			//console.log("batchInfo", batchInfo);
			batchDetails.suiteDetails = batchInfo;
			loopingtimes = loopingtimes + 1;
			//console.log("batchDetails",batchDetails);
			//}
		});
		console.log("batchdetails",batchDetails);
		//Getting ConditionChecks
		ExecutionService.updateTestSuite_ICE(batchDetails)
		.then(function(data) {
			unblockUI();
			if(data == "Invalid Session"){
				$rootScope.redirectPage();
			}
			if(data != "fail"){
				openDialogExe("Save Test Suite", "Test suite saved successfully.")
				//$("#saveSuitesModal").modal("show")
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
				//Transaction Activity for Save Test Suite Button Action
				// var labelArr = [];
				// var infoArr = [];
				// labelArr.push(txnHistory.codesDict['SaveTestSuite']);
				// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
			}
			else{
				openDialogExe("Save Test Suite", "Failed to save test suite.")
				//$("#saveSuitesModalFail").show();
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
			}
		},
		function(error){})
	}
	//Save TestSuite Functionality

	//Save QC Details
	$scope.saveQcCredentials = function(e){
		$("#almURL, #almUserName, #almPassword").removeClass('inputErrorBorder')
		if(!$scope.almURL) {
			$("#almURL").addClass('inputErrorBorder')
		}
		else if(!$scope.almUserName){
			$("#almUserName").addClass('inputErrorBorder')
		}
		else if(!$scope.almPassword){
			$("#almPassword").addClass('inputErrorBorder')
		}
		else if(appType != "SAP" && browserTypeExe.length == 0){
			$("#ALMSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select a browser");
		}
		else if($(".exe-ExecuteStatus input:checked").length == 0){
			$("#ALMSyncWindow").find("button.close").trigger("click");
			openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute");
		}
		else{
			$("#almURL,#almUserName,#almPassword,.almQclogin").prop("disabled",true);
			$("#almURL,#almUserName,#almPassword").css({"background":"none"});
			$(".error-msg-exeQc").text("");
			ExecutionService.loginQCServer_ICE($scope.almURL,$scope.almUserName,$scope.almPassword)
			.then(function(data){
				$("#almURL,#almUserName,#almPassword,.almQclogin").prop("disabled",false);
				if(data == "unavailableLocalServer"){
					$(".error-msg-exeQc").text("Unavailable LocalServer");
				}
				else if(data == "Invalid Session"){
					$(".error-msg-exeQc").text("Invalid Session");
				}
				else if(data == "invalidcredentials"){
					$(".error-msg-exeQc").text("Invalid Credentials");
				}
				else if(data == "invalidurl"){
					$(".error-msg-exeQc").text("Invalid URL");
				}			
				else{
					$scope.moduleInfo = [];
					$.each($(".parentSuiteChk"), function(){
						var suiteInfo = {};
						var selectedRowData = [];
						//suiteInfo.suiteDetails = [];
						if($(this).is(":checked") == true){
							$(this).parent().parent().next().find('tbody input[type=checkbox]:checked').each(function() {
								selectedRowData.push({
									condition : parseInt($(this).parent().siblings(".exe-conditionCheck").find("select option:selected").val()),
									dataparam : [$(this).parent().siblings(".exe-dataParam").find("input").val().trim()],
									executestatus : 1,
									scenarioids : $(this).parent().siblings(".exe-scenarioIds").attr("sId"),
									qccredentials: {
										qcurl: $("#almURL").val(),
										qcusername: $("#almUserName").val(),
										qcpassword:	$("#almPassword").val()
									}
								})
							});
							//console.log("selectedRowData:::" + selectedRowData)
							suiteInfo.suiteDetails = selectedRowData;
							suiteInfo.testsuitename = $(this).parents('span.taskname').text();
							suiteInfo.testsuiteid = $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
							suiteInfo.browserType = browserTypeExe;
							suiteInfo.appType = appType;
							//console.log("suiteInfo:::" + suiteInfo)
							$scope.moduleInfo.push(suiteInfo);
							//Transaction Activity for SaveQcCredentialsExecution Button Action
							// var labelArr = [];
							// var infoArr = [];
							// labelArr.push(txnHistory.codesDict['SaveQcCredentialsExecution']);
							// txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
						}
					});
					$("#ALMSyncWindow").find("button.close").trigger("click");

				}
			},
			function(error) {	console.log("Error in qcController.js file loginQCServer method! \r\n "+(error.data));
			});
		}
	}

	//Execute TestSuite Functionality
	$scope.ExecuteTestSuite = function($event){
		if($scope.moduleInfo.length <= 0){
			$.each($(".parentSuiteChk"), function(){
				var suiteInfo = {};
				var selectedRowData = [];
				//suiteInfo.suiteDetails = [];
				if($(this).is(":checked") == true){
					$(this).parent().parent().next().find('tbody input[type=checkbox]:checked').each(function() {
						selectedRowData.push({
							condition : parseInt($(this).parent().siblings(".exe-conditionCheck").find("select option:selected").val()),
							dataparam : [$(this).parent().siblings(".exe-dataParam").find("input").val().trim()],
							executestatus : 1,
							scenarioids : $(this).parent().siblings(".exe-scenarioIds").attr("sId"),
							qccredentials: {
								qcurl: "",
								qcusername: "",
								qcpassword:	""
							}
						})
					});
					//console.log("selectedRowData:::" + selectedRowData)
					suiteInfo.suiteDetails = selectedRowData;
					suiteInfo.testsuitename = $(this).parents('span.taskname').text();
					suiteInfo.testsuiteid = $(this).parents('.suiteNameTxt').next().find('thead').children('input[type=hidden]').val();
					suiteInfo.browserType = browserTypeExe;
					suiteInfo.appType = appType;
					//console.log("suiteInfo:::" + suiteInfo)
					$scope.moduleInfo.push(suiteInfo);
				}
			});
		}
		console.log("moduleInfo:::" + $scope.moduleInfo)
		//moduleInfo.push(suiteInfo);
		//Getting each row data as an object
		if((appType != "SAP" && appType != "Mainframe") && browserTypeExe.length == 0)	openDialogExe("Execute Test Suite", "Please select a browser")
		else if(appType == "SAP" && browserTypeExe.length == 0)	openDialogExe("Execute Test Suite", "Please select SAP Apps option")

		else if($(".exe-ExecuteStatus input:checked").length == 0) openDialogExe("Execute Test Suite", "Please select atleast one scenario(s) to execute")
		else{
			//if(appType == "SAP") browserTypeExe = ["1"];
			blockUI("Execution in progress. Please Wait...")
			ExecutionService.ExecuteTestSuite_ICE($scope.moduleInfo)
			.then(function(data){
				if(data == "Invalid Session"){
					$rootScope.redirectPage();
				}
				if(data == "Terminate"){
					$('#executionTerminated').modal('show');
					$('#executionTerminated').find('.btn-default').focus();
				}
				else if(data == "unavailableLocalServer"){
					openDialogExe("Execute Test Suite", "ICE Engine is not available. Please run the batch file and connect to the Server.")
					//$('#executionserverunavailable').modal('show');
				}
				else if(data == "scheduleModeOn")
				{
					openDialogExe("Execute Test Suite", "Schedule mode is Enabled, Please uncheck 'Schedule' option in ICE Engine to proceed.");
				}
				else{
					$('#executionCompleted').modal('show');
					setTimeout(function(){
						$("#executionCompleted").find('.btn-default').focus();
					}, 300);
				}
				unblockUI()
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
				$scope.moduleInfo = [];
				$("#syncScenario").prop("disabled",true);
				//Transaction Activity for ExecuteTestSuite Button Action
				// var labelArr = [];
				// var infoArr = [];
				// infoArr.push({"appType" : appType});
				// infoArr.push({"status" : data});
				// labelArr.push(txnHistory.codesDict['ExecuteTestSuite']);
				// txnHistory.log($event.type,labelArr,infoArr,$location.$$path);

			},
			function(error){
				unblockUI()
				openDialogExe("Execute Failed", "Failed to execute.")
				//$('#executionFailed').modal('show');
				$(".selectBrowser").find("img").removeClass("sb");
				browserTypeExe = [];
				angular.element(document.getElementById("left-nav-section")).scope().readTestSuite_ICE();
				$scope.moduleInfo = [];
				$("#syncScenario").prop("disabled",true);
			})
		}
	}
	//Execute TestSuite Functionality


	//ALM Functionality
	$(document).on("click", "#syncScenario", function(){
		$("#ALMSyncWindow").modal("show");
		$(".error-msg-exeQc").text('');
		if($scope.moduleInfo.length > 0){
			$("#almURL").val($scope.moduleInfo.suiteDetails.qccredentials.qcurl);
			$("#almUserName").val($scope.moduleInfo.suiteDetails.qccredentials.qcusername);
			$("#almPassword").val($scope.moduleInfo.suiteDetails.qccredentials.qcpassword);
		}
		else	$("#almURL, #almUserName, #almPassword").val('')
	})
	//ALM Functionality


	// //Submit Task Function
	// $scope.submitTaskExecution = function(){
	// 	$("#submitTasksExecution").modal("show")
	// 	$('#submitTasksExecution').find('.btn-default-yes').focus();
	// }
	// //Submit Task Function

	 $scope.submit_task=function(action,e) {
        var taskinfo = JSON.parse(window.localStorage['_CT']);
        var taskid = taskinfo.subTaskId;
        var taskstatus = taskinfo.status;
        var version = taskinfo.versionnumber;
        var batchTaskIDs = taskinfo.batchTaskIDs;
		var projectId=taskinfo.projectId;
        if (action != undefined && action == 'reassign') {
            taskstatus = action;
		}
		
		//Transaction Activity for Task Submit/Approve/Reassign Button Action
        // var labelArr = [];
		// var infoArr = [];
		
        mindmapServices.reviewTask(projectId,taskid,taskstatus,version,batchTaskIDs).then(function(result){
        		if (result == 'fail') {
                    openDialogExe("Task Submission Error", "Reviewer is not assigned !",true)
                } else if (taskstatus == 'reassign') {
					openDialogExe("Task Reassignment Success", "Task Reassigned scucessfully!",true);
					//labelArr.push(txnHistory.codesDict['TaskReassign']);
                } else if (taskstatus == 'review') {
					openDialogExe("Task Completion Success", "Task Approved scucessfully!",true);
					//labelArr.push(txnHistory.codesDict['TaskApprove']);
                } else {
					openDialogExe("Task Submission Success", "Task Submitted scucessfully!",true);
					//labelArr.push(txnHistory.codesDict['TaskSubmit']);
				}
				//txnHistory.log(e.type,labelArr,infoArr,$location.$$path);
        },function(error){
            console.log(error);
        })
    }

	$scope.submitTaskExecution = function(action){
		$("#submitTasksExecution").modal("show")
		$('#submitTasksExecution').find('.btn-default-yes').focus();
		if(action=='reassign'){
			$scope.stask = 'reassign';
			$("#submitTasksExecution").find('.modal-title').text('Reassign Task');
			$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to reassign the task ?');
			//$("#submitTasksExecution").find('.modal-footer button')[0].setAttribute('ng-click',"submit_task('reassign')")
		}
		else
        {	$scope.stask = 'approve';
			if($(".submitTaskBtn:visible").text() == 'Approve')
			{
				$("#submitTasksExecution").find('.modal-title').text('Approve Task');
				$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to approve the task ?')
			}
			else{
				$("#submitTasksExecution").find('.modal-body p').text('Are you sure you want to submit the task ?')
			}
			
        }
	}



	//Conditiion Check Function
	$(".conditionCheck").each(function(){
		if($(this).val() == 0) $(this).removeClass("alertGreen").addClass("alertRed");
		else $(this).removeClass("alertRed").addClass("alertGreen");
	})

	$(document).on("change", ".conditionCheck", function(){
		if($(this).val() == 0) $(this).removeClass("alertGreen").addClass("alertRed")
		else $(this).removeClass("alertRed").addClass("alertGreen")
	})
	//Conditiion Check Function


	//Select Browser Function
	$(document).on("click", ".selectBrowser", function(){
		$(this).find("img").toggleClass("sb")
		if($(this).find("img").hasClass("sb") == false) {
			var getSpliceIndex = browserTypeExe.indexOf(''+$(this).data("name")+'')
			browserTypeExe.splice(getSpliceIndex, 1)
		}
		else {
			//browserTypeExe.push($(this).data("name"))
			browserTypeExe.push(''+$(this).data("name")+'')
		}
		if(browserTypeExe.length > 0){
			$("#syncScenario").prop("disabled",false);
		}
		else $("#syncScenario").prop("disabled",true);
	})
	//Select Browser Function

	$("#tableActionButtons, .executionTableDnd").delay(500).animate({opacity:"1"}, 500)

	 
}]);

function loadLocationDetails(scenarioName, scenarioId){
	angular.element(document.getElementById("left-nav-section")).scope().loadLocationDetails(scenarioName, scenarioId);
}

function openDialogExe(title, body,submitflag){
	if(submitflag==undefined){
		$("#executeGlobalModal").find('.modal-title').text(title);
		$("#executeGlobalModal").find('.modal-body p').text(body).css('color','black');
		$("#executeGlobalModal").modal("show");
		setTimeout(function(){
			$("#executeGlobalModal").find('.btn-accept').focus();
		}, 300);
	}
	else{
		 $("#globalTaskSubmit").find('.modal-title').text(title);
            $("#globalTaskSubmit").find('.modal-body p').text(body);
            $("#globalTaskSubmit").modal("show");
	}
}

