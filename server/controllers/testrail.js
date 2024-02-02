let async = require("async");
let myserver = require("../lib/socket");
let epurl = process.env.DAS_URL;
let Client = require("node-rest-client").Client;
let client = new Client();
let validator = require("validator");
let logger = require("../../logger");
let utils = require("../lib/utils");
const { log } = require("node-env-file");

/** 
* @function : getProjects_Testrail
* @description : the function is responsible for getting all the projects of testrail for a respective client.
* @param : TestRailUrl:
		   Url of the test rail, comes in body.
* @param : TestRailUsername :
           User name of the test rail, comes in body.
* @param : TestRailToken :
	       Token for test rail, comes in body.
* @param : TestRailAction : 
           Function name of ICE.
* @param : userId :
           Encrypted id of the user, comes from session.
* @return : An array of objects containing details of projects => [{id:1,name : "name"}] with statusCode =>200
            A String of failure with statusCode => 500
            
*/

exports.getProjects_Testrail = function (req, res) {
  try {
    // Add into the info log
    logger.info("Inside UI service: getProjects_Testrail");

    let mySocket;

    // get the clients name
    let clientName = utils.getClientName(req.headers.host);
    console.log(myserver)
    console.log(myserver.allSocketsICEUser)
    console.log(myserver.allSocketsICEUser[clientName])
    let username = 'muzammil';

    let name;

    // check if the socket connection is established with ice.
    if (
      myserver.allSocketsICEUser[clientName][username] &&
      myserver.allSocketsICEUser[clientName][username].length > 0
    )
      name = myserver.allSocketsICEUser[clientName][username][0];

    // Getting the details of the socket
    mySocket = myserver.allSocketsMap[clientName][name];

    if (mySocket != undefined && mySocket.connected) {
      logger.debug("ICE Socket requesting Address: %s", name);

      // Data validation check for url
      let check_testrailUrl = !validator.isEmpty(req.body.TestRailUrl);

      // If Url is invalid, handling the scenario
      if (!check_testrailUrl) {
        logger.info(
          "Error occurred in getProjects_Testrail: Invalid Testrail URL"
        );
        return res.send("invalidurl");
      } else {
        // get the details from request body
        let testrailUsername = req.body.TestRailUsername;
        let testrailApiToken = req.body.TestRailToken;
        let testrailAction = req.body.TestRailAction;
        let baseUrl = req.body.TestRailUrl;
        let testrailDetails = {
          testrailUsername,
          testrailApiToken,
          testrailAction,
          baseUrl,
        };
        // add into the info log
        logger.info("Sending socket request for testrailLogin to redis");

        // emit the information to ICE, to request the Project details data.
        mySocket.emit("testraillogin", testrailDetails);

        //ICE responds to the event and sends the above requested data
        function testraillogin_listener(data) {
          // remove the added listener once the task is done
          mySocket.removeListener("qcresponse", testraillogin_listener);
          res.send(data);
        }

        // Invoke the above function on qcresponse event
        mySocket.on("qcresponse", testraillogin_listener);
      }
    } else {
      logger.info(
        "Error occurred in getProjects_Testrail: Invalid Testrail Credentials"
      );
      res.send("unavailableLocalServer");
    }
  } catch (exception) {
    console.log(exception);
    logger.error("Error occurred in getProjects_Testrail:", exception.message);
    res.send("fail");
  }
};

/** 
* @function : getSuites_Testrail
* @description : the function is responsible for getting all the suites under a project of testrail for a respective client.
* @param : projectId:
		   Primary key of the project, comes in body.
* @param : TestRailAction : 
           Function name of ICE.
* @param : userId :
           Encrypted id of the user, comes from session.
* @return : An array of objects containing details of suites => [{id:1,name : "name"}] with statusCode =>200
            A String of failure with statusCode => 500
            
*/

