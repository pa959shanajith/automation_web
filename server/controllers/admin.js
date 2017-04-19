/**
* Dependencies.
*/
var Joi = require('joi');
var client_cas = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var Joi = require('joi');
var dbConn = require('../../server/config/cassandra');
var cassandra = require('cassandra-driver');
var uuid = require('uuid-random');
//var passwordHash = require('password-hash');
var bcrypt = require('bcrypt');
var async = require('async');
var set = require('set');
var dbConnICE = require('../../server/config/icetestautomation');

var roles = [];
var r_ids = [];
var userRoles = {};

//GetUserRoles
exports.getUserRoles_Nineteen68 = function(req, res){
	var getUserRoles = "select roleid, rolename from roles";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res.send(err);
		}
		else {
			for (var i = 0; i < result.rows.length; i++) {
				roles[i] = result.rows[i].rolename;
				r_ids[i] = result.rows[i].roleid;
			}
			userRoles.userRoles = roles;
			userRoles.r_ids = r_ids;
			res.send(userRoles);
		}
	});
};


//GetUsers
exports.getUsers_Nineteen68 = function(req, res){
	var roles = [];
	var r_ids = [];
	var userRoles = {userRoles:[],r_ids:[]};
	var getUserRoles = "select userid, username from nineteen68.users ";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				roles.push(iterator.username);
				r_ids.push(iterator.userid);
				callback1();
			});
			userRoles.userRoles = roles;
			userRoles.r_ids = r_ids;
			//console.log(userRoles);
			res(null,userRoles);
		}
	});
};

//Get All Users
exports.getAllUsers_Nineteen68 = function(req, res){
	var user_names = [];
	var userIds = [];
	var userDetails = {user_names:[], userIds : []};
	var getUserRoles = "select userid, username from nineteen68.users ";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				user_names.push(iterator.username);
				userIds.push(iterator.userid);
				callback1();
			});
			userDetails.userIds = userIds;
			userDetails.user_names = user_names;
			//console.log(userDetails);
			res.send(userDetails);
		}
	});
};


//Get Users for Edit
exports.getEditUsersInfo_Nineteen68 = function(req, res){
	var reuestedUserName = req.body.userName;
	var reuestedUserId = req.body.userId;
	var userDetails = {};
	var getUserRoles = "select username,defaultrole,emailid,firstname,lastname from users where userid="+reuestedUserId+"";
	dbConn.execute(getUserRoles, function (err, result) {
		if (err) {
			res(null, err);
		}
		else {
			async.forEachSeries(result.rows,function(iterator,callback1){
				userDetails.userName = iterator.username,
				userDetails.roleId = iterator.defaultrole,
				userDetails.emailId = iterator.emailid,
				userDetails.firstName = iterator.firstname,
				userDetails.lastName = iterator.lastname
			});
			//console.log(userDetails);
			res.send(userDetails);
		}
	});
};


//CreateUser   
exports.createUser_Nineteen68 = function(req, res){
	var flag = "fail";
	var status = false;
	var req_username = req.body.createUser.username;
	var req_password = req.body.createUser.password;
	var req_firstname = req.body.createUser.firstName;
	var req_lastname =  req.body.createUser.lastName;
	var req_ldapuser = req.body.createUser.ldapUser;
	var req_defaultRole = req.body.createUser.role;
	var req_email_id = req.body.createUser.email;
	var salt = bcrypt.genSaltSync(10);
	var req_hashedPassword = bcrypt.hashSync(req_password, salt);

	var getUsername = "SELECT username FROM users";
	dbConn.execute(getUsername, function (err, userNameresult) {
		for (var i = 0; i < userNameresult.rows.length; i++) {
			dbResult = userNameresult.rows[i];
			if(req_username === dbResult.username)
			{
				status = true;
				break;
			}
		}
		if(status === false){
			var createUser = "INSERT INTO users (userid,deactivated,additionalroles,createdby,createdon,defaultrole,emailid,firstname,history,lastname,ldapuser,modifiedby,modifiedon,password,username) VALUES ("+uuid()+",null,null,'"+req_username+"',"+ new Date().getTime()+","+req_defaultRole+",'"+req_email_id+"','"+req_firstname+"',null,'"+req_lastname+"',null,'"+req_username+"',"+new Date().getTime()+",'"+req_hashedPassword+"','"+req_username+"')";
			dbConn.execute(createUser, function (err, userResult) {
				flag = "Success";
				res.send(flag);
			})
		}
		else
		{
			flag = "User Exists";
			res.send(flag);
		}
	})        
};


