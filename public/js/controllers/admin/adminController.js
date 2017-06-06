/***
 * 
 */
var DOMAINID, releaseName, cycleName, count=0,delCount=0,editReleaseId='',editCycleId='',deleteReleaseId='',deleteCycleId='',taskName;releaseNamesArr =[];
var createprojectObj = {}; var projectDetails = [];var flag;var projectExists;var updateProjectDetails = []; 
var editedProjectDetails = [];
var deletedProjectDetails = [];
var newProjectDetails = [];
var unAssignedProjects = []; var assignedProjects = [];var projectData =[];var valid = "";
mySPA.controller('adminController', ['$scope', '$http', 'adminServices','$timeout','cfpLoadingBar', function ($scope, $http, adminServices, $timeout, cfpLoadingBar) {
	$("body").css("background","#eee");
	$('.dropdown').on('show.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).slideDown(300);
	});
	$('.dropdown').on('hide.bs.dropdown', function(e){
		$(this).find('.dropdown-menu').first().stop(true, true).slideUp(300);
	});

	$timeout(function(){
		angular.element(document.getElementById("left-nav-section")).scope().getUserRoles();
		angular.element('#userTab').triggerHandler('click');
		cfpLoadingBar.complete()
	}, 500)


	$("#userTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
		angular.element(document.getElementById("left-nav-section")).scope().getUserRoles();
	});

//	Assign Projects Tab Click
	$("#assignProjectTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');

		adminServices.getAllUsers_Nineteen68()
		.then(function (response) {
			if(response == "Invalid Session"){
				window.location.href = "/";
				}
			$("#selAssignUser").empty()
			$("#selAssignUser").append('<option data-id="" value disabled selected>Select User</option>')
			for(i=0; i<response.userIds.length && response.user_names.length; i++){
				if(response.d_roles[i] != "b5e9cb4a-5299-4806-b7d7-544c30593a6e"){
					$("#selAssignUser").append('<option data-id="'+response.userIds[i]+'" value="'+response.user_names[i]+'">'+response.user_names[i]+'</option>')	
				}
			}
			
			//sorting the dropdown values in alphabetical order 
			var selectOptions = $("#selAssignUser option:not(:first)");
			selectOptions.sort(function(a,b) {
				if (a.text > b.text) return 1;
			    else if (a.text < b.text) return -1;
			    else return 0;
			})
			$("#selAssignUser").empty()
			$("#selAssignUser").append('<option data-id="" value disabled selected>Select User</option>');
			for(i=0; i<selectOptions.length;i++){
				$("#selAssignUser").append(selectOptions[i])				
			}
			$("#selAssignUser").prop('selectedIndex', 0);
		}, 		
		function (error) { console.log("Error:::::::::::::", error) })		

		$(document).on('change','#selAssignUser', function() {
			$('#allProjectAP, #assignedProjectAP').empty();
			adminServices.getDomains_ICE()
			.then(function (data) {
				if(data == "Invalid Session"){
				window.location.href = "/";
				}
				if (data == "No Records Found") {
					var domainList = data;
					$('#selAssignProject').empty();
					$('#selAssignProject').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
					for (var i = 0; i < domainList.length; i++) {
						$('#selAssignProject').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
					}
				} else {
					var domainList = data;
					$('#selAssignProject').empty();
					$('#selAssignProject').append($("<option value='' disabled selected>Please Select Your Domain</option>"));
					for (var i = 0; i < domainList.length; i++) {
						$('#selAssignProject').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
					}
				}
				
				//sorting the dropdown values in alphabetical order 
				var selectOptions = $("#selAssignProject option:not(:first)");
				selectOptions.sort(function(a,b) {
					if (a.text > b.text) return 1;
				    else if (a.text < b.text) return -1;
				    else return 0;
				})
				$("#selAssignProject").empty()
				$("#selAssignProject").append('<option data-id="" value disabled selected>Please Select Your Domain</option>');
				for(i=0; i<selectOptions.length;i++){
					$("#selAssignProject").append(selectOptions[i])				
				}
				$("#selAssignProject").prop('selectedIndex', 0);
				
			}, function (error) { console.log("Error:::::::::::::", error) })
		});

		$(document).on('change','#selAssignProject', function() {
			$('#allProjectAP, #assignedProjectAP').empty();
			var domainId = $("#selAssignProject option:selected").val();
			var requestedids = [domainId];
			var domains = [];
			domains.push(domainId);
			//console.log("Domain", domains);
			//var requestedids = domains.push(domainId);
			var idtype=["domaindetails"];
			var userId = $("#selAssignUser option:selected").attr("data-id");

			var getAssignProj = {};
			getAssignProj.domainId = domainId;
			getAssignProj.userId = userId;
			var assignedProjectsArr = [];
			var assignedProjectNames = [];
			var unassignedProjectIds = [];
			var unassignedProjectNames = [];
			var unAssignedProjects = {};
			adminServices.getAssignedProjects_ICE(getAssignProj)
			.then(function (data) {
				if(data == "Invalid Session"){
				window.location.href = "/";
				}
				$('#assignedProjectAP').empty();
				projectData = [];
				projectData = data;
				if(data.length > 0)
				{
					for(var i=0;i<data.length;i++)
					{
						$('#assignedProjectAP').append($("<option value=" +data[i].projectId+ "></option>").text(data[i].projectName));
					}
					for(var j=0;j<projectData.length;j++)
					{
						assignedProjectsArr.push(projectData[j].projectId);
						assignedProjectNames.push(projectData[j].projectName)
					}

					adminServices.getDetails_ICE(idtype,requestedids)
					.then(function (response) {
						if(response == "Invalid Session"){
				window.location.href = "/";
				}
						$('#allProjectAP').empty();
						if(response.projectIds.length > 0)
						{
							for(var k=0;k<response.projectIds.length;k++){
								if(!eleContainsInArray(assignedProjectsArr,response.projectIds[k])){
									unassignedProjectIds.push(response.projectIds[k]);
								}
							}

							for(var l=0;l<response.projectNames.length;l++){
								if(!eleContainsInArray(assignedProjectNames,response.projectNames[l])){
									unassignedProjectNames.push(response.projectNames[l]);
								}
							}

							function eleContainsInArray(arr,element){
								if(arr != null && arr.length >0){
									for(var s=0;s<arr.length;s++){
										if(arr[s] == element)
											return true;
									}
								}
								return false;
							}	
							unAssignedProjects.projectIds =  unassignedProjectIds;
							unAssignedProjects.projectNames =  unassignedProjectNames;
							for(var m=0;m<unAssignedProjects.projectIds.length;m++)
							{
								$('#allProjectAP').append($("<option value=" +unAssignedProjects.projectIds[m]+ "></option>").text(unAssignedProjects.projectNames[m]));
							}
						}						
					}, function (error) { console.log("Error:::::::::::::", error) })
				} 
				else{
					adminServices.getDetails_ICE(idtype,requestedids)
					.then(function (res) {
						if(res == "Invalid Session"){
							window.location.href = "/";
							}
						if(res.projectIds.length > 0)
						{
							$("#assignedProjectAP,#allProjectAP").empty();
							for(var n=0;n<res.projectIds.length;n++)
							{
								$('#allProjectAP').append($("<option value=" +res.projectIds[n]+ "></option>").text(res.projectNames[n]));
							}
						}
					}, function (error) { console.log("Error:::::::::::::", error) })
				}
			}, function (error) { console.log("Error:::::::::::::", error) })
		});

	});