exports.getSuites_Testrail = async (req, res) => {
  try {
    // Add into the info log
    logger.info("Inside UI service: getSuites_Testrail");

    let mySocket;

    // get the clients name
    let clientName = utils.getClientName(req.headers.host);

    let username = 'muzammil';

    let name;

    // check if the socket connection is established with ice.
    if (
      myserver.allSocketsICEUser[clientName][username] &&
      myserver.allSocketsICEUser[clientName][username].length > 0
    )
      name = myserver.allSocketsICEUser[clientName][username][0];

    // Getting the details of the socket
    mySocket = myserver.allSocketsMap[clientName][name];

    if (mySocket != undefined && mySocket.connected) {
      logger.debug("ICE Socket requesting Address: %s", name);

      // get the details from request body
      let testrailAction = req.body.TestRailAction;
      let projectId = req.body.projectId;

      let testrailDetails = {
        testrailAction,
        projectId,
      };

      // add into the info log
      logger.info("Sending socket request for testrailLogin to redis");

      // emit the information to ICE, to request the Project details data.
      mySocket.emit("testraillogin", testrailDetails);

      //ICE responds to the event and sends the above requested data
      function testraillogin_listener(data) {
        // remove the added listener once the task is done
        mySocket.removeListener("qcresponse", testraillogin_listener);
        res.send(data);
      }

      // Invoke the above function on qcresponse event
      mySocket.on("qcresponse", testraillogin_listener);
    } else {
      logger.info(
        "Error occurred in getSuites_Testrail: Invalid Testrail Credentials"
      );
      res.send("unavailableLocalServer");
    }
  } catch (exception) {
    console.log(exception);
    logger.error("Error occurred in getSuites_Testrail:", exception.message);
    res.send("fail");
  }
};

/** 
* @function : getTestcases_Testrail
* @description : the function is responsible for getting all the test cases of a respective project
                (Under a suite if suiteId is given).
* @param : projectId:
		   Primary key of the project, comes in body.
* @param : TestRailAction : 
           Function name of ICE.
* @param : suiteId(optional) : 
           Primary key of the suite.
* @param : userId :
           Encrypted id of the user, comes from session.
* @return : An array of objects containing details of cases => [{id:1,title : "title"...}] with statusCode =>200
            A String of failure with statusCode => 500
            
*/
exports.getTestcases_Testrail = async (req, res) => {
  try {
    // Add into the info log
    logger.info("Inside UI service: getTestcases_Testrail");

    let mySocket;

    // get the clients name
    let clientName = utils.getClientName(req.headers.host);

    let username = 'muzammil';

    let name;

    // check if the socket connection is established with ice.
    if (
      myserver.allSocketsICEUser[clientName][username] &&
      myserver.allSocketsICEUser[clientName][username].length > 0
    )
      name = myserver.allSocketsICEUser[clientName][username][0];

    // Getting the details of the socket
    mySocket = myserver.allSocketsMap[clientName][name];

    if (mySocket != undefined && mySocket.connected) {
      logger.debug("ICE Socket requesting Address: %s", name);

      // get the details from request body
      let testrailAction = req.body.TestRailAction;
      let projectId = req.body.projectId;
      let suiteId = req.body.suiteId ? req.body.suiteId : null;

      let testrailDetails = {
        testrailAction,
        projectId,
        suiteId,
      };

      // add into the info log
      logger.info("Sending socket request for testrailLogin to redis");

      // emit the information to ICE, to request the Project details data.
      mySocket.emit("testraillogin", testrailDetails);

      //ICE responds to the event and sends the above requested data
      function testraillogin_listener(data) {
        // remove the added listener once the task is done
        mySocket.removeListener("qcresponse", testraillogin_listener);
        res.send(data);
      }

      // Invoke the above function on qcresponse event
      mySocket.on("qcresponse", testraillogin_listener);
    } else {
      logger.info(
        "Error occurred in getTestcases_Testrail: Invalid Testrail Credentials"
      );
      res.send("unavailableLocalServer");
    }
  } catch (exception) {
    console.log(exception);
    logger.error("Error occurred in getTestcases_Testrail:", exception.message);
    res.send("fail");
  }
};


/** 
* @function : getTestPlans_Testrail
* @description : the function is responsible for getting all the test plans of a respective project.
* @param : projectId:
		   Primary key of the project, comes in body.
* @param : TestRailAction : 
           Function name of ICE.
* @param : userId :
           Encrypted id of the user, comes from session.
* @return : An array of objects containing details of testplans => [{id:1,name : "name"...}] with statusCode =>200
            A String of failure with statusCode => 500
            
*/

exports.getTestPlans_Testrail = async(req,res) => {
    try{
        // Add into the info log
    logger.info("Inside UI service: getTestcases_Testrail");

    let mySocket;

    // get the clients name
    let clientName = utils.getClientName(req.headers.host);

    let username = 'muzammil';

    let name;

    // check if the socket connection is established with ice.
    if (
      myserver.allSocketsICEUser[clientName][username] &&
      myserver.allSocketsICEUser[clientName][username].length > 0
    )
      name = myserver.allSocketsICEUser[clientName][username][0];

    // Getting the details of the socket
    mySocket = myserver.allSocketsMap[clientName][name];

    if(mySocket != undefined && mySocket.connected) {
        logger.debug("ICE Socket requesting Address: %s", name);

      // get the details from request body
      let testrailAction = req.body.TestRailAction;
      let projectId = req.body.projectId;
      
      let testrailDetails = {
        testrailAction,
        projectId
      };

      // add into the info log
      logger.info("Sending socket request for testrailLogin to redis");

      // emit the information to ICE, to request the Project details data.
      mySocket.emit("testraillogin", testrailDetails);

      //ICE responds to the event and sends the above requested data
      function testraillogin_listener(data) {
        // remove the added listener once the task is done
        mySocket.removeListener("qcresponse", testraillogin_listener);
        res.send(data);
      }

      // Invoke the above function on qcresponse event
      mySocket.on("qcresponse", testraillogin_listener);

    }


    }catch (exception) {
        console.log(exception);
        logger.error("Error occurred in getProjectPlans:", exception.message);
        res.send("fail");
      }
}