//Edit User
exports.updateUser_nineteen68 = function updateUser_nineteen68(req, res) {
	var flag = "fail";
	var status = false;
	var userObj = req.body.updateUserObj;
	var local_username = userObj.userName;
	var local_password = userObj.passWord;
	var local_firstname = userObj.firstName;
	var local_lastname = userObj.lastName;
	var local_role = userObj.role;
	var local_email_id = userObj.email;
	var local_user_Id = userObj.userId;

	if(local_password != "")
	{
		var salt = bcrypt.genSaltSync(10);
	    var req_hashedPassword = bcrypt.hashSync(local_password, salt);
	}
	
	var getUserDetails = "select username,password,firstname,lastname,defaultrole,emailid from users where userid="+local_user_Id;
	// console.log(getUserDetails);
	dbConn.execute(getUserDetails, function (err, result) {
		if (typeof result === 'undefined') {
			var flag = "fail";
			res.send(flag); 
		}
		else {
			service = result.rows[0];
			if(local_username == undefined || local_username == 'undefined' || local_username == ''){
				local_username = service.username;
			}
			if(local_password.trim().length == 0) {
				local_password = service.password;
			}
			else{
				var salt = bcrypt.genSaltSync(10);
	            var req_hashedPassword = bcrypt.hashSync(local_password, salt);
			}
			if(local_firstname == undefined || local_firstname == 'undefined' || local_firstname == ''){
				local_firstname = service.firstname;
			}
			if(local_lastname == undefined || local_lastname == 'undefined' || local_lastname == ''){
				local_lastname = service.lastname;
			}
			if(local_role == undefined || local_role == 'undefined' || local_role == ''){
				local_role = service.role;
			}
			if(local_email_id == undefined || local_email_id == 'undefined' || local_email_id == ''){
				local_email_id = service.email_id;
			}

			var updateUser = "UPDATE users set username='"+local_username+"', password='"+local_password+"', firstname='"+local_firstname+"', lastname='"+local_lastname+"', modifiedby='"+local_username+"', modifiedon="+new Date().getTime()+", defaultrole="+local_role+", emailid='"+local_email_id+"' where userid="+local_user_Id;
			// console.log(updateUser);
			dbConn.execute(updateUser, function (err, result) {
				if (typeof result === 'undefined') {
					var flag = "fail";
					res.send(flag); 
				}
				else {
					flag = "success";
					res.send(flag); 
				}
			});
		}
	}); 
};

//Get Domains
exports.getDomains_ICE = function getDomains_ICE(req, res) {
    try {
        var responsedata = [];
        var domainsQuery = "select domainid,domainname from domains";
        dbConnICE.execute(domainsQuery, function(error, response) {
            if (error) {
                try {
                    res.send("Error occured in getDomains_ICE: Fail");
                } catch (exception) {
                    console.log(exception);
                    res.send("fail");
                }
            } else {
                try {
                    async.forEachSeries(response.rows, function(eachdomain, domainscallback) {
                        var reponseobj = {
                            domainId: "",
                            domainName: ""
                        }
                        reponseobj.domainId=eachdomain.domainid;
                        reponseobj.domainName=eachdomain.domainname;
                        responsedata.push(reponseobj);
                        domainscallback();
                    },finalresult);
                } catch (exception) {
                    console.log(exception);
                }
            }
        });
       function finalresult(){
            res.send(responsedata);
        }
    } catch (exception) {
        console.log(exception);
        res.send("fail");
    }
};

//CheckReleaseNameExists
exports.checkReleaseNameExists_ICE =  function checkReleaseNameExists_ICE(req, res) {
    var releaseName = req.body.releaseName;
    var flag = "fail";
    var status = false;
      if (releaseName != 'undefined' || releaseName != undefined || releaseName != '') {
            var getReleaseInfo = "SELECT releasename FROM releases";
            dbConnICE.execute(getReleaseInfo, function (err, relResponse) {
                if (typeof relResponse === 'undefined') {
                   res.send("fail");
                }
                else {
                    for (var i = 0; i < relResponse.rows.length; i++) {
                        service = relResponse.rows[i];
                        if (releaseName == service.releasename) {
                            status = true;
                            break;
                        }
                    }
                }
                if (status == false) {
                    flag = "success";
                    res.send(flag);
                }
                else {
                    flag = "Release Name Exists";
                    res.send(flag);
                }
        });
      }
};

//CheckCycleNameExists
exports.checkCycleNameExists_ICE =  function checkCycleNameExists_ICE(req, res) {
      var cycleName = req.body.cycleName;
      var flag = "fail";
      var status = false;
     
      if (cycleName != 'undefined' || cycleName != undefined || cycleName != '') {
            var getCycleInfo = "select cyclename from cycles";
            dbConnICE.execute(getCycleInfo, function (err, cycResponse) {
                if (typeof cycResponse === 'undefined') {
                   res.send("fail");
                }
                else {
                    for (var i = 0; i < cycResponse.rows.length; i++) {
                        service = cycResponse.rows[i];
                        if (cycleName == service.cyclename) {
                            status = true;
                            break;
                        }
                    }
                }
                if (status == false) {
                    flag = "success";
                    res.send(flag);
                }
                else {
                    flag = "Cycle Name Exists";
                    res.send(flag);
                }
        });
      }
};

