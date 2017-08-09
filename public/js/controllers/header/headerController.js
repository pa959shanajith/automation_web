/**
 * 
 */
var userDetails,userRole,task,switchedRoleId;
var projectId = []
var releaseId = [];
var cycleId = [];
var selectedROleID;	
var primaryRole = [];
primaryRole = JSON.parse(window.localStorage['_UI']).role;
var primaryRoleName = window.localStorage['_SR'];
mySPA.controller('headerController', function($scope,$http,$location,headerServices,LoginService,cfpLoadingBar) {
	if(window.localStorage['_UI'])
	{
		userDetails = JSON.parse(window.localStorage['_UI']);
	}
	userRole = window.localStorage['_SR'];
	$("#displayUsername").text(userDetails.firstname + ' ' + userDetails.lastname)
	$(".heading-center-light").text('Welcome  '+ userDetails.firstname + ' ' + userDetails.lastname +'!');
	$(".userRole").text(userRole);
	if(userRole == 'Admin')
	{
		$("#sRole").hide(); //naviPg
		$("#naviPg").css("cursor", "default");
	}

	//Global model popup
	function openModelPopup(title, body){
		$("#switchRoleModal").find('.modal-title').text(title);
		$("#switchRoleModal").find('.modal-body p').text(body);
		$("#switchRoleModal").modal("show");
		setTimeout(function(){
			$("#switchRoleModal").find('.btn-default').focus();			
		}, 300);
	}

	$(document).on("click", "#naviPg", function(e){
		if(userRole == 'Admin')
		{
			//window.location.href = '/admin';
		}
		else{
			window.localStorage["_VP"] = true;
			window.localStorage['navigateScreen'] = "plugin";
			//window.location.assign('plugin');
			window.location.href = '/plugin';
		}

	});

	var additionalRoleName;
	var userId = JSON.parse(window.localStorage['_UI']).user_id;

	$(document).on('click', ".switchRole_confirm",function() {
		//primaryRoleName = window.localStorage['_SR'];
		additionalRoleName = $(this).text(); 
		selectedROleID = $(this).valueOf("outerHTML").data("id");
		console.log($(this).text());
		openModelPopup("Switch Role", "Are you sure you want to switch role to: "+additionalRoleName);
				
		//$("#switchRoleModal").modal("show");
	})

	//$(document).on('click', ".switchRole_confirm",
	$scope.switchedRole = function() {
		//additionalRoleName = $(this).text(); 
		//selectedROleID = $(this).valueOf("outerHTML").data("id");
		//console.log($(this).text());
		//openModelPopup("Switch Role", "Your role is changed to "+additionalRoleName);
		changedRole =  $('#changedRole');	
		changedRole.append($("<p>Your role is changed to "+ additionalRoleName +"</p>"))
		$("#switchRoleModal").modal("hide");
		$("#switchedRoleModal").modal("show");
	}


	$scope.Switch_Role = function(){
		
		//var userId = JSON.parse(window.localStorage['_UI']).user_id;
		var username = JSON.parse(window.localStorage['_UI']).username;
		var userRolesList;
		var selRole;
			LoginService.loadUserInfo_Nineteen68(username,selRole,false)
			.then(function (response) {
				if(response == "Invalid Session"){
								window.location.href = "/";
								}
				var roleasarray=[];
				//roleasarray.push(response.additionalrole);
				roleasarray = response.additionalrole;
				console.log(roleasarray);
				LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
									.then(function (data) {
									
				  if(response == "Invalid Session"){
					window.location.href = "/";
				  }
				  else if(data.length == 0){
					  $("#noRoles").modal("show");
				  }
				  else{
					  //alert("success"); $(this).valueOf("outerHTML").data("id")
					 getAdditionalRoles = $('#switchRoles');
						getAdditionalRoles.empty();
						var pR = window.localStorage['_pR'].split(";")
						var sr = window.localStorage['_SR'];
						var ar = window.localStorage['_aR'];
						if(pR[0] != sr){
                         for (var i = 0; i < data.length; i++) {
							if(($('#switchRole').val() != response) && (data[i] != sr) && (response.additionalrole[i] != ar)){
								//if(pR[0] != data[i]){
									getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ response.additionalrole[i] +" ><a href='#' data-toggle='modal' id="+ response.additionalrole[i] +" data-target='#switchRoleModal'>"+ data[i] +"</a></li>"));
							    // }
								//  else{
								// 		 getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ response.additionalrole[i] +" ><a href='#' data-toggle='modal' id="+ response.additionalrole[i] +" data-target='#switchRoleModal'>"+ data[i] +"</a></li>"));
								//  }
							}
						}
						getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ pR[1] +" ><a href='#' data-toggle='modal' id="+ pR[1] +" data-target='#switchRoleModal'>"+ pR[0] +"</a></li>"));
						}
						else{
							for (var i = 0; i < data.length; i++) {
								getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ response.additionalrole[i] +" ><a href='#' data-toggle='modal' id="+ response.additionalrole[i] +" data-target='#switchRoleModal'>"+ data[i] +"</a></li>"));
							}							
						}
				// 	if($('#switchRole').val() != response){
				// 	 if(response.additionalrole[i] != selectedROleID){
				// 			getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ response.additionalrole[i] +" ><a href='#' data-toggle='modal' id="+ response.additionalrole[i] +" data-target='#switchRoleModal'>"+ data[i] +"</a></li> <li class='switchRole_confirm' data-id="+ primaryRole +" ><a href='#' data-toggle='modal' id="+ primaryRole +" data-target='#switchRoleModal'>"+ primaryRoleName +"</a></li>"));
				// 	 }
				// 	 else{
				// 		// for(i=0; i<userRolesList.r_ids.length; i++){
				// 		// 	if(($('#userRoles option:selected').val() != userRolesList.r_ids[i]) && (userRolesList.r_ids[i] != "b5e9cb4a-5299-4806-b7d7-544c30593a6e")){
				// 		// 		getDropDown.append("<li class='RolesCheck'><span class='rolesSpan'><input class='addcheckBox' type='checkbox' value="+ userRolesList.r_ids[i] +"><label class='rolesChecklabel'>"+userRolesList.userRoles[i]+"</label></span></li>");
				// 		// 	} 
				// 		// }
				// 		//if($('#switchRole').val() != response){
				// 			getAdditionalRoles.append($("<li class='switchRole_confirm' data-id="+ response.additionalrole[i] +" ><a href='#' data-toggle='modal' id="+ response.additionalrole[i] +" data-target='#switchRoleModal'>"+ data[i] +"</a></li>"));
				// 		//}
				//   }
				//   }
				  }
				});
				window.localStorage['_R'] = response.r_ids;
			
			}, function (error) { console.log("Error:::::::::::::", error) })
				
	}

	$scope.switchRole_Yes = function () 
	{
		var currentRole = window.localStorage['_SR'];
		var username = JSON.parse(window.localStorage['_UI']).username;
		var selRole = selectedROleID;

		LoginService.loadUserInfo_Nineteen68(username,selRole,true)
			.then(function (data) {
				if(data != "fail"){
					//To be removed - Has to come from database
						var availablePlugins = [];
						var key = ["Dashboard", "Dead Code Identifier", "Mindmap", "Neuron 2D", "Neuron 3D", "Oxbow Code Identifier", "Reports"];
						for(i=0; i<data.plugindetails.length; i++){
						availablePlugins.push({
							"pluginName" : key[i],
							"pluginValue" : data.plugindetails[i].keyValue
						})
					}
						availablePlugins.push({
							"pluginName" : "Utility",
							"pluginValue" : "true"
						})
							data.pluginsInfo = availablePlugins;
							//window.localStorage['LoginSuccess'] = "True";
							window.localStorage['_SR'] = additionalRoleName;
							window.localStorage['_UI'] = JSON.stringify(data);
							window.localStorage['_aR'] = selectedROleID;
							var roleasarray=[];
							roleasarray.push(selectedROleID);
							LoginService.getRoleNameByRoleId_Nineteen68(roleasarray)
							.then(function (data) {
								if(data != "fail"){
									window.localStorage['_SR'] = data;
									if(data == "Admin"){
										window.localStorage['navigateScreen'] = "admin";
										window.location.href = "/admin";
										}
									else{
										window.localStorage['navigateScreen'] = "plugin";
										window.location.href = "/plugin";
									}											
								}
								else	console.log("Fail to get role name by role Id.");
									}, function (error) { console.log("Fail to Load UserInfo") });									
							window.location.href = "/plugin";	
							}
								else	console.log("Failed to Load UserInfo.");
							}, function (error) { console.log("Fail to Load UserInfo") });

	}
	
	/*if(window.localStorage['_CT'])
	 {
			   projectId =  JSON.parse(window.localStorage['_CT']).projectId;
				headerServices.getProjectDetails_ICE(projectId) 
					.then(function(data){
						$scope.projectDetails = data;
						task = JSON.parse(window.localStorage['_CT']);
							releaseId = task.releaseId;
							headerServices.getReleaseNameByReleaseId_ICE(releaseId, projectId) 
							.then(function(data){
								$scope.releaseDetails = data;
									cycleId = task.cycleId;
										headerServices.getCycleNameByCycleId_ICE(cycleId, releaseId) 
										.then(function(data){
											console.log("cycleDetails", data);
											$scope.cycleDetails = data;
										}, function(error) {	console.log("Failed to get cycle name")});
							}, function(error) {	console.log("Failed to get release name")});

					}, function(error) {	console.log("Failed to fetch projectInfo")});
	 }*/
	if(window.localStorage['_CT'])
	{
		projectId.push(JSON.parse(window.localStorage['_CT']).projectId);
		headerServices.getNames_ICE(projectId,['projects']) 
		.then(function(data){
			if(data == "Invalid Session"){
				  window.location.href = "/";
				}
			$scope.projectDetails = data;
			task = JSON.parse(window.localStorage['_CT']);
			releaseId.push(task.releaseId);
			headerServices.getNames_ICE(releaseId, ['releases']) 
			.then(function(data){
					if(data == "Invalid Session"){
				  window.location.href = "/";
				}
				$scope.releaseDetails = data;
				cycleId.push(task.cycleId);
				headerServices.getNames_ICE(cycleId, ['cycles'])
				.then(function(data){
						if(data == "Invalid Session"){
				  window.location.href = "/";
				}
					console.log("cycleDetails", data);
					$scope.cycleDetails = data;
				}, function(error) {	console.log("Failed to get cycle name")});
			}, function(error) {	console.log("Failed to get release name")});

		}, function(error) {	console.log("Failed to fetch projectInfo")});
	}
	$scope.logout = function() 
	{
		//Logout User Service to be called
		headerServices.logoutUser_Nineteen68() 
		.then(function(data){
			if(data == "Session Expired")
			{
				window.localStorage.clear();
				window.location.href = '/';
			}
		}, function(error) {	console.log("Failed to Logout")});
	}
});
