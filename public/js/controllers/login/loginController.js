mySPA.controller('loginController', function ($scope, $rootScope, $timeout, $http, $location, LoginService, cfpLoadingBar, adminServices) {
	$(".ic-username, .ic-password").parent().removeClass("input-border-error")
	$scope.loginValidation = "";
	$scope.ud = {};
	$scope.serverList = [{"name": "License Server", "active": false}, {"name": "NDAC Server", "active": false}, {"name": "Web Server", "active": false}];
	$scope.restartForm = false;
	window.localStorage.clear();
	window.localStorage['LoginSuccess'] = "False";
	document.getElementById("currentYear").innerHTML = new Date().getFullYear();
	//if checkLoggedIn was true, means, user was logged in but now the session is expired
	if (window.sessionStorage.getItem('checkLoggedIn') == "true") {
		$scope.loginValidation = "Your session has expired, Please login again";
		window.sessionStorage['checkLoggedIn'] = "false";
	}

	$scope.check_credentials = function (path, $event) {
		cfpLoadingBar.start();
		$scope.loginValidation = "";
		$(".ic-username, .ic-password").parent().removeClass("input-border-error")
		if (!$scope.ud.userName) {
			$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
			$(".ic-username").parent().addClass("input-border-error")
			$(".ic-password").children().attr("src", "imgs/ic-password.png");
			$(".ic-password").parent().removeClass("input-border-error")
			$scope.loginValidation = "Please Enter Username";
			cfpLoadingBar.complete();
		} else if (!$scope.ud.password) {
			$(".ic-username").children().attr("src", "imgs/ic-username.png");
			$(".ic-username").parent().removeClass("input-border-error")
			$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
			$(".ic-password").parent().addClass("input-border-error")
			$scope.loginValidation = "Please Enter Password";
			cfpLoadingBar.complete();
		} else {
			var username = $scope.ud.userName.toLowerCase();
			var password = $scope.ud.password;
			LoginService.authenticateUser_Nineteen68(username, password)
			.then(function (data) {
				cfpLoadingBar.complete();
				if (data == "restart") {
					blockUI("Fetching active services...");
					adminServices.restartService("query")
					.then(function (data) {
						if (data == "fail") {
							$scope.loginValidation = "Failed to fetch services.";
						} else {
							$scope.restartForm = true;
							data.forEach(function(e, i){
								$scope.serverList[i].active = e;
							});
						}
						unblockUI();
					}, function (error) {
						unblockUI();
						$scope.loginValidation = "Failed to fetch services.";
					});
				} else if (data == 'validCredential') {
					$(".ic-username").children().attr("src", "imgs/ic-username.png");
					$(".ic-password").children().attr("src", "imgs/ic-password.png");
					$(".ic-username, .ic-password").parent().removeClass("input-border-error");
					$scope.loginButtonValidation = "";
					LoginService.loadUserInfo_Nineteen68()
					.then(function (data) {
						if (data != "fail") {
							window.localStorage['LoginSuccess'] = "True";
							window.localStorage['_SR'] = data.rolename;
							defaultRole = data.rolename;
							window.localStorage['_UI'] = JSON.stringify(data);
							window.sessionStorage["checkLoggedIn"] = "true";
							if (data.rolename == "Admin") {
								window.localStorage['navigateScreen'] = "admin";
								$location.path("/admin");
							} else {
								window.localStorage['navigateScreen'] = "plugin";
								$location.path("/plugin");
							}
							//Transaction Activity for Login Button Action
							var activityData = {};
							var timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
							var labelArr = [];
							var info = [];
							labelArr.push({ label: $event.target.outerText });
							        activityData.username = JSON.parse(window.localStorage['_UI']).username;
									activityData.timestamp = timeStampInMs, Date.now()
							        activityData.action = $event.type;
									activityData.labels = labelArr;
									activityData.category = "UI";
									activityData.info  = [];
									activityData.elapsedTime = '';
									activityData.url = $location.$$path;
									activityData.role = data.rolename;
							        txnHistory.log(activityData); 
						} else {
							$scope.loginValidation = "Failed to Login.";
							console.log("Failed to Load UserInfo.");
						}
					}, function (error) {
						$scope.loginValidation = "Failed to Login.";
						console.log("Fail to Load UserInfo")
					});
				} else if (data == 'inValidCredential') {
					$(".ic-username").children().attr("src", "imgs/ic-username-error.png");
					$(".ic-password").children().attr("src", "imgs/ic-password-error.png");
					$(".ic-password").parent().addClass("input-border-error")
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else if (data == "userLogged") {
					$scope.loginValidation = "User is already logged in! Please logout from the previous session.";
				} else if (data == "inValidLDAPServer") {
					$scope.loginValidation = "LDAP Server Configuration is invalid!";
				} else if (data == 'noProjectsAssigned') {
					$scope.loginValidation = "To Login, user must be allocated to a Domain and Project. Please contact Admin.";
				} else if (data == 'invalid_username_password') {
					$scope.loginValidation = "The username or password you entered isn't correct. Please try again.";
				} else {
					$scope.loginValidation = "Failed to Login.";
				}
			
			}, function (error) {
				console.log("Failed to Authenticate User.")
				$scope.loginValidation = "Failed to Authenticate User.";
				cfpLoadingBar.complete();
			});

		}
		
	};

	$scope.restartServer = function (serverid, serverName) {
		var errmsg = "Fail to restart " + serverName + " service!";
		blockUI("Please wait while " + serverName + " service is being restarted...");
		adminServices.restartService(serverid)
		.then(function (data) {
			if (data == "success") {
				setTimeout(function(){
					unblockUI();
					openModalPopup("Restart Service", serverName+" service is restarted successfully!!");
				}, 120 * 1000);
			} else {
				unblockUI();
				if (data == "na") errmsg = "Service is not found. Ensure "+serverName+" is running as a service.";
				openModalPopup("Restart Service", errmsg);
			}
		}, function (error) {
			unblockUI();
			openModalPopup("Restart Service", errmsg);
		});
	};

	function openModalPopup(title, body){
		var mainModal = $("#popupModal");
		mainModal.find('.modal-title').text(title);
		mainModal.find('.modal-body p').text(body);
		mainModal.modal("show");
		setTimeout(function(){
			$("#popupModal").find('.btn-default').focus();
		}, 300);
	}
});