exports.createProject_ICE = function createProject_ICE(req, res) {
    var createProjectObj = req.body.createProjectObj;
    var userinfo = req.body.userDetails;
    var dateScreen = new Date().getTime();
    var requestedskucode = "skucodetestcase";
    var requestedtags = "tags";
    var requestedversionnumber = 1;
    var projectTypeId = "";
	var newProjectID = "";

    async.series({
        projecttype: function(callback) {
            var queryGetProjectTypeId = "SELECT projecttypeid from projecttype where projecttypename = '" + createProjectObj.appType + "' ALLOW FILTERING";
            dbConnICE.execute(queryGetProjectTypeId, function(err, projectTypeData) {
                if (err) {

                } else {
                    projectTypeId = projectTypeData.rows[0].projecttypeid;
                }
                callback();
            });

        },
        createproject: function(callback) {

            var requestprojecthistorydetails = "'inserted project action by " + userinfo.username + " having role:" + userinfo.role + "" +
                " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ", versionnumber=" + requestedversionnumber +
                " with the project Name " + createProjectObj.projectName + " '";
            newProjectID = uuid();
			//console.log("insideProject", newProjectID);
            var createProjectQuery = "INSERT INTO projects (domainid,projectname,projectid,createdby,createdon,deleted,history,projecttypeid,skucodeproject,tags) values(" +
                createProjectObj.domainId + ",'" + createProjectObj.projectName + "'," + newProjectID + ",'" + userinfo.username +
                "','" + new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestprojecthistorydetails + "}," +
                projectTypeId + ",'" + requestedskucode + "',['" + requestedtags + "']);"
            // console.log(createProjectQuery);
            dbConnICE.execute(createProjectQuery, function(err, insertProjectData) {
                if (err) {
                    console.log(err);
                } else {

                }
                callback();
            });

        },
        createreleases: function(callback) {
            var numberOfReleases = createProjectObj.projectDetails;
            // console.log(numberOfReleases);
            var releasesLength = numberOfReleases.length;
            async.forEachSeries(numberOfReleases, function(eachrelease, numberOfReleasescallback) {
                var releaseDetails = eachrelease;
                var releaseName = releaseDetails.releaseName;
                var cycleNames = releaseDetails.cycleNames;
                var cyclesLength = cycleNames.length;
                var cycleindex = 0;
                // cyclesLength=cycleNames.length;
                var requestReleasehistorydetails = "'inserted release action by " + userinfo.username + " having role:" + userinfo.role + "" +
                    " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + releaseName + " '";
                var newReleaseID = uuid();
				//console.log("insideRelease", newProjectID);
                var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
                    newProjectID + ",'" + releaseName + "'," + newReleaseID + ",'" + userinfo.username + "','" +
                    new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestReleasehistorydetails + "},'" +
                    requestedskucode + "',['" + requestedtags + "']);"

                dbConnICE.execute(createReleaseQuery, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        async.forEachSeries(cycleNames, function(cycleName, cycleNamescallback) {
                            var eachCycleName = cycleName;
                            var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username + " having role:" + userinfo.role + "" +
                                " skucodetestcase=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + eachCycleName + " '";
                            var newCycleID = uuid();
                            var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + newReleaseID + ",'" + eachCycleName + "'," + newCycleID + ",'" + userinfo.username + "','" +
                                new Date().getTime() + "'," + false + ",{" + dateScreen + ":" + requestCyclehistorydetails + "},'" +
                                requestedskucode + "',['" + requestedtags + "']);"
                            createCycle(getCycleQuery, function(error, response) {
                                if (error) {
                                    res.send(error);
                                } else {
                                    cycleNamescallback();
                                }
                            });
                        }, numberOfReleasescallback);
                    }
                });

            }, callback(null, ""));
			res.send('success');
        }
	
    }, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    })
	//res.send('success');
};

/**
 * generic function for DB to insert project
 * @author vinay.niranjan
 */
function getProjectType(getProjectTypeQuery,getProjectTypeCallback){
	var statusFlag="";
	dbConnICE.execute(getProjectTypeQuery,function(getProjectTypeQueryError, getProjectTypeQueryRes){
        if(getProjectTypeQueryError){
            statusFlag="Error occured in getProjectType of createProject_ICE: Fail";
            getProjectTypeCallback(statusFlag,null);
        }else{	
            var projectTypeId = getProjectTypeQueryRes.rows[0].projecttypeid;				
            getProjectTypeCallback(null,projectTypeId);
		}
	});
};