//	Assign Projects Button Click
	$scope.assignProjects = function() {
		unAssignedProjects =[];
		assignedProjects = [];
		$("#selAssignUser,#selAssignProject").removeClass("selectErrorBorder").css('border','1px solid #909090 !important');
		if($('#selAssignUser option:selected').val() == "") {
			$("#selAssignUser").css('border','').addClass("selectErrorBorder");
			return false;
		}
		else if($('#selAssignProject option:selected').val() == "") {
			$("#selAssignProject").css('border','').addClass("selectErrorBorder");
			return false;
		}

		$("#allProjectAP option").each(function() {
			var unassignedProj = {};
			unassignedProj.projectId = $(this).val();
			unassignedProj.projectName = $(this).text();
			unAssignedProjects.push(unassignedProj);
		});

	
		$("#assignedProjectAP option").each(function() {
			var assignedProj = {};
			assignedProj.projectId = $(this).val();
			assignedProj.projectName = $(this).text();
			assignedProjects.push(assignedProj);
		});
		if (assignedProjects.length != 0){
			var domainId = $('#selAssignProject option:selected').val();
			var userDetails = JSON.parse(window.localStorage['_UI']);
			var userId = $("#selAssignUser option:selected").attr("data-id");

			var assignProjectsObj = {};
			assignProjectsObj.domainId = domainId;
			assignProjectsObj.userInfo = userDetails;
			assignProjectsObj.userId = userId;
//			assignProjectsObj.unAssignedProjects = unAssignedProjects;
			assignProjectsObj.assignedProjects = assignedProjects;

			console.log(assignProjectsObj);
			adminServices.assignProjects_ICE(assignProjectsObj)
			.then(function (data) {
					if(data == "Invalid Session"){
							window.location.href = "/";
							}
				if(data == 'success')
				{
					openModelPopup("Assign Projects", "Projects assigned to user successfully");
					resetAssignProjectForm();
				}
				else{
					openModelPopup("Assign Projects", "Failed to assign projects to user");
				}

			}, function (error) { console.log("Error:::::::::::::", error) })

		}
		else {
			openModelPopup("Assign Projects", "Please add project/s");

		}

	};


	$("#projectTab").on('click',function() {
		projectDetails = [];
		updateProjectDetails = [];
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
		$timeout(function(){
			$('.scrollbar-inner').scrollbar();
			$('.scrollbar-macosx').scrollbar();
			toggleCycleClick();
		}, 10)
		adminServices.getDomains_ICE()
		.then(function (data) {
			if(data == "Invalid Session"){
							window.location.href = "/";
							}
			if (data == "No Records Found") {
				var domainList = data;
				$('#selDomain').empty();
				$('#selDomain').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
				for (var i = 0; i < domainList.length; i++) {
					$('#selDomain').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
				}
			} else {
				var domainList = data;
				$('#selDomain').empty();
				$('#selDomain').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
				for (var i = 0; i < domainList.length; i++) {
					$('#selDomain').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
				}
			}
			
			//sorting the dropdown values in alphabetical order 
			var selectOptions = $("#selDomain option:not(:first)");
			selectOptions.sort(function(a,b) {
				if (a.text > b.text) return 1;
			    else if (a.text < b.text) return -1;
			    else return 0;
			})
			$("#selDomain").empty()
			$("#selDomain").append('<option data-id="" value disabled selected>Please Select Your Domain</option>');
			for(i=0; i<selectOptions.length;i++){
				$("#selDomain").append(selectOptions[i])				
			}
			$("#selDomain").prop('selectedIndex', 0);
			
		}, function (error) { console.log("Error:::::::::::::", error) })

	});

	function toggleCycleClick()
	{
		var releaseListLen = $("#releaseList li").length;
		var cyclesListLen = $("#cycleList li").length;
		var releaseSelectedLen = $("li.active").length;
		if(cyclesListLen == 0 && releaseListLen == 0)
		{
			$("#addCycle").addClass('disableAddCycle');
		}
		else if(releaseListLen == 0 || releaseSelectedLen == 0)
		{
			$("#addCycle").addClass('disableAddCycle');
		}
		else{
			$("#addCycle").removeClass('disableAddCycle');
		}
	}

	$("#preferencesTab").on('click',function() {
		$("img.selectedIcon").removeClass("selectedIcon");
		$(this).children().find('img').addClass('selectedIcon');
			setTimeout(function() {
				$("#preferencesTable").find("input[type=checkbox]").each(function() {
					$(this).attr("disabled","disabled");
				});
			}, 50);
			
	});
	

	toggleMenu = function() {
		var elem = document.getElementById("sidebar-wrapper");
		left = window.getComputedStyle(elem,null).getPropertyValue("left");
		// hiding the sidebar
		if(left == "200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="-200px";
			$('#overlay').css('opacity', 0);
			setTimeout(function() {
				$('#overlay').remove();
			}, 300);
		}
		// showing the sidebar
		else if(left == "-200px"){
			document.getElementsByClassName("sidebar-toggle")[0].style.left="200px";
			// adding overlay to darken #page-wrapper and dismiss the left drawer...
			$overlay = $('<div id="overlay" style="position: absolute; height: 100%; width: 100%; top: 0; left: 0; background: rgb(0, 0, 0); opacity: 0; transition: ease-in-out all .3s"></div>');
			$overlay.click(toggleMenu);            
			setTimeout(function() {
				$overlay.css('opacity', .1);
			}, 200);
			$('#page-wrapper').prepend($overlay);
		}
	}
	$("#menu-toggle").click(function(e) {
		e.preventDefault();
		toggleMenu();        
	});

	$("[data-parent]").click(function(e) {
		//console.log('clicked');
		$parent = $($(this).attr('data-parent'));
		actives = $parent.find('.in:not(data-target)'.replace('data-target', $(this).attr('data-target')));
		actives.collapse('hide');
	});

	$scope.create_userCheck = function () {
		$scope.userNameRequired = '';
		$scope.passwordRequired = '';
		$scope.confirmPasswordRequired = '';
		$scope.firstNameRequired = '';
		$scope.lastNameRequired = '';
		$scope.emailRequired = '';
		$scope.roleRequired = '';
		$scope.loadIcon = '';
		$("#userName,#firstName,#lastName,#password,#confirmPassword,#email").removeClass("inputErrorBorder");
		$("#userRoles").removeClass("selectErrorBorder").css('border','1px solid #909090 !important');
		var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		//var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,16}$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if ($("#userName").val() == "") {
			$("#userName").addClass("inputErrorBorder");
		}
		else if ($("#firstName").val() == "") {
			$("#firstName").addClass("inputErrorBorder");
		} else if ($("#lastName").val() == "") {
			$("#lastName").addClass("inputErrorBorder");
		}
		else if ($("#password").val() == "" && $("#password").is(":visible")) {
			$("#password").addClass("inputErrorBorder");
		} 
		else if (regexPassword.test($("#password").val()) == false && $("#password").is(":visible")) {
			openModelPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#password").addClass("inputErrorBorder");
		}
		else if ($("#confirmPassword").val() == "" && $("#confirmPassword").is(":visible")) {
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if (regexPassword.test($("#confirmPassword").val()) == false && $("#confirmPassword").is(":visible")) {
			openModelPopup("Error","Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if($("#password").val() != $("#confirmPassword").val() && $("#password").is(":visible") && $("#confirmPassword").is(":visible")){
			openModelPopup("Error", "Password and Confirm Password did not match");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if ($("#email").val() == "") {
			$("#email").addClass("inputErrorBorder");
		} 
		else if (reg.test($("#email").val()) == false) {
			openModelPopup("Error", "Email address is not valid");
			$("#email").addClass("inputErrorBorder");
			// $scope.emailRequired = 'Email address is not valid';
		} 
		else if($('#userRoles option:selected').val() == "") {
			$("#userRoles").css('border','').addClass("selectErrorBorder");
		} 
		else {
			//role = $('#userRoles option:selected').text();
			var createUser = {};
			createUser.role = $('#userRoles option:selected').val();
			createUser.username = $("#userName").val();
			createUser.password = $("#password").val();
			createUser.confirmPassword = $("#confirmPassword").val();
			createUser.firstName = $("#firstName").val();
			createUser.lastName =  $("#lastName").val();
			createUser.email =  $("#email").val();
			createUser.ldapUser = $(".ldapBtn").hasClass("ldapBtnActive")? true : false;

			adminServices.createUser_Nineteen68(createUser)
			.then(function (data) { 
				if(data == "Invalid Session"){
							window.location.href = "/";
							}
				if (data == "Success") {
					openModelPopup("Create User", "User created successfully");
					resetCreateUser();
				}
				else if (data == "User Exists") {
					openModelPopup("Create User", "User already Exists");
					resetCreateUser();
				}
				else {
					openModelPopup("Create User", "Failed to create user");
					resetCreateUser();
				}
			}, function (error) { console.log("Error:::::::::::::", error) })
		}
	};

	//LDAP Functionality for Create User
	$(document).on("click", ".ldapBtn", function(){
		$(this).toggleClass("ldapBtnActive");
		if($(this).hasClass("ldapBtnActive")){
			$("#password").parent().hide();
			$("#confirmPassword").parent().hide();
		}else{
			$("#password").parent().show();
			$("#confirmPassword").parent().show();
		}
	})

	//Get User Roles in the select container
	$scope.getUserRoles = function () {	//Yes---------------------------------
		$("#passwordIcon").parent().show()
		adminServices.getUserRoles_Nineteen68()
		.then(function (response) {
			if(response == "Invalid Session"){
							window.location.href = "/";
							}
			userRoleArrayList = response.userRoles;
			var getDropDown;
			// if (getTab == "create") {
			getDropDown = $('#userRoles');
			//  }
			//  else if (getTab == "edit") {
			//      getDropDown = $('#userRolesED');
			//  }
			getDropDown.empty();
			getDropDown.append('<option value=""selected>Select User Role</option>');
			for (var i = 0; i < userRoleArrayList.length; i++) {
				getDropDown.append($("<option value=" + response.r_ids[i] + "></option>").text(userRoleArrayList[i]));
			}
			window.localStorage['_R'] = response.r_ids;
		}, function (error) { console.log("Error:::::::::::::", error) })
	};

	// Create Project Action
	$scope.create_project = function () {
		$("#selDomain").removeClass("selectErrorBorder");
		$("#projectName").removeClass("inputErrorBorder");
		if($('#selDomain option:selected').val() == "")
		{
			$("#selDomain").addClass("selectErrorBorder");
		}
		else if($("#projectName").val() == "")
		{
			$("#projectName").addClass("inputErrorBorder");
		}
		else if($(".projectTypeSelected").length == 0)
		{
			openModelPopup("Create Project", "Please select Application Type");
		}
		else if($("#releaseList").children("li").length == 0)
		{
			openModelPopup("Create Project", "Please add atleast one release");
		}
		/*else if($("#cycleList").children("li").length == 0)
		{
			openModelPopup("Update Project", "Failed. does not contain cycle");
		}*/
		else{
			var proceedToCreate = true;
			var relNames ="";
			for(i=0; i<projectDetails.length; i++){
				if(projectDetails[i].cycleNames.length <= 0){
					relNames = i > 0? relNames + ", " + projectDetails[i].releaseName : relNames + projectDetails[i].releaseName;
					proceedToCreate = false;
					//break;
				}
			}
			if(proceedToCreate == false){
				openModelPopup("Update Project", "Please add atleast one cycle for release: "+relNames);				
			}
			else if(proceedToCreate == true){
				projectExists = false;
				var requestedids = [];
				var idtype = [];
				checkCycle(flag);
				if(valid == "false")
				{
					return false;
				}
				else{

					if($('#selDomain option:selected').val() != "")
					{
						requestedids.push($('#selDomain option:selected').val());
						idtype.push('domainsall');
						var proceeed = false;
						adminServices.getNames_ICE(requestedids,idtype)
						.then(function (response) {
						if(response == "Invalid Session"){
							  window.location.href = "/";
							}
							if(response == "No Projects"){
								proceeed = true;
							}							
							else if(response.projectNames.length > 0)
							{
								for(var i=0;i<response.projectNames.length;i++)
								{
									if($("#projectName").val() == response.projectNames[i])
									{
										openModelPopup("Create Project", "Project Name already Exists");
										projectExists = true;
										return false;
									}
									else proceeed = true;

								}
							}
							else{
								openModelPopup("Create Project", "Failed to create project");
								return false;
							}
							if(proceeed == true){
								var userDetails = JSON.parse(window.localStorage['_UI']);
								createprojectObj.domainId =  $('#selDomain option:selected').val();
								createprojectObj.projectName = $.trim($("#projectName").val());
								createprojectObj.appType = $(".projectTypeSelected").attr('data-app');
								createprojectObj.projectDetails = projectDetails;
								console.log("Controller: " + createprojectObj);
								adminServices.createProject_ICE(createprojectObj,userDetails)
								.then(function (response) {
									if(response == "Invalid Session"){
							  window.location.href = "/";
							}
									if(response == 'success')
									{
										openModelPopup("Create Project", "Project created successfully");
										resetForm();
										projectDetails = [];
									}
									else{
										openModelPopup("Create Project", "Failed to create project");
										resetForm();
									}
								}, function (error) { console.log("Error:::::::::::::", error) })
							}
						}, function (error) { console.log("Error:::::::::::::", error) })
					}
				}
			}
			else{
				openModelPopup("Create Project", "Please add atleast one cycle for a release");
			}
		}
	};

	function checkCycle(flag)
	{
		$("#releaseList li").each(function() {
			for(var i=0;i<projectDetails.length;i++)
			{
				if($(this).children('span.releaseName').text() == projectDetails[i].releaseName)
				{
					if(projectDetails[i].cycleNames.length == 0)
					{
						openModelPopup("Create Project", "Please add atleast one cycle for a release");

						valid = "false";
						return flag;
					}
				}
			}
		});
	}

	//Update Project Action
	$scope.update_project = function () {		
		$("#selDomainEdit,#selProject").removeClass("selectErrorBorder");
		if($('#selDomainEdit option:selected').val() == "")
		{
			$("#selDomainEdit").addClass("selectErrorBorder");
		}
		else if($('#selProject option:selected').val() == "")
		{
			$("#selProject").addClass("selectErrorBorder");
		}
		else if($("#releaseList").children("li").length == 0)
		{
			openModelPopup("Update Project", "Please add atleast one release");
		}
		else if($("#cycleList").children("li").length == 0)
		{
			openModelPopup("Update Project", "Please add atleast one cycle for a release");
		}
		else{
			flag = false;

			if(flag == true)
			{
				return false;
			}
			else{
				//Update project details json with editedProjectDetails, deletedProjectDetails, newProjectDetails
				updateProjectObj = {};
				var userDetails = JSON.parse(window.localStorage['_UI']);
				updateProjectObj.projectId = $('#selProject option:selected').val();
				updateProjectObj.projectName =  $('#selProject option:selected').text();
				updateProjectObj.appType = $(".projectTypeSelected").attr('data-app');
				updateProjectObj.editedProjectDetails = "";
				updateProjectObj.deletedProjectDetails = "";
				updateProjectObj.newProjectDetails = "";

				if(updateProjectObj.editedProjectDetails.length <= 0)
					updateProjectObj.editedProjectDetails = editedProjectDetails;
				else	updateProjectObj.editedProjectDetails.push(editedProjectDetails);

				if(updateProjectObj.deletedProjectDetails.length <= 0)
					updateProjectObj.deletedProjectDetails = deletedProjectDetails;
				else	updateProjectObj.deletedProjectDetails.push(deletedProjectDetails);

				var proceedFlag = true;
				if(newProjectDetails.length > 0){
					var relName="";
					for(i=0;i<newProjectDetails.length;i++){
						if(newProjectDetails[i].cycleDetails.length > 0){
							proceedFlag = true;
						}
						else{
							relName = i > 0? relName + ", " + newProjectDetails[i].releaseName : relName + newProjectDetails[i].releaseName;
							proceedFlag = false;
						}
					}
					if(proceedFlag == false){						
						openModelPopup("Update Project", "Please add atleast one cycle for release: "+relName);
						return false;
					}
				}
				if(proceedFlag==true){
					if(updateProjectObj.newProjectDetails.length <= 0)
						updateProjectObj.newProjectDetails = newProjectDetails;
					else	updateProjectObj.newProjectDetails.push(newProjectDetails);
					//updateProjectObj.updateProjectDetails = releaseCycleDetails;


					adminServices.updateProject_ICE(updateProjectObj, userDetails)
					.then(function (response) {
						if(response == "Invalid Session"){
							  window.location.href = "/";
							}
						clearUpdateProjectObjects();
						if(response == 'success')
						{
							//Clearing old data from updateProject object

							openModelPopup("Update Project", "Project updated successfully");
							$timeout(function(){
								$("#projectTab").trigger("click");
								$(".adminActionBtn button:nth-child(1)").trigger("click");
							},200);
							resetForm();
						}

						else{
							openModelPopup("Update Project", "Failed to update project");
							resetForm();
						}
					}, function (error) { console.log("Error:::::::::::::", error) })
				}
			}

		}
	};

	function resetCreateUser()
	{
		$("#userName,#firstName,#lastName,#password,#confirmPassword,#email").val("");
		$("#userRoles").prop('selectedIndex', 0);
	}

	function resetUpdateUser()
	{
		$("#userSelect,#userRoles").prop('selectedIndex', 0);
		$("#firstName,#lastName,#password,#confirmPassword,#email").val("");
	}

	function resetForm()
	{
		$("#selDomain").prop('selectedIndex', 0);
		$("#projectName").val("");
		$("div.projectTypeSelected").removeClass("projectTypeSelected");
		$("#releaseList li, #cycleList li").remove();
		toggleCycleClick();
	}
	function resetAssignProjectForm()
	{
		$("#selAssignUser, #selAssignProject").prop('selectedIndex', 0);
		$("#allProjectAP,#assignedProjectAP,#selAssignProject").empty();
		$("#selAssignProject").append('<option data-id="" value disabled selected>Please Select your domain</option>') 
	}

	//Add Release Name Functionality
	$(document).on("click", "#addRelease", function(){
		flag = false;
		//$("#addReleaseNameModal").modal("show");
		openEditGlobalModel("Add Release","releaseTxt","Add Release Name","addReleaseName")
		$("#releaseTxt").removeClass("inputErrorBorder");
		//$("#releaseTxt").focus();
		/*$('#addReleaseNameModal').on('shown.bs.modal', function () {
			$('#releaseTxt').focus();
		});*/
		$("#releaseTxt").val('');
		var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
			$(document).on('click', "#addReleaseName", function(e) {
				e.preventDefault();
				if($("#releaseTxt").val() == "")
				{
					$("#releaseTxt").addClass('inputErrorBorder');
					return false;
				}
				else if(!reg.test($("#releaseTxt").val()))
				{
					$("#releaseTxt").addClass('inputErrorBorder');
					$("#releaseTxt").val('');
					return false;
				}
				else{
					$("#releaseTxt").removeClass('inputErrorBorder');
					$("#releaseList li").each(function() {
						if($(this).children('span.releaseName').text() == $("#releaseTxt").val())
						{
							$(".close:visible").trigger('click');
							openModelPopup("Add Release", "Release Name already exists");
							flag = true;
						}
					});
					if(flag == true)
					{
						return false;
					}
					releaseName = $("#releaseTxt").val();

					taskName = $("#page-taskName").children("span").text();
					$(".close:visible").trigger('click');
					if(taskName == "Create Project")
					{
						$("#releaseList").append("<li id='releaseList_"+count+"'><img src='imgs/ic-release.png' /><span title="+releaseName+" class='releaseName'>"+releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+count+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+count+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						$("#releaseList li:last").trigger('click');
						//releaseNamesArr.push(releaseName);
						var releCycObj = {
								"releaseName" : '',
								"cycleNames" : []
						};
						releCycObj.releaseName = releaseName;
						projectDetails.push(releCycObj);
						toggleCycleClick();
						count++;
					}
					if(taskName == "Update Project")
					{
						var createNewRelCyc = {
								"releaseName": "",
								"newStatus" : true,
								"cycleDetails": []
						}
						count = $("#releaseList li").length;
						$("#releaseList").append("<li class='createRelease' id='releaseList_"+count+"'><img src='imgs/ic-release.png' /><span title="+releaseName+" class='releaseName'>"+releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+count+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+count+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
						/*releCycObj = {};
						releCycObj.releaseName = releaseName;
						releCycObj.releaseId = "";
						releCycObj.cycleDetails = [];
						updateProjectDetails.push(releCycObj);*/
						//for update project json
						createNewRelCyc.releaseName = releaseName;
						newProjectDetails.push(createNewRelCyc);					
						toggleCycleClick();
						$("#releaseList li#releaseList_"+count+"").trigger('click');
						count++;
					}
					e.stopImmediatePropagation();
				}
			})
	});

	$(document).on('click',"#releaseList li",function() {
		$("li.active").removeClass("active");
		$(this).addClass("active");
	});

	$(document).on('click',"#cycleList li",function() {
		$("li.cycleList").removeClass("cycleList");
		$(this).addClass("cycleList");
	});

	//Add Cycle Name Functionality
	$(document).on("click","#addCycle", function(e){
		e.preventDefault();
		flag = false;
		//$("#addCycleNameModal").modal("show");
		openEditGlobalModel("Add Cycle","cycleTxt","Add Cycle Name","addCycleName")
		$("#cycleTxt").removeClass('inputErrorBorder');
		/*$('#addCycleNameModal').on('shown.bs.modal', function () {
			$('#cycleTxt').focus();
		});*/
		$("#cycleTxt").val('');
		$(document).on('click', "#addCycleName", function(e) {
			var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
			var relName = $("#releaseList li.active .releaseName").text();
			e.preventDefault();
			$("#cycleTxt").removeClass("inputErrorBorder");
			if($("#cycleTxt").val() == "")
			{
				$("#cycleTxt").addClass('inputErrorBorder');
				return false;
			}
			else if(!reg.test($("#cycleTxt").val()))
			{
				$("#cycleTxt").addClass('inputErrorBorder');
				$("#cycleTxt").val('');
				return false;
			}
			else{
				$("#cycleList li:visible").each(function() {
					if($(this).children('span.cycleName').text() == $("#cycleTxt").val())
					{
						$(".close:visible").trigger('click');
						openModelPopup("Add Cycle", "Cycle Name already exists for this release");
						flag = true;
					}
				});
				if(flag == true)
				{
					return false;
				}
				$("#cycleTxt").removeClass('inputErrorBorder');
				cycleName = $("#cycleTxt").val();

				$(".close:visible").trigger('click');
				$("#cycleList li.cycleList").removeClass("cycleList");
				taskName = $("#page-taskName").children("span").text();
				if(taskName == "Create Project")
				{
					$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span title="+cycleName+" class='cycleName'>"+cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+delCount+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+delCount+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
					for(i=0;i<projectDetails.length;i++)
					{
						if(projectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
						{
							projectDetails[i].cycleNames.push(cycleName);	
						}
					}
					/*for(i=0;i<releaseNamesArr.length;i++)
					{
						//console.log("selRelease", releaseNamesArr[i]);
						//console.log("activeRel", $("li.active").children('span.releaseName').text());
						if(releaseNamesArr[i] == $("li.active").children('span.releaseName').text())
						{
							for(var j=0;j<projectDetails.length;j++)
							{
								if('releaseName' in projectDetails[j])
								{
									if(releaseNamesArr[i] == projectDetails[j].releaseName)
									{
										var cycleArr =[];
										//this line is for releases which already have at least 1 cycle
										if('cycleNames' in projectDetails[j])
										{
											cycleArr = projectDetails[j].cycleNames;
										}
										cycleArr.push(cycleName);
										projectDetails[j].cycleNames = cycleArr;
									}
								}
							}	
						}
					}*/
					toggleCycleClick();
					delCount++;
				}

				if(taskName == "Update Project")
				{
					var createNewRelCyc = {
							"releaseName": "",
							"releaseId" : "",
							"newStatus" : false,
							"cycleDetails": []
					}
					var createCyc = {
							"cycleName": "",
							"newStatus": true
					}
					delCount = (delCount +1) * 3;
					$("#cycleList").append("<li class='cycleList createCycle'><img src='imgs/ic-cycle.png' /><span title="+cycleName+" class='cycleName'>"+cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+delCount+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+delCount+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
					/*for(var i=0;i<updateProjectDetails.length;i++)
					{
						if(updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
						{
							if('releaseName' in updateProjectDetails[i])
							{
								var cycleArr =[];
								//this line is for releases which already have at least 1 cycle
								if('cycleDetails' in updateProjectDetails[i])
								{
									cycleArr=updateProjectDetails[i].cycleDetails;
								}
								cycleArr.push(cycleName);
								updateProjectDetails[i].cycleDetails = cycleArr;
							}
						}
					}*/
					var RelID = $("li.active").children('span.releaseName').data("releaseid");
					//For update project json
					if(newProjectDetails.length <= 0){
						createNewRelCyc.releaseName = relName;
						createNewRelCyc.releaseId = RelID;
						createCyc.cycleName = cycleName;
						createNewRelCyc.cycleDetails.push(createCyc)
						newProjectDetails.push(createNewRelCyc);
					}
					else{
						var chk = true;
						for(j=0; j<newProjectDetails.length; j++){
							if(newProjectDetails[j].releaseName == relName && newProjectDetails[j].releaseId == RelID){
								createCyc.cycleName = cycleName;
								newProjectDetails[j].cycleDetails.push(createCyc);
								chk = false;
								break;
							}
						}
						if(chk == true){
							createNewRelCyc.releaseName = relName;
							createNewRelCyc.releaseId = RelID;
							createCyc.cycleName = cycleName;
							createNewRelCyc.cycleDetails.push(createCyc)
							newProjectDetails.push(createNewRelCyc);
						}
					}
					toggleCycleClick();
					delCount++;
				}
				e.stopImmediatePropagation();
			}
		})
	})


	$(document).on('click','[id^=releaseList]',function(e) {
		if ($("#releaseList li").length == 0)
		{
			$("#cycleList li").remove();
			updateProjectDetails = [];
		}
		toggleCycleClick();
		showHideEditDeleteIcons();
		var id = e.target.id;
		id = "#".concat(e.target.id);
		taskName = $("#page-taskName").children("span").text();
		if(taskName == "Create Project")
		{
			if(id.indexOf("edit") != 0 )
			{
				if(id.indexOf("delete") != 0)
				{
					var releaseName = $("li.active").children('span.releaseName').text();
					$("#cycleList li").remove();
					if(projectDetails.length > 0)
					{
						for(var i=0;i<projectDetails.length;i++)
						{
							if(projectDetails[i].releaseName == releaseName && 'cycleNames' in projectDetails[i])
							{
								for(var j=0;j<projectDetails[i].cycleNames.length;j++)
								{
									$("#cycleList").append("<li><img src='imgs/ic-cycle.png' /><span title="+projectDetails[i].cycleNames[j]+" class='cycleName'>"+projectDetails[i].cycleNames[j]+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
								}
							}
						}
					}
				}
			}
		}

		if(taskName == "Update Project")
		{
			if(id.indexOf("edit") != 1)
			{
				if(id.indexOf("delete") != 1 )
				{
					var releaseName = $("li.active").children('span.releaseName').text();
					$("#cycleList li").remove();
					//Check Release details if already exist
					if(updateProjectDetails.length > 0)
					{
						for(var i=0;i<updateProjectDetails.length;i++)
						{
							if(updateProjectDetails[i].releaseName == releaseName && 'cycleDetails' in updateProjectDetails[i])
							{
								for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
								{
									var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
									if(objectType == "object")
									{
										$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title="+updateProjectDetails[i].cycleDetails[j].cycleName+" data-cycleid="+updateProjectDetails[i].cycleDetails[j].cycleId+" class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									}
									if(objectType == "string")
									{
										$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title="+updateProjectDetails[i].cycleDetails[j]+"  class='cycleName'>"+updateProjectDetails[i].cycleDetails[j]+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									}
									// if($("li.active").hasClass("updateRelease"))
									// {
									// 	$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									// }
									// else{
									// 	$("#cycleList").append("<li class='createCycle'><img src='imgs/ic-cycle.png' /><span class='cycleName'>"+updateProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									// }
								}
							}
						}
					}
					
					//Check Release details if newly added
					if(newProjectDetails.length > 0)
					{
						for(var i=0;i<newProjectDetails.length;i++)
						{
							if(newProjectDetails[i].releaseName == releaseName && 'cycleDetails' in newProjectDetails[i])
							{
								for(var j=0;j<newProjectDetails[i].cycleDetails.length;j++)
								{
									var objectType = typeof(newProjectDetails[i].cycleDetails[j]);
									if(objectType == "object")
									{
										$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title="+newProjectDetails[i].cycleDetails[j].cycleName+" data-cycleid="+newProjectDetails[i].cycleDetails[j].cycleId+" class='cycleName'>"+newProjectDetails[i].cycleDetails[j].cycleName+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									}
									if(objectType == "string")
									{
										$("#cycleList").append("<li class='updateCycle'><img src='imgs/ic-cycle.png' /><span title="+newProjectDetails[i].cycleDetails[j]+"  class='cycleName'>"+newProjectDetails[i].cycleDetails[j]+"</span><span class='actionOnHover'><img id=editCycleName_"+j+" title='Edit Cycle Name' src='imgs/ic-edit-sm.png' class='editCycleName'><img id=deleteCycleName_"+j+" title='Delete Cycle' src='imgs/ic-delete-sm.png' class='deleteCycle'></span></li>");
									}
								}
							}
						}
					}
				}
			}
		}

	});

	var editRelid;
	//Edit Release Name Functionality
	$(document).on("click", "[id^=editReleaseName_]", function(e){
		//$("#editReleaseNameModal").modal("show");
		openEditGlobalModel("Edit Release Name","releaseName","Enter New Release Name","updateReleaseName")
		var existingReleaseName = $(this).parents("li").children(".releaseName").text()
		$("#releaseName").val(existingReleaseName);
		editReleaseId = e.target.id;
		editRelid = e.target.parentElement.previousSibling.dataset.releaseid;
		if(e.target.id != "releaseName")
		{
			$("#releaseName").removeClass("inputErrorBorder");
			$('#editReleaseNameModal').on('shown.bs.modal', function () {
				$('#releaseName').focus();
			});
			var existingReleaseName = $(this).parents("li").children(".releaseName").text()
			releaseName = $("#releaseName").val(existingReleaseName);
			//Save edited release name
			$(document).on('click', '#updateReleaseName', function(event) {
				var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
					if($("#releaseName").val() == "")
					{
						$("#releaseName").addClass('inputErrorBorder');
						return false;
					}
					else if(!reg.test($("#releaseName").val()))
					{
						$("#releaseName").addClass('inputErrorBorder');
						$("#releaseName").val('');
						return false;
					}
					else{
						$("#releaseName").removeClass('inputErrorBorder');
						releaseName = $("#releaseName").val();
						taskName = $("#page-taskName").children("span").text();
						if(taskName == "Create Project")
						{
							$(".close:visible").trigger('click');
							var index = '';
							index = $('li.active').index();
							$("#"+editReleaseId).parent().prev('span').text($("#releaseName").val());
							$("#"+editReleaseId).parent().prev('span')[0].setAttribute("title", $("#releaseName").val());
							//console.log("projectDetails", projectDetails);
							for(var i=0;i<projectDetails.length;i++)
							{
								if(i == index)
								{
									projectDetails[i].releaseName = $("#releaseName").val();
								}
							}
						}
						else if(taskName == "Update Project")
						{
							for(i=0; i<updateProjectDetails.length; i++){
								if($("#releaseName").val().trim() == updateProjectDetails[i].releaseName){
									$(".close:visible").trigger('click');
									openModelPopup("Edit Release Name", "Release Name already exists");
									return false;
								}
							}
							$(".close:visible").trigger('click');
							var index = '';
							index = $('li.active').index();
							var oldRelText = $("#"+editReleaseId).parent().prev('span').text();
							$("#"+editReleaseId).parent().prev('span').text($("#releaseName").val());
							$("#"+editReleaseId).parent().prev('span')[0].setAttribute("title", $("#releaseName").val());
							var newReleaseTxt = $("li.active").children("span.releaseName").text();
							for(var i=0;i<updateProjectDetails.length;i++)
							{
								if(i == index)
								{
									var editRelCyc = {
											"releaseId": "",
											"releaseName": "",
											"oldreleaseName" :"",
											"cycleDetails": [],
											"editStatus": false
									}
									updateProjectDetails[i].releaseName = $("#releaseName").val();
									//For update project json
									if(editedProjectDetails.length <= 0){
										editRelCyc.releaseId = editRelid;//updateProjectDetails[i].releaseId;
										editRelCyc.releaseName = $("#releaseName").val();//updateProjectDetails[i].releaseName;
										editRelCyc.oldreleaseName = oldRelText;
										editRelCyc.editStatus = true;
										editedProjectDetails.push(editRelCyc)
									}
									else{
										var chkPresent = true;
										for(m=0; m<editedProjectDetails.length; m++){
											if(editedProjectDetails[m].releaseId == editRelid/*updateProjectDetails[i].releaseId*/){
												editedProjectDetails[m].releaseName = $("#releaseName").val();//updateProjectDetails[i].releaseName;
												editedProjectDetails[m].oldreleaseName = oldRelText;
												editedProjectDetails[m].editStatus = true;
												chkPresent = false;
												break;
											}
										}
										if(chkPresent == true){
											editRelCyc.releaseId = editRelid;//updateProjectDetails[i].releaseId;
											editRelCyc.releaseName = $("#releaseName").val();//updateProjectDetails[i].releaseName;
											editRelCyc.oldreleaseName = oldRelText;
											editRelCyc.editStatus = true;
											editedProjectDetails.push(editRelCyc)
										}
									}
									//For update project json
								}
							}
						}
						//$("#"+editReleaseId).addClass("editedRelease");
						//$("#"+editReleaseId).siblings(".deleteRelease").addClass("editedRelease");
						event.stopImmediatePropagation();
					}
			})
			e.stopImmediatePropagation();
		}
	});

	var deleteRelid;
	//Delete Release Functionality
	$(document).on("click","[id^=deleteReleaseName_]", function(e){
		$("#deleteReleaseModal").modal("show");
		deleteReleaseId = e.target.id;
		deleteRelid = e.target.parentElement.previousSibling.dataset.releaseid;
		//deleteRelname = e.target.parentElement.previousSibling.innerHTML;
		$("#deleteReleaseYes").on('click',function(event) {
			$("#deleteReleaseModal").modal("hide");
			taskName = $("#page-taskName").children("span").text();
			var goahead = false;
			if(taskName == "Create Project")
			{
				if($("#cycleList li").length > 0){
					openModelPopup("Delete Release", "Release contains cycles. Cannot delete");
				}
				else{
					for(var i=0;i<projectDetails.length;i++)
					{
						if(projectDetails[i].releaseName == $("#"+deleteReleaseId).parent().prev('span.releaseName').text())
						{
							delete projectDetails[i];
							goahead = true;
							projectDetails = projectDetails.filter(function(n){ return n != undefined });
						}
					}					
				}
			}
			else if(taskName == "Update Project")
			{
				if($("#cycleList").find(".updateCycle").length > 0){
					openModelPopup("Delete Release", "Release contains cycles. Cannot delete");
				}
				else{
					for(var i=0;i<updateProjectDetails.length;i++)
					{
						if(updateProjectDetails[i].releaseName == $("#"+deleteReleaseId).parent().prev('span.releaseName').text())
						{
							var deleteRelCyc = {
									"releaseName": "",
									"releaseId": "",
									"cycleDetails": [],
									"deleteStatus": false
							}
							//For update project json
							if(deletedProjectDetails.length <= 0){
								deleteRelCyc.releaseName = $("#"+deleteReleaseId).parent().prev('span.releaseName').text();//updateProjectDetails[i].releaseName;
								deleteRelCyc.releaseId = deleteRelid;//updateProjectDetails[i].releaseId
								deleteRelCyc.deleteStatus = true;
								deletedProjectDetails.push(deleteRelCyc);
							}
							else{
								var chkRelease = true;
								for(j=0; j<deletedProjectDetails.length; j++){
									if(deletedProjectDetails[j].releaseId == deleteRelid/*updateProjectDetails[i].releaseId*/){
										deletedProjectDetails[j].releaseName = $("#"+deleteReleaseId).parent().prev('span.releaseName').text();//updateProjectDetails[i].releaseName;
										deletedProjectDetails[j].deleteStatus = true;
										chkRelease = false;
										break;
									}
								}
								if(chkRelease == true){
									deleteRelCyc.releaseName = $("#"+deleteReleaseId).parent().prev('span.releaseName').text();//updateProjectDetails[i].releaseName;
									deleteRelCyc.releaseId = deleteRelid;//updateProjectDetails[i].releaseId
									deleteRelCyc.deleteStatus = true;
									deletedProjectDetails.push(deleteRelCyc);
								}
							}
							//For update project json

							delete updateProjectDetails[i];
							$("#cycleList li").remove();
							updateProjectDetails = updateProjectDetails.filter(function(n){ return n != undefined });
						}
					}
					goahead = true;
				}
			}
			if(goahead){
				$("#"+deleteReleaseId).parent().parent("li").remove();
				$("#releaseList li:last").trigger('click');
				openModelPopup("Delete Release", "Release deleted successfully");
				toggleCycleClick();				
			}
			event.stopImmediatePropagation();
		});
		//}
	})

	var editCycId;
	//Edit Cycle Name Functionality
	$(document).on("click", "[id^=editCycleName_]", function(e){
		//$("#editCycleNameModal").modal("show");
		openEditGlobalModel("Edit Cycle Name","cycleName","Enter New Cycle Name","updateCycleName")
		var existingCycleName = $(this).parents("li").children(".cycleName").text()
		$("#cycleName").val(existingCycleName)
		editCycleId = e.target.id;
		editCycId = e.target.parentElement.previousSibling.dataset.cycleid;
		if(e.target.id != "cycleName")
		{
			$("#cycleName").removeClass("inputErrorBorder");
			/*$('#editCycleNameModal').on('shown.bs.modal', function () {
					$('#cycleName').focus();
				});*/
			var existingCycleName = $(this).parents("li").children(".cycleName").text()
			cycleName = $("#cycleName").val(existingCycleName);
			$('#cycleName').focus();
			//Edit cycle name save button
			$(document).on('click', '#updateCycleName', function(event) {
				var reg = /^[a-zA-Z0-9\s\.\-\_]+$/
					if($("#cycleName").val() == "")
					{
						$("#cycleName").addClass('inputErrorBorder');
						return false;
					}
					else if(!reg.test($("#cycleName").val()))
					{
						$("#cycleName").addClass('inputErrorBorder');
						$("#cycleName").val('');
						return false;
					}
					else{
						var relID = $("li.active").children('span.releaseName').data("releaseid");
						for(i=0; i<updateProjectDetails.length; i++){
							if(relID == updateProjectDetails[i].releaseId){
								for(j=0; j<updateProjectDetails[i].cycleDetails.length; j++){
									if($("#cycleName").val().trim() == updateProjectDetails[i].cycleDetails[j].cycleName){
										$(".close:visible").trigger('click');
										openModelPopup("Edit Cycle Name", "Cycle Name already exists");
										return false;
									}
								}
								break;
							}
						}
						$("#cycleName").removeClass('inputErrorBorder');
						cycleName = $("#cycleName").val();

						$(".close:visible").trigger('click');
						taskName = $("#page-taskName").children("span").text();
						if(taskName == "Create Project")
						{
							$("#"+editCycleId).parent().prev('span').text($("#cycleName").val());
							$("#"+editCycleId).parent().prev('span')[0].setAttribute("title", $("#cycleName").val());
							var cycleIndex = '';
							cycleIndex = $('li.cycleList').index();
							for(var i=0;i<projectDetails.length;i++)
							{
								if(projectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
								{
									for(var j=0;j<projectDetails[i].cycleNames.length;j++)
									{
										if(j == cycleIndex)
										{
											projectDetails[i].cycleNames[j] = $("#cycleName").val();
										}
									}
								}
							}
						}
						else if(taskName == "Update Project")
						{
							var oldCycText = $("#"+editCycleId).parent().prev('span').text();
							$("#"+editCycleId).parent().prev('span').text($("#cycleName").val());
							$("#"+editCycleId).parent().prev('span')[0].setAttribute("title", $("#cycleName").val());
							var cycleIndex = '';
							cycleIndex = $('li.cycleList').index();
							for(var i=0;i<updateProjectDetails.length;i++)
							{
								if(updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text())
								{
									for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
									{
										var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
										if(objectType == "object" && j == cycleIndex && (updateProjectDetails[i].releaseName == $("li.active").children('span.releaseName').text()) && (updateProjectDetails[i].cycleDetails[j].cycleId == editCycId))
										{
											var editRelCyc = {
													"releaseId": "",
													"releaseName": "",
													"oldreleaseName" :"",
													"cycleDetails": [],
													"editStatus": false
											}
											var editCycle = {
													"oldCycleName": "",
													"cycleName": "",
													"cycleId": "",
													"editStatus":  false
											}
											//console.log("objectType", typeof(updateProjectDetails[i].cycleDetails[j]))
											updateProjectDetails[i].cycleDetails[j].cycleName = $("#cycleName").val();

											//For update project json
											if(editedProjectDetails.length <= 0){
												//building release details
												editRelCyc.releaseId = relID;//updateProjectDetails[i].releaseId;
												editRelCyc.releaseName = $("li.active").children('span.releaseName').text();//updateProjectDetails[i].releaseName;												
												//building cycle details with release
												editCycle.oldCycleName = oldCycText;
												editCycle.cycleName = $("#cycleName").val();//updateProjectDetails[i].cycleDetails[j].cycleName;
												editCycle.cycleId = editCycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
												editCycle.editStatus = true;
												editRelCyc.cycleDetails.push(editCycle)
												//pushing all data to an array
												editedProjectDetails.push(editRelCyc)
											}
											else {
												var chkRelPresent = true;
												for(m=0; m<editedProjectDetails.length; m++){
													if(editedProjectDetails[m].releaseId == relID/*updateProjectDetails[i].releaseId*/){
														var chkcycinrel = true;
														for(n=0; n<editedProjectDetails[m].cycleDetails.length; n++){
															if(editedProjectDetails[m].cycleDetails[n].cycleId == editCycId/*updateProjectDetails[i].cycleDetails[j].cycleId*/){
																editedProjectDetails[m].cycleDetails[n].cycleName = $("#cycleName").val();//updateProjectDetails[i].cycleDetails[j].cycleName;
																editedProjectDetails[m].cycleDetails[n].oldCycleName = oldCycText;
																editedProjectDetails[m].cycleDetails[n].editStatus = true;
																chkcycinrel = false;
																break;
															}
														}
														if(chkcycinrel == true){
															//building cycle details with release
															editCycle.oldCycleName = oldCycText;
															editCycle.cycleName = $("#cycleName").val();//updateProjectDetails[i].cycleDetails[j].cycleName;
															editCycle.cycleId = editCycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
															editCycle.editStatus = true;
															editedProjectDetails[m].cycleDetails.push(editCycle);
															break;															
														}
														chkRelPresent = false;
													}
												}
												if(chkRelPresent == true){
													//building release details
													editRelCyc.releaseId = relID;//updateProjectDetails[i].releaseId;
													editRelCyc.releaseName = $("li.active").children('span.releaseName').text();//updateProjectDetails[i].releaseName;
													//building cycle details with release
													editCycle.oldCycleName = oldCycText;
													editCycle.cycleName = $("#cycleName").val();//updateProjectDetails[i].cycleDetails[j].cycleName;
													editCycle.cycleId = editCycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
													editCycle.editStatus = true;
													editRelCyc.cycleDetails.push(editCycle)
													//pushing all data to an array
													editedProjectDetails.push(editRelCyc)
												}
											}
											break;
										}
										//For update project json									
										if(objectType == "string" && j == cycleIndex){
											updateProjectDetails[i].cycleDetails[j] =  $("#cycleName").val();
										}											
									}
								}
							}
						}
						//$("#"+editCycleId).addClass("editedCycle");
						//$("#"+editCycleId).siblings(".deleteCycle").addClass("editedCycle");
						event.stopImmediatePropagation();
						$("#"+event.target.id).unbind('click');
					}
			});
		}
	});

	var cycId;
	//Delete Cycle Functionality
	$(document).on("click", "[id^=deleteCycleName_]", function(e){
		$("#deleteCycleModal").modal("show");
		deleteCycleId = e.target.id;
		var cycName = $(this).parent().siblings(".cycleName").text();
		cycId = $(this).parent().siblings(".cycleName").attr("data-cycleid");
		$("#deleteCycleYes").on('click',function(event) {
			var CycleID = [];
			CycleID.push(cycId);
			$("#deleteCycleModal").modal("hide");
			//console.log(projectDetails);
			taskName = $("#page-taskName").children("span").text();
			var goahead = false;
			if(taskName == "Create Project")
			{
				for(var i=0;i<projectDetails.length;i++)
				{
					for(var j=0;j<projectDetails[i].cycleNames.length;j++)
					{
						if((projectDetails[i].cycleNames[j] == $("#"+deleteCycleId).parent().prev('span.cycleName').text()) && (projectDetails[i].releaseName == $("li.active").children('span.releaseName').text()))
						{
							delete projectDetails[i].cycleNames[j];
							projectDetails[i].cycleNames =  projectDetails[i].cycleNames.filter(function(n){ return n != null });
							goahead = true;
						}
					}
				}
				if(goahead == true){
					$("#"+deleteCycleId).parent().parent("li").remove();
					openModelPopup("Delete Cycle", "Cycle deleted successfully");
					toggleCycleClick();				
				}
			}
			else if(taskName == "Update Project")
			{
				var idtype=["cycledetails"];
				adminServices.getDetails_ICE(idtype,CycleID)
				.then(function (response) {
					if(response == "Invalid Session"){
							  window.location.href = "/";
							}
					if((response.testsuiteIds == undefined && cycId == undefined) || response.testsuiteIds.length <= 0){
						for(var i=0;i<updateProjectDetails.length;i++)
						{
							if(updateProjectDetails[i].releaseName == $("li.active").children("span.releaseName").text())
							{
								for(var j=0;j<updateProjectDetails[i].cycleDetails.length;j++)
								{
									var objectType = typeof(updateProjectDetails[i].cycleDetails[j]);
									if( objectType == 'object')
									{
										if(updateProjectDetails[i].cycleDetails[j].cycleName == $("#"+deleteCycleId).parent().prev('span.cycleName').text())
										{
											var deleteRelCyc = {
													"releaseName": "",
													"releaseId": "",
													"cycleDetails": [],
													"deleteStatus": false
											}
											var deleteCycle = {
													"cycleName": "",
													"cycleId": "",
													"deleteStatus": false
											}
											//For update project json
											if(deletedProjectDetails.length <= 0){
												//adding release object
												deleteRelCyc.releaseName = $("li.active").children("span.releaseName").text();//updateProjectDetails[i].releaseName;
												deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid");//updateProjectDetails[i].releaseId;
												deleteRelCyc.deleteStatus = false;
												//adding cycle object within release
												deleteCycle.cycleName = $("#"+deleteCycleId).parent().prev('span.cycleName').text();//updateProjectDetails[i].cycleDetails[j].cycleName;
												deleteCycle.cycleId = cycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
												deleteCycle.deleteStatus = true;
												deleteRelCyc.cycleDetails.push(deleteCycle);
												//pushing all to object
												deletedProjectDetails.push(deleteRelCyc);
											}
											else{
												var chk = true;
												for(k=0; k<deletedProjectDetails.length; k++){
													if(deletedProjectDetails[k].releaseId == $("li.active").children("span.releaseName").data("releaseid")/*updateProjectDetails[i].releaseId*/){
														var chkCycInRel = true;
														for(l=0; l<deletedProjectDetails[k].cycleDetails.length; l++){
															if(deletedProjectDetails[k].cycleDetails[l].cycleId == cycId/*updateProjectDetails[i].cycleDetails[j].cycleId*/){
																deletedProjectDetails[k].cycleDetails[l].cycleName = $("#"+deleteCycleId).parent().prev('span.cycleName').text();//updateProjectDetails[i].cycleDetails[j].cycleName;
																deletedProjectDetails[k].cycleDetails[l].deleteStatus = true;
																chkCycInRel = false;
																break;
															}
														}
														if(chkCycInRel == true){
															deleteCycle.cycleName = $("#"+deleteCycleId).parent().prev('span.cycleName').text();//updateProjectDetails[i].cycleDetails[j].cycleName;
															deleteCycle.cycleId = cycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
															deleteCycle.deleteStatus = true;
															deletedProjectDetails[k].cycleDetails.push(deleteCycle)															
														}
														chk = false;
													}
												}
												if(chk == true){
													//adding release object
													deleteRelCyc.releaseName = $("li.active").children("span.releaseName").text();//updateProjectDetails[i].releaseName;
													deleteRelCyc.releaseId = $("li.active").children("span.releaseName").data("releaseid");//updateProjectDetails[i].releaseId;
													deleteRelCyc.deleteStatus = false;
													//adding cycle object within release
													deleteCycle.cycleName = $("#"+deleteCycleId).parent().prev('span.cycleName').text();//updateProjectDetails[i].cycleDetails[j].cycleName;
													deleteCycle.cycleId = cycId;//updateProjectDetails[i].cycleDetails[j].cycleId;
													deleteCycle.deleteStatus = true;
													deleteRelCyc.cycleDetails.push(deleteCycle);
													//pushing all to object
													deletedProjectDetails.push(deleteRelCyc);
												}
											}
											//For update project json											
											delete updateProjectDetails[i].cycleDetails[j];
											updateProjectDetails[i].cycleDetails =  updateProjectDetails[i].cycleDetails.filter(function(n){ return n != null });
										}
									}
									else if(objectType == 'string')
									{
										if(updateProjectDetails[i].cycleDetails[j] == $("#"+deleteCycleId).parent().prev('span.cycleName').text())
										{
											delete updateProjectDetails[i].cycleDetails[j];
											updateProjectDetails[i].cycleDetails =  updateProjectDetails[i].cycleDetails.filter(function(n){ return n != null });
										}
									}
								}
							}
						}
						goahead = true;
					}
					else if(response.testsuiteIds.length > 0){
						goahead = false;
						openModelPopup("Delete Cycle", "Cycle contains Test suites. Cannot delete");
					}
					if(goahead == true){
						$("#"+deleteCycleId).parent().parent("li").remove();
						openModelPopup("Delete Cycle", "Cycle deleted successfully");
						toggleCycleClick();				
					}
				})
			}
		})
		//event.stopImmediatePropagation();
	})

	//Load Users for Edit
	$scope.editUserTab = function(){
		$scope.tab = "editUser";
		adminServices.getAllUsers_Nineteen68()
		.then(function (response) {
			if(response == "Invalid Session"){
							  window.location.href = "/";
							}
			$("#userSelect").empty()
			$("#userSelect").append('<option data-id="" value disabled selected>Select User</option>')
			for(i=0; i<response.userIds.length && response.user_names.length; i++){
				$("#userSelect").append('<option data-id="'+response.userIds[i]+'" value="'+response.user_names[i]+'">'+response.user_names[i]+'</option>')
			}
			
			//sorting the dropdown values in alphabetical order 
			var selectOptions = $("#userSelect option:not(:first)");
			selectOptions.sort(function(a,b) {
				if (a.text > b.text) return 1;
			    else if (a.text < b.text) return -1;
			    else return 0;
			})
			$("#userSelect").empty()
			$("#userSelect").append('<option data-id="" value disabled selected>Select User</option>');
			for(i=0; i<selectOptions.length;i++){
				$("#userSelect").append(selectOptions[i])				
			}
			$("#userSelect").prop('selectedIndex', 0);
			
		}, 
		function (error) { console.log("Error:::::::::::::", error) })
	};

	//Load Projects for Edit
	$scope.editProjectTab = function(){
		projectDetails = [];
		updateProjectDetails = [];
		$scope.tab = "editProject";
		adminServices.getDomains_ICE()
		.then(function (data) {
			if(data == "Invalid Session"){
							  window.location.href = "/";
							}
			if (data == "No Records Found") {
				var domainList = data;
				$('#selDomainEdit').empty();
				$('#selDomainEdit').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
				for (var i = 0; i < domainList.length; i++) {
					$('#selDomainEdit').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
				}
			} else {
				var domainList = data;
				$('#selDomainEdit').empty();
				$('#selDomainEdit').append($("<option value=''  disabled selected>Please Select Your Domain</option>"));
				for (var i = 0; i < domainList.length; i++) {
					$('#selDomainEdit').append($("<option value=" + domainList[i].domainId + "></option>").text(domainList[i].domainName));
				}
			}
			
			//sorting the dropdown values in alphabetical order 
			var selectOptions = $("#selDomainEdit option:not(:first)");
			selectOptions.sort(function(a,b) {
				if (a.text > b.text) return 1;
			    else if (a.text < b.text) return -1;
			    else return 0;
			})
			$("#selDomainEdit").empty()
			$("#selDomainEdit").append('<option data-id="" value disabled selected>Please Select Your Domain</option>');
			for(i=0; i<selectOptions.length;i++){
				$("#selDomainEdit").append(selectOptions[i])				
			}
			$("#selDomainEdit").prop('selectedIndex', 0);
			
		}, function (error) { console.log("Error:::::::::::::", error) })

		$(document).on('change','#selDomainEdit', function() {
			//get Projects Service
			var domainId = $("#selDomainEdit option:selected").val();
			var requestedids = [domainId];
			var domains = [];
			domains.push(domainId);
			//console.log("Domain", domains);
			//var requestedids = domains.push(domainId);
			var idtype=["domaindetails"];
			adminServices.getDetails_ICE(idtype,requestedids)
			.then(function (response) {
				if(response == "Invalid Session"){
							  window.location.href = "/";
							}
				if(response.projectNames.length > 0)
				{
					$('#selProject').empty();
					$('#selProject').append($("<option value=''  disabled selected>Please Select Your Project</option>"));
					for (var i = 0; i < response.projectNames.length; i++) {
						$('#selProject').append($("<option value=" + response.projectIds[i] + "></option>").text(response.projectNames[i]));
					}

				}
				else{
					$('#selProject').empty();
					$('#selProject').append($("<option value=''  disabled selected>Please Select Your Project</option>"));
					for (var i = 0; i < response.projectNames.length; i++) {
						$('#selProject').append($("<option value=" + response.projectIds[i] + "></option>").text(response.projectNames[i]));
					}
				}
				
				//sorting the dropdown values in alphabetical order 
				var selectOptions = $("#selProject option:not(:first)");
				selectOptions.sort(function(a,b) {
					if (a.text > b.text) return 1;
				    else if (a.text < b.text) return -1;
				    else return 0;
				})
				$("#selProject").empty()
				$("#selProject").append('<option data-id="" value disabled selected>Please Select Your Project</option>');
				for(i=0; i<selectOptions.length;i++){
					$("#selProject").append(selectOptions[i])				
				}
				$("#selProject").prop('selectedIndex', 0);
				
			}, function (error) { console.log("Error:::::::::::::", error) })
			clearUpdateProjectObjects();
		});
		
		$(document).on('change','#selProject', function() {
			updateProjectDetails = [];
			var domaiprojectId = $("#selProject option:selected").val();
			var projects = [];
			var requestedids=[domaiprojectId];
			var idtype=["projectsdetails"];
			projects.push(domaiprojectId);
			//console.log("projects", projects);
			adminServices.getDetails_ICE(idtype,requestedids)
			.then(function (response) {
				if(response == "Invalid Session"){
							  window.location.href = "/";
							}
				//console.log("resposne", response);
				$("div.projectTypes").addClass("disableProjectType");
				switch (response.appType)
				{
				case "Web":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Web']").addClass("projectTypeSelected");
					break;
				case "Webservice":
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Webservice']").addClass("projectTypeSelected");
					break;
				case "Mainframe": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Mainframe']").addClass("projectTypeSelected");
					break;
				case "Desktop": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Desktop']").addClass("projectTypeSelected");
					break;
				case "DesktopJava": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='DesktopJava']").addClass("projectTypeSelected");
					break;
				case "Mobility": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Mobility']").addClass("projectTypeSelected");
					break;
				case "mobilityweb": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='mobilityweb']").addClass("projectTypeSelected");
					break;
				case "Sap": 
					$("div.projectTypeSelected").removeClass("projectTypeSelected");
					$(".projectTypes[data-app='Sap']").addClass("projectTypeSelected");
					break;
				default: 
				}
				$(".projectTypes").each(function(){
					if(!$(this).hasClass("projectTypeSelected")){
						$(this).addClass("projectTypesremovefunc");
						$(this).find("label").css("cursor","default");
					}
				})
				
				updateProjectDetails = [];
				updateProjectDetails =  response.projectDetails;
				$("#releaseList li,#cycleList li").remove()
				for(var i=0;i<updateProjectDetails.length;i++)
				{
					$("#releaseList").append("<li class='updateRelease' id='releaseList_"+i+"'><img src='imgs/ic-release.png' /><span title="+updateProjectDetails[i].releaseName+" data-releaseid="+updateProjectDetails[i].releaseId+" class='releaseName'>"+updateProjectDetails[i].releaseName+"</span><span class='actionOnHover'><img id=editReleaseName_"+i+" title='Edit Release Name' src='imgs/ic-edit-sm.png' class='editReleaseName'><img id=deleteReleaseName_"+i+" title='Delete Release' src='imgs/ic-delete-sm.png' class='deleteRelease'></span></li>");
					$("#releaseList li:first").trigger('click');
				}
				showHideEditDeleteIcons();
			}, function (error) { console.log("Error:::::::::::::", error) })
			clearUpdateProjectObjects();
		});		
	};
	//Toggle Release Edit Delete Icons 
	function showHideEditDeleteIcons()
	{
		$("#releaseList li").each(function() {
			if ($(this).hasClass("active"))
			{
				$(this).children("span.actionOnHover").children("img").show();
			}
			else{
				$(this).children("span.actionOnHover").children("img").hide();
			}
		});
	}


	//Get Selected User Data
	$scope.getUserData = function(){
		var userId = $("#userSelect option:selected").data("id");
		var userName = $("#userSelect option:selected").val();
		adminServices.getUsersInfo(userId, userName)
		.then(function (response) {
			if(response == "Invalid Session"){
							  window.location.href = "/";
							}
			$("#firstName").val(response.firstName);
			$("#lastName").val(response.lastName);
			$("#email").val(response.emailId != undefined? response.emailId : "");
			if(response.ldapuser == true){
				$("#userSelect").siblings(".ldapBtn").addClass("ldapBtnActive");
				$("#password, #confirmPassword").parent().hide();
			}else{
				$("#userSelect").siblings(".ldapBtn").removeClass("ldapBtnActive");
				$("#password, #confirmPassword").parent().show();
			}
			var roleId = response.roleId;
			adminServices.getUserRoles_Nineteen68()
			.then(function (response) {
				if(response == "Invalid Session"){
							  window.location.href = "/";
							}
				$("#userRoles").empty().append('<option value disabled>Select User Role</option>')
				for(i=0; i<response.r_ids.length && response.userRoles.length; i++){
					if(roleId == response.r_ids[i]){
						$("#userRoles").append('<option selected value="'+response.r_ids[i]+'">'+response.userRoles[i]+'</option>')
					}
					else{
						$("#userRoles").append('<option value="'+response.r_ids[i]+'">'+response.userRoles[i]+'</option>')
					}
				}
			}, 
			function (error) { console.log("Error:::::::::::::", error) })
		}, 
		function (error) { console.log("Error:::::::::::::", error) })
	};

	//Update Edit User
	$scope.updateUser = function(){
		$("#userSelect, #userRoles").removeClass("selectErrorBorder");
		$("#firstName, #lastName, #password, #confirmPassword, #email").removeClass("inputErrorBorder");
		var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		var regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]).{8,16}$/;
		if($("#userSelect option:selected").val() == "") {
			$("#userSelect").css('border','').addClass("selectErrorBorder");
		}
		else if ($("#firstName").val() == "") {
			$("#firstName").addClass("inputErrorBorder");
		}
		else if ($("#lastName").val() == "") {
			$("#lastName").addClass("inputErrorBorder");
		}
		/*else if ($("#password").val() == "") {
			$("#password").addClass("inputErrorBorder");
		}*/ 
		else if ($("#password").val().length > 0 && regexPassword.test($("#password").val()) == false) {
			openModelPopup("Error", "Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#password").addClass("inputErrorBorder");
		}
		/*else if ($("#confirmPassword").val() == "") {
			$("#confirmPassword").addClass("inputErrorBorder");
		}*/
		else if ($("#confirmPassword").val().length > 0 && regexPassword.test($("#confirmPassword").val()) == false ) {
			openModelPopup("Error","Password must contain atleast 1 special character, 1 numeric, 1 uppercase, length should be minimum 8 character and maximum 12 character.");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if($("#password").val() != $("#confirmPassword").val() && ($("#password").val().length > 0 && $("#confirmPassword").val().length > 0)){
			openModelPopup("Error", "Password and Confirm Password did not match");
			$("#confirmPassword").addClass("inputErrorBorder");
		}
		else if ($("#email").val() == "") {
			$("#email").addClass("inputErrorBorder");
		} 
		else if (reg.test($("#email").val()) == false) {
			openModelPopup("Error", "Email address is not valid");
			$("#email").addClass("inputErrorBorder");
		} 
		else if($("#userRoles option:selected").val() == "") {
			$("#userRoles").css('border','').addClass("selectErrorBorder");
		}
		else{
			var updateUserObj = {};
			updateUserObj.userName = $("#userSelect option:selected").text();
			updateUserObj.passWord = $("#password").val();
			updateUserObj.firstName = $("#firstName").val();
			updateUserObj.lastName = $("#lastName").val();
			updateUserObj.role = $("#userRoles option:selected").val();
			updateUserObj.email = $("#email").val();
			updateUserObj.userId = $("#userSelect option:selected").data("id");
			adminServices.updateUser_nineteen68(updateUserObj)
			.then(function (response) {
				if(response == "Invalid Session"){
							  window.location.href = "/";
							}
				if(response == "success"){
					openModelPopup("Edit User", "User has been edited successfully.");
					resetUpdateUser();
					
					$timeout(function(){
						
						$("#userTab").trigger("click");
						$timeout(function(){
							$(".adminActionBtn").children("button:first-child").trigger("click");
							
						}, 50)
					}, 50)
				}
				else{
					openModelPopup("Edit User", "Failed to edit user.");
					resetUpdateUser();
					
					$timeout(function(){
						
						$("#userTab").trigger("click");
						$timeout(function(){
							$(".adminActionBtn").children("button:first-child").trigger("click");
							
						}, 50)

					}, 50)
				}
			}, 
			function (error) { console.log("Error:::::::::::::", error) })
		}
	};

	//AppTypeSelect Functionality
	$(document).on("click", ".projectTypes", function(){
		var taskName = $("#page-taskName").children("span").text();
		if(taskName == "Create Project"){
			$(this).toggleClass("projectTypeSelected");
			$(this).siblings().removeClass("projectTypeSelected")			
		}
		else return false;
	});
	$(document).on("keypress","#email", function(key) {
		if(key.charCode >= 189 || key.charCode == 64 || key.charCode == 46) return true;
		else if((key.charCode < 95 || key.charCode > 122) && (key.charCode < 48 || key.charCode > 57) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45) || key.charCode == 96 || key.charCode == 32) return false;
	});
	$(document).on("blur","#email", function(){
		var reg = /^[a-zA-Z0-9\.\@\-\_]+$/
			if(reg.test($(this).val()) && !(/^[\s]+$/).test($(this).val())){
				return true;
			}
			else if($(this).val() == ''){
			}
			else{
				openModelPopup("Incorrect Inputs", "Cannot contain special characters other than ._-");
				$(this).val('');
				return false;
			}
	});


//	Prevents special characters on keydown
	$(document).on("keydown", ".validationKeydown", function(e) {
		if(e.shiftKey && e.keyCode == 190 || (e.shiftKey && (e.keyCode > 46 && e.keyCode < 58)) || e.keyCode == 17 || e.keyCode == 190 || e.keyCode == 219 || e.keyCode == 221 || e.keyCode == 186 || e.keyCode == 189 || e.keyCode == 220 || e.keyCode == 188 || e.keyCode == 191 || e.keyCode == 187 || e.keyCode == 110 || e.keyCode == 107 || e.keyCode == 111 || e.keyCode == 106 || e.keyCode == 109 || (e.keyCode >= 96 && e.keyCode <= 105) || (e.keyCode >= 48 && e.keyCode <= 57))
		{
			return false;
		}
		else if(e.shiftKey && e.keyCode == 189 || e.keyCode > 64 && e.keyCode < 91 || e.keyCode == 8 || e.keyCode == 46 || e.keyCode > 46 && e.keyCode < 58 || e.keyCode == 32 || e.shiftKey && e.keyCode == 16)
		{
			return true;
		}
	});
//	Prevents special characters on blur/paste 
	$(document).on("blur", ".validationBlur", function(e) {
		var id = e.target.id;
		var val = $(this).val();
		preventSpecialCharOnBlur(id,val);
	});


	function preventSpecialCharOnBlur(id, val)
	{
		var reg = /^[a-zA-Z0-9\_]+$/
		if(reg.test(val)){
			return true;
		}
		else if(val == ''){
		}
		else{
			openModelPopup("Incorrect Inputs", "Cannot contain special characters other than _");
			$("#"+id).val('');
			return false;
		}
	}



	//Edit Release Name Functionality
	/*$(document).on("click", ".editReleaseName", function(){
		$("#editReleaseNameModal").modal("show");
		var existingReleaseName = $(this).parents("li").children(".releaseName").text()
		$("#releaseName").val(existingReleaseName)
	});*/

	//Delete Release Functionality
	/*$(document).on("click", ".deleteRelease", function(){
		$("#deleteReleaseModal").modal("show")
	});*/

	//Edit Cycle Name Functionality
	/*$(document).on("click", ".editCycleName", function(){
		$("#editCycleNameModal").modal("show");
		var existingCycleName = $(this).parents("li").children(".cycleName").text()
		$("#cycleName").val(existingCycleName)
	});*/

	//Delete Release Functionality
	/*$(document).on("click", ".deleteCycle", function(){
		$("#deleteCycleModal").modal("show")
	});*/

	//Global moded popup
	function openModelPopup(title, body){
		$("#adminModal").find('.modal-title').text(title);
		$("#adminModal").find('.modal-body p').text(body);
		$("#adminModal").modal("show");
		setTimeout(function(){
			$("#adminModal").find('.btn-default').focus();					
		}, 300);
	}
	
	//Global edit model popup
	function openEditGlobalModel(title,inputID,placeholder,buttonID){
		$("#editGlobalModal").find('.modal-title').text(title);
	    $("#editGlobalModal").find('input').prop("id",inputID).prop("placeholder",placeholder);
	    $("#editGlobalModal").find('button.btnGlobalSave').prop("id",buttonID);
		$("#editGlobalModal").modal("show");
		setTimeout(function(){
			$("#editGlobalModal").find('input').focus();					
		}, 300);
	}
	
	function clearUpdateProjectObjects(){
		newProjectDetails = [];
		deletedProjectDetails = [];
		editedProjectDetails = [];		
	}
	//Special character validation 
	function moveItems(origin, dest) {
		$(origin).find(':selected').appendTo(dest);
	}

	function moveAllItems(origin, dest) {
		$(origin).children().appendTo(dest);
	}

	$scope.leftgo = function (to,from) {
		moveItems(to,from);
	}

	$scope.rightgo = function (from,to) {
		moveItems(from,to);
	}

	$scope.leftall = function (to,from) {
		moveAllItems(to,from);
	}

	$scope.rightall = function (from,to) {
		moveAllItems(from,to);
	}
}]);