/** 
* @function : getSuiteAndRunInfo_Testrail
* @description : the function is responsible for getting all the suites and runs information for a specific test plan
* @param : testPlanId:
		   Primary key of the test plan, comes in body.
* @param : TestRailAction : 
           Function name of ICE.
* @param : userId :
           Encrypted id of the user, comes from session.
* @return : An array of objects containing details of testplans => [{id:1,name : "name"...}] with statusCode =>200
            A String of failure with statusCode => 500
            
*/
exports.getSuiteAndRunInfo_Testrail = async(req,res) => {
    try{
        // Add into the info log
    logger.info("Inside UI service: getSuiteAndRunInfo");

    let mySocket;

    // get the clients name
    let clientName = utils.getClientName(req.headers.host);

    let username = 'muzammil';
    let name;

    // check if the socket connection is established with ice.
    if (
      myserver.allSocketsICEUser[clientName][username] &&
      myserver.allSocketsICEUser[clientName][username].length > 0
    )
      name = myserver.allSocketsICEUser[clientName][username][0];

    // Getting the details of the socket
    mySocket = myserver.allSocketsMap[clientName][name];

    if(mySocket != undefined && mySocket.connected) {
        logger.debug("ICE Socket requesting Address: %s", name);

      // get the details from request body
      let testrailAction = req.body.TestRailAction;
      let testPlanId = req.body.testPlanId;
      
      let testrailDetails = {
        testrailAction,
        testPlanId
      };

      // add into the info log
      logger.info("Sending socket request for testrailLogin to redis");

      // emit the information to ICE, to request the Project details data.
      mySocket.emit("testraillogin", testrailDetails);

      //ICE responds to the event and sends the above requested data
      function testraillogin_listener(data) {
        // remove the added listener once the task is done
        mySocket.removeListener("qcresponse", testraillogin_listener);
        res.send(data);
      }

      // Invoke the above function on qcresponse event
      mySocket.on("qcresponse", testraillogin_listener);

    }


    }catch (exception) {
        console.log(exception);
        logger.error("Error occurred in getSuiteAndRunInfo:", exception.message);
        res.send("fail");
      }
}

exports.saveMapping_Testrail = async (req, res) => {
  try {
    // Add into the info log
    logger.info("Inside UI service: saveMapping_Testrail");

    const mappedDetails = req.body.mappedDetails;

    if (mappedDetails.length > 0) {
        const inputs = {
            projectid : mappedDetails[0].projectid,
            suiteid : mappedDetails[0].suiteid,
            testid : mappedDetails[0].testid,
            testname :  mappedDetails[0].testname,
            testscenarioid : mappedDetails[0].scenarioid,
            reqdetails : mappedDetails[0].reqdetails,
            query : 'saveMapping_Testrail',
            runid : mappedDetails[0].runid,
            testplanid:mappedDetails[0].testplanid
        }

        const result = await utils.fetchData(inputs, "qualityCenter/saveIntegrationDetails_ICE", 'saveMapping_Testrail');

        if(result == 'fail') {
            res.send('fail')
        } else {
            res.send('success')
        }
     } else {
      return res.send("fail");
    }
  } catch (exception) {
    console.log(exception);
    logger.error("Error occurred in saveMapping_Testrail:", exception.message);
    res.send("fail");
  }
};


exports.viewMappedDetails_Testrail = async(req,res) => {
  try{
    // Add into the info log
    logger.info("Inside UI service: viewMappedDetails_Testrail");
    const userid = '659bc2372833ce0bd02d25da';
		const inputs = {
			"userid": userid,
			"query": "TestrailDetails"
		};
    
		const result = await utils.fetchData(inputs, "qualityCenter/viewIntegrationMappedList_ICE", 'viewMappedDetails_Testrail');
		
    if (result == "fail") res.send('fail');
		else res.send(result);
  }catch (exception) {
    console.log(exception);
    logger.error("Error occurred in viewMappedDetails_Testrail:", exception.message);
    res.send("fail");
  }
}