function createProject(createProjectQuery,createProjectCallback){
	var statusFlag="";
	dbConnICE.execute(createProjectQuery,function(createProjectQuery, createProjectQueryRes){
			if(createProjectQuery){
				statusFlag="Error occured in createProject_ICE : Fail";
				createProjectCallback(null,statusFlag);
			}else{
				statusFlag = "success";						
				createProjectCallback(null,statusFlag);
		}
	});
};

function createRelease(createReleaseQuery,createReleaseCallback){
	var statusFlag="";
	dbConnICE.execute(createReleaseQuery, function(createReleaseerror, createReleaseResponse){
			if(createReleaseerror){
				statusFlag="Error occured in createRelease of createProject_ICE : Fail";
				createReleaseCallback(statusFlag,null);
			}else{
				statusFlag = "success";						
				createReleaseCallback(null,statusFlag);
		}
	});
};

function createCycle(createCycleQuery,createCycleCallback){
	var statusFlag="";
	dbConnICE.execute(createCycleQuery,function(createCycleerror, createCycleresponse){
			if(createCycleerror){
				statusFlag="Error occured in createCycle of createProject_ICE : Fail";
				createCycleCallback(statusFlag,null);
			}else{
				statusFlag = "success";			
				createCycleCallback(null,statusFlag);
		}
	});
};

//Update Project
exports.updateProject_ICE = function updateProject_ICE(req, res){
	
	var updateProjectDetails=req.body.updateProjectObj;
	// var updateProjectDetails={projectId:"f9409e26-cb50-489b-9527-623ce9f23672"};
    console.log(JSON.stringify(req.body.updateProjectObj));
	var userinfo = req.body.userDetails;
    var date = new Date().getTime();
    var requestedskucode = "skucode";
    var requestedtags = "tags";
    var flag="";
    var requestedversionnumber = 1;
    var requestedprojectid=updateProjectDetails.projectId;
    async.series({
        newProjectDetails : function(newProjectDetailsCallback){
            var projectDetails=updateProjectDetails.newProjectDetails;
            async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
                var releaseDetails = eachprojectDetail;
                var releaseName = releaseDetails.releaseName;
                var cycleDetails = releaseDetails.cycleDetails;
                var requestReleasehistorydetails = "'inserted release action on Update project service by " + userinfo.username + " having role:" + userinfo.role + "" +
                    " skucoderelease=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + releaseName + " '";
                var newReleaseID = uuid();
				//console.log("insideRelease", newProjectID);
                var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
                    requestedprojectid + ",'" + releaseName + "'," + newReleaseID + ",'" + userinfo.username + "','" +
                    new Date().getTime() + "'," + false + ",{" + date + ":" + requestReleasehistorydetails + "},'" +
                    requestedskucode + "',['" + requestedtags + "']);"
                dbConnICE.execute(createReleaseQuery, function(err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        async.forEachSeries(cycleDetails, function(eachCycleDetail, cycleNamescallback) {
                            var eachCycleName = eachCycleDetail.cycleName;
                            var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username + " having role:" + userinfo.role + "" +
                                " skucodecycle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + eachCycleName + " '";
                            var newCycleID = uuid();
                            var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
                                newReleaseID + ",'" + eachCycleName + "'," + newCycleID + ",'" + userinfo.username + "','" +
                                new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
                                requestedskucode + "',['" + requestedtags + "']);"
                            createCycle(getCycleQuery, function(error, response) {
                                if (error) {
                                    res.send(error);
                                } else {
                                    cycleNamescallback();
                                }
                            });
                            
                        },eachprojectDetailcallback);
                    }
                });
            },newProjectDetailsCallback);
        },
        deletedProjectDetails: function(deletedProjectDetailsCallback){
            var projectDetails=updateProjectDetails.deletedProjectDetails;
            async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
                var deleteStatus=eachprojectDetail.deleteStatus;
                if(deleteStatus){
                    var deleteReleaseQuery="delete from releases where releasename='"+eachprojectDetail.releaseName+
                    "' and projectid="+requestedprojectid+" and releaseid="+eachprojectDetail.releaseId;
                    // console.log(deleteReleaseQuery);
                    dbConnICE.execute(deleteReleaseQuery, function(deleteReleaseQueryerror, deleteReleaseQueryresponse) {
                        if(deleteReleaseQueryerror){
                            flag="Error in deleteRelease-updateProject_ICE : Fail";
                            res.send(flag);
                        }else{
                            var cyclesOfRelease=eachprojectDetail.cycleDetails;
                            async.forEachSeries(cyclesOfRelease, function(eachCycleDetail, eachCycleCallback) {
                                var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.cycleName+
                                "' and releaseid="+eachprojectDetail.releaseId+" and cycleid="+eachCycleDetail.cycleId;
                                dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
                                    if(deleteCyclesQueryerror){
                                        flag="Error in deleteCycles(true)-updateProject_ICE : Fail";
                                        res.send(flag);
                                    }else{
                                        eachCycleCallback();
                                    }
                                });
                            },eachprojectDetailcallback);
                        }
                    });
                }else if(!deleteStatus){
                    var cycleDetails=eachprojectDetail.cycleDetails;
                    async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
                        var deleteStatusCycles=eachCycleDetail.deleteStatus;
                        if(deleteStatusCycles){
                            var cyclesOfRelease=eachCycleDetail.cycleDetails;
                            var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.cycleName+
                                "' and releaseid="+eachprojectDetail.releaseId+" and cycleid="+eachCycleDetail.cycleId;
                            dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
                                if(deleteCyclesQueryerror){
                                    flag="Error in deleteCycles(false)-updateProject_ICE : Fail";
                                    res.send(flag);
                                }else{
                                    eachCycleCallback();
                                }
                            });
                        }
                    },eachprojectDetailcallback);
                }
            },deletedProjectDetailsCallback);
        },
        editedProjectDetails : function(editedProjectDetailsCallback){
            var projectDetails=updateProjectDetails.editedProjectDetails;
            async.forEachSeries(projectDetails, function(eachprojectDetail, eachprojectDetailcallback) {
                var editedStatus=eachprojectDetail.editStatus;
                if(editedStatus){
                    var newReleaseName=eachprojectDetail.releaseName;
                    var releaseId=eachprojectDetail.releaseId;
                    var deleteReleaseQuery="delete from releases where releasename='"+eachprojectDetail.oldreleaseName+
                    "' and projectid="+requestedprojectid+" and releaseid="+releaseId;
                    // console.log(deleteReleaseQuery);
                    dbConnICE.execute(deleteReleaseQuery, function(deleteReleaseQueryerror, deleteReleaseQueryresponse) {
                        if(deleteReleaseQueryerror){
                            flag="Error in delete-Release(true)-updateProject_ICE : Fail";
                            res.send(flag);
                        }else{
                            var requestReleasehistorydetails = "'inserted release action on Update project service by " + userinfo.username + " having role:" + userinfo.role + "" +
                            " skucoderelease=" + requestedskucode + ", tags=" + requestedtags + ", with the release Name " + newReleaseName + " '";
                            var createReleaseQuery = "INSERT INTO releases (projectid,releasename,releaseid,createdby,createdon,deleted,history,skucoderelease,tags) values(" +
                                requestedprojectid + ",'" + newReleaseName + "'," + releaseId + ",'" + userinfo.username + "','" +
                                new Date().getTime() + "'," + false + ",{" + date + ":" + requestReleasehistorydetails + "},'" +
                                requestedskucode + "',['" + requestedtags + "']);"
                            dbConnICE.execute(createReleaseQuery, function(error, response) {
                                if(error){
                                    flag="Error in update-Release(true)-updateProject_ICE : Fail";
                                    res.send(flag);
                                }else{
                                    var cycleDetails=eachprojectDetail.cycleDetails;
                                    var newCycleName="";
                                    var cycleId="";
                                    async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
                                        var editedStatusCycles=eachCycleDetail.editStatus;
                                        if(editedStatusCycles){
                                            newCycleName=eachCycleDetail.cycleName;
                                            cycleId=eachCycleDetail.cycleId;
                                            var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.oldCycleName+
                                                "' and releaseid="+releaseId+" and cycleid="+cycleId;
                                            dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
                                                if(deleteCyclesQueryerror){
                                                    flag="Error in delete-Cycle(true)-updateProject_ICE : Fail";
                                                    res.send(flag);
                                                }else{
                                                var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username + " having role:" + userinfo.role + "" +
                                                    " skucodecyle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + newCycleName + " '";
                                                    var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
                                                        releaseId + ",'" + newCycleName + "'," + cycleId + ",'" + userinfo.username + "','" +
                                                    new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
                                                    requestedskucode + "',['" + requestedtags + "']);"
                                                    createCycle(getCycleQuery, function(error, response) {
                                                        if (error) {
                                                            res.send(error);
                                                        } else {
                                                            eachCycleCallback();
                                                        }
                                                 }); 
                                                }
                                            });
                                        }else{
                                            eachCycleCallback();
                                        }
                                    },eachprojectDetailcallback);
                                }
                            });
                        }
                    });
                }else{
                    var newReleaseName=eachprojectDetail.releaseName;
                    var releaseId=eachprojectDetail.releaseId;
                    var cycleDetails=eachprojectDetail.cycleDetails;
                    var newCycleName="";
                    var cycleId="";
                    async.forEachSeries(cycleDetails, function(eachCycleDetail, eachCycleCallback) {
                        var editedStatusCycles=eachCycleDetail.editStatus;
                        if(editedStatusCycles){
                            newCycleName=eachCycleDetail.cycleName;
                            cycleId=eachCycleDetail.cycleId;
                            var deleteCyclesQuery="delete from cycles where cyclename='"+eachCycleDetail.oldCycleName+
                                "' and releaseid="+releaseId+" and cycleid="+cycleId;
                            dbConnICE.execute(deleteCyclesQuery, function(deleteCyclesQueryerror, deleteCyclesQueryresponse) {
                                if(deleteCyclesQueryerror){
                                    flag="Error in delete-Cycle(true)-updateProject_ICE : Fail";
                                    res.send(flag);
                                }else{
                                var requestCyclehistorydetails = "'inserted cycle action by " + userinfo.username + " having role:" + userinfo.role + "" +
                                    " skucodecyle=" + requestedskucode + ", tags=" + requestedtags + ",with the cycle Name " + newCycleName + " '";
                                    var getCycleQuery = "INSERT INTO cycles (releaseid,cyclename,cycleid,createdby,createdon,deleted,history,skucodecycle,tags) VALUES (" + 
                                        releaseId + ",'" + newCycleName + "'," + cycleId + ",'" + userinfo.username + "','" +
                                    new Date().getTime() + "'," + false + ",{" + date + ":" + requestCyclehistorydetails + "},'" +
                                    requestedskucode + "',['" + requestedtags + "']);"
                                    createCycle(getCycleQuery, function(error, response) {
                                        if (error) {
                                            res.send(error);
                                        } else {
                                            eachCycleCallback();
                                        }
                                }); 
                                }
                            });
                        }else{
                            eachCycleCallback();
                        }
                    },eachprojectDetailcallback);
                }
            },editedProjectDetailsCallback);
        }
    }, function(error, response) {
        if (error) {
            console.log("fail");
            res.send("fail");
        } else {
            console.log("success");
            res.send("success");
        }
    });
};

/***
 * vishvas.a   
 * service renders the names of all projects in domain/projects
 * cycles
 * date 24.03.2017
 */
exports.getNames_ICE = function(req, res){
    var requestedidslist=req.body.requestedids;
    var idtypes=req.body.idtype;
   // var requestedidslist=["ab4f7fdf-fda7-4bf0-a286-39e72dd8d948","f97dd7da-2a1f-4984-9eb5-a32e6bc6af32","15043c49-6e30-488c-bdc0-33d2b8b3e08e"];
  //  var idtypes=["projects","cycles","releases"];
    var index=0;
    var responsedata={
        requestedids:[],
        respnames:[],
        idtypes:[]
    }
    if(requestedidslist.length == idtypes.length){
        var queryString="";
        for(var eachid=0; eachid<requestedidslist.length; eachid++){
            //in this block all projects under the domain is the response.
            if(idtypes[eachid] == 'domainsall'){
                var responsedata={
                    projectIds:[],
                    projectNames:[]
                }
                queryString="select projectid,projectname from projects where domainid="+requestedidslist[eachid];
                namesfetcher(queryString,function(error,response){
                    for(var i=0;i<response.length;i++){
                        responsedata.projectIds.push(response[i].projectid);
                        responsedata.projectNames.push(response[i].projectname);
                        if(i==response.length-1){
                            console.log(responsedata);
                            res.send(responsedata);
                        }
                    }
                });
            }else if(idtypes[eachid] == 'projects'){
                //in this block project name and project id of the respective id is sent
                queryString="select projectid,projectname from projects where projectid="+requestedidslist[eachid];
                namesfetcher(queryString,function(error,response){
                    responsedata.idtypes.push('projects');
                    responsedata.requestedids.push(response[0].projectid);
                    responsedata.respnames.push(response[0].projectname);
                if(index == requestedidslist.length){
                            res.send(responsedata);
                            // console.log(responsedata);
                        }
                });
            }else if(idtypes[eachid] == 'releases'){
                //in this block release name and release id of the respective id is sent
                queryString="select releaseid,releasename from releases where releaseid="+requestedidslist[eachid];
                namesfetcher(queryString,function(error,response){
                    responsedata.idtypes.push('releases');
                    responsedata.requestedids.push(response[0].releaseid);
                    responsedata.respnames.push(response[0].releasename);
                    
                if(index == requestedidslist.length){
                            // res.send(responsedata);
                            console.log(responsedata);
                        }
                });
            }else if(idtypes[eachid] == 'cycles'){
                //in this block cycle name and cycle id of the respective id is sent
                queryString="select cycleid,cyclename from cycles where cycleid="+requestedidslist[eachid];
                namesfetcher(queryString,function(error,response){
                    responsedata.idtypes.push('cycles');
                    responsedata.requestedids.push(response[0].cycleid);
                    responsedata.respnames.push(response[0].cyclename);
                    
                if(index == requestedidslist.length){
                            // res.send(responsedata);
                            console.log(responsedata);
                        }
                });
            }else{
                res.send("fail");
                break;
            }
        }
    }else{
        res.send("fail");
    }

    function namesfetcher(queryString,namesfetchercallback){
        dbConnICE.execute(queryString, 
		function(queryStringerr, queryStringresult){
			if(queryStringerr){
				statusFlag="Error occured in namesfetcher : Fail";
				namesfetchercallback(statusFlag,null);
			}else{
                index=index+1;
                    namesfetchercallback(null,queryStringresult.rows);
				    	
		}
	});
    }
};


/**
 * vishvas.a   
 * service renders all the details of the child type
 * if domainid is provided all projects in domain is returned
 * if projectid is provided all release and cycle details is returned
 * date 03/04/2017
 */
exports.getDetails_ICE = function(req, res) {
    try {
        var requestedidslist = req.body.requestedids;
        var idtypes = req.body.idtype;
        var responsedata = {};
        var requestedid;
        var eachProjectDetail = {};
        var index = 0;
        if (requestedidslist.length == idtypes.length) {
            try {
                var queryString = "";
                for (var eachid = 0; eachid < requestedidslist.length; eachid++) {
                    requestedid = requestedidslist[eachid];
                    //here the data gets sent at once
                    if (idtypes[eachid] == 'domaindetails') {
                        try {
                            var responsedatadomains = {
                                projectIds: [],
                                projectNames: []
                            }
                            queryString = "select projectid,projectname from projects where domainid=" + requestedid;
                            queryExecutor(queryString, function(error, response) {
                                if (error) {
                                    try {
                                        res.send("Error in getDetails_ICE_domaindetails : Fail");
                                    } catch (exception) {
                                        console.log(exception);
                                    }
                                } else {
                                	try{
	                                    for (var i = 0; i < response.length; i++) {
	                                        responsedatadomains.projectIds.push(response[i].projectid);
	                                        responsedatadomains.projectNames.push(response[i].projectname);
	                                        if (i == response.length - 1) {
	                                            try {
	                                                res.send(responsedatadomains);
	                                            } catch (exception) {
	                                                console.log(exception);
	                                            }
	                                        }
	                                    }
                                    } catch (exception) {
                                        console.log(exception);
                                    }
                                }
                            });
                        } catch (exception) {
                            console.log(exception);
                        }
                    } else if (idtypes[eachid] == 'projectsdetails') {
                        try {
                        	responsedata = {
                                    appType: "",
                                    projectName: "",
                                    projectId: "",
                                    projectDetails: []
                                }
                            var queryForProjectTypeId = "select projecttypeid,projectname from projects where projectid=" + requestedid;
                            queryExecutor(queryForProjectTypeId, function(queryForProjectTypeIderror, queryForProjectTypeIdresponse) {
                                if (queryForProjectTypeIderror) {
                                    try {
                                        res.send(queryForProjectTypeIderror);
                                    } catch (exception) {
                                        console.log(exception);
                                    }
                                } else {
                                    try {
                                        for (var i = 0; i < queryForProjectTypeIdresponse.length; i++) {
                                            responsedata.projectName = queryForProjectTypeIdresponse[i].projectname;
                                            responsedata.projectId = queryForProjectTypeIdresponse[i].projecttypeid;
                                            var queryForProjectType = "select projecttypename from projecttype where projecttypeid=" + queryForProjectTypeIdresponse[i].projecttypeid;
                                            queryExecutor(queryForProjectType, function(queryForProjectTypeerror, queryForProjectTyperesponse) {
                                                if (queryForProjectTypeerror) {
                                                    try {
                                                        res.send(queryForProjectTypeerror);
                                                    } catch (exception) {
                                                        console.log(exception);
                                                    }
                                                } else {
                                                    try {
                                                        for (var indexofName = 0; indexofName < queryForProjectTyperesponse.length; indexofName++) {
                                                            responsedata.appType = queryForProjectTyperesponse[indexofName].projecttypename;
                                                            var queryGetReleases = "select releaseid,releasename from releases where projectid=" + requestedid;
                                                            queryExecutor(queryGetReleases, function(queryGetReleaseserror, queryGetReleasesresponse) {
                                                                if (queryGetReleaseserror) {
                                                                    try {
                                                                        res.send(queryGetReleasesQueryerror);
                                                                    } catch (exception) {
                                                                        console.log(exception);
                                                                    }
                                                                } else {
                                                                    var releaseindex = 0;
                                                                    async.forEachSeries(queryGetReleasesresponse,
                                                                        function(eachRelease, releasecallback) {
                                                                            try {
                                                                                eachProjectDetail = {};
                                                                                var queryGetCycles = "select cycleid,cyclename from cycles where releaseid=" + eachRelease.releaseid;
                                                                                queryExecutor(queryGetCycles, function(queryGetCycleserror, queryGetCyclesresponse) {
                                                                                    try {
                                                                                        if (queryGetCycleserror) {
                                                                                            try {
                                                                                                res.send(queryGetCycleserror);
                                                                                            } catch (exception) {
                                                                                                console.log(exception);
                                                                                            }
                                                                                        } else {
                                                                                            try {
                                                                                                releaseindex = releaseindex + 1;
                                                                                                var cycleindex = 0;
                                                                                                var cycleDetails = [];
                                                                                                async.forEachSeries(queryGetCyclesresponse,
                                                                                                    function(eachCycle, cyclecallback) {
                                                                                                        try {
                                                                                                            var eachCycleObject = {};
                                                                                                            responsedata.projectDetails.releaseid = eachRelease.releaseid;
                                                                                                            responsedata.projectDetails.releaseid = eachRelease.releaseid;
                                                                                                            eachCycleObject.cycleName = eachCycle.cyclename;
                                                                                                            eachCycleObject.cycleId = eachCycle.cycleid;
                                                                                                            cycleindex = cycleindex + 1;
                                                                                                            cycleDetails.push(eachCycleObject);
                                                                                                            cyclecallback();
                                                                                                        } catch (exception) {
                                                                                                            console.log(exception);
                                                                                                        }
                                                                                                    });
                                                                                                eachProjectDetail.releaseName = eachRelease.releasename;
                                                                                                eachProjectDetail.releaseId = eachRelease.releaseid;
                                                                                                eachProjectDetail.cycleDetails = cycleDetails;
                                                                                                if (releaseindex == queryGetReleasesresponse.length && queryGetCyclesresponse.length == cycleindex) {
                                                                                                    finalDataReturn();
                                                                                                }
                                                                                            } catch (exception) {
                                                                                                console.log(exception);
                                                                                            }
                                                                                        }
                                                                                        releasecallback();
                                                                                    } catch (exception) {
                                                                                        console.log(exception);
                                                                                    }
                                                                                });
                                                                                responsedata.projectDetails.push(eachProjectDetail);
                                                                            } catch (exception) {
                                                                                console.log(exception);
                                                                            }
                                                                        });
                                                                }
                                                            });
                                                        }
                                                    } catch (exception) {
                                                        console.log(exception);
                                                    }
                                                }
                                            });
                                        }
                                    } catch (exception) {
                                        console.log(exception);
                                    }
                                }
                            });
                        } catch (exception) {
                            console.log(exception);
                        }
                    }else if (idtypes[eachid] == 'cycledetails') {
                    	responsedata = {
                                testsuiteIds: [],
                                testsuiteNames: []
                        }
                    	queryString = "select testsuiteid,testsuitename from testsuites where cycleid=" + requestedid;
                        queryExecutor(queryString, function(error, response) {
                            if (error) {
                                try {
                                    res.send("Error in getDetails_ICE_cycledetails : Fail");
                                } catch (exception) {
                                    console.log(exception);
                                }
                            } else {
                            	async.forEachSeries(response,function(eachtestSuiteDetails,testsuiteCallback){
                            		responsedata.testsuiteIds.push(eachtestSuiteDetails.testsuiteid);
                            		responsedata.testsuiteNames.push(eachtestSuiteDetails.testsuitename);
                            		testsuiteCallback();
                            	});
                                finalDataReturn();
                            }
                            	
                            });
                    	
                    } else {
                    	try {
            				res.send("fail");
            			} catch (exception) {
            				console.log(exception);
            			}
                    }
                }
            } catch (exception) {
                console.log(exception);
            }
        } else {
			try {
				res.send("fail");
			} catch (exception) {
				console.log(exception);
			}
        }
        function queryExecutor(queryString, queryExecutorcallback) {
            // console.log(queryString);
            dbConnICE.execute(queryString,
                function(queryStringerr, queryStringresult) {
                    if (queryStringerr) {
                        statusFlag = "Error occured in queryExecutor : Fail";
                        queryExecutorcallback(statusFlag, null);
                    } else {
                        index = index + 1;
                        queryExecutorcallback(null, queryStringresult.rows);
                    }
                });
        }
        function finalDataReturn() {
            console.log(JSON.stringify(responsedata));
			try {
				res.send(responsedata);
			} catch (exception) {
				console.log(exception);
			}
        }
    } catch (exception) {
        console.log(exception);
    }
};